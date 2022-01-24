FROM node:v16.0.0

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

COPY ./deploy/.env .

COPY --chown=node:node . .

USER node

EXPOSE 8080

CMD [ "npm", "start" ]