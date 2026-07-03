# Build context is the repo root (see docker-compose.yml) so this image
# can copy shared/vocab.json into the same relative position frontend
# code expects (../../../shared/vocab.json from src/data/words.js).
FROM node:20-slim AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
COPY shared /shared
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
