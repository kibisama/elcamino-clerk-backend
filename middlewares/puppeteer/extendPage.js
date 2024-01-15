const chalk = require('chalk');
const { Page, ElementHandle } = require('puppeteer');

/**
 * Adds methods to a Page instance.
 * 페이지 인스턴스에 메서드들을 추가합니다
 * @param {Page} page
 * @param {string} name name of the puppeteer instance
 * @param {string} color chalk color for console.log
 * @returns {Page}
 */
const extendPage = (page, name, color) => {
  /**
   * Clicks an element.
   * 엘리먼트를 클릭합니다.
   * @param {ElementHandle|string} target ElementHandle Object or XPath string of the element
   * @param {Function} callback callback to be called if XPath not found from the page
   * @returns {Promise<undefined>|[]}
   */
  page.clickEl = async (target, callback) => {
    if (target instanceof ElementHandle) {
      await target.click();
      console.log(`${chalk[color](name + ':')} target element clicked`);
      return;
    }
    const els = await page.$x(target);
    if (els.length > 0) {
      await els[0].click();
    } else {
      console.log(
        `${chalk[color](name + ':')} XPath'${target}' element not found`,
      );
      if (typeof callback === 'function') {
        callback();
      }
      return els;
    }
    console.log(`${chalk[color](name + ':')} XPath'${target}' element clicked`);
  };
  /**
   * Returns a text array from the XPath.
   * Element의 innerText를 배열로 반환합니다.
   * @param {string} xPath
   * @param {Function} callback callback to be called if elements not found from the page
   * @returns {Promise<[string]>}
   */
  page.findTexts = async (xPath, callback) => {
    const els = await page.$x(xPath);
    if (els.length > 0) {
      const results = await Promise.all(
        els.map(async (elHandle) =>
          String(
            await (await elHandle.getProperty('textContent')).jsonValue(),
          ).trim(),
        ),
      );
      return results;
    } else {
      console.log(
        `${chalk[color](name + ':')} XPath'${xPath}' element not found.`,
      );
      if (typeof callback === 'function') {
        callback();
      }
      return els;
    }
  };
  /**
   * Reloads the page.
   * 페이지를 리로드합니다.
   * @param {number} minWaitingTime
   * @returns {Promise<undefined>}
   */
  page.reloadURL = async (minWaitingTime = 3000) => {
    const url = page.url();
    console.log(`${chalk[color](name + ':')} reloading the page...`);
    await page.goto(url);
    await page.waitForPageRendering(minWaitingTime);
  };
  /**
   * Generates a random delay and a log.
   * 랜덤 딜레이를 생성하고 로그를 기록합니다.
   * @param {number} _delay
   * @param {string} log
   * @returns {Promise<undefined>}
   */
  page.setRandomDelay = async (delay = 0, log = '') => {
    const randomDelay = (Math.random() * 3 + delay / 1000) * 1000;
    await new Promise((r) => setTimeout(r, randomDelay));
    console.log(
      `${chalk[color](name + ':')} ${chalk.greenBright(
        log,
      )} [delay: ${randomDelay} ms]`,
    );
  };
  /**
   * Inputs a keyword and Enter on the input Element.
   * 검색창에 키워드와 엔터를 입력하고 waitForPageRendering 비동기 함수를 호출합니다.
   * @param {string} keyword
   * @param {puppeteer.ElementHandle|string} inputEl
   * @param {number} minWaitingTime
   * @returns {Promise<undefined>}
   */
  page.typeInputEl = async (keyword, inputEl) => {
    let target;
    if (typeof inputEl === 'string') {
      const _inputEl = await page.$x(inputEl);
      if (_inputEl.length > 0) {
        target = _inputEl[0];
      } else {
        console.error(`${chalk[color](name + ':')} Input Element not found`);
        return _inputEl;
      }
    }
    if (inputEl instanceof ElementHandle) {
      target = inputEl;
    }
    await target.click({ count: 3 });
    await target.type(keyword);
    await page.keyboard.press('Enter');
    console.log(
      `${chalk[color](name + ':')} input ${chalk.greenBright(keyword)}`,
    );
    return;
  };
  /**
   * Waits until the page is fully rendered.
   * 페이지가 완전히 렌더링될 때까지 기다립니다.
   * @param {number} minWaitingTime
   * @param {number} timeout
   * @returns {Promise<undefined>}
   */
  page.waitForPageRendering = async (minWaitingTime = 0, timeout = 30000) => {
    const interval = 1000;
    const maxCount = timeout / interval;
    let count = 0;
    let lastHTMLSize = 0;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;
    if (minWaitingTime) {
      await new Promise((r) => setTimeout(r, minWaitingTime));
    }
    while (count++ < maxCount) {
      let html = await page.content();
      let currentHTMLSize = html.length;
      let bodyHTMLSize = await page.evaluate(
        () => document.body.innerHTML.length,
      );
      console.log(
        `${chalk[color](
          name + ':',
        )} last: ${lastHTMLSize}  current: ${currentHTMLSize}  body HTML size: ${bodyHTMLSize}`,
      );
      if (lastHTMLSize !== 0 && currentHTMLSize === lastHTMLSize)
        countStableSizeIterations++;
      else countStableSizeIterations = 0;
      if (countStableSizeIterations >= minStableSizeIterations) {
        console.log(`${chalk[color](name + ':')} Page rendered completely`);
        break;
      }
      lastHTMLSize = currentHTMLSize;
      await new Promise((r) => setTimeout(r, interval));
    }
  };
  /**
   * Waits until the target element found.
   * Element를 찾을 때까지 기다립니다.
   * @param {string} xPath
   * @param {number} timeout
   * @param {Function} callback callback to be called if XPath not found from the page
   * @returns {Promise<[ElementHandle]>}
   */
  page.waitForElement = async (xPath, timeout = 30000, callback) => {
    const interval = 1000;
    const maxCount = timeout / interval;
    let count = 0;
    let els = [];
    while (count++ < maxCount) {
      const _els = await page.$x(xPath);
      if (_els.length > 0) {
        await page.waitForPageRendering();
        els = _els;
        break;
      }
      await new Promise((r) => setTimeout(r, interval));
    }
    if (els.length === 0) {
      console.log(`${chalk[color](name + ':')} XPath'${xPath}' not found`);
      if (typeof callback === 'function') {
        callback();
      }
    }
    return els;
  };
  /**
   * Waits until all the target elements found.
   * Element를 찾을 때까지 기다립니다. 각 element의 innerText 값들의 배열을 배열로 반환합니다.
   * @param {[string]} xPathArray
   * @param {number} timeout
   * @param {Function} callback callback to be called if XPath not found from the page
   * @returns {Promise<Array<string[]>>}
   */
  page.waitForElements = async (xPathArray, timeout = 30000, callback) => {
    const interval = 1000;
    const maxCount = timeout / interval;
    let count = 0;
    let els = [];
    while (count++ < maxCount) {
      let _els = await Promise.all(
        xPathArray.map(async (xPath) => await page.$x(xPath)),
      );
      const elsLength = _els.map((els) => els.length);
      if (elsLength.includes(0)) {
        console.log(
          `${chalk[color](name + ':')} XPath'${
            xPathArray[elsLength.indexOf(0)]
          }' not found`,
        );
        await new Promise((r) => setTimeout(r, interval));
      } else {
        els = await Promise.all(
          _els.map(async (v, i) => await page.findTexts(xPathArray[i])),
        );
        break;
      }
    }
    if (els.length === 0) {
      console.log(
        `${chalk[color](
          name + ':',
        )} one or more elements from xPathArray not found`,
      );
      if (typeof callback === 'function') {
        callback();
      }
    }
    return els;
  };

  return page;
};

module.exports = extendPage;
