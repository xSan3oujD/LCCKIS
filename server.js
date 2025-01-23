const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const filePath = path.join(__dirname, 'data.json');

app.get('/products', (req, res) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data file');
        }
        res.send(JSON.parse(data));
    });
});

app.post('/products', (req, res) => {
    fs.writeFile(filePath, JSON.stringify(req.body), (err) => {
        if (err) {
            return res.status(500).send('Error writing data file');
        }
        res.send('Data saved successfully');
    });
});

app.delete('/products/:index', (req, res) => {
    const index = parseInt(req.params.index);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data file');
        }
        const products = JSON.parse(data);
        products.splice(index, 1);
        fs.writeFile(filePath, JSON.stringify(products), (err) => {
            if (err) {
                return res.status(500).send('Error writing data file');
            }
            res.send('Product removed successfully');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});