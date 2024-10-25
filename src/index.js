require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const path = require('path');

// Подключение к MongoDB
fastify.register(require('fastify-mongodb'), {
    forceClose: true,
    url: process.env.MONGO_URL,
});

// Импорт маршрутов
const routes = require('./routes');

fastify.register(routes);

const amqp = require('amqplib');

fastify.decorate('rabbitmq', {});

const startConsumer = require('./services/consumer')
// Подключение к RabbitMQ
const connectRabbitMQ = async () => {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      const channel = await connection.createChannel();
      fastify.rabbitmq.connection = connection;
      fastify.rabbitmq.channel = channel;
      fastify.log.info('Connected to RabbitMQ');
  
      // Запуск обработчика
      startConsumer(process.env.RABBITMQ_URL);
    } catch (error) {
      fastify.log.error('Failed to connect to RabbitMQ:', error);
    }
  };

connectRabbitMQ();

// Обработка закрытия соединений при остановке сервера
const closeConnections = async () => {
    if (fastify.mongo) {
        await fastify.mongo.close();
    }
    if (fastify.rabbitmq.connection) {
        await fastify.rabbitmq.connection.close();
    }
};

fastify.addHook('onClose', async (instance, done) => {
    await closeConnections();
    done();
});

// Запуск сервера
const start = async () => {
    try {
        await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' })
        fastify.log.info(`Server is running on port ${process.env.PORT || 3000}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();