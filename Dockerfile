FROM node:16-alpine

WORKDIR /usr/src/app
COPY . .

WORKDIR /usr/src/app/client
RUN npm install
RUN npm run build

WORKDIR /usr/src/app
RUN npm install

EXPOSE 4000
CMD [ "node", "server/index.js" ]