const { default: fetch, Headers } = require("node-fetch-cjs");
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const fs = require("fs");
const sent = require("./analyze_sentiment.js");
const rateLimit = require('express-rate-limit')
const { timingSafeEqual } = require('crypto')
require("dotenv").config();


app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`running`);
});

async function getCountries() {
    let countries = await fs.promises.readFile("englishCountries.txt", "utf8");
    var splitData = countries.split(",");
    return await splitData;
}

function EST() {
    let date = new Date();
    let easternTime = date.toLocaleString("en-US", {timeZone: "America/New_York"});
    return easternTime;
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
            if(jsonHeadlines.includes(title) == true || json.status != 'ok') {
                if(jsonHeadlines.includes(title)) {
					console.log('WARN: HEADLINE NOT PUSHED: already in file');
                fs.appendFileSync("./storage/err.log", `WARN: [${EST()}]: HEADLINE NOT PUSHED: already in file.<br>\n`);
				}
				if(json.status != 'ok') {
					console.log('HEADLINE NOT PUSHED: API GET Failed');
                fs.appendFileSync("./storage/err.log", `ERR: [${EST()}]: HEADLINE NOT PUSHED: API GET Failed, API returned: ${json.status}<br>\n`);
				}
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
    console.log(`[${EST()}]: Finished getting top headlines`);
    //log into get.log
    fs.appendFileSync("./storage/get.log", `[${EST()}]: Finished getting top headlines<br>\n`);
}

//make a password protected route to get top headlines
app.get("/get", (req, res) => {
    if(req.query.pw.length === process.env.PASSWORD.length && timingSafeEqual(Buffer.from(req.query.pw), Buffer.from(process.env.PASSWORD))) {
        getTopHeadLines();
        res.send(new Date());
    } else {
        res.status(401).send("Unauthorized");
    }
});

const logLimiter = rateLimit({
	windowMs: 30 * 60 * 1000, // 30 minutes
	max: 1, // Limit each IP to 5 requests per `window` (here, per 30 minutes)
	message:
		'see <a href="https://the-worlds-sentiment.enzon3.repl.co/#:~:text=Why%20am%20I%20only%20limited%20to%20only%201%20log%20request%20per%20hour%3F">here</a> for more info.',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.get("/log",  logLimiter, (req, res) => {
    var file = fs.readFileSync('./storage/get.log', 'utf-8');
    res.send(file);
});

app.get("/aLog", (req, res) => {
    if(req.query.pw.length === process.env.PASSWORD.length && timingSafeEqual(Buffer.from(req.query.pw), Buffer.from(process.env.PASSWORD))) {
        var file = fs.readFileSync('./storage/get.log', 'utf-8');
    	res.send(file);
    } else {
        res.status(401).send("Unauthorized");
    }
});