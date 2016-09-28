FROM node:6

COPY package.json /tmp/package.json
RUN cd /tmp &&\
    npm install &&\
    mkdir /app &&\
    mv node_modules /app/node_modules &&\
    rm package.json

WORKDIR /app
COPY . /app
RUN npm test
