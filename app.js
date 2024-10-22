const express = require("express");
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
db.init();

app.get("/api", async (req, res) => {
    const expense = db.factory('expense');
    const queryRes = await expense.getEntries(req.query);

    const ret = {
        success : true
    };

    if(queryRes instanceof Error) {
        ret.success = false;
        ret.error = {
            mesage: queryRes.message
        };
    }
    else {
        ret.data = queryRes;
    }

    res.json(ret);
});

app.post("/api", bodyParser.urlencoded(), async (req, res) => {
    const entry = req.body;
    const entryId = entry.id;
    delete entry.id;

    let isDelete = false;
    if(typeof(entry._delete) != 'undefined' && parseInt(entry._delete)) {
        isDelete = true;
        delete entry._delete;
    }

    const expense = db.factory('expense');

    const ret = {
        success : true
    };
    let queryRes;

    // add an expense
    if(entryId == 0) {
        queryRes = await expense.addEntry(entry);
    }
    // delete an expense
    else if(isDelete) {
        queryRes = await expense.deleteEntry(entryId);
    }
    // update an expense
    else {
        queryRes = await expense.updateEntry(entryId, entry);
    }

    if(queryRes instanceof Error) {
        ret.success = false;
        ret.error = {
            mesage: queryRes.message
        };
    }

    res.json(ret);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));