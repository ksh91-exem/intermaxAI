Ext.define("view.ClientHistory", {
    extend: "Exem.FormOnCondition",
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql: {
        chart : 'IMXPA_ClientHistory.sql',
        grid  : 'IMXPA_ClientHistoryGrid.sql',
        webServerChart : 'IMXPA_WebClientHistory.sql',
        webServerGrid  : 'IMXPA_WebClientHistoryGrid.sql'
    },

    /**
    addDataArea: function(itemId) {
        var self = this;
        self.workArea.add(Ext.create("Ext.container.Container", {
            layout: 'fit',
            itemId: itemId,
            flex: 1,
            width: '100%',
            style: {
                background: '#eeeeee',
                padding: "2px 2px"
            }
        }));
    },
     **/

    showMessage: function(title, message, buttonType, icon, fn) {
        Ext.Msg.show({
            title  : title,
            msg    : message,
            buttons: buttonType,
            icon   : icon,
            fn     : fn
        });
    },

    /**
    _wasValidCheck: function() {
        var self = this;
        var wasValue = self.wasCombo.getValue();
        var wasCombo = self.wasCombo.WASDBCombobox;

        if (wasValue == null) {
            wasCombo.select(wasCombo.store.getAt(0));
        }

        if (wasCombo.getRawValue() != '(All)' && self.wasCombo.AllWasList.indexOf(wasValue+'') == -1) {
                self.showMessage(common.Util.TR('ERROR'), common.Util.TR('Can not find the Agent Name'),
                        Ext.Msg.OK, Ext.MessageBox.ERROR, function(){
                            wasCombo.focus();
                        });
                return false;
        }

        return true;
    },

     checkValid: function() {
        var self = this;

        return self._wasValidCheck();
    },
     **/

    checkValid: function() {
        return this.wasCombo.checkValid();
    },

    init: function(){
        var self = this;

        self.setWorkAreaLayout('border');
        /**

//        this.datePicker.mainFromField.setValue(Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d H') + ':00:00');
//        this.datePicker.mainToField.setValue(Ext.util.Format.date(this.datePicker.getToDateTime(), 'Y-m-d H') + ':00:00');

//        self.datePicker.setLocalY(19);
         **/

        self.wasCombo = Ext.create('Exem.wasDBComboBox', {
            itemId          : 'wasCombo',
            width           : 350,
            comboWidth      : 260,
            comboLabelWidth : 60,
            fieldLabel      : this.monitorType == 'WAS' ? common.Util.TR('Agent') : common.Util.TR('WebServer'),
            x               : 380,
            y               : 5
        });

        self.conditionArea.add(self.wasCombo);
        self.wasCombo.init();

        var TopArea = Ext.create('Exem.Panel', {
            itemId : 'top',
            region : 'north',
            layout : 'fit',
            split  : true,
            height : '50%',
            minHeight : 250,
            style    : 'borderRadius : 6px;'
        });

        var btmArea = Ext.create('Exem.Panel', {
            itemId : 'bottom',
            region : 'center',
            height : '50%',
            layout : 'fit',
//            split  : true,
            minHeight : 250,
            bodyStyle:{
                background  : '#ffffff'
            }
        });

        self.workArea.add(TopArea);
        self.workArea.add(btmArea);

        // 차트 영역 생성
        self.clientChart = Ext.create('Exem.chart.CanvasChartLayer', {
            toolTipFormat  : '%x [value:%y]',
            showTooltip    : true,
            showMaxValue   : true,
            interval       : PlotChart.time.exTenMin,
            plotclick: function(event, pos, item){
                if (self.gridArea.isLoading)
                    return;
                if (item) {
                    var from_time;
                    var to_time;
                    self.clientChart.highLight(0, item.dataIndex);

                    from_time = common.Util.getDate(item.datapoint[0]);
                    to_time = common.Util.getDate(item.datapoint[0] + 600000);

                    self.gridArea.loadingMask.showMask();

                    self.draw_grid_data(from_time, to_time);


/**
//                    dataSet.sql_file = self.sql.grid;
//                    dataSet.bind = [{
//                        name: 'from_time',
//                        value: common.Util.getDate(item.datapoint[0]),
//                        type: 'string'
//                    },{
//                        name: 'to_time',
//                        value: to_time,
//                        type: 'string'
//                    }];

//                    dataSet.replace_string = [{
//                        name: 'was_id',
//                        value: self.wasCombo.getValue()
//                    }];
//                    WS.SQLExec(dataSet, self.onData, self.gridArea);
//                    WS.SQLExec(dataSet, self.gridArea.onData, self.gridArea);
 **/
                }
            }
            /**
            plotdblclick: function() {
                return;
            }
             **/

        });

        // 차트 series 생성
        self.clientChart.addSeries({
            // series 고유 아이디 설정,
            id: 'client',
            // series 레이블 설정,
            label: common.Util.TR('Client'),
            // series type 설정 (line, stack_line, bar, stack_bar, pie, scatter....etc... default : line),
            type: PlotChart.type.exBar
            // color: '#000'                            // series color 설정
        });

        TopArea.add(self.clientChart);

        // 그리드 영역 생성
        self.gridArea = Ext.create('Exem.BaseGrid', {
            gridName : 'pa_client_history_gridName'
        });

        self.gridArea.beginAddColumns();

        //self.gridArea.addColumn( common.Util.CTR('Time'),      'ts',         200, Grid.DateTime, false, true);

        if(this.monitorType !== 'WEB'){
            self.gridArea.addColumn( common.Util.CTR('IP'),        'client_ip',  160, Grid.String,   true, false);
            self.gridArea.addColumn( common.Util.CTR('User Name'), 'login_name', 140, Grid.String,   true, false);
            self.gridArea.addColumn( common.Util.CTR('Browser'),   'browser',    100, Grid.String,   true, false);
            self.gridArea.addColumn( common.Util.CTR('Transaction Execution Count'),     'COUNT',          200, Grid.Number,true, false ) ;
            self.gridArea.addColumn( common.Util.CTR('Transaction Elapse Time (AVG)'), 'txn_elapse_avg', 200, Grid.Float, true, false ) ;
            self.gridArea.addColumn( common.Util.CTR('Transaction Elapse Time (MAX)'), 'txn_elapse_max', 200, Grid.Float, true, false ) ;
            self.gridArea.addColumn( common.Util.CTR('SQL Elapse Time (AVG)'),         'sql_elapse_avg', 200, Grid.Float, true, false ) ;
            self.gridArea.addColumn( common.Util.CTR('SQL Elapse Time (MAX)'),         'sql_elapse_max', 200, Grid.Float, true, false ) ;
        } else{
            self.gridArea.addColumn( common.Util.CTR('IP'),        'client_ip',  160, Grid.String,   true, false);
            self.gridArea.addColumn( common.Util.CTR('Transaction Execution Count'),     'COUNT',          200, Grid.Number,true, false ) ;
            self.gridArea.addColumn( common.Util.CTR('Transaction Elapse Time (AVG)'), 'txn_elapse_avg', 200, Grid.Float, true, false ) ;
            self.gridArea.addColumn( common.Util.CTR('Transaction Elapse Time (MAX)'), 'txn_elapse_max', 200, Grid.Float, true, false ) ;
        }

        self.gridArea.endAddColumns();

        self.gridArea.loadLayout(self.gridArea.gridName);
        btmArea.add(self.gridArea);

    } ,

    executeSQL: function() {

        if (this.gridArea.isLoading)
            return;

        this.loadingMask.showMask();

        var fromTime = Ext.util.Format.date(this.datePicker.getFromDateTime(), Comm.dateFormat.HM);   // +00
        var toTime   = Ext.util.Format.date(this.datePicker.getToDateTime(), Comm.dateFormat.HM);     // +59

        this.datePicker.mainFromField.setValue(fromTime);
        this.datePicker.mainToField.setValue(toTime);

        var dataSet = {};
        dataSet.sql_file = this.monitorType === 'WEB' ? this.sql.webServerChart : this.sql.chart;
        dataSet.bind = [{
            name: 'from_time',
            value: common.Util.getDate(fromTime),
            type: SQLBindType.STRING
        },{
            name: 'to_time',
            value: common.Util.getDate(toTime),
            type: SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name: 'was_id',
            value: this.wasCombo.getValue()
        }];

        WS.SQLExec(dataSet, this.onData, this);
    },

    draw_grid_data : function ( fromtime, totime ) {
        var self = this;
        var dataSet = {};

        dataSet.sql_file = self.monitorType === 'WEB' ? self.sql.webServerGrid : self.sql.grid;

        dataSet.bind = [{
            name: 'from_time',
            value: fromtime,
            type: SQLBindType.STRING
        },{
            name: 'to_time',
            value: totime,
            type: SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name: 'was_id',
            value: self.wasCombo.getValue()
        }];

        WS.SQLExec(dataSet, self.onData, self);

    },

    onData: function(header, data) {
        var self = this;
        var param = header.parameters ;
        var command = header.command;

        if(!common.Util.checkSQLExecValid(header, data)){
            if (command == (self.monitorType === 'WEB' ? self.sql.webServerChart : self.sql.chart)){
                self.clientChart.clearValues();
                self.clientChart.plotDraw();

                self.gridArea.clearRows();
                self.gridArea.drawGrid();

                self.loadingMask.hide();
            }

            if (command == (self.monitorType === 'WEB' ? self.sql.webServerGrid : self.sql.grid)){
                self.gridArea.clearRows();
                self.gridArea.drawGrid();
                self.gridArea.loadingMask.hide();
            }

            console.debug('ClientHistory-onData');
            console.debug(header);
            console.debug(data);
            return;
        }


        if (data.rows.length > 0) {
            if (command == (self.monitorType === 'WEB' ? self.sql.webServerChart : self.sql.chart)){
                var data_index   = 1;
                var chart_param  = {};
                var series_value = {};

                self.clientChart.clearValues();

                chart_param.from = param.bind[0].value;
                chart_param.to  = param.bind[1].value;
                chart_param.time= 0;
                chart_param.data= data.rows;

                series_value[0] = data_index;


                chart_param.series = series_value;
                self.clientChart.addValues(chart_param);
                self.clientChart.plotDraw();


                var max_offset = self.clientChart.maxOffSet.x ;
                var fromtime = common.Util.getDate(max_offset);
                var to_time = common.Util.getDate(max_offset + 600000);

                self.clientChart.highLight( 0, self.clientChart.maxOffSet.index ) ;

                /**
//                console.log('****** max_offset, >>>>', max_offset);
//                console.log('****** from time, >>>>', fromtime);
//                console.log('****** to_time, >>>>', to_time);
//                console.log('****** max_offset_Index, >>>>', self.clientChart.maxOffSet.index);
                 **/

                self.draw_grid_data(fromtime, to_time);
                self.loadingMask.hide();
            }
            else if (command == (self.monitorType === 'WEB' ? self.sql.webServerGrid : self.sql.grid)){
                self.gridArea.clearRows() ;

                for (var ix = 0, len = data.rows.length; ix < len; ix++) {
                    var dataRows = data.rows[ix];
                    self.gridArea.addRow(dataRows);
                }
                self.gridArea.drawGrid();
                self.gridArea.loadingMask.hide();
            }
        }
        else {
            if (command == (self.monitorType === 'WEB' ? self.sql.webServerChart : self.sql.chart)){
                self.clientChart.clearValues();
                self.clientChart.plotDraw();

                self.gridArea.clearRows();
                self.gridArea.drawGrid();

                self.loadingMask.hide();
            }

            if (command == (self.monitorType === 'WEB' ? self.sql.webServerGrid : self.sql.grid)){
                self.gridArea.clearRows() ;
                self.gridArea.drawGrid();
                self.gridArea.loadingMask.hide();
            }
        }
    }

});