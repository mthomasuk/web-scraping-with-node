const chalk = require('chalk');
const request = require('request-promise');
const cheerio = require('cheerio');
const Promise = require('bluebird');

const Server = require('./server');

const startUrl = process.argv[2];
const bannedUrls = ['http://www.google.com', 'http://www.yahoo.com', 'http://www.bing.com'];

// Parse HTML using Cheerio and return the attributes you need
const parseElements = (elArray, $, element, attr) => {
    return new Promise((resolve) => {
        $(element).each((i, m) => {
            $(m).attr(attr) ?
                elArray.push($(m).attr(attr)) :
                null;
        });
        return resolve(elArray);
    });
};

// Scrape a URL and return it's assets as defined by the call to parseElements
const scrapeAssets = (route, index) => {
    process.stdout.write(chalk.magenta('Scraping page number:') + ' ' + (index + 1) + '\r');
    return new Promise((resolve) => {
        request({
            uri: route,
            transform: (body) => cheerio.load(body)
        })
        .then(($) => {
            const elArray = [];
            Promise.all([
                parseElements(elArray, $, 'script', 'src'),
                parseElements(elArray, $, 'img', 'src'),
                parseElements(elArray, $, 'link[rel=stylesheet]', 'href')
            ]).then((parsed) => {

                // The ternary operator is unfortunately needed for testing purposes, otherwise we'd just pass in 'startUrl'
                const regexr = new RegExp(startUrl ? startUrl : route, 'g');
                const assets = parsed
                    .reduce((a, b) => a.concat(b), [])
                    .map((m) => m.replace(regexr, ''))
                    .filter((f) => f.search(/\//g) === 0)
                    .filter((f) => f.search(/\/\//g) !== 0)
                    .map((m) => `${startUrl ? startUrl : route}${m}`)
                    .filter((f, i, self) => self.indexOf(f) === i);

                return resolve({
                    url: route,
                    assets: assets
                });
            });

        })
        .catch((err) => {
            return resolve({
                url: route,
                error: `Status Code: ${err.statusCode}`
            });
        });
    });
};

// Scrape the initial URL and return any child URLs
const scrapeUrl = (url) => {
    console.log(chalk.blue('And off I go...'));
    return new Promise((resolve, reject) => {
        request({
            uri: url,
            transform: (body) => cheerio.load(body)
        })
        .then(($) => {
            const elArray = [];
            parseElements(elArray, $, 'a', 'href')
            .then((parsed) => {

                const regexr = new RegExp(url, 'g');
                const hrefs = parsed
                    .map((m) => m.replace(regexr, ''))
                    .filter((f) => f.search(/(www)|(http)|(https)/g) === -1)
                    .filter((f) => f.search(/(mailto\:)|(tel\:)/g) === -1)
                    .map((m) => `${url}${m}`);

                return resolve(hrefs);
            });
        })
        .catch((err) => {
            return reject(err);
        });
    });
};

// Initialise this bad boy
const init = () => {

    if (!startUrl) {
        return console.log(chalk.red('No URL specified'));
    }

    if (bannedUrls.find((f) => f.indexOf(startUrl) !== -1)) {
        return console.log(chalk.red('I\'m not scraping that, are you mad?'));
    }

    console.log(chalk.green('Scraping'), chalk.yellow.underline(startUrl));

    scrapeUrl(startUrl)
      .then((routes) => {
          console.log(chalk.blue('Pages found:'), routes.length);

          routes.length > 0 ?
              console.log(chalk.cyan('Let\s go deeper...')) :
              null;

          return Promise.map(routes, (route, index) => scrapeAssets(route, index));
      })
      .then((assets) => {
          if (assets.length > 0) {

              // Activate super cool JSON server for results (to avoid the console chopping off your results)
              Server.spawn(assets);
              console.log(chalk.magenta('Here\'s that stuff you wanted:'));
              console.log(assets);

          } else {
              console.log(chalk.red('Embarassingly, I couldn\'t find anything'));
          }

          return console.log(chalk.green('Donezo:'), chalk.yellow.underline(startUrl), chalk.green('scraped'));
      })
      .catch((err) => {
          return console.log(chalk.red('\nERROR!'), err);
      });
};

// ACTIVATE SCRAPEROO
init();

// Exports for tests
module.exports = {
    parseElements: parseElements,
    scrapeAssets: scrapeAssets,
    scrapeUrl: scrapeUrl
};
