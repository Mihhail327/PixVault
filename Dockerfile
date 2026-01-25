FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект
COPY . .

# Пробрасываем порт Express
EXPOSE 3000

# Запуск Express, который отдаёт public/
CMD ["node", "server/index.js"]