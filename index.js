require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const res = require('express/lib/response');
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
  shorturl: Number
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
  //strip the http(s) from the website entered, because dns.lookup doesn't like it
  var longurl = req.body.url;
  //to use dns.lookup, we need to strip the http(s) from the website if it exists
  var dnsaddress = req.body.url.replace(/(^https?:\/\/)/, "");
  dns.lookup(dnsaddress, function(err, address, family){
    //if err is not null, then the website not not valid, so display an error message for the user
    if (err){
      res.json({error: "invalid url"})
    }
    else {
      //first check if the website is already in the database
      Website.findOne({longurl: longurl}, function(err, data){
        if (err){return console.error(err)}
        //if data is not null, the website is in the database, so we just return the data to the user
        if (data){
          res.json({original_url:longurl, short_url:data.shorturl});
        }
        //if the website is not in the database, we first count how many documents are already in the database
        //we use this value as the shorturl, and add the website to the database
        //then we return the data to the user
        else {
          Website.countDocuments({}, function(err, count){
            var website = new Website({longurl: longurl, shorturl: count});
            website.save(function(err, data){
              if (err) return console.error(err);
              res.json({original_url:longurl, short_url:count});
            })
          });
        }
      })
    }
  });
});

app.get("/api/shorturl/:shorturl", function(req, res){
  //get the shorturl from the params
  var shorturl = req.params.shorturl;
  //if the shorturl corresponds to an entry in the database, we redirect the user to the corresponding longurl
  Website.findOne({shorturl: shorturl}, function(err, data){
    if (err) return console.log(err);
    res.redirect(data.longurl);
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
