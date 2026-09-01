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

type Revision struct {
	Missed []string `json:"missed"`
	Runs   int      `json:"runs"`
	Best   int      `json:"best"`
}

type Progress struct {
	Current      int              `json:"current"`
	Completed    []int            `json:"completed"`
	QuizScores   map[string]Score `json:"quizScores"`
	Badges       []string         `json:"badges"`
	Sessions     []Session        `json:"sessions"`
	SectionsRead map[string][]int `json:"sectionsRead"`
	Revision     Revision         `json:"revision"`
	Checks       map[string]bool  `json:"checks"`
	Exams        []Exam           `json:"exams"`
}

type Exam struct {
	Date     string           `json:"date"`
	Score    int              `json:"score"`
	Total    int              `json:"total"`
	Duration int              `json:"duration"`
	Domains  map[string]Score `json:"domains"`
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
		Completed:    []int{},
		QuizScores:   map[string]Score{},
		Badges:       []string{},
		Sessions:     []Session{},
		SectionsRead: map[string][]int{},
		Revision:     Revision{Missed: []string{}},
		Checks:       map[string]bool{},
		Exams:        []Exam{},
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
	if p.SectionsRead == nil {
		p.SectionsRead = map[string][]int{}
	}
	if p.Revision.Missed == nil {
		p.Revision.Missed = []string{}
	}
	if p.Checks == nil {
		p.Checks = map[string]bool{}
	}
	if p.Exams == nil {
		p.Exams = []Exam{}
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

	// Écriture atomique : un crash en cours d'écriture ne corrompt pas le fichier.
	tmp := fp + ".tmp"
	if err := os.WriteFile(tmp, data, 0644); err != nil {
		return err
	}
	if err := os.Rename(tmp, fp); err != nil {
		os.Remove(tmp)
		return err
	}
	return nil
}

func Export() ([]byte, error) {
	p, err := Load()
	if err != nil {
		return nil, err
	}
	return json.MarshalIndent(p, "", "  ")
}
