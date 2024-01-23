const Drug = require('../../schemas/drug');

const keySourcePuppetFn = function ({ waitForOptions, xPaths }) {
  return {
    async collectCostData(page, ndc, altNDC) {
      let keySourceDesc = '';
      let keySourceCost = '';
      let keySourceStock = '';
      let keySourceExp = '';
      let keySourceAltDesc = new Array(altNDC.length);
      let keySourceAltCost = new Array(altNDC.length);
      let keySourceAltStock = new Array(altNDC.length);
      let keySourceAltExp = new Array(altNDC.length);

      const searchBar = await page.$x(xPaths.menu.searchBar);
      if (searchBar.length > 0) {
        await page.typeInputEl(ndc, searchBar[0]);
        await page.waitForNavigation(waitForOptions);
        const results = await page.waitForElement(
          xPaths.catalogSearch.searchResults,
        );
        if (results.length > 0) {
          keySourceDesc =
            (await page.findTexts(xPaths.catalogSearch.desc))[0] ?? '';
          keySourceCost =
            (await page.findTexts(xPaths.catalogSearch.price))[0] ?? '';
          keySourceStock =
            (await page.findTexts(xPaths.catalogSearch.noStock))[0] ?? '';
          keySourceExp =
            (await page.findTexts(xPaths.catalogSearch.exp))[0] ?? '';
          await page.setRandomDelay(0, `copied KeySource Cost[NDC: ${ndc}]`);
        }
        if (altNDC.length > 0) {
          for (let i = 0; i < altNDC.length; i++) {
            const searchBar = await page.$x(xPaths.menu.searchBar);
            if (searchBar.length > 0) {
              await page.typeInputEl(altNDC[i], searchBar[0]);
              const results = await page.waitForElement(
                xPaths.catalogSearch.searchResults,
              );
              if (results.length > 0) {
                keySourceAltDesc.push(
                  (await page.findTexts(xPaths.catalogSearch.desc))[0] ?? '',
                );
                keySourceAltCost.push(
                  (await page.findTexts(xPaths.catalogSearch.price))[0] ?? '',
                );
                keySourceAltStock.push(
                  (await page.findTexts(xPaths.catalogSearch.noStock))[0] ?? '',
                );
                keySourceAltExp.push(
                  (await page.findTexts(xPaths.catalogSearch.exp))[0] ?? '',
                );
                await page.setRandomDelay(
                  0,
                  `collecting KeySource AltCost[NDC: ${ndc}] [${i + 1}/${
                    altNDC.length
                  }]`,
                );
              }
            }
          }
        }
        await page.clickEl(xPaths.menu.logo);
        await page.waitForNavigation(waitForOptions);
        await page.waitForPageRendering();
      }
      const dateLastUpdatedKeySource = new Date(Date.now());
      const result = await Drug.findOneAndUpdate(
        { ndc },
        {
          keySourceDesc,
          keySourceCost,
          keySourceStock,
          keySourceExp,
          keySourceAltDesc,
          keySourceAltCost,
          keySourceAltStock,
          keySourceAltExp,
          dateLastUpdatedKeySource,
        },
        { new: true, upsert: true },
      ).catch((e) => console.log(e));
      return result;
    },
  };
};

module.exports = keySourcePuppetFn;
