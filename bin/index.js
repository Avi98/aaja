#!/usr/bin/env node

'use strict';

const dns = require('dns');
const got = require('got');
const cheerio = require('cheerio');
const chalk = require('chalk');
const ora = require('ora');
const logUpdate = require('log-update');
const updateNotifier = require('update-notifier');
const meow = require('meow');
const pkg = require('../package.json');

updateNotifier({ pkg }).notify();

const spinner = ora();
const url = `english.hamropatro.com`;

const checkArgs = () => {
    // console.log(`
    //   ${chalk.cyan('Usage:')} 
    
    //   ${chalk.cyan('$ aaja')}     display today's nepali date
    // `);
    meow(`
    Usage
      $ aaja
  `);

    process.exit(1);
};

const checkConnection = () => {
  dns.lookup(url, (err) => {
    if (err) {
      console.log(err);
      logUpdate(`\n ✖ Please check your internet connection. \n`);
      process.exit(1);
    } else {
      logUpdate();
      spinner.text = `Fetching today's date\n\n`;
      spinner.start();
    }
  });
};

const showError = () => {
  logUpdate(`\n${chalk.dim('Could not fetch date. Please try again!')}\n`);
  process.exit(1);
};

const main = () => {
  const aaja = {};
  checkArgs();
  checkConnection();

  got(`https://${url}`)
    .then((res) => {
      const $ = cheerio.load(res.body, {
        xml: {
          normalizeWhitespace: true,
        },
      });

      const main = `#top .container12 .column4 .logo`;

      const npdate = $(`${main} .date`);
      aaja.date = npdate.text().trim();

      const [tithi, events] = $(`${main} .events`)
        .text()
        .trim()
        .split(',')
        .map((el) => el.trim());

      aaja.tithi = tithi;
      aaja.events = events.split('/');

      const time = $(`${main} .time > span:nth-child(1)`);
      aaja.time = time.text().trim();

      const ad = $(`${main} .time >span.eng`);
      aaja.ad = ad.text().trim();

      spinner.stop();
      console.log({...aaja});
    })
    .catch((err) => {
      if (err) showError();
    });
};

main();
