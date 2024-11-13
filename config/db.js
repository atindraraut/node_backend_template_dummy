const { Sequelize } = require('sequelize');
const AWS = require('aws-sdk');
require('dotenv').config();

// Set up AWS Secrets Manager client
const secretsManager = new AWS.SecretsManager({
  region: process.env.AWS_REGION || 'us-east-1', // Default to 'us-east-1' if AWS_REGION is not set
});

// Function to retrieve DB credentials from AWS Secrets Manager
const getDbCredentials = async (secretName) => {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    if (data.SecretString) {
      const secret = JSON.parse(data.SecretString);  // Parse the secret JSON string
      return secret;
    } else {
      throw new Error('Secret is not in expected format');
    }
  } catch (err) {
    console.error('Unable to retrieve DB credentials from Secrets Manager:', err);
    throw err;
  }
};

// Define an async function to set up the database connection
const setupDatabaseConnection = async () => {
  const secretName = process.env.DB_SECRET_NAME; // Name of the secret stored in AWS Secrets Manager

  if (!secretName) {
    throw new Error('DB_SECRET_NAME environment variable is not set');
  }

  try {
    // Fetch the database credentials from Secrets Manager
    const dbCredentials = await getDbCredentials(secretName);
    console.log(dbCredentials);
    // Destructure the credentials from the secret
    const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = dbCredentials;

    // Set up Sequelize using the credentials retrieved from Secrets Manager
    const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: 'mysql',  // or 'postgres', 'sqlite', 'mssql', etc.
      logging: false,    // Optional: disable Sequelize logging
    });

    // Test the DB connection (optional but good practice)
    const testConnection = async () => {
      try {
        await sequelize.authenticate();
        console.log('Database connected!');
      } catch (err) {
        console.error('Unable to connect to the database:', err);
      }
    };

    // Return the sequelize instance and the testConnection function
    return { sequelize, testConnection };
  } catch (err) {
    console.error('Error setting up database connection:', err);
    throw err;
  }
};

// Export the function to set up the database connection
module.exports = { setupDatabaseConnection };
