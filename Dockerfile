FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm install -g http-server  

COPY . .

EXPOSE 3000

CMD ["http-server", "src/main/resources/static", "-p", "3000"]