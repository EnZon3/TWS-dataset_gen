//require natural
//require natural.sentiment
const natural = require("natural");
const aposToLexForm = require('apos-to-lex-form');
const SW = require('stopword');

// on function call analyze sentiment from input
function analyze(input) {
    const lexed = aposToLexForm(input);
    const cased = lexed.toLowerCase();
    const alphaOnly = cased.replace(/[^a-zA-Z\s]+/g, '');

    const { WordTokenizer } = natural;
    const tokenizer = new WordTokenizer();
    const tokenized = tokenizer.tokenize(alphaOnly);
    const filtered = SW.removeStopwords(tokenized);

    const { SentimentAnalyzer, PorterStemmer } = natural;
    const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
    const analysis = analyzer.getSentiment(filtered);
    return analysis;
}

//export analyzeSentiment
module.exports = { analyze };