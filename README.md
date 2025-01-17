# ASIN product category scraper
This is a short node program that'll take in a CSV of Amazon ASIN numbers and spit out the same list with names and
categories as found from the product pages.

# To Run:
## Setup your CSV
You need a .csv file to run this. We expect a header with at least two values (names don't matter).
The first two fields need to be ASIN and some kind of name, in order. Any other fields are fine.

Check out example.csv.

## Install Node
Annoyingly, I've chosen to write this in a programming language that's equally annoying for everyone to run, but at
least everyone can run it!

See [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm)
for instructions on how to do that in your system

## Install dependencies
NPM will manage this for you. Run the following in the command line to get it up to date:
```bash
npm i
```

## Run the program
You've now got everything you need for success. Here's the command to run throught he example.csv:
```bash
ts-node . example.csv
```

This will create a file called `categories.csv`, a tab-seperated CSV that contains the ASIN, a name we found, 
and a list of categories in increasing specificity we found by visiting the product for that page. 
`example-categories.csv` shows you what to expect.