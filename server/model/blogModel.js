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
        default: ""
    },
    type: {
        type: String,
        required: true,
        enum: ["technology", "business", "health", "lifestyle", "education", "entertainment"],
        default: "technology"
    },
    // Publish state. Drafts are visible to admins only, never in public listings.
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "published"
    },
    // Public likes: userIds that liked this blog + a denormalized count for lists.
    likes: {
        type: [String],
        default: []
    },
    likesCount: {
        type: Number,
        default: 0
    },
    viewsCount: {
        type: Number,
        default: 0
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
