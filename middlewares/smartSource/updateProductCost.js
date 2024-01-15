const Drug = require('../../schemas/drug');

const updateProductCost = async (req, res, next) => {
  const { browser, page, waitForOptions, xPaths, functions } =
    req.app.get('smartSourcePuppet');
  const ndc = req.params.ndc;
  let result = null;
  const item = await Drug.findOne({ ndc });
  if (item) {
    result = await functions.collectCostData(page, item.ndc, item.altNDC);
  }
  return res.send(result);
};

module.exports = updateProductCost;
