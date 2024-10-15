const express = require("express");
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
db.init();

app.get("/api", async (req, res) => {
    const expense = db.factory('expense');
    const data = await expense.getEntries();
    res.send(JSON.stringify(data));
});

app.post("/api", bodyParser.urlencoded(), async (req, res) => {
    const expense = db.factory('expense');
    const ret = await expense.addEntry(req.body);
    res.send(ret);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));