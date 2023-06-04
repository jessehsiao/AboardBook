FROM node:14-slim

VOLUME /user/src/app/node_modules

WORKDIR /user/src/app 

COPY ./package.json ./

COPY ./yarn.lock ./

RUN npm install 

COPY . .

EXPOSE 3000

ENTRYPOINT [ "npm" ]

CMD ["start"]