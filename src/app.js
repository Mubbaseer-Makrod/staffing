import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// cors middleware just add cors header on every Response

app.use(cors({
    origin: process.env.CORS_ORIGIN, // this allow serve
    credentials: true // this allow credentials like cookie to be send to frontend
}))

app.use(express.json({limit:"16kb"})) //This parse the json data in payload
app.use(express.urlencoded({limit:"16kb"})) //This parse form data in payload
app.use(express.static("public")) // This serve static file(html, css, image, video, js)
app.use(cookieParser())

// import all the routers 
import userRoutes from "./routes/user.routes.js"


// Routes are 

app.use("/api/v1/users", userRoutes)
// app.use("/api/v1/companys", companyRouter)
// app.use("/api/v1/posts", postRouter)
// app.use("/api/v1/applications", applicationRouter)


export default app