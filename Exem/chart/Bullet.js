if( !window.requestAnimFrame )
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();


// test code : this.parentWindow.postMessage({'event':'alert','extItemID': this.extItemID,'topDivID':this.topDivID,'level':1},'http://'+location.host)
if( typeof(bulletOnMessage) == 'undefined' )
{
    var bullet_default_border_color = null;
    var bullet_alert_object = {};

    var bulletAlertProc = function(extItemID, topDivID, level ) {
        var obj = null;
        // 캐시잉~
        if( typeof( bullet_alert_object[extItemID] ) === 'undefined' ) {
            obj = bullet_alert_object[extItemID] = {};
            obj.extItemID = extItemID;
            obj.topDivID   = topDivID;
            obj.last_level  = -1;
            obj.object_topDivID = $("#"+topDivID);
            obj.object_extItemID =  $("#"+extItemID);

            //filter: alpha(opacity=50); -khtml-opacity: 0.5; -moz-opacity:0.5; opacity: 0.5;
        }
        obj = bullet_alert_object[extItemID];

        if( obj.extItemID !== extItemID || obj.topDivID !== topDivID ) {
            obj.object_topDivID  = null;
            obj.object_extItemID = null;

            obj.extItemID = extItemID;
            obj.topDivID   = topDivID;
            obj.last_level  = -1;
            obj.object_topDivID = $("#"+topDivID);
            obj.object_extItemID = $("#"+extItemID);
        }


        // 레벨이 같은놈이면 나감.
        if ( obj.last_level  === level ) {
            obj = null;
            return;
        }

        obj.last_level  = level;

        var ntop = ( 0 - (obj.object_extItemID.height()-arguments[2]) / 2 ) + 'px';
        if ( level === 2 ) {
            var ss = '3';

            obj.object_topDivID.css({'background-color':'red', 'top':ntop,'left':'-10px'
                ,'filter': 'alpha(opacity='+ss+'0)','-khtml-opacity': '0.'+ss,'-moz-opacity':'0.'+ss,'opacity': '0.'+ss});

            obj.object_extItemID .css({'border':'solid 3px red'});
            ss = null;
        } else {
            obj.object_topDivID.css({'background-color':'transparent', 'top':ntop,'left':'-10px'
                    //'filter': 'alpha(opacity=50)','-khtml-opacity': '0.5''-moz-opacity':'0.5','opacity': '0.5'
            });
            obj.object_extItemID .css({'border':'solid 3px '+bullet_default_border_color + '0)'});
        }

        //obj.object_topDivID.css()


        obj = null;

    };

    var clearBulletAlertObject = function (extItemID)
    {
        // destory 될때 삭제 해준다. element 가 참조 되어있음..!
        if( bullet_alert_object[extItemID] )
        {
            bullet_alert_object[extItemID].extItemID = null;
            bullet_alert_object[extItemID].topDivID = null;
            bullet_alert_object[extItemID].last_level = null;
            bullet_alert_object[extItemID].object_extItemID=null;
            bullet_alert_object[extItemID].object_topDivID=null;
            bullet_alert_object[extItemID] = null;

            delete bullet_alert_object[extItemID];
        }
    };

    var bulletOnMessage = function (e) {
        // alert
        if ( e.data.event === "bullet_alert" ) {
            if( bullet_default_border_color == null) {
                var theme = Comm.RTComm.getCurrentTheme(),
                    colors;

                switch (theme) {
                    case 'Black' :
                        colors = realtime.BulletBlackColors.BASE;
                        break;
                    case 'White' :
                        colors = realtime.BulletWhiteColors.BASE;
                        break;
                    default :
                        colors = realtime.BulletGrayColors.BASE;
                        break;
                }

                bullet_default_border_color = colors;
            }
            bulletAlertProc( e.data.extItemID, e.data.topDivID, e.data.level );

        }
    };

    window.addEventListener('message',bulletOnMessage,false);
}
// 지우기


Ext.define('Exem.chart.Bullet', {
    extend: 'Ext.Component',
    resize: false,
    isInitResize: true,
    devMode: false,
    isApplyTheme: false,
    isPushed: false,

    color: {
        BASE              : 'rgba(255,255,255,',
        COLOR_INNER       : ['rgba(20,196,193,0.4)',  'rgba(240,221,50,0.4)', 'rgba(187,51,51,0.4)'],
        COLOR_OUTER       : ['rgba(20,196,193,0.7)',  'rgba(240,221,50,0.7)', 'rgba(187,51,51,0.7)'],
        COLOR_FADE        : ['rgba(20,196,193,',      'rgba(240,221,50,',     'rgba(187,51,51,'    ],
        COLOR_TRAIL       : ['rgba(20,196,193,.65)',  'rgba(240,221,50,.65)', 'rgba(187,51,51,.65)'],
        COLOR_TEXT        : ['green',                 'gold',                 'red',               'dimgrey'],
        COLOR_LINE        : 'rgba(222,228,229,'
    },
    layout: 'fit',

    autoEl : {
            tag   : "iframe",
            src   :'./bullet.html',
            width : '100%',
            height: '100%',
            style :'border:0px'
    },

    labelPosY: 0,
    topdiv : null,
    listeners: {
        resize: function() {
            if (this.isInitResize) {
                this.init(this.up());
                this.isInitResize = false;

            } else {
                this.resize = true;
            }

            var oheight = this.ownerCt.ownerCt.getHeight();
            this.topdiv.style.top    = ( 0-(oheight-arguments[2]) / 2 )+'px';
            this.topdiv.style.width  = (arguments[1]+200)+'px';
            this.topdiv.style.height = '900px'; //(this.ownerCt.ownerCt.getHeight() +400)+'px'

            /* 리사이즈 메시지 */
            if ( this.el && this.el.dom && this.el.dom.contentWindow ) {

                var width  = this.ownerCt.ownerCt.getWidth();
                var height = this.ownerCt.ownerCt.getHeight();

                if ( arguments[1] ) {
                    width = arguments[1]-10;
                }

                if( arguments[2] ) {
                    height = arguments[2];
                }

                this.el.setSize(width ,height);
                this.el.dom.contentWindow.postMessage({
                        'event' : 'windowResizeHandler'
                        ,'arg'  : [width, height]
                    }, location.protocol+'//'+location.host);
            }
        },
        afterrender  : function(){
            setTimeout(function(a){
                a.events.resize.fire();
            }, 3000, this);

        },
        beforedestroy: function() {
            Ext.Array.remove(Comm.onActivityTarget, this);
            clearInterval(this.dataRefreshTimer);
            cancelAnimationFrame(this.animationFrame);

            this.color  = null;
            this.target = null;

            if (clearBulletAlertObject) {
                clearBulletAlertObject( this.id );
            }
        }
    },

    pushData: function(header, data) {
        if (header.datatype !== undefined && header.datatype !== 1) {
            return;
        }

        if( this.el && this.el.dom && this.el.dom.contentWindow ) {
            var serverIdArr = this.selectedServerIdArr;

            this.el.dom.contentWindow.postMessage({
                    'event' : 'pushData',
                    'arg'   : [header, data, serverIdArr]
                }, location.protocol+'//'+location.host);

                var width = this.ownerCt.ownerCt.getWidth();
                var height = this.ownerCt.ownerCt.getHeight();

                this.el.dom.contentWindow.postMessage({
                    'event' : 'windowResizeHandler',
                    'arg'   : [width, height]
                    }, location.protocol+'//'+location.host);
        }
        return;
    },

    init: function(target) {

        this.target = target;
        var me = this;

        Comm.onActivityTarget.push(this);

        function sendInit(a,b,c,d,e, extid, topdivid, f) {
            if ( !f ) {
                return;
            }

            if ( a && a.dom && a.dom.contentWindow && a.dom.contentWindow.document.readyState === 'complete' ) {
                setTimeout(function(a,b,c,d){
                    if (a.hideBulletTxnLevel == null) {
                        a.hideBulletTxnLevel = me.hideBulletTxnLevel;
                    }
                    a.postMessage({ 'event'    : 'init',
                                    'color'    : b,
                                    'lang'     : c ,
                                    'labelPosY': d,
                                    'extItemID': extid,
                                    'topDivID' : topdivid
                    }, location.protocol+'//'+location.host);
                }, 1000, a.dom.contentWindow, b,c,d, e, extid, topdivid,f );

                // 걍 20번 보냄. 가끔 init 가 안됨. 받는쪽에서 중복제거함. Dom이 많으면  iframe 의 Document 가 늦게 뜨는듯
                setTimeout( function(a,b,c,d,e,extid, topdivid,f) {
                    sendInit(a,b,c,d,e,extid, topdivid,f);
                }, 1000 , a,b,c,d,e,extid, topdivid,f);

            } else if(document.getElementById(topdivid)) {
                setTimeout( function(a,b,c,d,e,extid, topdivid,f) {
                    sendInit(a,b,c,d,e,extid, topdivid,f);
                }, 1000 , a,b,c,d,e,extid, topdivid,f);

            } else {
                a = null,b = null,c = null,d = null,e = null,extid = null, topdivid = null,f = null;
                console.debug('bullet.ifrmae unlink');
            }
        }

        // iframe 위에 투명한 필름을 올린다. 그래야 docking 의 resize 가 잘 작동됨.
        var div = document.createElement('div');
        try {
            // 워낙 커서 매번 resize 할 필요 없음
            div.style.position = 'absolute';
            div.style.width    = '3000px';
            div.style.height   = '900px';
            div.style.zIndex   = 1;
            div.style.top      = -30;
            div.style.left     = -30;
            target.getEl().appendChild( div );

            me.topdiv = div;
        } finally {
            div = null;
        }

        sendInit(this.el , this.color, [ common.Util.TR('Request/sec')
                    ,common.Util.TR('Response/sec'),common.Util.TR('Current Total count')
                    ,common.Util.TR('Critical'),common.Util.TR('Warning'),common.Util.TR('Normal') ]
                    , this.labelPosY
                    , Date.now()
                    , me.ownerCt.ownerCt.id
                    , me.topdiv.id
                    , true );

    },

    startAnimationFrame: function() {
        if ( this.el && this.el.dom && this.el.dom.contentWindow ) {
            var s= this.el.getSize();
            var w = s.width, h=s.height;

            this.el.dom.contentWindow.postMessage({
                'event' : 'windowResizeHandler' ,'arg':[w,h]
            }, location.protocol+'//'+location.host);

            this.el.dom.contentWindow.postMessage({ 'event' : 'startAnimationFrame'}, location.protocol+'//'+location.host);
        }

        return;
    },

    stopAnimationFrame: function() {
        if ( this.el && this.el.dom && this.el.dom.contentWindow ) {
            this.el.dom.contentWindow.postMessage({ 'event' : 'stopAnimationFrame'}, location.protocol+'//'+location.host);
        }
        return;

    },

    stopFrameDraw : function(){
        this.stopAnimationFrame();

    }
});