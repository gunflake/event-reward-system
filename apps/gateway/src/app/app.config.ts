// app.config.ts나 별도 설정 파일
export const appConfig = {
  publicRoutes: process.env.PUBLIC_ROUTES
    ? process.env.PUBLIC_ROUTES.split(',')
    : [],
};
