import { Product } from "../models/product.js";
import { Subscriber } from "../models/subscriber.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

const sendSaleNotifications = async (product) => {
  const subscribers = await Subscriber.find({
    $or: [{ status: "active" }, { status: { $exists: false } }],
  }).select("email").lean();

  if (subscribers.length === 0) {
    return { sent: 0, failed: 0, message: "No active subscribers to notify." };
  }

  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
  const productUrl = escapeHtml(`${frontendUrl}/product/${product._id}`);
  const newsletterUrl = escapeHtml(`${frontendUrl}/#newsletter`);
  const safeName = escapeHtml(product.name);
  const currency = escapeHtml(product.priceCurrency || "RS");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#292524;">
      <h1 style="color:#be185d;">A MESH favorite is on sale</h1>
      <p><strong>${safeName}</strong> is now available at a special price.</p>
      <p style="font-size:20px;">
        <strong>${currency} ${Number(product.price).toFixed(2)}</strong>
        <span style="color:#78716c;text-decoration:line-through;margin-left:8px;">${currency} ${Number(product.originalPrice).toFixed(2)}</span>
      </p>
      <p><a href="${productUrl}" style="display:inline-block;padding:12px 20px;background:#be185d;color:#fff;text-decoration:none;border-radius:8px;">Shop the sale</a></p>
      <p style="font-size:12px;color:#78716c;">To stop receiving these emails, visit <a href="${newsletterUrl}">newsletter preferences</a> and choose Unsubscribe.</p>
    </div>
  `;
  const batches = [];
  for (let index = 0; index < subscribers.length; index += 50) {
    batches.push(subscribers.slice(index, index + 50).map(({ email }) => email));
  }

  let sent = 0;
  let failed = 0;
  for (const bcc of batches) {
    const result = await sendEmail({
      to: process.env.EMAIL_USER,
      bcc,
      subject: "A MESH product is on sale",
      html,
    });
    if (result.success) sent += bcc.length;
    else {
      failed += bcc.length;
      console.error(`Sale notification batch failed for product ${product._id}:`, result.error);
    }
  }

  return {
    sent,
    failed,
    message: failed === 0
      ? `Sale notification sent to ${sent} subscriber${sent === 1 ? "" : "s"}.`
      : `Sale notification failed for ${failed} subscriber${failed === 1 ? "" : "s"}.`,
  };
};


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

    const nextPrice = updateData.price ?? existingProduct.price;
    const nextOriginalPrice = updateData.originalPrice !== undefined
      ? updateData.originalPrice
      : existingProduct.originalPrice;
    if (nextOriginalPrice !== null && nextOriginalPrice !== undefined && nextOriginalPrice !== "") {
      if (!Number.isFinite(Number(nextOriginalPrice)) || Number(nextOriginalPrice) <= Number(nextPrice)) {
        return res.status(400).json({
          success: false,
          message: "Original price must be greater than the sale price.",
        });
      }
    }
    const isEnteringSale = !(existingProduct.originalPrice > existingProduct.price)
      && nextOriginalPrice > nextPrice;

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

    let notification;
    if (isEnteringSale) {
      try {
        notification = await sendSaleNotifications(updatedProduct);
      } catch (error) {
        console.error(`Sale notifications failed for product ${updatedProduct._id}:`, error);
        notification = {
          sent: 0,
          failed: null,
          message: "Product was updated, but sale notifications could not be sent. Check the server logs.",
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
      ...(notification ? { notification } : {}),
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