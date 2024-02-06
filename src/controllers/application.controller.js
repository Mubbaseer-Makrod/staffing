import { application } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponce";
import app from "../app";
import { Application } from "../models/application.model";

const registerApplication = asyncHandler(async (req, res) => {
    // Todo: register a Application on post
    const { postId } = req.body

    if(!req?.user) {
        throw new ApiError(400, "User not Logged In")
    }

    if(!postId) {
        throw new ApiError(400, "PostId not provided")
    }

    const resumeLocalPath = req?.fields?.resume?.[0]?.path
    const coverLetterLocalPath = req?.fields?.coverLetter?.[0]?.path
    let toSave = {}

    if(!resumeLocalPath) {
        throw new ApiError(400, "Resume not provided")
    }

    [postId, resumeLocalPath, coverLetterLocalPath].forEach(field => {
        if(field) {
            toSave.field = field
        } 
    });

    const application = await Application.create(
        {
            ...toSave,
            candidateId: req.user._id
        }
    )

    if(!application) {
        throw new ApiError(404, "DB Call Failed: Application not created")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, application, "Success: Application Created"))
})

const deleteApplication = asyncHandler(async (req, res) => {
    // Todo: Let Applicant delete the Application
    const { applicationId } = req.params

    if(!req?.user) {
        throw new ApiError(400, "User not Logged In")
    }

    if(!applicationId) {
        throw new ApiError(400, "No Application Id present")
    }

    const application = await Application.findById(applicationId)

    if(!application) {
        throw new ApiError(400, "No Application Present with this Id ")
    }

    if(application.candidateId !== req.user._id) {
        throw new ApiError(400, "UnAuthorized: User has not created the application")
    }

    const deletedApplication = await Application.findByIdAndDelete(applicationId)

    return res
        .status(200)
        .json(new ApiError(200, deletedApplication, "Succes: Application Successfully deleted"))

})

const getApplicationOnPost = asyncHandler(async (req, res) => {
    // Todo: Get All Application On certain Application
    const { postId } = req.params

    if(req?.user?.role <= 10) 
    {
        throw new ApiError(400, "Not Authorized")
    }
    
    const applications = await Application.find({
        postId,
    }).sort({ createdAt: 1 })

    if(!applications) {
        throw new ApiError(400, "No Application present for this post")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, applications, "Success: Fetched All Application"))
 })

const getApplicationById = asyncHandler(async (req, res) => {
    const { applicationId } = req.params

    if(!req?.user && !applicationId) {
        throw new ApiError(400, "User not logged In or Application Id not Present")
    }

    const application = await Application.findById(applicationId)

    if(!application) {
        throw new ApiError(400, "Not Found: Application not present")
    }

    if( application.candidateId != req.user._id || req.user.role > 10) {
        throw new ApiError(400, "UnAuthorized: Not Authorized to access this content")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, application, "Success Application fetched succesfully"))

})

export { registerApplication,  deleteApplication, getApplicationOnPost, getApplicationById}