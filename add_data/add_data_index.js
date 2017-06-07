const express = require('express');
const http = require('http');
const async = require('async');
const mongo = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const app = express();
const server = http.createServer(app);

//express
app.get("/", function(req, res){
	res.sendFile('./html/home.html', {root: __dirname});
});

app.get('/person', function(req, res){
	res.sendFile('./html/person.html', {root: __dirname});
});

app.get('/entity', function(req, res){
	res.sendFile('./html/entity.html', {root: __dirname});
});

app.get('/donation', function(req, res){
	res.sendFile('./html/donation.html', {root: __dirname});
});

app.get('/bill', function(req, res){
	res.sendFile('./html/bill.html', {root: __dirname});
});

app.get('/update', function(req, res){
	var q = req.query;
	if(q.type === "person"){
		send += updatePersonFunc(q, res);
	} else if(q.type === "entity"){
		updateEntityFunc(q, res);
	} else if(q.type === "donation"){
		res.send("Not implemented yet");
	} else if(q.type === "vote"){
		res.send("Not implemented yet");
	} else {
		res.send("Unknown Type");
	}
});

app.get('/add', function(req, res){
	var q = req.query;
	if(q.type === "person"){
		addPersonFunc(q, res);
	} else if(q.type === "entity"){
		addEntityFunc(q, res);
	} else if(q.type === "donation"){
		addDonationFunc(q, res);
	} else if(q.type === "bill"){
		addBillFunc(q, res);
	} else {
		res.send("Unknown Type");
	}
});

//http
server.listen(3005, function(){
  console.log('listening on *:3005');
});


function addDonationFunc(q, res){
	var result = "";
	q.amount = parseFloat(q.amount);
	mongo.connect("mongodb://127.0.0.1:27017/politinfluence", function(err, db){
		if(err) console.log(err);
		
		var donations = db.collection('donations');
		var donation = {
			amount: q.amount,
			date: q.date,
			to: new ObjectID(q.to),
			'from': new ObjectID(q["from"])
		};
		donations.insert(donation, function(err, data){
			if(err){
				result += "error inserting donation: " + err + "<br>";
			} else {
				result += "inserted donation<br>";
			}
		});
		
		//update person's donations
		var entities = db.collection('entities');
		entities.findOne({_id: new ObjectID(q['from'])}).then(function(val){
			//console.log(val);//dev
			
			var addTo = { $inc: {
				'donations.total': q.amount
			} };
			for(var key in val.issues){
				if (!val.issues.hasOwnProperty(key)) continue;
				
				//console.log(key + ": " + val.issues[key]);//dev
				
				if(val.issues[key] === 'pro' || val.issues[key] ==='ppro'){
					addTo['$inc']["donations." + key + '.pro'] = q.amount;
				} else if(val.issues[key] === 'anti' || val.issues[key] ==='panti'){
					addTo['$inc']["donations." + key + '.anti'] = q.amount;
				} else if(val.issues[key] === "unknown"){
					addTo['$inc']["donations." + key + ".unknown"] = q.amount;
				} else {
					result += "error updating person's donations: key value " + value + " is unknown<br>"
				}
				//console.log(addTo);//dev
			}
			
			
			var people = db.collection('people');
			people.updateOne({_id: new ObjectID(q.to)}, addTo, function(err, data){
				if(err){
					result += "error updating person: " + err + "<br>";
				} else {
					result += "person updated successfully<br>";
				}
				db.close();
				res.send(result + '<br><a href="/donation">back</a>');
			});
		});
	});
}

function addPersonFunc(q, res){
	var person = {
		name: {
			first: q.firstName,
			middle: q.middleName,
			last: q.lastName
		},
		party: q.party,
		link: q.link,
		state: q.state,
		district: parseInt(q.district),
		position: q.position,
		donations: {
			total: 0
		},
		votes: [{}]
	};
	mongo.connect("mongodb://127.0.0.1:27017/politinfluence", function(err, db){
		var people = db.collection("people");
		people.insertOne(person, function(err, result){
			db.close();
			if(err){
				res.send(err + '<br><br><a href="/person">back</a>');
			} else {
				res.send(result + '<br><br><a href="/person">back</a>');
			}
		});
	});
}

function addEntityFunc(q, res){
	var entity = {
		name: q.name,
		issues: JSON.parse(q.issues),
		link: q.link
	};
	mongo.connect("mongodb://127.0.0.1:27017/politinfluence", function(err, db){
		if(err) console.log(err);
		
		var entities = db.collection("entities");
		entities.insertOne(entity, function(err, result){
			if(err) console.log(err);
			
			db.close();
			res.send(result + "<br><br><a href=\"/entity\">back</a>");
		});
	});
}

function addBillFunc(q, res){ 
	var bill = {
		name: q.name,
		desc: q.desc,
		issues: q.issues.split(","),
		date: q.date
	}
	mongo.connect("mongodb://127.0.0.1:27017/politinfluence", function(err, db){
		if(err){
			db.close();
			res.send(err);
		}
		
		var bills = db.collection("bills");
		bills.insertOne(bill, function(err, result){
			db.close();
			if(err){
				res.send(err + '<br><br><a href="/bill">back</a>');
			} else {
				res.send(result + '<br><br><a href="/bill">back</a>');
			}
		});
	});
}

function updatePersonFunc(q, res){
	var send = 'db.runCommand({findAndModify: "people",query: { _id: ObjectId("' + q.id + '") },update: { $set: {';
	if(q.name !== ""){
		send += ' name: ' + q.name + ',';
	}
	if(q.party !== ""){
		send += ' party: "' + q.party + '",';
	}
	if(q.link !== ""){
		send += ' link: "' + q.link + '",';
	}
	if(q.state !== ""){
		send += ' state: "' + q.state + '",';
	}
	if(q.district !== ""){
		send += ' district: ' + q.district + ',';
	}
	if(q.position !== ""){
		send += ' position: "' + q.position + '",';
	}
	if(q.donations !== ""){
		send += ' donations: ' + q.donations;
	}
	res.send(send);
}

function updateEntityFunc(q, res){
	mongo.connect("mongodb://127.0.0.1:27017/politinfluence", function(err, db){
		if(err) console.log(err);
		
		var send = "";
		var entities = db.collection("entities");
		var donations = db.collection("donations");
		var people = db.collection("people");
		var newData = {$set: {}};
		
		if(q.link){
			newData.$set.link = q.link;
		}
		if(q.issues){
			newData.$set.issues = q.issues;
		}
		if(q.name){
			newData.$set.name = q.name;
		}
		
		entities.update({_id: new ObjectID(q.id)}, newData, function(err, result){
			if(err) send += err + '<br><br>';
			if(result) send += result + '<br><br>';
			if(!newData.$set.issues){
				send += '<br><a href="/entity">back</a>';
				db.close();
				res.send(send);
			}
		});
		
		//for every person donated to, update donations is issues were updated
		if(newData.$set.issues){
			donations.find({'from': new ObjectID(q.id)}).toArray(function(err, donationArr){
				if(err) console.log(err);
			
				var peopleUpdatedArr = donationArr.map(function(donation){
					return people.findOne({_id: donation.to}).then(function(person){
						send += "Updated " + person.name.first + " " + person.name.last + " from " + person.state + "'s donations. Their ID is " + person._id + "<br>";
						return updatePersonDonations(person);
					},
					function(rejected){
						send += rejected + "<br>";
					});
				});
				
				Promise.all(peopleUpdatedArr).then(function(arr){
					arr.forEach(function(updateResult){
						//console.log(updateResult);//dev
						send += updateResult;
					});
					
					send += '<br><a href="/entity">back</a>';
					res.send(send);
					db.close();
				},
				function(rejected){
					console.log(rejected);
				});
			});
		}
	});
}

/*
 * This is all wrong. It should start at the entity not the person
 * 
 * Actually, this could work. If, when you update the entity, you go through each donation that the entity has made
 * and run this on each person that the entity has made donations to, it would work but be very slow with a lot of data.
 *
 * In short, needs major rework
 */
function updatePersonDonations(person){
	var result = "";
	mongo.connect("mongodb://127.0.0.1:27017/politinfluence", function(err, db){
		var people = db.collection("people");
		var donations = db.collection("donations");
		var entities = db.collection("entities");
		
		async.waterfall([
			function(callback){
				//reset donations
				//console.log("1 waterfall reached");//dev
				people.updateOne({_id: person._id}, {$set:{donations:{total:0}}}, function(err, val){
					if(err) console.log(err);
					if(val) result += "Set donations to 0<br>";
					callback(null);
				});
			},
			function(callback){
				//find all donations to the person
				//console.log("2 waterfall reached");//dev
				donations.find({to: person._id}).toArray(function(err, arr){
					if(err) console.log(err);
					//console.log(arr)//dev
					
					callback(null, arr);
				});
			},
			function(donationsArr, callback){
				//console.log("3 waterfall reached");//dev
				var moneyAndIssuesArr = donationsArr.map(function(donation){
					//find the entity that gave the money
					return entities.findOne({_id: donation['from']}).then(function(entity){
						//create an array of donation amounts and relevant issues
						return {
							amount: donation.amount,
							issues: entity.issues
						};
					},
					function(rejected){
						console.log(rejected);
					});
				});
				
				Promise.all(moneyAndIssuesArr).then(function(result){
					//console.log(result);//dev
					callback(null, result);
				},
				function(rejected){
					console.log(rejected);
				});
			},
			function(moneyAndIssuesArr, callback){
				//console.log("4 waterfall reached");//dev
				var resultsArr = moneyAndIssuesArr.map(function(obj){
					var addTo = {
						$inc: {
							'donations.total': obj.amount
						}
					};
					for(var key in obj.issues){
						if (!obj.issues.hasOwnProperty(key)) continue;
						
						//console.log(key + ": " + obj.issues[key]);//dev
						
						if(obj.issues[key] === 'pro' || obj.issues[key] ==='ppro'){
							addTo['$inc']["donations." + key + '.pro'] = obj.amount;
						} else if(obj.issues[key] === 'anti' || obj.issues[key] ==='panti'){
							addTo['$inc']["donations." + key + '.anti'] = obj.amount;
						} else if(obj.issues[key] === "unknown"){
							addTo['$inc']["donations." + key + ".unknown"] = obj.amount;
						} else {
							result += "error updating person's donations: key value " + obj.issues[key] + " is unknown<br>"
						}
						//console.log(addTo);//dev
					}
					return people.updateOne({_id: person._id}, addTo).then(function(result){
						return result;
					},
					function(rejected){
						console.log(rejected);
					});
				});
				Promise.all(resultsArr).then(function(results){
					//console.log(results);//dev
					callback(null);
				},
				function(rejected){
					console.log(rejected);
					callback(null);
				});
			}
		], function(err){
			if(err) console.log(err);
			//console.log("5 waterfall reached");//dev
			
			db.close();
		});
	});
	//This isn't actually gonna help with anything because its not synchronous
	return result;
}