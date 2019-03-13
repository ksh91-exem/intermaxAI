Ext.define('rtm.src.rtmDatabaseChart', {
    extend: 'Ext.container.Container',
    layout: 'fit',
    width : '100%',
    height: '100%',
    style : 'overflow-y: auto; overflow-x: hidden;',

    instanceList: [],

    init: function(){

        this.initProperty();

        this.initLayout();

        this.frameResize();
    },

    initProperty: function() {
        this.normalColor   = "#42A5F6";
        this.warningColor  = "#FF9803";
        this.criticalColor = "#D7000F";
        this.downColor     = "#898989";

        this.scrollPos = 0;      // 선택된 스크롤 점 위치
        this.scrollCnt = 1;      // 표시되는 스크롤 갯수

        this.chartWidth  = 95;   // 화면 크기가 변경될때 사용
        this.chartHeight = 95;

        this.dbObjList = {};

        // MFO 연동 기능 활성화 체크
        this.isEnableMaxGaugeLink = Comm.RTComm.isMaxGaugeLink();
    },

     initLayout: function() {
        if (!this.getEl() || !this.getEl().dom) {
            return;
        }

        this.background = Ext.create('Ext.container.Container', {
            width : '100%',
            height: '100%',
            margin: '0 0 0 10',
            style : {
                position: 'absolute'
            },
            html  : '<div class="page-dot-nav"><ul class="dot-scroll">'
        });

        this.add(this.background);

        var target = this.getEl().dom;

        var baseEl = null, activeEl = null, lockEl = null, cpuEl = null, nameEl = null;
        var activeCount = null, lockCount = null, cpuCount = null;
        var ix, ixLen;

        for (ix = 0, ixLen = this.instanceList.length; ix < ixLen; ix++) {

            baseEl = target.appendChild(document.createElement('div'));
            baseEl.setAttribute('class', 'database-chart');
            baseEl.dataset.dbid = this.instanceList[ix].id;

            cpuEl = baseEl.appendChild(document.createElement('div'));
            cpuEl.setAttribute('class', 'cpu');
            cpuEl.onclick = this.viewDBMonitor.bind(this, this.instanceList[ix].id);

            cpuCount = cpuEl.appendChild(document.createElement('div'));
            cpuCount.setAttribute('class', 'label');
            cpuCount.textContent = '0';

            lockEl = baseEl.appendChild(document.createElement('div'));
            lockEl.setAttribute('class', 'lock');
            lockEl.onclick = this.viewLockTree.bind(this, this.instanceList[ix].id);

            lockCount = lockEl.appendChild(document.createElement('div'));
            lockCount.setAttribute('class', 'label');
            lockCount.textContent = '0';

            activeEl = baseEl.appendChild(document.createElement('div'));
            activeEl.setAttribute('class', 'active');

            activeCount = activeEl.appendChild(document.createElement('div'));
            activeCount.setAttribute('class', 'label');
            activeCount.textContent = '0';

            nameEl = baseEl.appendChild(document.createElement('div'));
            nameEl.setAttribute('class', 'instance_name');
            nameEl.textContent = Ext.String.ellipsis(this.instanceList[ix].name, 14);
            nameEl.title = this.instanceList[ix].name;

            this.dbObjList[this.instanceList[ix].id] = {
                activeEl    : activeEl,
                lockEl      : lockEl,
                cpuEl       : cpuEl,
                activeCount : activeCount,
                lockCount   : lockCount,
                cpuCount    : cpuCount
            };
        }

        baseEl   = null;
        activeEl = null;
        lockEl   = null;
        cpuEl    = null;
        nameEl   = null;
        activeCount = null;
        lockCount   = null;
        cpuCount    = null;
        target      = null;

    },


    /**
     * DB 아이콘에서 CPU 항목을 클릭 시 호출
     */
    viewDBMonitor: function(dbid) {

        // MaxGauge 화면 연계 기능이 활성화 되어 있는 경우 MaxGague 의 single View 화면을 표시함.
        if (this.isEnableMaxGaugeLink) {
            Comm.RTComm.openMaxGaugeSingleView(dbid);
            return;
        }

        var status = Comm.Status.DB[dbid];

        if (status !== realtime.alarms.DISCONNECTED && status !== realtime.alarms.SERVER_DOWN) {

            this.dbmonitor = Ext.create('rtm.src.rtmDBMonitor');
            this.dbmonitor.parent = this;

            this.loadingMask = Ext.create('Exem.LoadingMask', {
                target: this.dbmonitor,
                type  : 'large-whirlpool'
            });

            if (!realtime.openDBMonitor) {
                realtime.openDBMonitor = [];
            }

            if (!Ext.Array.contains(realtime.openDBMonitor, dbid) ) {
                realtime.openDBMonitor[realtime.openDBMonitor.length] = dbid;

                this.dbmonitor.show();
                this.loadingMask.show(null, true);

                setTimeout(function() {
                    this.dbmonitor.init(dbid);
                    dbid = null;
                    this.loadingMask.hide();
                }.bind(this), 5);
            }

        }
        status = null;
    },


    /**
     * DB Monitor 화면이 닫힐때 호출되는 함수
     */
    dbmonitor_release: function() {
        this.dbmonitor = null;
    },


    /**
     * DB 아이콘에서 Lock 항목을 클릭 시 호출
     */
    viewLockTree: function(dbid) {

        // MaxGauge 화면 연계 기능이 활성화 되어 있는 경우 MaxGague 의 single View 화면에서 Lock Tree를 표시함.
        if (this.isEnableMaxGaugeLink) {
            Comm.RTComm.openMaxGaugeLockTreeView(dbid);
            return;
        }

        if (!realtime.openDBLockTreeMonitor) {
            realtime.openDBLockTreeMonitor = [];
        }

        if (!Ext.Array.contains(realtime.openDBLockTreeMonitor, dbid) ) {
            realtime.openDBLockTreeMonitor[realtime.openDBLockTreeMonitor.length] = dbid;

            var view = Ext.create('rtm.src.rtmActiveTxnLockTree',{
                floatingLayer: true
            });

            this.lockmonitor = Ext.create('Exem.XMWindow',{
                title : view.title,
                cls   : 'xm-dock-window-base',
                layout: 'fit',
                width : 800,
                height: 360,
                minWidth : 320,
                minHeight: 200,
                items: [view],
                dbId : dbid,
                listeners: {
                    close: function() {
                        if (realtime.openDBLockTreeMonitor) {
                            Ext.Array.remove(realtime.openDBLockTreeMonitor, this.dbId);
                        }
                    }
                }
            });
            this.lockmonitor.show();

            this.loadingMask = Ext.create('Exem.LoadingMask', {
                target: view
            });
            this.loadingMask.show(null, true);

            setTimeout(function() {
                view.init();

                view = null;
                dbid = null;
                this.lockmonitor = null;

                this.loadingMask.hide();
            }.bind(this), 5);
        }

    },


    /**
     * DB 목록 화면에서 마우스 스크롤시 호출.
     */
    moveScroll: function() {
        if (arguments[0] > 0) {
            if (this.scrollPos > 0) {
                this.scrollPos--;
            } else {
                return;
            }
        } else {
            if (this.scrollPos < this.scrollCnt - 1) {
                this.scrollPos++;
            } else {
                return;
            }
        }

        this.$dotScrollList = this.$dotScroll.find('li a');
        this.$dotScrollList.removeClass('active');
        this.$dotScrollList.eq(this.scrollPos).addClass('active');

        var ix    = null;
        var ixLen = null;
        var baseObj = null;
        var dbid = null;

        for (ix = 0, ixLen = this.instanceList.length; ix < ixLen; ix++) {
            dbid = this.instanceList[ix].id;
            baseObj = this.dbObjList[dbid].cpuEl.parentElement;

            if (ix <  (this.cols * this.scrollPos) ||
                ix >= (this.cols * (this.rows + this.scrollPos)) ) {
                baseObj.style.display = 'none';

            } else {
                baseObj.style.display = '';
            }
        }

        ix      = null;
        ixLen   = null;
        dbid    = null;
        baseObj = null;
    },


    frameResize: function() {
        var width, height;

        try {
            width  = this.getWidth();
            height = this.getHeight();
        } catch (e) {
            return;
        }

        this.$dotScroll = $('#'+this.id).find('.dot-scroll');

        var ix    = null;
        var ixLen = null;

        this.scrollCnt = 1;

        if (this.dbObjList) {
            this.cols = Math.floor(width / this.chartWidth);
            this.rows = Math.floor(height / this.chartHeight);

            var total = this.cols * this.rows;

            var hideCnt = 0;
            var baseObj = null;
            var dbid = null;

            for (ix = 0, ixLen = this.instanceList.length; ix < ixLen; ix++) {
                dbid = this.instanceList[ix].id;

                if (!this.dbObjList[dbid]) {
                    continue;
                }
                baseObj = this.dbObjList[dbid].cpuEl.parentElement;

                if (ix >= total) {
                    baseObj.style.display = 'none';
                    hideCnt++;
                } else {
                    baseObj.style.display = '';
                }
            }
            if (this.cols <= 0) {
                this.scrollCnt = 1;
            } else {
                this.scrollCnt = Math.ceil(hideCnt / this.cols) + 1;
            }

            total   = null;
            hideCnt = null;
            dbid    = null;
            baseObj = null;
        }

        this.$dotScroll.empty();

        if (this.scrollCnt == 1) {
            this.$dotScroll.hide();
        } else {
            this.$dotScroll.show();

            for (ix = 1; ix <= this.scrollCnt; ix++) {
                if (ix == 1) {
                    this.$dotScroll.append('<li><a class="active"></a></li>');
                } else {
                    this.$dotScroll.append('<li><a></a></li>');
                }
            }
        }
        this.$dotScroll.css('top', Math.floor((height - (this.scrollCnt * 25))/2) - 5 +'px');

        var targetId = this.id;

        this.$dotScroll.find('li').bind('click', function() {
            var idx = $(this).index();
            var target = Ext.getCmp(targetId);

            if (target.scrollPos !== idx) {
                 var step = target.scrollPos-idx;
                 for (ix = 0; ix < Math.abs(step); ix++) {
                     target.moveScroll(step);
                 }
                 step   = null;
            }
            target = null;
            idx    = null;

        });

        ix    = null;
        ixLen = null;
    },

    listeners: {
        resize: function(me) {
            me.frameResize();
        }
    }

});