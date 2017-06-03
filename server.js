var express = require("express");

express()
  .set('view engine', 'ejs')
  .use(express.static('./public'))
  .get('*', function(req, res){
    res.render('index', {
      user: null
    });
  })
  .listen(3000)