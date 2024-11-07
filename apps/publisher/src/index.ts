import { connect } from "amqplib";
import {COMMAND, EXCHANGE, QUEUE} from "lib"

const run = async () => {
    try {
        const connection = await connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE, 'topic',  { durable:true });
        const queue = await channel.assertQueue(QUEUE, { durable:true });
        channel.bindQueue(queue.queue, EXCHANGE, COMMAND);

        channel.publish(EXCHANGE, COMMAND, Buffer.from('Test message'))
        
    } catch (e) {
        console.error(e);
    }
}

const run2 = async () => {
    try {
        const connection = await connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE, 'topic',  { durable:true });
        const replyQueue = await channel.assertQueue('', { exclusive:true });

        channel.consume(replyQueue.queue, (message) => {
            console.log(message?.content.toString());
            console.log(message?.properties.correlationId);
        })

        channel.publish(
            EXCHANGE, COMMAND, 
            Buffer.from('Test message'), { 
                replyTo: replyQueue.queue, 
                correlationId: '1' // you can generate with uuid
            }); 
        
    } catch (e) {
        console.error(e);
    }
}

run2();