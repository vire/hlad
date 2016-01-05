FROM node:5.3.0
COPY package.json /src/package.json
RUN cd /src; npm install
COPY . /src
