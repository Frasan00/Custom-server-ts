#!/bin/bash

docker-compose down
docker rmi $(docker images -a -q)