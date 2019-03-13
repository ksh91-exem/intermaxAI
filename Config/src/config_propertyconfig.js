Ext.define('config.config_propertyconfig', {
    extend: 'Exem.Form',
    lyout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    target: undefined,
    select_userid: '',
    select_username: '',
    load_id: 0,
    waslist: [],
    value: '',


    constructor: function() {
        this.callParent();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    init: function(target) {
        var self = this;
        this.target = target;
        this.tabindex = -1;

        this.was_obj = {} ;
        this.data_count = 0 ;
        this.change_grid_data = {} ;
        /**
        this.full_text = {} ;
         **/


        if (!this.data) {
            this.data = {};
        }

        this.toolbar = Ext.create('Ext.toolbar.Toolbar', {
            /*renderTo: this.target.id,*/
            width: '100%',
            height: 30,
            border: false,
            items: [{
                text: common.Util.TR('Apply'),
                cls : 'x-btn-default-toolbar-small',
                style : { backgroundColor: '#fafafa',
                    borderColor : '#bbb',
                    marginLeft : '6px'
                },
                scope: this,
                handler: function() {
                    self.apply_button();
                }
            }]
        });
        this.target.add( this.toolbar ) ;

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            width: '100%',
            height: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        //

        var waslist_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'west',
            height: '100%',
            width: 310,
            border: false,
            split: true,
            margin: '3 0 3 6',
            padding: '2 3 2 3',
            bodyStyle: { background: '#ffffff' }
        });

        var waslist_panel_title = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: {background: '#eeeeee'},
            items: [{
                flex: 1,
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: {background: '#eeeeee'},
                html: Comm.RTComm.setFont(9, common.Util.TR('Agent List'))
            }]
        });

        var waslist_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        waslist_panel.add(waslist_panel_title);
        waslist_panel.add(waslist_panel_body);
        //

        var userconfig_panel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            region: 'center',
            height: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 0',
            padding: '2 2 2 2',
            bodyStyle: { background: '#ffffff' }
        });

        var userconfig_panel_title = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: 30,
            border: false,
            bodyStyle: { background: '#eeeeee' },
            items: [{
                height: 30,
                border: false,
                margin: '4 0 0 0',
                bodyStyle: { background: '#eeeeee' },
                html: Comm.RTComm.setFont(9, common.Util.TR('JSPD Property'))
            }]
        });

        var userconfig_panel_body = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            border: false,
            flex: 1,
            bodyStyle: { background: '#dddddd' }
        });

        this.tabpanel = Ext.create('Ext.tab.Panel', {
            layout: 'fit',
            flex: 1,
            width: '100%',
            height: '100%',
            items: [{
                layout: 'vbox',
                title:  common.Util.TR('User'),
                itemId: 'property_user',
                border: false,
                bodyStyle: { background: '#fafafa' }
            }, {
                layout: 'vbox',
                title:  common.Util.TR('Admin'),
                itemId: 'property_admin',
                border: false,
                bodyStyle: { background: '#fafafa' }
            }],
            listeners: {
                tabchange: function(tabPanel, newCard) {
                    if (newCard.title == common.Util.TR('User')) {
                        self.tabindex = 0;
                    } else {
                        self.tabindex = 1;
                    }
                }
            }
        });

        if (cfg.login.admin_check == 0) {
            this.tabpanel.items.items[1].tab.setVisible( false ) ;
            this.tabindex = 0 ;
        } else {
            this.tabpanel.items.items[1].tab.setVisible( true ) ;
        }


        userconfig_panel_body.add(this.tabpanel);

        var user_current_trace_transaction = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: 120,
            border: false,
            split: true,
            margin: '3 0 3 0',
            padding: '2 2 2 2',
            bodyStyle: { background: '#fafafa' },
            items: [{
                xtype: 'container',
                layout: 'absolute',
                itemId: 'current_trace_transaction_title',
                html: Comm.RTComm.setFont(9, common.Util.TR('Current Trace Transaction')),
                width: '100%',
                padding: '3 0 0 0',
                height: 25,
                style: { background: '#d1d1d1' }
            }, {
                xtype: 'container',
                layout: 'absolute',
                itemId: 'current_trace_transaction_body',
                width: '100%',
                flex: 1,
                style: { background: '#ffffff' }
            }]
        });

        var labelD = Ext.create('Ext.form.Label', {
            x: 20,
            y: 19,
            html: Comm.RTComm.setFont(9, common.Util.TR('Level (ms) '))
        });

        this.EditB = Ext.create('Ext.form.field.Text', {
            x: 90,
            y: 17,
            width: 300,
            value: ''
        });

        var labelE = Ext.create('Ext.form.Label', {
            x: 20,
            y: 45,
            html: Comm.RTComm.setFont(9, common.Util.TR('${TXNNAME}:${TXNTIME},${TXNNAME}:${TXNTIME}'))
        });

        var labelF = Ext.create('Ext.form.Label', {
            x: 20,
            y: 60,
            html: Comm.RTComm.setFont(9, common.Util.TR('ex) *:0'))
        });

        user_current_trace_transaction.getComponent('current_trace_transaction_body').add(labelD);
        user_current_trace_transaction.getComponent('current_trace_transaction_body').add(this.EditB);
        user_current_trace_transaction.getComponent('current_trace_transaction_body').add(labelE);
        user_current_trace_transaction.getComponent('current_trace_transaction_body').add(labelF);

        //

        var user_current_trace_level = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: 120,
            border: false,
            split: true,
            margin: '3 0 3 0',
            padding: '2 2 2 2',
            bodyStyle: { background: '#fafafa' },
            items: [{
                xtype: 'container',
                layout: 'absolute',
                itemId: 'current_trace_level_title',
                html: Comm.RTComm.setFont(9, common.Util.TR('Current Trace Level')),
                width: '100%',
                padding: '3 0 0 0',
                height: 25,
                style: { background: '#d1d1d1' }
            }, {
                xtype: 'container',
                layout: 'absolute',
                itemId: 'current_trace_level_body',
                width: '100%',
                flex: 1,
                style: { background: '#ffffff' }
            }]
        });

        var labelG = Ext.create('Ext.form.Label', {
            x: 20,
            y: 19,
            html: Comm.RTComm.setFont(9, common.Util.TR('Level'))
        });

        this.EditC = Ext.create('Ext.form.field.Text', {
            x: 90,
            y: 17,
            width: 300,
            value: ''
        });

        var labelH = Ext.create('Ext.form.Label', {
            x: 20,
            y: 45,
            html: Comm.RTComm.setFont(9, common.Util.TR('Default : 99(1~99)'))
        });

        var labelI = Ext.create('Ext.form.Label', {
            x: 20,
            y: 60,
            html: Comm.RTComm.setFont(9, common.Util.TR('ex) 99'))
        });

        user_current_trace_level.getComponent('current_trace_level_body').add(labelG);
        user_current_trace_level.getComponent('current_trace_level_body').add(this.EditC);
        user_current_trace_level.getComponent('current_trace_level_body').add(labelH);
        user_current_trace_level.getComponent('current_trace_level_body').add(labelI);

        //1502.11 save button 추가
        var btn_save = Ext.create('Ext.button.Button',{
            text     : common.Util.TR('Save') ,
            style    : { cursor: 'pointer' },
            listeners: {
                click: function(){
                    var value = '' ;
                    if ( self.was_grid.getSelectedRow()[0] == undefined ){
                        common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select Agent'), Ext.Msg.OK, Ext.MessageBox.WARNING, function(){
                        });
                        return ;
                    }
                    var was_id = self.was_grid.getSelectedRow()[0].data.was_id ;

                    if ( self.was_obj[was_id] == undefined ) {
                        self.was_obj[was_id] = [] ;
                        self.change_grid_data[was_id] = [] ;
                    }

                    for (var ix = 0; ix < self.grid.getRowCount(); ix++) {

                        var d = self.grid.getRow(ix).data;

                        if ((self.tabindex == 1) && (self.grid.getRow(ix).modified == undefined)) {
                                value += d.name + '=' + d.value + '\n';
                                continue;
                        }

                        if (d.name == 'CURR_TRACE_TXN') {
                            if (self.tabindex == 0) {
                                value += d.name + '=' + self.EditB.getValue() + '\n';
                            } else if (self.tabindex == 1) {
                                value += d.name + '=' + d.value + '\n';
                            }
                        } else if (d.name == 'CURR_TRACE_LEVEL') {
                            if (self.tabindex == 0) {
                                value += d.name + '=' + self.EditC.getValue() + '\n';
                            } else if (self.tabindex == 1) {
                                value += d.name + '=' + d.value + '\n';
                            }
                        } else {
                            value += d.name + '=' + d.value + '\n';
                        }

                        self.change_grid_data[was_id].push( self.grid.getRow(ix) ) ;
                    }

                    self.was_obj[was_id].push( value ) ;


                    var was_name = self.was_name[was_id];
                    var record  = self.was_grid.baseGrid.getStore().findRecord('was_name', was_name);
                    if (record && (was_name.indexOf(' (Modified)') == -1)) {
                            record.set('was_name', was_name + ' (Modified)');
                    }
                    record = null ;
                    was_name = null ;
                    was_id = null ;
                    value = null ;


                }//end_listeners
            }
        });

        this.tabpanel.getComponent('property_user').add(user_current_trace_transaction);
        this.tabpanel.getComponent('property_user').add(user_current_trace_level);
        this.tabpanel.getTabBar().add(btn_save);

        //

        this.admin = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-config-used-round-panel',
            width: '100%',
            flex: 1,
            border: false,
            split: true,
            margin: '3 0 3 0',
            padding: '2 2 2 2',
            bodyStyle: { background: '#fafafa' },
            items: []
        });

        this.tabpanel.getComponent('property_admin').add(this.admin);

        //

        userconfig_panel.add(userconfig_panel_title);
        userconfig_panel.add(userconfig_panel_body);

        //

        this._createWasGrid(waslist_panel_body);

        //

        panel.add(waslist_panel);
        panel.add(userconfig_panel);

        this.target.add(this.toolbar);
        this.target.add(panel);

        Ext.define('User', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'id', type: 'int'},
                {name: 'name',  type: 'string'},
                {name: 'value',  type: 'string'},
                {name: 'description',  type: 'string'}
            ]
        });

        this.myStore = Ext.create('Ext.data.Store', {
            model: 'User',
            proxy: {
                type: 'ajax',
                url: '../Config/JSPD_Description.json',
                reader: {
                    type: 'json',
                    rootProperty: 'users'
                }
            },
            autoLoad: true
        });

        if (cfg.login.admin_check == 0) {
            this.tabpanel.setActiveTab(0);
        } else {
            this.tabpanel.setActiveTab(1);
        }

        this.executeSQL_WasList();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
    replace_text: function( _was_id, find_str, _value ){
        var self = this ;
        var ix = 0 ;
        var find_pos,
            find_text ;

        //for( ix in self.was_obj ){
        if ( find_str == 'DEBUG' ){

            find_str = 'DEBUG=0x000' ; find_pos = 2800 ;

            find_text = self.full_text[_was_id][0].substring(find_pos, self.full_text[_was_id][0].length) ;

            self.full_text[_was_id][0].replace(find_text, _value) ;
            find_text = self.full_text[_was_id][0].substring(find_pos, self.full_text[_was_id][0].length) ;
            self.full_text[_was_id][0] = self.full_text[_was_id][0].replace(find_text, '\n'+_value) ;

        }else{

            find_pos = self.full_text[_was_id][0].indexOf( find_str ) ;
            find_text = self.full_text[_was_id][0].substring(find_pos, self.full_text[_was_id][0].length) ;
            find_text = self.full_text[_was_id][0].substr( find_pos, find_text.indexOf('#') )

            self.full_text[_was_id][0].replace(find_text, _value) ;
            self.full_text[_was_id][0] = self.full_text[_was_id][0].replace(find_text, _value) ;

        }



        //}


        ix = null ;
        find_pos = null ;
        find_text = null ;
        self = null ;

    } ,
*/


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    _createWasGrid: function(gridpanel) {
        var self = this;
        this.was_grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: true,
            useCheckBox: false,
            checkMode: Grid.checkMode.SIMPLE,
            showHeaderCheckbox: false,
            rowNumber: true,
            localeType: 'H:i:s',
            stripeRows: true,
            defaultHeaderHeight: 26,
            usePager: false,
            itemclick:function() {
                self.loadProperties(self.was_grid.getSelectedRow()[0].data.was_id, self.was_grid.getSelectedRow()[0].data.was_name);
            }
        });
        gridpanel.add(this.was_grid);

        this.was_grid.beginAddColumns();
        this.was_grid.addColumn({text: common.Util.CTR('Agent ID'),   dataIndex: 'was_id',     width: 100, type: Grid.StringNumber, alowEdit: false, editMode: false, hidden: true});
        this.was_grid.addColumn({text: common.Util.CTR('Agent Name'), dataIndex: 'was_name',   width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.was_grid.endAddColumns();
        this.was_grid.setOrderAct('was_id', 'ASC');
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    loadProperties: function() {
        this.load_id = parseInt(this.was_grid.getSelectedRow()[0].data.was_id);
        this.executeSQL_LoadProperties();
        this.gridSelect(this.load_id);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    executeSQL_WasList: function() {
        this.onData_Was() ;
    },

    onData_Was: function() {
        var self = this;
        var was_values = [];
        var ds = {};
        var whereList = '1=1';
        var orderBy = 'order by was_name';

        this.waslist.length = 0;
        this.was_grid.clearRows();
        this.was_name = {};

        ds.sql_file = 'IMXConfig_WasInfo.sql';
        ds.replace_string = [{
            name: 'whereList',
            value: whereList
        }, {
            name: 'orderBy',
            value: orderBy
        }];
        if(common.Util.isMultiRepository()) {
            ds.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(ds, function(aheader, adata) {
            if ((adata.rows != null) && (adata.rows.length > 0)) {
                var d = null;
                for (var ix = 0; ix < adata.rows.length; ix++) {
                    d = adata.rows[ix];
                    self.was_grid.addRow([
                        d[0],   //was_id
                        d[1]    //was_name
                    ]);
                    was_values.push({ name: d[0], value: d[1] });
                    self.was_name[d[0]] = d[1];

                    self.data[d[0]] = [];

                    if (self.waslist.length == 0) {
                        self.waslist.push(d[0]);
                    }
                }
                self.was_grid.endAddRow();
            }
            this.refresh_loading = false ;
        }, this);

        this.was_grid.drawGrid();
        if (this.was_grid.getSelectedRow().length > 0) {
            this.loadProperties(this.was_grid.getSelectedRow()[0].data.was_id, this.was_grid.getSelectedRow()[0].data.was_name);
        }
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    gridSelect: function(id) {
        for (var ix = 0; ix < this.was_grid.getRowCount(); ix++) {
            if (this.was_grid.getRow(ix).data.was_id == id) {
                this.was_grid.selectRow(ix);
                break;
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    executeSQL_LoadProperties: function() {
        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this.target,
            type: 'small-circleloading'
        });
        this.loadingMask.show();
        this.was_grid.setDisabled(true);
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Load_Properties.sql';
        if(common.Util.isMultiRepository()) {
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
        WS.SQLExec(dataSet, this.onData_Properties, this);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    onData_Properties: function(aheader, adata) {
        if (adata.rows != undefined) {
            var d = null;
            for (var ix = 0; ix < adata.rows.length; ix++) {
                d = adata.rows[ix];
                if (this.data[d[1]]) {
                    this.data[d[1]].length = 0;
                    this.data[d[1]] = d[2].split('\n');
                }
            }

            if (this.load_id != 0) {
                this.refresh_data(this.was_grid.getSelectedRow()[0].data.was_id, this.was_grid.getSelectedRow()[0].data.was_name);
            }
        }
        //refresh_data 함수로 가지 못했을 때의 예외 처리
        else {
            this.loadingMask.hide();
            this.was_grid.setDisabled(false);
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    refresh_data: function(wasid) {
        if (wasid == 'null')
            return;
        var pos = 0;
        var name = '';
        var value = '';
        var d = null;
        var source = {};
        var ix ;
        var text  = null;
        var index = 0;

        if (this.grid == undefined) {
            this.grid = Ext.create('Exem.adminGrid', {
                flex: 1,
                width: '100%',
                border: false,
                editMode: true,
                useCheckBox: false,
                checkMode: Grid.checkMode.SINGLE,
                localeType: 'H:i:s',
                defaultHeaderHeight: 26,
                usePager: false
            });
            this.admin.add(this.grid);

            this.grid.beginAddColumns();
            this.grid.addColumn({text: common.Util.CTR('Name'),  dataIndex: 'name',  width: 200, type: Grid.String, alowEdit: false, editMode: false});
            this.grid.addColumn({text: common.Util.CTR('Value'), dataIndex: 'value', width: 200, type: Grid.String, alowEdit: true, editMode: true});
            this.grid.addColumn({text: common.Util.CTR('Default'), dataIndex: 'default_value', width: 200, type: Grid.String, alowEdit: false, editMode: false});
            this.grid.addColumn({text: common.Util.CTR('Description'), dataIndex: 'description', width: 720, type: Grid.String, alowEdit: false, editMode: false});
            this.grid.addColumn({text: common.Util.CTR('Index'), dataIndex: 'index', width: 10 , type: Grid.StringNumber, alowEdit: true, editMode: true, hide: true});
            this.grid.endAddColumns();
        }

        this.grid.clearRows();

        for ( ix = 0; ix < this.data[wasid].length; ix++) {


            d = this.data[wasid];
            text += d[ix] ;
            if (d[ix].replace(/\n/g, '')[0] != '#' && d[ix].replace(/\n/g, '')[0] != '') {
                pos = d[ix].indexOf('=');
                name = d[ix].substr(0, pos).replace(/\n/g, '');
                value = d[ix].substr(pos + 1, 3000).replace(/\n/g, '');
                if (name != '') {
                    index ++ ;
                    var storeData;
                    var defaultData = {};

                    switch (name) {
                        //1
                        case 'TRX_NAME_TYPE'    :
                            storeData       = this.myStore.data.items[0].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //2
                        case 'TRX_NAME_KEY'    :
                            storeData       = this.myStore.data.items[1].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //3
                        case 'TRX_LOGIN_TYPE'    :
                            storeData       = this.myStore.data.items[2].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //4
                        case 'TRX_LOGIN_KEY'    :
                            storeData       = this.myStore.data.items[3].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //5
                        case 'TRX_IP_KEY'    :
                            storeData       = this.myStore.data.items[4].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //6
                        case 'TRX_ERR_TYPE'    :
                            storeData       = this.myStore.data.items[5].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //7
                        case 'APP_SLEEP'    :
                            storeData       = this.myStore.data.items[6].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //8
                        case 'ACTIVE_PERIOD'    :
                            storeData       = this.myStore.data.items[7].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //9
                        case 'ACTIVE_TOP_COUNT'    :
                            storeData       = this.myStore.data.items[8].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //10
                        case 'ACTIVE_ELAPSE_TIME'    :
                            storeData       = this.myStore.data.items[9].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //11
                        case 'CURR_TRACE_TXN'    :
                            storeData       = this.myStore.data.items[10].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            source.CURR_TRACE_TXN   = value;
                            break;
                        //12
                        case 'CURR_TRACE_LEVEL'    :
                            storeData       = this.myStore.data.items[11].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            source.CURR_TRACE_LEVEL = value;
                            if( value.trim() == '' ){
                                source.CURR_TRACE_LEVEL = 100 ;
                                value = 100 ;
                            }
                            break;
                        //13
                        case 'TRACE_JDBC'    :
                            storeData       = this.myStore.data.items[12].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //14
                        case 'METHOD_DEBUG'    :
                            storeData       = this.myStore.data.items[13].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //15
                        case 'EXCLUDE_SERVICE'    :
                            storeData       = this.myStore.data.items[14].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //16
                        case 'INCLUDE_EXCEPTION'    :
                            storeData       = this.myStore.data.items[15].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //17
                        case 'EXCLUDE_EXCEPTION'    :
                            storeData       = this.myStore.data.items[16].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //18
                        case 'PRIORITY_LEVEL'    :
                            storeData       = this.myStore.data.items[17].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //19
                        case 'REDIRECT_URL'    :
                            storeData       = this.myStore.data.items[18].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //20
                        case 'RESP_HTML_TID'    :
                            storeData       = this.myStore.data.items[19].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //21
                        case 'RESP_HTML_SCRIPT'    :
                            storeData       = this.myStore.data.items[20].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //22
                        case 'RESP_HTML_ELAPSE_TIME'    :
                            storeData       = this.myStore.data.items[21].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //23
                        case 'RT_RMI'    :
                            storeData       = this.myStore.data.items[22].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //24
                        case 'RT_RMI_VENDOR'    :
                            storeData       = this.myStore.data.items[23].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //25
                        case 'RT_RMI_TYPE'    :
                            storeData       = this.myStore.data.items[24].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //26
                        case 'RT_RMI_ELAPSE_TIME'    :
                            storeData       = this.myStore.data.items[25].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //27
                        case 'RT_FILE'    :
                            storeData       = this.myStore.data.items[26].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //28
                        case 'RT_SOCKET'    :
                            storeData       = this.myStore.data.items[27].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //29
                        case 'MTD_PARAM_TRACE'    :
                            storeData       = this.myStore.data.items[28].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //30
                        case 'COMPRESS_SQL'    :
                            storeData       = this.myStore.data.items[29].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //31
                        case 'LIMIT_SQL'    :
                            storeData       = this.myStore.data.items[30].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //32
                        case 'BIND_SIZE'    :
                            storeData       = this.myStore.data.items[31].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //33
                        case 'BIND_ELAPSE_TIME'    :
                            storeData       = this.myStore.data.items[32].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //34
                        case 'TXN_CPU_TIME'    :
                            storeData       = this.myStore.data.items[33].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //35
                        case 'THROW_TXN_FETCH_COUNT'    :
                            storeData       = this.myStore.data.items[34].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //36
                        case 'THROW_SQL_FETCH_COUNT'    :
                            storeData       = this.myStore.data.items[35].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //37
                        case 'THROW_EXCLUDE_SERVICE'    :
                            storeData       = this.myStore.data.items[36].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //38
                        case 'LOG_ALERT'    :
                            storeData       = this.myStore.data.items[37].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //39
                        case 'DEBUG'    :
                            storeData       = this.myStore.data.items[38].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //40
                        case 'TXN_ELAPSE_TIME'    :
                            storeData       = this.myStore.data.items[39].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //41
                        case 'USE_SESSIONID_FOR_WEBID'    :
                            storeData       = this.myStore.data.items[40].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //42
                        case 'UDP_BUFFER_CLEAR_PERIOD'    :
                            storeData       = this.myStore.data.items[41].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //43
                        case 'USE_TRACE_COLLECTION_LEAK'    :
                            storeData       = this.myStore.data.items[42].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //44
                        case 'TRACE_COLLECTION_SIZE'    :
                            storeData       = this.myStore.data.items[43].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //45
                        case 'TRACE_COLLECTION_STACKTRACE_SIZE'    :
                            storeData       = this.myStore.data.items[44].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //46
                        case 'TRACE_COLLECTION_REPORT_PERIOD'    :
                            storeData       = this.myStore.data.items[45].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //47
                        case 'LOG_PATH'    :
                            storeData       = this.myStore.data.items[46].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //48
                        case 'USE_TRACE_ORACLE'    :
                            storeData       = this.myStore.data.items[47].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //49
                        case 'TRX_NAME_USE_ENCODING'    :
                            storeData       = this.myStore.data.items[48].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //50
                        case 'TRX_NAME_ENCODING_FROM'    :
                            storeData       = this.myStore.data.items[49].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //51
                        case 'TRX_NAME_ENCODING_TO'    :
                            storeData       = this.myStore.data.items[50].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //52
                        case 'GET_SID_WHEN_STMT'    :
                            storeData       = this.myStore.data.items[51].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //53
                        case 'USE_JMX'    :
                            storeData       = this.myStore.data.items[52].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //54
                        case 'DISABLE_JDBC_ALARM'    :
                            storeData       = this.myStore.data.items[53].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //55
                        case 'USE_LONG_SQL'    :
                            storeData       = this.myStore.data.items[54].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //56
                        case 'DISABLE_SQL_BIND'    :
                            storeData       = this.myStore.data.items[55].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //57
                        case 'ENABLE_ENCRYPT_SQL_BIND'    :
                            storeData       = this.myStore.data.items[56].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //58
                        case 'ENABLE_ENCRYPT_LOGIN_NAME'    :
                            storeData       = this.myStore.data.items[57].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //59
                        case 'USE_REPLACE_NUMBER_PATH'    :
                            storeData       = this.myStore.data.items[58].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //60
                        case 'THREAD_DUMP_MAX_SIZE'    :
                            storeData       = this.myStore.data.items[59].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        //61
                        case 'MTD_LIMIT'    :
                            storeData       = this.myStore.data.items[60].data;
                            defaultData = this.propertyDefaultDataSetting(storeData);
                            break;
                        default :
                            break;
                    }

                    this.grid.addRow([name, value, defaultData.defaultValue, defaultData.description, index]);
                }
            }
        } //end_for
        /**
        this.full_text[wasid].push( text ) ;
         **/

        this.grid.drawGrid();
        this.admin.add(this.grid);




        if ( this.change_grid_data[wasid] !== undefined ){
            var record ;
            for ( ix in this.change_grid_data[wasid] ){
                if(this.change_grid_data[wasid].hasOwnProperty(ix)){
                    record = this.grid.baseGrid.getStore().findRecord( 'name', this.change_grid_data[wasid][ix].data.name ) ;
                    record.set( 'value', this.change_grid_data[wasid][ix].data.value ) ;
                }
            }
            record = null ;
        }

        this.EditB.setValue(source['CURR_TRACE_TXN']);
        this.EditC.setValue(source['CURR_TRACE_LEVEL']);

        this.loadingMask.hide();
        this.was_grid.setDisabled(false);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    propertyDefaultDataSetting: function(storeData){
        var defaultValue, description;

        if(Comm.Lang === 'ko' || window.nation === 'ko'){
            defaultValue    = storeData.value;
            description     = storeData.description;
        } else if(Comm.Lang === 'en' || window.nation === 'en'){
            if(storeData.value_en){
                defaultValue    = storeData.value_en;
            } else {
                defaultValue    = storeData.value;
            }
            description     = storeData.description_en;
        } else{
            if(storeData.value_ja){
                defaultValue    = storeData.value_ja;
            } else {
                defaultValue    = storeData.value;
            }
            description     = storeData.description_ja;
        }

        return {
            defaultValue    :   defaultValue,
            description     :   description
        };
    },

    apply_button: function() {
        if (this.load_id == 0)
            return;

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this.target,
            type: 'large-whirlpool'
        });

        var ix;
        this.data_count = 0 ;

        if ( Object.keys(this.was_obj).length == 0 )
            return ;

        this.loadingMask.show();
        this.toolbar.setDisabled(true);

        for ( ix in this.was_obj ){
            if(this.was_obj.hasOwnProperty(ix)){
                var send_data = {};
                var opts = {};

                this.data_count ++ ;

                opts.was_id = ix ;
                opts.properties = this.was_obj[ix][0] ;
                opts.dbname = localStorage.getItem('Intermax_MyRepository');

                send_data.dll_name = 'IntermaxPlugin.dll';
                send_data.options  = opts;
                send_data.options.dbname = cfg.repositoryInfo.currentRepoName;
                send_data.function = 'write_properties';


                WS.PluginFunction(send_data, this.recodeData(ix));
            }
        }
    },

    recodeData : function(ix){
        var self = this;

        if(Object.keys(this.was_obj).length == this.data_count){
            var record,
                was_name ;

            for ( ix in self.was_obj ){
                if(self.was_obj.hasOwnProperty(ix)){
                    was_name = self.was_name[ix] + ' (Modified)' ;
                    record  = self.was_grid.baseGrid.getStore().findRecord('was_name', was_name);

                    if (record && (was_name.indexOf(' (Modified)') > -1)) {
                        record.set('was_name', self.was_name[ix] );
                    }
                }
            }



            self.loadingMask.hide();
            this.toolbar.setDisabled(false);
            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));

            self.change_grid_data = {} ;
            self.was_obj = {} ;
            /**
             self.full_text = {} ;
             **/

            was_name = null ;
            record = null ;
            self = null ;
        }
    }
});
