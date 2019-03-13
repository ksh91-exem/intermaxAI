Ext.define('rtm.src.rtmTuxULOG', {
    extend : 'Exem.DockForm',
    title  : common.Util.CTR('Tuxedo ULOG'),
    layout: 'fit',

    isClosedDockForm: false,

    listeners: {
        beforedestroy: function(me) {
            me.isClosedDockForm = true;

            me.stopRefreshData();

            me.grid.removeAll();
        }
    },


    initProperty: function() {
        this.monitorType  = 'TUX';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.autoRefreshCheck = true;
    },


    init: function() {
        this.initProperty();
        this.initLayout();
        this.frameRefresh();
    },


    /**
     * 기본 레이아웃 구성
     */
    initLayout: function() {

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            border: 1,
            cls   : 'rtm-topsql-base'
        });

        this.topContentsArea  = Ext.create('Exem.Container',{
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '5 0 0 0'
        });

        this.expendIcon = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '2 10 0 0',
            html  : '<div class="trend-chart-icon" title="' + common.Util.TR('Expand View') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on('click', function() {
                        this.dockContainer.toggleExpand(this);
                    }, this);
                }
            }
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 20,
            margin : '0 0 0 10',
            cls    : 'header-title',
            text   : this.title
        });

        this.centerArea = Ext.create('Exem.Container',{
            width  : '100%',
            height : '100%',
            layout : 'fit',
            flex   : 1,
            margin : '5 10 10 10'
        });

        this.filterMessage = Ext.create('Ext.form.field.Text', {
            cls       : 'rtm-list-condition',
            fieldLabel: common.Util.TR('Message'),
            labelWidth: 60,
            width     : 170,
            margin    : '0 10 0 10',
            labelSeparator: '',
            enableKeyEvents : true,
            value     : '%',
            trigger1Cls: Ext.baseCSSPrefix + 'form-clear-trigger',
            onTrigger1Click: function() {
                var me = this;
                if (me.hideTrigger) {
                    return;
                }
                me.setValue('%');
            },
            listeners: {
                scope: this,
                blur: function(me) {
                    if (me.oldValue !== me.value) {
                        me.oldValue = me.value;
                        this.executeSQL();
                    }
                },
                specialkey: function(me, e) {
                    if (e.getKey() === e.ENTER && me.oldValue !== me.value) {
                        me.oldValue = me.value;
                        this.executeSQL();
                    }
                }
            }
        });

        this.autoRefreshBox = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Auto Refresh'),
            name    : 'autoRefreshCheckbox',
            margin  : '0 20 0 10',
            cls     : 'rtm-checkbox-label',
            checked : true,
            listeners: {
                scope: this,
                change: function(checkbox, val) {
                    this.autoRefreshCheck = val;
                }
            }
        });

        this.topContentsArea.add([
            this.frameTitle, {xtype: 'tbfill'},
            this.filterMessage,
            this.autoRefreshBox,
            this.expendIcon
        ]);

        this.background.add([this.topContentsArea, this.centerArea]);

        this.createGrid();

        this.add(this.background);

        // 플로팅 상태에서는 title hide
        if (this.floatingLayer) {
            this.frameTitle.hide();
            this.expendIcon.hide();
        }
    },


    /**
     * 그리드 생성
     */
    createGrid: function() {

        this.grid = Ext.create('Exem.BaseGrid', {
            width         : '100%',
            height        : '100%',
            localeType    : 'm-d H:i:s',
            usePager      : false,
            borderVisible : true,
            defaultbufferSize : 0,
            defaultPageSize   : 0,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title
        });

        this.grid.beginAddColumns();
        this.grid.addColumn(common.Util.CTR('Time'            ), 'time'         , 100, Grid.DateTime     , true,  false);
        this.grid.addColumn(common.Util.CTR('Node Name'       ), 'nodeName'     , 110, Grid.String       , true,  false);
        this.grid.addColumn(common.Util.CTR('Process Name'    ), 'process_name' , 110, Grid.String       , true,  false);
        this.grid.addColumn(common.Util.CTR('Process ID'      ), 'process_id'   ,  90, Grid.StringNumber , true,  false);
        this.grid.addColumn(common.Util.CTR('Message Type'    ), 'message_type' , 110, Grid.String       , true,  false);
        this.grid.addColumn(common.Util.CTR('Message'         ), 'message'      , 300, Grid.String       , true,  false);
        this.grid.addColumn(common.Util.CTR('Message No'      ), 'message_no'   ,  60, Grid.String       , true,  false);
        this.grid.setOrderAct('time', 'desc');
        this.grid.endAddColumns();

        this.grid._columnsList[6].flex = 1;
        this.grid._columnsList[6].minWidth = 100;

        this.centerArea.add(this.grid);

        this.grid.drawGrid();
    },


    /**
     * 데이터 새로고침을 중지.
     */
    stopRefreshData: function() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
    },


    /**
     * TP Slog 데이터 로드
     * 데이터 새로 고침 간격 (1분)
     */
    frameRefresh: function() {
        this.stopRefreshData();

        var isDisplayCmp = Comm.RTComm.isEnableRtmView(this.openViewType);

        if (isDisplayCmp && this.autoRefreshCheck) {
            this.executeSQL();
        }

        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), 1000 * 60 * 1);
    },


    /**
     * 쿼리 실행
     */
    executeSQL: function() {

        var lastTime = Comm.RTComm.getCurrentServerTime(realtime.lastestTime);

        if (Comm.RTComm.isValidDate(lastTime) !== true) {
            console.debug('%c [Tuxedo ULOG] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'Invalid Date: ' + realtime.lastestTime);

            if (!this.beforeLastestTime) {
                this.beforeLastestTime = +new Date();
            }
            lastTime = new Date(this.beforeLastestTime);

        } else {
            this.beforeLastestTime = realtime.lastestTime;
        }

        // 조회 범위 설정 - 최근 시간에서 1분 전 데이터 조회
        var fromtime = Ext.Date.format(Ext.Date.subtract(lastTime, Ext.Date.MINUTE, 1), 'Y-m-d H:i:s.u');
        var totime   = Ext.Date.format(lastTime, 'Y-m-d H:i:s.u');

        // Error Message 조회 조건 설정
        var errorMessage = this.filterMessage.value;
        if (errorMessage === '%') {
            errorMessage = '';
        } else {
            errorMessage = 'AND message LIKE \'' + errorMessage + '\'';
        }

        var idArr = Comm.selectedTuxArr.join(',');

        WS.SQLExec({
            sql_file: 'IMXRT_Tux_ULOG.sql',
            bind: [
                { name: 'from_time', value: fromtime, type: SQLBindType.STRING },
                { name: 'to_time',   value: totime,   type: SQLBindType.STRING }
            ],
            replace_string: [{
                name : 'server_id',
                value:  idArr
            },{
                name : 'message',
                value:  errorMessage
            }]
        }, function(aheader, adata) {
            if (this.isClosedDockForm) {
                return;
            }

            var isValid = common.Util.checkSQLExecValid(aheader, adata);

            if (isValid) {
                this.drawData(adata);
            }

        }, this);
    },


    getErrorLevelText: function(value) {
        var errText;
        switch (value) {
            case 'F':
                errText = 'Fatal';
                break;
            case 'E':
                errText = 'Error';
                break;
            case 'W':
                errText = 'Warning';
                break;
            case 'I':
                errText = 'Info';
                break;
            default:
                errText = value;
                break;
        }

        return errText;
    },

    /**
     * TP Slog 데이터 그리기
     *
     * @param {object} adata - 조회 데이터
     */
    drawData: function(adata) {
        this.grid.clearRows();

        var data;
        var ix, ixLen;

        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            data = adata.rows[ix];

            this.grid.addRow([
                data[0],
                data[1],
                data[2],
                data[3],
                data[4],
                data[5],
                data[6]
            ]);
        }

        this.grid.drawGrid();

        adata = null;
    }
});
