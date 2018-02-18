'use strict';
module.exports = (sequelize, DataTypes) => {
  var Visit = sequelize.define('Visit', {
    member_id: DataTypes.INTEGER,
    when: DataTypes.DATETIME,
    notes: DataTypes.TEXT
  }, {});
  Visit.associate = function(models) {
    // associations can be defined here
  };
  return Visit;
};