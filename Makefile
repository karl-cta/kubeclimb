BINARY = kubeclimb

.PHONY: build run test clean release

build:
	go build -ldflags "-s -w" -o $(BINARY) .

run: build
	./$(BINARY)

test:
	go vet ./...
	go test ./...

clean:
	rm -f $(BINARY) $(BINARY)-*

release:
	GOOS=darwin GOARCH=amd64 go build -ldflags "-s -w" -o $(BINARY)-darwin-amd64 .
	GOOS=darwin GOARCH=arm64 go build -ldflags "-s -w" -o $(BINARY)-darwin-arm64 .
	GOOS=linux GOARCH=amd64 go build -ldflags "-s -w" -o $(BINARY)-linux-amd64 .
	shasum -a 256 $(BINARY)-darwin-amd64 $(BINARY)-darwin-arm64 $(BINARY)-linux-amd64 > SHA256SUMS.txt
