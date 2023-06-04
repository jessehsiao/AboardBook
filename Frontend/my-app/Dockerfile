FROM node:14-slim

RUN mkdir /usr/src/app
WORKDIR /user/src/app 
ENV PATH /user/src/app/node_modules/.bin:$PATH

COPY ./package.json /user/src/app/package.json

COPY ./yarn.lock ./

RUN npm install --silent
RUN npm install react-scripts@5.0.0 -g --silent

COPY . /user/src/app

EXPOSE 3000

ENTRYPOINT [ "npm" ]

CMD ["start"]