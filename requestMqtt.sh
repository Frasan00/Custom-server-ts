#!/bin/bash

mosquitto_pub -h localhost -p 5000 -t "myTopic" -m "Message from my topic!"