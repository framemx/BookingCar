require('dotenv').config();

const Hapi = require('@hapi/hapi');
const { prismaPlugin } = require('./src/plugin/prisma');
const { swaggerPlugin } = require('./src/plugin/swagger');
const { authPlugin } = require('./src/plugin/auth');
const routes = require('./src/routes');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'], // อนุญาตทุก origin ถ้าต้องการเจาะจง ให้เปลี่ยนเป็น ['http://localhost:4000'] หรือ url frontend ของคุณ
        additionalHeaders: ['authorization', 'content-type', 'accept', 'x-requested-with'], 
        credentials: true, // ถ้า frontend ส่ง cookies หรือ auth header ต้องเปิด
        maxAge: 86400, // cache preflight request 1 วัน (วินาที)
      },
      validate: {
        failAction: async (request, h, err) => {
          throw err;
        },
      },
    },
  });

  // สมัคร handler สำหรับ preflight OPTIONS เอง (ถ้า Hapi ไม่ตอบอัตโนมัติ)
  server.ext('onPreResponse', (request, h) => {
    const response = request.response;
    if (request.method === 'options') {
      return h
        .response()
        .code(204)
        .header('Access-Control-Allow-Origin', '*')
        .header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        .header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, X-Requested-With')
        .takeover();
    }
    return h.continue;
  });

  await server.register(prismaPlugin);
  await server.register(swaggerPlugin);
  await server.register(authPlugin);

  server.route(routes);

  await server.start();
  console.log(`🚀 Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
