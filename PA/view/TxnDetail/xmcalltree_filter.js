XMCallTree = function(arg){
    this.id = null;
    this.name = null;
    this.title = null;
    this.width = null;
    this.height = null;
    this.tabHeight = 30;
    this.elapseFlag = false;
    this.data = null;
    this.imageData = null;
    this.slickData = null;
    this.inherent = null;
    this.target = null;
    this.$target = null;
    this.$imageLayer = $('<div class="call-tree-grid-image"></div>');
    this.$imageLayerWrap = $('<div class="call-tree-grid-image-wrap"></div>').append(this.$imageLayer);
    //this.$layer = $('<div class="call-tree" style="height:100%;width:100%;position:relative;-webkit-box-sizing: border-box;padding-top:30px;"></div>').append(this.$imageLayerWrap);
    //this.$container = $('<div class="call-tree-container"></div>').append(this.$imageLayerWrap);
    this.$tabBar = null;
    this.txn_path = null ;
    this.last_text_mode = null ;
    this.last_exclude = null ;

    var parent = this;

    this.image_layer = Ext.create('Exem.Container',{
        width    : '100%',
        height   : '100%',
        margin   : '0 0 0 5',
        overflowY: 'auto',
        overflowX: 'auto',
        flex     : 1
    });

    this.grid_layer = Ext.create('Exem.Container',{
        width : '100%',
        height: '100%',
        flex  : 1
    });

    this.initArgument = function(arg) {
        for(var key in arg){
            if(this[key] !== undefined){
                this[key] = arg[key];
            }
        }

        if(! this.target && ! this.$target){
            console.debug('Call Tree no target!');
            return;
        }

        this.$target = this.target ? $('#' + this.target) : this.$target;

        this.width = '100%' ;
        this.height = '100%' ;
    };

    this.createData = function(){
        var root = {};

        _.each(this.data, function(idx) {

            var tempArray = Common.fn.splitN(idx[15], '.');
            var tempArray2 = Common.fn.splitN(idx[15], '.');

            tempArray2.pop();

            var target = '_' + tempArray.join('_');
            if(tempArray2.length !== 0) {
                target2 = '_' + tempArray2.join('_');
            } else {
                target2 = null;
            }
            // elapse_ratio 수소점 2자리 반올림
            idx[12] = Common.fn.round(idx[12], 2);

            idx['id'] = target + idx[1];
            idx['parent'] = target2 == null ? null : target2 + idx[1];

        });



        if(this.data[0][1]){
            this.data[0][13] = Common.fn.codeBitToMethodType(this.data[0][13]);

            root[this.data[0][2]] = '.';
            root.class_name =this.data[0][2];
            root.children = [{
                parent : root,
                LVL : this.data[0][0],
                method_id : this.data[0][3],
                class_name : this.data[0][5],
                method_name : this.data[0][6],
                error_count : this.data[0][9],
                exec_count : this.data[0][10],
                elapse_time : this.data[0][11],
                elapse_ratio : this.data[0][12],
                method_type : this.data[0][13],
                method_seq : this.data[0][14],
                level_id : this.data[0][15],
                leaf : true,
                expanded: true,
                imgNode : $(imgNodeCreate(this.data[0]))
            }];
            root.LVL = 0;
            root.parent = null;
            root.expanded = true;
            treeCreate(root.children, this.data, 1);
        }

        // call tree image view create
        function imgNodeCreate(d){
            var result = '',
                token = Common.fn.splitN(d[13], ',');

            result = '<div class="tree-node l_'+ d[0] + '' + (d[12] > 0 ? ' expand' : '') + '" data-id="'+ d[3] /* + '_' + d.method_seq */+'" data-elapse_time="'+ d[11]+'" data-seq="'+ d[14] +'">'
                + '<div class="tree-content">'
                + '<div class="class-name">'+ ((d[9]*1) ? '<span class="error-count">X</span>' : '') + Common.fn.strSlice(d[5] , 25) + '</div>'
                + '<div class="method-name">'+ Common.fn.strSlice(d[6], 30) +'</div>'
                + '<div class="exec-count">'+ d[10] +'<span>executions</span></div>'
                + '<div class="elapse_time">'+ (+d[11]).toFixed(3) +'<span>s</span></div>'
                + '<div class="elapse_ratio"><div class="progress"><div class="progress-bar green" style="width:'+ d[12] +'%"></div></div><div style="width:30%;">'+ Common.fn.zeroToFixed(d[12],2) +'%</div></div>'
                + ((d[9] *1) ? ('<div class="exceptions">'+ d[9] +'<span>exceptions</span></div>') : '')
                + '<div class="method_type">';

            for(var i=0; i < token.length; i++){
                if(token[i]){
                    result += '<span>'+ token[i] +'</span>';
                }
            }
            return result += '</div></div><div class="tree-state blue"><span></span></div></div>';
        }

        function treeCreate(node, data, n){
            if(data[n]){
                if(node.length){
                    for(var i = 0 ; i < node.length; i++){
                        data[n][13] = Common.fn.codeBitToMethodType(data[n][13]);
                        data[n][12] = Math.round(data[n][12]);
                        if(node[i].LVL == data[n][0]){
                            var p = Common.fn.splitN(node[i].parent.level_id, '.')
                                , c = Common.fn.splitN(data[n][15], '.');

                            for(var j = 0 ; j < p.length; j++ ){
                                if(p[j] != c[j]){
                                    continue;
                                }
                            }

                            var tmp = {
                                parent : node[i].parent,
                                LVL : data[n][0],
                                method_id : data[n][3],
                                class_name : data[n][5],
                                method_name : data[n][6],
                                error_count : data[n][9],
                                exec_count : data[n][10],
                                elapse_time : data[n][11],
                                elapse_ratio : data[n][12],
                                method_type : data[n][13],
                                method_seq : data[n][14],
                                level_id : data[n][15],
                                leaf : true,
                                expanded: true,
                                imgNode : $(imgNodeCreate(data[n]))
                            };

                            if(node[i].parent.children){
                                node[i].parent.children.push(tmp);
                            }else{
                                node[i].parent.children = [tmp];
                            }
                            if(data[n][12] > 0){
                                node[i].parent.complex = true;
                            }
                            node[i].parent.leaf = false;
                            return treeCreate(node[i].parent.children, data, n + 1);
                        }else if(node[i].LVL +1 == data[n][0]){
                            var p2 = Common.fn.splitN(node[i].level_id, '.')
                                , c2 = Common.fn.splitN(data[n][15], '.')
                                , agree = true;

                            for(var k = 0 ; k < p2.length; k++){
                                if(p2[k] != c2[k]){
                                    agree = false;
                                    break;
                                }
                            }

                            if(agree){
                                var tmp2 = {
                                    parent : node[i],
                                    LVL : data[n][0],
                                    method_id : data[n][3],
                                    class_name : data[n][5],
                                    method_name : data[n][6],
                                    error_count : data[n][9],
                                    exec_count : data[n][10],
                                    elapse_time : data[n][11],
                                    elapse_ratio : data[n][12],
                                    method_type : data[n][13],
                                    method_seq : data[n][14],
                                    level_id : data[n][15],
                                    leaf : true,
                                    expanded: true,
                                    imgNode : $(imgNodeCreate(data[n]))
                                };
                                if(node[i].children){
                                    node[i].children.push(tmp2);
                                }else{
                                    node[i].children = [tmp2];
                                }
                                node[i].leaf = false;
                                return treeCreate(node[i].children, data, n + 1);
                            }
                        }
                    }
                    treeCreate(node[0].parent.parent.children, data, n);
                }
            }
        }

        this.imageData = root;
    };

    this.createTabBar = function(){

        var self = this ;

        try{
            var chk_pnl = Ext.create('Exem.Container',{
                width : '100%',
                height: 30,
                layout: 'hbox',
                itemId: 'chk_pnl'
            });


            this.filter_off = Ext.create('Exem.Button',{
                text  : common.Util.TR('Filter Off'),
                width : 65,
                height: 17,
                margin: '3 0 0 10',
                show_state: false,
                filter_key: null,
                filter_seq: null ,
                cls   : 'call-tree-filter',
                listeners: {
                    click: function(){
                        this.setVisible(false) ;
                        this.show_state = false ;
                        this.filter_key = null ;
                        this.filter_seq = null ;
                        this.hide() ;


                        parent.$imageLayer.find('.tree-node').find('.tree-state').removeClass().addClass('tree-state blue')
                            .end().find('.progress-bar').removeClass().addClass('progress-bar green');

                        //check 이벤태우기위해 이랬다 저랫다
                        self.check_elapse.setValue(true) ;

                        self.check_elapse.setDisabled(false) ;
                        self.check_elapse.setValue(false) ;
                        //self.check_text.setValue(true) ;
                    }
                }
            });


            //text mode
            this.check_text = Ext.create('Ext.form.field.Checkbox',{
                boxLabel  : common.Util.TR('Text Mode'),
                checked   : true,
                margin    : '0 5 0 0',
                listeners : {
                    change: function() {
                        if(this.getValue()){

                            self.txn_path.last_text_mode = true ;



                            parent.image_layer.hide();
                            parent.grid_layer.show();

                            if ( self.filter_off.show_state ){
                                parent.highLightClear();
                                parent.highLightNode( 'method_id', self.filter_off.filter_key, 'Aquamarine' ) ;
                            }

                        }else{

                            self.txn_path.last_text_mode = false  ;

                            parent.grid_layer.hide();
                            parent.image_layer.show();

                            if ( self.filter_off.show_state ){
                                parent.filtering( self.filter_off.filter_key, self.filter_off.filter_seq );
                            }

                        }

                        self.txn_path.screen_reset() ;
                    }
                }
            });

            //check elapse
            this.check_elapse = Ext.create('Ext.form.field.Checkbox',{
                boxLabel  : common.Util.TR('Exclude 0% Elapse Time'),
                checked   : false,
                margin    : '0 5 0 0',
                listeners : {
                    change: function() {

                        if(this.getValue()){
                            parent.elapseFlag = true;
                        }else{
                            parent.elapseFlag = false;
                        } ;


                        self.$target.loadingMask.show() ;
                        //parent.elapse_filter( parent.elapseFlag ) ;



                        //if ( self.check_text.getValue() ){
                        parent.createCallTreeGrid() ;
                        //}else{
                        parent.createNodeView(parent.imageData.children, 0);
                        //} ;


                    }
                }
            });


            var exclude_btn = Ext.create('Ext.button.Button',{
                text      : common.Util.TR('Exclusions registration'),
                itemId    : 'exclude_btn',
                margin    : '2 5 0 0',
                //disabled  : true ,
                listeners : {
                    click: function() {


                        self.txn_path.click_exclude(self) ;



                    }
                }
            });


            chk_pnl.add( this.filter_off, {xtype: 'tbspacer', width: 10} , this.check_text, this.check_elapse, {xtype: 'tbspacer', width: 20}, exclude_btn ) ;

            this.filter_off.setVisible( false ) ;
            return chk_pnl ;

        }finally{
            chk_pnl = null ;
        }
    };


    this.elapse_filter = function(state){

        this.callTreeGrid.pnlExTree.getStore().clearFilter();
        this.callTreeGrid.pnlExTree.getStore().filterBy(

            function(record, id){

                if ( state ){
                    if ( record.data['elapse_ratio'] == 0 ){
                        return !state ;
                    }else{
                        return state ;
                    }
                }else{
                    return !state ;
                }
            });
    } ;


    this.filtering = function(key, seq){


        this.filter_off.setVisible(true) ;
        this.check_elapse.setDisabled(true) ;
        this.check_elapse.setValue(false) ;
        //this.check_text.setValue(true) ;



        if(key){
            this.$imageLayer.find('[data-id!="'+ key +'"]').children('.tree-state').removeClass('gray blue green').addClass('gray')
                .end().children('.tree-content').find('.progress-bar').removeClass('gray green').addClass('gray');
            this.$imageLayer.find('[data-id="'+ key +'"]').children('.tree-state').removeClass('gray blue green').addClass('green')
                .end().children('.tree-content').find('.progress-bar').removeClass('gray green').addClass('green');

            //this.$target.find('.tree-box[data-id!="'+ key +'"]').children('.tree-row').removeClass('filter');
            //this.$target.find('.tree-box[data-id="'+ key +'"]').children('.tree-row').addClass('filter');
        }

        if(seq){
            this.$imageLayer.find('[data-seq!="'+ seq +'"]').children('.tree-state').removeClass('gray blue green').addClass('gray')
                .end().children('.tree-content').find('.progress-bar').removeClass('gray green').addClass('gray');
            this.$imageLayer.find('[data-seq*="'+ seq +'"]').children('.tree-state').removeClass('gray blue green').addClass('green')
                .end().children('.tree-content').find('.progress-bar').removeClass('gray green').addClass('green');

            //this.$target.find('.tree-box[data-seq!="'+ seq +'"]').children('.tree-row').removeClass('filter');
            //this.$target.find('.tree-box[data-seq*="'+ seq +'"]').children('.tree-row').addClass('filter');
        }

    };

    this.highLightNode = function(dataIndex, str, color) {
        var root = this.callTreeGrid.pnlExTree.getRootNode();
        var view = this.callTreeGrid.pnlExTree.getView();

        this.filter_off.setVisible(true) ;
        this.check_elapse.setDisabled(true) ;
        this.check_elapse.setValue(false) ;


        root.cascadeBy(function(node){
            if ( node.data[dataIndex] == undefined ) {
                return ;
            }
            if (node.data[dataIndex] == str) {
                var record = view.getNode(node);
                record.style.background = color;
                this.callTreeGrid.pnlExTree.getView().focusRow( record );
                return;
            }
        }.bind(this));

        root = null;
        view = null;
    };

    this.highLightClear = function() {
        var view = this.callTreeGrid.pnlExTree.getView();
        var tds = view.getNodes();
        for(var ix = 0; ix < tds.length; ix++) {
            if(tds[ix].style.background != '') {
                tds[ix].style.background = '';
            }
        }
        view = null;
        tds  = null;
    };

    this.createNodeView = function(node, state){
        function createNode(node, state){
            var display = 'block';
            var $parent = null;
            var lineColor = '#000';
            if(node){
                var topIdx = 0, maxVal = 0, height = 0, box_height = 80 , pPos = 0,  cPos = 0, topPos = 38,
                    line = {
                        position: 'absolute',
                        width: '42px',
                        left: '-82px'
                    }, line2 = {
                        position: 'absolute',
                        width: '41px',
                        left: '-41px'
                    };

                for(var i = 0 ; i < node.length; i++){
                    if(node[i].elapse_time > maxVal){
                        maxVal = node[i].elapse_time;
                        topIdx = i;
                    }
                    node[i].pos = i;
                }

                if(node[topIdx].parent.LVL != 0){
                    pPos = node[topIdx].parent.pos;
                    cPos = topIdx;
                    height = Math.abs(pPos - cPos) * box_height;
                    // node line draw
                    if(pPos == cPos){
                        _.extend(line, {
                            height: '0px',
                            top : topPos + 'px',
                            'border-top' : '1px solid ' + lineColor
                        });
                        _.extend(line2, {
                            height: '0px',
                            top : topPos + 'px',
                            'border-top' : '1px solid ' + lineColor
                        });
                    }else if(pPos > cPos){
                        _.extend(line, {
                            height: height,
                            top : topPos + 'px',
                            'border-bottom' : '1px solid ' + lineColor
                        });
                        _.extend(line2, {
                            height: height,
                            top : topPos + 'px',
                            'border-top' : '1px solid ' + lineColor,
                            'border-left' : '1px solid ' + lineColor
                        });
                    }else{
                        _.extend(line, {
                            height: height,
                            top : (height  * -1) + topPos + 'px',
                            'border-top' : '1px solid ' + lineColor
                        });
                        _.extend(line2, {
                            height: height,
                            top :  (height  * -1) + topPos + 'px',
                            'border-bottom' : '1px solid ' + lineColor,
                            'border-left' : '1px solid ' + lineColor
                        });
                    }
                    node[topIdx].imgNode.append($('<div class="call-tree-line"></div>').css(line)).append($('<div class="call-tree-line"></div>').css(line2));
                    $parent = node[topIdx].parent.imgNode;
                }else{
                    $parent = parent.$imageLayer;
                }
                // node positioning
                var childFlag = false;
                var pIdx = 0;
                if(node[topIdx].parent.imgNode){
                    pIdx = node[topIdx].parent.imgNode.data('idx') || 0;
                }

                if(state == 'none'){
                    display = state;
                }

                for(var j = 0 ; j < node.length; j++){
                    if(parent.elapseFlag){
                        if(node[j].elapse_ratio == 0){
                            display = 'none';
                        }else{
                            childFlag = true;
                            display = 'block';
                        }
                    }else{
                        childFlag = true;
                    }
                    node[j].imgNode.data('idx', j);

                    $parent.append(node[j].imgNode.on('click', function(){
                        var $self  = $(this);
                        var findClass = '.tree-node';

                        $self.siblings(findClass).find(findClass).hide();
                        if(parent.elapseFlag){
                            findClass += '.expand';
                        }

                        expand($self.children(findClass).show());

                        function expand($node){
                            if($node.length){
                                var max = 0, tmp = 0, idx =0;
                                for(var i = 0 ; i < $node.length; i++){
                                    tmp = $node.eq(i).data('elapse_time');
                                    if(tmp > max){
                                        max = tmp;
                                        idx = i;
                                    }
                                }
                                $node.children(findClass).hide();
                                expand($node.eq(idx).children(findClass).show());
                            }
                        }

                        return false;
                    }).css({
                        left : node[j].LVL == 1 ? 0 : 300,
                        top :  (j - pIdx) * box_height,
                        display: display
                    }));
                    if(j == topIdx){
                        createNode(node[j].children, display);
                    }else{
                        createNode(node[j].children, 'none');
                    }
                }

                if(childFlag){
                    if(node[0].parent.LVL != 0){
                        node[0].parent.imgNode.children('.tree-state').find('span').show();
                    }
                }else{
                    if(node[0].parent.imgNode){
                        node[0].parent.imgNode.children('.tree-state').find('span').hide();
                    }
                }
            }
        }

        if(this.$imageLayer.children().length){
            this.$imageLayer.children().remove();
        }

        createNode(node, state);

        var startIndex = 0, max_elapse = 0;
        this.$imageLayer.find('.tree-node.l_1').each(function(idx){
            var elapse = $(this).data('elapse_time');
            if(elapse > max_elapse){
                max_elapse = elapse;
                startIndex = idx;
            }
        }).eq(startIndex).click();

        this.$target.loadingMask.hide() ;

    };




    this.createCallTreeGrid = function(){

        if ( this.grid_layer.items.length == 0){



            this.callTreeGrid = Ext.create('Exem.BaseGrid',{
                useArrows: false,
                baseGridCls: 'call-tree-node-style',
                cls        : 'call-tree',
                gridType   : Grid.exTree,
                defaultbufferSize : 2000
            });


            this.callTreeGrid.beginAddColumns();
            this.callTreeGrid.addColumn('lvl'                               , 'lvl'              , 100, Grid.String, false, true  );
            this.callTreeGrid.addColumn('WAS ID'                            , 'was_id'           , 100, Grid.String, false, true  );
            this.callTreeGrid.addColumn('WAS Name'                          , 'was_name'         , 100, Grid.String, false, true  );
            this.callTreeGrid.addColumn('Method ID'                         , 'method_id'        , 100, Grid.String, false, true  );
            this.callTreeGrid.addColumn('CRC'                               , 'crc'              , 100, Grid.String, false, true  );
            this.callTreeGrid.addColumn(common.Util.CTR('Class')            , 'class_name'       , 300, Grid.String, true , false , 'exemtreecolumn');
            this.callTreeGrid.addColumn(common.Util.CTR('Method')           , 'method_name'      , 200, Grid.String, true , false );
            this.callTreeGrid.addColumn('Calling Method ID'                 , 'calling_method_id', 130, Grid.String, false, true  );
            this.callTreeGrid.addColumn('Calling CRC'                       , 'calling_crc'      , 100, Grid.String, false, true  );
            this.callTreeGrid.addColumn(common.Util.CTR('Exception Count'  ) , 'error_count'      , 120, Grid.Number, true , false );
            this.callTreeGrid.addColumn(common.Util.CTR('Execute Count'    ) , 'exec_count'       , 120, Grid.Number, true , false );
            this.callTreeGrid.addColumn(common.Util.CTR('Elapse Time'      ) , 'elapse_time'      , 120, Grid.Float , true , false );
            this.callTreeGrid.addColumn(common.Util.CTR('Elapse Time Ratio') , 'elapse_ratio'     , 130, Grid.Float , true , false );
            this.callTreeGrid.addColumn(common.Util.CTR('Method Type'      ) , 'method_type'      , 100, Grid.String, true , false );
            this.callTreeGrid.addColumn('Method SEQ'                        , 'method_seq'       , 100, Grid.Number, false, false );
            this.callTreeGrid.addColumn('Level ID'                          , 'level_id'         , 100, Grid.String, false, false );
            this.callTreeGrid.addColumn('Host Name'                         , 'host_name'        , 100, Grid.String, false, false );
            this.callTreeGrid.addColumn('TID'                               , 'tid'              , 100, Grid.String, false, false );
            this.callTreeGrid.addColumn(common.Util.TR('CPU Time'         ) , 'cpu_time'         , 120, Grid.Float , false, true  );

            var  ratio_render =  function(value, meta, record){

                return '<div style="position:relative; width:100%; height:13px">' +
                    '<div data-qtip="' + value + '%'+'" style="float:left; background-color:#5898E9;height:100%;width:'+ value +'%;"></div>' +
                    '<div style="position:absolute;width:100%;height:100%;text-align:center;">' + value.toFixed(1) + '%</div>' +
                    '</div>';

            };
            this.callTreeGrid.addRenderer('elapse_ratio', ratio_render, RendererType.bar) ;
            this.callTreeGrid.endAddColumns();


            this.grid_layer.add( this.callTreeGrid ) ;

            this.callTreeGrid.contextMenu.addItem({
                title: common.Util.TR('Class View'),
                target: this.callTreeGrid,
                fn: function(){
                    var index = 0;
                    var className = this.target.pnlExTree.getSelectionModel().getSelection()[0].data.class_name.replace('[] ', '');

                    index = className.indexOf('.');

                    if(index > -1){
                        className = className.substr(0, index) + '.class';
                    }else{
                        className += '.class';
                    }

                    if(className.indexOf('] ') > -1){
                        className = className.substr(className.indexOf('] ') + 2, className.length);
                    }

                    var classView = Ext.create('Exem.ClassView',{
                        wasid : this.target.pnlExTree.getSelectionModel().getSelection()[0].data.was_id,
                        classmethod : className
                    });

                    classView.init();
                }

            }, 0) ;
        }//{ area.children().remove() } ;

        this.create_calltree_data() ;
    };

    this.draw = function(){

        var check_pnl = this.createTabBar() ;
        this.$target.add( check_pnl, this.grid_layer , this.image_layer ) ;

    };


    this.load_active_data = function(){

        $(this.image_layer.el.dom).append(this.$imageLayerWrap);


        if ( Comm.web_env_info['pa_exclude_calltree'] !== undefined ){
            var split_str = '' ;
            var class_name = [] ;
            var method_name = [] ;

            for ( var ix = 0 ; ix < Comm.web_env_info['pa_exclude_calltree'].length; ix++ ){
                split_str = JSON.parse(Comm.web_env_info['pa_exclude_calltree'][ix].split(',')) ;

                if ( split_str[0] !== '' ){
                    class_name.push( split_str[0] ) ;
                } ;

                if ( split_str[1] !== '' ){
                    method_name.push( split_str[1] ) ;
                } ;
            }

            this.class_name = class_name ;
            this.method_name = method_name ;
        } ;
        ix = null ;
        split_str = null ;


        if ( this.txn_path.last_text_mode ){

            parent.check_text.setValue(true) ;
            parent.image_layer.hide();
            parent.grid_layer.show();

        }else{

            parent.check_text.setValue(false) ;
            parent.grid_layer.hide();
            parent.image_layer.show();

        } ;


        this.createNodeView(this.imageData.children, 0);
        this.createCallTreeGrid();
    } ;


    this.create_calltree_data = function(){
        var ix = 0 ;
        var parent_node = null,
            calling_method_id ,
            calling_crc ;
        var exclude_parent_node = null ;


        this.callTreeGrid.clearNodes();

        //console.debug('[DATA]: ' , this.data);

        this.callTreeGrid.beginTreeUpdate();


        for ( ix = 0 ; ix < this.data.length; ix++ ){


            if(parent.elapseFlag){
                if ( !Common.fn.round(this.data[ix][12], 2) ) {
                    continue;
                }
            } ;


            //클래스 & 메소드 조건이 있는경우
            if ( this.class_name !== undefined || this.method_name !== undefined ){

                //최상위는 필터하지않는다.
                if ( ( this.data[ix][7] == '') && ( this.data[ix][8] == 0  ) ) {

                }else{
                    if ( this.confirm_data(this.data[ix]) ){
                        continue ;
                    }
                }



            } ;

            if ( ( this.data[ix][7] == '') && ( this.data[ix][8] == 0  ) ) {


                this._add_call_tree( null, this.data[ix] ) ;

            }else{

                calling_method_id = this.data[ix][7] ;
                calling_crc = this.data[ix][8] ;


                parent_node = this.callTreeGrid.MultifindNode( 'method_id', 'crc', calling_method_id, calling_crc ) ;
                if ( parent_node == null ) {
                     if ( exclude_parent_node == null ) {
                        continue ;
                    }

                    //자식의 class 나 method가 exclude가 아닌경우.
                    parent_node = this._add_call_tree( exclude_parent_node, this.data[ix] ) ;
                }else{

                    //내부모가 널이 아니나 자식이 exclude인경우 재확인하고 넘겨버려야함.
                    if ( this.confirm_data(this.data[ix]) ){
                        continue ;
                    }


                    this._add_call_tree( parent_node, this.data[ix] ) ;

                } ;

            } ;

            exclude_parent_node = parent_node ;


        } //end for

        this.callTreeGrid.endTreeUpdate();
        this.callTreeGrid.drawTree();

        //this.elapse_filter( parent.elapseFlag ) ;

        this.$target.loadingMask.hide() ;

        if ( !this.exclude_form ){
            this.exclude_form = Ext.create('view.TxnDetail.XMCallTreeExclude');
            this.parent       = this ;
            //this.exclude_data = this.data ;
            this.exclude_form.init() ;
        } ;

        //this.exclude_form.exclude_class.setData( this.cbo_data[0] ) ;
        //this.exclude_form.exclude_method.setData( this.cbo_data[1] )
        //this.exclude_form.exclude_class.setSearchField('name');
        //this.exclude_form.exclude_method.setSearchField('name');


        ix = null ;
    } ;


    this.confirm_data = function( _data ){

        try{
            var ix = 0 ;
            var jx;
            var result = false ;
            var all_search_str = '' ;
            var class_mapping = _data[5].toLowerCase() ;
            var method_mapping = _data[6].toLowerCase() ;

            //CLASS
            for ( ix = 0 ; ix < this.class_name.length; ix++ ){

                if ( this.class_name[ix].indexOf('%') > - 1 ){

                    all_search_str = this.class_name[ix].toLowerCase().split('%') ;
                    for (jx = 0 ; jx < all_search_str.length; jx++ ){

                        //%가 들어있는 인덱스는 재끼고.
                        if ( all_search_str[jx] == '' ) {
                            continue;
                        }

                        if ( class_mapping.indexOf(all_search_str[jx]) > -1 ){
                            result = true ;
                            return result ;
                        }

                    }
                    jx = null ;


                }else{
                    if ( this.class_name[ix].toLowerCase() == class_mapping ){
                        result = true ;
                        return result ;
                    }
                }

            }



            //METHOD
            for ( ix = 0 ; ix < this.method_name.length; ix++ ){

                if ( this.method_name.indexOf('%') > - 1 ){

                    all_search_str = this.method_name[ix].toLowerCase().split('%') ;
                    for (jx = 0 ; jx < all_search_str.length; jx++ ){

                        //%가 들어있는 인덱스는 재끼고.
                        if ( all_search_str[jx] == '' ) {
                            continue;
                        }

                        if ( method_mapping.indexOf(all_search_str[jx]) > -1 ){
                            result = true ;
                            return result ;
                        }

                    }
                    jx = null ;

                }else{
                    if ( this.method_name[ix].toLowerCase() == method_mapping ){
                        result = true ;
                        return result ;
                    }
                }

            }
        }finally{
            ix = null ;
            result = null ;
            all_search_str = null ;
        }
    } ;


    this._add_call_tree = function( parent, _data ){

        //this.$target.getComponent('chk_pnl').getComponent('exclude_btn').setDisabled(false) ;

        var parent_node ;

        parent_node = this.callTreeGrid.addNode( parent, [   _data[ 0]  //'lvl'
            ,_data[ 1]                                    //'was_id'
            ,_data[ 2]                                    //'was_name'
            ,_data[ 3]                                    //'method_id'
            ,_data[ 4]                                    //'crc'
            ,_data[ 5]                                    //'class_name'
            ,_data[ 6]                                    //'method_name'
            ,_data[ 7]                                    //'calling_method_id'
            ,_data[ 8]                                    //'calling_crc'
            ,_data[ 9]                                    //'error_count'
            ,_data[10]                                    //'exec_count'
            ,_data[11]                                    //'elapse_time'
            ,Common.fn.round(_data[12], 2)                //'elapse_ratio'
            ,Common.fn.codeBitToMethodType(_data[13])     //'method_type'
            ,_data[14]                                    //'method_seq'
            ,_data[15]                                    //'level_id'
            ,_data[16]                                    //'host_name'
            ,_data[17]                                    //'tid'
            ,_data[18]                                    //'cpu_time'
        ] ) ;

        return parent_node ;

    } ;

    this.calltree_exclude_filter = function(tid, exclude_data){

        var class_name = [] ;
        var method_name = [] ;
        var split_str = '' ;

        for ( var ix = 0 ; ix < exclude_data.length; ix++ ){
            split_str = JSON.parse(exclude_data[ix].split(',')) ;


            if ( split_str[0] !== '' ){
                //if ( exclude_data.length > 1 ){
                //    split_str[0] = '\''+split_str[0]+'\''
                //} ;
                class_name.push( split_str[0] ) ;
            } ;

            if ( split_str[1] !== '' ){
                //if ( exclude_data.length > 1 ){
                //    split_str[1] = '\''+split_str[1]+'\''
                //} ;
                method_name.push( split_str[1] ) ;
            } ;

        }
        //this.class_name  = class_name.substring(0, class_name.length-1) ;
        //this.method_name = method_name.substring(0, method_name.length-1) ;
        this.class_name = class_name ;
        this.method_name = method_name ;


        //this.exclude_condition = ' (p.class_name in ( '+class_name.join(',')+' )          '+
        //                         '  or    p.method_name in  ('+method_name.join(',')+' ) )' ;


        //WS.StoredProcExec({
        //    stored_proc: 'txn_detail_exclude',
        //    bind: [{
        //        name : 'tid',
        //        value: tid
        //    },{
        //        name: 'exclude_condition',
        //        value: this.exclude_condition
        //    }/*,{
        //        name : 'class_name',
        //        value: class_name.join(',')
        //    },{
        //        name : 'method_name',
        //        value: method_name.join(',')
        //    }*/]
        //    //replace_string:[{
        //    //    name: 'exclude_condition',
        //    //    value: this.exclude_condition
        //    //}]
        //}, this.OnCallData, this) ;


        this.create_calltree_data() ;

        class_name = null ;
        method_name = null ;
        split_str = null ;
        ix = null ;

    } ;

    this.OnCallData = function(header, data){

        if ( data.rows.length == 0  ){
            //필터가 없어요. popup??
            return ;
        } ;

        this.data = data.rows ;

        this.create_calltree_data() ;

    };


    this.initArgument(arg);
    this.createData();
    this.draw();

    return this;
};
