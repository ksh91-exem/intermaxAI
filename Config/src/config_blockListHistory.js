Ext.define('config.config_blockListHistory', {
    extend: 'Exem.FormOnCondition',
    width : '100%',
    height: '100%',
    DisplayTime: DisplayTimeMode.HM,

    init : function(target){

        var self = this;
        this.target = target;

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: 770,
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var blocklist_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            bodyStyle: { background: 'transparent' }
        });

        var blocklist_panel_title = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            height: 40,
            width: '100%',
            style: {
                margin: '0px 0px 2px 0px'
            }
        });

//////////////////////////////////////////////////////////////////////////////////////
// PA에서 사용하던 것을 config에서 사용하기 위해서 다시 선언함(주로 UI쪽 문제)
        self.conditionArea = Ext.create("Ext.container.Container", {
            xtype: 'container',
            itemId: 'containerArea',
            flex: 1,
            height: '100%',
            border: false,
            layout: 'absolute',
            style: {
                background: '#eeeeee',
                padding: "5px 5px"
            }
        });

        // Retrieve Button Area
        self.conditionRetrieveArea = Ext.create("Ext.container.Container", {
            xtype: 'container',
            layout: 'absolute',
            width: 80,
            height: '100%',
            border: false,
            style: { background: '#eeeeee' },
            items: Ext.create("Ext.button.Button", {
                text: common.Util.TR('Retrieve'),
                x: 0,
                y: '15%',
                width: 70,
                height: 25,
                cls : 'config-retrieve-btn',
                handler: function() {
                    self.retrieve(self);
                }
            })
        });
///////////////////////////////////////////////////////////////////////////////////

        self.business_name = Ext.create('Ext.form.Label', {
            html: Comm.RTComm.setFont(9, common.Util.TR('Business Name')),
            x                 : 300,
            y                 : (Comm.Lang == 'en'? 10 : 7)
        });

        self.searchBusinessComboBox = Ext.create('Exem.AjaxComboBox',{
            x: (Comm.Lang == 'en'? 400: Comm.Lang == 'ja'? 360 : 350),
            y: 7,
            width: 250,
            data: [],
            enableKeyEvents: true,
            hideTrigger: true,
            forceSelection: true,
            cls: 'config_tab',
            listeners: {
                scope: this,
                select: function(combo, selection) {
                    this.searchBusinessName = selection.get('value');

                    if (this.searchBusinessName == null) {
                        this.searchBusinessName = '';
                    }
                },
                change: function(combo) {
                    if (combo.getValue() == null) {
                        this.searchBusinessName = '';
                        combo.reset();
                    } else {
                        this.searchBusinessName = combo.getValue();
                    }
                }
            }
        });

        var blocklist_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        self.conditionArea.add(self.datePicker);
        self.conditionArea.add(self.business_name);
        self.conditionArea.add(self.searchBusinessComboBox);
        blocklist_panel_title.add([self.conditionArea, self.conditionRetrieveArea]);

        blocklist_panel.add(blocklist_panel_title);
        blocklist_panel.add(blocklist_panel_body);

        this._createBusinessGrid(blocklist_panel_body);

        panel.add(blocklist_panel);

        this.target.add(panel);

        this.setBusinessList(self.searchBusinessComboBox);

        this.executeSQL();

    },

    _createBusinessGrid: function(gridpanel) {
        this.business_grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: false,
            useCheckBox: false,
            checkMode: Grid.checkMode.SINGLE,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300
        });
        gridpanel.add(this.business_grid);

        this.business_grid.beginAddColumns();
        this.business_grid.addColumn({text: common.Util.CTR('Setting Change Date'), dataIndex: 'setting_change_date',   width: 200, type: Grid.DateTime, alowEdit: false, editMode: false});
        this.business_grid.addColumn({text: common.Util.CTR('Business Name'),       dataIndex: 'business_name',         width: 200, type: Grid.String, alowEdit: false, editMode: false});
        this.business_grid.addColumn({text: common.Util.CTR('Setting Status'),      dataIndex: 'setting_status',        width: 100, type: Grid.String, alowEdit: false, editMode: false,
            renderer: function (value) {
                if (value == 1) {
                    return '<div>'+common.Util.TR('Reject')+'</div>';
                } else {
                    return '<div>'+common.Util.TR('Allow')+'</div>';
                }
            }
        });
        this.business_grid.addColumn({text: common.Util.CTR('Change User Name'), dataIndex: 'change_user_name',    width: 160, type: Grid.String, alowEdit: false, editMode: false});
        this.business_grid.endAddColumns();
    },

    /**
     * Setting up business people name to be displayed in the combo box.
     * @private
     */
    setBusinessList: function(combo) {
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Business_Name_Info.sql';

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {
            var comboValues = [];
            if (adata != null) {
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    comboValues.push({ name: adata.rows[ix][0], value: adata.rows[ix][0]});
                }
            }
            combo.setData(comboValues);
            combo.setSearchField('name');

        }, this);
    },

    executeSQL: function() {

        if (this.searchBusinessName == null) {
            this.searchBusinessName = '';
        }

        this.business_grid.clearRows() ;

        var fromTime = Ext.util.Format.date(this.datePicker.getFromDateTime(), Comm.dateFormat.HM);
        var toTime   = Ext.util.Format.date(this.datePicker.getToDateTime(), Comm.dateFormat.HM);

        this.datePicker.mainFromField.setValue(fromTime);
        this.datePicker.mainToField.setValue(toTime);

        var businessData = '',
            dataSet = {};
        if (!Ext.isEmpty(this.searchBusinessName)) {
            businessData = ' and b.business_name = \'' + this.searchBusinessName + '\'';
        }

        dataSet.sql_file = 'IMXConfig_BlockList_History.sql';
        dataSet.bind = [{
            name: 'from_time',
            value: common.Util.getDate(fromTime),
            type : SQLBindType.STRING
        },{
            name: 'to_time',
            value: common.Util.getDate(toTime),
            type : SQLBindType.STRING
        }];
        dataSet.replace_string = [{
            name : 'business_name',
            value : businessData
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function(aheader, adata) {

            if (adata == null){
                return;
            }
            if (adata.rows != null && adata.rows.length > 0) {

                var d = null;

                this.business_grid.clearRows() ;

                for (var ix = 0; ix < adata.rows.length; ix++) {
                    d = adata.rows[ix];

                    this.business_grid.addRow([
                        d[0],   //setting_change_date
                        d[1],   //business_name
                        d[2],   //setting_status
                        d[3]    //change_user_name
                    ]);
                }
                this.business_grid.drawGrid();
            }
        }, this);
    }
});

