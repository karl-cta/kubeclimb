package kube

import "testing"

func TestValidateAcceptsReadOnly(t *testing.T) {
	ok := [][]string{
		{"get", "pod", "web-test", "-o", "json"},
		{"get", "nodes", "-l", "disktype=ssd", "-o", "json"},
		{"describe", "pod", "web"},
		{"logs", "web-test"},
		{"version", "-o", "json"},
	}
	for _, args := range ok {
		if err := Validate(args); err != nil {
			t.Errorf("kubectl %v devrait être accepté : %v", args, err)
		}
	}
}

func TestValidateRefusesWritesAndEscapes(t *testing.T) {
	ko := [][]string{
		{},
		{"delete", "pod", "web"},
		{"apply", "-f", "pod.yaml"},
		{"exec", "web", "--", "sh"},
		{"port-forward", "svc/web", "8080:80"},
		{"get", "pods", "--kubeconfig", "/etc/passwd"},
		{"get", "pods", "--kubeconfig=/etc/passwd"},
		{"get", "pods", "--as", "system:admin"},
		{"get", "--raw", "/api/v1/namespaces"},
		{"get", "pods", "--server", "https://ailleurs"},
	}
	for _, args := range ko {
		if err := Validate(args); err == nil {
			t.Errorf("kubectl %v devrait être refusé", args)
		}
	}
}
