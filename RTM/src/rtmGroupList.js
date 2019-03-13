Ext.define('rtm.src.rtmGroupList',{
    extend: 'Ext.Component',
    resize: false,
    isInitResize: true,

    menuBarObjects: [],

    imagePoint: {
        disconnectL    : {x: 223, y: 416, w:100, h: 33 },
        disconnectR    : {x: 355, y: 416, w:10,  h: 33 },
        downL          : {x: 223, y: 416, w:100, h: 33 },
        downR          : {x: 355, y: 416, w:10 , h: 33 },
        licenseL       : {x: 223, y: 416, w:100, h: 33 },
        licenseR       : {x: 355, y: 416, w:10,  h: 33 },
        upArrow        : {x: 231, y: 235, w:14,  h: 8  },
        upArrowOver    : {x: 231, y: 224, w:14,  h: 8  },
        downArrow      : {x: 255, y: 235, w:14,  h: 8  },
        downArrowOver  : {x: 255, y: 224, w:14,  h: 8  },
        checkMark      : {x: 306, y: 521, w:17,  h: 17 },
        dotNetIcon     : {x: 335, y: 655, w:20,  h: 20 }
    },

    defaultFontColor : '#B0B3B8',
    warningFontColor : '#FFD300',
    criticalFontColor: '#E42526',

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
        if (!adata) {
            return;
        }

        var me  = this;

        _.each(adata, function(obj) {
            _.each(me.menuBarObjects, function(obj2) {

                // Agent
                if (+obj.wasID === +obj2.id) {
                    obj2.setValues( obj.cpu, obj.mem);
                }

                // Group
                if (obj2.isTitle) {
                    if (obj.groupName === obj2.groupName) {
                        obj2.setValues( obj.cpu, obj.mem);
                    }

                    if (obj.hostName === obj2.groupName) {
                        obj2.setValues( obj.cpu, obj.mem);
                    }
                }

            });
        });

        me    = null;
        adata = null;
    },


    init: function(target) {
        this.target = target;

        var me = this;
        var parent = target.up();

        me.displayGroupType = 0;

        if (!me.menuBarObjects) {
            me.menuBarObjects = [];
        }
        if (!me.viewWasList) {
            me.viewWasList = [];
        }

        // 서버 및 알람별 마지막 알람 시간 정보
        me.alarmList    = {};

        // 실시간 발생 알람 목록
        me.alarmNameArr = [];

        // 웹 프로세스 알람 상태 정보
        // 다른 알람과는 다르게 웹 프로세스 알람에 대해서는 현재 몇개의 프로세스가 실행/중단되어 있는지
        // 서버명 하단에 표시를 한다.
        me.webProcessAlarm = {};

        // Ctrl 키가 눌렸는지 체크하는 구분 값
        me.cntrlIsPressed = false;

        // Ctrl 키를 누르고서 다중 선택한 그룹명 배열
        me.selectGroupNames = [];

        me.canvas = null;

        me.cacheFittingString = {};

        var SCREEN_WIDTH  = target.getWidth();
        var SCREEN_HEIGHT = target.getHeight();

        var context;

        me.iconImg = new Image();
        me.iconImg.src = '../images/xm_icon_Black_v1.png';
        me.iconImg.onload = function() {
            this.isImageLoad = true;
        }.bind(this);

        init();

        me.createTooltip();

        me.graph = new menuGroupBar(context);
        me.graph.margin = 3;
        me.graph.width  = SCREEN_WIDTH;
        me.graph.height = SCREEN_HEIGHT - 10;

        me.graph.update();

        me.startAnimationFrame();

        me.checkServerStatus();

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

                me.canvas.addEventListener('mouseleave', function(e) {
                    e.preventDefault();
                    me.titleTooltip.css({'display': 'none'});
                });

                // Mouse move event
                me.canvas.addEventListener('mousemove', function(e) {
                    e.preventDefault();

                    me.canvas.style.cursor = 'default';

                    var mouse = me.getMouse(e);
                    var mx = mouse.x;
                    var my = mouse.y;

                    var i, icnt, menuObj, width, tooltipText;

                    for (i = 0, icnt =  me.menuBarObjects.length ; i < icnt ; ++i) {
                        menuObj = me.menuBarObjects[ i ];

                        if (menuObj.groupType !== me.displayGroupType || !menuObj.isVisible) {
                            continue;
                        }

                        menuObj.isIconOver = false;

                        if (menuObj.checkMenuCollapseIcon(mx, my ) ) {
                            menuObj.isIconOver = true;

                            me.graph.update();
                            me.canvas.style.cursor = 'pointer';
                            break;
                        }

                        if ( menuObj.checkMenuCpuMem(mx, my) ) {
                            me.canvas.style.cursor = 'pointer';
                            break;
                        }

                        if (menuObj.isTitle) {
                            width = me.ctx.measureText(menuObj.groupName).width;
                            tooltipText = menuObj.groupName;
                        } else {
                            width = me.ctx.measureText(menuObj.serverName).width;
                            tooltipText = menuObj.serverName;
                        }

                        if ( menuObj.checkMenuAgentName(mx, my, width) ) {
                            me.canvas.style.cursor = 'pointer';

                            me.titleTooltip.text(tooltipText);

                            //툴팁 보여줌.
                            var offset = me.canvas.getBoundingClientRect();

                            var posY = offset.top + my + 20;
                            var posX = offset.left + 30;

                            if (posY + 20 > document.body.offsetHeight) {
                                posY = document.body.offsetHeight - 30;
                            }

                            me.titleTooltip.css({top: posY, left: posX, display: 'block'});

                            break;

                        } else {
                            me.titleTooltip.css({'display': 'none'});
                        }
                    }
                });


                // Mouse down event
                me.canvas.addEventListener('mouseup', function(e) {
                    e.preventDefault();

                    var mouse = me.getMouse(e);
                    var mx = mouse.x;
                    var my = mouse.y;

                    var i, icnt, menuObj, width, hostName;

                    // 박스 체크
                    for (i = 0, icnt =  me.menuBarObjects.length; i < icnt; ++i) {
                        menuObj = me.menuBarObjects[ i ];

                        if (menuObj.groupType !== me.displayGroupType || !menuObj.isVisible) {
                            continue;
                        }

                        if (menuObj.checkMenuCollapseIcon(mx, my) && !me.cntrlIsPressed) {
                            menuObj.isCollapse = !menuObj.isCollapse;
                            me.toggleMenuBySelectGroup(menuObj.groupType, menuObj.groupName);
                            me.graph.update();
                            //e.stopPropagation()
                            break;
                        }

                        // Open Process Monitor Window
                        if ( menuObj.checkMenuCpuMem(mx, my) ) {

                            if (menuObj.id <= 0) {
                                hostName = menuObj.groupName;
                            } else {
                                hostName = Comm.RTComm.HostRelServer(menuObj.id);
                            }
                            me.openProcessMonitor(hostName);
                            e.stopPropagation();
                            break;
                        }

                        if (menuObj.isTitle) {
                            width = me.ctx.measureText(menuObj.groupName).width;
                        } else {
                            width = me.ctx.measureText(menuObj.serverName).width;
                        }

                        // Select Agent Name Event
                        if ( menuObj.checkMenuAgentName(mx, my, width) ) {
                            if (menuObj.isTitle) {

                                if (me.cntrlIsPressed) {
                                    if (menuObj.groupName === 'OVERALL') {
                                        me.selectGroupName(menuObj);
                                        break;
                                    }

                                    if (me.selectGroupNames.length > 0) {
                                        me.multiSelectGroupName(menuObj);

                                    } else {
                                        me.selectGroupName(menuObj);
                                    }
                                } else {
                                    me.selectGroupName(menuObj);
                                }

                            } else {
                                me.selectAgentName(menuObj);
                            }
                            me.graph.update();
                            //e.stopPropagation()
                            break;
                        }
                    }

                }, false);

                // 키 이벤트가 발생되었을 때 Ctrl키가 눌렸는지 확인
                $(document).keydown(function(event) {
                    if (event.which === 17 && !me.cntrlIsPressed) {
                        me.cntrlIsPressed = true;
                    }
                });

                $(document).keyup(function(event) {
                    if (event.which === 17 && me.cntrlIsPressed) {
                        me.cntrlIsPressed = false;
                    }
                });

            }
        }

        function windowResizeHandler() {
            SCREEN_WIDTH = target.getWidth();
            SCREEN_HEIGHT = target.getHeight();

            if (me.maxHeight > SCREEN_HEIGHT + 5) {
                SCREEN_HEIGHT = me.maxHeight;
            }

            me.canvas.width = SCREEN_WIDTH;
            me.canvas.height = SCREEN_HEIGHT;

            if (me.graph) {
                me.graph.width = SCREEN_WIDTH;
                me.graph.height = SCREEN_HEIGHT;
            }

            me.objWidth = 70;

            setElPos(me.canvas, 0, 0);

            function setElPos(el, bottom, left) {
                el.style.position = 'absolute';
                el.style.bottom = bottom + 'px';
                el.style.left   = left + 'px';
                el.style.top    = '0px';
            }
        }


        function menuGroupBar(ctx) {
            // Private properties and methods
            var that = this;

            // Public properties and methods
            this.width  = 300;
            this.height = 150;
            this.margin = 5;

            var menuPosX = 50;
            var menuPosY = 0;
            var maxPosY  = 0;

            var draw = function() {

                if (target.getWidth() <= 0 ||
                    parent && parent.el.dom.style.visibility === 'hidden') {
                    return;

                } else if (that.width === 0) {
                    windowResizeHandler();

                }

                menuPosX = 50;
                menuPosY = 0;
                maxPosY  = 0;

                function drawMenuList( aobj ) {

                    // 서버명이 보여지는 영역 그리기
                    function drawMenuBar() {
                        ctx.fillStyle = aobj.labelColor;
                        ctx.fillRect(
                            menuPosX - 25,
                            menuPosY + 10,
                            8,
                            13
                        );

                        if (aobj.state === 2) {
                            ctx.fillStyle = me.criticalFontColor;
                            ctx.font      = "bold 14px 'Droid Sans'";

                        } else if (aobj.state === 1) {
                            ctx.fillStyle = me.warningFontColor;
                            ctx.font      = "bold 14px 'Droid Sans'";

                        } else {
                            ctx.font      = "normal 14px 'Droid Sans'";
                            ctx.fillStyle = me.defaultFontColor;
                        }
                        ctx.textAlign = 'left';

                        var cpuMemWidth = (aobj.isCpuMem && aobj.state !== 3) ? 180 : 0;

                        var barLabel = me.fittingString(ctx, aobj.serverName, that.width - that.alarmWidth - cpuMemWidth);
                        ctx.fillText( barLabel, menuPosX - 13, menuPosY + 21);

                        ctx.fillStyle = '#50555C';
                        ctx.fillRect(0, menuPosY + 34 ,  that.width, 1);

                        if (aobj.isCpuMem && aobj.state !== 3) {
                            ctx.font      = "normal 13px 'Droid Sans'";
                            ctx.textAlign = 'right';

                            // CPU Alarm
                            if (aobj.cpuAlarmLevel === 2) {
                                ctx.fillStyle = me.criticalFontColor;
                            } else if (aobj.cpuAlarmLevel === 1) {
                                ctx.fillStyle = me.warningFontColor;
                            } else {
                                ctx.fillStyle = me.defaultFontColor;
                            }

                            if (aobj.cpu < 10) {
                                ctx.fillText( 'CPU :  ' + aobj.cpu, that.width - 95, menuPosY + 21);
                            } else {
                                ctx.fillText( 'CPU :  ' + aobj.cpu, that.width - 88, menuPosY + 21);
                            }

                            ctx.fillStyle = me.defaultFontColor;
                            ctx.fillText('  /  ', that.width - 70, menuPosY + 21);

                            // Memory Alarm
                            if (aobj.memAlarmLevel === 2) {
                                ctx.fillStyle = me.criticalFontColor;
                            } else if (aobj.memAlarmLevel === 1) {
                                ctx.fillStyle = me.warningFontColor;
                            } else {
                                ctx.fillStyle = me.defaultFontColor;
                            }
                            ctx.font      = "normal 13px 'Droid Sans'";
                            ctx.textAlign = 'right';

                            if (aobj.mem < 10) {
                                ctx.fillText('MEM :  ' + aobj.mem, that.width - 20, menuPosY + 21);
                            } else {
                                ctx.fillText('MEM :  ' + aobj.mem, that.width - 12, menuPosY + 21);
                            }
                        }

                        aobj.x = menuPosX;
                        aobj.y = menuPosY;
                        aobj.width  = that.width;
                        aobj.heigth = 34;

                        me.drawDotNetIcon(aobj);

                        if (aobj.isSelected) {
                            var iconPt = me.imagePoint.checkMark;

                            ctx.drawImage(
                                me.iconImg,
                                iconPt.x,
                                iconPt.y,
                                iconPt.w,
                                iconPt.h,
                                aobj.x - 45,
                                aobj.y + 9,
                                iconPt.w,
                                iconPt.h
                            );
                            ctx.fillStyle = '#1A8FFF';
                            ctx.fillRect(that.width - 4, menuPosY + 1, 4, 33);
                        }
                    }

                    // Disconnected, Down 등 서버 상태 그리기
                    function drawMenuAlarm() {
                        if (!me.isImageLoad) {
                            return;
                        }

                        var addBarWidth = 0;
                        if ('DISCONNECT' === aobj.stateText) {
                            addBarWidth = 18;
                        }
                        ctx.drawImage(
                            me.iconImg,
                            me.imagePoint.downL.x,
                            me.imagePoint.downL.y,
                            me.imagePoint.downL.w + addBarWidth,
                            me.imagePoint.downL.h,
                            that.width - 112 - addBarWidth,
                            menuPosY + 1,
                            me.imagePoint.downL.w + addBarWidth,
                            me.imagePoint.downL.h
                        );
                        ctx.drawImage(
                            me.iconImg,
                            me.imagePoint.downR.x,
                            me.imagePoint.downR.y,
                            me.imagePoint.downR.w,
                            me.imagePoint.downR.h,
                            that.width - 12,
                            menuPosY + 1,
                            me.imagePoint.downR.w,
                            me.imagePoint.downR.h
                        );

                        that.alarmWidth = me.imagePoint.downL.w + addBarWidth + me.imagePoint.downR.w + 40;

                        ctx.fillStyle = '#FFFFFF';
                        ctx.textAlign = 'right';
                        if ('DISCONNECT' === aobj.stateText) {
                            ctx.font = "bold 12px 'Droid Sans'";
                        } else {
                            ctx.font = "bold 14px 'Droid Sans'";
                        }
                        ctx.fillText( aobj.stateText, that.width - 20, menuPosY + 21);
                    }

                    // 호스트 및 업무 명이 보여지는 영역 그리기
                    function drawMenuBarHeader() {

                        if (aobj.isSelected) {
                            ctx.fillStyle = '#1A8FFF';
                        } else {
                            ctx.fillStyle = '#414e5b';
                        }
                        ctx.fillRect(0, menuPosY,  that.width, 39);

                        ctx.fillStyle = '#FFFFFF';
                        ctx.font      = "bold 14px 'Droid Sans'";
                        ctx.textAlign = 'left';

                        var barLabel = me.fittingString(ctx, aobj.groupName, that.width - ((aobj.isCpuMem) ? 170 : 20));
                        ctx.fillText(barLabel, menuPosX - 30, menuPosY + 25);

                        ctx.fillStyle = '#36393d';
                        ctx.fillRect(0, menuPosY + 38 ,  that.width, 1);
                        barLabel = null;

                        if (aobj.isCpuMem) {
                            // Disconnected, Down 등 인 경우 CPU, Mem 값을 0 으로 표시
                            if ( aobj.state === 3 ) {
                                aobj.cpu = 0;
                                aobj.mem = 0;
                            }

                            ctx.font      = "normal 12px 'Droid Sans'";
                            ctx.textAlign = 'right';

                            // CPU Alarm
                            if (aobj.cpuAlarmLevel === 2) {
                                ctx.fillStyle = me.criticalFontColor;
                            } else if (aobj.cpuAlarmLevel === 1) {
                                ctx.fillStyle = me.warningFontColor;
                            } else {
                                ctx.fillStyle = me.defaultFontColor;
                            }

                            if (aobj.cpu < 10) {
                                ctx.fillText( 'CPU :  ' + aobj.cpu, that.width - 101, menuPosY + 23);
                            } else {
                                ctx.fillText( 'CPU :  ' + aobj.cpu, that.width - 94, menuPosY + 23);
                            }

                            ctx.fillStyle = me.defaultFontColor;
                            ctx.fillText('  /  ', that.width - 82, menuPosY + 25);

                            // Memory Alarm
                            if (aobj.memAlarmLevel === 2) {
                                ctx.fillStyle = me.criticalFontColor;
                            } else if (aobj.memAlarmLevel === 1) {
                                ctx.fillStyle = me.warningFontColor;
                            } else {
                                ctx.fillStyle = me.defaultFontColor;
                            }
                            ctx.font      = "normal 12px 'Droid Sans'";
                            ctx.textAlign = 'right';

                            if (aobj.mem < 10) {
                                ctx.fillText('MEM :  ' + aobj.mem, that.width - 36, menuPosY + 23);
                            } else {
                                ctx.fillText('MEM :  ' + aobj.mem, that.width - 28, menuPosY + 23);
                            }
                        }

                        if (!me.isImageLoad) {
                            return;
                        }

                        aobj.x = menuPosX;
                        aobj.y = menuPosY;
                        aobj.width  = that.width;
                        aobj.heigth = 39;

                        me.drawExpandCollapseIcon(aobj);
                    }

                    // 서버명 하단에 기타 정보들이 보여지는 영역 그리기
                    function drawSubMenuBar() {
                        var statusInfo = me.webProcessAlarm[aobj.id];

                        ctx.font      = "normal 13px 'Droid Sans'";
                        ctx.fillStyle = me.criticalFontColor;
                        ctx.textAlign = 'left';

                        var barLabel = me.fittingString(ctx, statusInfo, that.width);
                        ctx.fillText( barLabel, menuPosX - 13, menuPosY + 21);

                        // 영역 상단에 보여지는 서버명과 구분선이 보이지 않게 배경색 선 그리기
                        ctx.fillStyle = '#393C43';
                        ctx.fillRect(0, menuPosY,  that.width, 1);

                        // 영역 하단에 다음에 보여지는 서버명과 구분하는 선 그리기
                        ctx.fillStyle = '#50555C';
                        ctx.fillRect(0, menuPosY + 34 ,  that.width, 1);
                    }

                    that.alarmWidth = 0;

                    // 서버 상태를 체크
                    if ( aobj.state === 3 ) {
                        drawMenuAlarm();
                    }

                    if (aobj.isTitle) {
                        drawMenuBarHeader();

                    } else {
                        drawMenuBar();

                        // 웹 프로세스 알람 유무 체크
                        if (me.webProcessAlarm[aobj.id]) {
                            menuPosY = Math.ceil(menuPosY + 34);

                            if (maxPosY < menuPosY) {
                                maxPosY = menuPosY;
                            }

                            drawSubMenuBar();
                        }
                    }

                    if (aobj.isTitle) {
                        menuPosY = Math.ceil(menuPosY + 39);
                    } else {
                        menuPosY = Math.ceil(menuPosY + 34);
                    }

                    if (maxPosY < menuPosY) {
                        maxPosY = menuPosY;
                    }
                }

                if (me.resize === true) {
                    me.resize = false;
                    windowResizeHandler();
                }

                // 청소
                ctx.clearRect(-100, -100, that.width + 100, that.height + 100);

                var barObj, i, icnt;
                for (i = 0, icnt =  me.menuBarObjects.length; i < icnt; ++i ) {
                    barObj = me.menuBarObjects[ i ];

                    if (barObj.groupType === me.displayGroupType && barObj.isVisible) {
                        drawMenuList(barObj);
                    }

                    barObj = null;
                }

                if (menuPosY > that.height + 5) {
                    me.maxHeight = menuPosY;

                    windowResizeHandler();
                    me.graph.update();
                } else if (maxPosY < me.maxHeight) {
                    me.maxHeight = maxPosY;

                    windowResizeHandler();
                    me.graph.update();
                }

            }; // end draw function

            this.update = function() {
                draw();
            };
        }
    },


    /**
     * 글자길이가 지정된 폭을 넘는지 확인하여 넘는 경우 폭에 맞춰서 말줄임표를 설정.
     *
     * @param {object} c   - context
     * @param {string} str - 에이전트/그룹명
     * @param {number} maxWidth - 메뉴 폭
     * @return {string} 말줄임표가 설정된 문자.
     */
    fittingString: function(c, str, maxWidth) {

        var width, ellipsis, ellipsisWidth, len;

        if ( this.cacheFittingString['_' + maxWidth + str] ) {
            return this.cacheFittingString['_' + maxWidth + str];

        } else {
            width = c.measureText(str).width;
            ellipsis = '..';
            ellipsisWidth = c.measureText(ellipsis).width;

            if (width <= maxWidth || width <= ellipsisWidth) {
                this.cacheFittingString['_' + maxWidth + str] = str;
                return str;

            } else {
                len = str.length;

                while (width >= maxWidth - ellipsisWidth && len-- > 0) {
                    str = str.substring(0, len);
                    width = c.measureText(str).width;
                }
                this.cacheFittingString['_' + maxWidth + str] = str + ellipsis;
                return str + ellipsis;
            }
        }
    },


    /**
     * Get Mouse Point
     */
    getMouse: function(e) {
        var me = this;
        var rect   = me.canvas.getBoundingClientRect(), // abs. size of element
            scaleX = me.canvas.width / rect.width,      // relationship bitmap vs. element for X
            scaleY = me.canvas.height / rect.height;    // relationship bitmap vs. element for Y

        return {
            x: (e.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
            y: (e.clientY - rect.top) * scaleY     // been adjusted to be relative to element
        };
    },


    drawExpandCollapseIcon: function(aObj) {
        var iconPt;
        if (aObj.isCollapse === true) {
            if (aObj.isIconOver) {
                iconPt = this.imagePoint.upArrowOver;
            } else {
                iconPt = this.imagePoint.upArrow;
            }
        } else {
            if (aObj.isIconOver) {
                iconPt = this.imagePoint.downArrowOver;
            } else {
                iconPt = this.imagePoint.downArrow;
            }
        }

        this.ctx.drawImage(
            this.iconImg,
            iconPt.x,
            iconPt.y,
            iconPt.w,
            iconPt.h,
            aObj.width - 22,
            aObj.y + 15,
            iconPt.w,
            iconPt.h
        );
    },


    drawDotNetIcon: function(aObj) {
        var iconPt;

        if (aObj.isDotNet) {

            if (aObj.isSelected) {
                this.ctx.globalAlpha = 0.5;
            }

            iconPt = this.imagePoint.dotNetIcon;

            this.ctx.drawImage(
                this.iconImg,
                iconPt.x,
                iconPt.y,
                iconPt.w,
                iconPt.h,
                3,
                aObj.y + 6,
                iconPt.w,
                iconPt.h
            );

            if (aObj.isSelected) {
                this.ctx.globalAlpha = 1;
            }
        }
    },


    toggleMenuBySelectGroup: function(groupType, groupName) {
        var ix, ixLen;
        var menuObj;

        for (ix = 0, ixLen = this.menuBarObjects.length; ix < ixLen; ++ix ) {
            menuObj = this.menuBarObjects[ix];

            if (menuObj.groupName === groupName && menuObj.groupType === groupType && menuObj.isTitle !== true) {
                menuObj.isVisible = !menuObj.isVisible;
            }
        }

        menuObj = null;
    },


    /**
     * Menu Info Object
     *
     * @return {object}
     */
    menuObjectClass: function(isTitle, type, groupName, serverId, serverName, labelColor, isVisible) {
        this.isTitle    = isTitle;
        this.id         = serverId;
        this.groupType  = type;
        this.groupName  = groupName;
        this.serverName = serverName;
        this.labelColor = labelColor;
        this.isSelected = (isTitle && groupName === 'OVERALL');
        this.isVisible  = (isTitle) ? true : isVisible;
        this.isCollapse = (groupName === 'OVERALL');
        this.isIconOver = false;
        this.isDotNet   = false;
        this.cpu = 0;
        this.mem = 0;
        this.x   = 0;
        this.y   = 0;
        this.width  = 0;
        this.height = 0;
        this.state  = 0;

        if (this.isTitle && this.groupType === 0 && this.groupName !== 'OVERALL' ||
            !this.isTitle && (this.groupType === 1 || this.groupName === 'OVERALL')) {
            this.isCpuMem = true;
        } else {
            this.isCpuMem = false;
        }

        this.setValues = function(cpuVal, memVal) {
            this.cpu = cpuVal;
            this.mem = memVal;
        };

        // Check Agent Mouse Point
        this.checkMenuAgentName = function(mx, my, width) {
            // Menu Header
            if (this.isTitle) {
                return (this.x - 30 <= mx && mx < width + 20 &&
                        this.y + 10  <= my && my <= this.y + 25);

            } else {
                return (this.x - 15 <= mx && mx < width + 40 &&
                        this.y + 5 <= my && my < this.y + 25);
            }
        };

        // Check CPU, MEM Mouse Point
        this.checkMenuCpuMem = function(mx, my) {
            if (this.isVisible && this.isCpuMem) {
                if (this.isTitle) {
                    return (this.width - 140 <= mx && mx < this.width - 25 &&
                            this.y + 10  <= my && my <= this.y + 25);
                } else {
                    return (this.width - 140 <= mx && mx < this.width &&
                            this.y + 10  <= my && my <= this.y + 25);
                }
            } else {
                return false;
            }
        };

        // Check Collapse Mouse Point
        this.checkMenuCollapseIcon = function(mx, my) {
            // Menu Header
            if (this.isTitle) {
                return (this.width - 22 <= mx && mx < this.width &&
                        this.y + 10  <= my && my <= this.y + 25);
            } else {
                return false;
            }
        };

        return this;
    },


    /**
     * Change Group List
     *
     * @param {number} groupType
     */
    changeGroup: function(groupType) {
        if (this.displayGroupType !== groupType) {
            this.displayGroupType = groupType;

            this.graph.update();
        }
    },


    /**
     * Configuration Menu List.
     *
     * @param {array} wasList
     */
    setMenuList: function(wasList) {
        this.menuBarObjects = [];

        var navObj, ix, ixLen;
        for (ix = 0, ixLen = wasList.length; ix < ixLen; ix++) {
            navObj =  new this.menuObjectClass(
                wasList[ix].isTitle,
                wasList[ix].groupType,
                wasList[ix].groupName,
                wasList[ix].serverId,
                wasList[ix].serverName,
                wasList[ix].labelColor,
                !(wasList[ix].isTitle !== true && wasList[ix].groupName === 'OVERALL')
            );
            navObj.serverType = wasList[ix].serverType || 'WAS';
            navObj.isDotNet   = wasList[ix].isContainNet;

            this.menuBarObjects[this.menuBarObjects.length] = navObj;
        }

        this.checkServerStatus();

        this.resize = true;
        this.originMenuBar = this.menuBarObjects;
    },

    /***
     * search Agent
     *
     * @param {string} keyword
     */
    searchAgentList: function(keyword) {
        var ix, ixLen, groupList, searchList, groupName, menuCount, groupObj;
        var wasList = this.originMenuBar;
        var agentName = keyword.toLowerCase();

        if (agentName.length) {
            searchList = _.filter(wasList, function(o) {
                if (o['serverName'].toLowerCase().includes(agentName)) {
                    return o;
                }
            });
            groupList = _.filter(wasList, function(o) {
                if (o['id'] == -1) {
                    return o;
                }
            });
            this.menuBarObjects = [];
        }

        for (ix = 0, ixLen = searchList.length; ix < ixLen; ix++) {
            if (groupList.length) {
                groupName = searchList[ix].groupName;
                menuCount = this.menuBarObjects.length;
                if (!menuCount || this.menuBarObjects[menuCount - 1].groupName !== groupName) { // groupName 바뀔 때,
                    groupObj = _.find(groupList, function(o) {
                        if (o['groupName'] === groupName) {
                            return o;
                        }
                    });
                    this.menuBarObjects[menuCount] = groupObj; // groupName 추가
                }
            }
            this.menuBarObjects[this.menuBarObjects.length] = searchList[ix]; // 검색한 serverName 추가
        }
        this.checkServerStatus();
        this.resize = true;
    },

    changeLabelColor: function() {
        var menuObj;
        var ix, ixLen;
        var serverId;

        for (ix = 0, ixLen = this.menuBarObjects.length; ix < ixLen; ix++) {
            menuObj = this.menuBarObjects[ix];
            serverId = menuObj.serverId || menuObj.id;

            menuObj.labelColor = realtime.serverColorMap[this.monitorType][serverId];
        }
    },


    /**
     * Open Process Monitor
     *
     * @param {string} hostName
     */
    openProcessMonitor: function(hostName) {
        if (!realtime.ProcessMonitor) {
            realtime.ProcessMonitor = Ext.create('rtm.src.rtmProcessMonitor');
            realtime.ProcessMonitor.isDisplayTP = (this.monitorType === 'E2E');
            realtime.ProcessMonitor.init();
            realtime.ProcessMonitor.selectTab(hostName);
            realtime.ProcessMonitor.pmWindow.on({
                beforeclose: function() {
                    Ext.Array.remove(Comm.onProcessMonitorTarget, realtime.ProcessMonitor);
                }
            });
            Comm.onProcessMonitorTarget.push(realtime.ProcessMonitor);
        } else {
            realtime.ProcessMonitor.selectTab(hostName);
            realtime.ProcessMonitor.pmWindow.show();
        }

    },


    /**
     * Component Event Trigger
     */
    selectAgentList: function() {
        var ix, ixLen;
        var menuObj;

        var serverIdArr, selectedIdArr;

        for (ix = 0, ixLen = this.menuBarObjects.length; ix < ixLen; ix++) {
            menuObj = this.menuBarObjects[ix];

            if (!menuObj.isTitle) {
                selectedIdArr = Comm.RTComm.getSelectedIdArr(this.monitorType);
                serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType);

                if (selectedIdArr.length === serverIdArr.length) {
                    menuObj.isSelected = false;
                } else {
                    menuObj.isSelected = (selectedIdArr.indexOf(menuObj.id) !== -1);
                }
            }
        }
        this.graph.update();
    },


    /**
     * Select Agent Name
     *
     * @param {object} selectObj
     */
    selectAgentName: function(selectObj) {
        var ix, ixLen;
        var menuObj;

        selectObj.isSelected = !selectObj.isSelected;

        this.selectedGroupName = '';
        var selectedNames;

        // 다중 선택된 그룹명 배열 클리어 하기
        this.selectGroupNames = [];

        if (this.monitorType === 'TP') {
            selectedNames = realtime.selectedTPNames;

        } else if (this.monitorType === 'TUX') {
            selectedNames = realtime.selectedTuxNames;

        } else if (this.monitorType === 'WEB') {
            selectedNames = realtime.selectedWebNames;

        } else if (this.monitorType === 'CD') {
            selectedNames = realtime.selectedCDNames;

        } else if (this.monitorType === 'E2E') {
            selectedNames = realtime.eteSelectedServerNames;

        } else {
            selectedNames = realtime.WasModeSelected;
        }

        if (selectedNames.indexOf(selectObj.serverName) !== -1) {
            Ext.Array.remove(selectedNames, selectObj.serverName);
        } else {
            selectedNames[selectedNames.length] = selectObj.serverName;
        }

        var selectedIdArr = Comm.RTComm.getSelectedIdArr(this.monitorType);
        var serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType);

        selectedIdArr.length = 0;

        if (selectedNames.length === 0 || selectedNames.length === serverIdArr.length) {
            for (ix = 0, ixLen = serverIdArr.length; ix < ixLen; ix++) {
                selectedIdArr[ix] = serverIdArr[ix];
            }
            selectedNames.length = 0;

        } else {
            for (ix = 0, ixLen = selectedNames.length; ix < ixLen; ix++) {
                selectedIdArr[selectedIdArr.length] = Comm.RTComm.getServerIdByName(selectedNames[ix], this.monitorType);
            }
        }

        for (ix = 0, ixLen = this.menuBarObjects.length; ix < ixLen; ix++) {
            menuObj = this.menuBarObjects[ix];

            if (!menuObj.isTitle) {
                if (selectedIdArr.length === serverIdArr.length) {
                    menuObj.isSelected = false;
                } else {
                    menuObj.isSelected = (selectedIdArr.indexOf(menuObj.id) !== -1);
                }
            }
        }

        if (!this.monitorType || this.monitorType === 'WAS') {
            Comm.selectedWasArr.length = 0;
            Comm.selectedWasArr = selectedIdArr.concat();
        }

        common.RTMDataManager.selectAgent(selectObj.id, this.monitorType);

        if (selectedIdArr.length === serverIdArr.length) {
            common.RTMDataManager.selectAgent('ALL', this.monitorType);
        }

        this.selectedServerNames = selectedNames.concat();

        if (this.frameChange) {
            this.frameChange();
        }
    },


    /**
     * Select Biz/Host Group Name
     *
     * @param {object} selectObj
     */
    selectGroupName: function(selectObj) {
        var menuObj;
        var ix, ixLen, containServerArr;

        var selectedIdArr = Comm.RTComm.getSelectedIdArr(this.monitorType);
        var serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType);

        // 다중 선택된 그룹명 배열 클리어 하기
        this.selectGroupNames = [];

        var selectedNames, groupName;

        if (this.monitorType === 'TP') {
            selectedNames = realtime.selectedTPNames;

        } else if (this.monitorType === 'WEB') {
            selectedNames = realtime.selectedWebNames;

        } else if (this.monitorType === 'CD') {
            selectedNames = realtime.selectedCDNames;

        } else if (this.monitorType === 'E2E') {
            selectedNames = realtime.eteSelectedServerNames;

        } else {
            selectedNames = realtime.WasModeSelected;
        }

        selectedNames.length = 0;
        selectedIdArr.length = 0;

        groupName = selectObj.groupName;

        // 선택된 그룹명을 다중 선택되었는지 체크하는 그룹명 배열에 추가
        // 예) 그룹명을 일반 선택 후 Ctrl 키를 누른 다음 선택하였을 때 목록을 유지를 하기 위해 처리함.
        if (this.selectGroupNames.indexOf(groupName) === -1 && groupName !== 'OVERALL') {
            this.selectGroupNames.push(groupName);
        }

        if (groupName === 'OVERALL' || groupName === this.selectedGroupName) {
            groupName = 'OVERALL';

            for (ix = 0, ixLen = serverIdArr.length; ix < ixLen; ix++) {
                selectedIdArr[ix] = serverIdArr[ix];
            }

            for (ix = 0, ixLen = this.menuBarObjects.length; ix < ixLen; ix++) {
                menuObj = this.menuBarObjects[ix];

                if (menuObj.groupName === groupName) {
                    if (menuObj.isTitle) {
                        menuObj.isSelected = true;
                        if (this.displayGroupType === menuObj.groupType) {
                            menuObj.isVisible = true;
                        }
                    } else {
                        menuObj.isSelected = false;
                        if (this.displayGroupType === menuObj.groupType) {
                            menuObj.isVisible = false;
                        }
                    }
                } else {
                    menuObj.isSelected = false;

                    if (this.displayGroupType === menuObj.groupType) {
                        menuObj.isVisible = true;
                    }
                }
            }
            this.selectedGroupName = '';

        } else {
            if (selectObj.groupType === 0) {
                containServerArr = Comm.RTComm.ServerListByHostName(selectObj.groupName);
            } else {
                containServerArr = Comm.RTComm.ServerListInGroup(selectObj.groupName);
            }

            for (ix = 0, ixLen = this.menuBarObjects.length; ix < ixLen; ix++) {
                menuObj = this.menuBarObjects[ix];

                if (menuObj.isTitle) {
                    menuObj.isSelected = (menuObj.groupName === selectObj.groupName);
                    continue;
                }

                menuObj.isSelected = (containServerArr.indexOf(menuObj.id) !== -1);

                if (menuObj.isSelected) {
                    if (selectedNames.indexOf(menuObj.serverName) === -1) {
                        selectedNames[selectedNames.length] = menuObj.serverName;
                    }

                    if (selectedIdArr.indexOf(menuObj.id) === -1) {
                        selectedIdArr[selectedIdArr.length] = menuObj.id;
                    }
                }

                if (menuObj.groupType === this.displayGroupType) {
                    menuObj.isVisible = (menuObj.isTitle) ? true : (selectObj.groupName === menuObj.groupName) ? menuObj.isSelected : false;
                }
            }

            this.selectedGroupName = selectObj.groupName;
        }

        if (!this.monitorType || this.monitorType === 'WAS') {
            Comm.selectedWasArr.length = 0;
            Comm.selectedWasArr = selectedIdArr.concat();
        }

        if (selectedIdArr.length === serverIdArr.length) {
            common.RTMDataManager.clearSelectedAgent(this.monitorType);
            common.RTMDataManager.selectAgent('ALL', this.monitorType);

        } else {
            if (selectedIdArr.length > 0) {
                common.RTMDataManager.clearSelectedAgent(this.monitorType);
            }

            for (ix = 0, ixLen = selectedIdArr.length; ix < ixLen; ix++) {
                common.RTMDataManager.selectAgent(selectedIdArr[ix], this.monitorType);
            }
        }

        this.selectedServerNames = selectedNames.concat();

        if (this.frameChange) {
            this.frameChange();
        }
    },


    /**
     * 호스트/업무 목록을 다중 선택
     * Ctrl 키를 누르고서 그룹명을 선택한 경우 실행
     *
     * @param {object} selectObj
     */
    multiSelectGroupName: function(selectObj) {
        var menuObj;
        var ix, ixLen;

        var isUncheckGroup = false;

        var selectedIdArr = Comm.RTComm.getSelectedIdArr(this.monitorType);
        var serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType);

        var selectedNames = this.getSelectedNames();
        var groupName = selectObj.groupName;

        var containServerArr;
        var serverNameIndex, serverIdIndex;

        // 선택된 그룹명이 기존에 선택된 그룹명 목록에 있는지 체크해서
        // 선택된 그룹명이 있으면 목록에서 제거하고 없으면 추가한다.
        if (groupName && this.selectGroupNames.indexOf(groupName) === -1) {
            this.selectGroupNames.push(groupName);

        } else {
            this.selectGroupNames.splice(this.selectGroupNames.indexOf(groupName), 1);
            isUncheckGroup = true;
        }

        // OVERALL을 선택한 경우
        if (groupName === 'OVERALL' || !this.selectedGroupName || this.selectGroupNames.length === 0) {
            groupName = 'OVERALL';

            for (ix = 0, ixLen = serverIdArr.length; ix < ixLen; ix++) {
                selectedIdArr[ix] = serverIdArr[ix];
            }

            for (ix = 0, ixLen = this.menuBarObjects.length; ix < ixLen; ix++) {
                menuObj = this.menuBarObjects[ix];

                if (menuObj.groupName === groupName) {
                    if (menuObj.isTitle) {
                        menuObj.isSelected = true;
                        if (this.displayGroupType === menuObj.groupType) {
                            menuObj.isVisible = true;
                        }
                    } else {
                        menuObj.isSelected = true;
                        if (this.displayGroupType === menuObj.groupType) {
                            //menuObj.isVisible = false;
                        }
                    }
                } else {
                    menuObj.isSelected = true; //false;

                    if (this.displayGroupType === menuObj.groupType) {
                        menuObj.isVisible = true;
                    }
                }
            }
            this.selectedGroupName = '';

        } else {
            // OVERALL 이 아닌 그룹을 선택한 경우 서버 선택/해제 처리를 한다.

            // 선택된 그룹에 포함되는 서버 ID 목록을 가져온다.
            if (selectObj.groupType === 0) {
                // 호스트 그룹을 선택한 경우
                containServerArr = Comm.RTComm.ServerListByHostName(selectObj.groupName);

            } else {
                //업무 그룹을 선택한 경우
                containServerArr = Comm.RTComm.ServerListInGroup(selectObj.groupName);
            }

            for (ix = 0, ixLen = this.menuBarObjects.length; ix < ixLen; ix++) {
                menuObj = this.menuBarObjects[ix];

                // 메뉴 구성 타입이 타이틀 영역인 경우
                if (menuObj.isTitle) {
                    menuObj.isSelected = this.selectGroupNames.indexOf(menuObj.groupName) !== -1;
                    continue;
                }

                // 메뉴 구성 타입이 서버명 영역인 경우
                menuObj.isSelected = (containServerArr.indexOf(menuObj.id) !== -1 || selectedIdArr.indexOf(menuObj.id) !== -1);

                if (isUncheckGroup && containServerArr.indexOf(menuObj.id) !== -1) {
                    menuObj.isSelected = false;
                }

                serverNameIndex = selectedNames.indexOf(menuObj.serverName);
                serverIdIndex   = selectedIdArr.indexOf(menuObj.id);

                if (menuObj.isSelected) {
                    if (serverNameIndex === -1) {
                        selectedNames[selectedNames.length] = menuObj.serverName;
                    }

                    if (selectedIdArr.indexOf(menuObj.id) === -1) {
                        selectedIdArr[selectedIdArr.length] = menuObj.id;
                    }

                } else {
                    if (serverNameIndex !== -1) {
                        selectedNames.splice(serverNameIndex, 1);
                    }
                    if (serverIdIndex !== -1) {
                        selectedIdArr.splice(serverIdIndex, 1);
                    }
                }

                // 화면에 선택된 목록 타입이 호스트 목록인 경우 업무 목록을 숨기고 업무 목록인 경우 호스트 목록을 숨김.
                if (menuObj.groupType === this.displayGroupType) {
                    menuObj.isVisible = this.selectGroupNames.indexOf(menuObj.groupName) !== -1;
                }
            }

            this.selectedGroupName = selectObj.groupName;
        }

        if (!this.monitorType || this.monitorType === 'WAS') {
            Comm.selectedWasArr = selectedIdArr.concat();
        }

        // 선택된 서버 개수와 모니터링 화면에 보여지는 전체 서버 개수가 일치하는 경우
        if (selectedIdArr.length === serverIdArr.length) {

            // 모든 에이전트가 선택된 경우 OVERALL 로 표시처리가 되게 진행
            groupName = 'OVERALL';

            for (ix = 0, ixLen = this.menuBarObjects.length; ix < ixLen; ix++) {
                menuObj = this.menuBarObjects[ix];

                if (menuObj.groupName === groupName) {
                    if (menuObj.isTitle) {
                        menuObj.isSelected = true;
                        if (this.displayGroupType === menuObj.groupType) {
                            menuObj.isVisible = true;
                        }
                    } else {
                        menuObj.isSelected = false;
                        if (this.displayGroupType === menuObj.groupType) {
                            menuObj.isVisible = false;
                        }
                    }
                } else {
                    menuObj.isSelected = false;

                    if (this.displayGroupType === menuObj.groupType) {
                        menuObj.isVisible = true;
                    }
                }
            }
            this.selectedGroupName = '';

            // 다중 선택된 그룹명 배열 초기화
            this.selectGroupNames.length = 0;

            selectedNames.length = 0;
            selectedIdArr.length = 0;

            common.RTMDataManager.clearSelectedAgent(this.monitorType);
            common.RTMDataManager.selectAgent('ALL', this.monitorType);

        } else {
            if (selectedIdArr.length > 0) {
                common.RTMDataManager.clearSelectedAgent(this.monitorType);
            }

            for (ix = 0, ixLen = selectedIdArr.length; ix < ixLen; ix++) {
                common.RTMDataManager.selectAgent(selectedIdArr[ix], this.monitorType);
            }
        }

        this.selectedServerNames = selectedNames.concat();

        if (this.frameChange) {
            this.frameChange();
        }
    },


    /**
     * 알람 정보가 표시 대상 알람에 해당하는지 체크한다.
     *
     * @param {number} serverType - 서버타입
     * @param {number} serverId - 서버 ID
     */
    isDisplayAlarm: function(serverType, serverId) {
        var isDisplay = true;

        if ((this.monitorType === 'WAS' || !this.monitorType) && serverType !== 1) {
            isDisplay = false;
        }

        if (this.monitorType === 'WEB' && serverType !== 3) {
            isDisplay = false;
        }

        return isDisplay;
    },


    /**
     * Alarm Packet Data
     *
     * 0: time
     * 1: server_type   (1: WAS, 2: DB, 3:WEB-SERVER, 9: Host, 15: APIM)
     * 2: server_id
     * 3: server_name
     * 4: alert_resource_name
     * 5: value
     * 6: alert_level
     * 7: levelType
     * 8: alert_type
     * 9: descr
     *
     * @param {Object} adata
     */
    onAlarm: function(adata) {
        if (!adata) {
            adata = null;
            return;
        }

        // 화면에 표시 대상 알람인지 체크한다.
        if (this.isDisplayAlarm && !this.isDisplayAlarm(+adata[1], +adata[2])) {
            return;
        }

        // 최초 알람정보가 왔을 때만 실행한다.
        if (!this.initAlarmCheck) {
            this.initAlarmCheck = true;

            this.checkServerStatus();
        }

        this.drawAlarm(adata);

        adata = null;
    },


    /**
     * 이벤트 알람 정보 표시
     */
    drawAlarm: function(adata) {
        var ix, ixLen, kx, kxLen, statusArr;

        var serverId   = adata[2];
        var serverName = adata[3];
        var alertName  = adata[4];
        var alertValue = adata[5];
        var alertLevel = +adata[6];
        var alertDescr = adata[9];
        var menuObj;

        // 웹 프로세스가 모두 다운되었는지 체크하는 구분 값
        var isWebProcessDown = false;

        // 라이선스 알람을 체크할 때 알람 값이 0 이상인 경우 정상으로 체크한다.
        // description 항목 값이 'UNLIMITED' 인 경우 정상으로 체크해도 되지만 빈 값으로 오는 경우가 있어서
        // 화면에서 필터 처리를 함.
        if (alertName.toLocaleLowerCase() === 'license' && alertLevel > 0 && alertValue >= 0) {
            alertLevel = 0;
        }

        // 웹 프로세스 알람인지 체크한다.
        // 웹 프로세스 알람인 경우 description에 alive/down 상태 정보가 들어있다.
        // description 구조
        // 예) 2/1 --> alive 2개, down 1개
        if (alertName === realtime.webProcessAlarm.ACTIVE_DOWN && alertDescr) {

            statusArr = alertDescr.split('/');

            // 다운된 프로세스가 없는 경우(건수가 0인 경우) 표시를 하지 않는다.
            if (+statusArr[1] === 0) {
                alertLevel = 0;
                delete this.webProcessAlarm[serverId];

            } else {
                // 다운된 프로세스 건수가 있는 경우 표시를 한다.
                this.webProcessAlarm[serverId] = 'Alive : ' + statusArr[0] + ' / Down : ' + statusArr[1];

                if (+statusArr[0] === 0) {
                    alertLevel = 3;
                    isWebProcessDown = true;
                }
            }
        }

        for (ix = 0, ixLen = this.menuBarObjects.length; ix < ixLen; ix++) {
            menuObj = this.menuBarObjects[ix];
            if (menuObj.id === serverId) {

                if (alertLevel === 0) {
                    this.deleteAlarmInfo(menuObj, serverName, alertName);
                }

                menuObj.state = alertLevel;

                // TP인 경우 Server Down, TP Down, Disconnected 후 다른 알람이 들어오더라도 Down알람을 해제하지 않고
                // Server Boot, TP Boot, Connected 알람이 들어오기 전까지 상태를 유지하게 처리함.
                if (Comm.wasInfoObj[serverId] && Comm.wasInfoObj[serverId].type === 'TP' &&
                    Comm.RTComm.isDownByID(serverId) && realtime.bootAlarms.indexOf(alertName) == -1) {
                    menuObj.state = 3;
                }

                switch (alertName) {
                    case realtime.alarms.OS_CPU :
                        menuObj.cpuAlarmLevel = alertLevel;
                        break;

                    case realtime.alarms.OS_FREE_MEM :
                        menuObj.memAlarmLevel = alertLevel;
                        break;

                    case realtime.alarms.CONNECTED :
                    case realtime.alarms.SERVER_BOOT :
                    case realtime.alarms.API_BOOT :
                    case realtime.alarms.TP_BOOT :
                        if (Comm.RTComm.isExpiredLicense(serverId) !== true) {
                            menuObj.state = 0;
                            menuObj.stateText = '';
                        } else {
                            menuObj.stateText = 'LICENSE';
                        }
                        break;

                    case realtime.alarms.TP_DOWN :
                    case realtime.alarms.API_DOWN :
                    case realtime.alarms.SERVER_DOWN :
                    case realtime.alarms.SERVER_HANG :
                        menuObj.state = 3;
                        menuObj.stateText = 'DOWN';
                        break;

                    case realtime.alarms.DISCONNECTED :
                        menuObj.state = 3;
                        menuObj.stateText = 'DISCONNECT';
                        break;

                    case realtime.alarms.LICENSE  :
                        if (alertValue < 0) {
                            menuObj.state = 3;
                            menuObj.stateText = 'LICENSE';
                        }
                        break;

                    default:
                        if (!this.alarmList[serverName]) {
                            this.alarmList[serverName] = {};
                        }
                        if (!this.alarmList[serverName][alertName]) {
                            this.alarmList[serverName][alertName] = {};
                        }
                        this.alarmList[serverName][alertName] = {
                            lastTime: Date.now()
                        };

                        this.addIdx = this.alarmNameArr.length;

                        for (kx = 0, kxLen = this.alarmNameArr.length; kx < kxLen; kx++) {
                            if (serverName === this.alarmNameArr[kx].serverName &&
                                alertName  === this.alarmNameArr[kx].alertName) {
                                this.addIdx = kx;
                                break;
                            }
                        }
                        this.alarmNameArr[this.addIdx] = {
                            serverName: serverName,
                            alertName : alertName,
                            alertLevel: alertLevel
                        };
                        break;
                }

                if (isWebProcessDown) {
                    menuObj.state = 3;
                    menuObj.stateText = 'DOWN';
                }
            }
        }

        adata = null;
    },


    /**
     * 알람 삭제
     */
    deleteAlarmInfo: function(menuObj, serverName, alertName) {

        var ix, ixLen;

        if (this.alarmList[serverName] && this.alarmList[serverName][alertName]) {
            delete this.alarmList[serverName][alertName];
        }

        if (Ext.Object.isEmpty(this.alarmList[serverName])) {
            this.alarmList[serverName] = null;
        }

        for (ix = 0, ixLen = this.alarmNameArr.length; ix < ixLen;) {
            if (this.alarmNameArr[ix] &&
                serverName == this.alarmNameArr[ix].serverName &&
                alertName == this.alarmNameArr[ix].alertName) {

                Ext.Array.removeAt(this.alarmNameArr, ix);
                ix--;
            }
            ix++;
        }

        this.updateAlarmInfo(menuObj, serverName, alertName);

        serverName = null;
        alertName  = null;
    },


    /**
     * 알람 정보 업데이트
     *
     * @param {object} menuObj - 메뉴 정보
     * @param {string} serverName - 서버명
     * @param {string} alertName - 알람명
     */
    updateAlarmInfo: function(menuObj, serverName, alertName) {
        var maxLevel = 0, ix, ixLen;

        if (Ext.Object.isEmpty(this.alarmList[serverName])) {
            this.alarmList[serverName] = null;
            menuObj.state = 0;
        }

        for (ix = 0, ixLen = this.alarmNameArr.length; ix < ixLen; ix++) {
            if (serverName === this.alarmNameArr[ix].serverName &&
                alertName === this.alarmNameArr[ix].alertName &&
                maxLevel < this.alarmNameArr[ix].alertLevel) {

                maxLevel = this.alarmNameArr[ix].alertLevel;
            }
        }
        menuObj.state = maxLevel;

        menuObj    = null;
        serverName = null;
        alertName  = null;
    },


    /**
     * 알람 체크
     */
    clearAlarm: function() {
        this.diffSec = 0;

        var serverName, alertName, menuObj,
            ix, ixLen, jx, jxLen;

        for (ix = 0, ixLen = this.alarmNameArr.length; ix < ixLen; ix++) {
            if (!this.alarmNameArr[ix]) {
                continue;
            }
            serverName  = this.alarmNameArr[ix].serverName;
            alertName = this.alarmNameArr[ix].alertName;

            // Server Down, Server Hang, Disconnected 이외의 알람에 대해서
            // 설정한 시간안에 알람데이터가 오지 않는 경우 화면에서 삭제처리한다.
            if (!Ext.Array.contains(realtime.downAlarms, alertName) &&
                this.alarmList[serverName] && this.alarmList[serverName][alertName]) {

                this.diffSec = Ext.Date.diff(this.alarmList[serverName][alertName].lastTime , new Date(), Ext.Date.SECOND);

                if (this.diffSec > 3) {
                    for (jx = 0, jxLen = this.menuBarObjects.length; jx < jxLen; jx++) {
                        menuObj = this.menuBarObjects[jx];
                        if (menuObj.serverName === serverName) {
                            this.deleteAlarmInfo(menuObj, serverName, alertName);
                        }
                    }
                }
            }
        }

        this.checkServerStatus();
    },


    /**
     * 서버 상태 체크
     */
    checkServerStatus: function() {
        if (!Comm.Status) {
            return;
        }

        var status;
        var serverId;
        var menuObj;
        var isWebProcessDown;
        var ix, ixLen;

        for (ix = 0, ixLen = this.menuBarObjects.length; ix < ixLen; ix++) {
            menuObj = this.menuBarObjects[ix];
            serverId = menuObj.id;

            if (!serverId || serverId <= 0) {
                continue;
            }

            status = Comm.RTComm.getServerStatus(menuObj.serverType, serverId);

            if (Comm.RTComm.isDown(status) !== true && Comm.RTComm.isExpiredLicense(serverId) === true) {
                status = realtime.alarms.LICENSE;
            }

            switch (status) {
                case realtime.alarms.TP_DOWN :
                case realtime.alarms.API_DOWN :
                case realtime.alarms.SERVER_DOWN :
                case realtime.alarms.SERVER_HANG :
                    menuObj.state = 3;
                    menuObj.stateText = 'DOWN';
                    break;

                case realtime.alarms.DISCONNECTED :
                    menuObj.state = 3;
                    menuObj.stateText = 'DISCONNECT';
                    break;

                case realtime.alarms.LICENSE  :
                    menuObj.state = 3;
                    menuObj.stateText = 'LICENSE';
                    break;

                case realtime.alarms.CONNECTED :
                case realtime.alarms.SERVER_BOOT :
                case realtime.alarms.API_BOOT :
                case realtime.alarms.TP_BOOT :
                    menuObj.state = 0;
                    menuObj.stateText = '';
                    break;

                default :
                    menuObj.state = (menuObj.state > 0 && menuObj.state < 3) ? menuObj.state : 0;
                    menuObj.stateText = '';
                    break;
            }

            // 웹 프로세스의 실행/중단 상태를 체크
            // Alive 가 0 이고 Down 이 0 이상인 경우 DOWN 표시를 함. (APM 요청)
            isWebProcessDown = this.checkWebProcessStatus(serverId);

            if (isWebProcessDown) {
                menuObj.state = 3;
                menuObj.stateText = 'DOWN';
            }
        }
    },


    /**
     * 웹 프로세스 알람 상태를 체크
     *
     * @param {string} serverId - 서버 ID
     */
    checkWebProcessStatus: function(serverId) {
        var jx, jxLen;
        var alertName, alertDescr, statusArr;
        var isDown = false;

        if (!Repository.alarmListInfo || !Repository.alarmListInfo.WebServer) {
            return;
        }

        var webAlarmList = Repository.alarmListInfo.WebServer[serverId];

        if (!webAlarmList) {
            return;
        }

        if (!this.webProcessAlarm) {
            this.webProcessAlarm = {};
        }

        for (jx = 0, jxLen = webAlarmList.length; jx < jxLen; jx++) {
            alertName  = webAlarmList[jx].name;
            alertDescr = webAlarmList[jx].descr;

            if (alertName === realtime.webProcessAlarm.ACTIVE_DOWN && alertDescr) {

                statusArr = alertDescr.split('/');

                // 다운된 프로세스가 없는 경우(건수가 0인 경우) 표시를 하지 않는다.
                if (+statusArr[1] === 0) {
                    delete this.webProcessAlarm[serverId];

                } else {
                    // 다운된 프로세스 건수가 있는 경우 표시를 한다.
                    this.webProcessAlarm[serverId] = 'Alive : ' + statusArr[0] + ' / Down : ' + statusArr[1];
                }

                // Web Process Down 유무 확인하기
                if (+statusArr[0] === 0 && +statusArr[1] > 0) {
                    isDown = true;
                }
            }
        }

        return isDown;
    },


    /**
     * 모니터링 타입에 따라 선택된 서버들의 서버명 목록을 반환
     *
     * @return {array} 선택된 서버들의 서버명 목록
     */
    getSelectedNames: function() {
        var selectedNames;

        if (this.monitorType === 'TP') {
            selectedNames = realtime.selectedTPNames;

        } else if (this.monitorType === 'WEB') {
            selectedNames = realtime.selectedWebNames;

        } else if (this.monitorType === 'CD') {
            selectedNames = realtime.selectedCDNames;

        } else if (this.monitorType === 'E2E') {
            selectedNames = realtime.eteSelectedServerNames;

        } else {
            selectedNames = realtime.WasModeSelected;
        }
        return selectedNames;
    },


    /**
     * 툴팁 생성
     */
    createTooltip: function() {
        this.titleTooltip = $('<div"></div>').css({
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
        $('body').append(this.titleTooltip);
    },


    /**
     * Start Menu Draw
     */
    startAnimationFrame: function() {
        if (this.dataRefreshTimer) {
            clearInterval(this.dataRefreshTimer);
        }

        this.dataRefreshTimer = setInterval(function() {
            this.graph.update();
        }.bind(this), 500);

    },

    /**
     * Stop Menu Draw
     */
    stopAnimationFrame: function() {
        if (this.dataRefreshTimer) {
            clearInterval(this.dataRefreshTimer);
        }
    }

});