#!/bin/bash

BROKER="localhost"
PORT=1883
TOPIC="/home"
MESSAGE="25.5°C"

mosquitto_pub -h $BROKER -p $PORT -t $TOPIC -m "$MESSAGE" -q 1 -r -d