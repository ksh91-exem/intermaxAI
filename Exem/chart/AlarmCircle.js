Ext.define('Exem.chart.AlarmCircle', {
    extend: 'Ext.Component',
    resize: false,
    isInitResize: true,

    circle_objects : null,

    idArr   : [],
    nameArr : [],

    color: {
        BASE        : 'transparent',
        COLOR_TEXT  : ['#42A5F6',  '#FF9803',  '#D7000F'  , 'dimgrey',  '#28DEFF']
    },

    listeners: {
        resize: function() {
            if (this.isInitResize) {
                this.init(this.up());
                this.isInitResize = false;
            } else {
                this.resize = true;
            }
        },

        beforedestroy: function() {
            clearInterval(this.dataRefreshTimer);
        }
    },

    onData: function(adata) {
        if (adata == null) {
            return;
        }

        var me  = this;

        if (!me.circle_objects) {
            return;
        }

        var objId = me.circle_objects.id;

        if (adata[objId] != null) {
            me.circle_objects[idx].setValues( adata[objId][0], adata[objId][1], adata[objId][2] );
        }

        adata = null;
    },

    init: function(target) {
        this.target = target;
        var me = this;

        if (me.viewWasList == null) {
            me.viewWasList = [];
        }

        var SCREEN_WIDTH  = target.getWidth();
        var SCREEN_HEIGHT = target.getHeight();

        var context;
        var getMouse;

        me.canvas = null;

        init();

        me.graph = new circleGraph(context);
        me.graph.margin = 3;
        me.graph.width  = SCREEN_WIDTH - 10;
        me.graph.height = SCREEN_HEIGHT - 10;

        me.$canvas = $('#'+me.canvas.id);

        me.graph.update();

        if (me.dataRefreshTimer != null) {
            clearInterval(me.dataRefreshTimer);
        }
        me.dataRefreshTimer = setInterval(function () {
            me.graph.update();
        }, 500);


        function init() {
            var targetEl = target.getEl();
            targetEl.setStyle('background-color', me.color.BASE);

            me.canvas = document.createElement('canvas');
            targetEl.appendChild(me.canvas);

            if (me.canvas && me.canvas.getContext) {
                context = me.canvas.getContext('2d');

                me.ctx = context;

                windowResizeHandler();

                me.canvas.addEventListener('selectstart', function(e) {
                    e.preventDefault();
                    return false;
                }, false);


                me.canvas.addEventListener('mouseleave', function(e) {
                    e.preventDefault();

                    if (me.iconMouseLeave) {
                        me.iconMouseLeave();
                        me.isShowToolTip = false;
                    }
                });

                me.canvas.addEventListener('mousemove', function(e) {
                    e.preventDefault();

                    me.$canvas.css({'cursor': 'default'});

                    var mouse = getMouse(e);
                    var mx = mouse.x;
                    var my = mouse.y;

                    // 명칭 툴팁
                    var circleObj = me.circle_objects;

                    var minSize = Math.min(me.canvas.height/2, me.canvas.width/2);
                    var maxSize = Math.max(me.canvas.height/2, me.canvas.width/2);

                    if (me.canvas.width  / 2 - minSize + 10 < mx && mx < me.canvas.width  / 2 + minSize - 10 &&
                        me.canvas.height / 2 - minSize + 10 < my && my < me.canvas.height / 2 + minSize - 10) {

//                        me.nameTooltip.text(circleObj.wasname);

                        //툴팁 보여줌.
                        var offset = me.canvas.getBoundingClientRect();

                        var bottom_diff = (document.body.offsetHeight - (circleObj.bottom+offset.top + 108));
                        if (bottom_diff > 0) {
                            bottom_diff = 0;
                        }

                        var posMargin;

                        if (me.canvas.height < me.canvas.width) {
                            posMargin = maxSize - minSize;
                        } else if (circleObj.width === me.canvas.width) {
                            posMargin = 0;
                        } else {
                            posMargin = me.canvas.width / 2;
                        }

                        var posY = circleObj.bottom + offset.top + bottom_diff + 8;
                        var posX = circleObj.left + offset.left;

                        if (me.iconMouseOver) {
                            //me.iconMouseOver(circleObj.name, {x:posX, y:posY, width: 45}, e);
                            me.iconMouseOver(circleObj.name, {
                                x: posX,
                                y: posY,
                                margin: posMargin,
                                width : me.canvas.width,
                                height: me.canvas.height
                            }, e);
                            me.isShowToolTip = true;
                        }

                    } else {
                        if (me.iconMouseLeave) {
                            me.iconMouseLeave();
                            me.isShowToolTip = false;
                        }
                    }

                });

            }
        }

        function windowResizeHandler() {

            SCREEN_WIDTH  = target.getWidth();
            SCREEN_HEIGHT = target.getHeight();

            me.canvas.width = SCREEN_WIDTH-10;
            me.canvas.height = SCREEN_HEIGHT-5;

            if (me.graph != null) {
                me.graph.width = SCREEN_WIDTH - 10;
                me.graph.height = SCREEN_HEIGHT;
            }

            const _HEIGHT = SCREEN_HEIGHT - 5;
            const _WIDTH  = SCREEN_WIDTH - 10;

            me.objWidth = 70;

            var circleObj = me.circle_objects;
            circleObj.width = _WIDTH;
            circleObj.top   = 10;
            circleObj.left  = 10;

            setElPos(me.canvas, 0, 10);

            function setElPos(el, bottom, left) {
                el.style.position = 'absolute';
                el.style.bottom = bottom+'px';
                el.style.left   = left+'px';
            }
        }


        function circleGraph(ctx) {
            // Private properties and methods
            var that = this;

            // Public properties and methods
            this.width  = 300;
            this.height = 150;
            this.margin = 5;

            var draw = function () {

                ctx.clearRect(0, 0, me.graph.width, me.graph.height);

                // 오브젝트를 그린다.
                function objectPrint( aobj ) {

                    /* Circle 부분 그리기*/
                    function  printCircle() {

                        var lastend = 0;

                        if (aobj.level === 1) {
                            ctx.fillStyle = me.color.COLOR_TEXT[1];

                        } else if (aobj.level === 2 || aobj.state > 0) {
                            ctx.fillStyle = me.color.COLOR_TEXT[2]

                        } else {
                            ctx.fillStyle = me.color.COLOR_TEXT[0];
                        }
                        ctx.beginPath();

                        ctx.arc(
                            me.canvas.width/2,
                            me.canvas.height/2,
                            Math.min(me.canvas.height/2, me.canvas.width/2),
                            lastend,
                            lastend + Math.PI*2,
                            false
                        );
                        ctx.lineTo(me.canvas.width/2, me.canvas.height/2);
                        ctx.fill();

                        var label;
                        if (aobj.level === 1) {
                            label = common.Util.TR('Warning');

                        } else if (aobj.level === 2 || aobj.state > 0) {
                            label = common.Util.TR('Critical');

                        } else {
                            label = common.Util.TR('Normal');
                            aobj.state = 0;
                        }
                        var fontSize = Math.min(me.canvas.height/2, me.canvas.width/2) / 3;
                        ctx.fillStyle = '#FFF';
                        ctx.font      = "normal " + fontSize + "px 'Droid Sans'";
                        ctx.textAlign = 'center';
                        ctx.fillText(
                            label,
                            me.canvas.width/2,
                            me.canvas.height/2 + fontSize/2
                        );
                    }

                    aobj.state = 0; // 초기화

                    for ( var k = 0, kcnt = me.idArr.length, serverId = '' ; k < kcnt ; ++k ) {

                        serverId = me.idArr[k].toString();

                        if (Comm.Status[me.serverType][ serverId ] === 'Server Down'  ||
                            Comm.Status[me.serverType][ serverId ] === 'TP Down'      ||
                            Comm.Status[me.serverType][ serverId ] === 'Disconnected') {
                            // down
                            aobj.state = Math.max(aobj.state, 1 );

                        } else if (realtime.expiredServer.indexOf(aobj.id) !== -1) {
                            // 라이센스
                            aobj.state = Math.max(aobj.state , 2);

                        } else {
                            // 정상
                            aobj.state = Math.max(aobj.state ,0 );
                        }
                    }

                    if (me.checkAlarmLevel) {
                        aobj.level = me.checkAlarmLevel(aobj.name);
                    }

                    printCircle();

                }

                if (me.resize === true) {
                    me.resize = false;
                    windowResizeHandler();
                }

                var circleObj = me.circle_objects;
                objectPrint(circleObj);

            }; // end draw function

            var cache_fittingString = {};
            this.fittingString = function(c, str, maxWidth) {

                if ( cache_fittingString['_'+maxWidth+str] ) {
                    return cache_fittingString['_'+maxWidth+str];

                } else {
                    var width = c.measureText(str).width;
                    var ellipsis = '..';
                    var ellipsisWidth = c.measureText(ellipsis).width;

                    if (width<=maxWidth || width<=ellipsisWidth) {
                        cache_fittingString['_'+maxWidth+str] = str;
                        return str;

                    } else {
                        var len = str.length;

                        while (width>=maxWidth-ellipsisWidth && len-->0) {
                            str = str.substring(0, len);
                            width = c.measureText(str).width;
                        }
                        cache_fittingString['_'+maxWidth+str] = str+ellipsis;
                        return str + ellipsis;
                    }
                }
            };

            this.update = function () {
                draw();
            };
        }

        getMouse = function(e) {
            var rect = me.canvas.getBoundingClientRect(), // abs. size of element
                scaleX = me.canvas.width / rect.width,    // relationship bitmap vs. element for X
                scaleY = me.canvas.height / rect.height;  // relationship bitmap vs. element for Y

            return {
                x: (e.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
                y: (e.clientY - rect.top) * scaleY     // been adjusted to be relative to element
            }
        };

    },


    circleObjectClass: function( id, name) {
        this.is_init  = false;
        this.id        = id;
        this.top       = 0;
        this.left      = 20;
        this.right     = 20;
        this.bottom    = 0;
        this.wasname   = name;
        
        this.state     = 0; // 0-정상, 1-DOWN, 2-라이센스 등
        this.level     = 0; // 0-노말 , 1-경고, 2-크리티컬
        this.width     = 0;

        this.setValues = function( v1, v2, v3 ) {
            this.state = 0; // 정상.
        };

        return this;
    },


    setChartInfo: function(mainId, mainName, idArr, nameArr) {
        this.idArr   = [];
        this.nameArr = [];

        var ix, ixLen;

        this.circle_objects = new this.circleObjectClass(mainId, mainName);

        for (ix = 0, ixLen = idArr.length; ix < ixLen; ix++) {
            this.idArr[this.idArr.length]      = idArr[ix];
            this.nameArr[this.nameArr.length]  = nameArr[ix];
        }

        this.resize = true;
    },


    /**
     * Start Circle Chart Draw
     */
    startAnimationFrame: function() {
        if (this.dataRefreshTimer != null) {
            clearInterval(this.dataRefreshTimer);
        }
        this.dataRefreshTimer = setInterval(function () {
            this.graph.update();
        }.bind(this), 500);
    },

    /**
     * Stop Circle Chart Draw
     */
    stopAnimationFrame: function() {
        clearInterval(this.dataRefreshTimer);
    }

});