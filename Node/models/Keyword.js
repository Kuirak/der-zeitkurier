module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Keyword', {
        order: {type: DataTypes.INTEGER, allowNull: false},
        word:{type:DataTypes.STRING,allowNull:false}

    });
};