Ext.define('config.config_training_history_form', {
    parent: null,

    systemID : '',
    instID : '',

    init: function (state) {
        var self = this;

        this.mode = state;

        self.referenceObjArray = [];

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 600,
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

        form.setTitle(common.Util.TR('이력 조회'));

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
            editMode: false,
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
        this.grid.addColumn({text: 'sys_id'                              , dataIndex: 'sys_id'    , width: 120, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: 'inst_id'                             , dataIndex: 'inst_id'   , width: 120, type: Grid.String, alowEdit: false, editMode: false, hide: true});
        this.grid.addColumn({text: common.Util.CTR('Start Training Date'), dataIndex: 'start_time', width: 140, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('End Training Date')  , dataIndex: 'end_time'  , width: 140, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Training Result')    , dataIndex: 'status'    , width: 110, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Detailed result')    , dataIndex: 'results'   , width: 110, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.endAddColumns();

        panelA.add(this.grid);


        var panelC = Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            },
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#f5f5f5' }
        });

        this.cancelButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Close'),
            cls: 'x-btn-config-default',
            width: 70,
            listeners: {
                click: function() {
                    this.up('.window').close();
                }
            }
        });

        panelC.add(this.cancelButton);

        form.add(panelA);
        form.add(panelC);

        form.show();

        this.initDataSetting();
    },

    initDataSetting: function() {
        var self = this,
            data, status,
            ix, ixLen;

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + self.systemID + '/train/' + self.instID + '/history',
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === true) {
                    self.grid.clearRows();

                    data = result.data;

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {

                        if (data[ix].status == 0) {
                            status = common.Util.TR('Before Training');
                        } else if (data[ix].status == 1) {
                            status = common.Util.TR('Training Request');
                        } else if (data[ix].status == 2) {
                            status = common.Util.TR('Training in Progress');
                        } else if (data[ix].status == 3) {
                            status = common.Util.TR('Complete Training');
                        } else if (data[ix].status == 4) {
                            status = common.Util.TR('Training Error');
                        }

                        self.grid.addRow([
                            data[ix].sys_id
                            , data[ix].inst_id
                            , data[ix].start_time
                            , data[ix].end_time
                            , status
                            , data[ix].results
                        ]);
                    }

                    self.grid.drawGrid();
                }
            }.bind(this),
            failure : function(){}
        });
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    save: function() {

    }
});
