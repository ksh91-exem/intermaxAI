/**
 * Created by jykim on 2017-07-06.
 */
Ext.define("view.StatsByResponseCode", {
    extend: "Exem.FormOnCondition",
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        }
    },

    sql: {
        summaryMaxTime  : 'IMXPA_WebSummaryMaxTime.sql',
        gridData        : 'IMXPA_WebStatsByResponseCode.sql',
        pieChart        : 'IMXPA_WebStatsByResponseCode_PieChart.sql',
        scatterChart    : 'IMXPA_WebStatsByResponseCode_ScatterChart.sql'
    },

    httpCode: [
        { major: '4xx', minor: '400', desc: 'Bad Request' },
        { major: '4xx', minor: '401', desc: 'Unauthorized' },
        { major: '4xx', minor: '403', desc: 'Forbidden' },
        { major: '4xx', minor: '404', desc: 'Not Found' },
        { major: '4xx', minor: '405', desc: 'Method Not Allowed' },
        { major: '4xx', minor: '406', desc: 'Not Acceptable' },
        { major: '4xx', minor: '408', desc: 'Request Timeout' },
        { major: '4xx', minor: '414', desc: 'Request-URI Too Long' },

        { major: '5xx', minor: '500', desc: 'Internal Server Error' },
        { major: '5xx', minor: '501', desc: 'Not Implemented' },
        { major: '5xx', minor: '502', desc: 'Bad Gateway' },
        { major: '5xx', minor: '503', desc: 'Service Unavailable' }
    ],

    initProperty : function(){
        this.defaultCodeList = ['400', '401', '403', '404', '500', '503'];
        this.txnList_Obj = {};
        this.retrieveFlag = false;
        this.envKeyChartOption = 'pa_stats_by_response_code_list';
        this.selectedCodeList = Comm.web_env_info[this.envKeyChartOption];
    },

    init: function(){
        var self = this;

        this.initProperty();

        this.setWorkAreaLayout('border');

        this.txnTabPanel = Ext.create('Exem.TabPanel', {
            region: 'north',
            layout: 'fit',
            height: '50%',
            split: true,
            minHeight: 100,
            listeners: {
                scope: this,
                render: function(me) {
                    me.setActiveTab(0);
                },
                tabchange: function( tabPanel, newCard ){
                    newCard.add(self.txnGrid);
                    self.conditionExecuteSQL();
                }
            }
        });

        var botPanel = Ext.create('Exem.Panel', {
            region: 'center',
            layout: 'hbox',
            minHeight: 300,
            height: '50%',
            title: common.Util.TR('Transaction Detail')
        });

        this.createConditionLayout(this.conditionArea);
        this.createTopLayout(this.txnTabPanel);
        this.createBotLayout(botPanel);

        this.workArea.add(this.txnTabPanel, botPanel);
    },

    createConditionLayout: function(base) {
        this.wasCombo = Ext.create('Exem.wasDBComboBox', {
            x: 380,
            y: 5,
            width: 350,
            comboWidth: 230,
            comboLabelWidth: 60,
            multiSelect: true,
            selectType: common.Util.TR('Agent')
        });

        this.txnName = Ext.create('Exem.TextField', {
            x: 700,
            y: 5 ,
            width: 450,
            fieldLabel: '',
            labelAlign: 'right',
            labelWidth: 150,
            allowBlank: false,
            value: common.Util.TR('Transaction Name'),//'%',
            listeners: {
                focus: function () {
                    if ( this.getValue() == '%' || this.getValue() == common.Util.TR('Transaction Name') )
                        this.setValue('%') ;
                }
            }
        });

        this.orderByRadioCon = Ext.create('Exem.FieldContainer', {
            x: 400,
            y: 30,
            width: 250,
            layout: 'hbox',
            defaultType: 'radiofield',
            defaults: {
                flex: 1
            },
            items: [{
                width: 100,
                boxLabel: common.Util.TR('By Elapse Time'),
                name: this.id + '_orderByType',
                inputValue: 'txn_elapse_avg',
                checked: true
            },{
                width: 100,
                boxLabel: common.Util.TR('By Execution Count'),
                name: this.id + '_orderByType',
                inputValue: 'txn_exec_count'
            }]
        });

        this.avgElapseTime = Ext.create('Exem.NumberField', {
            x: 620,
            y: 30,
            width: 232,
            fieldLabel: common.Util.TR('Elapse Time (AVG) >='),
            labelAlign: 'right',
            labelWidth: 170,
            labelSeparator: '',
            allowBlank: false,
            maxLength: 10,
            value: 0,
            maxValue: 2147483647,
            minValue: 0,
            enforceMaxLength: true,
            enableKeyEvents: true
        });

        base.add(this.wasCombo, this.txnName, this.orderByRadioCon, this.avgElapseTime);
    },

    createTopLayout: function(base) {
        var self = this;
        var totalPanel = Ext.create('Exem.Panel', {
            title    : common.Util.TR('Total'),
            itemId   : 'total',
            split    : true,
            layout   : 'fit'
        }) ;

        base.add(totalPanel);

        this.txnGrid = Ext.create('Exem.BaseGrid', {
            layout : 'fit',
            itemclick: function(dv, record) {
                self.chartSetting(record.data.txn_id);
            }
        });

        this.setHttpCodeBtn = Ext.create('Ext.button.Button',{
            text      : common.Util.TR('Setting Http Code'),
            margin    : '2 5 2 0',
            style     : {
                cursor    : 'pointer',
                lineHeight: '18px'
            },
            listeners : {
                scope: this,
                click: function() {
                    var window = this.createCodeChangeWindow();

                    window.init();
                    window.show();
                }
            }
        });
        this.txnTabPanel.getTabBar().add({xtype: 'tbspacer', flex: 8});
        this.txnTabPanel.getTabBar().add(this.setHttpCodeBtn);

        this.txnGrid.contextMenu.addItem({
            title : common.Util.TR('Transaction Summary'),
            fn: function() {
                var record = this.up().record;
                var was_id, txnHistory;
                var active_tab = self.txnTabPanel.getActiveTab() ;
                if ( active_tab.itemId == 'total' ){
                    txnHistory = common.OpenView.open('WebTxnHistory', {
                        isWindow : false,
                        width    : 1200,
                        height   : 800,
                        fromTime : self.datePicker.getFromDateTime(),
                        toTime   : self.datePicker.getToDateTime(), // 10분 더하기
                        transactionTF: '%' + common.Util.cutOffTxnExtName(record['txn_name'])
                    });
                }
                else{
                    was_id = active_tab.itemId ;
                    txnHistory = common.OpenView.open('WebTxnHistory', {
                        isWindow : false,
                        width    : 1200,
                        height   : 800,
                        fromTime : self.datePicker.getFromDateTime(),
                        toTime   : self.datePicker.getToDateTime(), // 10분 더하기
                        transactionTF: '%' + common.Util.cutOffTxnExtName(record['txn_name']),
                        wasId    : was_id
                    });
                }

                setTimeout(function(){
                    txnHistory.retrieve();
                }, 300);
            }
        }, 0);

        totalPanel.add(this.txnGrid);

        this.txnGrid.beginAddColumns();
        this.txnGrid.addColumn('TXN ID'                                            , 'txn_id'        , 100 , Grid.String , false, true);
        this.txnGrid.addColumn(common.Util.CTR('Transaction')                      , 'txn_name'      , 300 , Grid.String , true , false);
        this.txnGrid.addColumn(common.Util.CTR('Transaction Execution Count')      , 'txn_exec_count', 140 , Grid.Number , true , false);
        this.txnGrid.addColumn(common.Util.CTR('Transaction Elapse Time (Total)')  , 'txn_elapse'    , 160 , Grid.Float  , true , false);
        this.txnGrid.addColumn(common.Util.CTR('Transaction Elapse Time (MAX)')    , 'txn_elapse_max', 160 , Grid.Float  , true , false);
        this.txnGrid.addColumn(common.Util.CTR('Transaction Elapse Time (AVG)')    , 'txn_elapse_avg', 160 , Grid.Float  , true , false);
        this.txnGrid.addColumn('400'                                               , 'code_0'        , 60  , Grid.Number , true , false);
        this.txnGrid.addColumn('401'                                               , 'code_1'        , 60  , Grid.Number , true , false);
        this.txnGrid.addColumn('403'                                               , 'code_2'        , 60  , Grid.Number , true , false);
        this.txnGrid.addColumn('404'                                               , 'code_3'        , 60  , Grid.Number , true , false);
        this.txnGrid.addColumn('500'                                               , 'code_4'        , 60  , Grid.Number , true , false);
        this.txnGrid.addColumn('503'                                               , 'code_5'        , 60  , Grid.Number , true , false);
        this.txnGrid.endAddColumns();

        if(this.selectedCodeList){
            var ix,ixLen;
            for( ix = 0, ixLen = this.selectedCodeList.length; ix < ixLen; ix++ ){
                this.txnGrid._findColumns('code_'+ix).setText(this.selectedCodeList[ix]);
                this.txnGrid._findColumns('code_'+ix).setHidden(false);
            }

            for(ix = ixLen; ix < 6; ix++){
                this.txnGrid._findColumns('code_'+ix).setHidden(true);
            }
        }
    },

    createBotLayout: function(base) {
        this.pieChartByCode = Ext.create('Exem.chart.CanvasChartLayer', {
            layout: 'fit',
            title: common.Util.TR('Processing Rate By HTTP Code'),
            legendTextAlign: 'east',
            titleHeight: 30,
            flex: 1,
            showHistoryInfo: false,
            showTitle: true,
            showLegend: true,
            showLegendValueArea: false,
            showTooltip: true,
            toolTipFormat: '[%s] %y',
            chartProperty: {
                colors : realtime.Colors
            }
        });

        this.txnElapseChart = Ext.create('Exem.chart.CanvasChartLayer', {
            layout: 'fit',
            flex: 1,
            split: true,
            title: common.Util.TR('Transaction Elapse Time'),
            minWidth: 300,
            titleHeight: 30,
            showTitle: true,
            showTooltip: true,
            interval: PlotChart.time.exMin,
            toolTipFormat: '%x [value:%y]',
            toolTipTimeFormat: '%d %H:%M',
            chartProperty: {
                colors : realtime.Colors
            }
        });

        base.add(this.pieChartByCode, this.txnElapseChart);
    },


    setSelectedCodes: function(selectedList, window) {
        if(selectedList.length > 6){
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('You can select up to six.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return;
        }
        this.selectedCodeList = selectedList;
        common.WebEnv.Save(this.envKeyChartOption, selectedList);
        window.close();
        this.executeSQL();
    },

    createCodeChangeWindow: function() {
        var tabInfo = {},
            window,httpCodeList;

        var ix,ixLen;

        tabInfo['HTTP CODE'] = [];

        tabInfo['HTTP CODE'].push({
            data: ['4xx', ''],
            child : []
        });

        tabInfo['HTTP CODE'].push({
            data: ['5xx', ''],
            child : []
        });

        for(ix = 0, ixLen = this.httpCode.length; ix < ixLen; ix++){
            if(this.httpCode[ix].major === '4xx'){
                tabInfo['HTTP CODE'][0].child.push({
                    data: [this.httpCode[ix].minor, this.httpCode[ix].desc]
                });
            } else if(this.httpCode[ix].major === '5xx'){
                tabInfo['HTTP CODE'][1].child.push({
                    data: [this.httpCode[ix].minor, this.httpCode[ix].desc]
                });
            }
        }

        function addColumns(grid) {
            grid.beginAddColumns();
            grid.addColumn({text: common.Util.CTR('Code Status'), dataIndex: 'code',  width: 90,  type: Grid.tree,    alowEdit: false, editMode: false, hide: false});
            grid.addColumn({text: common.Util.CTR('Description'), dataIndex: 'desc',  width: 160, type: Grid.String,  alowEdit: false, editMode: false, hide: false});
            grid.endAddColumns();
        }

        if(this.selectedCodeList){
            httpCodeList = this.selectedCodeList;
        } else {
            httpCodeList = this.defaultCodeList;
        }


        window = Ext.create('Exem.CommonStatWindow', {
            okFn: this.setSelectedCodes.bind(this),
            addColumns: addColumns,
            isTree: true,

            tabInfo: tabInfo,
            activeTabIndex: 0,
            comboDataIndex: 0,
            comboDataField: 'code',
            selectedList: httpCodeList
        });

        return window;
    },

    chartSetting : function(txnId){
        var ix,ixLen,httpCodeList,
            dataSet = {},
            wasList = this.wasCombo.getValue(),
            wsId = this.txnTabPanel.getActiveTab().itemId;

        this.loadingMask.show();

        if(this.selectedCodeList){
            httpCodeList = this.selectedCodeList;
        } else {
            httpCodeList = this.defaultCodeList;
        }

        this.pieChartByCode.removeAllSeries();
        this.pieChartByCode.labelLayer.removeAll();


        this.txnElapseChart.clearValues();
        this.txnElapseChart.clearAllSeires();
        this.txnElapseChart.plotRedraw();

        this.pieChartByCode.suspendLayouts();
        this.txnElapseChart.suspendLayouts();

        for (ix = 0, ixLen = httpCodeList.length; ix < ixLen; ix++) {

            this.pieChartByCode.addSeries({
                label : httpCodeList[ix],
                id    : httpCodeList[ix],
                type  : PlotChart.type.exPie
            });

            this.txnElapseChart.addSeries({
                id      : httpCodeList[ix],
                label   : httpCodeList[ix],
                type    : PlotChart.type.exScatter
            });
        }

        this.pieChartByCode.resumeLayouts();
        this.pieChartByCode.doLayout();
        this.pieChartByCode.plotRedraw();

        this.txnElapseChart.resumeLayouts();
        this.txnElapseChart.doLayout();
        this.txnElapseChart.plotRedraw();

        dataSet.sql_file = this.sql.pieChart;

        dataSet.bind = [{
            name    : 'from_time',
            value   : Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type    : SQLBindType.STRING
        }, {
            name    : 'to_time',
            value   : this.toTime,
            type    : SQLBindType.STRING
        }, {
            name    : 'txn_id',
            value   : txnId,
            type    : SQLBindType.STRING
        }];


        if(wsId == 'total'){
            dataSet.replace_string = [{
                name : 'ws_id',
                value: wasList
            }, {
                name : 'http_status',
                value: httpCodeList.join(',')
            }];
        } else{
            dataSet.replace_string = [{
                name : 'ws_id',
                value: wsId
            }, {
                name : 'http_status',
                value: httpCodeList.join(',')
            }];
        }

        WS.SQLExec(dataSet, this.onChartData, this);



        dataSet.sql_file = this.sql.scatterChart;

        dataSet.bind = [{
            name    : 'from_time',
            value   : Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type    : SQLBindType.STRING
        }, {
            name    : 'to_time',
            value   : this.toTime,
            type    : SQLBindType.STRING
        }, {
            name    : 'txn_id',
            value   : txnId,
            type    : SQLBindType.STRING
        }];


        if(wsId == 'total'){
            dataSet.replace_string = [{
                name : 'ws_id',
                value: wasList
            }, {
                name : 'http_status',
                value: httpCodeList.join(',')
            }];
        } else{
            dataSet.replace_string = [{
                name : 'ws_id',
                value: wsId
            }, {
                name : 'http_status',
                value: httpCodeList.join(',')
            }];
        }

        WS.SQLExec(dataSet, this.onChartData, this);
    },

    executeSQL: function() {
        var ix, ixLen, wsIds;

        //pieChart 초기화
        this.pieChartByCode.clearValues();
        this.pieChartByCode.removeAllSeries();
        this.pieChartByCode.labelLayer.removeAll();
        this.pieChartByCode.plotRedraw();

        this.txnElapseChart.clearValues();
        this.txnElapseChart.clearAllSeires();
        this.txnElapseChart.plotRedraw();


        this.txnTabPanel.setActiveTab(0);

        this.txnTabPanel.suspendLayouts();

        for ( ix = this.txnTabPanel.items.length; ix > 1 ; ix-- ){
            this.txnTabPanel.items.items[1].destroy();
        }

        wsIds = this.wasCombo.getValue().split(',');

        for(ix = 0, ixLen = wsIds.length; ix < ixLen; ix++) {
            this.wsId   = wsIds[ix];
            this.wsName = Comm.webServersInfo[wsIds[ix]].name ;
            this.txnList_Obj[this.wsName] = this.txnListTabPanelAdd(wsIds[ix], this.wsName);
        }
        this.txnTabPanel.resumeLayouts();
        this.txnTabPanel.doLayout();
        this.retrieveFlag = true;

        var dataSet = {};

        dataSet.sql_file = this.sql.summaryMaxTime;


        WS.SQLExec(dataSet, this.getSummaryMaxTime, this);
    },


    txnListTabPanelAdd : function(id, name){
        var tabPanel = this.txnTabPanel;

        //상단 Tab page에 Add
        var txnListPanel = Ext.create('Exem.Panel', {
            title  : name,
            itemId : id,
            layout : 'fit'
        });

        tabPanel.add(txnListPanel);
    },

    getSummaryMaxTime: function(header, data){
        if(!common.Util.checkSQLExecValid(header, data)){
            console.info('time Error');
            console.info(header);
            console.info(data);
            return;
        }

        this.summaryMaxTime = data.rows[0][0];
        this.conditionExecuteSQL();
    },

    conditionExecuteSQL: function(){
        var ix, ixLen, httpCodeList, wsId, txnName,
            dataSet = {},
            wasList = this.wasCombo.getValue();


        if (this.retrieveFlag){

            this.loadingMask.show();

            wsId = this.txnTabPanel.getActiveTab().itemId;

            if ( this.txnName.getValue() ==  common.Util.TR('Transaction Name') ){
                txnName = '%' ;
            }else{
                txnName = this.txnName.getValue() ;
            }

            if ( this.avgElapseTime.getValue() == null ){
                this.avgElapseTime.setValue( 0 ) ;
            }

            if(this.selectedCodeList){
                httpCodeList = this.selectedCodeList;
            } else {
                httpCodeList = this.defaultCodeList;
            }

            for( ix = 0, ixLen = httpCodeList.length; ix < ixLen; ix++ ){
                this.txnGrid._findColumns('code_'+ix).setText(httpCodeList[ix]);
                this.txnGrid._findColumns('code_'+ix).setHidden(false);
            }

            for(ix = ixLen; ix < 6; ix++){
                this.txnGrid._findColumns('code_'+ix).setHidden(true);
            }

            dataSet.sql_file = this.sql.gridData;

            var maxTime = new Date(this.summaryMaxTime);
            var toPickerTime = new Date(this.datePicker.getToDateTime());

            if(+maxTime> +toPickerTime){
                maxTime = toPickerTime;
            } else{
                //summaryMaxTime값이 30분 일경우, 날 데이터는 30:59까지의 데이터를 뽑아야 동일해진다.
                //그러므로 summaryMaxTime값으로 데이터를 뽑기 위해서는 31분 미만 데이터를 추출하기 위한 +1분
                maxTime = maxTime.setMinutes(maxTime.getMinutes() + 1);
            }

            this.toTime = common.Util.getDate(maxTime);

            dataSet.bind = [{
                name    : 'from_time',
                value   : common.Util.getDate(this.datePicker.getFromDateTime()),
                type    : SQLBindType.STRING
            }, {
                name    : 'to_time',
                value   : this.toTime,
                type    : SQLBindType.STRING
            }, {
                name    : 'txn_name',
                value   : txnName,
                type    : SQLBindType.STRING
            }, {
                name    : 'elapse',
                value   : this.avgElapseTime.getValue(),
                type    : SQLBindType.FLOAT
            }];


            if(wsId == 'total'){
                dataSet.replace_string = [{
                    name : 'ws_id',
                    value: wasList
                }, {
                    name : 'http_status',
                    value: httpCodeList.join(',')
                }];
            } else{
                dataSet.replace_string = [{
                    name : 'ws_id',
                    value: wsId
                }, {
                    name : 'http_status',
                    value: httpCodeList.join(',')
                }];
            }

            if (this.orderByRadioCon.getCheckedValue() == common.Util.TR('txn_elapse_avg')){
                this.txnGrid.setOrderAct('txn_elapse_avg', 'DESC');
            }else {
                this.txnGrid.setOrderAct('txn_exec_count', 'DESC');
            }

            WS.SQLExec(dataSet, this.onData, this);
        }
    },

    onData : function(header, data){
        var ix,ixLen, jx, jxLen, kx;

        this.txnGrid.loadingMask.show();

        if(!common.Util.checkSQLExecValid(header, data)){
            console.info('Stats_By_ResponseCode');
            console.info(header);
            console.info(data);
            this.loadingMask.hide();
            this.txnGrid.loadingMask.hide();
            return;
        }

        this.txnGrid.clearRows();

        var statData, httpCodeData,
            tempStatData, httpCodeCount;

        for (ix = 0, ixLen = data[0].rows.length; ix < ixLen; ix++) {
            statData = data[0].rows[ix];
            //txn_id check
            if(statData[0]){
                //원본 데이터 가공 x
                tempStatData = [];
                tempStatData.push(statData);
            }
            for(jx = 0 , jxLen = data[1].rows.length; jx < jxLen; jx++){
                httpCodeData = data[1].rows[jx];

                if(tempStatData[0][0] === httpCodeData[0]){
                    tempStatData.push({httpCode : httpCodeData[1], httpCodeCount : httpCodeData[2]});
                }
            }

            httpCodeCount = {};
            if(tempStatData[1]){
                for(jx = 1, jxLen = tempStatData.length; jx < jxLen; jx++){
                    for (kx = 0; kx < 6; kx++){
                        if(tempStatData[jx].httpCode == this.txnGrid._findColumns('code_'+kx).text){
                            httpCodeCount[kx] = tempStatData[jx].httpCodeCount;
                        }
                        if(!httpCodeCount[kx]){
                            httpCodeCount[kx] = 0;
                        }
                    }
                }
            } else{
                for (jx = 0; jx < 6; jx++){
                    httpCodeCount[jx] = 0;
                }
            }

            this.txnGrid.addRow([
                statData[0] //txn_id
                , statData[1] //txn_name
                , statData[2] //txn_exec_count
                , statData[3] //txn_elapse
                , statData[4] //txn_elapse_max
                , statData[5] //txn_elapse_avg
                , httpCodeCount[0] //code_0
                , httpCodeCount[1] //code_1
                , httpCodeCount[2] //code_2
                , httpCodeCount[3] //code_3
                , httpCodeCount[4] //code_4
                , httpCodeCount[5] //code_5
            ]);
        }
        this.txnGrid.drawGrid();
        this.txnGrid.loadingMask.hide();
        this.loadingMask.hide();
    },

    onChartData: function(header, data){
        var dataRows = data.rows;
        var ix, ixLen;

        if(!common.Util.checkSQLExecValid(header, data)){
            this.showMessage(common.Util.TR('ERROR'), header.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});
            this.loadingMask.hide();

            console.debug(header);
            console.debug(data);
            return;
        }


        if(header.command === this.sql.pieChart){
            var ratio, dataTotal = 0;

            this.pieChartByCode.loadingMask.show();

            for ( ix = 0, ixLen = dataRows.length; ix < ixLen; ix++ ) {
                dataTotal += +dataRows[ix][2];
            }

            for ( ix = 0, ixLen = dataRows.length; ix < ixLen; ix++) {
                ratio = (dataRows[ix][2] / dataTotal * 100);
                this.pieChartByCode.setData(dataRows[ix][1], dataRows[ix][2] || 0);
            }

            this.pieChartByCode.plotDraw();
            this.pieChartByCode.loadingMask.hide();
        } else if(header.command === this.sql.scatterChart){
            var jx, jxLen, xaxis, httpCodeList, selectSeries;

            this.txnElapseChart.loadingMask.show();

            for (ix = 0, ixLen = dataRows.length; ix < ixLen; ix++) {
                xaxis = +new Date(dataRows[ix][0]);

                if(this.selectedCodeList){
                    httpCodeList = this.selectedCodeList;
                } else {
                    httpCodeList = this.defaultCodeList;
                }

                //코드 번호와 시리즈 매칭
                for( jx = 0, jxLen = httpCodeList.length; jx < jxLen; jx++ ){
                    if(httpCodeList[jx] == dataRows[ix][2]){
                        selectSeries = jx;
                    }
                }

                if(selectSeries === undefined){
                    continue;
                }

                this.txnElapseChart.addValue(selectSeries, [xaxis, dataRows[ix][3]]);
            }

            this.txnElapseChart.plotDraw();
            this.txnElapseChart.loadingMask.hide();
        }
        this.loadingMask.hide();
    }
});