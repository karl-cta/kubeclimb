BINARY = kubeclimb

.PHONY: build run clean release

build:
	go build -ldflags "-s -w" -o $(BINARY) .

run: build
	./$(BINARY)

clean:
	rm -f $(BINARY) $(BINARY)-*

release:
	GOOS=darwin GOARCH=amd64 go build -ldflags "-s -w" -o $(BINARY)-darwin-amd64 .
	GOOS=darwin GOARCH=arm64 go build -ldflags "-s -w" -o $(BINARY)-darwin-arm64 .
	GOOS=linux GOARCH=amd64 go build -ldflags "-s -w" -o $(BINARY)-linux-amd64 .
