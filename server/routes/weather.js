import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import redisClient from '../redis.js';

dotenv.config();

const router = express.Router();

router.post('/location', async (req, res) => {
  try {
    const { locationName } = req.body;
    const geoloc = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${locationName}&limit=1&appid=${process.env.WEATHER_API_KEY}`
    );
    const { lat, lon } = geoloc.data[0];

    const chartResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`
    )

    console.log(chartResponse)
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}`
    );
    const date = new Date();
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const beautifulDate = date.toLocaleDateString('en-US', options);
    response.data.time = beautifulDate;
    res.status(200).json({current:response.data,historical:chartResponse.data.hourly});
  } catch (e) {
    console.error('Error', e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/store', async (req, res) => {
  //redisClient.del('weatherStore')
  let response = await redisClient.get('weatherStore');
  let { currentWeather } = req.body;
  if (!response) {
    response = [];
  } else {
    response = JSON.parse(response);
  }
  if (response.length > 4) {
    response.shift();
  }
  const date = new Date();
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  const beautifulDate = date.toLocaleDateString('en-US', options);
  currentWeather.time = beautifulDate;
  response.push(JSON.stringify(currentWeather));
  redisClient.set('weatherStore', JSON.stringify(response));
  //console.log(response);

  return res.status(200).json(response);
});

router.get('/retrieve', async (req, res) => {
  // Retrieve the most recent 5 weather data entries from the Redis list
  const response = await redisClient.get('weatherStore');
  //console.log(JSON.parse(response));
  return res.status(200).json(JSON.parse(response));
});
export default router;
