FROM node:18.14.2

WORKDIR /app

RUN apt-get update && apt install ffmpeg -y

COPY package*.json ./

RUN npm install

COPY ./ /app

CMD [ "node", "index.js" ]
