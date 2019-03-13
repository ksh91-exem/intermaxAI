Ext.define('rtm.src.rtmTrackByTaskChart', {
    extend       : 'Ext.container.Container',
    title        : common.Util.CTR('Task Track'),
    layout       : 'fit',
    style        : 'overflow: auto',
    cls          : 'rtmTrackByTaskChart',
    listeners    : {
        destroy: function() {
            this.cancelAnimation();
            this.cancelAllAlarmAnimation();
            this.firstPacket = true;

            if (this.svg) {
                this.svg.remove();
            }

            if (this.barTooltip) {
                this.hideBarToolTip();
            }

            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ACTIVETXN, this);
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, this);
        }
    },
    constructor: function() {
        this.callParent(arguments);
    },

    init: function(target, width, height) {
        this.setSize(this, width, height);
        this.initProperty(target);
        this.initDataSet();
    },

    setSize: function(target, width, height) {
        target.width = width;
        target.height = height;
    },

    initProperty: function(target) {
        var that = this,
            pos;
        this.target = target;

        this.popupFrame = {
            'activeTxnList'      : 'rtm.src.rtmActiveTxnList',
            'TPActiveTxnList'    : 'rtm.src.rtmTPActiveTxnList',
            'WebActiveTxnList'   : 'rtm.src.rtmWebActiveTxnList',
            'trackByTaskDetail'  : 'rtm.src.rtmTrackByTaskDetail'
        };
        this.iconImg = {
            src   : '../images/topology_icon.png'
        };
        this.iconPt = {
            xview : {x: 12,  y: 324, w: 13, h: 15},
            zoom  : {x: 37,  y: 324, w: 14, h: 14},
            xviewB: {x: 215, y: 525, w: 22, h: 25},
            zoomB : {x: 250, y: 525, w: 22, h: 25}
        };
        this.image = new Image();
        this.image.src = this.iconImg.src;

        if (!this.ctx) {
            this.canvas = d3
                .select('#' + this.target)
                .append('canvas');
        }
        if (!this.ctxPBar) {
            this.canvasPBar = d3
                .select('#' + this.target)
                .append('canvas');
        }
        if (!this.ctxEffect) {
            this.canvasEffect = d3
                .select('#' + this.target)
                .append('canvas');
        }
        if (!this.ctxAlarm) {
            this.canvasAlarm = d3
                .select('#' + this.target)
                .append('canvas');
        }
        if (!this.ctxImg) {
            this.canvasImg = d3
                .select('#' + target)
                .append('canvas');
        }
        this.ctxPBar = this.canvasPBar.node().getContext('2d');
        this.ctxEffect = this.canvasEffect.node().getContext('2d');
        this.ctxAlarm = this.canvasAlarm.node().getContext('2d');
        this.ctxImg = this.canvasImg.node().getContext('2d');

        this.eventFnManager = {
            'click'    : null,
            'mousemove': null
        };

        /* 마우스오버 이벤트 */
        this.canvasImg.on('mousemove', function() {
            if (that.closeTimer) {
                clearTimeout(that.closeTimer);
            }

            pos = d3.mouse(this);
            that.checkMousePos(that, pos, 'mousemove');
        });

        this.canvasImg.on('mouseleave', function() {
            that.closeTimer = setTimeout(function() {
                that.hideAlertDetail();
                if (!that.clicked) {
                    that.hideBarToolTip();
                }
            }, 100);
        });

        this.canvasImg.on('click', function() {
            var pos = d3.mouse(this);
            that.checkMousePos(that, pos, 'click');
        });

        this.linear = d3.scale.linear();

        this.wn = $('.rtmTrackByTaskChart');

        this.COLOR = {
            BACKGROUND            : '#2C2F36',
            BLACK                 : '#181B24',
            LEGEND                : '#4C5960',
            LABEL                 : '#ABAEB5',
            CHART_BORDER_OUTER    : '#B9F6F9',
            CHART_BORDER_INNER    : '#3B4B53',
            SM_CHART_BORDER_OUTER : '#3B4B53',
            SM_CHART_BORDER_INNER : '#B9F6F9',
            SERVER_NORMAL         : '#00A9FF',
            SERVER_NORMAL_LIGHT   : '#61CAFF',
            SERVER_NORMAL_DARK    : '#007FBF',
            SERVER_WARNING        : '#E6BE00',
            SERVER_WARNING_LIGHT  : '#F0D761',
            SERVER_WARNING_DARK   : '#8C7506',
            SERVER_CRITICAL       : '#E60000',
            SERVER_CRITICAL_LIGHT : '#F06161',
            SERVER_CRITICAL_DARK  : '#971616',
            SERVER_DOWN           : '#393c43',
            SERVER_DOWN_LIGHT     : '#85878c',
            PGBAR_BORDER          : '#1D1F26',
            PGBAR_SERVER_ON       : '#004790',
            PGBAR_DATA_ON         : '#00A9FF'
        };
        this.ALARM_COLOR = {
            'normal'  : this.COLOR.PGBAR_DATA_ON,
            'warning' : this.COLOR.SERVER_WARNING,
            'critical': this.COLOR.SERVER_CRITICAL,
            'down'    : this.COLOR.LEGEND
        };

        this.PROP = {};

        this.PROP.LABEL_WIDTH      = 100;
        this.PROP.LABEL_HEIGHT     = 36;
        this.PROP.COMPONENT_WIDTH  = (this.width - this.PROP.LABEL_WIDTH)  * 0.20;
        this.PROP.COMPONENT_HEIGHT = 45;
        this.PROP.BG_PGBAR_WIDTH   = this.PROP.COMPONENT_WIDTH - this.PROP.DIFF_PIE_AND_BAR - this.PROP.BG_PCHART_RADIAN * 2;
        this.PROP.BG_PCHART_RADIAN = 48;
        this.PROP.BG_PGBAR_HEIGHT  = 36;
        this.PROP.DIFF_PIE_AND_BAR = 10;

        // PIE CHART
        this.PROP.PCHART_BORDER_OUTER   = 37;
        this.PROP.PCHART_BORDER_INNER   = 32;
        this.PROP.PCHART_SERVER         = 28;
        this.PROP.PCHART_SERVER_LIGHT   = 20;
        this.PROP.PCHART_CENTER_CIRCLE  = 13;
        this.PROP.SM_PCHART_CIRCLE      = 10;
        this.PROP.SM_PCHART_CENTER      = 6;

        // PROGRESS BAR
        this.PROP.PGBAR_RECT_WIDTH      = 5;
        this.PROP.PGBAR_RECT_HEIGHT     = this.PROP.BG_PGBAR_HEIGHT / 4;

        this.animPosY = [];
        this.intervals = [];

        // resize시 중앙 정렬을 위한 간격 조정
        this.pushToRight = 0;

        this.firstPacket = true;

        // 업무 구간에서 발생한 알람 정보
        this.alarmInfos = {};
        this.alarmTimer = null;

        this.createAlarmInfoArea();
        this.createClickToolTip();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ACTIVETXN, this);
        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this);
    },

    hasTierData: function(processIdx) {
        var ix, ixLen, jx, jxLen,
            prop, propList, process, task;

        process = this.rtmTrackList[processIdx];

        for (ix = 0, ixLen = process.data.length; ix < ixLen; ix++) {
            task = process.data[ix];
            propList = Object.keys(task);
            for (jx = 0, jxLen = propList.length; jx < jxLen; jx++) {
                prop = propList[jx];
                if (prop !== 'legendColor' && prop !== 'time' && prop !== 'task' && prop !== 'dataOn') {
                    if (typeof task[prop] === 'number') {
                        if (task[prop] !== 0) {
                            return true;
                        }
                    } else if (typeof task[prop] === 'string') {
                        if (+task[prop] !== 0) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    },

    initDataSet: function() {
        var ix, ixLen, jx, jxLen, obj, tierName, tierIdList, elemPos;
        var tierList = [], exceptedList, lastExceptedIndex, idxOf;
        var bizId, bizIdList;
        var maxLen = 0, maxIdx = 0;

        if (this.rtmTrackList) {
            this.rtmTrackList = null;
        }

        this.elemPosition = [];
        this.rtmTrackList = [];
        this.packet = {};
        this.packet.data = [];
        this.taskMap = {};
        this.pgBarAnim = {};

        this.alarmLevelList = {};
        this.alarmGridList   = [];
        this.alarmGridLevelList = [];

        this.businessRegisterInfo = Comm.businessRegisterInfo;
        this.sortTierInfo         = Comm.sortTierInfo;
        // this.exceptedInfo         = Comm.exclusionInfo;
        this.exceptedInfo         = [];

        for (ix = 0, ixLen = this.businessRegisterInfo.length; ix < ixLen; ix++) {
            this.taskMap[this.businessRegisterInfo[ix].parent['bizId']] = {
                'bizName': this.businessRegisterInfo[ix].parent['bizName'],
                'tierIdList': []
            };
            tierIdList = this.taskMap[this.businessRegisterInfo[ix].parent['bizId']]['tierIdList'];
            for (jx = 0, jxLen = this.sortTierInfo.length; jx < jxLen; jx++) {
                obj = $.extend(true, {}, this.sortTierInfo[jx]);
                tierName = obj['tierName'];
                obj['tierList'] = Comm.bizGroupWasIdPairObj[tierName].slice();

                tierIdList.push(obj);
            }
        }

        if (!tierIdList) {
            return;
        }

        for (ix = 0, ixLen = tierIdList.length; ix < ixLen; ix++) {
            tierList.push(tierIdList[ix].tierId);
        }

        for (ix = 0, ixLen = this.exceptedInfo.length; ix < ixLen; ix++) {
            lastExceptedIndex = 987654321;
            tierIdList = this.taskMap[this.exceptedInfo[ix]['businessId']]['tierIdList'];
            exceptedList = this.exceptedInfo[ix]['tierId'];
            for (jx = 0, jxLen = exceptedList.length; jx < jxLen; jx++) {
                idxOf = tierList.indexOf(exceptedList[jx]);
                if (idxOf !== -1) {
                    lastExceptedIndex = Math.min(lastExceptedIndex, idxOf);
                }
            }
            tierIdList.splice(lastExceptedIndex);
        }

        bizIdList = Object.keys(this.taskMap);

        for (ix = 0, ixLen = bizIdList.length; ix < ixLen; ix++) {
            bizId = bizIdList[ix];
            obj = {};
            obj.process = this.taskMap[bizId]['bizName'];
            obj.processIdx = bizId;
            obj.data = [];

            elemPos = {};
            elemPos.process = this.taskMap[bizId]['bizName'];
            elemPos.labelPos = {};
            elemPos.data = [];

            tierIdList = this.taskMap[bizId]['tierIdList'];
            for (jx = 0, jxLen = tierIdList.length; jx < jxLen; jx++) {
                obj.data.push({
                    'task'             : tierIdList[jx]['tierName'],
                    'time'             : new Date().getTime(),
                    'exception_time'   : 0,
                    'active_txn_count' : 0,
                    'active_normal'    : 0,
                    'active_warning'   : 0,
                    'active_critical'  : 0,
                    'TPS'              : 0,
                    'elapsed_time'     : 0,
                    'legendColor'      : '',
                    'dataOn'           : 0,
                    'alarmOn'          : 0,
                    'status'           : 'normal',
                    'cnt'              : 0
                });

                elemPos.data.push({
                    'task'        : tierIdList[jx]['tierName'],
                    'piePos'      : {'x': 0, 'y': 0},
                    'legendPos'   : {'x': 0, 'y': 0},
                    'animPos'     : [],
                    'taskId'      : tierIdList[jx]['tierId'],
                    'alarmColor'  : '',
                    'prevAlarmColor' : '',
                    'alarmAnimNo' : 0
                });
            }
            this.rtmTrackList.push(obj);
            this.elemPosition.push(elemPos);
        }

        // 업무 프로세스 개수가 가장 많은 것의 리스트를 뽑아냄
        for (ix = 0, ixLen = this.rtmTrackList.length; ix < ixLen; ix++) {
            if (maxLen < this.rtmTrackList[ix].data.length) {
                maxLen = this.rtmTrackList[ix].data.length;
                maxIdx = ix;
            }
        }

        this.topLabel = [];
        for (ix = 0, ixLen = this.rtmTrackList[maxIdx].data.length; ix < ixLen; ix++) {
            this.topLabel[ix] = this.rtmTrackList[maxIdx].data[ix].task;
        }

        // pgBarAnim 생성
        for (ix = 0, ixLen = this.rtmTrackList.length; ix < ixLen; ix++) {
            if (!this.pgBarAnim[this.rtmTrackList[ix].process]) {
                this.pgBarAnim[this.rtmTrackList[ix].process] = [0, 0];
            }
        }
    },

    createClickToolTip: function() {
        var that = this;

        this.barTooltip = $('<div class="stackbar-chart-tooltip tooltipPanel barTooltip"></div>').css({
            'position': 'absolute',
            'display' : 'none',
            'z-index' : 20000,
            'color'   : this.COLOR.LABEL,
            'background-color': '#111111',
            'padding' : '5px 0px 0px 3px',
            'border'  : '1px solid #A3A3A3',
            'border-radius': '4px',
            'width'   : 100
        });

        this.barTail = $('<div class="barTail"></div>').css({
            'position': 'absolute',
            'width'   : 6,
            'height'  : 6,
            'z-index' : 30000,
            'background-color': '#111111',
            'transform'    : 'rotate(45deg)'
        });

        this.barTooltip.append(this.barTail);

        this.barTooltip.bind('mouseleave', function(e) {
            e.preventDefault();

            that.el.dom.style.cursor = 'default';

            that.barTooltip.css({'display': 'none'});
        });
        this.barTooltip.bind('mouseenter', function(e) {
            e.preventDefault();

            that.el.dom.style.cursor = 'pointer';

            that.barTooltip.css({'display': 'block'});
        });
    },

    createAlarmInfoArea: function() {
        this.floatingPnl = Ext.create('Exem.Container', {
            width    : 480,
            height   : 200,
            floating : true,
            shadow   : false,
            cls      : 'transParentPanel',
            layout   : {
                type : 'hbox',
                align: 'middle',
                pack : 'center'
            },
            listeners: {
                scope : this,
                render: function(_this) {
                    // 이벤트 리스너
                    _this.el.on('mouseover', function() {
                        if (this.closeTimer) {
                            clearTimeout(this.closeTimer);
                        }
                    }.bind(this));

                    _this.el.on('mouseleave', function() {
                        this.closeTimer = setTimeout(function() {
                            this.hideAlertDetail();
                        }.bind(this), 100);
                    }.bind(this));

                    _this.el.on('click', function() {
                        this.hideAlertDetail();
                    }.bind(this));
                }
            }
        });

        // 실제 alerm 리스트가 그려지는 부분,
        this.detailBodyArea = Ext.create('Ext.container.Container', {
            width     : 460,
            height    : 200,
            cls       : 'alertToolTip wide',
            updateFlag: false,
            html      : ''
        });

        this.floatingPnl.add(this.detailBodyArea);
    },

    draw: function(target, width, height) {
        var minWidth, minHeight, w, h;
        if (!this.rtmTrackList.length) {
            return;
        }

        minWidth  = 750;
        minHeight = 160;

        if (this.target !== target) {
            this.target = target;
        }

        if (!width) {
            width = minWidth;
        }
        if (!height) {
            height = minHeight;
        }

        w  = ( width  - 12 < minWidth ) ? minWidth : width - 12;
        h  = ( height - 12 < minHeight ) ? minHeight : height - 12;

        this.setSize(this, w, h);
        this.PROP.COMPONENT_WIDTH = w / this.topLabel.length;
        this.PROP.BG_PGBAR_WIDTH = this.PROP.COMPONENT_WIDTH + this.PROP.DIFF_PIE_AND_BAR - (this.PROP.BG_PCHART_RADIAN * 2) + 5;
        // Progress Bar 최소 너비설정하는 부분
        this.PROP.BG_PGBAR_WIDTH = this.PROP.BG_PGBAR_WIDTH  < 160 ? 160 : this.PROP.BG_PGBAR_WIDTH;

        // 전체 최소 너비 설정하는 부분
        if (w < (135 + (this.PROP.BG_PCHART_RADIAN * 2)) * this.topLabel.length) {
            w = (135 + (this.PROP.BG_PCHART_RADIAN * 2)) * this.topLabel.length;
        }

        this.canvas.attr({'width' : w, 'height' : h});
        this.canvasPBar.attr({'width' : w, 'height' : h});
        this.canvasEffect.attr({'width' : w, 'height' : h});
        this.canvasAlarm.attr({'width': w, 'height': h});
        this.canvasImg.attr({'width' : w, 'height' : h});
        this.ctx = this.canvas.node().getContext('2d');
        this.ctxPBar = this.canvasPBar.node().getContext('2d');
        this.ctxEffect = this.canvasEffect.node().getContext('2d');
        this.ctxAlarm = this.canvasAlarm.node().getContext('2d');
        this.ctxImg = this.canvasImg.node().getContext('2d');

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.clearRect(0, 0, this.prevW, this.prevH);
        this.ctx.restore();

        this.ctxPBar.save();
        this.ctxPBar.beginPath();
        this.ctxPBar.clearRect(0, 0, this.prevW, this.prevH);
        this.ctxPBar.restore();


        this.prevW = w;
        this.prevH = h;

        this.drawManager();
        this.drawResizedComponents();

        this.alarmTimer = setTimeout(this.setAlarmAnimationManager.bind(this), 1500);
    },

    drawManager: function(skipPGBar) {
        var ix, ixLen, jx, jxLen, posY, labelPosY, initSetting;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.clearRect(0, 0, this.prevW, this.prevH);
        this.ctx.restore();

        for (ix = 0, ixLen = this.rtmTrackList.length; ix < ixLen; ix++) {
            posY = ix * 130 + 70;
            labelPosY = posY - 35;
            initSetting = (ix === 0);

            this.drawLabel(ix, labelPosY, this.rtmTrackList[ix].process, initSetting);
            for (jx = 0, jxLen = this.rtmTrackList[ix].data.length; jx < jxLen; jx++) {
                this.drawBackgrounds(
                    this.pushToRight + jx * (this.PROP.BG_PGBAR_WIDTH + this.PROP.BG_PCHART_RADIAN * 2) - jx
                    * (this.PROP.DIFF_PIE_AND_BAR * 2) - (this.PROP.BG_PGBAR_WIDTH / 2) + this.PROP.DIFF_PIE_AND_BAR + 5,
                    posY + 30,
                    jx
                );
            }
            for (jx = 0, jxLen = this.rtmTrackList[ix].data.length; jx < jxLen; jx++) {
                this.drawContents(
                    this.pushToRight + jx * (this.PROP.BG_PGBAR_WIDTH + this.PROP.BG_PCHART_RADIAN * 2) - jx
                    * (this.PROP.DIFF_PIE_AND_BAR * 2) - (this.PROP.BG_PGBAR_WIDTH / 2) + this.PROP.DIFF_PIE_AND_BAR + 5,
                    posY + 30,
                    this.rtmTrackList[ix].data[jx],
                    ix,
                    jx,
                    skipPGBar
                );
            }

            if (this.animPosY.findIndex(function(d) {
                return d === arguments[1];
            }.bind(null, posY)) === -1) {
                this.animPosY.push(posY + 30);
            }
        }
        posY = 30;
        for (ix = 0, ixLen = this.topLabel.length; ix < ixLen; ix++) {
            this.drawTopLabel(
                this.pushToRight + ix * (this.PROP.BG_PGBAR_WIDTH + this.PROP.BG_PCHART_RADIAN * 2) - ix
                * (this.PROP.DIFF_PIE_AND_BAR * 2) - (this.PROP.BG_PGBAR_WIDTH / 2) + this.PROP.DIFF_PIE_AND_BAR + 5,
                posY,
                this.topLabel[ix]
            );
        }

        if (!this.isAnimSet) {
            this.setAnimation();
        }

        this.getMaxAlarmLevel();
        this.drawAlarmChange();
    },

    drawContents: function(x, y, data, processIdx, taskIdx, skipPGBar) {
        this.drawLegend(x, y, data, processIdx, taskIdx);
        this.drawPieChart(x, y, data, processIdx, taskIdx);
        if (!skipPGBar && taskIdx > 0) {
            this.drawProgressBar(x, y);
        }
    },

    drawTopLabel: function(x, y, text) {
        var posX, posY;
        posX = x + this.PROP.BG_PGBAR_WIDTH + this.PROP.BG_PCHART_RADIAN - this.PROP.DIFF_PIE_AND_BAR;
        posY = y;

        this.ctx.save();
        this.ctx.fillStyle = this.COLOR.LABEL;
        this.ctx.font = this.setFontSize(17);
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, posX, posY);
        this.ctx.restore();
    },

    drawLabel: function(x, y, text, initSetting) {
        var posX = x + this.PROP.BG_PGBAR_WIDTH - 76 - ((this.PROP.BG_PGBAR_WIDTH - this.PROP.DIFF_PIE_AND_BAR) / 2) - 2;
        var labelColors = realtime.serverColorMap.BIZ || realtime.DefaultColors;
        var labelColor;

        if (initSetting) {
            if (posX < 10) {
                this.pushToRight = -posX + 30;
            } else {
                this.pushToRight = 15;
            }
        }

        posX += this.pushToRight;

        if (Array.isArray(labelColors)) {
            labelColor = labelColors[x];
        } else {
            labelColor = labelColors[Object.keys(labelColors)[x]];
        }

        this.ctx.fillStyle = labelColor;
        this.ctx.rect(posX, y + 11, 8, 14);
        this.ctx.fill();

        this.ctx.fillStyle  = this.COLOR.LABEL;
        this.ctx.font = this.setFontSize(13);
        this.ctx.fillText(text, posX + 15, y + 23);

        this.elemPosition[x].labelPos = {x: posX, y: y};
    },

    drawBackgrounds: function(x, y, taskIdx) {
        this.ctx.fillStyle = this.COLOR.BACKGROUND;
        this.ctx.strokeStyle = this.COLOR.BACKGROUND;

        // draw circle background
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x + this.PROP.BG_PGBAR_WIDTH + this.PROP.BG_PCHART_RADIAN - this.PROP.DIFF_PIE_AND_BAR
            , y + (this.PROP.BG_PGBAR_HEIGHT / 2)
            , this.PROP.BG_PCHART_RADIAN, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.restore();

        if (taskIdx > 0) {
            // draw bar background
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#1111aa';
            this.ctx.rect(x, y, this.PROP.BG_PGBAR_WIDTH, this.PROP.BG_PGBAR_HEIGHT);
            this.ctx.fill();
            this.ctx.restore();
        }
    },

    drawLegend: function(x, y, data, processIdx, taskIdx) {
        var posX, posY, cx, cy, tps, ms, color, status, clearStart, clearEnd;
        var lineAway, textAway, circleRad;

        status = this.rtmTrackList[processIdx].data[taskIdx].status;
        color = this.rtmTrackList[processIdx].data[taskIdx].legendColor || this.COLOR.PGBAR_DATA_ON;
        lineAway = 25;
        textAway = 65;
        circleRad = 3.3;
        posX = x + this.PROP.BG_PGBAR_WIDTH + this.PROP.BG_PCHART_RADIAN - this.PROP.DIFF_PIE_AND_BAR;
        posY = y + (this.PROP.BG_PGBAR_HEIGHT / 2);

        cx = posX + Math.cos(Math.PI + Math.PI / 3.3) * this.PROP.BG_PCHART_RADIAN;
        cy = posY + Math.sin(Math.PI + Math.PI / 3.3) * this.PROP.BG_PCHART_RADIAN;

        if (status === 'down') {
            tps = '0';
            ms = '0.00';
            clearStart = 35;
            clearEnd = 65;
        } else {
            tps = data.TPS;
            ms = data.cnt === 0 ? '0.00' : common.Util.numberWithComma((data.elapsed_time / data.cnt).toFixed(2));
            clearStart = 30;
            clearEnd = 35;
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.clearRect(cx - textAway + clearStart, cy - 7, -(this.ctx.measureText(ms).width + this.ctx.measureText(' ms').width + clearEnd), 28);

        this.ctx.save();
        this.ctx.strokeStyle = this.COLOR.LEGEND;
        this.ctx.font = this.setFontSize(14);
        this.ctx.lineWidth = 2;

        // 더듬이 부분
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(posX, posY);
        this.ctx.lineTo(cx, cy);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(cx - lineAway, cy);
        this.ctx.stroke();

        // 레이블 부분
        this.ctx.fillStyle = this.COLOR.LEGEND;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - lineAway, cy);
        this.ctx.arc(cx - lineAway, cy, circleRad, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = this.COLOR.LABEL;
        this.ctx.fillText('TPS', cx - lineAway - circleRad - 30, cy + 4);
        this.ctx.restore();

        // text 부분
        if (status === 'down') {
            this.ctx.fillStyle = this.COLOR.SERVER_DOWN_LIGHT;
            if (this.currentContextPos && this.currentContextPos.processIdx === processIdx
                && this.currentContextPos.taskIdx === taskIdx) {
                this.removeCtxContextMenu(this);
            }
        } else {
            this.ctx.fillStyle = color;
        }

        this.ctx.textAlign = 'end';
        this.ctx.fillText(tps, cx - textAway, cy + 4);
        this.ctx.restore();

        cx = posX + Math.cos(Math.PI + Math.PI / 4) * this.PROP.PCHART_BORDER_OUTER;
        cy = posY + Math.sin(Math.PI + Math.PI / 4) * this.PROP.PCHART_BORDER_OUTER;

        // 더듬이 부분
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(cx - lineAway, cy);
        this.ctx.stroke();
        this.ctx.restore();

        // 레이블 부분
        this.ctx.fillStyle = this.COLOR.LEGEND;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - lineAway, cy);
        this.ctx.arc(cx - lineAway, cy, circleRad, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = this.COLOR.LABEL;
        this.ctx.fillText('ms', cx - lineAway - circleRad - 29, cy + 4);
        this.ctx.restore();

        // text 부분
        if (status === 'down') {
            this.ctx.fillStyle = this.COLOR.SERVER_DOWN_LIGHT;
        } else {
            this.ctx.fillStyle = color;
        }
        this.ctx.textAlign = 'end';
        this.ctx.fillText(ms, cx - textAway - 1.5, cy + 4);
        this.ctx.restore();
    },

    drawPieChart: function(x, y, data, processIdx, taskIdx) {
        var posX, posY, nor, war, cri, sum, rtmTrackData;
        posX = x + this.PROP.BG_PGBAR_WIDTH + this.PROP.BG_PCHART_RADIAN - this.PROP.DIFF_PIE_AND_BAR;
        posY = y + (this.PROP.BG_PGBAR_HEIGHT / 2);
        nor = data.active_normal;
        war = data.active_warning;
        cri = data.active_critical;
        sum = nor + war + cri;
        rtmTrackData = this.rtmTrackList[processIdx].data[taskIdx];

        this.elemPosition[processIdx].data[taskIdx].piePos.x = posX;
        this.elemPosition[processIdx].data[taskIdx].piePos.y = posY;

        // 가장 바깥 테두리
        this.ctx.save();
        this.ctx.fillStyle = this.COLOR.BLACK;
        this.ctx.lineWidth = 1.5;
        if (rtmTrackData.status !== 'down' && rtmTrackData.dataOn === 1) {
            this.ctx.strokeStyle = this.COLOR.CHART_BORDER_OUTER;
            this.ctx.beginPath();
            this.ctx.arc(posX, posY, this.PROP.PCHART_BORDER_OUTER, 0, 2 * Math.PI);
        } else {
            this.ctx.strokeStyle = this.COLOR.SERVER_DOWN;
            this.ctx.beginPath();
            this.ctx.arc(posX, posY, this.PROP.PCHART_BORDER_OUTER + 1, 0, 2 * Math.PI);
        }
        this.ctx.fill();
        this.ctx.restore();

        // 안쪽 테두리
        this.ctx.save();
        this.ctx.strokeStyle = this.COLOR.CHART_BORDER_INNER;
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.arc(posX, posY, this.PROP.PCHART_BORDER_INNER, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.restore();

        if (rtmTrackData.status !== 'down') {
            // 데이터 부분 표현하기 - normal
            this.ctx.save();
            this.ctx.fillStyle = this.COLOR.SERVER_NORMAL;
            this.ctx.beginPath();
            this.ctx.arc(posX, posY, this.PROP.PCHART_SERVER, 0, nor);
            this.ctx.lineTo(posX, posY);
            this.ctx.fill();

            this.ctx.fillStyle = this.COLOR.SERVER_NORMAL_LIGHT;
            this.ctx.beginPath();
            this.ctx.arc(posX, posY, this.PROP.PCHART_SERVER_LIGHT, 0, nor);
            this.ctx.lineTo(posX, posY);
            this.ctx.fill();
            this.ctx.restore();

            sum -= nor;

            // 데이터 부분 표현하기 - warning
            if (sum > 0) {
                this.ctx.save();
                this.ctx.fillStyle = this.COLOR.SERVER_WARNING;
                this.ctx.beginPath();
                this.ctx.arc(posX, posY, this.PROP.PCHART_SERVER, nor, nor + war);
                this.ctx.lineTo(posX, posY);
                this.ctx.fill();

                this.ctx.fillStyle = this.COLOR.SERVER_WARNING_LIGHT;
                this.ctx.beginPath();
                this.ctx.arc(posX, posY, this.PROP.PCHART_SERVER_LIGHT, nor, nor + war);
                this.ctx.lineTo(posX, posY);
                this.ctx.fill();
                this.ctx.restore();

                sum -= war;
            }

            // 데이터 부분 표현하기 - critical
            if (sum > 0.000001) {
                this.ctx.save();
                this.ctx.fillStyle = this.COLOR.SERVER_CRITICAL;
                this.ctx.beginPath();
                this.ctx.arc(posX, posY, this.PROP.PCHART_SERVER, nor + war, Math.PI * 2);
                this.ctx.lineTo(posX, posY);
                this.ctx.fill();

                this.ctx.fillStyle = this.COLOR.SERVER_CRITICAL_LIGHT;
                this.ctx.beginPath();
                this.ctx.arc(posX, posY, this.PROP.PCHART_SERVER_LIGHT, nor + war, Math.PI * 2);
                this.ctx.lineTo(posX, posY);
                this.ctx.fill();
                this.ctx.restore();
            }
        } else {
            // SERVER_DOWN 일 때
            // 데이터 부분 표현하기
            this.ctx.save();
            this.ctx.fillStyle = this.COLOR.SERVER_DOWN;
            this.ctx.beginPath();
            this.ctx.arc(posX, posY, this.PROP.PCHART_SERVER, 0, Math.PI * 2);
            this.ctx.lineTo(posX, posY);
            this.ctx.fill();
            this.ctx.restore();

            // 데이터 부분 표현하기 - light
            this.ctx.save();
            this.ctx.fillStyle = this.COLOR.SERVER_DOWN_LIGHT;
            this.ctx.beginPath();
            this.ctx.arc(posX, posY, this.PROP.PCHART_SERVER_LIGHT, 0, Math.PI * 2);
            this.ctx.lineTo(posX, posY);
            this.ctx.fill();
            this.ctx.restore();
        }

        // 안쪽 작은 원 그리기
        this.ctx.save();
        this.ctx.fillStyle = this.COLOR.BLACK;
        this.ctx.beginPath();
        this.ctx.arc(posX, posY, this.PROP.PCHART_CENTER_CIRCLE, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        this.ctx.save();
        this.ctx.fillStyle = this.COLOR.BLACK;
        this.ctx.strokeStyle = this.COLOR.SM_CHART_BORDER_OUTER;
        this.ctx.lineWidth = 1.3;
        this.ctx.beginPath();
        this.ctx.arc(posX, posY, this.PROP.SM_PCHART_CIRCLE, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();

        this.ctx.save();
        this.ctx.strokeStyle = this.COLOR.SM_CHART_BORDER_INNER;
        this.ctx.fillStyle = this.COLOR.BLACK;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(posX, posY, this.PROP.SM_PCHART_CENTER, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    },

    drawProgressBar: function(x, y) {
        var ix, ixLen, posX, posY;
        posY = y + this.PROP.BG_PGBAR_HEIGHT / 2 - this.PROP.PGBAR_RECT_HEIGHT / 2;
        ixLen = Math.floor(this.PROP.BG_PGBAR_WIDTH / this.PROP.PGBAR_RECT_WIDTH);

        this.ctxPBar.save();
        this.ctxPBar.strokeStyle = this.COLOR.PGBAR_BORDER;
        this.ctxPBar.fillStyle = this.COLOR.PGBAR_SERVER_ON;
        this.ctxPBar.lineWidth = 1.3;
        for (ix = 0; ix < ixLen; ix++) {
            posX = x + (ix * this.PROP.PGBAR_RECT_WIDTH);

            this.ctxPBar.beginPath();
            this.ctxPBar.rect(posX, posY, this.PROP.PGBAR_RECT_WIDTH, this.PROP.PGBAR_RECT_HEIGHT);
            this.ctxPBar.stroke();
            this.ctxPBar.fill();
        }

        this.ctxPBar.restore();
    },

    drawResizedComponents: function() {
        this.drawAlarmChange();
    },

    drawAlarmMeter: function(x, y, c, processIdx, taskIdx, status) {
        var posX, posY, color, width, rad;

        if (this.rtmTrackList[processIdx].data[taskIdx].dataOn !== 1) {
            return;
        }

        posX = x + this.PROP.BG_PGBAR_WIDTH + this.PROP.BG_PCHART_RADIAN - this.PROP.DIFF_PIE_AND_BAR;
        posY = y + (this.PROP.BG_PGBAR_HEIGHT / 2);
        width = 5.5;

        d3.svg.arc()
            .innerRadius(0)
            .outerRadius(this.PROP.BG_PCHART_RADIAN)
            .startAngle(Math.PI * 2)
            .endAngle(Math.PI / 2);

        // 알람 부분 - Canvas로 작업이 되야하는 경우에 주석을 살림
        if (c === this.ALARM_COLOR['normal'] || c === '') {
            color = 'none';
            status = 'normal';
        } else {
            color = c;
        }

        rad = this.PROP.PCHART_BORDER_OUTER;
        this.ctxAlarm.clearRect(posX - rad * 1.5, posY - rad * 1.5, rad * 3, rad * 3);

        if (status !== 'normal' && status !== 'down') {
            this.ctxAlarm.save();
            this.ctxAlarm.strokeStyle = color;
            this.ctxAlarm.lineWidth = width;
            this.ctxAlarm.beginPath();
            this.ctxAlarm.arc(posX, posY, rad, 0, Math.PI * 2);
            this.ctxAlarm.stroke();
            this.ctxAlarm.restore();
        }
    },

    drawAlarmChange: function() {
        var ix, ixLen, jx, jxLen, posY;
        var legendX, legendY, status, alarmColor, isDown;

        for (ix = 0, ixLen = this.rtmTrackList.length; ix < ixLen; ix++) {
            posY = ix * 130 + 70;

            for (jx = 0, jxLen = this.rtmTrackList[ix].data.length; jx < jxLen; jx++) {
                legendX = this.pushToRight + jx * (this.PROP.BG_PGBAR_WIDTH + this.PROP.BG_PCHART_RADIAN * 2) - jx
                    * (this.PROP.DIFF_PIE_AND_BAR * 2) - (this.PROP.BG_PGBAR_WIDTH / 2) + this.PROP.DIFF_PIE_AND_BAR + 5;
                legendY = posY + 30;

                // 알람 관련 데이터
                isDown = this.checkBizTierDown(ix, jx);

                if (isDown) {
                    status = 'down';
                    this.rtmTrackList[ix].data[jx].status = status;
                } else {
                    status = this.rtmTrackList[ix].data[jx].status;
                }

                alarmColor = this.elemPosition[ix].data[jx].alarmColor;

                this.drawAlarmMeter(legendX, legendY, alarmColor, ix, jx, status);
                this.drawLegend(legendX, legendY, this.rtmTrackList[ix].data[jx], ix, jx);
                this.drawPieChart(legendX, legendY, this.rtmTrackList[ix].data[jx], ix, jx);
            }
        }
    },

    drawCtxContextMenu: function(that, posX, posY, type) {
        var iconPt = that.iconPt;

        that.ctxImg.save();
        that.ctxImg.fillStyle = 'rgba(24, 27, 36, 0.90)';

        if (type !== 'CD') {

            that.ctxImg.beginPath();
            that.ctxImg.arc(posX + 0.25, posY, that.PROP.PCHART_SERVER, -Math.PI / 2, Math.PI / 2);
            that.ctxImg.fill();

            that.ctxImg.beginPath();
            that.ctxImg.arc(posX - 0.25, posY, that.PROP.PCHART_SERVER, Math.PI / 2, -Math.PI / 2);
            that.ctxImg.fill();
            that.ctxImg.restore();

            that.ctxImg.drawImage(
                that.image, iconPt.xviewB.x, iconPt.xviewB.y, iconPt.xviewB.w, iconPt.xviewB.h,
                posX - 27, posY - 12, iconPt.xviewB.w, iconPt.xviewB.h
            );
            that.ctxImg.drawImage(
                that.image, iconPt.zoomB.x, iconPt.zoomB.y, iconPt.zoomB.w, iconPt.zoomB.h,
                posX + 5, posY - 12, iconPt.zoomB.w, iconPt.zoomB.h
            );
            that.ctxImg.restore();

        } else {

            that.ctxImg.beginPath();
            that.ctxImg.arc(posX, posY, that.PROP.PCHART_SERVER, 0, Math.PI * 2);
            that.ctxImg.fill();

            that.ctxImg.drawImage(
                that.image, iconPt.xviewB.x, iconPt.xviewB.y, iconPt.xviewB.w, iconPt.xviewB.h,
                posX - 13, posY - 12, iconPt.xviewB.w, iconPt.xviewB.h
            );

        }

        that.ctxImg.restore();
        that.el.dom.style.cursor = 'pointer';
    },

    removeCtxContextMenu: function(that) {
        if (that.cls === 'rtmTrackByTaskChart') {
            that.ctxImg.clearRect(0, 0, that.prevW, that.prevH);
        }
    },

    /**
     * 프로그레스바는 진행되는 과정에서 계속 자신이 출발한 지점의 알람 색을 기준으로 색을 갖게 된다.
     * 출발한 시점과 프로그레스 바가 다음 구간(tier)으로 나아가고 있는 도중에 알람 색이 바뀔 가능성이 존재한다.
     * 그래서, 프로그레스 바가 출발할 그 시점의 알람색을 prevAlarmColor에 넣는다.
     * 일반 alarmColor 프로퍼티는, 현재 진행중인 프로그레스 바가 참조할 일이 없는, 가장 최신에 들어온 알람이다. 즉, 다음 프로그레스 바가 참조하게 될 알람이다.
     */
    setAlarmColor: function() {
        var ix, ixLen, jx, jxLen,
            bizName, bizIdx, bizNameList;

        bizNameList = Object.keys(this.pgBarAnim);
        for (ix = 0, ixLen = bizNameList.length; ix < ixLen; ix++) {
            bizName = bizNameList[ix];
            if (this.pgBarAnim[bizName][1] === 0) {
                bizIdx = this._getBizIdWidthName(bizName);

                if (!bizIdx) {
                    return;
                }

                if (bizIdx !== -1) {
                    for (jx = 0, jxLen = this.elemPosition[bizIdx].data.length; jx < jxLen; jx++) {
                        this.elemPosition[bizIdx].data[jx].prevAlarmColor = this.elemPosition[bizIdx].data[jx].alarmColor || this.COLOR.PGBAR_DATA_ON;
                    }
                }
            }
        }
    },

    setFontSize: function(v) {
        return v + 'px Droid Sans, NanumGothic';
    },

    // Progress Bar 애니메이션을 실행하는 함수
    invokeAnimation: function(x, y, cnt, endCnt, process, processIdx, serverOnN, serverDownList, trackList) {
        var ix, ixLen, posX, posY, drawX, stickN, lastIdx, color;
        if (!this.rtmTrackList.length) {
            return;
        }

        if (cnt === 0) {
            if (!this.hasTierData(processIdx)) {
                this.pgBarAnim[process][1] = 0;
                return;
            }
        }

        if (this.pgBarAnim[process][1] === 0) {
            this.pgBarAnim[process][1] = 1;
        }

        posX = this.pushToRight + x - this.PROP.LABEL_WIDTH - (this.PROP.BG_PGBAR_WIDTH / 2) + this.PROP.DIFF_PIE_AND_BAR + 5;
        posY = y + this.PROP.BG_PGBAR_HEIGHT / 2 - this.PROP.PGBAR_RECT_HEIGHT / 2;
        stickN = 4;

        if (cnt === 0) {
            for (ix = 0, ixLen = trackList.length; ix < ixLen; ix++) {
                if (trackList[ix].status !== 'down' && trackList[ix].TPS !== 0) {
                    serverDownList.push(0);
                    serverOnN++;
                } else {
                    serverDownList.push(1);
                }
            }

            if (!serverOnN) {
                serverOnN = null;
                return;
            }
        }

        if (cnt === 0) {
            if (serverDownList.indexOf(0) !== -1) {
                if (serverDownList.length > 1) {
                    if (serverDownList[ix - 2] === 0) {
                        if (serverDownList[ix - 1] === 1) {
                            serverDownList[ix - 1] = 0;
                            serverOnN += 1;
                        }
                    }
                }
            }
        }

        lastIdx = serverDownList.slice(0, serverDownList.length - 1).lastIndexOf(0);
        lastIdx = lastIdx === 0 ? 1 : lastIdx + 1;

        ixLen = (this.PROP.BG_PGBAR_WIDTH / this.PROP.PGBAR_RECT_WIDTH);
        for (ix = 0; ix < trackList.length; ix ++) {
            if (ix > 0 && serverDownList[ix - 1] !== 1) {
                this.ctxPBar.strokeStyle = this.COLOR.PGBAR_BORDER;
                this.ctxPBar.lineWidth = 1;
                this.ctxPBar.save();
                this.ctxPBar.beginPath();

                drawX = posX + ix * (this.PROP.BG_PGBAR_WIDTH + (this.PROP.PCHART_BORDER_OUTER + 1) * 2);
                color = this._getTierAlarmColor(processIdx, drawX);


                if (cnt < stickN) {
                    // 애니메이션이 처음 나오기 시작할 때
                    // this.ctxPBar.fillStyle = this.COLOR.PGBAR_DATA_ON;
                    this.ctxPBar.fillStyle = color;
                    this.ctxPBar.rect(drawX,
                        posY, this.PROP.PGBAR_RECT_WIDTH, this.PROP.PGBAR_RECT_HEIGHT);
                    this.ctxPBar.stroke();
                    this.ctxPBar.fill();
                } else if (cnt >= Math.floor(ixLen) || endCnt > 1) {
                    // 애니메이션이 종료지점에 도달하면
                    this.ctxPBar.save();
                    this.ctxPBar.fillStyle = this.COLOR.PGBAR_SERVER_ON;
                    this.ctxPBar.rect(drawX - stickN * this.PROP.PGBAR_RECT_WIDTH,
                        posY, this.PROP.PGBAR_RECT_WIDTH, this.PROP.PGBAR_RECT_HEIGHT);
                    this.ctxPBar.stroke();
                    this.ctxPBar.fill();
                    this.ctxPBar.restore();

                    if (ix >= serverOnN - 1) {
                        if (endCnt >= stickN) {
                            if (ix >= lastIdx) {
                                serverOnN = 0;
                                // cancelAnimationFrame(this.pgBarAnim[process][0]);
                                this.pgBarAnim[process][1] = 0;
                                return;
                            }
                        } else {
                            if (ix >= lastIdx) {
                                endCnt++;
                                cnt--;
                            }
                        }
                    }
                } else {
                    // 애니메이션이 중간지점에 있을 때
                    this.ctxPBar.fillStyle = this.COLOR.PGBAR_SERVER_ON;
                    this.ctxPBar.rect(drawX - stickN * this.PROP.PGBAR_RECT_WIDTH,
                        posY, this.PROP.PGBAR_RECT_WIDTH, this.PROP.PGBAR_RECT_HEIGHT);
                    this.ctxPBar.stroke();
                    this.ctxPBar.fill();


                    this.ctxPBar.fillStyle = color;
                    this.ctxPBar.beginPath();
                    this.ctxPBar.rect(drawX,
                        posY, this.PROP.PGBAR_RECT_WIDTH, this.PROP.PGBAR_RECT_HEIGHT);
                    this.ctxPBar.stroke();
                    this.ctxPBar.fill();
                }
                this.ctxPBar.restore();
            }
        }

        if (!this.isAnimationCanceled) {
            this.pgBarAnim[process][0] = requestAnimationFrame(
                this.invokeAnimation.bind(this, x + this.PROP.PGBAR_RECT_WIDTH, y, cnt + 1, endCnt, process, processIdx, serverOnN, serverDownList, trackList)
            );
        }
    },

    invokeAlarmAnimation: function(x, y, c, lineWidth, alpha, alphaRate, startRad, endRad, radRate, processIdx, taskIdx) {
        if (startRad >= endRad) {
            this.cancelAlarmAnimation(processIdx, taskIdx);
            return;
        }

        this.ctxEffect.clearRect(x - endRad - 5, y - endRad - 5, endRad * 2 + 10, endRad * 2 + 10);

        this.ctxEffect.save();
        this.ctxEffect.strokeStyle = c === this.ALARM_COLOR['normal'] ? 'transparent' : c;
        this.ctxEffect.lineWidth = lineWidth;
        this.ctxEffect.globalAlpha = alpha < 0 ? 0 : alpha;
        this.ctxEffect.beginPath();
        this.ctxEffect.arc(x, y, startRad, 0, Math.PI * 2);
        this.ctxEffect.stroke();
        this.ctxEffect.closePath();
        this.ctxEffect.restore();

        setTimeout(
            this.invokeAlarmAnimation.bind(this, x, y, c, lineWidth, alpha + alphaRate, alphaRate, startRad + radRate, endRad, radRate, processIdx, taskIdx)
            , 90);
    },

    checkDistinctData: function() {
        var ix, ixLen, jx, jxLen, dataList = [];
        var distinct;
        for (ix = 0, ixLen = this.animPosY.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = dataList.length; jx < jxLen; jx++) {
                if (dataList[jx] === this.animPosY[ix]) {
                    distinct = true;
                    break;
                }
            }
            if (!distinct) {
                dataList.push(this.animPosY[ix]);
            }
        }
        this.animPosY = [];
        this.animPosY = dataList.slice();
    },

    checkMousePos: function(_this, mousePos, eventName) {
        var pos = mousePos;
        var ix, ixLen, jx, jxLen, elemPosPie, elemPosLabel, isReturn;

        if (!_this) {
            return;
        }

        if (!_this.eventFnManager.mousemove) {
            _this.eventFnManager.mousemove = _mouseMove;
        }
        if (!_this.eventFnManager.click) {
            _this.eventFnManager.click = _click;
        }

        for (ix = 0, ixLen = _this.elemPosition.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = _this.elemPosition[ix].data.length; jx < jxLen; jx++) {
                elemPosPie = _this.elemPosition[ix].data[jx].piePos;
                elemPosLabel = _this.elemPosition[ix].labelPos;

                if (elemPosLabel.x <= pos[0] && elemPosLabel.x + 110 >= pos[0]
                    && elemPosLabel.y <= pos[1] && elemPosLabel.y + 30 >= pos[1]) {
                    // LABEL에 대한 마우스 이벤트
                    _this.eventFnManager[eventName].call(this, 'label', elemPosPie, ix, jx, {x: pos[0], y: pos[1]});

                    isReturn = 1;
                    break;
                } else if (Math.pow(Math.abs(pos[0] - elemPosPie.x), 2) + Math.pow(Math.abs(pos[1] - elemPosPie.y), 2) <= Math.pow(_this.PROP.PCHART_SERVER, 2)) {
                    // PIE CHART에 대한 마우스 이벤트
                    if (_this.rtmTrackList[ix].data[jx].status !== 'down') {
                        _this.eventFnManager[eventName].call(this, 'pieChart', elemPosPie, ix, jx, {x: pos[0], y: pos[1]});

                        isReturn = 1;
                        break;
                    }
                } else {
                    _removeMouseMove();
                }
            }

            if (isReturn) {
                break;
            }
        }

        if (!isReturn) {
            _this.clicked = false;
        }

        /**
         * @private
         * arguments[0] - component type : 'pieChart' or 'label'
         * arguments[1] - elemPosPie
         * arguments[2] - ix
         * arguments[3] - jx
         * arguments[4] - pos
         */
        function _mouseMove() {
            var businessId, type, tier, agentIdList;

            if (_this.cursorChanged) {
                return;
            }

            if (_this.clicked) {
                _this.showBarToolTip();
            }

            businessId =  Comm.businessRegisterInfo[arguments[2]].parent.bizId;
            tier = arguments[3];
            agentIdList = _this.taskMap[businessId]['tierIdList'][tier]['tierList'];
            type = _this._getMonitorType(agentIdList);

            if (!type) {
                return;
            }

            if (arguments[0] === 'pieChart') {
                _this.drawCtxContextMenu(_this, arguments[1].x, arguments[1].y, type);
                _this.showAlertDetail(businessId, tier, arguments[1].x, arguments[1].y);
                _this.cursorChanged = true;
                _this.currentContextPos = {processIdx: arguments[2], taskIdx: arguments[3]};
            } else if (arguments[0] === 'label') {
                _this.el.dom.style.cursor = 'pointer';
                _this.cursorChanged = true;
                _this.currentContextPos = {processIdx: arguments[2], taskIdx: -1};
            }
        }

        function _removeMouseMove() {
            _this.removeCtxContextMenu(_this);
            _this.hideAlertDetail();
            _this.cursorChanged = false;
            _this.el.dom.style.cursor = 'default';

            _this.barTooltip.css('display', 'none');
        }

        /**
         * 마우스 클릭 이벤트 처리 메소드
         */
        function _click() {
            var isEmpty;
            var businessId, tier, monitorType, agentIdList, typeList;
            var popupType;

            // 참고: 이 businessId 는 최상위 businessId 값임.
            businessId = Comm.businessRegisterInfo[arguments[2]].parent.bizId;
            tier = arguments[3];
            agentIdList = _this.taskMap[businessId]['tierIdList'][tier]['tierList'];
            monitorType = _this._getMonitorType(agentIdList);
            typeList = this._getAllTypeList(agentIdList);

            if (!monitorType) {
                return;
            }

            if (arguments[0] === 'pieChart') {
                if (monitorType === 'CD') {
                    popupType = 'transaction';
                } else {
                    if (arguments[4].x < arguments[1].x) {
                        popupType = 'transaction';
                    } else {
                        popupType = 'active';
                    }
                }

                this.pieChartClickEvent(typeList, popupType, agentIdList, businessId, tier);

            } else if (arguments[0] === 'label') {
                isEmpty = 1;
                if (Comm.businessRegisterInfo[arguments[2]].child.length > 0) {
                    isEmpty = 0;
                }

                if (!isEmpty) {
                    this.trackByTaskDetail = Ext.create('rtm.src.rtmTrackByTaskDetail', {
                        'business_id': businessId
                    });

                    this.trackByTaskDetail.show();
                    setTimeout(function() {
                        this.trackByTaskDetail.init();
                    }.bind(this), 5);
                } else {
                    Ext.Msg.show({
                        title  : common.Util.TR('ERROR'),
                        msg    : common.Util.TR('Detail information does not exist.'),
                        buttons: Ext.Msg.OK,
                        icon   : Ext.MessageBox.WARNING
                    });
                }

                this.hideBarToolTip();
            }

        }
    },

    checkBizTierDown: function(bizIdx, tierIdx) {
        var businessId  = Comm.businessRegisterInfo[bizIdx].parent.bizId;
        var agentIdList = this.taskMap[businessId]['tierIdList'][tierIdx]['tierList'];

        var serverId, serverType, isDown;
        var downCount = 0;
        var serverCount = agentIdList.length;

        var ix;

        for (ix = 0; ix < serverCount; ix++) {
            serverId   = +agentIdList[ix];
            serverType = Comm.RTComm.getServerTypeById(serverId);
            isDown = Comm.RTComm.isDownByServer(serverId, serverType);

            if (isDown) {
                downCount++;
            }
        }
        return downCount === serverCount;
    },

    cancelAnimation: function(frameRefreshed) {
        var ix, ixLen,
            bizName, bizNameList;

        if (!this.rtmTrackList.length) {
            return;
        }

        bizNameList = Object.keys(this.pgBarAnim);

        if (!frameRefreshed) {
            for (ix = 0, ixLen = bizNameList.length; ix < ixLen; ix++) {
                bizName = bizNameList[ix];
                if (this.pgBarAnim[bizName][1] === 0) {
                    cancelAnimationFrame(this.pgBarAnim[bizName][0]);
                    this.pgBarAnim[bizName][0] = 0;
                }
            }
        } else {
            for (ix = 0, ixLen = bizNameList.length; ix < ixLen; ix++) {
                bizName = bizNameList[ix];
                cancelAnimationFrame(this.pgBarAnim[bizName][0]);
                this.pgBarAnim[bizName][0] = 0;
            }
        }

        for (ix = 0, ixLen = this.intervals.length; ix < ixLen; ix++) {
            clearTimeout(this.intervals[ix]);
            this.intervals[ix] = 0;
        }
        this.isAnimationCanceled = true;
        this.isAnimSet = false;
    },

    cancelAlarmAnimation: function(processIdx, taskIdx) {
        if (!this.rtmTrackList.length || !this.elemPosition.length) {
            return;
        }
        cancelAnimationFrame(this.elemPosition[processIdx].data[taskIdx].alarmAnimNo);
        this.elemPosition[processIdx].data[taskIdx].alarmAnimNo = 0;
    },

    cancelAllAlarmAnimation: function(frameRefreshed) {
        var ix, ixLen, jx, jxLen;

        if (!this.rtmTrackList.length || !this.elemPosition.length) {
            return;
        }

        if (frameRefreshed) {
            this.ctxAlarm.clearRect(0, 0, this.width, this.height);
            this.ctxEffect.clearRect(0, 0, this.width, this.height);
        }

        for (ix = 0, ixLen = this.rtmTrackList.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = this.rtmTrackList[ix].data.length; jx < jxLen; jx++) {
                if (this.rtmTrackList[ix].data[jx].alarmOn) {
                    this.rtmTrackList[ix].data[jx].alarmOn = 0;
                    cancelAnimationFrame(this.elemPosition[ix].data[jx].alarmAnimNo);
                    this.elemPosition[ix].data[jx].alarmAnimNo = 0;
                }
            }
        }
    },

    setAnimation: function() {
        var ix, ixLen, rand;

        if (!this.rtmTrackList.length) {
            return;
        }

        this.setAlarmColor();

        this.checkDistinctData();

        for (ix = 0, ixLen = this.animPosY.length; ix < ixLen; ix++) {
            // 주기 3~6초
            rand = Math.random() * (6 - 3 + 1) + 1;
            rand *= 1000;
            this.intervals[ix] = setTimeout(function(ix) {
                this.pgBarAnim[this.rtmTrackList[ix].process] = [];
                this.pgBarAnim[this.rtmTrackList[ix].process][1] = 0;
                this.pgBarAnim[this.rtmTrackList[ix].process][0] = requestAnimationFrame(
                    this.invokeAnimation.bind(
                        this,
                        this.PROP.LABEL_WIDTH,
                        this.animPosY[ix],
                        0,
                        1,
                        this.rtmTrackList[ix].process,
                        ix,
                        0,
                        [],
                        this.rtmTrackList[ix].data
                    )
                );
            }.bind(this, ix), rand);

        }
        this.isAnimationCanceled = false;
        this.isAnimSet = true;
    },

    setAlarmAnimation: function(x, y, c, processIdx, taskIdx) {
        var lineWidth, alpha, color, rate, alphaRate, startRadian, endRadian, radRate;

        if (this.rtmTrackList[processIdx].data[taskIdx].alarmOn === 1) {
            lineWidth = 3.5;
            alpha = 1;
            color = c;
            startRadian = this.PROP.PCHART_BORDER_OUTER;
            endRadian = this.PROP.BG_PCHART_RADIAN + 15;
            rate = 10;
            radRate = (endRadian - startRadian) / rate;
            alphaRate =  -rate / 90;


            this.rtmTrackList[processIdx].data[taskIdx].alarmOn = 1;
            this.elemPosition[processIdx].data[taskIdx].alarmAnimNo = requestAnimationFrame(
                this.invokeAlarmAnimation.bind(
                    this,
                    x,
                    y,
                    color,
                    lineWidth,
                    alpha,
                    alphaRate,
                    startRadian,
                    endRadian,
                    radRate,
                    processIdx,
                    taskIdx
                )
            );
        }
    },

    setAlarmAnimationManager: function() {
        var ix, ixLen, jx, jxLen, status;

        if (!this.rtmTrackList.length) {
            clearTimeout(this.alarmTimer);
            this.alarmTimer = setTimeout(this.setAlarmAnimationManager.bind(this), 1500);
            return;
        }

        for (ix = 0, ixLen = this.rtmTrackList.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = this.rtmTrackList[ix].data.length; jx < jxLen; jx++) {
                status = this.rtmTrackList[ix].data[jx].status;

                if (this.rtmTrackList[ix].data[jx].alarmOn && status !== 'down' && status !== 'normal') {
                    this.setAlarmAnimation(
                        this.elemPosition[ix].data[jx].piePos.x,
                        this.elemPosition[ix].data[jx].piePos.y,
                        this.elemPosition[ix].data[jx].alarmColor,
                        ix,
                        jx
                    );
                }
            }
        }

        clearTimeout(this.alarmTimer);
        this.alarmTimer = setTimeout(this.setAlarmAnimationManager.bind(this), 1500);
    },

    getDataRange: function(normal, warning, critical) {
        var fn, sum, nor, war, cri;

        function getRange(sum) {
            return this.linear.domain([0, sum]).range([0, Math.PI * 2]);
        }

        sum = normal + warning + critical;
        fn = getRange.call(this, sum);

        nor = fn(normal);   // nor = nor < 0.2 ? 0.2 : nor;
        war = fn(warning);  // war = war < 0.2 ? 0.2 : war;
        cri = fn(critical); // cri = cri < 0.2 ? 0.2 : cri - 0.1;

        return {'normal': nor, 'warning': war, 'critical': cri};
    },

    findIdx: function(tierId) {
        var idx, ix, ixLen;

        for (ix = 0, ixLen = Comm.sortTierInfo.length; ix < ixLen; ix++) {
            if (+Comm.sortTierInfo[ix]['tierId'] === tierId) {
                idx = ix;
                return idx;
            }
        }

        return -1;
    },

    showBarToolTip: function() {
        this.barTooltip.css('display', 'block');
        this.clicked = true;
    },

    /** 알람 아이콘 툴팁 표시 */
    showAlertDetail: function(bizId, tierIdx, x, y) {
        var valueHtml = '';
        var ix, len, jx, jxLen;
        var clsLevel, serverName, name, clsType, updateStr, level, _value, alarmTypeInfo;

        var topBizId = Comm.RTComm.getParentBusinessIdById(bizId);
        var tierId   = Comm.sortTierInfo[tierIdx].tierId;
        var tierName = Comm.tierInfo[tierId].name;
        var data     = this.alarmInfos[topBizId + '_' + tierId];
        var title    = common.Util.CTR('Tier') + ' : ' + tierName + ', ' + common.Util.CTR('Business') + ' : ' + this.taskMap[topBizId].bizName;

        var _x, _y, offset, scrollTop, marginCheck;
        var alarmList, alarmKeys, alarmGroup;

        var header;

        if (!data) {
            return;
        }

        // 포지션이 왼쪽인지 오른쪽인지 계산해주기
        _x = x;
        _y = y;
        offset = this.wn.offset();
        scrollTop = this.wn.scrollTop();
        marginCheck = _x + offset.left + this.floatingPnl.width;

        if (marginCheck < window.screen.width) {
            clsType = 'directLeft';
        } else {
            clsType = 'directRight';
        }

        // 항목별 알람 리스트
        alarmGroup = Object.keys(data);

        for (ix = 0, len = alarmGroup.length; ix < len; ix++) {
            alarmList = data[alarmGroup[ix]];
            alarmKeys = Object.keys(alarmList);

            for (jx = 0, jxLen = alarmKeys.length; jx < jxLen; jx++) {
                alarmTypeInfo = alarmList[alarmKeys[jx]];

                serverName = alarmTypeInfo[3];
                name       = alarmTypeInfo[4];
                _value     = alarmTypeInfo[5];
                level      = alarmTypeInfo[7];
                clsLevel   = level.toLocaleLowerCase();

                valueHtml +=
                    '<div class="alertinfo wide" data-alarminfo="' + alarmTypeInfo.join() + '">' +
                    '<span class="' + clsLevel + '" style="float: left; display: inline-block;  width: 80px; text-align:center;margin-left:3px;">' + this.convertTimeToString(alarmTypeInfo[0]) + '</span>' +
                    '<span class="' + clsLevel + '" style="text-overflow: ellipsis;direction: rtl;overflow:hidden; white-space : nowrap; display: inline-block;  width: 105px;">' + serverName + '</span>' +
                    '<span class="' + clsLevel + '" style="text-overflow: ellipsis;  overflow:hidden; white-space : nowrap; display: inline-block;  width: 110px;">' + name + '</span>' +
                    '<span class="' + clsLevel + '" style="display: inline-block;  width: 60px;  text-align: right;    overflow: hidden; text-overflow: ellipsis;">' + _value + '</span>' +
                    '<span class="' + clsLevel + '" style="float: right; display: inline-block;  width:  52px;  margin: 0 0 0 10px; text-align: right;">' + level + '</span>' +
                    '</div>';
            }
        }

        // 업데이트 정보 없을경우 처리하지 않음.
        if (valueHtml.length === 0) {
            return;
        }

        header =
            '<span class="rtm-base ' + clsType + '" style ="display: block;">' +
            '<div style="padding: 10px; height: 30px;">' +
            '<span style= "float:left ;  font-size:17px; ">' + title + '</span>' +
            '</div>' +
            '<div class="frame-AlertLogHistoryFrame-AlertDetail" ></div>' +
            '<div style ="display:block; height:150px; margin:0 5px 0 0; overflow-x:auto;">';

        updateStr = header + valueHtml;
        updateStr += '</div></span>';


        if (this.detailBodyArea.updateFlag === false) {
            this.detailBodyArea.update(updateStr);
            this.detailBodyArea.updateFlag = true;

            if (clsType === 'directRight') {
                this.floatingPnl.showAt(_x + offset.left - this.floatingPnl.width - 40, _y + offset.top - 140 - scrollTop);
            } else if (clsType === 'directLeft') {
                this.floatingPnl.showAt(_x + offset.left + 20, _y + offset.top - 140 - scrollTop);
            }
        }
    },

    pieChartClickEvent: function(typeList, popupType, agentIdList, businessId, tier) {
        var CDIdx;

        CDIdx = typeList.indexOf('CD');


        if (typeList.length === 1) {
            if (popupType === 'transaction') {
                this.openTxnPopup(businessId, agentIdList, typeList[0]);

            } else if (popupType === 'active') {
                this.openActivePopup(businessId, tier, typeList[0]);
            }

            this.hideBarToolTip();
        } else if (typeList.length === 2) {
            if (popupType === 'active') {
                if (CDIdx !== -1) {
                    typeList.splice(CDIdx, 1);
                }

                this.openActivePopup(businessId, tier, typeList[0]);

                this.hideBarToolTip();
            }
        }
    },

    hideAlertDetail: function() {
        this.removeCtxContextMenu(this);
        this.detailBodyArea.updateFlag = false;
        this.floatingPnl.hide();
    },

    hideBarToolTip: function() {
        this.barTooltip.css('display', 'none');
        this.clicked = false;
    },

    openTxnPopup: function(businessId, wasIdList, type) {
        var popupOptions;

        popupOptions = 'width=850px,height=550px';

        realtime.txnPopupMonitorWindow = window.open('../txnDetail/transaction.html', 'IMX_Transaction_Trend_Popup_Monitor', popupOptions);
        realtime.bizId = businessId;
        realtime.bizData = Repository.BizData;
        realtime.agentIdList = wasIdList;
        realtime.isBizView = true;
        realtime.bizViewRefresh = true;
        realtime.txnPopupMonitorType = type;

        if (!realtime.txnPopupMonitorType) {
            Ext.Msg.show({
                title: common.Util.TR('ERROR'),
                msg: common.Util.TR('No found the appropriate monitor type.'),
                buttons: Ext.Msg.OK,
                icon: Ext.MessageBox.ERROR
            });
        }
    },

    openActivePopup: function(businessId, tier, type) {
        var fileName;

        switch (type) {
            case 'TP':
                fileName = this.popupFrame.TPActiveTxnList;
                break;
            case 'WEB':
                fileName = this.popupFrame.WebActiveTxnList;
                break;
            case 'WAS':
                fileName = this.popupFrame.activeTxnList;
                break;
            default:
                break;
        }

        common.OpenView.onMenuPopup(fileName, {
            'tier_list': this.taskMap[businessId]['tierIdList'][tier]['tierList'],
            'business_id': businessId,
            'monitorType': type
        });
    },

    /**
     * 모니터 타입을 반환. idList중 한 개라도 CDM이 아닌 다른 타입이 있을 경우  반환
     * 모니터 타입이 CD 한개만 있으면 'CD' 반환
     *
     * @param idList {Array} - was id list
     * @return {String} - E2E | CD
     */
    _getMonitorType: function(idList) {
        var ix, ixLen, status;

        if (!Comm.wasInfoObj || !idList.length) {
            return null;
        }

        status = Comm.wasInfoObj;

        for (ix = 0, ixLen = idList.length; ix < ixLen; ix++) {
            if (status[idList[ix]].type !== 'CD') {
                return status[idList[ix]].type;
            }
        }

        return 'CD';
    },

    _getAllTypeList: function(agentList) {
        var ix, ixLen, type, typeList;

        typeList = [];

        for (ix = 0, ixLen = agentList.length; ix < ixLen; ix++) {
            type = Comm.RTComm.getServerTypeById(+agentList[ix]);

            if (typeList.indexOf(type) === -1) {
                typeList.push(type);
            }
        }

        return typeList;
    },

    /**
     * 최상단 업무 이름으로 rtmTrackList의 업무 인덱스 번호를 얻는 메소드(인덱스 고유 번호를 얻는 것이 아님)
     * @param bizName {String}
     * @return {Integer}
     */
    _getBizIdWidthName: function(bizName) {
        var ix, ixLen;

        if (typeof bizName !== 'string') {
            return null;
        }

        for (ix = 0, ixLen = this.rtmTrackList.length; ix < ixLen; ix++) {
            if (this.rtmTrackList[ix].process === bizName) {
                return ix;
            }
        }

        return -1;
    },

    /**
     * 최하위 업무 아이디로 최상단 업무 아이디를 얻는 메소드
     *
     * @param lastBizId {Integer | String}
     * @return {Integer}
     */
    _getBizId: function(lastBizId) {
        var ix, ixLen,
            tierId, tierIdList, split, bizData;

        if (!Repository || !Repository.BizData || !Object.keys(Repository.BizData).length || !Repository.BizData[lastBizId] || !lastBizId) {
            return null;
        }

        if (typeof lastBizId === 'string') {
            lastBizId = +lastBizId;
        }

        bizData = Repository.BizData[lastBizId];

        tierIdList = Object.keys(bizData);

        for (ix = 0, ixLen = tierIdList.length; ix < ixLen; ix++) {
            tierId = tierIdList[ix];
            split = bizData[tierId].TREE_KEY.split('-');

            if (+split[0] !== 0) {
                return +split[0];
            }
        }
    },

    /**
     *  최상단 업무 아이디를 가지고 rtmTrackList 배열의 몇 번지에 위치한지 인덱스를 반환하는 메소드
     */
    _getRtmTrackBizIndex: function(bizId) {
        var ix, ixLen;
        var trackBizIdx = -1;

        if (!bizId) {
            return;
        }

        if (typeof bizId === 'string') {
            bizId = +bizId;
        }

        for (ix = 0, ixLen = this.rtmTrackList.length; ix < ixLen; ix++) {
            if (+this.rtmTrackList[ix].processIdx === bizId) {
                trackBizIdx = ix;
                break;
            }
        }
        return trackBizIdx;
    },

    /**
     * 티어 아이디를 가지고 rtmTrackTask 배열에서 몇 번지에 위치해 있는지 인덱스를 구하는 메소드
     */
    _getRtmTrackTierIndex: function(tierId) {
        var ix, ixLen;
        var trackTierIdx = -1;

        if (!tierId) {
            return;
        }

        if (typeof tierId === 'string') {
            tierId = +tierId;
        }

        for (ix = 0, ixLen = Comm.sortTierInfo.length; ix < ixLen; ix++) {
            if (Comm.sortTierInfo[ix].tierId === tierId) {
                trackTierIdx = ix;
                break;
            }
        }
        return trackTierIdx;
    },

    /**
     * 업무 아이디와 해당 프로그레스 바가 위치한 구간의 x 좌표를 넘겨준다.
     * 넘겨받은 x좌표로 몇 번째 구간인지 알아낸 후에 그 구간의 알람 상태값을 체크한다.
     */
    _getTierAlarmColor: function(processIdx, x) {
        var ix, ixLen;
        var elemPos, color;

        // 어느 티어 구간에 위치해있는지 위치값으로 찾음
        elemPos = this.elemPosition;

        for (ix = 0, ixLen = elemPos[processIdx].data.length - 1; ix < ixLen; ix++) {
            if (x > elemPos[processIdx].data[ix].piePos.x && x < elemPos[processIdx].data[ix + 1].piePos.x) {

                color = elemPos[processIdx].data[ix].prevAlarmColor;

                if (color === this.ALARM_COLOR['down']) {
                    return 'none';
                } else {
                    return color;
                }
            }
        }
    },

    /**
     * 3초마다 실시간 패킷을 받아오는 메소드
     */
    loadData: function(frameRefreshed) {
        var ix, ixLen, jx, jxLen, kx, kxLen;
        var bizData, bizId, topBizId, topBizIdx, tierId, tierIdx;
        var nor, war, cri, sum;
        var bizIdList, tierIdList;

        this.cancelAnimation(frameRefreshed);

        if (!this.rtmTrackList) {
            this.rtmTrackList = [];
        }

        for (ix = 0, ixLen = this.rtmTrackList.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = this.rtmTrackList[ix].data.length; jx < jxLen; jx++) {
                this.rtmTrackList[ix].data[jx].time             = new Date().getTime();
                this.rtmTrackList[ix].data[jx].exception_time   = 0;
                this.rtmTrackList[ix].data[jx].active_txn_count = 0;
                this.rtmTrackList[ix].data[jx].active_normal    = 0;
                this.rtmTrackList[ix].data[jx].active_warning   = 0;
                this.rtmTrackList[ix].data[jx].active_critical  = 0;
                this.rtmTrackList[ix].data[jx].TPS              = 0;
                this.rtmTrackList[ix].data[jx].elapsed_time     = 0;
                this.rtmTrackList[ix].data[jx].dataOn           = 0;
                this.rtmTrackList[ix].data[jx].cnt              = 0;
                this.rtmTrackList[ix].data[jx].status           = '';
            }
        }

        bizData = Repository.BizData;

        if (!bizData || !Object.keys(bizData).length) {
            return;
        }

        topBizIdx = -1;

        bizIdList = Object.keys(bizData);
        for (ix = 0, ixLen = bizIdList.length; ix < ixLen; ix++) {
            bizId = bizIdList[ix];
            if (+bizId !== 0) {
                tierIdList = Object.keys(bizData[bizId]);
                for (jx = 0, jxLen = tierIdList.length; jx < jxLen; jx++) {
                    tierId = tierIdList[jx];
                    if (+tierId !== 0 && bizData[bizId][tierId].TREE_KEY.split('-').length > 0 && +(bizData[bizId][tierId].TREE_KEY.split('-')[0]) !== 0) {
                        topBizId = bizData[bizId][tierId].TREE_KEY.split('-')[0];
                        tierIdx = this.findIdx(+tierId);

                        for (kx = 0, kxLen = this.rtmTrackList.length; kx < kxLen; kx++) {
                            if (+this.rtmTrackList[kx].processIdx === +topBizId) {
                                topBizIdx = kx;
                                break;
                            }
                        }

                        if (topBizIdx === -1) {
                            break;
                        }

                        topBizId = topBizIdx;
                        topBizIdx = -1;

                        if (tierIdx !== -1 && this.rtmTrackList[topBizId].data[tierIdx] !== undefined) {
                            nor = bizData[bizId][tierId].ACTIVE_NORMAL   || 0;
                            war = bizData[bizId][tierId].ACTIVE_WARNING  || 0;
                            cri = bizData[bizId][tierId].ACTIVE_CRITICAL || 0;
                            sum = this.getDataRange(nor, war, cri);

                            this.rtmTrackList[topBizId].data[tierIdx].TPS += bizData[bizId][tierId].TPS;
                            this.rtmTrackList[topBizId].data[tierIdx].active_normal += sum.normal;
                            this.rtmTrackList[topBizId].data[tierIdx].active_warning += sum.warning;
                            this.rtmTrackList[topBizId].data[tierIdx].active_critical += sum.critical;
                            this.rtmTrackList[topBizId].data[tierIdx].elapsed_time += bizData[bizId][tierId].TXN_ELAPSE;
                            this.rtmTrackList[topBizId].data[tierIdx].exception_time += bizData[bizId][tierId].EXCEPTION_COUNT;
                            this.rtmTrackList[topBizId].data[tierIdx].cnt += 1;
                            this.rtmTrackList[topBizId].data[tierIdx].time = bizData[bizId][tierId].TIME;
                            this.rtmTrackList[topBizId].data[tierIdx].dataOn = 1;
                        }
                    }
                }
            }
        }

        if (this.firstPacket) {
            this.draw(this.target, this.width, this.height + 60, true);
            setTimeout(this.onAlarm.bind(this), 0);
            this.firstPacket = false;
        } else {
            this.drawManager(true);
        }
    },

    onAlarm: function(data) {
        var bizId, rtmTrackBizIdx, tierId, tierIdx, alarmStatus, tierID, businessID;

        if (!data || !this.rtmTrackList.length) {
            return;
        }

        tierID       = data[11];
        businessID   = data[12];

        if (!tierID || !businessID) {
            return;
        }

        this.setAlarminfo(data);

        // dataOn 이랑 serverDown 둘 다 체크 할 것,
        // 서버다운이면 dataOn = 0, serverDown = true
        // 알람이 들어오면 onAlarm = 1 로 체크할 것
        bizId = this._getBizId(data[12]);
        rtmTrackBizIdx = this._getRtmTrackBizIndex(bizId);
        tierId = data[11];
        tierIdx = this._getRtmTrackTierIndex(tierId);

        if (!bizId || !tierId || rtmTrackBizIdx < 0 || tierIdx < 0) {
            return;
        }

        alarmStatus = this.checkAlarm(bizId, tierId).toLowerCase();

        this.rtmTrackList[rtmTrackBizIdx].data[tierIdx].status = alarmStatus;
        this.rtmTrackList[rtmTrackBizIdx].data[tierIdx].legendColor = this.ALARM_COLOR[alarmStatus];

        if (alarmStatus === 'normal') {
            this.elemPosition[rtmTrackBizIdx].data[tierIdx].alarmColor = this.ALARM_COLOR['normal'];
            this.rtmTrackList[rtmTrackBizIdx].data[tierIdx].alarmOn = 0;
        } else {
            this.elemPosition[rtmTrackBizIdx].data[tierIdx].alarmColor = this.ALARM_COLOR[alarmStatus];
            this.rtmTrackList[rtmTrackBizIdx].data[tierIdx].alarmOn = 1;
        }

        this.getMaxAlarmLevel();
        this.setAlarmColor();

        // 테스트용으로 임의로 알람 발생시키고 싶으면 이 부분 사용할 것
        // var ix, ixLen, jx, jxLen;
        // for(ix = 0, ixLen = this.rtmTrackList.length; ix < ixLen; ix++){
        //     for(jx = 0, jxLen = this.rtmTrackList[ix].data.length; jx < jxLen; jx++) {
        //         // if(!((ix == 0 && jx == 3) || (ix == 3 && jx == 0))){continue;}
        //         var rand = Math.random();
        //         var status;
        //         if (rand > 0.8) {
        //             status = 'down';
        //         } else if (rand > 0.6) {
        //             status = 'critical';
        //         } else if (rand <= 0.6 && rand > 0.3) {
        //             status = 'warning';
        //         } else if (rand <= 0.3) {
        //             status = 'normal';
        //         }
        //
        //         if(status !== 'normal') {
        //             this.rtmTrackList[ix].data[jx].legendColor = this.COLOR.PGBAR_DATA_ON;
        //             this.rtmTrackList[ix].data[jx].status = status;
        //             this.elemPosition[ix].data[jx].alarmColor = this.ALARM_COLOR[status];
        //             this.rtmTrackList[ix].data[jx].TPS = 1;
        //             this.rtmTrackList[ix].data[jx].dataOn = 1;
        //             this.rtmTrackList[ix].data[jx].alarmOn = 1;
        //         }else{
        //             this.rtmTrackList[ix].data[jx].legendColor = this.ALARM_COLOR[status];
        //             this.rtmTrackList[ix].data[jx].status = status;
        //             this.elemPosition[ix].data[jx].alarmColor = 'none';
        //             this.rtmTrackList[ix].data[jx].TPS = 1;
        //             this.rtmTrackList[ix].data[jx].dataOn = 1;
        //             this.rtmTrackList[ix].data[jx].alarmOn = 0;
        //         }
        //     }
        // }
        // setTimeout(this.onAlarm.bind(this), Math.random() * 4000);
        this.drawAlarmChange();
    },


    setAlarminfo: function(data) {
        var time         = data[0];
        var serverType   = data[1];
        var serverID     = data[2];

        var alarmResName = data[4];
        var alarmValue   = data[5];
        var alarmLevel   = data[6];
        var levelType    = data[7];
        var alarmType    = data[8];
        var descr        = data[9];
        var resID        = data[10];
        var alarmKey     = data[4];

        var tierID       = data[11];
        var businessID   = data[12];

        var topBizId = Comm.RTComm.getParentBusinessIdById(businessID);
        var serverName, alarmData, nodeAlarmKey;

        if (serverType === 20) {
            if (Comm.etoeBizInfos[businessID]) {
                serverName = Comm.etoeBizInfos[businessID].name;
            }
        } else {
            serverName = data[3];
        }

        if (!businessID || !tierID || (serverType !== 20 && alarmType !== 'Session Alert') || !topBizId) {
            return;
        }

        nodeAlarmKey = topBizId + '_' + tierID;

        switch (alarmResName) {
            case realtime.alarms.CONNECTED:
            case realtime.alarms.SERVER_BOOT :
            case realtime.alarms.API_BOOT :
            case realtime.alarms.TP_BOOT :
            case realtime.alarms.PROCESS_BOOT :
                alarmLevel = 0;
                levelType = '';
                break;

            case realtime.alarms.DISCONNECTED :
            case realtime.alarms.SERVER_DOWN :
            case realtime.alarms.API_DOWN :
            case realtime.alarms.TP_DOWN :
                alarmLevel = 2;
                levelType = 'Critical';
                alarmValue = '';
                break;

            default:
                break;
        }

        // 라이선스 알람을 체크할 때 알람 값이 0 이상인 경우 정상으로 체크한다.
        // description 항목 값이 'UNLIMITED' 인 경우 정상으로 체크해도 되지만 빈 값으로 오는 경우가 있어서
        // 화면에서 필터 처리를 함.
        if (alarmResName.toLocaleLowerCase() === 'license' && alarmLevel > 0 && alarmValue >= 0) {
            alarmLevel = 0;
        }

        if (alarmResName === realtime.alarms.ELAPSED_TIME) {
            alarmKey = alarmResName + '-' + resID;
            alarmValue = +alarmValue / 1000;

        } else if (alarmResName === realtime.alarms.TP_ERROR) {
            alarmKey = alarmResName + '-' + resID;

        } else if (alarmResName === realtime.alarms.CONNECTED) {
            alarmKey = realtime.alarms.DISCONNECTED;

        } else if (alarmResName === realtime.alarms.SERVER_BOOT) {
            alarmKey = realtime.alarms.SERVER_DOWN;

        } else if (alarmResName === realtime.alarms.API_BOOT) {
            alarmKey = realtime.alarms.API_DOWN;

        } else if (alarmResName === realtime.alarms.TP_BOOT) {
            alarmKey = realtime.alarms.TP_DOWN;

        } else if (alarmResName === realtime.alarms.PROCESS_BOOT) {
            alarmKey = realtime.alarms.PROCESS_DOWN;
        }

        if (!this.alarmInfos[nodeAlarmKey]) {
            this.alarmInfos[nodeAlarmKey] = {};
        }
        alarmData = this.alarmInfos[nodeAlarmKey];

        if (+alarmLevel === 0) {
            if (alarmData[serverName]) {
                if (alarmResName === realtime.alarms.CONNECTED) {
                    delete alarmData[serverName][realtime.alarms.DISCONNECTED];
                    delete alarmData[serverName].XM_JVM_OUTOFMEMORYERROR;

                } else if (alarmResName === realtime.alarms.SERVER_BOOT) {
                    delete alarmData[serverName][realtime.alarms.SERVER_DOWN];

                } else if (alarmResName === realtime.alarms.API_BOOT) {
                    delete alarmData[serverName][realtime.alarms.API_DOWN];

                } else if (alarmResName === realtime.alarms.TP_BOOT) {
                    delete alarmData[serverName][realtime.alarms.TP_DOWN];

                } else if (alarmResName === realtime.alarms.PROCESS_BOOT) {
                    delete alarmData[serverName][realtime.alarms.PROCESS_DOWN];

                } else if (alarmResName === realtime.alarms.ELAPSED_TIME ||
                    alarmResName === realtime.alarms.TP_ERROR) {
                    delete alarmData[serverName][alarmKey];

                } else {
                    delete alarmData[serverName][alarmResName];
                }
            }

        } else {
            if (alarmData[serverName]) {
                if (alarmData[serverName][alarmKey]) {
                    alarmData[serverName][alarmKey][5]  = alarmValue;
                    alarmData[serverName][alarmKey][6]  = alarmLevel;
                    alarmData[serverName][alarmKey][7]  = levelType;
                    alarmData[serverName][alarmKey][9]  = descr;
                    alarmData[serverName][alarmKey][10] = resID;
                    alarmData[serverName][alarmKey][12] = +new Date();
                    alarmData[serverName][alarmKey][13] = false;
                } else {
                    alarmData[serverName][alarmKey] = [time, serverType, serverID, serverName, alarmResName, alarmValue, alarmLevel, levelType, alarmType, descr, resID, tierID, +new Date(), false, businessID];
                }

            } else {
                alarmData[serverName] = {};
                alarmData[serverName][alarmKey] = [time, serverType, serverID, serverName, alarmResName, alarmValue, alarmLevel, levelType, alarmType, descr, resID, tierID, +new Date(), false, businessID];
            }
        }

    },

    /**
     * 해당 업무-구간에 대한 알람 상태값을 체크하는 메소드
     * 체크하기 이전에 서버가 다운이 되었는지를 먼저 판단한다
     */
    checkAlarm: function(bizId, tierId) {
        var ix, ixLen, jx, jxLen,
            id, alarmLevel, alarmStatus,
            instanceNameList, instanceName, instanceAlarmList, instanceAlarmId;

        id = bizId + '_' + tierId;
        alarmStatus = 'normal';
        alarmLevel = 0;

        instanceNameList = Object.keys(this.alarmInfos[id]);

        for (ix = 0 , ixLen = instanceNameList.length; ix < ixLen; ix++) {
            instanceName = instanceNameList[ix];
            instanceAlarmList = Object.keys(this.alarmInfos[id][instanceName]);
            for (jx = 0, jxLen = instanceAlarmList.length; jx < jxLen; jx++) {
                instanceAlarmId = instanceAlarmList[jx];
                if (this.alarmInfos[id][instanceName][instanceAlarmId][6] > alarmLevel) {
                    alarmLevel = this.alarmInfos[id][instanceName][instanceAlarmId][6];
                    alarmStatus = this.alarmInfos[id][instanceName][instanceAlarmId][7];
                }
            }
        }

        return alarmStatus;
    },

    /**
     * 시간값을 '시:분:초' 형태로 변환해서 전달
     *
     * @param {string} time 시간값
     * @return {string} 시간값
     */
    convertTimeToString: function(time) {
        var date = new Date(time);
        var h    = date.getHours();
        var m    = date.getMinutes();
        var s    = date.getSeconds();

        return '' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    },


    /**
     * 그래프 화면에 표시되는 데이터에서 삭제 대상 알람 체크.
     * RTMDataManager.js 에서 호출
     */
    clearAlarm: function() {
        var ix, ixLen, jx, jxLen, kx, kxLen;
        var alarmKeys, alarmName;
        var alarmList, alarmGroup;
        var serverName;
        var nodeKey;
        var serverKeys;

        var alarmInfoObj = Object.keys(this.alarmInfos);

        this.diffSec = 0;

        for (ix = 0, ixLen = alarmInfoObj.length; ix < ixLen; ix++) {
            nodeKey    = alarmInfoObj[ix];
            alarmGroup = this.alarmInfos[nodeKey];

            serverKeys = Object.keys(alarmGroup);

            for (jx = 0, jxLen = serverKeys.length; jx < jxLen; jx++) {
                serverName = serverKeys[jx];
                alarmList  = alarmGroup[serverName];
                alarmKeys  = Object.keys(alarmList);

                for (kx = 0, kxLen = alarmKeys.length; kx < kxLen; kx++) {
                    alarmName = alarmKeys[kx];

                    this.diffSec = 0;

                    if (!Ext.Array.contains(realtime.notAutoClearAlarms, alarmName)) {
                        this.diffSec = Ext.Date.diff(alarmList[alarmName][12], new Date(), Ext.Date.SECOND);
                    }

                    if (this.diffSec > 3) {
                        delete this.alarmInfos[nodeKey][serverName][alarmName];
                    }
                }
            }
        }

        this.getMaxAlarmLevel();
        this.setAlarmColor();
        this.drawAlarmChange();
    },


    getMaxAlarmLevel: function() {
        var ix, ixLen, jx, jxLen, kx, kxLen;
        var alarm;
        var bizId, tierId;
        var bizTierKeys;
        var nodeKey, alarmGroup, serverKeys, serverName, alarmList, alarmKeys, alarmName;

        var alarmInfoObj = Object.keys(this.alarmInfos);
        var maxLevel = 0;

        for (ix = 0, ixLen = alarmInfoObj.length; ix < ixLen; ix++) {
            nodeKey    = alarmInfoObj[ix];
            alarmGroup = this.alarmInfos[nodeKey];

            serverKeys = Object.keys(alarmGroup);

            for (jx = 0, jxLen = serverKeys.length; jx < jxLen; jx++) {
                serverName = serverKeys[jx];
                alarmList  = alarmGroup[serverName];
                alarmKeys  = Object.keys(alarmList);

                for (kx = 0, kxLen = alarmKeys.length; kx < kxLen; kx++) {
                    alarmName = alarmKeys[kx];
                    alarm     = alarmList[alarmName];

                    if (alarm[6] != null && alarm.length > 7) {
                        maxLevel = Math.max(alarm[6], maxLevel);
                    }

                    if (maxLevel === 2) {
                        break;
                    }
                }
            }

            bizTierKeys = nodeKey.split('_');
            bizId  = bizTierKeys[0];
            tierId = bizTierKeys[1];

            if (bizId && tierId) {
                this.setCircleStatus(bizId, tierId, maxLevel);
            }
        }
    },

    /**
     * 그룹 아이콘의 상태를 업데이트
     * @param bizId
     * @param tierId
     * @param {number} maxAlarmLevel - 그룹 알람 최대 레벨
     */
    setCircleStatus: function(bizId, tierId, maxAlarmLevel) {
        var rtmTrackBizIdx = this._getRtmTrackBizIndex(bizId);
        var tierIdx = this._getRtmTrackTierIndex(tierId);
        var alarmStatus = this.checkAlarm(bizId, tierId).toLowerCase();

        if (maxAlarmLevel === 0) {
            // 알람이 normal인 경우
            this.rtmTrackList[rtmTrackBizIdx].data[tierIdx].alarmOn = 0;
            this.rtmTrackList[rtmTrackBizIdx].data[tierIdx].alarmColor = 'none';
            this.rtmTrackList[rtmTrackBizIdx].data[tierIdx].status = 'normal';
            this.rtmTrackList[rtmTrackBizIdx].data[tierIdx].legendColor = this.ALARM_COLOR['normal'];
            this.cancelAlarmAnimation(rtmTrackBizIdx, tierIdx);
            this.elemPosition[rtmTrackBizIdx].data[tierIdx].alarmAnimNo = 0;
            this.elemPosition[rtmTrackBizIdx].data[tierIdx].alarmColor = this.ALARM_COLOR['normal'];
        } else {
            this.rtmTrackList[rtmTrackBizIdx].data[tierIdx].status = alarmStatus;
            this.rtmTrackList[rtmTrackBizIdx].data[tierIdx].legendColor = this.ALARM_COLOR[alarmStatus];
            this.elemPosition[rtmTrackBizIdx].data[tierIdx].alarmColor = this.ALARM_COLOR[alarmStatus];
        }
    }

});