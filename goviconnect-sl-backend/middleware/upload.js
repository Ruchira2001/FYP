const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary storage for crop diagnosis images
const diagnosisStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'goviconnect/diagnoses',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 640, height: 480, crop: 'limit' }],
  },
});

// Cloudinary storage for profile avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'goviconnect/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
  },
});

// Cloudinary storage for chat attachments
const chatStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'goviconnect/chats',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

// Cloudinary storage for guide images
const guideStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'goviconnect/guides',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1024, height: 768, crop: 'limit' }],
  },
});

// Cloudinary storage for guide videos
const guideVideoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'goviconnect/guide-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  },
});

// Cloudinary storage for product images
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'goviconnect/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 600, height: 600, crop: 'limit' }],
  },
});

// File filter - images only
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// File filter - videos only
const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'), false);
  }
};

// Upload middleware creators
const uploadDiagnosis = multer({
  storage: diagnosisStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('image');

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('avatar');

const uploadChatImage = multer({
  storage: chatStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('image');

const uploadGuideImage = multer({
  storage: guideStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('image');

const uploadGuideImages = multer({
  storage: guideStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array('images', 5);

const uploadGuideVideos = multer({
  storage: guideVideoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB per video
}).array('videos', 5);

const uploadProductImage = multer({
  storage: productStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('image');

module.exports = {
  uploadDiagnosis,
  uploadAvatar,
  uploadChatImage,
  uploadGuideImage,
  uploadGuideImages,
  uploadGuideVideos,
  uploadProductImage,
};
