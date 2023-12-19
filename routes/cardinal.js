const express = require('express');
//
const checkCardinalInvoice = require('../middlewares/cardinal/checkCardinalInvoice');
const reloadCardinal = require('../middlewares/cardinal/reloadCardinal');
const manageCSOSReport = require('../middlewares/cardinal/manageCSOSReport');
//
const updateProductDetails = require('../middlewares/cardinal/updateProductDetails');

const CardinalInvoice = require('../schemas/cardinalInvoice');

const router = express.Router();
router.get('/', reloadCardinal);
router.get('/updateProductDetails/:cin', updateProductDetails);
router.post('/checkInvoice', checkCardinalInvoice);
// router.post('/checkInvoice', async (req, res, next) => {
//   const { date, forceUpdate } = req.body;
//   if (!forceUpdate) {
//     const results = await CardinalInvoice.find({ invoiceDate: date }).populate(
//       'item',
//     );
//     if (results.length > 0) {
//       return res.send({ error: null, results });
//     } else {
//       await checkCardinalInvoice(req, res, next);
//     }
//   } else {
//     await checkCardinalInvoice(req, res, next);
//   }
// });
router.post('/reportCSOS', manageCSOSReport);

module.exports = router;
