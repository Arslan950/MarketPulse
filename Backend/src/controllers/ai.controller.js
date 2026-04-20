import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import { Product } from "../models/product.model.js";
import { Business } from "../models/business.model.js";
import Groq from "groq-sdk";
import axios from "axios"

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

async function getGroqTrendingSuggestion(systemPrompt) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 1024,
    })
}

async function fetchImages(names) {
    try {
        const imagePromises = names.map(async (itemsName) => {
            const response = await axios.get(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(itemsName)}&per_page=1&orientation=landscape`,
                {
                    headers: {
                        Authorization: process.env.PEXELS_API_KEY
                    }
                }
            );

            const data = response.data;
            const imgUrl = data.photos && data.photos.length > 0
                ? data.photos[0].src.medium
                : null;

            return {
                productName: itemsName,
                imageURL: imgUrl
            };
        });

        const finalResult = await Promise.all(imagePromises);

        return finalResult;

    } catch (error) {
        console.error("Failed to fetch images:", error.message);
        return [];
    }
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

const trendingItemsSuggestion = asyncHandler(async (req, res) => {
    const businessInfo = await Business.findOne({ owner: req.user._id }).select(
        "businessName category description -_id"
    );

    if (!businessInfo) {
        throw new ApiError(404, "Business profile not found. Please set up your business first.");
    }

    const bName = businessInfo.businessName || "The Business";
    const bCategory = businessInfo.category || "General Retail";
    const bDesc = businessInfo.description || "A retail business looking for new inventory.";

const systemPrompt = `You are an automated Business Trend Forecaster API.
Your job is to analyze the business and return EXACTLY 8 trending, revenue-generating offerings.

BUSINESS:
Name: ${bName}
Category: ${bCategory}
Description: ${bDesc}

CRITICAL RULES:
1. REVENUE OFFERINGS ONLY: Suggest ONLY what this business can SELL to its clients or customers. 
   - If retail/product: Suggest trending physical inventory.
   - If service/logistics: Suggest trending new services or value-add offerings.
2. NO BUSINESS EQUIPMENT: NEVER suggest operational tools, equipment, or software used to run the business (e.g., NO trucks, NO forklifts, NO POS systems).
3. NO DUPLICATES OR EQUIVALENTS: All 8 items must be from completely different sub-categories. 
4. MATCH THE MARKET: Keep suggestions realistic to the scale and likely market of the described business.
5. THE REASONING: Explain exactly why this item drives revenue or solves a current 2026 consumer problem.
6. Output EXACTLY 8 items. Do not stop until you reach 8.

STRICT FORMATTING (NO EXCEPTIONS):
- NO intro text, NO outro text, NO markdown, NO bullet points, NO numbering.
- Your very first character of output MUST be the first letter of the first product.
- Format each line strictly as: Offering Name || Reason

EXAMPLE OUTPUT:
Y2K Graphic Baby Tees || The Y2K aesthetic is driving massive impulse purchases among Gen Z buyers on social media.
Cold Chain Pharmaceutical Transport || Demand for temperature-controlled medical logistics is surging, allowing for high-margin service contracts.

OUTPUT YOUR 8 LINES NOW:`;

    const response = await getGroqTrendingSuggestion(systemPrompt);
    const responseMessage = response.choices[0]?.message?.content;

    if (!responseMessage) {
        throw new ApiError(500, "Failed to get a response from the AI model.");
    }

    const lines = responseMessage
        .split('\n')
        .filter(line => line.includes('||'));

    const suggestionArray = lines.map(line => {
        let [productName, reason] = line.split('||');

        productName = productName.replace(/^[\d\.\-\*\s]+/, '').trim();
        reason = reason.trim();

        return { productName, reason };
    })
        .slice(0, 8);

    if (suggestionArray.length === 0) {
        console.error("AI Output could not be parsed. Raw Output:", responseMessage);
        throw new ApiError(500, "The AI generated an invalid text format. Please try again.");
    }

    const justNames = suggestionArray.map(item => item.productName);
    const fetchedImagesData = await fetchImages(justNames);

    const finalData = suggestionArray.map((suggestion) => {
        const matchingImage = fetchedImagesData.find(
            (img) => img.productName === suggestion.productName
        );

        return {
            productName: suggestion.productName,
            reason: suggestion.reason,
            imageURL: matchingImage ? matchingImage.imageURL : null
        };
    });

    if (!finalData || finalData.length === 0) {
        throw new ApiError(500, "Something went wrong while compiling the final list.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { finalData }, "Trending items fetched successfully")
        );
});

export {
    businessCopilot,
    clearCopilotHistory,
    priceSuggestion,
    trendingItemsSuggestion
}