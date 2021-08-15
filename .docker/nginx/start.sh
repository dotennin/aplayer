#!/bin/bash
#set -e

function replace {
  LC_ALL=C sed -i "s/$(echo $1 | sed -e 's/\([[\/.*]\|\]\)/\\&/g')/$(echo $2 | sed -e 's/[\/&]/\\&/g')/g" $3
}

if [[ $HTTPS_ONLY == true ]]; then
	replace "##https##" "" /etc/nginx/conf.d/default.conf
else
	replace "##http##" "" /etc/nginx/conf.d/default.conf
fi

replace "##NGINX_ROOT##" "${NGINX_ROOT:-localhost}" /etc/nginx/conf.d/default.conf

replace "##NGINX_SERVER_NAME##" "${NGINX_SERVER_NAME:-localhost}" /etc/nginx/conf.d/default.conf

replace "##NGINX_SERVER_NAME##" "${NGINX_SERVER_NAME:-localhost}" /etc/nginx/snippets/server_default.conf

if [[ ! -e /srv/cert_installed ]]; then
	# FIRST RUN WITH INVALID CERT:
	cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.copy
	cp /etc/nginx/snippets/server_default.conf /etc/nginx/snippets/server_default.conf.copy
	replace "##CERT_PATH##" "/srv/config" /etc/nginx/conf.d/default.conf
	replace "##CERT_PATH##" "/srv/config" /etc/nginx/snippets/server_default.conf
	
	if [[ $LETSENCRYPT == true ]]; then
		# REPLACE WITH LETSENCRYPT CERT:
		{
			sleep 3
			pattern="/etc/letsencrypt/live/${NGINX_SERVER_NAME}*"
			certsPat="$pattern/fullchain.pem"
			
			until [[ "${certs[0]}" != "$certsPat" && ${#certs[@]} -gt 0 ]]; do
				certs=( $certsPat )
        echo "*** Waiting for certificates..."
				sleep 5
			done
			echo "*** Certificate installed, reloading nginx..."
			
			directories=( $pattern )
			
			rm /etc/nginx/conf.d/default.conf
			cp /etc/nginx/conf.d/default.conf.copy /etc/nginx/conf.d/default.conf
			cp /etc/nginx/snippets/server_default.conf.copy /etc/nginx/snippets/server_default.conf
			replace "##CERT_PATH##" "${directories[0]}" /etc/nginx/conf.d/default.conf
			replace "##CERT_PATH##" "${directories[0]}" /etc/nginx/snippets/server_default.conf
			touch /srv/cert_installed
			
			/srv/config/reload.sh
		} &
	fi
fi

exec "$@"
