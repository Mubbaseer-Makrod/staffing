import { registerUser, login, logout } from "../controllers/user.controllers.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import express from "express";

const router = express.Router()

router.route("/register").post(upload.fields(
    [
        {
            name: "avatar", 
            maxCount: 1
        }, 
        {
            name: "resume", 
            maxCount: 1
        }, 
        {
            name: "coverLetter",
            maxCount: 1
        }
    ]
), registerUser)

router.route("/login").post(login)
router.route("/logout").get(verifyJwt ,logout)


export default router