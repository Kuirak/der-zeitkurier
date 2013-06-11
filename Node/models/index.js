var Sequelize = require('sequelize-sqlite').sequelize
var sqlite    = require('sequelize-sqlite').sqlite

var sequelize = new Sequelize('zeitkurier', 'zeit', 'kurier', {
    dialect: 'sqlite',
    storage: 'models/articles_db.sqlite',
    omitNull: true
});

var models =[
    'Article',
    'Category',
    'Keyword',

];

models.forEach(function(model){
    module.exports[model] =sequelize.import(__dirname + '/'+model);
});


(function(m){
    m.Article.hasMany(m.Category);
    m.Category.hasMany(m.Article);
    m.Article.hasMany(m.Keyword);
    m.Keyword.belongsTo(m.Article);

    sequelize.sync();
})(module.exports);

module.exports.sequelize =sequelize;