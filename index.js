var express = require('express');
var bodyParser = require('body-parser');
var FormData = require('form-data');
var request = require('request'),
    form = new FormData(),
	fs = require('fs');

var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.get('/', function(req, res){


	form.append( 'file', fs.createReadStream('output.png'),
	 {filename: 'sabudhana_sample.jpg', contentType: 'image/png'} );
	form.submit('http://ec2-34-226-213-76.compute-1.amazonaws.com/home', function(err, res) {
    if (err) throw err;
    console.log('Done');
    console.log(res.statusCode);
    console.log();
  });
// 	request.post({url:'http://ec2-34-226-213-76.compute-1.amazonaws.com/home',json:
// {
//     "file":"output.png"
// }},
// 	 function(err,httpResponse,body){ 
// 	 	console.log("HEYLO");
// 	 	console.log(body);
// 	 	// console.log(httpResponse.statusCode);

// 		if(err){
// 			// console.log("INSIDE ERROR");
//    			console.log(err);
//    		}
//     	if (!err) {
//     		console.log("INSIDE NO ERROR");
//     		// console.log(body);
//      		 // var info = JSON.parse(body);
//      		 // console.log(info.text());
//      		       // console.log("HELLO");
//      		       // res.send("<h1>HELLO</h1>");
//       		res.json(body);
//     	}
// 	});
  
});


// request('http://google.com/doodle.png').pipe(fs.createWriteStream('doodle.png'));
app.listen(process.env.PORT||3000,process.env.IP,function(){
	console.log("Server has started");
});
