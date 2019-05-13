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
            layout: 'hbox',
            width: '100%',
            flex: 1,
            margin: '3 5 3 0',
            border: false,
            style: { background: '#ffffff' }
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
            margin : '310 0 0 5'
        });

        this.calendar.init();

        var wasListPanel = this.createWasListPanel();

        baseCon.add([wasListPanel, this.calendar]);
        this.target.add(baseCon);
    },

    initDataSetting: function(){
        this.onButtonClick('Refresh');


        this.setBusiness();
    },

    setBusiness: function() {
        setTimeout(function(){
            if (this.calendar._findBlock('2019-04-10')) {
                this.calendar._findBlock('2019-04-10').querySelector('button').innerHTML = '10 <br> 급여일 <br> 집중거래일';
            }
        }.bind(this), 50);
    },

    initPopup: function() {
        var dateForm = Ext.create('config.config_bizcal_date_form');
        dateForm.parent = this;
        dateForm.init();
    },

    createWasListPanel: function(){
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
                id: 'cfg_was_name_edit',
                scope: this,
                handler: function() { this.onButtonClick('Edit'); }
            }, {
                html: '<img src="../images/cfg_delete.png" width="15" height="15">',
                id: 'cfg_was_name_delete',
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

        wasListBodyCon.add(this.wasGrid);
        wasListPanel.add(wasListTitleCon, wasListBodyCon);

        return wasListPanel;
    },

    createGrid: function(){
        var self = this;

        this.wasGrid = Ext.create('Exem.adminGrid', {
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
                self.wasNameToolbar.getComponent('cfg_was_name_edit').setDisabled(false);
                self.wasNameToolbar.getComponent('cfg_was_name_delete').setDisabled(false);
            }
        });

        this.wasGrid.beginAddColumns();
        this.wasGrid.addColumn({text: 'sys_id'                      ,  dataIndex: 'sys_id',    width: 100, type: Grid.Number, alowEdit: false, editMode: false, hide: true});
        this.wasGrid.addColumn({text: 'type_id'                     ,  dataIndex: 'type_id',   width: 100, type: Grid.Number, alowEdit: false, editMode: false, hide: true});
        this.wasGrid.addColumn({text: common.Util.CTR('Name')       ,  dataIndex: 'name',      width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.wasGrid.addColumn({text: common.Util.CTR('Description'),  dataIndex: 'desc',      width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.wasGrid.endAddColumns();
    },

    onButtonClick: function(cmd) {
        var self = this,
            wasForm, rowData, systemID, typeID;

        switch (cmd) {
            case 'Add' :
                wasForm = Ext.create('config.config_bizcal_form');
                wasForm.parent = this;
                wasForm.systemID = 1 // sys_id로 대체해야함
                wasForm.init('Add');
                break;
            case 'Edit' :
                rowData = this.wasGrid.getSelectedRow()[0].data;
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
                        rowData = self.wasGrid.getSelectedRow()[0].data;
                        systemID = rowData['sys_id'];
                        typeID = rowData['type_id'];

                        Ext.Ajax.request({
                            url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID + '/biztype/' + typeID,
                            method : 'DELETE',
                            success : function(response) {
                                console.log(response);
                                Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Delete succeeded'));
                                self.onButtonClick('Refresh');
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
                this.wasGrid.clearRows();
                this.executeSQL();

                this.wasNameToolbar.getComponent('cfg_was_name_edit').setDisabled(true);
                this.wasNameToolbar.getComponent('cfg_was_name_delete').setDisabled(true);
                break;
            default :
                break;
        }
    },

    executeSQL: function() {
        var self = this,
            ix, ixLen, data;
        var id = 1; // sys_id로 대체해야함
        
        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + id + '/biztype',
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === 'true') {
                    data = result.data;
                    self.wasGrid.clearRows();

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        self.wasGrid.addRow([data[ix].sys_id, data[ix].type_id, data[ix].name, data[ix].desc]);
                    }
                    
                    self.wasGrid.drawGrid();
                }
            },
            failure : function(){}
        });

        this.refreshLoading = false;
    },

    changeWasInfo: function(systemID, typeID, name, desc) {
        var ix, ixLen, record;

        for (ix = 0, ixLen = this.wasGrid.getRowCount(); ix < ixLen; ix++) {
            if (this.wasGrid.getRow(ix).data.type_id == typeID) {
                record = this.wasGrid.findRow('type_id', typeID);
                record.set('name', name);
                record.set('desc', desc);
                break;
            }
        }
    }
});
