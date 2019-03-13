Ext.define('rtm.src.rtmActiveTxnCallTree', {
    extend: 'Exem.Form',
    title: common.Util.TR('Transaction Path'),
    layout: 'vbox',
    width: 900,
    height: 650,
    maximizable: false,
    resizable: false,
    closeAction: 'destroy',
    padding: '5 5 5 5',

    ratioZeroCheck: true,
    isWinClosed  : false,

    tid: null,


    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },


    initWindow: function() {
        this.winForm = Ext.create('Exem.XMWindow', {
            layout   : 'vbox',
            maximizable: true,
            width    : 1000,
            height   : 650,
            minWidth : 1000,
            minHeight: 650,
            resizable: true,
            closeAction: 'destroy',
            title    : common.Util.TR('Transaction Path') + ' - ' + common.Util.TR('Current Call Tree'),
            cls      : 'xm-dock-window-base rtm-activetxn-detail',
            listeners: {
                scope: this,
                beforeclose: function() {
                    this.stopRefreshCallTree();
                    this.isClosed = true;
                    this.isWinClosed = true;

                }
            }
        });

        this.winForm.show();

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this.winForm
        });

        this.loadingMask.show(true);
    },


    init: function() {

        var isChecked = Comm.RTComm.getBooleanValue(Comm.web_env_info.rtm_txnpath_calltree_checked);

        this.ratioZeroCheck = isChecked;

        var tabPanel = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            flex  : 1,
            width : '100%',
            border: false,
            items: [{
                layout: 'vbox',
                id: 'txnpath_calltree_' + this.id,
                border: false,
                tbar: [{
                    xtype: 'tbspacer',
                    flex: 1
                }, {
                    xtype     : 'checkbox',
                    checked   : isChecked,
                    margin    : '0 5 0 0',
                    listeners : {
                        scope: this,
                        change: function(me) {
                            common.WebEnv.Save('rtm_txnpath_calltree_checked', me.getValue());
                            this.excludeZeroRatio(me.getValue());
                        }
                    }
                }, {
                    xtype: 'tbtext',
                    text : common.Util.TR('Exclude 0% Elapse Time'),
                    cls  : 'checkbox-exclude-label'
                }]
            }]
        });

        this.winForm.add(tabPanel);

        this.createCallTreeGrid();

        if (this.isWinClosed === true) {
            return;
        }

        Ext.getCmp('txnpath_calltree_' + this.id).add(this.callTreeGrid);

        setTimeout(function() {
            if (Ext.isDefined(this.tid)) {
                this.drawCallTree(this.tid);
                this.refreshCallTree();
            }

            this.loadingMask.hide();
        }.bind(this), 5);
    },


    createCallTreeGrid: function() {

        this.callTreeGrid = Ext.create('Exem.BaseGrid', {
            itemId  : 'grd_calltree',
            width   : '100%',
            flex    : 1,
            gridName: 'TxnPath_CallTree',
            gridType: Grid.exTree,
            borderVisible: true,
            useFindOn    : false,
            baseGridCls  : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: common.Util.TR('Call Tree'),
            usePager    : false,
            useEmptyText: true,
            emptyTextMsg: common.Util.TR('No data to display')
        });

        this.callTreeGrid.beginAddColumns();
        this.callTreeGrid.addColumn(common.Util.CTR('LVL'              ), 'lvl'             ,  100, Grid.String,  false,  false);
        this.callTreeGrid.addColumn(common.Util.CTR('WAS ID'           ), 'was_id'          ,  100, Grid.String,  false,  false);
        this.callTreeGrid.addColumn(common.Util.CTR('WAS Name'         ), 'was_name'        ,  100, Grid.String,  false,  false);
        this.callTreeGrid.addColumn(common.Util.CTR('Method ID'        ), 'method_id'       ,  100, Grid.String,  false,  true);
        this.callTreeGrid.addColumn(common.Util.CTR('CRC'              ), 'crc'             ,  100, Grid.String,  false,  true);
        if (this.monitorType === 'TP') {
            this.callTreeGrid.addColumn(common.Util.CTR('Class'            ), 'class_name'      ,  300, Grid.String,  false,  true);
            this.callTreeGrid.addColumn(common.Util.CTR('Method'           ), 'method_name'     ,  200, Grid.String,  true,   false, 'treecolumn');
        } else {
            this.callTreeGrid.addColumn(common.Util.CTR('Class'            ), 'class_name'      ,  300, Grid.String,  true,   false, 'treecolumn');
            this.callTreeGrid.addColumn(common.Util.CTR('Method'           ), 'method_name'     ,  200, Grid.String,  true,   false);
        }
        this.callTreeGrid.addColumn(common.Util.CTR('Calling Method ID'), 'calling_method_id', 100, Grid.String,  false,  true);
        this.callTreeGrid.addColumn(common.Util.CTR('Calling CRC'      ), 'calling_crc'     ,  100, Grid.String,  false,  true);
        this.callTreeGrid.addColumn(common.Util.CTR('Exception Count'  ), 'err_count'       ,   80, Grid.Number,  true,   false);
        this.callTreeGrid.addColumn(common.Util.CTR('Execute Count'    ), 'exec_count'      ,   80, Grid.Number,  true,   false);
        this.callTreeGrid.addColumn(common.Util.CTR('Elapse Time'      ), 'elapse_time'     ,   80, Grid.Float,   true,   false);
        this.callTreeGrid.addColumn(common.Util.CTR('Elapse Time Ratio'), 'elapse_ratio'    ,   90, Grid.Float,   true,   false);

        if (this.monitorType === 'TP') {
            this.callTreeGrid.addColumn(common.Util.CTR('Method Type'      ), 'method_type'     ,  100, Grid.String,  false,   true);
        } else {
            this.callTreeGrid.addColumn(common.Util.CTR('Method Type'      ), 'method_type'     ,  100, Grid.String,  true,   false);
        }
        this.callTreeGrid.addColumn(common.Util.CTR('Method SEQ'       ), 'method_seq'      ,  100, Grid.String,  false,  true);
        this.callTreeGrid.addColumn('level_id'                         , 'level_id'         ,  100, Grid.String,  false,  false);
        this.callTreeGrid.addColumn(common.Util.CTR('Thread CPU'       ), 'cpu_time'        ,   80, Grid.Float,   false,  false);

        this.callTreeGrid.addRenderer('elapse_ratio', this.gridBarRenderer.bind(this), RendererType.bar);

        this.callTreeGrid.endAddColumns();
        this.callTreeGrid.drawTree();

        this.callTreeGrid.pnlExTree.on({
            scope: this,
            columnresize: function(me, column) {
                if (column.dataIndex === 'elapse_ratio') {
                    this.progressFillWidth = arguments[1].getWidth();
                    if (this.progressFillWidth) {
                        $('#'+this.callTreeGrid.id+' .progress-fill-text').css('width', this.progressFillWidth);
                    }
                }
            }
        });

        if (this.monitorType !== 'TP') {
            this.callTreeGrid.contextMenu.addItem({
                title : common.Util.TR('Class Java Source'),
                itemId: 'class_java_source',
                fn: function() {
                    var r = this.up().record;
                    var classview = Ext.create('Exem.ClassView');
                    classview.classmethod = r.class_name + '.class';
                    classview.wasid = r.was_id;
                    classview.init();
                }
            }, 0);
        }

    },


    /**
     *  그리드에 보여지는 막대 그래프 설정.
     *
     * arguments: value, metaData, record, rowIndex, colIndex, store, view
     *
     * @param {string} value - elapse_ratio
     * @return {string}
     */
    gridBarRenderer: function(value) {
        var htmlStr;
        var barWidth = value;

        if (value > 0) {
            var displayValue = (+value === 100)? value : value.toFixed(3);

            if (!this.progressFillWidth) {
                this.progressFillWidth = 82;
            }
            htmlStr =
                '<div class="progress-bar" style="border: 0px solid #666; height:13px; width: 100%;position:relative; text-align:center;">'+
                    '<div class="progress-fill" style="width:' + barWidth + '%;">'+
                        '<div class="progress-fill-text" style="width:'+this.progressFillWidth+'px">'+displayValue+'%</div>'+
                    '</div>'+ displayValue + '%' +
                '</div>';
        } else {
            htmlStr =  '<div data-qtip="" style="text-align:center;">'+'0%'+'</div>';
        }

        return htmlStr;
    },


    /**
     * Call Tree 그리기 중지
     */
    stopRefreshCallTree: function() {
        if (this.timerIncChart) {
            clearTimeout(this.timerIncChart);
            this.timerIncChart = null;
        }
    },


    /**
     * 설정된 주기만큼 데이터를 체크
     */
    refreshCallTree: function() {
        this.stopRefreshCallTree();

        if (this.isClosed) {
            return;
        }

        if (!this.isEndCallTreeProc) {
            this.timerIncChart = setTimeout(this.refreshCallTree.bind(this), 1000);

        } else if (!this.isCallTreeData) {
            var diff = 0;

            if (!this.firstTime) {
                this.firstTime = new Date();
            } else {
                diff = Ext.Date.diff(this.firstTime, new Date(), Ext.Date.SECOND);
            }

            if (diff > 5) {
                this.firstTime = null;
                if (this.callTreeLoadingMask) {
                    this.callTreeLoadingMask.hide();
                }
            } else {
                this.isEndCallTreeProc = false;
                this.drawCallTree(this.tid);
                this.timerIncChart = setTimeout(this.refreshCallTree.bind(this), 1000);
            }
        }
    },


    /**
     * 트랜잭션 콜트리 그리기
     *
     * @param {string} tid - 트랜잭션 ID
     */
    drawCallTree: function(tid) {

        if (this.isWinClosed === true) {
            return;
        }

        if (!this.callTreeLoadingMask) {
            this.callTreeLoadingMask = Ext.create('Exem.LoadingMask', {
                target: Ext.getCmp('txnpath_calltree_' + this.id)
            });
        }
        this.callTreeLoadingMask.show(null, true);

        WS.StoredProcExec({
            stored_proc: 'rt_txn_detail',
            bind: [{
                name : 'tid',
                value: tid
            }]
        }, function(aheader, adata) {
            if (this.isWinClosed === true) {
                return;
            }

            this.isEndCallTreeProc = true;
            this.callTreeGrid.showEmptyText();

            if (this.isRatioZeroCheck) {
                this.isRatioZeroCheck = false;
                this.callTreeLoadingMask.hide();
            }

            if (aheader && aheader.success === false) {
                console.debug('%c [ActiveTxn CallTree] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', aheader.message);
                return;
            }

            if (!aheader || !adata || !adata.rows || adata.rows.length === 0) {
                return;
            }

            this.isCallTreeData = true;

            if (this.callTreeLoadingMask) {
                this.callTreeLoadingMask.hide();
            }

            if (aheader.rows_affected > 0) {
                this.callTreeGrid.clearNodes();
                this.callTreeGrid.beginTreeUpdate();

                var calling_method_id;
                var calling_crc;
                var parent_node;
                var nodeData;

                /**
                 * Result Data Column
                 * 0:  lvl
                 * 1:  was_id
                 * 2:  was_name
                 * 3:  method_id
                 * 4:  crc
                 * 5:  class_name
                 * 6:  method_name
                 * 7:  calling_method_id
                 * 8:  calling_crc
                 * 9:  error_count
                 * 10: exec_count
                 * 11: elapse_time
                 * 12: elapse_ratio
                 * 13: method_type
                 * 14: method_seq
                 * 15: level_id
                 * 16: host_name
                 * 17: tid
                 * 18: cpu_time
                 * 19: parameter
                 */
                for (var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                    nodeData = adata.rows[ix];

                    if (this.ratioZeroCheck && (nodeData[11] <= 0 || !nodeData[12] || nodeData[12] <= 0)) {
                        continue;
                    }

                    if (!nodeData[7] && +nodeData[8] === 0 ) {
                        this.addCallTreeNode( null, nodeData );

                    } else {
                        calling_method_id = nodeData[7];
                        calling_crc       = nodeData[8];

                        parent_node = this.callTreeGrid.MultifindNode( 'method_id', 'crc', calling_method_id, calling_crc );

                        if (parent_node) {
                            this.addCallTreeNode( parent_node, nodeData );
                        }
                    }
                }

                this.callTreeGrid.endTreeUpdate();
                this.callTreeGrid.drawTree();
            }
        }, this);
    },


    /**
     *
     * @param {object} parent
     * @param {array} _data
     *  Data Columns
     *   0:  lvl
     *   1:  was_id
     *   2:  was_name
     *   3:  method_id
     *   4:  crc
     *   5:  class_name
     *   6:  method_name
     *   7:  calling_method_id
     *   8:  calling_crc
     *   9:  error_count
     *   10: exec_count
     *   11: elapse_time
     *   12: elapse_ratio
     *   13: method_type
     *   14: method_seq
     *   15: level_id
     *   16: host_name
     */
    addCallTreeNode: function( parent, _data ) {
        this.callTreeGrid.addNode( parent,[
            _data[ 0],
            _data[ 1],
            _data[ 2],
            _data[ 3],
            _data[ 4],
            _data[ 5],
            _data[ 6],
            _data[ 7],
            _data[ 8],
            _data[ 9],
            _data[10],
            _data[11],
            _data[12],
            common.Util.codeBitToMethodType(_data[13]),
            _data[14],
            _data[15],
            _data[16]
        ]);
    },


    /**
     * 수행시간 비율이 0% 인 데이터 표시/비표시 전환
     */
    excludeZeroRatio: function() {
        this.ratioZeroCheck = !this.ratioZeroCheck;
        this.isRatioZeroCheck = true;
        this.drawCallTree(this.tid);
    }


});