  var async  = require("async");
  var models = require('../models');

exports.showById =function(req,res){

    models.Article.find(req.params.id).success(function(art){
        if(!art){
            console.log("id "+ req.params.id + " doesn't exist");
            res.render("404",{content:"Article id: "+req.params.id});
            return;
        }
        var date = art.date;
        var dd = date.getDay();
        var mm =date.getMonth();
        var yyyy=date.getFullYear();
        art.date = dd+'.'+mm+'.'+yyyy;
        art.getCategories().success(function(cat) {

            art.categories=cat;
            res.render("article",{title:art.categories[0].title,articles:[art]});
        } )
    });

};

exports.showByCategory = function(req,res){
   var category= req.params.category;
   var Category = models.Category;
   Category.find({title:category}).success(function(cat){
       cat.getArticles().success(function(articles){
           async.each(articles,function(art,callback){
               var date =art.date.split('-');
               var dd = date[2];
               var mm =date[1];
               var yyyy=date[0];
               art.date = dd+'.'+mm+'.'+yyyy;
               art.getCategories().success(function(categories){
                   art.categories=categories;

                   callback(null);
               })
           },function(err){
               if(err)return;
               res.render('article',{title:category,articles:articles});
           }) ;


   });
   });


};

exports.showAll =function(req,res){
    models.Article.all().success(function(articles){
        if(articles){
        res.render('article',{title:"All Articles",articles:articles});
        }else{
            res.render('404',{content:"No Articles"})
        }
    });
};


exports.showInputForm =function(req,res) {
    res.render("article_input_form");
};

exports.insertArticleInDB = function(req,res){
    var article_data= req.body.article;
    article_data.categories = article_data.categories.split(',');
    for (var i = 0; i < article_data.categories.length; i++) {
        var category = article_data.categories[i];
        article_data.categories[i]= category.trim();
    }
    insertArticle(article_data,function(err,id){
        if(err){
            res.write(err.message);
            res.end();
            return;
        }
        res.redirect("article/"+id);
    });

};



function insertArticle(article_data,callback) {

    article_data.gapped = false;
    var Article = models.Article;
    Article.find({where:{title:article_data.title,date:article_data.date}}).success(function(article){
       if(article){
           callback(null,article.id);
           return;
       }
           Article.create({title: article_data.title, article: article_data.article, date: article_data.date, gapped: article_data.gapped})
               .success(function (createdArticle) {
                   if(!createdArticle){
                       callback(new Error("Couldn't Create database entry for "+ article_data.title));
                       return;
                   }
                   async.each(article_data.categories,function(title,callback){
                       addCategoryIfNotExists(title, createdArticle,callback);

                   },function(err){
                       if(err)
                           callback(new Error("Couldn't Create database entry for "+ article_data.title));
                       callback(null,createdArticle.id);
                   });



               });

    });




}

function addCategoryIfNotExists(title,article,callback){
    models.Category.findOrCreate({title:title}).success(function(category){
        article.hasCategory(category).success(function (result) {
            if (!result) {
                article.addCategory(category).success(function () {
                   callback(null);
                });
            } else{
                callback(null);
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
