const express = require('express');
const path = require('path');
const fs = require('fs');

const Drug = require('../schemas/drug');

const router = express.Router();

router.post('/drugs/search', async (req, res, next) => {
  const { cin, ndc, upc, term } = req.body;
  // const results = await Drug.find({ $text: { $search: term, $ } });

  // TODO: 자동완성에 필요한 데이터만 Select 후 send한다
  const results = await Drug.find({
    $or: [{ labelName: { $regex: '^' + term, $options: 'i' } }],
  });
  if (results.length > 0) {
    res.send({ error: null, results });
  } else {
    res.send({ error: 'No Search Results' });
  }
});

router.get('/drugs/img/:cid', (req, res, next) => {
  const parentDir = path.resolve(__dirname, '..');
  const imgFile = `${parentDir}/drugimg/${req.params.cid}.jpg`;
  if (fs.existsSync(imgFile)) {
    res.sendFile(imgFile);
  } else {
    res.sendFile(`${parentDir}/drugimg/default_DETL.jpg`);
  }
});

// router.get('drugs/chartdata/:cid')

module.exports = router;
