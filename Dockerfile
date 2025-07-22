FROM node:17-alpine

WORKDIR /node-app

COPY package*.json ./

RUN npm install && npm install nodemon -g --quiet
RUN npm install mongoose

COPY . . 
EXPOSE 5001 9229

CMD ["nodemon", "-L", "--inspect=0.0.0.0:9229", "--watch", ".", "server/index.js"]
