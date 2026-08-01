const mongoose = require("mongoose")

const templateSchema = new mongoose.Schema({
    name:String,
    card_image:String,
    card_content:String,
    template_images:[String],
    template_title:String,
    template_url:String,
    // Downloadable deliverable. Either a stored file (excel/pdf/doc/figma-export/zip)
    // and/or an external link (e.g. a Figma share URL). At least one should be set
    // for the template to be deliverable via download + email.
    template_file:String,            // stored filename in /private/templates (not publicly served)
    template_file_original:String,   // original filename, used as the download name
    template_link:String,            // optional external deliverable link (e.g. Figma)
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