$(document).on('mousedown focus', '.left .person',function(){

$('.write').show();
   if ($(this).hasClass('active')) {
return false;
   } else {
        var findChat = $(this).attr('data-chat');
         personName = $(this).find('.name').text();
        $('.right .top .name').html(personName);
        $('.chat').removeClass('active-chat');
        $('.left .person').removeClass('active');
        $(this).addClass('active');
        $('.'+personName).addClass('active-chat');
$('.'+personName+"1").removeClass('notify');
$('#theImg').remove()
$('.'+personName).show();
for( var o=0; o<document.getElementsByClassName('right')[0].children.length; o++){
if(document.getElementsByClassName('right')[0].children[o].getAttribute("data-chat") != findChat){
var ok = document.getElementsByClassName('right')[0].children[o].getAttribute("data-chat");
if(ok == 'k'){
$('.'+personName+'[data-chat = '+ok+']').show();	
}else{
$('.'+personName+'[data-chat = '+ok+']').hide();	
}
}

}

   }
})