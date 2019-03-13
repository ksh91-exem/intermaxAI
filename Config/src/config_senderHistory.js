Ext.define('config.config_senderHistory', {
    extend: 'Exem.FormOnCondition',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,

    constructor: function() {
        this.superclass.constructor.call(this, config);
    },

    init: function(target) {
        this.target = target;

        this.initProperty();
        this.initLayout();
    },

    initProperty: function() {
        this.refreshLoading = false;
    },

    initLayout: function() {
        var baseCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            flex: 1,
            border: false,
            style: { background: '#eeeeee' }
        });

        this.createSenderHistoryPanel();

        baseCon.add(this.senderHistoryPanel);
        this.target.add(baseCon);

        this.createMessageWindow();
    },

    createSenderHistoryPanel: function() {
        this.senderHistoryPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            bodyStyle: { background: '#eeeeee' }
        });

        this.createSearchCon();

        this.createGridCon();

        this.senderHistoryPanel.add(this.searchCon, this.gridCon);
    },

    createSearchCon: function() {
        this.searchCon = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            height: 60,
            width: '100%',
            style: {
                margin: '0px 0px 2px 0px'
            }
        });

        this.createConditionArea();

        this.conditionRetrieveArea = Ext.create("Ext.container.Container", {
            xtype: 'container',
            layout: 'absolute',
            width: 100,
            height: '100%',
            border: false,
            style: { background: '#eeeeee' },
            items: Ext.create("Ext.button.Button", {
                text: common.Util.TR('Retrieve'),
                x: 0,
                y: '20%',
                width: 85,
                height: 34,
                cls : 'config-retrieve-btn',
                handler: function() {
                    this.retrieve(this);
                }.bind(this)
            })
        });

        this.searchCon.add(this.conditionArea, this.conditionRetrieveArea);
    },

    createConditionArea: function() {
        this.conditionArea = Ext.create("Ext.container.Container", {
            flex: 1,
            height: '100%',
            border: false,
            layout: 'absolute'
        });

        this.sendMessageField = Ext.create('Exem.TextField', {
            fieldLabel      : '' ,
            allowBlank      : false,
            value           : common.Util.TR('Send Message'), //'%',
            itemId          : 'send_message_field',
            labelWidth      : 45,
            maxLength       : 40,
            enforceMaxLength: true,
            width           : 235,
            x               : 330,
            y               : 7,
            listeners: {
                focus: function () {
                    if ( this.getValue() === '%' || this.getValue() === common.Util.TR('Send Message') )
                        this.setValue('%');
                },
                blur: function() {
                    if ( this.getValue() === '%' || !this.getValue() )
                        this.setValue(common.Util.TR('Send Message'));
                }
            }
        });


        this.modeComboBox = Ext.create('Exem.ComboBox', {
            x           : 600,
            y           : 5,
            fieldLabel  : common.Util.TR('Service Mode'),
            labelWidth  : 75,
            width       : 200,
            store: Ext.create('Exem.Store')
        });

        this.modeComboBox.addItem( 2 , common.Util.TR("Mail") );
        this.modeComboBox.addItem( 0 , common.Util.TR("SMS") );
        this.modeComboBox.addItem( '0,2' , common.Util.TR("ALL") );


        this.statusComboBox = Ext.create('Exem.ComboBox', {
            x           : 830,
            y           : 5,
            fieldLabel  : common.Util.TR('Send Status'),
            labelWidth  : 65,
            width       : 200,
            store: Ext.create('Exem.Store')
        });

        this.statusComboBox.addItem( 1 , common.Util.TR("Success") );
        this.statusComboBox.addItem( 0 , common.Util.TR("Fail") );
        this.statusComboBox.addItem( '0,1' , common.Util.TR("ALL") );


        this.alertTypeField = Ext.create('Exem.TextField', {
            fieldLabel      : '' ,
            allowBlank      : false,
            value           : common.Util.TR('Alert Type'), //'%',
            itemId          : 'alert_type_field',
            labelWidth      : 45,
            maxLength       : 40,
            enforceMaxLength: true,
            width           : 235,
            x               : 25,
            y               : 33,
            listeners: {
                focus: function () {
                    if ( this.getValue() === '%' || this.getValue() === common.Util.TR('Alert Type') )
                        this.setValue('%');
                },
                blur: function() {
                    if ( this.getValue() === '%' || !this.getValue() )
                        this.setValue(common.Util.TR('Alert Type'));
                }
            }
        });

        this.alertResourceNameField = Ext.create('Exem.TextField', {
            fieldLabel      : '' ,
            allowBlank      : false,
            value           : common.Util.TR('Alert Resource Name'), //'%',
            labelWidth      : 45,
            maxLength       : 40,
            enforceMaxLength: true,
            width           : 235,
            x               : 330,
            y               : 33,
            listeners: {
                focus: function () {
                    if ( this.getValue() === '%' || this.getValue() === common.Util.TR('Alert Resource Name') )
                        this.setValue('%');
                },
                blur: function() {
                    if ( this.getValue() === '%' || !this.getValue() )
                        this.setValue(common.Util.TR('Alert Resource Name'));
                }
            }
        });

        this.topAllToggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            x          : 681,
            y          : 33,
            offLabelCls:'x-toggle-slide-label-off2',
            onText     : common.Util.TR('TOP 30'),
            offText    : common.Util.TR('ALL'),
            state      : true
        });

        this.conditionArea.add(this.datePicker, this.sendMessageField, this.modeComboBox, this.statusComboBox,
            this.alertTypeField, this.alertResourceNameField, this.topAllToggle);
    },

    createGridCon: function() {
        this.gridCon = Ext.create('Ext.container.Container', {
            height: '100%',
            width : '100%',
            layout: 'fit',
            flex: 1,
            border: false,
            bodyStyle: {
                background: '#ffffff'
            }
        });

        this.senderHistoryGrid = Ext.create('Exem.BaseGrid', {
            defaultHeaderHeight : 26,
            localeType          : 'H:i:s',
            useEmptyText        : true,
            emptyTextMsg        : common.Util.TR('No data to display'),
            defaultPageSize     : 50,
            defaultbufferSize   : 50,
            rowNumber           : true,
            celldblclick : function(thisGrid, td, cellIndex, record) {
                this.sendMessage.show();
                this.message.setValue(record.data.message);
            }.bind(this)
        });

        this.senderHistoryGrid.beginAddColumns();
        this.senderHistoryGrid.addColumn( common.Util.CTR('Send Time'),             'time',           150,    Grid.String,      true,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('Server Name'),           'server_name',    110,    Grid.String,      true,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('Alert Type'),            'alert_type',     110,    Grid.String,      true,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('Alert Resource Name'),   'alert_resource_name',    140,    Grid.String,      true,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('User Name'),             'user_name',      120,    Grid.String,      true,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('Mobile'),                'phone_number',   120,    Grid.String,      true,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('Email'),                 'user_email',     180,    Grid.String,      true,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('Service Mode'),          'service_mode',   100,     Grid.String,      true,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('Send Status'),           'status',         90,     Grid.String,      true,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('Alert Level'),           'alert_level',    90,     Grid.String,      true,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('Send Message'),          'message',        440,    Grid.String,      true,  false);

        this.senderHistoryGrid.addColumn( common.Util.CTR('Service Name'),          'service_name',   110,    Grid.String,      false,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('Server Type'),           'server_type',    100,    Grid.String,      false,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('Alert Value'),           'alert_value',    100,    Grid.String,      false,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('Host IP'),               'host_ip',        100,    Grid.String,      false,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('Host Name'),             'host_name',      100,    Grid.String,      false,  false);
        this.senderHistoryGrid.addColumn( common.Util.CTR('Alert Description'),     'description',    100,    Grid.String,      false,  false);
        this.senderHistoryGrid.endAddColumns();

        this.senderHistoryGrid.contextMenu.addItem({
            title : common.Util.TR('Show Full Send Message'),
            itemId: 'full_sned_message',
            icon  : '',
            fn: function() {
                var targetRow = this.senderHistoryGrid.pnlExGrid.getSelectionModel().getSelection()[0].data;

                this.sendMessage.show();
                this.message.setValue(targetRow.message);
            }.bind(this)
        },0);

        this.gridCon.add(this.senderHistoryGrid);
    },

    createMessageWindow : function() {
        var centerPanel = Ext.create('Ext.panel.Panel', {
            flex        : 1,
            border      : false,
            bodyStyle   : { background: '#eeeeee' }
        });

        this.message = Ext.create('Ext.form.field.TextArea', {
            width       : 478,
            height      : 436,
            readOnly    : true,
            allowBlank  : true,
            enforceMaxLength : true
        });

        var okButton = Ext.create('Ext.button.Button', {
            text        : common.Util.TR('OK'),
            width       : 70,
            margin      : '0 2 0 0',
            itemId      : 'okButton',
            handler     : function() {
                this.sendMessage.close();
            }.bind(this)
        });

        this.sendMessage = Ext.create('Exem.Window', {
            layout      : 'vbox',
            maximizable : false,
            width       : 500,
            height      : 500,
            padding     : '10 10 0 10',
            title       : Comm.RTComm.setFont(9, common.Util.TR('Full Send Message')),
            bodyStyle   : { background: '#f5f5f5' },
            closeAction : 'hide',
            buttonAlign : 'center',
            buttons     : [okButton]
        });

        centerPanel.add(this.message);
        this.sendMessage.add(centerPanel);
    },

    executeSQL: function() {
        var dataSet = {},
            sendMessage  = this.sendMessageField.getValue(),
            alertType  = this.alertTypeField.getValue(),
            alertResourceName  = this.alertResourceNameField.getValue(),
            limitString;

        if ( this.refreshLoading ) {
            return;
        }

        this.senderHistoryGrid.clearRows();

        dataSet.sql_file = 'IMXConfig_Sender_History_Info.sql';

        if ( sendMessage === common.Util.TR('Send Message') ) {
            sendMessage = '%';
        }


        if ( alertType === common.Util.TR('Alert Type') ) {
            alertType = '%';
        }

        if ( alertResourceName === common.Util.TR('Alert Resource Name') ) {
            alertResourceName = '%';
        }

        if (this.topAllToggle.state) {
            if (Comm.currentRepositoryInfo.database_type === 'PostgreSQL') {
                limitString = 'limit 30';
            } else if (Comm.currentRepositoryInfo.database_type === 'MSSQL') {
                limitString = 'top 30';
            } else {
                limitString = 'WHERE ROWNUM <= 30';
            }
        }

        dataSet.bind = [{
            name: "from_time",
            value: Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d H:i') + ':00',
            type: SQLBindType.STRING
        }, {
            name: "to_time",
            value: Ext.util.Format.date(this.datePicker.getToDateTime(), 'Y-m-d H:i') + ':00',
            type: SQLBindType.STRING
        }, {
            name: 'send_message',
            value: sendMessage,
            type : SQLBindType.STRING
        }, {
            name: 'alert_type',
            value: alertType,
            type : SQLBindType.STRING
        }, {
            name: 'alert_resource_name',
            value: alertResourceName,
            type : SQLBindType.STRING
        }];

        dataSet.replace_string = [{
            name: 'limit',
            value: limitString
        }, {
            name: 'service_mode',
            value: this.modeComboBox.getValue()
        }, {
            name: 'send_status',
            value: this.statusComboBox.getValue()
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(header, data) {
            var ix, ixLen,
                dataRows;

            if(!data.rows.length){
                this.senderHistoryGrid.showEmptyText();
            }

            if ( !common.Util.checkSQLExecValid(header, data) ) {
                console.debug('config_senderHistory - executeSQL');
                console.debug(header);
                console.debug(data);
                return;
            }

            for ( ix = 0, ixLen = data.rows.length; ix < ixLen; ix++ ) {
                dataRows = data.rows[ix];

                // 발송 상태 데이터 변환(status)
                // 0 = 실패, 1 = 성공
                if( dataRows[5] === 0 ) {
                    dataRows[5] = common.Util.CTR('Fail');
                } else if ( dataRows[5] === 1 ) {
                    dataRows[5] = common.Util.CTR('Success');
                }

                // 알람 레벨 데이터 변환(alert_level)
                // 0 = 정상, 1 = 경고, 2 = 심각
                if( dataRows[6] === 0 ){
                    dataRows[6] = common.Util.CTR('Normal');
                } else if ( dataRows[6] === 1 ) {
                    dataRows[6] = common.Util.CTR('Warning');
                } else if ( dataRows[6] === 2 ) {
                    dataRows[6] = common.Util.CTR('Critical');
                }

                // 발송 종류 데이터 변환(service_mode)
                // 0 = SMS, 1 = API, 2 = Mail, 3 = Shell
                if( dataRows[8] === 0 ) {
                    dataRows[8] = common.Util.CTR('SMS');
                } else if ( dataRows[8] === 1 ) {
                    dataRows[8] = common.Util.CTR('API');
                } else if ( dataRows[8] === 2 ) {
                    dataRows[8] = common.Util.CTR('Mail');
                } else if ( dataRows[8] === 3 ) {
                    dataRows[8] = common.Util.CTR('Shell');
                }

                // 서버 타입 데이터 변환(server_type)
                // 1 = Agent, 2 = DB, 9 = HOST, 10 = FAB
                if(dataRows[9] === 1) {
                    dataRows[9] = common.Util.CTR('Agent');
                } else if ( dataRows[9] === 2 ) {
                    dataRows[9] = common.Util.CTR('DB');
                } else if ( dataRows[9] === 9 ) {
                    dataRows[9] = common.Util.CTR('Host');
                } else if ( dataRows[9] === 10 ) {
                    dataRows[9] = common.Util.CTR('FAB');
                }

                this.senderHistoryGrid.addRow([
                    dataRows[0],    //time
                    dataRows[10],   //server_name
                    dataRows[11],   //alert_type
                    dataRows[13],   //alert_resource_name
                    dataRows[2],    //sms_user_name
                    dataRows[3],    //phone_number
                    dataRows[4],    //sms_user_email
                    dataRows[8],    //service_mode
                    dataRows[5],    //status
                    dataRows[6],    //alert_level
                    dataRows[7],    //message
                    dataRows[1],    //service_name
                    dataRows[9],    //server_type
                    dataRows[12],   //alert_value
                    dataRows[14],   //host_ip
                    dataRows[15],   //host_name
                    dataRows[16]    //description
                ]);
            }
            this.senderHistoryGrid.drawGrid();

            this.refreshLoading = false;
        }, this);
    }
});
