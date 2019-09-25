FROM node:8.16.0-alpine

ENV work_dir /sm-log-exporter

WORKDIR $work_dir

RUN chown -R node:node $work_dir

USER node

COPY package.json ./
COPY Gruntfile.coffee ./

RUN npm install

COPY . .