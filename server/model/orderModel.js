const mongoose = require("mongoose")

const orderItemSchema = new mongoose.Schema({
    templateId: String,
    templateName: String,
    price: Number,
    quantity: {
        type: Number,
        default: 1
    },
}, { _id: false })

const orderSchema = new mongoose.Schema({
    orderId:String,
    items: [orderItemSchema],
    userId:String,
    orderStatus:{
        type:String,
        enum:["pending","completed","failed"],
        default:"pending"
    },
    orderDate:{
        type:Date,
        default:Date.now
    },
    orderAmount:Number,
    paymentMethod:{
        type:String,
        enum:["credit_card","debit_card","paypal"],
        default:"credit_card"
    },
    userEmail:String,
    userPhone:String,
    userName:String,
    userCity:String,
    userState:String,
    userCountry:String,
    userZip:String,
}, { timestamps: true })

const Order = mongoose.model("Order", orderSchema)
module.exports = Order