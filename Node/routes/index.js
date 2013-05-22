
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
  fs.writeFile(path.resolve(__dirname,'../models/articles_db.sqlite'),'',function(err){
      if(err)throw err;
      console.log("DB reset");
      require("../models").sequelize.sync();
     res.end("DB Reset!");
  });
};

exports.init = function(req,res){
    fs.readFile(path.resolve(__dirname,'../source/article_normal.txt'), 'utf8', function (err, article_normal) {
        if (err)
            console.log(err);
        console.log(article_normal)
        ImportArticle(article_normal);
    });

    fs.readFile(path.resolve(__dirname,'../source/article_gapped.txt'), 'utf8', function (err, article_gapped) {
        if (err)
            console.log(err);
        ImportArticle(article_gapped);
    });
    res.write("Initialized!");
    res.end();
};


function ImportArticle(article_data) {
    var lines= article_data.toString().split(/\r?\n/);
    var parsedArticle = {gapped: false, categories:null,title:null,date:null};
    var lineOffset =0;
    if(lines[0] ==='gapped'){
        parsedArticle.gapped =true;
        lineOffset++;
    }
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        switch(i){
            case 0+lineOffset:
                parsedArticle.categories = line.split(',');
                break;
            case 1+lineOffset:
                var date = line.split('.') ;
                parsedArticle.date = new Date(date[2],date[1],date[0]);
                break;
            case 2+lineOffset:
                parsedArticle.title=line.trim();
                break;
            case 3+lineOffset:
                parsedArticle.article=line;
        }
    }

    var Article = require("../models").Article;

    Article.findOrCreate({title:parsedArticle.title}, { article: parsedArticle.article, date:parsedArticle.date,gapped:parsedArticle.gapped})
        .success(function (article) {
            for (var i = 0; i < parsedArticle.categories.length; i++) {
                var title = parsedArticle.categories[i];
                AddCategoryIfNotExists(title,article);
            }
            if(article.gapped){
                fs.readFile(path.resolve(__dirname,'../source/article_keywords.txt'),'utf8',function(error,keyword_data){
                    if(error)console.log(error);
                    var keywords= keyword_data.toString().split(/\r?\n/);
                    for (var i = 0; i < keywords.length; i++) {
                        var word = keywords[i];
                        AddKeywordIfNotExits(word,article,i);
                    }
                });
            }

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