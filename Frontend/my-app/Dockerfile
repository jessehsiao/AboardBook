FROM node:14-slim

WORKDIR /user/src/app 
VOLUME [ "/user/src/app/node_modules" ]
ENV PATH /user/src/app/node_modules/.bin:$PATH

COPY ./package.json /user/src/app/package.json

COPY ./yarn.lock /user/src/app/yarn.lock

RUN npm install --silent

COPY . /user/src/app

EXPOSE 3000

ENTRYPOINT [ "npm" ]

CMD ["start"]