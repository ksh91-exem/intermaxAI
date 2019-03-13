Ext.define("view.ExceptionHistory", {
    extend: "Exem.FormOnCondition",
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql: {
        txn_List          : 'IMXPA_ExceptionHistory_TxnList.sql',
        log_list          : 'IMXPA_ExceptionHistory_TxnList_log.sql',
        exception_List    : 'IMXPA_ExceptionHistory_ExceptionList.sql',
        exception_Log     : 'IMXPA_ExceptionHistory_Log.sql',
        exception_Exclude : 'IMXPA_ExceptionHistory_Exclude.sql',
        indiChart         : 'IMXPA_ExceptionHistory_IndiChart.sql',
        totalChart        : 'IMXPA_ExceptionHistory_TotalChart.sql',
        trendChart        : 'IMXPA_ExceptionHistory_TrendChart.sql',
        pieChart          : 'IMXPA_ExceptionHistory_PieChart.sql',
        topIndiChart      : 'IMXPA_ExceptionHistory_TopIndiChart.sql',
        topTrendChart     : 'IMXPA_ExceptionHistory_TopTrendChart.sql',
        selectTxnDetail   : 'IMXPA_ExceptionHistory_SelectTxnDetail.sql'
    },
    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        }
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

    _wasValidCheck: function() {
        var self = this;

        //아직 생성되지않은 경우(점프) 리턴.
        if ( self.wasField == undefined ){
            return ;
        }

        var wasValue = self.wasField.getValue();
        var wasCombo = self.wasField.WASDBCombobox;

        if (wasValue == null) {
            wasCombo.select(wasCombo.store.getAt(0));
        }

        var setFocus = function(){
            wasCombo.focus();
        };

        if (wasCombo.getRawValue() != '(All)') {
            if (wasCombo.getRawValue().indexOf(',') == -1) {
                if (self.wasField.AllWasList.indexOf(wasValue+'') == -1) {
                    self.showMessage(common.Util.TR('Warning'), common.Util.TR('Can not find the Agent Name'), Ext.Msg.OK, Ext.MessageBox.ERROR, setFocus());
                    return false;
                }
            } else {
                var tmpArray = wasValue.split(',');
                for (var ix = 0, len = tmpArray.length; ix < len; ix++) {
                    if (self.wasField.AllWasList.indexOf(tmpArray[ix]) == -1) {
                        self.showMessage(common.Util.TR('Warning'), common.Util.TR('The Agent name is invalid'), Ext.Msg.OK, Ext.MessageBox.ERROR, setFocus());
                        return false;
                    }
                }
            }
        }

        return true;
    },


    checkValid: function() {
        var self = this;
        if (!self._wasValidCheck()) {
            return false;
        }

        if (self.exceptionName_TF.getValue().trim().length < 1)
            self.exceptionName_TF.setValue('%');

        return true;
    },

    _initChartFlag: function() {
        var self = this;
        self.exceptionCountFlag = false;
        self.exceptionRatioFlag = false;
        self.exceptionTrendFlag = false;
    },

    _chartClear: function() {
        var self = this;

        self.exceptionTxnListGrid.clearNodes();

        self.individualExceptionCount.clearValues(0);
        self.exceptionListGrid.clearRows();
        self.totalExceptionCount.clearValues(0);
        self.totalExceptionRatio.labelLayer.removeAll();
        self.totalExceptionRatio.removeAllSeries();
        self.totalExceptionRatio.clearValues();
        self.exceptionTrend.clearValues(0);
        self.individualExceptionCount.plotRedraw();
        self.totalExceptionCount.plotRedraw();
        self.totalExceptionRatio.plotRedraw();
        self.exceptionTrend.plotRedraw();
        self.individualTxnTF.setText('');
        self.individualExceptionTF.setText(null);
    },

    init: function() {
        var self = this;
        // retrieve 버튼을 누르지 않고 라디오 버튼을 눌렀을때의 갱신을 막는 변수.
        self.retrieveFlag = false;

        self.setWorkAreaLayout('fit');

        /**************************** Condition Area *****************************/

        var baseContainer = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'border'
        });

        // WAS list
        self.wasField = Ext.create('Exem.wasDBComboBox', {
            itemId          : 'wasCombo',
            width           : 350,
            comboLabelWidth : 60,
            comboWidth      : 230,
            multiSelect     : true,
            selectType      : common.Util.TR('Agent'),
            x               : 375,
            y               : 5
        });

        // radio 버튼을 넣어줄 FieldContainer
        var radio_exceptionType = Ext.create('Exem.FieldContainer', {
            x: 700,
            y: 5,
            layout      : 'hbox',
            width       : 350,
            itemId      : 'rdo_exception_type',
            defaultType : 'radiofield',
            defaults    : {flex : 1},
            items       : [{
                boxLabel  : common.Util.TR('By Exception'),
                name      : self.id + '_exception_Type',
                inputValue: 0,
                itemId    : 'byException',
                checked   : true,
                listeners : {
                    change : function (field, nv){
                        if (nv)
                            self.conditionArea.getComponent('exceptionName_TF').enable();
                        else if (self.retrieveFlag) {
                            self._initChartFlag();
                            self._drawTreeGrid();
                        }
                    }
                }
            }, {
                boxLabel  : common.Util.TR('By Transaction'),
                name      : self.id + '_exception_Type',
                inputValue: 1,
                itemId    : 'byTransaction',
                listeners : {
                    change : function (field, nv){
                        if (nv)
                            self.conditionArea.getComponent('exceptionName_TF').enable();
                        else if (self.retrieveFlag) {
                            self._initChartFlag();
                            self._drawTreeGrid();
                        }

                    }
                }
            }, {
                boxLabel  : common.Util.TR('By Top Exception'),
                name      : self.id + '_exception_Type',
                inputValue: 2,
                itemId    : 'byTopException',
                listeners : {
                    change : function (field, nv){
                        if (nv)
                            self.conditionArea.getComponent('exceptionName_TF').enable();
                        else if (self.retrieveFlag) {
                            self._initChartFlag();
                            self._drawTreeGrid();
                        }

                    }
                }
            }]
        });

        self.radio_exceptionType = radio_exceptionType;



        /**
        //self.chk_exception_name = Ext.create('Exem.FieldContainer', {
        //    defaultType : 'checkboxfield',
        //    cls         : 'exem-check',
        //    layout      : 'hbox',
        //    labelWidth  : 95,
        //    x           : 390,
        //    y           : 30,
        //    itemId      : 'chk_exception_name',
        //    items       :
        //        [{
        //            boxLabel : '',//common.Util.TR('Exception Name'),
        //            width: 94,
        //            name : 'exception'
        //            checked: true,
        //            listeners: {
        //                scope : this ,
        //                change: function(me, newValue, oldValue, eOpts){
        //                    var self = this ;
        //                    if ( me.getValue() ){
        //                        self.exceptionName_TF.setDisabled(false) ;
        //                    }else{
        //                        self.exceptionName_TF.setDisabled(true) ;
        //                    }
        //                }
        //            }
        //        }]
        //});
         */


        // Exception Name TextField
        self.exceptionName_TF = Ext.create('Exem.TextField', {
            fieldLabel       : '',
            itemId           : 'exceptionName_TF',
            labelAlign       : 'right',
            allowBlank       : false,
            value            : common.Util.TR('Exception Name'), //'%',
            maxLength        : 255,
            enforceMaxLength : true,
            labelWidth       : 95 ,
            width            : 240,
            x                : 395,
            y                : 30 ,
            listeners: {
                focus: function () {

                    if ( this.getValue() == '%' || this.getValue() == common.Util.TR('Exception Name') ){
                        this.setValue('%') ;
                    }

                },
                blur: function() {
                    if ( this.getValue() == '%' ){
                        this.setValue( common.Util.TR('Exception Name') ) ;
                    }
                }
            }
        });

        /**
        //self.chk_exception_log = Ext.create('Exem.FieldContainer', {
        //    defaultType : 'checkboxfield',
        //    cls         : 'exem-check',
        //    layout      : 'hbox',
        //    labelWidth  : 95,
        //    x           : 700,
        //    y           : 30,
        //    itemId      : 'chk_exception_log',
        //    items       :
        //        [{
        //            boxLabel: '', //common.Util.TR('Exception Log'),
        //            width: 98,
        //            name: 'exception',
        //            inputValue: 'log',
        //            listeners: {
        //                scope: this,
        //                change: function(me, newValue, oldValue, eOpts){
        //                    var self = this;
        //                    if ( me.getValue() ) {
        //                        self.exception_log.setDisabled(false) ;
        //                    }else{
        //                        self.exception_log.setDisabled(true) ;
        //                    }
        //                },
        //                afterrender: function(me, eOpts){
        //                    self.exception_log.setDisabled(true) ;
        //                }
        //            }
        //        }]
        //});
         **/



        //exception text
        self.exception_log = Ext.create('Exem.TextField', {
            fieldLabel      : '',
            itemId          : 'exception_log',
            labelAlign      : 'right',
            allowBlank      : false,
            value           : common.Util.TR('Exception Log'), //'%',
            maxLength       : 255,
            enforceMaxLength:true,
            labelWidth      : 95,
            width           : 250,
            x               : 700,
            y               : 30 ,
            listeners: {
                focus: function () {

                    if ( this.getValue() == '%' || this.getValue() == common.Util.TR('Exception Log') ){
                        this.setValue('%') ;
                    }


                },
                blur: function() {
                    if ( this.getValue() == '%' || this.getValue() == '' ){
                        this.setValue(common.Util.TR('Exception Log') ) ;
                    }
                }
            }
        });

        self.excludeForm = { WAS : null };
        self.exclusionEnvKey = 'pa_exclude_was_exception';

        self.exclude_btn = Ext.create('Ext.button.Button',{
            text      : common.Util.TR('Exclusions registration'),
            itemId    : 'exclude_btn',
            disabled  : true,
            x         : 980,
            y         : 30 ,
            listeners : {
                click: function() {
                    self.click_exclude(self, 'WAS');
                },

                beforerender: function() {
                    WS.SQLExec({
                        sql_file: self.sql.exception_Exclude,
                    }, self.onData, self);
                }
            }
        });


        // 상단 Area 설정 --- TF 는 TextField의 약자
        self.conditionArea.add(self.wasField);
        self.wasField.init();
        self.conditionArea.add(self.radio_exceptionType);
        self.conditionArea.add(/*self.chk_exception_name, self.chk_exception_log, */self.exceptionName_TF, self.exception_log, self.exclude_btn);
        /*************************************************************************/

        /**************************** Work Area **********************************/

        //Main 화면
        var mainLeftPnl = Ext.create('Exem.Panel', {
            layout : 'border',
            itemId : 'mainLeftPnl',
            width  : '50%',
            split  : true,
            minWidth: 600,
            region : 'west' ,
            style  : 'borderRadius : 6px;'
        });

        var mainRightPnl = Ext.create('Exem.Panel', {
            layout : 'fit',
            itemId : 'mainRightPnl',
            title  : common.Util.TR('Exception List'),
            minWidth: 400,
            region : 'center',
            style  : 'borderRadius : 6px;'
        });

        //left 화면에서 상단에는 그리드, 하단에는 차트틀이 들어갈 탭 패널.

        //먼저, 상단꺼 그리드영역
        var leftGridPnl = Ext.create('Exem.Panel', {
            layout : 'fit',
            title  : common.Util.TR('Exception Transaction List'),
            itemId : 'leftGridPnl',
            height : '70%',
            region : 'north',
            minHeight : 250,
            split  : true
        });

        /**
         //하단꺼 탭 패널 영역
         var leftChartBaseCon = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'fit'
        });
         **/

        var leftChartTabPnl = Ext.create('Exem.TabPanel', {
            layout : 'fit',
            itemId : 'leftChartTabPnl',
            minHeight: 150,
            region : 'center',
            listeners : {
                tabchange : function (tabPanel, newCard){
                    // 리트리브 누른 다음에만.
                    if (self.retrieveFlag && newCard) {
                        self.changeTabDrawChart(newCard.itemId);
                    }
                }
            }
        }) ;

        self.totalExceptionCount = Ext.create('Exem.chart.CanvasChartLayer', {
            layout    : 'fit',
            title     : common.Util.TR('Total Exception Count'),
            itemId    : 'totalExceptionCount',
            interval  : PlotChart.time.exHour,
            showTooltip: true,
            toolTipFormat: '%x [value:%y]',
            toolTipTimeFormat: '%d %H:%M'
        });
        self.totalExceptionCount.addSeries({
            id    : 'totalExceptionCount',
            label : common.Util.TR('Total Excepction Count'),
            type  : PlotChart.type.exBar
        });

        self.totalExceptionRatio = Ext.create('Exem.chart.CanvasChartLayer', {
            layout    : 'fit',
            title     : common.Util.TR('Total Exception Ratio'),
            itemId    : 'totalExceptionRatio',
            legendTextalign : 'east',
            showLegend :true,
            showTooltip:true,
            showHistoryInfo : false,
//            showTitle : true,
            legendNameWidth: 110,
            showLegendValueArea : true,
            toolTipFormat   : '[%s] %y'

        });
        // Ratio 차트의 경우 onChartData CB 함수에서 동적으로 시리즈를 추가함.

        self.individualArea = Ext.create('Exem.Panel', {
            layout    : 'vbox',
            title     : common.Util.TR('Individual Exception Count'),
            itemId    : 'individualExceptionCount'
        });
        self.individualTxnTF = Ext.create('Ext.form.Label', {
            margin   : '10, 5, 5, 10',
            width    : '100%',
            flex     : 0.5
        });
        self.individualExceptionTF = Ext.create('Ext.form.Label', {
            margin   : '0, 0, 0, 10',
            width    : '100%',
            flex     : 0.5
        });

        self.individualExceptionCount = Ext.create('Exem.chart.CanvasChartLayer', {
            flex      : 4,
            itemId    : 'individualExceptionCount',
            interval  : PlotChart.time.exMin,
            showTooltip : true,
            toolTipFormat: '%x [value:%y]',
            toolTipTimeFormat: '%d %H:%M'

        });
        self.individualExceptionCount.addSeries({
            id    : 'individualExceptionCount',
            label : common.Util.TR('Individual Exception Count'),
            type  : PlotChart.type.exBar
        });

        self.individualArea.add(self.individualTxnTF);
        self.individualArea.add(self.individualExceptionTF);
        self.individualArea.add(self.individualExceptionCount);

        self.exceptionTrend = Ext.create('Exem.chart.CanvasChartLayer', {
            layout    : 'fit',
            title     : common.Util.TR('Exception Trend'),
            itemId    : 'exceptionTrend',
            showTooltip   : true,
            interval  : PlotChart.time.exMin,
            toolTipFormat: '%x [value:%y]',
            toolTipTimeFormat: '%d %H:%M',
            xaxisCurrentToTime : true

        });
        self.exceptionTrend.addSeries({
            id        : 'exception_trend',
            label     : common.Util.TR('Exception Trend'),
            type      :  PlotChart.type.exLine,
            point     : true
        });

        self.exceptionTxnListGrid = Ext.create('Exem.BaseGrid', {
            gridType: Grid.exTree,
            gridName: 'pa_exception_txn_gridName',
            itemclick: function(dv, record) {
                if (!record.firstChild) {
                    self.selectRowTreeGrid(record.data);
                }
            }
        });

        self.exceptionTxnListGrid.beginAddColumns();
        self.exceptionTxnListGrid.addColumn(common.Util.CTR('Transaction'), 'TRANSACTION', 400, Grid.String, true, true, 'treecolumn');
        self.exceptionTxnListGrid.addColumn(common.Util.CTR('Exception'),   'EXCEPTION',   400, Grid.String, true, false, 'treecolumn');
        self.exceptionTxnListGrid.addColumn(common.Util.CTR('Count'),       'COUNT',       140, Grid.Number, true, false);
        self.exceptionTxnListGrid.addColumn('Txn ID',                       'txn_id',      100, Grid.String, false, true);
        self.exceptionTxnListGrid.endAddColumns();
        self.exceptionTxnListGrid.contextMenu.down('#showHideMenuItem').setVisible(false);

        //self.exceptionTxnListGrid.loadLayout(self.exceptionTxnListGrid.gridName);



        self.exceptionListGrid = Ext.create('Exem.BaseGrid', {
            localType        : 'm-d H:i:s',
            defaultPageSize  : 41,
            defaultbufferSize: 41,
            gridName         :'pa_exception_gridName'

        });
        self.exceptionListGrid.beginAddColumns();
        self.exceptionListGrid.addColumn(common.Util.CTR('Time'),          'time',         140, Grid.DateTime, true, false);
        self.exceptionListGrid.addColumn(common.Util.CTR('Agent'),         'was_name',     100, Grid.String, true, false);
        self.exceptionListGrid.addColumn(common.Util.CTR('Class Method'),  'class_method', 180, Grid.String, true, false);
        self.exceptionListGrid.addColumn(common.Util.CTR('Exception'),     'exception',    180, Grid.String, true, false);
        self.exceptionListGrid.addColumn(common.Util.CTR('Exception Log'), 'log_id',       180, Grid.String, false, true);
        self.exceptionListGrid.addColumn('tid',                            'tid',          180, Grid.String, false, true);
        self.exceptionListGrid.endAddColumns();

        self.exceptionListGrid.loadLayout(self.exceptionListGrid.gridName);

        self.exceptionListGrid.addEventListener(
            'celldblclick', function(listGrid, td, cellIndex, record) {
                var dataIndex = listGrid.headerCt.gridDataColumns[cellIndex].dataIndex;
                if (dataIndex == 'exception') {
                    var logId = record.data['log_id'];
                    var fullText = Ext.create('Exem.FullLogTextWindow');
                    fullText.getFullLogText(logId);
                    fullText.show();
                } else {
                    selectTxnDetail(record.raw);
                }
            });

        self.exceptionListGrid.contextMenu.addItem({
            title : common.Util.TR('Full Text Log'),
            itemId : 'fullLogText',
            target : self,
            fn: function() {
                var record = this.up().record;
                var logId = record['log_id'];
                var fullText = Ext.create('Exem.FullLogTextWindow');
                fullText.getFullLogText(logId);
                fullText.show();
            }
        }, 0);


        self.exceptionListGrid.contextMenu.addItem({
            title: common.Util.TR('Transaction Detail'),
            fn: function() {
                selectTxnDetail(this.up().record);
            }
        }, 0);

        if (this.autoRetrieveRange) {
            this.setRetrieveRange();
        }

        function selectTxnDetail(record) {

            WS2.SQLExec({
                sql_file: self.sql.selectTxnDetail,
                bind: [{
                    name: 'alarm_time',
                    type: SQLBindType.STRING,
                    value: record.time
                },{
                    name: 'tid',
                    type: SQLBindType.LONG,
                    value: record.tid
                }]
            }, self.openTxnDetail, self);
        }


        leftChartTabPnl.add(self.totalExceptionCount
            ,self.totalExceptionRatio
            ,self.individualArea, self.exceptionTrend
        );

        self.leftChartTabPnl = leftChartTabPnl;

        leftGridPnl.add(self.exceptionTxnListGrid);
        mainRightPnl.add(self.exceptionListGrid);

        mainLeftPnl.add(leftGridPnl);
        mainLeftPnl.add(leftChartTabPnl);

        baseContainer.add(mainLeftPnl, mainRightPnl);

        self.workArea.add(baseContainer);

    },

    openTxnDetail: function(header, data) {

        if(data.rows.length > 0) {
            var adata = data.rows[0];

            var txnView = Ext.create('view.TransactionDetailView',{
                startTime  : adata[1],
                endTime    : adata[0],
                wasId: adata[2],
                tid: adata[3],
                elapseTime : adata[4],
                socket: WS
            });

            var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
            mainTab.add(txnView);
            mainTab.setActiveTab(mainTab.items.length - 1);
            txnView.init();

            txnView = null ;
            mainTab = null ;

        } else {
            console.info('callback', 'no data');
        }
    },



    /**
     * 실시간 화면에서 알람 선택 시 해당 알람 정보를 조회조건에 설정
     */
    setRetrieveRange: function() {
        var retrieveRange = this.autoRetrieveRange;

        // Set WAS ComboBox
        if (retrieveRange.wasName) {
            if ( retrieveRange.wasName == 'All' ){
                this.wasField.selectByIndex(0);
            } else {
                this.wasField.selectByValues(retrieveRange.wasName);
            }
        }

        // Set Exception Name
        var alertLogName = retrieveRange.alertName ;
        if (!alertLogName){
            alertLogName = '%';
        }
        this.exceptionName_TF.setValue(alertLogName) ;

        // Set Search Date
        this.datePicker.mainFromField.setValue(
            this.datePicker.dataFormatting(retrieveRange.fromTime, this.datePicker.DisplayTime)
        );
        this.datePicker.mainToField.setValue(
            this.datePicker.dataFormatting(retrieveRange.toTime, this.datePicker.DisplayTime)
        );

    },


    executeSQL: function() {
        var self = this;
        var txnListDataset = {};
        var name_value, log_value;
        var ix, ixLen;


        name_value = self.exceptionName_TF.getValue() ;
        log_value = self.exception_log.getValue() ;

        self.exception_type_exclude = [];

        if( Comm.web_env_info[self.exclusionEnvKey] && Comm.web_env_info[self.exclusionEnvKey].length > 0 ) {
            for ( ix=0, ixLen=Comm.web_env_info[self.exclusionEnvKey].length; ix<ixLen; ix++ ) {
                self.exception_type_exclude.push('\'' + JSON.parse(Comm.web_env_info[self.exclusionEnvKey][ix])[0] + '\'');
            }
        } else {
            self.exception_type_exclude.push('\'\'');
        }

        if ( name_value == common.Util.TR('Exception Name') || log_value == '' ) {
            name_value = '%' ;
        }

        if ( log_value == common.Util.TR('Exception Log') ) {
            log_value = '%' ;
        }

        if (self.leftChartTabPnl.isLoading) {
            return;
        }

        self.retrieveFlag = true;

        self.loadingMask.showMask();
        self._initChartFlag();
        self._chartClear();


        txnListDataset.bind = [{
            name  : "from_time",
            value : Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name  : "to_time",
            value : Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }];

        txnListDataset.replace_string = [{
            name  : "was_id",
            value : self.wasField.getValue()
        }, {
            name  : 'exception_type',
            value : '\''+name_value+'\''
        }, {
            name  : 'exception_type_exclude',
            value : self.exception_type_exclude.join()
        }, {
            name  : 'log_text',
            value : '\''+log_value+'\''
        }, {
            name  : "txn_id",
            value : '%'
        }];

        txnListDataset.sql_file = self.sql.txn_List ;
        WS.SQLExec(txnListDataset, self.onData, self) ;
    },

    /*

     Tree Grid 정리
     1. 데이터가 들어오는 타입(adata.rows)
     adata.rows[ix][0] = TRANSACTION
     adata.rows[ix][1] = EXCEPTION
     adata.rows[ix][2] = COUNT
     adata.rows[ix][3] = txn_id

     2. 사용할 수 있는 function 들.
     가. testGrid.addNode (null, adata.rows[ix][0] ...)
     나. testGrid.findNode(DB 컬럼명, 데이터) --> 반환은 찾으면 Node. 없으면 Null

     */


    selectRowTreeGrid: function(adata) {
        var self = this;

        if (self.leftChartTabPnl.isLoading) {
            return;
        }

        var txn_id = adata['txn_id'];
        var exception_type = adata['TRANSACTION'];
        var log_value = self.exception_log.getValue() ;

        if ( log_value == common.Util.TR('Exception Log') ) {
            log_value = '%' ;
        }

        var exceptionListDataset = {};
        var individualDataset = {};

        if (!self.isLoading)
            self.leftChartTabPnl.loadingMask.showMask();

        self.leftChartTabPnl.setActiveTab(2);

        // individual 차트만 새로그리기 때문에 클리어 해줌
        self.individualExceptionCount.clearValues(0);
        self.individualExceptionCount.plotRedraw();

        self.individualTxnTF.setText(common.Util.TR('Transaction Name') + ' : ' + adata['EXCEPTION']);
        self.individualExceptionTF.setText(common.Util.TR('Exception Name') +' : ' + adata['TRANSACTION']);


        exceptionListDataset.bind = [{
            name  : "from_time",
            value : Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name  : "to_time",
            value : Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name  : "txn_id",
            value : txn_id,
            type : SQLBindType.STRING

        }];
        exceptionListDataset.replace_string = [{
            name  : "was_id",
            value : self.wasField.getValue()
        }, {
            name  : "exception_type",
            value : '\''+exception_type+'\''
        }, {
            name  : 'exception_type_exclude',
            value : self.exception_type_exclude.join()
        }, {
            name  : "log_text",
            value : '\''+log_value+'\''
        }];

        exceptionListDataset.sql_file = self.sql.exception_List;
        WS.SQLExec(exceptionListDataset, self.onData, self);

        individualDataset.bind = [{
            name  : "from_time",
            value : Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name  : "to_time",
            value : Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        },  {
            name  : "txn_id",
            value : txn_id,
            type : SQLBindType.STRING
        }];
        individualDataset.replace_string = [{
            name  : "was_id",
            value : self.wasField.getValue()
        }, {
            name  : "exception_type",
            value : '\''+exception_type+'\''
        }, {
            name  : 'exception_type_exclude',
            value : self.exception_type_exclude.join()
        }, {
            name  : "log_text",
            value : '\''+log_value+'\''
        }];

        if (self.radio_exceptionType.getCheckedValue() == 2) {
            individualDataset.sql_file = self.sql.topIndiChart;
            WS.SQLExec(individualDataset, self.onChartData, self);

        } else {

            individualDataset.sql_file = self.sql.indiChart;
            WS.SQLExec(individualDataset, self.onChartData, self);
        }

    },

    _drawTreeGrid: function() {
        var self = this;
        var ix, ixLen;
        var dataRows;

        // Radio버튼 체인지에 따라 다시 그려야해서 전역객체에 저장했음
        var adata = self.data;
        var treeGrid = self.exceptionTxnListGrid;
        var tmp, zeroColumn, firstColumn;

        if(!adata || !adata.rows.length){
            return;
        }

        self.exceptionTxnListGrid.clearNodes();

        // 이렇게 직접 타고가는 호출은 최대한 줄이는게 좋다.
        zeroColumn  = treeGrid.pnlExTree.headerCt.gridDataColumns[0];
        firstColumn = treeGrid.pnlExTree.headerCt.gridDataColumns[1];

        treeGrid.beginTreeUpdate();

        if (self.radio_exceptionType.getCheckedValue() == 1) {

            // transaction visible, exception hide
            zeroColumn.setVisible(true);
            firstColumn.setVisible(false);

            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                dataRows = adata.rows[ix];
                /*
                 dataRows (adata.rows[ix] 데이터 Field 구조)
                 dataRows[0] --> TRANSACTION
                 dataRows[1] --> EXCEPTION
                 dataRows[2] --> COUNT
                 dataRows[3] --> txn_id
                 */

                if ((treeGrid.findNode('TRANSACTION', dataRows[0])) == null) {
                    tmp =
                        treeGrid.addNode(null,[dataRows[0], dataRows[1], '', dataRows[3]]);
                    treeGrid.addNode(tmp, [dataRows[1], dataRows[0], dataRows[2], dataRows[3]]);

                } else {
                    treeGrid.addNode(treeGrid.findNode('TRANSACTION', dataRows[0]),
                        [dataRows[1], dataRows[0], dataRows[2], dataRows[3]]);
                }
            }
        } else {

            zeroColumn.setVisible(false);
            firstColumn.setVisible(true);

            for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                dataRows = adata.rows[ix];

                /*
                 dataRows (adata.rows[ix] 데이터 Field 구조)
                 dataRows[0] --> TRANSACTION
                 dataRows[1] --> EXCEPTION
                 dataRows[2] --> COUNT
                 dataRows[3] --> txn_id
                 */

                if ((treeGrid.findNode('EXCEPTION', dataRows[1])) == null) {
                    tmp =
                        treeGrid.addNode(null,[dataRows[0], dataRows[1], '', dataRows[3]]);
                    treeGrid.addNode(tmp, [dataRows[1], dataRows[0], dataRows[2], dataRows[3]]);
                } else {
                    treeGrid.addNode(treeGrid.findNode('EXCEPTION', dataRows[1]),
                        [dataRows[1], dataRows[0], dataRows[2], dataRows[3]]);
                }
            }
        }

        treeGrid.drawTree();
        treeGrid.endTreeUpdate();

        self._gridClick(self.exceptionTxnListGrid.pnlExTree, 1);

        // 루트노드 자식 자동 클릭 (다음 데이터를 보여주기 위한 이벤트)
    },

    _drawExceptionGrid: function(adata) {
        var self = this;
        var ix, ixLen;
        var dataRows;

        self.exceptionListGrid.clearRows();

        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            dataRows = adata.rows[ix];

            self.exceptionListGrid.addRow([
                  dataRows[0]                    // Time
                , dataRows[1]                    // WAS
                , dataRows[5]+'.'+dataRows[6]    // Class-Method
                , dataRows[10]                   // Exception
                , dataRows[11]                   // Exception-id
                , dataRows[3]                    // tid
            ]);
        }
        self.exceptionListGrid.drawGrid();
    },

    _drawChart: function(aheader, adata, target) {
        var self = this;

        var series = {};
        var data_idx = 1;
        var param = aheader.parameters;

        if(self.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(aheader, adata)){
            self.leftChartTabPnl.loadingMask.hide();
            self.loadingMask.hide();

            console.warn('ExceptionHistory-_drawChart');
            console.warn(aheader);
            console.warn(adata);
            return;
        }

        target.clearValues();
        target.plotRedraw();

        if(adata.rows.length > 0){
            for ( var ix = 0 ; ix < target.serieseList.length; ix++ ){
                series[ix] = data_idx++;
            }

            target.addValues({
                from: param.bind[0].value,
                to  : param.bind[1].value,
                time: 0,
                data: adata.rows,
                series: series
            });

            target.plotDraw();
        }

        self.leftChartTabPnl.loadingMask.hide();
        self.loadingMask.hide();

        ix = null ;
        series = null ;
        data_idx = null ;
        param = null ;
    },

    _gridClick: function (grid, idx) {
        grid.getView().getSelectionModel().select(idx);
        grid.fireEvent('itemclick', grid, grid.getSelectionModel().getLastSelected());
    },

    /**
     _rowCollapse: function(tree, dv, record) {
        var pNodeId, rootNode;
        rootNode = record.parentNode.parentNode;
        pNodeId = record.parentNode.internalId;

        for (var ix = 0; ix < rootNode.childNodes.length; ix++) {
            if (rootNode.childNodes[ix].internalId != pNodeId) {
                rootNode.childNodes[ix].collapse();
            }
        }
    },
     **/

    _fullTextExceptionLog: function(logText) {
        this.logFullText = Ext.create('Exem.FullLogTextWindow');
        this.logFullText.setFullText(logText);
        this.logFullText.show();
    },

    _setExceptionExclude: function(data) {
        var ix, ixLen,
            rowData, exception;

        for(ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            rowData = data.rows[ix];
            exception = rowData[0];

            if(!this.exceptionExcludeData) {
                this.exceptionExcludeData = {
                    0 : [],
                };
            }

            this.exceptionExcludeData[0].push({ name: exception, value: exception });
            this.exclude_btn.setDisabled(false);
        }
    },

    changeTabDrawChart: function(activeTab) {
        var self = this;
        var restChartDataset = {};

        if (activeTab == 'individualExceptionCount') {
            return;
        }

        var log_value = self.exception_log.getValue() ;

        if ( log_value == common.Util.TR('Exception Log') ) {
            log_value = '%' ;
        }

        restChartDataset.bind = [{
            name  : "from_time",
            value : Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }, {
            name  : "to_time",
            value : Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type : SQLBindType.STRING
        }];
        restChartDataset.replace_string = [{
            name  : "was_id",
            value : self.wasField.getValue()
        }, {
            name  : "log_text",
            value : '\''+log_value+'\''
        }, {
            name  : "exception_type_exclude",
            value : self.exception_type_exclude.join()
        }];

        switch (activeTab) {
            case 'totalExceptionCount':
                if (!self.exceptionCountFlag) {
                    self.leftChartTabPnl.loadingMask.showMask();
                    self.totalExceptionCount.clearValues(0);
                    self.totalExceptionCount.plotRedraw();

                    restChartDataset.sql_file = self.sql.totalChart;
                    WS.SQLExec(restChartDataset, self.onChartData, self);

                    self.exceptionCountFlag = true;
                }
                break;

            case 'totalExceptionRatio':
                if (!self.exceptionRatioFlag) {
                    self.leftChartTabPnl.loadingMask.showMask();
                    self.totalExceptionRatio.clearValues();
                    self.totalExceptionRatio.labelLayer.removeAll();
                    self.totalExceptionRatio.removeAllSeries();
                    self.totalExceptionRatio.plotRedraw();

                    restChartDataset.sql_file = self.sql.pieChart;
                    WS.SQLExec(restChartDataset, self.onChartData, self);

                    self.exceptionRatioFlag = true;
                }
                break;

            case 'exceptionTrend':

                if (!self.exceptionTrendFlag) {
                    self.leftChartTabPnl.loadingMask.showMask();

                    if (self.radio_exceptionType.getCheckedValue() == 2) {
                        // 체크박스가 top exception 이면, restChartDataset 을 이용해서
                        restChartDataset.sql_file = self.sql.topTrendChart;
                        WS.SQLExec(restChartDataset, self.onChartData, self);
                    } else {
                        restChartDataset.sql_file = self.sql.trendChart;
                        WS.SQLExec(restChartDataset, self.onChartData, self);
                    }

                    self.exceptionTrendFlag = true;
                }



                break;

            default : break;
        }
    },

    onData: function(aheader, adata) {
        var self = this;

        if(self.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(aheader, adata)){
            self.showMessage(common.Util.TR('ERROR'), aheader.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});
            self.loadingMask.hide();
            self.leftChartTabPnl.loadingMask.hide();

            console.warn('ExceptionHistory-onData');
            console.warn(aheader);
            console.warn(adata);
            return;
        }

        if (adata.rows.length > 0) {
            switch (aheader.command) {
                case self.sql.txn_List :
                case self.sql.log_list :
                    // Radio 버튼에 따라 동적으로 데이터를 그려야 함.
                    self.data = adata;
                    self._drawTreeGrid();
                    break;

                case self.sql.exception_List :
                    self._drawExceptionGrid(adata);
                    break;

                case self.sql.exception_Log :
                    self._fullTextExceptionLog(adata.rows[0][0]);
                    break;

                case self.sql.exception_Log :
                    self._fullTextExceptionLog(adata.rows[0][0]);
                    break;

                case self.sql.exception_Exclude :
                    self._setExceptionExclude(adata);
                    break;

                default: break;
            }
        } else {
            console.info('callback', 'no data');
            self.loadingMask.hide();
        }

    },

    onChartData: function(aheader, adata) {
        var self = this;
        var ix, ixLen;
        var dataRows;

        if(self.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(aheader, adata)){
            self.leftChartTabPnl.loadingMask.hide();

            console.warn('ExceptionHistory-onChartData');
            console.warn(aheader);
            console.warn(adata);
            return;
        }

        if(adata.rows.length > 0){
            switch(aheader.command){
                // chart mode 확정되면 뒤에 포맷스트링 지워야함
                case self.sql.indiChart :
                case self.sql.topIndiChart :
                    self._drawChart(aheader, adata, self.individualExceptionCount);
                    break;
                case self.sql.totalChart :
                    self._drawChart(aheader, adata, self.totalExceptionCount);
                    break;
                case self.sql.trendChart :
                case self.sql.topTrendChart :
                    self._drawChart(aheader, adata, self.exceptionTrend);
                    break;
                case self.sql.pieChart :
                    // 결과 값 만큼 동적으로 pieChart 시리즈 추가
                    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                        dataRows = adata.rows[ix];
                        self.totalExceptionRatio.addSeries({
                            label : dataRows[0],
                            id : dataRows[0],
                            type :PlotChart.type.exPie
                        });
                    }

                    // 추가후 Draw
                    for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                        self.totalExceptionRatio.setData(ix, adata.rows[ix][1]);
                    }
                    self.totalExceptionRatio.plotDraw();

                    self.leftChartTabPnl.loadingMask.hide();
                    break;
                default: break;
            }
        }
        else {
            self.leftChartTabPnl.loadingMask.hide();
        }
    },

    click_exclude: function(target, wasMonitorType){
        if( !this.excludeForm[wasMonitorType] ) {
            this.excludeForm[wasMonitorType] = Ext.create('view.ExceptionHistoryExclude', {
                monitorType : wasMonitorType
            });

            this.excludeForm[wasMonitorType].init();
            this.excludeForm[wasMonitorType].setExclusionCbxData(this.exceptionExcludeData);
        }

        this.excludeForm[wasMonitorType].target = target ;
        this.excludeForm[wasMonitorType].setExclusionCbxData(this.exceptionExcludeData);
        this.excludeForm[wasMonitorType].loadExclusionListData() ;
        this.excludeForm[wasMonitorType].show();
    }

});
