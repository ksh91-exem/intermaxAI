/**
 * Created with IntelliJ IDEA.
 * User: Boeun
 * Date: 14. 1. 27
 * Time: 오후 1:38
 * To change this template use File | Settings | File Templates.
 */
Ext.define("view.TransactionLeakSuspect", {
    extend: "Exem.FormOnCondition",
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql : {
         txnLeaktree_sql            : 'IMXPA_Transaction_Leak_Suspect_Tree.sql'
        ,topMemoryUsed_sql          : 'IMXPA_Transaction_Leak_Suspect_TopMemoryUsed.sql'
        ,txnLeaktree_child_sql      : 'IMXPA_Transaction_Leak_Suspect_Tree_Childnode.sql'
        ,txnMemoryUsed_chart_sql    : 'IMXPA_Transaction_Leak_Suspect_Tree_getChart.sql'
        ,txnLeaktree_child_chart_sql: 'IMXPA_Transaction_Leak_Suspect_Tree_ChildChart.sql'
    },
    //child data add list(min)
    child_node_list: {},
    sub_node: null,


    MAX_SIZE : 2147483647,

    treeNodes_Obj : {},
    txnMemoryUsageRecord_obj : {},
    txnIdFlag : {},     //txn_id별로 플래그 주고, 한번 더블클릭 했던 건 실행 x.
    ChartRowCount : 0,

    checkValid: function(){
        var self = this ;

        var cmp ;
        //var langPkg = ExemTextpkg.editText;

        if( (self.size_NumberField.getValue() == null ) || (self.size_NumberField.getValue() > 2147483648)){
            var msgStr = common.Util.TR('Memory value is incorrect.');
            cmp = self.size_NumberField ;
//            self.ShowMessage( 'ERROR', msgStr, Ext.Msg.OK, Ext.MessageBox.ERROR, cmp ) ;
            cmp.setValue( 0 ) ;
            self.executeSQL() ;
            return false;
        }

        if (self.wasList_TextField.getValue() == null ) {
            var msgStr = common.Util.TR('Please select Agent.');
            cmp = self.wasList_TextField ;
//            self.ShowMessage( 'ERROR', msgStr, Ext.Msg.OK, Ext.MessageBox.ERROR, cmp.WASDBCombobox ) ;
            cmp.selectByIndex( 0 ) ;
            self.executeSQL() ;
            return false;
        } ;

        return true;

    },

    init: function(){
        var self = this;

        //self.was_list = Comm.wasIdArr.join() ;
        self.setWorkAreaLayout('fit');

        //조건 3개
        //조건 1. Time (base에 이미 깔려 있음)
        //조건 2. WAS (Text Field) -> 더블클릭 시 폼 띄워서 WAS 선택하는 체크박스
        //조건 3. SIZE (Number Field)


        //조건 2. WAS
        self.wasList_TextField = Ext.create('Exem.wasDBComboBox', {
            x               : 350,
            y               : 5,
            width           : 300,
            labelWidth      : 60,
            comboWidth      : 260,
            comboLabelWidth : 60,
            selectType      : common.Util.TR('Agent'),
            itemId          : 'wasCombo',
            multiSelect    : true
        }) ;


        //조건 3. SIZE
        self.size_NumberField =  Ext.create('Ext.form.field.Number', {
            //fieldLabel: 'SIZE (MEM) >=',
            fieldLabel : common.Util.TR('Memory Size (KB) >='),
            itemId     : 'number_field',
            labelAlign : 'right',
            labelWidth : 150,
            allowBlank : false,
            value      : 0,
            width      : 250,
            x          : 650,
            y          : 5  ,
            labelSeparator : '',
            enableKeyEvents: true,
            maxLength      : 10,
            maxValue: 2147483647,
            minValue: 0,
            listeners      :{
                keydown: function(){
                    if ( this.value > self.MAX_SIZE ){
                        // 입력값을 초과하였습니다.
                        var msg_str = common.Util.TR('Input value is exceeded.') + '<br>' + '<font-size = "2"> ('+  common.Util.TR('Input range')+': 0~2147483647) </font-size>' ;
                        // value is exceeded
                        Ext.Msg.show({
//                            title  : 'ERROR',
                            title  : common.Util.TR('ERROR'),
                            msg    : msgStr,
                            buttons: Ext.Msg.OK,
                            icon   : Ext.MessageBox.ERROR,
                            fn     : function(buttonId) {
                                if (buttonId === "ok") {
                                    self.size_NumberField.focus();
                                    self.size_NumberField.setValue(0) ;
                                }
                            }
                        });

                    }
                }
            }
        });

        self.conditionArea.add(self.wasList_TextField);
        self.wasList_TextField.init();
        self.conditionArea.add(self.size_NumberField);


//        new WasSelectForm({
//            target: self.wasList_TextField.getValue(),         //getInputId(),
//            socket: WS
//        });

        //cell chart 생성.
        function createCellChart(value, meta, record, r, c, store, view) {

            var txn_id = record.data.txn_id;

            if (self.txnMemoryUsageRecord_obj[txn_id].rows.length > 0) {
                setTimeout(function() {
                    var row = view.getNode(record);

                    if (row) {
                        //var el = Ext.fly(Ext.fly(row).query('.x-grid-cell')[c]).down('div');
                        var el = Ext.get(row).dom.getElementsByClassName('x-grid-cell-last')[0].children;
                        if ( Ext.get(el[0]).dom.children.length > 0 ){
                            return ;
                        }
                    }
                    else
                        return;

                    var chart = Ext.create('Exem.chart.CanvasChartLayer', {
                        layout: 'fit',
                        width: '100%',
                        height: 70,
                        interval: PlotChart.time.exMin,
                        legendWidth: 0,
                        showLegend: false,
                        timeformat: '%D %H:%M:%S',

                        showTooltip  : true,
                        toolTipFormat : '%x [value:%y]',
                        //toolTipTimeFormat : '%D %H:%M:%S',

                        showMaxValue : true,
                        maxValueFormat : '%y',
                        maxValueAxisTimeFormat : '%H"%M',

                        showIndicator : false,
                        firstShowXaxis: true,
                        firstShowYaxis: true,

                        chartProperty: {
                            yLabelWidth: 25,
                            xLabelFont: {size: 8, color: 'black'},
                            yLabelFont: {size: 8, color: 'black'}
                        }
                    });

                    chart.addSeries({
                        id: 'txn_memoryUsage',
                        type: PlotChart.type.exLine
                    });

                    if (record.parentNode.id == 'root') {
                        for (var ix=0; ix<=self.txnMemoryUsageRecord_obj[txn_id].rows.length-1;ix++){
                            var x_val = parseInt(new Date( self.txnMemoryUsageRecord_obj[txn_id].rows[ix][3] ).getTime() ) ;//self.txnMemoryUsageRecord_obj[txn_id].rows[ix][3];
                            var y_val = self.txnMemoryUsageRecord_obj[txn_id].rows[ix][2];

                            chart.addValue(0, [x_val, y_val]) ;
                        };
                    } else {
//                        var childChartData = self.txnMemoryUsageRecord_obj[ txn_id+'child' ];
                        var childChartData = self.txnMemoryUsageRecord_obj[ txn_id ];
                        for(var ix =0; ix < childChartData.length; ix++) {
                            if(record.data.var_Type == childChartData[ix][2] && record.data.var_Type == childChartData[ix][3]) {
                                var cx_val = parseInt(new Date( childChartData[ix][1] ).getTime() ) ;
                                var cy_val = childChartData[ix][6];
                                chart.addValue(0, [cx_val, cy_val]) ;
                            }
                        }
                    }

//                일단 주석으로 막아두고 addValue 로 할 것.
//                chart.addValues({
//                    from: self.datePicker.getFromDateTime(),
//                    to  : self.datePicker.getToDateTime(),
//                    interval: 60000,
//                    time: 3,
//                    data: self.txnMemoryUsageRecord_obj[txn_id].rows,
//                    series: {
//                        txn_memoryUsage: 2
//                    }
//                });

                    chart.render(el);

                    self.txnLeak_Tree.pnlExTree.on('columnresize', function(){
                        chart._chartContainer.setWidth(1);
                    });
                }, 5);
            }
        };

        // 작업 부분.
        // 트리 하나만 보여주면 되니깐
        // fit 으로

        self.workArea_panel = Ext.create('Exem.Panel', {
            layout: 'vbox',
            height: '100%',
            width : '100%'
        });

        //TOP Tree.
        self.txnLeak_Tree = Ext.create('Exem.BaseGrid', {
            layout  : 'fit',
            itemId  : 'toptxnLeak_Tree',
            gridType: Grid.exTree,
            //adjustGrid: true,

            itemdblclick: function(dv, record, item, index, e) {
                self.rowsData = record.data;
                self.onNodeDblClick();
            }

        });
        // 0313 JH // 차트는 edit 모드가 되지 않도록 설정.
        self.txnLeak_Tree.pnlExTree.on('beforeedit', function( editor, e ) {
            // 컬럼 인덱스 = 6
            if(e.colIdx == 6){
                e.cancel = true;
            }
        });

        self.txnLeak_Tree.contextMenu.addItem({
            title : common.Util.TR('Transaction Summary'),
            itemId: 'Transaction_history',
            fn: function() {
//                var record = this.up().record;
                var record = self.txnLeak_Tree.pnlExTree.getSelectionModel().getSelection()[0].data;
                var txnHistory = common.OpenView.open('TxnHistory', {
                    isWindow : false,
                    width    : 1200,
                    height   : 800,
                    fromTime : self.datePicker.getFromDateTime(),
                    toTime   : self.datePicker.getToDateTime(), // 10분 더하기
                    transactionTF: common.Util.cutOffTxnExtName(record['txn_name'])
                });

                setTimeout(function(){
                    txnHistory.retrieve();
                }, 300);
            }

        }, 0);

        self.workArea_panel.add(self.txnLeak_Tree);

        self.txnLeak_Tree.beginAddColumns();
        self.txnLeak_Tree.addColumn('Txn id'                               , 'txn_id'      , 100, Grid.String, false, true, 'treecolumn');
        self.txnLeak_Tree.addColumn(common.Util.CTR('Transaction Name')    , 'txn_name'    , 400, Grid.String, true, false, 'treecolumn');
        self.txnLeak_Tree.addColumn(common.Util.CTR('First Size')          , 'first_size'  , 90,  Grid.Number, true, false);
        self.txnLeak_Tree.addColumn(common.Util.CTR('First Time')          , 'first_time'  , 150, Grid.String, true, false);
        self.txnLeak_Tree.addColumn(common.Util.CTR('Last Size')           , 'last_size'   , 100, Grid.Number, true, false);
        self.txnLeak_Tree.addColumn(common.Util.CTR('Last Time')           , 'last_time'   , 150, Grid.String, true, false);
        self.txnLeak_Tree.addColumn(common.Util.CTR('Gap Size')            , 'gap_size'    , 100, Grid.Number, true, false);
        self.txnLeak_Tree.addColumn(common.Util.CTR('Transaction Memory Usage (KB)'), 'Memory_Usage', 400, Grid.String, true, false);
        self.txnLeak_Tree.addColumn('var_Type'                             , 'var_Type'    , 100, Grid.String, true, true);  // 숨겨진 column

        self.txnLeak_Tree.addRenderer('Memory_Usage', createCellChart) ;

        self.txnLeak_Tree.endAddColumns() ;

        self.workArea.add(self.workArea_panel);


    } ,

    executeSQL: function() {
        var self = this;
        // 리트리브시 플래그 초기화, 다시그린다.
        self.txnIdFlag =  {};
        self.loadingMask.showMask();

        self.txnLeak_Tree.clearNodes();

        var txnLeak_dataset = {};
        txnLeak_dataset.bind = [{
            name  : 'from_time',
            value : Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type  : SQLBindType.STRING
        }, {
            name  : 'to_time',
            value : Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':59',
            type  : SQLBindType.STRING
        }, {
            name  : 'mem_size',
            value : self.size_NumberField.getValue(),
            type  : SQLBindType.FLOAT
        }] ;

        txnLeak_dataset.replace_string = [{
            name: 'was_id',
            value: self.wasList_TextField.getValue()
        }];

        txnLeak_dataset.sql_file = self.sql.txnLeaktree_sql;
        WS.SQLExec(txnLeak_dataset, self.onData, self);

    },

    onDrawtxnLeakTree: function() {
        var self = this;

        self.txnLeak_Tree.beginTreeUpdate() ;

        for (var ix=0; ix<= self.treeData.rows.length -1; ix++) {

            var txn_id = self.treeData.rows[ix][0];
            var first_time = self.treeData.rows[ix][2],
                    last_time = self.treeData.rows[ix][4] ,
                    cut_first_date ,
                    cut_last_date,
                    cut_first_time,
                    cut_last_time ;


            //tree에 데이터를 담기 전에, 데이터를 가지고 차트 데이터 가져오기.
//            self.onGettxnMemoryUsageChart(txn_id);

            //20140303 -> 2014-03-03 으로변경해서 넣기(min)
            cut_first_date = first_time.substring(0, 8) ;
            cut_last_date  = last_time.substring(0, 8) ;
            var y_time = first_time.substring( 0, 4 ) ;
            var m_time = first_time.substring( 4, 6 ) ;
            var d_time = first_time.substring( 6, 8 ) ;

            cut_first_date = y_time + '-' + m_time + '-' + d_time ;
            var y_time = last_time.substring( 0, 4 ) ;
            var m_time = last_time.substring( 4, 6 ) ;
            var d_time = last_time.substring( 6, 8 ) ;
            cut_last_date = y_time + '-' + m_time + '-' + d_time ;

            cut_first_time = first_time.substring( 9, 17 ) ;
            cut_last_time  = last_time.substring( 9, 17 ) ;

            first_time = cut_first_date + ' ' + cut_first_time ;
            last_time  = cut_last_date + ' ' + cut_last_time ;

            //txn_name 이름으로 오브젝트에 담는다.
            self.treeNodes_Obj[self.treeData.rows[ix][1]] = self.txnLeak_Tree.addNode(null, [
                txn_id,
                self.treeData.rows[ix][1],
                self.treeData.rows[ix][3],
                first_time, //self.treeData.rows[ix][2],
                self.treeData.rows[ix][5],
                last_time, //self.treeData.rows[ix][4],
                self.treeData.rows[ix][6], //gap_size
                //adata.rows[ix]
//                self.txnMemoryUsageRecord_obj[txn_id],
                ' ',
                ' '
            ]);
        }
        self.txnLeak_Tree.drawTree();
        self.txnLeak_Tree.endTreeUpdate() ;

        self.loadingMask.hide();

    },

    onGetToptxnId: function(adata){
        var self = this;

        var ADataset = {};
        self.txn_id   = self.rowsData['txn_id'];

        var t_id = '';
        t_id   = self.data.rows[0];

        if ( t_id == '' ) {
            return ;
        }

        //TOP Memory Used 된 놈의 tid 를 가지고 자식 노드들을 뿌려줘야함.
        console.debug(t_id[0]) ;

        ADataset.bind = [{
            name  : 'from_time',
            value : Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type  : SQLBindType.STRING
        }, {
            name  : 'to_time',
            value : Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':59',
            type  : SQLBindType.STRING
        }, {
            name  : 'txn_id',
            value : self.txn_id,
            type  : SQLBindType.STRING
        }, {
            name  : 'tid',
            value : t_id[0],
            type  : SQLBindType.STRING
        }];

        ADataset.sql_file = self.sql.txnLeaktree_child_sql;

        ADataset.replace_string = [{
            name: 'was_id',
            value: self.wasList_TextField.getValue()
        }];
        WS.SQLExec(ADataset, self.onData, self);
    },

    onGettxnMemoryUsageChart: function(txn_id){
        var self = this;

        var txnMemoryUsageData = {} ;

        txnMemoryUsageData.bind = [{
            name : 'from_time',
            value: Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type  : SQLBindType.STRING
        },{
            name : 'to_time',
            value: Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':59',
            type  : SQLBindType.STRING
        },{
            name : 'txn_id',
            value : txn_id,
            type  : SQLBindType.STRING
        }] ;
        txnMemoryUsageData.replace_string = [{
            name : 'was_id',
            value: self.wasList_TextField.getValue()
        }] ;

        txnMemoryUsageData.sql_file = self.sql.txnMemoryUsed_chart_sql;
        WS.SQLExec(txnMemoryUsageData, self.onData, self);

    },

    onDrawTreeChildNode: function( h, adata ){
        var self = this;
        var node = null ;
        var txn_id = self.rowsData['txn_id'] ;
        self.sub_node = null ;

        switch(h.command ){
            case self.sql.txnLeaktree_child_sql:
                self.child_node_list[txn_id] = [] ;
                for (var ix=0; ix<= adata.rows.length-1; ix++) {
//                    self.child_node_list[txn_id] = [] ;
                    if ( adata.rows[ix][0] == 0
                            && ( adata.rows[ix][2] == null )){
                        self.sub_node = self.txnLeak_Tree ;
                    }else{
                        var search_key = adata.rows[ix][2] ;
                        if ( search_key == null )
                            search_key = '' ;
                        self.sub_node = self.txnLeak_Tree.findNode( 'txn_id', search_key ) ;

                        if ( self.sub_node == null )
                            continue ;

                        self.sub_node = self.sub_node ;
                    } ;

                    if ( self.sub_node !== null ){
                        self.child_node_list[txn_id].push( adata.rows[ix] );
//                        self.child_node_list['seq        '].push( [txn_id, adata.rows[ix][1]] ) ;
//                        self.child_node_list['var_name   '].push( [txn_id, adata.rows[ix][3]] ) ;
//                        self.child_node_list['var_type   '].push( [txn_id, adata.rows[ix][4]] ) ;
//                        self.child_node_list['var_lvl    '].push( [txn_id, adata.rows[ix][5]] ) ;
//                        self.child_node_list['static_flag'].push( [txn_id, adata.rows[ix][6]] ) ;
                    } ;
                    /*if((adata.rows[ix][0]=="0") && (adata.rows[ix][2] == null)) {
                     self.txnLeak_Tree.beginTreeUpdate() ;
                     var txn_name = adata.rows[ix][1];
                     var node = self.txnLeak_Tree.findNode('txn_name', self.rowsData['txn_name']);

                     self.treeNodes_Obj[adata.rows[ix][3]] = self.txnLeak_Tree.addNode( node,
                     [   self.rowsData['txn_id'],
                     adata.rows[ix][3],
                     0,
                     self.rowsData['first_time'],
                     0,
                     self.rowsData['last_time'],
                     0,
                     'NULL' ] );
                     //self.treeNodes_Obj[self.rowsData['txn_name']]
                     self.txnLeak_Tree.drawTree();
                     self.txnLeak_Tree.endTreeUpdate() ;

                     console.debug(self.rowsData['txn_name']);

                     } else if(adata.rows[ix][2] != null) {
                     //재귀함수.
                     //skip parent 가 널이 아니면, 자식으로 붙은것들 중에서 다시 부모를 찾는다.
                     //근데 자식으로 붙은 것들은 마찬가지로  adata.rows[ix][0]=="0"겟지?

                     }*/
                } //end for

                if ( self.child_node_list[txn_id].length > 0 )
                    self.get_child_chart( txn_id ) ;
                break ;

            case self.sql.txnLeaktree_child_chart_sql:
                self.first_size = 0 ;
                self.last_size = 0 ;
                self.first_time = null ;
                self.last_time = null ;

                self.txnMemoryUsageRecord_obj[ txn_id ] = (adata.rows);
                //chart data gather..
                for ( var ix = 0; ix < adata.rows.length; ix++ ){
                    var var_name = adata.rows[ix][2] ;
                    var var_type = adata.rows[ix][3] ;
                    var time = adata.rows[ix][1] ;

                    for ( var jx = 0; jx < self.child_node_list[txn_id].length; jx++ ){
//                        var txn_id = self.child_node_list[jx] ;
                        if ( self.treeNodes_Obj[ txn_id ] == null )
                            self.treeNodes_Obj[ txn_id ] = [] ;


                        if ( ( var_name == self.child_node_list[ txn_id ][jx][3] )
                                && ( var_type == self.child_node_list[ txn_id ][jx][4] ) ){
                            self.treeNodes_Obj[ txn_id ].push( [ time, adata.rows[ix][6] ] ) ;


                            if ( self.first_size == 0 )
                                self.first_size = adata.rows[ix][6] ;
                            else
                                self.last_size = adata.rows[ix][6] ;

                            if ( self.first_time == null )
                                self.first_time = adata.rows[ix][1] ;
                            else
                                self.last_time = adata.rows[ix][1] ;

                            if ( self.last_size == 0 )
                                self.last_size = self.first_size ;
                        }
                    } ; //end jx end
                } ;

                //draw child grid
                self.txnLeak_Tree.beginTreeUpdate() ;
                for ( var jx = 0; jx < self.child_node_list[txn_id].length; jx++ ){
//                    var txn_id = self.child_node_list[jx] ;
                    var var_name = self.child_node_list[txn_id][jx][3] ;
                    var var_type = self.child_node_list[txn_id][jx][4] ;
                    var sub_node = self.txnLeak_Tree.findNode( 'txn_id', txn_id ) ;
                    if ( sub_node == null )
                        continue ;

                    /*if ( self.rowsData['first_size'] == 0 )
                     first_size = dt_list['size'][0][6] ;
                     else
                     last_size = dt_list['size'][0][6] ;//self.child_node_list[txn_id][jx][6] ;

                     if ( self.rowsData['first_time'] == '' )
                     first_time = dt_list['time'][jx][1] ;
                     else
                     last_time = dt_list['size'][jx][1] ;//self.treeNodes_Obj[ txn_id ][jx][1] ;

                     if ( self.rowsData['last_size'] == 0 )
                     last_size = self.rowsData['first_size'] ;*/

//                    var gap_size = self.rowsData['last_size'] - self.rowsData['first_size'] ;
                    var gap_size = self.last_size - self.first_size;

                    self.txnLeak_Tree.addNode( sub_node, [ txn_id
                        ,var_name + '[ ' + var_type + ' ]'
                        ,self.first_size
                        ,self.first_time
                        ,self.last_size
                        ,self.last_time
                        ,gap_size
                        ,''
                        ,var_type
                    ]) ;
                }
                self.txnLeak_Tree.drawTree();
                self.txnLeak_Tree.endTreeUpdate() ;
                self.loadingMask.hide();
                break ;
            default:
                break;
        }
    },

    get_child_chart: function( txn_id ){
        var self = this;

        var dt_sub_tree = {} ;
        dt_sub_tree.sql_file = self.sql.txnLeaktree_child_chart_sql ;
        dt_sub_tree.bind = [{
            name : 'from_time',
            value: Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type  : SQLBindType.STRING
        },{
            name : 'to_time',
            value: Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':59',
            type  : SQLBindType.STRING
        },{
            name : 'txn_id',
            value: txn_id,
            type  : SQLBindType.STRING
        }] ;
        dt_sub_tree.replace_string = [{
            name : 'was_id',
            value: self.wasList_TextField.getValue()
        }] ;
        WS.SQLExec( dt_sub_tree, self.onData, self ) ;
    },

    onData: function(aheader, adata) {
        var self = this;

        if(aheader.rows_affected > 0 ){
            switch (aheader.command) {
                case self.sql.txnLeaktree_sql:
                    self.var_id = [];
                    self.txnMem_Store = {};
                    self.data = adata;

                    for(var ix=0; ix<=adata.rows.length-1; ix++){
                        //txn_id로 차트 데이터 를 레코드 오브젝트에 담는다.

                        self.txn_id = adata.rows[ix][0];


                        //tree에 데이터를 담기 전에, 데이터를 가지고 차트 데이터 가져오기.
                        self.onGettxnMemoryUsageChart(self.txn_id);

                    }

                    self.treeData      = adata;
                    self.ChartRowCount = adata.rows.length;

                    //쿼리 결과 값을 가지고 treestore에 넣어줄 값들을 Set 해준다.
                    //self.onSettingTxnLeakStore(adata);

                    //self.onDrawtxnLeakGrid(adata);

                    //데이터가 뿌려졌으니깐. 차트 데이터 뿌리기.
//                    if (adata.rows.length > 0) {
//                        self.onGettxnMemoryUsageChart();
//                    }

                    break;
                case self.sql.topMemoryUsed_sql:
                    self.data = adata;
                    self.onGetToptxnId(adata);


                    break;


                //부모 값
                case self.sql.txnMemoryUsed_chart_sql:
                    self.data = adata ;

                    //차트에 뿌려질 값을 레코드 형으로 만들어 준다.
                    //이 쿼리에서 txn_id는 모두 똑같음. 첫번째꺼만 가져오면 됨.
                    var txn_id = adata.rows[0][0] ;

                    self.txnMemoryUsageRecord_obj[txn_id] = adata ;

                    self.ChartRowCount = self.ChartRowCount - 1;


                    if (self.ChartRowCount == 0){
                        self.onDrawtxnLeakTree();
                    }
                    break;


                //자식의 그리드값 -> 그리지 않는다(min)
                case self.sql.txnLeaktree_child_sql:
                    self.data = adata;
                    self.onDrawTreeChildNode( aheader, adata );
                    break;

                //여기서 그린다.
                case self.sql.txnLeaktree_child_chart_sql:
                    self.onDrawTreeChildNode( aheader, adata ) ;

                    break ;
                default : break;
            }
//            self.loadingMask.hide();
        } else {
            console.debug('no Data.') ;
            self.loadingMask.hide();
        }
    },


    /*
     *  ************************************ 안쓰는거
     */
    onGettxnMemoryUsageRecord: function(adata){
        var self = this;

        for(var ix=0; ix<=adata.rows.length-1; ix++){
            self.txnMemoryUsageRecord = adata.rows[ix];
        }
    },

    onDrawtxnMemoryUsageChart: function(adata){
        var self = this ;

        var mem_store = {};

        for (var ix=0; ix<=adata.rows.length-1; ix++){
            var txn_id = adata.rows[ix][0];

            self.txnLeak_Tree.beginTreeUpdate();

            self.txnLeak_Tree.up;


            self.txnLeak_Tree.drawTree();
            self.txnLeak_Tree.endTreeUpdate() ;
        }

    },
    onNodeDblClick: function() {
        var self = this;
        var ADataset = {};
        var txn_id  = self.rowsData['txn_id'];
        if ((self.txnIdFlag[txn_id] === true)){//&& (self.rowsData.depth > 1)){
//            console.debug('이미 한번 자식을 만들었기 때문에 실행 안함');

        } else {
            self.loadingMask.showMask();
            //node 더블 클릭.클릭된 노드의 txn_id 가지고 TOP Memory Used 된 놈을 찾는다.
            //console.debug(txn_id) ;

            ADataset.sql_file = self.sql.topMemoryUsed_sql;
            ADataset.bind = [{
                name  : 'from_time',
                value : Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
                type  : SQLBindType.STRING
            }, {
                name  : 'to_time',
                value : Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':59',
                type  : SQLBindType.STRING
            }, {
                name  : 'txn_id',
                value : txn_id,
                type  : SQLBindType.STRING
            }] ;

            ADataset.replace_string = [{
                name: 'was_id',
                value: self.wasList_TextField.getValue()
            }];

            WS.SQLExec(ADataset, self.onData, self);

            self.txnIdFlag[txn_id] = true;
        }
    },
    getWasList: function() {
        return $('#'+this.wasList_TextField.getValue());      //getInputId()).data('id');
    },
    ShowMessage: function(title, message, buttonType, icon, comp) {
        Ext.Msg.show({
            title  : title,
            msg    : message,
            buttons: buttonType,
            icon   : icon,
            fn     : function(buttonId) {
                if (buttonId === "ok") {
                    comp.focus();
                }
            }
        });
    }


});