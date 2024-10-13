const express = require("express");
const app = express();

app.get("/api", (req, res) => {
    res.send(JSON.stringify({
        a : 1,
        b : 2
    }));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));