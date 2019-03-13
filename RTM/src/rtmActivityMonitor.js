Ext.define('rtm.src.rtmActivityMonitor', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('Activity Monitor'),
    layout : {
        type: 'vbox',
        align: 'middle',
        pack : 'center'
    },
    cls   : 'rtm-activity-base',

    listeners: {
        beforedestroy: function() {
            if (this.checkTimerInc) {
                clearTimeout(this.checkTimerInc);
            }

            if (this.viewBullet) {
                Ext.Array.remove(realtime.BulletList, this.viewBullet.id);
                Ext.Array.remove(Comm.onActivityTarget, this.viewBullet);
                clearInterval(this.viewBullet.dataRefreshTimer);
                clearTimeout(this.viewBullet.animationTimer);

                this.frameStopDraw();
            }
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.rtmActiveTxnListClass = 'rtm.src.rtmActiveTxnList';
    },

    init: function() {
        this.initProperty();

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: 145,
            minHeight: 145,
            maxHeight: 145,
            layout: 'fit',
            flex  : 1,
            margin: '-5 0 0 0'
        });
        this.add(this.background);

        var colors;
        var theme = Comm.RTComm.getCurrentTheme();

        switch (theme) {
            case 'Black' :
                colors = realtime.BulletBlackColors;
                break;
            case 'White' :
                colors = realtime.BulletWhiteColors;
                break;
            default :
                colors = realtime.BulletGrayColors;
                break;
        }

        this.viewBullet = Ext.create('Exem.chart.Bullet', {
            color  : colors,
            devMode: false,
            labelPosY: ((window.nation === 'ja')? -2 : 0),
            hideBulletTxnLevel: common.Menu.hideBulletTxnLevel
        });

        this.selectedserverIdArr = Comm.RTComm.getSelectedIdArr(this.monitorType);
        this.viewBullet.selectedServerIdArr = this.selectedserverIdArr.concat();

        this.background.add(this.viewBullet);

        if (!realtime.BulletList) {
            realtime.BulletList = [];
        }

        var isContain = Ext.Array.contains(realtime.BulletList, this.viewBullet.id);
        if (isContain === false) {
            realtime.BulletList[realtime.BulletList.length] = this.viewBullet.id;
        }

        this.addEvents();

        this.checkRTMView();

        colors    = null;
    },


    /**
     * Activity 모니터 화면에 이벤트 처리 설정
     */
    addEvents: function() {
        // 액티브 트랜잭션 목록을 표시하는데 클래스 명이 설정되지 않은 경우 표시하지 않음.
        if (!this.rtmActiveTxnListClass) {
            return;
        }

        this.el.on('dblclick', function() {
            common.OpenView.onMenuPopup(this.rtmActiveTxnListClass);
        }, this);
    },


    /**
     * 모니터링 서버 대상 변경
     */
    updateServer: function() {
        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.frameChange(this.serverNameArr.concat());
    },


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
                serverIdArr[serverIdArr.length] = +this.serverIdArr[idx];
            }
        }

        if (serverIdArr.length <= 0) {
            serverIdArr = this.serverIdArr.concat();
        }

        this.selectedserverIdArr = serverIdArr;
        this.viewBullet.selectedServerIdArr = this.selectedserverIdArr.concat();

        serverIdArr    = null;
        serverNameList = null;
    },


    frameRefresh: function(){
        this.viewBullet.startAnimationFrame();
    },


    frameStopDraw: function(){
        this.viewBullet.stopAnimationFrame();
    },


    checkRTMView: function() {
        if (this.checkTimerInc) {
            clearTimeout(this.checkTimerInc);
        }

        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (isDisplayCmp !== true && this.isRunAnimate !== false) {
            this.viewBullet.stopAnimationFrame();
            this.isRunAnimate = false;
        } else {
            this.isRunAnimate = true;
        }

        this.checkTimerInc = setTimeout(this.checkRTMView.bind(this), 5000);
    }

});
