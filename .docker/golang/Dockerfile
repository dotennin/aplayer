FROM golang:latest

WORKDIR /app

RUN go get github.com/oxequa/realize

EXPOSE 80


CMD [ "realize", "start", "--run" ]

# CMD [ "go", "run", "main.go" ]
