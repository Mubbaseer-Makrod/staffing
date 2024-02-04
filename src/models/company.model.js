import mongoose from "mongoose"

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        lowercase: true,
        index: true,
        trim: true
    },
    description: {
        type: String,   
    },
    industry: {
        type: String
    },
    branch: [{
        name: {
            type: String,
            lowercase: true
        },
        location: {
            type: { type: String, default: 'Point' },
            coordinates: [Number],
        }
    }]
}, { timestamps: true })

export const Company = mongoose.model("Company", companySchema)