$(document).ready(function(){
    $(".articleDiv").each(function(){
        var $this =$(this);

        $(".title",$this).highlightRegex(/[^0-9a-zA-Z\s!"§÷%&\/\(\)=\?,;\.:\-_öüäÖÜÄß']/g);
        $(".article",$this).highlightRegex(/[^0-9a-zA-Z\s!"§÷%&\/\(\)=\?,;\.:\-_öüäÖÜÄß']/g);



        var url= $(".qr",$this).text();
        if(url.length ==="http://der-zeitkurier.de?id=".length)return;
        var qr= $(".qrcode",$this);
        qr.ClassyQR({
            type:'url',
            url:url,
            size:100
        });
    });
});