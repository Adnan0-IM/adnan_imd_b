---
title: "How to Set Up Docker for a Web App (Beginner Guide)"
date: 2025-12-27T17:54:01
draft: false
description: A practical guide to Dockerizing MERN and PERN apps using development and production Dockerfiles, plus Docker Compose orchestration.
tags:
  - docker
  - devops
  - setup
categories:
  - software
feature: "*feature*"
image: "[feature](feature.jpg)"
---


### 1. **Introduction**

- What Docker is and why you should use it for full-stack development.
- Explain the MERN (MongoDB, Express, React, Node) and PERN (PostgreSQL, Express, React, Node) stacks.
- The goal: make your full-stack app run anywhere with one command.

---

### 2. **Project Structure**

Example folder layout:

```
project-root/
│
├── client/         # React + Vite frontend
│   ├── Dockerfile
│   └── ...
│
├── server/         # Express + TypeScript backend
│   ├── Dockerfile
│   └── prisma/
│
├── compose.yaml    # Docker Compose configuration
└── .env
```

---

### 3. **Dockerizing the Frontend (Vite + React)**

**Development Dockerfile:**

```dockerfile
# Development Dockerfile for Vite + React
FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci || npm install

ENV NODE_ENV=development

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
```

> 🧠 This Dockerfile creates a lightweight dev environment for your Vite React app.  
> It installs dependencies, exposes port 5173, and runs the app using `npm run dev`.

**Production Dockerfile:**

```dockerfile
# Production Dockerfile for Vite + React (multi-stage)
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

This second stage serves your built frontend with Nginx.

---

### 4. **Dockerizing the Backend (Express + TypeScript + Prisma)**

**Development Dockerfile:**

```dockerfile
# Development Dockerfile for Express + TypeScript + Prisma
FROM node:22-bookworm-slim
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci || npm install

ENV NODE_ENV=development

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
```

> 🧠 This installs OpenSSL (needed for Prisma on Debian), generates Prisma Client, applies migrations, and runs the dev server.

**Production Dockerfile:**

```dockerfile
# Production Dockerfile for Express + TypeScript + Prisma (multi-stage)
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
```

---

### 5. **Docker Compose for the Full Stack**

**compose.yaml:**

```yaml
services:
  web:
    depends_on:
      - api
    build: ./client
    ports:
      - 5173:5173
    environment:
      BETTER_AUTH_URL: http://localhost:3000
    develop:
      watch:
        - path: ./client
          target: /app
          action: sync

  api:
    depends_on:
      db:
        condition: service_healthy
    build: ./server
    ports:
      - 3000:3000
    environment:
      DATABASE_URL: postgresql://adnan:blabla@db:5432/inzakal?schema=public
      APP_CLIENT_URL: http://localhost:5173
      BETTER_AUTH_URL: http://localhost:3000
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET:-dev-secret}
    develop:
      watch:
        - path: ./server/src
          target: /app/src
          action: sync
        - path: ./server/prisma
          target: /app/prisma
          action: sync
        - path: ./server/.env
          target: /app/.env
          action: sync

  db:
    image: postgres:latest
    container_name: inzakal-postgres
    environment:
      POSTGRES_USER: adnan
      POSTGRES_PASSWORD: blabla
      POSTGRES_DB: inzakal
    ports:
      - "5432:5432"
    volumes:
      - inzakal_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U adnan -d inzakal"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 5s

volumes:
  inzakal_pgdata:
```

> 💡 With this setup:
>
> - React runs on port **5173**
> - Express API runs on **3000**
> - PostgreSQL database runs on **5432**
> - Live file sync keeps your containers up-to-date during development.

---

### 6. **Running the Stack**

Run everything with a single command:

```bash
docker compose up --build
```

Or run in detached mode:

```bash
docker compose up -d
```

To stop:

```bash
docker compose down
```

---

### 7. **Testing and Debugging**

- Visit React app → [http://localhost:5173](http://localhost:5173/)
- API endpoint → [http://localhost:3000/api](http://localhost:3000/api)
- PostgreSQL → connect with any SQL client using the credentials in `compose.yaml`
- Logs:
  ```bash
  docker compose logs -f api
  ```

---

### 8. **Optional: Adding MongoDB or Mongo Express (for MERN)**

You can easily switch to MongoDB:

```yaml
db:
  image: mongo:latest
  container_name: mongo
  ports:
    - "27017:27017"
  environment:
    MONGO_INITDB_ROOT_USERNAME: root
    MONGO_INITDB_ROOT_PASSWORD: example

mongo-express:
  image: mongo-express
  restart: always
  ports:
    - 8081:8081
  environment:
    ME_CONFIG_MONGODB_URL: mongodb://root:example@mongo:27017/
    ME_CONFIG_BASICAUTH_USERNAME: mongoexpressuser
    ME_CONFIG_BASICAUTH_PASSWORD: mongoexpresspass
```

---

### 9. **Conclusion**

- Dockerizing your MERN/PERN stack helps you run your app consistently across environments.
- You can scale easily by deploying the same containers to production.
- Next steps: add Nginx reverse proxy, CI/CD pipeline, or production DB volumes.

---
