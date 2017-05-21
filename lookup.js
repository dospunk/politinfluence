const mongo = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

var searchPeople = function(name, state, callback){
	//console.log("Second waterfall reached");//dev
	mongo.connect("mongodb://127.0.0.1:27017/local", function(err, db){
		if(err) console.log(err);
		
		var people = db.collection('people');
		
		if(!name){
			//console.log("no name");//dev
			var arry = people.find({state: state}).toArray();
			db.close();
			callback(null, arry);
		} else if(!state){
			//console.log("no state");//dev
			var arry = people.find({name: name}).toArray();
			db.close();
			callback(null, arry);
		} else {
			//console.log("name and state");//dev
			var arry = people.find({name: name, state: state}).toArray();
			db.close();
			callback(null, arry);
		}
		
		//Do not put anything under this that has anything to do with database
		db.close();
	});
}

var displayPerson = function(id, callback){
	mongo.connect("mongodb://127.0.0.1:27017/local", function(err, db){
		if(err) console.log(err);
		
		var people = db.collection('people');
		var votes = db.collection('votes');
		//var donations = db.collection('donations');
		var objID = new ObjectID(id);
		
		var person = people.findOne({_id: objID});
		//var donationArr = donations.find({to: objID}).toArray();
		var voteArr = votes.find({by: objID}).toArray();
		
		var array = [person, voteArr];
		
		db.close()
		callback(null, array);
	});
}

module.exports = {
	searchPeople: searchPeople,
	displayPerson: displayPerson,
};