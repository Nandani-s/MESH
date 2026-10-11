import cloudinary from 'cloudinary';
import fs from 'fs';

const uploadOnCloudinary = async (file, folder = "products") => {
  // Configure here (not at module level) so dotenv has already loaded
  // process.env values by the time this function is called.
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  try {
    const uploadOptions = { resource_type: "auto", folder };
    const response = Buffer.isBuffer(file)
      ? await new Promise((resolve, reject) => {
          cloudinary.v2.uploader
            .upload_stream(uploadOptions, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            })
            .end(file);
        })
      : await cloudinary.v2.uploader.upload(file, uploadOptions);

    if (typeof file === "string") {
      await fs.promises.unlink(file).catch((error) => {
        console.warn("Uploaded file could not be removed:", error.message);
      });
    }
    console.log("Upload successful");
    return response;
  } catch (error) {
    console.log("Error uploading to Cloudinary:", error.message);
    if (
      typeof file === "string" &&
      fs.existsSync(file)
    ) {
      await fs.promises.unlink(file).catch((cleanupError) => {
        console.error("Failed to clean up uploaded file:", cleanupError);
      });
    }
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