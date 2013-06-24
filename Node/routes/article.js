var async = require("async")
    , archiver = require("archiver")
    , sugar = require('sugar');
var models = require('../models');
var breaker = '%n%';

exports.showById = function (req, res) {
    models.Article.find(req.params.id).success(function (art) {
        if (!art) {
            console.log("id " + req.params.id + " doesn't exist");
            res.status(404).render("404", {content: "Article id: " + req.params.id});
            return;
        }
        loadViewDetails(art, function (err) {
            if (err) {
                res.end();
                return;
            }

            res.render("article", {title: art.categories[0].title, articles: [art]});
        });
    });

};


exports.getById = function (req, res) {
    models.Article.find(req.params.id).success(function (art) {
        if (!art) {
            res.status(404);
            res.end();
        }
        loadViewDetails(art, function (err) {
            if (err) {
                res.status(500);
                res.end();
                return;
            }
            for (var i = 0; i < art.categories.length; i++) {
                var cat = art.categories[i];
                art.categories[i] = cat.title;
            }
            res.send({article: {title: art.title, article: art.article, categories: art.categories, date: art.date}});
        })
    })
};


exports.getByIdFormatted = function (req, res) {
    models.Article.find(req.params.id).success(function (article) {
        if (!article) {
            res.status(404).end();
            return;
        }
        article.getSecondary().success(function(articles){
            if(articles.length >0){
                var rand= Number.random(articles.length-1);
                var randArt = formatArticle(articles[rand]);
                var art = {articleId:randArt.id,title: randArt.title, article: randArt.article, date: randArt.date};
                res.send({article: art}).status(200).end();
            } else{
                res.status(404).end();
            }
        });

    });
};


function formatArticle(article){


    article.title = article.title.split(breaker) ;
    for (var i = 0; i < article.title.length; i++) {
        var titleline = article.title[i];
        article.title[i]= titleline.compact();
    }
    article.article =article.article.split(breaker);
    for (var j = 0; j < article.article.length; j++) {
        var articleline = article.article[j];
        article.article[j]= articleline.compact();
    }
    article.date= formatDate(article.date);
    return article;
}


exports.printedArticle = function(req,res){
    models.Article.find(req.params.id).success(function(article){
        article.increment({'printed_count': 1}).success(function(){
            res.status(200).end();
        })
    })
};

exports.showByCategory = function (req, res) {
    var category = req.params.category;
    models.Category.find({where: {title: category}}).success(function (cat) {
        cat.getArticles().success(function (articles) {
            async.each(articles, loadViewDetails, function (err) {
                if (err)return;
                res.render('article', {title: category, articles: articles});
            });
        });
    });
};

function loadViewDetails(art, callback) {
    loadDetails(art, function (err) {
        art = formatForDisplay(art);
        callback(err);
    });

}


function formatDate(date) {
    var dateSplit = date.split('-');
    if (dateSplit.length > 0)
        return dateSplit[2] + '.' + dateSplit[1] + '.' + dateSplit[0];
    else {
        dateSplit = date.split('.');
        return dateSplit[2] + '-' + dateSplit[1] + '-' + dateSplit[0];
    }
}


function loadCategoriesForArticles(art, callback) {
    art.getCategories().success(function (categories) {
        art.categories = categories;
        callback(null);
    })
}

function formatForDisplay(art) {
    art.date = formatDate(art.date);
    var regex = new RegExp(breaker);
    regex.addFlag("g");
    if(art.title.has(regex) || art.article.has(regex)){
    art.title = art.title.remove(regex);
    art.article = art.article.remove(regex);
    art.linebreaks =true;
    }else{
        art.linebreaks = false;
    }

    return art;
}

function loadDetails(art, callback) {
    async.parallel([
        function (cb) {
            loadCategoriesForArticles(art, function (err) {
                cb(err);
            });
        }, function (cb) {
            loadSecondarysForArticles(art, function (err) {
                cb(err);
            })
        }
    ], function (err) {
        callback(err);
    });
}


function loadSecondarysForArticles(art, callback) {
    function getSecondarys(category, callback) {
        category.getArticles({where: {primary: false}, attributes: ['id', 'title']}).success(function (articles) {
            art.secondaryArticles = articles;
            callback(null);
        })
    }
    if (art.primary) {
        async.parallel([
            function (cb) {
                art.getSecondary({attributes: ['id', 'title']}).success(function (secondaries) {
                    art.secondaries = secondaries;
                    cb(null);
                })
            } ,
            function (cb) {
                art.getCategories().success(function (categories) {
                    async.each(categories, getSecondarys, function (err) {
                        if (err) {
                            cb(err);
                            return;
                        }
                        cb(null);
                    })
                });
            }

        ], function (err) {
            callback(err);
        });
    } else {
        callback(null);
    }
}

exports.showAll = function (req, res) {
    models.Article.all().success(function (articles) {
        if (articles) {
            async.each(articles, loadViewDetails, function (err) {
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

exports.deleteArticle = function(req,res){
    models.Article.find(req.params.id).success(function(article){
        article.destroy().success(function(){
            res.status(200).redirect('/');
        })
    })
};

exports.updateById = function (req, res) {
    var article_data = cleanArticleBody(req);
    article_data.id = req.params.id;
    updateArticle(article_data, function (err, id) {
        if (err) {
            res.status(404);
            res.end();
            return;
        }
        res.status(200).end();
    })
};

exports.editById = function (req, res) {
    models.Article.find(req.params.id).success(function (article) {
        loadDetails(article, function (err) {
            if (err)return res.status(400).end();
            res.render('edit_article', {title: 'Edit Article', article: {id: article.id, title: article.title, article: article.article, date: article.date}});
        })
    });
};

exports.addSecondaries = function (req, res) {
    models.Article.find(req.params.id).success(function (primary) {
        function _addSecondaries(id, callback) {
            models.Article.find(id).success(function (secondary) {
                primary.hasSecondary(secondary).success(function (result) {
                    if (!result) {
                        primary.addSecondary(secondary).success(function () {
                            callback(null);
                        })
                    } else {
                        callback(null);
                    }
                });
            });
        }
        async.each(req.body.id, _addSecondaries, function (err) {
            if (err) console.log('Error while adding Secondaries');
            res.redirect('/article/showall');
        })
    });
};

exports.removeSecondaries = function (req, res) {
    models.Article.find(req.params.id).success(function (primary) {
        function _removeSecondaries(id, callback) {
            models.Article.find(id).success(function (secondary) {
                primary.hasSecondary(secondary).success(function (result) {
                    if (result) {
                        primary.removeSecondary(secondary).success(function () {
                            callback(null);
                        })
                    } else {
                        callback(null);
                    }
                });
            });
        }

        async.each(req.body.id, _removeSecondaries, function (err) {
            if (err) console.log('Error while adding Secondaries');
            res.redirect('/article/showall');
        })
    });
};


exports.getQrCode = function (req, res) {
    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Disposition', 'attachment;filename=QrCodeId' + req.params.id + '.png');
    getQrCodeFromGoogle(req.params.id, function (err, response) {
        if (err) {
            res.redirect(404, '/404');
            return;
        }
        response.pipe(res);
    });
             //http://chart.apis.google.com/chart?cht=qr&chs=547x547&choe=UTF-8&chl=http://der-zeitkurier.de?id=3
};

function getQrCodeFromGoogle(id, callback) {
    var http = require('http');
    var options = {
        hostname: 'chart.apis.google.com',
        path: '/chart?cht=qr&chs=547x547&choe=UTF-8&chl=http://der-zeitkurier.de?id=' + id
    };
    var request = http.request(options, function (response) {
        callback(null, response);
    });
    request
        .on('error', function (err) {
            callback(err);
        });
    request.end();
}

exports.getAllQrCodes = function (req, res) {
    var zip = archiver('zip');
    //res.set('Content-Type','application/octet-stream');
    res.set('Content-Disposition', 'attachment;filename=AllQrCodes.zip');
    zip.pipe(res);
    function addQrCode(article, callback) {
        getQrCodeFromGoogle(article.id, function (err, stream) {
            zip.append(stream, {name: ('ID' + article.id + '-' + article.title.first(35).normalize()).underscore() + '.png'}, callback);
        })
    }

    models.Article.findAll({where: {primary: true}}).success(function (articles) {
        async.eachSeries(articles, addQrCode, function (err) {
            if (err)return res.status(500).end();
            zip.finalize(function (err, written) {
                console.log("Wrote " + written + " Bytes to a streamed zip file")

            })
        })
    })
};


function cleanArticleBody(req) {
    var article_data = req.body.article;
    if (article_data.categories) {
        article_data.categories = article_data.categories.split(',');

        for (var i = 0; i < article_data.categories.length; i++) {
            var category = article_data.categories[i];
            article_data.categories[i] = category.trim();
        }
    }
    return article_data
}


function updateArticle(article_data, callback) {
    models.Article.find(article_data.id).success(function (article) {
        article.updateAttributes({
            title: article_data.title,
            article: article_data.article,
            date: article_data.date
        });
        if (article_data.categories) {
            async.each(article_data.categories, function (title, callback) {
                addCategoryIfNotExists(title, article, callback);

            }, function (err) {
                if (err) {
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
    Article.find({where: {title: article_data.title.compact().normalize(), date: article_data.date}}).success(function (article) {
        if (article && !article_data.primary) {
            callback(null, article.id);
            return;
        }
        Article.create({title: article_data.title.compact().normalize(), article: article_data.article.compact().normalize(), date: article_data.date, primary: article_data.primary || false})
            .success(function (createdArticle) {
                if (!createdArticle) {
                    callback(new Error("Couldn't Create database entry for " + article_data.title));
                    return;
                }
                async.each(article_data.categories, function (title, callback) {
                    addCategoryIfNotExists(title.compact(), createdArticle, callback);

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
