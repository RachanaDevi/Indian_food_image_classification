/* Declaring node modules */
var GridFsStorage = require('multer-gridfs-storage'),
    mongoose = require("mongoose"),
 	crypto = require('crypto'),
    multer = require('multer'),
	path = require('path');

// let gfs;


const mongoURI = "mongodb://localhost:27017/food-img-classification";

//creating connection to mongoDB
const conn = mongoose.createConnection(mongoURI,{
	useNewUrlParser : true,
	useUnifiedTopology : true,
	useFindAndModify: false,

});



mongoose.Promise = global.Promise;

//create storage for pictures using GridFS
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


//middle-ware multer for uploading files in database
const upload = multer({
	storage
});


const  imagesSchema = require('./schemas/images');
var Image = conn.model("images",imagesSchema);
console.log(Image);

exports.mongoose = mongoose;
exports.conn =conn;
exports.upload = upload;
exports.Image = Image;
