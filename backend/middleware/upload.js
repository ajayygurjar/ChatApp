const multer = require("multer");
const { Upload } = require("@aws-sdk/lib-storage");
const s3 = require("../config/s3");
require("dotenv").config();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadToS3 = async (file) => {
  const key = `uploads/${Date.now()}-${file.originalname}`;
  const uploader = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    },
  });
  await uploader.done();
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

module.exports = { upload, uploadToS3 };
