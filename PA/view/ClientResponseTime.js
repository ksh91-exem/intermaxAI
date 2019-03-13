/**
 * Created by min on 2015-11-03.
 */
Ext.define("view.ClientResponseTime",{
    extend: "Exem.FormOnCondition",
    width : '100%',
    height: '100%',
    layout: 'vbox',
    style : {
        background: '#cccccc'
    },
    sql   : {
        get_parent: 'IMXPA_ViewResponseTime.sql',
        get_child : 'IMXPA_ViewResponseTime_Child.sql'
    },
    cls   : 'list-condition Exem-FormOnCondition',
    DisplayTime: DisplayTimeMode.HM,
    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        }
    },

    init  : function(){
        this.setWorkAreaLayout('vbox') ;
        this.condition_layout() ;
        this.create_grid() ;

        /**
        //if ( Comm.Lang == 'ko' ){
        //    this.datePicker.mainFromField.setValue('2015-12-01 13:00:00');
        //    this.datePicker.mainToField.setValue('2015-12-01 15:00:00');
        //}else{
        //    this.datePicker.mainFromField.setValue('12/01/2015 13:00:00');
        //    this.datePicker.mainToField.setValue('12/01/2015 15:00:00');
        //} ;
         **/

    },

    executeSQL: function(){


        if ( !this.check_validate() )
            return;
        this.get_data('p', null) ;

    } ,

    check_validate: function(){

        if ( this.client_ip.getRawValue() == common.Util.TR('Client IP') ){
            return true ;
        }

        if ( this.client_ip.getRawValue().split('.').length !== 4 ){
            common.Util.showMessage(common.Util.TR('ERROR'), common.Util.TR('Invalid input'), Ext.Msg.OK, Ext.MessageBox.ERROR, function(){
                return false ;
            });
            return false ;
        }

        return true ;

    },

    create_grid: function(){
        var self = this ;

        var create_time_line = function( value, meta ){
            /**
            //console.log('value', value);
            //console.log('meta', meta);
            //console.log('record', record);
            //console.log('view', view);
             */

            meta.tdCls = meta.tdCls + ' customContentCell';
            return '';


        } ;

        var pnl = Ext.create('Exem.Container',{
            itemId: 'pnl',
            layout : {
                type : 'hbox',
                pack : 'end'
            },
            width : '100%',
            height: 20,
            items : [{
                xtype: 'container',
                width : 12,
                height: 12,
                style: { 'background-color': '#085687' }
            },{
                xtype: 'label',
                text : common.Util.TR('End User Time'),
                margin: '-1 10 0 0'
            },{
                xtype: 'container',
                width : 12,
                height: 12,
                style: { 'background-color': '#90ebb5' }
            },{
                xtype: 'label',
                text : common.Util.TR('Server Time'),
                margin: '-1 10 0 0'
            }]
        }) ;

        this.timeline_grid = Ext.create('Exem.BaseGrid',{
            itemId     : 'timeline_grid',
            gridType   : Grid.exTree,
            adjustGrid : true,
            //flex       : 1,
            useArrows  : true,
            nodeExpend : true,
            defaultbufferSize : 1000,
            baseGridCls: 'time-line-node-style',
            celldblclick: function( thisGrid, td, cellIndex, record ) {
                if ( Number(record.data.tid) !== 0 ){
                    //path jump
                    self.remove_tip() ;
                    self.open_txn_detail( record.data ) ;


                }else{
                    if ( record.data.draw_flag == undefined || !record.data.draw_flag ){

                        self.get_data('c', record.data.uid) ;
                    }else{
                        self.remove_tip() ;
                        return;
                    }
                }

            }
        }) ;

        this.workArea.add( pnl, this.timeline_grid ) ;


        this.timeline_grid.contextMenu.setVisibleItem('expandAllMenuItem', false);
        this.timeline_grid.contextMenu.setVisibleItem('collapseAllMenuItem', false);

        //기존 tree에서 자식이 없는경우 refresh가 발생하지 않아서 timeline div 가 그려지지 않는 문제로 인해
        //tree에서 사용하는 기존 expand/collapse all 기능을 다른 방식으로 적용  2015-12-11 KJH
        this.timeline_grid.contextMenu.addItem({
            title: common.Util.TR('Expand All'),
            itemId: 'NewexpandAllMenuItem',
            icon: '',
            target: this.timeline_grid,
            fn: function() {
                this.expandAll(this.timeline_grid.pnlExTree);
            }.bind(this)
        }, 4);
        this.timeline_grid.contextMenu.addItem({
            title: common.Util.TR('Collapse All'),
            itemId: 'newcollapseAllMenuItem',
            icon: '',
            target: this.timeline_grid,
            fn: function() {
                this.collapseAll(this.timeline_grid.pnlExTree);
            }.bind(this)
        }, 5);


        this.timeline_grid.beginAddColumns() ;
        this.timeline_grid.addColumn( 'Time',                          'time'         , 100, Grid.DateTime, false, false) ;
        this.timeline_grid.addColumn( 'TID' ,                          'tid'          , 100, Grid.Number, false, false) ;
        this.timeline_grid.addColumn( common.Util.TR('View Name'    ), 'view_name'    , 200, Grid.String, true , false, 'treecolumn' ) ;
        this.timeline_grid.addColumn( common.Util.TR('Client IP'    ), 'ip'           , 100, Grid.String, true , false ) ;
        this.timeline_grid.addColumn( common.Util.TR('Service Name' ), 'service_name' , 200, Grid.String, true , false ) ;
        this.timeline_grid.addColumn( common.Util.TR('End User Time'), 'response_time', 80 , Grid.Float , true , false ) ; // 사용자 응답시간
        this.timeline_grid.addColumn( common.Util.TR('Client Time')  , 'client_time'  , 80 , Grid.Float , true , false ) ;
        this.timeline_grid.addColumn( common.Util.TR('Server Time'  ), 'server_time'  , 80 , Grid.Float , true , false ) ;
        this.timeline_grid.addColumn( 'UID' ,                          'uid'          , 100, Grid.String, false, false) ;
        this.timeline_grid.addColumn( common.Util.TR('Start Time'   ), 'start_time'   , 140, Grid.String, true, false ) ;
        this.timeline_grid.addColumn( common.Util.TR('End Time'     ), 'end_time'     , 100, Grid.String, false, false ) ;
        this.timeline_grid.addColumn( 'WAS ID'                       , 'was_id'       , 100, Grid.String, false, false ) ;
        this.timeline_grid.addColumn( 'WAS Name'                     , 'was_name'     , 100, Grid.String, false, false ) ;
        this.timeline_grid.addColumn( 'TXN ID'                       , 'txn_id'       , 100, Grid.String, false, false ) ;
        this.timeline_grid.addColumn( 'TXN Name'                     , 'txn_name'     , 100, Grid.String, false, false ) ;
        this.timeline_grid.addColumn( 'Child Count'                  , 'cht_child'    , 100, Grid.String, false, false ) ;
        this.timeline_grid.addColumn( 'Draw Flag'                    , 'draw_flag'    , 50 , Grid.String, false, false ) ;
        this.timeline_grid.addColumn( common.Util.TR('Time Line'  )  , 'time_line'    , 700, Grid.String, true , false ) ;
        this.timeline_grid.addRenderer( 'time_line', create_time_line );
        this.timeline_grid.endAddColumns() ;

        // 마지막 노드 expand/collapse 인 경우 view refresh가 발생하지 않아서 추가 2015-12-14 KJH
        this.timeline_grid.pnlExTree.getView().on('afteritemexpand', function(record) {
               if (record.data.isLast) {
                    this.timeline_grid.pnlExTree.getView().refresh();
               }
        }.bind(this));

        this.timeline_grid.pnlExTree.getView().on('afteritemcollapse', function(record) {
              if (record.data.isLast) {
                  this.timeline_grid.pnlExTree.getView().refresh();
              }
        }.bind(this));


        this.timeline_grid.pnlExTree.getView().on('refresh', function() {

            var recordIdx, record;

            this.starttime = null ;


            for (recordIdx = 0; recordIdx < this.timeline_grid.pnlExTree.store.getCount(); recordIdx++) {
                record = this.timeline_grid.pnlExTree.store.getAt(recordIdx);

                if ( Number(record.data.tid) == 0 ){
                    this.starttime = record.data.start_time ;
                    var p_start = new Date(this.starttime).setMilliseconds(0) ;
                }

                var grid_row = this.timeline_grid.pnlExTree.view.getNode(record) ;
                if ( grid_row && Ext.get(grid_row).dom.getElementsByClassName('customContentCell')[0] ){
                    var el = Ext.get(grid_row).dom.getElementsByClassName('customContentCell')[0].children ;
                }else{
                    return ;
                }

                // 자식이 있는경우 +이미지 보여주기.
                if (record.data['cht_child'] &&
                    record.data['cht_child'] > 0 &&
                    record.data.depth == 1 &&
                    Ext.get(grid_row).dom.getElementsByClassName(' x-tree-elbow-img')[0] ) {

                    var imageClassNme =  Ext.get(grid_row).dom.getElementsByClassName(' x-tree-elbow-img')[0].className ;
                    Ext.get(grid_row).dom.getElementsByClassName(' x-tree-elbow-img')[0].className = imageClassNme+' hasChild';
                }


                if ( el[0].getElementsByClassName('quick-tip').length > 0 )
                    return ;

                if ( Number(record.data.tid != 0 ) )
                    Ext.get(grid_row).dom.style.background = '#f4ffed' ;

                var parent_start = 0 ;
                var parent_end = (100 * record.data.response_time) / self.top_parent_response || 0;

                if(parent_end < 1 && parent_end > 0){
                    parent_end = 1;
                }

                var child_start = 0 ;
                var child_end = (100 * record.data.server_time) / self.top_parent_response || 0;

                if(child_end < 1 && child_end > 0){
                    child_end = 1;
                }

                if ( Number(record.data.tid) != 0 && this.starttime != null ){
                    console.debug('uid--------------------', record.data.uid);

                    /**
                    //var diff_value = this.stand_value/record.data.response_time;

                    //console.log('---------diff_time--------------------', diff_time);

                    //parent_start = parent_start + diff_value ;
                    //parent_end   = parent_end - diff_value ;

                    //child_start = child_start + diff_value ;
                    //child_end   = child_end - diff_value ;
                     */

                    var set_time = new Date(record.data.start_time).setMilliseconds(0) ;
                    var diff_time = Math.abs( set_time - p_start ) ;
                    var temp_time;

                    if ( diff_time != 0 ){
                        console.debug( '----------------', diff_time );
                        diff_time = ( diff_time / 1000);
                        if(diff_time > 99){
                            diff_time = 99;
                        }
                    }

                    //marginLeft
                    parent_start = parent_start + diff_time ;
                    child_start  = child_start + diff_time ;

                    if(parent_start + parent_end > 100){
                        temp_time = 100 - diff_time;
                        parent_end = temp_time > parent_end ? parent_end : temp_time;
                        child_end = temp_time > parent_end ? parent_end : temp_time;
                    }
                }

                var bg  = document.createElement("div");
                var res = document.createElement("div");
                var ser = document.createElement("div");

                res.setAttribute('class', 'quick-tip') ;
                ser.setAttribute('class', 'quick-tip') ;
                res.setAttribute('data-tab', self.id);
                ser.setAttribute('data-tab', self.id);

                bg.style.width = '100%' ;
                bg.style.height = '100%' ;
                bg.style.marginTop = '-12px' ;

                res.style.width = Math.round(parent_end)+'%' ;
                res.style.height = '10px' ;
                res.style.marginLeft = Math.round(parent_start)+'%';
                res.style.backgroundColor = '#085687' ;
                res.style.zIndex = 1 ;

                ser.style.width = Math.round(child_end)+'%' ;
                ser.style.height = '10px' ;
                ser.style.backgroundColor = '#90ebb5' ;
                ser.style.marginLeft = Math.round(child_start)+'%';
                ser.style.zIndex = 2 ;

                el[0].appendChild( bg ) ;

                bg.appendChild( res ) ;
                bg.appendChild( ser ) ;

                child_start = null ;
                child_end = null ;
                parent_end = null ;
                set_time = null ;
                diff_time = null ;
                bg = null ;
                ser = null ;
                res = null ;

                self.create_tooltip(record) ;
            }
        }.bind(this));
    } ,

    updateTreeView : function(tree, fn) {
        var view = tree.getView();
        view.getStore().loadRecords(fn(tree.getRootNode()));
        view.refresh();
    },

    collapseAll : function(tree) {
        this.updateTreeView(tree, function(root) {
            root.cascadeBy(function(node) {
                if ( (!node.isRoot() || tree.rootVisible) && (node.data.children.length != 0) ) {
                    node.data.expanded = false;
                }
            });
            return tree.rootVisible ? [root] : root.childNodes;
        });
    },

    expandAll : function(tree) {
        this.updateTreeView(tree, function(root) {
            var nodes = [];
            root.cascadeBy(function(node) {
                if (!node.isRoot() || tree.rootVisible) {
                    node.data.expanded = true;
                    nodes.push(node);
                }
            });
            return nodes;
        });
    } ,


    open_txn_detail: function( data ){

        var txn_detail = Ext.create('view.TransactionDetailView',{
            endTime   : data.end_time,
            wasId     : data.was_id,
            name      : data.was_name,
            txnName   : data.txn_name,
            tid       : data.tid,
            startTime : data.start_time,
            elapseTime: data.response_time,
            socket    : WS
        });

        var pop = Ext.create('Exem.XMWindow',{

            layout     : 'fit',
            width      : 1300,
            height     : 785,
            minWidth   : 1000,
            minHeight  : 785,
            title      : common.Util.TR('Transaction Detail'),
            closable   : true,
            maximizable: true

        }) ;
        pop.add( txn_detail ) ;
        pop.show() ;
        txn_detail.init() ;


    },

    create_tooltip: function(record){

        var self = this ;

        //<div class="quick-tip" data-tip="THIS IS THE TIP! change elements 'data-tip' to change." data-tip-on="false">?</div>

        /*
         * 0,1 -> 0
         * 2,3 -> 1
         * 4,5 -> 2
         * 6,7 -> 3
         * .
         * .
         * */

        this.tip = document.createElement("div");
        this.response_name = document.createElement("div");
        this.response_rec  = document.createElement("div");

        if(record.data.server_time){
            this.server_name   = document.createElement("div");
            this.server_rec    = document.createElement("div");
        }

        if ( self.tip.getAttribute('data-tab') == null )
            self.tip.setAttribute('data-tab', self.id);

        var elems_arr = [] ;
        var elems = document.getElementsByClassName('quick-tip') ;
        for(var ix = 0; ix < elems.length; ix++) {
            if ( (elems[ix].getAttribute('data-tab') !== self.id) || (elems[ix].getAttribute('data-tool-tip') !== null) )
                continue ;
            elems[ix].setAttribute('data-tool-tip', true);
            elems_arr.push( elems[ix] ) ;
        }

        for ( ix = 0 ; ix < elems_arr.length; ix++ ){
            elems_arr[ix].addEventListener("mouseover", doTip.bind(record), false);
            elems_arr[ix].addEventListener("mouseout" , doTip.bind(record), true);
        }
        ix = null ;
        elems_arr = null ;


        function doTip(e){
            var elem = e.toElement;
            if ( self.tip.getAttribute('data-tip-on') == null )
                self.tip.setAttribute('data-tip-on', 'false');

            if ( self.tip.getAttribute('data-tab') !== self.id )
                return ;
            if( self.tip.getAttribute('data-tip-on')  === 'false' ) {

                self.tip.setAttribute('data-tip-on', 'true');

                var rect = elem.getBoundingClientRect() ;

                self.tip.innerHTML = elem.getAttribute('data-tip');
                self.tip.style.top = rect.bottom + 10 + 'px';
                self.tip.style.left = (rect.left) + 'px';
                self.tip.style.height = 50 + 'px';
                self.tip.setAttribute('class','tip-box');
                self.response_name.setAttribute('class','tip-title');
                self.response_rec.setAttribute('class','tip-response-rec');
                self.response_name.innerHTML = common.Util.TR('End User Time')+' : ' + this.data.response_time ;

                self.tip.appendChild( self.response_rec ) ;
                self.tip.appendChild( self.response_name ) ;

                if(this.data.server_time){
                    self.server_name.setAttribute('class','tip-title');
                    self.server_rec.setAttribute('class','tip-server-rec');
                    self.server_name.innerHTML   = common.Util.TR('Server Time')+' : ' + this.data.server_time ;
                    self.tip.appendChild( self.server_rec ) ;
                    self.tip.appendChild( self.server_name ) ;

                }
                else{
                    self.tip.style.height = 25 + 'px';
                }

                document.body.appendChild(self.tip);
            } else {

                self.tip.setAttribute('data-tip-on', 'false');
                if ( self.tip.parentNode == undefined ) {
                    self.tip.remove();
                }else{
                    self.tip.parentNode.removeChild(self.tip);
                }
            }
        }


        ix = null ;
        elems = null ;

    } ,


    get_data: function( type, uid ){

        var self = this ;
        this.loadingMask.show() ;


        if ( type == 'p' ){

            var action_value = this.view_name.getValue() ;
            if ( action_value == common.Util.TR('View Name') ){
                action_value = '' ;
            }
            else{
                action_value = 'where view_name like \''+ action_value + '\'' ;
            }

            var ip_value = this.client_ip.getValue() ;
            if ( ip_value == common.Util.TR('Client IP') ){
                ip_value = '' ;
            }
            else{
                if(action_value == ''){
                    ip_value = 'where ip = \''+ ip_value + '\'' ;
                }
                else{
                    ip_value = 'and ip = \''+ ip_value + '\'' ;
                }
            }


            WS.SQLExec({
                sql_file: this.sql.get_parent ,
                bind: [{
                    name : 'from_time',
                    type : SQLBindType.STRING,
                    value: Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00' //common.Util.getDate(this.datePicker.getFromDateTime())
                },{
                    name : 'to_time',
                    type : SQLBindType.STRING,
                    value: Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00' //common.Util.getDate(this.datePicker.getToDateTime())
                }],
                replace_string: [{
                    name : 'condition_where',
                    value: action_value + ip_value
                }]
            }, this.grid_data, this) ;

            //����Ŭ���ع������ ��Ÿ�Ӱɱ�.
            if ( uid != null ){
                setTimeout(function(){
                    self.get_data('c', uid) ;
                }, 500);
            }

        }else{

            //type == c

            WS.SQLExec({
                sql_file: this.sql.get_child ,
                bind: [{
                    name : 'from_time',
                    type : SQLBindType.STRING,
                    value: Ext.util.Format.date(self.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00' //common.Util.getDate(this.datePicker.getFromDateTime())
                },{
                    name : 'to_time',
                    type : SQLBindType.STRING,
                    value: Ext.util.Format.date(self.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00' //common.Util.getDate(this.datePicker.getToDateTime())
                },{
                    name : 'uid',
                    type : SQLBindType.LONG,
                    value: uid
                }]
            }, this.grid_data, this) ;

        }


    } ,


    grid_data: function(header, data){
        var ix;

        this.remove_tip() ;

        var self = this ;
        var flag = false ;

        if(self.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(header, data)){
            this.loadingMask.hide();

            console.debug('ClientResponseTime-grid_data');
            console.debug(header);
            console.debug(data);
            return;
        }

        if ( header.command == this.sql.get_parent ){
            /**
            //if ( this.arr_timeline !== undefined ){
            //    for ( var ix = 0 ; ix < this.arr_timeline[this.id].length; ix++ ){
            //        this.arr_timeline[this.id][ix].destroy() ;
            //    } ;
            //} ;
             **/

            if ( data.rows.length > 0 ){
                this.top_parent_response = data.rows[0][5] ;
                this.top_parent_server   = data.rows[0][7] ;
            }

            this.timeline_grid.clearNodes();
            this.timeline_grid.beginTreeUpdate();

            for ( ix = 0 ; ix < data.rows.length; ix++ ){
                this.timeline_grid.addNode( null, [data.rows[ix][ 0]      //'time'
                    , data.rows[ix][ 1]                                   //'tid'
                    , data.rows[ix][ 2]                                   //'view_name'
                    , data.rows[ix][ 3]                                   //'ip'
                    , data.rows[ix][ 4]                                   //'service_name'
                    , data.rows[ix][ 5]                                   //'response_time'
                    , data.rows[ix][ 6]                                   //'client_time'
                    , data.rows[ix][ 7]                                   //'server_time'
                    , data.rows[ix][ 8]                                   //'uid'
                    , common.Util.getDate(data.rows[ix][ 9])              //'start_time'
                    , data.rows[ix][10]                                   //'end_time'
                    , data.rows[ix][11]                                   //'was_id'
                    , ''                                                  //'was_name'
                    , ''                                                  //'txn_id'
                    , ''                                                  //'txn_name'
                    , data.rows[ix][15]                                   //'cnt_child'
                    , flag                                                //'draw_flag'
                ]) ;
            }
            this.timeline_grid.drawTree() ;
            this.timeline_grid.beginTreeUpdate();

            /**
            //setTimeout(function(){
            //    self.create_tooltip( data ) ;
            //}, 300)
             **/
        }
        else if ( header.command == this.sql.get_child ){
            //child
            flag = true ;
            var parent_node = null ;
            //this.timeline_grid.clearNodes();.
            this.timeline_grid.beginTreeUpdate();

            for ( ix = 0 ; ix < data.rows.length; ix++ ){
                parent_node = this.timeline_grid.findNode('uid', data.rows[ix][8]) ;
                if ( parent_node == null )
                    continue ;

                parent_node.draw_flag = flag ;
                this.timeline_grid.addNode( parent_node, [data.rows[ix][ 0]      //'time'
                    , data.rows[ix][ 1]                                          //'tid'
                    , data.rows[ix][ 2]                                          //'view_name'
                    , data.rows[ix][ 3]                                          //'ip'
                    , data.rows[ix][ 4]                                          //'service_name'
                    , data.rows[ix][ 5]                                          //'response_time'
                    , data.rows[ix][ 6]                                          //'client_time'
                    , data.rows[ix][ 7]                                          //'server_time'
                    , data.rows[ix][ 8]                                          //'uid'
                    , common.Util.getDate(data.rows[ix][ 9])                     //start_time
                    , data.rows[ix][10]                                          //'end_time'
                    , data.rows[ix][11]                                          //'was_id'
                    , data.rows[ix][12]                                          //'was_name'
                    , data.rows[ix][13]                                          //'txn_id'
                    , data.rows[ix][14]                                          //'txn_name'
                    , ''                                                         //'cnt_child'
                    , flag                                                       //'draw_flag'
                ]) ;

            } //end-for

            this.timeline_grid.drawTree() ;
            this.timeline_grid.endTreeUpdate();
        }

        this.loadingMask.hide() ;
        flag = null ;
        ix = null ;
    } ,


    remove_tip: function(){
        if ( this.tip ){
            if ( this.tip.parentNode == undefined ){
                this.tip.remove() ;
            }else {
                this.tip.parentNode.removeChild(this.tip);
            }

        }

    },

    condition_layout: function(){

        this.view_name = Ext.create('Exem.TextField',{
            fieldLabel: '',
            itemId    : 'view_name',
            labelAlign: 'right',
            labelWidth: 90,
            width     : 260,
            allowBank : false,
            value     : common.Util.TR('View Name') ,
            x         : 330,
            y         : 5 ,
            listeners: {
                focus: function () {
                    if ( this.getValue() == '%' || this.getValue() == common.Util.TR('View Name') ){
                        this.setValue('%') ;
                    }

                },
                blur: function() {
                    if ( this.getValue() == '%' ){
                        this.setValue(common.Util.TR('View Name') ) ;
                    }
                }
            }
        }) ;



        this.client_ip = Ext.create('Exem.TextField',{
            fieldLabel: '',
            itemId    : 'client_ip',
            labelAlign: 'right',
            labelWidth: 100,
            width     : 260,
            allowBank : false,
            value     : common.Util.TR('Client IP') ,
            x         : 600,
            y         : 5 ,
            listeners: {
                focus: function () {
                    if ( this.getValue() == '%' || this.getValue() == common.Util.TR('Client IP') ){
                        this.setValue('%') ;
                    }

                },
                blur: function() {
                    if ( this.getValue() == '%' ){
                        this.setValue(common.Util.TR('Client IP') ) ;
                    }
                }
            }
        });


        this.conditionArea.add( [this.view_name, this.client_ip] ) ;
    }
}) ;