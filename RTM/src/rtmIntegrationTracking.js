Ext.define('rtm.src.rtmIntegrationTracking', {
    extend: 'Exem.DockForm',
    title : '통합 추적',
    layout: 'fit',
    width : '100%',
    height: '100%',

    interval: 3000,

    listeners: {
        destroy: function() {
            // 연결 끊어줌.
            this.chart.txnInfo = null;
            this.chart.target  = null;

            if (this.timer) {
                clearTimeout(this.timer);
            }
            if (this.checkValueNCount) {
                clearTimeout(this.checkValueNCount);
            }
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.totalCountText = common.Util.TR('Total Count') + ' : ';
        this.maxOverText    = common.Util.TR('Max Over Count') + ' : ';
        this.maxValueText   = common.Util.TR('Max Elapsed Time (Sec)') + ' : ';

        this.isMemoryDB = (common.Util.isUsedMemoryDB && common.Util.isUsedMemoryDB() === true);

        this.topologyFilterWasNames = [];

        this.responseInspectorClass = 'view.ResponseInspector';
        this.responseInspectorTitle = common.Util.TR('Transaction Trend');
        this.responseInspectorType  = 'WAS';

        this.envKeyChartOption = 'rtm_' + this.monitorType.toLocaleLowerCase() + '_transactionMonitor_chartOption';
    },

    init: function() {
        var self = this;

        this.initProperty();

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            margin: '0 10 0 10'
        });
        this.add(this.background);

        this.titleArea = Ext.create('Ext.container.Container', {
            width  : '100%',
            height : 26,
            layout : {
                type : 'hbox'
            }
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '5 0 0 5',
            cls    : 'header-title',
            text   : this.title
        });

        this.titleArea.add(this.frameTitle);

        this.chartArea = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            margin : '0 0 10 0',
            flex: 1,
            listeners: {
                resize: function(_this) {
                    if( self.chart ) {
                        self.chart.draw(self.chart.id, _this.el.dom.clientWidth, _this.el.dom.clientHeight);
                    }
                }
            }
        });

        this.background.add([this.titleArea, this.chartArea]);

        this.createIntegrationTrackingChart();

        if (this.frameChange) {
            this.frameChange();
        }

        this.drawFrame();

        if (this.floatingLayer) {
            this.frameTitle.hide();
        }
    },


    /**
     * 통합 추적 차트 구성
     */
    createIntegrationTrackingChart: function() {
        var girdLineColor;
        var borderColor;
        var theme = Comm.RTComm.getCurrentTheme();
        var labelStyle = {
            fontSize : 12,
            fontFamily : 'Droid Sans'
        };

        switch (theme) {
            case 'Black' :
                labelStyle.color = '#fff';
                girdLineColor    = '#525359';
                borderColor      = '#81858A';
                break;
            case 'Gray' :
                labelStyle.color = '#ABAEB5';
                girdLineColor    = '#525359';
                borderColor      = '#81858A';
                break;
            default :
                labelStyle.color = '#555555';
                girdLineColor    = '#F0F0F0';
                borderColor      = '#ccc';
                break;
        }

        this.chart = Ext.create('rtm.src.rtmIntegrationTrackingChart');

        this.chartArea.add(this.chart);

        this.chart.init();
        this.chart.draw(this.chart.id, this.chartArea.getWidth(), this.chartArea.getHeight());
    },

    /**
     * 선택된 서버 목록으로 재설정.
     *
     * @param {string[]} serverNameList - 서버명 배열
     * @param {string[] | number[]} serverIDList - 서버 ID 배열
     */
    frameChange: function(serverNameList, serverIDList) {

        // 변형 뷰에서는 serverNameList 가 넘어오고 ( 이름 ) 그룹 트랜잭션에서는 serverIDList 로 넘어온다.
        var serverIdArr = [];
        var idx, serverName;

        if (serverNameList) {
            for (var i = 0, icnt = serverNameList.length; i < icnt; ++i) {
                serverName = serverNameList[i];
                idx = this.serverNameArr.indexOf(serverName) ;

                if (idx === -1 ) {
                    continue;
                }

                serverIdArr[serverIdArr.length] = +this.serverIdArr[idx];
            }
        }

        if (Ext.isEmpty(serverIDList) !== true && typeof(serverIDList.length) === 'number') {
            serverIdArr = [].concat( serverIDList );
        }

        if (serverIdArr.length <= 0) {
            serverIdArr = this.serverIdArr.concat();
        }

        // 모니터링 대상 서버가 없는 경우 트랜잭션 모니터에 다른 서버 유형의 점 데이터가 표시되는 것을 막기위해
        // 존재하지 않는 임의의 값을 설정하여 표시되지 않게 처리함.
        // WAS 모니터링이 기본으로 설계가 되어 있는데 WAS를 모니터링 하지 않는 경우가 발생되면서 처리함.
        if (serverIdArr.length <= 0) {
            serverIdArr = [-1000];
        }

        this.chart.selectedWasIdArr = serverIdArr.concat();

        serverIdArr    = null;
        serverNameList = null;
    },


    /**
     * 차트 그리기
     */
    drawFrame: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.chart.setData();

        this.timer = setTimeout(this.drawFrame.bind(this), this.interval);
    },


    /**
     * 트랜잭션 모니터 차트 렌더링 시직
     */
    frameRefresh: function() {
        setTimeout(this.drawFrame.bind(this),10);
    },


    /**
     * 트랜잭션 모니터 차트 렌더링 중지
     */
    frameStopDraw: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
});
