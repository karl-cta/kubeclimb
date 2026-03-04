package progress

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Score struct {
	Score int `json:"score"`
	Total int `json:"total"`
}

type Session struct {
	Start string `json:"start"`
	End   string `json:"end"`
}

type Progress struct {
	Current    int              `json:"current"`
	Completed  []int            `json:"completed"`
	QuizScores map[string]Score `json:"quizScores"`
	Badges     []string         `json:"badges"`
	Sessions   []Session        `json:"sessions"`
}

func path() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".kubeclimb", "progress.json"), nil
}

func Load() (Progress, error) {
	p := Progress{
		Completed:  []int{},
		QuizScores: map[string]Score{},
		Badges:     []string{},
		Sessions:   []Session{},
	}

	fp, err := path()
	if err != nil {
		return p, err
	}

	data, err := os.ReadFile(fp)
	if err != nil {
		if os.IsNotExist(err) {
			return p, nil
		}
		return p, err
	}

	if err := json.Unmarshal(data, &p); err != nil {
		return p, err
	}
	if p.Completed == nil {
		p.Completed = []int{}
	}
	if p.QuizScores == nil {
		p.QuizScores = map[string]Score{}
	}
	if p.Badges == nil {
		p.Badges = []string{}
	}
	if p.Sessions == nil {
		p.Sessions = []Session{}
	}
	return p, nil
}

func Save(p Progress) error {
	fp, err := path()
	if err != nil {
		return err
	}

	if err := os.MkdirAll(filepath.Dir(fp), 0755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(p, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(fp, data, 0644)
}

func Export() ([]byte, error) {
	p, err := Load()
	if err != nil {
		return nil, err
	}
	return json.MarshalIndent(p, "", "  ")
}
