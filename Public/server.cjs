const express = require('express');
const path = require('path');
const app = express();
const port = 4000;

console.log(path.join(__dirname, 'Public'))

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});