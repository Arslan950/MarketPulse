import { WholeSaler } from "../models/wholesaler.model.js";
import { Product } from "../models/product.model.js"
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"

const addItems = asyncHandler(async (req, res) => {
    const { itemName, category, unitsAvailable, supplierName, wholesalePrice } = req.body;

    const existingItem = await WholeSaler.findOne({
        $and: [{ itemName }, { category }]
    });

    if (existingItem) {
        throw new ApiError(401, "This product is already in catalog")
    };

    const wholeSaler = await WholeSaler.create({
        itemName,
        category,
        unitsAvailable,
        supplierName,
        wholesalePrice,
        owner: req.user._id
    });

    if (!wholeSaler) {
        throw ApiError(449, "Something went wrong while adding item in Catalog");
    }

    await wholeSaler.save({ validateBeforeSave: false });
    const wholesalerData = wholeSaler.toJSON();

    return res
        .status(200)
        .json(
            new ApiResponse(200, { wholesalerData }, "item added in catalog succesfully")
        )


});

const getItems = asyncHandler(async (req, res) => {
    const items = await WholeSaler.find({ owner: { $ne: req.user._id } });

    if (!items) {
        throw new ApiError(404, "Catalog is either empty or something went wrong")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, { items }, "Catalog fetched succesfully")
        )
});

const updateAfterBuy = asyncHandler(async (req, res) => {
    const { itemID } = req.params;
    const { quantity } = req.body;


    if (!itemID) {
        throw ApiError(404, "Item Id was not found in URL")
    }

    const wholeSalerItem = await WholeSaler.findById(itemID)

    if (!wholeSalerItem) {
        throw new ApiError(404, "Wholesaler item not found");
    }

    if (wholeSalerItem.owner.toString() === req.user._id.toString()) {
        throw new ApiError(403, "You cannot buy an item you listed yourself");
    }

    if (wholeSalerItem.unitsAvailable < quantity) {
        throw new ApiError(400, `Not enough stock. Only ${wholeSalerItem.unitsAvailable} units available.`);
    }

    wholeSalerItem.unitsAvailable -= quantity;
    await wholeSalerItem.save({ validateBeforeSave: false });

    let userProduct = await Product.findOne({ 
        productName: wholeSalerItem.itemName, 
        owner: req.user._id 
    });

    if (userProduct) {
        userProduct.stockQuantity += quantity;
        userProduct.totalValue = userProduct.calculateTotalValue();
        await userProduct.save({ validateBeforeSave: false });
    } else {
        userProduct = await Product.create({
            productName: wholeSalerItem.itemName,
            category: wholeSalerItem.category,
            productImage: "default-image-url.png",
            costPrice: wholeSalerItem.wholesalePrice,
            sellingPrice: wholeSalerItem.wholesalePrice,
            stockQuantity: quantity,
            owner: req.user._id
        });
        
        userProduct.profitPercentage = userProduct.calculateProfit();
        userProduct.totalValue = userProduct.calculateTotalValue();
        await userProduct.save({ validateBeforeSave: false });
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { 
            wholesalerRemainingStock: wholeSalerItem.unitsAvailable,
            buyerInventory: userProduct
        }, `Successfully bought ${quantity} items`)
    );

});

export {
    addItems,
    getItems,
    updateAfterBuy
}
