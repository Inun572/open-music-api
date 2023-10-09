// coba terapkan config, tetapi localhost dan portnya berubah, sehingga pengujian gagal

const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
  redis: {
    host: process.env.REDIS_SERVER,
  },
};

module.exports = config;
