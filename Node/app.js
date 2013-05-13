
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

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
     var Category = app.get('models').Category;
     var atom_category = Category.create({title:'Atomkraft',id:1}).success(function(category){
         console.log("Success on creating %s category.",category.title)
         atom_category=category;
     });
     var Article = app.get('models').Article;
     var first_article = Article.create({title:"Atom ist nuklear",id:3,date:new Date(),article:"Bla fastesd adses atom blubb dsdasd"}).success(function(article){
         console.log("Success on creating %s article", article.title);

             article.addCategory(atom_category).success(function(){


         })
     }) ;

     res.write("Initialized!");
     res.end();
 });

app.get("/first",function(req,res){


    var Article = app.get('models').Article;
    Article.find(3).success(function(art){
        var title = art.title;
        var article = art.article;
        var date = art.date;
        res.render("article",{title:title,article:article,date:date});
    });

});







http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
