var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "https://wiprodigital.com/";
var SEARCH_WORD = "stemming";
var MAX_PAGES_TO_VISIT = 2;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;
  console.log("Page: " + numPagesVisited);

  // Make the request
  console.log("Visiting page " + url);
  console.log("\n");
  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
     console.log("Status code: " + response.statusCode);
     console.log("\n");
     if(response.statusCode !== 200) {
       callback();
       return;
     }
     // Parse the document body
     var $ = cheerio.load(body);
       console.log("----------- Extracting static links ------------");
       console.log("\n");
       collectStaticLinks($);
       console.log("\n");
       console.log("----------- Extracting external links ------------");
       collectExternalLinks($);
       console.log("\n");
       console.log("----------- Extracting internal links ------------");
       collectInternalLinks($);
       console.log("\n");
       // In this short program, our callback is just calling crawl()
       callback();
  });
}

function collectInternalLinks($) {
    var relativeLinks = $("a[href^='https://wiprodigital.com/']");
    console.log("Found " + relativeLinks.length + " relative links on page:");
    relativeLinks.each(function() {
      console.log($(this).attr('href'));
        pagesToVisit.push($(this).attr('href'));
    });
}

function collectStaticLinks($) {
    var imageLinks = $("img");
    console.log("Found " + imageLinks.length + " image links tags on page:");
    imageLinks.each(function() {
        console.log($(this).attr('src'));
    });
    console.log("\n");
    var cssLinks = $("link");
    console.log("Found " + cssLinks.length + " css links tags on page:");
    cssLinks.each(function() {
        console.log($(this).attr('href'));
    });
    console.log("\n");
    var scriptLinks = $("script");
    console.log("Found " + scriptLinks.length + " script tags (with or without links) on page:");
    scriptLinks.each(function() {
        if($(this).attr('src')){
          console.log($(this).attr('src'));
        }
    });
}

function collectExternalLinks($) {
    var allLinks = $("a");
    allLinks.each(function() {
        var link = $(this).attr('href');
        if(!link.includes("https://wiprodigital.com")){ // external links
          console.log(link);
        }
    });
}
