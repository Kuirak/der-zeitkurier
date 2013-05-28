

$(document).ready(function () {
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
        $('.articleFooter').append('<input type="button" id="save" class="insert" value="Save">').click(function(){

            var id = $this.find('.id').text();
            var article=$this.find('.article').text();
            var title=$this.find('.title').text();
            var date=$this.find('.date').text();
            date = date.split('.');
            date = date[2] + '-' + date[1] + '-' + date[0];

            $.post('/article/'+ id +'/update',{article:{id:id,article:article,title:title,date:date}});
        });
        }
        if($('#reset').length === 0){
            $('.articleFooter').append('<input type="button" id="reset" class="insert" value="Reset">').click(function(){

                var id = $this.find('.id').text();

                $.get('/article/'+ id,function(data){


                    $this.replaceWith(html);
                });
            });
        }

    });

});




