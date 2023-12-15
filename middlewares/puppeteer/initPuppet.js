const puppeteer = require('puppeteer');
const chalk = require('chalk');
const extendPage = require('./extendPage');

/**
 * 퍼핏을 인스턴스를 생성하고 주어진 url에 접속해 로그인함수를 실행합니다.
 * @param {{name: string, color: string, url: string}} initOptions
 * @param {function} logOnFunc
 * @returns {Promise<{Promise<Browser>,Promise<Page>}>}
 */
const initPuppet = async (initOptions, logOnFunc) => {
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
    console.log(`${chalk[color](name, ':')} Initializing Puppeteer`);
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

    // 로그인 이후 Execution context를 유지하기 위한 대기시간이 필요합니다.
    await new Promise((r) => setTimeout(r, 15000));
    await page.waitForPageRendering();
    console.log(`${chalk[color](name, ':')} 로그인 성공`);
    return { browser, page };
  } catch (e) {
    console.log(e);
  }
};

module.exports = initPuppet;
