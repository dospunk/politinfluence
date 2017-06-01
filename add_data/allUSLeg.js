const mongo = require('mongodb').MongoClient;
const everyone = [];

mongo.connect("mongodb://127.0.0.1:27017/local", function(err, db){
	everyone.forEach(function(person){
		if(new Date(person.terms[person.terms.length-1].end) < new Date(2017/06/01)){}
		else {
		var x = {
			name: {first: person.name.first, middle: person.name.middle, last: person.name.last},
			link: person.terms[person.terms.length-1].url,
			party: person.terms[person.terms.length-1].party,
			position: "",
			state: person.terms[person.terms.length-1].state,
			district: 0,
			donations: { total: 0 }
		}
		
		if(person.terms[person.terms.length-1].district){
			x.district = person.terms[person.terms.length-1].district;
		}
		if(person.terms[person.terms.length-1].type === "rep"){
			x.position = "United States House Of Representatives";
		} else if(person.terms[person.terms.length-1].type === "sen"){
			x.position = "United States Senate";
		}
		
		var people = db.collection("people");
		
		people.insertOne(x, function(err, res){
			if(err) console.log(err);
			console.log(res);
		});
		}
	});
	db.close();
});