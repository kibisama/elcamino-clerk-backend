const puppeteer = require('puppeteer');
const chalk = require('chalk');
const extendPage = require('./extendPage');

/**
 * 퍼핏을 인스턴스를 생성하고 주어진 url에 접속해 로그인함수를 실행합니다.
 * @param {{name: string, color: string, url: string}} initOptions
 * @param {function} logOnFunc
 * @param {number} minWaitingTime
 * @returns {Promise<{Promise<Browser>,Promise<Page>}>}
 */
const initPuppet = async (initOptions, logOnFunc, minWaitingTime = 15000) => {
  const { name, color, url } = initOptions;
  const browserOptions = {
    headless: false,
    defaultViewport: null,
  };
  const waitForOptions = {
    timeout: 0,
    waitUntil: 'networkidle0',
  };
  try {
    console.log(`${chalk[color](name + ':')} Initializing Puppeteer...`);
    const browser = await puppeteer.launch(browserOptions);
    browser.on('targetcreated', async (target) => {
      if (target.type() === 'page') {
        const page = await target.page();
        extendPage(page, name, color);
      }
    });
    const page = await browser.newPage();
    await (await browser.pages())[0].close();
    await page.goto(url, waitForOptions);
    await logOnFunc(page);

    await page.waitForPageRendering(minWaitingTime);
    console.log(`${chalk[color](name + ':')} 로그인 성공`);
    return { browser, page };
  } catch (e) {
    console.log(e);
  }
};

module.exports = initPuppet;
