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
    const entry = req.body;
    const entryId = entry.id;
    delete entry.id;
    const expense = db.factory('expense');
    let ret = '';

    // add expense
    if(entryId == 0) {
        ret = await expense.addEntry(entry);
    }
    // update expense
    else {
        ret = await expense.updateEntry(entry, entryId);
    }
    res.send(JSON.stringify(ret));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));