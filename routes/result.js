var express = require('express');
var router = express.Router({mergeParams:true});
var fs  = require('fs');

const {getCollNameInsideBucket} = require('./functions/result.js');


const  foodCategoryImgSchema = require('../schemas/food_category_images');
var  imagesSchema = require('../schemas/images');

const exported_db = require('../database.js');
var mongoose = exported_db.mongoose,
      conn = exported_db.conn,
      Image = exported_db.Image;
      

const Food_Images_Dir = './Food_Images/';
      food_bucket_name= "food";


router.get("/",(req, res)=>{
	Image.findOne({ image_filename:req.params.filename }, (err, foundImage)=> {
        
		if(err){
			console.log(err);
		}
		else{
        
			res.render("result",{image_data:foundImage})
		}

    });
	
	
}); 


router.get("/no",(req,res)=>{
	var food_colls=[];
	conn.db.listCollections().toArray(function (err, names) {
      if (err) {
      throw new Error(err);
    } else {

      names.map(function(collection) {
      	var food_coll=getCollNameInsideBucket(food_bucket_name,collection.name);
      	if(typeof food_coll !== 'undefined'){
      		food_colls.push(food_coll);
      	}

      });
    res.render("result_no",{file:req.params.filename,food_colls:food_colls});
    }
    });

});


router.put("/add-category/:pred_food",function(req,res){
	Image.findOneAndUpdate({ image_filename:req.params.filename },{$set:{category:req.params.pred_food.toLowerCase()}}, function (err, foodImage) {
		if(err){
			console.log(err);
		}
		else{
			
          
            var collectionName=(food_bucket_name+"."+req.params.pred_food.toLowerCase());
            foodCategoryColl = conn.model(food_bucket_name+"."+req.params.pred_food.toLowerCase(),foodCategoryImgSchema,collectionName);
            newfoodInfo = { 
            	image_id:foodImage.image_id,
    			    image_filename:foodImage.image_filename,	
          		accuracy:foodImage.prediction['Probabilities'][req.params.pred_food],

            };


            foodCategoryColl.create(newfoodInfo,function(err,food){
            	if(err){
            		console.log(err);
            	}

            	else{
            		
            		console.log("successfully added to database");
            		if (!fs.existsSync(Food_Images_Dir+req.params.pred_food.toLowerCase())){
                    fs.mkdirSync(Food_Images_Dir+req.params.pred_food.toLowerCase());
                }


	 
	            	gfs.openDownloadStreamByName(req.params.filename).pipe(fs.createWriteStream(Food_Images_Dir+req.params.pred_food.toLowerCase()+"/"+req.params.filename)).
	            		  on('error',function(error){
	                         console.log(error);

	                    }).on('finish',function(){
	                    	console.log("FINISHED");

	                    });
                   
            
             } //end of else
            });
			res.redirect("/");
		}

    });


});

router.put("/add-category/",function(req,res){

	if(req.body.food_options=='other_option'){
		req.body.food_options = req.body.other_option_text.toLowerCase();

	}

	Image.findOneAndUpdate({ image_filename:req.params.filename },{$set:{user_category:req.body.food_options}}, function (err, foodImage) {
		if(err){
			console.log(err);
		}
		else{
			
            var collectionName=food_bucket_name+"."+req.body.food_options;
            foodCategoryColl = conn.model(food_bucket_name+"."+req.body.food_options,foodCategoryImgSchema,collectionName);
            newfoodInfo ={ 
            	image_id:foodImage.image_id,
        			image_filename:foodImage.image_filename,	
            };

            foodCategoryColl.create(newfoodInfo,function(err,food){
            	if(err){
            		console.log(err);
            	}
            	else{
            
            		console.log("successfully added to database");
            		if (!fs.existsSync(Food_Images_Dir+req.body.food_options)){
                    fs.mkdirSync(Food_Images_Dir+req.body.food_options);
                }
            		
            
	            		  gfs.openDownloadStreamByName(req.params.filename).pipe(fs.createWriteStream(Food_Images_Dir+req.body.food_options+"/"+req.params.filename)).
	            		  on('error',function(error){
	                         console.log(error);

	                    }).on('finish',function(){
	                    	console.log("FINISHED");

	                    });
            
            
             } //end of else
            });
			res.redirect("/");
		}

    });
 


});


module.exports = router;