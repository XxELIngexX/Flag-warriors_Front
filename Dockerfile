FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts && npm install -g http-server --ignore-scripts && \
    groupadd -r nodegroup && useradd -r -g nodegroup nodeuser && \
    chown -R nodeuser:nodegroup /app

COPY src/ ./src/
COPY public/ ./public/

EXPOSE 3000

CMD ["http-server", "src/main/resources/static", "-p", "3000"]