const express = require('express');
const path = require('path');
const fs = require('fs');

const Drug = require('../schemas/drug');

const router = express.Router();

router.post('/drugs/search', async (req, res, next) => {
  const { upc, ndc, cin, labelName } = req.body;
  // const results = await Drug.find({ $text: { $search: term, $ } });
  // TODO: 자동완성에 필요한 데이터만 Select 후 send한다?
  let results = [];
  switch (true) {
    case !!labelName:
      results = await Drug.find({
        $or: [{ labelName: { $regex: '^' + labelName, $options: 'i' } }],
      });
      break;
    case !!upc:
      const _upc = await Drug.findOne({
        upc,
      });
      if (_upc) {
        results[0] = _upc;
      }
      break;
    case !!cin:
      const _cin = await Drug.findOne({
        cin,
      });
      if (_cin) {
        results[0] = _cin;
      }
      break;
    case !!ndc:
      results = await Drug.find({
        $or: [{ ndc: { $regex: '^' + ndc, $options: 'i' } }],
      });
      break;
    default:
  }
  if (results.length > 0) {
    res.send({ error: null, results });
  } else {
    res.send({ error: 'No Search Results', results });
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
