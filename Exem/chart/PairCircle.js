Ext.define('Exem.chart.PairCircle', {
    extend: 'Ext.Component',
    resize: false,
    isInitResize: true,

    maxValue     : null,

    // 스킨 스타일시트 캐치용도임.
    html: '<div class="page-dot-nav"><ul class="dot-scroll" style="display: none;"><li><a class="active"></a></li><li><a></a></li></ul></div>' +
          '<div class="rtm-txn-count-base" style="display: none;"><div class="chart-label" style="display: none;"></div></div>',

    isShowValue: true,
    isSubMode  : false,

    circle_objects : [],
    scrollbar_objects : [],

    idArr : [],
    nameArr : [],

    // 그려야할 페이지
    currentPage : 1,

    // 전체 페이지 // resizehandle() 이 실행되어야 셋팅됨.
    totalPage : 1,

    color: {
        BASE        : 'transparent',
        COLOR_TEXT  : ['#42A5F6',  '#FF9803',  '#D7000F'  , 'dimgrey',  '#28DEFF'],
        SCROLLBAR   : [],
        BOTTOM_LINE : ''
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

        _.each(me.circle_objects, function(obj, idx) {

            if (adata[obj.id] != null) {
                me.circle_objects[idx].setValues( adata[obj.id][0], adata[obj.id][1], adata[obj.id][2] );
            }
        });

        adata = null;
    },

    init: function(target) {
        this.target = target;
        var me = this;

        me.scrollbar_objects = [];

        if (me.circle_objects == null) {
            me.circle_objects = [];
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

        me.createTooltip();

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

                me.canvas.addEventListener('mouseleave', function(e) {
                    e.preventDefault();
                    me.nameTooltip.css({'display': 'none'});
                });

                me.canvas.addEventListener('mousemove', function(e) {
                    e.preventDefault();

                    me.$canvas.css({'cursor': 'default'});

                    var mouse = getMouse(e);
                    var mx = mouse.x;
                    var my = mouse.y;

                    var i, icnt, circleObj, aObj;

                    me.isNavMenuHover = false;

                    if (me.isSubMode !== true) {
                        for ( i = 0, icnt =  me.circle_objects.length ; i < icnt ; ++i ) {
                            circleObj = me.circle_objects[ i ];

                            if (!circleObj.isSub && circleObj.row ==  me.currentPage && circleObj.box_hitTest( mx, my ) ) {
                                // 커서 변경
                                me.$canvas.css({'cursor': 'pointer'});
                                break;
                            }
                        }
                    }

                    if (me.isSubMode === true &&
                        me.box_subNav(mx, my, me.ctx.measureText(me.selectedParentName).width + 10 || 50) === true) {

                        me.$canvas.css({'cursor': 'pointer'});
                        me.isNavMenuHover = true;
                        me.graph.subNavLabel();
                    }

                    // 스크롤바 체크
                    for ( i = 1, icnt =  me.scrollbar_objects.length ; i < icnt ; ++i ) {
                        aObj = me.scrollbar_objects[i];

                        if ( (mx >= aObj[0] && mx <= aObj[2]  ) && (my >= aObj[1] && my <=  aObj[3]) ) {
                            me.$canvas.css({'cursor': 'pointer'});
                            break;
                        }
                    }

                    // 명칭 툴팁
                    var isTargetObj;
                    for ( i = 1, icnt =  me.circle_objects.length ; i < icnt ; ++i ) {
                        circleObj = me.circle_objects[i];

                        if ( (me.isSubMode && me.selectedParentId == circleObj.parentId) ||
                             (!me.isSubMode && !circleObj.isSub) ) {
                            isTargetObj = true;
                        } else {
                            isTargetObj = false;
                        }

                        if (isTargetObj && circleObj.row ==  me.currentPage && circleObj.wasname_hitTest(mx, my) ) {

                            me.nameTooltip.text(circleObj.wasname);

                            //툴팁 보여줌.
                            var offset = me.canvas.getBoundingClientRect();

                            var bottom_diff = (document.body.offsetHeight - (circleObj.bottom+offset.top + 108));
                            if (bottom_diff > 0) {
                                bottom_diff = 0;
                            }

                            var posY = circleObj.bottom + offset.top + bottom_diff + 8;
                            var posX = circleObj.left + offset.left;

                            if (me.nameTooltip.width() > circleObj.width) {
                                posX -= circleObj.width / 2;
                            }

                            if (posY + 50 > window.innerHeight) {
                                posY = window.innerHeight - 50;
                            }

                            if (posX + me.nameTooltip.width() > window.innerWidth) {
                                posX = window.innerWidth - me.nameTooltip.width() - circleObj.width / 2;
                            }
                            me.nameTooltip.css({top: posY, left: posX, display: 'block'});
                            break;
                        } else {
                            me.nameTooltip.css({'display': 'none'});
                        }
                    }

                });

                me.canvas.addEventListener('mousedown', function(e) {
                    e.preventDefault();

                    var mouse = getMouse(e);
                    var mx = mouse.x;
                    var my = mouse.y;

                    var i, icnt, circleObj, aObj;

                    // 박스 체크
                    if (me.isSubMode !== true) {
                        for ( i = 0, circleObj = null, icnt =  me.circle_objects.length ; i < icnt ; ++i ) {
                            circleObj = me.circle_objects[ i ];
                            if (circleObj.isSub ||  circleObj.row !=  me.currentPage ) {
                                continue;
                            }

                            if ( circleObj.box_hitTest( mx, my ) ) {

                                me.isSubMode = true;

                                me.selectedParentName = circleObj.wasname;
                                me.selectedParentId   = circleObj.id;

                                me.resize = true;
                                me.graph.update();

                                if (me.circleClick != null) {
                                    me.circleClick();
                                }
                                e.stopPropagation();
                                return;
                            }
                        }
                    }

                    if (me.isSubMode === true &&
                        me.box_subNav(mx, my, me.ctx.measureText(me.selectedParentName).width + 10 || 50) === true) {

                        me.isSubMode = false;
                        me.resize = true;
                        me.graph.update();

                        if (me.navMenuclick != null) {
                            me.navMenuclick();
                        }
                        e.stopPropagation();
                    }

                    // 스크롤바 체크
                    for ( i = 1, aObj = null, icnt =  me.scrollbar_objects.length ; i < icnt ; ++i ) {
                        aObj = me.scrollbar_objects[i];
                        // x,y,w,h
                        if ( (mx >= aObj[0] && mx <= aObj[2] ) && (my >= aObj[1] && my <= aObj[3])  ) {
                            me.currentPage = i;
                            me.graph.update();
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

            /*
            this.circle_objects 를 돌면서 Object의 크기를 재계산해준다.
            몇번째 줄인지도 계산해줘야함.
            */
            const _HEIGHT = SCREEN_HEIGHT-5;
            const _WIDTH  = SCREEN_WIDTH-10;
            const _rowHeight = 60; //// 한개당 높이
            const _rightMargin = 20;
            const _valueTextHeight = 21;

            me.objWidth = 70;

            // 1 줄에 몇개가 들어갈지 계산한다.
            // (SCREEN_WIDTH - 10 - 15 /*스크롤Width*/  )/  (55 /*obj width*/+5/*margin*/  )
            var cellCount = Math.max( Math.floor(  (_WIDTH -10 -_rightMargin) / ( me.objWidth  + _rightMargin ) ) , 1);

            // 몇줄 들어갈지 계산.
            ///var rowCount = Math.max( Math.floor(   _HEIGHT /  (_rowHeight+_valueTextHeight)  ) , 1)
            var rowCount = Math.max( Math.floor(   _HEIGHT /  (_rowHeight + 15)  ) , 1);

            if (cellCount * rowCount === 0) {
                return setTimeout( windowResizeHandler , 100);
            }

            var pages = 0;

            for ( var i = 0, icnt = me.circle_objects.length, obj_idx = 0, arr_obj_pos=[], circleObj = null; i < icnt ; ++i ) {

                circleObj = me.circle_objects[i];

                if ((me.isSubMode === true && circleObj.isSub !== true) ||
                    (me.isSubMode !== true && circleObj.isSub === true) ||
                    (me.isSubMode === true && circleObj.parentId != me.selectedParentId) ) {
                    circleObj.visible = false;

                    continue;
                }

                // wasList 배열에 값이 있으면 그놈만 체크하고, 없으면 전체 뷰
                if (me.viewWasList.length > 0) {
                    if (me.isSubMode === true && circleObj.isSub === true) {
                        circleObj.visible =  me.viewWasList.indexOf( circleObj.parentId.toString() )  > -1;
                    } else {
                        circleObj.visible =  me.viewWasList.indexOf( circleObj.id.toString() )  > -1;
                    }
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
                        circleObj.top   = _valueTextHeight+(Math.ceil( (obj_idx+1) / (cellCount) )-circleObj.row) * (_rowHeight + 10) + 20; // 마진 까지 110.

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

                        ctx.beginPath();
                        ctx.arc(aobj.left, nTop, 20, Math.atan2(25, 30), Math.atan2(25, -30)+Math.PI , false);
                        ctx.closePath();

                        ctx.lineWidth = 0;
                        ctx.fillStyle = (aobj.state == 0)? '#55B6A3' : '#898989';
                        ctx.fill();

                        ctx.beginPath();
                        ctx.arc(aobj.left+32, nTop, 20, -Math.atan2(25, -30), -Math.atan2(25, 30)+Math.PI , false);
                        ctx.closePath();

                        ctx.lineWidth = 0;
                        ctx.fillStyle = (aobj.state == 0)? '#359BFF' : '#898989';
                        ctx.fill();

                        ctx.fillStyle = '#FFF';
                        ctx.font      = "normal 12px 'Droid Sans'";
                        ctx.textAlign = "center";
                        ctx.fillText( aobj.active1 || 0, aobj.left,    nTop+4);
                        ctx.fillText( aobj.total || 0, aobj.left+32, nTop+4);

                        ctx.fillStyle = me.color.COLOR_TEXT[3];
                        ctx.font      = "normal 12px 'Droid Sans'";
                        ctx.textAlign = "center";

                        var barLabel = that.fittingString(ctx, aobj.wasname, aobj.width );
                        ctx.fillText( barLabel, aobj.left + 15, aobj.bottom+3  );
                        barLabel = null;

                    }

                    var arr_wasID = [].concat(aobj.parentId || aobj.id);
                    aobj.state = 0; // 초기화

                    for ( var k = 0, kcnt = arr_wasID.length, wasid = '' ; k < kcnt ; ++k ) {
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

                    printCircle();

                }

                if (me.resize === true) {
                    me.resize = false;
                    windowResizeHandler();
                }

                var isProcessSkip;
                var circleObj;

                for (var i = 0, icnt =  me.circle_objects.length ; i < icnt ; ++i) {
                    isProcessSkip = false;
                    circleObj = me.circle_objects[ i ];

                    if (circleObj.row !=  me.currentPage) {
                        isProcessSkip = true;
                    }

                    if ((me.isSubMode === true && circleObj.isSub !== true) ||
                         me.isSubMode !== true && circleObj.isSub === true) {
                        isProcessSkip = true;
                    }

                    if (me.isSubMode === true && circleObj.parentId != me.selectedParentId) {
                        isProcessSkip = true;
                    }

                    if (!isProcessSkip) {
                        objectPrint(circleObj);
                    }
                }

                if (me.isSubMode === true) {
                    me.graph.subNavLabel();
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

            this.subNavLabel = function() {
                ctx.clearRect(0, 0, me.graph.width, 14);
                ctx.fillStyle = (me.isNavMenuHover === true)? me.color.COLOR_TEXT[4] : me.color.COLOR_TEXT[3];
                ctx.font      = "normal 12px 'Droid Sans'";
                ctx.textAlign = "left";

                ctx.fillText( me.selectedParentName, 25, 10 );

                ctx.lineWidth = 0.9;
                ctx.strokeStyle = (me.isNavMenuHover === true)? me.color.COLOR_TEXT[4] : me.color.COLOR_TEXT[3];

                ctx.beginPath();
                ctx.moveTo(10,0);
                ctx.lineTo(4,6);
                ctx.lineTo(10,12);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(15,0);
                ctx.lineTo(9,6);
                ctx.lineTo(15,12);
                ctx.stroke();
            };

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
            var rect = me.canvas.getBoundingClientRect(), // abs. size of element
                scaleX = me.canvas.width / rect.width,    // relationship bitmap vs. element for X
                scaleY = me.canvas.height / rect.height;  // relationship bitmap vs. element for Y

            return {
                x: (e.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
                y: (e.clientY - rect.top) * scaleY     // been adjusted to be relative to element
            }
        };

    },


    box_subNav : function(mx, my, width) {
        return ( 0 < mx && mx < width + 10 && // 가로 축 체크
                 0 < my && my < 10);      // 세로축 체크
    },

    _bar_objectClass : function( id, name, isSub, parentId ) {
        this.is_init  = false;
        this.id        = id;
        this.top       = 0;
        this.left      = 20;
        this.right     = 20;
        this.bottom    = 0;
        this.wasname   = name;
        this.cell      = 0; // 몇번째 놈인지.
        this.row       = -1; // 몇번째 줄인지
        this.state     = 0; // 0-정상, 1-DOWN, 2-라이센스?? ... 등등등 담에 쓸꺼임.
        this.level     = 0; // 0-노말 , 1-경고, 2-크리티컬
        this.width     = 50; // 그릴 width,
        this.barHeight = 70; // 전체 그리기 영역중 bar가 그려질 영역의 height // windowresize 이벤트에서 다시 받음.
        this.visible   = true; // 보이는 여부, 그릴때 체크해줘야하는뎅 우선 resize 에 넣어둠. 어떤이벤트 일어날때 리사이즈 해줘야함.
        this.isSub     = isSub;
        this.parentId  = parentId;

        this.setValues = function( v1, v2, v3 ) {

            this.active1 = v1;
            this.active2 = v2;
            this.total   = v3;

            this.state = 0; // 정상.
        };

        this.box_hitTest = function(mx,my) {
            return ( this.left - 20 < mx && mx < this.right - 40 && // 가로 축 체크
                     this.top - 20  < my && my < this.bottom -10);  // 세로축 체크
        };

        this.wasname_hitTest = function(mx,my) {
            return (this.left   - 20 < mx && mx < this.right - 40 && // 가로 축 체크
                    this.bottom - 15 < my && my < this.bottom + 5);  // 세로 축 체크
        };

        return this;
    },


    setChartSeries: function(idArr, nameArr, subIdArr, subNameArr) {
        this.idArr   = [];
        this.nameArr = [];

        this.circle_objects = [];
        this.scrollbar_objects = [];

        var ix, ixLen;

        for (ix = 0, ixLen = idArr.length; ix < ixLen; ix++) {
            this.idArr[this.idArr.length]      = idArr[ix];
            this.nameArr[this.nameArr.length]  = nameArr[ix];

            this.circle_objects.push( new this._bar_objectClass(idArr[ix], nameArr[ix], false) );
        }

        if (subIdArr != null && subIdArr.length > 0) {
            this.subIdArr   = [];
            this.subNameArr = [];

            for (ix = 0, ixLen = subIdArr.length; ix < ixLen; ix++) {

                this.subIdArr[this.subIdArr.length]     = subIdArr[ix];
                this.subNameArr[this.subNameArr.length] = subNameArr[ix];

                this.circle_objects.push( new this._bar_objectClass(subIdArr[ix], subNameArr[ix], true,  subIdArr[ix].split('_')[0] ) );
            }
        }

        this.resize = true;
    },


    /**
     * Create Tooltip
     */
    createTooltip: function() {
        this.nameTooltip = $('<div"></div>').css({
            'position': 'absolute',
            'display': 'none',
            'z-index': 20000,
            'color': '#000',
            'background-color': '#fff',
            'padding': '2px 2px 3px 2px',
            'border': '1px solid #D8D8D8',
            'box-shadow': '1px 1px 2px',
            'width': 'auto',
            'height': '12px'
        });
        $('body').append(this.nameTooltip);
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