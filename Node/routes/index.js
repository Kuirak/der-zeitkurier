
/*
 * GET home page.
 */
var fs = require('fs');
var app = require("../app").express;
var path = require('path');

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.resetdb = function(req,res){
    res.setHeader("Content-Type", "text/html");
  fs.writeFile(path.resolve(__dirname,'../models/articles_db.sqlite'),'',function(err){
      if(err)throw err;
      console.log("DB reset");
      require("../models").sequelize.sync();
     res.end("DB Reset!");
  });
};


