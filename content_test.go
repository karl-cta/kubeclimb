package main

// Le contenu pédagogique vit dans un seul fichier JavaScript de plusieurs
// milliers de lignes. Ces tests vérifient les invariants qu'une relecture
// humaine ne rattrape plus à cette taille.

import (
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"testing"

	"kubeclimb/internal/kube"
)

func readModules(t *testing.T) string {
	t.Helper()
	data, err := os.ReadFile(filepath.Join("web", "js", "modules.js"))
	if err != nil {
		t.Fatalf("lecture de modules.js : %v", err)
	}
	return string(data)
}

// matchBracket renvoie l'index du délimiteur fermant correspondant à
// l'ouvrant situé en start.
func matchBracket(s string, start int, open, close byte) int {
	depth := 0
	for i := start; i < len(s); i++ {
		switch s[i] {
		case open:
			depth++
		case close:
			depth--
			if depth == 0 {
				return i
			}
		}
	}
	return -1
}

func TestModuleIDsAreSequential(t *testing.T) {
	src := readModules(t)
	re := regexp.MustCompile(`(?m)^\s+id: (\d+),$`)
	matches := re.FindAllStringSubmatch(src, -1)
	if len(matches) == 0 {
		t.Fatal("aucun module trouvé")
	}
	for i, m := range matches {
		id, _ := strconv.Atoi(m[1])
		if id != i+1 {
			t.Errorf("module en position %d porte l'id %d : les ids doivent être consécutifs à partir de 1", i+1, id)
		}
	}
}

func TestQuizAnswersAreInRange(t *testing.T) {
	src := readModules(t)
	optionsRe := regexp.MustCompile(`options: \[`)
	correctRe := regexp.MustCompile(`correct: (\d+)`)

	count := 0
	for _, loc := range optionsRe.FindAllStringIndex(src, -1) {
		open := loc[1] - 1
		close := matchBracket(src, open, '[', ']')
		if close == -1 {
			t.Fatalf("tableau options non fermé à l'offset %d", open)
		}

		var options []string
		if err := json.Unmarshal([]byte(src[open:close+1]), &options); err != nil {
			t.Errorf("options illisibles à l'offset %d : %v", open, err)
			continue
		}
		if len(options) < 2 {
			t.Errorf("question à l'offset %d : %d option(s), il en faut au moins 2", open, len(options))
		}

		m := correctRe.FindStringSubmatch(src[close:])
		if m == nil {
			t.Errorf("question à l'offset %d : aucun champ correct", open)
			continue
		}
		correct, _ := strconv.Atoi(m[1])
		if correct < 0 || correct >= len(options) {
			t.Errorf("question à l'offset %d : correct vaut %d pour %d options", open, correct, len(options))
		}
		count++
	}
	if count == 0 {
		t.Fatal("aucune question de quiz trouvée")
	}
}

// Les commandes de validation partent du navigateur : elles doivent toutes
// franchir la même liste blanche que l'API, sans quoi le bouton « Vérifier »
// renverrait une erreur à l'apprenant.
func TestExerciseChecksAreReadOnly(t *testing.T) {
	src := readModules(t)
	argsRe := regexp.MustCompile(`args: \[`)

	count := 0
	for _, loc := range argsRe.FindAllStringIndex(src, -1) {
		open := loc[1] - 1
		close := matchBracket(src, open, '[', ']')
		if close == -1 {
			t.Fatalf("tableau args non fermé à l'offset %d", open)
		}
		var args []string
		if err := json.Unmarshal([]byte(src[open:close+1]), &args); err != nil {
			t.Errorf("args illisibles à l'offset %d : %v", open, err)
			continue
		}
		if err := kube.Validate(args); err != nil {
			t.Errorf("check refusé par l'API (kubectl %s) : %v", strings.Join(args, " "), err)
		}
		if args[len(args)-1] != "json" {
			t.Errorf("check kubectl %s : la sortie doit être en JSON (-o json)", strings.Join(args, " "))
		}
		count++
	}
	if count == 0 {
		t.Fatal("aucun check d'exercice trouvé")
	}
}

func TestCodeBlocksHaveCopyButton(t *testing.T) {
	src := readModules(t)
	blocks := strings.Count(src, `class="code-block"`)
	buttons := strings.Count(src, `class="copy-btn"`)
	if blocks != buttons {
		t.Errorf("%d blocs de code pour %d boutons Copier : chaque bloc doit en avoir un", blocks, buttons)
	}
}

func TestNoEmojiInInterface(t *testing.T) {
	err := filepath.Walk("web", func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return err
		}
		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		for i, r := range string(data) {
			emoji := (r >= 0x1F300 && r <= 0x1FAFF) ||
				(r >= 0x2600 && r <= 0x27BF) ||
				r == 0xFE0F
			if emoji {
				t.Errorf("%s : emoji %q à l'offset %d, l'interface n'en utilise pas", path, r, i)
			}
		}
		return nil
	})
	if err != nil {
		t.Fatalf("parcours de web/ : %v", err)
	}
}
