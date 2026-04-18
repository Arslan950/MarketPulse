import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import { Product } from "../models/product.model.js";
import { Business } from "../models/business.model.js";
import Groq from "groq-sdk";

const conversationHistories = new Map();

const MAX_HISTORY = 10;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(systemPrompt, conversationHistory) {
    return groq.chat.completions.create({
        messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.95,
    });
}

async function getGroqPriceSuggestion(systemPrompt) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: systemPrompt,
            },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.4,
        max_tokens: 150,
        top_p: 0.9,
    })
}

const businessCopilot = asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        throw new ApiError(401, "Unable to get prompt from user");
    }

    const userId = req.user._id.toString();

    if (!conversationHistories.has(userId)) {
        conversationHistories.set(userId, []);
    }
    const conversationHistory = conversationHistories.get(userId);

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

    const systemPrompt = `You are a professional market advisor with deep expertise across all types of business markets — retail, wholesale, e-commerce, services, manufacturing, hospitality, and more.

You have been assigned exclusively to assist with business-related inquiries for the business described below.

════════════════════════════════════════
BUSINESS CONTEXT
════════════════════════════════════════
${businessString}

════════════════════════════════════════
INVENTORY / SERVICES CONTEXT
════════════════════════════════════════
${inventoryString}

════════════════════════════════════════
YOUR ROLE
════════════════════════════════════════
You help the owner with:
- Market analysis and competitor insights
- Pricing strategies based on existing inventory/services
- Sales and revenue growth recommendations
- Demand forecasting and trend identification
- Inventory optimization and restocking advice
- Customer segmentation and targeting
- Promotional and marketing strategy
- Supply chain and operational market advice

════════════════════════════════════════
STRICT RULES — FOLLOW EXACTLY
════════════════════════════════════════

RULE 1 — BUSINESS SCOPE ONLY:
You are permitted to answer ONLY questions that are directly related to the business and market context provided above.
If the user asks anything outside of business topics (e.g., general knowledge, personal advice, coding, entertainment, science, politics, or any unrelated subject), you must respond with exactly:
"I'm sorry, I have been assigned solely to answer business-related questions for this business. I'm unable to help with that topic."
Do not attempt to partially answer off-topic questions.

RULE 2 — NO HALLUCINATION — CRITICAL:
You must NEVER invent, assume, or fabricate:
- Products or services not listed in the inventory context
- Business details not stated in the business context
- Prices, quantities, SKUs, or categories that were not provided
- Suppliers, partners, or customers that were not mentioned
If the user asks about a product or detail that does not exist in the provided context, respond with:
"That item or detail doesn't appear in the business information I've been provided. I can only advise based on what's been shared with me."

RULE 3 — CONTEXT IS YOUR ONLY SOURCE OF TRUTH:
Your advice must always be grounded in the provided business and inventory context. External market benchmarks and general best practices may be referenced as supporting insights only.

RULE 4 — PROFESSIONAL TONE:
Speak naturally as if you already know this business. Never mention JSON, databases, prompts, or "the data provided". Be concise and actionable.

RULE 5 — CLARIFY BEFORE ASSUMING:
If a business-related question is ambiguous and cannot be answered without assumptions, ask a brief clarifying question rather than guessing.`;

    conversationHistory.push({ role: "user", content: prompt });

    if (conversationHistory.length > MAX_HISTORY) {
        conversationHistory.splice(0, conversationHistory.length - MAX_HISTORY);
    }

    const response = await getGroqChatCompletion(systemPrompt, conversationHistory);

    if (!response) {
        throw new ApiError(400, "Unable to get response from Groq");
    }

    const responseMessage = response.choices[0]?.message?.content;

    conversationHistory.push({ role: "assistant", content: responseMessage });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { responseMessage }, "Response fetched successfully")
        );
});

const clearCopilotHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    conversationHistories.delete(userId);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Conversation history cleared"));
});

const priceSuggestion = asyncHandler(async (req, res) => {
    const { productName, quantity, costPrice, userInstruction } = req.body;

    if (!productName) {
        throw new ApiError(400, "Product name is required and must be a string");
    }

    if (quantity === undefined) {
        throw new ApiError(400, "Quantity is required and must be a valid number");
    }

    if (costPrice === undefined) {
        throw new ApiError(400, "Cost price is required and must be a valid number");
    }

    const businessInfo = await Business.findOne({ owner: req.user._id }).select(
        "-_id -profilePicture -website -owner -createdAt -updatedAt -__v"
    );

    if (!businessInfo) {
        throw new ApiError(404, "Business profile not found. Please set up your business first.");
    }

    const businessString = JSON.stringify(businessInfo);

    const systemPrompt = `You are a professional pricing strategist.

    --- BUSINESS CONTEXT ---
    ${businessString}

    --- PRODUCT DETAILS ---
    Product Name: ${productName}
    Cost Price: ${costPrice} INR
    Quantity: ${quantity}
    Special Instruction: ${userInstruction || "None"}

    --- INSTRUCTIONS ---
    - Suggest ONE specific selling price in INR only
    - Factor in the business location and market from the business context
    - Profit margin must be realistic for this business type and local market
    - Never suggest a price below or equal to the cost price
    - Do NOT repeat any business info, product name, or input data back
    - Do NOT add any intro line, greeting, or explanation before the format below
    - Do NOT give ranges — one exact number only

    --- RESPOND IN EXACTLY THIS FORMAT, NOTHING BEFORE OR AFTER ---
    Suggested Price: [number only, e.g. 1200]
        Reasoning: [2-3 lines max]`;

    const response = await getGroqPriceSuggestion(systemPrompt);

    const responseMessage = response.choices[0]?.message?.content;

    return res
        .status(200)
        .json(
            new ApiResponse(200, { responseMessage }, "Price Suggested succesfully")
        )
});

export {
    businessCopilot,
    clearCopilotHistory,
    priceSuggestion
}