const Drug = require('../../schemas/drug');
const CardinalInvoice = require('../../schemas/cardinalInvoice');

const checkCardinalInvoice = async (req, res, next) => {
  const {
    waitForOptions,
    page,
    setRandomDelay,
    clickOrderHistoryLink,
    findNewInvoiceNumbers,
    findNewCINs,
    collectProductData,
    collectInvoiceData,
  } = req.app.get('cardinalPuppet');
  const { date, forceUpdate } = req.body;
  await clickOrderHistoryLink(page);
  const { pageInvoiceNumbers, newInvoiceNumbers } = await findNewInvoiceNumbers(
    page,
    date,
  );
  const results = [];
  if (pageInvoiceNumbers.length > 0) {
    if (newInvoiceNumbers.length === 0 && !forceUpdate) {
      for (const invoiceNumber of pageInvoiceNumbers) {
        results.push(await CardinalInvoice.findOne({ invoiceNumber }));
      }
      res.send({ data: results });
    }
    for (const invoiceNumber of pageInvoiceNumbers) {
      await (
        await page.$x(
          `//td[@class= "colSO cahTableCellBorder"] //a[contains(text(), "${invoiceNumber}")]`,
        )
      )[0].click();
      await page.waitForNavigation(waitForOptions);
      const { pageCINs, newCINs } = await findNewCINs(page);
      if (forceUpdate) {
        await setRandomDelay(
          page,
          'This will update every single item ordered',
        );
        for (const pageCIN of pageCINs) {
          await collectProductData(page, pageCIN, 'Invoice Detail');
        }
      } else {
        await setRandomDelay(page, 'This will update only newly ordered items');
        for (const newCIN of newCINs) {
          await collectProductData(page, newCIN, 'Invoice Detail');
        }
      }
      results.push(await collectInvoiceData(page, invoiceNumber));
      await clickOrderHistoryLink(page);
      await page.waitForNavigation(waitForOptions);
    }
    res.send({ data: results });
  } else {
    res.send({ error: 'Invoice Not Found' });
  }
  res.send({ data: results });
};
module.exports = checkCardinalInvoice;
