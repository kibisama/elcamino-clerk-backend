// Page 인스턴스에 메서드들을 추가합니다.
const chalk = require('chalk');

const extendPage = (page, name, color) => {
  /**
   * Waits until the page is fully rendered.
   * 페이지가 완전히 렌더링될 때까지 기다립니다.
   * @param {number} timeout
   * @returns {Promise<undefined>}
   */
  page.waitForPageRendering = async (timeout = 30000) => {
    const interval = 1000;
    const maxCount = timeout / interval;
    let count = 0;
    let lastHTMLSize = 0;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;
    while (count++ < maxCount) {
      let html = await page.content();
      let currentHTMLSize = html.length;
      let bodyHTMLSize = await page.evaluate(
        () => document.body.innerHTML.length,
      );
      console.log(
        `${chalk[color](
          name,
          ':',
        )} last: ${lastHTMLSize}  current: ${currentHTMLSize}  body HTML size: ${bodyHTMLSize}`,
      );
      if (lastHTMLSize !== 0 && currentHTMLSize === lastHTMLSize)
        countStableSizeIterations++;
      else countStableSizeIterations = 0;
      if (countStableSizeIterations >= minStableSizeIterations) {
        console.log(`${chalk[color](name, ':')} Page rendered completely`);
        break;
      }
      lastHTMLSize = currentHTMLSize;
      await page.waitForTimeout(interval);
    }
  };
  /**
   * Input a keyword and Enter on the input Element.
   * 검색창에 키워드와 엔터를 입력합니다.
   * @param {string} keyword
   * @param {puppeteer.ElementHandle} inputEl
   * @returns {Promise<undefined>}
   */
  page.typeSearchBar = async (keyword, inputEl) => {
    if (!inputEl) {
      console.error(
        `${chalk[color](
          name,
          ':',
        )} [page.typeSearchBar] Input Element not found`,
      );
      return;
    }
    await inputEl.click({ count: 3 });
    await inputEl.type(keyword);
    await page.keyboard.press('Enter');
  };

  return page;
};

module.exports = extendPage;
