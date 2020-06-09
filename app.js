const exported_db = require('./database');
var mongoose = exported_db.mongoose,
      upload = exported_db.upload,
      conn = exported_db.conn,
      Image = exported_db.Image;


const methodOverride = require('method-override'),
      bodyParser = require('body-parser'),
	    express = require('express'),
	    fs = require('fs'),
	    app = express();




var indexRoutes = require('./routes/index');
var resultRoutes = require('./routes/result');


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
app.use("/result/:filename",resultRoutes);



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


app.listen(process.env.PORT||3000,process.env.IP,function(){
	console.log("Server has started");
});
