const express = require('express');

const updateProductCost = require('../middlewares/keySource/updateProductCost');

const router = express.Router();
router.get('/updateProductCost/:ndc', updateProductCost);

module.exports = router;
