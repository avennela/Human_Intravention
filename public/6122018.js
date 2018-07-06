<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Conversation Agent Demo User Interface</title>
    <!-- load css library -->
    <link rel="stylesheet" href="css/reset.css">
    <link rel="stylesheet" href="css/style.css">
	<link rel='stylesheet prefetch' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'>
</head>
<style>
#theImg{
width: 5%;
margin-top:4%;
float:right;
}
    .button {
        background-color: #fff;
        /* Black */
        border: none;
        color: #2b3134;
        padding: 9px 9px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 13px;
        margin-top: 10px;
        font-family: 'Open Sans', sans-serif;
        margin-left: 2px;
        margin-right: 2px;
        cursor: pointer;
        border-radius: 8px;
    }
</style>

<body class="wrapper">
    <div class="wrapper">
        <div class="container" style="top:8%">
            <!-- left sidebar -->
            <div class="left" style='overflow:scroll'>
                <ul class="people">
                    <li class="logo">
                        <!-- <i class="company-logo icon_homedepot"  ></i>
				<link rel="icon" type="image/x-icon" href="assets/favicon.ico"> -->
                        <img src="miracle.png" alt="" />
                    </li>
                </ul>
                <div class="top">
                    <input type="text" placeholder="Search" />
                    <a href="javascript:;" class="search"></a>
                </div>
                <ul class="people" id='olo'>
                    <!-- 			  <li class="person" data-chat="person2">
                  <img src="Doris.png" alt="" style="width:15%;height:15%" />
                  <span class="name">Doris</span>
              </li> -->
                </ul>

            </div>

            <!-- right chat window -->
            <div class="right">

                <div class="top">
                    <center><span><span class="name">Conversational Help Desk Agent</span></span>
                    </center>

					<!-- <button class="myButton" onclick="endconv()">end conv</button> -->
					
                </div>
                <div class="chat1" style="overflow:scroll; display: none;" data-chat="k">

                </div>
            </div>

                <div id='gt'>
				
                    <div class="write" style='display: none;'>
					
                        <form class="inputForm">
						<!--   <div class="typing" style="margin-top: -9%; margin-left: 9%;"><span><p>user typing...</p></span></div><br> -->
                            <input id="m" class="m" autocomplete="off" name="SEND" />
                            <!--<a href="javascript:;" class="write-link send" id="send"></a> -->

                        </form>

                    </div>
                </div>
<img class="inputimage" src="sendbutton.png" width="46" height="46" />
                    <!-- end of right window -->
        </div>
<audio id="audio" src="./notification.mp3" ></audio>
    </div>
    <!-- load js library -->
    <script src='https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js'></script>
    <script src="http://code.jquery.com/jquery-1.11.1.js"></script>
    <script src='http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>

    <script>
	//$(".typing").hide();
	var agentname = localStorage.getItem("name");
	var usercount = 0;
	const prompt = require('electron-prompt');
	var ipcRenderer = require('electron').ipcRenderer;
        var data_server;
		var users = {};
       var socket = io();
	   var personName
	var $activechat = $('.active-chat');
    var $right = $('.right');
	$(".m").bind("keyup", function(e) {
if(!$('.m').val() == ""){
	 socket.emit('agenttypingon',{"name": personName,"status":"on"})
}
else{
	socket.emit('agenttypingoff',{"name": personName,"status":"off"})
 }
})
//	socket.on('typeon',function(msg){
//		$(".typing").show();
//	})
//	socket.on('typeoff',function(msg){
//	$(".typing").hide();
//})
socket.on('disablenotify',function(data){
$( "."+namedata+"1" ).remove();
})
	       function scrollBottom() {
$(".chat").animate({ scrollTop: $(document).height() +  $(document).height() +  $(document).height()}, "slow");
   }
	if(usercount == 0){
	  $('.myButton').attr('disabled',true);
	}

socket.on('connect',function(){ 
    // Send ehlo event right after connect:
   socket.emit('agentcreate',agentname);
});
		function endconv(){
		console.log(usercount)
		deleteElement(personName);
if(!$('.people').hasClass('.person')){
	  $('.myButton').attr('disabled',true);
	}
		socket.emit('endconv',personName)		
		}
		
        $('form').submit(function(event) {
            event.preventDefault();
            var inpu = [];
            inpu = $('#m').val();
            $('.active-chat').append('<div class="bubble me">' + $('#m').val() + '</div>').animate({scrollTop:10000},0);
			console.log(personName)
			socket.emit('agent message', {"text":inpu,"name":personName});
            $('#m').val('');
            return false;

        });
		 function play(){
       var audio = document.getElementById("audio");
       audio.play();
             }

        socket.on('broadcaster', function(infor) {
            namedata = infor.name;
			msg1 = infor.data
            $('#m').val('');
          //  var txt;
		  console.log(infor)
			creatediv(usercount,infor);
         //   if (confirm("A user wants to talk to you!")) {
		
//            } else {
//                txt = "You pressed Cancel!";
 //           }     
            return false;
        });
 function connectagent(msg1){
 socket.emit('disablenotification',"disable")
 console.log(msg1)
              //  txt = "You pressed OK!";
				socket.emit('agentname',{"name":personName,"text":"you have been connected to "+ agentname || "agent1"})
				$('.myButton').attr('disabled',false);
				usercount++;
				createElement(msg1.count, function(dataElement) {
				console.log(dataElement)
                    console.log("count", msg1.count);
                    for (var i = 0; i < msg1.data.length; i++) {
                        $('.'+namedata+'[data-chat = ' + dataElement + ']').append('<div class="bubble you">' + msg1.data[i][namedata] + '</div>').animate({scrollTop:10000},0);
                        $('.'+namedata+'[data-chat = ' + dataElement + ']').append('<div class="bubble me">' + msg1.data[i].Oliver + '</div>').animate({scrollTop:10000},0);
                    }
					scrollBottom()
                }) 
				}
        socket.on('remove', function(msg1) {
            $('#m').val('');
            deleteElement(msg1.username);
            return false;
        });
        socket.on('usermsg', function(msg1) {
		if(!$('.'+msg1.name+'1').hasClass('active') && !$('.'+msg1.name+'1').hasClass('notify')){
		$('.'+msg1.name+'1').append('<img id="theImg" src="not.png" />')
		$('.'+msg1.name+'1').addClass("notify");
		}
		if (document.hidden) {
                    console.log("documenthidden");
                    var notification = new Notification(msg1.name, {
                        icon: './js/image/labs.ico',
                        body: msg1.text
                    })
                    notification.onclick = () => {
                        ipcRenderer.send('update-badge', 0);
                        ipcRenderer.send('maxmize');
                    }
                }
		console.log(msg1)
            $('#m').val('');
			namedata = msg1.name
<!-- 			if ( $('.active-chat').attr('data-chat') == namedata ) -->   
			play();        
		$('.'+msg1.name).append('<div class="bubble you">' + msg1.text + '</div>').animate({scrollTop:10000},0);
            return false;
        })
		
	//	$.get("/userdata", function(data,){
   //     alert("Data: " + data);
	//	play();        
	//	$('.chat').append('<div class="bubble you">' + data + '</div>');
  //  });
    </script>
    <script src="js/index.js"></script>
    <script src="js/creation.js"></script>
</body>

</html>