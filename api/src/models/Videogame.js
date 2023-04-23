const { DataTypes, UUIDV4 } = require("sequelize");
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define(
    "videogame",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
      },
      image: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
      },
      platforms: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      released: {
        type: DataTypes.DATEONLY,
      },
      rating: {
        type: DataTypes.INTEGER,
        validate: {
          min: 1,
          max: 5,
        },
      },
    },
    {
      timestamps: false,
    }
  );
};
