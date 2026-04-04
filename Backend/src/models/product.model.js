import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        productImage: {
            type: String,
            required: [true, "Product image is required"],
            trim: true,
        },
        productName: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: [2, "Product name must be at least 2 characters long"],
            maxlength: [120, "Product name cannot exceed 120 characters"],
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
            minlength: [2, "Category must be at least 2 characters long"],
            maxlength: [60, "Category cannot exceed 60 characters"],
        },
        costPrice: {
            type: Number,
            required: [true, "Cost price is required"],
            min: [0, "Cost price cannot be negative"],
        },
        sellingPrice: {
            type: Number,
            required: [true, "Selling price is required"],
            min: [0, "Selling price cannot be negative"],
            validate: {
                validator(value) {
                    return this.costPrice == null || value >= this.costPrice;
                },
                message: "Selling price cannot be less than cost price",
            },
        },
        stockQuantity: {
            type: Number,
            required: [true, "Stock quantity is required"],
            default: 0,
            min: [0, "Stock quantity cannot be less than 0"],
            validate: {
                validator: Number.isInteger,
                message: "Stock quantity must be a whole number",
            },
        },
        profitPercentage : {
            type : Number
        },
        totalValue : {
            type : Number
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Product owner is required"],
        },
    },
    {
        timestamps: true,
    }
);

productSchema.methods.calculateProfit = function () {
    if (this.costPrice === 0) return 100;
    const profitPercentage = ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;

    return Math.round(profitPercentage * 10) / 10;
};

productSchema.methods.calculateTotalValue = function () {
    return this.costPrice * this.stockQuantity;
};

export const Product = mongoose.model("Product", productSchema);
