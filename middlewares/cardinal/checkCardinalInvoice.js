const CardinalInvoice = require('../../schemas/cardinalInvoice');

const checkCardinalInvoice = async (req, res, next) => {
  const { browser, page, waitForOptions, xPaths, functions } =
    req.app.get('cardinalPuppet');
  const { date, forceUpdate, secondSrcUpdate } = req.body;
  if (!forceUpdate) {
    const dbResults = await CardinalInvoice.find({
      invoiceDate: date,
    }).populate('item');
    if (dbResults.length > 0) {
      return res.send(dbResults);
    }
  }

  await page.clickEl(xPaths.menu.orderHistory);
  await page.waitForNavigation(waitForOptions);
  await page.waitForElement(xPaths.orderHistory.findInvoice);
  const invoiceNumbers = await functions.findInvoiceByShipDate(page, date);
  const _items = [];
  if (invoiceNumbers.length > 0) {
    for (let i = 0; i < invoiceNumbers.length; i++) {
      await page.clickEl(
        `//td[@class= "colSO cahTableCellBorder"] //a[contains(text(), "${invoiceNumbers[i]}")]`,
      );
      await page.waitForNavigation(waitForOptions);
      await page.waitForElement(xPaths.invoiceDetail.invoiceNumber);
      let cin;
      if (forceUpdate) {
        cin = await page.findTexts(xPaths.invoiceDetail.cin);
      } else {
        cin = await functions.findNewCINs(page);
      }
      if (cin.length > 0) {
        for (let j = 0; j < cin.length; j++) {
          await page.clickEl(
            `//td[@class= "columnLgCin cahTableCellBorder"] //a[contains(text(), "${cin[j]}")]`,
          );
          await page.waitForNavigation(waitForOptions);
          _items.push(await functions.collectProductDetails(page));
          await page.clickEl(xPaths.tempNavi.invoiceDetail);
          await page.waitForNavigation(waitForOptions);
        }
      }
      await functions.collectInvoiceDetail(page);
      await page.clickEl(xPaths.tempNavi.orderHistory);
      await page.waitForNavigation(waitForOptions);
      await page.waitForElement(xPaths.orderHistory.findInvoice);
    }
  } else {
    return res.send([]);
  }
  await page.clickEl(xPaths.menu.home);
  await page.waitForNavigation(waitForOptions);
  await page.waitForPageRendering();

  if (secondSrcUpdate) {
    const productTypeRange = ['Rx', 'C3', 'C4', 'C5'];
    const items = _items.filter((item) => {
      return (
        productTypeRange.includes(item.productType) &&
        item.returnPackaging === 'Ambient'
      );
    });
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
    for (let i = 0; i < items.length; i++) {
      await functions.collectCostData(page, items[i].ndc, items[i].altNDC);
    }
  }

  const results = await CardinalInvoice.find({ invoiceDate: date }).populate(
    'item',
  );
  return res.send(results);
};

module.exports = checkCardinalInvoice;
