FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts && npm install --ignore-scripts -g http-server && \
    groupadd -r nodegroup && useradd -r -g nodegroup nodeuser && \
    chown -R nodeuser:nodegroup /app


USER nodeuser
COPY src/ ./src/
COPY public/ ./public/

EXPOSE 3000

CMD ["http-server", "src/main/resources/static", "-p", "3000"]