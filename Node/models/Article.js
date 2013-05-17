module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Article', {
        title: {type: DataTypes.STRING, allowNull: false},
        date: {type: DataTypes.DATE, allowNull: false},
        article: {type: DataTypes.TEXT, allowNull: false},
        gapped:{type: DataTypes.BOOLEAN,allowNull: false}

    })
};
