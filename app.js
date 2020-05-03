var express = require('express');
const crypto = require('crypto'),
	  fs = require('fs'),
      path = require('path'),
      mongoose = require('mongoose'),
      multer = require('multer'),
      GridFsStorage = require('multer-gridfs-storage');
var app = express();

const mongoURI = "mongodb://localhost:27017/node-file-upl";
const conn = mongoose.createConnection(mongoURI,{
	useNewUrlParser : true,
	useUnifiedTopology : true

});

let gfs;
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

app.use(express.static(__dirname+"/public"));
app.use(express.json());
app.set("view engine","ejs");


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
  console.log("HERE WHOLE FILE CONTENTS-->\n");
  console.log(req.file)
 // file = file.match(/^.*(?=\.)/g)
  res.redirect("/result/"+file); //had used sendFile before	
});





app.get("/result/:filename",(req, res)=>{
	const files = gfs.find({
		 filename : req.params.filename

		},(err,files)=>{
			if(!files || files.length == 0){
				return res.status(404).json({
					err: "no files exist"
				});
			}
			console.log("THE FILE->",files);
			gfs.openDownloadStreamByName(req.params.filename) //req.params.filename //files[0]._id
			.pipe(fs.createWriteStream('./output.png')).
			on('error',function(error){
				console.log(error)

			}).
			on('finish',function(){
				console.log('done!');
			});

		})
	res.render("result",{file:files});
});



app.get("/image/:filename", (req, res) => {
  // console.log('id', req.params.id)
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
