import mongoose from "mongoose"

const applicationSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        require: true,
        index: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
        index: true
    },
    resume: {
        type: String,
        require: true
    },
    coverLetter: {
        type: String,
    }
}, { timestamps: true })

export const Application = mongoose.model("Application", applicationSchema)