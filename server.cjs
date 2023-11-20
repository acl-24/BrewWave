const express = require('express');
const path = require('path');
const app = express();
const port = 4000;

const assetsPath = path.join(path.dirname(__dirname), 'Assets');

app.use('/Assets', express.static(assetsPath));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`Static files are served from ${assetsPath}`);
});
