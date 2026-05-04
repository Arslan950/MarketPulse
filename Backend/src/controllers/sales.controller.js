import mongoose from "mongoose";
import { Sale } from "../models/sale.model.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const cartSell = asyncHandler(async (req, res) => {

    const { items, customerPhoneNumber, discount = 0, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Add at atleast 1 item in cart")
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let totalAmount = 0;
        const saleItems = [];

        for (const item of items) {
            const product = await Product.findOne({
                _id: item.productId,
                owner: req.user._id
            }).session(session);

            if (!product) {
                throw new ApiError(401, "Product was not found !")
            }

            if (product.stockQuantity < item.quantity) {
                throw new ApiError(402, `Insufficient stock for ${product.productName}`);
            }

            const itemsTotal = item.quantity * product.sellingPrice;

            saleItems.push({
                product: product._id,
                productName : product.productName ,
                quantitySold: item.quantity,
                salePrice: product.sellingPrice,
            });

            product.stockQuantity -= item.quantity;
            await product.save({
                session,
                validateBeforeSave: false
            });

            totalAmount += itemsTotal;
        }

        let finalDiscount = discount;
        if (couponCode === "MARKETPULSE500") {
            finalDiscount = 500;
        }

        const finalAmount = totalAmount - finalDiscount;

        const sales = await Sale.create([{
            owner: req.user._id,
            items: saleItems,
            totalAmount,
            discount: finalDiscount,
            finalAmount,
            customerPhoneNumber
        }], { session })

        await session.commitTransaction();

        return res
            .status(200)
            .json(
                new ApiResponse(200, sales[0], "Bill created successfully & stock updated")
            )

    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(400, `Something went wrong ${error}`)
    } finally {
        session.endSession();
    }
});

const quickSell = asyncHandler(async (req, res) => {
    const { productId, quantitySold } = req.body;

    if (!productId || !quantitySold) {
        throw new ApiError(400, "Product ID and quantity sold are required");
    }

    const product = await Product.findOne({ _id: productId, owner: req.user._id });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (product.stockQuantity < quantitySold) {
        throw new ApiError(400, "Insufficient stock to complete this sale");
    }

    const sale = await Sale.create({
        owner: req.user._id,
        items: [
            {
                product: productId,
                productName : product.productName ,
                quantitySold: Number(quantitySold),
                salePrice: product.sellingPrice
            }
        ],
        totalAmount: Number(quantitySold) * product.sellingPrice,
        discount: 0,
        finalAmount: Number(quantitySold) * product.sellingPrice
    });

    if (!sale) {
        throw new ApiError(500, "Failed to record the sale in the database");
    }

    const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, owner: req.user._id },
        { $inc: { stockQuantity: -Number(quantitySold) } },
        { returnDocument: 'after', runValidators: true }
    );

    updatedProduct.totalValue = updatedProduct.calculateTotalValue();
    await updatedProduct.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, { sale, updatedProduct }, "Sale recorded successfully")
    );
});

const getDashboardStats = asyncHandler(async (req, res) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todaysRevenueAggregation, profitByCategoryAggregation, lowStockProducts] = await Promise.all([
        Sale.aggregate([
            {
                $match: {
                    owner: req.user._id,
                    createdAt: {
                        $gte: startOfToday,
                        $lte: new Date(),
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    todaysRevenue: { $sum: "$totalAmount" },
                },
            },
        ]),
        Product.aggregate([
            {
                $match: {
                    owner: req.user._id,
                },
            },
            {
                $group: {
                    _id: "$category",
                    value: {
                        $sum: {
                            $multiply: [
                                { $subtract: ["$sellingPrice", "$costPrice"] },
                                "$stockQuantity",
                            ],
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    value: 1,
                },
            },
            {
                $sort: {
                    value: -1,
                    name: 1,
                },
            },
        ]),
        Product.find({ owner: req.user._id })
            .sort({ stockQuantity: 1, productName: 1 })
            .limit(5)
            .select("productName stockQuantity")
            .lean(),
    ]);

    const todaysRevenue = todaysRevenueAggregation[0]?.todaysRevenue ?? 0;
    const profitByCategory = profitByCategoryAggregation.map((item) => ({
        name: item.name || "Uncategorized",
        value: Number(item.value ?? 0),
    }));
    const lowStockItems = lowStockProducts.map((product) => ({
        name: product.productName,
        stockQuantity: Number(product.stockQuantity ?? 0),
    }));

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    todaysRevenue,
                    profitByCategory,
                    lowStockItems,
                },
                "Dashboard stats fetched successfully"
            )
        );
});

export {
    quickSell,
    getDashboardStats,
    cartSell
};
