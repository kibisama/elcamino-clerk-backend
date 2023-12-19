// const checkCardinalInvoice = async (req, res, next) => {
//   const {
//     waitForOptions,
//     page,
//     setRandomDelay,
//     clickOrderHistoryLink,
//     findNewInvoiceNumbers,
//     findNewCINs,
//     collectProductData,
//     collectInvoiceData,
//     clickHomeLink,
//   } = req.app.get('cardinalPuppet');
//   const { date, forceUpdate } = req.body;
//   await clickOrderHistoryLink(page, true);
//   const { pageInvoiceNumbers, newInvoiceNumbers } = await findNewInvoiceNumbers(
//     page,
//     date,
//   );
//   // TODO: req.body.date의 날짜가 현재 검색중인 페이지 결과 최대일자보다 30일 이후 일 경우 검색 중단하고 Invoice Not Found 에러 결과를 Send 한다.

//   const data = { results: [], error: null };
//   if (pageInvoiceNumbers.length > 0) {
//     for (const invoiceNumber of pageInvoiceNumbers) {
//       await (
//         await page.$x(
//           `//td[@class= "colSO cahTableCellBorder"] //a[contains(text(), "${invoiceNumber}")]`,
//         )
//       )[0].click();
//       await page.waitForNavigation(waitForOptions);
//       const { pageCINs, newCINs } = await findNewCINs(page);
//       if (forceUpdate) {
//         await setRandomDelay(
//           page,
//           'This will update every single item ordered',
//         );
//         for (const pageCIN of pageCINs) {
//           await collectProductData(page, pageCIN, 'Invoice Detail');
//         }
//       } else {
//         await setRandomDelay(page, 'This will update only newly ordered items');
//         for (const newCIN of newCINs) {
//           await collectProductData(page, newCIN, 'Invoice Detail');
//         }
//       }
//       data.results.push(await collectInvoiceData(page, invoiceNumber));
//       await clickOrderHistoryLink(page);
//     }
//   } else {
//     data.error = 'Invoice Not Found';
//   }
//   await clickHomeLink(page);
//   return res.send(data);
// };

const checkCardinalInvoice = async (req, res, next) => {
  const { browser, page, xPaths, cardinalPuppetFn } =
    req.app.get('cardinalPuppet');
  const { date, forceUpdate } = req.body;
  await page.clickEl(xPaths.menu.orderHistory);
  await page.waitForPageRendering(3000);
  const invoiceNumbers = await cardinalPuppetFn.findInvoiceByShipDate(
    page,
    date,
  );
  if (invoiceNumbers.length > 0) {
    console.log(invoiceNumbers);
  }

  return res.sendStatus(200);
};

module.exports = checkCardinalInvoice;
