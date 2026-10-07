import { Product } from "../models/product.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";


// CREATE PRODUCT
const createProduct = async (req, res) => {

  try {

    const {
      name,
      description,
      brand,
      category,
      priceCurrency,
      availability,
    } = req.body;

    // Cast numeric fields explicitly — multipart sends everything as strings
    const price = req.body.price ? Number(req.body.price) : undefined;
    const stock = req.body.stock ? Number(req.body.stock) : undefined;
    const originalPrice = req.body.originalPrice ? Number(req.body.originalPrice) : null;

    // VALIDATION
    if (
      !name ||
      !description ||
      !brand ||
      !category ||
      !price
    ) {

      return res.status(400).json({
        success: false,
        message: "All required fields are required"
      });

    }

    // CHECK IMAGE
    if (!req.file) {

      return res.status(400).json({
        success: false,
        message: "Image is required"
      });

    }

    // UPLOAD IMAGE TO CLOUDINARY
    const uploadedImage = await uploadOnCloudinary(req.file.path);
    if (!uploadedImage) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image"
      });
    }
    console.log("Uploaded image:", uploadedImage.secure_url);




    // CREATE PRODUCT
    const product = await Product.create({
      name,
      description,
      brand,
      category,
      price,
      originalPrice,
      priceCurrency,
      availability,
      stock,
      image: uploadedImage.secure_url,
      imagePublicId: uploadedImage.public_id,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });

  } catch (error) {

    console.error("createProduct error:", error);

    return res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message
    });

  }

};


// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {

  try {

    const products = await Product.find();

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


// GET SINGLE PRODUCT
const getProductById = async (req, res) => {

  try {

    const product = await Product.findById(req.params.id);

    if (!product) {

      return res.status(404).json({
        success: false,
        message: "Product not found"
      });

    }

    return res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


// UPDATE PRODUCT
const updateProduct = async (req, res) => {

  try {

    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const updateData = { ...req.body };

    // Multipart form data sends all fields as strings.
    // Explicitly cast numeric fields so Mongoose stores the right type.
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
    if (updateData.originalPrice !== undefined && updateData.originalPrice !== '') {
      updateData.originalPrice = Number(updateData.originalPrice);
    } else if (updateData.originalPrice === '') {
      updateData.originalPrice = null; // clear the field if empty string sent
    }

    // If a new image file was uploaded, replace the old one on Cloudinary.
    if (req.file) {
      const uploadedImage = await uploadOnCloudinary(req.file.path);

      if (!uploadedImage) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload image"
        });
      }

      updateData.image = uploadedImage.secure_url;
      updateData.imagePublicId = uploadedImage.public_id;

      // Clean up the old image now that the new one is confirmed uploaded.
      if (existingProduct.imagePublicId) {
        await deleteFromCloudinary(existingProduct.imagePublicId).catch((err) =>
          console.error("Failed to delete old product image:", err.message)
        );
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


// DELETE PRODUCT
const deleteProduct = async (req, res) => {

  try {

    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {

      return res.status(404).json({
        success: false,
        message: "Product not found"
      });

    }

    if (deletedProduct.imagePublicId) {
      await deleteFromCloudinary(deletedProduct.imagePublicId).catch((err) =>
        console.error("Failed to delete product image from Cloudinary:", err.message)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};