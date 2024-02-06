import { Company } from "../models/company.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponce";
import { asyncHandler } from "../utils/asyncHandler";

const registerCompany = asyncHandler(async (req, res) => {
    const { name,  description, industry } = req.body

    if(!(req?.user?.role > 10)) {
        throw new ApiError("Not Authorized")
    }

    [name, description, industry].forEach(field => {
        if(!field) {
            throw new ApiError(400, "All Field Require")
        }
    });

    const company = await Company.findOne({
        name,
    })

    if(company) {
        throw new ApiError(400, "Company is already present")
    }

    const registeredCompany = await Company.create({
        name,
        descrption,
        industry
    })

    if(!registeredCompany) {
        throw new ApiError(400, "Creation Failed: Company")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, registeredCompany, "Success: Company created"))

})

const updateCompany = asyncHandler(async (req, res) => {
    const companyId = req.params
    const { name,  description, industry } = req.body
    let toUpdate

    if(!(req?.user?.role > 10)) {
        throw new ApiError("Not Authorized")
    }

    [name, description, industry].forEach(field => {
        if(field) {
            toUpdate.field = field
        }
    });

    const company = await Company.findByIdAndUpdate(
        companyId,
        {
            ...toUpdate
        },
        { new: true }
    )

    if(!company) {
        throw new ApiError(400, "Failed: Company creation failed")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Success: company details updated successfully"))
})

const deleteCompany = asyncHandler(async (req, res) => {
    const { companyId } = req.params

    if(!(req?.user?.role > 10)) {
        throw new ApiError(400, "UNAUTHORIZED USER")
    }

    if(!companyId) {
        throw new ApiError(400, "Company Id not present in params")
    }

    const company = await Company.findByIdAndDelete(companyId)

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Success: Company successfully deleted"))
})

const getCompanyById = asyncHandler(async (req, res) => {
    const { companyId } = req.params

    if(!(req?.user?.role > 10)) {
        throw new ApiError(400, "UNAUTHORIZED USER")
    }

    if(!companyId) {
        throw new ApiError(400, "Company Id not present in params")
    }

    const company = await Company.findById(companyId)

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Success: Company find"))
})

const getAllCompany = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortType} = req.query
    //TODO: get all videos based on query, sort, pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    console.log(req.query);

    const sort = sortBy && sortType ? { [sortBy]: sortType } : { createdAt: 1 };
    console.log(sort);
    console.log(dynamicQuery);

    const companys = await Company.find()
    .sort(sort)
    .skip(parseInt(skip))
    .limit(parseInt(limit))

    if(!companys) {
        throw new ApiError(404, "No posts found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, posts, "Successfully fetched All the companys"))
})