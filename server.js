//Require Node Modules
var express = require('express');
var app = express();
var parser = require('body-parser');
var moment = require('moment');
var Cloudant = require('cloudant');
var unirest = require('unirest');
var path = require('path');
var request = require('request');
var server = require('http');
var server = app.listen(8888, function() {
    console.log("--------------------------------------------------------");
    console.log(moment().format('MMMM Do YYYY, hh:mm:ss a') + " | Agent web Server has been started!");
    console.log("--------------------------------------------------------");
});
var io = require('socket.io').listen(server);
var Cloudant = require('cloudant');
var username = '1794b9c7-6d71-4b2b-b1e4-01428cec273d-bluemix';
var password = '7f86125e603ce3229fb6fbfa417210db085a0096bab4df6ff9a088f8216f56f9';
var cloudant = Cloudant({
    account: username,
    password: password
});
var database = cloudant.db.use('agent_details');
var database1 = cloudant.db.use('helpsesk_db')
var fbId;
var conver = [];
var resData;
var userData;
var token = 'EAAIITuagV40BADM9HRCDFwX42i3ZC8JcuJEgLKo2unbmOTTxtVZAwX9L9p8vMGFdQBBD4ipK43ukRM77QCQZBStRAwx278BLlNEZBP6dLcoKPjQiq0wdswQHhcsHQkigUbzZCRIZBerhxw6w3Oj58IcQEtIn8YvLR7wEBHhyVjlgZDZD';

//Initialize Body Parser
app.use(parser.json());
app.use(parser.urlencoded({
    extended: true
}));

//Cloudant Credentials
var username = "1794b9c7-6d71-4b2b-b1e4-01428cec273d-bluemix";
var password = "7f86125e603ce3229fb6fbfa417210db085a0096bab4df6ff9a088f8216f56f9";


//Create Cloudant Connection Instance
var cloudant = Cloudant({
    account: username,
    password: password
});
var users_socket = [];
//Set DB and User ID based on param inputs

var botData = [];
var userdata = [];
var agentName = "";
var agent1;
var c = 0;
var test = true

app.use('/', express.static('public'))
//routing agent page
app.get('/agent', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/login.html'));
});

io.on('connection', function(socket) {
    console.log("id", socket.id)
    socket.on('chat message', function(msg1) {

        if (c == 0) {
            loginSend(msg1.fbId, "you have been connected to " + msg1.agentname);
            loginSend(msg1.fbId, msg1.msg);
            c++;
        } else {
            loginSend(msg1.fbId, msg1.msg);
        }

    })
    socket.on('agentcreate', function(agent) {
        console.log("data in agent create", agent);
        agent1 = agent;
        socket.join(agent);
        console.log("Agent name in agentCreate", agent1);
    });
    socket.on('disnotification', function(msg) {
        agent1 = msg;
        socket.broadcast.emit('notify', true)


    })
    socket.on('disablenotification', function(data) {
        if (test == true) {
            var msg = "I apologize, I was not able to find any available agents at this point of time."
            loginSend(data.fbId, msg);
            io.sockets.emit('notify1', data)
            test = false
            setTimeout(function() {
                test = true
            }, 40000);

        }


    })
    socket.on('endConv', function(data1) {
        console.log("data1 in endConv", data1);
        message1 = "you have been disconnected from " + data1.agentName;
        loginSend(data1.fbId, message1);
        var query = {
            "selector": {
                "fbId": {
                    "$eq": data1.fbId
                }
            },
            "fields": []
        }

        database1.find(query, function(err, body) {
            if (err) {
                console.log(err)
            } else {
                console.log(body);
                body.docs[0].botActive = data1.botStatus;
                console.log("Before", body.docs[0]);
                database1.insert(body.docs[0], function(err, data) {

                    if (err) {

                        console.log(err);
                    } else {

                        console.log(data);
                    }

                })
            }

        })


    })

    app.get('/data', function(req, res) {
        fbId = req.query.fbId;
        resData = req.query.msg;
        console.log("fbId", fbId);
        console.log("resData", resData);
        var fb = "fbId" + fbId;
        console.log("agent", agent1);
        console.log("fb", fb);
        io.to(fb).emit('agentMsg', {
            "resData": resData,
            "fbId": fb
        });


    });

    app.get('/service', function(request, response) {
        console.log("Inside service");
        fbId = request.query.id;
        console.log("Connection established", socket.id);
        getConv(fbId, function(response) {
            var fb = "fbId" + fbId;
            socket.join(fb);
            io.to(agent1).emit('checker', fb)
            console.log("rooms", socket.rooms);
            c = 0;
            io.sockets.emit("dataSent", {
                data: response.docs[0].conversation,
                fbId: fb,
                count: 1
            });

        });

        socket.on('disconnect', () => {

            for (let i = 0; i < users_socket.length; i++) {

                if (users_socket[i].id === socket.id) {
                    users_socket.splice(i, 1);
                }
            }
            io.emit('exit', users_socket);
        });



    });
});

function loginSend(id, text) {

    var dataPost = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: token
        },
        method: 'POST',
        json: {
            recipient: {
                id: id
            },
            message: {
                'text': text
            }
        }
    };
    requestFun(dataPost)
}

function requestFun(dataPost) {

    request(dataPost, (error, response, body) => {
        if (error) {
            console.log('Error when we try to sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            console.log("Successfully Sent the message");
        }
    });

}

function getConv(fbid, callback) {

    var query = {
        "selector": {
            "fbId": {
                "$eq": fbid
            }
        },
        "fields": [
            "conversation"
        ]
    }
    database1.find(query, function(err, result) {
        if (err) {
            callback(err)
        } else {
            callback(result)
        }

    })



}