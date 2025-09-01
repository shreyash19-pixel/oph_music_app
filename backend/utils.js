// src/utils/s3.js
const AWS = require('aws-sdk');
require("dotenv").config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const uploadToS3 = async (file, folder) => {
  console.log(file[0]);
  
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

const uploadToS3Form = async (file, folder) => {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `${folder}/${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

// Function to read data from S3
const readFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key
    };

    try {
      const result = await s3.getObject(params).promise();
      return JSON.parse(result.Body.toString('utf8'));
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        console.log(`No existing file found in S3: ${key}`);
        return {};
      }
      throw error;
    }
  } catch (err) {
    console.error('Error reading from S3:', err.message);
    return {};
  }
};

// Function to save data to S3
const saveToS3 = async (key, data) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json'
    };

    const result = await s3.upload(params).promise();
    console.log(`✅ File uploaded to S3: ${result.Location}`);
    return result.Location;
  } catch (err) {
    console.error('Error saving to S3:', err.message);
    throw err;
  }
};

// Function to delete data from S3
const deleteFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key
    };

    const result = await s3.deleteObject(params).promise();
    console.log(`✅ File deleted from S3: ${key}`);
    return result;
  } catch (err) {
    console.error('Error deleting from S3:', err.message);
    throw err;
  }
};

module.exports = { uploadToS3, uploadToS3Form, readFromS3, saveToS3, deleteFromS3 };