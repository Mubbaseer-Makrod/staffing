import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Types.Schema.ObjectId,
        ref: "Company"
    },
    title: {
        type: String,
        require: true,
        index: true
    },
    description: {
        type: String,
        require: true
    },
    sector: {
        type: String,
        require: true,
        lowercase: true,
        trim: true,
        index: true 
    },
    location: {
        type: String,
        require: true
    },
    jobType: {
        type: String,
        emums: ["contract", "permanent", "seasonal"],
        require: true
    },
    publishedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    }
}, { timestamps: true })

export const Post = mongoose.model("Post", postSchema)