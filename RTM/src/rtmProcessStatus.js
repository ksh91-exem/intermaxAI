Ext.define('rtm.src.rtmProcessStatus', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('Process Status'),
    layout: 'fit',
    width : '100%',
    height: '100%',

    isClosedDockForm: false,

    listeners: {
        beforedestroy: function(me) {
            this.isClosedDockForm = true;

            if (this.refreshTimerId) {
                clearTimeout(this.refreshTimerId);
            }

            if (this.checkTimerId) {
                clearTimeout(this.checkTimerId);
            }

            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, me);
        }
    },

    initProperty: function() {
        this.activeTabTitle = '';
        this.processAlarm = [];
    },

    init: function() {

        this.initProperty();

        this.background = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            layout: 'vbox',
            border: 1
        });

        this.topContentsArea = Ext.create('Exem.Container', {
            width  : '100%',
            height : 22,
            layout : 'hbox',
            margin : '5 0 0 0'
        });

        this.centerArea = Ext.create('Exem.Container', {
            width  : '100%',
            height : '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            flex   : 1,
            margin : '5 10 10 10'
        });

        this.frameTitle = Ext.create('Ext.form.Label', {
            height : 20,
            margin : '0 0 0 10',
            cls    : 'header-title',
            text   : common.Util.TR('Process Status'),
            listeners: {
                scope: this,
                hide: function() {
                    this.topContentsArea.hide();
                },
                show: function() {
                    this.topContentsArea.show();
                }
            }
        });

        this.expendIcon = Ext.create('Ext.container.Container', {
            width : 17,
            height: 17,
            margin: '2 10 0 0',
            html  : '<div class="trend-chart-icon" title="' + common.Util.TR('Expand View') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on( 'click', function(){
                        this.dockContainer.toggleExpand(this);
                    }, this);
                }
            }
        });

        this.createTabPanel();

        this.createGrid();

        this.topContentsArea.add(this.frameTitle, {xtype: 'tbfill'}, this.expendIcon);

        this.centerArea.add(this.tabPanel, this.grid);

        this.background.add(this.topContentsArea, this.centerArea);

        this.add(this.background);

        this.refreshData();

        this.checkUpdateData();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this);

        if (this.floatingLayer) {
            this.frameTitle.hide();
            this.expendIcon.hide();
        }
    },

    createTabPanel: function() {
        this.tabPanel = Ext.create('Exem.TabPanel', {
            layout: 'fit',
            width: '100%',
            height: 25,
            items: [{
                title: common.Util.TR('Total'),
                itemId: 'total',
                layout: 'fit'
            }],
            listeners: {
                scope: this,
                tabchange: function(tabpanel, newcard) {
                    this.activeTabTitle = newcard.title;
                    this.refreshData();
                }
            }
        });

        for (var ix = 0, ixLen = Comm.monitoringHosts.length; ix < ixLen; ix++) {
            this.tabPanel.add({
                layout: 'fit',
                title: Comm.monitoringHosts[ix][0],
                itemId: Comm.monitoringHosts[ix][0]
            });
        }

        this.tabPanel.setActiveTab(0);
        this.activeTabTitle = this.tabPanel.getActiveTab().title;
    },

    createGrid: function() {
        this.grid = Ext.create('Exem.BaseGrid', {
            layout: 'fit',
            usePager: false,
            baseGridCls : 'baseGridRTM'
        });

        this.grid.beginAddColumns();
        this.grid.addColumn(common.Util.TR('Host Name'),            'Host_Name', 100, Grid.String,  true,  false);
        this.grid.addColumn(common.Util.TR('User Name'),            'User_Name', 100, Grid.String,  true,  false);
        this.grid.addColumn(common.Util.TR('Argument'),             'ARGs',      180, Grid.String,  true,  false);
        this.grid.addColumn(common.Util.TR('PID'),                  'PID',        70, Grid.StringNumber, true, false);
        this.grid.addColumn(common.Util.TR('Status'),               'Status',     70, Grid.String,  true,  false);
        this.grid.addColumn(common.Util.TR('CPU'),                  'CPU',        70, Grid.Number,  true,  false);
        this.grid.addColumn(common.Util.TR('Virtual Memory (MB)'),  'VSS',       120, Grid.Float,  true,  false);
        this.grid.addColumn(common.Util.TR('Real Memory (MB)'),     'RSS',       120, Grid.Float,  true,  false);
        this.grid.endAddColumns();
        this.grid.setOrderAct('CPU', 'DESC');

        this.grid.addRenderer('Status', this.gridCricleRenderer.bind(this));
    },

    gridCricleRenderer: function(value) {
        var htmlStr, cls;

        if (value > 0) {
            cls = 'critical';
        } else {
            cls = '';
        }
        htmlStr = '<div class="rtm-status-circle"><div class="rtm-status-circle-fill ' + cls + '"></div></div>';

        return htmlStr;
    },

    selectTab: function(index) {
        this.tabPanel.setActiveTab(index);
        this.activeTabTitle = this.tabPanel.getActiveTab().itemId;
    },

    refreshData: function() {
        if (this.refreshTimerId) {
            clearTimeout(this.refreshTimerId);
        }

        this.drawData();

        this.refreshTimerId = setTimeout(this.refreshData.bind(this), 3000);
    },

    drawData: function() {
        if (this.isClosedDockForm === true) {
            return;
        }
        var hostName;

        this.grid.clearRows();

        if (this.activeTabTitle === common.Util.TR('Total')) {

            for (var ix = 0, ixLen = Comm.monitoringHosts.length; ix < ixLen; ix++) {
                hostName = Comm.monitoringHosts[ix][0];
                this.drawGrid(hostName);
            }
        } else {
            hostName = this.activeTabTitle;
            this.drawGrid(hostName);
        }
        this.grid.drawGrid();
    },

    drawGrid: function(hostName) {
        var data = Repository.processStatus[hostName];

        if (Ext.isEmpty(data) !== true) {
            for (var jx = 0; jx < data.length; jx++) {

                this.grid.addRow([
                    data[jx][2],          // Host Name
                    data[jx][4],          // User Name
                    data[jx][8],          // args
                    data[jx][3],          // pid
                    0,                    // status
                    data[jx][5] * 1,      // cpu
                    data[jx][6] / 1024,   // vss
                    data[jx][7] / 1024    // rss
                ]);
            }
        }
        this.drawAlarm(hostName);
        data = null;
    },

    /**
     * 0: time
     * 1: server_type (1: WAS, 2: DB, 3:WebServer)
     * 2: server_id (If alert type is 'Process Status', server id is 0.)
     * 3: server_name
     * 4: alert_resource_name (Process Name)
     * 5: value (Process ID)
     * 6: alert_level
     * 7: levelType
     * 8: alert_type (Process Status)
     * 9: descr (Host IP)
     * 10: alert_resource_ID
     *
     * @param {} adata
     */
    onAlarm : function(data) {
        if (Ext.isEmpty(data) === true) {
            return;
        }

        var ix, ixLen, jx;
        var alertType   = data[8];  // Fixed 'Process Status'
        var hostIP      = data[9];  // Host IP
        var hostName    = this.getHostNameByIP(hostIP);

        if ('Process Status' !== alertType) {
            return;
        }

        if (this.processAlarm[hostName] === undefined) {
            this.processAlarm[hostName] = [];
        }

        var isContainAlarm = false;
        for (ix = 0, ixLen = this.processAlarm[hostName].length; ix < ixLen; ix++) {
            if (this.processAlarm[hostName][ix][4] === data[4]) {
                isContainAlarm = true;
                break;
            }
        }

        if (isContainAlarm === false) {
            data[4] = data[4].toLowerCase();
            this.processAlarm[hostName][this.processAlarm[hostName].length] = [].concat(data);
        }

        var processName;
        var statusData = Repository.processStatus[hostName];
        var alarm = this.processAlarm[hostName];

        for (ix = 0; ix < alarm.length; ix++) {
            processName = alarm[ix][4];

            if (!statusData) {
                continue;
            }

            for (jx = 0; jx < statusData.length;) {
                if (statusData[jx][8] === processName) {
                    Ext.Array.removeAt(statusData, jx);
                    jx--;
                }
                jx++;
            }
        }
    },


    drawAlarm: function(hostName) {

        var alarm = this.processAlarm[hostName];

        if (Ext.isEmpty(alarm) === true) {
            return;
        }

        var processName;
        var ix, jx;
        var data = Repository.processStatus[hostName];

        for (jx = 0; jx < data.length; jx++) {
            processName = data[jx][8];

            for (ix = 0; ix < alarm.length; ) {
                if (alarm[ix][4] === processName) {
                    Ext.Array.removeAt(alarm, ix);
                    ix--;
                }
                ix++;
            }
        }

        for (ix = 0; ix < alarm.length; ix++) {
            this.grid.addRow([
                hostName,
                '',
                alarm[ix][4],
                alarm[ix][5],
                2,
                0,
                0,
                0
            ]);
        }
    },

    getHostNameByIP: function(ip) {
        for (var ix = 0, ixLen = Comm.monitoringHosts.length; ix < ixLen; ix++) {
            if (Comm.monitoringHosts[ix][1] === ip) {
                return Comm.monitoringHosts[ix][0];
            }
        }
    },

    checkUpdateData: function() {
        if (this.checkTimerId) {
            clearTimeout(this.checkTimerId);
        }

        if (Repository.processStatus.updateTime === undefined) {
            Repository.processStatus.updateTime = {};
        }

        var hostName, updateTime, diffSec;

        for (var ix = 0, ixLen = Comm.monitoringHosts.length; ix < ixLen; ix++) {
            hostName = Comm.monitoringHosts[ix][0];
            updateTime = Repository.processStatus.updateTime[hostName];

            if (Ext.isEmpty(updateTime) === true) {
                continue;
            }

            diffSec = Ext.Date.diff(updateTime, new Date(), Ext.Date.SECOND);

            if (diffSec > 64) {
                Repository.processStatus[hostName] = [];
            }
        }

        this.checkTimerId = setTimeout(this.checkUpdateData.bind(this), 10000);
    }

});
