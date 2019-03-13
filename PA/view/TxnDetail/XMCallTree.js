var XMCallTree = function(arg) {
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
    this.txn_path = null;
    this.last_text_mode = null;
    this.last_exclude = null;
    this.last_check_elapse = null;
    this.tidForDebug = null;

    this.monitorType = !arg.monitorType ? window.rtmMonitorType : arg.monitorType;

    if (this.monitorType === 'TP') {
        this.exclusionEnvKey = 'pa_exclude_tp_calltree';
    } else if (this.monitorType === 'TUX') {
        this.exclusionEnvKey = 'pa_exclude_tux_calltree';
    } else if (this.monitorType === 'CD') {
        this.exclusionEnvKey = 'pa_exclude_cd_calltree';
    } else {
        this.exclusionEnvKey = 'pa_exclude_was_calltree';
    }

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
        var key;
        for (key in arg) {
            if (this[key] !== undefined) {
                this[key] = arg[key];
            }
        }

        if (!this.target && ! this.$target) {
            console.debug('Call Tree no target!');
            return;
        }

        this.$target = this.target ? $('#' + this.target) : this.$target;

        this.width  = '100%';
        this.height = '100%';
    };

    this.imgNodeCreate = function(d) {
        var result = '',
            token = Common.fn.splitN(d[13], ','),
            ix, ixLen, elapseVal, elapseRatio, elapseCode, elapseStyle;

        if (this.monitorType === 'WAS' || this.monitorType === 'WEB') {
            elapseVal = (d[11]).toFixed(3);
            elapseRatio = Common.fn.zeroToFixed(d[12], 2);
            elapseCode = 's';
        } else {
            elapseVal = d[11];
            elapseRatio = d[12].toFixed(1);
            elapseCode = (this.monitorType === 'CD') ? decodeURI('%C2%B5') + 's' : 's';
            elapseStyle = 'style="top: 26px; left: 50px"';
        }

        result = '<div class="tree-node l_' + d[0] + '' + (d[12] > 0 ? ' expand' : '') + '" data-id="' + d[3] /* + '_' + d.method_seq */ + '" data-elapse_time="' + d[11] + '" data-seq="' + d[14] + '">'
            + '<div class="tree-content">'
            + '<div class="class-name">' + ((d[9] * 1) ? '<span class="error-count">X</span>' : '') + Common.fn.strSlice(d[5] , 25) + '</div>'
            + '<div class="method-name">' + Common.fn.strSlice(d[6], 30) + '</div>'
            + '<div class="exec-count">' + d[10] + '<span>executions</span></div>'
            + '<div class="elapse_time">' + elapseVal + '<span>' + elapseCode + '</span></div>'
            + '<div class="elapse_ratio" ' + elapseStyle + '><div class="progress"><div class="progress-bar green" style="width:'+ d[12] +'%"></div></div><div style="width:30%;">'+ elapseRatio +'%</div></div>'
          + ((d[9] *1) ? ('<div class="exceptions">'+ d[9] +'<span>exceptions</span></div>') : '')
          + '<div class="method_type">';

        for (ix = 0, ixLen = token.length; ix < ixLen; ix++) {
            if (token[ix]) {
                result += '<span>' + token[ix] + '</span>';
            }
        }
        result += '</div></div><div class="tree-state blue"><span></span></div></div>';
        return $(result);

    };

    this.MultifindNode = function(node, calling_method_id, calling_crc) {
        var result, ix, ixLen;
        try {
            if (node.children !== undefined) {
                for (ix = 0, ixLen = node.children.length; ix < ixLen; ix++) {
                    if (node.children[ix].method_id == calling_method_id && node.children[ix].crc == calling_crc) {
                        result = node.children[ix];
                        break;
                    } else {
                        if (node.children.length > 0) {
                            result = this.MultifindNode(node.children[ix], calling_method_id, calling_crc);
                            if (result) {
                                break;
                            }
                        }
                    }
                }
            }
            return result;
        } finally {
            ix = null;
        }
    };

    this.createData = function() {

        var root = {}, tmp = {};
        var calling_method_id, calling_crc, parent_node;

        _.each(this.data, function(idx) {
            var self = parent;

            //클래스 & 메소드 조건이 있는경우
            if (self.class_name !== undefined || self.method_name !== undefined) {
                if ((idx[7] != '') || (idx[8] != 0)) {
                    if ( self.confirm_data( idx ) ) {
                        return;
                    }
                }
            }

            var tempArray = Common.fn.splitN(idx[15], '.');
            var tempArray2 = Common.fn.splitN(idx[15], '.');

            tempArray2.pop();

            var target = '_' + tempArray.join('_');
            var target2 = '';
            if (tempArray2.length !== 0) {
                target2 = '_' + tempArray2.join('_');
            } else {
                target2 = null;
            }
            // elapse_ratio 수소점 2자리 반올림
            idx[12] = Common.fn.round(idx[12], 2);

            idx['id'] = target + idx[1];
            idx['parent'] = target2 == null ? null : target2 + idx[1];

            if (self.monitorType === 'CD') {
                idx[13] = Common.fn.codeBitToMethodTypeCD(idx[13]);
                idx[11] = idx[21];
                idx[12] = idx[22];
            } else {
                idx[13] = Common.fn.codeBitToMethodType(idx[13]);
                idx[11] = idx[11];
                idx[12] = idx[12];
            }

            //최상위 부모
            if (idx[7] == '' && idx[8] == 0) {

                root[idx[2]] = '.';
                root.class_name = idx[2];
                root.children = [{
                    parent           : root,
                    LVL              : idx[ 0],
                    method_id        : idx[ 3],
                    crc              : idx[ 4],
                    class_name       : idx[ 5],
                    method_name      : idx[ 6],
                    calling_method_id: idx[ 7],
                    calling_crc      : idx[ 8],
                    error_count      : idx[ 9],
                    exec_count       : idx[10],
                    elapse_time      : idx[11],
                    elapse_ratio     : idx[12],
                    method_type      : idx[13],
                    method_seq       : idx[14],
                    level_id         : idx[15],
                    leaf             : true,
                    expanded         : true,
                    imgNode          : self.imgNodeCreate(idx)
                }];
                root.LVL = 0;
                root.parent = null;
                root.expanded = true;
                //treeCreate(root.children, this.data, 1);
            } else {

                calling_method_id = idx[7];
                calling_crc       = idx[8];
                parent_node       = self.MultifindNode(root, calling_method_id, calling_crc);

                if (parent_node !== undefined) {
                    if (parent_node == null) {
                        tmp = {
                            parent           : root.children,
                            LVL              : idx[ 0],
                            method_id        : idx[ 3],
                            crc              : idx[ 4],
                            class_name       : idx[ 5],
                            method_name      : idx[ 6],
                            calling_method_id: idx[ 7],
                            calling_crc      : idx[ 8],
                            error_count      : idx[ 9],
                            exec_count       : idx[10],
                            elapse_time      : idx[11],
                            elapse_ratio     : idx[12],
                            method_type      : idx[13],
                            method_seq       : idx[14],
                            level_id         : idx[15],
                            leaf             : true,
                            expanded         : true,
                            imgNode          : self.imgNodeCreate(idx)
                        };

                        if (root.children[0].children) {
                            root.children[0].children.push(tmp);
                        } else {
                            root.children[0].children = [tmp];
                        }
                        root.children[0].children.leaf = false;
                    } else {
                        tmp = {
                            parent           : parent_node,
                            LVL              : idx[ 0],
                            method_id        : idx[ 3],
                            crc              : idx[ 4],
                            class_name       : idx[ 5],
                            method_name      : idx[ 6],
                            calling_method_id: idx[ 7],
                            calling_crc      : idx[ 8],
                            error_count      : idx[ 9],
                            exec_count       : idx[10],
                            elapse_time      : idx[11],
                            elapse_ratio     : idx[12],
                            method_type      : idx[13],
                            method_seq       : idx[14],
                            level_id         : idx[15],
                            leaf             : true,
                            expanded         : true,
                            imgNode          : self.imgNodeCreate(idx)
                        };

                        if (parent_node.children) {
                            parent_node.children.push(tmp);
                        } else {
                            parent_node.children = [tmp];
                        }

                        if (idx[12] > 0) {
                            parent_node.children.complex = true;
                        }
                        parent_node.children.leaf = false;
                    }


                    calling_crc       = null;
                    calling_method_id = null;
                    parent_node       = null;

                }
            }

        });

        this.imageData = root;

        //if ( this.confirm_data( this.data[0] )){
        //    return ;
        //} ;




        //if(this.data[0][1]){
        //    this.data[0][13] = Common.fn.codeBitToMethodType(this.data[0][13]);
        //
        //    root[this.data[0][2]] = '.';
        //    root.class_name =this.data[0][2];
        //    root.children = [{
        //        parent : root,
        //        LVL : this.data[0][0],
        //        method_id : this.data[0][3],
        //        class_name : this.data[0][5],
        //        method_name : this.data[0][6],
        //        error_count : this.data[0][9],
        //        exec_count : this.data[0][10],
        //        elapse_time : this.data[0][11],
        //        elapse_ratio : this.data[0][12],
        //        method_type : this.data[0][13],
        //        method_seq : this.data[0][14],
        //        level_id : this.data[0][15],
        //        leaf : true,
        //        expanded: true,
        //        imgNode : $(imgNodeCreate(this.data[0]))
        //    }];
        //    root.LVL = 0;
        //    root.parent = null;
        //    root.expanded = true;
        //    treeCreate(root.children, this.data, 1);
        //}

        // call tree image view create


        /*
       function treeCreate(node, data, n){



            //    if(idx){
            //        if(node.length){
            //            for(var i = 0 ; i < node.length; i++){
            //
            //                if ( parent.confirm_data( idx ) ){
            //                    return ;
            //                } ;
            //
            //
            //                idx[13] = Common.fn.codeBitToMethodType(idx[13]);
            //                idx[12] = Math.round(idx[12]);
            //                if(node[i].LVL == idx[0]){
            //                    var p = Common.fn.splitN(node[i].parent.level_id, '.')
            //                        , c = Common.fn.splitN(idx[15], '.');
            //
            //                    for(var j = 0 ; j < p.length; j++ ){
            //                        if(p[j] != c[j]){
            //                            continue;
            //                        }
            //                    }
            //
            //                    var tmp = {
            //                        parent : node[i].parent,
            //                        LVL : idx[0],
            //                        method_id : idx[3],
            //                        class_name : idx[5],
            //                        method_name : idx[6],
            //                        error_count : idx[9],
            //                        exec_count : idx[10],
            //                        elapse_time : idx[11],
            //                        elapse_ratio : idx[12],
            //                        method_type : idx[13],
            //                        method_seq : idx[14],
            //                        level_id : idx[15],
            //                        leaf : true,
            //                        expanded: true,
            //                        imgNode : $(imgNodeCreate(idx))
            //                    };
            //
            //                    if(node[i].parent.children){
            //                        node[i].parent.children.push(tmp);
            //                    }else{
            //                        node[i].parent.children = [tmp];
            //                    }
            //                    if(idx[12] > 0){
            //                        node[i].parent.complex = true;
            //                    }
            //                    node[i].parent.leaf = false;
            //                    return treeCreate(node[i].parent.children, data, n + 1);
            //                }else if(node[i].LVL +1 == idx[0]){
            //                    var p2 = Common.fn.splitN(node[i].level_id, '.')
            //                        , c2 = Common.fn.splitN(idx[15], '.')
            //                        , agree = true;
            //
            //                    for(var k = 0 ; k < p2.length; k++){
            //                        if(p2[k] != c2[k]){
            //                            agree = false;
            //                            break;
            //                        }
            //                    }
            //
            //                    if(agree){
            //                        var tmp2 = {
            //                            parent : node[i],
            //                            LVL : idx[0],
            //                            method_id : idx[3],
            //                            class_name : idx[5],
            //                            method_name : idx[6],
            //                            error_count : idx[9],
            //                            exec_count : idx[10],
            //                            elapse_time : idx[11],
            //                            elapse_ratio : idx[12],
            //                            method_type : idx[13],
            //                            method_seq : idx[14],
            //                            level_id : idx[15],
            //                            leaf : true,
            //                            expanded: true,
            //                            imgNode : $(imgNodeCreate(idx))
            //                        };
            //                        if(node[i].children){
            //                            node[i].children.push(tmp2);
            //                        }else{
            //                            node[i].children = [tmp2];
            //                        }
            //                        node[i].leaf = false;
            //                        return treeCreate(node[i].children, data, n + 1);
            //                    }
            //                }
            //            }
            //            treeCreate(node[0].parent.parent.children, data, n);
            //        }
            //    }
        }
*/
        //this.imageData = root;
    };

    this.createTabBar = function() {

        var self = this,
            tidLabel, chk_pnl, exclude_btn;

        try {
            chk_pnl = Ext.create('Exem.Container',{
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
                    click: function() {
                        this.setVisible(false);
                        this.show_state = false;
                        this.filter_key = null;
                        this.filter_seq = null;
                        this.hide();

                        parent.$imageLayer.find('.tree-node').find('.tree-state').removeClass().addClass('tree-state blue')
                            .end().find('.progress-bar').removeClass().addClass('progress-bar green');

                        self.highLightClear();

                        //check 이벤태우기위해 이랬다 저랫다
                        //self.check_elapse.setValue(true) ;

                        self.check_elapse.setDisabled(false);
                        //self.check_elapse.setValue(false) ;
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
                        if (this.getValue()) {
                            self.txn_path.last_text_mode = true;

                            parent.image_layer.hide();
                            parent.grid_layer.show();
                            if (self.filter_off.show_state) {
                                if (parent.filter_off.sql_list) {
                                    parent.highLightClear();
                                    parent.highLightNode('method_seq', parent.filter_off.filter_seq, 'Aquamarine');
                                } else {
                                    parent.highLightClear();
                                    parent.highLightNode('method_id', parent.filter_off.filter_key, 'Aquamarine');
                                }
                            }
                        } else {
                            self.txn_path.last_text_mode = false;

                            parent.grid_layer.hide();
                            parent.image_layer.show();
                            if (self.filter_off.show_state) {
                                parent.filtering(self.filter_off.filter_key, self.filter_off.filter_seq);
                            }
                        }

                        self.txn_path.screen_reset(this.monitorType);
                    }
                }
            });

            //check elapse
            this.check_elapse = Ext.create('Ext.form.field.Checkbox', {
                boxLabel  : common.Util.TR('Exclude 0% Elapse Time'),
                checked   : false,
                margin    : '0 5 0 0',
                listeners : {
                    change: function() {
                        if (this.getValue()) {
                            parent.elapseFlag = true;
                            self.txn_path.last_check_elapse = true;
                        } else {
                            parent.elapseFlag = false;
                            self.txn_path.last_check_elapse = false;
                        }

                        self.$target.loadingMask.show();

                        parent.createCallTreeGrid();
                        parent.createNodeView(parent.imageData.children, 0);
                        self.txn_path.screen_reset(this.monitorType);
                    }
                }
            });


            exclude_btn = Ext.create('Ext.button.Button',{
                text      : common.Util.TR('Exclusions registration'),
                itemId    : 'exclude_btn',
                margin    : '2 5 0 0',
                // cls       : 'rtm-btn',
                //disabled  : true ,
                style     : 'width:auto;',
                listeners : {
                    click: function() {
                        self.txn_path.click_exclude(self, self.monitorType, self.id);
                    }
                }
            });

            chk_pnl.add(this.filter_off, {xtype: 'tbspacer', width: 10} , this.check_text, this.check_elapse, {xtype: 'tbspacer', width: 20}, exclude_btn);

            if (this.tidForDebug && common.Menu.useTidForDebugInTxnDetail) {
                tidLabel = Ext.create('Ext.form.Label', {
                    text: this.tidForDebug,
                    flex: 1,
                    cls: 'call-tree-tid-for-debug'
                });

                chk_pnl.add({xtype: 'tbspacer', width: 20}, tidLabel);
            }

            this.filter_off.setVisible(false);
            return chk_pnl;

        } finally {
            chk_pnl = null;
        }
    };


    this.elapse_filter = function(state) {
        this.callTreeGrid.pnlExTree.getStore().clearFilter();
        this.callTreeGrid.pnlExTree.getStore().filterBy(function(record) {
            if (state) {
                if (record.data['elapse_ratio'] == 0) {
                    return !state;
                } else {
                    return state;
                }
            } else {
                return !state;
            }
        });
    };


    this.filtering = function(key, seq) {
        var callTreeDataList, isTextMode,
            imageIndex, dataIndex, filterValue, treeData,
            targetNode, nonTargetNodes,
            ix, ixLen;

        if (!key && !seq) {
            return;
        }

        this.filter_off.setVisible(true);

        this.check_elapse.setDisabled(true);
        this.check_elapse.setValue(false);

        isTextMode = this.check_text.getValue();
        callTreeDataList = this.callTreeGrid.getTreeDataList();

        if (key) {
            dataIndex = 'method_id';
            imageIndex = 'data-id';
            filterValue = key;
        }

        if (seq) {
            dataIndex = 'method_seq';
            imageIndex = 'data-seq';
            filterValue = seq;
        }

        if (isTextMode) {
            for (ix = 1, ixLen = callTreeDataList.length; ix < ixLen; ix++) {
                treeData = callTreeDataList[ix].data[dataIndex];
                if (treeData === filterValue) {
                    this.highLightClear();
                    this.highLightNode(dataIndex, treeData, 'Aquamarine');
                    break;
                }
            }
        } else {
            nonTargetNodes = this.$imageLayer.find('[' + imageIndex + '!=' + filterValue + ']');
            targetNode = this.$imageLayer.find('[' + imageIndex + '=' + filterValue + ']');

            nonTargetNodes.children('.tree-state').removeClass('gray blue green').addClass('gray');
            nonTargetNodes.children('.tree-content').find('.progress-bar').removeClass('gray green').addClass('gray');

            targetNode.children('.tree-state').removeClass('gray blue green').addClass('green');
            targetNode.children('.tree-content').find('.progress-bar').removeClass('gray green').addClass('green');

            targetNode.parent()[0].click();
            targetNode[0].click();
        }
    };

    this.highLightNode = function(dataIndex, str) {

        this.filter_off.setVisible(true);
        this.check_elapse.setDisabled(true);
        this.check_elapse.setValue(false);

        var root = this.callTreeGrid.pnlExTree.getRootNode();
        var view = this.callTreeGrid.pnlExTree.getView();
        var record;

        root.cascadeBy(function(node) {
            if (node.data[dataIndex] == undefined) {
                return;
            }
            if (node.data[dataIndex] == str) {
                record = view.getNode(node);
                if (record) {
                    record.className += ' highlight';
                    view.focusRow( record );
                }
            }
        }.bind(this));

        root = null;
        view = null;
    };

    this.highLightClear = function() {
        var view = this.callTreeGrid.pnlExTree.getView(),
            tds = view.getNodes(),
            ix, ixLen;
        for (ix = 0, ixLen = tds.length; ix < ixLen; ix++) {
            if (tds[ix].className.indexOf('highlight') != -1) {
                tds[ix].className = tds[ix].className.replace(/ highlight/gi, '');
            }
        }
        view = null;
        tds  = null;
    };

    this.createNodeView = function(node, state) {

        function createNode(node, state) {
            var display = 'block',
                $parent = null, lineColor = '#000';

            var topIdx = 0, maxVal = 0, height = 0, box_height = 80 , pPos = 0,  cPos = 0, topPos = 38,
                line, line2, ix, ixLen, jx, jxLen;

            var childFlag = false,
                pIdx = 0;

            if (node) {
                line = {
                    position: 'absolute',
                    width: '42px',
                    left: '-82px'
                }, line2 = {
                    position: 'absolute',
                    width: '41px',
                    left: '-41px'
                };

                for (ix = 0, ixLen = node.length; ix < ixLen; ix++) {
                    if (node[ix].elapse_time > maxVal) {
                        maxVal = node[ix].elapse_time;
                        topIdx = ix;
                    }
                    node[ix].pos = ix;
                }

                if (node[topIdx].parent.LVL != 0) {
                    pPos = node[topIdx].parent.pos;
                    cPos = topIdx;
                    height = Math.abs(pPos - cPos) * box_height;
                    // node line draw
                    if (pPos == cPos) {
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
                    } else if (pPos > cPos) {
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
                    } else {
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
                } else {
                    $parent = parent.$imageLayer;
                }

                // node positioning
                if (node[topIdx].parent.imgNode) {
                    pIdx = node[topIdx].parent.imgNode.data('idx') || 0;
                }

                if (state == 'none') {
                    display = state;
                }

                for (jx = 0, jxLen = node.length; jx < jxLen; jx++) {

                    if (parent.elapseFlag) {
                        if (node[jx].elapse_ratio == 0) {
                            display = 'none';
                        } else {
                            childFlag = true;
                            display = 'block';
                        }
                    } else {
                        childFlag = true;
                    }
                    node[jx].imgNode.data('idx', jx);

                    $parent.append(node[jx].imgNode.on('click', function(event) {
                        event.stopPropagation();

                        var $self  = $(this);
                        var findClass = '.tree-node';

                        $self.siblings(findClass).find(findClass).hide();
                        if (parent.elapseFlag) {
                            findClass += '.expand';
                        }

                        expand($self.children(findClass).show());

                        function expand($node) {
                            var max = 0, tmp = 0, idx = 0,
                                ix;

                            if ($node.length) {
                                for (ix = 0; ix < $node.length; ix++) {
                                    tmp = $node.eq(ix).data('elapse_time');
                                    if (tmp > max) {
                                        max = tmp;
                                        idx = ix;
                                    }
                                }
                                $node.children(findClass).hide();
                                expand($node.eq(idx).children(findClass).show());
                            }
                        }

                        return false;
                    }).css({
                        left : node[jx].LVL == 1 ? 0 : 300,
                        top :  (jx - pIdx) * box_height,
                        display: display
                    }));


                    if (jx == topIdx) {
                        createNode(node[jx].children, display);
                    } else {
                        createNode(node[jx].children, 'none');
                    }
                }

                if (childFlag) {
                    if (node[0].parent.LVL != 0) {
                        node[0].parent.imgNode.children('.tree-state').find('span').show();
                    }
                } else {
                    if (node[0].parent.imgNode) {
                        node[0].parent.imgNode.children('.tree-state').find('span').hide();
                    }
                }
            }
        }

        if (this.$imageLayer.children().length) {
            this.$imageLayer.children().remove();
        }

        createNode(node, state);

        var startIndex = 0, max_elapse = 0;
        this.$imageLayer.find('.tree-node.l_1').each(function(idx) {
            var elapse = $(this).data('elapse_time');
            if (elapse > max_elapse) {
                max_elapse = elapse;
                startIndex = idx;
            }
        }).eq(startIndex).click();

        this.$target.loadingMask.hide();

    };


    this.createCallTreeGrid = function() {
        var self = this,
            elapseTime = this.monitorType === 'CD' ? common.Util.CTR('Elapsed Time') + ' (' + decodeURI('%C2%B5') + 's)' : common.Util.CTR('Elapse Time'),
            elapseGridType = this.monitorType === 'CD' ? Grid.Number : Grid.Float,
            ratio_render;

        if (this.grid_layer.items.length == 0) {

            this.callTreeGrid = Ext.create('Exem.BaseGrid', {
                useArrows   : false,
                baseGridCls : 'baseGridRTM call-tree-node-style',
                cls         : 'call-tree',
                gridType    : Grid.exTree,
                defaultbufferSize : 2000,
                useEmptyText: !self.data.length,
                emptyTextMsg: common.Util.TR('No data to display')
            });

            this.callTreeGrid.beginAddColumns();
            this.callTreeGrid.addColumn('lvl'                               , 'lvl'              , 100, Grid.String, false, false  );
            this.callTreeGrid.addColumn('WAS ID'                            , 'was_id'           , 100, Grid.String, false, true  );
            this.callTreeGrid.addColumn('WAS Name'                          , 'was_name'         , 100, Grid.String, false, true  );
            this.callTreeGrid.addColumn('Method ID'                         , 'method_id'        , 100, Grid.String, false, true  );
            this.callTreeGrid.addColumn('CRC'                               , 'crc'              , 100, Grid.String, false, true  );

            if (this.monitorType === 'WAS' || this.monitorType === 'WEB') {
                this.callTreeGrid.addColumn(common.Util.CTR('Class' ), 'class_name' , 300, Grid.String, true , false , 'exemtreecolumn');
                this.callTreeGrid.addColumn(common.Util.CTR('Method'), 'method_name', 200, Grid.String, true , false );
            } else {
                this.callTreeGrid.addColumn(common.Util.CTR('Class'), 'class_name' , 300, Grid.String, false , true );
                this.callTreeGrid.addColumn(common.Util.CTR('Trace'), 'method_name', 200, Grid.String, true , false, 'exemtreecolumn');
            }

            this.callTreeGrid.addColumn('Calling Method ID'                 , 'calling_method_id', 130, Grid.String, false, true  );
            this.callTreeGrid.addColumn('Calling CRC'                       , 'calling_crc'      , 100, Grid.String, false, true  );
            this.callTreeGrid.addColumn(common.Util.CTR('Exception Count'  ), 'error_count'      , 120, Grid.Number, true , false );
            this.callTreeGrid.addColumn(common.Util.CTR('Execute Count'    ), 'exec_count'       , 120, Grid.Number, true , false );
            this.callTreeGrid.addColumn(elapseTime                          , 'elapse_time'      , 120, elapseGridType , true , false );
            this.callTreeGrid.addColumn(common.Util.CTR('Elapse Time Ratio'), 'elapse_ratio'     , 130, Grid.Float , true , false );
            this.callTreeGrid.addColumn(common.Util.CTR('Method Type'      ), 'method_type'      , 100, Grid.String, true , false );
            this.callTreeGrid.addColumn('Method SEQ'                        , 'method_seq'       , 100, Grid.Number, false, false );
            this.callTreeGrid.addColumn('Level ID'                          , 'level_id'         , 100, Grid.String, false, false );
            this.callTreeGrid.addColumn('Host Name'                         , 'host_name'        , 100, Grid.String, false, false );
            this.callTreeGrid.addColumn('TID'                               , 'tid'              , 100, Grid.String, false, false );
            this.callTreeGrid.addColumn(common.Util.TR('CPU Time'         ) , 'cpu_time'         , 120, Grid.Float , false, true  );

            ratio_render =  function(value) {

                return '<div style="position:relative; width:100%; height:13px">' +
                    '<div data-qtip="' + value + '%' + '" style="float:left; background-color:#5898E9;height:100%;width:' + value + '%;"></div>' +
                    '<div style="position:absolute;width:100%;height:100%;text-align:center;">' + value.toFixed(1) + '%</div>' +
                    '</div>';

            };
            this.callTreeGrid.addRenderer('elapse_ratio', ratio_render, RendererType.bar);
            this.callTreeGrid.endAddColumns();


            this.grid_layer.add(this.callTreeGrid);

            if (this.monitorType !== 'CD') {
                this.callTreeGrid.contextMenu.addItem({
                    title: common.Util.TR('Class View'),
                    target: this.callTreeGrid,
                    fn: function() {
                        var index = 0;
                        var className = this.target.pnlExTree.getSelectionModel().getSelection()[0].data.class_name.replace('[] ', '');

                        index = className.indexOf('.');

                        if (index > -1) {
                            className = className.substr(0, index) + '.class';
                        } else {
                            className += '.class';
                        }

                        if (className.indexOf('] ') > -1) {
                            className = className.substr(className.indexOf('] ') + 2, className.length);
                        }

                        var classView = Ext.create('Exem.ClassView',{
                            wasid       : this.target.pnlExTree.getSelectionModel().getSelection()[0].data.was_id,
                            classmethod : className
                        });

                        classView.init();
                    }

                }, 0);
            }

            if (this.monitorType == 'WAS') {
                self.callTreeGrid.addEventListener('cellcontextmenu', function(me, td, cellIndex, record) {
                    var dataRows = record.data;
                    self.callTreeGrid.contextMenu.setDisableItem(0, false);

                    if (!Comm.wasInfoObj[dataRows['was_id']] || !Comm.wasInfoObj[dataRows['was_id']].isDotNet) {
                        self.callTreeGrid.contextMenu.setDisableItem(0, true);
                    }
                });
            }

        }

        if (this.monitorType == 'TP' || this.monitorType == 'TUX') {
            this.callTreeGrid.contextMenu.setDisableItem(0, false);
        }

        this.create_calltree_data();
    };

    this.draw = function() {
        var check_pnl = this.createTabBar();
        this.$target.add( check_pnl, this.grid_layer , this.image_layer );
    };


    this.load_active_data = function() {
        $(this.image_layer.el.dom).append(this.$imageLayerWrap);

        var split_str = '',
            class_name = [], method_name = [],
            ix, ixLen;

        if (Comm.web_env_info[this.exclusionEnvKey] !== undefined) {
            for (ix = 0, ixLen = Comm.web_env_info[this.exclusionEnvKey].length; ix < ixLen; ix++) {
                split_str = JSON.parse(Comm.web_env_info[this.exclusionEnvKey][ix].split(','));

                if (split_str[0] !== '') {
                    class_name.push(split_str[0]);
                }

                if (split_str[1] !== '') {
                    method_name.push(split_str[1]);
                }
            }

            this.class_name = class_name;
            this.method_name = method_name;
        }

        ix = null;
        split_str = null;

        if (this.txn_path.last_text_mode) {
            parent.check_text.setValue(true);
            parent.image_layer.hide();
            parent.grid_layer.show();
        } else {
            parent.check_text.setValue(false);
            parent.grid_layer.hide();
            parent.image_layer.show();
        }

        if (this.txn_path.last_check_elapse) {
            parent.check_elapse.setValue(true);
        } else {
            parent.check_elapse.setValue(false);
        }

        this.createData();
        this.createNodeView(this.imageData.children, 0);
        this.createCallTreeGrid();
    };

    this.create_calltree_data = function() {
        var ix = 0;
        var parent_node = null,
            calling_method_id, calling_crc, elapseRatio;


        this.callTreeGrid.clearNodes();
        this.callTreeGrid.showEmptyText();

        //console.debug('[DATA]: ' , this.data);

        this.callTreeGrid.beginTreeUpdate();


        for (ix = 0; ix < this.data.length; ix++) {

            if (this.monitorType === 'CD') {
                elapseRatio = this.data[ix][22];
            } else {
                elapseRatio = this.data[ix][12];
            }

            if (parent.elapseFlag && !Common.fn.round(elapseRatio, 2)) {
                continue;
            }


            //클래스 & 메소드 조건이 있는경우
            if (this.class_name !== undefined || this.method_name !== undefined) {

                if ((this.data[ix][7] != '') || ( this.data[ix][8] != 0)) {
                    if (this.confirm_data(this.data[ix])) {
                        continue;
                    }
                }
            }

            if ((this.data[ix][7] == '') && (this.data[ix][8] == 0)) {
                this._add_call_tree(null, this.data[ix]);
            } else {
                calling_method_id = this.data[ix][7];
                calling_crc = this.data[ix][8];

                parent_node = this.callTreeGrid.MultifindNode('method_id', 'crc', calling_method_id, calling_crc);
                if (parent_node == null) {
                    continue;
                }

                this._add_call_tree(parent_node, this.data[ix]);
            }


        } //end for

        this.callTreeGrid.endTreeUpdate();
        this.callTreeGrid.drawTree();

        this.callTreeGrid.pnlExTree.getView().refresh();

        if (this.filter_off.show_state) {
            this.filtering(this.filter_off.filter_key, this.filter_off.filter_seq);
        }

        this.$target.loadingMask.hide();

        if (!this.excludeForm) {
            this.excludeForm = { TP : null, TUX : null, WAS : null };
        }

        if (!this.excludeForm[this.monitorType]) {
            this.excludeForm[this.monitorType] = Ext.create('view.TxnDetail.XMCallTreeExclude', {
                monitorType : this.monitorType
            });
            this.parent       = this;
            this.excludeForm[this.monitorType].init();
        }

        ix = null;
    };


    this.confirm_data = function(_data) {

        var result = false,
            all_search_str = '',
            class_mapping, method_mapping,
            ix, ixLen, jx, jxLen;

        try {
            if (this.class_name == undefined) {
                result = false;
                return result;
            }



            if (_data[5] == undefined) {
                class_mapping = _data.class_name.toLowerCase();
                method_mapping = _data.method_name.toLowerCase();
            } else {
                class_mapping = _data[5].toLowerCase();
                method_mapping = _data[6].toLowerCase();
            }


            //CLASS
            for (ix = 0, ixLen = this.class_name.length; ix < ixLen; ix++ ) {

                if (this.class_name[ix].indexOf('%') > - 1) {

                    all_search_str = this.class_name[ix].toLowerCase().split('%');
                    for (jx = 0, jxLen = all_search_str.length; jx < jxLen; jx++) {

                        //%가 들어있는 인덱스는 재끼고.
                        if (all_search_str[jx] == '') {
                            continue;
                        }

                        if (class_mapping.indexOf(all_search_str[jx]) > -1) {
                            result = true;
                            return result;
                        }

                    }
                    jx = null;

                } else {
                    if (this.class_name[ix].toLowerCase() == class_mapping) {
                        result = true;
                        return result;
                    }
                }

            }

            //METHOD
            for (ix = 0, ixLen = this.method_name.length; ix < ixLen; ix++) {

                if (this.method_name[ix].indexOf('%') > - 1) {

                    all_search_str = this.method_name[ix].toLowerCase().split('%');
                    for (jx = 0, jxLen = all_search_str.length; jx < jxLen; jx++) {

                        //%가 들어있는 인덱스는 재끼고.
                        if ( all_search_str[jx] == '' ) {
                            continue;
                        }

                        if ( method_mapping.indexOf(all_search_str[jx]) > -1 ) {
                            result = true;
                            return result;
                        }

                    }
                    jx = null;

                } else {
                    if (this.method_name[ix].toLowerCase() == method_mapping) {
                        result = true;
                        return result;
                    }
                }

            }
        } finally {
            ix = null;
            result = null;
            all_search_str = null;
        }
    };


    this._add_call_tree = function(parent, _data) {

        var methodType, elapse, elapseRatio;

        if (this.monitorType === 'CD') {
            methodType = Common.fn.codeBitToMethodTypeCD(_data[13]);
            elapse = _data[21];
            elapseRatio = Common.fn.round(_data[22], 2);
        } else {
            methodType = Common.fn.codeBitToMethodType(_data[13]);
            elapse = _data[11];
            elapseRatio = Common.fn.round(_data[12], 2);
        }

        this.callTreeGrid.addNode(parent, [   _data[ 0]   // 'lvl'
            ,_data[ 1]                                    // 'was_id'
            ,_data[ 2]                                    // 'was_name'
            ,_data[ 3]                                    // 'method_id'
            ,_data[ 4]                                    // 'crc'
            ,_data[ 5]                                    // 'class_name'
            ,_data[ 6]                                    // 'method_name'
            ,_data[ 7]                                    // 'calling_method_id'
            ,_data[ 8]                                    // 'calling_crc'
            ,_data[ 9]                                    // 'error_count'
            ,_data[10]                                    // 'exec_count'
            ,elapse                                       // 'elapse_time'
            ,elapseRatio                                  // 'elapse_ratio'
            ,methodType                                   // 'method_type'
            ,_data[14]                                    // 'method_seq'
            ,_data[15]                                    // 'level_id'
            ,_data[16]                                    // 'host_name'
            ,_data[17]                                    // 'tid'
            ,_data[18]                                    // 'cpu_time'
        ] );

    };

    this.calltree_exclude_filter = function(tid, exclude_data) {

        var class_name = [], method_name = [],
            split_str = '',
            txnPath = this.txn_path,
            ix;

        for (ix = 0; ix < exclude_data.length; ix++) {
            split_str = JSON.parse(exclude_data[ix].split(','));


            if (split_str[0] !== '') {
                class_name.push( split_str[0] );
            }

            if (split_str[1] !== '') {
                method_name.push( split_str[1] );
            }

        }
        this.class_name  = class_name;
        this.method_name = method_name;

        this.createData();
        this.createNodeView(this.imageData.children, 0);
        this.create_calltree_data();

        if (txnPath.currContent !== 'callTree' && txnPath.callTreeList) {
            if (txnPath.callTreePopUpInfo.tabList[this.id]) {
                txnPath.callTreePopUpInfo.tabList[this.id].load_active_data();
            }

            if (txnPath.callTreeLayer) {
                txnPath.callTreeList[this.id].load_active_data();
            }
        }

        class_name  = null;
        method_name = null;
        split_str   = null;
        ix          = null;

    };

    this.OnCallData = function(header, data) {

        if (data.rows.length == 0) {
            return;
        }

        this.data = data.rows;

        this.create_calltree_data();

    };


    this.initArgument(arg);
    this.createData();
    this.createNodeView(this.imageData.children, 0);
    this.draw();

    return this;
};
