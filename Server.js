"use strict";
var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';
var path1 = require('path');
var http = require('http');


var fs = require('fs');
var twilio = require('twilio');
var bodyParser = require('body-parser');


var randomNumber;
var isMember = false;
var arr = [];
var doorState = "CLOSED";

var getQueryString = function ( field, url ) {
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
};

function processFile(inputFile) {
    var fs = require('fs'),
        readline = require('readline'),
        instream = fs.createReadStream(inputFile),
        outstream = new (require('stream'))(),
        rl = readline.createInterface(instream, outstream);
     
    rl.on('line', function (line) {
        arr.push(line);
    });
    
}
	
function toggleDoor() {
    console.log(doorState);
    
}
		

const server = app.listen(3000, () => {
  console.log("Live at Port 3000");
  processFile('MemberInfo.txt');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('a user connected');
  

  socket.on('message', function (message) {
        if(message === 'toggle')
		{
			if(doorState === "CLOSED")
				doorState = "OPEN";
			else if(doorState === "OPEN")
				doorState = "CLOSED";
			
			toggleDoor();
		}
    }); 

  //io.emit('message', doorState);
	
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
		
router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});


router.get("/",function(req,res){
	


	processFile('MemberInfo.txt');
	
    randomNumber = '' + Math.floor(Math.random()*10) + Math.floor(Math.random()*10) + Math.floor(Math.random()*10) + Math.floor(Math.random()*10);
	var client = twilio('ACeccfd659680a2f7dd44e42501c8b5476', '5bc503795d0659246b167fb0510ebd1b');
	var requestedUrl = req.protocol + '://' + req.hostname + ':3000' + req.url;
	var phoneNumber = getQueryString('number', requestedUrl);

	
	console.log(arr);
	var index, value, result;
	for (index = 0; index < arr.length; index++) 
	{
		value = arr[index];
		if (value.substring(value.length-10, value.length) == phoneNumber) {
			isMember = true;
			result = index;
			break;		
		}
		else
			isMember = false;
	}
	console.log("Variably isMember " + isMember);
	console.log(arr[result]);
	
	var nameDetails = arr[result];
	if(nameDetails != null)
		nameDetails = nameDetails.split(' : ')[0];
	
	io.emit('message', nameDetails);
	
// Send the text message.
	if(phoneNumber != null && isMember)
	{
		client.sendMessage({
		  to: '+1' + phoneNumber,
		  from: '+16467914107',
		  body: 'Your verification pin is ' + randomNumber
		});
		console.log("Sent text message");
		res.sendFile(path + "index.html" );
		
	}
	else
	{
		res.sendFile(path + "invalidMember.html");
	}
	
  	arr = [];
});

router.get("/buttonPage",function(req,res){
	
	
	var requestedUrl = req.protocol + '://' + req.hostname + ':3000' + req.url;	
	var PINnumber = getQueryString('number', requestedUrl);
	console.log(PINnumber);
	console.log(randomNumber);
	if(PINnumber == randomNumber )
	{
		res.sendFile(path + "buttonPage.html");
		console.log("Correct PIN");
		console.log(doorState);
		
	}
	else
	{
		res.sendFile(path + "wrongPIN.html");
		console.log("Incorrect PIN");
	}
	
});

router.get("/about",function(req,res){
  res.sendFile(path + "about.html");
});

router.get("/contact",function(req,res){
  res.sendFile(path + "contact.html");
});




app.use(express.static('public'));

app.use("/", router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

/* const server = app.listen(3000,function(){
  console.log("Live at Port 3000");
}); */



