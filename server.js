const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./scores.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to the scores database.');
});

// Ensure unique levels with a constraint
db.run("CREATE TABLE IF NOT EXISTS scores (level TEXT PRIMARY KEY, score INTEGER)");

app.get('/get-score', (req, res) => {
    const level = req.query.level;
    db.get("SELECT score FROM scores WHERE level = ?", [level], (err, row) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ score: row ? row.score : 0 });
    });
});

app.post('/save-score', (req, res) => {
    const { level, score } = req.body;
    db.run("INSERT INTO scores (level, score) VALUES (?, ?) ON CONFLICT(level) DO UPDATE SET score = ?", [level, score, score], (err) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ message: 'Score saved successfully!' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
