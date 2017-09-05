const mongo = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

var searchPeople = function(q, callback){
	//console.log("Second waterfall reached");//dev
	mongo.connect("mongodb://127.0.0.1:27017/politinfluence", function(err, db){
		if(err) console.log(err);

		var people = db.collection('people');
		var search = {};

		if(q.firstName){
			search['name.first'] = q.firstName;
		}
		if(q.middleName){
			search['name.middle'] = q.middleName;
		}
		if(q.lastName){
			search['name.last'] = q.lastName;
		}
		if(q.state){
			search.state = q.state;
		}

		var array = people.find(search).toArray();
		db.close();
		callback(null, array);
	});
}

var displayPerson = function(id, callback){
	mongo.connect("mongodb://127.0.0.1:27017/politinfluence", function(err, db){
		if(err) console.log(err);

		var people = db.collection('people');
		var bills = db.collection('bills');
		var objID = new ObjectID(id);

		people.findOne({_id: objID}, function(err, person){
			var voteArr = person.votes.map(function(vote){
				return bills.findOne({_id: vote.bill}).then(function(bill){
					if(bill) bill.yn = vote.yn;
					return bill;
				},
				function(rejected){
					console.log(rejected);
				});
			});
			Promise.all(voteArr).then(function(voteArr){
				var array = [person, voteArr];
				db.close();
				//console.log(array);//dev
				callback(null, array);
			},
			function(rejected){
				console.log(rejected);
				db.close();
			});
		});
	});
}

var searchEntity = function(name, callback){
	mongo.connect("mongodb://127.0.0.1:27017/politinfluence", function(err, db){
		if(err) console.log(err);

		var entities = db.collection('entities');
		var arry = entities.find({name: name}).toArray();

		db.close();
		callback(null, arry);
	});
}

var displayEntity = function(id, callback){
	mongo.connect("mongodb://127.0.0.1:27017/politinfluence", function(err, db){
		if(err) console.log(err);

		var entities = db.collection('entities');
		var donations = db.collection('donations');
		var objID = new ObjectID(id);

		var entity = entities.findOne({_id: objID});
		var donArr = donations.find({'from': objID}).toArray();
		var array = [entity, donArr];

		db.close();
		callback(null, array);
	});
}

var displayDonations = function(id, callback){
	mongo.connect("mongodb://127.0.0.1:27017/politinfluence", function(err, db){
		if(err) console.log(err);
		//console.log("got here");//dev
		var people = db.collection('people');
		var donations = db.collection('donations');
		var objID = new ObjectID(id);

		var person = people.findOne({_id: objID});
		var donArr = donations.find({to: objID}).toArray();
		Promise.all([person, donArr]).then(function(array){
			array[1].sort(function(a, b){
				return new Date(b.date) - new Date(a.date);
			});
			//console.log(val);//dev
			db.close();
			callback(null, array);
		});
	});
}

module.exports = {
	searchPeople: searchPeople,
	displayPerson: displayPerson,
	searchEntity: searchEntity,
	displayEntity: displayEntity,
	displayDonations: displayDonations,
};
