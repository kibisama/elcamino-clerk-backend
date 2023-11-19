const express = require('express');

const checkCardinalInvoice = require('../middlewares/cardinal/checkCardinalInvoice');
const reloadCardinal = require('../middlewares/cardinal/reloadCardinal');

const router = express.Router();
router.get('/', reloadCardinal);
router.post('/checkInvoice', checkCardinalInvoice);

module.exports = router;
