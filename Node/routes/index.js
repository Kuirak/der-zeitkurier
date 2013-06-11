
/*
 * GET home page.
 */
var fs = require('fs');
var app = require("../app").express;
var path = require('path');
var models= require("../models");

exports.index = function(req, res){
    models.Category.all().success(function(categories){
        for (var i = 0; i < categories.length; i++) {
            var category = categories[i];
            categories[i]= category.title;
        }
        models.Article.count().success(function(count){
            res.render('index', { title: 'Zeitkurier Database',categories:categories,count:count});
        });


  });
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

exports.notFound = function(req,res){
    res.render('404',{content:'Content'});

};


