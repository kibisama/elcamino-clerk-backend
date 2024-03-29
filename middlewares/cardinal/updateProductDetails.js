const updateProductDetails = async (req, res, next) => {
  const { browser, page, waitForOptions, xPaths, functions } =
    req.app.get('cardinalPuppet');
  const cin = req.params.cin;

  await page.typeInputEl(cin, xPaths.menu.searchBar);
  await page.waitForNavigation(waitForOptions);
  const productLink = await page.waitForElement(
    `//a //span[contains(text(), "${cin}")]`,
  );
  let result = null;
  if (productLink.length > 0) {
    await page.clickEl(productLink[0]);
    await page.waitForNavigation(waitForOptions);
    result = await functions.collectProductDetails(page);
    await page.clickEl(xPaths.menu.home);
    await page.waitForNavigation(waitForOptions);
    await page.waitForPageRendering();
  }
  const productTypeRange = ['Rx', 'C3', 'C4', 'C5'];
  if (
    productTypeRange.includes(result?.productType) &&
    result.returnPackaging === 'Ambient'
  ) {
    // const puppets = ['smartSourcePuppet', 'keySourcePuppet'];
    // await Promise.all(
    //   puppets.map(async (puppet) => {
    //     const { browser, page, waitForOptions, xPaths, functions } =
    //       req.app.get(puppet);
    //     for (let i = 0; i < items.length; i++) {
    //       await functions.collectCostData(page, items[i].ndc, items[i].altNDC);
    //     }
    //   }),
    // );
    const { browser, page, waitForOptions, xPaths, functions } =
      req.app.get('smartSourcePuppet');
    await functions.collectCostData(page, result.ndc, result.altNDC);
  }

  return res.send(result);
};

module.exports = updateProductDetails;
