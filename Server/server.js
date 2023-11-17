// server.js

const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;
const { RadioBrowserApi, StationSearchType } = require('radio-browser-api');

const radio_api = new RadioBrowserApi('My Radio App')

app.use(cors());

app.use(express.static(path.join(__dirname, 'Public')));

app.get('/api/radio', async(req, res) => {
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
      offset: 0
    });
  
    return stations;
  } catch(error) {
    console.error('Error:', error);
    throw new Error('Error fetching radio stations');
  }

}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
