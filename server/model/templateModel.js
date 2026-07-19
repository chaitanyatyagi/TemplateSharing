const mongoose = require("mongoose")

const templateSchema = new mongoose.Schema({
    name:String,
    card_image:String,
    card_content:String,
    template_images:[String],
    template_title:String,
    template_url:String,
    template_type:{
        type:String,
        enum:["paid","free"],
        default:"paid"
    },
    price:Number,
    template_content:String,
    template_description:String,
    template_tags:[String],
    template_category:String,
    template_subcategory:String
}, { timestamps: true })

const Template = mongoose.model("Template",templateSchema)
module.exports = Template