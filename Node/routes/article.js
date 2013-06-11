var async = require("async")
    ,archiver =require("archiver")
    ,sugar =require('sugar');
var models = require('../models');



exports.showById = function (req, res) {
    models.Article.find(req.params.id).success(function (art) {
        if (!art) {
            console.log("id " + req.params.id + " doesn't exist");
            res.status(404).render("404", {content: "Article id: " + req.params.id});
            return;
        }
        loadDetails(art,function(err){
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
       loadDetails(art,function(err){
           if(err) {
               res.status(500);
              res.end();
               return;
           }
           for (var i = 0; i < art.categories.length; i++) {
               var cat= art.categories[i];
               art.categories[i] =cat.title;
           }
           res.send({article:{title:art.title,article:art.article,categories:art.categories,date:art.date,qrcode_id:art.qrcode_id}});

       })
   })
};

exports.showByCategory = function (req, res) {
    var category = req.params.category;
    models.Category.find({where:{title: category}}).success(function (cat) {
        cat.getArticles().success(function (articles) {
            async.each(articles, loadDetails, function (err) {
                if (err)return;
                res.render('article', {title: category, articles: articles});
            });
        });
    });
};




function formatDate(date) {
    var dateSplit = date.split('-');
    if(dateSplit.length>0)
        return dateSplit[2] + '.' + dateSplit[1] + '.' + dateSplit[0];
    else {
        dateSplit =date.split('.');
        return dateSplit[2]+'-' +dateSplit[1]+'-'+dateSplit[0];
    }

}


function loadCategoriesForArticles(art, callback) {
    art.getCategories().success(function (categories) {
        art.categories = categories;
        callback(null);
    })
}


function loadDetails(art,callback){
        art.date = formatDate(art.date);
        var loadSecondarys = false;
        var loadCategories =false;
        loadCategoriesForArticles(art,function(err){
            if(loadSecondarys){
                callback(err);
            }else{
              loadCategories=true;
            }
        });
        loadSecondarysForArticles(art,function(err){
            if(loadCategories){
                callback(err);
            }else{
                loadSecondarys=true;
            }
        });
}

function loadSecondarysForArticles(art,callback){
      function getSecondarys(category,callback){
          category.getArticles({where:{primary:false},attributes:['id','title']}).success(function(articles){
              art.secondaryArticles =articles;
              callback(null);
          })
      }
      if(art.primary){
          art.getCategories().success(function(categories){
              async.each(categories,getSecondarys,function(err){
                  if(err){
                      callback(err);
                      return;
                  }
                  callback(null);
              })
          });

      }else{
          callback(null);
      }
}

exports.showAll = function (req, res) {
    models.Article.all().success(function (articles) {
        if (articles) {
            async.each(articles,loadDetails, function (err) {
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

exports.updateQrCodeId =function(req,res){
    models.Article.find(req.params.id).success(function(article){
        article.updateAttributes({qrcode_id:req.query.qrcode_id}).success(function(){
            res.redirect('/article/showall');
        });
    })

};


exports.getQrCode =function(req,res){
        res.set('Content-Type','application/octet-stream');
        res.set('Content-Disposition','attachment;filename=QrCodeId'+req.params.id+'.png');
        getQrCodeFromGoogle(req.params.id,function(err,response){
            if(err){
                res.redirect(404,'/404');
                return;
            }
            response.pipe(res);
        });

    //http://chart.apis.google.com/chart?cht=qr&chs=547x547&choe=UTF-8&chl=http://der-zeitkurier.de?id=3
};

function getQrCodeFromGoogle(id,callback){
    var http = require('http');
    var options ={
        hostname:'chart.apis.google.com',
        path:'/chart?cht=qr&chs=547x547&choe=UTF-8&chl=http://der-zeitkurier.de?id='+id

    };
    var request = http.request(options,function(response){
        callback(null,response);
    });
    request
        .on('error',function(err){
        callback(err);
    });
    request.end();
}

exports.getAllQrCodes = function(req,res){
    var zip = archiver('zip');
    //res.set('Content-Type','application/octet-stream');
    res.set('Content-Disposition','attachment;filename=AllQrCodes.zip');
    zip.pipe(res);
    function addQrCode(article,callback){
         getQrCodeFromGoogle(article.qrcode_id,function(err,stream){
             zip.append(stream,{name:(article.id+'_'+article.title.first(35).normalize()).underscore()+'.png'},callback);
         })
    }
    models.Article.findAll({where:{primary:true}}).success(function(articles){
        async.eachSeries(articles,addQrCode,function(err){
             if(err)return res.status(500).end();
             zip.finalize(function(err,written){
                 console.log("Wrote "+written+" Bytes to a streamed zip file")

             })
        })
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
    var Article = models.Article;
    Article.find({where: {title: article_data.title, date: article_data.date}}).success(function (article) {
        if (article && !article_data.primary) {
            callback(null, article.id);
            return;
        }
        Article.create({title: article_data.title, article: article_data.article, date: article_data.date, primary: article_data.primary || false})
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
