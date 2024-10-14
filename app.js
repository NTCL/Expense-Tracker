const express = require("express");
const bodyParser = require('body-parser');
const app = express();

app.get("/api", (req, res) => {
    const data = [
        {
            id: 1,
            description : "Breakfast at McDonald's",
            amount: 30.5,
            date: "1/1/2024",
            type: "food"
        },
        {
            id: 2,
            description : "Take a minibus to work",
            amount: 4.2,
            date: "1/1/2024",
            type: "transportation"
        }
    ]
    res.send(JSON.stringify(data));
});

app.post("/api", bodyParser.urlencoded(), (req, res) => {
    res.send(req.body);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));