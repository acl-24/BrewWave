import express from 'express';
import path from 'path';
import cors from 'cors';
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
import { RadioBrowserApi } from 'radio-browser-api';

const app = express();
const port = 3000;
const radio_api = new RadioBrowserApi('My Radio App');

app.use(cors());

app.get('/api/radio', async (req, res) => {
  try {
    const category = req.query.category;
    const stations = await getRadioStationByCategory(category);

    res.json(stations);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function getRadioStationByCategory(category) {
  try {
    const stations = await radio_api.searchStations({
      tagList: [category],
      limit: 100,
      offset: 0,
    });

    return stations;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Error fetching radio stations');
  }
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
