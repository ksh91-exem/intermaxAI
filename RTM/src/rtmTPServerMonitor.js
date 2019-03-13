Ext.define('rtm.src.rtmTPServerMonitor', {
    activeTabTitle: '',
    autoRefresh   : true,

    init: function() {
        var self = this;

        // Data Storage
        this.tpData = [];
        this.servers = [];
        this.tpSelectList = [];

        this.ptWindow = Ext.create('Exem.XMWindow', {
            layout: 'vbox',
            width: 444,
            minWidth: 444,
            height: 600,
            minHeight: 600,
            maximizable: false,
            autoScroll: true,
            title: common.Util.TR('TP Server Monitor'),
            bodyCls: 'xm-window-body-alertwindow',
            listeners: {
                close: {
                    fn: function() {
                        if (self.tree) {
                            self.tree.clearNodes();
                        }
                        realtime.TPServerMonitor = null;
                    }
                }
            },
            closeAction: 'destroy'
        });
        this.ptWindow.addCls('xm-dock-window-base');

        var checkpnl = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: 20,
            items: [{
                xtype: 'container',
                height: '100%',
                flex: 1
            }, {
                xtype: 'container',
                id: 'ptrefreshpanel',
                height: '100%',
                width: 100
            }]
        });
        this.ptWindow.add(checkpnl);

        var refreshCheckBox = Ext.create('Ext.form.field.Checkbox', {
            xtype: 'tbfill',
            boxLabel: common.Util.TR('Auto Refresh'),
            margin: '0 3 0 0',
            checked: true,
            listeners: {
                change: function() {
                    self.autoRefresh = !self.autoRefresh;
                }
            }
        });
        Ext.getCmp('ptrefreshpanel').add(refreshCheckBox);

        var pnl = Ext.create('Ext.container.Container', {
            layout : 'fit',
            width  : '100%',
            flex   : 1
        });
        this.ptWindow.add(pnl);

        this.tree = Ext.create('Exem.BaseGrid', {
            gridType: Grid.exTree,
            localeType: 'H:i:s',
            layout: 'fit',
            width: '100%',
            height: '100%',
            nodeExpend: false,
            useContextMenu: false,
            baseGridCls   : 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            beforeitemmouseup: function(dv, record, item, index, e, eOpts) {
                self.nodeclick(dv, record, item, index, e, eOpts);
            },
            itemclick: function(dv, record, item, index, e) {
                self.nodeclick(dv, record, item, index, e, eOpts);
            }
        });
        pnl.add(this.tree);
        this.ptWindow.add(pnl);

        var _renderer =  function(value, meta, record) {
            var div = null;
            if (record.data.state === '1') {
                div = '<div><span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 2px solid rgb(255, 255, 255); box-shadow: rgb(39, 183, 159) 0px 0px 4px; margin: 0px; right: auto; background-color: rgb(40, 154, 249);"></span></div>';

            } else if (record.data.state === '0') {
                if (record.data.childNodes.length > 0) {
                    div = '<div><span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 2px solid rgb(244, 252, 249); box-shadow: rgb(136, 133, 170) 0px 0px 4px; margin: 0px; right: auto; background-color: rgb(249, 75, 75);"></span></div>';
                } else {
                    div = '<div><span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 2px solid rgb(244, 252, 249); box-shadow: rgb(136, 133, 170) 0px 0px 4px; margin: 0px; right: auto;  background-color: rgb(249, 75, 75);"></span></div>';
                }
            }
            meta.align = 'center';
            return div;
        };

        this.tree.beginAddColumns();
        this.tree.addColumn(common.Util.CTR('Server Name'), 'servername', 200, Grid.String, true, false, 'treecolumn');
        this.tree.addColumn(common.Util.CTR('Status'),      'state',       70, Grid.String, true, false);
        this.tree.addColumn(common.Util.CTR('Q Count'),     'queue',       70, Grid.Number, true, false);
        this.tree.addColumn(common.Util.CTR('Avg'),         'avg',         70, Grid.Float,  true, false);

        this.tree._columnsList[1].renderer = _renderer;
        this.tree.endAddColumns();

        this.ptWindow.show();
    },

    nodeclick: function(dv, record) {
        var index;

        if (record.data.childNodes.length > 0) {
            if (this.tpSelectList.indexOf(record.data.servername) === -1) {
                this.tpSelectList.push(record.data.servername);
                record.expand();
            } else {
                index = this.tpSelectList.indexOf(record.data.servername);
                if (index > -1) {
                    this.tpSelectList.splice(index, 1);
                    record.collapse();
                }
            }
        }
    },

    onData: function(h, d) {
        /*
         * Process Monitor Packet:
         * header: ["Time","Host_Name","PID","User_Name","CPU","VSZ","RSS","ARGs"]
         * rows  : [[1422503835000,"linux","21085","oracle","0","2650176","97912","ora_mmon_ORA112"], ...]
         *
         * User_Name [3]    -> server_name
         * ARGs      [7]    -> service_name
         * PID       [2]    -> state(0:red, 1:blue)
         * CPU       [4]    -> queue_count
         * VSZ       [5]    -> avg
         * RSS       [6]    -> 1:root, 0:child
         */

        if (d.rows.length === 0) {
            return;
        }

        var node;
        var isred = false;

        if (this.autoRefresh) {
            this.tree.clearNodes();
            this.tree.beginTreeUpdate();

            for (var ix = 0; ix < d.rows.length; ix++) {
                switch (d.rows[ix][6]) {
                    case '1': /* root */
                        isred = false;
                        node = this.tree.addNode(
                            null,
                            [
                                d.rows[ix][3],  /* server_name  */
                                null,           /* state        */
                                d.rows[ix][4]   /* queue_count  */
                            ]
                        );
                        break;
                    case '0': /* child */
                        if (d.rows[ix][2] === '0' || d.rows[ix][2] === 0) {
                            isred = true;
                        }
                        this.tree.addNode(
                            node,
                            [
                                d.rows[ix][7],  /* service_name */
                                d.rows[ix][2],  /* state        */
                                d.rows[ix][4],  /* queue_count  */
                                d.rows[ix][5]   /* avg          */
                            ]
                        );
                        break;
                    default:
                        break;
                }
                if (isred) {
                    node.state = '0';
                }
                if (this.tpSelectList.length > 0 && this.tpSelectList.indexOf(node.servername) !== -1) {
                    node.expanded = true;
                }
            }
            this.tree.drawTree();
            this.tree.endTreeUpdate();
        }

        node = null;
        d    = null;
    }
});

