const exported_db = require('./database.js');
var mongoose = exported_db.mongoose,
      upload = exported_db.upload,
      conn = exported_db.conn,
      // gfs = exported_db.gfs,
      Image = exported_db.Image;


const methodOverride = require('method-override'),
      bodyParser = require('body-parser'),
	    express = require('express'),
	    fs = require('fs'),
	    app = express();


/* Importing database Schemas */
const  imagesSchema = require('./schemas/images');
const  foodCategoryImgSchema = require('./schemas/food_category_images');

/*Variables */
const Food_Images_Dir = './Food_Images/';
      food_bucket_name= "food";

var indexRoutes = require('./routes/index.js');

// var Image = conn.model("images",imagesSchema);
// console.log(typeof Image);
conn.on("error", () => {
    console.log("Some error occurred from the database");
});

conn.once("open",()=>{
  gfs = new mongoose.mongo.GridFSBucket(
      conn.db,{
        bucketName: "uploads"
      });
});

app.use(methodOverride("_method"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));
app.use(express.json());
app.set("view engine","ejs");
app.use("/",indexRoutes);

// app.use("/campgrounds/:id/comments",commentRoutes);
// app.use("/campgrounds",campgroundRoutes);
// app.use("/",indexRoutes);

// function changeDictValuesToFixed15(original_dict){
// 	for(var key in original_dict){
// 		original_dict[key]=original_dict[key].toFixed(15);
// 	}
// 	return original_dict;
// }
// function swapKeyandValueOfDict(original_dict){ 
//         var swapped_dict = {}; 
//         for(var key in original_dict){ 
//                swapped_dict[original_dict[key]] = key; 
//         }
//         return swapped_dict;
// }

// function arrayInDescendingOrder(arr) {
//   return arr.sort().reverse();
// }

// function toFixed15(arr){
//    for(index =0; index<arr.length;index++){
//   	  arr[index]=(parseFloat(arr[index]).toFixed(15)).toString();
//     }
//     return arr;

// }

// function getKeysOfDict(dict){
//     return Object.keys(dict);
// }

// function getValuesInSameOrderOfTheKeyArr(key_arr,key_value_dict){
//     value_arr=[];
//     for (index = 0; index < key_arr.length; index++) { 
//               value_arr.push(key_value_dict[key_arr[index]]);
//     } 
//     return(value_arr);
// }


// function getFoodNamesInDescOrder(food_prob_dict){
//   food_prob_dict = changeDictValuesToFixed15(food_prob_dict);
//   prob_food_dict = swapKeyandValueOfDict(food_prob_dict);
//   prob_arr = getKeysOfDict(prob_food_dict);
//   prob_arr = arrayInDescendingOrder(prob_arr);
//   food_arr = getValuesInSameOrderOfTheKeyArr(prob_arr,prob_food_dict);
//   return food_arr;
// }


// app.get("/",(req,res)=>{
// 	if(!gfs){
// 		console.log("Some error occurred, check connection to db");
// 		res.send("Some error occured, check connection to db");
// 		process.exit(0);

// 	}
//   res.render("index");
// });


// app.post("/upload",upload.single("file"),(req,res)=>{
//   FormData = require('form-data');
//   form = new FormData();
//   file=req.file.filename;
//   results_json=null;
//   food_arr = null;

//   gfs.openDownloadStreamByName(file).pipe(fs.createWriteStream('./output.png')).on('error',function(error){
//                 console.log(error);

//             }).
//             on('finish',function(){
//                 form.append( 'file', fs.createReadStream('output.png'),{filename: file, contentType: 'image'});
//   				form.submit('http://ec2-34-226-213-76.compute-1.amazonaws.com/home', function(err,api_res)
//   				{
// 	    			if(err){
// 	        			res.send(err);
// 	    			}
  			  
//     			var results = '';
//     			api_res.setEncoding('utf8')
//     			api_res.on('data',function(d){

//         			results+=d

//     			}); //end of api_res_on

//     			api_res.on('end',function(d)
//     			{
//         			results_json = JSON.parse(results);
//         			food_arr = getFoodNamesInDescOrder(results_json['Probabilities']);
//                     var newImage =
//                     {
//       	  					image_id:new mongoose.Types.ObjectId(req.file.id),
//       	  					image_filename:req.file.filename,
//       	  					contentType:req.file.contentType,
//       	  					uploadDate:new Date(req.file.uploadDate),
//       	      			prediction:results_json,
//       	  	     			food_desc_order:food_arr
//   		     	    };
  			    	
  			    
//   			    Image.create(newImage,function(err,image){
//   			    	if(err){
//   			    		console.log(err);
//   			    	}
//   			    	else{
//   			    		console.log("Saved to db");
//   			    		res.redirect("/result/"+file);
//   			    	}
//   			    });
  		
        
//     		})  //end of res on end
//     	}); //form submit

  		
//   			// res.redirect("/result/"+file);	



 
//  }); //end of on finish function


        
      


// });


app.get("/result/:filename",(req, res)=>{
	Image.findOne({ image_filename:req.params.filename }, function (err, foundImage) {
		if(err){
			console.log(err);
		}
		else{

			res.render("result",{image_data:foundImage})
		}

    });
	
	
}); 



function checkIfCollOfBucket(bktName,collName){
	var bktRegex = new RegExp(bktName,"g")
	return bktRegex.test(collName);
}

function getCollNameInsideBucket(bktName,collName){
	console.log("CHECKING FOR %s",collName);
	if(checkIfCollOfBucket(bktName,collName)){
		console.log("INSIDE IF");
		var after_bucket = bktName+"\.(.*)"
		var getCollRegex = new RegExp(after_bucket,"g")
		return getCollRegex.exec(collName)[1];

	}

}

app.get("/result/:filename/no",(req,res)=>{
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


app.put("/result/:filename/add-category/:pred_food",function(req,res){
	Image.findOneAndUpdate({ image_filename:req.params.filename },{$set:{category:req.params.pred_food.toLowerCase()}}, function (err, foodImage) {
		if(err){
			console.log(err);
		}
		else{
			
          
            var collectionName=(food_bucket_name+"."+req.params.pred_food.toLowerCase());
            console.log(collectionName);
            console.log(typeof collectionName);
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

app.put("/result/:filename/add-category/",function(req,res){

	if(req.body.food_options=='other_option'){
		req.body.food_options = req.body.other_option_text.toLowerCase();

	}

	Image.findOneAndUpdate({ image_filename:req.params.filename },{$set:{user_category:req.body.food_options}}, function (err, foodImage) {
		if(err){
			console.log(err);
		}
		else{
			
            var collectionName=food_bucket_name+"."+req.body.food_options;
            console.log(collectionName);
            console.log(typeof collectionName);
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

app.get("/image/:filename", (req, res) => {
  const file = gfs
    .find({
      filename: req.params.filename
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist"
        });
      }
      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    });
});


app.post("/files/del/:id",(req,res)=>{
	gfs.delete(new mongoose.Types.ObjectId(req.params.id),(err,data)=>{
		if(err){
			return res.status(404).json({err: err.message});
		}
		res.redirect("/");
	})
});



app.listen(process.env.PORT||3000,process.env.IP,function(){
	console.log("Server has started");
});
