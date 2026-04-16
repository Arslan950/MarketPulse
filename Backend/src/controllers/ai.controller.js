import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import { Product } from "../models/product.model.js";
import { Business } from "../models/business.model.js";
import Groq from "groq-sdk";

async function getGroqChatCompletion(prompt) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.95,
    });
}


const businessCopilot = asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        throw new ApiError(401, "Unable to get prompt from user")
    }
    const inventoryItems = await Product.find({ owner: req.user._id }).select(
        "-_id -productImage -owner -createdAt -updatedAt -__v"
    );

    const inventoryString = inventoryItems.length > 0
        ? JSON.stringify(inventoryItems)
        : "Inventory is currently empty.";

    const businessInfo = await Business.findOne({ owner: req.user._id }).select(
        "-_id -profilePicture -website -owner -createdAt -updatedAt -__v"
    );

    if (!businessInfo) {
        throw new ApiError(404, "Business profile not found. Please set up your business first.");
    }

    const businessString = JSON.stringify(businessInfo);

    const masterPrompt = `
You are MarketPul$e Business Copilot — a concise, professional AI that helps the owner maximize profit, manage inventory, and make data-driven decisions.

--- BUSINESS CONTEXT ---
${businessString}

--- CURRENT INVENTORY DATA ---
${inventoryString}

--- STRICT RULES (follow exactly) ---
• Answer the owner's query directly, concisely, and professionally. Keep responses short and actionable.
• Use ONLY the data above. Never invent products, numbers, or details.
• Speak naturally as if you already know the business — never mention JSON, databases, prompts, or "the data provided".
• For pricing or restocking advice, briefly explain the logic (e.g., "Stock is low and cost is high, so...").
• If the query is unrelated to business or inventory, reply exactly: "Sorry, I can only help with your business and inventory questions."

--- USER QUERY ---
"${prompt}"
`;

    const response = await getGroqChatCompletion(masterPrompt);

    if (!response) {
        throw new ApiError(400, "Unable to get response from groq")
    }

    const responseMessage = response.choices[0]?.message?.content;

    return res
        .status(200)
        .json(
            new ApiResponse(200, { responseMessage }, "Response fetched succesfully")
        )

});

export {
    businessCopilot,
}