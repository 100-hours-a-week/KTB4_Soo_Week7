  GNU nano 8.7.1                                                 Dockerfile                                                           
# 1단계: Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# KTB4_Soo_Week7 하위의 모든 파일(pages, react-frontend 등)을 복사
COPY . .

# react-frontend 폴더로 이동해서 빌드 진행
WORKDIR /app/react-frontend
RUN npm install
RUN npm run build

# 2단계: Production Stage
FROM nginx:alpine
COPY --from=build /app/react-frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]