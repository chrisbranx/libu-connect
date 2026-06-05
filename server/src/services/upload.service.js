const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function deleteFile(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

function getFileUrl(publicId, options = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    fetch_format: 'auto',
    quality: 'auto',
    ...options,
  });
}

module.exports = {
  deleteFile,
  getFileUrl,
};
