const express = require('express');

const checkCardinalInvoice = require('../middlewares/cardinal/checkCardinalInvoice');
const updateProductDetails = require('../middlewares/cardinal/updateProductDetails');
// 이하 미들웨어는 재작업 필요
const reloadCardinal = require('../middlewares/cardinal/reloadCardinal');
const manageCSOSReport = require('../middlewares/cardinal/manageCSOSReport');

const router = express.Router();
router.get('/', reloadCardinal);
router.get('/updateProductDetails/:cin', updateProductDetails);
router.post('/checkInvoice', checkCardinalInvoice);
router.post('/reportCSOS', manageCSOSReport);

module.exports = router;
