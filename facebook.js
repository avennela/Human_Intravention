var express = require('express');
var moment = require('moment');
var app1 = express();
var cfEnv = require('cfenv');
var path = require('path');
var bodyParser = require('body-parser');
var unirest = require('unirest');
var http = require('http').Server(app1);
var io = require('socket.io')(http);
var request = require('request');
const watson = require('watson-developer-cloud/conversation/v1'); // watson sdk, using only conversation service
var Cloudant = require('cloudant');
var dateTime = require('node-datetime');
var username = '1794b9c7-6d71-4b2b-b1e4-01428cec273d-bluemix';
var password = '7f86125e603ce3229fb6fbfa417210db085a0096bab4df6ff9a088f8216f56f9';
var cloudant = Cloudant({
	account: username,
	password: password
});
var user_info;
var bot_info;
var database = cloudant.db.use('helpsesk_db');
app1.use(bodyParser.urlencoded({
	extended: true
}));
app1.use(bodyParser.json())

var appEnv = cfEnv.getAppEnv();

var totalConv = [];
var userConv = [];
var botConv = [];
var conv = [];
var token = 'EAAIITuagV40BADM9HRCDFwX42i3ZC8JcuJEgLKo2unbmOTTxtVZAwX9L9p8vMGFdQBBD4ipK43ukRM77QCQZBStRAwx278BLlNEZBP6dLcoKPjQiq0wdswQHhcsHQkigUbzZCRIZBerhxw6w3Oj58IcQEtIn8YvLR7wEBHhyVjlgZDZD';

var respBasicData;
var firstName = '';
var FbUserId = '';
var workspaceId = 'd1c75d09-9922-47e9-ab02-68d7bdd2d65c';
//watson bot object
var conversation = new watson({
	url: "https://gateway.watsonplatform.net/assistant/api",

	username: "a773590c-f368-4535-9634-a0928fc261a3",

	password: "KapDawSGKNWy",
	version: 'v1',
	version_date: '2017-06-01'
});

app1.get('/lik', function (req, res) {
	res.send('Hello');
});
//get webhook for Facebook
app1.get('/webhook/', (req, res) => {
	console.log('get webhook');
	if (req.query['hub.verify_token'] === 'ChatApp') {
		res.send(req.query['hub.challenge']);
	} else
		res.send('Error when we try to validating your token.');
});
//post webhook for Facebook
app1.post('/webhook/', (req, res) => {

	res.sendStatus(200);
	console.log('this is post request');

	for (let i = 0; i < req.body.entry[0].messaging.length; i++) {
		FbUserId = req.body.entry[0].messaging[i].sender.id;
		firstName = req.body.entry[0].messaging[i].sender.first_name;
		respBasicData = req.body.entry[0].messaging[i].message.text;
		console.log("For", FbUserId);
		var query = {
			"selector": {
				"fbId": FbUserId
			},
			"fields": []
		}
		//for checking the botStatus
		database.find(query, (err, body) => {
			if (err) {
				console.log(err);
			} else {
				//console.log("body",body.docs[0]);
				if (body.docs.length != 0) {
					if (body.docs[0].botActive == false) {
						console.log("Sockets implementation started ");
						unirest.get("http://localhost:8888/data?msg=" + respBasicData + "&fbId=" + FbUserId)
							.end(function (response, error) {
								if (error) {
									var message = "Error while connecting";

								} else {
									console.log("Response from Data api", response.body);
									console.log("Successfully sent the message");
								}
							});
					} else {

						facebookIdStorage(FbUserId).then(function (resp) {

							if (!resp.status) {

								conversationInit(respBasicData, function (response) {
									console.log("response in conversationInit", response);
									if (!response.done) {
										var sampleMsg = 'Sorry Please try again later';
										loginSend(FbUserId, sampleMsg)
									} else {
										var conve = {
											"bot": response.text,
											"user": respBasicData
										}
										conv.push(conve);

										var ip = {
											"context": response.context,
											"fbId": FbUserId,
											"botStatus": true,
											"agentStatus": false,
											"conversation": conv

										}
										storeConv(ip).then((result) => {
											console.log("success");

										}).catch((error) => {
											console.log(error)
										});


										loginSend(FbUserId, response.text)
									}
								});
							} else {
								//for getting the conversation          
								getConversation(respBasicData, resp.context, function (response1) {

									if (!response1.done) {
										var sampleMsg = 'Sorry Please try again later'
										loginSend(FbUserId, sampleMsg)
									} else {
										//|| response1.res1.intents.length == 0)
										if (response1.res1.intents[0].intent == "connectToagent") {
											console.log("We will connect you to the agent");
											var conve = {
												"bot": response1.text,
												"user": respBasicData
											}
											conv.push(conve);

											var ip = {
												"context": resp.context,
												"fbId": FbUserId,
												"botStatus": false,
												"agentStatus": true,
												"conversation": conv
											}

											storeConv(ip).then((result) => {
												console.log("Successfully updated the botStatus");
											}).catch((error) => {
												console.log(error)
											});
											//console.log("Conversation Before API Call ",conv);
											console.log("Type of conv  ", typeof (conv));
											unirest.get("http://localhost:8888/service?id=" + FbUserId + "&conv=" + conv)
												.end(function (response, error) {
													if (error) {
														var message = "Error while connecting";
														//  console.log(message);
													} else {
														var message = "Success";
														//console.log("connected to agent");
														//console.log("conv",conv[]);
													}
												});
											loginSend(FbUserId, response1.text)

										} else {
											var conve = {
												"bot": response1.text,
												"user": respBasicData

											}
											conv.push(conve);

											var ip1 = {
												"context": resp.context,
												"fbId": FbUserId,
												"botStatus": true,
												"agentStatus": false,
												"conversation": conv
											}

											storeConv(ip1).then((result) => {
												console.log("success")
											}).catch((error) => {
												console.log(error)
											});


											loginSend(FbUserId, response1.text)

										}


									}
								});

							}


						});

					}

				} else {
					conv = [];
					facebookIdStorage(FbUserId).then(function (resp) {

						if (!resp.status) {
							//initializatation of conversation
							conversationInit(respBasicData, function (response) {

								if (!response.done) {
									var sampleMsg = 'Sorry Please try again later';
									loginSend(FbUserId, sampleMsg)
								} else {
									var conve = {
										"bot": response.text,
										"user": respBasicData

									}
									conv.push(conve);
									var ip = {
										"context": response.context,
										"fbId": FbUserId,
										"botStatus": true,
										"agentStatus": false,
										"conversation": conv
									}

									storeConv(ip).then((result) => {
										console.log("success");

									}).catch((error) => {
										console.log(error)
									});


									loginSend(FbUserId, response.text)
								}
							});
						} else {
							//for getting the conversation          
							getConversation(respBasicData, resp.context, function (response1) {

								if (!response1.done) {
									var sampleMsg = 'Sorry Please try again later'
									loginSend(FbUserId, sampleMsg)
								} else {
									if (response1.res1.intents[0].intent == "connectToagent" || response1.res1.output.text[0] == "I didn't understand can you try again") {
										console.log("We will connect you to the agent");
										var conve = {
											"bot": response1.text,
											"user": respBasicData
										}
										conv.push(conve);
										var ip = {
											"context": response1.context,
											"fbId": FbUserId,
											"botStatus": true,
											"agentStatus": false,
											"conversation": conv
										}
										storeConv(ip).then((result) => {
											console.log("successfully updated the botStatus")
										}).catch((error) => {
											console.log(error)
										});
										console.log("Type of conv  ", typeof (conv));

										unirest.get("http://localhost:8888/service?id=" + FbUserId)
											.end(function (response, error) {
												if (error) {

													var message = "Error while connecting";
													//  console.log(message);
												} else {
													var message = "Success";
													console.log("connected to agent");

												}
											});
										loginSend(FbUserId, response1.text)

									} else {
										var conve = {
											"bot": response1.text,
											"user": respBasicData

										}
										conv.push(conve);
										var ip1 = {
											"context": response1.context,
											"fbId": FbUserId,
											"botStatus": true,
											"agentStatus": false,
											"conversation": conv

										}

										storeConv(ip1).then((result) => {

											console.log("success")
										}).catch((error) => {
											console.log(error)
										});


										loginSend(FbUserId, response1.msg)

									}


								}
							});

						}


					});


				}

			}


		});

	}
});

//db query 
function storeConv(query) {
	return new Promise((resolve, reject) => {
		console.log("Inside storeConv");
		var query1 = {
			"selector": {
				"fbId": query.FbUserId
			},
			"fields": []
		}
		database.find(query1, (err, body) => {
			if (err) {
				console.log(err);
			} else {

				body.docs[0].agentActive = query.agentStatus
				body.docs[0].botActive = query.botStatus;
				body.docs[0].context = query.context;
				body.docs[0].conversation = query.conversation;
				date1 = Date.now();
				body.docs[0].lastActivity = date1;
				// console.log("Before inserting the docs[]",body.docs[0]);
				database.insert(body.docs[0], function (err, body) {
					if (err) {
						reject(err);
					} else {
						resolve("success from store conv");
					}
				});

			}


		});
		//closing of promises
	});
}

function recentContxt(FbUserId, callback) {

	var query = {
		"selector": {
			"fbId": FbUserId
		},
		"fields": []
	}
	database.find(query, (err, body) => {
		if (err) {
			callback(err);
		} else {
			//	console.log("in recentContxt function",body.docs[0].context[body.docs[0].context.length - 1]);

			callback(body.docs[0].context[body.docs[0].context.length - 1]);
		}


	});
}

function myFun(data, callback) {

	var userinfo = {
		'userConv': respBasicData,
		'botConv': data
	}

	totalConv.push(userinfo);

}

function facebookIdStorage(FbId) {
	return new Promise(function (resolve, reject) {
		checkingDocs(FbId, function (responses) {
			//	 console.log("responses in checking docs call",responses);
			if (!responses.sucess) {
				console.log('Inside   ------  responses.sucess');
				resolve({

					'status': responses.sucess

				});


			} else {

				resolve({
					'status': responses.sucess,
					'context': responses.data
				});
			}

		});

	});
}


//login button for facebook
function loginSend(id, text) {
	bot_info = {

		"text": text
	}
	botConv.push(bot_info);
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

//request function
function requestFun(dataPost) {

	request(dataPost, (error, response, body) => {
		if (error) {
			console.log('Error when we try to sending message: ', error);
		} else if (response.body.error) {
			console.log('Error: ', response.body.error);
		}
	});

}


//if user existing then Docs retrieving from db other wise inserting data
function checkingDocs(fbId, Callback) {


	var query = {
		"selector": {
			"fbId": {
				"$eq": FbUserId
			}
		},
		"fields": []
	}

	database.find(query, (err, Resdata) => {
		if (err) {
			console.log('err getting cloudant')
		} else {

			if (Resdata.docs.length == 0) {
				var data = {
					"fbId": fbId,
					"botActive": true,
					"agentActive": false,
					"agentName": "",
					"context": [],
					"conversation": [],
					"lastActivity": Date.now()
				}
				database.insert(data, function (err, result) {
					if (err) {
						console.log(err);
						Callback({
							'sucess': false,
							'data': result
						});
					} else {

						Callback({
							'sucess': false,
							'data': result
						});
					}
				});

			}
			/* else if (Resdata.docs[0].fbId !== null && Resdata.docs[0].context === undefined) {
				console.log("Resdata.docs.context",Resdata.docs.context);
                Callback({
                    'sucess': false,
					'data': Resdata.docs[0].context

                });
                //console.log("FB id exists");
            } */
			else {

				Callback({
					'sucess': true,
					'data': Resdata.docs[0].context
				});
			}
		}

	});
}

//Conv initialization with watson response.output.text[0]
function conversationInit(FbuserText, callback) {
	//  console.log("Inside of conversationInit");
	var context = {};
	var payload = {
		workspace_id: workspaceId,
		input: {
			"text": FbuserText
		},
		context: context
	}
	conversation.message(payload, function (err, response) {
		//  console.log("response in conversation payload",JSON.stringify(response));
		if (err) {
			callback({
				"done": false,
				"text": response.output.text[0]
			});
		} else {
			callback({
				"done": true,
				"context": response.context,
				"text": response.output.text[0],
				"resp1": response

			});
		}
	});
}

function getConversation(message, context, callback) {

	conversation.message({
		workspace_id: workspaceId,
		input: {
			'text': message
		},
		context1: context
	}, function (err, response) {
		if (err) {

			callback({
				'done': false
			});
		} else {
			callback({
				"res1": response,
				'text': response.output.text[0],
				'context': response.context,
				'done': true
			});
		}
	});
}


http.listen(appEnv.port, appEnv.bind, function () {
	console.log('Server running on ' + appEnv.port);
});