var bodyParser = require('body-parser'),
	express = require('express'),
	imagesSchema = require('./schemas/images'),
	foodCategoryImgSchema = require('./schemas/food_category_images'),
	methodOverride = require('method-override'),
	mkdirp = require('mkdirp'),
	app = express();

var Food_Images_Dir = './Food_Images/';
var food_bucket_name= "food";
const GridFsStorage = require('multer-gridfs-storage'),
      mongoose = require('mongoose'),
      crypto = require('crypto'),
      multer = require('multer'),
      path = require('path'),
	  fs = require('fs'),
      request = require('request');



const mongoURI = "mongodb://localhost:27017/node-file-upl";
const conn = mongoose.createConnection(mongoURI,{
	useNewUrlParser : true,
	useUnifiedTopology : true,
	useFindAndModify: false,

});

mongoose.Promise = global.Promise;
let gfs;
//initializing GridFS storage
conn.once("open",()=>{
	gfs = new mongoose.mongo.GridFSBucket(
			conn.db,{
				bucketName: "uploads"
			});
});
var Image = conn.model("images",imagesSchema);
const storage = new GridFsStorage({
	url : mongoURI,
	file: (req, file)=>{
		return new Promise((resolve, reject)=>{
			crypto.randomBytes(16,(err,buf)=>{
				if(err){
					return reject(err);
				}
				const filename = buf.toString("hex") + path.extname(file.originalname);
				const fileInfo = {
					filename: filename,
					bucketName:"uploads"
				};
				resolve(fileInfo);
			});
		});
	}

});

// const storage = new GridFsStorage({url : mongoURI});
const upload = multer({
	storage
});

app.use(methodOverride("_method"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));
app.use(express.json());
app.set("view engine","ejs");

function changeDictValuesToFixed15(original_dict){
	for(var key in original_dict){
		original_dict[key]=original_dict[key].toFixed(15);
	}
	return original_dict;
}
function swapKeyandValueOfDict(original_dict){ 
        var swapped_dict = {}; 
        for(var key in original_dict){ 
               swapped_dict[original_dict[key]] = key; 
        }
        return swapped_dict;
}

function arrayInDescendingOrder(arr) {
  return arr.sort().reverse();
}

function toFixed15(arr){
   for(index =0; index<arr.length;index++){
   	// console.log("BEFORE");
   	// console.log(typeof arr[index]);
   	  arr[index]=(parseFloat(arr[index]).toFixed(15)).toString();
   	  // console.log("AFTER");
   	  // console.log(typeof arr[index]);
    }
    return arr;

}

function getKeysOfDict(dict){
    return Object.keys(dict);
}

function getValuesInSameOrderOfTheKeyArr(key_arr,key_value_dict){
    value_arr=[];
    for (index = 0; index < key_arr.length; index++) { 
              value_arr.push(key_value_dict[key_arr[index]]);
    } 
    return(value_arr);
}


function getFoodNamesInDescOrder(food_prob_dict){
  // console.log(food_prob_dict);
  food_prob_dict = changeDictValuesToFixed15(food_prob_dict);
  prob_food_dict = swapKeyandValueOfDict(food_prob_dict);
  prob_arr = getKeysOfDict(prob_food_dict);
  prob_arr = arrayInDescendingOrder(prob_arr);
  food_arr = getValuesInSameOrderOfTheKeyArr(prob_arr,prob_food_dict);
  return food_arr;
}

app.get("/",(req,res)=>{
	if(!gfs){
		console.log("Some error occurred, check connection to db");
		res.send("Some error occured, check connection to db");
		process.exit(0);

	}

	gfs.find().toArray((err,files)=>{
		if(!files || files.length === 0){
			return res.render("index",{
				files: false
			});
		}

		else{
			const f = files.map(
				file =>{
					if( file.contentType === "image/png" ||
						file.contentType === "image/jpeg"
					  ){
						file.isImage = true;
					}else{
						file.isImage = false;
					}
					return file;
				}).sort((a,b)=>{
					return(
						new Date(b["uploadDate"]).getTime() - new Date(a["uploadDate"]).getTime()

						);

				});
				return res.render("index",{
					files:f
				});
		}

	});

});


app.post("/upload",upload.single("file"),(req,res)=>{
  FormData = require('form-data');
  form = new FormData();
  file=req.file.filename;
  results_json=null;
  food_arr = null;

  gfs.openDownloadStreamByName(file).pipe(fs.createWriteStream('./output.png')).on('error',function(error){
                console.log(error);

            }).
            on('finish',function(){
                form.append( 'file', fs.createReadStream('output.png'),{filename: file, contentType: 'image'});
  				form.submit('http://ec2-34-226-213-76.compute-1.amazonaws.com/home', function(err,api_res)
  				{
	    			if(err){
	        			res.send(err);
	    			}
  			  
    			var results = '';
    			api_res.setEncoding('utf8')
    			api_res.on('data',function(d){

        			results+=d

    			}); //end of api_res_on

    			api_res.on('end',function(d)
    			{
        			results_json = JSON.parse(results);
        			// console.log(results_json);
        			// console.log(typeof results_json);
        			food_arr = getFoodNamesInDescOrder(results_json['Probabilities']);
                    var newImage =
                    {
	  					image_id:new mongoose.Types.ObjectId(req.file.id),
	  					image_filename:req.file.filename,
	  					contentType:req.file.contentType,
	  					uploadDate:new Date(req.file.uploadDate),
	      				prediction:results_json,
	  	     			food_desc_order:food_arr
  		     	    };
  			    	
  			    
  			    Image.create(newImage,function(err,image){
  			    	if(err){
  			    		console.log(err);
  			    	}
  			    	else{
  			    		// console.log(image);
  			    		console.log("Saved to db");
  			    		res.redirect("/result/"+file);
  			    	}
  			    });
  		
        
    		})  //end of res on end
    	}); //form submit

  		
  			// res.redirect("/result/"+file);	



 
 }); //end of on finish function


        
      


});


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
    console.log(food_colls);
    res.render("result_no",{file:req.params.filename,food_colls:food_colls});
    }
    });

	

});
app.put("/result/:filename/add-category/:pred_food",function(req,res){
	console.log("HITTING HIT WITH PRED_FOOD");

	Image.findOneAndUpdate({ image_filename:req.params.filename },{$set:{category:req.params.pred_food}}, function (err, foodImage) {
		if(err){
			console.log(err);
		}
		else{
			
            // console.log(foodImage);
            console.log("TO CHECK IF THIS IS SOMETHING OR NOT");
            console.log(foodImage.prediction['Probabilities']);
            foodCategoryColl = conn.model(food_bucket_name+"."+req.params.pred_food,foodCategoryImgSchema);
            newfoodInfo ={ 
            	image_id:foodImage.image_id,
    			image_filename:foodImage.image_filename,	
    			accuracy:foodImage.prediction['Probabilities'][req.params.pred_food],

            };
            foodCategoryColl.create(newfoodInfo,function(err,food){
            	if(err){
            		console.log(err);
            	}
            	else{
            		// console.log(food);
            		console.log("successfully added to database");
            		
            		mkdirp.sync(Food_Images_Dir+req.params.pred_food);
            		// {
            		// 	  if(typeof make_dir === undefined){
            		// 	  	console.log("Directory is already present");
            		// 	  }
            		//  }); //mkdirp ending	  
            		console.log("THIS IS THE PATH");
            		    console.log(Food_Images_Dir+req.params.pred_food+"/"+req.params.filename);
	 
	            		  gfs.openDownloadStreamByName(req.params.filename).pipe(fs.createWriteStream(Food_Images_Dir+req.params.pred_food+"/"+req.params.filename)).
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
	console.log("HERE IS REQ BODY");
	console.log(req.body);
	if(req.body.food_options=='other_option'){
		req.body.food_options = req.body.other_option_text

	}
	console.log("REQ.BODY.FOOD_OPTIONS IS");
	console.log(req.body.food_options);

	Image.findOneAndUpdate({ image_filename:req.params.filename },{$set:{user_category:req.body.food_options}}, function (err, foodImage) {
		if(err){
			console.log(err);
		}
		else{
			
           
            foodCategoryColl = conn.model(food_bucket_name+"."+req.body.food_options,foodCategoryImgSchema);
            newfoodInfo ={ 
            	image_id:foodImage.image_id,
    			image_filename:foodImage.image_filename,	
    			// accuracy:foodImage.prediction['Probabilities'][req.params.pred_food],

            };
            foodCategoryColl.create(newfoodInfo,function(err,food){
            	if(err){
            		console.log(err);
            	}
            	else{
            		// console.log(food);
            		console.log("successfully added to database");
            		
            		mkdirp(Food_Images_Dir+req.body.food_options);
            		// {
            		// 	  if(typeof make_dir === undefined){
            		// 	  	console.log("Directory is already present");

            		// 	  }
	 
	            		  gfs.openDownloadStreamByName(req.params.filename).pipe(fs.createWriteStream(Food_Images_Dir+req.body.food_options+"/"+req.params.filename)).
	            		  on('error',function(error){
	                         console.log(error);

	                    }).on('finish',function(){
	                    	console.log("FINISHED");

	                    });
                    // }); //mkdirp ending
            
             } //end of else
            });
			res.redirect("/");
		}

    });
 // res.send("YOLLOOO");


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
