const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');

const Drug = require('../../schemas/drug');
const CardinalInvoice = require('../../schemas/cardinalInvoice');

const id = process.env.CARDINAL_USERNAME;
const password = process.env.CARDINAL_PASSWORD;
const url = 'https://orderexpress.cardinalhealth.com/';

const cardinalPuppet = async () => {
  const waitForOptions = { timeout: 0, waitUntil: 'networkidle0' };
  try {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    await page.goto(url, waitForOptions);

    // 랜덤 딜레이와 로그를 생성하는 함수
    const setRandomDelay = async (_page = page, msg = '') => {
      const setTime = await _page.evaluate(async () => {
        const randomTime = (Math.random() * 3 + 2).toFixed(3) * 1000;
        await new Promise((r) => setTimeout(r, randomTime));
        return randomTime;
      });
      console.log(`waitTime[${msg}]: `, setTime, ' ms');
      return setTime;
    };
    // XPath를 사용 해 element를 검색하고 첫번째 결과(혹은 두번째 인수로 전달 된 n번째 결과)의 텍스트를 반환하는 함수
    const findTextByXPath = async (_page = page, xPath, i = 0) => {
      const els = await _page.$x(xPath);
      if (els.length > 0) {
        const result = String(
          await (await els[i].getProperty('textContent')).jsonValue(),
        ).trim();
        return result;
      } else {
        console.log(`XPath: ${xPath} elements not found on the Page`);
        return els;
      }
    };
    // XPath를 사용 해 element를 검색하고 결과의 텍스트를 배열로 반환하는 함수
    const findTextsByXPath = async (_page = page, xPath) => {
      const els = await _page.$x(xPath);
      if (els.length > 0) {
        const results = await Promise.all(
          els.map(async (elHandle) =>
            String(
              await (await elHandle.getProperty('textContent')).jsonValue(),
            ).trim(),
          ),
        );
        return results;
      } else {
        console.log(`XPath: ${xPath} elements not found on the Page`);
        return els;
      }
    };

    // 첫번째 위치한 Home 링크를 클릭하는 함수
    const clickHomeLink = async (_page = page) => {
      const homeLink = await _page.$x("//a[contains(text(), 'Home')]");
      if (homeLink.length > 0) {
        await homeLink[0].click();
        await _page.waitForNavigation(waitForOptions);
        await setRandomDelay(_page, 'Cardinal Home Page');
      } else {
        throw new Error('Home Link not found');
      }
    };
    // 첫번째 위치한 Order History 링크를 클릭하는 함수
    const clickOrderHistoryLink = async (
      _page = page,
      initialize30Days = false,
    ) => {
      const orderHistoryLink = await _page.$x(
        "//a[contains(text(), 'Order History')]",
      );
      if (orderHistoryLink.length > 0) {
        await orderHistoryLink[0].click();
        await _page.waitForNavigation(waitForOptions);
        await setRandomDelay(_page, 'Cardinal Order History Page');
        if (initialize30Days) {
          const daySelector = await _page.$x(
            '//table[@class= "tableColHdrHome actionBarOrderHistory"] //td[@class= "selectDateTblCol2"] //select',
          );
          if (daySelector.length > 0) {
            const selected30Days = await _page.$x(
              '//table[@class= "tableColHdrHome actionBarOrderHistory"] //td[@class= "selectDateTblCol2"] //select //option[@selected= "selected" and @value="last_thirty_days"]',
            );
            if (selected30Days.length > 0) {
              return;
            }
            await daySelector[0].select('last_thirty_days');
            await setRandomDelay(_page, '30 Days Order History View Loaded');
          } else {
            throw new Error('Day select not found');
          }
          const findInvoicesButton = await _page.$x(
            '//table[@class= "tableColHdrHome actionBarOrderHistory"] //td[@class= "selectDateTblColInv3"] //input[@type="submit"]',
          );
          if (findInvoicesButton.length > 0) {
            await findInvoicesButton[0].click();
            await _page.waitForNavigation(waitForOptions);
            await setRandomDelay(_page, 'Find Invoice Button Pressed');
          }
        }
      } else {
        throw new Error('Order History Link not found');
      }
    };
    // 첫번째 위치한 Next 30 Days 링크를 클릭하는 함수
    const clickNext30DaysLink = async (_page = page) => {
      const next30DaysLink = await _page.$x(
        '//a[@class= "commandLink"] //span[contains(text(), "Next 30 Days>>")]',
      );
      if (next30DaysLink.length > 0) {
        await next30DaysLink[0].click();
        await _page.waitForNavigation(waitForOptions);
        await setRandomDelay(_page, 'Next 30 Days Invoices Loaded');
        return next30DaysLink[0];
      } else {
        console.log('Next 30 Days Link not found');
        return null;
      }
    };

    // targetDate와 같은 Ship Date의 InvoiceNumber들을 DB 검색 후 새로운 InvoiceNumber들을 반환
    const findNewInvoiceNumbers = async (_page = page, targetDate) => {
      let pageInvoiceNumbers = [];
      const newInvoiceNumbers = [];
      for (let i = 0; i < 13; i++) {
        const targetInvoiceNumbers = await findTextsByXPath(
          _page,
          `//td[@class= "colDateShort cahTableCellBorder"] //span[contains(text(), "${targetDate}")] /.. /.. //td[@class= "colSO cahTableCellBorder"] //a`,
        );

        if (targetInvoiceNumbers.length > 0) {
          pageInvoiceNumbers = [...new Set(targetInvoiceNumbers)];
          console.log('Invoice Numbers found on the page:', pageInvoiceNumbers);
          break;
        } else {
          const nextButton = await clickNext30DaysLink(_page);
          if (!nextButton) {
            console.log('End of Order History: No Invoice Found');
            return { pageInvoiceNumbers, newInvoiceNumbers };
          }
        }
      }
      if (pageInvoiceNumbers.length > 0) {
        const findResults = await Promise.all(
          pageInvoiceNumbers.map(
            async (invoiceNumber) =>
              await CardinalInvoice.findOne({
                invoiceNumber,
              }),
          ),
        );
        findResults.forEach((result, i) => {
          if (!result) {
            newInvoiceNumbers.push(pageInvoiceNumbers[i]);
          }
        });
        return { pageInvoiceNumbers, newInvoiceNumbers };
      }
    };
    // Invoice Detail 페이지에서 CIN들을 DB 검색 후 새로운 CIN들을 반환
    const findNewCINs = async (_page = page) => {
      const newCINs = [];
      const pageCINs = await findTextsByXPath(
        _page,
        '//td[@class= "columnLgCin cahTableCellBorder"] //a',
      );
      if (pageCINs.length > 0) {
        const findResults = await Promise.all(
          pageCINs.map(
            async (cin) =>
              await Drug.findOne({
                cin,
              }),
          ),
        );
        findResults.forEach((result, i) => {
          if (!result) {
            newCINs.push(pageCINs[i]);
          }
        });
        return { pageCINs, newCINs };
      } else {
        console.log('CINs not found');
        return { pageCINs, newCINs };
      }
    };

    // Product Details 페이지에서 정보를 수집하고 DB에 업데이트 합니다.
    const collectProductData = async (_page = page, targetCIN, from) => {
      switch (from) {
        case 'Invoice Detail':
          await (
            await _page.$x(
              `//td[@class= "columnLgCin cahTableCellBorder"] //a[contains(text(), "${targetCIN}")]`,
            )
          )[0].click();
          await _page.waitForNavigation(waitForOptions);
          break;
        default:
      }

      const labelName = await findTextByXPath(
        _page,
        '//table[@id= "table1Group"] //span[contains(text(), "FDB Label Name:")] /.. //span[@class= "outputText"]',
      );
      const genericName = await findTextByXPath(
        _page,
        '//table[@class= "prodInfoInnerBox"] //span[contains(text(), "Generic Name:")] /.. /.. //span[@class= "outputText"]',
      );
      const cin = (
        await findTextByXPath(
          _page,
          '//table[@class= "prodInfoInnerBox"] //span[contains(text(), "CIN:")] /.. /.. //span[@class= "outputText"]',
        )
      ).replace(/[^0-9]/g, '');
      const ndc = (
        await findTextByXPath(
          _page,
          '//table[@class= "prodInfoInnerBox"] //span[contains(text(), "NDC:")] /.. /.. //span[@class= "outputText"]',
        )
      ).replace(/[^0-9]/g, '');
      const upc = (
        await findTextByXPath(
          _page,
          '//table[@class= "prodInfoInnerBox"] //span[contains(text(), "UPC:")] /.. /.. //span[@class= "outputText"]',
        )
      ).replace(/[^0-9]/g, '');
      const strength = await findTextByXPath(
        _page,
        '//table[@class= "prodInfoInnerBox"] //span[contains(text(), "Strength:")] /.. /.. //span[@class= "outputText"]',
      );
      const form = await findTextByXPath(
        _page,
        '//table[@class= "prodInfoInnerBox"] //span[contains(text(), "Form:")] /.. /.. //span[@class= "outputText"]',
      );
      const packageQty = Number(
        await findTextByXPath(
          _page,
          '//table[@id= "table1Group"] //span[contains(text(), "Package Quantity:")] /.. //span[@class= "outputText"]',
        ),
      );
      const packageSize = Number(
        await findTextByXPath(
          _page,
          '//table[@id= "table1Group"] //span[contains(text(), "Package Size:")] /.. //span[@class= "outputText"]',
        ),
      );
      const unit = await findTextByXPath(
        _page,
        '//table[@id= "table1Group"] //span[contains(text(), "Unit of Measure:")] /.. //span[@class= "outputText"]',
      );
      const cardinalCost = Number(
        (
          await findTextByXPath(
            _page,
            '//span[contains(text(), "Invoice Cost:")] /.. /.. //span[@class= "invoiceCost"]',
          )
        ).replace(/[$,]/g, ''),
      );
      const cardinalRetailPriceChanged = await findTextByXPath(
        _page,
        '//span[contains(text(), "Retail Price Changed:")] /.. /.. //span[@class= "outputText"]',
      );
      const mfr = await findTextByXPath(
        _page,
        '//table[@id= "table1Group"] //span[contains(text(), "FDB Manuf/Dist Name:")] /.. //span[@class= "outputText"]',
      );
      const productType = await findTextByXPath(
        _page,
        '//table[@id= "table1Group"] //span[contains(text(), "Product Type:")] /.. //span[@class= "outputText"]',
      );
      const abRating = await findTextByXPath(
        _page,
        '//table[@id= "table1Group"] //span[contains(text(), "AB Rating:")] /.. //span[@class= "outputText"]',
      );
      const storage = await findTextByXPath(
        _page,
        '//table[@id= "table1Group"] //span[contains(text(), "Return Packaging:")] /.. /.. //span[@class= "outputText"]',
      );
      const specialty = await findTextByXPath(
        _page,
        '//table[@id= "table1Group"] //span[contains(text(), "Specialty:")] /.. /.. //span[@class= "outputText"]',
      );
      const imgSrc = await (
        await (
          await _page.$x('//table[@class= "mainPicBox"] //img')
        )[0].getProperty('src')
      ).jsonValue();
      if (!/default_DETL.jpg$/.test(imgSrc)) {
        const imgResult = await axios.get(imgSrc, {
          responseType: 'arraybuffer',
        });
        fs.writeFileSync(`drugimg/${cin}.jpg`, imgResult.data);
      }
      await setRandomDelay(
        _page,
        `Updateing Product Detail (CIN: ${targetCIN ?? cin})`,
      );

      // Purchase History Tab내 정보 수집
      await (
        await _page.$x(
          '//div[@class= "tabs"] //span[contains(text(), "Purchase History")]',
        )
      )[0].click();
      while (true) {
        await new Promise((r) => setTimeout(r, 5000));
        const purchaseHistoryFound = await _page.$x(
          '//td[@class= "dataTableColHistMonth cahTableCellBorder"]',
        );
        if (purchaseHistoryFound.length > 0) {
          break;
        }
      }
      let cardinalDateLastPurchased = '';
      let cardinalCostLastPurchase = 0;
      let purchaseHistoryDate = [];
      let purchaseHistoryShipQty = [];
      let purchaseHistoryTotalCost = [];
      const noPurchaseHistory = await page.$x(
        '//div[contains(text(), "No purchase history found")]',
      );
      if (noPurchaseHistory.length === 0) {
        cardinalDateLastPurchased = await findTextByXPath(
          _page,
          '//span[contains(text(), "Date last purchased:")] /.. /.. //span[@class= "outputText"]',
          0,
        );
        cardinalCostLastPurchase = Number(
          (
            await findTextByXPath(
              _page,
              '//span[contains(text(), "Cost of last purchase:")] /.. /.. //span[@class= "outputText"]',
              0,
            )
          ).replace(/[$,]/g, ''),
        );
        purchaseHistoryDate = (
          await findTextsByXPath(
            _page,
            '//td[@class= "dataTableColHistMonth cahTableCellBorder"] //span[@class= "outputText"]',
          )
        )
          .map((v, i, a) => (i % 2 === 0 ? `${v} ${a[i + 1]}` : ''))
          .filter((v) => v !== '');
        purchaseHistoryShipQty = (
          await findTextsByXPath(
            _page,
            '//td[@class= "dataTableColHistQty cahTableCellBorder"] //span[@class= "outputText"]',
          )
        ).map((v) => Number(v.replace(/[$,]/g, '')));
        purchaseHistoryTotalCost = (
          await findTextsByXPath(
            _page,
            '//td[@class= "dataTableColHistCost cahTableCellBorder"] //span[@class= "outputText"]',
          )
        ).map((v) => Number(v.replace(/[$,]/g, '')));
      }
      const dateLastUpdatedCardinal = new Date(Date.now());
      const result = await Drug.findOneAndUpdate(
        { cin, ndc, upc },
        {
          labelName,
          genericName,
          strength,
          form,
          packageQty,
          packageSize,
          unit,
          cardinalCost,
          cardinalRetailPriceChanged,
          mfr,
          productType,
          abRating,
          storage,
          specialty,
          cardinalDateLastPurchased,
          cardinalCostLastPurchase,
          purchaseHistoryDate,
          purchaseHistoryShipQty,
          purchaseHistoryTotalCost,
          dateLastUpdatedCardinal,
        },
        { new: true, upsert: true },
      ).catch((e) => console.log(e));

      switch (from) {
        case 'Invoice Detail':
          await (
            await _page.$x("//span[contains(text(), 'Invoice Detail')]")
          )[0].click();
          break;
        default:
      }
      await _page.waitForNavigation(waitForOptions);
      await setRandomDelay(
        _page,
        `Updated Product Detail (CIN: ${targetCIN ?? cin}) Successfully`,
      );
      return result;
    };

    // Order History 페이지에서 Invoice Number 링크를 클릭하고 Invoice Detail 화면 내 정보를 CardinalInvoice DB에 추가합니다.
    const collectInvoiceData = async (_page = page, _invoiceNumber, from) => {
      switch (from) {
        case 'Order History':
          await _page
            .$x(
              `//td[@class= "colSO cahTableCellBorder"] //a[contains(text(), '${_invoiceNumber}')]`,
            )[0]
            .click();
          await _page.waitForNavigation(waitForOptions);
          break;
        default:
      }

      const invoiceNumber =
        _invoiceNumber ??
        (await findTextByXPath(
          _page,
          '//span[contains(text(), "Invoice #:") /.. /.. //td[@class= "topPanelGridColumnTwo"] //span[@class= "outputText"]',
        ));
      const _invoiceDate = await findTextByXPath(
        _page,
        '//td[@class= "topPanelGridColumnTwo"] //span',
        1,
      );
      const invoiceDate = new Date(
        _invoiceDate.substring(0, _invoiceDate.indexOf(' ')),
      );

      let invoiceType;
      const poNumber = await findTextByXPath(
        _page,
        '//span[contains(text(), "PO #:")] /.. /.. //td[@class= "topPanelGridColumnTwoSmall"] //span[@class= "outputText"]',
      );
      let csoNumber = '';
      const classCol = await _page.$x(
        '//th[@class= "dataTableBorder"] //span[contains(text(), "Class")]',
      );
      let cost;

      if (classCol.length === 0) {
        invoiceType = 'RX';
        cost = await findTextsByXPath(
          _page,
          '//td[@class= "columnLgSmall cahTableCellBorder"]',
        );
      } else {
        cost = (
          await findTextsByXPath(
            _page,
            '//td[@class= "columnLgPrice_right cahTableCellBorder"]',
          )
        )
          .filter((v, i) => i % 2 === 0)
          .map((v) => Number(v.replace(/[$,]/g, '')));
        const itemClass = await findTextsByXPath(
          _page,
          '//td[@class= "columnLgSmall cahTableCellBorder"]',
        );

        switch (true) {
          case itemClass.includes('C2') && poNumber !== '':
            invoiceType = 'C2';
            csoNumber = poNumber;
            break;
          case itemClass.includes('C3') ||
            itemClass.includes('C4') ||
            itemClass.includes('C5'):
            invoiceType = 'CONTROL';
            break;
          case itemClass.includes('HBC') || itemClass.includes('OTHER'):
            invoiceType = 'OTC';
            break;
          default:
        }
      }

      const itemCINs = await findTextsByXPath(
        _page,
        '//td[@class= "columnLgCin cahTableCellBorder"] //a',
      );

      const item = await Promise.all(
        itemCINs.map(
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
      const orderQty = (
        await findTextsByXPath(
          _page,
          '//td[@class= "columnLgQty cahTableCellBorder"] //span',
        )
      ).map((v) => Number(v));
      const shipQty = (
        await findTextsByXPath(
          _page,
          '//td[@class= "columnLgShipQty cahTableCellBorder"] //span',
        )
      ).map((v) => Number(v));

      const result = await CardinalInvoice.findOneAndUpdate(
        { invoiceNumber },
        {
          invoiceDate,
          invoiceType,
          csoNumber,
          item,
          cost,
          orderQty,
          shipQty,
        },
        { new: true, upsert: true },
      ).catch((e) => console.log(e));

      switch (from) {
        case 'Order History':
          await clickOrderHistoryLink(_page);
          break;
        default:
      }

      await setRandomDelay(
        _page,
        `${invoiceNumber} data collection successful`,
      );
      return result;
    };

    await page.type('input[id="okta-signin-username"]', id);
    await page.type('input[id="okta-signin-password"]', password);
    await page.click('input[id="okta-signin-submit"]');
    while (true) {
      await new Promise((r) => setTimeout(r, 10000));
      const userInfo = await page.$x('//div[@id ="userInfo"]');
      if (userInfo.length > 0) {
        break;
      }
    }
    await setRandomDelay(page, 'Cardinal Log In Successful');
    return {
      waitForOptions,
      setRandomDelay,
      findTextByXPath,
      findTextsByXPath,
      clickHomeLink,
      clickOrderHistoryLink,
      findNewInvoiceNumbers,
      findNewCINs,
      collectProductData,
      collectInvoiceData,
      page,
      browser,
    };
  } catch (e) {
    console.log(e);
  }
};

module.exports = cardinalPuppet;
