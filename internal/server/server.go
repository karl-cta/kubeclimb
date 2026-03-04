package server

import (
	"embed"
	"encoding/json"
	"io"
	"io/fs"
	"kubeclimb/internal/progress"
	"net/http"
)

type Server struct {
	addr string
	mux  *http.ServeMux
}

func New(webFS embed.FS, addr string) *Server {
	s := &Server{addr: addr, mux: http.NewServeMux()}

	sub, _ := fs.Sub(webFS, "web")
	s.mux.Handle("/", http.FileServer(http.FS(sub)))
	s.mux.HandleFunc("GET /api/progress", s.getProgress)
	s.mux.HandleFunc("PUT /api/progress", s.putProgress)
	s.mux.HandleFunc("GET /api/export", s.exportProgress)

	return s
}

func (s *Server) Start() error {
	return http.ListenAndServe(s.addr, s.mux)
}

func (s *Server) getProgress(w http.ResponseWriter, r *http.Request) {
	p, err := progress.Load()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
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
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"ok":true}`))
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
