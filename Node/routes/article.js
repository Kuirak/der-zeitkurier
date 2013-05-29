var async = require("async");
var models = require('../models');


exports.showById = function (req, res) {
    models.Article.find(req.params.id).success(function (art) {
        if (!art) {
            console.log("id " + req.params.id + " doesn't exist");
            res.status(404).render("404", {content: "Article id: " + req.params.id});
            return;
        }
        loadCategoriesAndFormatDate(art,function(err){
            if(err){
                res.end();
                return;
            }
            res.render("article", {title: art.categories[0].title, articles: [art]});
        });
    });

};


exports.getById = function(req,res){
   models.Article.find(req.params.id).success(function(art){
       if(!art){
           res.status(404);
           res.end();
       }
       loadCategoriesAndFormatDate(art,function(err){
           if(err) {
               res.status(500);
              res.end()
               return;
           }
           for (var i = 0; i < art.categories.length; i++) {
               var cat= art.categories[i];
               art.categories[i] =cat.title;
           }
           res.send({article:{title:art.title,article:art.article,categories:art.categories,date:art.date}});

       })
   })
};

exports.showByCategory = function (req, res) {
    var category = req.params.category;
    models.Category.find({title: category}).success(function (cat) {
        cat.getArticles().success(function (articles) {
            async.each(articles, loadCategoriesAndFormatDate, function (err) {
                if (err)return;
                res.render('article', {title: category, articles: articles});
            });
        });
    });
};


function formatDate(date) {
    if (date instanceof Date) {
        return date.getDay() + '.' + date.getMonth() + '.' + date.getFullYear();
    } else {
        date = date.split('-');
        return date[2] + '.' + date[1] + '.' + date[0];
    }
}


function loadCategoriesForArticles(art, callback) {
    art.getCategories().success(function (categories) {
        art.categories = categories;
        callback(null);
    })
}


function loadCategoriesAndFormatDate(art,callback){

        art.date = formatDate(art.date);
        loadCategoriesForArticles(art, callback);

}


exports.showAll = function (req, res) {
    models.Article.all().success(function (articles) {
        if (articles) {
            async.each(articles,loadCategoriesAndFormatDate, function (err) {
                if (err)return;
                res.render('article', {title: "All Articles", articles: articles});
            });

        } else {
            res.status(404).render('404', {content: "No Articles"})
        }
    });
};


exports.showInputForm = function (req, res) {
    res.render("article_input_form", {title: "Insert an Article"});
};


exports.insertArticleInDB = function (req, res) {
    var article_data = cleanArticleBody(req);
    insertArticle(article_data, function (err, id) {
        if (err) {
            res.status(404);
            res.write(err.message);
            res.end();
            return;
        }
        res.redirect("article/" + id);
    });

};

exports.updateById = function(req,res){
    var article_data = cleanArticleBody(req);
    article_data.id = req.params.id;
    updateArticle(article_data,function(err,id){
        if(err){
            res.status(404);
            res.end();
            return;
        }
        res.status(200).end();
    })
};


function cleanArticleBody(req){
    var article_data = req.body.article;
    if(article_data.categories){
    article_data.categories = article_data.categories.split(',');

    for (var i = 0; i < article_data.categories.length; i++) {
        var category = article_data.categories[i];
        article_data.categories[i] = category.trim();
    }
    }
    return article_data
}


function updateArticle(article_data,callback){
    models.Article.find(article_data.id).success(function(article){
       article.updateAttributes({
            title: article_data.title,
            article: article_data.article,
            date: article_data.date
       });
        if(article_data.categories){
        async.each(article_data.categories, function (title, callback) {
            addCategoryIfNotExists(title, article, callback);

        }, function (err) {
            if (err){
                callback(new Error("Couldn't Create database entry for " + article_data.title));
                return;
            }
            callback(null, article.id);

        });
        }
        callback(null, article.id);

    });


}


function insertArticle(article_data, callback) {

    article_data.gapped = false;
    var Article = models.Article;
    Article.find({where: {title: article_data.title, date: article_data.date}}).success(function (article) {
        if (article) {
            callback(null, article.id);
            return;
        }
        Article.create({title: article_data.title, article: article_data.article, date: article_data.date, gapped: article_data.gapped})
            .success(function (createdArticle) {
                if (!createdArticle) {
                    callback(new Error("Couldn't Create database entry for " + article_data.title));
                    return;
                }
                async.each(article_data.categories, function (title, callback) {
                    addCategoryIfNotExists(title, createdArticle, callback);

                }, function (err) {
                    if (err)
                        callback(new Error("Couldn't Create database entry for " + article_data.title));
                    callback(null, createdArticle.id);
                });


            });

    });


}


function addCategoryIfNotExists(title, article, callback) {
    models.Category.findOrCreate({title: title}).success(function (category) {
        article.hasCategory(category).success(function (result) {
            if (!result) {
                article.addCategory(category).success(function () {
                    callback(null);
                });
            } else {
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
