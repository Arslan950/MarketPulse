import mongoose, { Schema } from "mongoose";

const saleSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        customerPhoneNumber: {
            type: String,
        },
        items: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                productName: { 
                    type: String, required: true 
                },
                quantitySold: {
                    type: Number,
                    required: true,
                    min: [1, "Must sell at least 1 item"],
                },
                salePrice: {
                    type: Number,
                    required: true,
                }
            }
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        discount: {
            type: Number,
            default: 0,
        },
        finalAmount: {
            type: Number,
            required: true,
        }
    },
    { 
        timestamps: true 
    }
);

export const Sale = mongoose.model("Sale", saleSchema);