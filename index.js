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
		/**
		 * First function can only take one parameter
		 */
		function(callback){
			//console.log("First waterfall reached");//dev
			callback(null, q);
		},
		lookup.searchPeople,
		/**
		 * Waits for the database inquery to resolve
		 * @param {Promise} promise A promise containing the list of people
		 */
		function(promise, callback){
			//console.log("Third waterfall reached");//dev
			promise.then(function(val){
				//console.log(val);//dev
				callback(null, val);
			});
		},
		/**
		 * Render and send the search page
		 * @param {Object[]} list The array of people
		 */
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
		/**
		 * First function can only have one argument
		 */
		function(callback){
			//console.log("First waterfall reached");//dev
			//console.log(req.query.name);//dev
			callback(null, req.query.name);
		},
		lookup.searchEntity,
		/**
		 * Waits for the database inquery to resolve
		 * @param {Promise} promise A promise containing the list of entities
		 */
		function(promise, callback){
			//console.log("Third waterfall reached");//dev
			promise.then(function(val){
				//console.log(val);//dev
				callback(null, val);
			});
		},
		/**
		 * Render and send the search page
		 * @param {Object[]} list The array of entities
		 */
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
	if(req.query.mode === "votes"){
		async.waterfall([
			function(callback){
				callback(null, req.query.id);
			},
			lookup.displayPerson,
			function(promises, callback){
				Promise.all(promises).then(function(val){
					val[1].sort(function(a, b){
						return new Date(b.date) - new Date(a.date);
					});
					console.log(val);//dev
					callback(null, val);
				});
			},
			function(data, callback){
				var infoStr = ejs.renderFile('ejs/person.ejs', {personObj: data[0], voteArr: data[1], pageNum: parseInt(req.query.pageNum)}, function(err, str){
					if(err) console.log(err);
					res.send(str);
					//console.log("Info loaded.\n");//dev
				});
			}
		], function(err){
			if(err) console.log(err);
		});
	} else if(req.query.mode === "donations"){
		async.waterfall([
			function(callback){
				callback(null, req.query.id);
			},
			lookup.displayDonations,
			function(promises, callback){
				Promise.all(promises).then(function(val){
					val[1].sort(function(a, b){
						return new Date(b.date) - new Date(a.date);
					});
					console.log(val);//dev
					callback(null, val);
				});
			},
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
		function(callback){
			callback(null, req.query.id);
		},
		lookup.displayEntity,
		function(promises, callback){
			Promise.all(promises).then(function(val){
				val[1].sort(function(a, b){
					return new Date(b.date) - new Date(a.date);
				});
				//console.log(val);//dev
				callback(null, val);
			});
		},
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