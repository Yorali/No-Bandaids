var express = require('express');
var mongojs = require("mongoose");
var request = require('request');
var cheerio = require('cheerio');

var app = express();

var databaseUrl = "scraper";
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);
db.on('error', function(error) {
    console.log("Database Error:", error);
});

app.get("/", function(req, res) {
    res.send("Placeholder Message");
});