FROM node:14-slim

WORKDIR /user/src/app 
VOLUME /user/src/app/node_modules

COPY ./package.json ./

COPY ./yarn.lock ./

RUN npm install --silent

COPY . .

EXPOSE 3000

ENTRYPOINT [ "npm" ]

CMD ["start"]