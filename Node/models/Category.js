module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Category', {
        title: {type: DataTypes.STRING, allowNull: false}

    });
};

