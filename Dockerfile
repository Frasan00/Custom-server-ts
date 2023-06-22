FROM node:latest
WORKDIR /app
COPY *.json .
COPY ./src ./src
COPY ./test ./test
RUN npm ci
EXPOSE 5000
CMD [ "npm", "start" ]