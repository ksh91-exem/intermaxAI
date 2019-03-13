Ext.define('Exem.chart.AlarmIcon', {
    extend: 'Ext.Component',
    resize: false,
    isInitResize: true,

    // 스킨 스타일시트 캐치용도임.
    html: '<div class="page-dot-nav"><ul class="dot-scroll" style="display: none;"><li><a class="active"></a></li><li><a></a></li></ul></div>' +
          '<div class="rtm-txn-count-base" style="display: none;"><div class="chart-label" style="display: none;"></div></div>',

    iconObjects : [],
    scrollbar_objects : [],

    idArr   : [],
    nameArr : [],
    typeArr : [],

    // 그려야할 페이지
    currentPage : 1,

    // 전체 페이지 // resizehandle() 이 실행되어야 셋팅됨.
    totalPage : 1,

    isShowToolTip: false,

    color: {
        BASE        : 'transparent',
        COLOR_TEXT  : ['#42A5F6',  '#FF9803',  '#D7000F'  , 'dimgrey',  '#28DEFF'],
        SCROLLBAR   : [],
        BOTTOM_LINE : ''
    },

    imagePoint: {
        wasN    : {x: 88,  y: 782, w:42, h: 42 },
        wasW    : {x: 44,  y: 782, w:42, h: 42 },
        wasC    : {x: 0,   y: 782, w:42, h: 42 },
        dbN     : {x: 220, y: 738, w:42, h: 42 },
        dbW     : {x: 176, y: 738, w:42, h: 42 },
        dbC     : {x: 132, y: 738, w:42, h: 42 },
        webN    : {x: 220, y: 782, w:42, h: 42 },
        webW    : {x: 176, y: 782, w:42, h: 42 },
        webC    : {x: 132, y: 782, w:42, h: 42 }
    },

    iconImgsrc: '../images/xm_icon_Black_v1.png',

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


    init: function(target) {
        if (!this.isImageLoad) {
            this.iconImg = new Image();
            this.iconImg.src = this.iconImgsrc;

            this.iconImg.onload = function() {
                this.isImageLoad = true;
                this.init(target);
            }.bind(this, target);

            return;
        }

        this.target = target;
        var me = this;

        me.scrollbar_objects = [];

        if (me.iconObjects == null) {
            me.iconObjects = [];
        }
        if (me.viewWasList == null) {
            me.viewWasList = [];
        }

        // 스크롤바 컬러를 추출. 0 // 비활성 1 // 활성
        me.color.SCROLLBAR = [];

        var aa=document.querySelectorAll('.page-dot-nav .dot-scroll li a')[0]; // 활성
        me.color.SCROLLBAR.push( window.getComputedStyle(aa,':before').backgroundColor );
        aa=document.querySelectorAll('.page-dot-nav .dot-scroll li a')[1]; // 비활성
        me.color.SCROLLBAR.push( window.getComputedStyle(aa,':before').backgroundColor );
        aa=document.querySelector('.chart-label');
        me.color.BOTTOM_LINE = window.getComputedStyle(aa).borderTopColor.toString();
        aa= null;

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

                me.canvas.addEventListener('mousewheel',function(e) {
                    e.preventDefault();
                    if (e.wheelDelta > 0) {
                        if (me.currentPage > 1) {
                            me.currentPage--;
                        } else {
                            return;
                        }
                    } else {
                        if (me.currentPage < me.totalPage) {
                            me.currentPage++;
                        } else {
                            return;
                        }
                    }
                    me.graph.update();

                    return false;
                }, false);

                me.canvas.addEventListener('mousemove', function(e) {
                    e.preventDefault();

                    me.$canvas.css({'cursor': 'default'});

                    var mouse = getMouse(e);
                    var mx = mouse.x;
                    var my = mouse.y;

                    var i, icnt, circleObj, aObj;
                    var offset, bottom_diff;
                    var posX, posY;

                    if (me.isShowToolTip && me.iconMouseLeave) {
                        me.iconMouseLeave();
                        me.isShowToolTip = false;
                    }

                    for ( i = 0, icnt =  me.iconObjects.length ; i < icnt ; ++i ) {
                        circleObj = me.iconObjects[ i ];

                        if (circleObj.row ===  me.currentPage && circleObj.box_hitTest( mx, my ) ) {

                            offset = me.canvas.getBoundingClientRect();
                            bottom_diff = (document.body.offsetHeight - (circleObj.bottom + offset.top + 108));

                            if (bottom_diff > 0 ) {
                                bottom_diff = 0;
                            }

                            posY = circleObj.bottom + offset.top + bottom_diff;
                            posX = circleObj.left + offset.left;

                            if (posY + 90 > window.innerHeight) {
                                posY = window.innerHeight - 90;
                            }

                            if (me.iconMouseOver) {
                                me.iconMouseOver(circleObj.name, {x:posX, y:posY, width: 45}, e);
                                me.isShowToolTip = true;
                            }
                            break;
                        } else {
                            if (me.iconMouseLeave) {
                                me.iconMouseLeave();
                                me.isShowToolTip = false;
                            }
                        }
                    }

                    // 스크롤바 체크
                    for ( i = 1, icnt =  me.scrollbar_objects.length ; i < icnt ; ++i ) {
                        aObj = me.scrollbar_objects[i];
                        // 스크롤 버튼 위치
                        //me.ctx.fillRect( aObj[0], aObj[1] ,  aObj[2]-aObj[1], aObj[3]-aObj[1])
                        // 마우스 표적 위치
                        //me.ctx.fillRect( mx, my ,  2, 2)
                        // x,y,w,h
                        if ( (mx >= aObj[0] && mx <= aObj[2] ) && (my >= aObj[1] && my <= aObj[3]) ) {
                            me.$canvas.css({'cursor': 'pointer'});
                            break;
                        }
                    }
                });

                me.canvas.addEventListener('mousedown', function(e) {
                    e.preventDefault();

                    var mouse = getMouse(e);
                    var mx = mouse.x;
                    var my = mouse.y;

                    var i, icnt, aObj;

                    // 스크롤바 체크
                    for ( i = 1, icnt =  me.scrollbar_objects.length ; i < icnt ; ++i ) {
                        aObj = me.scrollbar_objects[i];

                        if ( (mx >= aObj[0] && mx <= aObj[2] ) && (my >= aObj[1] && my <= aObj[3]) ) {
                            me.currentPage = i;
                            me.graph.update();
                            break;
                        }
                        aObj= null;
                    }

                }, false);

            }
        }

        function windowResizeHandler() {

            SCREEN_WIDTH = target.getWidth();
            SCREEN_HEIGHT = target.getHeight();

            me.canvas.width = SCREEN_WIDTH-10;
            me.canvas.height = SCREEN_HEIGHT-5;

            if (me.graph != null) {
                me.graph.width = SCREEN_WIDTH - 10;
                me.graph.height = SCREEN_HEIGHT;
            }

            // this.circle_objects 를 돌면서 Object의 크기를 재계산해준다.
            // 몇번째 줄인지도 계산해줘야함.
            const _HEIGHT = SCREEN_HEIGHT-5;
            const _WIDTH  = SCREEN_WIDTH-10;
            const _rowHeight = 60; // 한개당 높이
            const _rightMargin = 20;
            const _valueTextHeight = 21;

            me.objWidth = 43;

            // 1 줄에 몇개가 들어갈지 계산한다.
            var cellCount = Math.max( Math.floor( (_WIDTH - 0 -_rightMargin) / ( me.objWidth  + _rightMargin ) ) , 1);

            // 몇줄 들어갈지 계산.
            var rowCount = Math.max( Math.floor( _HEIGHT /  (_rowHeight + 7) ) , 1);

            if (cellCount * rowCount === 0) {
                return setTimeout( windowResizeHandler , 100);
            }

            var pages = 0;
            var circleObj;

            for ( var i = 0, icnt = me.iconObjects.length, obj_idx = 0, arr_obj_pos=[]; i < icnt ; ++i ) {
                circleObj = me.iconObjects[i];

                // wasList 배열에 값이 있으면 그놈만 체크하고, 없으면 전체 뷰
                if (me.viewWasList.length > 0) {
                    circleObj.visible =  me.viewWasList.indexOf( circleObj.id.toString() )  > -1;
                } else {
                    circleObj.visible = true;
                }
                // obj_idx 이놈 안쓰고 arr_obj_pos.length 로 대체해도 되지만  그냥 씀.

                if ( circleObj.visible === true) {
                    circleObj.row   = Math.ceil( (obj_idx+1) / (cellCount * rowCount) ); // 1번째 줄부터 시작함.
                    circleObj.cell  = obj_idx % cellCount; // 왼쪽 0부터 시작함.
                    circleObj.width = me.objWidth;
                    circleObj.barHeight = 20; //_rowHeight-51

                    // 영역 계산한다.
                    if ( obj_idx < cellCount*rowCount ) {

                        // 한 화면 다 그리면
                        circleObj.top   = _valueTextHeight+(Math.ceil( (obj_idx+1) / (cellCount) )-circleObj.row) * (_rowHeight + 10); // 마진 까지 110.

                        circleObj.left   = circleObj.cell  *  ( me.objWidth  + _rightMargin )+20;
                        circleObj.right  = circleObj.left  +  ( me.objWidth  + _rightMargin );
                        circleObj.bottom =  circleObj.top  +  _rowHeight  - 10 - (_valueTextHeight-1);

                        arr_obj_pos[obj_idx]= [circleObj.top, circleObj.left , circleObj.right, circleObj.bottom];

                    } else {
                        // 다른 페이지는 이전에 그렸던 페이지의 위치 가져온다.
                        circleObj.top    = Math.round(arr_obj_pos[obj_idx%(cellCount*rowCount)][0]);
                        circleObj.left   = Math.round(arr_obj_pos[obj_idx%(cellCount*rowCount)][1]);
                        circleObj.right  = Math.round(arr_obj_pos[obj_idx%(cellCount*rowCount)][2]);
                        circleObj.bottom =  Math.round(arr_obj_pos[obj_idx%(cellCount*rowCount)][3]);
                    }
                    pages = Math.max( circleObj.row , pages );

                    circleObj = null;
                    // 생성 했으니 인덱스 증가시킴.
                    obj_idx++;

                } else {
                    circleObj.row = -1;
                }

            }


            /* pages는 +1 해줘야함.  */
            //pages ++
            me.totalPage =  pages;
            pages = null;
            /* 끝 */
            if ( me.totalPage < me.currentPage ) {
                me.currentPage = 1;
            }

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

                        var nBottom = aobj.top + aobj.barHeight;
                        var nTop    = nBottom  - aobj.barHeight;

                        var imagePoint;

                        if (aobj.type === 1) {
                            if (aobj.level === 1) {
                                imagePoint = me.imagePoint.wasW;
                            } else if (aobj.level === 2 || aobj.state > 0) {
                                imagePoint = me.imagePoint.wasC;
                            } else {
                                imagePoint = me.imagePoint.wasN;
                            }
                        } else if (aobj.type === 2) {
                            if (aobj.level === 1) {
                                imagePoint = me.imagePoint.dbW;
                            } else if (aobj.level === 2) {
                                imagePoint = me.imagePoint.dbC;
                            } else {
                                imagePoint = me.imagePoint.dbN;
                            }
                        } else {
                            if (aobj.level === 1) {
                                imagePoint = me.imagePoint.webW;
                            } else if (aobj.level === 2) {
                                imagePoint = me.imagePoint.webC;
                            } else {
                                imagePoint = me.imagePoint.webN;
                            }
                        }

                        ctx.drawImage(
                            me.iconImg,
                            imagePoint.x,
                            imagePoint.y,
                            imagePoint.w,
                            imagePoint.h,
                            aobj.left - imagePoint.w / 2,
                            nTop - imagePoint.h / 2,
                            imagePoint.w,
                            imagePoint.h
                        );

                        ctx.fillStyle = me.color.COLOR_TEXT[3];
                        ctx.font      = "normal 12px 'Droid Sans'";
                        ctx.textAlign = "center";

                        var barLabel = that.fittingString(ctx, aobj.name, aobj.width );
                        ctx.fillText( barLabel, aobj.left, aobj.bottom + 5  );
                        barLabel = null;

                    }

                    var arr_wasID = [].concat(aobj.id);
                    aobj.state = 0; // 초기화

                    var wasid;
                    for (var k = 0, kcnt = arr_wasID.length; k < kcnt ; ++k ) {
                        // 그룹에서도 같이 쓰기 땜에 이렇게 함.
                        wasid = arr_wasID[k].toString();
                        if (Comm.Status.WAS[ wasid ] === 'Disconnected' ||
                            Comm.Status.WAS[ wasid ] === 'Server Down'  ||
                            Comm.Status.WAS[ wasid ] === 'Server Hang') {
                            // down
                            aobj.state = Math.max(aobj.state, 1 );

                        } else if (realtime.expiredServer.indexOf(aobj.id) !== -1) {
                            // 라이센스
                            aobj.state = Math.max(aobj.state , 2);

                        } else {
                            // 정상
                            aobj.state = Math.max(aobj.state ,0 );
                        }
                        wasid = null;
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

                var isProcessSkip;
                for ( var i = 0, circleObj = null, icnt =  me.iconObjects.length ; i < icnt ; ++i ) {
                    isProcessSkip = false;
                    circleObj = me.iconObjects[ i ];

                    if (circleObj.row !=  me.currentPage) {
                        isProcessSkip = true;
                    }

                    if (!isProcessSkip) {
                        objectPrint(circleObj);
                    }
                }

                var tmp;
                while ( me.scrollbar_objects.length > 0 ) {
                    tmp = me.scrollbar_objects.pop() ;
                    tmp.length = 0;
                    tmp =  null;
                }

                me.scrollbar_objects.length = 0;

                me.scrollbar_objects = [ [0,0,0,0] ]; // 0페이지는 안쓰니까 그냥 넣어둠.

                if (me.totalPage > 1) {
                    for (var ix = 1, x=0, y=0, w=0; ix <= me.totalPage; ix++) {
                        ctx.beginPath();
                        x = that.width-10;
                        y = that.height/2 - (me.totalPage*8) + (ix*15);
                        w = 10;

                        ctx.arc(x, y, w/2, 0, 2 * Math.PI, false);

                        me.scrollbar_objects.push( [x-5, y-5, x+2, y+5 ] );

                        if (ix === me.currentPage) {
                            ctx.fillStyle = me.color.SCROLLBAR[0]; // 현재 페이지
                        } else {
                            ctx.fillStyle = me.color.SCROLLBAR[1];
                        }
                        ctx.fill();
                        ctx.closePath();
                    }
                }

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
                        return str+ellipsis;
                    }
                }
            };

            this.update = function () {
                draw();
            };
        }

        getMouse = function(e) {
            var element = me.canvas, offsetX = 0, offsetY = 0, mx, my;

            if ( !e.layerX ) {
                if (element.offsetParent !== null) {
                  do {
                    offsetX += element.offsetLeft;
                    offsetY += element.offsetTop;
                  } while ((element = element.offsetParent));
                }
                mx = e.pageX - offsetX;
                my = e.pageY - offsetY;

            } else {
                mx = e.layerX ;
                my = e.layerY ;
            }

            return {x: mx, y: my};
        };

    },


    IconObjectClass: function(id, name, type) {
        this.is_init  = false;
        this.id        = id;
        this.top       = 0;
        this.left      = 20;
        this.right     = 20;
        this.bottom    = 0;
        this.name      = name;
        this.cell      = 0; // 몇번째 놈인지.
        this.row       = -1; // 몇번째 줄인지
        this.state     = 0; // 0-정상, 1-DOWN, 2-라이센스?? ... 등등등 담에 쓸꺼임.
        this.level     = 0; // 0-노말 , 1-경고, 2-크리티컬
        this.width     = 50; // 그릴 width,
        this.barHeight = 70; // 전체 그리기 영역중 bar가 그려질 영역의 height // windowresize 이벤트에서 다시 받음.
        this.visible   = true; // 보이는 여부, 그릴때 체크해줘야하는뎅 우선 resize 에 넣어둠. 어떤이벤트 일어날때 리사이즈 해줘야함.
        this.type      = type;

        this.box_hitTest = function(mx,my) {
            return ( this.left - 20 < mx && mx < this.right - 45 && // 가로 축 체크
                     this.top - 20  < my && my < this.bottom -10);  // 세로축 체크
        };

        this.name_hitTest = function(mx,my) {
            return ( this.left < mx && mx < this.right  -20 && // 가로 축 체크
                     this.bottom-15 < my && my < this.bottom);
        };

        return this;
    },


    setChartLabels: function(idArr, nameArr, typeArr) {
        this.idArr   = [];
        this.nameArr = [];
        this.typeArr = [];

        this.iconObjects = [];
        this.scrollbar_objects = [];

        var ix, ixLen;

        for (ix = 0, ixLen = idArr.length; ix < ixLen; ix++) {
            this.idArr[this.idArr.length]      = idArr[ix];
            this.nameArr[this.nameArr.length]  = nameArr[ix];
            this.typeArr[this.typeArr.length]  = typeArr[ix];

            this.iconObjects.push(new this.IconObjectClass(idArr[ix], nameArr[ix], typeArr[ix]));
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