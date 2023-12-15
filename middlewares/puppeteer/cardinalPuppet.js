const cardinalPuppet = async () => {
  const name = 'CardinalPuppet';
  const id = process.env.CARDINAL_USERNAME;
  const password = process.env.CARDINAL_PASSWORD;
  const logOnFunc = async (page) => {
    await page.type('input[id="okta-signin-username"]', id);
    await page.type('input[id="okta-signin-password"]', password);
    await page.click('input[id="okta-signin-submit"]');
  };
  const { browser, page } = await initPuppet(
    {
      name,
      color: 'red',
      url: 'https://orderexpress.cardinalhealth.com/',
    },
    logOnFunc,
  );

  return { browser, page };
};

module.exports = cardinalPuppet;
