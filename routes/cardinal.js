const express = require('express');

const checkCardinalInvoice = require('../middlewares/cardinal/checkCardinalInvoice');
const reloadCardinal = require('../middlewares/cardinal/reloadCardinal');

const CardinalInvoice = require('../schemas/cardinalInvoice');

const router = express.Router();
router.get('/', reloadCardinal);
router.post('/checkInvoice', async (req, res, next) => {
  const { date, forceUpdate } = req.body;
  if (!forceUpdate) {
    const results = await CardinalInvoice.find({ invoiceDate: date }).populate(
      'item',
    );
    if (results.length > 0) {
      res.send({ error: null, results });
    } else {
      await checkCardinalInvoice(req, res, next);
    }
  } else {
    await checkCardinalInvoice(req, res, next);
  }
});

module.exports = router;
