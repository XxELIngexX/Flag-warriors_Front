FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install -g http-server && npm install

COPY . .

EXPOSE 3000

CMD ["http-server", "src/main/resources/static", "-p", "3000"]