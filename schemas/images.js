var mongoose = require('mongoose');

var imagesSchema = new mongoose.Schema({
    
    image_id: mongoose.Schema.Types.ObjectId, 
    image_filename:String,
    contentType:String,
    uploadDate:Date,
    prediction:Object,
    food_desc_order:[String],
    category:String,
    user_category:String,
});


module.exports = imagesSchema;