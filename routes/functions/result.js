function checkIfCollOfBucket(bktName,collName){
	var bktRegex = new RegExp(bktName,"g")
	return bktRegex.test(collName);
}

function getCollNameInsideBucket(bktName,collName){
	if(checkIfCollOfBucket(bktName,collName)){
		console.log("INSIDE IF");
		var after_bucket = bktName+"\.(.*)"
		var getCollRegex = new RegExp(after_bucket,"g")
		return getCollRegex.exec(collName)[1];

	}

}

exports.getCollNameInsideBucket = getCollNameInsideBucket;