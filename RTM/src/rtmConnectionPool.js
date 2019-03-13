Ext.define('rtm.src.rtmConnectionPool', {
    extend: 'Exem.DockForm',
    title : common.Util.CTR('Connection Pool Monitor'),
    layout: 'fit',

    listeners: {
        beforedestroy: function(me) {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.CONNPOOL, me);
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, me);

            me.frameStopDraw();
        }
    },

    init: function() {

        this.initProperty();

        this.initLayout();

        if (this.floatingLayer === true) {
            this.frameTitle.hide();
        }

        if (this.selectedServerIdArr.length > 0 && this.selectedServerIdArr.length !== this.serverIdArr.length) {
            this.frameChange(this.selectedServerNames);
            this.circleChart.graph.update();
        }

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.CONNPOOL, this);
        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this);
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType);
        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.poolStatData = {};
    },

    /**
     * Init layout
     */
    initLayout: function() {

        this.background = Ext.create('Exem.Container', {
            layout : 'vbox',
            width  : '100%',
            height : '100%',
            cls    : 'rtm-connectionpool-base'
        });

        this.topContentsArea = Ext.create('Ext.container.Container',{
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '6 0 0 0'
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '0 0 0 10',
            cls    : 'header-title',
            text   : common.Util.CTR('Connection Pool Monitor')
        });

        this.statGuideIcon = Ext.create('Ext.container.Container',{
            width  : 85,
            height : 11,
            margin : '0 0 0 0',
            cls    : 'rtm-connection-guide-icon'
        });

        this.topContentsArea.add([this.frameTitle, {xtype: 'tbfill', flex: 1 }, this.statGuideIcon ]);

        this.pnlCenter = Ext.create('Exem.Panel', {
            bodyCls  : 'group-center-base',
            layout   : 'fit',
            flex     : 1,
            height   : '100%',
            width    : '100%',
            minHeight: 80,
            margin   : '0 0 0 0',
            split    : false,
            border   : false
        });

        var colors;
        var theme = Comm.RTComm.getCurrentTheme();

        switch (theme) {
            case 'Black' :
                colors = realtime.CircleColor.Black;
                break;
            case 'White' :
                colors = realtime.CircleColor.White;
                break;
            default :
                colors = realtime.CircleColor.Gray;
                break;
        }

        this.circleChart = Ext.create('Exem.chart.PairCircle', {
            color        : colors,
            devMode      : false,
            isBarStripe  : true,
            maxValue     : 30,
            maxBarWidth  : 55,
            maxBarHeight : 50,
            margin       : '0 0 0 0',
            circleClick  : null,
            navMenuclick : null
        });

        this.circleChart.circleClick = function() {
            this.statGuideIcon.addCls('max');
        }.bind(this);

        this.circleChart.navMenuclick = function() {
            this.statGuideIcon.removeCls('max');
        }.bind(this);

        this.setPoolData();

        this.background.add([this.topContentsArea, this.pnlCenter]);

        this.add(this.background);

        this.pnlCenter.add(this.circleChart);
    },


    /**
     * 모니터링 서버 대상 변경
     */
    updateServer: function() {
        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.frameChange(this.serverNameArr.concat());
    },


    /**
     * Change Selected WAS.
     * Execute in rtmView.frameChange().
     *
     * 선택된 wAS에 해당하는 Connectin Pool 정보만 보여주도록 설정.
     *
     * @param {string[]} serverNameList - WAS명 배열
     */
    frameChange: function(serverNameList) {
        var serverIdArr = [];
        var idx, serverName;

        if (serverNameList) {
            for (var i = 0, icnt = serverNameList.length; i < icnt; ++i) {
                serverName = serverNameList[i];
                idx = this.serverNameArr.indexOf(serverName) ;

                if (idx === -1 ) {
                    continue;
                }
                serverIdArr[serverIdArr.length] = String(this.serverIdArr[idx]);
            }
        }

        if (serverIdArr.length <= 0) {
            serverIdArr = this.serverIdArr.map(String);
        }

        this.circleChart.isSubMode = false;
        this.circleChart.viewWasList = [].concat(serverIdArr);
        this.circleChart.resize = true;

        serverIdArr    = null;
        serverNameList = null;
    },

    /**
     * Receive packet data. (Load Pool Monitor Data)
     * Execute in RTMDataManager.frameGroup.
     *
     * columns:
     *   [0]: Time
     *   [1]: Host_Name
     *   [2]: Was_ID
     *   [3]: Pool_ID
     *   [4]: Pool_Name
     *   [5]: Current_Conn
     *   [6]: Max_Conn
     *   [7]: Active_Conn
     *   [8]: Idle_Conn
     *
     * @param {Object} adata - pool packet data
     */
    onData: function(adata) {

        if (adata == null || adata.rows == null) {
            return;
        }

        var wasId, poolId, poolName, poolCount;

        for (var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {

            wasId     = adata.rows[ix][2];
            poolId    = adata.rows[ix][3];
            poolName  = adata.rows[ix][4];

            this.poolStatData[wasId +'_'+poolId] = [
                adata.rows[ix][5] - adata.rows[ix][8],
                adata.rows[ix][7],
                adata.rows[ix][6]
            ];

            this.checkPoolData(wasId, poolId, poolName);
        }

        // Set WAS Pool Count
        var wasActive1, wasActive2, wasTotal;

        for (var jx = 0, jxLen = this.serverIdArr.length; jx < jxLen; jx++) {
            wasId      = this.serverIdArr[jx];
            wasActive1 = 0;
            wasActive2 = 0;
            wasTotal   = 0;

            for (ix = 0, ixLen = Comm.poolInfoArr.length; ix < ixLen; ix++) {

                if (wasId === Comm.poolInfoArr[ix].was_id) {

                    poolId    = Comm.poolInfoArr[ix].pool_id;
                    poolCount = this.poolStatData[wasId+'_'+poolId];

                    if (poolCount != null) {
                        wasActive1 += Math.floor(poolCount[0]) || 0;
                        wasActive2 += Math.floor(poolCount[1]) || 0;
                        wasTotal   += Math.floor(poolCount[2]) || 0;
                    }
                }
            }

            this.poolStatData[wasId] = [wasActive1, wasActive2, wasTotal];
        }

        poolCount  = null;
        wasId      = null;
        poolId     = null;
        adata      = null;

        this.circleChart.onData(this.poolStatData);
    },


    /**
     * Check new pool data.
     */
    checkPoolData: function(wasId, poolId, poolName) {
        var isPoolContain = false;

        for (var ix = 0, ixLen = Comm.poolInfoArr.length; ix < ixLen; ix++) {
            if (Comm.poolInfoArr[ix].was_id === wasId && Comm.poolInfoArr[ix].pool_id === poolId) {
                isPoolContain = true;
                break;
            }
        }

        if (isPoolContain === false) {
            Comm.poolInfoArr.push({
                pool_id   : poolId,
                pool_name : poolName,
                was_id    : wasId
            });
            this.setPoolData();
        }
    },


    /**
     * Configure pool monitoring data.
     */
    setPoolData: function() {
        var poolInfo = { id : [], name : [], subId : [], subName : [] };

        var id, was_id;
        var ix, ixLen;

        for (ix = 0, ixLen = Comm.poolInfoArr.length; ix < ixLen; ix++) {
            id = Comm.poolInfoArr[ix].was_id;
            if (poolInfo.id.indexOf(id) === -1 && this.serverIdArr.indexOf(id) !== -1) {
                poolInfo.id.push(id);
                poolInfo.name.push(Comm.RTComm.getWASNamebyId(id));
            }
        }

        for (ix = 0, ixLen = Comm.poolInfoArr.length; ix < ixLen; ix++) {
            was_id = Comm.poolInfoArr[ix].was_id;
            if (this.serverIdArr.indexOf(was_id) !== -1) {
                id = was_id + '_' + Comm.poolInfoArr[ix].pool_id;
                if (poolInfo.subId.indexOf(id) === -1) {
                    poolInfo.subId.push(id);
                    poolInfo.subName.push(Comm.poolInfoArr[ix].pool_name);
                }
            }
        }

        this.circleChart.setChartSeries(poolInfo.id, poolInfo.name, poolInfo.subId, poolInfo.subName);

        delete poolInfo.id;
        delete poolInfo.name;
        delete poolInfo.subId;
        delete poolInfo.subName;
        poolInfo = null;
    },

    /**
     * Start Bar Chart rendering.
     */
    frameRefresh: function() {
        if (this.circleChart) {
            this.circleChart.startAnimationFrame();
        }
    },

    /**
     * Stop Bar chart rendering.
     */
    frameStopDraw: function(){
        if (this.circleChart) {
            this.circleChart.stopAnimationFrame();
        }
    }

});

