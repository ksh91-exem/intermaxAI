Ext.define('Exem.chart.StackBarChart', {
    extend: 'Ext.Component',
    resize: false,
    isInitResize: true,
    devMode: false,
    isApplyTheme: false,

    maxValue     : null,
    maxBarWidth  : null,
    maxBarHeight : null,
    minBarWidth  : null,
    barWidth     : null,
    isWidthFix   : null,

    totalMode    : false,
    dataRefreshTimer : -1,
    isBarStripe: false,
    barStripeImg: null,
    // 스킨 스타일시트 캐치용도임.
    html: '<div class="page-dot-nav"><ul class="dot-scroll" style="display: none;"><li><a class="active"></a></li><li><a></a></li></ul></div>'
    + '<div class="rtm-txn-count-base" style="display: none;"><div class="chart-label" style="display: none;"></div></div>',

    isShowValue: true,

    isFitChart: false,

    // 빈값이면 다 보이고, 있으면 있는놈만 보임.
    viewWasList : [],

    // 그려야할 페이지
    currentPage : 1,

    // 전체 페이지 // resizehandle() 이 실행되어야 셋팅됨.
    totalPage : 1,

    bar_objects : [],

    scrollbar_objects : [],

    serverType: null,

    color: {
        BASE          : '#FFFFFF',
        COLOR_TEXT    : ['#42A5F6',   '#FF9803',   '#D7000F'   , 'dimgrey'],
        COLOR_BAR     : ['#42A5F6',   '#FF9803',   '#D7000F'   ],
        SCROLLBAR : [],
        BOTTOM_LINE : ''
    },
    isGroupView  : false,
    isCPUView    : false,
    isMouseEvent : true,

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
            if (this.barTooltip != null) {
                this.barTooltip.remove();
            }
            clearTimeout(this.dataRefreshTimer);
            this.dataRefreshTimer = -1;
        }
    },

    onData: function(adata, type) {
        var me = this,
            bizData = {},
            idx, ix, ixLen, bizDataList, bizId;

        if (adata == null || adata.rows.length <= 0) {
            return;
        }

        if (type === 'bizActive') {
            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                if (me.isTopBiz) {
                    bizId = +adata.rows[ix][8].split('-')[0];
                } else {
                    bizId = +adata.rows[ix][8].split('-')[1];
                }

                idx = me.idArr.indexOf(bizId);

                if (idx !== -1) {
                    if (!bizData[bizId]) {
                        bizData[bizId] = {
                            normal   : 0,
                            warning  : 0,
                            critical : 0
                        };
                    }
                    bizData[bizId].normal += adata.rows[ix][9];
                    bizData[bizId].warning += adata.rows[ix][10];
                    bizData[bizId].critical += adata.rows[ix][11];
                    bizData[bizId].idx  = idx;
                }
            }

            bizDataList = Object.keys(bizData);

            for (ix = 0, ixLen = bizDataList.length; ix < ixLen; ix++) {
                me.bar_objects[bizData[bizDataList[ix]].idx].setValues(
                    bizData[bizDataList[ix]].normal,
                    bizData[bizDataList[ix]].warning,
                    bizData[bizDataList[ix]].critical
                );
            }
        } else {
            _.each(adata.rows, function(v) {
                if (v[6] == 255) {
                    v[6] = 0;
                }

                // 그룹뷰면 이름으로 한다.
                if (me.isGroupView && !me.isCPUView) {
                    idx = me.nameArr.indexOf(v[4]);
                } else {
                    idx = me.idArr.indexOf(v[3]);
                }

                if (idx !== -1) {
                    me.bar_objects[idx].setValues( v[6] + v[7] + v[8], v[9] + v[10] + v[11], v[12] + v[13] );
                }
            });
        }

        adata = null;
    },

    init: function(target) {

        this.target = target;
        var me = this;

        /* _bar_objectClass */
        if ( !this._bar_objectClass ) {
            this._bar_objectClass = function( id, wasname ) {
                this.is_init = false;
                this.id = id;
                this.top = 0;
                this.left = 0;
                this.right = 50; // width
                this.bottom = 0;
                this.wasname = wasname;
                this.value = 0;
                this.n_cnt = 0; // 정상
                this.w_cnt = 0; // 경고
                this.c_cnt = 0; // 심각
                this.sum   = 0; // 전체?
                this.cell = 0; // 몇번째 놈인지.
                this.row = -1; // 몇번째 줄인지
                this.state = 0; // 0-정상, 1-DOWN, 2-라이센스?? ... 등등등 담에 쓸꺼임.
                this.level  = 0; // 0-노말 , 1-경고, 2-크리티컬
                this.width = 50; // 그릴 width,
                this.ani_Loop = 0; // 애니메이션용 integer
                this.n_ratio = 0; // n 의 그림그릴 높이 , setValues 할때 계산해줌.
                this.w_ratio = 0; // w 의 그림그릴 높이
                this.c_ratio = 0; // c 의 그림그릴 높이
                this.maxValue = 33; // 계산할 거시기? windowresize 이벤트에서 다시 넣어줌.
                this.maxSUM   = 33; // 현재까지 입력받은것중최대값
                this.n_barHeight = 0; // n영역의 그려질 높이
                this.w_barHeight = 0; // w영역의 그려질 높이
                this.c_barHeight = 0; // c영역의 그려질 높이
                this.barHeight = 70; // 전체 그리기 영역중 bar가 그려질 영역의 height // windowresize 이벤트에서 다시 받음.
                this.visible = true; // 보이는 여부, 그릴때 체크해줘야하는뎅 우선 resize 에 넣어둠. 어떤이벤트 일어날때 리사이즈 해줘야함.

                return this;
            };

            this._bar_objectClass.prototype.setValues = function( n, w, c ) {
                // 값을 넣어준다. sum 도 넣고 레벨도 설정함.
                this.n_cnt = n;
                this.w_cnt = w;
                this.c_cnt = c;
                this.sum = n + w + c;
                this.maxSUM = Math.max(this.maxSUM, this.sum);

                if ( c > 0 ) {
                    this.level = 2;

                } else if ( w > 0 ) {
                    this.level = 1;

                } else {
                    this.level = 0;
                }
                this.state = 0;// 정상.

                // 계산을 다시해준다.
                this.bar_draw_calc();
            };

            this._bar_objectClass.prototype.bar_draw_calc = function() {
                if (this.maxValue > 0 ) {
                    this.n_ratio  = this.n_cnt  / this.maxValue;
                    this.w_ratio  = this.w_cnt  / this.maxValue;
                    this.c_ratio  = this.c_cnt  / this.maxValue;

                } else {
                    this.n_ratio  = this.n_cnt  / this.maxSUM;
                    this.w_ratio  = this.w_cnt  / this.maxSUM;
                    this.c_ratio  = this.c_cnt  / this.maxSUM;
                }

                this.n_barHeight  = Math.floor(this.n_ratio * this.barHeight);
                this.w_barHeight  = Math.floor(this.w_ratio * this.barHeight);
                this.c_barHeight  = Math.floor(this.c_ratio * this.barHeight);

                // 그려질 bar 가 최대 Height 넘어가면 낮은 레벨을 우선으로 전체 그리고
                // 움직이는 애니에 obj.Level 로 표현한다.

                var sumHeight = this.n_barHeight;// + this.c_barHeight

                if ( sumHeight > this.barHeight ) {
                    this.n_barHeight = this.barHeight;
                    this.w_barHeight = 0;
                    this.c_barHeight = 0;
                }

                sumHeight += this.w_barHeight;
                if ( sumHeight > this.barHeight ) {
                    if (this.w_cnt > 0) {
                        this.n_barHeight = this.n_barHeight - 3;
                    }
                    this.w_barHeight = this.barHeight - this.n_barHeight;
                    this.c_barHeight = 0;
                } else if (this.w_cnt > 0 && this.w_barHeight < 4) {
                    this.w_barHeight = 3;
                }

                sumHeight += this.c_barHeight;
                if ( sumHeight > this.barHeight ) {
                    this.c_barHeight = this.barHeight - this.n_barHeight - this.w_barHeight;
                }

                // 리사이즈로 가자.
                //this.barHeight = (me.maxBarHeight > 0)? me.maxBarHeight : that.graphAreaHeight - 25
            };

            this._bar_objectClass.prototype.box_hitTest = function(mx, my) {
                var widthMargin = (me.isFitChart === true) ? 5 : 20;
                return ( this.left < mx && mx < this.right - widthMargin &&     // 가로 축 체크
                this.top < my && my < this.bottom - 15 );     // 세로축 체크
            };

            this._bar_objectClass.prototype.wasname_hitTest = function(mx, my) {
                var widthMargin = (me.isFitChart === true) ? 5 : 20;
                return ( this.left < mx && mx < this.right  - widthMargin &&    // 가로 축 체크
                this.bottom - 15 < my && my < this.bottom);
            };
        }
        /* end _bar_objectClass */

        me.nameArr  = [];
        me.idArr    = [];
        me.valueArr = [];
        me.sumValue = [0, 0, 0];
        me.bar_objects = [];
        me.scrollbar_objects = [];
        //me.viewWasList = []
        // 스크롤바 컬러를 추출. 0 // 비활성 1 // 활성
        me.color.SCROLLBAR = [];

        // 바차트에서 표시되는 서버 타입을 지정하며 타입 값이 없는 경우에는 기본값으로 WAS를 지정한다.
        me.serverType = me.serverType || 'WAS';

        var aa = document.querySelectorAll('.page-dot-nav .dot-scroll li a')[0]; // 활성
        me.color.SCROLLBAR.push( window.getComputedStyle(aa,':before').backgroundColor );
        aa = document.querySelectorAll('.page-dot-nav .dot-scroll li a')[1]; // 비활성
        me.color.SCROLLBAR.push( window.getComputedStyle(aa,':before').backgroundColor );
        aa = document.querySelector('.chart-label');
        me.color.BOTTOM_LINE = window.getComputedStyle(aa).borderTopColor.toString();
        aa = null;

        var SCREEN_WIDTH  = target.getWidth();
        var SCREEN_HEIGHT = target.getHeight();

        var context;

        var getMouse;

        me.canvas = null;

        init();

        me.createTooltip();

        me.graph = new BarGraph(context);
        me.graph.margin = 3;
        me.graph.width  = SCREEN_WIDTH - 10;
        me.graph.height = SCREEN_HEIGHT - 10;

        if (me.barStripeImg) {
            me.graph.img = new Image();
            me.graph.img.src = me.barStripeImg;
        }

        me.dataRefreshTimer = setTimeout(function() {
            me.graph.update();
        }, 300);


        function init() {
            var targetEl = target.getEl();
            targetEl.setStyle('background-color', me.color.BASE);

            me.canvas = document.createElement('canvas');
            targetEl.appendChild(me.canvas);

            if (me.canvas && me.canvas.getContext) {
                context = me.canvas.getContext('2d');
                //context.translate(0, 0) // Move the canvas by 0.5px to fix blurring
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
                    //me.graph.update()

                    return false;
                }, false);

                if ( me.isMouseEvent ===  true ) {

                    me.canvas.addEventListener('mousemove', function(e) {
                        e.preventDefault();
                        me.canvas.style.cursor = 'default';

                        var mouse = getMouse(e);
                        var mx = mouse.x;
                        var my = mouse.y;
                        me.selectedId = null;
                        me.isDownBar  = false;

                        var i, icnt, barObj, aObj;
                        var offset, bottom_diff, posY, posX;

                        for (i = 0, icnt =  me.bar_objects.length; i < icnt; ++i ) {
                            barObj = me.bar_objects[ i ];

                            if ( barObj.row !=  me.currentPage ) {
                                continue;
                            }

                            if ( barObj.state == 1 || barObj.state == 2 || barObj.state == 3 ) {
                                if ( me.isGroupView == false || me.isCPUView == true ) {
                                    me.isDownBar = true;
                                    continue;
                                }
                            }

                            // 마우스 체크
                            if ( barObj.wasname_hitTest(mx, my ) ) {

                                if ( me.isCPUView === true ) {

                                    me.barTooltip.find('.wasname').text(barObj.wasname);
                                    me.barTooltip.find('.usage').text(barObj.sum);

                                } else {

                                    me.barTooltip.find('.wasname').text(barObj.wasname);
                                    me.barTooltip.find('.normal').text(barObj.n_cnt);
                                    me.barTooltip.find('.warning').text(barObj.w_cnt);
                                    me.barTooltip.find('.critical').text(barObj.c_cnt);

                                }

                                //툴팁 보여줌.
                                offset = me.canvas.getBoundingClientRect();

                                bottom_diff = (document.body.offsetHeight - (barObj.bottom + offset.top + 108));
                                if ( bottom_diff > 0 ) {
                                    bottom_diff = 0;
                                }

                                posY = barObj.bottom + offset.top + bottom_diff;
                                posX = barObj.left + offset.left;

                                if (posY + 90 > window.innerHeight) {
                                    posY = window.innerHeight - 90;
                                }

                                if (posX + me.barTooltip.width() + 50 > window.innerWidth) {
                                    posX = window.innerWidth - me.barTooltip.width() - 50;
                                }

                                me.barTooltip.css({top: posY, left: posX, display: 'block'});
                                me.selectedId = barObj.id;
                                break;
                            } else {
                                me.barTooltip.css({'display': 'none'});
                            }

                            if ( me.isCPUView === false && barObj.box_hitTest( mx, my ) && !(me.serverType === 'Business')) {
                                // 커서 변경

                                me.canvas.style.cursor = 'pointer';
                                me.selectedId = barObj.id;
                                break;
                            }

                        } // end for

                        // 스크롤바 체크
                        for (i = 1, icnt =  me.scrollbar_objects.length; i < icnt; ++i ) {
                            aObj = me.scrollbar_objects[i];

                            if ( (mx >= aObj[0] && mx <= aObj[2]  ) && (my >= aObj[1] && my <=  aObj[3]) ) {
                                me.canvas.style.cursor = 'pointer';
                                break;
                            }
                        }

                    });

                    me.canvas.addEventListener('mousedown', function(e) {
                        e.preventDefault();

                        var mouse = getMouse(e);
                        var mx = mouse.x;
                        var my = mouse.y;
                        var i, icnt, barObj, aObj;

                        // 박스 체크
                        if ( me.isCPUView === false ) {
                            for (i = 0, icnt =  me.bar_objects.length; i < icnt; ++i ) {
                                barObj = me.bar_objects[ i ];
                                if ( barObj.row !=  me.currentPage ) {
                                    continue;
                                }

                                if (me.isGroupView === false && (barObj.state == 1 || barObj.state == 2 || barObj.state == 3)) {
                                    continue;
                                }

                                if ( barObj.box_hitTest( mx, my ) ) {

                                    if (me.openActiveTxnList != null || me.openActiveTxnCount != null) {

                                        if ( !me.isGroupView  ) {
                                            // 싱글모드
                                            me.selectedId = barObj.id;
                                            me.openActiveTxnList(me.selectedId);
                                            e.stopPropagation();

                                        } else {
                                            //그룹모드
                                            me.selectedId = barObj.id;
                                            me.openActiveTxnCount(me.selectedId);
                                            e.stopPropagation();
                                        }
                                    }
                                    return;
                                }
                            } // end for
                        }

                        // 스크롤바 체크
                        for (i = 1, icnt =  me.scrollbar_objects.length; i < icnt; ++i ) {
                            aObj = me.scrollbar_objects[i];
                            // x,y,w,h
                            if ( (mx >= aObj[0] && mx <= aObj[2] ) && (my >= aObj[1] && my <= aObj[3])  ) {
                                me.currentPage = i;
                                //me.graph.update()
                            }
                            aObj = null;
                        }

                    }, false);

                    me.canvas.addEventListener('mouseleave', function(e) {
                        e.preventDefault();
                        me.barTooltip.css({'display': 'none'});
                    }, false);

                }

                me.canvas.addEventListener('dblclick', function() {
                    if (me.popupTrend !== undefined) {
                        me.popupTrend();
                    }
                });

            }
        }

        function windowResizeHandler() {

            // target 개체가 없는 경우 처리를 하지 않게 예외 조건 추가
            if (!target) {
                return;
            }

            if (!me.isApplyTheme) {
                SCREEN_WIDTH = target.getWidth();
                SCREEN_HEIGHT = target.getHeight();
            }
            me.isApplyTheme = false;

            me.canvas.width = SCREEN_WIDTH - 10;
            me.canvas.height = SCREEN_HEIGHT - 5;

            if (me.graph != null) {
                me.graph.width = SCREEN_WIDTH - 10;
                me.graph.height = SCREEN_HEIGHT;
            }
            /*
             this.bar_objects 를 돌면서 Object의 크기를 재계산해준다.
             몇번째 줄인지도 계산해줘야함.
             */
            const _HEIGHT = SCREEN_HEIGHT - 5;
            const _WIDTH  = SCREEN_WIDTH - 10;
            const _VALUETEXTHEIGHT = 21;

            const FIT_MAX_BAR_HEIGHT = 200;
            const FIT_MAX_BAR_WIDTH  = 150;
            const FIT_MIN_BAR_HEIGHT = 90;
            const FIT_MIN_BAR_WIDTH  = me.minBarWidth || 55;

            // Bar Chart Height
            var _rowHeight = 90;
            var checkHeight = SCREEN_HEIGHT - 10;

            if (me.isFitChart === true) {

                if (me.graph != null) {
                    checkHeight = me.graph.height;
                }

                if (checkHeight > FIT_MAX_BAR_HEIGHT) {
                    _rowHeight = FIT_MAX_BAR_HEIGHT;
                } else {
                    _rowHeight = checkHeight;
                }
            }

            me._rightMargin = (me.isFitChart === true) ? 5 : 20;

            var cellCount = 0,
                rowCount  = 0;

            var isOk, tmpBarWidth, fitRowCount, gapHeight;

            if (me.isFitChart === true) {
                cellCount = me.bar_objects.length;

                isOk = false;
                tmpBarWidth = 0;

                while (!isOk) {
                    tmpBarWidth = Math.floor((_WIDTH - 10 - me._rightMargin) / cellCount) - me._rightMargin;

                    if (tmpBarWidth < FIT_MIN_BAR_WIDTH) {

                        if (cellCount > 2) {
                            cellCount--;
                        } else {
                            isOk = true;
                        }

                    } else {
                        isOk = true;
                    }
                }

                rowCount = Math.max( Math.floor( _HEIGHT / (_rowHeight + 5) ) , 1);

                fitRowCount = Math.ceil(me.bar_objects.length / cellCount);
                gapHeight = 0;

                while (fitRowCount > rowCount) {
                    if (FIT_MIN_BAR_HEIGHT > _rowHeight - gapHeight) {
                        break;
                    }
                    gapHeight += 2;
                    rowCount = Math.max( Math.floor( _HEIGHT / (_rowHeight - gapHeight + 5) ) , 1);
                }
                _rowHeight -= gapHeight;

                if (tmpBarWidth > FIT_MAX_BAR_WIDTH) {
                    me.barWidth = FIT_MAX_BAR_WIDTH;

                } else if (tmpBarWidth < FIT_MIN_BAR_WIDTH) {
                    //_rightMargin = 10
                    me.barWidth = FIT_MIN_BAR_WIDTH;

                } else {
                    //_rightMargin = 15
                    me.barWidth = tmpBarWidth;
                }

            } else {
                // 1 줄에 몇개가 들어갈지 계산한다.
                // (SCREEN_WIDTH - 10 - 15 /*스크롤Width*/  )/  (55 /*obj width*/+5/*margin*/  )
                cellCount = Math.max( Math.floor(  (_WIDTH - 10 - me._rightMargin) / ( me.maxBarWidth  + me._rightMargin ) ) , 1);

                // 몇줄 들어갈지 계산.
                //var rowCount = Math.max( Math.floor(   _HEIGHT /  (_rowHeight+_valueTextHeight)  ) , 1);   //me.maxBarWidth
                rowCount = Math.max( Math.floor(   _HEIGHT /  (_rowHeight + 5)  ) , 1);   //me.maxBarWidth

                me.barWidth = me.maxBarWidth;
            }

            if ( cellCount * rowCount == 0) {
                return setTimeout( windowResizeHandler , 100);
            }

            var pages = 0;
            var i, icnt, obj_idx;
            var arr_obj_pos = [];
            var barObj;
            var ix;

            for (i = 0, icnt = me.bar_objects.length, obj_idx = 0; i < icnt; ++i ) {

                barObj          = me.bar_objects[i];
                barObj.maxValue = me.maxValue;

                // wasList 배열에 값이 있으면 그놈만 체크하고, 없으면 전체 뷰
                barObj.visible = false;

                if (me.viewWasList.length > 0) {
                    if (me.isGroupView && !me.isCPUView) {

                        for (ix = 0; ix < barObj.id.length; ix++ ) {
                            if (me.viewWasList.indexOf(  barObj.id[ix] )  > -1) {
                                barObj.visible = true;
                                break;
                            }
                        }

                    } else {
                        barObj.visible = me.viewWasList.indexOf(  barObj.id.toString() )  > -1;
                    }
                } else {
                    barObj.visible = true;
                }

                // obj_idx 이놈 안쓰고 arr_obj_pos.length 로 대체해도 되지만 그냥 씀.
                if ( barObj.visible ) {
                    barObj.row = Math.ceil( (obj_idx + 1) / (cellCount * rowCount) ); // 1번째 줄부터 시작함.
                    barObj.cell  = obj_idx % cellCount; // 왼쪽 0부터 시작함.
                    barObj.width = me.barWidth;
                    barObj.barHeight = _rowHeight - 51;

                    // 영역 계산한다.
                    if ( obj_idx < cellCount * rowCount ) {
                        // 한 화면 다 그리면
                        barObj.top      = _VALUETEXTHEIGHT + (Math.ceil( (obj_idx + 1) / (cellCount) ) - barObj.row) * (_rowHeight + 10); // 마진 까지 110.

                        if ( me.isGroupView && !me.isCPUView) {
                            barObj.top += 20;
                        }

                        barObj.left   = barObj.cell * ( me.barWidth  + me._rightMargin );
                        barObj.right  = barObj.left + ( me.barWidth  + me._rightMargin );
                        barObj.bottom = barObj.top  + _rowHeight - 10 - (_VALUETEXTHEIGHT - 1);

                        arr_obj_pos[obj_idx] = [barObj.top, barObj.left , barObj.right, barObj.bottom];

                    } else {
                        // 다른 페이지는 이전에 그렸던 페이지의 위치 가져온다.
                        barObj.top   = Math.round(arr_obj_pos[obj_idx % (cellCount * rowCount)][0]);
                        barObj.left   = Math.round(arr_obj_pos[obj_idx % (cellCount * rowCount)][1]);
                        barObj.right  = Math.round(arr_obj_pos[obj_idx % (cellCount * rowCount)][2]);
                        barObj.bottom =  Math.round(arr_obj_pos[obj_idx % (cellCount * rowCount)][3]);
                    }
                    pages = Math.max( barObj.row , pages );

                    barObj = null;
                    // 생성 했으니 인덱스 증가시킴.
                    obj_idx++;

                } else {
                    barObj.row = -1;
                }
            }

            var maxBottom, topMargin;
            var p, pcnt;
            /*아랫 정렬을 위해 페이지 카운트별로 돌고 위치를 저정렬한다.*/
            for ( p = 1 , pcnt = pages + 1; p < pcnt; ++ p ) {
                maxBottom = 0;

                // 페이지의 maxbottom 을 찾는다.
                barObj = null;
                for (i = 0, icnt = me.bar_objects.length; i < icnt; ++i ) {
                    barObj = me.bar_objects[i];

                    if ( barObj.row == p ) {
                        maxBottom = Math.max( barObj.bottom, maxBottom );
                    }
                }
                // 다시 정렬시킨다.
                topMargin = _HEIGHT  - maxBottom - 5;

                barObj = null;
                for (i = 0, icnt = me.bar_objects.length; i < icnt; ++i ) {
                    barObj = me.bar_objects[i];

                    if ( barObj.row == p ) {
                        barObj.top    += topMargin;
                        barObj.bottom += topMargin;
                    }
                }

            }



            /* pages는 +1 해줘야함.  */
            me.totalPage =  pages;
            pages = null;
            /* 끝 */
            if ( me.totalPage < me.currentPage ) {
                me.currentPage = 1;
            }


            setElPos(me.canvas, 0, 10);

            function setElPos(el, bottom, left) {
                el.style.position = 'absolute';
                el.style.bottom = bottom + 'px';
                el.style.left   = left + 'px';
            }
        }


        function BarGraph(ctx) {

            // Private properties and methods
            var that = this;

            // Public properties and methods
            this.width = 300;
            this.height = 150;
            this.margin = 5;
            this.backgroundColor = 'transparent';

            this.largestValue;
            this.graphAreaWidth;
            this.graphAreaHeight;
            this.barWidth;
            this.barHeight;
            this.numOfBars;

            var draw = function() {
                var barObj;

                // 오브젝트를 그린다.
                function object_print( aobj ) {

                    /* was 이름 그리기 */
                    function wasname_print() {
                        ctx.fillStyle = me.color.COLOR_TEXT[3];
                        ctx.font      = 'normal 12px \'Droid Sans\'';
                        ctx.textAlign = 'center';

                        var barLabel = that.fittingString(ctx, aobj.wasname, aobj.width );
                        // 텍스트를 가운데서 그리기
                        ctx.fillText( barLabel, aobj.left + (aobj.width  / 2), aobj.bottom - 4 );
                        barLabel = null;
                    }

                    /*bar 부분 그리기*/
                    function  bar_print() {
                        /*노말, 워닝, 크리티컬 바를 그린다.*/
                        var nBottom = aobj.top + aobj.barHeight;
                        var nTop    = nBottom - aobj.n_barHeight;

                        // 노말을 그려보자~
                        if ( aobj.n_barHeight ) {
                            ctx.fillStyle = me.color.COLOR_BAR[0];
                            ctx.fillRect( aobj.left, nTop, aobj.width, aobj.n_barHeight );
                        }

                        if ( aobj.w_barHeight ) {
                            nBottom = nTop - 1;
                            nTop -=  aobj.w_barHeight;
                            // 워닝을 그려보자~
                            ctx.fillStyle = me.color.COLOR_BAR[1];
                            ctx.fillRect( aobj.left, nTop, aobj.width, aobj.w_barHeight );
                        }

                        if ( aobj.c_barHeight  ) {
                            nBottom = nTop - 1;
                            nTop -=  aobj.c_barHeight;
                            // 크리티컬을 그려보자~
                            ctx.fillStyle = me.color.COLOR_BAR[2];
                            ctx.fillRect( aobj.left, nTop, aobj.width, aobj.c_barHeight );
                        }

                        /* 이퀄라이저 효과 */
                        if (me.isBarStripe === true && me.barStripeImg) {
                            if (!that.ptn) {
                                that.ptn = ctx.createPattern(me.graph.img, 'repeat');
                            }

                            ctx.fillStyle = that.ptn;
                            ctx.fillRect( aobj.left ,nTop - 1,aobj.width, aobj.n_barHeight + aobj.w_barHeight + aobj.c_barHeight - 1);

                        }
                        /* end 이퀄라이저 효과 */

                        /* 끝에 애니메이션 그리기 */
                        aobj.ani_Loop++;

                        var ani_h;
                        if ( aobj.ani_Loop < 4 ) {
                            ani_h = aobj.ani_Loop;

                        } else {
                            ani_h = Math.abs( aobj.ani_Loop - 6 );
                        }
                        aobj.ani_Loop = aobj.ani_Loop % 6;
                        //0~3픽셀 왔다리 갔다리 이동할꺼다.

                        if ( aobj.sum > 0 ) {
                            nTop -= (4 + ani_h );
                        } else {
                            nTop -= (3 + ani_h );
                        }

                        ctx.fillStyle = me.color.COLOR_BAR[ aobj.level ]; // 오브젝트 레벨
                        ctx.fillRect( aobj.left, nTop, aobj.width, 3 );

                        /* 값을 그린다. */
                        // 텍스트 Y축
                        nTop -= 4; // 3필셀 위로
                        ctx.fillStyle = me.color.COLOR_TEXT[3];
                        ctx.font      = 'bold 12px \'Droid Sans\'';
                        ctx.textAlign = 'center';

                        var sumLabel = that.fittingString(ctx, aobj.sum.toString() , aobj.width );
                        // 텍스트를 가운데서 그리기
                        ctx.fillText( sumLabel, aobj.left + ((aobj.width ) / 2), nTop );
                        sumLabel = null;
                        nTop = null;

                    }

                    /*bar 부분에 down 등 상태 그리기*/
                    function bar_etc_print() {
                        /*down등 상태를 그린다.*/

                        var nBottom = aobj.top + aobj.barHeight - 1;
                        var nTop    = nBottom;

                        var sText;
                        if ( aobj.state === 1) {
                            sText = 'DOWN';
                        } else if ( aobj.state === 2) {
                            sText = 'LICENSE';
                        } else if ( aobj.state === 3) {
                            sText = 'DISCONNECT';
                        } else {
                            sText = '';
                        }

                        // 회색 박스를 만들자.
                        ctx.fillStyle = 'gray';

                        ctx.fillRect( barObj.left  , barObj.top - 18/*이퀄라이저 애니높이+텍스트높이*/ ,  barObj.width, aobj.barHeight + 18 );

                        if (aobj.state == 3) {
                            ctx.font = 'bold 11px \'Droid Sans\'';
                        } else {
                            ctx.font = 'bold 13px \'Droid Sans\'';
                        }

                        var sumLabel = that.fittingString(ctx, sText , aobj.barHeight + 10 );
                        // 텍스트를 가운데서 그리기
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'center';

                        ctx.save();
                        if (aobj.state == 1 || aobj.state == 2 || aobj.state == 3) {
                            ctx.rotate(90 * (Math.PI / 180));
                            if (aobj.state == 3) {
                                ctx.font = 'normal 11px \'Droid Sans\'';
                            } else {
                                ctx.font = 'normal 12px \'Droid Sans\'';
                            }

                            ctx.fillText( sumLabel, nTop - (aobj.barHeight / 2) - 7, -(aobj.left + ((aobj.width ) / 2) - 4) );
                        } else {
                            ctx.fillText( sumLabel, aobj.left + ((aobj.width ) / 2) - 2, nTop - (aobj.barHeight / 2));
                        }
                        ctx.restore();

                        sumLabel = null;
                        nTop = null;

                    }

                    function group_bar_etc_print() {
                        /*그룹바용 이상한놈 그리기.*/
                        // 위에 down 이라고 깜빡이 넣어줘야 함.

                        if ( aobj.state === 0) {
                            return;
                        }

                        // 깜빡이게 한다.
                        if ( aobj.ani_Loop > 3 ) {
                            return;
                        }

                        //aobj.ani_Loop++

                        var sText;
                        if ( aobj.state === 1) {
                            sText = 'DOWN';
                        } else if ( aobj.state === 2) {
                            sText = 'LICENSE';
                        } else if ( aobj.state === 3) {
                            sText = 'DISCONNECT';
                        } else {
                            sText = '';
                        }

                        // 회색 박스를 만들자.
                        ctx.fillStyle = 'red';

                        if (me.isFitChart === true) {
                            ctx.fillRect( barObj.left  , barObj.top - 21,  barObj.width, 15 );
                        } else {
                            ctx.fillRect( barObj.left  , barObj.top - 26/*이퀄라이저 애니높이+텍스트높이+ down이 그려질 높이*/ ,  barObj.width, 15 );
                        }

                        ctx.font = 'bold 8px \'Droid Sans\'';
                        var sumLabel = that.fittingString(ctx, sText , aobj.width );
                        // 텍스트를 가운데서 그리기
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'center';

                        if (me.isFitChart === true) {
                            ctx.fillText( sumLabel, aobj.left + ((aobj.width ) / 2) - 2,  barObj.top - 10  );
                        } else {
                            ctx.fillText( sumLabel, aobj.left + ((aobj.width ) / 2) - 2,  barObj.top - 15  );
                        }
                        sumLabel = null;
                    }


                    // 상태 이상 감지 // 와.. concat 겁나 좋네 ㅋㅋ 문자열이랑 배열 집어넣어도 알아서 해주네 ㅋ
                    var arr_wasID = [].concat(aobj.id);
                    aobj.state = 0; // 초기화


                    var isAllDown = true;
                    var isAllDisconnected = true;
                    var serverId;
                    var k, kcnt;

                    if (me.serverType !== 'Business') {
                        for (k = 0, kcnt = arr_wasID.length; k < kcnt; ++k ) {
                            // 그룹에서도 같이 쓰기 땜에 이렇게 함.
                            serverId = arr_wasID[k].toString();

                            if (Comm.Status[me.serverType][ serverId ] === 'Server Down'  ||
                                Comm.Status[me.serverType][ serverId ] === 'TP Down'      ||
                                Comm.Status[me.serverType][ serverId ] === 'Server Hang') {

                                // down
                                aobj.state = Math.max(aobj.state, 1 );

                                isAllDisconnected = false;

                            // 조건절 하나로 체크를 하는 경우 상태 체크가 잘못되는 경우가 있어 먼저 서버의 상태를 체크하고
                            // Disconnectd 상태인 경우에만 해당 서버가 포함되는 그룹의 상태를 체크한다.
                            } else if (Comm.Status[me.serverType][serverId] === 'Disconnected') {

                                // 그룹 상태가 서버 다운이 아닌 경우에만 상태값을 업데이트한다.
                                if (aobj.state !== 1) {
                                    // Disconnect 상태로 업데이트
                                    aobj.state = Math.max(aobj.state , 3);
                                }

                            } else if (realtime.expiredServer.indexOf(aobj.id) != -1) {
                                // 라이센스
                                aobj.state = Math.max(aobj.state , 2);

                                isAllDisconnected = false;

                            } else {
                                // 정상
                                aobj.state = Math.max(aobj.state ,0 );
                                isAllDown = false;
                                isAllDisconnected = false;
                            }
                            serverId = null;
                        }
                    }

                    var tmpState;

                    if ( me.isGroupView && isAllDown) {
                        // 전체 다운이면 값을 0으로 바꾸고 state 조정함.
                        // 그룹에서 한개만 다운되면 값이 들어와서 갱신이 되는데 모두 다운이면 수치가 갱신이 안됨.
                        tmpState =  aobj.state;
                        aobj.setValues(0, 0, 0);
                        aobj.state = tmpState;
                    }

                    // 그룹 뷰이면서 OS CPU 화면인 경우 호스트에 포함된 모든 서버가 Down이거나 Disconnected
                    // 인 경우 회색 바로 알람을 표시하게 처리한다.
                    // CPU가 아닌 그룹 뷰인 경우에는 바 상단에 붉은색으로 Down, Disconnected를 표시한다.
                    if (me.isGroupView && me.isCPUView) {
                        if (!isAllDown && !isAllDisconnected) {
                            aobj.state = 0;
                        }
                    }

                    // 바차트의 하단에 보여지는 차트 이름(서버명, 그룹명 등) 그리기
                    wasname_print();

                    // 그룹뷰이면서 CPU 뷰인 경우 (OS CPU View)
                    if ( (me.isGroupView && me.isCPUView) || !me.isGroupView) {

                        if ( aobj.state == 0 ) {
                            // 상태가 정상적인 바차트 그리기
                            bar_print();

                        } else {
                            // 상태 문제가 있는 바차트 그리기
                            bar_etc_print();
                        }

                        // 그룹뷰이면서 CPU 뷰가 아닌 경우
                    } else if ( me.isGroupView && !me.isCPUView) {
                        // 정상 바차트 그리기
                        bar_print();

                        // 차트 위에 알람 표시 그리기
                        group_bar_etc_print();
                    }

                } // object_print

                if (me.resize) {
                    me.resize = false;
                    windowResizeHandler();
                }
                // 청소
                ctx.clearRect(-100, -100, that.width + 100, that.height + 100);


                /* 전체 돌면서 currentPage 것만 찾아서 그린다. */
                var line_y = 0, line_x = 0, line_start_x = 1000;
                var i, icnt;
                const _underMargin = 0;
                /*가장 밑으로 이동하기 위한 변수.*/


                for ( i = 0, icnt =  me.bar_objects.length; i < icnt; ++i ) {
                    barObj = me.bar_objects[ i ];

                    if (  barObj.row !=  me.currentPage ) {
                        continue;
                    }

                    // barObj.cell  몇번째 셀인지
                    // 검정 배경 깔기 ## 개발용
                    //ctx.fillStyle = 'black'
                    //ctx.fillRect( barObj.left  , barObj.top ,  barObj.width, barObj.bottom-barObj.top )
                    // end 검정배경
                    object_print( barObj );

                    // 하단에 회색 선 쭉~ 그린다.
                    if ( line_y === 0 ) {
                        // 초기에는 Y값을 그냥 넣어준다.
                        line_y = barObj.top + barObj.barHeight + _underMargin;
                        line_start_x = barObj.left;
                        line_x = barObj.right;

                    } else {
                        // X 적립
                        line_x = Math.max( line_x , barObj.right );

                        if ( line_y  !== barObj.top + barObj.barHeight + _underMargin ) {
                            // 그리자. 여러줄일경우
                            ctx.fillStyle = me.color.BOTTOM_LINE;
                            ctx.fillRect( line_start_x, line_y ,  line_start_x + line_x - me._rightMargin, 1);

                            line_y = barObj.top + barObj.barHeight + _underMargin;
                            line_start_x = barObj.left; // X축 초기화
                            line_x = barObj.right;
                        }
                    }
                    barObj = null;

                }

                //마지막줄 그림자를 그린다.
                {
                    ctx.fillStyle = me.color.BOTTOM_LINE;
                    ctx.fillRect( line_start_x, line_y ,  line_start_x + line_x - me._rightMargin, 1);

                }
                // 그림자 끝
                line_y = null;
                line_start_x = null;
                line_x = null;

                /* 스크롤바 그린다. */
                var tmp = null;
                var ix, x = 0, y = 0, w = 0;

                while ( me.scrollbar_objects.length > 0 ) {
                    tmp = me.scrollbar_objects.pop();
                    tmp.length = 0;
                    tmp = null;
                }
                me.scrollbar_objects.length = 0;

                me.scrollbar_objects = [ [0,0,0,0] ]; // 0페이지는 안쓰니까 그냥 넣어둠.

                if (me.totalPage > 1) {
                    for (ix = 1; ix <= me.totalPage; ix++) {
                        ctx.beginPath();
                        x = that.width - 10;
                        y = that.height / 2 - (me.totalPage * 8) + (ix * 15);
                        w = 10;
                        ctx.arc(x, y, w / 2, 0, 2 * Math.PI, false);

                        me.scrollbar_objects.push( [x - 5, y - 5, x + 2, y + 5 ] );

                        if (ix == me.currentPage) {
                            ctx.fillStyle = me.color.SCROLLBAR[0]; // 현재 페이지
                        } else {
                            ctx.fillStyle = me.color.SCROLLBAR[1];
                        }
                        ctx.fill();
                        ctx.closePath();
                    }
                }
                // end 스크롤바

            }; // end draw function

            var cache_fittingString = {};

            this.fittingString = function(c, str, maxWidth) {
                var width, ellipsis, ellipsisWidth, len;

                if ( cache_fittingString['_' + maxWidth + str] ) {
                    return cache_fittingString['_' + maxWidth + str];

                } else {
                    width = c.measureText(str).width;
                    ellipsis = '..';
                    ellipsisWidth = c.measureText(ellipsis).width;

                    if (width <= maxWidth || width <= ellipsisWidth) {
                        cache_fittingString['_' + maxWidth + str] = str;
                        return str;

                    } else {
                        len = str.length;

                        while (width >= maxWidth - ellipsisWidth && len-- > 0) {
                            str = str.substring(0, len);
                            width = c.measureText(str).width;
                        }
                        cache_fittingString['_' + maxWidth + str] = str + ellipsis;

                        return str + ellipsis;
                    }
                }
            };

            this.update = function() {
                var i;

                if ( me.dataRefreshTimer === -1) {
                    return;
                }
                me.dataRefreshTimer = -1;

                if (me.devMode) {
                    for (i = 0; i < me.valueArr.length; i += 1) {
                        me.valueArr[i] = [Math.floor(Math.random() * 20), Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)];
                    }
                }

                if (me.totalMode) {
                    totalDraw();
                } else {
                    draw();
                }

                me.dataRefreshTimer = setTimeout(function() {
                    this.graph.update();
                }.bind(me), 300);

            };
        }

        getMouse = function(e) {
            var rect = me.canvas.getBoundingClientRect(), // abs. size of element
                scaleX = me.canvas.width / rect.width,    // relationship bitmap vs. element for X
                scaleY = me.canvas.height / rect.height;  // relationship bitmap vs. element for Y

            return {
                x: (e.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
                y: (e.clientY - rect.top) * scaleY     // been adjusted to be relative to element
            };
        };

    },

    setChartLabels: function(idArr, nameArr) {
        var ix;

        this.idArr    = [];
        this.nameArr  = [];
        this.valueArr = [];
        this.sumValue = [0, 0, 0];
        this.bar_objects = [];
        this.scrollbar_objects = [];

        for ( ix = 0; ix < idArr.length; ix++) {
            this.idArr[this.idArr.length]       = idArr[ix];
            this.nameArr[this.nameArr.length]   = nameArr[ix];
            this.valueArr[this.valueArr.length] = [0,0,0];

            this.bar_objects.push( new this._bar_objectClass( idArr[ix], nameArr[ix] ) );
        }

        this.resize = true;

        idArr   = null;
        nameArr = null;
    },


    /**
     * Create Bar Chart Tooltip
     */
    createTooltip: function() {
        var me = this;
        var updateStr;

        this.barTooltip = $('<div class="stackbar-chart-tooltip tooltipPanel"></div>').css({
            'position': 'absolute',
            'display' : 'none',
            'z-index' : 20000,
            'color'   : '#000',
            'background-color': '#fff',
            'padding' : '0px 0px 0px 0px',
            'border'  : '1px solid #D8D8D8',
            'border-radius': '4px'
        });

        if (me.isGroupView === true) {
            this.barTooltip.css({ 'min-width':'120px' });
        }

        updateStr =
            '<span style ="display: block;" class="toolTip">' +
            '<div style="padding: 10px; height: 10px;">' +
            '  <span class="wasname" style= "float:left ; color: #000000;font-size: 14px;"></span>';

        //  그룹뷰는 덤프다운 안보인다.
        if (me.isGroupView === false) {
            // Thread dump를 실행하는 함수가 정의되어 있으면 툴팁에 버튼 표시
            if (me.executeThreadDump) {
                updateStr += ' <span class="button-threaddump">' + common.Util.TR('Thread Dump') + '</span>';
            } else {
                updateStr += ' <span style="padding:10px;margin: 0px 20px 0px 20px"></span>';
            }
        }

        // 스크립트 실행이 기능이 활성화된 경우만 버튼을 표시
        if (me.isScriptBtn) {
            // 스크립트 버튼을 처리하는 함수가 정의되어 있으면 툴팁에 버튼 표시
            if (me.executeScript) {
                updateStr += ' <span class="button-runscript">' + common.Util.TR('Execute Script') + '</span>';
            } else {
                updateStr += ' <span style="padding:10px;margin: 0px 20px 0px 20px"></span>';
            }
        }

        if (me.isCPUView === true) {
            updateStr +=
                '</div>' +
                '<div style="height: 1px; background: #aaaaaa; margin: 5px 10px 5px 10px;"></div>' +
                '<div style ="display: block;height: 30px; margin: 0px 5px 0px 0px;" ;>';

            // Usage
            updateStr +=
                '<div style="float: left;width: 60%;margin-left: 9px;">' +
                '<div style="color:#42A5F6;margin-bottom: 4px;font-size: 14px;">' + common.Util.TR('Usage(%)') + '</div>' +
                '</div>' +
                '<div style="margin-left: 4px;">' +
                '<div class="usage" style="margin-bottom: 4px;font-size: 14px;"></div>' +
                '</div>';
        } else {
            updateStr +=
                '</div>' +
                '<div style="height: 1px; background: #aaaaaa; margin: 5px 10px 5px 10px;"></div>' +
                '<div style ="display: block;height: 65px; margin: 0px 5px 0px 0px;" ;>';

            // Normal
            updateStr +=
                '<div style="float: left;width: 60%;margin-left: 9px;">' +
                '<div style="color:#42A5F6;margin-bottom: 4px;font-size: 14px;">' + common.Util.TR('Normal') + '</div>' +
                '</div>' +
                '<div style="margin-left: 4px;">' +
                '<div class="normal" style="margin-bottom: 4px;font-size: 14px;"></div>' +
                '</div>';
            // Warning
            updateStr +=
                '<div style="float: left;width: 60%;margin-left: 9px;">' +
                '<div style="color:#FF9803;margin-bottom: 4px;font-size: 14px;">' + common.Util.TR('Warning') + '</div>' +
                '</div>' +
                '<div style="margin-left: 4px;">' +
                '<div class="warning" style="margin-bottom: 4px;font-size: 14px;"></div>' +
                '</div>';
            // Critical
            updateStr +=
                '<div style="float: left;width: 60%;margin-left: 9px;">' +
                '<div style="color:#D7000F;margin-bottom: 4px;font-size: 14px;">' + common.Util.TR('Critical') + '</div>' +
                '</div>' +
                '<div style="margin-left: 4px;">' +
                '<div class="critical" style="margin-bottom: 4px;font-size: 14px;"></div>' +
                '</div>';
        }

        updateStr +=  '</div></span>';

        this.barTooltip.append(updateStr);
        $('body').append(this.barTooltip);

        this.barTooltip.bind('mouseenter', function(e) {
            e.preventDefault();
            me.barTooltip.css({'display': 'block'});
        });

        this.barTooltip.bind('mouseleave', function(e) {
            e.preventDefault();
            me.barTooltip.css({'display': 'none'});
        });

        this.barTooltip.find('.wasname').bind('click', function(e) {
            e.preventDefault();

            if (me.openActiveTxnList != null) {
                me.openActiveTxnList(me.selectedId);

            } else if (me.openActiveTxnCount != null) {
                me.openActiveTxnCount(me.selectedId);
            }
        });

        this.barTooltip.find('.button-threaddump').bind('click', function(e) {
            e.preventDefault();

            if (me.executeThreadDump != null) {
                me.executeThreadDump(me.selectedId);
            }
        });

        this.barTooltip.find('.button-runscript').bind('click', function(e) {
            e.preventDefault();

            if (me.executeScript != null) {
                me.executeScript(me.selectedId);
            }
        });
    },

    /**
     * Start Bar Chart Draw
     */
    startAnimationFrame: function() {
        if (this.dataRefreshTimer != null && this.dataRefreshTimer !== -1) {
            clearTimeout(this.dataRefreshTimer);
            this.dataRefreshTimer = -1;
        }

        this.dataRefreshTimer = setTimeout(function() {
            this.graph.update();
        }.bind(this), 300);
    },

    /**
     * Stop Bar Chart Draw
     */
    stopAnimationFrame: function() {
        clearTimeout(this.dataRefreshTimer);
        this.dataRefreshTimer = -1;
    }

});