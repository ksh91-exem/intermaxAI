Ext.define('config.config_training_manual_form', {
    parent: null,

    data : null,

    DisplayTime: DisplayTimeMode.None,

    init: function () {
        var self = this;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 600,
            height: 500,
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

        form.setTitle(common.Util.TR('수동학습 설정'));

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false
        });

        var optionArea = Ext.create('Ext.panel.Panel', {
            width   : '100%',
            height  : '40px',
            layout  : 'hbox',
            cls: 'x-config-used-round-panel',
            bodyStyle: { background: '#eeeeee' },
            margin : '0 0 5 0'
        });

        var dateLabel = Ext.create('Ext.form.Label', {
            margin     : '13 0 0 10',
            text : common.Util.TR('Learning Data Range')
        });

        this.datePicker = Ext.create('Exem.DatePicker', {
            margin     : '10 0 0 5',
            height     : 30,
            DisplayTime: this.DisplayTime,
            rangeOneDay: this.rangeOneDay,
            singleField: this.singleField,
            isDiff     : this.isDiff,
            defaultTimeGap : this.defaultTimeGap,
            useRetriveBtn : false,
            useGoDayButton : false
        });

        optionArea.add(dateLabel, this.datePicker);

        this.grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            flex : 1,
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
            defaultPageSize: 300
        });

        this.grid.beginAddColumns();
        this.grid.addColumn({text: 'sys_id'                      , dataIndex: 'sys_id' , width: 120, type: Grid.String      , alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: 'inst_id'                     , dataIndex: 'inst_id', width: 120, type: Grid.String      , alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: common.Util.CTR('Name')       , dataIndex: 'name'   , width: 120, type: Grid.String      , alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Description'), dataIndex: 'desc'   , width: 120, type: Grid.StringNumber, alowEdit: false, editMode: false});
        this.grid.endAddColumns();

        panelA.add([optionArea, this.grid]);

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
            text: common.Util.TR('학습'),
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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    initDataSetting: function() {
        var ix, ixLen,
            data = this.data;

        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            this.grid.addRow([data[ix].group.sys_id, data[ix].group.inst_id, data[ix].group.name, data[ix].group.desc]);
        }

        this.grid.drawGrid();
    },

    save: function() {
        var ix, ixLen, systemID,
            data, inst_ids = [];

        for (ix = 0, ixLen = this.grid.baseStore.data.items.length; ix < ixLen; ix++) {
            data = this.grid.baseStore.data.items[ix].data;
            inst_ids.push(data.inst_id);

            systemID = data.sys_id;
        }

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + systemID + '/trainmanual',
            method : 'POST',
            jsonData : {
                train_from : this.datePicker.getFromDateTime(),
                train_to   : this.datePicker.getToDateTime(),
                inst_ids   : inst_ids
            },
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === true) {
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Training succeeded'));
                    this.cancelButton.fireEvent('click');
                }
            }.bind(this),
            failure : function(){}
        });
    }
});
