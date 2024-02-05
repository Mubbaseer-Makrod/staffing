import { Post } from "../models/post.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponce";
import { asyncHandler } from "../utils/asyncHandler";

const getAllPost = asyncHandler(async (res, req) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    console.log(req.query);

    const dynamicQuery = {}
    if(query) {
        dynamicQuery.title =  new RegExp(query, 'i');
    }
    if(userId) {
        dynamicQuery._id = userId
    }

    const sort = sortBy && sortType ? { [sortBy]: sortType } : { createdAt: 1 };
    console.log(sort);
    console.log(dynamicQuery);

    const posts = await Post.find(
        dynamicQuery
    )
    .sort(sort)
    .skip(parseInt(skip))
    .limit(parseInt(limit))

    if(!posts) {
        throw new ApiError(404, "No posts found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, posts, "Successfully fetched All the posts"))
})

const getPostById = asyncHandler(async (req, res) => {
    const { postId } = req.body
    if(!postId) {
        throw new ApiError(400, "Insufficient: Post Id not provided")
    }

    const post = await Post.findById(postId)
    if(!post) {
        throw new ApiError(400, "Post Not Found")
    }

    return res
        .status(200)
        .json(new ApiError(200, post, "Success: Post successfully fetched"))

})

const publishPost = asyncHandler(async (req, res) => {
    const { title, description, sector, jobType, longitude, latitude } = req.body
    let toUpdate = {}

    if(req?.user?.role < 50) {
        throw new ApiError(400, "Unauthorized: Publish Post")
    }

    [title, description, sector, jobType, longitude, latitude].forEach((field) => {
        if(field) {
            toUpdate.field = field
        }
    })

    const post = await Post.create(
        { 
            ...toUpdate,
            publishedBy: req.user._id
        }
    )

    if(post) {
        throw new ApiError(404, "Failed: Job Post Failed")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, post, "Success: Job Successfully Posted"))
})

const updatePost = asyncHandler(async (req, res) => {
    const { postId, title, description, sector, jobType, longitude, latitude } = req.body
    let toUpdate = {}

    if(!postId) {
        throw new ApiError(400, "Insuffiecient Data: Failed to provide post id")
    }

    if(req?.user?.role < 50) {
        throw new ApiError(400, "Unauthorized: Publish Post")
    }

    [title, description, sector, jobType, longitude, latitude].forEach((field) => {
        if(field) {
            toUpdate.field = field
        }
    })

    const post = await Post.findByIdAndUpdate(
        postId, 
        { 
            ...toUpdate 
        },
        { new: true }
    )

    if(post) {
        throw new ApiError(404, "Failed: Post Update Failed")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, post, "Success: Post Successfully Updated"))
})

const deActivePost = asyncHandler(async (req, res) => {
    const { postId } = req.body

    if(req?.user?.role < 50) {
        throw new ApiError(400, "Unauthorized: Publish Post")
    }

    const post = await Post.findByIdAndDelete(
        req?.iser?._id,
        {
            active: false
        },
        { new: true }
    )

    if(!post) {
        throw new ApiError(400, "Failed: To deactivate the Post")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, post, "Success: Post is been disabled"))
})
