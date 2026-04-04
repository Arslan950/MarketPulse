import { Product } from "../models/product.model.js"
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"

const addProduct = asyncHandler(async (req, res) => {
    const { productName, productImage, category, costPrice, sellingPrice, stockQuantity } = req.body;

    const existingProduct = await Product.findOne({
        $and: [{ productName }, { category }]
    });

    if (existingProduct) {
        throw new ApiError(401, "This product is already in Inventory")
    }

    const product = await Product.create({
        productImage,
        productName,
        category,
        costPrice,
        sellingPrice,
        stockQuantity,
        owner: req.user._id
    })

    if (!product) {
        throw new ApiError(401, "Something went wrong while adding a product")
    }

    const profitPercentageCalculated = product.calculateProfit();
    const totalValueCalculated = product.calculateTotalValue();

    product.profitPercentage = profitPercentageCalculated;
    product.totalValue = totalValueCalculated;

    await product.save({ validateBeforeSave: false });
    const productData = product.toJSON();

    return res
        .status(200)
        .json(
            new ApiResponse(200,
                { productData },
                "Product added succesfully !")
        )
});

const getProducts = asyncHandler(async (req, res) => {

    const products = await Product.find({ owner: req.user._id });

    if (!products) {
        throw new ApiError(449, "Failed to fetch product list")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, { products }, "Product list fetched succesfully")
        )
});

const removeProduct = asyncHandler(async (req, res) => {
    const { productID } = req.params;

    if (!productID) {
        throw new ApiError(451, "Product Id was not found")
    }

    const products = await Product.findOneAndDelete({
        _id: productID,
        owner: req.user._id
    });

    if (!products) {
        throw new ApiError(452, "Failed to delete the product")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Product deleted successfully")
        );

});

const updateProductInfo = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { productImage, productName, category, sellingPrice, costPrice, stockQuantity } = req.body;

    const updateData = {};

    if (productName) updateData.productName = productName;
    if (productImage) updateData.productImage = productImage;
    if (category) updateData.category = category;
    if (costPrice !== undefined) updateData.costPrice = costPrice;
    if (sellingPrice !== undefined) updateData.sellingPrice = sellingPrice;
    if (stockQuantity !== undefined) updateData.stockQuantity = stockQuantity;

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "Please provide at least one field to update");
    }

    const updatedProduct = await Product.findOneAndUpdate(
        {
            _id : productId,
            owner : req.user._id
        },
        {
            $set : updateData
        },
        {
            returnDocument : "after",
            runValidators : true
        }
    );

    if (!updatedProduct) {
        throw new ApiError(404, "Product not found or you do not have permission to edit it");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { product: updatedProduct }, "Product updated successfully")
        );
});

export {
    addProduct,
    getProducts,
    removeProduct,
    updateProductInfo
}