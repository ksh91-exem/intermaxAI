Ext.define('config.config_training_auto_form', {
    parent: null,

    init: function (state) {
        var self = this;

        this.mode = state;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 500,
            height: 300,
            resizable: false,
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy',
            cls: 'config_tab',
            listeners   : {
                close: function(){
                    if ( self.isWasNameModifiedAll ) {
                        self.parent.onButtonClick('Refresh');
                    }
                }
            }
        });

        form.setTitle(common.Util.TR('자동학습 설정'));

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false
        });

        this.grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            flex : 1,
            editMode: true,
            useCheckBox: false,
            rowNumber: false,
            checkMode: Grid.checkMode.MULTI,
            showHeaderCheckbox: false,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300
        });

        this.grid.beginAddColumns();
        this.grid.addColumn({text: 'sys_id'                                   , dataIndex: 'sys_id'    ,  width: 120, type: Grid.String      , alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: common.Util.CTR('Type')                    , dataIndex: 'type'      ,  width: 60 , type: Grid.String      , alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Auto Learning Start Date'), dataIndex: 'start_date',  width: 120, type: Grid.String      , alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Auto Learning Cycle')     , dataIndex: 'repeat'    ,  width: 110, type: Grid.StringNumber, alowEdit: true , editMode: true});
        this.grid.addColumn({text: common.Util.CTR('Auto Learning Section')   , dataIndex: 'data_range',  width: 110, type: Grid.StringNumber, alowEdit: true , editMode: true});
        this.grid.endAddColumns();

        panelA.add(this.grid);

        var panelC = Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            },
            width: '100%',
            height: 25,
            border: false,
            bodyStyle: { background: '#f5f5f5' }
        });

        var OKButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Save'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    self.save();
                }
            }
        });

        this.cancelButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Close'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 0 0 2',
            listeners: {
                click: function() {
                    this.up('.window').close();
                }
            }
        });

        panelC.add(OKButton);
        panelC.add(this.cancelButton);

        form.add(panelA);
        form.add(panelC);

        form.show();

        this.initDataSetting();
    },

    initDataSetting: function() {
        var self = this,
            ix, ixLen;

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + self.systemID + '/trainmeta',
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === true) {
                    this.grid.clearRows();

                    for (ix = 0, ixLen = result.data.length; ix < ixLen; ix++) {
                        self.grid.addRow([
                            result.data[ix].sys_id
                            , result.data[ix].type
                            , result.data[ix].start_date
                            , result.data[ix].repeat
                            , result.data[ix].data_range
                        ]);
                    }

                    this.grid.drawGrid();
                }
            }.bind(this),
            failure : function(){}
        });
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    save: function() {
        var self = this, data = [],
            result, ix, ixLen;

        for (ix = 0, ixLen = this.grid.baseStore.data.items.length; ix < ixLen; ix++) {
            result = this.grid.baseStore.data.items[ix].data;
            data.push({
                type       : result.type,
                start_date : result.start_date,
                repeat     : result.repeat,
                data_range : result.data_range
            })
        }

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + self.systemID + '/trainmeta',
            method : 'POST',
            jsonData : data,
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);

                if (result.success === true) {
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                    this.initDataSetting();
                } else {
                    console.error(result.message);
                }
            }.bind(this),
            failure : function(){}
        });
    }
});
