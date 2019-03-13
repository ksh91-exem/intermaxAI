Ext.define('Exem.chart.BulletS', {
    extend: 'Ext.Component',
    resize: false,
    isInitResize: true,
    devMode: false,
    isApplyTheme: false,
    isPushed: false,

    localWasList : null,
    localWasData : [],
    dataCheckCount: 0,

    color: {
        BASE              : 'rgba(255,255,255,',
        COLOR_INNER       : ['rgba(20,196,193,0.4)',  'rgba(240,221,50,0.4)', 'rgba(187,51,51,0.4)'],
        COLOR_OUTER       : ['rgba(20,196,193,0.7)',  'rgba(240,221,50,0.7)', 'rgba(187,51,51,0.7)'],
        COLOR_FADE        : ['rgba(20,196,193,',      'rgba(240,221,50,',     'rgba(187,51,51,'    ],
        COLOR_TRAIL       : ['rgba(20,196,193,.65)',  'rgba(240,221,50,.65)', 'rgba(187,51,51,.65)'],
        COLOR_TEXT        : ['green',                 'gold',                 'red',               'dimgrey'],
        COLOR_LINE        : 'rgba(222,228,229,'
    },

    listeners: {
        resize: function() {
            if (this.isInitResize) {
                this.init(this.up());
                this.isInitResize = false;
            }
            else {
                this.resize = true;
            }
        },

        beforedestroy: function() {
            Ext.Array.remove(Comm.onActivityTarget, this);
            clearInterval(this.dataRefreshTimer);

            cancelAnimationFrame(this.animationFrame);
        }
    },

    pushData: function(header, data) {
        if (header.datatype !== undefined && header.datatype !== 1) {
            return;
        }
        var me = this;

        me.dataCheckCount = 0;

        var v;
        var normal = 0;
        var warning = 0;
        var critical = 0;

        var i, icnt;

        // 임시로 넣어둠. 미래 사용할 수 있음.
        if (!this.localWasList) {
            if (!this.localWasData) {
                this.localWasData = [];
            }
            this.localWasList = JSON.parse(JSON.stringify(me.selectedWasArr));
            for (i = 0, icnt = this.localWasList.length ; i < icnt ; i ++ ) {
                this.localWasData.push({start:0,end:0,normal:0,warning:0,critical:0});
            }
        }
        var dupCheckList = {};

        // 초기화 함. 한 게더에서 패킷은 한꺼번에 들어온다는 전제가 있음.
        var val = {
            liveActive1: 0,
            liveActive2: 0,
            liveActive3: 0,
            liveThroughput1: 0,
            liveThroughput2: 0
        };

        var wasIdx;
        for (var ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            v = data.rows[ix];

            wasIdx = me.selectedWasArr.indexOf(v[3]);

            if (wasIdx > -1) {



                if (!this.localWasData[wasIdx] || !this.localWasData[wasIdx].start) {
                  this.localWasData[wasIdx] = {start:0,end:0,normal:0,warning:0,critical:0};
                }
                this.localWasData[wasIdx].start = v[1];
                this.localWasData[wasIdx].end = (v.length === 14)? v[2].length : v[14];

                // 패킷중 ff(255) 값은 0 처리
                if (v[6] == 255) {
                    v[6] = 0;
                }

                normal   = v[6]  + v[7]  + v[8];
                warning  = v[9]  + v[10] + v[11];
                critical = v[12] + v[13];

                this.localWasData[wasIdx].normal = normal;
                this.localWasData[wasIdx].warning = warning;
                this.localWasData[wasIdx].critical = critical;

                dupCheckList['a' + v[3]] = [
                    v[1],
                    0 ,
                    (v.length === 14)? v[2].length : v[14],
                    v[6]  + v[7]  + v[8],
                    v[9]  + v[10] + v[11],
                    v[12] + v[13]
                ];
            }
        }// end for

        for (i = 0, icnt = me.selectedWasArr.length; i< icnt ; i ++) {
            var tmp = dupCheckList['a' + me.selectedWasArr[i]];
            if ( !tmp ) {
                continue;
            }
            val.liveThroughput1 += tmp[0];
            val.liveThroughput2 += tmp[2];
            val.liveActive1     += tmp[3];
            val.liveActive2     += tmp[4];
            val.liveActive3     += tmp[5];
        }

        me.liveThroughput[0] = val.liveThroughput1;
        me.liveThroughput[1] = val.liveThroughput2;
        me.liveActive[0]     = val.liveActive1;
        me.liveActive[1]     = val.liveActive2;
        me.liveActive[2]     = val.liveActive3;

        val = null;
        v   = null;
        dupCheckList = null;
    },

    setSelectedWas: function(wasArr) {

        var me = this;

        me.selectedWasArr = [].concat(wasArr);

    },

    init: function(target) {
        this.target = target;
        var me = this;

        me.activeCount = [0,0,0];
        me.throughputCount = [0,0];
        me.liveActive = [0,0,0];
        me.liveThroughput = [0,0];
        me.selectedWasArr = [];

        const _FIELD_ACT_WIDTH_CHANGE_STATE_EQUAL    = 'equal';
        const _FIELD_ACT_WIDTH_CHANGE_STATE_WIDER    = 'wider';
        const _FIELD_ACT_WIDTH_CHANGE_STATE_NARROWER = 'narrower';

        const _OVERLOAD_ALERT_CENTER_MOVE_DIRECTION_STATE_DOWN = 'down';
        const _OVERLOAD_ALERT_CENTER_MOVE_DIRECTION_STATE_UP   = 'up';

        Comm.onActivityTarget.push(this);

        var OVERLOAD_REPEAT = 0;
        var OVERLOAD_REPEAT_LIMIT = 3;
        var CRITICAL_OVERROAD_CRITERIA = 100;
        var OVERLOAD_ALERT_CENTER_HEIGHT = 0.1;
        var OVERLOAD_ALERT_CENTER_MOVE_DIRECTION = _OVERLOAD_ALERT_CENTER_MOVE_DIRECTION_STATE_DOWN;

        var SCREEN_WIDTH = target.getWidth();
        var SCREEN_HEIGHT = 100;

        var FIELD_ACT_WIDTH = Math.floor((SCREEN_WIDTH-60)*0.3);
        var FIELD_ACT_WIDTH_TARGET = FIELD_ACT_WIDTH;
        var FIELD_ACT_WIDTH_CHANGE = _FIELD_ACT_WIDTH_CHANGE_STATE_EQUAL;

        var FIELD_WIDTH = SCREEN_WIDTH * 0.5;
        var CANVAS_ACT_LEFT = SCREEN_WIDTH/2 - FIELD_ACT_WIDTH/2;
        var RES_LEFT = CANVAS_ACT_LEFT + FIELD_ACT_WIDTH - 2;
        var WINDS = [0, 0, 0];

        var QUANTITY = 150, QUANTITY_ACT = 150;
        var REALEASE_TO_RESPONSE_FROM_ACTIVE = [0,0,0];

        var ACTIVE_COUNT_SCALE = 1;
        var ACTIVE_COUNT_MAX = 80;
        var ACTIVE_SCALE_DIFF_REPEAT = 0;

        var canvas, canvasAct, canvasText, coverCanvasLeft, coverCanvasRight,
            context, contextAct, contextText, coverContextLeft, coverContextRight;

        var norm = 0, warn = 0, crit = 0, req = 0, res = 0, activeTotalCnt = 0;
        var normColorTexts = [], valueTexts = {},
            reqMsgDiv, resMsgDiv, activeCritMsgDiv, activeWarnMsgDiv, activeNormMsgDiv;

        var beforeReq, beforeRes, beforeActiveCri, beforeActiveWarn, beforeActiveNorm;

        var TRIGGER = false;

        var clearScreen = false;

        var PoolIn = {
            __pools: [],

            add: function( v ) {

                this.__pools.push( v );
            },

            tps: 0,
            left: 0,
            delay: 0
        };

        var PoolOut = {
            __pools: [],

            add: function( v ) {

                this.__pools.push( v );
            },

            tps: 0,
            left: RES_LEFT,
            delay: 600
        };

        var Pools = [PoolIn, PoolOut];

        var PoolAct = {
            __pools: [],

            add: function( v ) {
                this.__pools.push( v );
            }
        };

        /*이미지*/
        var _moveBullet_0 = new Image();
        _moveBullet_0.src="../images/bullet/SpeedSQ_Blue.png";
        var _moveBullet_1 = new Image();
        _moveBullet_1.src="../images/bullet/SpeedSQ_Yellow.png";
        var _moveBullet_2 = new Image();
        _moveBullet_2.src="../images/bullet/SpeedSQ_Red.png";

        var _BlueBullet_100 = new Image();
        _BlueBullet_100.src="../images/bullet/nBlue.png";
        var _BlueBullet_005 = new Image();
        _BlueBullet_005.src="../images/bullet/nBlue_01.png";
        var _BlueBullet_010 = new Image();
        _BlueBullet_010.src="../images/bullet/nBlue_02.png";
        var _BlueBullet_020 = new Image();
        _BlueBullet_020.src="../images/bullet/nBlue_03.png";
        var _BlueBullet_030 = new Image();
        _BlueBullet_030.src="../images/bullet/nBlue_04.png";
        var _BlueBullet_040 = new Image();
        _BlueBullet_040.src="../images/bullet/nBlue_05.png";

        var _YellowBullet_100 = new Image();
        _YellowBullet_100.src="../images/bullet/nYellow.png";
        var _YellowBullet_005 = new Image();
        _YellowBullet_005.src="../images/bullet/nYellow_01.png";
        var _YellowBullet_010 = new Image();
        _YellowBullet_010.src="../images/bullet/nYellow_02.png";
        var _YellowBullet_020 = new Image();
        _YellowBullet_020.src="../images/bullet/nYellow_03.png";
        var _YellowBullet_030 = new Image();
        _YellowBullet_030.src="../images/bullet/nYellow_04.png";
        var _YellowBullet_040 = new Image();
        _YellowBullet_040.src="../images/bullet/nYellow_05.png";

        var _RedBullet_100 = new Image();
        _RedBullet_100.src="../images/bullet/nRed.png";
        var _RedBullet_005 = new Image();
        _RedBullet_005.src="../images/bullet/nRed_01.png";
        var _RedBullet_010 = new Image();
        _RedBullet_010.src="../images/bullet/nRed_02.png";
        var _RedBullet_020 = new Image();
        _RedBullet_020.src="../images/bullet/nRed_03.png";
        var _RedBullet_030 = new Image();
        _RedBullet_030.src="../images/bullet/nRed_04.png";
        var _RedBullet_040 = new Image();
        _RedBullet_040.src="../images/bullet/nRed_05.png";

        var _moveBullets = [ _moveBullet_0, _moveBullet_1,  _moveBullet_2 ];
        var _Bullets = [  /*0 노말*/
                                [  _BlueBullet_005
                                    , _BlueBullet_010
                                    , _BlueBullet_020
                                    , _BlueBullet_030
                                    , _BlueBullet_040
                                    , _BlueBullet_100
                                ],
                                /*1 워닝*/
                                [
                                    _YellowBullet_005
                                    ,_YellowBullet_010
                                    ,_YellowBullet_020
                                    ,_YellowBullet_030
                                    ,_YellowBullet_040
                                    ,_YellowBullet_100
                                ],
                                /*2크리티컬*/
                                [
                                    _RedBullet_005
                                    ,_RedBullet_010
                                    ,_RedBullet_020
                                    ,_RedBullet_030
                                    ,_RedBullet_040
                                    ,_RedBullet_100
                                ]
                            ];



        init();

        function init() {
            var targetEl = target.getEl();
            targetEl.setStyle('background-color', me.color.BASE+'1)');
            var docFragment = document.createDocumentFragment();
            canvas = document.createElement('canvas');
            docFragment.appendChild(canvas);

            coverCanvasLeft = document.createElement('canvas');
            docFragment.appendChild(coverCanvasLeft);

            coverCanvasRight = document.createElement('canvas');
            docFragment.appendChild(coverCanvasRight);

            canvasAct = document.createElement('canvas');
            canvasAct.width = 3000;
            canvasAct.height = 97;
            docFragment.appendChild(canvasAct);

            canvasText = document.createElement('canvas');
            docFragment.appendChild(canvasText );

            reqMsgDiv         = appendTextDiv(common.Util.TR('Request/sec'), 14, 'position:absolute;top:-11px;left:-104px;text-align:right;width:100px;font-size:26px;font-family:Droid Sans;color:' + me.color.COLOR_TEXT[3] +';', 'req');
            resMsgDiv         = appendTextDiv(common.Util.TR('Response/sec'), 14, 'position:absolute;top:-11px;right:-105px;text-align:left;width:100px;font-size:26px;font-family:Droid Sans;color:' + me.color.COLOR_TEXT[3] +';', 'res');

            activeCritMsgDiv  = appendTextDiv(common.Util.TR('Critical'), 13, 'position:absolute;top:-5px;left:-104px;text-align:right;width:100px;font-size:19px;font-family:Droid Sans;color:' + me.color.COLOR_TEXT[2] +';', 'cri');
            activeWarnMsgDiv  = appendTextDiv(common.Util.TR('Warning'), 13, 'position:absolute;top:-5px;left:-104px;text-align:right;width:100px;font-size:19px;font-family:Droid Sans;color:' + me.color.COLOR_TEXT[1] +';', 'war');
            activeNormMsgDiv  = appendTextDiv(common.Util.TR('Normal'), 13, 'position:absolute;top:-5px;left:-104px;text-align:right;width:100px;font-size:19px;font-family:Droid Sans;color:' + me.color.COLOR_TEXT[0] +';', 'nor');


            function appendTextDiv(text, fontSize, style, name) {
                var wrap  = document.createElement('div');
                var label = document.createElement('span');
                var value = document.createElement('span');

                label.style.fontSize = fontSize+'px';
                label.style.cursor = 'default';
                label.textContent = text;

                value.setAttribute('style',style);

                docFragment.appendChild(wrap);

                normColorTexts.push(label);
                valueTexts[name] = value;
                wrap.appendChild(value);
                wrap.appendChild(label);

                return wrap;
            }

            targetEl.appendChild(docFragment);

            if (canvas && canvas.getContext) {
                context = canvas.getContext('2d');
                contextText = canvasText.getContext('2d');
                contextAct = canvasAct.getContext('2d');

                createParticles();

                windowResizeHandler();

                loop();

                setTimeout( windowResizeHandler, 1000 );

                me.dataRefreshTimer = setInterval(function() {
                    me.dataCheckCount++;
                    if (me.dataCheckCount === 3) {
                        me.dataCheckCount = 0;
                        me.liveThroughput = [0, 0];
                        me.liveActive     = [0, 0, 0];
                    }
                    me.throughputCount = [me.liveThroughput[0], me.liveThroughput[1]];
                    me.activeCount     = [me.liveActive[0], me.liveActive[1], me.liveActive[2]];
                    TRIGGER = true;
                }, 1000);
            }
        }

        /*애니타이머 코드 시작*/

            /* 애니 타이머 오브젝트의 상태.
                    1 - 객체 들어가 있고 대기중..
                    2 - 진행중.
                    3 - 완료.
                    4 - 객체만 create 된 상태.

            */
        const _ani_state_delay       = 1;
        const _ani_state_running  = 2;
        const _ani_state_end             =3;
        const _ani_state_undefined   = 4;


        function timestamp() {
              return Date.now();
        }

        var aniObject = function( object, /*callback,*/ delay ) {

            this.addTime = timestamp();
            this.checkTime = 0;
            this.obj = object, /*this.callback = callback,*/ this.delay = delay;
            /*
                    1 - 객체 들어가 있고 대기중..
                    2 - 진행중.
                    3 - 완료.
                    4 - 객체만 create 된 상태.
            */

            this.state = _ani_state_undefined;
            return this;
        } ;

        var _ani_Now, last_aniTime;
        /* prototype */

        {
            aniObject.prototype.play = function()
            {
                // 타이머가 동작할 시간이면?
                if(  this.state !==  _ani_state_delay || _ani_Now < ( this.addTime + this.delay  ) ) {

                        return;

                }/*else if( this.callback == undefined && this.callback == null  )
                {
                    // 실행할 펑션이 없으면 나감.
                    return;
                }*/

                this.state = _ani_state_running;
                // 애니메이션 Object의 액션을 직접 코딩함.
                this.obj .floating=true;
                /*this.callback.bind( this.obj  )();*/
                this.state = _ani_state_end;
                this.destory();
            };

            aniObject.prototype.setAni = function( object, /*callback,*/ delay )
            {
                this.addTime = timestamp();
                this.obj = object, /* this.callback = callback,*/ this.delay = delay;
                this.state = _ani_state_delay;
                object=  null;

                delay=null;

            };

            /*
            this.aniPlay = function()
            {
                // 시간을 체크한다.

            }
            */

            aniObject.prototype.destory = function()
            {
                this.addTime= null;
                this.obj = null/*, this.callback = null*/;
                this.state = _ani_state_undefined;
                //delete this.obj;
                //delete this.calback;
            };

        }

        /* end prototype */

        /* prototype */
        // 500 개 미리 만들어놈. 케파 변경되면 일렬로 블럭 이동됨. . 원형 큐
        var aniList = [];
        aniList.length = (QUANTITY + QUANTITY_ACT );

        for( var i =0, cnt = aniList.length; i < cnt ; ++i )
            aniList[i] = new aniObject(null,null,null);

        var _addlist_Add_lastIndex = 0;
        var aniList_Add = function( object, /*callback, */ delay  ) {

            /* 애니 타이머 오브젝트의 상태.
                1 - 객체 들어가 있고 대기중..
                2 - 진행중.
                3 - 완료.
                4 - 객체만 create 된 상태.
            */


            // 타이머에 아무것도 없으면?
            if( aniList[ _addlist_Add_lastIndex ].state === _ani_state_undefined )
            {
                aniList[ _addlist_Add_lastIndex ].setAni( object, /*callback,*/ delay  );

                // 다음 Index 잡아준다.
                if( _addlist_Add_lastIndex < aniList.length-1 )
                    _addlist_Add_lastIndex ++;
                else
                    _addlist_Add_lastIndex = 0;
            }
            object = null;

            delay = null;

        };

        // 애니타이머용 Global 변수.
        _ani_Now = timestamp(), last_aniTime = timestamp();

        /* 애니타이머 */
        var _aniTimer_onEvent_running = false;
        var self = this;
        var aniTimer_onEvent = function() {
            if (self.stopped) {
                return;
            }

            if ( _aniTimer_onEvent_running === true ) {
                // 중복으로 돌고 있으면 나감.
                self.animationFrame = requestAnimationFrame( aniTimer_onEvent );
                return ;
            }
            _aniTimer_onEvent_running = true;

            // 시간 업데이트
            _ani_Now = timestamp();
            /* loop 화면 갱신 */
            if( ( _ani_Now - last_aniTime ) > (1000/20) /*ms*/ )
            {

                for( var i =0, cnt = aniList.length; i < cnt ; ++i ) {
                    if ( aniList[i].state === _ani_state_delay ) {
                        aniList[i].play();
                    }
                }

                last_aniTime =  _ani_Now;
                if (me.resize) {
                    windowResizeHandler();
                    me.resize = false;
                }

                // GC 힌트 주려고 일부러 줌. 검증되지 않음.
                setTimeout( function(){ loop(); },10);
            }

            _aniTimer_onEvent_running = false;

            // 그냥 적당히 텀을 둠. requestAnimationFrame 만 쓰면 거의 1ms Loop됨. GC 유도. 검증되지 않음.
            self.animationFrame = requestAnimationFrame(function() {
                setTimeout(aniTimer_onEvent ,30);
            });
        }; // end 애니타이머


        this.aniTimer_onEvent = aniTimer_onEvent;
        this.startAnimationFrame();

        /* end 애니타이머 코드 끝 */
        function getMoveBullet( alevel  )
        {
            try
            {
                return _moveBullets[ alevel ];
            }
            finally
            {
                alevel = null;
            }

        }
        function getBullet( alevel, aalpha )
        {
            try
            {
                return _Bullets[ alevel ][  aalpha ];
            } finally
            {
                aalpha = null;
                alevel= null;
            }
        }

        function createParticles() {
            var i;

            for (i = 0; i < QUANTITY; i++) {

                PoolIn.add( {
                    position: { x: 30, y:  Math.trunc(SCREEN_HEIGHT/2+10)},
                    togo: { x: SCREEN_WIDTH, y: Math.trunc(SCREEN_HEIGHT/2+10) },
                    toLimit: FIELD_WIDTH,
                    size: 12,
                    speed: 0.007,
                    floating: false,
                    level: 0
                } );

                PoolOut.add( {
                    position: { x: RES_LEFT, y: Math.trunc(SCREEN_HEIGHT/2+10) },
                    togo: { x: SCREEN_WIDTH+RES_LEFT, y: Math.trunc(SCREEN_HEIGHT/2+10) },
                    toLimit: SCREEN_WIDTH,
                    size: 12,
                    speed: 0.007,
                    floating: false,
                    level: 0
                });

            }


            for (i = 0; i < QUANTITY_ACT; i++) {

                PoolAct.add( {
                    position: {x: Math.trunc( Math.random()*(FIELD_ACT_WIDTH-28*2)+28 ),
                                        y: Math.trunc( Math.random()*30+27+5 )},
                    origin: {x: Math.trunc( Math.random()*(FIELD_ACT_WIDTH-28*2)+28 ),
                                        y: Math.trunc( Math.random()*30+27+5 )},
                    fromLimit: {x: 24, y: 27
                        },
                    toLimit: {x: FIELD_ACT_WIDTH-28, y: SCREEN_HEIGHT-32},
                    size: 24,
                    speed: {x: (Math.random()-0.5)*4, y: (Math.random()-0.5) },
                    level: 0,
                    floating: false,
                    wind: 0.02,
                    fadeIn: false,
                    fadeOut: false,
                    fadeInAlpha: 0,
                    fadeOutAlpha: 5
                    // orbitAngle: 0
                } );
            }
        }


        function windowResizeHandler() {

            _.each(normColorTexts, function(div) { div.style.color = me.color.COLOR_TEXT[3]; });

            if (!me.isApplyTheme) {
                SCREEN_WIDTH = target.getWidth();
                FIELD_ACT_WIDTH = Math.max(Math.floor((SCREEN_WIDTH-60)*0.3), 250);
                FIELD_WIDTH = SCREEN_WIDTH * 0.5;
                CANVAS_ACT_LEFT = SCREEN_WIDTH/2 - FIELD_ACT_WIDTH/2;
                RES_LEFT = CANVAS_ACT_LEFT + FIELD_ACT_WIDTH - 2;
                PoolOut.left = SCREEN_WIDTH/2;
            }
            me.isApplyTheme = false;

            var particle;
            var i;
            for (i = 0; i < QUANTITY; i++) {

                particle = PoolIn.__pools[i];
                particle.togo.x = SCREEN_WIDTH;
                particle.toLimit = FIELD_WIDTH;
                particle.floating = false;

                particle = PoolOut.__pools[i];
                particle.position.x = RES_LEFT;
                particle.togo.x = SCREEN_WIDTH+RES_LEFT;
                particle.toLimit = SCREEN_WIDTH;
                particle.floating = false;
                particle =null;
            }

            for (i = 0; i < QUANTITY_ACT; i++) {

                particle = PoolAct.__pools[i];
                particle.toLimit.x = Math.trunc( FIELD_ACT_WIDTH - particle.size );
                particle.position.x = Math.trunc( Math.random()*(FIELD_ACT_WIDTH-particle.size*2) + particle.size );
                particle = null;

            }


            canvas.width = SCREEN_WIDTH-60;
            canvas.height = 100;
            setElPos(canvas, 10, 30);

            canvasAct.width = SCREEN_WIDTH;
            canvasText.width = SCREEN_WIDTH;
            canvasText.height = 70;
            setElPos(canvasText, 0, 0);

            coverCanvasLeft.width = SCREEN_WIDTH/4+3;
            coverCanvasLeft.height = SCREEN_HEIGHT;
            setElPos(coverCanvasLeft, 10, 30);

            coverCanvasRight.width = SCREEN_WIDTH/4+3;
            coverCanvasRight.height = SCREEN_HEIGHT;
            setElPos(coverCanvasRight, 10, SCREEN_WIDTH - SCREEN_WIDTH/4 - 30);

            coverContextLeft = coverCanvasLeft.getContext('2d');
            var tmp = coverContextLeft.createLinearGradient(0, 0, SCREEN_WIDTH/4+3, 0);
            tmp.addColorStop(0, me.color.BASE+'0.8)');
            tmp.addColorStop(1, me.color.BASE+'0)');
            coverContextLeft.fillStyle = tmp;
            coverContextLeft.fillRect(0,0,SCREEN_WIDTH/4+3,SCREEN_HEIGHT);
            tmp = null;

            coverContextRight = coverCanvasRight.getContext('2d');
            tmp = coverContextRight.createLinearGradient(0, 0, SCREEN_WIDTH/4+3, 0);
            tmp.addColorStop(0, me.color.BASE+'0)');
            tmp.addColorStop(1, me.color.BASE+'0.8)');
            coverContextRight.fillStyle = tmp;
            coverContextRight.fillRect(0,0,SCREEN_WIDTH/4+3,SCREEN_HEIGHT);
            tmp = null;

            canvasAct.height = 97;
            canvasAct.style.position = 'absolute';
            canvasAct.style.top = '20px';
            canvasAct.style.left = '0px';
            canvasAct.leftLimit = SCREEN_WIDTH/2 - FIELD_ACT_WIDTH/2;

            canvasAct.width = SCREEN_WIDTH;

            contextAct.setTransform(1, 0, 0, 1, 0, 0);
            contextAct.translate((SCREEN_WIDTH/2 - FIELD_ACT_WIDTH/2), 0);


            context.translate(1,1);
            contextAct.translate(1,1);
            contextText.translate(1,1);


            setElPos(reqMsgDiv, 35, 90);
            setElPos(resMsgDiv, 35, SCREEN_WIDTH-177);

            setElPos(activeNormMsgDiv, 12, SCREEN_WIDTH/2-90);
            setElPos(activeWarnMsgDiv, 12, SCREEN_WIDTH/2+6);
            setElPos(activeCritMsgDiv, 12, SCREEN_WIDTH/2+104);


            function setElPos(el, top, left) {
                el.style.position = 'absolute';
                el.style.top = top+'px';
                el.style.left = left+'px';
            }

            clearScreen = true;
            setTimeout(function() { clearScreen = false; }, 200);
        }



        function loop() {



            canvasAct.left -= (canvasAct.left - canvasAct.leftLimit) * 0.008;


            var tmp;

            if (TRIGGER) {
                TRIGGER = false;

                norm = me.activeCount[0];
                warn = me.activeCount[1];
                crit = me.activeCount[2];

                if (isNaN(norm)) {
                    crit = 0, warn = 0, norm = 0;
                }

                activeTotalCnt = crit + warn + norm;

                // Refresh active txn text

                if(beforeActiveNorm != norm){
                    valueTexts.nor.textContent = norm;
                    beforeActiveNorm = norm;
                }
                if(beforeActiveWarn != warn){
                    valueTexts.war.textContent = warn;
                    beforeActiveWarn = warn;
                }
                if(beforeActiveCri != crit){
                    valueTexts.cri.textContent = crit;
                    beforeActiveCri = crit;
                }

                if (activeTotalCnt > ACTIVE_COUNT_MAX * ACTIVE_COUNT_SCALE ||
                    activeTotalCnt < ACTIVE_COUNT_MAX * ACTIVE_COUNT_SCALE - ACTIVE_COUNT_MAX)
                {

                    if (Math.abs(activeTotalCnt/ACTIVE_COUNT_MAX - ACTIVE_COUNT_SCALE) > 0.5 || ACTIVE_SCALE_DIFF_REPEAT >= 3)
                    {
                        ACTIVE_COUNT_SCALE = Math.ceil(activeTotalCnt / ACTIVE_COUNT_MAX);
                        ACTIVE_SCALE_DIFF_REPEAT = 0;
                    }
                    else
                        ACTIVE_SCALE_DIFF_REPEAT++;
                }
                else
                {
                    ACTIVE_SCALE_DIFF_REPEAT = 0;
                }


                var scaledNorm = Math.round(norm / ACTIVE_COUNT_SCALE),
                    scaledWarn = Math.round(warn / ACTIVE_COUNT_SCALE),
                    scaledCrit = Math.round(crit / ACTIVE_COUNT_SCALE);


                var actWidthUnit = Math.floor(SCREEN_WIDTH * 0.03);
                var actWidthDiffMax = actWidthUnit * 10;
                FIELD_ACT_WIDTH_TARGET = Math.max(SCREEN_WIDTH*0.2 + Math.min( Math.floor(Math.max((scaledNorm+scaledWarn+scaledCrit)-20, 0)/10) * actWidthUnit, actWidthDiffMax), 250);



                var particle, currentActCnt = [0,0,0];

                var poolLength = PoolAct.__pools.length;

                var k, j, jcnt;

                for (k = 0; k < poolLength; k++) {
                    particle = PoolAct.__pools[k];
                    if (particle.floating) {
                        currentActCnt[particle.level]++;
                    }
                }

                var activeCntDiff = [currentActCnt[0]-scaledNorm, currentActCnt[1]-scaledWarn, currentActCnt[2]-scaledCrit];


                for (j = 0, jcnt = activeCntDiff.length; j < jcnt ; ++j ) {

                    for (k = 0, poolLength = PoolAct.__pools.length; k < poolLength; k++) {

                        if (activeCntDiff[j] > 0)
                        { // 1 부터
                            particle = PoolAct.__pools[k];
                            if (particle.floating && particle.level == j) {
                                activeCntDiff[j] -= 1;
                                REALEASE_TO_RESPONSE_FROM_ACTIVE[particle.level]++;
                                particle.floating = false;

                            }
                            particle = null;
                        }
                        else if (activeCntDiff[j] < 0)
                        { // -1 부터
                            particle = PoolAct.__pools[k];

                            if (!particle.floating) {

                                particle.floating = true;
                                particle.wind = WINDS[j];
                                particle.level = j;
                                particle.position.x = Math.round( Math.random()*(FIELD_ACT_WIDTH-particle.size*2) + particle.size );
                                particle.speed.x = (Math.random()-0.5)*parseInt( Math.random()*15 );
                                particle.speed.y = (Math.random()-0.5)*parseInt( Math.random()*6 );

                                particle.fadeIn = true;
                                particle.fadeInAlpha = 0;

                                activeCntDiff[j] += 1;
                            }
                            particle=null;
                        }

                    }
                }

                req = me.throughputCount[0];
                res = me.throughputCount[1];


                // Refresh throughput text

                if(beforeReq != req){
                    valueTexts.req.textContent = common.Util.numberWithComma(req);
                    beforeReq = req;
                }
                if(beforeRes != res){
                    valueTexts.res.textContent = common.Util.numberWithComma(res);
                    beforeRes = res;
                }

                if ( CRITICAL_OVERROAD_CRITERIA <= crit && OVERLOAD_REPEAT <= OVERLOAD_REPEAT_LIMIT*4 ) {
                    OVERLOAD_REPEAT++;
                } else if ( CRITICAL_OVERROAD_CRITERIA > crit ) {
                    OVERLOAD_REPEAT = 0;
                }

                if (req<0) {
                    req=0;
                }
                if (res<0) {
                    res=0;
                }

                var tpsArr = [req, res];
                var delay, speed, pool, tps;

                for (j = Pools.length -1; j > -1; -- j ) {

                    pool = Pools[j];
                    tps = tpsArr[j];

                    if (tps > 3) {
                        tps = 3; // 일부러 갯수 조절함.
                    }

                    for (var i = 0, cnt = 0; cnt < tps;) {
                        particle = pool.__pools[i++];

                        if (!particle.floating) {

                            if (tps < 12) {
                                delay = 1000/tps * cnt + pool.delay;
                            } else {
                                delay = 1400/tps * cnt + pool.delay;
                            }

                            if (j === 1) {
                                if (REALEASE_TO_RESPONSE_FROM_ACTIVE[1] > 0) {
                                    particle.level = 1;
                                    REALEASE_TO_RESPONSE_FROM_ACTIVE[1]--;

                                } else if (REALEASE_TO_RESPONSE_FROM_ACTIVE[2] > 0) {
                                    particle.level = 2;
                                    REALEASE_TO_RESPONSE_FROM_ACTIVE[2]--;

                                } else {
                                    particle.level = 0;
                                }
                            }

                            speed = 0.035;

                            particle.speed = speed;

                            /* 1ms 넘으면 타이머를 태우고 그렇지 않으면 바로 실행함.*/
                            if( delay > 0 ) {

                                // 펑션 뺌.
                                aniList_Add( particle, delay );
                            } else {
                                this.floating=true;
                            }

                            cnt++;
                        }
                        particle= null;
                    }
                    pool=null;
                }

                REALEASE_TO_RESPONSE_FROM_ACTIVE = [0,0,0];
            }



            var diff = Math.abs(FIELD_ACT_WIDTH_TARGET-FIELD_ACT_WIDTH);
            if (diff >= 2) {

                if (FIELD_ACT_WIDTH_TARGET > FIELD_ACT_WIDTH) {
                    FIELD_ACT_WIDTH = FIELD_ACT_WIDTH + diff*0.04;
                    FIELD_ACT_WIDTH_CHANGE = _FIELD_ACT_WIDTH_CHANGE_STATE_WIDER;
                }
                else if (FIELD_ACT_WIDTH_TARGET < FIELD_ACT_WIDTH) {
                    FIELD_ACT_WIDTH = FIELD_ACT_WIDTH - diff*0.04;
                    FIELD_ACT_WIDTH_CHANGE = _FIELD_ACT_WIDTH_CHANGE_STATE_NARROWER;
                }

                contextAct.setTransform(1, 0, 0, 1, 0, 0);
                contextAct.translate((SCREEN_WIDTH/2 - FIELD_ACT_WIDTH/2), 0);
            } else {
                FIELD_ACT_WIDTH_CHANGE = _FIELD_ACT_WIDTH_CHANGE_STATE_EQUAL;
            }


            contextAct.clearRect(-500, 0, SCREEN_WIDTH+500, contextAct.canvas.height);
            contextAct.fillStyle =  me.color.BASE+'0.75)';
            contextAct.fillRect(0, 0, FIELD_ACT_WIDTH, contextAct.canvas.height);
            contextAct.fillStyle = null;


            //  세로
            // Active Vertical Line
            contextAct.fillStyle = contextAct.createLinearGradient(0, 15, 0, SCREEN_HEIGHT-3);
            contextAct.fillStyle.addColorStop(0,   /*me.color.COLOR_LINE+*/'rgba(222,228,229,0.1)');
            contextAct.fillStyle.addColorStop(0.5, /*me.color.COLOR_LINE+*/'rgba(222,228,229,1)');
            contextAct.fillStyle.addColorStop(1,   /*me.color.COLOR_LINE+*/'rgba(222,228,229,0.1)');

            contextAct.fillRect(0, 15, 2, SCREEN_HEIGHT-3);
            contextAct.fillRect(FIELD_ACT_WIDTH-2, 15, 2, SCREEN_HEIGHT-3);
            contextAct.fillStyle = null;
            tmp = null;


            if( activeTotalCnt > 0 ) {
                poolLength = PoolAct.__pools.length;

                for (var l = 0; l < poolLength; ++l) {

                    /*var*/ particle = PoolAct.__pools[l];

                    if (!particle.floating) {
                        particle = null;
                        continue;
                    }

                    // canvas act resize
                    if (FIELD_ACT_WIDTH_CHANGE === _FIELD_ACT_WIDTH_CHANGE_STATE_WIDER) {
                        particle.position.x ++;

                        if ( Math.abs(particle.position.x - (FIELD_ACT_WIDTH/2)) > 20 &&
                            FIELD_ACT_WIDTH*0.15 < particle.position.x &&
                            FIELD_ACT_WIDTH*0.85 > particle.position.x ) {

                            if (particle.position.x < FIELD_ACT_WIDTH/2)
                                particle.speed.x = Math.abs(particle.speed.x) * -1;
                            else
                                particle.speed.x = Math.abs(particle.speed.x);
                        }
                    }

                    if (FIELD_ACT_WIDTH_CHANGE === _FIELD_ACT_WIDTH_CHANGE_STATE_NARROWER) {
                        particle.position.x = Math.round( Math.max(particle.size+2, particle.position.x-1) );

                        if (Math.abs(particle.position.x - (FIELD_ACT_WIDTH/2)) > 20) {

                            if (particle.position.x < FIELD_ACT_WIDTH/2)
                                particle.speed.x = Math.abs(particle.speed.x);
                            else
                                particle.speed.x = Math.abs(particle.speed.x) * -1;
                        }
                    }


                    if (particle.position.x <= particle.size+2)
                        particle.speed.x = Math.abs(particle.speed.x);

                    if ( particle.position.x >= FIELD_ACT_WIDTH-particle.size-2 && !particle.fadeOut) {

                        particle.speed.x = Math.abs(particle.speed.x) * -1;
                        particle.position.x = Math.round( FIELD_ACT_WIDTH-particle.size - 2 );
                    }


                    particle.speed.x += particle.wind;

                    if (particle.position.y >= particle.toLimit.y)   // bottom reaction
                        particle.speed.y = particle.speed.y * -1;

                    else if (particle.position.y < particle.fromLimit.y) {// roof reaction
                        particle.position.y = Math.round(  particle.fromLimit.y+1 );
                        particle.speed.y = Math.abs(particle.speed.y);
                    }


                    particle.position.x += Math.round( particle.speed.x );

                    if( particle.position.y +23 > contextAct.height )
                        particle.position.y = contextAct.height - 25;

                    /* 계산 끝 */

                    if (particle.fadeIn) {

                        if (particle.fadeInAlpha < 5 ) {
                            particle.fadeInAlpha ++;
                        } else {
                            particle.fadeIn = false;
                        }
                    } else if (particle.fadeOut) {

                        particle.speed.x += 0.3;
                        particle.fadeOutAlpha --;
                    }

                    contextAct.fillStyle = null;
                    contextAct.drawImage( getBullet( particle.level ,  particle.fadeInAlpha ) , particle.position.x-12, particle.position.y-12);

                }
            }

                // Alert
                if (OVERLOAD_REPEAT >= OVERLOAD_REPEAT_LIMIT) {

                    if (OVERLOAD_ALERT_CENTER_HEIGHT <= 0.1)
                        OVERLOAD_ALERT_CENTER_MOVE_DIRECTION = _OVERLOAD_ALERT_CENTER_MOVE_DIRECTION_STATE_DOWN;
                    if (OVERLOAD_ALERT_CENTER_HEIGHT >= 0.8)
                        OVERLOAD_ALERT_CENTER_MOVE_DIRECTION = _OVERLOAD_ALERT_CENTER_MOVE_DIRECTION_STATE_UP;

                    if (OVERLOAD_ALERT_CENTER_MOVE_DIRECTION === _OVERLOAD_ALERT_CENTER_MOVE_DIRECTION_STATE_DOWN)
                        OVERLOAD_ALERT_CENTER_HEIGHT += 0.02;
                    else
                        OVERLOAD_ALERT_CENTER_HEIGHT -= 0.02;


                    contextAct.fillStyle  = contextAct.createLinearGradient(0, 10, 0, contextAct.canvas.height-10);
                    contextAct.fillStyle.addColorStop(0, ['rgba(230,0,0,', (OVERLOAD_REPEAT/30+0.1) ,')'].join(''));
                    contextAct.fillStyle.addColorStop(OVERLOAD_ALERT_CENTER_HEIGHT, ['rgba(230,0,0,', OVERLOAD_REPEAT/100 , ')'].join(''));
                    contextAct.fillStyle.addColorStop(OVERLOAD_ALERT_CENTER_HEIGHT+0.1, ['rgba(230,0,0,', OVERLOAD_REPEAT/100 ,')'].join(''));
                    contextAct.fillStyle.addColorStop(1, ['rgba(230,0,0,', (OVERLOAD_REPEAT/30+0.1) ,')'].join(''));
                    contextAct.fillRect(0, 10, FIELD_ACT_WIDTH, contextAct.canvas.height-10);
                    contextAct.fillStyle = null;
                    tmp = null;
                } // end Alert

            //} // 일부러 지움.


            context.clearRect(-1, -1, SCREEN_WIDTH, SCREEN_HEIGHT);


            // 두줄
            // Horizontal Line
            context.beginPath();
            context.lineWidth = 1;
            context.strokeStyle = me.color.COLOR_LINE+'0.7)';
            context.moveTo(2, Math.floor(SCREEN_HEIGHT/2+9));
            context.lineTo(SCREEN_WIDTH-60, Math.floor(SCREEN_HEIGHT/2+9));
            context.stroke();

            context.moveTo(2, Math.floor(SCREEN_HEIGHT/2+11));
            context.lineTo(SCREEN_WIDTH-60, Math.floor(SCREEN_HEIGHT/2+11));
            context.stroke();
            context.closePath();


            for( k = Pools.length -1; k > -1; --k ){

                /*var*/ pool = Pools[k];
                var len = pool.__pools.length;

                for (i = 0; i < len; i++) {

                    particle = pool.__pools[i];

                    if (!particle.floating)
                        continue;

                    if (particle.position.x-pool.left >= FIELD_WIDTH-10) {

                        particle.position.x = pool.left-80;
                        particle.floating = false;
                        continue;
                    }
                    particle.position.x += Math.round( SCREEN_WIDTH * particle.speed );

                    context.drawImage( getMoveBullet( particle.level ), particle.position.x-12, Math.round( particle.position.y-particle.size*0.85) );
                }
            }

            if (clearScreen) {
                context.fillStyle = [me.color.BASE,'1)'].join('');
                context.fillRect(0, 0, context.canvas.width, context.canvas.height-3);
                context.fillStyle = null;
            }

        }
    },

    startAnimationFrame: function(){
        this.stopped = false;
        this.animationFrame = requestAnimationFrame( this.aniTimer_onEvent );
    },

    stopAnimationFrame: function(){
        this.stopped = true;
        cancelAnimationFrame(this.animationFrame);
    },

    stopFrameDraw : function(){
        this.stopAnimationFrame();
    }

});