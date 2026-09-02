# Social Service Dockerfile for UniHub
# Simple Node.js microservice container - mirrors Unihub-backend/Dockerfile

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5001

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "const request=require('http').get('http://127.0.0.1:5001/health',(response)=>{response.resume();process.exit(response.statusCode===200?0:1)});request.on('error',()=>process.exit(1));request.setTimeout(3000,()=>{request.destroy();process.exit(1)})"

CMD ["node", "src/server.js"]
