/**
 * Created with IntelliJ IDEA.
 * User: Boeun
 * Date: 14. 2. 5
 * Time: 오전 11:11
 * To change this template use File | Settings | File Templates.
 */
Ext.define("view.RecentTop", {
    extend: "Exem.FormPanel",
    //width : 700,
    //height: 800,
    style : {
        background: '#cccccc'
    },
    //isFirstFlag: true,

    sql : {
         TopTxn_sql       : 'IMXPA_RecentTop_TopTxn.sql'
       , TopSQL_sql       : 'IMXPA_RecentTop_TopSQL.sql'
       , TopException_sql : 'IMXPA_RecentTop_TopException.sql'
    },


    init: function(){
        var self = this;

        var TOPTxn_dataset = {};
        var wasList     = Comm.wasIdArr.join();
        var serviceName = Comm.selectedServiceInfo.name;


        self.TopTxnDataArr = [];
        self.TopSQLDataArr = [];
        self.TopExpDataArr = [];

        self.RecentTopWindow = Ext.create('Exem.Window', {
            height: 360,
            width : 530,
            layout: 'fit',
            title : 'Recent Top 10 [' + serviceName + ']',
            style: {
                background: '#cccccc'
            },
            closeAction: 'hide'
        });

        self.RecentTopTabPnl = Ext.create('Exem.TabPanel', {
            layout: 'fit',
            itemId: 'RecentTopTabPnl'

        }) ;


        //WAS ComboBox.
        self.wasComboBox = Ext.create('Exem.ComboBox', {
            fieldLabel: 'WAS',
            store: Comm.wasStoreWithAll,
            itemId: 'wasComboBox',
            x: 500,
            y: 5,
            width: 210,
            margin: '0 3 0 0'
        });
        self.wasComboBox.addListener('change', function(){
            //wasComboBox item Change 이벤트.
            //그리드들을 몽땅 다시 그려준다.        -> Active 한 것만.
            self.onDrawTopTxnGrid();
            self.onDrawTopSQLGrid();
            self.onDrawTopTxnGrid();
        });
        self.RecentTopTabPnl.tabBar.add({ xtype: 'tbfill' }, self.wasComboBox);


        //Top txn.
        self.TopTxn_panel = Ext.create('Exem.Panel', {
            title: 'Top Transaction',
            itemId: 'TopTxn_panel',
            layout: 'fit'
        });

        self.TopTxn_Grid = Ext.create('Exem.BaseGrid', {
            layout:'fit',
            forceFit: true
        });

        self.TopTxn_Grid.beginAddColumns();

        self.TopTxn_Grid.addColumn('WAS'              , 'Was_Name'       , 100, Grid.String, true, false);
        self.TopTxn_Grid.addColumn('Transaction'      , 'TXN_Name'       , 100, Grid.String, true, false);
        self.TopTxn_Grid.addColumn('Elapse Time (AVG)', 'Elapse_Time_AVG', 100, Grid.Float , true, false);
        self.TopTxn_Grid.addColumn('Elapse Time (MAX)', 'Elapse_Time_MAX', 100, Grid.Float , true, false);
        self.TopTxn_Grid.addColumn('Execute Count'    , 'Execute_Count'  , 100, Grid.Number, true, false);

        self.TopTxn_Grid.endAddColumns();

//        self.TopTxn_Grid.PagerVisible(false);

        self.TopTxn_panel.add(self.TopTxn_Grid);
        self.RecentTopTabPnl.add(self.TopTxn_panel);


        //Top SQL.
        self.TopSQL_panel = Ext.create('Exem.Panel', {
            title: 'Top SQL',
            itemId: 'TopSQL_panel',
            layout: 'fit'
        });

        self.TopSQL_Grid = Ext.create('Exem.BaseGrid', {
            layout:'fit',
            forceFit: true
        });

        self.TopSQL_Grid.beginAddColumns();

        self.TopSQL_Grid.addColumn('WAS'              , 'Was_Name'       , 100, Grid.String, true, false);
        self.TopSQL_Grid.addColumn('SQL'              , 'Sql_Text'       , 100, Grid.String, true, false);
        self.TopSQL_Grid.addColumn('Elapse Time (AVG)', 'Elapse_Time_AVG', 100, Grid.Float , true, false);
        self.TopSQL_Grid.addColumn('Elapse Time (MAX)', 'Elapse_Time_MAX', 100, Grid.Float , true, false);
        self.TopSQL_Grid.addColumn('Execute Count'    , 'Execute_Count'  , 100, Grid.Number, true, false);
        self.TopSQL_Grid.addColumn('sql id'           , 'Sql_Id'         , 100, Grid.String, false, false);

        self.TopSQL_Grid.endAddColumns();

        //SQL Full Text
        self.TopSQL_Grid.contextMenu.addItem({
            title : 'SQL Full Text',
            itemId: 'sqlFullText',
            icon  : '',
            target: self,
            fn: function() {
                //
//                var selectRow = self.right_SQLList_Grid.pnlExGrid.getSelectionModel().getSelection()[0].data;

                var targetRow = this.target.TopSQL_Grid.pnlExGrid.getSelectionModel().getSelection()[0].data;

                this.target.rowsData = targetRow;
                this.target.onGridSelectRowSQLText();
            }

        }, 0);

//        self.TopSQL_Grid.PagerVisible(false);
        self.TopSQL_panel.add(self.TopSQL_Grid);
        self.RecentTopTabPnl.add(self.TopSQL_panel);


        //Top Exception.
        self.TopException_panel = Ext.create('Exem.Panel', {
            title: 'Top Exception',
            itemId: 'TopException_panel',
            layout: 'fit'
        });

        self.TopException_Grid = Ext.create('Exem.BaseGrid', {
            layout:'fit',
            forceFit: true
        });

        self.TopException_Grid.beginAddColumns();

        self.TopException_Grid.addColumn('WAS'                 , 'Was_Name'       , 100, Grid.String, true, false);
        self.TopException_Grid.addColumn('Exception Type'      , 'Exception_Type' , 100, Grid.String, true, false);
        self.TopException_Grid.addColumn('Count'               , 'Count'          , 100, Grid.Number, true, false);

        self.TopException_Grid.endAddColumns();

//        self.TopException_Grid.PagerVisible(false);
        self.TopException_panel.add(self.TopException_Grid);
        self.RecentTopTabPnl.add(self.TopException_panel);

        self.RecentTopTabPnl.setActiveTab(0);


        self.showBtn = Ext.create('Exem.Button', {

            text : 'Recent Top 10',
            handler: function() {
                self.RecentTopWindow.show();

                /*
                if(self.isFirstFlag == true) {
                    // 처음엔 사랑이란게~~~~~~~
                    // 처음엔 쿼리로 한번에 뿌려준다.

                    TOPTxn_dataset.replace_string = [{
                        name  : 'was_id',
                        value : wasList
                    }]
                    TOPTxn_dataset.sql_file = self.sql.TopTxn_sql;
                    WS.SQLExec(TOPTxn_dataset, self.onData, self) ;

                    TOPTxn_dataset.sql_file = self.sql.TopSQL_sql;
                    WS.SQLExec(TOPTxn_dataset, self.onData, self) ;

                    TOPTxn_dataset.sql_file = self.sql.TopException_sql;
                    WS.SQLExec(TOPTxn_dataset, self.onData, self) ;
                }

                self.isFirstFlag = true;
                */
                pushWSForOthers.onRecentTopTXN       = function(aheader, adata){
                    self.onData(aheader, adata);
                };
                pushWSForOthers.onRecentTopSQL       = function(aheader, adata){
                    self.onData(aheader, adata);
                };
                pushWSForOthers.onRecentTopException = function(aheader, adata){
                    self.onData(aheader, adata);
                };
            }
        });

        self.RecentTopWindow.add(self.RecentTopTabPnl);
        self.add(self.showBtn);
    },

    addTopTxnData: function(rowData){
        var self = this;
        //var WAS = self.wasComboBox.getValue();

        self.TopTxnDataArr.push([
            rowData[0],     //Was_Name
            rowData[1],     //TXN_Name
            rowData[2],     //Elapse_Time_AVG
            rowData[3],     //Elapse_Time_Max
            rowData[4],     //Execute_Count
            rowData[5]      //TXN_ID
        ]);
    },

    addTopSQLData: function(rowData){
        var self = this;
        //var WAS = self.wasComboBox.getValue();

        self.TopSQLDataArr.push([
            rowData[0],     //Was_Name
            rowData[1],     //Sql_Text
            rowData[2],     //Elapse_Time_Avg
            rowData[3],     //Elapse_Time_Max
            rowData[4],     //Execute_Count
            rowData[5]      //Sql_Id
        ]);
    },

    addTopExceptionData: function(rowData){
        var self = this;
        //var WAS = self.wasComboBox.getValue();

        self.TopExpDataArr.push([
            rowData[0],     //Was_Name
            rowData[1],     //Was_ID
            rowData[2],     //Exception_Type
            rowData[3]      //Count
        ]);
    },


    onDrawTopTxnGrid: function(){
        var self = this;

        var WAS = self.wasComboBox.getDisplayValue();


        console.debug(WAS);

        self.TopTxn_Grid.clearRows();

        for(var ix=0; ix<= self.TopTxnDataArr.length-1; ix++){

            if(WAS == '(All)'){
                self.TopTxn_Grid.addRow(self.TopTxnDataArr[ix]);
            } else {
                if(WAS != self.TopTxnDataArr[ix][0]){
                    continue;
                } else
                    self.TopTxn_Grid.addRow(self.TopTxnDataArr[ix]);
            }

        }
        self.TopTxn_Grid.drawGrid();
    },

    onDrawTopSQLGrid: function(){
        var self = this;

        var WAS = self.wasComboBox.getDisplayValue();

        console.debug(WAS);

        self.TopSQL_Grid.clearRows();

        for(var ix=0; ix<= self.TopSQLDataArr.length-1; ix++){

            if(WAS == '(All)'){
                self.TopSQL_Grid.addRow(self.TopSQLDataArr[ix]);
            } else {
                if(WAS != self.TopSQLDataArr[ix][0]){
                    continue;
                } else
                    self.TopSQL_Grid.addRow(self.TopSQLDataArr[ix]);
            }

        }
        self.TopSQL_Grid.drawGrid();
    },

    onDrawTopExpGrid: function(){
        var self = this;

        var WAS = self.wasComboBox.getDisplayValue();

        console.debug(WAS);

        self.TopException_Grid.clearRows();

        for(var ix=0; ix<= self.TopExpDataArr.length-1; ix++){

            if(WAS == '(All)'){
                self.TopException_Grid.addRow(self.TopExpDataArr[ix]);
            } else {
                if(WAS != self.TopExpDataArr[ix][0]){
                    continue;
                } else
                    self.TopException_Grid.addRow(self.TopExpDataArr[ix]);
            }

        }
        self.TopException_Grid.drawGrid();
    },

    onData: function(aheader, adata){
        var self = this;

        var WAS = self.wasComboBox.getValue();


        if(aheader.rows_affected == 0){
            console.debug('쿼리 데이터가 없어');
        }


        if(aheader.rows_affected > 0 ){
            switch (aheader.command) {
                case 'PKT_CLIENT_RES_RECENT_TOP_TXN' :
                    console.debug('TOP Txn 데이터 들어옴!!!!!!!!!') ;

                    self.TopTxnDataArr.length = 0;

                    for (var ix=0; ix<=adata.rows.length-1; ix++){
                        self.addTopTxnData(adata.rows[ix]);
                    }

                    self.onDrawTopTxnGrid();

                    break;

                case 'PKT_CLIENT_RES_RECENT_TOP_SQL' :
                    console.debug('TOP SQL 데이터 들어옴!!!!!!!!!') ;

                    self.TopSQLDataArr.length = 0;

                    for (var ix=0; ix<=adata.rows.length-1; ix++){
                        self.addTopSQLData(adata.rows[ix]) ;
                    }

                    self.onDrawTopSQLGrid() ;

                    break;

                case 'PKT_CLIENT_RES_RECENT_TOP_EXCEPTION' :
                    console.debug('TOP Exception 데이터 들어옴!!!!!!!!!') ;

                    self.TopExpDataArr.length = 0;

                    for (var ix=0; ix<=adata.rows.length-1; ix++){
                        self.addTopExceptionData(adata.rows[ix]) ;
                    }

                    self.onDrawTopExpGrid() ;

                    break;
                /*
                case self.sql.TopTxn_sql :
                    console.debug('TOP Txn 데이터 들어옴!!!!!!!!!') ;

                    if(adata.rows.length == 0){
                        console.debug('쿼리 데이터가 없어');
                    }

                    self.data = adata;
                    self.TopTxnDataArr.length = 0;

                    for (var ix=0; ix<=adata.rows.length-1; ix++){
                        self.addTopTxnData(adata.rows[ix]);
                    }

                    self.onDrawTopTxnGrid();

                    break;

                case self.sql.TopSQL_sql :
                    console.debug('TOP SQL 데이터 들어옴!!!!!!!!!') ;

                    self.TopSQLDataArr.length = 0;

                    for (var ix=0; ix<=adata.rows.length-1; ix++){
                        self.addTopSQLData(adata.rows[ix]) ;
                    }

                    self.onDrawTopSQLGrid() ;

                    break;

                case self.sql.TopException_sql :
                    console.debug('TOP Exception 데이터 들어옴!!!!!!!!!') ;

                    self.TopExpDataArr.length = 0;

                    for (var ix=0; ix<=adata.rows.length-1; ix++){
                        self.addTopExceptionData(adata.rows[ix]) ;
                    }

                    self.onDrawTopExpGrid() ;

                    break;
                */
                default:
                    break;
            }

        }
    },

    //SQL Full Text 보여주는 폼 띄우기.
    onGridSelectRowSQLText: function(){
        var self = this;

        var sql_id = self.rowsData['sql_id'];

        var sqlStr = '';
        sqlStr = self.rowsData['sql_text'];

        //SQL Full Text 새창으로 띄워주깅
        var winSQLFullText = Ext.create('Exem.FullSQLTextWindow');
        self.winSQLFullText = winSQLFullText;

        self.winSQLFullText.getFullSQLText(sql_id, sqlStr) ;
        self.winSQLFullText.show();
    }
});