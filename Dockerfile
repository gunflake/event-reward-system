FROM node:18-alpine AS base

WORKDIR /app

# 개발 의존성 설치
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 빌드 스테이지
FROM deps AS builder
COPY . .
RUN npx nx build

# 프로덕션 스테이지
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

ENV NODE_ENV production

EXPOSE 3000

CMD ["node", "dist/apps/gateway/main.js"] 