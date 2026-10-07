import cloudinary from 'cloudinary';
import fs from 'fs';

const uploadOnCloudinary = async (localFilePath) => {
  // Configure here (not at module level) so dotenv has already loaded
  // process.env values by the time this function is called.
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  try {
    const response = await cloudinary.v2.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "products",
    });
    fs.unlinkSync(localFilePath);
    console.log("Upload successful");
    return response;
  } catch (error) {
    console.log("Error uploading to Cloudinary:", error.message);
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    console.log('Cloudinary Delete Result:', result);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error('Error deleting image from Cloudinary');
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };