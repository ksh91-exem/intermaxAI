Ext.define('rtm.src.rtmActivityGroup', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('Activity Group Monitor'),
    layout : {
        type: 'vbox',
        align: 'middle',
        pack : 'center'
    },

    listeners: {
        beforedestroy: function() {
            this.stopRefreshData();

            if (this.checkTimerInc) {
                clearTimeout(this.checkTimerInc);
            }

            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ACTIVITY, this.barChart);
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ACTIVITY, this.totalBarChart);

            if (this.viewBullet) {
                clearInterval(this.viewBullet.dataRefreshTimer);
                clearTimeout(this.viewBullet.animationTimer);

                this.frameStopDraw();
            }
        },
        hide: function() {
            this.frameStopDraw();
        },
        show: function() {
            if (this.viewBullet && this.viewBullet.resize === false) {
                this.viewBullet.resize = true;
            }
        }
    },

    initProperty: function() {
        this.monitorType = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        if (!this.componentId) {
            this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
        }

        this.groupName = Comm.RTComm.getActivityGroupConfig(this.componentId);
    },

    init: function() {

        this.initProperty();

        this.background = Ext.create('Exem.Container', {
            cls   : 'rtm-activitygroup-base',
            width : '100%',
            height: 145,
            layout: 'border',
            flex  : 1,
            margin: '0 0 0 0'
        });

        this.pnlCenter = Ext.create('Exem.Panel', {
            bodyCls : 'group-center-base',
            layout  : 'vbox',
            region  : 'center',
            height  : '100%',
            width   : '100%',
            minHeight: 145,
            margin  : '0 0 0 0',
            split   : false,
            border  : false
        });

        this.pnlCenterTop = Ext.create('Exem.Panel', {
            bodyCls : 'group-center-top-base',
            layout   : 'fit',
            width    : '100%',
            minHeight: 120,
            margin   : '0 0 0 0',
            border   : true,
            bodyStyle: {'background': 'transparent'}
        });

        this.pnlCenterBottom = Ext.create('Exem.Panel', {
            bodyCls : 'group-center-bottom-base',
            layout   : 'fit',
            width    : '100%',
            flex     : 1,
            minHeight: 60,
            margin   : '0 10 0 10',
            border   : false,
            bodyStyle: {'background': 'transparent'}
        });

        this.pnlSide = Ext.create('Exem.Panel', {
            bodyCls : 'group-left-base',
            layout: {
                type: 'vbox',
                align: 'center'
            },
            region  : 'west',
            height  : '100%',
            margin  : '0 0 0 0',
            split   : false,
            border  : true
        });

        this.pnlBarSide = Ext.create('Exem.Panel', {
            bodyCls : 'group-left-bar-base',
            layout  : 'fit',
            region  : 'west',
            margin  : '0 0 0 0',
            split   : false,
            border  : false
        });

        this.pnlBottom = Ext.create('Exem.Panel', {
            bodyCls : 'group-bottom-base',
            layout  : 'fit',
            region  : 'south',
            width   : '100%',
            margin  : '0 0 0 0',
            split   : false,
            border  : false
        });

        var colors;
        var barColors;
        var barImg;

        var theme = Comm.RTComm.getCurrentTheme();

        switch (theme) {
            case 'Black' :
                colors = realtime.BulletBlackColors;
                barColors = realtime.BarChartColor.Black;
                barImg = '../images/EqualTopBlack_3_2Pixel.png';
                break;
            case 'White' :
                colors = realtime.BulletWhiteColors;
                barColors = realtime.BarChartColor.White;
                barImg = '../images/EqualTopWhite_3_2Pixel.png';
                break;
            default :
                colors = realtime.BulletGrayColors;
                barColors = realtime.BarChartColor.Gray;
                barImg = '../images/EqualTopGray_3_2Pixel.png';
                break;
        }

        this.viewBullet = Ext.create('Exem.chart.BulletS', {
            color  : colors,
            devMode: false
        });

        this.barChart = Ext.create('Exem.chart.BarChart', {
            color       : barColors,
            maxBarWidth : 60,
            devMode     : false,
            isBarStripe : true,
            maxValue    : 30,
            barStripeImg: barImg,
            maxBarHeight: 50,
            margin      : '0 0 0 0'
        });

        this.totalBarChart = Ext.create('Exem.chart.BarChart', {
            color       : barColors,
            devMode     : false,
            totalMode   : true,
            isBarStripe : true,
            barStripeImg: barImg,
            maxValue    : 60,
            sumLabel    : common.Util.TR('Total')
        });

        var html =
            '<div class="activity-status-template">' +
            '<div class="box"><div class="stat"> '+common.Util.CTR('Active Transactions')  +'</div><div class="value">0</div></div>' +
            '<div class="box"><div class="stat"> '+common.Util.CTR('TPS(INPUT)') +'</div><div class="value">0</div></div>' +
            '<div class="box"><div class="stat"> '+common.Util.CTR('Elapse Time')          +'</div><div class="value">0</div></div>' +
            '<div class="box"><div class="stat"> '+common.Util.CTR('Concurrent Users')     +'</div><div class="value">0</div></div>' +
            '<div class="box"><div class="stat"> '+common.Util.CTR('Execution Count')      +'</div><div class="value">0</div></div>' +
            '<div class="box"><div class="stat"> '+common.Util.CTR('Visitor Count')        +'</div><div class="value">0</div></div>' +
            '</div>'
        ;

        this.statusArea = Ext.create('Ext.container.Container', {
            cls   : 'status-area-base',
            width : 140,
            height: 130,
            margin: '5 5 5 5',
            html  : html
        });

        this.selectedWasId   = [];
        this.selectedWasName = [];

        this.groupNameCombo = Ext.create('Exem.AjaxComboBox',{
            cls   : 'rtm-list-condition',
            width : 140,
            height: 20,
            margin: '15 5 0 5',
            listeners: {
                scope: this,
                select: function(combo) {
                    this.groupName = combo.getValue();
                    var selectWasId = Comm.RTComm.WASListInGroup(this.groupName);
                    var selectWasName = [];

                    for (var ix = 0; ix < selectWasId.length; ix++) {
                        selectWasName[selectWasName.length] = Comm.wasInfoObj[selectWasId[ix]].wasName;
                    }

                    this.barChart.setChartLabels(selectWasId, selectWasName);
                    this.totalBarChart.setChartLabels(selectWasId, selectWasName);
                    this.viewBullet.setSelectedWas(selectWasId);

                    this.selectedWasId.length = 0;
                    this.selectedWasId = selectWasId;
                    this.selectedWasName = selectWasName;

                    Comm.RTComm.saveActivityGroupConfig(this.componentId, this.groupName);

                    selectWasId     = null;
                    selectWasName   = null;
                }
            }
        });

        this.statusAreaBar = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width : 50,
            height: 200,
            border: false,
            margin: '10 5 5 0'
        });

        this.background.add([this.pnlCenter, this.pnlBarSide, this.pnlSide]);
        this.add(this.background);

        this.statusAreaBar.add(this.totalBarChart);

        this.pnlBarSide.add(this.statusAreaBar);
        this.pnlSide.add(this.groupNameCombo, this.statusArea);

        this.pnlCenterTop.add(this.viewBullet);
        this.pnlCenterBottom.add(this.barChart);

        this.pnlCenter.add(this.pnlCenterTop, this.pnlCenterBottom);

        this.setComboData();

        this.viewBullet.setSelectedWas(this.selectedWasId, this.selectedWasName);
        this.barChart.setChartLabels(this.selectedWasId, this.selectedWasName);
        this.totalBarChart.setChartLabels(this.selectedWasId, this.selectedWasName);

        this.stat1 = $('#'+this.id+' .activity-status-template .value')[0];
        this.stat2 = $('#'+this.id+' .activity-status-template .value')[1];
        this.stat3 = $('#'+this.id+' .activity-status-template .value')[2];
        this.stat4 = $('#'+this.id+' .activity-status-template .value')[3];
        this.stat5 = $('#'+this.id+' .activity-status-template .value')[4];
        this.stat6 = $('#'+this.id+' .activity-status-template .value')[5];

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ACTIVITY, this.barChart);
        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ACTIVITY, this.totalBarChart);

        this.refreshData();

        this.checkRTMView();
    },


    setComboData: function() {
        var statName;
        var display,
            selectedIndex = Comm.bizGroups.indexOf(this.groupName);

        var comboData = [];

        var ix, ixLen;

        for (ix = 0, ixLen = Comm.bizGroups.length; ix < ixLen ; ix++ ) {
            statName = Comm.bizGroups[ix];
            display  = Comm.bizGroups[ix];
            comboData.push({name: display, value: statName});
        }

        this.groupNameCombo.setData(comboData);
        this.groupNameCombo.setSearchField( 'name' );

        if (selectedIndex < 0) {
            if (!this.componentId) {
                this.componentId = Comm.RTComm.getRtmComponentId(this.$className);
            }

            this.groupName = Comm.RTComm.getDashboardActiveGroup(this.componentId);
            if(!this.groupName){
                this.groupName = Comm.bizGroups[0];
            }
        }

        this.groupNameCombo.selectByIndex(Comm.bizGroups.indexOf(this.groupName));

        this.selectedWasId = Comm.RTComm.WASListInGroup(this.groupName);

        for (ix = 0, ixLen = this.selectedWasId.length; ix < ixLen; ix++) {
            this.selectedWasName[this.selectedWasName.length] = Comm.wasInfoObj[this.selectedWasId[ix]].wasName;
        }
    },


    stopRefreshData: function() {
        if (this.timerIncChart) {
            clearTimeout(this.timerIncChart);
        }
    },


    refreshData: function() {
        this.stopRefreshData();
        this.drawData();

        this.timerIncChart = setTimeout(this.refreshData.bind(this), 3000);
    },


    drawData: function() {
        if (this.selectedWasId.length <= 0) {
            return;
        }

        var activeTxn    = 0;     // 액티브 트랜잭션
        var requestRate  = 0;     // 초당입력 처리건수
        var elapseTime   = 0;     // 수행 시간
        var concurrents  = 0;     // 동시 사용자수
        var txnEndCount  = 0;     // 실행 건수
        var visitorCount = 0;     // 방문자 수

        var trendData;
        var dailyData;

        var count = 0;
        var serverId, isDown;

        for (var ix = 0; ix < this.selectedWasId.length; ix++) {
            serverId = this.selectedWasId[ix];

            isDown = Comm.RTComm.isDownByID(serverId);

            if (isDown) {
                continue;
            }

            trendData = Repository.trendChartData[serverId];
            dailyData = Repository.WasMonitorDaily[serverId];

            if (trendData) {
                activeTxn    += +trendData.ACTIVE_TRANSACTION;
                requestRate  += +trendData.REQUEST_RATE;
                elapseTime   += +trendData.TXN_ELAPSE;
                count++;
            }

            if (dailyData) {
                concurrents  += +dailyData.current_users;
                txnEndCount  += +dailyData.execute_count;
                visitorCount += +dailyData.visitor;
            }
        }

        if (elapseTime !== 0) {
            // 선택된 그룹에 포함된 서버들의 평균 수행시간을 설정
            elapseTime = elapseTime/count || 0;
        }

        trendData = null;
        dailyData = null;

        this.stat1.textContent = Ext.util.Format.number(activeTxn   , '0,000');
        this.stat2.textContent = Ext.util.Format.number(requestRate , '0,000');
        this.stat3.textContent = Ext.util.Format.number(elapseTime  , '0,000.00');

        this.stat4.textContent = Ext.util.Format.number(concurrents , '0,000');
        this.stat5.textContent = Ext.util.Format.number(txnEndCount , '0,000');
        this.stat6.textContent = Ext.util.Format.number(visitorCount, '0,000');
    },


    frameRefresh: function(){
        if (this.viewBullet && !this.hidden) {
            this.viewBullet.startAnimationFrame();
            this.isRunAnimate = true;
        }
    },

    frameStopDraw: function(){
        if (this.viewBullet) {
            this.viewBullet.stopAnimationFrame();
            this.isRunAnimate = false;
        }
    },

    /**
     * 일정 간격으로 실시간 화면인지 체크.
     * 실시간 화면이 아니거나 컴포넌트가 숨겨져 있는 경우 애니메이션 처리를 중지한다.
     */
    checkRTMView: function() {
        if (this.checkTimerInc) {
            clearTimeout(this.checkTimerInc);
        }

        // 실시간 화면에 WAS, TP, WEB, E2E 화면이 추가되면서 현재 활성화된 화면에
        // 대해서만 처리가 되게 변경함.
        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        // 실시간 화면이 아니거나 컴포넌트가 숨겨져 있는 경우 애니메이션 처리를 중지
        if ((isDisplayCmp !== true || this.hidden) && this.isRunAnimate !== false) {
            this.frameStopDraw();
        }

        this.checkTimerInc = setTimeout(this.checkRTMView.bind(this), 5000);
    }

});
