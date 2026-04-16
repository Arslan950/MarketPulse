import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import { Product } from "../models/product.model.js";
import { Business } from "../models/business.model.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const main = async (passedPrompt) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: passedPrompt,
    });

    if(!response){
        throw new ApiError(500,"Unable to get the response from LLM");
    }

    return response.text ;
};

const businessCopilot = asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        throw new ApiError(400, "User prompt is required.");
    }

    const inventoryItems = await Product.find({ owner: req.user._id }).select(
        "-_id -productImage -owner -createdAt -updatedAt -__v"
    )

    const inventoryString = inventoryItems.length > 0 ? JSON.stringify(inventoryItems) : "Inventory is currently empty";

    const businessInfo = await Business.findOne({ owner: req.user._id }).select(
        "-_id -profilePicture -website -owner -createdAt -updatedAt -__v"
    )

    if (!BusinessInfo) {
        throw new ApiError(404, "failed to fetch users business info");
    }

    const businessString = JSON.stringify(businessInfo);

    const masterPrompt = `
         You are the "MarketPul$e Business Copilot", an expert AI assistant built to help this business owner maximize profit margins, manage inventory, and   make data-driven decisions.

        --- BUSINESS CONTEXT ---
        ${businessString}

         --- CURRENT INVENTORY DATA ---
         ${inventoryString}
     
         --- STRICT INSTRUCTIONS ---
        1. You are talking directly to the business owner. Answer their query concisely and professionally.
        2. Base your analysis EXACTLY on the inventory data provided above. Do not invent products or numbers.
        3. NEVER mention that you are reading from a "JSON array", "database", or "prompt". Act naturally, as if you inherently know the state of the business.
        4. If advising on pricing or restocking, briefly explain the business logic behind your suggestion (e.g., "Since your stock is low and cost is $X, I      recommend...").
        5. If the user asks about something completely unrelated to their business or inventory, just answer it by saying sorry i have been assigned to        answer      realted to business.
     
         --- USER QUERY ---
         "${prompt}"
    `;
    
    const incomingResponse = await main(masterPrompt);

    return res
        .status(200)
        .json(
            new ApiResponse(200,{incomingResponse},"Response fetched succesfully !")
        )
});



export{
    businessCopilot,
}

