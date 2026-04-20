import mongoose, { Schema } from "mongoose";

const saleSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantitySold: {
            type: Number,
            required: true,
            min: [1, "Must sell at least 1 item"],
        },
        salePrice: {
            type: Number,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { 
        timestamps: true 
    }
);

export const Sale = mongoose.model("Sale", saleSchema);