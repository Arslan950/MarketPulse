import mongoose, { Schema } from "mongoose"

const wholeSalerSchema = new Schema(
    {
        itemName: {
            type: String,
            required: [true, "Item name is required"]
        },
        category: {
            type: String,
            required: [true, "Category is required"]
        },
        unitsAvailable: {
            type: Number,
            required: [true, "Units available is required "]
        },
        supplierName: {
            type: String,
            required: true
        },
        wholesalePrice: {
            type: Number,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Product owner is required"],
        },
    },
    {
        timestamps: true
    });

export const WholeSaler = mongoose.model("WholeSaler", wholeSalerSchema);