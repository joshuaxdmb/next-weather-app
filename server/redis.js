import { createClient } from 'redis';
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-17190.c257.us-east-1-3.ec2.cloud.redislabs.com',
        port: 17190
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

export default client