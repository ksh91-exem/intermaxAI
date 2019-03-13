Ext.define('view.ProcessMonitor', {

    activeTabTitle: '',
    autoRefresh: true,
    pmData: {},

    init: function() {
        var self = this;

        // Data Storage
        for (var ix = 0; ix < Comm.hosts.length; ix++) {
            this.pmData[Comm.hosts[ix]] = null;
        }

        this.pmWindow = Ext.create('Exem.XMWindow', {
            layout: 'vbox',
            width: 818,
            minWidth: 818,
            height: 470,
            minHeight: 470,
            title: common.Util.TR('Process Monitor'),
            style: {
                background: '#eeeeee'
            },
            closeAction: 'destroy',
            listeners: {
                'close': function() {
                    realtime.ProcessMonitor = null;
                }
            }
        });

        // TAB PANEL with Total Tab
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
                tabchange: function(tabpanel, newcard) {
                    self.activeTabTitle = newcard.title;
                    self.grid.clearRows();
                    if (self.activeTabTitle == common.Util.TR('Total')) {
                        self.total_grid.setVisible(true);
                        self.grid.setVisible(false);
                        self.refresh_total();
                    } else {
                        self.total_grid.setVisible(false);
                        self.grid.setVisible(true);
                    }
                }
            }
        });

        // Host Tabs
        for ( ix = 0; ix < Comm.hosts.length; ix++) {
            if (realtime.TPHostList.indexOf(Comm.hosts[ix]) == -1) {
                this.tabPanel.add({
                    layout: 'fit',
                    title: Comm.hosts[ix],
                    itemId: Comm.hosts[ix]
                });
            }
        }

        // CheckBox
        var refreshCheckBox = Ext.create('Ext.form.field.Checkbox', {
            xtype: 'tbfill',
            boxLabel: common.Util.TR('Auto Refresh'),
            margin: '0 3 0 0',
            checked: true,
            listeners: {
                change: function() {
                    self.autoRefresh = refreshCheckBox.checked;
                    if (self.autoRefresh) {
                        self.grid.addRow([]);
                        self.grid.clearRows();
                    }
                }
            }
        });

        // Total Grid
        this.total_grid = Ext.create('Exem.BaseGrid', {
            layout: 'fit',
            usePager: false
        });
        this.total_grid.beginAddColumns();
        this.total_grid.addColumn(common.Util.TR('Host Name'),            'Host_Name', 100, Grid.String, true, false);
        this.total_grid.addColumn(common.Util.TR('User Name'),            'User_Name', 100, Grid.String, true, false);
        this.total_grid.addColumn(common.Util.TR('Argument'),             'ARGs',      180, Grid.String, true, false);
        this.total_grid.addColumn(common.Util.TR('PID'),                  'PID',        70, Grid.String, true, false);
        this.total_grid.addColumn(common.Util.TR('CPU'),                  'CPU',        70, Grid.Number, true, false);
        this.total_grid.addColumn(common.Util.TR('Virtual Memory (MB)'),  'VSS',       120, Grid.Float,  true, false);
        this.total_grid.addColumn(common.Util.TR('Real Memory (MB)'),     'RSS',       120, Grid.Float,  true, false);
        this.total_grid.endAddColumns();
        this.total_grid.setOrderAct('CPU', 'DESC');
        this.total_grid.setVisible(false);

        // Grid
        this.grid = Ext.create('Exem.BaseGrid', {
            layout: 'fit',
            usePager: false
        });
        this.grid.beginAddColumns();
        this.grid.addColumn(common.Util.TR('Host Name'),            'Host_Name', 100, Grid.String, true, false);
        this.grid.addColumn(common.Util.TR('User Name'),            'User_Name', 100, Grid.String, true, false);
        this.grid.addColumn(common.Util.TR('Argument'),             'ARGs',      180, Grid.String, true, false);
        this.grid.addColumn(common.Util.TR('PID'),                  'PID',        70, Grid.String, true, false);
        this.grid.addColumn(common.Util.TR('CPU'),                  'CPU',        70, Grid.Number, true, false);
        this.grid.addColumn(common.Util.TR('Virtual Memory (MB)'),  'VSS',       120, Grid.Float,  true, false);
        this.grid.addColumn(common.Util.TR('Real Memory (MB)'),     'RSS',       120, Grid.Float,  true, false);
        this.grid.endAddColumns();
        this.grid.setOrderAct('CPU', 'DESC');

        this.tabPanel.tabBar.add({ xtype: 'tbfill' }, refreshCheckBox);

        this.pmWindow.add(this.tabPanel);
        this.pmWindow.add(this.total_grid);
        this.pmWindow.add(this.grid);
        this.pmWindow.show();

        this.refresh_total();
    },

    refresh_total: function() {
        var self = this;
        setTimeout(function() {
            if (self.activeTabTitle == common.Util.TR('Total')) {
                var hostname = '';
                if (realtime.ProcessMonitor) {
                    self.total_grid.clearRows();
                    for (var ix = 0; ix < Comm.hosts.length; ix++) {
                        hostname = Comm.hosts[ix];
                        if (self.pmData[hostname] !=  null) {
                            for (var jx = 0; jx < self.pmData[hostname].length; jx++) {
                                self.total_grid.addRow([
                                    self.pmData[hostname][jx][1],
                                    self.pmData[hostname][jx][3],
                                    self.pmData[hostname][jx][7],
                                    self.pmData[hostname][jx][2],
                                    self.pmData[hostname][jx][4] * 1,
                                    self.pmData[hostname][jx][5] / 1024,
                                    self.pmData[hostname][jx][6] / 1024
                                ]);
                            }
                        }
                    }
                    self.total_grid.drawGrid();
                    self.refresh_total();
                }
            }
        }, 3000);
    },

    selectTab: function(index) {
        this.tabPanel.setActiveTab(index);
        this.activeTabTitle = this.tabPanel.getActiveTab().itemId;
    },

    clearData: function() {
        for (var ix = 0; ix < Comm.hosts.length; ix++) {
            this.pmData[Comm.hosts[ix]] = null;
        }
    },

    onData: function(aheader, adata) {

        if(!common.Util.checkSQLExecValid(aheader,adata)){
            console.warn('ProcessMonitor-onData');
            console.warn(aheader);
            console.warn(adata);
            return;
        }

        var temp = false;
        var hostname = '';
        if (this.autoRefresh) {
            if (adata.rows.length > 0) {
                for (var ix = 0, ixlen = adata.rows.length; ix < ixlen; ix++) {
                    hostname = adata.rows[ix][1];
                    if (realtime.TPHostList.indexOf(hostname) != -1) {
                        continue;
                    }
                    if (this.activeTabTitle == hostname) {
                        if (!temp) {
                            temp = true;
                            this.grid.clearRows();
                        }
                    }
                    if (this.activeTabTitle == common.Util.TR('Total')) {
                        this.pmData[hostname] = adata.rows;
                    } else {
                        if (hostname == this.activeTabTitle) {
                            this.grid.addRow([
                                adata.rows[ix][1],              // host_name
                                adata.rows[ix][3],              // user_name
                                adata.rows[ix][7],              // args
                                adata.rows[ix][2],              // pid
                                adata.rows[ix][4] * 1,          // cpu
                                adata.rows[ix][5] / 1024,       // vss
                                adata.rows[ix][6] / 1024        // rss
                            ]);
                        }
                    }
                }
                this.grid.drawGrid();
            }
        }

        aheader = null;
        adata   = null;
    },

    Refresh: function() {
        if (this.activeTabTitle == common.Util.TR('Total')) {
            for (var ix = 0; ix < Comm.hosts.length; ix++) {
                for (var jx = 0; jx < this.pmData[Comm.hosts[ix]].length; jx++) {
                    this.grid.addRow(this.pmData[Comm.hosts[ix]][jx]);
                }
            }
        } else {
            for ( ix = 0; ix < this.pmData[this.activeTabTitle].length; ix++) {
                this.grid.addRow(this.pmData[this.activeTabTitle][ix]);
            }
        }

        try {
            this.grid.drawGrid();
        } finally {
            this.clearData();
        }
    }
});