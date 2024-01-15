const initPuppet = require('./initPuppet');
const xPaths = require('./keySourceXPaths');
const keySourcePuppetFn = require('./keySourcePuppetFn');

const keySourcePuppet = async () => {
  const name = 'KeySourcePuppet';
  const id = process.env.KEYSOURCE_USERNAME;
  const password = process.env.KEYSOURCE_PASSWORD;
  const logOnFunc = async (page, browser) => {
    const loginButton = await page.$x(xPaths.home.loginButton);
    if (loginButton.length > 0) {
      await loginButton[0].click();
      const popup = (await browser.pages())[1];
      await popup.waitForNavigation(waitForOptions);
      await popup.waitForElements([
        xPaths.loginPopup.idInput,
        xPaths.loginPopup.passwordInput,
      ]);
      await popup.type('input[type="email"]', id);
      await popup.type('input[type="password"]', password);
      await popup.click('button[type="submit"]');
    }
  };
  const browserOptions = {
    headless: false,
    defaultViewport: null,
  };
  const waitForOptions = {
    timeout: 0,
    waitUntil: 'networkidle0',
  };
  const { browser, page } = await initPuppet(
    {
      name,
      color: 'magenta',
      url: 'https://store.keysource.com/',
      browserOptions,
      waitForOptions,
    },
    logOnFunc,
  );
  const functions = keySourcePuppetFn({ waitForOptions, xPaths });

  return { browser, page, waitForOptions, xPaths, functions };
};

module.exports = keySourcePuppet;
