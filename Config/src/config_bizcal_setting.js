Ext.define('config.config_bizcal_setting', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    bodyStyle: {
        background: '#eeeeee'
    },

    constructor: function() {
        this.callParent();
    },

    init: function(target) {
        this.target = target;

        this.initProperty();
        this.initLayout();
        this.initDataSetting();
    },

    initProperty: function(){
        this.refreshLoading = false;
    },

    initLayout: function(){
        var baseCon = Ext.create('Ext.container.Container', {
            layout: 'vbox',
            width: '100%',
            flex: 1,
            margin: '3 5 3 0',
            border: false,
            style: { background: '#ffffff' }
        });

        this.systemTypeCombo = Ext.create('Exem.ComboBox', {
            store: Ext.create('Exem.Store'),
            width   : 118,
            margin: '3 5 3 6',
            listeners   : {
                change: function(me) {
                    this.executeSQL();
                    this.resetCalendar();
                }.bind(this)
            }
        });

        this.calendar = Ext.create('Exem.BusinessCalendar',{
            flex : 1,
            multiSelectDate : false,
            floating        : false,
            trendMode       : true,
            border          : false,
            bodyStyle       : null,
            parent          : this,
            paramTextField  : this.baseDateTextField,
            isPreventInit  : true,
            cls : 'businessCalendar',
            margin : '5 300 0 10'
        });

        this.calendar.init();

        var wasListPanel = this.createWasListPanel();

        baseCon.add([this.systemTypeCombo, wasListPanel]);
        this.target.add(baseCon);
    },

    initDataSetting: function(){
        this.setSystemCombo();
    },

    setBusiness: function() {
        var systemID = this.systemTypeCombo.getValue(),
            data, day, bizcal, month, ix, ixLen;

        if (!systemID) {
            return;
        }

        month = this.calendar.fromCalendar.calendars[0].month + 1;
        month = month > 10 ? month : '0' + month;

        bizcal = this.calendar.fromCalendar.calendars[0].year + month;

        Ext.Ajax.request({ //호출 URL
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID + '/bizcal/' + bizcal,
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === true) {
                    data = result.data;

                    this.calendarData = {};

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        var date = data[ix].bizdate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");

                        if (this.calendar._findBlock(date)) {
                            if (day != this.calendar._findBlock(date).getAttribute('data-day')) {
                                this.calendarData[data[ix].bizdate] = [];

                                day = this.calendar._findBlock(date).getAttribute('data-day');
                                this.calendar._findBlock(date).querySelector('button').innerHTML = day;
                            }

                            this.calendarData[data[ix].bizdate].push(data[ix].type_id);
                            this.calendar._findBlock(date).querySelector('button').innerHTML += '<br> ' + data[ix].name;
                        }
                    }
                }
            }.bind(this),
            failure : function(){}
        });
    },

    initPopup: function(dateArr) {
        var dateForm = Ext.create('config.config_bizcal_date_form');
        console.log(this.calendarData);
        dateForm.parent     = this;
        dateForm.systemID   = this.systemTypeCombo.getValue();
        dateForm.selectDate = dateArr[0];

        dateForm.init();
    },

    createWasListPanel: function(){
        var baseCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            flex: 1,
            margin: '3 5 3 0',
            border: false,
            style: { background: '#ffffff' }
        });

        var wasListPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width : 600,
            height: '100%',
            border: false,
            split: true,
            margin: '3 0 3 6',
            bodyStyle: { background: '#ffffff' }
        });

        this.wasNameToolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: 130,
            height: 30,
            border: false,
            items: [{
                html: '<img src="../images/cfg_add.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Add'); }
            }, {
                html: '<img src="../images/cfg_edit.png" width="15" height="15">',
                id: 'cfg_name_edit',
                disabled: true,
                scope: this,
                handler: function() { this.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_name_delete',
                disabled: true,
                scope: this,
                handler: function() { this.onButtonClick('Delete'); }
            }, '-', {
                html: '<img src="../images/cfg_refresh.png" width="15" height="15">',
                scope: this,
                handler: function() { this.onButtonClick('Refresh'); }
            }]
        });

        var wasListTitleCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            style: { background: '#eeeeee' },
            items: [
                {
                    flex: 1,
                    height: 30,
                    border: false,
                    margin: '7 0 0 7',
                    bodyStyle: { background: '#eeeeee' },
                    html: Comm.RTComm.setFont(9, common.Util.TR('Business Type List'))
                },
                this.wasNameToolbar
            ]
        });

        var wasListBodyCon = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        this.createGrid();

        wasListBodyCon.add(this.grid);
        wasListPanel.add(wasListTitleCon, wasListBodyCon);

        baseCon.add([wasListPanel, this.calendar]);

        return baseCon;
    },

    createGrid: function(){
        var self = this;

        this.grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: false,
            checkMode: Grid.checkMode.MULTI,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300,
            itemclick:function() {
                self.wasNameToolbar.getComponent('cfg_name_edit').setDisabled(false);
                self.wasNameToolbar.getComponent('cfg_name_delete').setDisabled(false);
            }
        });

        this.grid.beginAddColumns();
        this.grid.addColumn({text: 'sys_id'                      ,  dataIndex: 'sys_id',    width: 100, type: Grid.Number, alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: 'type_id'                     ,  dataIndex: 'type_id',   width: 100, type: Grid.Number, alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: common.Util.CTR('Name')       ,  dataIndex: 'name',      width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Description'),  dataIndex: 'desc',      width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.endAddColumns();
    },

    onButtonClick: function(cmd) {
        var self = this,
            wasForm, rowData, systemID, typeID;

        switch (cmd) {
            case 'Add' :
                wasForm = Ext.create('config.config_bizcal_form');
                wasForm.parent = this;
                wasForm.systemID = this.systemTypeCombo.getValue();
                wasForm.init('Add');
                break;
            case 'Edit' :
                rowData = this.grid.getSelectedRow()[0].data;
                wasForm = Ext.create('config.config_bizcal_form');
                wasForm.parent = this;
                wasForm.systemID = rowData.sys_id;
                wasForm.typeID = rowData.type_id;
                wasForm.name = rowData.name;
                wasForm.desc = rowData.desc;
                wasForm.init('Edit');
                break;
            case 'Delete' :
                Ext.MessageBox.confirm(common.Util.TR('Delete'), common.Util.TR('Are you sure you want to delete?'), function(btn) {
                    if (btn === 'yes') {
                        rowData = self.grid.getSelectedRow()[0].data;
                        systemID = rowData['sys_id'];
                        typeID = rowData['type_id'];

                        Ext.Ajax.request({
                            url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID + '/biztype/' + typeID,
                            method : 'DELETE',
                            success : function(response) {
                                var result = Ext.JSON.decode(response.responseText);

                                if (result.success === true) {
                                    console.log(response);
                                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                                    self.onButtonClick('Refresh');
                                } else {
                                    console.error(result.message);
                                }
                            },
                            failure : function(){}
                        });
                    }
                });
                break;
            case 'Refresh' :
                if (this.refreshLoading) {
                    return;
                }

                this.refreshLoading = true;
                this.executeSQL();

                this.wasNameToolbar.getComponent('cfg_name_edit').setDisabled(true);
                this.wasNameToolbar.getComponent('cfg_name_delete').setDisabled(true);
                break;
            default :
                break;
        }
    },

    executeSQL: function() {
        var self = this,
            systemID = this.systemTypeCombo.getValue(),
            ix, ixLen, data;

        if (!systemID) {
            return;
        }

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID + '/biztype',
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === true) {
                    data = result.data;
                    self.grid.clearRows();

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        self.grid.addRow([data[ix].sys_id, data[ix].type_id, data[ix].name, data[ix].desc]);
                    }
                    
                    self.grid.drawGrid();
                }
            },
            failure : function(){}
        });

        this.refreshLoading = false;
    },

    changeWasInfo: function(systemID, typeID, name, desc) {
        var ix, ixLen, record;

        for (ix = 0, ixLen = this.grid.getRowCount(); ix < ixLen; ix++) {
            if (this.grid.getRow(ix).data.type_id == typeID) {
                record = this.grid.findRow('type_id', typeID);
                record.set('name', name);
                record.set('desc', desc);
                break;
            }
        }
    },

    setSystemCombo: function() {
        var data,
            ix, ixLen;

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system',
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === true) {
                    data = result.data;

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        this.systemTypeCombo.addItem(data[ix].sys_id, data[ix].name);
                    }

                    this.systemTypeCombo.selectRow(0);
                }
            }.bind(this),
            failure : function(){}
        });
    },

    resetCalendar: function() {
        this.calendar.allClearDate();
        this.calendar.fromCalendar.draw();
    }
});
