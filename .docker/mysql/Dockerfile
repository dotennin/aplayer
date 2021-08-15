FROM mariadb:latest

COPY initdb.d /docker-entrypoint-initdb.d
RUN chmod 550 -R /docker-entrypoint-initdb.d

