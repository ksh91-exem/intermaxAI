Ext.define('rtm.src.rtmDashLoadPredictCBS', {
    extend  : 'Exem.DockForm',
    title   : common.Util.TR('WAS Load Prediction'),
    layout  : 'fit',
    width   : '100%',
    height  : '100%',
    style : {
      background : '#f2f2f2'
    },

    name : { key : 'cbs', value : 'CBS' },

    // 컴포넌트가 닫혔는지 체크하는 항목
    isClosedDockForm: false,

    // 쿼리가 짧은 시간에 여러번 실행되는 것을 차단하기 위해 실행 유무를 체크하는 항목
    isRunningQuery  : false,

    // 차트를 그릴지 체크하는 항목
    isDrawStopChart : false,

    isInit : true,
    wooriPocDataFolder: realtime.wooriPocDataFolder,

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WAS_LOAD_PREDICT, this);
            this.chartId = null;
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this,
            type  : 'small-circleloading'
        });
    },

    init: function() {

        this.initProperty();

        this.background = Ext.create('Ext.container.Container', {
            layout : 'vbox',
            cls    : 'servicestat-area'
        });

        this.add(this.background);

        var title = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            layout : 'hbox',
            margin : '2 2 2 10',
            width  : '100%',
            border : false,
            bodyCls: 'servicestat-chart-area',
            html: 'some text here',
            flex: 0.2
        });

        var rowPanel = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            layout : 'hbox',
            margin : '3 10 5 10',
            width  : '100%',
            border : false,
            bodyCls: 'servicestat-chart-area',
            flex: 1
        });

        var rowPanel2 = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            layout : 'hbox',
            margin : '3 10 5 10',
            width  : '100%',
            border : false,
            bodyCls: 'servicestat-chart-area',
            flex: 1
        });

        var rowPanel3 = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            layout : 'hbox',
            margin : '3 10 5 10',
            width  : '100%',
            border : false,
            bodyCls: 'servicestat-chart-area',
            flex: 1
        });

        var colPanel = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            bodyCls: 'servicestat-chart',
            layout : 'fit',
            flex   : 1,
            height : '100%',
            border : false,
            style : {
                background : '#ffffff'
            }
        });

        var colPanel2 = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            bodyCls: 'servicestat-chart',
            layout : 'fit',
            flex   : 1,
            height : '100%',
            border : false,
            style : {
                background : '#ffffff'
            }
        });

        var colPanel3 = Ext.create('Ext.panel.Panel', {
            xtype  : 'panel',
            bodyCls: 'servicestat-chart',
            layout : 'fit',
            flex   : 1,
            height : '100%',
            border : false,
            style : {
                background : '#ffffff'
            }
        });

        this.chartId = colPanel.id;

        rowPanel.add(colPanel);
        rowPanel2.add(colPanel2);
        rowPanel3.add(colPanel3);

        this.background.add(title, rowPanel, rowPanel2, rowPanel3);

        this.chart = Ext.create('rtm.src.rtmDashLoadPredictChart', {
            parent      : this,
            parentId    : this.id,
            showLegend : false
        });

        this.chart2 = Ext.create('rtm.src.rtmDashLoadPredictChart', {
            parent      : this,
            parentId    : this.id,
            showLegend : false
        });

        this.chart3 = Ext.create('rtm.src.rtmDashLoadPredictChart', {
            parent      : this,
            parentId    : this.id,
            showLegend : false
        });

        colPanel.add(this.chart);
        colPanel2.add(this.chart2);
        colPanel3.add(this.chart3);

        this.chart.init();
        this.chart2.init();
        this.chart3.init();

        title.body.dom.innerHTML = '<div style="border: solid;background: #808080;border-color: #808080;border-radius: 20px;width: 60px;height: 23px;border-width: 2px;color: white;font-size: 14px;margin: 5px;padding: 2px;text-align:center">' + this.name.value + '</div>';
        title.body.dom.innerHTML +=
            '<div class="XMLineChart-legend" style="width: 265px;">' +
                '<div class="XMLineChart-legend-container horizontal"><span class="XMLineChart-legend-color" data-series-index="0" data-check="1" style="background-color: rgb(29, 142, 252); cursor:default;"></span>' +
                    '<span class="XMLineChart-legend-name" title="현재" data-series-index="0" style="color: rgb(85, 85, 85);">현재</span>' +
                '</div>' +
                '<div class="XMLineChart-legend-container horizontal"><span class="XMLineChart-legend-color" data-series-index="1" data-check="1" style="background-color: rgb(254, 73, 106); cursor:default;"></span>' +
                    '<span class="XMLineChart-legend-name" title="예측 값" data-series-index="1" style="color: rgb(85, 85, 85);">예측 값</span>' +
                '</div>' +
                '<div class="XMLineChart-legend-container horizontal"><span class="XMLineChart-legend-color" data-series-index="2" data-check="1" style="background-color: rgb(196, 205, 215); cursor:default;"></span>' +
                    '<span class="XMLineChart-legend-name" title="정상 범위" data-series-index="2" style="color: rgb(85, 85, 85);">정상 범위</span>' +
                '</div>' +
                '<div class="XMLineChart-legend-container last-horizontal"><span class="XMLineChart-legend-color" data-series-index="3" data-check="1" style="background-color: rgb(254, 210, 69); cursor:default;"></span>' +
                    '<span class="XMLineChart-legend-name" title="예측 범위" data-series-index="3" style="color: rgb(85, 85, 85);">예측 범위</span>' +
                '</div>' +
            '</div>';

        this.refreshChartData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WAS_LOAD_PREDICT, this);

        rowPanel   = null;
        colPanel   = null;
    },

    queryRefresh: function() {
        var folder;
        if (this.isInit) {
            folder = this.wooriPocDataFolder + '_N';
        } else {
            folder = this.wooriPocDataFolder;
        }

        $.ajax({
            url  : '../service/' + folder + '/graph_cb_was_' + this.wooriPocDataFolder + '.json',
            success: function(data) {
                this.drawAlarm(data.header.status);
                this.drawData(data.body, data.header.stat);

                this.isInit = false;
            }.bind(this),
            error: function(XHR, textStatus, errorThrown) {
                this.drawAlarm();
                this.drawData([], '');
            }.bind(this)
        });

        $.ajax({
            url  : '../service/' + folder + '/graph_cb_db_' + this.wooriPocDataFolder + '.json',
            success: function(data) {
                this.drawAlarm2(data.header.status);
                this.drawData2(data.body, data.header.stat);

                this.isInit = false;
            }.bind(this),
            error: function(XHR, textStatus, errorThrown) {
                this.drawAlarm2();
                this.drawData2([], '');
            }.bind(this)
        });

        $.ajax({
            url  : '../service/' + folder + '/graph_cb_os_' + this.wooriPocDataFolder + '.json',
            success: function(data) {
                this.drawAlarm3(data.header.status);
                this.drawData3(data.body, data.header.stat);

                this.isInit = false;
            }.bind(this),
            error: function(XHR, textStatus, errorThrown) {
                this.drawAlarm3();
                this.drawData3([], '');
            }.bind(this)
        });
    },

    frameRefresh: function() {
        this.isDrawStopChart = false;

        setTimeout(this.refreshChartData.bind(this), 30);
    },

    frameStopDraw: function() {
        this.isDrawStopChart = true;
    },

    /**
     * 서비스 지표 차트를 일정주기로 업데이트.
     *
     * 각 컴포넌트에서 업데이트 처리하던 것을 RTMDataManager에서 일괄 관리하도록 변경.
     */
    refreshChartData: function() {
        if (this.isDrawStopChart) {
            return;
        }

        if (!this.isRunningQuery) {
            this.queryRefresh();
        }
    },

    drawAlarm: function(status) {
        if (status == 'critical') {
            this.chart.up().up().setStyle('border-color', '#ff4a6b');
            this.chart.up().up().setStyle('border-style', 'solid');
            this.chart.up().up().setStyle('border-width', '3px');
        } else if (status == 'warning') {
            this.chart.up().up().setStyle('border-color', '#ffa500');
            this.chart.up().up().setStyle('border-style', 'solid');
            this.chart.up().up().setStyle('border-width', '3px');
        } else {
            this.chart.up().up().setStyle('border-color', '#bbbbbb');
            this.chart.up().up().setStyle('border-width', '0.75px');
            this.chart.up().up().setStyle('border-style', 'solid');
        }
    },

    drawAlarm2: function(status) {
        if (status == 'critical') {
            this.chart2.up().up().setStyle('border-color', '#ff4a6b');
            this.chart2.up().up().setStyle('border-style', 'solid');
            this.chart2.up().up().setStyle('border-width', '3px');
        } else if (status == 'warning') {
            this.chart2.up().up().setStyle('border-color', '#ffa500');
            this.chart2.up().up().setStyle('border-style', 'solid');
            this.chart2.up().up().setStyle('border-width', '3px');
        } else {
            this.chart2.up().up().setStyle('border-color', '#bbbbbb');
            this.chart2.up().up().setStyle('border-width', '0.75px');
            this.chart2.up().up().setStyle('border-style', 'solid');
        }
    },

    drawAlarm3: function(status) {
      if (status == 'critical') {
          this.chart3.up().up().setStyle('border-color', '#ff4a6b');
          this.chart3.up().up().setStyle('border-style', 'solid');
          this.chart3.up().up().setStyle('border-width', '3px');
      } else if (status == 'warning') {
          this.chart3.up().up().setStyle('border-color', '#ffa500');
          this.chart3.up().up().setStyle('border-style', 'solid');
          this.chart3.up().up().setStyle('border-width', '3px');
      } else {
          this.chart3.up().up().setStyle('border-color', '#bbbbbb');
          this.chart3.up().up().setStyle('border-width', '0.75px');
          this.chart3.up().up().setStyle('border-style', 'solid');
      }
    },

    drawData: function(data, stat)  {
        this.chart.statId = stat;
        this.chart.setTitle('TP : ' + stat);
        this.chart.drawData(data, stat);
    },

    drawData2: function(data, stat)  {
        this.chart2.statId = stat;
        this.chart2.setTitle('DB : ' + stat);
        this.chart2.drawData(data, stat);
    },

    drawData3: function(data, stat)  {
        this.chart3.statId = stat;
        this.chart3.setTitle('OS : ' + stat);
        this.chart3.drawData(data, stat);
    }

});

