

$(document).ready(function () {
    function formatDate(date) {
        var dateSplit = date.split('-');
        if (dateSplit.length > 0&& dateSplit.length === 3)
            return date;
        else {
            dateSplit = date.split('.');
            return dateSplit[2] + '-' + dateSplit[1] + '-' + dateSplit[0];
        }
    }

    $('body').on('focus', '[contenteditable]', function() {
        var $this = $(this);
        $this.data('before', $this.html());

        return $this;
    }).on('blur keyup paste', '[contenteditable]', function() {
            var $this = $(this);
            if ($this.data('before') !== $this.html()) {
                $this.data('before', $this.html());
                $this.trigger('change');
            }
            return $this;
        });

    $('.articleDiv').on('change',function(){
        var $this=$(this);
        if($('#save').length === 0){
        $('.articleFooter',$this).append('<input type="button" id="save" class="insert" value="Save">').click(function(){

            var id = $this.find('.id').text();
            var article=$this.find('.article').text();
            var title=$this.find('.title').text();
            var date=$this.find('.date').text();
            date = formatDate(date);

            $.post('/article/'+ id +'/update',{article:{id:id,article:article,title:title,date:date}},function(){
                location.reload();
            });
        });
        }


    });
    $('.title','.articleHighlight').highlightRegex(/[^0-9a-zA-Z\s!"§÷%&\/\(\)=\?,;\.:\-_öüäÖÜÄß']/g);
    $('.article','.articleHighlight').highlightRegex(/[^0-9a-zA-Z\s!"§÷%&\/\(\)=\?,;\.:\-_öüäÖÜÄß']/g);

});




