const mongoose = require("mongoose")

const blogSchema = new mongoose.Schema({
    blogId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: ""
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ["technology", "business", "health", "lifestyle", "education", "entertainment"],
        default: "technology"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

// Indexes for better performance
blogSchema.index({ blogId: 1 })
blogSchema.index({ type: 1 })
blogSchema.index({ name: "text", content: "text" })

const Blog = mongoose.model("Blog", blogSchema)
module.exports = Blog
