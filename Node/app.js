
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , article = require('./routes/article')
  , http = require('http')
  , path = require('path')
  ,fs =require('fs');

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('models',require('./models'));
app.use(express.basicAuth('zeitkurier','kurier-der-zeit'));
app.use(express.favicon(path.join(__dirname,'public/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler()); }

//app.get('/resetdb',routes.resetdb);
app.post('/article/input',article.insertArticleInDB);
app.get('/article/input',article.showInputForm);
app.get('/article/showall',article.showAll);
app.post("/article/:id/update",article.updateById);
app.post("/article/:id/addsecondaries",article.addSecondaries);
app.post("/article/:id/rmsecondaries",article.removeSecondaries);


app.get("/article/qrcode/:id",article.getQrCode);
app.get("/article/allqrcode",article.getAllQrCodes);
app.get("/article/:id/edit",article.editById);
app.get("/article/:id",article.showById);
app.post("/article/:id/formatted",article.getByIdFormatted);
app.get("/article/:id/printed",article.printedArticle);
app.get("/article/:id/delete",article.deleteArticle);
app.post("/article/:id",article.getById);
app.get('/article/category/:category',article.showByCategory);
app.get("/article",function(req,res){
    if(req.query.id){
        req.params.id= req.query.id;
        article.showById(req,res);
    }
});
app.get('/404',routes.notFound);
app.get('/', routes.index);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

exports.express =app;

