import mongoose from "mongoose"
import { DB_NAME } from "../constant.js"


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB}/${DB_NAME}`)
        console.log(`DB CONNECTED !! CONNECTION INSTANCE: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`MONGODB CONNECTION ERROR: ${error}`)
        process.exit(1)
    }
}

export default connectDB