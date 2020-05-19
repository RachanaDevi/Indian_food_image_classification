var bodyParser = require('body-parser'),
	express = require('express'),
	app = express();

const GridFsStorage = require('multer-gridfs-storage'),
      mongoose = require('mongoose'),
      crypto = require('crypto'),
      multer = require('multer'),
      path = require('path'),
	  fs = require('fs'),
      FormData = require('form-data'),
      request = require('request'),
      form = new FormData();



const mongoURI = "mongodb://localhost:27017/node-file-upl";
const conn = mongoose.createConnection(mongoURI,{
	useNewUrlParser : true,
	useUnifiedTopology : true

});

let gfs;
//initializing GridFS storage
conn.once("open",()=>{
	gfs = new mongoose.mongo.GridFSBucket(
			conn.db,{
				bucketName: "uploads"
			});
});

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));
app.use(express.json());
app.set("view engine","ejs");

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
  prob_food_dict = swapKeyandValueOfDict(food_prob_dict);
  // console.log(prob_food_dict);
  prob_arr = getKeysOfDict(prob_food_dict);
  prob_arr = arrayInDescendingOrder(prob_arr);
  // console.log(prob_arr);
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
  file=req.file.filename;
    



  res.redirect("/result/"+file);
});


app.get("/result/:filename",(req, res)=>{
	const file_res = gfs.find({
		 filename : req.params.filename

		}).toArray((err,files)=>{
			if(!files || files.length == 0){
				return res.status(404).json({
					err: "no files exist"
				});
			}


			gfs.openDownloadStreamByName(req.params.filename) //req.params.filename //files[0]._id
			.pipe(fs.createWriteStream('./output.png')).
			on('error',function(error){
				console.log(error)

			}).
			on('finish',function(){
				console.log('done!');
			});
			// res.render("result",{file:files[0]});

		}); //to Array over

	// res.setHeader('Content-Type', 'application/json');		
	form.append( 'file', fs.createReadStream('output.png'),
	 {filename: 'sabudhana_sample.jpg', contentType: 'image/png'} );
	form.submit('http://ec2-34-226-213-76.compute-1.amazonaws.com/home', function(err, response,body) {
    if (err) throw err; //make error page
    console.log('Done');
    var results = '';
    response.setEncoding('utf8')
    response.on('data',function(d){
    	results+=d

    });
    response.on('end',function(d){
    	// console.log(JSON.parse(results));
    	results_json = JSON.parse(results);
    	// console.log(results_json['Probablities'][0][);
    	food_arr = getFoodNamesInDescOrder(results_json['Probablities'][0]);
    	

    	res.render("result",{results:JSON.parse(results),file:req.params.filename,food:food_arr});
    })
  
  });

	// res.setHeader('Content-Type', 'application/json');		
	// form.append( 'file', 'output.png',
	//  {filename: 'samosa_sample.jpg', contentType: 'image/png'} );
	// form.submit('http://ec2-34-226-213-76.compute-1.amazonaws.com/home', function(err, response,body) {
 //    if (err) throw err;
 //    console.log('Done');
 //    var prediction_json = '';
 //    response.setEncoding('utf8')
 //    response.on('data',function(d){
 //    	prediction_json+=d

 //    });
 //    response.on('end',function(d){
 //    	console.log(prediction_json);
 //    	console.log(typeof prediction_json);
 //    	console.log(JSON.parse(prediction_json));
 //    	res.render("result",{results:prediction_json,file:files[0]});
 //    })
  
 //  });

	
}); //app.get over

app.get("/result/:filename/no",(req,res)=>{
	res.render("result_no",{file:req.params.filename});

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
