Ext.define('rtm.src.rtmUsageCpu',{
    extend: 'Exem.DockForm',
    title : common.Util.CTR('CPU Usage'),
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

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.envKeyChartFit = 'rtm_' + this.monitorType.toLocaleLowerCase() + '_usageCpuChart_fit';

        this.isFitChart = Comm.RTComm.getBooleanValue(Comm.web_env_info[this.envKeyChartFit]);
    },

    init: function() {

        this.initProperty();

        this.initLayout();

        if (this.selectedServerNames.length > 0 && this.selectedServerNames.length !== this.serverIdArr.length) {
            this.frameChange(this.selectedServerNames);
        }

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

        var serverType = (this.monitorType === 'TP')? 'WAS' : this.monitorType;

        this.barChart = Ext.create('Exem.chart.StackBarChart', {
            color        : barColors,
            devMode      : false,
            isBarStripe  : true,
            barStripeImg : barImg,
            maxValue     : 100,
            maxBarWidth  : 55,
            maxBarHeight : 50,
            minBarWidth  : 18,
            isGroupView  : false, // 인터페이스는 없으나 논리적으로 이해하기 쉽게 만들어둠.
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

        this.barChart.setChartLabels(this.serverIdArr, this.serverNameArr);

        this.barChart.onData = function(adata) {
            if (adata == null || adata.rows.length <= 0) {
                return;
            }

            var idx   = -1;
            var level, cpu;

            _.each(adata.rows, function(v) {

                idx = me.barChart.idArr.indexOf(v[1]);

                if (idx !== -1) {
                    cpu = Math.floor(v[20] / 10) + Math.floor(v[21] / 10) + Math.floor(v[22] / 10);
                    level = me.barChart.bar_objects[idx].level;

                    me.barChart.bar_objects[idx].setValues(
                        (level !== 1 && level !== 2)? cpu : 0,
                        (level === 1)? cpu : 0,
                        (level === 2)? cpu : 0
                    );
                }
            });
            adata = null;
        };

        this.barChart.onAlarm = function(adata) {
            var serverId   = adata[2];
            var alertName  = adata[4];
            var alertValue = adata[5];
            var level      = adata[6];

            if (alertName === realtime.alarms.OS_CPU && +adata[1] === 1) {

                if (me.serverIdArr.indexOf(serverId) === -1 ||
                    me.barChart.idArr.indexOf(serverId) === -1) {

                    return;
                }

                var idx = me.barChart.idArr.indexOf(serverId);

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
        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.frameChange(this.serverNameArr.concat());
    },


    /**
     * 선택된 서버 배열
     *
     * @param {string[]} serverNameList - 서버명 배열
     * @param {string[] | number[]} serverIDList - 서버 ID 배열
     */
    frameChange: function(serverNameList, serverIDList) {

        // 변형 뷰에서는 serverNameList가 넘어오고 그룹 트랜잭션에서는 serverIDList가 넘어온다.
        var serverIdArr = [];
        var serverNameArr;
        var idx, serverName;

        if (serverNameList) {
            for (var i = 0, icnt = serverNameList.length; i < icnt; ++i) {
                serverName = serverNameList[i];
                idx = this.serverNameArr.indexOf(serverName);

                if (idx === -1) {
                    continue;
                }

                serverIdArr.push( this.serverIdArr[idx].toString() );
            }
        }

        if (Ext.isEmpty(serverIDList) !== true) {
            serverIdArr = [].concat(serverIDList);
        }

        if (serverIdArr.length <= 0) {
            serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
            serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();
        } else {
            serverIdArr   = Comm.RTComm.getSortServerID(serverIdArr, this.monitorType);
            serverNameArr = Comm.RTComm.getSortServerNames(serverIdArr, this.monitorType);
        }

        this.barChart.setChartLabels(serverIdArr, serverNameArr);

        serverIdArr   = null;
        serverNameArr = null;
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
