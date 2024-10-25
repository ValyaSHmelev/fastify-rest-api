async function routes (fastify, options) {
    fastify.get('/', async (request, reply) => {
      return { hello: 'world' };
    });
  
    // Пример маршрута для работы с MongoDB
    fastify.get('/items', async (request, reply) => {
      const collection = fastify.mongo.client.db().collection('items');
      const items = await collection.find().toArray();
      return items;
    });
  
    // Пример маршрута для отправки сообщений в RabbitMQ
    fastify.post('/publish', async (request, reply) => {
      const { message } = request.body;
      const channel = fastify.rabbitmq.channel;
      await channel.assertQueue('task_queue', { durable: true });
      channel.sendToQueue('task_queue', Buffer.from(message), { persistent: true });
      return { status: 'Message sent to queue' };
    });
  }
  
  module.exports = routes;