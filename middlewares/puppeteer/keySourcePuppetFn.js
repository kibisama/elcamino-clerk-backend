const Drug = require('../../schemas/drug');

const keySourcePuppetFn = function ({ waitForOptions, xPaths }) {
  return {
    // async collectCostData(page, ndc, altNDC) {
    //   let smartSourceCost = '';
    //   let smartSourceAltCost = [];
    //   const searchBar = await page.$x(xPaths.menu.searchBar);
    //   if (searchBar.length > 0) {
    //     await page.typeInputEl(ndc, searchBar[0]);
    //     await page.waitForNavigation(waitForOptions);
    //     const results = await page.waitForElement(
    //       xPaths.catalogSearch.ndcSearchResult,
    //     );
    //     if (results.length > 0) {
    //       smartSourceCost =
    //         (await page.findTexts(xPaths.catalogSearch.acqCost))[0] ?? '';
    //       await page.setRandomDelay(0, `copied SmartSource Cost[NDC: ${ndc}]`);
    //     }
    //     if (altNDC.length > 0) {
    //       for (let i = 0; i < altNDC.length; i++) {
    //         const searchBar = await page.$x(xPaths.menu.searchBar);
    //         if (searchBar.length > 0) {
    //           await page.typeInputEl(altNDC[i], searchBar[0]);
    //           await page.waitForElement(
    //             `//div[@class= "results-wrapper"] //span[@class= "term" and contains(text(), "${altNDC[i]}")]`,
    //           );
    //           const results = await page.waitForElement(
    //             xPaths.catalogSearch.ndcSearchResult,
    //           );
    //           if (results.length > 0) {
    //             smartSourceAltCost.push(
    //               (await page.findTexts(xPaths.catalogSearch.acqCost))[0] ?? '',
    //             );
    //             await page.setRandomDelay(
    //               0,
    //               `collecting SmartSource AltCost[NDC: ${ndc}] [${i + 1}/${
    //                 altNDC.length
    //               }]`,
    //             );
    //           }
    //         }
    //       }
    //     }
    //     await page.clickEl(xPaths.menu.homeLink);
    //     await page.waitForNavigation(waitForOptions);
    //     await page.waitForPageRendering();
    //   }
    //   const dateLastUpdatedSmartSource = new Date(Date.now());
    //   const result = await Drug.findOneAndUpdate(
    //     { ndc },
    //     { smartSourceCost, smartSourceAltCost, dateLastUpdatedSmartSource },
    //     { new: true, upsert: true },
    //   ).catch((e) => console.log(e));
    //   return result;
    // },
  };
};

module.exports = keySourcePuppetFn;
