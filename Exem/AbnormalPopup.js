Ext.define("Exem.AbnormalPopup", {
    extend: 'Exem.XMWindow',
    layout: 'vbox',
    maximizable: true,
    width: 1000,
    height: 600,
    minWidth: 1000,
    minHeight: 600,
    resizable: true,
    closeAction: 'destroy',
    title: common.Util.TR('Abnormal Section identification'),

    wooriPocDataFolder : realtime.wooriPocDataFolder,

    bodyStyle: { background: '#f5f5f5' },

    wasId    : null,
    statId   : null,
    statName : '',
    moment   : null,
    fromTime : null,
    toTime   : null,
    isFirstFlag : false,

    usefont: function(size, text, color) {
        var clr;
        if (color === undefined || color === null) {
            clr = '#000000';
        } else {
            clr = color;
        }
        return '<span style="padding-left: 0px; padding-top: 0px; font-family: Roboto Condensed; font-size: ' + size + 'px; color: ' + clr + '">' + text + '</span>';
    },

    initProperty: function() {
        this.gridArr  = [];

        this.openViewType =  Comm.RTComm.getCurrentMonitorType();
    },

    init: function() {

        this.initProperty();

        var targetPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            width: '100%',
            height: 740,
            margin: '4 4 4 4',
            border: false,
            autoScroll: true,
            bodyStyle: { background: '#ffffff' }
        });

        this.summaryTitle = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            width: '100%',
            margin: '4 4 0 4',
            border: false,
            html : '<div class="anomaly-summary-title single">요약</div><div><span class="anomaly-summary-span"></span></div>'
        });

        targetPanel.add(this.summaryTitle)
        targetPanel.add(this.createGrid());

        var listTitle = Ext.create('Ext.container.Container', {
            layout: 'absolute',
            width: '100%',
            margin: '40 4 0 4',
            border: false,
            html : '<div class="anomaly-list-title single">비정상 TX상세정보</div>'
        });
        targetPanel.add(listTitle);
        targetPanel.add(this.createGrid2());

        this.add(targetPanel);

        this.show();

        $.ajax({
            type : 'get',
            url  : '../service/' + this.wooriPocDataFolder + '/anomaly_summary_' + this.wooriPocDataFolder + '.json',
            dataType: 'json',
            contentType: 'application/json',
            success: function(data) {
                this.drawGrid(data);
            }.bind(this),
            error: function(XHR, textStatus, errorThrown) {
                console.log(XHR, textStatus, errorThrown);
            }
        });

        $.ajax({
            type : 'get',
            url  : '../service/' + this.wooriPocDataFolder + '/anomaly_list_' + this.wooriPocDataFolder + '.json',
            dataType: 'json',
            contentType: 'application/json',
            success: function(data) {
                this.drawGrid2(data);
            }.bind(this),
            error: function(XHR, textStatus, errorThrown) {
                console.log(XHR, textStatus, errorThrown);
            }
        });
    },

    createGrid: function() {
        var gridContainer = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width : '100%',
            height: 150,
            style : {
                'overflow' : 'hidden'
            }
        });

        var leftContainer = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width : '100%',
            height: '100%'
        });

        this.grid = Ext.create('Exem.BaseGrid', {
            adjustGrid : true,
            usePager: false,
            borderVisible: true,
            baseGridCls: 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            margin : '5 5 5 5',
            flex: 1,
            itemclick: function(div, record) {
                this.createPopup();
            }.bind(this)
        });

        this.grid.beginAddColumns();

        this.grid.addColumn(' '        , 'blank'   , 50, Grid.String  , true, false);
        this.grid.addColumn('critical', 'critical' , 50, Grid.String  , false, true);

        this.grid.endAddColumns();

        this.grid._grid.getView().getRowClass = function(record) {
            if (record.data.critical) {
                return 'rtm-txn-row-critical row-critical-click';
            }
        };

        leftContainer.add(this.grid);

        gridContainer.add(leftContainer);

        return gridContainer;
    },

    createGrid2: function() {
        var gridContainer = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width : '100%',
            height: 250,
            style : {
                'overflow' : 'hidden'
            }
        });

        var leftContainer = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width : '100%',
            height: '100%'
        });

        this.grid2 = Ext.create('Exem.BaseGrid', {
            adjustGrid : true,
            usePager: false,
            borderVisible: true,
            baseGridCls: 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            margin : '5 5 5 5',
            flex: 1
        });

        this.grid2.beginAddColumns();

        this.grid2.addColumn(common.Util.TR('순위')           , '순위'        , 70 , Grid.Number, true, false);
        this.grid2.addColumn(common.Util.TR('거래 코드')      , 'tr_cd'       , 100 , Grid.String, true, false);
        this.grid2.addColumn(common.Util.TR('서비스')         , 'svc_id'      , 110 , Grid.String, true, false);
        this.grid2.addColumn(common.Util.TR('호스트')         , 'host_name'  , 100 , Grid.String, true, false);
        this.grid2.addColumn(common.Util.TR('서버')           , 'svr_id', 110 , Grid.String, true, false);
        this.grid2.addColumn(common.Util.TR('비정상 건수')     , 'count', 90 , Grid.Number, true, false);
        this.grid2.addColumn(common.Util.TR('평균 수행시간 (ms)')   , 'avg_exe_time', 120 , Grid.Number, true, false);
        this.grid2.addColumn(common.Util.TR('평균 DB 수행시간 (ms)'), 'avg_db_exe_time', 140 , Grid.Number, true, false);
        
        this.grid2.endGroupColumns();

        this.grid2.endAddColumns();

        leftContainer.add(this.grid2);

        gridContainer.add(leftContainer);

        return gridContainer;
    },

    drawGrid: function(data) {
        // console.log(data);
        var ix, ixLen, Con,
            jx, jxLen;

        for (ix = 0, ixLen = data.header.host.length; ix < ixLen; ix++) {
            this.grid.beginAddColumns();
            this.grid.beginGroupColumns(data.header.host[ix]);

            Con = data.body[ix][data.header.host[ix]];
            for (jx = 0, jxLen = Con.length; jx < jxLen; jx++) {
                this.grid.addColumn(Con[jx],    Con[jx]      , 110 , Grid.Number  , true, false);
            }

            this.grid.endGroupColumns();
            this.grid.endAddColumns();
        }

        var colArr = [];
        for (ix = 2, ixLen = this.grid._columnsList.length; ix < ixLen; ix++) {
            for (jx = 0, jxLen = this.grid._columnsList[ix].columns.length; jx < jxLen; jx ++) {
                colArr.push(this.grid._columnsList[ix].columns[jx].dataIndex);
            }
        }

        var service, rowData = [];
        for (ix = 0, ixLen = data.header.service.length; ix < ixLen; ix++) {
            service = data.header.service[ix];
            rowData.push(data.header.service[ix]);

            for (jx = 0, jxLen = colArr.length; jx < jxLen; jx++) {
                if (data.body[0][colArr[jx]]) {
                    if (data.body[0][colArr[jx]][service].status == 'critical' && rowData[1] !== 1) {
                        rowData.push(1);
                    }
                    rowData.push(data.body[0][colArr[jx]][service].count);
                } else if (data.body[1][colArr[jx]]) {
                    rowData.push(data.body[1][colArr[jx]][service].count);
                } else {
                    rowData.push(data.body[2][colArr[jx]][service].count);
                }
            }

            this.grid.addRow(rowData);
        }

        this.grid.drawGrid();
        Ext.select('.anomaly-summary-span').setText(data.description);
    },

    drawGrid2: function(data) {
        var ix, ixLen, rowData;

        var keys, key;
        keys = Object.keys(data.body);
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key = keys[ix];
            rowData = data.body[key];
            this.grid2.addRow([ix+1, rowData['tr_cd'], rowData['svc_id'], rowData['host_name'], rowData['svr_id'], rowData['count'], rowData['avg_exe_time'], rowData['avg_db_exe_time']]);
        }

        this.grid2.drawGrid();
    },

    createPopup: function() {
        var causalityAnalysis= Ext.create('Exem.AbnormalTxnPopup');
        causalityAnalysis.init();
    }

});




