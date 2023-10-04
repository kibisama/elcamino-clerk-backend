const Sequelize = require('sequelize');
class CardinalC2Invoice extends Sequelize.Model {
  static initiate(sequelize) {
    CardinalC2Invoice.init(
      {
        csoNumber: {
          type: Sequelize.STRING(9),
          allowNull: false,
        },
        orderNumber: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        orderDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        invoiceNumber: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        invoiceDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        ndcNumber: {
          type: Sequelize.STRING(11),
          allowNull: false,
        },
        tradeName: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        mfrName: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        strength: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        form: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        size: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        orderQty: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
        },
        shipQty: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: 'CardinalC2Invoice',
        tableName: 'cardinalC2Invoice',
        paranoid: false,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      },
    );
  }

  static associate(db) {}
}

module.exports = CardinalC2Invoice;
