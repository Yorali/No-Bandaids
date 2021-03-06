var express = require('express');
var mongojs = require("mongojs");
var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require("body-Parser");
var mongoose = require("mongoose");
var logger = require("morgan");

var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

mongoose.Promise = Promise;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static("public"));

// S
// P
// A
// C
// E  Check below for database config
// Everything before nobandaid is necessary

mongoose.connect("mongodb://localhost/nobandaid");
var db = mongoose.connection;

db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

db.once("open", function() {
    console.log("Mongoose connection successful");
});

app.get("/scrape", function(req, res) {
    request("http://www.echojs.com/", function(error, response, html) {
        var $ = cheerio.load(html);

        $("article h2").each(function(i, element) {
            var result = {};

            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");

            var entry = new Article(result);

            entry.save(function(err, doc) {
                if(err) {
                    console.log(err);
                }
                else {
                    console.log(doc);
                }
            });
        });
    });
    res.send("Scraped");
});

app.get("/articles", function(req, res) {
    Article.find({}, function(error, doc) {
        if(error) {
            console.log(error);
        }
        else {
            res.json(doc);
        }
    });
});

app.get("/articles/:id", function(req, res) {
    Article.findOne({ "_id": req.params.id })
    .populate("note")
    .exec(function(error, doc) {
        if(error) {
            console.log(error);
        }
        else {
            res.json(doc);
        }
    });
});

app.post("/articles/:id", function(req, res) {
    var newNote = new Note(req.body);

    newNote.save(function(error, doc) {
        if(error) {
            console.log(error);
        }
        else {
            Article.findOneAndUpdate({ "_id": req.params.id }, {"note": doc._id})
            .exec(function(err, doc) {
                if(err) {
                    console.log(err);
                }
                else {
                    res.send(doc);
                }
            });
        }
    });
});

app.listen(4000, function() {
    console.log("App on port 4000");
})
