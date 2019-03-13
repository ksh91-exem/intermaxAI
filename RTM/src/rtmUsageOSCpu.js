Ext.define('rtm.src.rtmUsageOSCpu',{
    extend: 'Exem.DockForm',
    title : common.Util.CTR('OS CPU Usage'),
    layout: 'fit',

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, this.barChart);
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.WASSTAT, this.barChart);

            this.frameStopDraw();
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.envKeyChartFit = 'rtm_' + this.monitorType.toLocaleLowerCase() + '_usage_os_CpuChart_fit';

        this.isFitChart = Comm.RTComm.getBooleanValue(Comm.web_env_info[this.envKeyChartFit]);

        // 호스트 목록
        this.displayHostList = [];

        var ix, ixLen, serverId, hostName;

        for (ix = 0, ixLen = this.serverIdArr.length; ix < ixLen; ix++) {
            serverId = this.serverIdArr[ix];

            // 서터 타입이 WAS에 해당하는 것에 대해서만 호스트 목록을 설정한다.
            if (Comm.wasInfoObj[serverId] && Comm.wasInfoObj[serverId].type === 'WAS') {
                hostName = Comm.RTComm.HostRelWAS(serverId);

                if (this.displayHostList.indexOf(hostName) === -1) {
                    this.displayHostList.push(hostName);
                }
            }
        }
    },

    init: function() {

        this.initProperty();

        this.initLayout();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.WASSTAT, this.barChart);
        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this.barChart);
    },


    initLayout: function() {
        var me = this;

        this.background = Ext.create('Exem.Container', {
            cls   : 'rtm-activitygroup-base',
            width : '100%',
            height: '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            margin: '0 0 0 0'
        });

        this.topArea = Ext.create('Exem.Container', {
            width : '100%',
            height: 25,
            layout: 'hbox'
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height: 20,
            margin: '5 0 0 10',
            cls   : 'header-title',
            text  : this.title
        });

        this.expendIcon = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '7 10 0 4',
            html  : '<div class="trend-chart-icon" title="' + common.Util.TR('Expand View') + '"/>',
            listeners: {
                scope: this,
                render: function(me) {
                    me.el.on( 'click', function() {
                        if (this.dockContainer) {
                            this.dockContainer.toggleExpand(this);
                        }
                    }, this);
                },
                show: function() {
                    this.topArea.show();
                }
            }
        });

        this.optionChartFit = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Auto Scale'),
            name    : 'autoRefreshCheckbox',
            cls     : 'rtm-combobox-label',
            margin  : '4 20 0 0',
            checked : this.isFitChart,
            listeners: {
                scope: this,
                change: function(checkbox, newVal) {
                    this.barChart.isFitChart = newVal;
                    this.barChart.fireEvent('resize', this.barChart);

                    common.WebEnv.Save(this.envKeyChartFit, newVal);
                }
            }
        });

        this.topArea.add([ this.frameTitle, {xtype: 'tbspacer', flex : 1}, this.optionChartFit, this.expendIcon]);

        if (this.floatingLayer === true) {
            this.expendIcon.hide();
            this.frameTitle.hide();
        }

        this.pnlCenter = Ext.create('Exem.Panel', {
            bodyCls  : 'group-center-base',
            layout   : 'fit',
            flex     : 1,
            height   : '100%',
            width    : '100%',
            minHeight: 80,
            margin   : '0 5 0 10',
            split    : false,
            border   : false
        });

        var barImg    = Comm.RTComm.getBachartBackImage();
        var barColors = Comm.RTComm.getBachartColors();

        var serverType = (this.monitorType === 'TP') ? 'WAS' : this.monitorType;

        this.barChart = Ext.create('Exem.chart.StackBarChart', {
            color        : barColors,
            devMode      : false,
            isBarStripe  : true,
            barStripeImg : barImg,
            maxValue     : 100,
            maxBarWidth  : 55,
            maxBarHeight : 50,
            minBarWidth  : 18,
            isGroupView  : true, // 인터페이스는 없으나 논리적으로 이해하기 쉽게 만들어둠.
            isCPUView    : true,
            isFitChart   : this.isFitChart,
            isSingleView : false,
            margin       : '0 0 0 0',
            serverType   : serverType
        });
        this.barChart.alarmLevel = {};

        this.background.add([this.topArea, this.pnlCenter]);

        this.add(this.background);

        this.pnlCenter.add(this.barChart);

        // 바차트에서 처리 및 표시할 서버 ID 및 이름 설정
        this.updateServer();

        this.barChart.onData = function(adata) {
            if (adata == null || adata.rows.length <= 0) {
                return;
            }

            var idx   = -1;
            var level = 0;
            var cpu   = 0;
            var hostName;

            _.each(adata.rows, function(v) {
                hostName = Comm.RTComm.HostRelWAS(v[1]);

                idx = me.barChart.nameArr.indexOf(hostName);

                if (idx !== -1) {
                    // OS CPU = OS_CPU_SYS + OS_CPU_USER + OS_CPU_IO
                    cpu = Math.floor(v[20] / 10) + Math.floor(v[21] / 10) + Math.floor(v[22] / 10);
                    level = me.barChart.bar_objects[idx].level;

                    me.barChart.bar_objects[idx].setValues(
                        (level !== 1 && level !== 2) ? cpu : 0,
                        (level === 1) ? cpu : 0,
                        (level === 2) ? cpu : 0
                    );
                }
            });
            adata = null;
        };

        this.barChart.onAlarm = function(adata) {
            var serverId   = adata[2],
                alertName  = adata[4],
                alertValue = adata[5],
                level      = adata[6];

            var hostName = Comm.RTComm.HostRelWAS(serverId),
                idx = me.barChart.nameArr.indexOf(hostName);

            if (alertName === realtime.alarms.OS_CPU && +adata[1] === 1) {

                if (Ext.Array.contains(Comm.wasIdArr, serverId) !== true || me.barChart.nameArr.indexOf(hostName) === -1) {
                    return;
                }

                if (+level === 2) {
                    me.barChart.bar_objects[idx].setValues(0, 0, +alertValue);
                } else if (+level === 1) {
                    me.barChart.bar_objects[idx].setValues(0, +alertValue ,0 );
                } else {
                    me.barChart.bar_objects[idx].setValues( +alertValue ,0 ,0 );
                }
            }
        };
    },


    /**
     * 모니터링 서버 대상 변경
     */
    updateServer: function() {
        var barIdArr    = [];
        var hostNameArr = [];
        var serverId;

        var ix, jx, ixLen, jxLen;

        // 바차트에서 처리 및 표시할 서버 ID 및 호스트명 설정
        for (ix = 0, ixLen = this.displayHostList.length; ix < ixLen; ix++) {
            hostNameArr[ix] = this.displayHostList[ix];
            barIdArr[ix] = [];

            // WAS ID 배열에 TP, C Daemon 정보도 같이 포함이 되어 있어 호스트 이름으로 찾은 ID가
            // 모니터링 대상 서버에 해당하는지 체크 후 설정하게 처리.
            for (jx = 0, jxLen = realtime.HostRelWAS.length; jx < jxLen; jx++) {
                serverId = realtime.HostRelWAS[jx][1];

                if (hostNameArr[ix] == realtime.HostRelWAS[jx][0] && this.serverIdArr.indexOf(serverId) !== -1) {
                    barIdArr[ix].push(serverId);
                }
            }
        }

        // 바차트에서 처리 및 표시할 서버 ID 및 이름 설정
        this.barChart.setChartLabels(barIdArr, hostNameArr);
    },

    frameChange: function(serverNameList) {
        var keys = Object.keys(Comm.wasInfoObj),
            hostNameArr = [], barIdArr = [],
            ix, ixLen, key;

        if (serverNameList.length === 0) {
            this.updateServer();
        } else {
            for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                key = keys[ix];
                if (serverNameList.indexOf(Comm.wasInfoObj[key].wasName) !== -1 && hostNameArr.indexOf(Comm.wasInfoObj[key].host) === -1) {
                    hostNameArr.push(Comm.wasInfoObj[key].host);
                    barIdArr.push(key);
                }
            }

            this.barChart.setChartLabels(barIdArr, hostNameArr);
        }
    },


    /**
     * Start Bar Chart draw.
     */
    frameRefresh: function() {
        if (this.barChart) {
            this.barChart.startAnimationFrame();
        }
    },


    /**
     * Stop Bar chart draw.
     */
    frameStopDraw: function() {
        if (this.barChart) {
            this.barChart.stopAnimationFrame();
        }
    }

});
