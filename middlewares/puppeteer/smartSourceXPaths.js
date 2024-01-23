const xPaths = {
  menu: {
    homeLink: '//a[@title= "SmartSource Logo"]',
    searchBar: '//input[@id= "js-site-search-input"]',
    searchInputClear: '//span[@class= "product-search-input-clear"]',
  },
  catalogSearch: {
    // noProductsFound: '//div[contains(text(), "No products found"]',
    productName:
      '//div[@class= "name"] //div[@class= "tray-indicator-product tooltipNotify"] //a',
    acqCost: '//div[@class= "indicator-acq-cost"]',
    ndcSearchResult:
      '//div[contains(text(), "No products found")] | //div[@class= "name"] //div[@class= "tray-indicator-product tooltipNotify"]',
    findAltButton: '//button[contains(text(), "Find Alternatives")]',
    autocompleteBox: '//ul[@tabindex= "0"]',
  },
  findAlternatives: {
    altName:
      '//div[contains(text(), "All Alternatives (")] /.. /.. //div[position()= 3] //div[@class= "name"] //div[@class= "tray-indicator-product tooltipNotify"] //a',
    altNDC:
      '//div[contains(text(), "All Alternatives (")] /.. /.. //div[position()= 3] //strong[contains(text(), "NDC")]',
    altACQCost:
      '//div[contains(text(), "All Alternatives (")] /.. /.. //div[position()= 3] //div[@class= "indicator-acq-cost"]',
    closeModalButton: '//div[@title= "Close Find Alternatives dialog"]',
    header: '//h2[contains(text(), "Find Alternatives")]',
    noAlt:
      '//div[contains(text(), "There are no alternatives for this product")]',
  },
};

module.exports = xPaths;
