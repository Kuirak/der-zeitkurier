
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

app.get('/resetdb',routes.resetdb);


app.get('/', routes.index);
app.get('/users', user.list);

app.get('/init',routes.init);

app.get("/article/:id",function(req,res){


    var Article = app.get('models').Article;
    Article.find(req.params.id).success(function(art){
        var title = art.title;
        var article = art.article;
        var date = art.date;
        art.getCategories().success(function(cat) {
            var categories=[];
            for (var i = 0; i < cat.length; i++) {
                categories.push( cat[i].title);
            }
            res.render("article",{title:title,article:article,categories:categories,date:date});
        } ).error(function(error){
             console.log(req.param.id + "doesn't exist");
             res.render("404")
            })

    });

});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

exports.express =app;

