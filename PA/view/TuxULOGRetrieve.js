Ext.define('view.TuxULOGRetrieve', {
    extend: 'Exem.FormOnCondition',
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql: {
        ulog   : 'IMXPA_TuxULOGRetrieve.sql'
    },
    listeners: {
        beforedestroy: function() {
            this.isClosed = true;
        }
    },

    showMessage: function(title, message, buttonType, icon, fn) {
        Ext.Msg.show({
            title  : common.Util.TR(title),
            msg    : message,
            buttons: buttonType,
            icon   : icon,
            fn     : fn
        });
    },

    _wasValidCheck: function() {
        var wasValue = this.wasCombo.getValue();
        var wasCombo = this.wasCombo.WASDBCombobox;
        var tmpArray, ix, ixLen;

        var setFocus = function() {
            wasCombo.focus();
        };

        if (wasValue == null) {
            wasCombo.selectByIndex(0);
        }

        if (wasCombo.getRawValue() != '(All)') {
            if (wasCombo.getRawValue().indexOf(',') == -1) {
                if (this.wasCombo.AllWasList.indexOf(wasValue + '') == -1) {
                    this.showMessage(common.Util.TR('ERROR'), common.Util.TR('Can not find the Agent Name'), Ext.Msg.OK, Ext.MessageBox.ERROR, setFocus());
                    return false;
                }
            } else {
                tmpArray = wasValue.split(',');
                for (ix = 0, ixLen = tmpArray.length; ix < ixLen; ix++) {
                    if (this.wasCombo.AllWasList.indexOf(tmpArray[ix]) == -1) {
                        this.showMessage(common.Util.TR('ERROR'), common.Util.TR('The Agent name is invalid'), Ext.Msg.OK, Ext.MessageBox.ERROR, setFocus());
                        return false;
                    }
                }
            }
        }

        return true;
    },


    checkValid: function() {
        return this._wasValidCheck();
    },

    init: function() {
        var self = this;

        this.setWorkAreaLayout('border');

        this.wasCombo = Ext.create('Exem.wasDBComboBox', {
            itemId         : 'wasCombo',
            width          : 350,
            comboWidth     : 230,
            comboLabelWidth: 60,
            multiSelect    : true,
            selectType     : common.Util.TR('Agent'),
            x              : 380,
            y              : 5
        });

        this.ulogProcName = Ext.create('Exem.TextField', {
            fieldLabel : common.Util.TR('Process Name'),
            labelAlign : 'right',
            labelWidth : 105,
            allowBlank : false,
            value      : '%',
            width      : 250,
            x          : 700,
            y          : 5,
            listeners  : {
                blur: function() {
                    if (this.getValue() === null || this.getValue() === '') {
                        this.setValue('%');
                    }
                }
            }
        });

        this.messageField = Ext.create('Exem.TextField', {
            fieldLabel : common.Util.TR('Message'),
            labelAlign : 'right',
            labelWidth : 60,
            allowBlank : false,
            value      : '%',
            width      : 300,
            x          : 5,
            y          : 32,
            listeners:{
                blur: function() {
                    if (this.getValue() === null || this.getValue() === '') {
                        this.setValue('%');
                    }
                }
            }
        });

        this.conditionArea.add(this.wasCombo, this.ulogProcName, this.messageField);

        //1. Tab 패널
        this.gridTabPanel = Ext.create('Exem.TabPanel', {
            region : 'north',
            layout : 'fit',
            height : '100%',
            split  : true,
            itemId : 'gridTabPanel',
            style: {
                'background': '#f6f6f6'//'#3e3e3e'
            },
            minHeight: 100,
            listeners: {
                render: function() {
                    this.setActiveTab(0);
                },
                tabchange: function(tabPanel, newCard) {
                    newCard.add(self.ulogListGrid);
                    self.ulogListGrid.clearRows();
                    self.conditionExecuteSQL();
                }
            }
        });

        var totalTabPanel = Ext.create('Exem.Panel', {
            title    : common.Util.TR('Total'),
            itemId   : 'total',
            split    : true,
            layout   : 'fit'
        });

        this.gridTabPanel.add(totalTabPanel);

        this.ulogListGrid = Ext.create('Exem.BaseGrid', {
            layout: 'fit'
        });

        totalTabPanel.add(this.ulogListGrid);



        this.ulogListGrid.beginAddColumns();
        this.ulogListGrid.addColumn(common.Util.CTR('Time')        , 'time'        , 130, Grid.DateTime, true,  false);
        this.ulogListGrid.addColumn('server_id'                    , 'server_id'   ,  70, Grid.Number,   false,  true);
        this.ulogListGrid.addColumn(common.Util.CTR('Agent')       , 'server_name' , 150, Grid.String,   true,  false);
        this.ulogListGrid.addColumn(common.Util.CTR('Host Name')   , 'host_name'   , 150, Grid.String,   true,  false);
        this.ulogListGrid.addColumn(common.Util.CTR('Process Name'), 'process_name', 150, Grid.String,   true,  false);
        this.ulogListGrid.addColumn(common.Util.CTR('Process ID')  , 'process_id'  , 150, Grid.Number,   true,  false);
        this.ulogListGrid.addColumn(common.Util.CTR('Catalog')     , 'catalog'     ,  80, Grid.String,   true,  false);
        this.ulogListGrid.addColumn(common.Util.CTR('Message Type'), 'message_type', 100, Grid.String,   true,  false);
        this.ulogListGrid.addColumn(common.Util.CTR('Message')     , 'message'     , 300, Grid.String,   true,  false);
        this.ulogListGrid.addColumn(common.Util.CTR('Message No')  , 'message_no'  , 100, Grid.Number,   true,  false);
        this.ulogListGrid.endAddColumns();

        this.workArea.add(this.gridTabPanel);
    },

    executeSQL: function() {
        var ix,ixLen;
        var wasIds;

        this.gridTabPanel.setActiveTab(0);

        this.ulogListGrid.clearRows();

        this.gridTabPanel.suspendLayouts();

        for (ix = this.gridTabPanel.items.length; ix > 1; ix-- ) {
            this.gridTabPanel.items.items[1].destroy();
        }

        wasIds = this.wasCombo.getValue();
        wasIds = wasIds.split(',');
        for (ix = 0, ixLen = wasIds.length; ix < ixLen; ix++) {
            this.wasId   = wasIds[ix];
            this.wasName = Comm.wasInfoObj[wasIds[ix]].wasName;
            this.addTabPanel(wasIds[ix], this.wasName);
        }

        this.gridTabPanel.resumeLayouts();
        this.gridTabPanel.doLayout();
        this.retrieveFlag = true;

        this.conditionExecuteSQL();

    },

    addTabPanel : function(id, name) {
        var tabPanel = this.gridTabPanel;

        //상단 Tab page에 Add
        var slogListPanel = Ext.create('Exem.Panel', {
            title  : name,
            itemId : id,
            layout : 'fit'
        });

        tabPanel.add(slogListPanel);
    } ,

    conditionExecuteSQL: function() {
        var wasList = this.wasCombo.getValue();
        var wasId;
        var dataSet = {};

        if (!this.isLoading) {
            this.isLoading = true;
            this.loadingMask.showMask();
        } else {
            return;
        }

        if (this.retrieveFlag) {
            wasId   = this.gridTabPanel.getActiveTab().itemId;

            dataSet.bind = [{
                name  : 'from_time',
                value : Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
                type: SQLBindType.STRING
            }, {
                name  : 'to_time',
                value : Ext.util.Format.date(this.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
                type: SQLBindType.STRING
            }, {
                name : 'process_name',
                value : this.ulogProcName.getValue(),
                type: SQLBindType.STRING
            }, {
                name : 'message',
                value : this.messageField.getValue(),
                type: SQLBindType.STRING
            }];

            if (wasId == 'total') {
                dataSet.replace_string = [{
                    name  : 'server_id',
                    value : wasList
                }];
            } else {
                dataSet.replace_string = [{
                    name  : 'server_id',
                    value : wasId
                }];
            }

            dataSet.sql_file = this.sql.ulog;
            WS.SQLExec(dataSet, this.onData, this );
        }

    },

    onData: function(aheader, adata) {
        if (this.isClosed) {
            return;
        }

        if (!common.Util.checkSQLExecValid(aheader, adata)) {
            if (this.isLoading) {
                this.loadingMask.hide();
                this.isLoading = false;
            } else {
                this.loadingMask.hide();
            }

            console.warn('TuxSlogRetrieve-onData');
            console.warn(aheader);
            console.warn(adata);
            return;
        }
        this.ulogListGrid.clearRows();

        var ix, ixLen;
        for (ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
            this.ulogListGrid.addRow([
                adata.rows[ix][0]       //time
                ,adata.rows[ix][1]      //server_id
                ,adata.rows[ix][2]      //server_name
                ,adata.rows[ix][3]      //host_name
                ,adata.rows[ix][4]      //process_name
                ,adata.rows[ix][5]      //process_id
                ,adata.rows[ix][6]      //catalog
                ,adata.rows[ix][7]      //message_type
                ,adata.rows[ix][8]      //message
                ,adata.rows[ix][9]      //message_no
            ]);
        }
        this.ulogListGrid.drawGrid();

        if (this.isLoading) {
            this.loadingMask.hide();
            this.isLoading = false;
        }

        this.loadingMask.hide();
    }
});