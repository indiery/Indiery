const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Upload a POD photo buffer to S3.
 * @param {Buffer} fileBuffer
 * @param {string} mimetype
 * @param {string} orderId
 * @param {'pickup'|'drop'} stage
 * @returns {string} public URL
 */
async function uploadPOD(fileBuffer, mimetype, orderId, stage) {
  const key = `pod/${orderId}/${stage}-${uuidv4()}.jpg`;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
  };
  const result = await s3.upload(params).promise();
  return result.Location;
}

/**
 * Generate a presigned upload URL for direct client upload (optional flow).
 */
function presignedUploadUrl(orderId, stage) {
  const key = `pod/${orderId}/${stage}-${uuidv4()}.jpg`;
  return s3.getSignedUrl('putObject', {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Expires: 300, // 5 minutes
    ContentType: 'image/jpeg',
  });
}

module.exports = { uploadPOD, presignedUploadUrl };
