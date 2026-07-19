const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: "user"
    },
    address: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    pincode: {
        type: String,
        default: ""
    },
    contact: String,
    userId: String,
    wishlist: {
        type: [String],
        default: []
    },
    savedBlogs: {
        type: [String],
        default: []
    }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
module.exports = User