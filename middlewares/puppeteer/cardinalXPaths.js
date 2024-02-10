const xPaths = {
  menu: {
    home: '//div[@id= "menu"] //a[contains(text(), "Home")]',
    orderHistory: '//div[@id= "menu"] //a[contains(text(), "Order History")]',
    returns: '//div[@id= "menu"] //a[contains(text(), "Returns")]',
    searchBar: '//input[@class= "searchBox searchBoxThemeDefaultColor"]',
    noSearchResults: `//span[contains(text(), "We're sorry. We weren't able to find")]`,
    hideIneligible: '//span[contains(text(), "Hide Ineligible")]',
  },
  tempNavi: {
    invoiceDetail: '//a //span[contains(text(), "Invoice Detail")]',
    orderHistory: '//a //span[contains(text(), "Order History")]',
  },
  orderHistory: {
    manageCSOS: '//a[contains(text(), "Manage E222 & CSOS Orders")]',
    invoiceViewSelector: '//td[@class= "selectDateTblCol2"] //select',
    invoiceViewSelected:
      '//td[@class= "selectDateTblCol2"] //select //option[@selected= "selected" and @value="last_thirty_days"]',
    findInvoice: '//td[@class= "selectDateTblColInv3"] //input',
    next30Days:
      '//a[@class= "commandLink"] //span[contains(text(), "Next 30 Days>>")]',
    prev30Days:
      '//a[@class= "commandLink"] //span[contains(text(), "<<Previous 30 Days")]',
    either30Days:
      '//a[@class= "commandLink"] //span[contains(text(), "Next 30 Days>>") or contains(text(), "<<Previous 30 Days")]',
    shipDate:
      '//td[@class= "colDateShort cahTableCellBorder" and position()= 8] //span',
  },
  productDetails: {
    alternativesTab:
      '//div[@class= "tabs"] //span[contains(text(), "Alternatives & Substitutions")]',
    purchaseHistoryTab:
      '//div[@class= "tabs"] //span[contains(text(), "Purchase History")]',
    viewSelector: '//option[contains(text(), "24 Month Summary View")] /..',
    img: '//table[@class= "mainPicBox"] //img',
    tradeName: '//span[@class ="cahMainTitleBarText"]',
    labelName:
      '//span[contains(text(), "FDB Label Name:")] /.. //span[@class= "outputText"]',
    genericName:
      '//span[contains(text(), "Generic Name:")] /.. /.. //span[@class= "outputText"]',
    cin: '//span[contains(text(), "CIN:")] /.. /.. //span[@class= "outputText"]',
    ndc: '//span[contains(text(), "NDC:")] /.. /.. //span[@class= "outputText"]',
    upc: '//span[contains(text(), "UPC:")] /.. /.. //span[@class= "outputText"]',
    strength:
      '//span[contains(text(), "Strength:")] /.. /.. //span[@class= "outputText"]',
    form: '//span[contains(text(), "Form:")] /.. /.. //span[@class= "outputText"]',
    packageQty:
      '//span[contains(text(), "Package Quantity:")] /.. //span[@class= "outputText"]',
    packageSize:
      '//span[contains(text(), "Package Size:")] /.. //span[@class= "outputText"]',
    unit: '//span[contains(text(), "Unit of Measure:")] /.. //span[@class= "outputText"]',
    cardinalContract:
      '//span[contains(text(), "Contract:")] /.. /.. //span[@class= "outputText"]',
    cardinalStockStatus:
      '//span[contains(text(), "Stock Status:")] /.. //span[@class= "cahStatusTextGreen" or @class= "cahStatusTextYellow" or @class= "cahStatusTextRed"]',
    cardinalQtyAvailable:
      '//span[contains(text(), "Quantity Available")] /.. /.. //span[@class= "outputText"] //b',
    cardinalCost:
      '//span[contains(text(), "Invoice Cost:")] /.. /.. /.. //span[@class= "invoiceCost"]',
    cardinalRetailPriceChanged:
      '//span[contains(text(), "Retail Price Changed:")] /.. /.. //span[@class= "outputText"]',
    mfr: '//span[contains(text(), "MFR:")] /.. //span[@class= "outputText"]',
    dist: '//span[contains(text(), "FDB Manuf/Dist Name:")] /.. //span[@class= "outputText"]',
    productType:
      '//span[contains(text(), "Product Type:")] /.. //span[@class= "outputText"]',
    deaSchedule:
      '//span[contains(text(), "DEA Schedule:")] /.. //span[@class= "outputText"]',
    abRating:
      '//span[contains(text(), "AB Rating:")] /.. //span[@class= "outputText"]',
    returnPackaging:
      '//span[contains(text(), "Return Packaging:")] /.. /.. //span[@class= "outputText"]',
    specialty:
      '//span[contains(text(), "Specialty:")] /.. /.. //span[@class= "outputText"]',
    altWarning:
      '//span[contains(text(), "Cardinal Health Product Alternatives or those designated as")]',
    noAlt:
      '//span[contains(text(), "No Substitutes or Alternatives were found for the product")]',
    altCIN:
      '//td[@class= "dataTableColCINPrdDtlAltSub cahTableCellBorder"] //a //span[@class= "outputText"]',
    altNDC:
      '//td[@class= "dataTableColCINPrdDtlAltSub cahTableCellBorder"] //span[@class= "outputText" and not(ancestor::a)]',
    altTradeName:
      '//td[@class = "dataTableColTradeNamePrdDtlAltSub cahTableCellBorder"] //a //span[@class= "outputText"]',
    altMfr:
      '//td[@class= "dataTableColTradeNamePrdDtlAltSub cahTableCellBorder"] //span[@class= "outputText" and not(ancestor::a)]',
    altStrength:
      '//td[@class="dataTableColStrengthPrdDtlAltSub cahTableCellBorder"] //span[@class= "outputText"]',
    altForm:
      '//td[@class="dataTableColFormPrdDtlAltSub cahTableCellBorder"] //span[@class= "outputText"]',
    altSize:
      '//td[@class="dataTableColPkgSizePrdDtlAltSub cahTableCellBorder"] //span[@class= "outputText"]',
    altType:
      '//td[@class="dataTableColTypePrdDtlAltSub cahTableCellBorder"] //span[@class= "outputText"]',
    altCost:
      '//td[@class="dataTableColPricePrdDtlAltSub cahTableCellBorder"] //span[@class= "outputText" and position()= 2]',
    altContract:
      '//td[@class="dataTableColContractPrdDtlAltSub cahTableCellBorder"] //span[@class= "outputText"]',
    noPurchaseHist: '//div[contains(text(), "No purchase history found")]',
    viewSelector: '//option[contains(text(), "24 Month Summary View")] /..',
    purchaseHistDetailedTable:
      '//th[@class= "psrDataTableBorder"] //span[contains(text(), "Order Date")]',
    cardinalHistOrderDate:
      '//td[@class= "dataTableColDtlOrderDate cahTableCellBorder"] //tr[@class= "displayBlockPrdPuch"] //span[@class= "outputText"]',
    cardinalHistInvoiceDate:
      '//td[@class= "dataTableColDtlInvoice cahTableCellBorder"] //span[@class= "outputText"]',
    cardinalHistOrderQty:
      '//td[@class= "dataTableColDtlOrderQty cahTableCellBorder" and position()= 3] //span[@class= "outputText"]',
    cardinalHistShipQty:
      '//td[@class= "dataTableColDtlShipQty cahTableCellBorder"] //span[@class= "outputText"]',
    cardinalHistUnitCost:
      '//td[@class= "dataTableColDtlUnitCost cahTableCellBorder"] //span[@class= "outputText"]',
    cardinalHistTotalCost:
      '//td[@class= "dataTableColDtlTotalCost cahTableCellBorder"] //span[@class= "outputText"]',
    cardinalHistInvoiceNum:
      '//td[@class= "dataTableColDtlInvoiceNum cahTableCellBorder"] //span[@class= "outputText"]',
    cardinalHistOrderMethod:
      '//td[@class= "dataTableColDtlOrderDate cahTableCellBorder"] //span[@class= "outputText" and not(ancestor::tr/@class= "displayBlockPrdPuch")]',
    wacEffectiveDate:
      '//table[@id= "tablePhWACHistory"] //tbody //td[position()= 1]',
    wac: '//table[@id= "tablePhWACHistory"] //tbody //td[position()= 2] //span',
    wacPercentChange:
      '//table[@id= "tablePhWACHistory"] //tbody //td[position()= 4] //span',
  },
  invoiceDetail: {
    invoiceNumber:
      '//span[contains(text(), "Invoice #:")] /.. /.. //td[@class= "topPanelGridColumnTwo"] //span[@class= "outputText"]',
    invoiceDate:
      '//tr[position()= 2] //td[@class= "topPanelGridColumnTwo"] //span',
    orderNumber:
      '//span[contains(text(), "Order #:")] /.. /.. //td[@class= "topPanelGridColumnTwoSmall"] //span[@class= "outputText"]',
    orderDate:
      '//tr[position()= 2] //td[@class= "topPanelGridColumnTwoSmall"] //span',
    poNumber:
      '//span[contains(text(), "PO #:")] /.. /.. //td[@class= "topPanelGridColumnTwoSmall"] //span[@class= "outputText"]',
    classCol:
      '//th[@class= "dataTableBorder"] //span[contains(text(), "Class")]',
    // itemClass:
    //   '//td[@class= "columnLgSmall cahTableCellBorder" and position()= 15]',
    cin: '//td[@class= "columnLgCin cahTableCellBorder"] //a',
    origQty: '//td[@class= "columnLgOrigQty cahTableCellBorder"] //span',
    orderQty: '//td[@class= "columnLgQty cahTableCellBorder"] //span',
    shipQty: '//td[@class= "columnLgShipQty cahTableCellBorder"] //span',
    omitCode:
      '//td[@class= "columnLgSmall cahTableCellBorder" and position()= 8]',
    costWithClassCol:
      '//td[@class= "columnLgPrice_right cahTableCellBorder" and position()= 16]',
    costWithNoClassCol:
      '//td[@class= "columnLgSmall cahTableCellBorder" and position()= 15]',
    confirmNumberWithClassCol:
      '//td[@class= "columnLgSelect cahTableCellBorder" and position()= 18]',
    confirmNumberWithNoClassCol:
      '//td[@class= "columnLgPrice_right cahTableCellBorder" and position()= 17]',
    totalShipped:
      '//span[contains(text(), "Total Pieces Shipped")] /.. /.. //td[position()= 2] //span[@class= "outputText"]',
    totalAmount:
      '//span[contains(text(), "Amount")] /.. /.. //td[position()= 2] //span[@class= "outputText"]',
  },
  csosReport: {
    utn: '//td[@class= "u-text-align-right"] //div[@class= "u-float-left"]',
    dateInput: '//div[@class= "react-datepicker__input-container"] //input',
    updateRangeButton: '//button[contains(text(), "Update Range")]',
    cin: '//td[@class= "u-text-align-left c_supplier_item_number"]',
    inputReceivedQty:
      '//td[@class= "u-text-align-right c_quantityreceived"] //input',
    inputDateReceived:
      '//div[@class= "react-datepicker__input-container"] //input',
    agreeCheckbox:
      '//div[@class= "order-edit__controls  u-noprint"] //input[@type= "checkbox"]',
    saveButton: '//button[contains(text(), "Save")]',
    saveMsg: '//strong[contains(text(), "Your changes have been saved")]',
  },
};

module.exports = xPaths;
