const amqp = require('amqplib');

const startConsumer = async (rabbitmqUrl) => {
  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    const queue = 'task_queue';
    await channel.assertQueue(queue, { durable: true });
    channel.prefetch(1);
    console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const content = msg.content.toString();
        console.log(`[x] Received: ${content}`);

        // Обработка сообщения
        setTimeout(() => {
          console.log(`[x] Done processing: ${content}`);
          channel.ack(msg);
        }, 1000);
      }
    }, { noAck: false });

  } catch (error) {
    console.error('Error in consumer:', error);
  }
};

module.exports = startConsumer;