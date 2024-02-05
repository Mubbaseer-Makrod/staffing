import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
    
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
    
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(404, "Fail: Generation of Access and Refresh Token")
    }

}

/* Steps to register the new User
1. fetch all required data from the user
2. check the database if user already present
3. upload the static on cloudinart
3. create a new entry in the database
*/
const registerUser = asyncHandler(async (req, res) => {
    // Todo: Register user
    try {
        const { fullName, email, phoneNumber, password } = req.body
        if([fullName, email, phoneNumber, password].some((field) => !field ? true : false)) {
            throw new ApiError(400, "All Fields are required")
        }
    
        const avatarLocalPath = req?.files?.avatar?.[0].path
        const resumeLocalPath = req?.files?.resume?.[0]?.path
        const coverLetterLocalPath = req?.files?.coverLetter?.[0]?.path
    
        if(!(avatarLocalPath && resumeLocalPath)) {
            throw new ApiError(400, "Missing Data: Avatar or Resume")
        }
    
        const user = await User.findOne({
            $or: [{email}, {phoneNumber}]
        })
    
        if(user) {
            throw new ApiError(400, "Unauthorized: User Already Exist")
        }
    
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const resume = await uploadOnCloudinary(resumeLocalPath)
        const coverLetter = await uploadOnCloudinary(coverLetterLocalPath)
    
        if(!(avatar && resume)) {
            throw new ApiError(400, "Upload Failed: Avatar or Resume")
        }
    
        const registeredUser = await User.create({
            fullName,
            email,
            phoneNumber,
            avatar: avatar.url,
            resume: resume.url,
            coverLetter: coverLetter.url,
            password
        })
    
        if(!registeredUser) {
            throw new ApiError(400, "DB Registration Failed: User not registed")
        }
    
        return res
            .status(200)
            .json(new ApiResponse(200, registeredUser, "Success: Registered User"))
    } catch (error) {
        throw new ApiError(404, `Registration Failed, ERROR: ${error}`)
    }
})

// escalate user to publisher or admin (Only admin can do it)
const upgradeUser = asyncHandler(async (req, res) => {
    const { userId, role } = req.body

    if(!req?.user) {
        throw new ApiError(400, "Auth Failed: To provide JWT")
    }

    if(!userId) {
        throw new ApiError(400, "Insufficient Data: No userId provided")
    }

    const user = User.findByIdAndUpdate(
        userId, 
        {
            role,
        },
        {
            new: true
        }
    )

    if(!user) {
        throw new ApiError(400, "Not Found: User Id")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Success: User Upgraded"))
})


const login = asyncHandler( async ( req, res ) => {
    const { email, password } = req.body
        if(!(email && password)) {
            throw new ApiError(400, "Missing Data: email or password")
        }
    
        const user = await User.findOne({email})
        if(!user) {
            throw new ApiError(400, "UnAuthorized: User not found")
        }
    
        const isPasswordCorrect = await user.isPasswordCorrect(password)
    
        if(!isPasswordCorrect) {
            throw new ApiError(400, "UnAuthorized: User or Password not correct")
        }
    
        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)
    
        const loggedInUser = await User.findById(user._id)
                                    .select("-password -refreshToken")
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
            .status(200)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(new ApiResponse(200, 
                {
                    user: loggedInUser,
                    refreshToken: refreshToken,
                    accessToken: accessToken
                }, 
                "LogIn Successfull"
                )
            )
})

/* Logout user
1. fetch user from req.user
2. findandUpdate database (make refreshToken and AccessToken = Null)
3. remove the cookie from user browser
*/
const logout = asyncHandler( async (req, res) => {
    if(!req?.user) {
        throw new ApiError(400, "Auth Middleware Failed")
    }

    const user = await User.findByIdAndUpdate(
        req?.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    if(!user) {
        throw new ApiError(400, "Cookie is Not Available")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, user, "Success: Logout"))
})

/* Update Account Info
1. fetch all the data from req.body
2. create an empty toUpdate object and add all the valid data to it 
3. update the database by this toUpdate object
*/
const updateAccountInfo = asyncHandler(async (req, res) => {
    // todo update fullName, email and phoneNumber
    const { fullName, email, phoneNumber } = req.body
    let toUpdate = {}

    if(fullName) {
        toUpdate.fullName = fullName
    }
    if(email) {
        toUpdate.email = email
    }
    if(phoneNumber) {
        toUpdate.phoneNumber = phoneNumber
    }

    if(!toUpdate) {
        throw new ApiError(400, "Insufficient Data: Nothing to Update")
    }

    const user = await User.findByIdAndUpdate(
        req?.user?._id,
        {
            ...toUpdate
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Success: Updated User Info"))
})

const updatePortfolio = asyncHandler( async (req, res) => {
    // Todo update resume and cover Letter
    const resumeLocalPath = req.files?.resume?.[0]?.path
    const coverLetterLocalPath = req.files?.coverLetter?.[0]?.path
    let toUpdate = {}

    if(resumeLocalPath) {
        const resume = await uploadOnCloudinary(resumeLocalPath)
        if(!resume) {
            throw new ApiError(404, "Upload Failure: Resume Upload Failed")
        }
        toUpdate.resume = resume
    }

    if(coverLetterLocalPath) {
        const coverLetter = await uploadOnCloudinary(coverLetterLocalPath)
        if(!coverLetter) {
            throw new ApiError(404, "Upload Failure: CoverLetter Upload Failed")
        }
        toUpdate.coverLetter = coverLetter
    }

    if(!Object.keys(toUpdate).length) {
        throw new ApiError(400, "Insuffiecient Data: No Portfolio given to")
    }

    const user = await User.findByIdAndUpdate(
        req?.user?._id,
        {
            ...toUpdate
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    if(!user) {
        throw new ApiError(400, "DB Call Failed: Failed to update Portfolio")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Update Success: Portfolio Updated"))
})

const updateAvatar = asyncHandler( async (req, res) => {
    // Todo update Avatar image
    const avatarLocalPath = req?.file?.path
    if(!avatarLocalPath) {
        throw new ApiError(400, "Insufficient: Avatar Not given")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar) {
        throw new ApiError(404, "Upload Failed: avatar")
    }

    const user = await User.findByIdAndUpdate(
        req?.user?._id,
        {
            avatar
        },
        {
            new: true
        }
    )

    if(!user) {
        throw new ApiError(404, "DB Call Failed: Avatar not updated")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Update Success: Avatar Updated Succesfully"))
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    // change User Current Password
    const { oldPassword, newPassword } = req.body()

    if(!req?.user) {
        throw new ApiError(400, "Failed Auth: User not present in object")
    } 

    if(!(oldPassword && newPassword)) {
        throw new ApiError(400, "Both Password is needed")
    }

    const user = await User.findById(req.user?._id)
    if(!user) {
        throw new ApiError(400, "User not found in Db")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect) {
        throw new ApiError(400, "Password Match Failed")
    }
    
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Success: Password update successfully"))
})

const getUserProfile = asyncHandler ( async (req, res) => {
    // todo: get profile of login user
    if(req?.user) {
        throw new ApiError(400, "Failed Auth: User not present in object")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Success: Fetched User Profile"))
})

const toggleBlacklistUser = asyncHandler (async ( req, res ) => {
    // todo: blacklist user (Toggle the blacklist)
    const { userId } = req.body
    
    if(!userId) {
        throw new ApiError(400, "Please Provide UserId")
    }

    if(!req?.user) {
        throw new ApiError(400, "Failed Auth: User not present in object")
    }

    if(!(req?.user?.role === 100)) {
        throw new ApiError(400, "UnAuthorized Access: Only Admin can access this route")
    }

    const user = await User.findById(userId)
    if(!user) {
        throw new ApiError(400, "BlackListing Failed: User not available in Db ")
    }

    if(user.blacklist == false) {
        user.blacklist = true
        await user.save({validateBeforeSave: false})
        return res
            .status(200)
            .json(new ApiResponse(200, user, "User Blacklisted Success"))
    }

    user.blacklist = false
    await user.save({validateBeforeSave: false})
    return res
        .status(200)
        .json(new ApiError(200, user, "User Whitelisted Success"))
})

export { registerUser, login, logout, 
    updateAccountInfo, updatePortfolio, changeCurrentPassword,
    getUserProfile, toggleBlacklistUser}