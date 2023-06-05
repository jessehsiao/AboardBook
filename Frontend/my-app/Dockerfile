FROM node:14-slim

WORKDIR /user/src/app 
VOLUME [ "/user/src/app/node_modules" ]
ENV PATH /user/src/app/node_modules/.bin:$PATH

COPY ./package.json /user/src/app/package.json

RUN npm install --silent
RUN npm install react-scripts --silent

COPY . /user/src/app

EXPOSE 3000

ENTRYPOINT [ "npm" ]

CMD ["start"]