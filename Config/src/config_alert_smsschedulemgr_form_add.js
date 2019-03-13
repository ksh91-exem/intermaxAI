Ext.define('config.config_alert_smsschedulemgr_form_add', {

    parent: null,

    init: function() {
        var self = this;

        var store = Ext.create('Exem.Store');
        store.add({ '1': '--', '2': '--' });
        for (var ix = 0; ix < 24; ix++) {
            store.add({
                '1': ix < 10 ? '0' + ix.toString() : ix.toString(),
                '2': ix < 10 ? '0' + ix.toString() : ix.toString()
            });
        }

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 370,
            height: 165,
            resizable: false,
            title: common.Util.TR('Year/Month/Day Schedule Settings'),
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        this.form = form;

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        //

        var fromtimeCalendar = Ext.create('Ext.menu.DatePicker', {
            handler: function (dp, date) {
                self.fromtimeEdit.setValue(Ext.Date.format(date, 'Y-m-d'));
            }
        });

        var totimeCalendar = Ext.create('Ext.menu.DatePicker', {
            handler: function (dp, date) {
                self.totimeEdit.setValue(Ext.Date.format(date, 'Y-m-d'));
            }
        });

        // FROMTIME
        var fromtimeDateLabel = Ext.create('Ext.form.Label', {
            x: 16,
            y: 15,
            html: Comm.RTComm.setFont(9, common.Util.TR('Start Date'))
        });
        this.fromtimeEdit = Ext.create('Ext.form.field.Text', {
            x: 80,
            y: 13,
            width: 100,
            cls: 'login_area_idpweditbox',
            realOnly: true
        });
        var fromtimeCalendarButton = Ext.create('Ext.button.Button', {
            text: '',
            cls: 'x-btn-config-default',
            x: 183,
            y: 10,
            width: 20,
            menuAlign: 'bl',
            menu: fromtimeCalendar
        });
        var fromtimeTimeLabel = Ext.create('Ext.form.Label', {
            x: 230,
            y: 15,
            html: Comm.RTComm.setFont(9, common.Util.TR('Hour'))
        });
        this.startTimeEdit = Ext.create('Exem.ComboBox',  { width: 70, height: 22, x: 260, y: 13, store : store, cls: 'config_tab' });

        panelA.add(fromtimeDateLabel);
        panelA.add(this.fromtimeEdit);
        panelA.add(fromtimeCalendarButton);
        panelA.add(fromtimeTimeLabel);
        panelA.add(this.startTimeEdit);

        // TOTIME
        var toimeDateLabel = Ext.create('Ext.form.Label', {
            x: 16,
            y: 42,
            html: Comm.RTComm.setFont(9, common.Util.TR('End Date'))
        });
        this.totimeEdit = Ext.create('Ext.form.field.Text', {
            x: 80,
            y: 40,
            width: 100,
            cls: 'login_area_idpweditbox',
            readOnly: true
        });
        var totimeCalendarButton = Ext.create('Ext.button.Button', {
            text: '',
            cls: 'x-btn-config-default',
            x: 183,
            y: 37,
            width: 20,
            menuAlign: 'bl',
            menu: totimeCalendar
        });
        var totimeTimeLabel = Ext.create('Ext.form.Label', {
            x: 230,
            y: 42,
            html: Comm.RTComm.setFont(9, common.Util.TR('Hour'))
        });
        this.endTimeEdit = Ext.create('Exem.ComboBox',  { width: 70, height: 22, x: 260, y: 40, store : store, cls: 'config_tab' });

        panelA.add(toimeDateLabel);
        panelA.add(this.totimeEdit);
        panelA.add(totimeCalendarButton);
        panelA.add(totimeTimeLabel);
        panelA.add(this.endTimeEdit);

        // WORK MODE
        var workModeStore = Ext.create('Exem.Store');
        workModeStore.add({ '1': 'WORKING', '2': 'WORKING' });
        workModeStore.add({ '1': 'NON-WORKING', '2': 'NON-WORKING' });

        var workModeLabel = Ext.create('Ext.form.Label', {
            x: 16,
            y: 69,
            html: Comm.RTComm.setFont(9, common.Util.TR('Work Mode'))
        });
        this.workModeCombo = Ext.create('Exem.ComboBox',  { width: 124, height: 22, x: 80, y: 67, store : workModeStore, cls: 'config_tab' });

        panelA.add(workModeLabel);
        panelA.add(this.workModeCombo);

        //

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
            text: 'OK',
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    self.save();
                }
            }
        });

        this.CancelButton = Ext.create('Ext.button.Button', {
            text: common.Util.TR('Cancel'),
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
        panelC.add(this.CancelButton);

        form.add(panelA);
        form.add(panelC);

        form.show();
    },

    save: function() {
        if( !this.fromtimeEdit.getValue() && !this.totimeEdit.getValue() ){
            Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Please enter the Date'));
            return;
        }else{
            if( this.fromtimeEdit.getValue() > this.totimeEdit.getValue() ) {
                Ext.Msg.alert(common.Util.TR('ERROR'), common.Util.TR('Invalid Date Range'));
                return;
            }
        }
        var fromtime = this.fromtimeEdit.getValue() + ' ' + this.startTimeEdit.getReplValue();
        var totime   = this.totimeEdit.getValue() + ' ' + this.endTimeEdit.getReplValue();
        this.parent.YMD_save(fromtime, totime, this.workModeCombo.getReplValue());
        this.form.close();
    }
});
