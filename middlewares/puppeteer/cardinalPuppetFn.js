const axios = require('axios');
const dayjs = require('dayjs');
const fs = require('fs');
const Drug = require('../../schemas/drug');
const CardinalInvoice = require('../../schemas/cardinalInvoice');

const cardinalPuppetFn = function ({ waitForOptions, xPaths }) {
  return {
    async findInvoiceByShipDate(page, date) {
      const invoiceViewSelected = await page.$x(
        xPaths.orderHistory.invoiceViewSelected,
      );
      if (invoiceViewSelected.length === 0) {
        await (
          await page.$x(xPaths.orderHistory.invoiceViewSelector)
        )[0].select('last_thirty_days');
        await page.clickEl(xPaths.orderHistory.findInvoice);
        await page.waitForNavigation(waitForOptions);
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
            const next30DaysLink = await page.$x(
              xPaths.orderHistory.next30Days,
            );
            if (next30DaysLink.length > 0) {
              await next30DaysLink[0].click();
              await page.waitForNavigation(waitForOptions);
              await page.waitForPageRendering();
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
            const prev30DaysLink = await page.$x(
              xPaths.orderHistory.prev30Days,
            );
            if (prev30DaysLink.length > 0) {
              await prev30DaysLink[0].click();
              await page.waitForNavigation(waitForOptions);
              await page.waitForPageRendering();
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
    async findNewCINs(page) {
      const newCINs = [];
      const invoiceCINs = await page.findTexts(xPaths.invoiceDetail.cin);
      if (invoiceCINs.length > 0) {
        const results = await Promise.all(
          invoiceCINs.map(async (cin) => await Drug.findOne({ cin })),
        );
        results.forEach((result, i) => {
          if (!result) {
            newCINs.push(invoiceCINs[i]);
          }
        });
      }
      return newCINs;
    },
    async collectProductDetails(page) {
      const els = await page.waitForElements([
        xPaths.productDetails.tradeName,
        xPaths.productDetails.labelName,
        xPaths.productDetails.genericName,
        xPaths.productDetails.cin,
        xPaths.productDetails.ndc,
        xPaths.productDetails.upc,
        xPaths.productDetails.strength,
        xPaths.productDetails.form,
        xPaths.productDetails.packageQty,
        xPaths.productDetails.packageSize,
        xPaths.productDetails.unit,
        xPaths.productDetails.cardinalContract,
        xPaths.productDetails.cardinalStockStatus,
        xPaths.productDetails.cardinalQtyAvailable,
        xPaths.productDetails.cardinalCost,
        xPaths.productDetails.cardinalRetailPriceChanged,
        xPaths.productDetails.mfr,
        xPaths.productDetails.dist,
        xPaths.productDetails.productType,
        xPaths.productDetails.deaSchedule,
        xPaths.productDetails.abRating,
        xPaths.productDetails.returnPackaging,
        xPaths.productDetails.specialty,
      ]);
      const tradeName = els[0][0];
      const labelName = els[1][0];
      const genericName = els[2][0];
      const cin = els[3][0];
      const ndc = els[4][0];
      const upc = els[5][0];
      const strength = els[6][0];
      const form = els[7][0];
      const packageQty = els[8][0];
      const packageSize = els[9][0];
      const unit = els[10][0];
      const cardinalContract = els[11][0];
      const cardinalStockStatus = els[12][0];
      const cardinalQtyAvailable = els[13][0];
      const cardinalCost = els[14][0];
      const cardinalRetailPriceChanged = els[15][0];
      const mfr = els[16][0];
      const dist = els[17][0];
      const productType = els[18][0];
      const deaSchedule = els[19][0];
      const abRating = els[20][0];
      const returnPackaging = els[21][0];
      const specialty = els[22][0];

      const imgSrc = await (
        await (await page.$x(xPaths.productDetails.img))[0].getProperty('src')
      ).jsonValue();
      if (!/default_DETL.jpg$/.test(imgSrc)) {
        const imgResult = await axios.get(imgSrc, {
          responseType: 'arraybuffer',
        });
        fs.writeFileSync(`drugimg/${upc}.jpg`, imgResult.data);
      }
      await page.setRandomDelay(
        0,
        `collecting product[CIN: ${cin}] details [1/4]`,
      );
      const alternativesTab = await page.$x(
        xPaths.productDetails.alternativesTab,
      );

      await page.clickEl(alternativesTab[0]);
      let altCIN,
        altNDC,
        altTradeName,
        altStrength,
        altForm,
        altSize,
        altType,
        altCost,
        altContract = [];
      await page.waitForElement(xPaths.productDetails.altWarning);
      if ((await page.$x(xPaths.productDetails.noAlt)).length === 0) {
        const els = await page.waitForElements([
          xPaths.productDetails.altCIN,
          xPaths.productDetails.altNDC,
          xPaths.productDetails.altTradeName,
          xPaths.productDetails.altStrength,
          xPaths.productDetails.altForm,
          xPaths.productDetails.altSize,
          xPaths.productDetails.altType,
          xPaths.productDetails.altCost,
          xPaths.productDetails.altContract,
        ]);

        altCIN = els[0];
        altNDC = els[1];
        altTradeName = els[2];
        altStrength = els[3];
        altForm = els[4];
        altSize = els[5];
        altType = els[6];
        altCost = els[7];
        altContract = els[8];
      }
      await page.setRandomDelay(
        0,
        `collecting product[CIN: ${cin}] details [2/4]`,
      );
      const purchaseHistoryTab = await page.$x(
        xPaths.productDetails.purchaseHistoryTab,
      );

      await page.clickEl(purchaseHistoryTab[0]);
      let cardinalHistOrderDate,
        cardinalHistInvoiceDate,
        cardinalHistOrderQty,
        cardinalHistShipQty,
        cardinalHistUnitCost,
        cardinalHistTotalCost,
        cardinalHistInvoiceNum,
        cardinalHistOrderMethod,
        cardinalWACEffectiveDate,
        cardinalWAC,
        cardinalWACPercentChange = [];

      const viewSelector = await page.waitForElement(
        xPaths.productDetails.viewSelector,
      );

      if (viewSelector.length > 0) {
        if (
          (await page.$x(xPaths.productDetails.noPurchaseHist)).length === 0
        ) {
          await viewSelector[0].select('details');
          const els = await page.waitForElements([
            xPaths.productDetails.cardinalHistOrderDate,
            xPaths.productDetails.cardinalHistInvoiceDate,
            xPaths.productDetails.cardinalHistOrderQty,
            xPaths.productDetails.cardinalHistShipQty,
            xPaths.productDetails.cardinalHistUnitCost,
            xPaths.productDetails.cardinalHistTotalCost,
            xPaths.productDetails.cardinalHistInvoiceNum,
            xPaths.productDetails.cardinalHistOrderMethod,
          ]);
          cardinalHistOrderDate = els[0];
          cardinalHistInvoiceDate = els[1];
          cardinalHistOrderQty = els[2];
          cardinalHistShipQty = els[3];
          cardinalHistUnitCost = els[4];
          cardinalHistTotalCost = els[5];
          cardinalHistInvoiceNum = els[6];
          cardinalHistOrderMethod = els[7];
        }
        await page.setRandomDelay(
          0,
          `collecting product[CIN: ${cin}] details [3/4]`,
        );
        await viewSelector[0].select('WACHistory');
        const els = await page.waitForElements([
          xPaths.productDetails.wacEffectiveDate,
          xPaths.productDetails.wac,
          xPaths.productDetails.wacPercentChange,
        ]);
        cardinalWACEffectiveDate = els[0];
        cardinalWAC = els[1];
        cardinalWACPercentChange = els[2];
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
          cardinalWACEffectiveDate,
          cardinalWAC,
          cardinalWACPercentChange,
          dateLastUpdatedCardinal,
        },
        { new: true, upsert: true },
      ).catch((e) => console.log(e));
      await page.setRandomDelay(
        0,
        `updated product[CIN: ${cin}] details completely [4/4]`,
      );
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
      const orderDate = (
        await page.findTexts(xPaths.invoiceDetail.orderDate)
      )[0];
      const poNumber = (await page.findTexts(xPaths.invoiceDetail.poNumber))[0];
      const cin = await page.findTexts(xPaths.invoiceDetail.cin);
      const origQty = await page.findTexts(xPaths.invoiceDetail.origQty);
      const orderQty = await page.findTexts(xPaths.invoiceDetail.orderQty);
      const shipQty = await page.findTexts(xPaths.invoiceDetail.shipQty);
      const omitCode = await page.findTexts(xPaths.invoiceDetail.omitCode);
      const totalShipped = (
        await page.findTexts(xPaths.invoiceDetail.totalShipped)
      )[0];
      const totalAmount = (
        await page.findTexts(xPaths.invoiceDetail.totalAmount)
      )[0];
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
          totalShipped,
          totalAmount,
        },
        { new: true, upsert: true },
      )
        .populate('item')
        .catch((e) => console.log(e));
      await page.setRandomDelay(0, `updated invoice[${invoiceNumber}] details`);
      return result;
    },
  };
};

module.exports = cardinalPuppetFn;
