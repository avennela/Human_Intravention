var arrayDiv = new Array();
var modelDiv = new Array();
function createDiv(i,info){
	
	modelDiv[i] = document.createElement('li');
			modelDiv[i].className = 'person '+namedata+"1";
			$(modelDiv[i]).attr('data-chat', namedata);
			modelDiv[i].id = namedata;
			document.getElementById('olo').appendChild(modelDiv[i]);
			
			modelDiv[i] = document.createElement('img');
			modelDiv[i].src='Doris.png'; 
			modelDiv[i].style.width = '15%';
			modelDiv[i].style.height = '15%';
			
			document.getElementById(namedata).appendChild(modelDiv[i]);
			modelDiv[i] = document.createElement('span');
			modelDiv[i].className = 'name';
			modelDiv[i].innerHTML = namedata;
			
			document.getElementById(namedata).appendChild(modelDiv[i]);
			modelDiv[i]= document.createElement('br');
			document.getElementById(namedata).appendChild(modelDiv[i]);
			modelDiv[i] = document.createElement('Button');
			modelDiv[i].className='accept';
			modelDiv[i].setAttribute("id","accept");
			modelDiv[i].innerHTML="Accept";
			modelDiv[i].addEventListener("click",function(){
				
				connectagent(info);
			});
			document.getElementById(namedata).appendChild(modelDiv[i]);
			document.getElementById(namedata).removeAttribute('id');
				
	
}
function createElement(i, callback){
	$( "."+namedata+"1").remove();
	
			$(".right").append($('.chat1').clone().attr("data-chat", namedata).attr('class', 'chat '+namedata));
			arrayDiv[i] = document.createElement('li');
			arrayDiv[i].className = 'person '+namedata+"1";
			$(arrayDiv[i]).attr('data-chat', namedata);
			arrayDiv[i].id = namedata;
			document.getElementById('olo').appendChild(arrayDiv[i]);
			
			arrayDiv[i] = document.createElement('img');
			arrayDiv[i].src='Doris.png'; 
			arrayDiv[i].style.width = '15%';
			arrayDiv[i].style.height = '15%';
			
			document.getElementById(namedata).appendChild(arrayDiv[i]);
			arrayDiv[i] = document.createElement('span');
			arrayDiv[i].className = 'name';
			arrayDiv[i].innerHTML = namedata;
			
			document.getElementById(namedata).appendChild(arrayDiv[i]);
			arrayDiv[i] = document.createElement('Button');
			arrayDiv[i].className='accept';
			arrayDiv[i].setAttribute("id","accept");
			arrayDiv[i].innerHTML="endConv";
			arrayDiv[i].addEventListener("click",function(){
				
				endConv();
			});
			document.getElementById(namedata).appendChild(arrayDiv[i]);
				
			document.getElementById(namedata).removeAttribute('id');
	callback(namedata)
}

function deleteElement(name){
	var element = document.querySelectorAll('[data-chat='+name+']');
    $(element).remove();
}