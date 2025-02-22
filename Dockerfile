# используем линукс alpine с версией node 14
FROM node:19.5.0-alpine 
# Указывваем рабочую директорию
WORKDIR /app
# Скопировать package.json и lock внутрь контейнера
COPY package*.json ./
# установить все зависимости
RUN npm install
# Копируем оставеешся приложение в контейнер
COPY  . .
# Install Prisma
RUN npm install -g prisma
# Generate prisma client
RUN prisma generate
# Copy prisma's schema
COPY prisma/schema.prisma ./prisma/
# open port in the container
EXPOSE 3001
# run our server
CMD ["npm", "start"]
