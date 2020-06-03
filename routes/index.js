var express = require('express');
var router = express.Router();
var  imagesSchema = require('../schemas/images');
const exported_db = require('../database.js');
var mongoose = exported_db.mongoose,
      upload = exported_db.upload,
      conn = exported_db.conn,
      gfs = exported_db.gfs;

var Image = conn.model("images",imagesSchema);  
 /*************ROOT ROUTE ***************/

conn.on("error", () => {
    console.log("Some error occurred from the database");
});

conn.once("open",()=>{
  gfs = new mongoose.mongo.GridFSBucket(
      conn.db,{
        bucketName: "uploads"
      });
});



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
      arr[index]=(parseFloat(arr[index]).toFixed(15)).toString();
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
  food_prob_dict = changeDictValuesToFixed15(food_prob_dict);
  prob_food_dict = swapKeyandValueOfDict(food_prob_dict);
  prob_arr = getKeysOfDict(prob_food_dict);
  prob_arr = arrayInDescendingOrder(prob_arr);
  food_arr = getValuesInSameOrderOfTheKeyArr(prob_arr,prob_food_dict);
  return food_arr;
}

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


 

/***********************************************/

module.exports = router;