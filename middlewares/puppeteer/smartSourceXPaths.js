const xPaths = {
  menu: {
    homeLink: '//a[@title= "SmartSource Logo"]',
    searchBar: '//input[@id= "js-site-search-input"]',
    searchInputClear: '//span[@class= "product-search-input-clear"]',
  },
  catalogSearch: {
    // noProductsFound: '//div[contains(text(), "No products found"]',
    productName:
      '//div[@class= "plp-items-wrapper"] //div[@class= "product-listing box no-padding"] //div[@class= "name"] //div[@class= "tray-indicator-product tooltipNotify"] //a',
    acqCost:
      '//div[@class= "plp-items-wrapper"] //div[@class= "product-listing box no-padding"] //div[@class= "indicator-acq-cost"]',
    ndc: '//div[@class= "plp-items-wrapper"] //div[@class= "product-listing box no-padding"] //div[@class= "ndc"] //strong',
    ndcSearchResult:
      '//div[contains(text(), "No products found")] | //div[@class= "plp-items-wrapper"] //div[@class= "product-listing box no-padding"] //div[@class= "name"] //div[@class= "tray-indicator-product tooltipNotify"]',
    findAltButton: '//button[contains(text(), "Find Alternatives")]',
    autocompleteBox: '//ul[@tabindex= "0"]',
  },
  findAlternatives: {
    altBACName:
      '//div[contains(text(), "Best Acquisition Cost")] /.. //div[@class= "name"] //div[@class= "tray-indicator-product tooltipNotify"] //a',
    altBACNDC:
      '//div[contains(text(), "Best Acquisition Cost")] /.. //strong[contains(text(), "NDC")]',
    altBACCost:
      '//div[contains(text(), "Best Acquisition Cost")] /.. //div[@class= "indicator-acq-cost"]',
    altBPDName:
      '//div[contains(text(), "Best Price per Dose")] /.. //div[@class= "tray-indicator-product tooltipNotify"] //a',
    altBPDNDC:
      '//div[contains(text(), "Best Price per Dose")] /.. //strong[contains(text(), "NDC")]',
    altBPDCost:
      '//div[contains(text(), "Best Price per Dose")] /.. //div[@class= "indicator-acq-cost"]',
    closeModalButton: '//div[@title= "Close Find Alternatives dialog"]',
    header: '//h2[contains(text(), "Find Alternatives")]',
    noAlt:
      '//div[contains(text(), "There are no alternatives for this product")]',
  },
};

module.exports = xPaths;
