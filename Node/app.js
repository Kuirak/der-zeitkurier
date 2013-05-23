
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
app.enable('trust proxy');
app.use(express.basicAuth('zeitkurier','kurier-der-zeit'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler()); }

app.get('/resetdb',routes.resetdb);

app.get('/users', user.list);

app.post('/article/input',routes.article_input);
app.get('/article/input',routes.article_input_form);

app.get("/article/:id",routes.article_id);

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

exports.express =app;

