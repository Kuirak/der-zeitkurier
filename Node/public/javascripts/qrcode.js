$(document).ready(function(){
    $(".articleDiv").each(function(){
        var $this =$(this);
        var url= $(".qr",$this).text();
        if(url.length ==="http://der-zeitkurier.de?id=".length)return;
        var qr= $(".qrcode",$this);
        qr.ClassyQR({
            type:'url',
            url:url,
            size:200
        });
    });
});