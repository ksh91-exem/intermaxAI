/**
 * Created by min on 14. 7. 2.
 */
Ext.define("view.CallTreeFrame", {
    extend: 'Exem.Container',
    flex  : 1,
    width : '100%',
    height: '100%',
    layout: 'fit',
    style  : {
        borderBottom: '1px solid #ccc'
    },


    constructor: function() {
        this.callParent(arguments);

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this
        });

        this._initLayout();
    },

    _initLayout: function() {
        var self = this ;


        self.pnl_calltree = Ext.create('Exem.Panel',{
            itemId: 'pnl_calltree',
            layout: 'fit',
            flex  : 1 ,
            tbar: [
                {
                    xtype: 'tbspacer',
                    flex: 1
                },{
                    xtype : 'checkbox',
                    boxLabel  : common.Util.TR('Exclude 0% Elapse Time') ,
                    checked   : true,
                    margin    : '0 5 0 0',
                    listeners : {
                        change: function() {
                            self.exclude_change( this.getValue() ) ;
                        }
                    }
            }]
        });




        self.grd_calltree = Ext.create('Exem.BaseGrid', {
            itemId  : 'grd_calltree',
            gridName: 'pa_calltree_gridName',
            gridType: Grid.exTree
        });

        self.grd_calltree.beginAddColumns();
        self.grd_calltree.addColumn( common.Util.TR('LVL'              ), 'lvl'              , 100, Grid.String, false, false ) ;
        self.grd_calltree.addColumn( 'WAS ID'                           , 'was_id'           , 100, Grid.String, false, false ) ;
        self.grd_calltree.addColumn( common.Util.TR('WAS Name'         ), 'was_name'         , 100, Grid.String, false, false ) ;
        self.grd_calltree.addColumn( 'Method ID'                        , 'method_id'        , 100, Grid.String, false, false ) ;
        self.grd_calltree.addColumn( 'CRC'                              , 'crc'              , 100, Grid.String, false, false ) ;
        self.grd_calltree.addColumn( common.Util.TR('Class'            ), 'class_name'       , 100, Grid.String, true, false, 'treecolumn'  ) ;
        self.grd_calltree.addColumn( common.Util.TR('Method'           ), 'method_name'      , 100, Grid.String, true, false ) ;
        self.grd_calltree.addColumn( 'Calling Method ID'                , 'calling_method_id', 100, Grid.String, false, false ) ;
        self.grd_calltree.addColumn( 'Calling CRC'                      , 'calling_crc'      , 100, Grid.String, false, false ) ;
        self.grd_calltree.addColumn( common.Util.TR('Exception Count'  ), 'err_count'        , 100, Grid.Number, true, false ) ;
        self.grd_calltree.addColumn( common.Util.TR('Execution Count'    ), 'exec_count'       , 100, Grid.Number, true, false ) ;
        self.grd_calltree.addColumn( common.Util.TR('Elapse Time'      ), 'elapse_time'      , 100, Grid.Float , true, false ) ;
        self.grd_calltree.addColumn( common.Util.TR('Elapse Time Ratio'     ), 'elapse_ratio'     , 100, Grid.Float , true, false ) ;
        self.grd_calltree.addColumn( common.Util.TR('Method Type'      ), 'method_type'      , 100, Grid.String, true, false ) ;
        self.grd_calltree.addColumn( common.Util.TR('Method SEQ'       ), 'method_seq'       , 100, Grid.String, true, false ) ;
        self.grd_calltree.addColumn( 'level_id'                         , 'level_id'         , 100, Grid.String, true, false ) ;
        self.grd_calltree.addColumn( common.Util.TR('CPU Time'         ), 'cpu_time'         , 100, Grid.Float , true, false ) ;


        var  ratio_render =  function(value){

            return '<div style="position:relative; width:100%; height:13px">' +
                    '<div data-qtip="' + value + '%'+'" style="float:left; background-color:#5898E9;height:100%;width:'+ value +'%;"></div>' +
                    '<div style="position:absolute;width:100%;height:100%;text-align:center;">' + value.toFixed(3) + '%</div>' +
                   '</div>';

        };
        self.grd_calltree.addRenderer('elapse_ratio', ratio_render, RendererType.bar) ;
        self.grd_calltree.endAddColumns();
        self.grd_calltree.loadLayout(self.grd_calltree.gridName);


        self.pnl_calltree.add( self.grd_calltree ) ;
        self.add( self.pnl_calltree ) ;

    } ,



    exclude_change: function( chk_stat ){
        var self = this ;
        chk_stat ? self.ratioFilter(true) : self.ratioFilter(false);
    },

    ratioFilter: function(state){
        var self = this;
        self.grd_calltree.pnlExTree.getRootNode().cascadeBy(function( tree ){
            var node = Ext.fly(this.pnlExTree.getView().getNode(tree));
            if(state){
                if(tree.data.elapse_ratio == 0) {
                    node.el.setVisibilityMode(Ext.Element.DISPLAY);
                    node.el.setVisible(false);
                }
            } else if (!state){
                if(tree.data.id != 'root'){
                    node.el.setVisibilityMode(Ext.Element.DISPLAY);
                    node.el.setVisible(true);
                }
            }
        }.bind(self.grd_calltree));
    },


    _get_date: function(_tid){
        var self = this ;


        WS.StoredProcExec({
            stored_proc: 'rt_call_tree' ,
            bind: [{
                name : 'tid',
                value: _tid
            }]
        }, self.calltree_ondata, self);
    } ,

    /**
     * 웹 소캣 Call Back Function
     * */

    calltree_ondata: function(header, data){
        var self = this ;
        var
//            was_id = '' ,
//            was_name = '',
//            method_seq = 0,
//            niv ,
            method_id = 0,
//            calling_id = 0,
//            first_node = null ,
            p_node = null ,
            node = null ;

        var arr_parent = [] ;


        if(header.rows_affected > 0){
            console.debug('콜트리 데이터-------------------->', data);

            self.grd_calltree.clearNodes() ;
            self.grd_calltree.beginTreeUpdate() ;
            for ( var ix = 0 ; ix < data.rows.length; ix++ ){


                if ( data.rows[ix][ 0] == 1 ){
                    p_node = self.grd_calltree.addNode(  null, [ data.rows[ix][ 0]  //  lvl3
                                                                ,data.rows[ix][ 1]  //  'was_id'
                                                                ,data.rows[ix][ 2]  //  'was_name'
                                                                ,data.rows[ix][ 3]  //  'method_id'
                                                                ,data.rows[ix][ 4]  //  'crc'
                                                                ,data.rows[ix][ 5]  //  'class_name'
                                                                ,data.rows[ix][ 6]  //  'method_name'
                                                                ,data.rows[ix][ 7]  //  'calling_method_id'
                                                                ,data.rows[ix][ 8]  //  'calling_crc'
                                                                ,data.rows[ix][ 9]  //  'err_count'
                                                                ,data.rows[ix][10]  //  'exec_count'
                                                                ,data.rows[ix][11]  //  'elapse_time'
                                                                ,data.rows[ix][12]  //  'elapse_ratio'
                                                                ,common.Util.codeBitToMethodType(data.rows[ix][13])  //  'method_type'
                                                                ,data.rows[ix][14]  //  'method_seq'
                                                                ,data.rows[ix][15]  //  'level_id'
                                                                ,data.rows[ix][16]  //  'cpu_time'
                                                             ]);
                    arr_parent.push( p_node ) ;
                    //niv = data.rows[ix][ 0] ;,
                }else{

                    for ( var jx = 0 ; jx < arr_parent.length; jx++ ){
                        method_id = arr_parent[jx].method_id ;

                        //method_id of parent == calling_method_id of child
                        if ( method_id == data.rows[ix][ 7] ) {
                            p_node = arr_parent[jx] ;
                            break ;
                        }
                    }
                    node = self.grd_calltree.addNode( p_node, [  data.rows[ix][ 0]  //  lvl
                                                                ,data.rows[ix][ 1]  //  'was_id'
                                                                ,data.rows[ix][ 2]  //  'was_name'
                                                                ,data.rows[ix][ 3]  //  'method_id'
                                                                ,data.rows[ix][ 4]  //  'crc'
                                                                ,data.rows[ix][ 5]  //  'class_name'
                                                                ,data.rows[ix][ 6]  //  'method_name'
                                                                ,data.rows[ix][ 7]  //  'calling_method_id'
                                                                ,data.rows[ix][ 8]  //  'calling_crc'
                                                                ,data.rows[ix][ 9]  //  'err_count'
                                                                ,data.rows[ix][10]  //  'exec_count'
                                                                ,data.rows[ix][11]  //  'elapse_time'
                                                                ,data.rows[ix][12]  //  'elapse_ratio'
                                                                ,common.Util.codeBitToMethodType(data.rows[ix][13])  //  'method_type'
                                                                ,data.rows[ix][14]  //  'method_seq'
                                                                ,data.rows[ix][15]  //  'level_id'
                                                                ,data.rows[ix][16]  //  'cpu_time'
                    ]);
                    p_node = node ;
                    node = null ;
                    arr_parent.push( p_node ) ;
                }
            }
            self.grd_calltree.endTreeUpdate() ;
            self.grd_calltree.drawTree() ;
        }
    }


}) ;
