var  imagesSchema = require('../schemas/images');
var express = require('express');
var router = express.Router();
var fs  = require('fs');

const exported_db = require('../database.js');
const {getFoodNamesInDescOrder} = require('./functions/index.js');
var mongoose = exported_db.mongoose,
      upload = exported_db.upload,
      conn = exported_db.conn,
      Image = exported_db.Image;
      

// var Image = conn.model("images",imagesSchema);
console.log("HEREEE")  
// console.log(Image);

 /*************ROOT ROUTE ***************/

// conn.on("error", () => {
//     console.log("Some error occurred from the database");
// });

// conn.once("open",()=>{
//   gfs = new mongoose.mongo.GridFSBucket(
//       conn.db,{
//         bucketName: "uploads"
//       });
// });


router.get("/",(req,res)=>{
  if(!gfs){
    console.log("Some error occurred, check connection to db");
    res.send("Some error occured, check connection to db");
    process.exit(0);
  }

  res.render("index");
});


router.post("/upload",upload.single("file"),(req,res)=>{
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
                console.log("Saved to db");
                res.redirect("/result/"+file);
              }
            });
      
        
        })  //end of res on end
      }); //form submit

      
        // res.redirect("/result/"+file); 



 
 }); //end of on finish function


        
      


});

// router.get("/image/:filename", (req, res) => {
//   const file = gfs
//     .find({
//       filename: req.params.filename
//     })
//     .toArray((err, files) => {
//       if (!files || files.length === 0) {
//         return res.status(404).json({
//           err: "no files exist"
//         });
//       }
//       gfs.openDownloadStreamByName(req.params.filename).pipe(res);
//     });
// });

 

/***********************************************/

module.exports = router;