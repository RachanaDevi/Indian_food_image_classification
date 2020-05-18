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
	req['Content-Type']='application/json';		

	res.setHeader('Content-Type', 'application/json');		
	form.append( 'file', fs.createReadStream('output.png'),
	 {filename: 'sabudhana_sample.jpg', contentType: 'image/png'} );
	form.submit('http://ec2-34-226-213-76.compute-1.amazonaws.com/home', function(err, response,body) {
    if (err) throw err;
    console.log('Done');
    var data = '';
    response.setEncoding('utf8')
    response.on('data',function(d){
    	data+=d

    });
    response.on('end',function(d){
    	res.send(data);
    })
  
  });
  
});

app.listen(process.env.PORT||3000,process.env.IP,function(){
	console.log("Server has started");
});
