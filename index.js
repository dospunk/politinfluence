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

app.get("/search", function(req, res){
	//console.log("Search loading...");//dev
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
			var rawSearchStr = fs.readFileSync('ejs/search.ejs', 'utf-8');
			
			var searchStr = ejs.render(rawSearchStr, {list: list});
			res.send(searchStr);
			//console.log("Search loaded.\n");//dev
		}
	], function(err){
		if(err) console.log(err);
	});
});

app.get("/info", function(req, res){
	//console.log("Loading info...");//dev
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
				//console.log(val);//dev
				callback(null, val);
			});
		},
		function(data, callback){
			//console.log("Reading file...");//dev
			var rawInfoStr = fs.readFileSync('ejs/info.ejs', 'utf-8');
			//console.log("File read.\n");//dev
			//console.log("Rendering file...");//dev
			var infoStr = ejs.render(rawInfoStr, {personObj: data[0], voteArr: data[1], pageNum: parseInt(req.query.pageNum)});
			//console.log("File rendered.\n");//dev
			
			res.send(infoStr);
			//console.log("Info loaded.\n");//dev
		}
	], function(err){
		if(err) console.log(err);
	});
});

//http
server.listen(5000, function(){
  console.log('listening on *:5000');
});