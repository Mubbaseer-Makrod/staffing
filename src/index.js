import app from "./app.js";
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
})

connectDB()
.then(() => {
    app.on("error",(error) => {
        console.log(`ERROR: ${error}`)
        throw error
    })
    app.listen(process.env.PORT || 300, () => {
        console.log("App is listening on port: ",process.env.PORT);
    })
})
.catch((error) => {
    console.log("Failed to connect database ERROR: ", error)
})



