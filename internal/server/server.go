package server

import (
	"embed"
	"encoding/json"
	"errors"
	"io"
	"io/fs"
	"net/http"
	"strings"

	"kubeclimb/internal/kube"
	"kubeclimb/internal/progress"
)

type Server struct {
	addr    string
	origins []string
	mux     *http.ServeMux
}

func New(webFS embed.FS, addr string) *Server {
	port := addr[strings.LastIndexByte(addr, ':'):]
	s := &Server{
		addr:    addr,
		origins: []string{"http://localhost" + port, "http://127.0.0.1" + port, "http://[::1]" + port},
		mux:     http.NewServeMux(),
	}

	sub, _ := fs.Sub(webFS, "web")
	s.mux.Handle("/", http.FileServer(http.FS(sub)))
	s.mux.HandleFunc("GET /api/progress", s.guard(s.getProgress))
	s.mux.HandleFunc("PUT /api/progress", s.guard(s.putProgress))
	s.mux.HandleFunc("GET /api/export", s.guard(s.exportProgress))
	s.mux.HandleFunc("GET /api/cluster", s.guard(s.getCluster))
	s.mux.HandleFunc("POST /api/check", s.guard(s.postCheck))

	return s
}

func (s *Server) Start() error {
	return http.ListenAndServe(s.addr, s.mux)
}

// guard rejette les requêtes venant d'une autre origine : sans cela, n'importe
// quelle page ouverte dans le navigateur pourrait piloter l'API locale.
func (s *Server) guard(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			allowed := false
			for _, o := range s.origins {
				if origin == o {
					allowed = true
					break
				}
			}
			if !allowed {
				http.Error(w, "origine refusée", http.StatusForbidden)
				return
			}
		}
		next(w, r)
	}
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func (s *Server) getProgress(w http.ResponseWriter, r *http.Request) {
	p, err := progress.Load()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, p)
}

func (s *Server) putProgress(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	defer r.Body.Close()

	var p progress.Progress
	if err := json.Unmarshal(body, &p); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	if err := progress.Save(p); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, map[string]bool{"ok": true})
}

func (s *Server) exportProgress(w http.ResponseWriter, r *http.Request) {
	data, err := progress.Export()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Disposition", "attachment; filename=kubeclimb-progress.json")
	w.Write(data)
}

func (s *Server) getCluster(w http.ResponseWriter, r *http.Request) {
	if !kube.Available() {
		writeJSON(w, map[string]any{"kubectl": false, "context": ""})
		return
	}
	writeJSON(w, map[string]any{"kubectl": true, "context": kube.Context()})
}

func (s *Server) postCheck(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Args []string `json:"args"`
	}
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 8192)).Decode(&req); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	if err := kube.Validate(req.Args); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	res, err := kube.Run(req.Args)
	if errors.Is(err, kube.ErrNotFound) {
		writeJSON(w, map[string]any{"kubectl": false, "code": -1, "stderr": err.Error()})
		return
	}
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, map[string]any{"kubectl": true, "code": res.Code, "stdout": res.Stdout, "stderr": res.Stderr})
}
