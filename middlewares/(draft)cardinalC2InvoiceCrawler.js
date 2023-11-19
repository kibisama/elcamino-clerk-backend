const puppeteer = require('puppeteer');
const { CardinalC2Invoice } = require('../models/cardinalC2Invoice');

const crawler1 = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    const url = 'https://orderexpress.cardinalhealth.com/';
    await page.goto(url, { waitUntil: 'networkidle0' });

    // 랜덤 딜레이와 로그를 생성하는 함수
    const setRandomDelay = async (msg = '') => {
      const setTime = await page.evaluate(async () => {
        const randomTime = (Math.random() * 3 + 3).toFixed(3) * 1000;
        await new Promise((r) => setTimeout(r, randomTime));
        return randomTime;
      });
      console.log(`waitTime[${msg}]: `, setTime, ' ms');
      return setTime;
    };
    // XPath를 사용 해 element를 검색하고 첫번째 결과(혹은 두번째 인수 값)의 텍스트를 반환하는 함수
    const findTextByXPath = async (xPath, i = 0) => {
      const els = await page.$x(xPath);
      if (els.length > 0) {
        const result = String(
          await (await els[i].getProperty('textContent')).jsonValue(),
        ).trim();
        return result;
      } else {
        throw new Error(`${xPath} not found on the Page`);
      }
    };
    // XPath를 사용 해 element를 검색하고 결과의 텍스트를 배열로 반환하는 함수
    const findTextsByXPath = async (xPath) => {
      const els = await page.$x(xPath);
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
        throw new Error(`${xPath} not found on the Page`);
      }
    };

    // 첫번째 위치한 Order History 링크를 클릭하는 함수
    const clickOrderHistoryLink = async () => {
      const orderHistoryLink = await page.$x(
        "//a[contains(text(), 'Order History')]",
      );
      if (orderHistoryLink.length > 0) {
        await orderHistoryLink[0].click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await setRandomDelay('Order History Page');
      } else {
        throw new Error('Order History Link not found');
      }
    };
    // 첫번째 위치한 Next 30 Days 링크를 클릭하는 함수
    const clickNext30DaysLink = async () => {
      const next30DaysLink = await page.$x(
        '//a[@class= "commandLink"] //span[contains(text(), "Next 30 Days>>")]',
      );
      if (next30DaysLink.length > 0) {
        await next30DaysLink[0].click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await setRandomDelay('Next 30 Days Invoices Loaded');
        return next30DaysLink[0];
      } else {
        console.log('Next 30 Days Link not found');
        return null;
      }
    };

    // 페이지에 표시된 CSONumber와 DB에 저장되지 않은 CSONumber를 객체에 저장하여 반환 하는 함수
    const findNewCSONumbers = async () => {
      const results = await findTextsByXPath(
        '//td[@class= "colTotal cahTableCellBorder"] //td[@class = "poNumber"] //span[@class ="outputText"]',
      );
      const pageCSONumbers = [...new Set(results)];
      pageCSONumbers.splice(pageCSONumbers.indexOf(''), 1);
      console.log('CSONumbers found on the page:', pageCSONumbers);

      if (pageCSONumbers.length > 0) {
        const results = await Promise.all(
          pageCSONumbers.map(
            async (csoNumber) =>
              await CardinalC2Invoice.findOne({
                attributes: ['csoNumber'],
                where: {
                  csoNumber,
                },
              }),
          ),
        );
        const newCSONumbers = [];
        results.forEach((result, i) => {
          if (!result) {
            newCSONumbers.push(pageCSONumbers[i]);
          }
        });
        console.log('CSONumbers not saved in DB:', newCSONumbers);
        return { pageCSONumbers, newCSONumbers };
      }
    };

    // 인수로 전달받은 CSO#를 포함한 데이터 테이블 row의 invoice# 링크를 클릭하고 정보를 수집해 DB에 저장합니다.
    const clickInvoiceNumberAndCollectData = async (csoNumber) => {
      const invoiceLink = await page.$x(
        `//td[@class= "colTotal cahTableCellBorder"] //span[contains(text(), '${csoNumber}')] /.. /.. /.. /.. /.. /.. /.. //td[@class= "colSO cahTableCellBorder"] //a`,
      );
      if (invoiceLink.length > 0) {
        await invoiceLink[0].click();
        await page.waitForNavigation();
        await setRandomDelay(`Entered ${csoNumber} Invoice Detail page`);
        const invoiceNumber = await findTextByXPath(
          '//td[@class= "topPanelGridColumnTwo"] //span',
        );
        const _invoiceDate = await findTextByXPath(
          '//td[@class= "topPanelGridColumnTwo"] //span',
          1,
        );
        const invoiceDate = new Date(
          _invoiceDate.substring(0, _invoiceDate.indexOf(' ')),
        );
        const orderNumber = await findTextByXPath(
          '//td[@class= "topPanelGridColumnTwoSmall"] //span',
        );
        const _orderDate = await findTextByXPath(
          '//td[@class= "topPanelGridColumnTwoSmall"] //span',
          1,
        );
        const orderDate = new Date(
          _orderDate.substring(0, _orderDate.indexOf(' ')),
        );
        let ndcNumberArr = await findTextsByXPath(
          '//td[@class= "columnLgFirstTableNdc cahTableCellBorder"] //div',
        );
        ndcNumberArr = ndcNumberArr.map((ndc) => ndc.replace(/\D/g, ''));
        const tradeNameArr = await findTextsByXPath(
          '//td[@class= "columnLgGeneric cahTableCellBorder"] //a',
        );
        const mfrNameArr = await findTextsByXPath(
          '//td[@class= "columnLgFirstTrade cahTableCellBorder"] //div',
        );
        const strengthArr = await findTextsByXPath(
          '//td[@class= "columnLgMfr cahTableCellBorder"] //div',
        );
        const formArr = await findTextsByXPath(
          '//td[@class= "columnLgSize cahTableCellBorder"]',
        );
        const sizeArr = await findTextsByXPath(
          '//td[@class= "columnLgForm cahTableCellBorder"] //div',
        );
        const orderQtyArr = await findTextsByXPath(
          '//td[@class= "columnLgQty cahTableCellBorder"] //span',
        );
        const shipQtyArr = await findTextsByXPath(
          '//td[@class= "columnLgShipQty cahTableCellBorder"] //span',
        );
        if (shipQtyArr.length > 0) {
          const results = await Promise.all(
            shipQtyArr.map(
              async (v, i) =>
                await CardinalC2Invoice.create({
                  csoNumber,
                  orderNumber,
                  orderDate,
                  invoiceNumber,
                  invoiceDate,
                  ndcNumber: ndcNumberArr[i],
                  tradeName: tradeNameArr[i],
                  mfrName: mfrNameArr[i],
                  strength: strengthArr[i],
                  form: formArr[i],
                  size: sizeArr[i],
                  orderQty: orderQtyArr[i],
                  shipQty: shipQtyArr[i],
                }),
            ),
          );
          await clickOrderHistoryLink();
          await setRandomDelay(`${csoNumber} data collection successful`);
          return results;
        }
      } else {
        throw new Error('Invoice# Link not found on the Page');
      }
    };

    // 로그인
    const id = process.env.CARDINAL_USERNAME;
    const password = process.env.CARDINAL_PASSWORD;
    await page.type('input[id="okta-signin-username"]', id);
    await page.type('input[id="okta-signin-password"]', password);
    await page.click('input[id="okta-signin-submit"]');
    await new Promise((r) => setTimeout(r, 10000));
    await setRandomDelay('Home Page');

    // Order History 페이지 로드
    await clickOrderHistoryLink();

    // 30 Days+ 선택 후 페이지 로드
    const daySelector = await page.$x(
      '//table[@class= "tableColHdrHome actionBarOrderHistory"] //td[@class= "selectDateTblCol2"] //select',
    );
    if (daySelector.length > 0) {
      await daySelector[0].select('last_thirty_days');
      await setRandomDelay('30+ Days selected');
    } else {
      throw new Error('Day select not found');
    }
    const findInvoicesButton = await page.$x(
      '//table[@class= "tableColHdrHome actionBarOrderHistory"] //td[@class= "selectDateTblColInv3"] //input[@type="submit"]',
    );
    if (findInvoicesButton.length > 0) {
      await findInvoicesButton[0].click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await setRandomDelay('Find Invoice Button Pressed');
    }

    // 페이지에 표시된 CSONumber와 DB에 없는 CSONumber를 찾아 변수로 할당 합니다.
    for (let i = 0; i < 3; i++) {
      const { pageCSONumbers, newCSONumbers } = await findNewCSONumbers();
      for (const csoNumber of newCSONumbers) {
        await clickInvoiceNumberAndCollectData(csoNumber);
      }
      const nextButton = await clickNext30DaysLink();
      if (!nextButton) {
        console.log('End of Order History');
        break;
      }
    }
  } catch (e) {
    console.log(e);
  }
};
crawler1();
