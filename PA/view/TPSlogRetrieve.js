Ext.define("view.TPSlogRetrieve", {
    extend: "Exem.FormOnCondition",
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,
    style: {
        background: '#cccccc'
    },
    sql: {
        slog   : 'IMXPA_TPSlogRetrieve.sql'
    },
    listeners: {
        beforedestroy: function () {
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

        var setFocus = function(){
            wasCombo.focus();
        };

        if (wasValue == null) {
            wasCombo.selectByIndex(0) ;
        }

        if (wasCombo.getRawValue() != '(All)') {
            if (wasCombo.getRawValue().indexOf(',') == -1) {
                if (this.wasCombo.AllWasList.indexOf(wasValue+'') == -1) {
                    this.showMessage(common.Util.TR('ERROR'), common.Util.TR('Can not find the Agent Name'), Ext.Msg.OK, Ext.MessageBox.ERROR, setFocus());
                    return false;
                }
            } else {
                var tmpArray = wasValue.split(',');
                for (var ix = 0, len = tmpArray.length; ix < len; ix++) {
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

        this.slogProcName = Ext.create('Exem.TextField', {
            fieldLabel : common.Util.TR('Engine Name'),
            labelAlign : 'right',
            labelWidth : 75,
            allowBlank : false,
            value      : '%',
            width      : 250,
            x          : 700,
            y          : 5,
            listeners:{
                blur: function() {
                    if ( this.getValue() === null || this.getValue() === ''){
                        this.setValue('%');
                    }
                }
            }
        });

        this.rateComboBox = Ext.create('Exem.ComboBox', {
            fieldLabel  : common.Util.TR('Rate'),
            labelWidth  : 60,
            width       : 175,
            store       : Ext.create('Exem.Store'),
            editable    : false,
            useSelectFirstRow : false,
            x          : 0,
            y          : 32
        });

        this.rateComboBox.addItem('I', 'I (Info)', 1);
        this.rateComboBox.addItem('W', 'W (Warning)', 2);
        this.rateComboBox.addItem('F', 'F (Fatal)', 3);
        this.rateComboBox.addItem('E', 'E (Error)', 4);
        this.rateComboBox.insertAll();
        this.rateComboBox.selectRow(0);

        this.errorCode = Ext.create('Exem.TextField', {
            fieldLabel : common.Util.TR('Error Code'),
            labelAlign : 'right',
            labelWidth : 60,
            allowBlank : false,
            value      : '%',
            width      : 175,
            x          : 210,
            y          : 32,
            listeners:{
                blur: function() {
                    if ( this.getValue() === null || this.getValue() === ''){
                        this.setValue('%');
                    }
                }
            }
        });

        this.serviceCode = Ext.create('Exem.TextField', {
            fieldLabel : common.Util.TR('Service Code'),
            labelAlign : 'right',
            labelWidth : 70,
            allowBlank : false,
            value      : '%',
            width      : 185,
            x          : 430,
            y          : 32,
            listeners:{
                blur: function() {
                    if ( this.getValue() === null || this.getValue() === ''){
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
            x          : 715,
            y          : 32,
            listeners:{
                blur: function() {
                    if ( this.getValue() === null || this.getValue() === ''){
                        this.setValue('%');
                    }
                }
            }
        });

        this.conditionArea.add(this.wasCombo, this.slogProcName,
            this.rateComboBox,
            this.errorCode, this.serviceCode, this.messageField);

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
                tabchange: function( tabPanel, newCard ){
                    newCard.add(self.slogListGrid);
                    self.slogListGrid.clearRows() ;
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

        this.slogListGrid = Ext.create('Exem.BaseGrid', {
            layout: 'fit'
        });

        totalTabPanel.add(this.slogListGrid);



        this.slogListGrid.beginAddColumns();
        this.slogListGrid.addColumn(common.Util.CTR('Time'),            'time',         130, Grid.DateTime, true,  false);
        this.slogListGrid.addColumn('server_id',                       'server_id',   70 , Grid.Number,   false,  true);
        this.slogListGrid.addColumn(common.Util.CTR('Agent'),           'server_name', 150, Grid.String,   true,  false);
        this.slogListGrid.addColumn(common.Util.CTR('Engine Name'),     'proc_name',    150, Grid.String,   true,  false);
        this.slogListGrid.addColumn(common.Util.CTR('Process Number'),  'proc_ids',     150, Grid.Number,   true,  false);
        this.slogListGrid.addColumn(common.Util.CTR('Rate'),            'err_lvl',      80, Grid.String,   true,  false);
        this.slogListGrid.addColumn(common.Util.CTR('Service Code'),    'svc_code',     100, Grid.String,   true,  false);
        this.slogListGrid.addColumn(common.Util.CTR('Error Code'),      'code',         100, Grid.String,   true,  false);
        this.slogListGrid.addColumn(common.Util.CTR('Message'),         'message',       300, Grid.String,   true,  false);
        this.slogListGrid.endAddColumns();

        this.workArea.add(this.gridTabPanel);
    },

    executeSQL: function() {
        var ix,ixLen;
        var wasIds;

        if(!this.isLoading){
            this.isLoading = true;
            this.loadingMask.showMask();
        } else {
            return;
        }

        this.gridTabPanel.setActiveTab(0) ;

        this.slogListGrid.clearRows() ;

        this.gridTabPanel.suspendLayouts();

        for ( ix = this.gridTabPanel.items.length; ix > 1 ; ix-- ){
            this.gridTabPanel.items.items[1].destroy() ;
        }

        wasIds = this.wasCombo.getValue() ;
        wasIds = wasIds.split(',') ;
        for(ix = 0, ixLen = wasIds.length; ix < ixLen; ix++) {
            this.wasId   = wasIds[ix];
            this.wasName = Comm.RTComm.getServerNameByID(wasIds[ix]);
            this.addTabPanel(wasIds[ix], this.wasName);
        }

        this.gridTabPanel.resumeLayouts();
        this.gridTabPanel.doLayout();
        this.retrieveFlag = true;

        this.conditionExecuteSQL();

    },

    addTabPanel : function(id, name){
        var tabPanel = this.gridTabPanel;

        //상단 Tab page에 Add
        var slogListPanel = Ext.create('Exem.Panel', {
            title  : name,
            itemId : id,
            layout : 'fit'
        });

        tabPanel.add(slogListPanel);
    } ,

    conditionExecuteSQL: function(){
        var wasList = this.wasCombo.getValue();
        var wasId;
        var rateValue;
        var dataSet = {};

        if (this.retrieveFlag){
            wasId   = this.gridTabPanel.getActiveTab().itemId;

            if(this.rateComboBox.getValue() === '(All)'){
                rateValue = '\'I\',\'W\',\'F\',\'E\'';
            } else{
                rateValue = '\'' + this.rateComboBox.getValue() + '\'';
            }

            dataSet.bind = [{
                name  : 'from_time',
                value : Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
                type: SQLBindType.STRING
            }, {
                name  : 'to_time',
                value : Ext.util.Format.date(this.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
                type: SQLBindType.STRING
            }, {
                name : 'proc_name',
                value : this.slogProcName.getValue(),
                type: SQLBindType.STRING
            }, {
                name : 'svc_code',
                value : this.serviceCode.getValue(),
                type: SQLBindType.STRING
            }, {
                name : 'code',
                value : this.errorCode.getValue(),
                type: SQLBindType.STRING
            }, {
                name : 'message',
                value : this.messageField.getValue(),
                type: SQLBindType.STRING
            }];

            if (wasId == 'total'){
                dataSet.replace_string = [{
                    name  : 'server_id',
                    value : wasList
                }, {
                    name : 'err_lvl',
                    value: rateValue
                }];
            } else{
                dataSet.replace_string = [{
                    name  : 'server_id',
                    value : wasId
                }, {
                    name : 'err_lvl',
                    value: rateValue
                }];
            }

            dataSet.sql_file = this.sql.slog;
            WS.SQLExec(dataSet, this.onData, this );
        }

    },

    onData: function(aheader, adata) {
        if(this.isClosed){
            return;
        }

        if(!common.Util.checkSQLExecValid(aheader, adata)){
            if(this.isLoading){
                this.loadingMask.hide();
                this.isLoading = false;
            } else{
                this.loadingMask.hide();
            }

            console.warn('TPSlogRetrieve-onData');
            console.warn(aheader);
            console.warn(adata);
            return;
        }
        this.slogListGrid.clearRows() ;

        for (var ix=0; ix <= adata.rows.length-1; ix++) {
            this.slogListGrid.addRow([
                adata.rows[ix][0]       //time
                ,adata.rows[ix][1]      //server_id
                ,adata.rows[ix][2]      //server_name
                ,adata.rows[ix][3]      //proc_name
                ,adata.rows[ix][4]      //proc_ids
                ,adata.rows[ix][5]      //err_lvl
                ,adata.rows[ix][6]      //svc_code
                ,adata.rows[ix][7]      //code
                ,adata.rows[ix][8]      //message
            ]);
        }
        this.slogListGrid.drawGrid();

        if(this.isLoading){
            this.loadingMask.hide();
            this.isLoading = false;
        }

        this.loadingMask.hide();
    }
});