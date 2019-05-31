Ext.define('config.config_training_progress_form', {
    parent: null,

    systemID : '',
    instID : '',

    init: function () {
        var self = this;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 300,
            height: 250,
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

        form.setTitle(common.Util.TR('진행상황'));

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            width: '100%',
            flex: 1,
            margin: '4 4 0 4',
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
        this.grid.addColumn({text: common.Util.CTR('Instance'), dataIndex: 'was_name'     ,  width: 100, type: Grid.String      , alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('진행률'),   dataIndex: 'elapse_ratio'  ,  width: 150, type: Grid.Number, alowEdit: true, editMode: true});

        var ratio_render = function(value) {
            return '<div style="position:relative; width:100%; height:13px">' +
                '<div data-qtip="' + value + '%' + '" style="float:left; background-color:#5898E9;height:100%;width:' + value + '%;"></div>' +
                '<div style="position:absolute;width:100%;height:100%;text-align:center;">' + value.toFixed(1) + '%</div>' +
                '</div>';
        };

        this.grid.addRenderer('elapse_ratio', ratio_render, RendererType.bar);

        this.grid.endAddColumns();

        panelA.add(this.grid);

        var panelC = Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'hbox',
                pack: 'center',
                align: 'middle'
            },
            width: '100%',
            height: 35,
            border: false,
            bodyStyle: { background: '#f5f5f5' }
        });

        this.trainingCancelButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Training Cancel'),
            cls: 'x-btn-config-default',
            width: 70,
            listeners: {
                click: function() {
                    this.trainingCancel();
                }.bind(this)
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

        panelC.add([this.trainingCancelButton, this.cancelButton]);

        form.add(panelA);
        form.add(panelC);

        form.show();

        this.execute();
    },

    execute: function() {
        var self = this,
            data, ix, ixLen;

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + self.systemID + '/train/' + self.instID + '/progress',
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === true) {
                    self.grid.clearRows();

                    data = result.data;

                    console.log(data);

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        self.grid.addRow(['A', 0]);
                    }

                    self.grid.drawGrid();
                }
            }.bind(this),
            failure : function(){}
        });
    },

    trainingCancel: function() {
        var self = this;

        Ext.MessageBox.confirm(common.Util.TR('Warning'), common.Util.TR('Are you sure you want to cancel?'), function() {
            Ext.Ajax.request({
                url : common.Menu.useGoogleCloudURL + '/training/' + self.systemID + '/' + self.instID,
                method : 'DELETE',
                success : function(response) {
                    var result = Ext.JSON.decode(response.responseText);
                    if (result.success === true) {
                        this.showMessage(common.Util.TR('Info'), common.Util.TR(data.message), Ext.Msg.OK, Ext.MessageBox.ERROR);
                    }
                }.bind(this),
                failure : function(){}
            });
        });
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

});
