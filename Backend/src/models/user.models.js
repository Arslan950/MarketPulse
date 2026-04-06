import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const UserSchema = new Schema({
    profilePicture : {
        type : String ,
        default : "https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-851.jpg?t=st=1775493915~exp=1775497515~hmac=440e87156c229c6e055f20e7c5bc9ad691e15419ac80271e5c407ff9d1dc7a41&w=1060",
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8
    },
    businessInfo : {
        businessName : {
            type : String,
        },
        description : {
            type : String ,
        },
        websiteURL : {
            type : String
        }
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpires: {
        type: Date
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, {
    timestamps: true
});

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) { return }

    this.password = await bcrypt.hash(this.password, 10);
    
});

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password);
};

UserSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email : this.email
        },
        process.env.ACCESS_TOKEN_SECRET,  
        {expiresIn : process.env.ACCESS_TOKEN_EXPIRY}
    )
};

UserSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn : process.env.REFRESH_TOKEN_EXPIRY}
    )
};

UserSchema.methods.generateTemporaryToken= function(){
    const unHashedToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");

    const tokenExpiry = Date.now() + (20*60*1000);
    return {unHashedToken , hashedToken , tokenExpiry};
}

export const User = mongoose.model("User", UserSchema);