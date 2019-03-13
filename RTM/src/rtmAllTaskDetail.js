/*

 업무관점 모니터링 [업무별현황]

 */
Ext.define('rtm.src.rtmAllTaskDetail', {
    extend       : 'Exem.DockForm',
    title        : common.Util.CTR('Track By All Task Detail'),
    layout       : 'fit',
    width        : '100%',
    height       : '100%',
    autoScroll   : true,
    interval     : 1000 * 30,

    sql : {
        'txnDetailByTask'  : 'IMXRT_TxnDetail_Count_ByTask.sql',
        'errorCount'       : 'IMXRT_Error_Count.sql',
        'visitorCnt'       : 'IMXRT_ServiceStat_Visitor_Count.sql',
        'avgTxn'           : 'IMXRT_TxnDetail_Avg.sql'
    },

    listeners: {
        beforedestroy: function() {
            this.isClosedDockForm = true;

            this.stopRefreshData();
            this.refreshTimer = null;

            $(this.el.dom).off('mouseover', '.' + this.cellEventCls);
            $(this.el.dom).off('mouseout', '.' + this.cellEventCls);
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType);

        this.popupFrame = {
            'trackByTaskDetail'  : 'rtm.src.rtmTrackByTaskDetail'
        };
        this.COLOR = ['#2789D8', '#72B826', '#45416E', '#A45353', '#2838B0', '#52BBB4', '#7D8531'];

        if (this.config.options) {
            this.bizList = this.config.options.bizList;
        }

        this.WSCnt = 0;
        this.bizIdList = [];
        this.packet = {};
        this.serieseList = [];

        var ix, ixLen;

        for (ix = 0, ixLen = Comm.businessRegisterInfo.length; ix < ixLen; ix++) {
            this.bizIdList.push({
                'bizId': Comm.businessRegisterInfo[ix].parent.bizId,
                'bizName': Comm.businessRegisterInfo[ix].parent.bizName
            });
        }

        for (ix = 0, ixLen = this.bizIdList.length; ix < ixLen; ix++) {
            this.packet[this.bizIdList[ix].bizId] = {
                'txnCnt'   : 0,
                'bizName'  : this.bizIdList[ix].bizName,
                'bizId'    : this.bizIdList[ix].bizId,
                'tps'      : 0,
                'elapse'   : 0,
                'errorCnt' : 0,
                'errorRate': 0,
                'active_cnt' : 0,
                'active_nor' : 0,
                'active_war' : 0,
                'active_cri' : 0,
                'tdColor'    : '#ABAEB5',
                'tierElapse' : []
            };
        }

        this.packetKeys = Object.keys(this.packet);
    },

    init: function() {
        this.initProperty();

        this.initLayout();

        this.frameRefresh();
        // console.dir(this.config.options);
    },


    /**
     * 기본 레이어 구성
     */
    initLayout: function() {

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            border: 1
        });

        this.topContentsArea  = Ext.create('Exem.Container',{
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '5 0 0 0'
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '0 0 0 10',
            cls    : 'header-title',
            text   : this.title
        });

        this.gridFrame = Ext.create('Exem.Container',{
            width  : '100%',
            height : '100%',
            layout : 'fit',
            flex   : 1,
            margin : '5 10 10 10'
        });

        var theme = Comm.RTComm.getCurrentTheme();
        var labelStyle = {
            fontSize : 12,
            fontFamily : 'Droid Sans'
        };
        //var gridLineColor, borderColor;

        switch (theme) {
            case 'Black' :
                labelStyle.color = realtime.lineChartColor.BLACK.label;
                //gridLineColor    = realtime.lineChartColor.BLACK.gridLine;
                //borderColor      = realtime.lineChartColor.BLACK.border;
                break;

            case 'Gray' :
                labelStyle.color = realtime.lineChartColor.GRAY.label;
                //gridLineColor    = realtime.lineChartColor.GRAY.gridLine;
                //borderColor      = realtime.lineChartColor.GRAY.border;
                break;

            default :
                labelStyle.color = realtime.lineChartColor.WHITE.label;
                //gridLineColor    = realtime.lineChartColor.WHITE.gridLine;
                //borderColor      = realtime.lineChartColor.WHITE.border;
                break;
        }

        this.labelLayer = Ext.create('Exem.Container', {
            layout: 'hbox',
            padding: '4 0 0 4',
            cls: 'rtm-taskdetail-base'
        });

        this.topContentsArea.add([this.frameTitle, { xtype: 'tbfill' }, this.labelLayer]);

        this.background.add([this.topContentsArea, this.gridFrame]);

        this.add(this.background);

        this.createLabel(this.labelLayer.getEl().dom);

        this.createGrid(this.gridFrame);

        if (this.floatingLayer === true) {
            this.frameTitle.hide();
        }
    },

    createLabel: function(target) {
        var ix, ixLen, baseEl, sepEl, iconEl, wasEl, labelWidth = 0;

        for (ix = 0, ixLen = Comm.bizGroups.length; ix < ixLen; ix++) {
            sepEl = {
                color : this.COLOR[ix],
                label : Comm.bizGroups[ix],
                labelObj : null
            };

            this.serieseList.push(sepEl);
        }

        for (ix = 0, ixLen = this.serieseList.length; ix < ixLen; ix++) {
            baseEl    = target.appendChild(document.createElement('div'));
            baseEl.id = 'RTM-AGENT-' + Ext.id();

            baseEl.setAttribute('class', 'wasinfo');

            iconEl = baseEl.appendChild(document.createElement('div'));
            iconEl.setAttribute('class', 'icon');
            iconEl.setAttribute('style', 'background-color:' + this.serieseList[ix].color);

            wasEl = baseEl.appendChild(document.createElement('div'));
            wasEl.setAttribute('class', 'was ');
            wasEl.textContent = this.serieseList[ix].label;

            // 35px 마진값, 5px 여백값
            labelWidth += baseEl.getBoundingClientRect().width + 35 + 5;
        }

        this.labelLayer.setWidth(labelWidth);
    },


    /**
     * Grid 생성
     */
    createGrid: function(target) {
        var that = this;

        this.toptxnGrid = Ext.create('Exem.BaseGridWidget', {
            layout       : 'fit',
            usePager     : false,
            autoScroll   : false,
            borderVisible: true,
            adjustGrid   : true,
            localeType   : 'H:i:s',
            baseGridCls  : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title,
            style: {
                'overflow-x': 'hidden'
            }
        });

        this.toptxnGrid.beginAddColumns();
        this.toptxnGrid.addColumn(common.Util.CTR('Detail Business Name')         , 'txn'           , 120, Grid.String    ,true  ,false);
        this.toptxnGrid.addColumn(common.Util.CTR('Status')                       , 'TaskStatus'   , 120, Grid.Widget     ,true  ,false);
        this.toptxnGrid.addColumn(common.Util.CTR('Processing Count')             , 'processingCnt' , 120, Grid.StringNumber    ,true  ,false, null, 'txnCnt');
        this.toptxnGrid.addColumn(common.Util.TR('TPS')                           , 'tps'           , 100,  Grid.StringNumber   ,true  ,false);
        this.toptxnGrid.addColumn(common.Util.CTR('Elapse Time')                  , 'elapseTime'   , 75, Grid.StringNumber      ,true  ,false);
        this.toptxnGrid.addColumn(common.Util.CTR('Error Count/Error Rate')       , 'error'         , 150,  Grid.StringNumber    ,true  ,false);
        this.toptxnGrid.addColumn(common.Util.CTR('The figure of the graph (Transaction)') ,'LineTPSChart'     , 250, Grid.Widget    ,true  ,false);
        this.toptxnGrid.addColumn(common.Util.CTR('The figure of the graph (Elapse Time)') ,'LineElapseChart'     , 250, Grid.Widget    ,true  ,false);
        this.toptxnGrid.addColumn(common.Util.CTR('Timeline on each tier')        ,'TimeLine'      , 200, Grid.Widget    ,true  ,false);
        this.toptxnGrid.addColumn('businees_id'                                   ,'bizId'    , 200, Grid.StringNumber   ,false ,true);
        this.toptxnGrid.addColumn('active_normal'                                 ,'active_normal'  , 200, Grid.StringNumber   ,false ,true);
        this.toptxnGrid.addColumn('active_warning'                                ,'active_warning'  , 200, Grid.StringNumber   ,false ,true);
        this.toptxnGrid.addColumn('active_critical'                               ,'active_critical'  , 200, Grid.StringNumber   ,false ,true);
        this.toptxnGrid.addColumn('tier_list'                                     ,'tierElapse'  , 200, Grid.StringNumber   ,false ,true);
        this.toptxnGrid.addColumn('parentId'                                      ,'parentId'  , 200, Grid.StringNumber   ,false ,true);
        this.toptxnGrid.addColumn('parent'                                        ,'parent'  , 200, Grid.StringNumber   ,false ,true);
        this.toptxnGrid.addColumn('packetKey'                                     ,'packetKey'  , 200, Grid.Number   ,false ,true);
        this.toptxnGrid.addColumn('gridCnt'                                       ,'gridCnt'  , 200, Grid.Number   ,false ,true);


        var addPointer = function(value, metaData) {
            metaData.tdCls = 'grid-cell-pointer';
            return value;
        };

        this.toptxnGrid.addRenderer('txn', addPointer);

        this.toptxnGrid.endAddColumns();
        target.add(this.toptxnGrid);

        this.toptxnGrid._columnsList[1].flex = 1;

        this.toptxnGrid.pnlExGrid.addListener('cellclick', function(_this, td, cellIndex, record) {
            var ix, ixLen, bizId, bizName, isEmpty;

            if (cellIndex !== 0) {
                return;
            }

            isEmpty = 0;

            for (ix = 0, ixLen = Comm.businessRegisterInfo.length; ix < ixLen; ix++) {
                bizId = Comm.businessRegisterInfo[ix].parent.bizId;
                bizName = Comm.businessRegisterInfo[ix].parent.bizName;

                if (record.data.txn === bizName) {
                    if (!that._hasChildTasks(bizId)) {
                        isEmpty = 1;
                    }
                    break;
                }
            }

            if (!isEmpty) {
                this.trackByTaskDetail = Ext.create('rtm.src.rtmTrackByTaskDetail', {
                    'business_id': bizId
                });

                this.trackByTaskDetail.show();
                setTimeout(function() {
                    this.trackByTaskDetail.init();
                }.bind(this), 5);
            } else {
                Ext.Msg.show({
                    title  : common.Util.TR('ERROR'),
                    msg    : common.Util.TR('Detail information does not exist.'),
                    buttons: Ext.Msg.OK,
                    icon   : Ext.MessageBox.WARNING
                });
            }

        });
    },

    /**
     * 데이터 새로고침을 중지.
     */
    stopRefreshData: function() {
        var ix, ixLen;

        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        if (this.refreshRealtime && this.refreshRealtime.length > 0) {
            for (ix = 0, ixLen = this.refreshRealtime.length; ix < ixLen; ix++) {
                clearTimeout(this.refreshRealtime[ix]);
            }
            this.refreshRealtime = [];
        }
    },


    /**
     * 데이터 새로 고침.
     */
    frameRefresh: function() {
        var ix;

        this.stopRefreshData();

        this.drawTopTxnData();

        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), this.interval);
        this.refreshRealtime = [];

        for (ix = 1; ix <= 10; ix++) {
            this.refreshRealtime[ix] = setTimeout(this.drawRealtimeData.bind(this), ix * 3000);
        }
    },

    drawRealtimeData: function() {
        if (!Repository.BizData || !Object.keys(Repository.BizData).length) {
            return;
        }

        var ix, ixLen, jx, kx, lx, lxLen;
        var split, bizName, bizId, obj;
        var tps, elapse, bizData, errorCnt, errorRate, activeTxnCnt, activeNormal, activeWarning, activeCritical, tierElapse;
        var isReturn;

        for (ix = 0, ixLen = this.bizIdList.length; ix < ixLen; ix++) {
            bizId = this.bizIdList[ix].bizId;
            tps = 0;
            elapse = 0;
            errorCnt = 0;
            activeTxnCnt = 0;
            activeNormal = 0;
            activeWarning = 0;
            activeCritical = 0;
            tierElapse = [];

            Comm.sortTierInfo.map(function(d) {
                obj = {};
                obj.tierId = d.tierId;
                obj.elapse = 0;

                tierElapse.push(obj);
            });

            for (jx in Repository.BizData) {
                for (kx in Repository.BizData[jx]) {
                    bizData = Repository.BizData[jx][kx];

                    split = bizData.TREE_KEY.split('-');

                    if (split.indexOf(String(bizId)) !== -1) {
                        tps += bizData.TPS;
                        elapse += bizData.TXN_ELAPSE;
                        errorCnt += bizData.EXCEPTION_COUNT;
                        activeTxnCnt += bizData.ACTIVE_TXN_COUNT;
                        activeNormal += bizData.ACTIVE_NORMAL;
                        activeWarning += bizData.ACTIVE_WARNING;
                        activeCritical += bizData.ACTIVE_CRITICAL;

                        for (lx = 0, lxLen = tierElapse.length; lx < lxLen; lx++) {
                            if (tierElapse[lx].tierId === +kx) {
                                tierElapse[lx].elapse += bizData.TXN_ELAPSE;
                            }
                        }
                    }
                }
            }


            //bizName 찾기
            isReturn = 0;
            for (jx in Comm.businessRegisterInfo) {

                if (Comm.businessRegisterInfo[jx].parent.bizId === bizId) {
                    bizName = Comm.businessRegisterInfo[jx].parent.bizName;
                    isReturn = 1;
                    break;
                }

                if (isReturn) {
                    break;
                }
            }

            errorRate = this.packet[bizId].txnCnt === 0 ? 0 : (errorCnt / this.packet[bizId].txnCnt) * 100;

            if (errorRate > 0) {
                errorRate = errorRate.toFixed(2);
            }
            errorCnt = common.Util.numberWithComma(errorCnt);

            this.packet[bizId].bizName = bizName;
            this.packet[bizId].bizId = bizId;
            this.packet[bizId].tps = tps;
            this.packet[bizId].elapse = elapse;
            this.packet[bizId].errorCnt = errorCnt;
            this.packet[bizId].errorRate = errorRate;
            this.packet[bizId].active_cnt = activeTxnCnt;
            this.packet[bizId].active_nor = activeNormal;
            this.packet[bizId].active_war = activeWarning;
            this.packet[bizId].active_cri = activeCritical;
            this.packet[bizId].tierElapse = tierElapse;
        }

        this.refreshGrid();
    },

    /**
     * Top Transaction 조회
     */
    drawTopTxnData: function() {
        var ix, ixLen, jx, jxLen, d, keys, businessId, splitKey, firstBizKeys;

        if (!Repository.BizData || !Object.keys(Repository.BizData).length) {
            return;
        }
        // console.dir(this.toptxnGrid.pnlExGrid.headerCt.getGridColumns());

        d = new Date();
        firstBizKeys = Object.keys(this.packet);
        businessId = [];

        for (ix in Repository.BizData) {
            keys = Object.keys(Repository.BizData[ix]);

            for (jx = 0, jxLen = keys.length; jx < jxLen; jx++) {

                splitKey = Repository.BizData[ix][keys[jx]].TREE_KEY.split('-');
                if (firstBizKeys.indexOf(splitKey[0]) !== -1) {
                    if (businessId.indexOf(splitKey[splitKey.length - 1]) === -1) {
                        businessId.push(splitKey[splitKey.length - 1]);
                    }
                }
            }
        }

        for (ix = 0, ixLen = businessId.length; ix < ixLen; ix++) {
            WS.SQLExec({
                sql_file : this.sql.txnDetailByTask,
                bind     : [
                    {
                        name : 'from_time',
                        type : SQLBindType.STRING,
                        value: Comm.today + ' 00:00:00'
                    },
                    {
                        name : 'to_time',
                        type : SQLBindType.STRING,
                        value: Comm.today + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
                    },
                    {
                        name : 'business_id',
                        type : SQLBindType.INTEGER,
                        value: businessId[ix]
                    }
                ]
            }, function(businessId, len, aheader, adata) {
                if (!aheader.success || this.isClosedDockForm === true) {
                    return;
                }

                // console.dir(adata);
                var jx, kx, bizId, split, isReturn;
                var txnCnt;

                txnCnt = +adata.rows[0][0];

                //bizName 찾기
                for (jx in Repository.BizData) {
                    for (kx in Repository.BizData[jx]) {

                        split = Repository.BizData[jx][kx].TREE_KEY.split('-');

                        if (+split[split.length - 1] === +businessId) {
                            bizId = this.packet[+split[0]].bizId;
                            isReturn = 1;
                            break;
                        }
                    }

                    if (isReturn) {
                        break;
                    }
                }

                this.packet[bizId].txnCnt = txnCnt;

                if (this.WSCnt === len - 1) {
                    this.refreshGrid();
                    this.WSCnt = 0;
                } else {
                    this.WSCnt++;
                }
            }.bind(this, businessId[ix], businessId.length), this);
        }
    },

    refreshGrid: function() {
        var ix, gridCnt;

        this.toptxnGrid.clearRows();

        gridCnt = 0;
        for (ix in this.packet) {
            this.toptxnGrid.addRow([
                this.packet[ix].bizName,
                '',
                common.Util.numberWithComma(this.packet[ix].txnCnt) + ' ' + common.Util.TR('Txn'),
                common.Util.numberWithComma(this.packet[ix].tps) + ' TPS',
                common.Util.numberWithComma(Number(this.packet[ix].elapse).toFixed(3)) + ' ms',
                common.Util.numberWithComma(this.packet[ix].errorCnt) + common.Util.TR('Txn') + ' / ' + this.packet[ix].errorRate + '%',
                '',
                '',
                '',
                this.packet[ix].bizId,
                this.packet[ix].active_nor,
                this.packet[ix].active_war,
                this.packet[ix].active_cri,
                this.packet[ix].tierElapse,
                this.id,
                this,
                ix,
                gridCnt
            ]);
            gridCnt++;
        }

        this.toptxnGrid.drawGrid();

        $('#' + this.id).find('.txnCnt').map(function(i, d) {
            d.style.color = this.packet[this.packetKeys[i]].tdColor;
        }.bind(this));
    },

    _hasChildTasks: function(bizId) {
        var ix, jx, bizData, split;

        for (ix in Repository.BizData) {
            for (jx in Repository.BizData[ix]) {

                bizData = Repository.BizData[ix];
                split = bizData[jx].TREE_KEY.split('-');

                if (split.indexOf(String(bizId)) !== -1) {
                    return true;
                }
            }
        }

        return false;
    }

});
