const express = require('express');
const http = require('http');
const ejs = require('ejs');
const fs = require('fs');
const async = require('async');
const lookup = require('./lookup.js');


const app = express();
const server = http.createServer(app);

//express
app.use(express.static(__dirname));

app.get("/", function(req, res){
	//console.log("Loading home...");//dev
	res.sendFile('./home.html', {root: __dirname});
	//console.log("Home loaded.\n");//dev
});

app.get("/searchPeople", function(req, res){
	var q = req.query;
	//console.log("Search loading...");//dev
	async.waterfall([
		//First function can only take one parameter
		function(callback){
			//console.log("First waterfall reached");//dev
			callback(null, q);
		},
		lookup.searchPeople,
		//Waits for the database inquery to resolve
		//promise is a promise containing the list of people
		function(promise, callback){
			//console.log("Third waterfall reached");//dev
			promise.then(function(val){
				//console.log(val);//dev
				callback(null, val);
			});
		},
		 //Render and send the search page
		 //list is the array of people
		function(list, callback){
			//console.log("Fourth waterfall reached");//dev
			ejs.renderFile('ejs/searchPeople.ejs', {list: list}, function(err, str){
				if(err) console.log(err);

				res.send(str);
			});
			//console.log("Search loaded.\n");//dev
		}
	], function(err){
		if(err) console.log(err);
	});
});

app.get("/searchEntities", function(req, res){
	//console.log("Search loading...");//dev
	async.waterfall([
		//First function can only have one argument
		function(callback){
			//console.log("First waterfall reached");//dev
			//console.log(req.query.name);//dev
			callback(null, req.query.name);
		},
		lookup.searchEntity,
		//Waits for the database inquery to resolve
		//promise is a promise containing the list of entities
		function(promise, callback){
			//console.log("Third waterfall reached");//dev
			promise.then(function(val){
				//console.log(val);//dev
				callback(null, val);
			});
		},
		//Render and send the search page
		//list is the array of entities
		function(list, callback){
			//console.log("Fourth waterfall reached");//dev
			ejs.renderFile('ejs/searchEntities.ejs', {list: list}, function(err, str){
				if(err) console.log(err);

				res.send(str);
			});
			//console.log("Search loaded.\n");//dev
		}
	], function(err){
		if(err) console.log(err);
	});
});

app.get("/person", function(req, res){
	//console.log("Loading info...");//dev
	//Load the person's votes page
	if(req.query.mode === "votes"){
		async.waterfall([
			//first func can only take oone param
			function(callback){
				callback(null, req.query.id);
			},
			//prepares the data for the page
			lookup.displayPerson,
			//renders and sends the page
			//data is an array containing the perosn's info and their votes
			function(data, callback){
				//console.log(data[1]);//dev
				var infoStr = ejs.renderFile('ejs/person.ejs', {personObj: data[0], voteArr: data[1], pageNum: parseInt(req.query.pageNum)}, function(err, str){
					if(err) console.log(err);
					res.send(str);
					//console.log("Info loaded.\n");//dev
				});
			}
		], function(err){
			if(err) console.log(err);
		});
	//Load the person's donations page
	} else if(req.query.mode === "donations"){
		async.waterfall([
			//First func can only take one param
			function(callback){
				callback(null, req.query.id);
			},
			//Prepares the donation info to display on the page
			lookup.displayDonations,
			//renders and sends the page
			//data is an array containing the person's info and the donation info
			function(data, callback){
				var entityStr = ejs.renderFile('ejs/donations.ejs', {personObj: data[0], donArr: data[1], pageNum: parseInt(req.query.pageNum)}, function(err, str){
					if(err) console.log(err);
					res.send(str);
				});
			}
		], function(err){
			if(err) console.log(err);
		});
	}
});

app.get("/entity", function(req, res){
	async.waterfall([
		//First func can only take one param
		function(callback){
			callback(null, req.query.id);
		},
		//Prepares the data to diaplay
		lookup.displayEntity,
		//Sorts the entity's donations by date
		//promises is an array containing Promises that resolve to the entity's info and the donation info
		function(promises, callback){
			Promise.all(promises).then(function(val){
				val[1].sort(function(a, b){
					return new Date(b.date) - new Date(a.date);
				});
				//console.log(val);//dev
				callback(null, val);
			});
		},
		//Renders and sends the page
		//data is an array containing the entity's info and the (now sorted) donation info
		function(data, callback){
			var entityStr = ejs.renderFile('ejs/entity.ejs', {entityObj: data[0], donArr: data[1], pageNum: parseInt(req.query.pageNum)}, function(err, str){
				if(err) console.log(err);
				res.send(str);
			});
		}
	], function(err){
		if(err) console.log(err);
	});
});

//http
server.listen(5000, function(){
  console.log('listening on *:5000');
});
