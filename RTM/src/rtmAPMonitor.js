/**
 * Created by 신정훈 on 2017-01-12.
 */
Ext.define('rtm.src.rtmAPMonitor', {
    extend: 'Exem.DockForm',
    title: common.Util.CTR('AP Monitor'),
    layout: 'fit',
    width: '100%',
    height: '100%',

    isClosedDockForm: false,

    listeners: {
        beforedestroy: function () {
            this.isClosedDockForm = true;

            this.stopRefreshData();
        }
    },

    init: function () {
        this.initProperty();

        this.initLayout();

        this.frameRefresh();
    },


    initProperty: function() {
        // AP 모니터 옵션 설정
        var webEnvData;
        if (Comm.web_env_info.rtm_ap_monitor_option) {
            webEnvData = JSON.parse(Comm.web_env_info.rtm_ap_monitor_option);
        }

        this.gridLimitCount  = webEnvData ? webEnvData.gridLimitCount  || 20  : 20;
        this.refreshInterval = webEnvData ? webEnvData.refreshInterval || 30 : 30;
        this.selectTimeRange = webEnvData ? webEnvData.selectTimeRange || 10 : 10;

        this.checkTimeInterval = 30;
        this.refreshTimer = 0;
        this.comboboxTimer = 0;
    },


    /**
     * 기본 레이어 구성
     */
    initLayout: function () {

        /**
         * 전체 영역
         */
        this.background = Ext.create('Exem.Container', {
            width: '100%',
            height: '100%',
            layout: 'vbox',
            border    : 1,
            cls: 'rtm-tablespace-base'
        });

        /**
         * 타이틀 영역
         */
        this.titleArea = Ext.create('Exem.Container', {
            width : '100%',
            height: 30,
            margin: '5 0 5 0',
            layout: 'hbox'
        });

        this.frameTitle = Ext.create('Ext.form.Label', {
            height: 20,
            margin: '0 0 0 10',
            cls   : 'header-title',
            text  : common.Util.CTR('AP Monitor')
        });

        //comboBox
        this.wasCombo = Ext.create('Exem.wasDBComboBox', {
            cls             : 'rtm-list-condition',
            selectType      : common.Util.TR('Agent'),
            multiSelect     : true,
            width           : 350,
            comboWidth      : 230,
            comboLabelWidth : 60,
            isRTM           : true
        });

        //option
        this.optionButton = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '5 10 0 0',
            html  : '<div class="frame-option-icon" title="' + common.Util.TR('option') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on( 'click', function() {
                        this.optionWindow.show();
                    }, this);
                }
            }
        });

        //grid
        this.gridFrame = Ext.create('Exem.Container', {
            width: '100%',
            height: '100%',
            flex: 1,
            margin: '0 10 10 5'
        });

        this.add(this.background);

        this.titleArea.add([this.frameTitle,this.wasCombo,{xtype: 'tbfill', flex: 1 },this.optionButton]);

        this.background.add([this.titleArea, this.gridFrame]);

        if (this.floatingLayer) {
            this.frameTitle.hide();
        }

        this.createOptionWindow();

        this.createGrid(this.gridFrame);

        this.addContextMenu();

        this.setRefreshOnComboBoxChange();
    },


    /**
     * 콤보박스에서 선택된 WAS가 변경될 때 변경된 WAS 값으로 목록을 새로고침.
     *
     * wasDBComboBox 에서 change event가 발생할 때 처리하려고 하였으나 값을 변경했을 때
     * Change 이벤트가 한번만 발생하지 않고 여러번 발생되거나 발생되지 않는 경우가 있어서
     * 별도로 값이 변경되었는지를 체크해서 목록을 새로고침하게 처리.
     */
    setRefreshOnComboBoxChange: function() {
        this.isFocus = false;

        this.wasCombo.WASDBCombobox.on({
            scope : this,
            focus: function() {
                this.isFocus = true;
            },
            blur: function(me) {
                if (!me.oldSelectedWas) {
                    me.oldSelectedWas = [];
                }

                if (Ext.Array.difference(me.oldSelectedWas, me.getValue()).length > 0 ||
                    Ext.Array.difference(me.getValue(), me.oldSelectedWas).length > 0) {

                    me.oldSelectedWas = me.getValue();

                    if (this.comboboxTimer) {
                        clearTimeout(this.comboboxTimer);
                    }
                    this.comboboxTimer = setTimeout(this.frameRefresh.bind(this), 1000);
                }
                this.isFocus = false;
            },
            change: function(me) {
                if (!this.isFocus) {
                    me.oldSelectedWas = arguments[1];

                    if (this.comboboxTimer) {
                        clearTimeout(this.comboboxTimer);
                    }
                    this.comboboxTimer = setTimeout(this.frameRefresh.bind(this), 1000);
                }
            }
        });
    },


    createGrid: function (target) {
        this.monitorGrid = Ext.create('Exem.BaseGrid', {
            usePager: false,
            borderVisible: true,
            localeType: 'H:i:s',
            columnLines: true,
            baseGridCls: 'baseGridRTM',
            exportFileName: this.title,
            useEmptyText: true,
            emptyTextMsg: common.Util.TR('No data to display')
        });

        this.monitorGrid.beginAddColumns();
        this.monitorGrid.addColumn(common.Util.CTR('Time'),             'time',             90,  Grid.String, true, false);
        this.monitorGrid.addColumn(common.Util.CTR('Agent'),            'was_name',         90,  Grid.String, true, false);
        this.monitorGrid.addColumn(common.Util.CTR('Login Name'),       'login_name',       90,  Grid.String, true, false);
        this.monitorGrid.addColumn(common.Util.CTR('GUID'),             'guid',             90,  Grid.String, true, false);
        this.monitorGrid.addColumn(common.Util.CTR('Business Name'),    'business_name',    90,  Grid.String, true, false);
        this.monitorGrid.addColumn(common.Util.CTR('Error Code'),       'error_code',       120, Grid.String, true, false);
        this.monitorGrid.addColumn(common.Util.CTR('Error Message'),    'error_message',    200, Grid.String, true, false);
        this.monitorGrid.addColumn(common.Util.CTR('TID'),              'tid',              80,  Grid.String, false, true);
        this.monitorGrid.addColumn(common.Util.CTR('WAS ID'),           'wasid',            80,  Grid.String, false, true);
        this.monitorGrid.endAddColumns();
        target.add(this.monitorGrid);
    },


    addContextMenu: function() {
        this.monitorGrid.contextMenu.addItem({
            title : common.Util.TR('Transaction Detail'),
            itemId: 'txn_detail',
            fn: function() {
                var currentWidth = 1500;
                var currentHeight  = 1000;

                var r = this.up().record;

                var fT = new Date(r.time).setMilliseconds(0) - 1000 * 60 * 30;
                var tT = new Date(r.time).setMilliseconds(0) + 1000 * 60;

                var elapseDistRange = {
                    fromTime  : Ext.Date.format( new Date(fT), 'Y-m-d H:i:s' ),
                    toTime    : Ext.Date.format( new Date(tT), 'Y-m-d H:i:s' ),
                    minElapse : 0,
                    maxElapse : 100000000,
                    clientIp  : '',
                    txnName   : '',
                    exception : '',
                    loginName : '',
                    tid       : r.tid,
                    wasId     : r.wasid
                };

                localStorage.setItem('InterMax_PopUp_Param', JSON.stringify(elapseDistRange));

                var popupOptions = 'scrollbars=yes, width=' + currentWidth + ', height=' + currentHeight;
                realtime.txnPopupMonitorWindow = window.open('../txnDetail/txnDetail.html', 'hide_referrer_1', popupOptions);
            }
        }, 0);
    },


    /**
     * 알람 내역 삭제 주기를 설정하는 옵션창 구성.
     */
    createOptionWindow: function () {
        var webEnvData;

        this.optionWindow = Ext.create('Exem.XMWindow', {
            title: common.Util.TR('AP Monitor Option'),
            width: 280,
            height: 210,
            resizable: false,
            maximizable: false,
            closable: false,
            isChangeMode: false,
            closeAction: 'hide',
            modal: true,
            cls: 'xm-dock-window-base'
        });

        this.checkTimeInterval = webEnvData ? webEnvData.timeout : 30;

        var baseCon, topCon, bottomCon, okBtn, cancelBtn;
        var gridTimeoutCon, timeRangeCon;
        var gridUnitLabel, timeRangeLabel;

        baseCon = Ext.create('Exem.Container', {
            layout: 'vbox',
            flex: 1
        });

        this.optionWindow.add(baseCon);

        topCon = Ext.create('Exem.Container', {
            layout: {
                type: 'vbox',
                pack: 'center'
            },
            height: 110,
            margin: '6 0 0 10'
        });

        bottomCon = Ext.create('Exem.Container', {
            width: '100%',
            height: 30,
            layout: {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            }
        });

        baseCon.add(topCon, bottomCon);

        this.optionWindow.gridBufSize = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.TR('Limit Rows'),
            labelAlign: 'right',
            allowBlank: false,
            width     : 190,
            labelWidth: 140,
            maxLength : 3,
            maxValue  : 100,
            minValue  : 10,
            value     : this.gridLimitCount,
            enforceMaxLength: true,
            enableKeyEvents: true,
            hideTrigger: false,
            cls: 'rtm-list-condition'
        });

        gridTimeoutCon = Ext.create('Exem.Container', {
            layout: 'hbox',
            height: 30
        });

        this.optionWindow.intervalTime = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.TR('Auto Refresh') + ' ' + common.Util.TR('Interval'),
            labelAlign: 'right',
            allowBlank: false,
            width     : 190,
            labelWidth: 140,
            maxLength : 2,
            maxValue  : 60,
            minValue  : 10,
            value     : this.refreshInterval,
            enforceMaxLength: true,
            enableKeyEvents: true,
            hideTrigger: false,
            cls: 'rtm-list-condition'
        });

        gridUnitLabel = Ext.create('Ext.form.Label', {
            text: '(' + common.Util.TR('Sec') + ')',
            width: 30,
            margin: '4 0 0 4',
            cls: 'rtm-default-label'
        });

        timeRangeCon = Ext.create('Exem.Container', {
            layout: 'hbox',
            height: 30
        });

        this.optionWindow.timeRange = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.TR('Time Range'),
            labelAlign: 'right',
            allowBlank: false,
            width     : 190,
            labelWidth: 140,
            maxLength : 3,
            maxValue  : 600,
            minValue  : 1,
            value     : this.selectTimeRange,
            enforceMaxLength: true,
            enableKeyEvents: true,
            hideTrigger: false,
            cls: 'rtm-list-condition'
        });

        timeRangeLabel = Ext.create('Ext.form.Label', {
            text: '(' + common.Util.TR('Minute') + ')',
            width: 30,
            margin: '4 0 0 4',
            cls: 'rtm-default-label'
        });

        gridTimeoutCon.add(this.optionWindow.intervalTime, gridUnitLabel);
        timeRangeCon.add(this.optionWindow.timeRange, timeRangeLabel);
        topCon.add(this.optionWindow.gridBufSize, timeRangeCon, gridTimeoutCon);

        okBtn = Ext.create('Exem.Button', {
            text: common.Util.TR('OK'),
            height: 25,
            cls: 'rtm-btn',
            listeners: {
                scope: this,
                click: function () {
                    var dataObj = {
                        gridLimitCount : this.optionWindow.gridBufSize.getValue(),
                        refreshInterval: this.optionWindow.intervalTime.getValue(),
                        selectTimeRange: this.optionWindow.timeRange.getValue()
                    };
                    common.WebEnv.Save('rtm_ap_monitor_option', JSON.stringify(dataObj), null);

                    this.gridLimitCount  = dataObj.gridLimitCount;
                    this.refreshInterval = dataObj.refreshInterval;
                    this.selectTimeRange = dataObj.selectTimeRange;

                    this.optionWindow.close();

                    this.frameRefresh();
                }
            }
        });

        cancelBtn = Ext.create('Exem.Button', {
            text: common.Util.TR('Cancel'),
            height: 25,
            cls: 'rtm-btn',
            listeners: {
                scope: this,
                click: function () {
                    this.optionWindow.close();
                }
            }
        });

        bottomCon.add(okBtn, {xtype: 'tbspacer', width: 5}, cancelBtn);
    },


    executeSQL: function() {
        var dataSet = {};
        dataSet.bind = [{
            name  : 'limitCount',
            value : this.gridLimitCount,
            type  : SQLBindType.INTEGER
        },{
            name  : 'time_range',
            value : this.selectTimeRange,
            type  : SQLBindType.INTEGER
        }];

        dataSet.replace_string = [{
            name  : 'was_id',
            value : this.wasCombo.getValue()
        },{
            name  : 'sort',
            value : 'time'
        }];

        dataSet.sql_file = 'IMXRT_AP_Monitor.sql';

        WS.SQLExec(dataSet, this.drawData, this);
    },


    drawData: function(header, adata) {
        if (this.isClosedDockForm) {
            return;
        }

        this.monitorGrid.loadingMask.showMask();
        this.monitorGrid.clearRows();
        this.monitorGrid.showEmptyText();

        if (!common.Util.checkSQLExecValid(header, adata)) {
            this.monitorGrid.loadingMask.hide();
            return;
        }

        var data;
        for (var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++ ) {
            data = adata.rows[ix];

            this.monitorGrid.addRow([
                data[0],  // Time
                data[1],  // Was Name
                data[2],  // loginName
                data[3],  // guid
                data[4],  // bussinessName
                data[5],  // errorCode
                data[6],  // errorMessage
                data[7],  // tid
                data[8]   // wasId
            ]);
        }

        this.monitorGrid.drawGrid();

        this.monitorGrid.loadingMask.hide();
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
     * 데이터 새로 고침.
     * 새로고침 간격 (기본 30초)
     */
    frameRefresh: function() {
        this.stopRefreshData();

        if (Comm.rtmShow || this.floatingLayer) {
            this.executeSQL();
        }

        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), 1000 * this.refreshInterval);
    }
});