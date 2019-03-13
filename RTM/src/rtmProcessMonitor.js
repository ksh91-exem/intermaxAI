Ext.define('rtm.src.rtmProcessMonitor', {

    activeTabTitle: '',
    autoRefresh   : true,
    pmData        : {},

    init: function() {
        var self = this;
        var ix, ixLen;

        if (window.rtmMonitorType === 'TP' && realtime.TPHostList.length > 0) {
            this.displayHostList = realtime.TPHostList.concat();
        } else if (window.rtmMonitorType === 'WEB' && Comm.webHosts.length > 0) {
            this.displayHostList = Comm.webHosts.concat();
        } else {
            this.displayHostList = Comm.hosts.concat();
        }

        // Data Storage
        for (ix = 0, ixLen = this.displayHostList.length; ix < ixLen; ix++) {
            this.pmData[this.displayHostList[ix]] = null;
        }

        this.pmWindow = Ext.create('Exem.XMWindow', {
            layout   : 'vbox',
            width    : 818,
            minWidth : 818,
            height   : 470,
            minHeight: 470,
            title    : common.Util.TR('Process Monitor'),
            cls      : 'xm-dock-window-base',
            closeAction: 'destroy',
            listeners  : {
                beforedestroy: function() {
                    realtime.ProcessMonitor = null;
                    if (self.refreshTimerId) {
                        clearTimeout(self.refreshTimerId);
                    }
                },
                'close': function() {
                    realtime.ProcessMonitor = null;

                    if (self.refreshTimerId) {
                        clearTimeout(self.refreshTimerId);
                    }

                    for (var ix = 0; ix < self.displayHostList.length; ix++) {
                        self.pmData[self.displayHostList[ix]] = null;
                    }
                    self.pmData = null;

                    if (Comm.RTComm.removeReceivePacket) {
                        Comm.RTComm.removeReceivePacket(PKT_DATA_NUMBER.PROCESS_MONITOR);
                    }
                }
            }
        });

        this.barPanel = Ext.create('Exem.Panel', {
            layout : {
                type : 'hbox',
                align: 'middle'
            },
            width  : '100%',
            height : 25,
            bodyStyle: {background: 'transparent'}
        });

        // TAB PANEL with Total Tab
        this.tabPanel = Ext.create('Exem.TabPanel', {
            layout : 'fit',
            width  : '100%',
            height : 25,
            items  : [{
                title : common.Util.TR('Total'),
                itemId: 'total',
                layout: 'fit'
            }],
            listeners: {
                scope: this,
                tabchange: function(tabpanel, newcard) {
                    this.activeTabTitle = newcard.title;
                    this.grid.clearRows();
                    this.drawData();
                }
            }
        });

        // Host Tabs
        for (ix = 0, ixLen = this.displayHostList.length; ix < ixLen; ix++) {
            if (realtime.TPHostList.indexOf(this.displayHostList[ix]) !== -1 &&
                window.rtmMonitorType !== 'TP' && !this.isDisplayTP) {
                continue;
            }
            this.tabPanel.add({
                layout: 'fit',
                title: this.displayHostList[ix],
                itemId: this.displayHostList[ix]
            });
        }

        // CheckBox
        var refreshCheckBox = Ext.create('Ext.form.field.Checkbox', {
            xtype    : 'tbfill',
            cls      : 'rtm-processmonitor-label',
            boxLabel : common.Util.TR('Auto Refresh'),
            margin   : '0 3 0 0',
            checked  : true,
            listeners: {
                scope: this,
                change: function() {
                    this.autoRefresh = refreshCheckBox.checked;
                }
            }
        });

        // Grid
        this.grid = Ext.create('Exem.BaseGrid', {
            layout        : 'fit',
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            usePager      : false,
            exportFileName: this.pmWindow.title
        });
        this.grid.beginAddColumns();
        this.grid.addColumn(common.Util.CTR('Host Name'),            'Host_Name', 100, Grid.String, true, false);
        this.grid.addColumn(common.Util.CTR('User Name'),            'User_Name', 100, Grid.String, true, false);
        this.grid.addColumn(common.Util.CTR('Argument'),             'ARGs',      180, Grid.String, true, false);
        this.grid.addColumn(common.Util.CTR('PID'),                  'PID',        70, Grid.StringNumber, true, false);
        this.grid.addColumn(common.Util.CTR('CPU'),                  'CPU',        70, Grid.Number, true, false);
        this.grid.addColumn(common.Util.CTR('Virtual Memory (MB)'),  'VSS',       120, Grid.Float,  true, false);
        this.grid.addColumn(common.Util.CTR('Real Memory (MB)'),     'RSS',       120, Grid.Float,  true, false);
        this.grid.endAddColumns();
        this.grid.setOrderAct('CPU', 'DESC');
        this.grid._columnsList[2].flex = 1;

        // 필터 설정 후 다른 탭으로 전환하고 설정된 필터를 해제하면 변경 전 탭에서 표시된 데이터가
        // 보여지는 이슈로 인해 필터 설정 시 그리드를 새로 고침하도록 수정.
        this.grid.pnlExGrid.on('filterchange', function() {
            this.refreshData();
        }.bind(this));

        this.pmWindow.add(this.barPanel);
        this.pmWindow.add(this.tabPanel);

        this.pmWindow.add(this.grid);
        this.pmWindow.show();
        this.barPanel.add( {xtype: 'tbfill', flex: 1 },refreshCheckBox);

        if (Comm.RTComm.addReceivePacket) {
            Comm.RTComm.addReceivePacket(PKT_DATA_NUMBER.PROCESS_MONITOR);
        }

        this.refreshData();
    },


    /**
     * rtmGroupView.js에서 호출
     */
    selectTab: function(index) {
        this.tabPanel.setActiveTab(index);
        this.activeTabTitle = this.tabPanel.getActiveTab().itemId;
    },


    refreshData: function() {
        if (this.refreshTimerId) {
            clearTimeout(this.refreshTimerId);
        }

        if (this.autoRefresh) {
            this.drawData();
        }

        this.refreshTimerId = setTimeout(this.refreshData.bind(this), 3000);
    },


    drawData: function() {
        if (this.isClosedWin === true) {
            return;
        }
        var hostName;

        this.grid.clearRows();

        if (this.activeTabTitle === common.Util.TR('Total')) {
            for (var ix = 0, ixLen = this.displayHostList.length; ix < ixLen; ix++) {
                hostName = this.displayHostList[ix];
                this.drawGrid(hostName);
            }
        } else {
            hostName = this.activeTabTitle;
            this.drawGrid(hostName);
        }
        this.grid.drawGrid();
    },


    /**
     * Draw Host List
     *
     * @param {string} hostName - Host Name
     */
    drawGrid: function(hostName) {
        if (!Repository.processMonitor) {
            return;
        }

        var data = Repository.processMonitor[hostName];
        var hostList;
        var ix, ixLen;

        if (Comm.autoScaleHostInfo && Ext.isEmpty(data)) {
            hostList = Comm.autoScaleHostInfo[hostName];

            if (!hostList) {
                return;
            }

            for (ix = 0, ixLen = hostList.length; ix < ixLen; ix++) {
                data = Repository.processMonitor[hostList[ix]];

                if (!Ext.isEmpty(data)) {
                    break;
                }
            }
        }

        if (Ext.isEmpty(data) !== true) {
            for (var jx = 0; jx < data.length; jx++) {

                this.grid.addRow([
                    data[jx][2],          // Host Name
                    data[jx][4],          // User Name
                    data[jx][8],          // args
                    data[jx][3],          // pid
                    data[jx][5] * 1,      // cpu
                    data[jx][6] / 1024,   // vss
                    data[jx][7] / 1024    // rss
                ]);
            }
            data = null;
        }
    }

});