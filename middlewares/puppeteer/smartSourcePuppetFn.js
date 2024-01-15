const Drug = require('../../schemas/drug');

const smartSourcePuppetFn = function ({ waitForOptions, xPaths }) {
  return {
    async collectCostData(page, ndc, altNDC) {
      let smartSourceName;
      let smartSourceCost;
      let smartSourceAltName = new Array(altNDC.length);
      let smartSourceAltCost = new Array(altNDC.length);
      const searchBar = await page.$x(xPaths.menu.searchBar);
      if (searchBar.length > 0) {
        await page.typeInputEl(ndc, searchBar[0]);
        await page.waitForNavigation(waitForOptions);
        await page.waitForElement(xPaths.catalogSearch.ndcSearchResult);
        smartSourceName =
          (await page.findTexts(xPaths.catalogSearch.productName))[0] ?? '';
        smartSourceCost =
          (await page.findTexts(xPaths.catalogSearch.acqCost))[0] ?? '';
        await page.setRandomDelay(0, `copied SmartSource Cost[NDC: ${ndc}]`);
        if (!smartSourceCost) {
          if (altNDC.length > 0) {
            for (let i = 0; i < altNDC.length; i++) {
              const searchBar = await page.$x(xPaths.menu.searchBar);
              if (searchBar.length > 0) {
                await page.typeInputEl(altNDC[i], searchBar[0]);
                await page.waitForElements(
                  `//div[@class= "results-wrapper"] //span[@class= "term" and contains(text(), "${altNDC[i]}")]`,
                  xPaths.catalogSearch.ndcSearchResult,
                );
                smartSourceAltCost[i] =
                  (await page.findTexts(xPaths.catalogSearch.acqCost))[0] ?? '';
                if (!smartSourceAltCost[i]) {
                  continue;
                }
                const els = await this.findAltItems(page, ndc);
                for (let j = i + 1; j < altNDC.length; j++) {
                  for (let k = 0; k < els[1].length; k++) {
                    if (altNDC[j] === els[1][k]) {
                      smartSourceAltName[j] = els[0][k];
                      smartSourceAltCost[j] = els[2][k];
                      break;
                    }
                  }
                }
                break;
              }
            }
          }
        } else {
          const els = await this.findAltItems(page, ndc);
          altNDC.forEach((v, i) => {
            const j = els[1].indexOf(v);
            if (j > -1) {
              smartSourceAltName[i] = els[0][j];
              smartSourceAltCost[i] = els[2][j];
            } else {
              smartSourceAltName[i] = '';
              smartSourceAltCost[i] = '';
            }
          });
        }
      }
      const dateLastUpdatedSmartSource = new Date(Date.now());
      const result = await Drug.findOneAndUpdate(
        { ndc },
        {
          smartSourceName,
          smartSourceCost,
          smartSourceAltName,
          smartSourceAltCost,
          dateLastUpdatedSmartSource,
        },
        { new: true, upsert: true },
      ).catch((e) => console.log(e));

      await page.clickEl(xPaths.menu.homeLink);
      await page.waitForNavigation(waitForOptions);
      await page.waitForPageRendering();

      return result;
    },
    async findAltItems(page, ndc) {
      await page.clickEl(xPaths.catalogSearch.findAltButton);
      const els = await page.waitForElements([
        xPaths.findAlternatives.altName,
        xPaths.findAlternatives.altNDC,
        xPaths.findAlternatives.altACQCost,
      ]);
      els[1] = els[1].map((name) => name.substring(7));
      await page.clickEl(xPaths.findAlternatives.closeModalButton);
      await page.setRandomDelay(0, `found SmartSource AltItems[NDC: ${ndc}]`);
      return els;
    },
  };
};

module.exports = smartSourcePuppetFn;
