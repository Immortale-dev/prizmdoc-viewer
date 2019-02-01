const express = require('express');
const router = express.Router();


router.get('/', async (req, res /*, next*/) => {

  res.render('index', {
    title: 'HTML File Viewer',
  });

});


module.exports = router;
