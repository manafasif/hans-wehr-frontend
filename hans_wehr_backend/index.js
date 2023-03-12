const express = require("express");
const app = express();
const sqlite3 = require("sqlite3").verbose();

const verb_forms = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
];

function split_forms(res) {
  var response = res.definition.split("</b>").join("<b>").split("<b>");
  const dict = {
    I: response[0],
  };
  for (let i = 1; i < response.length - 1; i++) {
    if (verb_forms.includes(response[i])) {
      dict[response[i]] = response[i + 1];
    }
  }
  return dict;
}

let db = new sqlite3.Database(
  "./data/hanswehrV12.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the chinook database.");
  }
);

var cors = require("cors");
app.use(cors());

app.use((req, res, next) => {
  console.log("Time:", Date.now());
  // req.query = decodeURIComponent(req.query);
  next();
});

app.get("/", (request, response) => {
  response.send("مرهب");
});

app.get("/root", (req, res) => {
  console.log(JSON.stringify(req.query));
  if (!req.query.root) {
    return res.send(`No root provided`);
  }
  var sql = "select * from DICTIONARY where word = ? AND is_root = 1";
  var params = [req.query.root];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    row["definition"] = split_forms(row);
    res.json({
      message: "success",
      data: row,
    });
  });

  // return res.send(`GET HTTP method on ${decodeURI(req.query.root)}`);
});

app.listen(3001, () => {
  console.log("API listening port 3001...");
});
