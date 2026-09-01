// Package kube exécute des commandes kubectl en lecture seule pour valider
// les exercices contre le cluster de l'apprenant.
package kube

import (
	"context"
	"errors"
	"os/exec"
	"strings"
	"time"
)

const (
	timeout   = 8 * time.Second
	maxOutput = 64 * 1024
	maxArgs   = 16
	maxArgLen = 256
)

// Verbes autorisés : lecture seule uniquement.
var allowedVerbs = map[string]bool{
	"api-resources": true,
	"api-versions":  true,
	"cluster-info":  true,
	"describe":      true,
	"explain":       true,
	"get":           true,
	"logs":          true,
	"top":           true,
	"version":       true,
}

// Flags refusés : ils permettraient de sortir du contexte courant, de lire des
// fichiers arbitraires ou d'usurper une identité.
var deniedFlags = []string{
	"--as", "--as-group", "--as-uid",
	"--certificate-authority", "--client-certificate", "--client-key",
	"--filename", "-f",
	"--kubeconfig",
	"--password", "--username",
	"--raw",
	"--server", "-s",
	"--template",
	"--token",
}

var ErrNotFound = errors.New("kubectl introuvable dans le PATH")

type Result struct {
	Code   int    `json:"code"`
	Stdout string `json:"stdout"`
	Stderr string `json:"stderr"`
}

func Available() bool {
	_, err := exec.LookPath("kubectl")
	return err == nil
}

// Validate refuse tout ce qui n'est pas une consultation du cluster courant.
func Validate(args []string) error {
	if len(args) == 0 {
		return errors.New("commande vide")
	}
	if len(args) > maxArgs {
		return errors.New("trop d'arguments")
	}
	if !allowedVerbs[args[0]] {
		return errors.New("verbe non autorisé : " + args[0])
	}
	for _, a := range args {
		if len(a) > maxArgLen {
			return errors.New("argument trop long")
		}
		flag := a
		if i := strings.IndexByte(flag, '='); i >= 0 {
			flag = flag[:i]
		}
		for _, d := range deniedFlags {
			if flag == d {
				return errors.New("flag non autorisé : " + d)
			}
		}
	}
	return nil
}

// Run exécute kubectl avec des arguments déjà validés. Pas de shell : les
// arguments sont passés tels quels au binaire.
func Run(args []string) (Result, error) {
	if !Available() {
		return Result{}, ErrNotFound
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "kubectl", args...)
	var stdout, stderr strings.Builder
	cmd.Stdout = &limitedWriter{b: &stdout}
	cmd.Stderr = &limitedWriter{b: &stderr}

	err := cmd.Run()
	res := Result{Stdout: stdout.String(), Stderr: stderr.String()}

	if ctx.Err() == context.DeadlineExceeded {
		res.Code = -1
		res.Stderr = "délai dépassé : le cluster ne répond pas"
		return res, nil
	}
	var exitErr *exec.ExitError
	if errors.As(err, &exitErr) {
		res.Code = exitErr.ExitCode()
		return res, nil
	}
	return res, err
}

// Context renvoie le contexte kubectl courant, vide si indisponible.
func Context() string {
	if !Available() {
		return ""
	}
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	out, err := exec.CommandContext(ctx, "kubectl", "config", "current-context").Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(out))
}

type limitedWriter struct {
	b *strings.Builder
}

func (w *limitedWriter) Write(p []byte) (int, error) {
	if room := maxOutput - w.b.Len(); room > 0 {
		if len(p) > room {
			w.b.Write(p[:room])
		} else {
			w.b.Write(p)
		}
	}
	return len(p), nil
}
