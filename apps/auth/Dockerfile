FROM node:18-alpine AS base

WORKDIR /app

# 개발 의존성 설치
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 빌드 스테이지
FROM deps AS builder
COPY . .
RUN npx nx build auth

# 프로덕션 스테이지
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/auth ./dist
COPY package.json ./
COPY apps/auth/.env.docker ./dist/.env

ENV NODE_ENV production

EXPOSE 3001

CMD ["node", "dist/main.js"] 