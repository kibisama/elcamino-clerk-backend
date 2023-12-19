const updateProductDetails = async (req, res, next) => {
  const { browser, page, xPaths, cardinalPuppetFn } =
    req.app.get('cardinalPuppet');
  const cin = req.params.cin;

  await page.typeInputEl(cin, xPaths.menu.searchBar);
  await page.waitForPageRendering(3000);
  const productLink = await page.waitForElement(
    `//a //span[contains(text(), "${cin}")]`,
  );
  let result;
  if (productLink.length > 0) {
    await page.clickEl(productLink[0]);
    await page.waitForPageRendering(3000);
    await page.waitForElement(xPaths.productDetails.cardinalCost);
    result = await cardinalPuppetFn.collectProductDetails(page);
    await page.clickEl(xPaths.menu.home);
    await page.waitForPageRendering(3000);
  }
  return res.send(result);
};

module.exports = updateProductDetails;
