module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Article', {
        title: {type: DataTypes.STRING, allowNull: false},
        date: {type: DataTypes.STRING, allowNull: false,validate:{isDate:true}},
        article: {type: DataTypes.TEXT, allowNull: false},
        primary:{type: DataTypes.BOOLEAN,allowNull: false},
        printed_count:{type: DataTypes.INTEGER,defaultValue:0}
    })
};
