const express = require('express');
const http = require('http');
const ejs = require('ejs');
const fs = require('fs');
const async = require('async');
const lookup = require('./lookup.js');


const app = express();
const server = http.createServer(app);

//express
app.get("/", function(req, res){
	res.sendFile('./home.html', {root: __dirname});
});

app.get("/search", function(req, res){
	async.waterfall([
		function(callback){
			//first function must have only one argument
			//console.log("First waterfall reached");//dev
			callback(null, req.query.name, req.query.state);
		},
		lookup.searchPeople,
		function(promise, callback){
			//console.log("Third waterfall reached");//dev
			promise.then(function(val){
				//console.log(val);//dev
				callback(null, val);
			});
		},
		function(list, callback){
			//console.log("Fourth waterfall reached");//dev
			var rawSearchStr = fs.readFileSync('search.ejs', 'utf-8');
			
			var searchStr = ejs.render(rawSearchStr, {list: list});
			res.send(searchStr);
		}
	], function(err){
		if(err) console.log(err);
	});
});

app.get("/info", function(req, res){
	async.waterfall([
		function(callback){
			callback(null, req.query.id);
		},
		lookup.displayPerson,
		function(promises, callback){
			Promise.all(promises).then(function(val){
				console.log(val);//dev
				callback(null, val);
			});
		},
		function(data, callback){
			//this will eventually be a function to consolidate donation info
			callback(null, data);
		},
		function(data, callback){
			var rawInfoStr = fs.readFileSync('info.ejs', 'utf-8');
			var infoStr = ejs.render(rawInfoStr, {personObj: data[0], donationArr: data[1], voteArr: data[2]});
			
			res.send(infoStr);
		}
	], function(err){
		if(err) console.log(err);
	});
});

//http
server.listen(5000, function(){
  console.log('listening on *:5000');
});