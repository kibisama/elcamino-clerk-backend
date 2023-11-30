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
  await clickOrderHistoryLink(page, true);
  const { pageInvoiceNumbers, newInvoiceNumbers } = await findNewInvoiceNumbers(
    page,
    date,
  );
  // TODO: req.body.date의 날짜가 현재 검색중인 페이지 결과 최대일자보다 30일 이후 일 경우 검색 중단하고 Invoice Not Found 에러 결과를 Send 한다.

  const data = { results: [], error: null };
  if (pageInvoiceNumbers.length > 0) {
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
      data.results.push(await collectInvoiceData(page, invoiceNumber));
      await clickOrderHistoryLink(page);
    }
  } else {
    data.error = 'Invoice Not Found';
  }

  res.send(data);
};
module.exports = checkCardinalInvoice;
