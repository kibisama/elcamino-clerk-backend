const Drug = require('../../schemas/drug');

const smartSourcePuppetFn = function ({ waitForOptions, xPaths }) {
  return {
    async collectCostData(page, ndc, altNDC) {
      let smartSourceName;
      let smartSourceCost;
      let smartSourceAltBACName = '';
      let smartSourceAltBACNDC = '';
      let smartSourceAltBACCost = '';
      let smartSourceAltBPDName = '';
      let smartSourceAltBPDNDC = '';
      let smartSourceAltBPDCost = '';
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
      }
      if (!smartSourceName) {
        for (let i = 0; i < altNDC.length; i++) {
          const newSearchBar = await page.$x(xPaths.menu.searchBar);
          if (newSearchBar.length > 0) {
            await page.typeInputEl(altNDC[i], newSearchBar[0]);
            await page.waitForElements(
              `//div[@class= "results-wrapper"] //span[@class= "term" and contains(text(), "${altNDC[i]}")]`,
              xPaths.catalogSearch.ndcSearchResult,
            );
            const smartAltName =
              (await page.findTexts(xPaths.catalogSearch.productName))[0] ?? '';
            if (!smartAltName) {
              await page.setRandomDelay(
                0,
                `no results for searching ${altNDC[i]} [NDC: ${ndc}]`,
              );
              continue;
            }
            const autocompleteBox = await page.$x(
              xPaths.catalogSearch.autocompleteBox,
            );
            if (autocompleteBox.length > 0) {
              await page.clickEl(xPaths.menu.searchInputClear);
              await new Promise((r) => setTimeout(r, 1000));
            }
            const altButton = await page.$x(xPaths.catalogSearch.findAltButton);
            if (altButton.length > 0) {
              const els = await this.findAltItems(page, ndc);
              if (els.length === 0) {
                break;
              }
              smartSourceAltBACName = els[0];
              smartSourceAltBACNDC = els[1];
              smartSourceAltBACCost = els[2];
              smartSourceAltBPDName = els[3];
              smartSourceAltBPDNDC = els[4];
              smartSourceAltBPDCost = els[5];
              break;
            }
          }
        }
      } else {
        const altButton = await page.$x(xPaths.catalogSearch.findAltButton);
        if (altButton.length > 0) {
          const els = await this.findAltItems(page, ndc);
          if (els.length > 0) {
            smartSourceAltBACName = els[0];
            smartSourceAltBACNDC = els[1];
            smartSourceAltBACCost = els[2];
            smartSourceAltBPDName = els[3];
            smartSourceAltBPDNDC = els[4];
            smartSourceAltBPDCost = els[5];
          }
        }
      }
      const dateLastUpdatedSmartSource = new Date(Date.now());
      const result = await Drug.findOneAndUpdate(
        { ndc },
        {
          smartSourceAltBACName,
          smartSourceAltBACNDC,
          smartSourceAltBACCost,
          smartSourceAltBPDName,
          smartSourceAltBPDNDC,
          smartSourceAltBPDCost,
        },
        { new: true, upsert: true },
      ).catch((e) => console.log(e));

      await page.setRandomDelay(
        0,
        `updated SmartSource data for [NDC: ${ndc}]. returning to home screen...`,
      );
      await page.clickEl(xPaths.menu.homeLink);
      await new Promise((r) => setTimeout(r, 1000));
      await page.waitForPageRendering();
      return result;
    },
    async findAltItems(page, ndc) {
      await page.clickEl(xPaths.catalogSearch.findAltButton);
      await new Promise((r) => setTimeout(r, 1000));

      await page.waitForElement(xPaths.findAlternatives.header);

      const altBACName = (
        await page.findTexts(xPaths.findAlternatives.altBACName)
      )[0];
      let altBACNDC = (
        await page.findTexts(xPaths.findAlternatives.altBACNDC)
      )[0];
      const altBACCost = (
        await page.findTexts(xPaths.findAlternatives.altBACCost)
      )[0];
      const altBPDName = (
        await page.findTexts(xPaths.findAlternatives.altBPDName)
      )[0];
      let altBPDNDC = (
        await page.findTexts(xPaths.findAlternatives.altBPDNDC)
      )[0];
      const altBPDCost = (
        await page.findTexts(xPaths.findAlternatives.altBPDCost)
      )[0];

      if (altBACNDC) {
        altBACNDC = altBACNDC.substring(7);
      }
      if (altBPDNDC) {
        altBPDNDC = altBPDNDC.substring(7);
      }
      const els = [
        altBACName,
        altBACNDC,
        altBACCost,
        altBPDName,
        altBPDNDC,
        altBPDCost,
      ];
      await page.clickEl(xPaths.findAlternatives.closeModalButton);
      return els;
    },
  };
};

module.exports = smartSourcePuppetFn;
