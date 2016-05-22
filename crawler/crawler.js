var cheerio = require('cheerio');
var settings = {};
var request = require('request');
var fs = require('fs');

function CrawlController(numberOfCrawls, data) {
    this.numberOfCrawls = numberOfCrawls;
    this.crawlsFinished = 0;
    this.skipped = 0;

    this.singleCrawlFinished = function(characterName) {
        this.crawlsFinished++;


        var crawlsLeft = this.numberOfCrawls - this.crawlsFinished;
        console.log("*******************************");
        console.log('Crawl done: ' + characterName);
        console.log('Crawls left: ' + crawlsLeft);
        if (crawlsLeft > 0) {
            return;
        }
        console.log("*******************************\n*******************************");
        console.log("Finished all Characters");
        console.log('skipped: ' + this.skipped);
    }
}


function download(url, callbackFn) {
    request(url, function(error, response, html) {
        if (!error && response.statusCode == 200) {
            callbackFn(html);
        }
    });
}

function downloadCharacters() {
    var heroes = JSON.parse(fs.readFileSync('./public/data/heroes.json'));

    heroes.forEach(function(hero) {
        var currentUrl = hero.sourceUrl;
        console.log(currentUrl);
        download(currentUrl, function(html) {
            $ = cheerio.load(html, settings);

            var heroDir = './public/img/heroes/' + hero.name;

            if (!fs.existsSync(heroDir)) {
                fs.mkdirSync(heroDir)
            }

            var abilityDir = heroDir + '/abilities/';

            if (!fs.existsSync(abilityDir)) {
                fs.mkdirSync(abilityDir)
            }

            var abilitiesElements = $('.hero-ability-icon.center_element');

            Object.keys(abilitiesElements).forEach(function(key) {
                var ability = abilitiesElements[key];

                if (ability.attribs) {
                    console.log(hero.name + ' - ' + ability.attribs.src);
                    request(ability.attribs.src).pipe(fs.createWriteStream(abilityDir + key + '.png'));
                }
            });
        });
    });
}

downloadCharacters();