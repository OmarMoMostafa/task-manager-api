const multer = require("multer");

exports.createStorage = () => {
  return multer.diskStorage({
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
  });
};

// Set up Multer file filter to only allow PNG, JPG, and JPEG files
exports.fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG, JPG, and JPEG files are allowed!"));
  }
};

exports.multerUpload = (storage) => {
  return multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024, // 1 MB
    },
    fileFilter: this.fileFilter,
  });
};
