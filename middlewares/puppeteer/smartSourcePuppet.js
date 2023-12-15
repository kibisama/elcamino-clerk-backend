// // const axios = require('axios');
// // const fs = require('fs');
const initPuppet = require('./initPuppet');

const smartSourcePuppet = async () => {
  const name = 'SmartSourcePuppet';
  const id = process.env.SMARTSOURCE_USERNAME;
  const password = process.env.SMARTSOURCE_PASSWORD;
  const logOnFunc = async (page) => {
    await page.type('input[id="logonuidfield"]', id);
    await page.type('input[id="logonpassfield"]', password);
    await page.click('button[type="submit"]');
  };
  const { browser, page } = await initPuppet(
    {
      name,
      color: 'blue',
      url: 'https://order.smartsourcerx.com',
    },
    logOnFunc,
  );

  return { browser, page };
};

module.exports = smartSourcePuppet;
