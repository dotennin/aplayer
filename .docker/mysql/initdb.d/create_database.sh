#!/bin/bash -eu

function replace {
  LC_ALL=C sed -i "s/$(echo $1 | sed -e 's/\([[\/.*]\|\]\)/\\&/g')/$(echo $2 | sed -e 's/[\/&]/\\&/g')/g" $3
}

replace "##SERVER_NAME##" "${SERVER_NAME:-localhost}" /docker-entrypoint-initdb.d/create_database.sql


# Create another DATABASE with command

# mysql=( mysql --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" )
#
# "${mysql[@]}" <<-EOSQL
#     CREATE DATABASE IF NOT EXISTS another_db;
#     GRANT ALL ON another_db.* TO '${MYSQL_USER}'@'%' ;
# EOSQL

