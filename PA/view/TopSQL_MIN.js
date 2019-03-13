/**
 * Created by min on 2015-03-14.
 */
Ext.define( 'view.TopSQL_MIN',{
    extend: 'Exem.FormOnCondition',
    width : '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style : { background: '#cccccc'},
    sql   : {
        elapse: 'IMXPA_TOPSQL_elapse.sql',
        exec  : 'IMXPA_TOPSQL_exec.sql'
    },
    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        }
    },

    _findGridIdx: function(grid, itemIdx) {
        for (var ix = 0, len = grid.store.data.items.length; ix < len; ix++) {
            var record = grid.store.data.items[ix];
            if (record.data['hidden_idx'] == itemIdx) {
                return ix;
            }
        }
    },

    checkValid: function(){
        return this.wasCombo.checkValid();
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


    executeSQL: function(){

        if ( this.wasCombo.getValue() == null ){
            this.wasCombo.selectByIndex( 0 ) ;
        }

        var ix, jx ;
        var combo, id;
        this.main_tab.setActiveTab(0) ;
        this.was_obj = {} ;


        if ( !realtime.WasMode ){
            combo = this.wasCombo.wasTree.getRootNode().data.children ;

            for ( ix = 0 ; ix < combo.length; ix++ ){
                if ( !combo[ix].checked ){
                    continue;
                }

                for ( jx = 0 ; jx < combo[ix].children.length; jx++ ){
                    id = combo[ix].children[jx].id ;

                    if ( this.was_obj[ id ] == undefined ){
                        this.was_obj[id] = [];
                    }
                    this.was_obj[id].push( combo[ix].children[jx].text ) ;

                }
            }
        }else{

            combo = this.wasCombo.getValue() ;
            combo = combo.split(',') ;

            var combo_value = this.wasCombo.WASDBCombobox.rawValue ;
            if ( combo_value == '(All)' ){
                combo_value = this.wasCombo.getWasNames() ;
            }else{
                combo_value = combo_value.split(',') ;
            }


            for ( ix = 0 ; ix < combo.length; ix++ ){
                id = combo[ix] ;

                if ( this.was_obj[ id ] == undefined ){
                    this.was_obj[id] = [];
                }
                this.was_obj[id].push( combo_value[ix] ) ;
            }
        }


        this.create_tab() ;
        this.select_tab_was = this.wasCombo.getValue() ;
        this.execute_tab_sql( this.select_tab_was ) ;
    },

    execute_tab_sql: function( was_id ){

        var self = this ;

        if ( was_id == 'main_pnl' ){
            was_id = this.wasCombo.getValue() ;
        }

        this.loadingMask.showMask() ;

        var recordCount = this.recordCnt.getValue();
        var dataset = {};

        dataset.bind = [];
        dataset.replace_string = [];

        dataset.bind = [
            {
                name: "from_time",
                value: Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
                type: SQLBindType.STRING
            }, {
                name: "to_time",
                value: Ext.util.Format.date(this.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
                type: SQLBindType.STRING
            }];

        dataset.replace_string = [{
            name: "was_id",
            value: was_id
        }, {
            name: "order_by",
            value: this.orderbyCombo.valueToRaw(this.orderbyCombo.getValue())
        }, {
            name: "limitCnt",
            value: recordCount
        }];

        dataset.sql_file = this.sql.elapse;
        WS.SQLExec(dataset, this.onElpaseData, this);

        setTimeout(function(){
            dataset.sql_file = self.sql.exec;
            WS.SQLExec(dataset, self.onExecData, self);

            recordCount = null ;
            dataset = null ;
            self = null ;
        },300) ;



    } ,


    onElpaseData: function(aheader, adata) {
        var self = this;

        if(self.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(aheader, adata)){
            self.showMessage(common.Util.TR('ERROR'), aheader.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});
            self.loadingMask.hide();

            console.warn('TopSQL_MIN-onElpaseData');
            console.warn(aheader);
            console.warn(adata);
            return;
        }

        self.elapseGrid.clearRows();
        self.elapseCht.clearValues();
        self.elapseCht.plotRedraw();
        self.retrieve_flag = true ;

        if(adata.rows.length == 0){
            self.elapseCht.plotDraw();
            self.loadingMask.hide();
            return;
        }

        if (aheader.command == self.sql.elapse) {
            var d = adata.rows;
            var max_data = [];
            var avg_data = [];
            var orderBy = self.orderbyCombo.getValue();

            switch (orderBy) {
                case 'avg_elapse'  :
                    self.elapseGrid.setOrderAct('avg_elapse', 'DESC');
                    break;
                case 'max_elapse'  :
                    self.elapseGrid.setOrderAct('max_elapse', 'DESC');
                    break;
                case 'total_elapse':
                    self.elapseGrid.setOrderAct('total_elapse', 'DESC');
                    break;
                default :
                    break;
            }

            for (var ix = 0, len = d.length; ix < len; ix++) {
                var dataRows = adata.rows[ix];
                var chartIdx = len - 1 - ix;
                self.elapseGrid.addRow([
                    dataRows[0]     // sql_text
                    ,dataRows[1]     // sql_id
                    ,dataRows[2]     // total_elapse
                    ,dataRows[3]     // elapsed_time_ratio
                    ,dataRows[4]     // avg_elapse
                    ,dataRows[5]     // max_elapse
                    ,dataRows[6]     // sql_exec_count
                    ,dataRows[7]     // cpu_time
                    ,dataRows[8]     // wait_time
                    ,dataRows[9]     // logical_reads
                    ,dataRows[10]    // physical_reads
                    ,chartIdx        // hidden_idx
                    ,dataRows[11]    // DB ID
                ]);

                // AVG Data
                avg_data.push([ dataRows[4], ix]);

                // MAX Data
                max_data.push([ dataRows[5], ix]);
            }

            self.elapseGrid.drawGrid();

            avg_data.reverse();
            max_data.reverse();

            for (var jx = 0; jx < avg_data.length; jx++) {
                self.elapseCht.addValue(1, avg_data[jx]);
                self.elapseCht.addValue(0, max_data[jx]);
            }

            self.elapseCht.plotDraw();

            // MFO 연동에 필요한 파라미터 값을 설정함.
            if (!self.mxgParams) {
                self.mxgParams = {};
            }
            self.mxgParams.fromTime = aheader.parameters.bind[0].value;
            self.mxgParams.toTime   = aheader.parameters.bind[1].value;

            ix = null ;
            jx = null ;
            d = null ;
            max_data = null ;
            avg_data = null ;
        }
    } ,



    onExecData: function(aheader, adata) {
        var self = this;

        if(self.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(aheader, adata)){
            self.showMessage(common.Util.TR('ERROR'), aheader.message, Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});
            self.loadingMask.hide();

            console.warn('TopSQL_MIN-onExecData');
            console.warn(aheader);
            console.warn(adata);
            return;
        }

        self.executeGrid.clearRows();
        self.executeCht.clearValues();
        self.executeCht.plotRedraw();

        if(adata.rows.length > 0){
            var SUMData = [];
            var d = adata.rows;

            for (var ix = 0, len = d.length; ix < len; ix++) {
                var dataRows = d[ix];
                var chartIdx = len - 1 - ix;
                self.executeGrid.addRow([
                    dataRows[0]  // sql_text
                    ,dataRows[1]  // sql_id
                    ,Number(dataRows[2])  // sql_exec_count
                    ,dataRows[3]  // total_elapse
                    ,dataRows[4]  // elapsed_time_ratio
                    ,dataRows[5]  // avg_elapse
                    ,dataRows[6]  // max_elapse
                    ,dataRows[7]  // cpu_time
                    ,dataRows[8]  // wait_time
                    ,dataRows[9]  // logical_reads
                    ,dataRows[10] // physical_reads
                    ,chartIdx     // hidden_idx
                    ,dataRows[11] // DB ID
                ]);

                var sRow = [];

                sRow[0] = dataRows[2];
                sRow[1] = ix;

                SUMData.push([sRow[0], sRow[1]]);
            }

            self.executeGrid.drawGrid();

            SUMData.reverse();

            self.executeCht.setData(0, SUMData);
            self.executeCht.plotDraw();
        }

        var fromTime = self.datePicker.getFromDateTime();
        var toTime = self.datePicker.getToDateTime();
        var findComponent = self.conditionArea.getComponent('wasCombo');

        if (findComponent == 'undefined' || findComponent == null) {
            self.tab.setText(this.title + '<div>[' +
                Ext.util.Format.date(fromTime, 'H:i~') +
                Ext.util.Format.date(toTime, 'H:i]</div>')) ;
        } else {
            var instanceName = findComponent.WASDBCombobox.getRawValue() + ' : ';

            if (instanceName.length > 25)
                instanceName = instanceName.substr(0, 20) + '... : ';

            self.tab.setText(self.title + '<div>[' + instanceName +
                Ext.util.Format.date(fromTime, 'H:i~') +
                Ext.util.Format.date(toTime, 'H:i]</div>'));
        }

        window.tabPanel.setRightScrollPosition();

        self.loadingMask.hide();
        fromTime = null ;
        toTime = null ;
        findComponent = null ;
        instanceName = null ;
    } ,

    create_tab: function(){
        var ix, ixLen, keys;
        var pnl;

        this.main_tab.suspendLayouts();
        for ( ix = this.main_tab.items.length; ix > 1 ; ix-- ){
            this.main_tab.items.items[1].destroy() ;
        }

        keys = Object.keys(this.was_obj);
        for ( ix = 0, ixLen = keys.length; ix < ixLen; ix++ ){
            pnl = Ext.create('Exem.Container',{
                itemId: keys[ix],
                layout: 'vbox',
                region: 'north',
                flex  : 1,
                height: '100%',
                width : '100%',
                //title : common.Util.TR( this.was_obj[ix][0] ),
                title : this.was_obj[keys[ix]][0]
            });
            this.main_tab.add( pnl ) ;
            pnl = null ;
        }
        this.main_tab.resumeLayouts();
        this.main_tab.doLayout();
        ix = null ;

    },


    init: function(){

        var self = this ;

        this.retrieve_flag = false ;
        this.setWorkAreaLayout('border');


        this.wasCombo = Ext.create('Exem.wasDBComboBox', {
            itemId         : 'wasCombo',
            width          : 350,
            comboWidth     : 230,
            comboLabelWidth: 60,
            multiSelect    : true,
            selectType     : common.Util.TR('Agent'),
            x              : 330,
            y              : 5
        });

        // ORDER BY list
        this.orderbyCombo = Ext.create('Exem.ComboBox', {
            fieldLabel: common.Util.TR('By Elapse Time'),
            labelAlign: 'right',
            store: Ext.create('Exem.Store'),
            margin: '0 0 0 -17'
            //x: 600,
            //y : 5
        });

        this.orderbyCombo.addItem('avg_elapse', common.Util.TR('AVG'));
        this.orderbyCombo.addItem('max_elapse', common.Util.TR('MAX'));
        this.orderbyCombo.addItem('total_elapse', common.Util.TR('Total'));

        this.recordCnt = Ext.create('Exem.NumberField',{
            value       : 20,
            x           : 600,
            y           : 5,
            labelWidth  : 80,
            width       : 170,
            fieldStyle  : 'text-align: left;',
            fieldLabel  : common.Util.TR('Record Count'),
            maxValue    : 100,
            minValue    : 1,
            maxLength   : 3,
            enforceMaxLength: true,
            enableKeyEvents : true,
            allowDecimals   : false,
            listeners: {
                scope: this,
                change: function(me) {
                    if (me.oldValue !== me.value) {
                        if (me.value <= 0) {
                            me.setValue(1);
                        } else if (me.value > 100) {
                            me.setValue(100);
                            this.showMessage(
                                common.Util.TR(''),
                                common.Util.TR('Input value is out of range.') + ' ('+common.Util.TR('MAX')+'100)',
                                Ext.Msg.OK,
                                Ext.MessageBox.INFO
                            );
                        }
                        me.oldValue = me.value;
                    }
                },
                blur: function(me) {
                    if (me.oldValue !== me.value) {
                        if (me.value <= 0) {
                            me.setValue(1);
                        } else if (me.value > 100) {
                            me.setValue(100);
                        }
                        me.oldValue = me.value;
                    }
                },
                specialkey: function(me, e) {
                    if (e.getKey() === e.ENTER && me.oldValue !== me.value) {
                        if (me.value <= 0) {
                            me.setValue(1);
                        } else if (me.value > 100) {
                            me.setValue(100);
                        }
                        me.oldValue = me.value;
                    }
                }
            }
        });

        this.conditionArea.add(this.recordCnt);
        this.conditionArea.add(this.wasCombo);

        this.wasCombo.init();



        this.main_tab = Ext.create('Exem.TabPanel',{
            itemId: 'main_tab',
            width : '100%',
            height: '100%',
            layout: 'fit',
            region: 'north',
            //style : { background: '#E8E8E8' },
            listeners: {
                tabchange: function( tab, _new){
                    if ( !self.retrieve_flag ){
                        return ;
                    }

                    _new.add( self.top_area, self.bot_con ) ;
                    self.elapseGrid.clearRows() ;
                    self.elapseCht.clearValues();
                    self.elapseCht.plotRedraw();
                    self.elapseCht.plotDraw() ;

                    self.executeGrid.clearRows() ;
                    self.executeCht.clearValues() ;
                    self.executeCht.plotRedraw();
                    self.executeCht.plotDraw() ;
                    self.execute_tab_sql( _new.itemId ) ;
                    if ( _new.itemId == 'main_pnl' ){
                        self.select_tab_was = self.wasCombo.getValue();
                    }
                    else{
                        self.select_tab_was = _new.itemId;
                    }
                }
            }
        });
        this.workArea.add( this.main_tab ) ;


        this.main_pnl = Ext.create('Exem.Container',{
            itemId: 'main_pnl',
            layout: 'vbox',
            region: 'north',
            flex  : 1,
            //height: '100%',
            width : '100%',
            title : common.Util.TR('Total')
        });
        this.main_tab.add( this.main_pnl ) ;


        var top_area = Ext.create('Exem.Panel',{
            itemId: 'top_area',
            title : ' ',
            layout: 'hbox',
            //split : true,
            flex  : 1,
            width : '100%'
        });


        this.bot_con = Ext.create('Exem.Container',{
            itemId: 'bot_con',
            layout: 'fit',
            split : true,
            flex  : 1,
            width : '100%',
            height: '100%'
        }) ;

        var bot_area = Ext.create('Exem.Panel',{
            itemId: 'bot_area',
            title : common.Util.TR('By Execution Count'),
            layout: 'hbox',
            width : '100%',
            height: '100%'
        });

        this.main_pnl.add(top_area, this.bot_con);
        this.bot_con.add( bot_area ) ;
        self.top_area = top_area ;
        self.bot_area = bot_area ;

        self.top_area.getHeader().add(this.orderbyCombo, { xtype: 'tbspacer', width: '100%' } ) ;
        this.set_elapse( top_area ) ;
        this.set_exec( bot_area ) ;

        this.main_tab.setActiveTab(0) ;
    } ,

    set_elapse: function( parent ){
        var self = this ;

        self.elapseGrid = Ext.create('Exem.BaseGrid', {
            layout  : 'fit',
            //region  : 'west',
            width   : '60%',
            margin  : '0 10 0 0',
            itemId  : 'elapseGrid',
            split   : true ,
            minWidth : 800,
            gridName : 'pa_top_sql_elapse_gridName',
            itemclick : function ( this_view , record ) {
                self.elapseCht.plot.unhighlight();
                self.elapseCht.highLight(0, record.data['hidden_idx']);
                //console.info('record == >', record);
            }
        });



        self.elapseGrid.addEventListener('celldblclick', function(aGrid, td, cellIndex, record, tr, rowIndex) {
            var row_value;

            if (rowIndex != undefined) {
                row_value = record.data;

                if( (row_value['sql_text'] == "") || (row_value['sql_id'] == "") ) {
                    return;
                }

                // 0 : sql text
                // 1 : sql_id , false
                if(!cellIndex){
                    self.show_sql_text( row_value['sql_id'], row_value.db_id);
                }
            }

        }, this);



        self.elapseGrid.beginAddColumns();

        self.elapseGrid.addColumn(common.Util.CTR('SQL Text'),            'sql_text',          300, Grid.String);
        self.elapseGrid.addColumn('SQL ID',                               'sql_id',            200, Grid.String, false, true);
        self.elapseGrid.addColumn(common.Util.CTR('Elapse Time (Total)'), 'total_elapse',      120, Grid.Float);
        self.elapseGrid.addColumn(common.Util.CTR('Elapse Time (Ratio)'), 'elapsed_time_ratio',120, Grid.Float);
        self.elapseGrid.addColumn(common.Util.CTR('Elapse Time (AVG)'),   'avg_elapse',        120, Grid.Float);
        self.elapseGrid.addColumn(common.Util.CTR('Elapse Time (MAX)'),   'max_elapse',        120, Grid.Float);
        self.elapseGrid.addColumn(common.Util.CTR('Execute Count'),       'sql_exec_count',    120, Grid.Number);
        self.elapseGrid.addColumn(common.Util.CTR('CPU Time'),            'cpu_time',          120, Grid.Float);
        self.elapseGrid.addColumn(common.Util.CTR('Wait Time'),           'wait_time',         120, Grid.Float);
        self.elapseGrid.addColumn(common.Util.CTR('Logical Reads'),       'logical_reads',     120, Grid.Number);
        self.elapseGrid.addColumn(common.Util.CTR('Physical Reads'),      'physical_reads',    120, Grid.Number);
        self.elapseGrid.addColumn('Hidden Idx',                           'hidden_idx',        100, Grid.String, false, true);
        self.elapseGrid.addColumn('DB ID',                                'db_id',             100, Grid.String, false, true);

        self.elapseGrid.endAddColumns();

        self.elapseGrid.loadLayout(self.elapseGrid.gridName);
        self.elapseGrid.setOrderAct('total_elapse', 'DESC');

        common.WebEnv.set_nondb( self.elapseGrid, false ) ;

        var isEnableMaxGaugeLink = Comm.RTComm.isMaxGaugeLink();

        if (isEnableMaxGaugeLink) {
            // MFO 화면 연계
            this.elapseGrid.contextMenu.addItem({
                title : common.Util.CTR('SQL Detail Analysis'),
                itemId: 'sql_analysis',
                fn: function() {
                    var record = this.up().record;
                    var sqlId  = record.sql_id;
                    var dbId   = record.db_id;

                    self.mxgParams.sqlUid = sqlId;
                    self.mxgParams.dbId   = dbId;

                    if (Comm.RTComm.openMaxGaugeLongTerm) {
                        Comm.RTComm.openMaxGaugeLongTerm(
                            self.mxgParams.dbId,
                            self.mxgParams.fromTime,
                            self.mxgParams.toTime,
                            self.mxgParams.sqlUid
                        );
                    }
                }
            }, 0);
        }

        // Full SQL Text jump menu add
        self.elapseGrid.contextMenu.addItem({
            title : common.Util.TR('Full SQL Text'),
            itemId : 'exec_mnu_full_sql',
            target : self,
            fn: function() {
                var record = this.up().record;
                var sql_id = record['sql_id'];
                var dbId   = record.db_id;

                // MFO 화면 연동에 필요한 파라미터 값을 설정함.
                var mxgParams = {
                    dbId    : dbId,
                    sqlUid  : sql_id,
                    fromTime: self.mxgParams.fromTime,
                    toTime  : self.mxgParams.toTime,
                    viewType: 'LongTermTrendSQLView'
                };

                var full_sql_view = Ext.create('Exem.FullSQLTextWindow', {
                    mxgParams : mxgParams
                });
                self.full_sql_view = full_sql_view;

                self.full_sql_view.getFullSQLText(sql_id);
                self.full_sql_view.show();
            }
        }, 0);

        self.elapseGrid.addRenderer('elapsed_time_ratio', self.convert_value_to_progress, RendererType.bar) ;

        if (this.monitorType !== 'TP') {
            // SQL Hitory jump menu add
            self.elapseGrid.contextMenu.addItem({
                title  : common.Util.TR( 'SQL Summary'),
                itemId : 'exec_mnu_sql_history',
                target : self,
                fn: function() {
                    var record = this.up().record;
                    var sql_history_view;
                    if (self.wasCombo.WASDBCombobox.getRawValue() == '(All)') {
                        sql_history_view = common.OpenView.open('SQLHistory', {
                                fromTime: self.datePicker.getFromDateTime(),
                                toTime: self.datePicker.getToDateTime(),
                                sqlIdTF : record['sql_id']
                            }
                        );
                    } else {
                        sql_history_view = common.OpenView.open('SQLHistory', {
                                fromTime: self.datePicker.getFromDateTime(),
                                toTime : self.datePicker.getToDateTime(),
                                sqlIdTF: record['sql_id'],
                                wasId  : self.select_tab_was
                            }
                        );
                    }

                    setTimeout(function() {
                        sql_history_view.retrieve();
                    }, 300);
                }
            }, 0);
        }


        self.elapseCht = Ext.create('Exem.chart.CanvasChartLayer', {
            showLegend         : true,
            showLegendValueArea: true,
            //legendAlign : 'north',
            legendHeight       : 40,
            legendNameWidth    : 120,
            showTooltip        : true,
            layout             : 'fit',
            region             : 'center',
            itemId             : 'elapseCht',
//            backgroundColor : '#F8F8FF',
//            minWidth : 500,
            maxValueFormat     : '%x',
            toolTipFormat      : '[%s] %x',
            chartProperty: {
                mode  : null,
                yMin  : null,
                yMode : "categories",
                yaxis : false
            },
            //not historyInformation
            legendColorClickType : 1,
            //not historyInformation
            legendColorClickToVisible : false,
            //not historyInformation
            showHistoryInfo: false,
            plotclick: function(event, pos, item){
                var grid = self.elapseGrid.pnlExGrid;
                var dataIdx = self._findGridIdx(grid, item.dataIndex);
                grid.getView().getSelectionModel().select(dataIdx);
            }
        });

        self.elapseCht.addSeries({
            id    : 'elapse_max_srs',
            label : common.Util.CTR('Elapse Time (MAX)'),
            type  : PlotChart.type.exBar,
            hbar  : true/*,
             stack : true*/
//            color : '#d71818'
        }) ;

        self.elapseCht.addSeries({
            id   : 'elapse_avg_srs',
            label: common.Util.CTR('Elapse Time (AVG)'),
            type : PlotChart.type.exBar,
            hbar : true/*,
             stack : true*/
        }) ;

        parent.add( self.elapseGrid, {xtype: 'splitter'}, self.elapseCht ) ;
    },

    set_exec: function( parent ){
        var self = this ;


        self.executeGrid = Ext.create('Exem.BaseGrid', {
            layout    : 'fit',
            //region    : 'west',
            width     : '60%',
            itemId    : 'executeGrid',
            split     : true,
            minWidth  : 800,
            margin    : '0 10 0 0',
            gridName  : 'pa_top_sql_execute_gridName',
            itemclick : function ( this_view , record ) {
                self.executeCht.plot.unhighlight();
                self.executeCht.highLight(0, record.data['hidden_idx']);
            }
        });

        self.executeGrid.addEventListener('celldblclick', function(aGrid, td, cellIndex, record, tr, rowIndex) {
            var row_value;

            if (rowIndex != undefined) {
                row_value = record.data;

                if( (row_value['sql_text'] == "") || (row_value['sql_id'] == "") ) {
                    return;
                }

                // 0 : sql text
                // 1 : sql_id , false
                if(!cellIndex){
                    self.show_sql_text( row_value['sql_id'], row_value.db_id);
                }
            }

        }, this);

        self.executeGrid.beginAddColumns();

        self.executeGrid.addColumn(common.Util.CTR('SQL Text'),            'sql_text',           300, Grid.String);
        self.executeGrid.addColumn('SQL ID',                               'sql_id',             200, Grid.String, false, true);
        self.executeGrid.addColumn(common.Util.CTR('Execute Count'),       'sql_exec_count',     120, Grid.Number);
        self.executeGrid.addColumn(common.Util.CTR('Elapse Time (Total)'), 'total_elapse',       120, Grid.Float);
        self.executeGrid.addColumn(common.Util.CTR('Elapse Time (Ratio)'), 'elapsed_time_ratio', 120, Grid.Float);
        self.executeGrid.addColumn(common.Util.CTR('Elapse Time (AVG)'),   'avg_elapse',         120, Grid.Float);
        self.executeGrid.addColumn(common.Util.CTR('Elapse Time (MAX)'),   'max_elapse',         120, Grid.Float);
        self.executeGrid.addColumn(common.Util.CTR('CPU Time'),            'cpu_time',           120, Grid.Float);
        self.executeGrid.addColumn(common.Util.CTR('Wait Time'),           'wait_time',          120, Grid.Float);
        self.executeGrid.addColumn(common.Util.CTR('Logical Reads'),       'logical_reads',      120, Grid.Number);
        self.executeGrid.addColumn(common.Util.CTR('Physical Reads'),      'physical_reads',     120, Grid.Number);
        self.executeGrid.addColumn('Hidden Idx',                           'hidden_idx',         100, Grid.String, false, true);
        self.executeGrid.addColumn('DB ID',                                'db_id',              100, Grid.String, false, true);

        self.executeGrid.endAddColumns();

        self.executeGrid.loadLayout(self.executeGrid.gridName);

        self.executeGrid.setOrderAct('sql_exec_count', 'DESC');

        common.WebEnv.set_nondb( self.executeGrid, false ) ;

        var isEnableMaxGaugeLink = Comm.RTComm.isMaxGaugeLink();

        if (isEnableMaxGaugeLink) {
            // MFO 화면 연계
            this.executeGrid.contextMenu.addItem({
                title : common.Util.CTR('SQL Detail Analysis'),
                itemId: 'sql_analysis',
                fn: function() {
                    var record = this.up().record;
                    var sqlId  = record.sql_id;
                    var dbId   = record.db_id;

                    self.mxgParams.sqlUid = sqlId;
                    self.mxgParams.dbId   = dbId;

                    if (Comm.RTComm.openMaxGaugeLongTerm) {
                        Comm.RTComm.openMaxGaugeLongTerm(
                            self.mxgParams.dbId,
                            self.mxgParams.fromTime,
                            self.mxgParams.toTime,
                            self.mxgParams.sqlUid
                        );
                    }
                }
            }, 0);
        }

        // Full SQL Text jump menu add
        self.executeGrid.contextMenu.addItem({
            title : common.Util.TR('Full SQL Text'),
            itemId : 'exec_mnu_full_sql',
            target : self,
            fn: function() {
                var record = this.up().record;
                var sql_id = record['sql_id'];

                var dbId   = record.db_id;

                // MFO 화면 연동에 필요한 파라미터 값을 설정함.
                var mxgParams = {
                    dbId    : dbId,
                    sqlUid  : sql_id,
                    fromTime: self.mxgParams.fromTime,
                    toTime  : self.mxgParams.toTime,
                    viewType: 'LongTermTrendSQLView'
                };
                var full_sql_view = Ext.create('Exem.FullSQLTextWindow', {
                    mxgParams: mxgParams
                });

                self.full_sql_view = full_sql_view;
                self.full_sql_view.getFullSQLText(sql_id);

                // MFO 화면 연동에 필요한 파라미터 값을 설정함.
                if (self.full_sql_view.setmxgOpenParams) {
                    self.mxgParams.sqlId = sql_id;
                    self.full_sql_view.setmxgOpenParams(self.mxgParams);
                }

                self.full_sql_view.show();
            }
        }, 0);

        self.executeGrid.addRenderer('elapsed_time_ratio', self.convert_value_to_progress, RendererType.bar) ;


        if (this.monitorType !== 'TP') {
            // SQL Hitory jump menu add
            self.executeGrid.contextMenu.addItem({
                title : common.Util.TR('SQL Summary'),
                itemId : 'exec_mnu_sql_history',
                target : self,
                fn: function() {
                    var record = this.up().record;
                    var sql_history_view;

                    if (self.wasCombo.WASDBCombobox.getRawValue() == '(All)') {
                        sql_history_view = common.OpenView.open('SQLHistory', {
                                fromTime: self.datePicker.getFromDateTime(),
                                toTime: self.datePicker.getToDateTime(),
                                sqlIdTF : record['sql_id']
                            }
                        );
                    } else {
                        sql_history_view = common.OpenView.open('SQLHistory', {
                                fromTime: self.datePicker.getFromDateTime(),
                                toTime : self.datePicker.getToDateTime(),
                                sqlIdTF: record['sql_id'],
                                wasId  : self.wasCombo.getValue()
                            }
                        );
                    }

                    setTimeout(function() {
                        sql_history_view.retrieve();
                    }, 300);
                }
            }, 0);
        }

        self.executeCht = Ext.create('Exem.chart.CanvasChartLayer', {
            //showLegend         : true,
            //showLegendValueArea: true,
            //legendHeight       : 40,
            //legendNameWidth    : 120,
            showTooltip        : true,
            layout             : 'fit',
            itemId             : 'executeCht',
            chartProperty: {
                mode : null,
                yMin : null,
                yMode: "categories",
                yaxis : false
            },
            maxValueFormat     : '%x',
            toolTipFormat      : '[%s] %x',

            plotclick: function(event, pos, item){
                var grid = self.executeGrid.pnlExGrid;
                var dataIdx = self._findGridIdx(grid, item.dataIndex);
                grid.getView().getSelectionModel().select(dataIdx);
            }

        });

        self.executeCht.addSeries({
            id: 'execute_srs',
            label: common.Util.CTR('Execute count'),
            type: PlotChart.type.exBar,
            hbar: true
        }) ;

        parent.add( self.executeGrid, {xtype: 'splitter'}, self.executeCht ) ;
    },



    show_sql_text : function ( sql_id, db_id ) {
        var self = this;

        // MFO 화면 연동에 필요한 파라미터 값을 설정함.
        var mxgParams = {
            dbId    : db_id,
            sqlUid  : sql_id,
            fromTime: self.mxgParams.fromTime,
            toTime  : self.mxgParams.toTime,
            viewType: 'LongTermTrendSQLView'
        };

        self.sql_txt_view = Ext.create('Exem.FullSQLTextWindow', {
            mxgParams : mxgParams
        });

        self.sql_txt_view.getFullSQLText(sql_id);

        self.sql_txt_view.show();

        self = null ;
    },

    convert_value_to_progress : function ( value, meta, record ) {
        try{
            var record_val = record.data['elapsed_time_ratio'];
            value = Ext.String.htmlEncode(value);
            meta.tdAttr = 'data-qtip="' + Ext.String.htmlEncode(value) + '%"';

            var el = '<div style="position:relative;width:100%; height:13px">' +
                '<div style="float:left; background-color: #43BCD7; background: linear-gradient(to bottom, #43BCD7 0%, #74FFFF 50%,#43BCD7 100%);height:100%;width:'+ record_val +'%;"></div>' +
                '<div style="position:absolute;width:100%; text-align: center">'+value+'%'+'</div>' +
                '</div>';

            return el;
        }finally{
            record_val = null ;
        }
    }



} );