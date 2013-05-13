
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
     var atom_category = Category.findOrCreate({title:'Atomkraft'}).success(function(category){
         console.log("Success on creating %s category.",category.title)
         atom_category=category;
     });
     var umwelt_category = Category.findOrCreate({title:'Umwelt'}).success(function(category){
         console.log("Success on creating %s category.",category.title)
         umwelt_category=category;
         var Article = app.get('models').Article;
         Article.findOrCreate({id:1},{title: "Atom ist nuklear", date: new Date(88,8,8), article: "Bla fastesd adses atom blubb dsdasd"}).success(function (article) {
             console.log("Success on creating %s article", article.title);
             article.hasCategory(atom_category).success(function(result){
                 if(!result){
                     article.addCategory(atom_category).success(function () {     });
                 }
             });
             article.hasCategory(umwelt_category).success(function(result){
                 if(!result){
                     article.addCategory(umwelt_category).success(function () {     });
                 }
             });

         });
     });


     res.write("Initialized!");
     res.end();
 });

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
