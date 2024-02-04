import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"



/* 1. fetch token from cookie or header authorization
2. decode thetoken
3. call database to search for user with _id present in token
4. if user found return the user
 */
export const verifyJwt = asyncHandler( async (req, res, next) => {
        try {
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
            if(!token) {
                throw new ApiError(400, "Token is empty")
            }

            const decodedtoken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            if(!decodedtoken) {
                throw new ApiError(400, "Invalid: Access Token")
            }

            const user = await User.findById(decodedtoken?._id)?.select("-password -refreshToken")
            if(!user) {
                throw new ApiError(400, "NotFound: User Not Found From Decoded Token")
            }

            req.user = user
            next()

        } catch (error) {
            throw new ApiError(400, "Invalid Access Token")
        }
    }
)