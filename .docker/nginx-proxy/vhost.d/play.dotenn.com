location /api {
  proxy_pass http://api-server;
}
location /login {
  proxy_pass http://api-server;
}
location /manifest.webmanifest {
  proxy_pass http://api-server;
}