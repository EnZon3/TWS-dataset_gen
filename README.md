# TWS-Dataset

TWS-Dataset is a program that slowly generates a dataset of top headlines from english countries.

It's for a project that I'm working on called 'The World's Sentiment'.

I'm only going to give a quick explaination of what TWS is and what it's doing.

# What is The World's Sentiment?

TWS is a project of mine that I'm working on.

The project's main goal is to analyze the sentiment of what is going on in the world.

## When is TWS going to be finished?

The answer is I don't know. It really depends on how long I run it for. Could be a few days, weeks, or even months. or if I run out of storage space to hold the dataset.

## What is TWS doing?

Every day, at 7:30 PM, TWS-dataset will append the top headlines from the english countries to a file, and the sentiment of the headlines will be analyzed and appended to a file.

## How do I run TWS?

Either you fork this project and run it yourself, or you simply don't, because the endpoint is protected by authentication.

### If I fork this project, how do I run it?

    git clone https://github.com/EnZon3/TWS-dataset.git
    cd TWS-dataset
    npm install
    node .

Don't forget to add a .env file to the root of the project with the following variables:

```
API_KEY=<your-NewsApi-key>
PASSWORD=<your-password>
```

To get your API key, go to https://newsapi.org/ and create an account.

PASSWORD is the password you use to access the /getTopHeadlines endpoint.