const xPaths = {
  menu: {
    logo: '//img[@alt= "KeySource"]',
    searchBar:
      '//div[@class= "mud-input-control-input-container"] //input[@type= "text"]',
  },
  home: {
    loginButton: '//span[contains(text(), "Log In")]',
  },
  loginPopup: {
    idInput: '//input[@type= "email"]',
    passwordInput: '//input[@type= "password"]',
  },
  catalogSearch: {
    noResults: '//p[contains(text(), "No matching records found")]',
    searchResults:
      '//p[contains(text(), "No matching records found")] | //tr[@class= "mud-table-row search-rows"] //td[@data-label= "NDC"]',
    ndc: '//tr[@class= "mud-table-row search-rows"] //td[@data-label= "NDC"]',
    desc: '//tr[@class= "mud-table-row search-rows"] //td[@data-label= "Desc"]',
    size: '//tr[@class= "mud-table-row search-rows"] //td[@data-label= "Size"]',
    price:
      '//tr[@class= "mud-table-row search-rows"] //td[@data-label= "Price"]',
    noStock:
      '//tr[@class= "mud-table-row search-rows"] //h6[contains(text(), "No Stock")]',
    // noReturns:
    //   '//tr[@class= "mud-table-row search-rows"] //span[contains(text(), "No Returns")]',
    exp: '//tr[@class= "mud-table-row search-rows"] //span[@style= "color: red; font-weight: bold; display: block" and position()= 2]',
  },
};

module.exports = xPaths;
