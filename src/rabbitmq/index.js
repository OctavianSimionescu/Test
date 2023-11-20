const amqp = require('amqplib/callback_api');
const { createRedmineChannel } = require('./redmine/redmineChannel');

// Connect to RabbitMQ server
const connectToRabbitMQ = () => {
    amqp.connect(`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}`, (error0, connection) => {
        if (error0) throw error0;
    
        createRedmineChannel(connection);
    
        connection.on('error', (err) => {
            console.error("[AMQP] connection error", err.message);
        });
    });
    
}

module.exports = { connectToRabbitMQ };
