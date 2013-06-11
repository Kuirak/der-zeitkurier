module.exports = function(sequelize,DataTypes){
    return sequelize.define('Rating',{
        rating:{type:DataTypes.INTEGER,validate:{max:5,min:0}}
    })
};