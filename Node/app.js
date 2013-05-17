
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
    ,fs =require('fs');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('models',require('./models'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/init',function(req,res){



    fs.readFile(__dirname+'/source/article_normal.txt', 'utf8', function (err, article_normal) {
        if (err)
            console.log(err);
        console.log(article_normal)
        ImportArticle(article_normal);
    });

    fs.readFile(__dirname+'/source/article_gapped.txt', 'utf8', function (err, article_gapped) {
        if (err)
            console.log(err);
        ImportArticle(article_gapped);
    });
    res.write("Initialized!");
    res.end();
 });


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

    var Article = app.get('models').Article;

    Article.findOrCreate({title:parsedArticle.title}, { article: parsedArticle.article, date:parsedArticle.date,gapped:parsedArticle.gapped})
        .success(function (article) {
            for (var i = 0; i < parsedArticle.categories.length; i++) {
                var title = parsedArticle.categories[i];
                AddCategoryIfNotExists(title,article);
            }
            if(article.gapped){
                fs.readFile(__dirname+'/source/article_keywords.txt','utf8',function(error,keyword_data){
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
    var Category = app.get('models').Category;
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
    var Keyword = app.get('models').Keyword;
    Keyword.create({word: keyword, order: order}).success(function (word) {
        article.addKeyword(word).success(function () {
        });
    })
}

app.get("/first",function(req,res){


    var Article = app.get('models').Article;
    Article.find(1).success(function(art){
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

});







http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
