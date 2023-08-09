import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import weatherRoutes from './routes/weather.js'
import cors from 'cors'
import redisClient from './redis.js'


dotenv.config();

//Setup server app
const app = express();
app.use(express.json())
app.use(bodyParser.json({limit:'30mb',extended:true}))
app.use(bodyParser.urlencoded({limit:"30mb",extended:true}))
app.use(cors());
const PORT = process.env.PORT || 9000
app.listen(PORT,console.log(`App listening at port ${PORT}`))

app.use('/weather',weatherRoutes)

