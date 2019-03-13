Ext.define('rtm.src.rtmAPSummary', {
    extend: 'Exem.DockForm',
    title: common.Util.CTR('AP Summary'),
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
        if (Comm.web_env_info.rtm_ap_summary_option) {
            webEnvData = JSON.parse(Comm.web_env_info.rtm_ap_summary_option);
        }

        this.gridLimitCount  = webEnvData ? webEnvData.gridLimitCount  : 20;
        this.refreshInterval = webEnvData ? webEnvData.refreshInterval : 10;
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
            text  : common.Util.CTR('AP Summary')
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
        this.monitorGrid.addColumn(common.Util.CTR('Error Code'),       'error_code',       120, Grid.String, true, false);
        this.monitorGrid.addColumn(common.Util.CTR('Error Message'),    'error_message',    200, Grid.String, true, false);
        this.monitorGrid.addColumn(common.Util.CTR('Count'),            'count',            80,  Grid.Number, true, false);
        this.monitorGrid.addColumn(common.Util.CTR('WAS ID'),           'wasid',            80,  Grid.String, false, true);
        this.monitorGrid.endAddColumns();

        this.monitorGrid._columnsList[3].minWidth = 80;
        this.monitorGrid._columnsList[3].flex = 1;

        target.add(this.monitorGrid);
    },

    /**
     * 알람 내역 삭제 주기를 설정하는 옵션창 구성.
     */
    createOptionWindow: function () {
        var webEnvData;

        this.optionWindow = Ext.create('Exem.XMWindow', {
            title: common.Util.TR('AP Summary Option'),
            width: 280,
            height: 200,
            resizable: false,
            maximizable: false,
            closable: false,
            isChangeMode: false,
            closeAction: 'hide',
            modal: true,
            cls: 'xm-dock-window-base'
        });

        this.checkTimeInterval = webEnvData ? webEnvData.timeout : 30;

        var baseCon, topCon, bottomCon, okBtn, cancelBtn,
            gridTimeoutCon, gridUnitLabel;

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
            height: 100,
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
            height: 40
        });

        this.optionWindow.gridTimeout = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.TR('Auto Refresh') + ' ' + common.Util.TR('Interval'),
            labelAlign: 'right',
            allowBlank: false,
            width     : 190,
            labelWidth: 140,
            maxValue  : 60,
            minValue  : 10,
            value     : this.refreshInterval,
            enforceMaxLength: true,
            enableKeyEvents: true,
            hideTrigger: false,
            cls: 'rtm-list-condition'
        });

        gridUnitLabel = Ext.create('Ext.form.Label', {
            text: '(' + common.Util.TR('Minute') + ')',
            width: 30,
            margin: '4 0 0 4',
            cls: 'rtm-default-label'
        });

        gridTimeoutCon.add(this.optionWindow.gridTimeout, gridUnitLabel);
        topCon.add(this.optionWindow.gridBufSize, gridTimeoutCon);

        okBtn = Ext.create('Exem.Button', {
            text: common.Util.TR('OK'),
            height: 25,
            cls: 'rtm-btn',
            listeners: {
                scope: this,
                click: function () {
                    var dataObj = {
                        gridLimitCount : this.optionWindow.gridBufSize.getValue(),
                        refreshInterval: this.optionWindow.gridTimeout.getValue()
                    };
                    common.WebEnv.Save('rtm_ap_summary_option', JSON.stringify(dataObj), null);

                    this.gridLimitCount = dataObj.gridLimitCount;
                    this.refreshInterval = dataObj.refreshInterval;

                    this.optionWindow.close();
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
        }];

        dataSet.replace_string = [{
            name  : 'was_id',
            value : this.wasCombo.getValue()
        },{
            name  : 'sort',
            value : 'count'
        }];

        dataSet.sql_file = 'IMXRT_AP_Summary.sql';

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
                data[2],  // errorCode
                data[3],  // errorMessage
                data[4],  // count
                data[5]   // wasId
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

        this.refreshTimer = setTimeout(this.frameRefresh.bind(this), 1000 * 60 * this.refreshInterval);
    }
});