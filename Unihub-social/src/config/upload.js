const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Files are written into Unihub-backend's uploads/ directory so its existing
// static /uploads route can serve them. See UPLOADS_DIR in .env.example -
// in production this must be a Docker volume shared with the Unihub-backend
// container; this service never serves the files itself. Default assumes
// this service lives at Unihub-core/Unihub-social (sibling of Unihub-backend
// one level up from Unihub-core).
const uploadsDir = path.resolve(
  __dirname,
  "../../",
  process.env.UPLOADS_DIR || "../../Unihub-backend/uploads",
);
const avatarsDir = path.join(uploadsDir, "avatars");
const postsDir = path.join(uploadsDir, "posts");

[uploadsDir, avatarsDir, postsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const publicBaseUrl = (
  process.env.UPLOADS_PUBLIC_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

const toPublicUrl = (subfolder, filename) =>
  `${publicBaseUrl}/uploads/${subfolder}/${filename}`;

const makeFilename = (prefix, file) => {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`;
};

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = file.mimetype.startsWith("image/");

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only JPG, PNG, GIF, and WEBP images are allowed!"));
};

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => cb(null, makeFilename("avatar", file)),
});

const postMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, postsDir),
  filename: (req, file, cb) => cb(null, makeFilename("post", file)),
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("avatar");

const uploadPostMedia = multer({
  storage: postMediaStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 4 },
}).array("media", 4);

module.exports = {
  uploadAvatar,
  uploadPostMedia,
  toPublicUrl,
};
