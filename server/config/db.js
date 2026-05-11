const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
      ca: (function() {
        if (process.env.DB_CA_CONTENT) {
          console.log('SSL: Using CA certificate from environment variable.');
          return process.env.DB_CA_CONTENT;
        }
        const localCaPath = path.join(__dirname, '../ca.pem');
        if (fs.existsSync(localCaPath)) {
          console.log('SSL: Using CA certificate from local file.');
          return fs.readFileSync(localCaPath).toString();
        }
        console.warn('SSL Warning: No CA certificate found in environment or local file!');
        return null;
      })()
    }
  }
});

module.exports = sequelize;
