location /api {
  proxy_pass http://api-server;
}

location /mp3 {
  proxy_pass http://file-server;
}
