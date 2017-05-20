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

app.get('/vote', function(req, res){
	res.sendFile('./html/vote.html', {root: __dirname});
});

app.get('/update', function(req, res){
	var send = "";
	if(req.query.type === "person"){
		send += 'db.runCommand({findAndModify: "people",query: { _id: ObjectId("' + req.query.id + '") },update: {';
		if(req.query.name !== ""){
			send += ' name: "' + req.query.name + '",';
		}
		if(req.query.party !== ""){
			send += ' party: "' + req.query.party + '",';
		}
		if(req.query.link !== ""){
			send += ' link: "' + req.query.link + '",';
		}
		if(req.query.state !== ""){
			send += ' state: "' + req.query.state + '",';
		}
		if(req.query.district !== ""){
			send += ' district: ' + req.query.district + ',';
		}
		if(req.query.position !== ""){
			send += ' position: "' + req.query.position + '",';
		}
		
	} else if(req.query.type === "entity"){
		res.send("Not implemented yet");
	} else if(req.query.type === "donation"){
		res.send("Not implemented yet");
	} else if(req.query.type === "vote"){
		res.send("Not implemented yet");
	} else {
		res.send("Unknown Type");
	}
	send += '},new: true})';
	res.send(send);
});

app.get('/add', function(req, res){
	var q = req.query;
	if(req.query.type === "person"){
		res.send('db.people.insert({ name: "' + q.name + '", party: "' + q.party + '", link: "' + q.link + '", state: "' + q.state + '", district: ' + q.district + ', position: "' + q.position + '", donations: ' + q.donations + ' })');
	} else if(req.query.type === "entity"){
		res.send('db.entities.insert({ name: "' + q.name + '", issues: ' + q.issues + ', link: "' + q.link + '"})');
	} else if(req.query.type === "donation"){
		donationFunc(q.amount, q.date, q.to, q.from, res);
	} else if(req.query.type === "vote"){
		res.send("Not Implemented Yet");
	} else {
		res.send("Unknown Type");
	}
});

//http
server.listen(3005, function(){
  console.log('listening on *:3005');
});


function donationFunc(amount, date, to, frm, res){
	var result = "";
	amount = parseFloat(amount);
	mongo.connect("mongodb://127.0.0.1:27017/local", function(err, db){
		if(err) throw err;
		
		var donations = db.collection('donations');
		var donation = {
			amount: amount,
			date: date,
			to: new ObjectID(to),
			'from': new ObjectID(frm)
		};
		donations.insert(donation, function(err, data){
			if(err){
				result += "error inserting donation: " + err + "<br>";
			} else {
				result += "inserted donation<br>";
			}
		});
		
		var entities = db.collection('entities');
		entities.findOne({_id: new ObjectID(frm)}).then(function(val){
			console.log(val);
			
			var addTo = { $inc: {
				'donations.total': amount
			} };
			for(var key in val.issues){
				if (!val.issues.hasOwnProperty(key)) continue;
				
				//console.log(key + ": " + val.issues[key]);//dev
				
				if(val.issues[key] === 'pro' || val.issues[key] ==='ppro'){
					addTo['$inc']["donations." + key + '.pro'] = amount;
				} else if(val.issues[key] === 'anti' || val.issues[key] ==='panti'){
					addTo['$inc']["donations." + key + '.anti'] = amount;
				} else if(val.issues[key] === "unknown"){
					addTo['$inc']["donations." + key + ".unknown"] = amount;
				} else {
					result += "error updating person's donations: key value " + value + " is unknown<br>"
				}
				//console.log(addTo);//dev
			}
			
			
			var people = db.collection('people');
			people.updateOne({_id: new ObjectID(to)}, addTo, function(err, data){
				if(err){
					result += "error updating person: " + err + "<br>";
				} else {
					result += "person updated successfully<br>";
				}
				db.close();
				res.send(result);
			});
		});
	});
}