Ext.define('rtm.src.rtmTrackSingleTaskChart', {
    extend    : 'Exem.Container',
    title     : '',
    layout    : 'fit',
    width     : '100%',
    height    : '100%',
    style     : 'overflow: hidden;',
    cls       : 'rtmTrackSingleTaskChart',
    listeners : {
        destroy : function() {

            this.cancelAnimation();
            this.cancelAlarmAnimation();

            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, this);
        }
    },

    constructor: function() {
        this.callParent(arguments);
    },

    init: function(target, width, height) {
        this.initProperty(target, width, height);
        this.initChartData();
    },

    initProperty: function(target, width, height) {
        this.target = target;

        this.setInitialSize(target, width, height);

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

        this.PROP = {};

        this.PROP.LABEL_WIDTH      = 100;
        this.PROP.LABEL_HEIGHT     = 36;
        this.PROP.COMPONENT_WIDTH  = (this.width - this.PROP.LABEL_WIDTH)  * 0.20;
        this.PROP.COMPONENT_HEIGHT = 45;
        this.PROP.BG_PCHART_RADIAN = 48;
        this.PROP.BG_PGBAR_WIDTH   = (this.PROP.BG_PCHART_RADIAN >> 1) + (this.PROP.BG_PCHART_RADIAN / 3);
        this.PROP.BG_PGBAR_HEIGHT  = this.height;
        this.PROP.DIFF_PIE_AND_BAR = 10;

        //PIE CHART
        this.PROP.PCHART_BORDER_OUTER   = 37;
        this.PROP.PCHART_BORDER_INNER   = 32;
        this.PROP.PCHART_SERVER         = 28;
        this.PROP.PCHART_SERVER_LIGHT   = 20;
        this.PROP.PCHART_CENTER_CIRCLE  = 13;
        this.PROP.SM_PCHART_CIRCLE      = 10;
        this.PROP.SM_PCHART_CENTER      = 6;

        //PROGRESS BAR
        this.PROP.PGBAR_RECT_WIDTH      = this.PROP.BG_PGBAR_WIDTH / 4;
        this.PROP.PGBAR_RECT_HEIGHT     = 5;

        this.linear = d3.scale.linear();

        this.webEnvKey =  this.cmpId + '_rtmTrackSingleTaskChartTierName';

        if (Comm.web_env_info[this.webEnvKey]) {
            if (typeof Comm.web_env_info[this.webEnvKey] === 'string') {
                this.webEnvData = JSON.parse(Comm.web_env_info[this.webEnvKey]);
            } else {
                this.webEnvData = Comm.web_env_info[this.webEnvKey];
            }
        }

        if (this.webEnvData) {
            this.currentTier = this.webEnvData;
        } else {
            this.currentTier = Comm.sortTierInfo[0];
        }

        this.eventFnManager = {
            'click'    : null,
            'mousemove': null
        };

        this.maxFontSize = 35;
        this.minFontSize = 10;

        this.pgBarPos = {'x': 0, 'y': 0};
        this.posX = 0;
        this.posY = 0;

        //알람 데이터
        this.maxLevel    = 0;
        this.alarmInfos  = {};
        this.alarmColor  = '';
        this.alarmStatus = ['normal', 'warning', 'critical', 'down'];
        this.alarmColor  = ['transparent', this.COLOR.SERVER_WARNING, this.COLOR.SERVER_CRITICAL, 'transparent'];
        this.alarmOn     = 0;
        this.alarmAnimNo = 0;
        this.alarmTimer  = 0;

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this);
    },

    initChartData: function() {
        this.chartData = {
            'txnCount'   : 0,
            'execute'    : 0,
            'tps'        : 0,
            'elapse'     : Number(0).toFixed(2),
            'normal'     : 0,
            'warning'    : 0,
            'critical'   : 0
        };
    },

    setInitialSize: function(target, width, height) {
        var minWidth, minHeight;
        minWidth  = 400;
        minHeight = 180;

        if (!width) {
            width = minWidth;
        }
        if (!height) {
            height = minHeight;
        }

        var w  = ( width  < minWidth ) ? minWidth : width;
        var h  = ( height < minHeight ) ? minHeight : height;

        this.setSize(this, w, h);
    },

    setSize: function(target, width, height) {
        target.width = width;
        target.height = height;
    },

    draw: function(target, width, height) {
        var that = this;

        if (this.target !== target) {
            this.target = target;
        }

        this.setInitialSize(this, width, height);

        if (!this.ctx) {
            this.canvas = d3
                .select('#' + target)
                .append('canvas')
                .attr('class', 'canvasSingle');
        }
        if (!this.ctxPBar) {
            this.canvasPBar = d3
                .select('#' + target)
                .append('canvas')
                .attr('class', 'canvasPBar');
        }
        if (!this.ctxPie) {
            this.canvasPie = d3
                .select('#' + target)
                .append('canvas')
                .attr('class', 'canvasPie');
        }
        if (!this.ctxEffect) {
            this.canvasEffect = d3
                .select('#' + target)
                .append('canvas')
                .attr('class', 'canvasEffect');
        }
        if (!this.ctxAlarm) {
            this.canvasAlarm = d3
                .select('#' + target)
                .append('canvas')
                .attr('class', 'canvasAlarm');

            this.canvasAlarm.on('mousemove', function() {
                var pos = d3.mouse(this);
                that.checkMousePos(that, pos, 'mousemove');
            });
            this.canvasAlarm.on('click', function() {
                var pos = d3.mouse(this);
                that.checkMousePos(that, pos, 'click');
            });
        }

        this.canvas.attr({'width' : this.width, 'height' : this.height});
        this.canvasPBar.attr({'width' : this.width, 'height' : this.height});
        this.canvasPie.attr({'width' : this.width, 'height' : this.height});
        this.canvasEffect.attr({'width' : this.width, 'height' : this.height});
        this.canvasAlarm.attr({'width' : this.width, 'height' : this.height});
        this.ctx = this.canvas.node().getContext('2d');
        this.ctxPBar = this.canvasPBar.node().getContext('2d');
        this.ctxPie = this.canvasPie.node().getContext('2d');
        this.ctxEffect = this.canvasEffect.node().getContext('2d');
        this.ctxAlarm = this.canvasAlarm.node().getContext('2d');


        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.clearRect(0, 0, this.prevW, this.prevH);
        this.ctx.restore();

        this.ctxPBar.save();
        this.ctxPBar.beginPath();
        this.ctxPBar.clearRect(0, 0, this.prevW, this.prevH);
        this.ctxPBar.restore();

        this.ctxPie.save();
        this.ctxPie.beginPath();
        this.ctxPie.clearRect(0, 0, this.prevW, this.prevH);
        this.ctxPie.restore();

        this.ctxEffect.save();
        this.ctxEffect.beginPath();
        this.ctxEffect.clearRect(0, 0, this.prevW, this.prevH);
        this.ctxEffect.restore();

        this.ctxAlarm.save();
        this.ctxAlarm.beginPath();
        this.ctxAlarm.clearRect(0, 0, this.prevW, this.prevH);
        this.ctxAlarm.restore();

        this.prevW = this.width;
        this.prevH = this.height;

        this.drawManager();

        this.alarmTimer = setTimeout(this.setAlarmAnimation.bind(this), 1500);
    },

    drawManager: function() {
        // posX = this.canvas[0][0].clientWidth - (this.PROP.BG_PGBAR_WIDTH << 1);
        this.posX = this.width - (this.PROP.BG_PGBAR_WIDTH << 1);
        this.posY = this.height >> 1;

        this.ctx.clearRect(0, 0, this.prevW, this.prevH);
        if (!this.pgBarAnim) {
            this.ctxPBar.clearRect(0, 0, this.prevW, this.prevH);
        }
        this.ctxPie.clearRect(0, 0, this.prevW, this.prevH);

        this.drawTxnToday(this.posX, this.posY);
        this.drawTPS(this.posX, this.posY);
        this.drawElapse(this.posX, this.posY);
        this.drawTopLabel();
        this.drawBackgrounds(this.posX, this.posY);
        this.drawProgressBar(this.posX, this.posY);
        this.drawPieChart(this.posX, this.posY);
        this.drawTxnCount(this.posX, this.posY);
    },

    drawTopLabel: function() {
        this.ctx.save();
        this.ctx.font = '15px Droid Sans, NanumGothic';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = this.COLOR.LABEL;
        this.ctx.fillText(this.currentTier['tierName'], 10, 25);
        this.ctx.restore();
    },

    drawTxnToday: function(x, y) {
        var posX, posY, execute;

        posX = x;
        posY = y;
        posY = posY - Math.floor(posY) !== 0 ? posY - 0.5 : posY;

        execute = this.chartData['execute'];

        this.ctx.save();
        this.ctx.fillStyle = this.COLOR.LABEL;
        this.ctx.strokeStyle = this.COLOR.LEGEND;
        this.ctx.font = '14px Droid Sans, NanumGothic';
        this.ctx.textAlign = 'left';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(posX, posY);
        this.ctx.lineTo(10, posY);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.fillText(common.Util.CTR('Today\'s Transaction Count'), 10, posY - 10);


        this.ctx.beginPath();
        this.ctx.textAlign = 'right';
        this.setTextFont(execute, common.Util.CTR('Today\'s Transaction Count'), posX - 70);

        this.ctx.fillText(execute, posX - 70, posY - 10);
        this.ctx.restore();
    },

    drawTPS: function(x, y) {
        var posX, posY, cx, cy, tps;

        posX = x;
        posY = y;
        posY = posY - Math.floor(posY) !== 0 ? posY - 0.5 : posY;

        cx = posX + Math.cos(Math.PI + Math.PI / 3.5) * this.PROP.BG_PCHART_RADIAN - 25;
        cy = posY - Math.sin(Math.PI + Math.PI / 4) * (this.PROP.BG_PCHART_RADIAN + 10);

        tps = this.chartData['tps'];

        this.ctx.save();
        this.ctx.fillStyle = this.COLOR.LABEL;
        this.ctx.strokeStyle = this.COLOR.LEGEND;
        this.ctx.font = '14px Droid Sans, NanumGothic';
        this.ctx.textAlign = 'left';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.moveTo(posX, posY);
        this.ctx.lineTo(cx, cy);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(10, cy);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.fillText(common.Util.CTR('TPS Count'), 10, cy - 10);

        this.ctx.beginPath();
        this.ctx.textAlign = 'right';
        this.ctx.font = '16px Droid Sans, NanumGothic';
        this.ctx.fillText(tps, cx - 20, cy - 10);
        this.ctx.restore();

        cx = null;
        cy = null;
    },

    drawElapse: function(x, y) {
        var posX, posY, cx, cy, elapseAVG;

        posX = x;
        posY = y;
        posY = posY - Math.floor(posY) !== 0 ? posY - 0.5 : posY;

        cx = posX + Math.cos(Math.PI + Math.PI / 3.5) * this.PROP.BG_PCHART_RADIAN - 25;
        cy = posY - Math.sin(Math.PI + Math.PI / 2) * (this.PROP.BG_PCHART_RADIAN + 30);

        elapseAVG = this.chartData['elapse'];

        this.ctx.save();
        this.ctx.fillStyle = this.COLOR.LABEL;
        this.ctx.strokeStyle = this.COLOR.LEGEND;
        this.ctx.font = '14px Droid Sans, NanumGothic';
        this.ctx.textAlign = 'left';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.moveTo(posX, posY);
        this.ctx.lineTo(cx, cy);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(10, cy);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.fillText(common.Util.CTR('Elapse Time(AVG)'), 10, cy - 10);

        this.ctx.beginPath();
        this.ctx.textAlign = 'right';
        this.ctx.font = '16px Droid Sans, NanumGothic';
        this.ctx.fillText(elapseAVG, cx - 20, cy - 10);
        this.ctx.restore();

        cx = null;
        cy = null;
    },

    drawBackgrounds: function(x, y) {
        this.ctx.fillStyle = this.COLOR.BACKGROUND;
        this.ctx.strokeStyle = this.COLOR.BACKGROUND;

        // draw bar background
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#1111aa';
        this.ctx.rect(x - (this.PROP.BG_PGBAR_WIDTH >> 1), 0, this.PROP.BG_PGBAR_WIDTH, this.height);
        this.ctx.fill();
        // this.ctx.stroke();
        this.ctx.restore();

        // draw circle background
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.PROP.BG_PCHART_RADIAN, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.restore();
    },

    drawProgressBar: function(x) {
        var ix, ixLen;
        // ixLen = Math.floor(this.PROP.BG_PGBAR_HEIGHT / this.PROP.PGBAR_RECT_HEIGHT);
        ixLen = Math.floor(this.height / this.PROP.PGBAR_RECT_HEIGHT);

        this.ctxPBar.save();
        this.ctxPBar.strokeStyle = this.COLOR.PGBAR_BORDER;
        this.ctxPBar.fillStyle = this.COLOR.PGBAR_SERVER_ON;
        this.ctxPBar.lineWidth = 1.3;

        for (ix = 0; ix <= ixLen; ix++) {
            if (ix === 0) {
                this.pgBarPos.x = x - (this.PROP.PGBAR_RECT_WIDTH >> 1);
            }


            this.ctxPBar.beginPath();
            this.ctxPBar.rect(x - (this.PROP.PGBAR_RECT_WIDTH >> 1), ix * this.PROP.PGBAR_RECT_HEIGHT, this.PROP.PGBAR_RECT_WIDTH, this.PROP.PGBAR_RECT_HEIGHT);
            this.ctxPBar.stroke();
            this.ctxPBar.fill();
        }

        this.ctxPBar.restore();
    },

    drawPieChart: function(x, y) {
        //TODO 서버 다운 경우 처리 안함
        var posX, posY, sum, nor, war, cri, status;
        posX   = x;
        posY   = y;
        status = this.alarmStatus[this.maxLevel];
        nor    = this.chartData.normal;
        war    = this.chartData.warning;
        cri    = this.chartData.critical;
        sum    = nor + war + cri;

        //가장 바깥 테두리
        this.ctxPie.save();
        this.ctxPie.fillStyle = this.COLOR.BLACK;
        this.ctxPie.lineWidth = 1.5;
        if (status !== 'down' && this.chartData.dataOn === 1) {
            this.ctxPie.strokeStyle = this.COLOR.CHART_BORDER_OUTER;
            this.ctxPie.beginPath();
            this.ctxPie.arc(posX, posY, this.PROP.PCHART_BORDER_OUTER, 0, 2 * Math.PI);
        } else {
            this.ctxPie.strokeStyle = this.COLOR.SERVER_DOWN;
            this.ctxPie.beginPath();
            this.ctxPie.arc(posX, posY, this.PROP.PCHART_BORDER_OUTER + 1, 0, 2 * Math.PI);
        }
        this.ctxPie.fill();
        this.ctxPie.restore();

        //안쪽 테두리
        this.ctxPie.save();
        this.ctxPie.strokeStyle = this.COLOR.CHART_BORDER_INNER;
        this.ctxPie.lineWidth = 1.2;
        this.ctxPie.beginPath();
        this.ctxPie.arc(posX, posY, this.PROP.PCHART_BORDER_INNER, 0, 2 * Math.PI);
        this.ctxPie.stroke();
        this.ctxPie.restore();

        if (status !== 'down') {
            //데이터 부분 표현하기 - normal
            this.ctxPie.save();
            this.ctxPie.fillStyle = this.COLOR.SERVER_NORMAL;
            this.ctxPie.beginPath();
            this.ctxPie.arc(posX, posY, this.PROP.PCHART_SERVER, 0, nor);
            this.ctxPie.lineTo(posX, posY);
            this.ctxPie.fill();

            this.ctxPie.fillStyle = this.COLOR.SERVER_NORMAL_LIGHT;
            this.ctxPie.beginPath();
            this.ctxPie.arc(posX, posY, this.PROP.PCHART_SERVER_LIGHT, 0, nor);
            this.ctxPie.lineTo(posX, posY);
            this.ctxPie.fill();
            this.ctxPie.restore();

            sum -= nor;

            //데이터 부분 표현하기 - warning
            if (sum > 0) {
                this.ctxPie.save();
                this.ctxPie.fillStyle = this.COLOR.SERVER_WARNING;
                this.ctxPie.beginPath();
                this.ctxPie.arc(posX, posY, this.PROP.PCHART_SERVER, nor, nor + war);
                this.ctxPie.lineTo(posX, posY);
                this.ctxPie.fill();

                this.ctxPie.fillStyle = this.COLOR.SERVER_WARNING_LIGHT;
                this.ctxPie.beginPath();
                this.ctxPie.arc(posX, posY, this.PROP.PCHART_SERVER_LIGHT, nor, nor + war);
                this.ctxPie.lineTo(posX, posY);
                this.ctxPie.fill();
                this.ctxPie.restore();

                sum -= war;
            }

            //데이터 부분 표현하기 - critical
            if (sum > 0.000001) {
                this.ctxPie.save();
                this.ctxPie.fillStyle = this.COLOR.SERVER_CRITICAL;
                this.ctxPie.beginPath();
                this.ctxPie.arc(posX, posY, this.PROP.PCHART_SERVER, nor + war, Math.PI * 2);
                this.ctxPie.lineTo(posX, posY);
                this.ctxPie.fill();

                this.ctxPie.fillStyle = this.COLOR.SERVER_CRITICAL_LIGHT;
                this.ctxPie.beginPath();
                this.ctxPie.arc(posX, posY, this.PROP.PCHART_SERVER_LIGHT, nor + war, Math.PI * 2);
                this.ctxPie.lineTo(posX, posY);
                this.ctxPie.fill();
                this.ctxPie.restore();
            }
        } else {
            //SERVER_DOWN 일 때
            //데이터 부분 표현하기
            this.ctxPie.save();
            this.ctxPie.fillStyle = this.COLOR.SERVER_DOWN;
            this.ctxPie.beginPath();
            this.ctxPie.arc(posX, posY, this.PROP.PCHART_SERVER, 0, Math.PI * 2);
            this.ctxPie.lineTo(posX, posY);
            this.ctxPie.fill();
            this.ctxPie.restore();

            //데이터 부분 표현하기 - light
            this.ctxPie.save();
            this.ctxPie.fillStyle = this.COLOR.SERVER_DOWN_LIGHT;
            this.ctxPie.beginPath();
            this.ctxPie.arc(posX, posY, this.PROP.PCHART_SERVER_LIGHT, 0, Math.PI * 2);
            this.ctxPie.lineTo(posX, posY);
            this.ctxPie.fill();
            this.ctxPie.restore();
        }

        //안쪽 작은 원 그리기
        this.ctxPie.save();
        this.ctxPie.fillStyle = this.COLOR.BLACK;
        this.ctxPie.beginPath();
        this.ctxPie.arc(posX, posY, this.PROP.PCHART_CENTER_CIRCLE, 0, Math.PI * 2);
        this.ctxPie.fill();
        this.ctxPie.restore();

        this.ctxPie.save();
        this.ctxPie.fillStyle = this.COLOR.BLACK;
        this.ctxPie.strokeStyle = this.COLOR.SM_CHART_BORDER_OUTER;
        this.ctxPie.lineWidth = 1.3;
        this.ctxPie.beginPath();
        this.ctxPie.arc(posX, posY, this.PROP.SM_PCHART_CIRCLE, 0, Math.PI * 2);
        this.ctxPie.fill();
        this.ctxPie.stroke();
        this.ctxPie.restore();
    },

    drawTxnCount: function(x, y) {
        var posX, posY;

        posX = x;
        posY = y;

        this.ctxPie.save();
        this.ctxPie.fillStyle = this.COLOR.LABEL;

        this.ctxPie.textAlign = 'center';

        if (this.chartData.txnCount >= 100) {
            this.ctxPie.font = '11px Droid Sans, NanumGothic';
            this.ctxPie.fillText(this.chartData.txnCount, posX, posY + 4);
        } else {
            this.ctxPie.font = '14px Droid Sans, NanumGothic';
            this.ctxPie.fillText(this.chartData.txnCount, posX, posY + 5);
        }

        this.ctxPie.restore();
    },

    onClickTitle : function(pGroupName) {
        this.groupListWindow = Ext.create('rtm.src.rtmBizGroupList', {
            style: {'z-index': '10'}
        });

        this.groupListWindow.groupName     = pGroupName;
        this.groupListWindow.targetGroup   = this;
        this.groupListWindow.init();
        this.groupListWindow.show();
    },

    getDataRange: function(normal, warning, critical) {
        function getRange(sum) {
            return this.linear.domain([0, sum]).range([0, Math.PI * 2]);
        }

        var fn, sum, nor, war, cri;

        sum = normal + warning + critical;
        fn = getRange.call(this, sum);

        nor = fn(normal);   //nor = nor < 0.2 ? 0.2 : nor;
        war = fn(warning);  //war = war < 0.2 ? 0.2 : war;
        cri = fn(critical); //cri = cri < 0.2 ? 0.2 : cri - 0.1;

        return {'normal': nor, 'warning': war, 'critical': cri};
    },

    getElapseAVG: function(sum, cnt) {
        if (cnt === 0 || sum === 0) {
            return '0.00';
        } else {
            return (sum / cnt).toFixed(2);
        }
    },

    setTextFont: function(text, leftText, rightPos) {
        var leftTextSize, availableSpace, fontSize;

        leftTextSize = this.ctx.measureText(leftText);
        availableSpace = this.width - leftTextSize.width - (this.width - rightPos) - 10;

        fontSize = this.maxFontSize;
        this.ctx.font = fontSize + 'px Droid Sans, NanumGothic';

        while (this.ctx.measureText(text).width > availableSpace) {
            if (fontSize < this.minFontSize) {
                break;
            }
            fontSize--;
            this.ctx.font = fontSize + 'px Droid Sans, NanumGothic';
        }
    },

    removeCtxContextMenu: function(that) {
        if (that.cls === 'rtmTrackSingleTaskChart') {
            that.ctx.clearRect(0, 0, that.prevW, that.prevH);
        }
    },

    checkMousePos: function(_this, mousePos, eventName) {
        if (!_this) {
            return;
        }

        var pos = mousePos;

        if (!_this.eventFnManager.mousemove) {
            _this.eventFnManager.mousemove = _mouseMove;
        }
        if (!_this.eventFnManager.click) {
            _this.eventFnManager.click = _click;
        }

        if (pos[0] >= 0 && pos[0] <= 100 && pos[1] >= 0 && pos[1] <= 40) {
            _this.eventFnManager[eventName].call(this, pos[0], pos[1]);
        } else {
            _removeMouseMove();
        }

        //arguments[0] - posX
        //arguments[1] - posY

        function _mouseMove() {
            if (_this.cursorChanged) {
                return;
            }

            _this.cursorChanged = true;
            _this.el.dom.style.cursor = 'pointer';
        }

        function _removeMouseMove() {
            // _this.removeCtxContextMenu(_this);
            _this.cursorChanged = false;
            _this.el.dom.style.cursor = 'default';
        }

        function _click() {
            if (Comm.bizGroups.length) {
                this.loadingMask.show();
                this.onClickTitle(this.currentTier['tierName']);
                this.loadingMask.hide();
            } else {
                common.Util.showMessage('', common.Util.TR('No Groups.'), Ext.Msg.OK, Ext.MessageBox.INFO);
            }
        }
    },

    cancelAnimation: function() {
        cancelAnimationFrame(this.pgBarAnim);
        this.pgBarAnim = null;
    },

    cancelAlarmAnimation: function() {
        cancelAnimationFrame(this.alarmAnimNo);
        clearTimeout(this.alarmTimer);
        this.alarmAnimNo = 0;
        this.alarmOn = 0;
    },

    /**
     * 그래프 화면에 표시되는 데이터에서 삭제 대상 알람 체크.
     * RTMDataManager.js 에서 호출
     */
    clearAlarm: function() {
        this.diffSec = 0;

        var ix, ixLen, jx, jxLen, kx, kxLen;
        var alarmKeys, alarmName;
        var alarmList, alarmGroup;
        var serverName;
        var nodeKey;
        var serverKeys;

        var alarmInfoObj = Object.keys(this.alarmInfos);

        for (kx = 0, kxLen = alarmInfoObj.length; kx < kxLen; kx++) {
            nodeKey    = alarmInfoObj[kx];
            alarmGroup = this.alarmInfos[nodeKey];

            serverKeys = Object.keys(alarmGroup);

            for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
                serverName = serverKeys[ix];
                alarmList  = alarmGroup[serverName];
                alarmKeys  = Object.keys(alarmList);

                for (jx = 0, jxLen = alarmKeys.length; jx < jxLen; jx++) {
                    alarmName = alarmKeys[jx];

                    this.diffSec = 0;

                    if (!Ext.Array.contains(realtime.notAutoClearAlarms, alarmName)) {
                        this.diffSec = Ext.Date.diff(alarmList[alarmName][12], new Date(), Ext.Date.SECOND);
                    }

                    if (this.diffSec > 3) {
                        //console.debug(nodeKey, serverName, alarmName);
                        //console.debug(this.alarmInfos[nodeKey][serverName][alarmName]);
                        delete this.alarmInfos[nodeKey][serverName][alarmName];
                    }
                }
            }
        }

        this.getMaxAlarmLevel();
        this.setAlarmColor();

        if (this.maxLevel === 0 || this.maxLevel === 3) {
            this.cancelAlarmAnimation();
        }

        alarmList  = null;
        alarmGroup = null;
        alarmKeys  = null;
        alarmName  = null;
    },

    setAnimation: function() {
        if (this.alarmStatus[this.maxLevel] === 'down') {
            return;
        }

        if (!this.pgBarAnim) {
            if (this.chartData.dataOn) {
                setTimeout(function() {
                    var status = this.alarmStatus[this.maxLevel];
                    var color;

                    if (status === 'normal') {
                        color = this.COLOR.PGBAR_DATA_ON;
                    } else {
                        color = this.alarmColor[this.maxLevel];
                    }

                    this.pgBarPos.y = -3 * this.PROP.PGBAR_RECT_HEIGHT;
                    this.pgBarAnim = requestAnimationFrame(this.invokeAnimation.bind(this, this.pgBarPos.y, color));
                }.bind(this), 100);
            }
        }
    },

    setAlarmAnimation: function() {
        var x, y, lineWidth, alpha, color, rate, alphaRate, startRadian, endRadian, radRate;

        if (this.alarmOn) {
            return;
        }

        this.alarmOn = 1;
        x = this.posX;
        y = this.posY;
        lineWidth = 3.5;
        alpha = 1;
        color = this.alarmColor[this.maxLevel];
        startRadian = this.PROP.PCHART_BORDER_OUTER;
        endRadian = this.PROP.BG_PCHART_RADIAN + 15;
        rate = 10;
        radRate = (endRadian - startRadian) / rate;
        alphaRate =  -rate / 90;

        this.alarmAnimNo = requestAnimationFrame(
            this.invokeAlarmAnimation.bind(this, x, y, color, lineWidth, alpha, alphaRate, startRadian, endRadian, radRate)
        );
    },

    invokeAnimation: function(cnt, color) {
        if (cnt >= this.height + 3 * this.PROP.PGBAR_RECT_HEIGHT) {
            this.cancelAnimation(true);

            this.alarmTimer = setTimeout(this.setAlarmAnimation.bind(this), 1500);
            return;
        }

        this.ctxPBar.save();

        this.ctxPBar.strokeStyle = this.COLOR.PGBAR_BORDER;
        this.ctxPBar.fillStyle = this.COLOR.PGBAR_SERVER_ON;
        this.ctxPBar.beginPath();
        this.ctxPBar.rect(this.pgBarPos.x, this.pgBarPos.y, this.PROP.PGBAR_RECT_WIDTH, this.PROP.PGBAR_RECT_HEIGHT);
        this.ctxPBar.stroke();
        this.ctxPBar.fill();

        this.ctxPBar.fillStyle = color;
        this.ctxPBar.beginPath();
        this.ctxPBar.rect(this.pgBarPos.x, this.pgBarPos.y + 3 * this.PROP.PGBAR_RECT_HEIGHT, this.PROP.PGBAR_RECT_WIDTH, this.PROP.PGBAR_RECT_HEIGHT);
        this.ctxPBar.stroke();
        this.ctxPBar.fill();

        this.ctxPBar.restore();

        this.pgBarPos.y += this.PROP.PGBAR_RECT_HEIGHT;

        if (this.pgBarAnim) {
            this.pgBarAnim = requestAnimationFrame(this.invokeAnimation.bind(this, cnt + this.PROP.PGBAR_RECT_HEIGHT, color));
        }
    },

    invokeAlarmAnimation: function(x, y, c, lineWidth, alpha, alphaRate, startRad, endRad, radRate) {
        if (startRad >= endRad) {
            this.cancelAlarmAnimation();
            return;
        }

        this.ctxEffect.clearRect(x - endRad - 5, y - endRad - 5, endRad * 2 + 10, endRad * 2 + 10);

        this.ctxEffect.save();
        this.ctxEffect.strokeStyle = c;
        this.ctxEffect.lineWidth = lineWidth;
        this.ctxEffect.globalAlpha = alpha < 0 ? 0 : alpha;
        this.ctxEffect.beginPath();
        this.ctxEffect.arc(x, y, startRad, 0, Math.PI * 2);
        this.ctxEffect.stroke();
        this.ctxEffect.closePath();
        this.ctxEffect.restore();

        setTimeout(
            this.invokeAlarmAnimation.bind(this, x, y, c, lineWidth, alpha + alphaRate, alphaRate, startRad + radRate, endRad, radRate)
            , 90);
    },

    changeGroup : function(pGroupName) {
        var ix, sortTierInfo;

        sortTierInfo = Comm.sortTierInfo;

        for (ix in sortTierInfo) {
            if (sortTierInfo[ix]['tierName'] === pGroupName) {
                this.currentTier = sortTierInfo[ix];
                common.WebEnv.Save(this.webEnvKey, this.currentTier);
                break;
            }
        }

        this.ctxAlarm.clearRect(0, 0, this.width, this.height);
        this.cancelAnimation();
        this.cancelAlarmAnimation();
        this.loadData(true);
    },

    loadData: function() {
        var ix, bizId, wasId, bizData, dailyData, dataOn, aData;
        var txnCount, execute, tps, elapse, normal, warning, critical, sum, cnt;

        bizData = Repository.BizData;
        dailyData = Repository.WasMonitorDaily;
        txnCount = 0;
        execute = 0;
        tps = 0;
        elapse = 0;
        normal = 0;
        warning = 0;
        critical = 0;
        cnt = 0;

        if (!this.pgBarAnim) {
            this.cancelAnimation();
            this.setAnimation();
        }

        dataOn = 0;
        for (bizId in bizData) {
            for (ix in bizData[bizId]) {
                if (+ix === +this.currentTier['tierId']) {
                    aData = bizData[bizId][ix];
                    txnCount += aData['ACTIVE_TXN_COUNT'];
                    tps += aData['TPS'];
                    elapse += aData['TXN_ELAPSE'];
                    normal += aData['ACTIVE_NORMAL'];
                    warning += aData['ACTIVE_WARNING'];
                    critical += aData['ACTIVE_CRITICAL'];
                    cnt++;
                    dataOn = 1;
                }
            }
        }

        if (!dataOn && Math.random() > 0.5) {
            return;
        }

        for (wasId in dailyData) {
            if (Comm.bizGroupWasIdPairObj[this.currentTier['tierName']] && Comm.bizGroupWasIdPairObj[this.currentTier['tierName']].indexOf(wasId) !== -1) {
                execute += dailyData[wasId]['execute_count'];
            }
        }

        sum = this.getDataRange(normal, warning, critical);

        // execute = Math.floor(Math.random() * 100000000);

        this.chartData.txnCount = txnCount;
        this.chartData.execute = common.Util.numberWithComma(execute);
        this.chartData.tps = tps;
        this.chartData.elapse = common.Util.numberWithComma(this.getElapseAVG(elapse, cnt));
        this.chartData.normal = sum.normal;
        this.chartData.warning = sum.warning;
        this.chartData.critical = sum.critical;
        this.chartData.dataOn = dataOn;

        this.drawManager();
    },

    /**
     * 알람 실시간 패킷 데이터 처리
     *
     * 0: time
     * 1: server_type   (1: WAS, 2: DB, 3:WebServer, 9: Host, 15: apim, 20: BIZ)
     * 2: server_id
     * 3: server_name
     * 4: alert_resource_name
     * 5: value
     * 6: alert_level
     * 7: levelType
     * 8: alert_type (WAS STAT, OS STAT, JVM STAT, Exception Alert)
     * 9: descr
     * 10: alert_resource_ID
     * 11: tier_id
     * 12: business_id
     * 13: warning
     * 14: critical
     * 15: customData
     */
    onAlarm: function(data) {
        if (!data) {
            return;
        }

        var tierID       = data[11];
        var businessID   = data[12];

        if (!tierID || !businessID) {
            return;
        }

        this.setAlarminfo(data);
        this.getMaxAlarmLevel();
        this.setAlarmColor();

        if (this.maxLevel === 3) {
            this.chartData.dataOn = 0;
        } else {
            if (this.chartData.tps > 0) {
                this.chartData.dataOn = 1;
            }
        }

        if (this.maxLevel === 0 || this.maxLevel === 3) {
            this.cancelAlarmAnimation();
        }
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

        var serverName;
        if (serverType === 20) {
            if (Comm.etoeBizInfos[businessID]) {
                serverName = Comm.etoeBizInfos[businessID].name;
            }
        } else {
            serverName = data[3];
        }

        var topBizId = Comm.RTComm.getParentBusinessIdById(businessID);

        if (!businessID || !tierID || (serverType !== 20 && alarmType !== 'Session Alert') || !topBizId) {
            return;
        }

        var alarmData;
        //var topBizId = Comm.RTComm.getParentBusinessIdById(businessID);
        var nodeAlarmKey = topBizId + '_' + tierID;

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

    setAlarmColor: function() {
        var color;

        color  = this.alarmColor[this.maxLevel];

        this.ctxAlarm.clearRect(0, 0, this.width, this.height);

        this.ctxAlarm.save();
        this.ctxAlarm.strokeStyle = color;
        this.ctxAlarm.lineWidth = 5.5;
        this.ctxAlarm.beginPath();
        this.ctxAlarm.arc(this.posX, this.posY, this.PROP.PCHART_BORDER_OUTER, 0, Math.PI * 2);
        this.ctxAlarm.stroke();
        this.ctxAlarm.closePath();
        this.ctxAlarm.restore();
    },

    getMaxAlarmLevel: function() {
        var ix, ixLen, jx, jxLen, kx, kxLen;
        var alarm;
        var tierId;
        var bizTierKeys;
        var nodeKey, alarmGroup, serverKeys, serverName, alarmList, alarmKeys, alarmName;

        var alarmInfoObj = Object.keys(this.alarmInfos);
        var maxLevel = 0;

        for (kx = 0, kxLen = alarmInfoObj.length; kx < kxLen; kx++) {
            nodeKey     = alarmInfoObj[kx];
            alarmGroup  = this.alarmInfos[nodeKey];

            bizTierKeys = nodeKey.split('_');
            tierId = bizTierKeys[1];

            if (+tierId !== +this.currentTier.tierId) {
                continue;
            }

            serverKeys = Object.keys(alarmGroup);

            for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
                serverName = serverKeys[ix];
                alarmList  = alarmGroup[serverName];
                alarmKeys  = Object.keys(alarmList);

                for (jx = 0, jxLen = alarmKeys.length; jx < jxLen; jx++) {
                    alarmName = alarmKeys[jx];
                    alarm     = alarmList[alarmName];

                    if (alarm[6] != null && alarm.length > 7) {
                        maxLevel = Math.max(alarm[6], maxLevel);
                    }

                    if (maxLevel === 2) {
                        break;
                    }
                }
            }
        }

        alarmList  = null;
        alarm      = null;
        serverKeys = null;

        this.maxLevel = maxLevel;
    }
});