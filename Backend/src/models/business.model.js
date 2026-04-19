import mongoose, { Schema } from "mongoose";

const businessSchema = new Schema(
    {
        profilePicture: {
            type: String,
            default: "https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-851.jpg?t=st=1775493915~exp=1775497515~hmac=440e87156c229c6e055f20e7c5bc9ad691e15419ac80271e5c407ff9d1dc7a41&w=1060",
        },
        businessName: {
            type: String,
            required: [true, "Business name is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Business description is required"],
            trim: true,
        },
        category : {
            type : String,
            required : [true , "Business Category is required"]
        },
        website: {
            type: String,
            trim: true,
        },
        location : {
            type: String,
            trim : true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        }
    },
    {
        timestamps: true,
    }
);

export const Business = mongoose.model("Business", businessSchema);