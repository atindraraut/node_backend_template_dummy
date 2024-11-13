const { Sequelize } = require('sequelize');
require('dotenv').config();

// Setting up the MySQL connection using environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,       // Database name
  process.env.DB_USER,       // Database username
  process.env.DB_PASSWORD,   // Database password
  {
    host: process.env.DB_HOST,    // Host
    port: process.env.DB_PORT,    // Port
    dialect: 'mysql',             // Using MySQL
    logging: false,               // Disable Sequelize logging
  }
);

// Test the DB connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
};

module.exports = { sequelize, testConnection };
