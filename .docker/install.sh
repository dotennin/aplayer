#!/bin/bash
cat /etc/hosts | grep $1 &> /dev/null;
if [ $? == 0 ]; then
	echo "Host writted";
else
	echo "Writting host name to /etc/hosts";
	sudo sh -c "echo '127.0.0.1   $1' >> /etc/hosts";
fi

# docker network ls | grep nginx-net &> /dev/null
# if [ $? == 1 ]; then
# 	docker network create nginx-net
# fi

cd $PWD/.docker/ && \
	export SERVER_NAME=$1 && \
	export NGINX_ROOT=$2 && \
	export WORKING_DIR=$3 && \
	export MYSQL_ROOT_PASSWORD=$4 && \
	export MYSQL_DATABASE=$5 && \
	export MYSQL_USER=$6 && \
	export MYSQL_PASSWORD=$7 && \
	export DOCKER_CONTENT_TRUST=1 && \
	docker-compose -p $SERVER_NAME up --build --force-recreate 
