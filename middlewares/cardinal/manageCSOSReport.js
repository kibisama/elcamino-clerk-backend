const CardinalInvoice = require('../../schemas/cardinalInvoice');

const manageCSOSReport = async (req, res, next) => {
  const { browser, page, waitForOptions, xPaths, functions } =
    req.app.get('cardinalPuppet');
  const { item, poDate, shipDate, poNumber } = req.body;
  await page.clickEl(xPaths.menu.orderHistory);
  await page.waitForNavigation(waitForOptions);
  const manageCSOSLink = (await page.$x(xPaths.orderHistory.manageCSOS))[0];

  let newPage;
  while (true) {
    await manageCSOSLink.click();
    await new Promise((r) => setTimeout(r, 15000));
    const pages = await browser.pages();
    newPage = pages[pages.length - 1];
    await newPage.waitForPageRendering();
    const utn = await newPage.$x(xPaths.csosReport.utn);
    if (utn.length > 0) {
      break;
    }
    await newPage.close();
  }

  const dateInput = await newPage.waitForElement(xPaths.csosReport.dateInput);
  await newPage.typeInputEl(poDate, dateInput[0]);
  await newPage.typeInputEl(shipDate, dateInput[1]);
  await (
    await newPage.$x(xPaths.csosReport.updateRangeButton)
  )[0].click({ clickCount: 2 });
  await newPage.waitForPageRendering(5000);
  const targetLinkXPath = `//a[contains(text(), "${poNumber}")]`;
  await newPage.waitForElement(targetLinkXPath);

  const orderStatus = await newPage.$x(
    `//a[contains(text(), "${poNumber}")] /.. /.. //td[contains(text(), "Received") and @class= "u-text-align-left  u-color-alt"]`,
  );

  const respond = async () => {
    await CardinalInvoice.findOneAndUpdate(
      { poNumber },
      {
        isCSOSReported: true,
      },
      { new: true, upsert: true },
    ).catch((e) => console.log(e));
    const results = await CardinalInvoice.find({
      invoiceDate: shipDate,
    }).populate('item');
    await newPage.close();
    await new Promise((r) => setTimeout(r, 1000));
    await page.clickEl(xPaths.menu.home);
    await page.waitForPageRendering(3000);
    return results;
  };
  if (orderStatus.length > 0) {
    await newPage.setRandomDelay(
      0,
      `Order Status[CSO#: ${poNumber}] is already "Received"`,
    );
    const result = await respond();
    res.send(result);
  }
  const targetLink = (await newPage.$x(targetLinkXPath))[0];
  await targetLink.click();
  await newPage.waitForPageRendering(3000);

  // 각 item 별로 value를 비교하고 동일한 경우 체크표시
  for (let i = 0; i < item.length; i++) {
    const cin = (await newPage.waitForElement(xPaths.csosReport.cin))[i];

    let receivedQty;
    const _receivedQty = await newPage.$x(xPaths.csosReport.inputReceivedQty);
    if (_receivedQty.length > 0) {
      const value = await (
        await _receivedQty[i].getProperty('value')
      ).jsonValue();
      if (value) {
        receivedQty = value;
      }
    }
    let dateReceived;
    const _dateReceived = await newPage.$x(xPaths.csosReport.inputDateReceived);
    if (_dateReceived.length > 0) {
      const value = await (
        await _dateReceived[i].getProperty('value')
      ).jsonValue();
      if (value) {
        dateReceived = value;
      }
    }

    const checkbox = await newPage.$x(
      `//td[contains(text(), "${item[i].cin}")] /.. //td[@class= "u-noprint"] //input[@type= "checkbox"]`,
    );

    if (checkbox.length > 0) {
      if (
        cin === item[i].cin &&
        receivedQty === item[i].qty &&
        dateReceived === item[i].date
      ) {
        console.log('checkboxclicked');
        await checkbox[0].click();
        await newPage.setRandomDelay(
          0,
          `Our received data[CIN: ${item[i].cin}] match with the report default`,
        );
      }
    }
  }
  await newPage.clickEl(xPaths.csosReport.agreeCheckbox);
  await newPage.setRandomDelay(0, 'Saving Report ...');

  // TODO: 데이터와 보고서 값이 다를 경우 보류
  await newPage.clickEl(xPaths.csosReport.saveButton);
  const saveMsg = await newPage.waitForElement(xPaths.csosReport.saveMsg);
  if (saveMsg) {
    await newPage.setRandomDelay(0, 'CSOS Report Saved Successfully');
    const result = await respond();
    res.send(result);
  } else {
    console.error('CSOS Report not saved');
  }
};

module.exports = manageCSOSReport;
