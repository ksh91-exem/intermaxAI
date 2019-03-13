/*
* 사용하지 X
* */

Ext.define("view.ClientResponseTrend", {
    extend: "Exem.FormOnCondition",
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql: {
        byTxn : 'IMXPA_ClientResponseTrend_Txn.sql',
        byIp  : 'IMXPA_ClientResponseTrend_IP.sql',
        chart : 'IMXPA_ClientResponseTrend_Chart.sql'
    },

    showMessage: function(title, message, buttonType, icon, fn) {
        Ext.Msg.show({
            title  : title,
            msg    : message,
            buttons: buttonType,
            icon   : icon,
            fn     : fn
        });
    },


    checkValid: function() {
        var self = this;
        // txnName field 에 아무것도 없다면 자동으로 % 를 입력해줌.
        if (self.txnNameTF.getValue().trim().length < 1)
            self.txnNameTF.setValue('%');

        if (self.ipTF.getValue().trim().length < 1)
            self.ipTF.setValue('%');


        return true;
    },


    init: function() {
        var self = this;

        // txn radio버튼이 체크된 상태로 검색한 적 있는지
        self.txnRetreiveFlag = false;
            // ip radio 버튼이 체크된 상태로 검색한 적 있는지
        self.ipRetreiveFlag  = false;
        self.firstRadioValue = 0;

        self.byTxnStore = [];
        self.byIpStore  = [];
        self.byTxnCellStore = {};
        self.byIpCellStore = {};

        self.setWorkAreaLayout('border');

        /**************************** Condition Area *****************************/
            //TxnName TextField
        self.txnNameTF = Ext.create('Exem.TextField', {
            fieldLabel: common.Util.TR('Transaction Name'),
            labelAlign: 'right',
            itemId    : 'TxnName_TF',
            allowBlank: false,     // 빈 값 나오면 빨간줄 나오는 것
            value : '%',
            labelWidth: 105,
            maxLength : 255,
            enforceMaxLength:true,
            width: 350,
            x: 380,
            y: 5
        });

        // IP TextField
        self.ipTF = Ext.create('Exem.TextField', {
            fieldLabel: common.Util.TR('IP'),
            itemId    : 'ipTF',
            labelAlign: 'right',
            allowBlank: false,
            disabled  : true,
            value : '%',
            labelWidth: 20,
            maxLength : 15,
            enforceMaxLength:true,
            width: 265,
            x: 465,
            y: 30
        });

        // radio 버튼을 넣어줄 FieldContainer

        self.firstRadioType = Ext.create('Exem.FieldContainer', {
            x: 760,
            y: 5,
            layout      : 'hbox',
            width       : 250,
            itemId      : 'firstRadioType',
            defaultType : 'radiofield',
            defaults    : {flex : 1},
            items       : [{
                boxLabel  : common.Util.TR('by Transaction'),
                name      : 'firstType',
                inputValue: 0,
                itemId    : 'byTxn',
                checked   : true,
                listeners : {
                    change : function (field){
                        if (field.getValue()) {
                            self.firstRadioValue = 0;
                            self.conditionArea.getComponent('ipTF').disable();

                            if (self.txnRetreiveFlag || self.ipRetreiveFlag) {
                                self.mainTabPnl.getComponent(self.mainTabPnl.getActiveTab().itemId)
                                    .getComponent('gridPnl').getComponent('crtGrid').clearRows();
                                self._gridReDraw();
                            }
                        }
                    }
                }
            }, {
                boxLabel  : common.Util.TR('IP'),
                name      : 'firstType',
                inputValue: 1,
                itemId    : 'byIP',
                listeners : {
                    change : function (field){
                        if (field.getValue()) {
                            self.firstRadioValue = 1;
                            self.conditionArea.getComponent('ipTF').enable();

                            if (self.ipRetreiveFlag || self.txnRetreiveFlag) {
                                self.mainTabPnl.getComponent(self.mainTabPnl.getActiveTab().itemId)
                                    .getComponent('gridPnl').getComponent('crtGrid').clearRows();
                                self._gridReDraw();
                            }
                        }
                    }
                }
            }]
        });

        // 상단 Area 설정 --- TF 는 TextField의 약자
        self.conditionArea.add(self.txnNameTF);
        self.conditionArea.add(self.firstRadioType);
        self.conditionArea.add(self.ipTF);

        /*************************************************************************/

        /**************************** Work Area **********************************/

        self.mainChart = Ext.create('Exem.chart.CanvasChartLayer', {
            layout       : 'fit',
            itemId       : 'mainChart',
            region       : 'north',
            height       : '20%',
            minHeight    : 100,
            split        : true,
            showLegend   : true,
            showTooltip  : true,
            showIndicator: false,
            legendOrder  : PlotChart.legendOrder.exDesc,
            toolTipFormat: '[%s: %x] [value: %y]',
//            toolTipFormat: '%s [value: %y]',
            interval: PlotChart.time.exTenMin,
            toolTipTimeFormat : '%d %H:%M',
            chartProperty: {
//                timeformat : '%d %H:%M',
                mode: 'categories',
                colors : ['#d8a53f','#155496','#ff110f']
            }
        });


        self.mainChart.addSeries({
            id     : 'dbTime',
            label  : common.Util.TR('DB Time'),
            type   : PlotChart.type.exLine,
            stack  : true
        });
        self.mainChart.addSeries({
            id     : 'wasTime',
            label  : common.Util.TR('Agent Time'),
            type   : PlotChart.type.exLine,
            stack  : true
        });
        self.mainChart.addSeries({
            id     : 'clientTime',
            label  : common.Util.TR('Client Time'),
            type   : PlotChart.type.exLine,
            stack  : true
        });

        var mainTabPnl = Ext.create('Exem.TabPanel', {
            layout : 'fit',
            itemId : 'mainTabPnl',
            region : 'center',
            minHeight: 400,
            listeners: {
                tabchange: function( tabPanel, newCard ){
                    /* tabPanel - mainTabPnl
                     newCard  - 내가 선택한 탭 */
                    // for문으로 만든 gridPnl
                    newCard.items.items[1].add(self.crtGrid);
                    self._gridReDraw();
                }
            }
        });

        var allTab = Ext.create('Exem.Panel', {
            layout : 'vbox',
            itemId : 'allTab',
            title  : common.Util.TR('All')
        });
        var clientTab = Ext.create('Exem.Panel', {
            layout : 'vbox',
            itemId : 'clientTab',
            title  : common.Util.TR('Client')
        });
        var wasTab = Ext.create('Exem.Panel', {
            layout : 'vbox',
            itemId : 'wasTab',
            title  : common.Util.TR('Agent')
        });
        var dbTab = Ext.create('Exem.Panel', {
            layout : 'vbox',
            itemId : 'dbTab',
            title  : common.Util.TR('DB')

        });

        self.allTab = allTab;
        self.clientTab = clientTab;
        self.wasTab = wasTab;
        self.dbTab = dbTab;
        self.mainTabPnl = mainTabPnl;

        mainTabPnl.add(allTab, clientTab, wasTab, dbTab);
        self.workArea.add(mainTabPnl);
        self.workArea.add(self.mainChart);



        for (var ix = 0; ix < mainTabPnl.items.length; ix++) {
            var tBar = Ext.create('Exem.Container', {
                layout : 'hbox',
                itemId : 'tBar',
                margin : '5 0 0 5',
                height : 25

            });

            var responseNF = Ext.create('Exem.NumberField', {
                fieldLabel: common.Util.TR('Response Time Ratio') + '>=',
                itemId    : 'responseRatio',
                labelAlign: 'right',
                fieldStyle: 'text-align: right;',
                allowBlank: false,
                // : 이 붙는 것을 없앰
                labelSeparator: '',
                labelWidth: 105,
                value     : 50,
                width     : 160,
                allowDecimals : false,
                maxValue  : 100,
                minValue  : 0,
                maxLength : 3,
                enforceMaxLength: true,
                enableKeyEvents: true,
//                hideTrigger: true,
//                keyNavEnabled: false,
//                mouseWheelEnabled: false,
//                plugins: [new Ext.ux.InputTextMask('999', false)],
                listeners : {
                    keydown: function (numField, e) {
                        console.debug(e.button);
                        if ((e.button == 189) || (e.button == 188) || (e.button == 186) || (e.button == 68) || (e.button == 228))
                            e.stopEvent();
                    }
                }


            });
            var responseNFLabel = Ext.create('Ext.form.Label', {
                text : '%',
                margin: '5 15 5 5'
            });

            /**
            var spacer1 = Ext.create("Ext.toolbar.Spacer", {
                width : 10
            });
             */

            var refreshBtn = Ext.create('Exem.Button', {
                text  : common.Util.TR('Refresh'),
                width : 70,
                itemId: 'refreshBtn',
//                renderTo : Ext.getBody(), // 이렇게 주면 어플리케이션 생성시에 붙여서 화면에 붙음.
                handler  : function () {
                    var responseRatio = self.mainTabPnl.getComponent(self.mainTabPnl.getActiveTab().itemId)
                        .getComponent('tBar').getComponent('responseRatio');

                    if (self.txnRetreiveFlag || self.ipRetreiveFlag) {
                        if (responseRatio.getValue() == null) {
                            responseRatio.setValue('50');
                        }
                        if ((responseRatio.getValue() < 0 ) || (responseRatio.getValue() > 100)) {
                            self.showMessage(common.Util.TR('ERROR'), common.Util.TR('Input value is out of range.') +
                                '<br>' + '<font-size = "2">'+ common.Util.TR('Search Range')+': 0~100)</font-size>',
//                            self.showMessage('ERROR', common.Util.T('Input value has been exceeded') +
//                                '<br>' + '<font-size = "2"> (allowed range: 0~100) </font-size>',
                                Ext.Msg.OK, Ext.MessageBox.ERROR, function() {

                                responseRatio.focus();
                            });
                            return false;
                        }

                        self._gridReDraw();
                    }
                }
            });

            var legendArea = Ext.create('Exem.Container', {
                layout: {
                    type: "hbox",
                    pack: "start",
                    align: "middle"
                },
//                flex   : 1,
                width  : 280,
                itemId : 'legendArea',
                items  : [{
                    xtype: 'label',
                    itemId: 'clientColor',
                    width : 6,
                    height: 8,
                    margin: {
                        right: 4
                    },
                    style : {
                        'background-color': '#ff110f'
                    }
                }, {
                    xtype: 'label',
                    width : 80,
                    itemId: 'clientTime',
                    text : common.Util.TR('Client Time')
                }, {
                    xtype: 'label',
                    itemId: 'dbColor',
                    width : 6,
                    height: 8,
                    margin: {
                        right: 4
                    },
                    style : {
                        'background-color': '#d8a53f'
                    }
                }, {
                    xtype: 'label',
                    width : 70,
                    itemId: 'dbTime',
                    text : common.Util.TR('DB Time')
                }, {

                    xtype: 'label',
                    itemId: 'wasColor',
                    width : 6,
                    height: 8,
                    margin: {
                        right: 4
                    },
                    style : {
                        'background-color': '#155496'
                    }

                }, {
                    xtype: 'label',
                    width : 70,
                    itemId: 'wasTime',
                    text : common.Util.TR('Agent Time')
                }]
            });

            self.secondRadioType = Ext.create('Exem.FieldContainer', {
                layout      : 'hbox',
                width       : 150,
                itemId      : 'secondRadioType',
                defaultType : 'radiofield',
                defaults    : {flex : 1},
                items       : [{
                    boxLabel  : common.Util.TR('MAX'),
                    name      : 'secondType'+ix,
                    inputValue: 'max',
                    itemId    : 'max',
                    checked   : true,
                    listeners : {
                        change : function (){
                            self.gridMaxAvgChange();
                        }
                    }
                }, {
                    boxLabel  : common.Util.TR('AVG'),
                    name      : 'secondType'+ix,
                    inputValue: 'avg',
                    itemId    : 'avg'
                }]
            });
            var gridPnl = Ext.create("Exem.Container", {
                layout : 'fit',
                flex   : 1,
                itemId : 'gridPnl'
            });
            var allSpacer = Ext.create("Ext.toolbar.Spacer", {
                width : 220
            });
            var spacer = Ext.create("Ext.toolbar.Spacer", {
                flex : 5
            });

            if ( ix == 0 ) {
                tBar.add(allSpacer, spacer, legendArea, self.secondRadioType);
//                mainTabPnl.items.items[ix].add(tBar, gridPnl)
                self.allTab.add(tBar, gridPnl);
            } else {
                self.secondRadioType.getComponent('avg').setValue(true);
                tBar.add(responseNF, responseNFLabel, refreshBtn, spacer, legendArea, self.secondRadioType);
                mainTabPnl.items.items[ix].add(tBar, gridPnl);
            }
        }

        self.crtGrid = Ext.create('Exem.BaseGrid', {
            localeType : 'Y-m-d H:i',
            itemId     : 'crtGrid'/*,
            gridName   : 'self.crtGrid'*/
        });

        self.crtGrid.beginAddColumns();

        self.crtGrid.addColumn(common.Util.TR('Time'),              'TIME',             130, Grid.DateTime, true, false);
        self.crtGrid.addColumn(common.Util.TR('Agent'),               'was_name',         100, Grid.String, true, false);
        self.crtGrid.addColumn('WAS ID',            'was_id',           100, Grid.String, false, true);
        self.crtGrid.addColumn('TXN ID',            'txn_id',           100, Grid.String, false, true);

        self.crtGrid.addColumn(common.Util.TR('IP'),                'client_ip',        100, Grid.String, false, true);
        self.crtGrid.addColumn(common.Util.TR('Transaction'),       'txn_name',         200, Grid.String, true, false);
        self.crtGrid.addColumn(common.Util.TR('Execute Count'),     'execute_count',    100, Grid. Number, true, false);
        self.crtGrid.addColumn(common.Util.TR('Response Time'),     'response_time',    120, Grid.String, true, false);

        self.crtGrid.addColumn(common.Util.TR('Response Time (AVG)'),'avg_response_time',100, Grid.Float, false, true);
        self.crtGrid.addColumn(common.Util.TR('Response Time (MAX)'),'max_response_time',100, Grid.Float, true, false);
        self.crtGrid.addColumn(common.Util.TR('Client Time (AVG)'), 'avg_client_time',  100, Grid.Float, false, true);
        self.crtGrid.addColumn(common.Util.TR('Client Time (MAX)'), 'max_client_time',  100, Grid.Float, true, false);
        self.crtGrid.addColumn(common.Util.TR('Agent Time (AVG)'),    'avg_was_time',     100, Grid.Float, false, true);
        self.crtGrid.addColumn(common.Util.TR('Agent Time (MAX)'),   'max_was_time',      100, Grid.Float, true, false);
        self.crtGrid.addColumn(common.Util.TR('DB Time (AVG)'),    'avg_db_time',       100, Grid.Float, false, true);
        self.crtGrid.addColumn(common.Util.TR('DB Time (MAX)'),    'max_db_time',       100, Grid.Float, true, false);

        self.crtGrid.endAddColumns();

        self.crtGrid.addRenderer('response_time', createCellChart) ;

        self.crtGrid.contextMenu.addItem({
            title: common.Util.TR('Transaction Summary'),
            fn: function() {
                var record = this.up().record;
                var txnHistory = common.OpenView.open('TxnHistory', {
                    fromTime: common.Util.getDate(record['TIME']),
                    toTime: common.Util.getDate(+new Date(record['TIME']) + 1200000 ),
                    transactionTF: common.Util.cutOffTxnExtName(record['txn_name']),
                    wasId : record['was_id']
                });
                setTimeout(function (){
                    txnHistory.executeSQL();
                }, 300);
            }
        }, 0);


        /**
        self.crtGrid.contextMenu.addItem({
            title: 'Transaction SQL',
            fn: function() {
                var record = this.up().record;
                var txnSQL = common.OpenView.open('TxnSQL', {
                    fromTime: common.Util.getDate(record['TIME']),
                    toTime: common.Util.getDate(+new Date(record['TIME']) + 600000 ),
                    transactionNameTF: common.Util.cutOffTxnExtName(record['txn_name']),
                    wasId : record['was_id']
                });
                setTimeout(function (){
                    txnSQL.executeSQL();
                }, 300);
            }
        }, 1);
        */

        function createCellChart(value, meta, record) {
//            console.log('record===>', record)

            if (record.data) {

                var clientTime=0, dbTime=0, wasTime=0, totalTime=0;

                if (self.mainTabPnl.getComponent(self.mainTabPnl.getActiveTab().itemId)
                    .getComponent('tBar').getComponent('secondRadioType')
                    .getCheckedValue() == 'max') {

                     clientTime = record.data['max_client_time'],
                     dbTime     = record.data['max_db_time'],
                     wasTime    = record.data['max_was_time'],
                     totalTime  = clientTime + dbTime + wasTime;
                } else {
                     clientTime = record.data['avg_client_time'],
                     dbTime     = record.data['avg_db_time'],
                     wasTime    = record.data['avg_was_time'],
                     totalTime  = clientTime + dbTime + wasTime;
                }

                clientTime = (clientTime / totalTime * 100).toFixed(3);
                dbTime     = (dbTime / totalTime * 100).toFixed(3);
                wasTime    = (wasTime / totalTime * 100).toFixed(3);

                /**
//                meta.tdAttr = 'data-qtip="' + Ext.Number.htmlEncode()
//                title="'+clientTime+'%'+'";
                 */


                var el = '<div style="position:relative;width:100%; height:13px">' +
                    '<div data-qtip="'+clientTime+'%'+'" style="float:left; background-color: #ff110f; background: linear-gradient(to bottom, #ff110f 0%, #f59e9e 50%,#ff110f 100%);height:100%;width:'+ clientTime+'%;"></div>' +
                    '<div data-qtip="'+dbTime+'%'+'" style="float:left; background-color: #d8a53f; background: linear-gradient(to bottom, #c78f24 0%, #dcc67b 50%,#c78f24 100%); height:100%;width:'+ dbTime+'%;"></div>' +
                    '<div data-qtip="'+wasTime+'%'+'" style="float:left; background-color: #155496; background: linear-gradient(to bottom, #155496 0%, #7bc1dc 50%,#155496 100%); height:100%;width:'+ wasTime +'%;"></div>' +
                    '</div>';

                return el;
            }

        }
    },



    executeSQL: function() {
        var self = this;
        var tmpId, grid;

        /*
         1. 현재 By Transaction 인지 IP 인지 Radio 버튼 구분( 그에맞는 dataset 밑 WSExec )
         2. Chart 그려줌 ( 얘는  신경쓸게 없어서 여기서 그냥 그려줌)
         */
        var chartDataset = {},
                txnDataset   = {},
                ipDataset    = {};

        self.loadingMask.show();

        self.mainChart.clearValues();

        // 재검색시 그려져있는 Grid 찾아서 클리어
        if ( self.mainTabPnl.getActiveTab() ) {
            tmpId = self.mainTabPnl.getActiveTab().itemId;
            grid = self.mainTabPnl.getComponent(tmpId)
                    .getComponent('gridPnl').getComponent('crtGrid');

            grid.clearRows();
        }

        self.mainTabPnl.setActiveTab(0);


        chartDataset.bind = [{
            name : "from_time",
            type : SQLBindType.STRING,
            value: self.datePicker.getFromDateTime()
        }, {
            name : "to_time",
            type : SQLBindType.STRING,
            value: self.datePicker.getToDateTime()
        }];

        chartDataset.replace_string = [{
            name : "was_id",
            value: Comm.wasIdArr.join()
        }];

        chartDataset.sql_file = self.sql.chart;
        WS.SQLExec(chartDataset, self.onChartData, self);


        // By Transaction 라디오 버튼
        if (self.firstRadioValue == 0) {

            self.txnRetreiveFlag = true;

            txnDataset.bind = [{
                name : "from_time",
                type : SQLBindType.STRING,
                value: self.datePicker.getFromDateTime()
            }, {
                name : "to_time",
                type : SQLBindType.STRING,
                value: self.datePicker.getToDateTime()
            }];

            txnDataset.replace_string = [{
                name : "was_id",
                value: Comm.wasIdArr.join()
            }, {
                name : "txn_name",
                value: self.txnNameTF.getValue()
            }];

            txnDataset.sql_file = self.sql.byTxn;
            WS.SQLExec(txnDataset, self.onData, self);

        }
        // IP 라디오 버튼
        else {

            self.ipRetreiveFlag = true;

            var tmpStr = self.ipTF.getValue();
            var tmpArray = [];
            var percent_start = '';
            var percent_end   = '';

            if ( tmpStr != '%') {
                if ((tmpStr[0] == '%') && (tmpStr[tmpStr.length-1] == '%')) {
                    tmpStr = tmpStr.substring(1, tmpStr.length-1);
                    percent_start = '%';
                    percent_end   = '%';

                } else if ( tmpStr[0] == '%' ) {
                    tmpStr = tmpStr.substring(1, tmpStr.length);
                    percent_start = '%';

                } else if ( tmpStr[tmpStr.length-1] == '%' ) {
                    tmpStr = tmpStr.substring(0, tmpStr.length-1);
                    percent_end = '%';

                } else {
                    percent_start = '%';
                    percent_end = '%';
                }

                tmpArray = tmpStr.split('.');
                tmpStr = '';
                for ( var ix = 0; ix < tmpArray.length; ix++ ) {
                    if(tmpArray[ix].length > 0)
                        tmpStr = tmpStr + Number(tmpArray[ix]).toString(16).toUpperCase();
                }

            }

            ipDataset.bind = [{
                name : "from_time",
                type : SQLBindType.STRING,
                value: self.datePicker.getFromDateTime()
            }, {
                name : "to_time",
                type : SQLBindType.STRING,
                value: self.datePicker.getToDateTime()
            }];

            ipDataset.replace_string = [{
                name : "was_id",
                value: Comm.wasIdArr.join()
            }, {
                name : "txn_name",
                value: self.txnNameTF.getValue()
            }, {
                // 이 부분은 나중에 3자리씩 끊어서 계산을 따로 해줘야 함.
                name : "ip",
                value: tmpStr
            }, {
                name : "percent_start",
                value: percent_start
            }, {
                name : "percent_end",
                value: percent_end
            }];

            ipDataset.sql_file = self.sql.byIp;
            WS.SQLExec(ipDataset, self.onData, self);
        }

    },


    _gridReDraw: function() {
        var self = this;
        var tmpId;

        var grid;
        var responseRatio;
        var tmpStore = [];
        var ix, dataRows, len;

        // Retrevie 버튼으로 라디오 버튼 조건을 체크 할 때 Grid를 다시 그리지 않게 하기위함.
        self.reDrawFlag = false;

        tmpId = self.mainTabPnl.getActiveTab().itemId;

        grid = self.mainTabPnl.getComponent(tmpId)
                .getComponent('gridPnl').getComponent('crtGrid');

        if (tmpId != 'allTab')
            responseRatio = self.mainTabPnl.getComponent(tmpId).getComponent('tBar')
                    .getComponent('responseRatio').getValue();

        grid.loadingMask.show();

        // by Transaction, IP 라디오버튼에 따라 IP 컬럼 Visible, hidden
        self.gridTxnIpChange();
        // 라디오버튼 MAX, AVG 에 따라 컬럼 변경 (setVisible)
        self.gridMaxAvgChange();


        switch (tmpId) {
            case 'allTab':
//==================================================================================
                // Condition Area Radio 버튼이 By Transaction 이면서
                // By Transaction 상태로 Retrieve 버튼을 누른적이 있을 때

                if ((self.firstRadioValue == 0) && (self.txnRetreiveFlag))
                    tmpStore = self.byTxnStore;

                // Condition Area Radio 버튼이 By IP 이면서 IP 상태로 Retrieve 버튼을 누른적 있을 때

                else if ((self.firstRadioValue == 1) && (self.ipRetreiveFlag))
                    tmpStore = self.byIpStore;

                for ( ix = 0, len = tmpStore.length; ix < len; ix++) {
                    dataRows = tmpStore[ix];
                    grid.addRow([
                        dataRows[0]   // Time
                        ,dataRows[1]   // was_name
                        ,dataRows[2]   // was_id
                        ,dataRows[3]   // txn_id
                        ,dataRows[5]   // client_ip
                        ,dataRows[4]   // txn_name
                        ,dataRows[14]  // execute_count
                        ,dataRows[15]  // response_time
                        ,dataRows[6]   // avg_response_time
                        ,dataRows[7]   // max_response_time
                        ,dataRows[8]   // avg_client_time
                        ,dataRows[9]   // max_client_time
                        ,dataRows[10]  // avg_was_time
                        ,dataRows[11]  // max_was_time
                        ,dataRows[12]  // avg_db_time
                        ,dataRows[13]  // max_db_time
                    ]);
                }
                break;

            case 'clientTab':
//==================================================================================

                if ((self.firstRadioValue == 0) && (self.txnRetreiveFlag))
                    tmpStore = self.byTxnStore;
                else if ((self.firstRadioValue == 1) && (self.ipRetreiveFlag))
                    tmpStore = self.byIpStore;

                /**
//                    responseRatio = self.mainTabPnl.getComponent(tmpId).getComponent('tBar')
//                        .getComponent('responseRatio').getValue();

//                    4.client
//                    if client / total * 100 > ratio
//                        avg_client_time
                //total 은 avg_response_time
                 **/

                for ( ix = 0, len = tmpStore.length; ix < len; ix++) {
                    // client / total * 100 > ratio
                    dataRows = tmpStore[ix];
                    if ((dataRows[8] / dataRows[6] * 100) >= responseRatio) {
                        grid.addRow([
                            dataRows[0]   // Time
                            ,dataRows[1]   // was_name
                            ,dataRows[2]   // was_id
                            ,dataRows[3]   // txn_id
                            ,dataRows[5]   // client_ip
                            ,dataRows[4]   // txn_name
                            ,dataRows[14]  // execute_count
                            ,dataRows[15]  // response_time
                            ,dataRows[6]   // avg_response_time
                            ,dataRows[7]   // max_response_time
                            ,dataRows[8]   // avg_client_time
                            ,dataRows[9]   // max_client_time
                            ,dataRows[10]  // avg_was_time
                            ,dataRows[11]  // max_was_time
                            ,dataRows[12]  // avg_db_time
                            ,dataRows[13]  // max_db_time
                        ]);
                    }
                }
                break;

            case 'wasTab':
//==================================================================================

//                    responseRatio = self.mainTabPnl.getComponent(tmpId).getComponent('tBar')
//                        .getComponent('responseRatio').getValue()


//                     2.was
//                     if avg_was_time / total* 100 > ratio then
//                     avg_was_time
                if ((self.firstRadioValue == 0) && (self.txnRetreiveFlag))
                    tmpStore = self.byTxnStore;
                else if ((self.firstRadioValue == 1) && (self.ipRetreiveFlag))
                    tmpStore = self.byIpStore;


                for ( ix = 0, len = tmpStore.length; ix < len; ix++) {

                    dataRows = tmpStore[ix];
                    if ((dataRows[10] / dataRows[6] * 100) > responseRatio) {
                        grid.addRow([
                            dataRows[0]    // Time
                            ,dataRows[1]   // was_name
                            ,dataRows[2]   // was_id
                            ,dataRows[3]   // txn_id
                            ,dataRows[5]   // client_ip
                            ,dataRows[4]   // txn_name
                            ,dataRows[14]  // execute_count
                            ,dataRows[15]  // response_time
                            ,dataRows[6]   // avg_response_time
                            ,dataRows[7]   // max_response_time
                            ,dataRows[8]   // avg_client_time
                            ,dataRows[9]   // max_client_time
                            ,dataRows[10]  // avg_was_time
                            ,dataRows[11]  // max_was_time
                            ,dataRows[12]  // avg_db_time
                            ,dataRows[13]  // max_db_time
                        ]);
                    }
                }
                break;

            case 'dbTab':
//==================================================================================
//                    responseRatio = self.mainTabPnl.getComponent(tmpId).getComponent('tBar')
//                        .getComponent('responseRatio').getValue()

//                    3.db
//                    if avg_db / total*100 > ratio
//                        avg_db_time

                if ((self.firstRadioValue == 0) && (self.txnRetreiveFlag))
                    tmpStore = self.byTxnStore;
                else if ((self.firstRadioValue == 1) && (self.ipRetreiveFlag))
                    tmpStore = self.byIpStore;

                for ( ix = 0, len = tmpStore.length; ix < len; ix++) {
                    dataRows = tmpStore[ix];
                    if ((dataRows[12] / dataRows[6] * 100) > responseRatio) {
                        grid.addRow([
                            dataRows[0]    // Time
                            ,dataRows[1]   // was_name
                            ,dataRows[2]   // was_id
                            ,dataRows[3]   // txn_id
                            ,dataRows[5]   // client_ip
                            ,dataRows[4]   // txn_name
                            ,dataRows[14]  // execute_count
                            ,dataRows[15]  // response_time
                            ,dataRows[6]   // avg_response_time
                            ,dataRows[7]   // max_response_time
                            ,dataRows[8]   // avg_client_time
                            ,dataRows[9]   // max_client_time
                            ,dataRows[10]  // avg_was_time
                            ,dataRows[11]  // max_was_time
                            ,dataRows[12]  // avg_db_time
                            ,dataRows[13]  // max_db_time
                        ]);
                    }
                }
                break;

            default : break;
        }

        grid.drawGrid();

        self.reDrawFlag = true;
        self.loadingMask.hide();
        grid.loadingMask.hide();
    },


    gridMaxAvgChange: function() {
        var self = this;

        if (!self.mainTabPnl.getActiveTab())
            return;

        var tmpId = self.mainTabPnl.getActiveTab().itemId;
        var grid  = self.mainTabPnl.getComponent(tmpId)
                .getComponent('gridPnl').getComponent('crtGrid');

        var dataColumns = grid.pnlExGrid.headerCt.gridDataColumns;
        /**
        // adata.rows[ix][0]  - Time               0
        // adata.rows[ix][1]  - was_name           1
        // adata.rows[ix][2]  - was_id             2    //
        // adata.rows[ix][3]  - txn_id             3    //
        // adata.rows[ix][5]  - client_ip          4    //
        // adata.rows[ix][4]  - txn_name           5
        // adata.rows[ix][14] - execute_count      6
        // adata.rows[ix][15] - response_time      7
        // adata.rows[ix][6]  - avg_response_time  8    //
        // adata.rows[ix][7]  - max_response_time  9
        // adata.rows[ix][8]  - avg_client_time    10    //
        // adata.rows[ix][9]  - max_client_time    11
        // adata.rows[ix][10] - avg_was_time       12    //
        // adata.rows[ix][11] - max_was_time       13
        // adata.rows[ix][12] - avg_db_time        14    //
        // adata.rows[ix][13] - max_db_time        15

        //max
         **/
        if (self.mainTabPnl.getComponent(tmpId)
                        .getComponent('tBar').getComponent('secondRadioType')
                        .getCheckedValue() == 'max' ) {

            dataColumns[9].setVisible(true);
            dataColumns[11].setVisible(true);
            dataColumns[13].setVisible(true);
            dataColumns[15].setVisible(true);

            dataColumns[8].setVisible(false);
            dataColumns[10].setVisible(false);
            dataColumns[12].setVisible(false);
            dataColumns[14].setVisible(false);

        } else {
            dataColumns[8].setVisible(true);
            dataColumns[10].setVisible(true);
            dataColumns[12].setVisible(true);
            dataColumns[14].setVisible(true);

            dataColumns[9].setVisible(false);
            dataColumns[11].setVisible(false);
            dataColumns[13].setVisible(false);
            dataColumns[15].setVisible(false);

            switch(tmpId) {
                case 'clientTab': grid.setOrderAct('avg_client_time', 'DESC');
                    break;
                case 'wasTab'   : grid.setOrderAct('avg_was_time', 'DESC');
                    break;
                case 'dbTab'    : grid.setOrderAct('avg_db_time', 'DESC');
                    break;
                default :
                    break;
            }
        }

    },

    gridTxnIpChange: function() {
        var self = this;

        if (!self.mainTabPnl.getActiveTab())
        // 선택된 Tab 없으면 return
            return;

        var tmpId = self.mainTabPnl.getActiveTab().itemId;
        var grid  = self.mainTabPnl.getComponent(tmpId)
                .getComponent('gridPnl').getComponent('crtGrid');
        var dataRows = grid.pnlExGrid.headerCt.gridDataColumns;

        grid.clearRows();

        if (self.firstRadioValue == 0 ) {
            dataRows[4].setVisible(false);
        } else {
            dataRows[4].setVisible(true);
        }


    },


    onChartData: function(aheader, adata) {
        var self = this;

        if(!aheader.success) {
            self.showMessage(common.Util.TR('ERROR'), aheader.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){

            });
            self.loadingMask.hide();

            return;
        }

        if (aheader.command == self.sql.chart) {
            /** 차트 데이터 들어옴 */
            /**
             self.mainChart.addValues({
             from: param.bind[0].value,
             to  : param.bind[1].value,
             //                interval: 600000,
             time: 0,
             data: adata.rows,
             series: {
             clientTime : 1,
             wasTime    : 2,
             dbTime     : 3

             }
             });
             */

            for (var ix = 0, len = adata.rows.length; ix < len; ix++) {
                var dataRows = adata.rows[ix];
                var tmpTime = Ext.util.Format.date(new Date(dataRows[0]), 'd H:i');

                self.mainChart.addValue(0, [tmpTime, dataRows[3]]); // db
                self.mainChart.addValue(1, [tmpTime, dataRows[2]]); // was
                self.mainChart.addValue(2, [tmpTime, dataRows[1]]); // client
            }

            self.mainChart.plotDraw();
        } else {
            console.debug('no callback Data ===>', adata);
        }
    },

    onData: function(aheader, adata) {
        var self = this;
        if(!aheader.success) {
            self.showMessage(common.Util.TR('ERROR'), aheader.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){

            });
            self.loadingMask.hide();
            return;
        }

        if (aheader.rows_affected > 0) {
            switch (aheader.command) {
                case self.sql.byTxn:
                    self.byTxnStore = adata.rows;
                    self._gridReDraw();

                    break;
                case self.sql.byIp:

                    self.byIpStore = adata.rows;
                    self._gridReDraw();
                    break;

                default : break;

            }
        } else {
            console.debug('no callback Data ===>', adata);
            self.loadingMask.hide();

        }
    }
});

