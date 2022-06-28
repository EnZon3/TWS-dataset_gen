const { default: fetch, Headers } = require("node-fetch-cjs");
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const fs = require("fs");
const sent = require("./analyze_sentiment.js");
require("dotenv").config();


app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`running`);
});

let englishCountries;

async function getCountries() {
    let countries = await fs.promises.readFile("englishCountries.txt", "utf8");
    var splitData = countries.split(",");
    return await splitData;
}



async function getTopHeadLines() {
    const countries = await getCountries();
    for(let i = 0; i < await countries.length + 1; i++) {
        let country = await countries[i];
        let url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${process.env.API_KEY}`;
        let response = await fetch(url);
        let json = await response.json();
        let articles = json.articles;
        for(let i = 0; i < articles.length; i++) {
            let article = articles[i];
            let title = article.title;
            //get titles json and save to file
            var headlines = fs.readFileSync("./storage/headlines.json", "utf8");
            var jsonHeadlines = JSON.parse(headlines);
            //check if title is already in headlines.json, if so skip
            if(jsonHeadlines.includes(title) == true) {
                console.log('HEADLINE NOT PUSHED: already in json');
                fs.appendFileSync("./storage/get.log", 'HEADLINE NOT PUSHED: already in json\n');
            } else {
                jsonHeadlines.push(title);
                fs.writeFileSync("./storage/headlines.json", JSON.stringify(jsonHeadlines));

                //get sentiment json and save to file
                var sentiment = fs.readFileSync("./storage/sentiment.json", "utf8");
                var jsonSentiment = JSON.parse(sentiment);
                let sentimentResult = sent.analyze(title);
                jsonSentiment.push(sentimentResult);
                fs.writeFileSync("./storage/sentiment.json", JSON.stringify(jsonSentiment));
            }
        }
    }
    console.log(`Finished getting top headlines for the day of ${new Date()}`);
    //log into get.log
    fs.appendFileSync("./storage/get.log", `Finished getting top headlines for the day of ${new Date()}\n`);
}

//make a password protected route to get top headlines
app.get("/get", (req, res) => {
    if(req.query.pw === process.env.PASSWORD) {
        getTopHeadLines();
        res.send(new Date());
    } else {
        res.status(401).send("Unauthorized");
    }
});

app.get("/log", (req, res) => {
    var file = fs.readFileSync('./storage/get.log', 'utf-8');
    res.send(file);
});