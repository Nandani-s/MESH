import multer from "multer"; // image handle krne k liye multer use krte hai, ye ek middleware hai jo multipart/form-data ko handle krta hai, jo ki file upload ke liye use hota hai.
import Path from "path"; // path module use krte hai file ke path ko handle krne k liye, jaise ki file ka naam, extension, etc.


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/products"); // ye line specify krti hai ki uploaded files ko kaha store krna hai, yaha pe humne "public/products" folder specify kiya hai.
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + Path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB — generous for a product photo, prevents abuse
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});