Ext.define('config.config_bizcal_date_form', {
    parent: null,

    init: function (state) {
        var self = this;

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 300,
            height: 150,
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

        form.setTitle(common.Util.TR('Edit Date'));

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var panelA2 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            flex: 1,
            height: '100%',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        this.dateEdit = Ext.create('Ext.form.field.Text', {
            x: 0,
            y: 10,
            width: 270,
            labelWidth: 80,
            labelAlign: 'right',
            hideTrigger : true,
            fieldLabel: Comm.RTComm.setFont(9, common.Util.CTR('Date')),
            allowBlank: true
        });

        this.businessTypeCombo = Ext.create('Exem.ComboBox',{
            x: 0,
            y: 37,
            width: 270,
            store: Ext.create('Exem.Store'),
            multiSelect: true,
            fieldLabel: common.Util.TR('Business Type'),
            listeners: {
                scope: this,
                select: function() {
                    // 선택한 이름으로 찾기
                    // this.findStatValue();
                }
            }
        });

        panelA2.add(this.dateEdit, this.businessTypeCombo);
        panelA.add(panelA2);

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

        panelC.add([OKButton, this.cancelButton]);

        form.add(panelA);
        form.add(panelC);

        form.show();
        this.setCombo();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    save: function() {
        var self = this,
            selectDate, type_ids;

        selectDate = this.selectDate.replace(/-/gi,'');
        type_ids = this.businessTypeCombo.getValue();

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + self.systemID + '/bizcal/' + selectDate,
            method : 'POST',
            jsonData : {
                type_ids : type_ids
            },
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === 'true') {
                    Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
                    this.cancelButton.fireEvent('click');
                    this.parent.setBusiness();
                }
            }.bind(this),
            failure : function(){}
        });
    },

    setCombo: function() {
        var self = this,
            ix, ixLen, jx, jxLen, data,
            bizTypeData;

        this.dateEdit.setValue(this.selectDate);
        this.dateEdit.setDisabled(true);

        Ext.Ajax.request({
            url : common.Menu.useGoogleCloudURL + '/admin/system/' + self.systemID + '/biztype',
            method : 'GET',
            success : function(response) {
                var result = Ext.JSON.decode(response.responseText);
                if (result.success === 'true') {
                    data = result.data;

                    for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                        this.businessTypeCombo.addItem(data[ix].type_id, data[ix].name);

                        bizTypeData = this.parent.calendarData[this.selectDate.replace(/-/gi,'')] || '';
                        for (jx = 0, jxLen = bizTypeData.length; jx < jxLen; jx++) {
                            this.businessTypeCombo.selectByValue(bizTypeData[ix]);
                        }
                    }
                }
            }.bind(this),
            failure : function(){}
        });
    }
});
