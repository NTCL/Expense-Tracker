const express = require("express");
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
db.init();

app.get("/api", async (req, res) => {
    const table = req.query._table;
    if(typeof(table) == 'undefined') {
        res.json({
            success: false,
            error: {
                message: 'Missing table'
            }
        });
    }

    let queryRes = false;
    switch(table) {
        case 'expense':
            const expense = db.factory(table);
            queryRes = await expense.getEntries(req.query);
            break;
        case 'type':
            const type = db.factory(table);
            queryRes = await type.getTypes();
            break;
        default:
            queryRes = new Error(`Invalid table: ${table}`)
    }

    const ret = {
        success : true
    };

    if(queryRes instanceof Error) {
        ret.success = false;
        ret.error = {
            message: queryRes.message
        };
    }
    else {
        ret.data = queryRes;
    }

    res.json(ret);
});

app.post("/api", bodyParser.urlencoded(), async (req, res) => {
    const table = req.body._table;
    if(typeof(table) == 'undefined') {
        res.json({
            success: false,
            error: {
                message: 'Missing table'
            }
        });
    }

    if(typeof(req.body.id) == 'undefined') {
        return new Error(`Missing id`);
    }

    const id = parseInt(req.body.id);
    
    if(Number.isNaN(id)) {
        return new Error(`Invalid id ${req.body.id}`);
    }

    const isDelete = (typeof(req.body._delete) != 'undefined' && parseInt(req.body._delete)) ? true : false;

    let queryRes = false;
    switch(table) {
        case 'expense':
            const expense = db.factory(table);
            // add an expense
            if(id == 0) {
                queryRes = await expense.addEntry(req.body);
            }
            // delete an expense
            else if(isDelete) {
                queryRes = await expense.deleteEntry(id);
            }
            // update an expense
            else {
                queryRes = await expense.updateEntry(id, req.body);
            }
            break;
        default:
            queryRes = new Error(`Invalid table: ${table}`)
    }

    const ret = {
        success : true
    };

    if(queryRes instanceof Error) {
        ret.success = false;
        ret.error = {
            message: queryRes.message
        };
    }

    res.json(ret);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));