const initPuppet = require('./initPuppet');
const xPaths = require('./smartSourceXPaths');
const smartSourcePuppetFn = require('./smartSourcePuppetFn');

const smartSourcePuppet = async () => {
  const name = 'SmartSourcePuppet';
  const id = process.env.SMARTSOURCE_USERNAME;
  const password = process.env.SMARTSOURCE_PASSWORD;
  const logOnFunc = async (page) => {
    await page.type('input[id="logonuidfield"]', id);
    await page.type('input[id="logonpassfield"]', password);
    await page.click('button[type="submit"]');
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
      color: 'blue',
      url: 'https://order.smartsourcerx.com',
      browserOptions,
      waitForOptions,
    },
    logOnFunc,
  );
  const functions = smartSourcePuppetFn({ waitForOptions, xPaths });

  return { browser, page, waitForOptions, xPaths, functions };
};

module.exports = smartSourcePuppet;
