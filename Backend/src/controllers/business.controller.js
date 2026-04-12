import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import { Business } from "../models/business.model.js"

const setBusinessInfo = asyncHandler(async (req, res) => {
    const { profilePicture, businessName, description, website } = req.body;

    const existingBusiness = await Business.findOne({ owner: req.user._id });
    if (existingBusiness) {
        throw new ApiError(400, "Business profile already exists for this user");
    }

    const business = await Business.create({
        profilePicture,
        businessName,
        description,
        website,
        owner: req.user._id
    })

    if (!business) {
        throw new ApiError(404, "Unable to set user info")
    }

    await business.save({validateBeforeSave : false});

    return res
        .status(200)
        .json(
            new ApiResponse(200, { business }, "Business info is saved succesfully")
        )

});

const getBusinessInfo = asyncHandler(async (req, res) => {
    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
        throw new ApiError(401, "Unable to find user")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, { business }, "User busniness info fetched succesfully!")
        )
});

const editBusinessInfo = asyncHandler(async (req, res) => {
    const { profilePicture, businessName, description, website } = req.body;

    const updateData = {};

    if (profilePicture) updateData.profilePicture = profilePicture;
    if (businessName) updateData.businessName = businessName;
    if (description) updateData.description = description;
    if (website !== undefined) updateData.website = website

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "Please provide at least one field to update");
    }

    const updatebusinessInfo = await Business.findOneAndUpdate(
        {
            owner : req.user._id,
        },
        {
            $set : updateData
        },
        {
            returnDocument : "after",
            runValidators : true ,
        }
    )

    if(!updatebusinessInfo){
        throw new ApiError(403,"Unable to edit Info")
    }

    await updatebusinessInfo.save({validateBeforeSave : false});

    return res
        .status(200)
        .json(
            new ApiResponse(200, {updatebusinessInfo} , "Updated User Business info succesfully")
        )
});

export {
    setBusinessInfo,
    getBusinessInfo,
    editBusinessInfo
}