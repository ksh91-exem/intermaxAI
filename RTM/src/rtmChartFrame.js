Ext.define('rtm.src.rtmChartFrame', {
    extend: 'Exem.Container',
    layout: 'vbox',
    width : '100%',
    height: '100%',
    flex  : 1,
    padding  : '5 5 0 0',
    border   : 1,
    interval : PlotChart.time.exSecond,
    dataBufferSize : 30,

    trendChartStatInfo: null,
    isHoverTitle : true,
    cls : 'rtm-chartframe-base',

    listeners: {
        beforedestroy: function() {
            Ext.Array.remove(realtime.canvasChartList, this.trendChart.id);
        }
    },


    init: function() {
        this.initPorperty();

        this.trendChartHeader = Ext.create('Ext.container.Container',{
            layout : {
                type : 'hbox'
            },
            height : 22,
            width  : '100%',
            cls    : 'rtm-chartframe-header'
        });

        this.trendChartBody = Ext.create('Ext.container.Container',{
            layout : 'fit',
            width  : '100%',
            flex   : 1
        });

        this.add([this.trendChartHeader, this.trendChartBody]);

        // 라인 차트 레이어
        this.trendChartLayer = Ext.create('Ext.container.Container',{
            layout: 'fit',
            width : '100%',
            height: '100%'
        });

        // 바 차트 레이어
        this.barChartLayer = Ext.create('Ext.container.Container',{
            layout: 'fit',
            width : '100%',
            height: '100%'
        });

        this.trendChartBody.add([this.trendChartLayer, this.barChartLayer]);

        this.createTrendChartHeaderLayer();
        this.createTrendChart();

        this.initMenuList();
    },

    initPorperty: function() {
        this.instanceList = this.instanceList || Comm.wasIdArr || [];
        this.visibleList = [];
        this.isExpand = false;
        this.isHoverTitle = Ext.isEmpty(this.isHoverTitle) ? true : this.isHoverTitle;

        this.showLegend = this.showLegend == null ? (! this.isSingleView) : this.showLegend;

        this.areaChartCount = 4;
        this.fillValue = 0.1;

        this.firstChartCreateFlag = true;
        this.seriesType = 0;         // 0은 Line, 1은 Bar로 사용.

        this.kindStat  = 0;
        this.statIndex = [];
        this.alarmList = {};

        this.trendChartData = [];

        this.conList = [];
        this.expandLegendList = {};

        this.barMaxValue  = 0;
        this.barChartData = {};
        this.barChartList = {};
        this.barChartWidth = 60;
        this.barChartHeight = 134;

        this.fontStyle     = 'color: black; font-family:Tahoma; font-size: 10pt; font-weight: bold;';
        this.normalColor   = realtime.normalColor;
        this.warningColor  = realtime.warningColor;
        this.criticalColor = realtime.criticalColor;

        this.barHeight     = 0;

        this.jumpType = {stat: 0};
    },

    createTrendChart: function() {
        var fontColor, borderColor;

        var theme = Comm.RTComm.getCurrentTheme();

        switch (theme) {
            case 'Black' :
                fontColor   = '#FFFFFF';
                borderColor = '#81858A';
                break;
            case 'White' :
                fontColor   = '#555555';
                borderColor = '#CCCCCC';
                break;
            default :
                fontColor   = '#ABAEB5';
                borderColor = '#81858A';
                break;
        }

        this.trendChart = Ext.create('Exem.chart.RealCanvasChart',{
            flex                : 1,
            style : {
                overflow : 'inherit'
            },
            showLegend          : this.showLegend,
            showTooltip         : true,
            dataBufferSize      : this.dataBufferSize,
            interval            : this.interval * 3,
            showLegendValueArea : true,
            showHistoryInfo     : false,
            showIndicator       : this.showIndicator,
            showMaxValue        : false,
            selectionZoom       : false,
            mouseSelect         : false,
            showContextMenu     : false,
            isDataBufferInit    : true,
            legendNameHighLight : true,
            legendNameHover     : this.legendNameHover,
            legendNameLeave     : this.legendNameLeave,
            legendNameClick     : this.legendNameClick.bind(this),
            plotdblclick        : this.trendChartDblClick || this.trendChartDefaultDblClick.bind(this),
            plotselection       : function() {
            }.bind(this),
            legendColorClickToVisible: true,
            legendColorClick    : function(chart, me) {
                this.visibleList[me.index].visible = (! this.visibleList[me.index].visible);
            }.bind(this),
            chartProperty       : {
                mode : null,
                xTickFormat: null,
                timeformat: '%H:%M:%S',
                borderColor : borderColor,
                xLabelFont : {size: 12, color: fontColor},
                yLabelFont : {size: 12, color: fontColor}
            }
        });

        this.trendChartLayer.add(this.trendChart);

        var isContain = Ext.Array.contains(realtime.canvasChartList, this.trendChart.id);
        if (!isContain) {
            realtime.canvasChartList[realtime.canvasChartList.length] = this.trendChart.id;
        }

        // 기본적으로 숨겨진 상태로 보이게 한다
        if (this.trendChart.labelLayer) {
            this.trendChart.labelLayer.hide();
        }
    },

    trendChartDefaultDblClick: function(e) {
        var flag = true;
        var instanceName = null,
            ix, ixLen;

        if (this.isSingleView) {
            flag = false;
        }

        for (ix = 0, ixLen = this.visibleList.length; ix < ixLen; ix++) {
            if (this.visibleList[ix].visible) {
                instanceName = this.visibleList[ix].instanceName;
                break;
            }
        }
        this.legendNameClick(e, {
            textContent     : instanceName,
            isTopGridList   : flag,
            instanceList    : this.instanceList
        });

        instanceName = null;
    },


    addSerieses : function() {
        this.trendChart.removeAllSeries();

        var ix, ixLen;
        var lineWidth;
        var serverId;
        var fill = (this.areaChartCount >= this.instanceList.length) ? this.fillValue : null;

        for (ix = 0, ixLen = this.instanceList.length; ix < ixLen; ix++ ) {
            lineWidth = this.chartOption ? this.chartOption[this.instanceList[ix]].lineWidth : 2;

            serverId = Comm.RTComm.getServerIdByName(this.instanceList[ix], this.frameType);

            this.trendChart.addSeries({
                id   : this.instanceList[ix],
                label: this.instanceList[ix],
                type : PlotChart.type.exLine,
                fill : fill,
                lineWidth: lineWidth,
                color: realtime.serverColorMap[this.frameType][serverId]
            });

            if (this.chartOption) {
                this.trendChart.setLineWidth(ix, lineWidth);
            }

            this.visibleList.push({
                instanceName : this.instanceList[ix],
                visible      : true
            });

            // 차트 데이터 초기화. 마지막시간, 3초 간격, 초기값은 -1
            // new Date() 는 서버타임으로 변경하셔야 합니다.
            this.trendChart.initData(new Date(), 3000, -1, ix);
        }

        this.trendChart.plotDraw();
    },


    createTrendChartHeaderLayer: function() {
        var self = this;

        this.chartHeaderTitle = Ext.create( 'Ext.form.Label',{
            text     : 'chart',
            flex     : 1,
            statText : '',
            cls      : 'rtm-chartframe-title'
        });

        // 차트 제목에 지표 목록창을 열수있는 링크를 활성화
        if (this.isHoverTitle) {
            this.chartHeaderTitle.cls = 'opacity-hover';
            this.chartHeaderTitle.setStyle('cursor', 'pointer');
            this.chartHeaderTitle.on({
                render : function(me) {
                    me.el.on( 'click', self.getStatList.bind(self) );
                }
            });
        }

        this.chartMenuPanel = Ext.create('Ext.container.Container',{
            layout : {
                type : 'hbox',
                pack : 'end'
            },
            cls    : 'rtm-realchart-tools',
            width  : 120,
            height : '100%'
        });

        this.expendIcon = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '0 0 0 6',
            html  : '<div class="trend-chart-icon" title="' + common.Util.TR('Scale Up') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on('click', function(me, el) {
                        if (this.isExpand) {
                            el.title = common.Util.TR('Scale Up');
                            this.parent.hideExpandView(this);
                        } else {
                            el.title = common.Util.TR('Scale Down');
                            this.parent.showExpandView(this);
                        }
                    }, this);
                }
            }
        });

        this.menuIcon = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '0 0 0 6',
            html  : '<div class="trend-chart-menu-icon" title="' + common.Util.TR('Menu') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on( 'click', function(e) {
                        this.menuContext.showAt(e.getXY());
                    }, this);
                }
            }
        });

        this.chartMenuPanel.add([this.expendIcon, this.menuIcon]);

        this.trendChartHeader.add([this.chartHeaderTitle, this.chartMenuPanel]);
    },


    initMenuList: function() {
        if (! this.isSingleView) {
            this.menuContext = Ext.create('Exem.ContextMenu', {
                shadow : false
            });

            this.menuContext.addItem({
                title : common.Util.TR('Change visible Instance List'),
                target: this,
                fn: function() {
                    this.target.getInstanceList();
                }
            });
        }
    },

    getInstanceList : function() {
    },

    visibleInstances: function(arrCheck) {
        var ix, ixLen, jx, jxLen;

        for (ix = 0, ixLen = arrCheck.length; ix < ixLen; ix++) {
            this.visibleList[ix].visible = arrCheck[ix];
        }

        for (jx = 0, jxLen = arrCheck.length; jx < jxLen; jx++) {
            this.trendChart.setSeriesVisible( jx, arrCheck[jx] );
        }
        this.trendChart.plotDraw();
    },


    showSeriesAll : function() {
        var name;
        var ix, ixLen;

        // line chart show
        for (ix = 0, ixLen = this.trendChart.serieseList.length; ix < ixLen; ix++ ) {
            this.trendChart.setSeriesVisible( ix,  true );
        }

        for (ix = 0, ixLen = this.instanceList.length; ix < ixLen; ix++) {
            name = this.instanceList[ix];
            this.barChartList[name].container.style.display = 'block';
        }
    },


    /**
     * 지표 목록화면을 표시.
     */
    getStatList : function() {
        this.listWindow = Ext.create('rtm.src.rtmStatList', {
            style: {'z-index': '10'}
        });

        this.listWindow.statName    = this.trendChartStatInfo.statName;
        this.listWindow.targetChart = this;
        this.listWindow.init();
        this.listWindow.show();
    },


    setStat : function( statName) {
        if (!statName) {
            return;
        }

        this.chartHeaderTitle.setText( statName.substring(0,1).toUpperCase() + statName.substring(1, statName.length)  + (this.trendChartStatInfo.unit ? ' (' + this.trendChartStatInfo.unit + ')' : ''));

        this.trendChart.clearValues();

        this.trendChart.toFixedNumber = this.toFixedNumber || 1;

        this.isRatioStat = false;

        if (this.isTotal === true && realtime.percentStatData.indexOf(statName) !== -1) {
            this.isRatioStat = true;
        }
    },


    setTitle : function( statName) {
        if (!statName) {
            return;
        }

        this.chartHeaderTitle.setText( statName.substring(0,1).toUpperCase() + statName.substring(1, statName.length));

        this.trendChart.clearValues();
        this.statName = statName;
    },


    setVisibleMenuPanel : function( value ) {
        this.trendChartHeader.setVisible( value );
    },

    legendNameClick : function(e, el) {

        var name = el.textContent;
        var type = this.jumpType[this.kindStat];
        var stat = this.statName;
        var upperStat = stat.toUpperCase();

        if (upperStat.indexOf('LIBRARY CACHE LOCK') > -1) {
            common.OpenView.ShowTopGrid(name, type, stat, el.isTopGridList, el.instanceList);

        } else if (upperStat.indexOf('LOCK') > -1 || upperStat.indexOf('ENQ') > -1) {
            common.OpenView.ShowLockTree(name);

        } else if (upperStat === 'ACTIVE SESSIONS') {
            common.OpenView.ShowActiveSessSummary(name);
        }
    },


    /**
     * 지나간 데이터 그리기.
     * 지표를 변경 또는 차트를 새로고침 하는 경우 지나간 시간에 대해 데이터를 그리기.
     */
    getBeforeChartData: function() {
        var beforeData = [], wasCount = 0;
        var time, value, wasName, wasId;
        var ix, ixLen, jx, jxLen;

        this.trendChart.clearValues();

        var trendData;

        if (this.frameType === 'TP') {
            trendData = Repository.tmadminDataLog;

        } if (this.frameType === 'TUX') {
            trendData = Repository.TuxTrendDataLog;

        } else if (this.frameType === 'WEB') {
            trendData = Repository.WebTrendDataLog;

        } else if (this.frameType === 'CD') {
            trendData = Repository.CDTrendDataLog;

        } else {
            trendData = Repository.trendDataLog;
        }

        if (this.isTotal === true) {
            for (ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
                wasId = Comm.wasIdArr[ix];

                if (!trendData[wasId]) {
                    continue;
                }
                wasCount++;

                for (jx = 0, jxLen = trendData[wasId][this.trendChartStatInfo.statId].length; jx < jxLen; jx++) {
                    value = trendData[wasId][this.trendChartStatInfo.statId][jx];
                    time  = trendData[wasId]['TIME'][jx];

                    if (!beforeData[jx]) {
                        beforeData[jx] = { time: null, value: 0 };
                    }
                    beforeData[jx].time   = time;
                    beforeData[jx].value += value;
                }
            }

            for (ix = 0, ixLen = beforeData.length; ix < ixLen; ix++) {
                time  = beforeData[ix].time;
                value = beforeData[ix].value;

                if (this.isRatioStat === true) {
                    value = common.Util.numberFixed(value / wasCount, 3);
                }
                this.trendChart.addValue(0, [time, value]);
                this.trendChart.setLegendValue(0, value);

                beforeData[ix].time  = null;
                beforeData[ix].value = null;
                beforeData[ix]       = null;
            }

        } else {

            for (ix = 0, ixLen = this.trendChart.serieseList.length; ix < ixLen; ix++) {
                wasName = this.trendChart.serieseList[ix].id;
                wasId   = Comm.RTComm.getServerIdByName(wasName, this.frameType);

                if (!trendData[wasId]) {
                    continue;
                }

                if (Comm.Status[this.frameType] && Comm.RTComm.isDown(Comm.Status[this.frameType][wasId])) {
                    continue;
                }

                for (jx = 0, jxLen = trendData[wasId][this.trendChartStatInfo.statId].length; jx < jxLen; jx++) {
                    value = trendData[wasId][this.trendChartStatInfo.statId][jx];
                    time  = trendData[wasId].TIME[jx];

                    value = common.Util.decimalsFixed(value, this.toFixedNumber);

                    this.trendChart.addValue(ix, [time, value]);
                    this.trendChart.setLegendValue(ix, value);
                }
            }
        }

        this.trendChart.plotRedraw();

        time  = null;
        value = null;
    },


    /**
     * @note data 가 없는 경우는 패킷이 안온 경우로 현재시간과 -1 값을 채워넣는다
     */
    drawChart: function() {

        var wasId;
        var wasName;
        var value = 0;
        var time;
        var ix, ixLen;

        if (this.isTotal === true) {

            for (ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
                wasId = Comm.wasIdArr[ix];

                if (!this.trendChartData || !this.trendChartData[wasId]) {
                    continue;
                }

                time   = this.trendChartData[wasId].TIME;
                value += this.trendChartData[wasId][this.trendChartStatInfo.statId];
            }

            if (+time === 0) {
                time = +new Date();
            }

            if (this.isRatioStat === true) {
                value = common.Util.numberFixed(value / ixLen, 3);
            }

            this.trendChart.addValue(0, [time, (value == null) ? -1 : value]);
            this.trendChart.setLegendValue(0, value);

        } else {
            for (ix = 0, ixLen = this.trendChart.serieseList.length; ix < ixLen; ix++) {
                wasName = this.trendChart.serieseList[ix].id;
                wasId   = Comm.RTComm.getServerIdByName(wasName, this.frameType);

                if (!this.trendChartData || !this.trendChartData[wasId]) {
                    continue;
                }

                if (Comm.Status[this.frameType] && Comm.RTComm.isDown(Comm.Status[this.frameType][wasId])) {
                    continue;
                }

                time  = this.trendChartData[wasId].TIME;
                value = this.trendChartData[wasId][this.trendChartStatInfo.statId];

                if (+time === 0) {
                    time = +new Date();
                }

                value = common.Util.decimalsFixed(value, this.toFixedNumber);

                this.trendChart.addValue(ix, [time, (value == null) ? -1 : value]);
                this.trendChart.setLegendValue(ix, value);
            }
        }

        // line chart
        window.requestAnimationFrame(this.trendChart.plotRedraw.bind(this.trendChart));

    },


    seriesLineTypeChange: function(isScatter) {
        var option = null,
            ix, ixLen;

        if (isScatter) {
            option = {
                show: true,
                fill: true,
                fillColor: '#FFF',
                lineWidth: 2,
                radius: 3,
                symbol: 'circle'
            };
        }

        for (ix = 0, ixLen = this.trendChart.serieseList.length; ix < ixLen; ix++) {
            if (isScatter) {
                this.trendChart.serieseList[ix][PlotChart.type.exScatter] = option;
            } else {
                delete this.trendChart.serieseList[ix][PlotChart.type.exScatter];
            }
        }
    }

});