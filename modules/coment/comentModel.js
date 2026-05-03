const { DatTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Coment = sequelize.define("Coment",
    {
        id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        content:    { type: DataTupes.TEXT, allowNull: false },
        userId:     { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
        videoId:    { type: DataTypes.INTEGER, allowNull: false, references: { model: "videos", key: "id" } }
    },
    {
        tableName: "comments",
        timestamps: true
    }
);