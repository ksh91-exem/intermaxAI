;
(function($) {
    if ($.bullet || bullet) {
        console.log('bullet 함수가 이미 존재하므로 이름을 교체해야 합니다.');
        return false;
    }

    // target : 엘리먼트아이디,
    // count : 총알갯수
    // color : 총알색상
    // speed : 총알속도
    // delay : 총알별딜레이
    // size : 지름

    var bullet = function(option) {
        var tt = option.target ? option.target : '';
        var cc = option.count ? option.count : 20;
        var cr = option.color ? option.color : '#000';
        var sp = option.speed ? option.speed : 1000;
        var dl = option.delay ? option.delay : 100;
        var sz = option.size ? option.size : 10;

        if (!window.$.bulletArea) {
            window.$.bulletArea = $(document.getElementById(tt));
            $.bulletArea.css({
                'overflow': 'hidden'
            });
        }

        var width = $.bulletArea.width();
        var height = $.bulletArea.height();
        var startX = $.bulletArea.offset().left - (sz * 3);
        var endX = startX + width + (sz * 3);
        var heightHalf = (height / 2) - (sz / 2);

        $.bulletArea.find('.bullet').remove();

        var newDom = '';
        var copyCC = cc;
        var styl = '-webkit-transform: translate3d(0px, 0px, 0px);';
        styl += 'background-color:' + cr + ';';
        styl += 'width:' + sz + 'px;';
        styl += 'height:' + sz + 'px;';
        styl += 'border-radius:' + sz / 2 + 'px;';
        styl += 'position: absolute;';
        styl += 'left:' + startX + 'px;';
        styl += 'top:' + heightHalf + 'px;';
        styl += '-webkit-transition:All ' + sp + 'ms;';

        var styl2 = '-webkit-transform: translate3d(' + (endX + sz * 6) + 'px, 0px, 0px);';



        var findDom = function(who, id, cb) {
            $.bulletArea.append(newDom);
            if (cb) {
                cb(id);
            }
        };

        while (copyCC) {
            newDom = '<div class="bullet" style="' + styl + '" id="bullet_' + copyCC + '"></div>';
            
            findDom(newDom, 'bullet_' + copyCC, function(id) {
                setTimeout(function() {
                    console.log('sent!');
                    document.getElementById(id).style.cssText += styl2;
                }, copyCC * dl);
            });

            copyCC -= 1;
        }        
    };

    $.bullet = bullet;
})(jQuery);
