location /api {
  proxy_pass http://api-server;
}
location /login {
  proxy_pass http://api-server;
}
