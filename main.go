package main

import (
	"embed"
	"flag"
	"fmt"
	"kubeclimb/internal/server"
	"os"
	"os/exec"
	"os/signal"
	"runtime"
	"syscall"
)

//go:embed all:web
var webFS embed.FS

func main() {
	port := flag.Int("port", 8042, "port to listen on")
	flag.Parse()

	addr := fmt.Sprintf("localhost:%d", *port)
	url := fmt.Sprintf("http://%s", addr)

	srv := server.New(webFS, addr)

	go func() {
		fmt.Printf("kubeclimb running at %s\n", url)
		if err := srv.Start(); err != nil {
			fmt.Fprintf(os.Stderr, "error: %v\n", err)
			os.Exit(1)
		}
	}()

	openBrowser(url)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	fmt.Println("\nshutting down")
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", url)
	case "linux":
		cmd = exec.Command("xdg-open", url)
	default:
		return
	}
	cmd.Start()
}
