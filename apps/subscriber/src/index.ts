import { connect } from "amqplib";
import { COMMAND, EXCHANGE, QUEUE } from "lib";

const run = async () => {
    try {
        const connection = await connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE, 'topic',  { durable:true });

        const queue = await channel.assertQueue(QUEUE, { durable:true });
        channel.bindQueue(queue.queue, EXCHANGE, COMMAND);

        channel.consume(QUEUE, (message) => {
            if(!message) {
                return;
            }

            console.log(message.content.toString());

            channel.ack(message); // otherwise message won`t gone from the channel

            if(message.properties.replyTo) {
                console.log(message.properties.replyTo)
                channel.sendToQueue(
                    message.properties.replyTo, 
                    Buffer.from('Response message'), {
                        correlationId: message.properties.correlationId
                    }); // send directly to queue without exchange
            }
        }, {
          //  noAck:true // secound variant instead   channel.ack(message)
        })
       

    } catch (e) {
        console.error(e);
    }
}

run();