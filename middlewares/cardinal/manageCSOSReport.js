// const CardinalInvoice = require('../../schemas/cardinalInvoice');

// const manageCSOSReport = async (req, res, next) => {
//   const {
//     browser,
//     findTextByXPath,
//     waitForOptions,
//     page,
//     setRandomDelay,
//     clickOrderHistoryLink,
//     clickHomeLink,
//   } = req.app.get('cardinalPuppet');
//   const { item, poDate, shipDate, csoNumber } = req.body;
//   await clickOrderHistoryLink(page);

//   const link = await page.$x(
//     "//a[contains(text(), 'Manage E222 & CSOS Orders' )]",
//   );
//   if (link.length > 0) {
//     await link[0].click();
//     await new Promise((r) => setTimeout(r, 5000));
//   }

//   let newPage;
//   while (true) {
//     await new Promise((r) => setTimeout(r, 1000));
//     const pages = await browser.pages();
//     if (pages.length > 1) {
//       newPage = pages[1];
//       break;
//     }
//   }

//   while (true) {
//     await new Promise((r) => setTimeout(r, 24000));
//     const _utn = await newPage.$x(
//       "//td[@class= 'u-text-align-right'] //div[@class= 'u-float-left']",
//     );
//     if (_utn.length > 0) {
//       break;
//     }
//     console.log('Cardinal Server Sucks: Retrying');
//     await newPage.close();
//     await new Promise((r) => setTimeout(r, 1000));
//     await link[0].click();
//     await new Promise((r) => setTimeout(r, 5000));
//     const pages = await browser.pages();
//     if (pages.length > 2) {
//       newPage = pages[2];
//       await setRandomDelay(newPage, 'New page was created');
//     }
//   }

//   const input = await newPage.$x(
//     '//div[@class= "react-datepicker__input-container"] //input',
//   );
//   if (input.length > 1) {
//     // csoNumber를 직접 입력하는 대신 날짜를 입력한다.
//     // await input[0].type(csoNumber);
//     await input[0].click({ clickCount: 3 });
//     await input[0].type(poDate);
//     await newPage.keyboard.press('Enter');
//     await new Promise((r) => setTimeout(r, 500));
//     await input[1].click({ clickCount: 3 });
//     await input[1].type(shipDate);
//     await newPage.keyboard.press('Enter');
//     await new Promise((r) => setTimeout(r, 500));
//   }
//   const updateRange = await newPage.$x(
//     '//button[contains(text(), "Update Range")]',
//   );
//   if (updateRange.length > 0) {
//     updateRange[0].click({ clickCount: 2 });
//     await new Promise((r) => setTimeout(r, 5000));
//     await setRandomDelay(newPage, 'Update Range');
//   }

//   let button;
//   while (true) {
//     await setRandomDelay(newPage, 'Waiting for Search Results');
//     const _button = await newPage.$x(`//a [contains(text(), "${csoNumber}")]`);
//     if (_button.length > 0) {
//       button = _button[0];
//       break;
//     }
//     await new Promise((r) => setTimeout(r, 3000));
//   }

//   // 만약 Order Status 가 Received 라면 데이터베이스 업데이트 후 리턴한다.
//   // TODO: 리팩터링: 중복코드 포함
//   const orderStatus = await newPage.$x(
//     `//a[contains(text(), "${csoNumber}")] /.. /.. //td[@class= "u-text-align-left u-color-alt" and contains(text(), "Received")]`,
//   );
//   if (orderStatus.length > 0) {
//     await setRandomDelay(newPage, 'Order Status is already "Received"');
//     const results = await CardinalInvoice.findOneAndUpdate(
//       { csoNumber },
//       {
//         csosReported: true,
//       },
//       { new: true, upsert: true },
//     )
//       .populate('item')
//       .catch((e) => console.log(e));

//     await newPage.close();
//     await new Promise((r) => setTimeout(r, 1000));
//     await clickHomeLink(page);

//     return res.send({ results });
//   }

//   await button.click();
//   // 딜레이 생략가능
//   await new Promise((r) => setTimeout(r, 3000));
//   await setRandomDelay(newPage, 'CSOS Report Found');

//   // 각 item 별로 value를 비교하고 동일한 경우 체크표시
//   for (let i = 0; i < item.length; i++) {
//     const cin = await findTextByXPath(
//       newPage,
//       '//td[@class= "u-text-align-left c_supplier_item_number"]',
//       i,
//     );

//     let receivedQty;
//     const _receivedQty = await newPage.$x(
//       '//td[@class= "u-text-align-right c_quantityreceived"] //input',
//     );
//     if (_receivedQty.length > 0) {
//       const _value = await (
//         await _receivedQty[i].getProperty('value')
//       ).jsonValue();
//       if (_value) {
//         receivedQty = _value;
//       }
//     }

//     let dateReceived;
//     const _dateReceived = await newPage.$x(
//       '//div[@class= "react-datepicker__input-container"] //input',
//     );
//     if (_dateReceived.length > 0) {
//       const _value = await (
//         await _dateReceived[i].getProperty('value')
//       ).jsonValue();
//       if (_value) {
//         dateReceived = _value;
//       }
//     }

//     const checkbox = await newPage.$x(
//       `//td[contains(text(), "${item[i].cin}")] /.. //td[@class= "u-noprint"] //input[@type= "checkbox"]`,
//     );
//     if (checkbox.length > 0) {
//       if (
//         cin === item[i].cin &&
//         receivedQty === item[i].qty &&
//         dateReceived === item[i].date
//       ) {
//         await checkbox[0].click();
//       }
//     }
//   }

//   const agreeCheckbox = await newPage.$x(
//     '//div[@class= "order-edit__controls  u-noprint"] //input[@type= "checkbox"]',
//   );
//   if (agreeCheckbox.length > 0) {
//     await agreeCheckbox[0].click();
//   }
//   await setRandomDelay(newPage, 'Data Matches Default Report Values');

//   const saveButton = await newPage.$x('//button[contains(text(), "Save")]');
//   if (saveButton.length > 0) {
//     await saveButton[0].click();
//   }
//   await setRandomDelay(newPage, 'Report Saved Successfully');

//   // TODO: 이하 페이지 종료후 홈화면 복귀는 중복코드이므로 cardinalPuppet 내부 메서드로 추가하여 사용하자.
//   const results = await CardinalInvoice.findOneAndUpdate(
//     { csoNumber },
//     {
//       isCSOSReported: true,
//     },
//     { new: true, upsert: true },
//   )
//     .populate('item')
//     .catch((e) => console.log(e));

//   await newPage.close();
//   await new Promise((r) => setTimeout(r, 1000));
//   await clickHomeLink(page);
//   return res.send({ results });
// };
// module.exports = manageCSOSReport;

const manageCSOSReport = async (req, res, next) => {
  const { browser, page, waitForOptions, xPaths, functions } =
    req.app.get('cardinalPuppet');
  const { item, poDate, shipDate, csoNumber } = req.body;
  await page.clickEl(xPaths.menu.orderHistory);
  await page.waitForNavigation(waitForOptions);
  const csosReportLink = await page.waitForElement(
    xPaths.orderHistory.manageCSOS,
  )[0];

  let newPage;
  while (true) {
    await csosReportLink.click();
    const pages = await browser.pages();
    newPage = pages[pages.length];
    await newPage.waitForPageRendering(15000);
    const utn = await newPage.$x(xPaths.csosReport.utn);
    if (utn.length > 0) {
      break;
    }
    await newPage.close();
  }

  const dateInput = await newPage.waitForElement(xPaths.csosReport.dateInput);
  await newPage.typeInputEl(poDate, dateInput[0]);
  await newPage.typeInputEl(shipDate, dateInput[1]);
};

module.exports = manageCSOSReport;
