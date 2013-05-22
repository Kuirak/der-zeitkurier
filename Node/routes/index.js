
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




exports.article_id =function(req,res){
    var Article = require('../models').Article;
    Article.find(req.params.id).success(function(art){
        if(!art){
            console.log("id "+ req.params.id + " doesn't exist");
            res.render("404",{content:"Article id: "+req.params.id});
            return;
        }
        var title = art.title;
        var article = art.article;
        var date = art.date;
        art.getCategories().success(function(cat) {
            var categories=[];
            for (var i = 0; i < cat.length; i++) {
                categories.push( cat[i].title);
            }
            res.render("article",{title:title,article:article,categories:categories,date:date});
        } )
    });

};


exports.article_input_form =function(req,res) {
    res.render("article_input_form");

};


exports.article_input = function(req,res){
    var article_data= req.body.article;
    article_data.categories = article_data.categories.split(',');
   // var date = article_data.date.split('-') ;
  //  article_data.date = new Date(date[0],date[1],date[2]);
    ImportArticle(article_data,function(err,id){
        if(err){
            res.write(err.message);
            res.end();
            return;
        }
        res.redirect("article/"+id);
    });

};

function ImportArticle(article_data,callback) {

    article_data.gapped = false;
    var Article = require("../models").Article;

    Article.create({title: article_data.title, article: article_data.article, date: article_data.date, gapped: article_data.gapped})
        .success(function (article) {
            if(!article){
                callback(new Error("Couldn't Create database entry for "+ article_data.title));
                return;
            }
            for (var i = 0; i < article_data.categories.length; i++) {
                var title = article_data.categories[i];
                AddCategoryIfNotExists(title, article);
            }
            callback(null,article.id);

        });


}

function AddCategoryIfNotExists(title,article){
    var Category = require("../models").Category;
    Category.findOrCreate({title:title}).success(function(category){
        article.hasCategory(category).success(function (result) {
            if (!result) {
                article.addCategory(category).success(function () {
                });
            }
        });
    })
}


function AddKeywordIfNotExits(keyword, article, order) {
    var Keyword = require("../models").Keyword;
    Keyword.create({word: keyword, order: order}).success(function (word) {
        article.addKeyword(word).success(function () {
        });
    })
}