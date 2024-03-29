FROM node:17-alpine

WORKDIR /node-app

COPY package.json .

RUN npm install

RUN npm install nodemon -g --quiet
RUN npm install mongoose

COPY . . 
EXPOSE 5001

CMD nodemon -L --watch . index.js