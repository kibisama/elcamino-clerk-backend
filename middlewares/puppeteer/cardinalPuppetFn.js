const axios = require('axios');
const dayjs = require('dayjs');
const fs = require('fs');
const Drug = require('../../schemas/drug');
const CardinalInvoice = require('../../schemas/cardinalInvoice');
const xPaths = require('./cardinalXPaths');

const cardinalPuppetFn = {
  async findInvoiceByShipDate(page, date) {
    const invoiceViewSelected = await page.$x(
      xPaths.orderHistory.invoiceViewSelected,
    );
    if (invoiceViewSelected.length === 0) {
      await (
        await page.$x(xPaths.orderHistory.invoiceViewSelector)
      )[0].select('last_thirty_days');
      await page.clickEl(xPaths.orderHistory.findInvoice);
      await page.waitForPageRendering(3000);
      await page.waitForElement(xPaths.orderHistory.either30Days);
    }
    const shipDate = dayjs(date);
    let invoiceNumbers = [];
    while (true) {
      const _invoiceNumbers = await page.findTexts(
        `//td[@class= "colDateShort cahTableCellBorder"] //span[contains(text(), "${date}")] /.. /.. //td[@class= "colSO cahTableCellBorder"] //a`,
      );
      if (_invoiceNumbers.length === 0) {
        const someShipDate = (
          await page.findTexts(xPaths.orderHistory.shipDate)
        )[0];
        if (shipDate.isBefore(dayjs(someShipDate), 'day')) {
          const next30DaysLink = await page.$x(xPaths.orderHistory.next30Days);
          if (next30DaysLink.length > 0) {
            await next30DaysLink[0].click();
            await page.waitForPageRendering(3000);
            await page.setRandomDelay(
              0,
              `searching for invoice numbers next 30 days[shipDate: ${date}]...`,
            );
          } else {
            await page.setRandomDelay(
              0,
              `End of searching invoice[shipDate: ${date}]`,
            );
            break;
          }
        } else {
          const prev30DaysLink = await page.$x(xPaths.orderHistory.prev30Days);
          if (prev30DaysLink.length > 0) {
            await prev30DaysLink[0].click();
            await page.waitForPageRendering(3000);
            await page.setRandomDelay(
              0,
              `searching for invoice numbers previous 30 days[shipDate: ${date}]...`,
            );
          } else {
            await page.setRandomDelay(
              0,
              `End of searching invoice[shipDate: ${date}]`,
            );
            break;
          }
        }
      } else {
        invoiceNumbers = [...new Set(_invoiceNumbers)];
        break;
      }
    }
    return invoiceNumbers;
  },
  async collectProductDetails(page) {
    const tradeName = (
      await page.findTexts(xPaths.productDetails.tradeName)
    )[0];
    const labelName = (
      await page.findTexts(xPaths.productDetails.labelName)
    )[0];
    const genericName = (
      await page.findTexts(xPaths.productDetails.genericName)
    )[0];
    const cin = (await page.findTexts(xPaths.productDetails.cin))[0];
    const ndc = (await page.findTexts(xPaths.productDetails.ndc))[0];
    const upc = (await page.findTexts(xPaths.productDetails.upc))[0];
    const strength = (await page.findTexts(xPaths.productDetails.strength))[0];
    const form = (await page.findTexts(xPaths.productDetails.form))[0];
    const packageQty = (
      await page.findTexts(xPaths.productDetails.packageQty)
    )[0];
    const packageSize = (
      await page.findTexts(xPaths.productDetails.packageSize)
    )[0];
    const unit = (await page.findTexts(xPaths.productDetails.unit))[0];
    const cardinalContract = (
      await page.findTexts(xPaths.productDetails.cardinalContract)
    )[0];
    const cardinalStockStatus = (
      await page.findTexts(xPaths.productDetails.cardinalStockStatus)
    )[0];
    const cardinalQtyAvailable = (
      await page.findTexts(xPaths.productDetails.cardinalQtyAvailable)
    )[0];
    const cardinalCost = (
      await page.findTexts(xPaths.productDetails.cardinalCost)
    )[0];
    const cardinalRetailPriceChanged = (
      await page.findTexts(xPaths.productDetails.cardinalRetailPriceChanged)
    )[0];
    const mfr = (await page.findTexts(xPaths.productDetails.mfr))[0];
    const dist = (await page.findTexts(xPaths.productDetails.dist))[0];
    const productType = (
      await page.findTexts(xPaths.productDetails.productType)
    )[0];
    const deaSchedule = (
      await page.findTexts(xPaths.productDetails.deaSchedule)
    )[0];
    const abRating = (await page.findTexts(xPaths.productDetails.abRating))[0];
    const returnPackaging = (
      await page.findTexts(xPaths.productDetails.returnPackaging)
    )[0];
    const specialty = (
      await page.findTexts(xPaths.productDetails.specialty)
    )[0];
    const imgSrc = await (
      await (await page.$x(xPaths.productDetails.img))[0].getProperty('src')
    ).jsonValue();
    if (!/default_DETL.jpg$/.test(imgSrc)) {
      const imgResult = await axios.get(imgSrc, {
        responseType: 'arraybuffer',
      });
      fs.writeFileSync(`drugimg/${upc}.jpg`, imgResult.data);
    }
    await page.setRandomDelay(0, `copying product[CIN: ${cin}] details [1/3]`);
    const alternativesTab = await page.$x(
      xPaths.productDetails.alternativesTab,
    );

    await page.clickEl(alternativesTab[0]);
    await page.waitForElement(xPaths.productDetails.altWarning);
    let altCIN,
      altNDC,
      altTradeName,
      altStrength,
      altForm,
      altSize,
      altType,
      altCost,
      altContract = [];
    if ((await page.$x(xPaths.productDetails.noAlt)).length === 0) {
      altCIN = await page.findTexts(xPaths.productDetails.altCIN);
      altNDC = await page.findTexts(xPaths.productDetails.altNDC);
      altTradeName = await page.findTexts(xPaths.productDetails.altTradeName);
      altStrength = await page.findTexts(xPaths.productDetails.altStrength);
      altForm = await page.findTexts(xPaths.productDetails.altForm);
      altSize = await page.findTexts(xPaths.productDetails.altSize);
      altType = await page.findTexts(xPaths.productDetails.altType);
      altCost = await page.findTexts(xPaths.productDetails.altCost);
      altContract = await page.findTexts(xPaths.productDetails.altContract);
    }
    await page.setRandomDelay(0, `copying product[CIN: ${cin}] details [2/3]`);
    const purchaseHistoryTab = await page.$x(
      xPaths.productDetails.purchaseHistoryTab,
    );

    await page.clickEl(purchaseHistoryTab[0]);
    await page.waitForElement(xPaths.productDetails.purchaseHistSumTable);
    let cardinalHistOrderDate,
      cardinalHistInvoiceDate,
      cardinalHistOrderQty,
      cardinalHistShipQty,
      cardinalHistUnitCost,
      cardinalHistTotalCost,
      cardinalHistInvoiceNum,
      cardinalHistOrderMethod = [];
    if ((await page.$x(xPaths.productDetails.noPurchaseHist)).length === 0) {
      const viewSelector = await page.$x(xPaths.productDetails.viewSelector);
      if (viewSelector.length > 0) {
        await viewSelector[0].select('details');
      }
      await page.waitForElement(
        xPaths.productDetails.purchaseHistDetailedTable,
      );
      cardinalHistOrderDate = await page.findTexts(
        xPaths.productDetails.cardinalHistOrderDate,
      );
      cardinalHistInvoiceDate = await page.findTexts(
        xPaths.productDetails.cardinalHistInvoiceDate,
      );
      cardinalHistOrderQty = await page.findTexts(
        xPaths.productDetails.cardinalHistOrderQty,
      );
      cardinalHistShipQty = await page.findTexts(
        xPaths.productDetails.cardinalHistShipQty,
      );
      cardinalHistUnitCost = await page.findTexts(
        xPaths.productDetails.cardinalHistUnitCost,
      );
      cardinalHistTotalCost = await page.findTexts(
        xPaths.productDetails.cardinalHistTotalCost,
      );
      cardinalHistInvoiceNum = await page.findTexts(
        xPaths.productDetails.cardinalHistInvoiceNum,
      );
      cardinalHistOrderMethod = await page.findTexts(
        xPaths.productDetails.cardinalHistOrderMethod,
      );
    }
    const dateLastUpdatedCardinal = new Date(Date.now());
    const result = await Drug.findOneAndUpdate(
      { upc },
      {
        tradeName,
        labelName,
        genericName,
        cin,
        ndc,
        strength,
        form,
        packageQty,
        packageSize,
        unit,
        cardinalContract,
        cardinalStockStatus,
        cardinalQtyAvailable,
        cardinalCost,
        cardinalRetailPriceChanged,
        mfr,
        dist,
        productType,
        deaSchedule,
        abRating,
        returnPackaging,
        specialty,
        altCIN,
        altNDC,
        altTradeName,
        altStrength,
        altForm,
        altSize,
        altType,
        altCost,
        altContract,
        cardinalHistOrderDate,
        cardinalHistInvoiceDate,
        cardinalHistOrderQty,
        cardinalHistShipQty,
        cardinalHistUnitCost,
        cardinalHistTotalCost,
        cardinalHistInvoiceNum,
        cardinalHistOrderMethod,
        dateLastUpdatedCardinal,
      },
      { new: true, upsert: true },
    ).catch((e) => console.log(e));
    await page.setRandomDelay(0, `copying product[CIN: ${cin}] details [3/3]`);
    return result;
  },
  async collectInvoiceDetail(page) {
    const invoiceNumber = (
      await page.findTexts(xPaths.invoiceDetail.invoiceNumber)
    )[0];
    const invoiceDate = (
      await page.findTexts(xPaths.invoiceDetail.invoiceDate)
    )[0];
    const orderNumber = (
      await page.findTexts(xPaths.invoiceDetail.orderNumber)
    )[0];
    const orderDate = (await page.findTexts(xPaths.invoiceDetail.orderDate))[0];
    const poNumber = (await page.findTexts(xPaths.invoiceDetail.poNumber))[0];
    const cin = await page.findTexts(xPaths.invoiceDetail.cin);
    const origQty = await page.findTexts(xPaths.invoiceDetail.origQty);
    const orderQty = await page.findTexts(xPaths.invoiceDetail.orderQty);
    const shipQty = await page.findTexts(xPaths.invoiceDetail.shipQty);
    const omitCode = await page.findTexts(xPaths.invoiceDetail.omitCode);
    let cost,
      confirmNumber = [];
    let invoiceType = '';
    if ((await page.$x(xPaths.invoiceDetail.classCol)).length > 0) {
      cost = await page.findTexts(xPaths.invoiceDetail.costWithClassCol);
      confirmNumber = await page.findTexts(
        xPaths.invoiceDetail.confirmNumberWithClassCol,
      );
      const itemClass = await page.findTexts(
        xPaths.invoiceDetail.costWithNoClassCol,
      );
      switch (true) {
        case itemClass.includes('C2') && poNumber !== '':
          invoiceType = 'C2';
          break;
        case itemClass.includes('C3') ||
          itemClass.includes('C4') ||
          itemClass.includes('C5'):
          invoiceType = 'control';
          break;
        case itemClass.includes('Rx'):
          invoiceType = 'Rx';
          break;
        case itemClass.includes('HBC') || itemClass.includes('OTHER'):
          invoiceType = 'other';
          break;
        default:
      }
    } else {
      cost = await page.findTexts(xPaths.invoiceDetail.costWithNoClassCol);
      confirmNumber = await page.findTexts(
        xPaths.invoiceDetail.confirmNumberWithNoClassCol,
      );
    }

    const item = await Promise.all(
      cin.map(
        async (cin) =>
          (
            await Drug.findOne({
              cin,
            })
          )._id,
      ),
    );
    if (item.includes(null)) {
      throw new Error('Item CIN not found in DB');
    }
    const result = await CardinalInvoice.findOneAndUpdate(
      { invoiceNumber },
      {
        invoiceDate,
        orderNumber,
        orderDate,
        poNumber,
        invoiceType,
        item,
        origQty,
        orderQty,
        shipQty,
        omitCode,
        cost,
        confirmNumber,
      },
      { new: true, upsert: true },
    )
      .populate('item')
      .catch((e) => console.log(e));
    await page.setRandomDelay(0, `copied invoice[${invoiceNumber}] details`);
    return result;
  },
};

module.exports = cardinalPuppetFn;
