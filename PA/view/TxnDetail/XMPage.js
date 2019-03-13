/**
 * Created by min on 2015-01-15.
 */
Ext.define("view.TxnDetail.XMPage",{
    extend: 'Exem.Container',
    layout: 'fit',
    width : '100%',
    height: '100%',

    top_tid    : null ,
    start_time : null ,
    end_time   : null ,
    page_tab   : null ,

    second_time: null ,
    web_id     : null ,
    min_time   : null ,
    min_elapse : null ,
    max_time   : null ,

    cls        : 'txn_detail_page',

    init: function(){
        this._layout() ;
    },

    _layout: function(){


        //메인 컨테이너
        this.main_con = Ext.create('Exem.Container',{
            itemId: 'main_con',
            layout: 'vbox',
            width : '100%'
        }) ;


        //1.메인 컨테이너에 붙을 page elapse정보.
        this.elapse_con = Ext.create('Exem.Container',{
            itemId: 'elapse_con',
            layout: 'hbox',
            height: 50,
            width : '100%',
            padding: 15,
            items : [/*{
                xtype         : 'textfield',
                name          : 'start',
                itemId        : 'start',
                fieldLabel    : 'Start Time',
                labelWidth    : 80,
                labelSeparator: false,
                allowBlank    : false,
                cls           : 'list-condition'
            },{
                xtype         : 'textfield',
                name          : 'end',
                itemId        : 'end',
                fieldLabel    : 'End Time',
                labelWidth    : 80,
                labelSeparator: false,
                allowBlank    : false,
                cls           : 'list-condition'
            },*/{
                xtype         : 'textfield',
                name          : 'elapse',
                itemId        : 'elapse',
                fieldLabel    : 'Page Elapse Time',
                labelWidth    : 120,
                labelSeparator: false,
                allowBlank    : false
            }]
        }) ;


        /*var _createDetailTab = function() {
            var panel = Ext.create('Exem.Form', {
                title : common.Util.TR('Transaction Detail'),
                layout: 'fit',
                closable: true
            });
            var mainTabPanel = Ext.getCmp('viewPort').getComponent('mainTab');
            mainTabPanel.setActiveTab(mainTabPanel.add(panel));

            return panel.id;
        };
        */

        function openTxnDetail(record) {
       /*
       new transactionDetailView({
                target: _createDetailTab(),
                endTime: record.end_time,
                id: record.was_id,
                txnName: record.text,
                tid: record.tid,
                startTime: record.start_time,
                elapseTime : record.txn_elapse,
                gid: null,
                socket: WS
            });
        */


            var txnView = Ext.create('view.TransactionDetailView',{
                startTime  : record.start_time,
                endTime    : record.end_time,
                wasId      : record.was_id,
                tid        : record.tid,
                txnName    : record.text,
                elapseTime : record.txn_elapse,
                gid        : null,
                socket     : WS
            });

            var mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
            mainTab.add(txnView);
            mainTab.setActiveTab(mainTab.items.length - 1);
            txnView.init();

            txnView = null ;
            mainTab = null ;
        }

        //2.메인 컨테이너에 붙을 Grid.
        this.tree = Ext.create('Exem.BaseGrid',{
            itemId  : 'tree',
            layout  : 'fit',
            gridName: 'pa_txn_detail_page_gridName',
            gridType: Grid.exTree ,
            itemdblclick: function( dv, record){
                // function arguments: dv, record, item, index, e
                openTxnDetail( record.data ) ;
            }
        }) ;


        this.tree.addColumn( common.Util.TR('level')      , 'level_id'   , 100, Grid.String  , false, false ) ;
        this.tree.addColumn( common.Util.TR('Start Time') , 'start_time' , 200, Grid.String  , true , false, 'treecolumn' ) ;
        this.tree.addColumn( common.Util.TR('End Time'  ) , 'end_time'   , 200, Grid.String  , false, false ) ;
        this.tree.addColumn( common.Util.TR('WAS ID'    ) , 'was_id'     , 100, Grid.String  , false, false ) ;
        this.tree.addColumn( common.Util.TR('TID')        , 'tid'        , 100, Grid.String  , false, false ) ;
        this.tree.addColumn( common.Util.TR('URL')        , 'text'       , 500, Grid.String  , true , false ) ;
        this.tree.addColumn( common.Util.TR('VALUE')      , 'url1_value' , 200, Grid.String  , true , false ) ;
        this.tree.addColumn( common.Util.TR('Elapse Time'), 'txn_elapse' , 130, Grid.Float   , true , false ) ;




        //jump!!
        /*
        this.tree.contextMenu.addItem({
            title: common.Util.TR( 'Transaction Trend' ),
            itemId: 'trend',
            icon  : '',
            target: this.tree,
            fn   : function(){
                var record = this.up().record;
                openTxnDetail( record ) ;
            }
        }, 0);
        */


        this._get_top_url( this.top_tid );

        this.add( this.main_con ) ;
        this.main_con.add( this.elapse_con, this.tree ) ;
    } ,


    /**
     * 가장 top tid가져오기.
     * @param {} tid
     */
    _get_top_url: function(){
        console.time('## Transaction Detail XMPage - txn_detail_page_top.sql');
        WS.SQLExec({
            sql_file: 'txn_detail_page_top.sql',
            bind    : [
                { name: 'from_time', value: this.end_time, type: SQLBindType.STRING },
                ////{ name: 'to_time'  , value: this.end_time },
                { name: 'tid'      , value: this.top_tid, type: SQLBindType.LONG }
            ]
        }, this.on_url_data, this );
    },

    on_url_data: function( header, data ){
        var ix = 0 ,
                adata = null ;

        switch( header.command ){
            case 'txn_detail_page_top.sql':
                console.timeEnd('## Transaction Detail XMPage - txn_detail_page_top.sql');

                if ( data[0] == undefined ) {
                    return;
                }

                if ( data[0].rows.length == 0 ) {
                    adata = data[1];
                } else {
                    adata = data[0];
                }

                for ( ix = 0 ; ix < adata.rows.length; ix++ ){

                    this.start_time  = adata.rows[ix][0] ;
                    this.top_tid     = adata.rows[ix][1] ;
                    this.web_id      = adata.rows[ix][2] ;
                }

                if ( this.web_id == 0 || adata.rows.length == 0) {
                    console.debug('web id is 0 or there is no data!');
                } else {
                    this._get_second_top_url() ;
                }
                break ;

            case 'txn_detail_page_second_top.sql':
                console.timeEnd('## Transaction Detail XMPage - txn_detail_page_second_top.sql');

                for ( ix = 0 ; ix < data.rows.length; ix++ ) {
                    this.second_time  = data.rows[ix][0] ;
                }
                this._get_url_tree() ;
                break ;

            default:
                break;
        }

        ix = null ;
        data = null ;
    },


    /*
     * 두번째로 실행된 tid의 time알아오기.
     * */
    _get_second_top_url: function(){
        console.time('## Transaction Detail XMPage - txn_detail_page_second_top.sql');
        WS.SQLExec({
            sql_file: 'txn_detail_page_second_top.sql',
            bind    : [
                { name: 'from_time', value: common.Util.getDate(this.start_time), type: SQLBindType.STRING },
                ////{ name: 'to_time'  , value: this.end_time },
                { name: 'web_id'   , value: this.web_id, type: SQLBindType.INTEGER }
            ]
        }, this.on_url_data, this ) ;
    } ,


    /*
     * tree data
     * */
    _get_url_tree: function(){
        WS.SQLExec({
            sql_file: 'txn_detail_page_tree.sql',
            bind    : [  { name: 'from_time', value: common.Util.getDate(this.start_time), type: SQLBindType.STRING }
                ,{ name: 'to_time'  , value: this.second_time, type: SQLBindType.STRING }
                ,{ name: 'web_id'   , value: this.web_id, type: SQLBindType.INTEGER }
                ,{ name: 'tid'      , value: this.top_tid, type: SQLBindType.LONG }]
        }, this.on_tree_data, this ) ;
    } ,


    on_tree_data: function( header, data ){
        if (!window || !this.tree) {
            return;
        }
        var ix = 0 ;
        var node = null ;
        var level = 0 ;
        var parent_node;

        this.max_time = null ;
        this.min_time = null ;
        this.min_elapse = 0 ;
        this.last_elapse = 0 ;


        this.tree.clearNodes() ;
        this.tree.beginTreeUpdate() ;

        if ( data.rows.length > 1 ) {
            this.page_tab.show();
        }
        for ( ix = 0 ; ix < data.rows.length; ix++ ){

            //find min time & elapse
            if ( this.min_time == null || this.min_time > data.rows[ix][1] ){
                this.min_time = data.rows[ix][1];
                this.min_elapse = data.rows[ix][7];
            } ;

            //find parend node
            if ( data.rows[ix][0] == 1 ){
                parent_node = null ;
            }else if ( level == data.rows[ix][0] ){
                ////parent_node = parent_node;
            }else{
                parent_node = node ;
            } ;

            level = data.rows[ix][0] ;

            node = this.tree.addNode( parent_node , [ data.rows[ix][0]   //level_id
                                                    , data.rows[ix][1]   //stime
                                                    , data.rows[ix][2]   //etime
                                                    , data.rows[ix][3]   //was_id
                                                    , data.rows[ix][4]   //tid
                                                    , data.rows[ix][5]   //text
                                                    , data.rows[ix][6]   //url1_value
                                                    , data.rows[ix][7]   //txn_elapse
            ] ) ;

            //max time
            this.max_time = data.rows[ix][1] ;
            this.last_elapse = data.rows[data.rows.length-1][7] ;
        }

        this.tree.drawTree() ;
        this.tree.endTreeUpdate() ;



        this._get_page_elapse() ;
    },


    _get_page_elapse: function(){

        ////var min_start = +new Date( this.min_time ) - (this.min_elapse*1000);

        ////this.elapse_con.getComponent('start').setValue( common.Util.getDate( min_start ) ) ;
        ////this.elapse_con.getComponent('end').setValue( this.max_time ) ;

        //this.elapse_con.getComponent('elapse').setValue(  (+new Date(this.max_time) - min_start) / 1000.0 )
        this.elapse_con.getComponent('elapse').setValue(  (((+new Date(this.max_time) + this.last_elapse) - +new Date(this.min_time))  / 1000.0).toFixed(3) );

    }
}) ;