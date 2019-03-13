/**
 * Created by min on 14. 3. 7.
 * Modified by jw on 16.10.13
 * parentView가 Transaction Detail인 경우 tid_bind_sql procedure를 수행하여 조회
 * SQL 수행건수가 N개일경우  SID 정보를 구분하여야 하는데 procedure 수정이 필요함
 * 해당 사항은 협의중이며 SID 까지 적용되어 프로시저가 동작하기 전까지 bind_grid는 setVisible(false)로 처리함
 */
Ext.define('view.FullSQLText_TOP10',{
    extend   : 'Exem.XMWindow',
    layout   : 'border',
    width    : 1000,
    height   : 500,
    minWidth : 500,
    minHeight: 400,
    maxWidth : 1200,
    maxHeight: 800,
    title    : common.Util.TR('Full SQL Text'),
//    modal    : true,
    draggable: false,
    cloable  : true,
    parentView : null,
    callDetailView : false,
    sql      : { bind_top10 : 'IMXPA_TopTransaction_BindTOP10.sql' },
    arr_dt : {
        sql_id   : null ,
        txn_id   : null ,
        was_id   : null ,
        from_time: null ,
        to_time  : null
    },

    sql_text     : '',
    bind_sql_text: '',

//    call_form     : null ,
    loading_grd   : null ,

    mxgParams: null,

    init: function(){
        var self = this ;

        if(self.parentView) {
            if(self.parentView.title == common.Util.TR('Transaction Detail')) {
                self.callDetailView = true;
            }
        }

        var grdTitle = '';
        if(self.callDetailView) {
            grdTitle = common.Util.TR('');
        } else {
            grdTitle = common.Util.TR('Top 10 Bind Value');
        }

        self.loading_grd.loadingMask.show() ; //init 이전에 먼저 show를 해줌
        self.bind_grd = Ext.create('Exem.BaseGrid',{
            itemId  : 'bind_grd',
            //title   : grdTitle,
            region  : 'west',
            width   : '50%',
            height  : '100%',
            usePager: false,
            split   : true,
                itemclick: function(dv, record){
                    self.select_bind(record.data);
            }
        }) ;
        self.bind_grd.beginAddColumns() ;
        self.bind_grd.addColumn( common.Util.TR('Time')             , 'time'       , 130, Grid.DateTime, true, false ) ;
        self.bind_grd.addColumn( common.Util.TR('Bind Value List')  , 'bind_list'  , 300, Grid.String  , true, false ) ;
        self.bind_grd.addColumn( common.Util.TR('Elapse Time')      , 'elapse_time', 55 , Grid.Float   , true, false ) ;
        self.bind_grd.addColumn( 'Hidden Bind'                      , 'hidden_bind', 50 , Grid.String  , false, true ) ;
        self.bind_grd.endAddColumns() ;
        self.bind_grd._columnsList[1].minWidth = 200;
        self.bind_grd._columnsList[1].flex = 1;

        common.WebEnv.setVisibleGridColumn(self.bind_grd, ['bind_list'], Comm.config.login.permission.bind !== 1 ) ;


        self.bind_frm = Ext.create('Exem.SQLEditorBaseFrame',{
            itemId: 'bind_frm',
            region: 'center',
            width : '50%',
            height: '100%',
            useFormatBtn : true,
            mxgParams : this.mxgParams
        }) ;
        self.add([self.bind_grd, self.bind_frm]);


        if(self.callDetailView) {
            self.get_sql_detail(self.arr_dt);
        } else {
            self.get_sql_text(self.arr_dt['sql_id']);
        }
    } ,

    get_sql_detail : function(paramInfo) {
        var self = this;

        // SID 관련하여 tid_bind_sql 프로시저 수정 후 visible false 및 setwidth 문 삭제 필요
        self.bind_grd.setVisible(false);
        self.setWidth(500);

        WS.StoredProcExec({
            stored_proc: 'tid_bind_sql',
            bind: [{
                name: 'tid',
                type: SQLBindType.LONG,
                value: paramInfo['txn_id']
            },{
                name: 'sql_id',
                type: SQLBindType.STRING,
                value: paramInfo['sql_id']
            },{
                name: 'start_time',
                type: SQLBindType.STRING,
                value: paramInfo['start_time']
            },{
                name: 'end_time',
                type: SQLBindType.STRING,
                value: paramInfo['end_time']
            }]
        }, self.onData, self);
    },

    get_sql_text: function( sql_id ){
        var self = this ;

        var dt_sql = {} ;
        dt_sql.sql = 'SELECT  sql_text  FROM   xapm_sql_text   WHERE  sql_id  = :sql_id ';
        dt_sql.bind = [{
            name : 'sql_id',
            type : SQLBindType.STRING,
            value: sql_id
        }] ;
        WS2.SQLExec( dt_sql, self.onData, self ) ;
    } ,

    get_bind_top10: function(){
        var self = this ;

        var dt_bind_text = {} ;
        dt_bind_text.sql_file = self.sql.bind_top10 ;
        dt_bind_text.bind = [{
            name : 'fromtime',
            type : SQLBindType.STRING,
            value: self.arr_dt['from_time']
        },{
            name : 'totime',
            type : SQLBindType.STRING,
            value: self.arr_dt['to_time']
        },{
            name : 'sql_id',
            type : SQLBindType.STRING,
            value: self.arr_dt['sql_id']
        },{
            name : 'txn_id',
            type : SQLBindType.STRING,
            value: self.arr_dt['txn_id']
        }] ;
        dt_bind_text.replace_string = [{
            name : 'was_id',
            value: self.arr_dt['was_id']
        }] ;
        WS.SQLExec( dt_bind_text, self.onData, self ) ;
    },


    onData: function( h, dt ){
        var self = this ;
        var ix;
        if (h.command == self.sql.bind_top10 ) {
            //1. convert bind list
            self.convert_bind(dt.rows);

            //2. draw grid
            //2-1. 바인드가 없는경우에는 sql text만 뿌려준다.
            if (dt.rows.length == 0) {
                self.bind_grd.setVisible(false);
                self.setWidth(500);
                self.bind_frm.getFullSQLText(self.arr_dt['sql_id']);
                /* 두번째 인자값은 bindList */
                self.loading_grd.loadingMask.hide();
                self.show();

                return 0;
            }

            //2-2. 바인드가 있는경우에는 있는대로.
            for (ix = 0; ix < dt.rows.length; ix++) {
                self.bind_grd.addRow([
                      dt.rows[ix][0]
                    , dt.rows[ix][1]
                    , dt.rows[ix][2]
                    , dt.rows[ix][3]
                ]);
            }
            self.bind_grd.drawGrid();
            self.loading_grd.loadingMask.hide();

            //4. show!!!!!!
            self.show();


            //3. first cell click
            self.first_click(self.bind_grd.pnlExGrid, 0);

        } else if(h.command == 'tid_bind_sql') {
            for( ix = 0; ix < dt[1].rows.length; ix ++) {
                self.sql_text      = dt[1].rows[ix][0] ;
                self.bind_sql_text = dt[1].rows[ix][0] ;
            }

            self.convert_bind(dt[0].rows);

            if(dt[0].rows.length == 0) {
                self.bind_grd.setVisible(false);
                self.setWidth(500);
                self.bind_frm.getFullSQLText(self.arr_dt['sql_id']);

                self.loading_grd.loadingMask.hide();
                self. show();

                return 0;
            }

            for (ix = 0; ix < dt[0].rows.length; ix++) {
                self.bind_grd.addRow([
                      dt[0].rows[ix][0]
                    , dt[0].rows[ix][1]
                    , dt[0].rows[ix][3]
                    , dt[0].rows[ix][5]
                ]);
            }
            self.bind_grd.drawGrid();
            self.loading_grd.loadingMask.hide();

            //4. show!!!!!!
            self.show();


            //3. first cell click
            self.first_click(self.bind_grd.pnlExGrid, 0);

        } else {
            for ( ix = 0; ix < dt.rows.length; ix++ ){
                self.sql_text      = dt.rows[ix][0] ;
                self.bind_sql_text = dt.rows[ix][0] ;
            }

            //바인드 top10쿼리호출.
            self.get_bind_top10() ;
        }
    } ,

    convert_bind: function( datarow ){
        var tmp = [];
        if(!((datarow == undefined) || (datarow == null))){
            for ( var ix = 0; ix < datarow.length; ix++ ){
                tmp = common.Util.convertBindList(datarow[ix][1]);
                var resultTmp = [];

                var hiddenIdx = datarow[ix].length;
                datarow[ix][hiddenIdx] = datarow[ix][1];

                for(var jx in tmp){
                    if(tmp.hasOwnProperty(jx)){
                        resultTmp.push(tmp[jx].value);
                    }
                }
                datarow[ix][1] = resultTmp.join(', ');
            }
        }
    } ,

    first_click: function( grd, idx ){
        grd.getView().getSelectionModel().select(idx);
        grd.fireEvent('itemclick', grd, grd.getSelectionModel().getLastSelected());
    } ,

    select_bind: function( dt ){
        var self = this ;

        var bind_str = dt['hidden_bind'];

        self.bind_frm.getFullSQLText(self.arr_dt['sql_id'], bind_str);
    }
}) ;

