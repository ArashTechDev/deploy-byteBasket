module.exports = (sequelize, DataTypes) => {
  const FoodBank = sequelize.define('FoodBank', {
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    contactEmail: DataTypes.STRING,
    contactPhone: DataTypes.STRING,
    operatingHours: DataTypes.JSON,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT
  });

  return FoodBank;
};
