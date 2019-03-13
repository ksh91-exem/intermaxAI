Ext.define('rtm.src.rtmTrackByTaskDetail', {
    extend       : 'Exem.XMWindow',
    title        : common.Util.CTR('Track By Task Detail'),
    cls          : 'xm-dock-window-base',

    layout       : 'fit',
    width        : 1400,
    height       : 480,
    minWidth     : 850,
    minHeight    : 400,
    autoScroll   : true,
    closeAction  : 'destroy',
    interval     : 1000 * 30,

    sql : {
        'txnDetailByTask'  : 'IMXRT_TxnDetail_Count_ByTask.sql',
        'errorCount' : 'IMXRT_Error_Count.sql',
        'visitorCnt' : 'IMXRT_ServiceStat_Visitor_Count.sql',
        'avgTxn'     : 'IMXRT_TxnDetail_Avg.sql'
    },

    listeners: {
        beforedestroy: function() {
            this.isClosedDockForm = true;

            this.stopRefreshData();
            this.refreshTimer = null;

            $(this.el.dom).off('mouseover', '.'+this.cellEventCls);
            $(this.el.dom).off('mouseout', '.'+this.cellEventCls);
        },
        resize: function(){
            this.frameRefresh();
        }
    },

    initProperty: function() {
        this.monitorType  = 'business';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.bizId = this.business_id;

        this.WSCnt = 0;
        this.packet = {};
        this.bizIdList = [];
        this.serieseList = [];
        this.COLOR = ['#2B99F0', '#7FCD2A', '#514C7C', '#B75C5C', '#2F42BA', '#66CCC4', '#8C943B'];

        var ix, ixLen, jx, jxLen, bizData;
        for(ix = 0, ixLen = Comm.businessRegisterInfo.length; ix < ixLen; ix++){
            if(Comm.businessRegisterInfo[ix].parent['bizId'] === this.bizId){
                bizData = Comm.businessRegisterInfo[ix].child;
                for(jx = 0, jxLen = bizData.length; jx < jxLen; jx++){
                    this.bizIdList.push({
                        bizId: bizData[jx]['bizId'],
                        bizName: bizData[jx]['bizName']
                    });
                }
            }
        }

        for(ix = 0, ixLen = this.bizIdList.length; ix < ixLen; ix++){
            this.packet[this.bizIdList[ix].bizId] = {
                'txnCnt'   : 0,
                'bizName'  : '',
                'bizId'    : '',
                'tps'      : 0,
                'elapse'   : 0,
                'errorCnt' : 0,
                'errorRate': 0,
                'active_cnt' : 0,
                'active_nor' : 0,
                'active_war' : 0,
                'active_cri' : 0,
                'tierElapse' : []
            };
        }

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this);
    },

    init: function() {
        this.initProperty();

        this.initLayout();

        this.frameRefresh();
    },


    /**
     * 기본 레이어 구성
     */
    initLayout: function() {

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            border: 1,
            style  : 'background: #393C43; !important'
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
            cls    : 'header-title'
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
        var gridLineColor, borderColor;

        switch (theme) {
            case 'Black' :
                labelStyle.color = realtime.lineChartColor.BLACK.label;
                gridLineColor    = realtime.lineChartColor.BLACK.gridLine;
                borderColor      = realtime.lineChartColor.BLACK.border;
                break;

            case 'Gray' :
                labelStyle.color = realtime.lineChartColor.GRAY.label;
                gridLineColor    = realtime.lineChartColor.GRAY.gridLine;
                borderColor      = realtime.lineChartColor.GRAY.border;
                break;

            default :
                labelStyle.color = realtime.lineChartColor.WHITE.label;
                gridLineColor    = realtime.lineChartColor.WHITE.gridLine;
                borderColor      = realtime.lineChartColor.WHITE.border;
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

            labelWidth += baseEl.getBoundingClientRect().width + 35 + 5;
        }

        this.labelLayer.setWidth(labelWidth);
    },


    /**
     * Grid 생성
     */
    createGrid: function (target) {
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
        this.toptxnGrid.addColumn(common.Util.CTR('Detail Business Name')     , 'bizName'      , 120, Grid.String    ,true  ,false);
        this.toptxnGrid.addColumn(common.Util.CTR('Elapse Time(AVG)')        , 'elapse'      , 120, Grid.StringNumber     ,true  ,false, 'treeColumn', 'red');
        this.toptxnGrid.addColumn(common.Util.CTR('Active Transaction Count'), 'ActiveTxn', 200, Grid.Widget    ,true  ,false);
        this.toptxnGrid.addColumn(common.Util.CTR('TPS')                     , 'tps'      , 100,  Grid.StringNumber    ,true  ,false);
        this.toptxnGrid.addColumn(common.Util.CTR('Transaction Count')       , 'txnCnt'      , 75,  Grid.StringNumber    ,true  ,false);
        this.toptxnGrid.addColumn(common.Util.CTR('Error Count/Error Rate')  , 'error'    , 150,  Grid.StringNumber    ,true  ,false);
        this.toptxnGrid.addColumn(common.Util.CTR('The figure of the graph (Elapse Time)'),'LineElapseChart'  , 250, Grid.Widget    ,true  ,false);
        this.toptxnGrid.addColumn(common.Util.CTR('Timeline on each tier')    ,'TimeLine'   , 200, Grid.Widget    ,true  ,false);
        this.toptxnGrid.addColumn('businees_id'                               ,'bizId'    , 200, Grid.StringNumber   ,false ,true);
        this.toptxnGrid.addColumn('active_normal'                             ,'active_normal'  , 200, Grid.StringNumber   ,false ,true);
        this.toptxnGrid.addColumn('active_warning'                            ,'active_warning'  , 200, Grid.StringNumber   ,false ,true);
        this.toptxnGrid.addColumn('active_critical'                           ,'active_critical'  , 200, Grid.StringNumber   ,false ,true);
        this.toptxnGrid.addColumn('active_cnt'                                ,'active_cnt'  , 200, Grid.StringNumber   ,false ,true);
        this.toptxnGrid.addColumn('tier_list'                                 ,'tierElapse'  , 200, Grid.StringNumber   ,false ,true);
        this.toptxnGrid.endAddColumns();

        target.add(this.toptxnGrid);

        this.toptxnGrid._columnsList[1].flex = 1;
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
        if(this.refreshRealtime && this.refreshRealtime.length > 0){
            for(ix = 0, ixLen = this.refreshRealtime.length; ix < ixLen; ix++){
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

        for(ix = 1; ix <= 10; ix++){
            this.refreshRealtime[ix] = setTimeout(this.drawRealtimeData.bind(this), ix * 3000);
        }
    },

    drawRealtimeData: function(){
        if(!Repository.BizData || !Object.keys(Repository.BizData).length){
            return;
        }

        var ix, ixLen, jx, jxLen, kx, lx, lxLen, d;
        var split, bizName, bizId, obj;
        var totCnt, tps, elapse, bizData, errorCnt, errorRate, activeTxnCnt, activeNormal, activeWarning, activeCritical, tierElapse;

        for(ix = 0, ixLen = this.bizIdList.length; ix < ixLen; ix++){
            bizId = this.bizIdList[ix].bizId;
            totCnt = 0;
            tps = 0;
            elapse = 0;
            errorCnt = 0;
            activeTxnCnt = 0;
            activeNormal = 0;
            activeWarning = 0;
            activeCritical = 0;
            tierElapse = [];

            Comm.sortTierInfo.map(function(d){
                obj = {};
                obj.tierId = d.tierId;
                obj.elapse = 0;

                tierElapse.push(obj);
            });

            for(jx in Repository.BizData){
                for(kx in Repository.BizData[jx]){
                    bizData = Repository.BizData[jx][kx];

                    split = bizData.TREE_KEY.split('-');

                    if(split.indexOf(String(bizId)) !== -1){
                        totCnt++;
                        tps += bizData.TPS;
                        elapse += bizData.TXN_ELAPSE;
                        errorCnt += bizData.EXCEPTION_COUNT;
                        activeTxnCnt += bizData.ACTIVE_TXN_COUNT;
                        activeNormal += bizData.ACTIVE_NORMAL;
                        activeWarning += bizData.ACTIVE_WARNING;
                        activeCritical += bizData.ACTIVE_CRITICAL;

                        for(lx = 0, lxLen = tierElapse.length; lx < lxLen; lx++){
                            if(tierElapse[lx].tierId === +kx){
                                tierElapse[lx].elapse += bizData.TXN_ELAPSE;
                            }
                        }
                    }
                }
            }


            //bizName 찾기
            var isReturn = 0;
            for(jx in Comm.businessRegisterInfo){
                for(kx in Comm.businessRegisterInfo[jx].child){
                    if(Comm.businessRegisterInfo[jx].child[kx].bizId === bizId){
                        bizName = Comm.businessRegisterInfo[jx].child[kx].bizName;
                        isReturn = 1;
                        break;
                    }
                }

                if(isReturn){
                    break;
                }
            }

            errorRate = (this.packet[bizId].txnCnt === 0 || this.packet[bizId].txnCnt * 100 < 1) ? 0 : ((errorCnt / this.packet[bizId].txnCnt) * 100).toFixed(2);
            elapse = totCnt === 0 ? 0 : elapse / totCnt;

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
        if(!Repository.BizData || !Object.keys(Repository.BizData).length || !this.bizIdList || !this.bizIdList.length){
            return;
        }

        var ix, ixLen, jx, jxLen, d, businessId, keys;

        d = new Date();
        businessId = [];

        for(ix in Repository.BizData){
            keys = Object.keys(Repository.BizData[ix]);

            for(jx = 0, jxLen = keys.length; jx < jxLen; jx++){
                if(+Repository.BizData[ix][keys[jx]].TREE_KEY.split('-')[0] === this.bizId){
                    if(businessId.indexOf(+ix) === -1) {
                        businessId.push(+ix);
                    }
                }
            }
        }

        for(ix = 0, ixLen = businessId.length; ix < ixLen; ix++) {
            WS.SQLExec({
                sql_file: this.sql.txnDetailByTask,
                bind: [
                    {
                        name: 'from_time',
                        type: SQLBindType.STRING,
                        value: Comm.today + ' 00:00:00'
                    },
                    {
                        name: 'to_time',
                        type: SQLBindType.STRING,
                        value: Comm.today + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
                    },
                    {
                        name: 'business_id',
                        type: SQLBindType.INTEGER,
                        value: businessId[ix]
                    }
                ]
            }, function (businessId, len, aheader, adata) {
                if (!aheader.success || this.isClosedDockForm === true) {
                    return;
                }

                var jx, kx, kxLen;
                var txnCnt;

                txnCnt = +adata.rows[0][0];

                if(this.WSCnt === 0) {
                    for (jx in this.packet) {
                        for (kx = 0, kxLen = this.bizIdList.length; kx < kxLen; kx++) {
                            if (this.bizIdList[kx].bizId === +jx) {
                                this.packet[jx].bizName = this.bizIdList[kx].bizName;
                            }
                        }
                    }
                }

                /**
                 * business id가 몇 번째 업무레벨인지 확인
                 *
                 * @param {int} business_id
                 * @param {int} check level
                 * @return {boolean} true / false - true면 해당 check level의 business id라는 의미
                 */
                if(!this._checkBizLevel(businessId, 2, txnCnt)) {
                    this._checkBizLevel(businessId, 3, txnCnt);
                }

                if (this.WSCnt === len - 1) {
                    this.refreshGrid();
                    this.WSCnt = 0;
                } else {
                    this.WSCnt++;
                }
            }.bind(this, businessId[ix], businessId.length), this);
        }
    },


    refreshGrid: function(){
        var ix;

        this.toptxnGrid.clearRows();

        for(ix in this.packet){
            this.toptxnGrid.addRow([
                this.packet[ix].bizName,
                common.Util.numberWithComma(Number(this.packet[ix].elapse).toFixed(3)) + ' ms',
                '',
                common.Util.numberWithComma(this.packet[ix].tps) + ' TPS',
                common.Util.numberWithComma(this.packet[ix].txnCnt) + ' ' + common.Util.TR('Txn'),
                common.Util.numberWithComma(this.packet[ix].errorCnt) + common.Util.TR('Txn') + ' / ' + this.packet[ix].errorRate + '%',
                '',
                '',
                this.packet[ix].bizId,
                this.packet[ix].active_nor,
                this.packet[ix].active_war,
                this.packet[ix].active_cri,
                this.packet[ix].active_cnt,
                this.packet[ix].tierElapse
            ]);
        }

        this.toptxnGrid.drawGrid();
    },

    onAlarm: function(data){
        var rData = data;

        if(rData[1] !== 20){
            return;
        }
    },

    _checkBizLevel: function(businessId, checkLevel, txnCnt){
        var jx, kx, isReturn;

        isReturn = false;

        for (jx in Repository.BizData) {
            for (kx in Repository.BizData[jx]) {
                split = Repository.BizData[jx][kx].TREE_KEY.split('-');

                if(+split[split.length - 1] === businessId){
                    if(checkLevel === 3){
                        businessId = +split[split.length - 2];
                    }

                    if(!this.packet[businessId]){
                        continue;
                    }

                    this.packet[businessId].txnCnt = txnCnt;
                    this.packet[businessId].tierElapse = this.packet[businessId].tierElapse || [];
                    isReturn = true;
                }
            }
        }

        return isReturn;
    }

});
