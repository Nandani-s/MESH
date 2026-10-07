import { Category } from "../models/category.js";
import { Product } from "../models/product.js";

// GET ALL CATEGORIES
// Includes a productCount for each category by counting matching products.
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    // Count products per category in one round-trip using aggregation,
    // then merge into the category list.
    const counts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => { countMap[c._id] = c.count; });

    const data = categories.map((cat) => ({
      ...cat.toObject(),
      productCount: countMap[cat.name] || 0,
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, status } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    const exists = await Category.findOne({ $or: [{ name }, { slug }] });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "A category with that name or slug already exists",
      });
    }

    const category = await Category.create({ name, slug, description, image, status });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { ...category.toObject(), productCount: 0 },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const { name, slug, description, image, status } = req.body;

    // If name or slug are changing, check they aren't already taken by another document.
    if (name || slug) {
      const conflict = await Category.findOne({
        $or: [
          ...(name ? [{ name }] : []),
          ...(slug ? [{ slug }] : []),
        ],
        _id: { $ne: req.params.id },
      });
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: "Another category with that name or slug already exists",
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug, description, image, status },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { getAllCategories, createCategory, updateCategory, deleteCategory };