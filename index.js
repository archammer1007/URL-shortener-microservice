require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {userNewUrlParser: true, useUnifiedTopology: true});

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

const Schema = mongoose.Schema;

//website schema has a longurl and a shorturl value
const websiteSchema = new Schema({
  longurl: String,
  shorturl: String
});


let Website = mongoose.model("Website", websiteSchema);


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", function(req, res){
  var longurl = req.body.url.replace(/(^https?:\/\/)/, "");
  dns.lookup(longurl, function(err, address, family){
    if (err){
      res.json({error: "invalid url"})
    }
    else {
      
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
