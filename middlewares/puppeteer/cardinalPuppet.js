const initPuppet = require('./initPuppet');
const xPaths = require('./cardinalXPaths');
const cardinalPuppetFn = require('./cardinalPuppetFn');

const cardinalPuppet = async () => {
  const name = 'CardinalPuppet';
  const id = process.env.CARDINAL_USERNAME;
  const password = process.env.CARDINAL_PASSWORD;
  const logOnFunc = async (page) => {
    await page.type('input[id="okta-signin-username"]', id);
    await page.type('input[id="okta-signin-password"]', password);
    await page.click('input[id="okta-signin-submit"]');
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
      color: 'red',
      url: 'https://orderexpress.cardinalhealth.com/',
      browserOptions,
      waitForOptions,
    },
    logOnFunc,
  );
  const functions = cardinalPuppetFn({ waitForOptions, xPaths });

  return { browser, page, waitForOptions, xPaths, functions };
};

module.exports = cardinalPuppet;
