var mongoose = require('mongoose');

var foodImagesSchema = new mongoose.Schema({
    
    image_id: {
    	type: mongoose.Schema.Types.ObjectId,
    	ref:"Images"

    }, 
    image_filename:String,
    accuracy:Number,
});


module.exports = foodImagesSchema;