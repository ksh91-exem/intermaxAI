Ext.define('config.config_alert_url_form', {

    mode: '',
    wasid: 0,
    wasname: '',
    url: '',
    ip: '',
    method: '',
    param: '',
    parent: null ,

    init: function(_state_) {
        var self = this;

        this.mode = _state_;

        var form_height = 450;
        var param_width = 290;

        if (_state_ == 'Edit') {
            form_height = 187;
            param_width = 370;
        }

        var form = Ext.create('Exem.Window', {
            layout: 'vbox',
            maximizable: false,
            width: 500,
            height: form_height,
            resizable: false,
            title: common.Util.TR('URL Check Configuration'),
            bodyStyle: { background: '#f5f5f5' },
            closeAction: 'destroy'
        });

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            cls: 'x-config-used-round-panel',
            width: '100%',
            height: 120,
            margin: '4 4 4 4',
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        var ipLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 12,
            width: 80,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.TR('IP'))
        });

        this.ipComboBox = Ext.create('Exem.ComboBox', {
            x: 90,
            y: 10,
            width: 120,
            store: Ext.create('Exem.Store'),
            editable: false,
            cls     : 'config_tab',
            listeners: {
                change: function(_this, _newValue) {
                    self.wasnameChange(_newValue);
                }
            }
        });

        var wasnameLabel = Ext.create('Ext.form.Label', {
            x: 235,
            y: 12,
            width: 80,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.CTR('Agent Name'))
        });

        this.wasnameComboBox = Ext.create('Exem.ComboBox', {
            x       : 325,
            y       : 10,
            width   : 135,
            store   : Ext.create('Exem.Store'),
            cls     : 'config_tab',
            editable: false
        });

        var urlLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 39,
            width: 80,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.CTR('URL'))
        });

        this.urlEdit = Ext.create('Ext.form.field.Text', {
            x: 90,
            y: 37,
            width: 370,
            allowBlank: false
        });

        var methodLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 66,
            width: 80,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.CTR('Method'))
        });

        this.methodComboBox = Ext.create('Exem.ComboBox', {
            x       : 90,
            y       : 64,
            width   : 120,
            store   : Ext.create('Exem.Store'),
            cls     : 'config_tab',
            editable: false
        });
        this.methodComboBox.addItem(common.Util.CTR('Get'), 'Get');
        this.methodComboBox.addItem(common.Util.CTR('Post'), 'Post');

        var paramLabel = Ext.create('Ext.form.Label', {
            x: 0,
            y: 93,
            width: 80,
            style: 'text-align:right;',
            html: Comm.RTComm.setFont(9, common.Util.CTR('Parameter'))
        });

        this.paramEdit = Ext.create('Ext.form.field.Text', {
            x: 90,
            y: 91,
            width: param_width
        });

        if (_state_ == 'Add') {
            var AddButton = Ext.create('Ext.button.Button', {
                text: 'Add',
                x: 390,
                y: 90,
                cls: 'x-btn-config-default',
                width: 70,
                height: 24,
                margin: '0 2 0 0',
                listeners: {
                    click: function() {
                        self.addDataToGrid();
                    }
                }
            });

            var panelB = Ext.create('Ext.panel.Panel', {
                layout: 'vbox',
                cls: 'x-config-used-round-panel',
                width: '100%',
                flex: 1,
                margin: '0 4 4 4',
                padding: '1 1 1 1',
                border: false,
                bodyStyle: { background: '#eeeeee' }
            });
        }

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
            text: common.Util.TR('OK'),
            cls: 'x-btn-config-default',
            width: 70,
            margin: '0 2 0 0',
            listeners: {
                click: function() {
                    if (self.mode == 'Add') {
                        self.save();
                        this.up('.window').close();
                    } else {
                        self.update();
                    }
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

        var panelB1 = Ext.create('Ext.panel.Panel', {
            layout: 'absolute',
            width: '100%',
            height: 24,
            border: false,
            bodyStyle: { background: '#dddddd' }
        });

        var labelA = Ext.create('Ext.form.Label', {
            x: 5,
            y: 4,
            html: Comm.RTComm.setFont(9, common.Util.TR('List'))
        });

        var panelB2 = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            width: '100%',
            flex: 1,
            border: false,
            bodyStyle: { background: '#eeeeee' }
        });

        // Grid
        this.grid = Ext.create('Exem.adminGrid', {
            width : '100%',
            height: '100%',
            editMode: false,
            useCheckBox: false,
            checkMode: Grid.checkMode.MULTI,
            showHeaderCheckbox: false,
            rowNumber: false,
            localeType: 'H:i:s',
            stripeRows: true,
            itemclick: null,
            border: false,
            defaultHeaderHeight: 26,
            usePager: false,
            defaultbufferSize: 300,
            defaultPageSize: 300
        });

        this.grid.beginAddColumns();
        this.grid.addColumn({text: common.Util.CTR('Agent ID'),   dataIndex: 'was_id',   width: 100 , type: Grid.StringNumber, alowEdit: false, editMode: false, hide: false});
        this.grid.addColumn({text: common.Util.CTR('Agent Name'), dataIndex: 'was_name', width: 150, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('IP'),         dataIndex: 'ip',       width: 100, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('URL'),        dataIndex: 'url',      width: 200, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Method'),     dataIndex: 'method',   width:  60, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.addColumn({text: common.Util.CTR('Parameter'),  dataIndex: 'param',    width: 200, type: Grid.String, alowEdit: false, editMode: false});
        this.grid.endAddColumns();

        form.add(panelA);
        if (_state_ == 'Add') {
            form.add(panelB);
        }
        form.add(panelC);

        panelA.add(ipLabel);
        panelA.add(this.ipComboBox);
        panelA.add(wasnameLabel);
        panelA.add(this.wasnameComboBox);
        panelA.add(urlLabel);
        panelA.add(this.urlEdit);
        panelA.add(methodLabel);
        panelA.add(this.methodComboBox);
        panelA.add(paramLabel);
        panelA.add(this.paramEdit);
        panelA.add(AddButton);

        if (_state_ == 'Add') {
            panelB.add(panelB1);
            panelB.add(panelB2);

            panelB1.add(labelA);
            panelB2.add(this.grid);
        }

        panelC.add(OKButton);
        panelC.add(this.CancelButton);

        form.show();

        this.onAdd();

        if(_state_== 'Edit'){
            this.onEdit();
        }
    },

    onAdd: function() {
        var dataSet = {};

        if (!cfg.alert.sltExistSub) {
            dataSet.sql_file = 'IMXConfig_Add_URL_Server_Info.sql';

            dataSet.replace_string = [{
                name    :   'server_id',
                value   :   cfg.alert.sltId
            }];
        } else {
            dataSet.sql_file = 'IMXConfig_Add_URL_Group_Info.sql';

            dataSet.bind = [{
                name    :   'group_name',
                value   :   cfg.alert.sltName,
                type : SQLBindType.STRING
            }];
        }

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet,this.onIPAddResult, this);
    },

    onIPAddResult: function(aheader, adata) {

        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.ipComboBox.addItem(adata.rows[ix][0], adata.rows[ix][0]);
        }

        this.ipComboBox.selectRow(0);
    },

    wasnameChange: function(_value_) {

        var dataSet = {};

        if (!cfg.alert.sltExistSub) {
            dataSet.sql_file = 'IMXConfig_URL_Server_Was_Name.sql';

            dataSet.replace_string = [{
                name    :   'was_id',
                value   :   cfg.alert.sltId
            }];
        } else {
            dataSet.sql_file = 'IMXConfig_URL_Group_Was_Name.sql';

            var HEXValue = this.HEXFormat(_value_);

            dataSet.bind = [{
                name    :   'group_name',
                value   :   cfg.alert.sltName,
                type : SQLBindType.STRING
            }, {
                name    :   'HEX_Value',
                value   :   HEXValue,
                type : SQLBindType.STRING
            }];
        }

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, this.onWasNameAddResult, this);
    },

    HEXFormat : function(ip) {
        var arr = ip.split('.');
        var ix;
        var HEX = {};
        var HEXValue = {};
        for(ix=0; ix<4; ix++){
            HEX[ix] = parseInt(arr[ix]).toString(16).toUpperCase();
            HEXValue[ix] = (parseInt(HEX[ix],16) < parseInt(10,16)) ? '0' + HEX[ix].toString() : HEX[ix].toString();
        }
        return HEXValue[0]+HEXValue[1]+HEXValue[2]+HEXValue[3];
    },

    onWasNameAddResult: function(aheader, adata) {
        this.wasnameComboBox.removeAll();
        for (var ix = 0; ix < adata.rows.length; ix++) {
            this.wasnameComboBox.addItem(adata.rows[ix][0], adata.rows[ix][1]);
        }
        this.wasnameComboBox.selectRow(0);

        if (this.mode == 'Edit') {
            this.wasnameComboBox.selectByName(this.wasname);
        }
    },

    addDataToGrid: function() {
        var ix;
        var parentData;
        var parentGrid = this.parent.urlServerAlertGrid;
        var urlEdit = this.urlEdit.getValue();
        var wasId = this.wasnameComboBox.getValue();

        if(this.ipComboBox.getValue() === null){
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select a IP.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return;
        }

        if(this.wasnameComboBox.getValue() === null){
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select Agent.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return;
        }

        if(this.methodComboBox.getValue() === null){
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select a method.'),Ext.Msg.OK, Ext.MessageBox.WARNING);
            return;
        }

        if (urlEdit == '') {
            Ext.Msg.alert(common.Util.TR('Warning'), common.Util.TR('Please Enter URL.'));
            this.urlEdit.focus() ;
            return ;
        }
        // 부모의 grid에 data가 이미 있을 경우.
        for ( ix = 0; ix < parentGrid.getRowCount(); ix++ ) {
            parentData = parentGrid.getRow(ix).data;
            if(parentData.url === urlEdit && parentData.was_id === wasId){
                Ext.Msg.alert('Error', common.Util.TR('Already exists'));
                return ;
            }
        }
        // add를 하고 다시 같은 데이터를 add하려고 했을 경우.
        for ( ix = 0; ix < this.grid.getRowCount(); ix++ ) {
            var gridData = this.grid.getRow(ix).data;
            if (urlEdit === gridData.url &&  wasId === gridData.was_id){
                Ext.Msg.alert('Error', common.Util.TR('Already add'));
                return ;
            }
        }

        this.grid.addRow([
            wasId,
            this.wasnameComboBox.rawValue,
            this.ipComboBox.getValue(),
            urlEdit,
            this.methodComboBox.getValue(),
            this.paramEdit.getValue()
        ]);
        this.grid.drawGrid();
    },

    save: function() {
        var d = null;
        var ix;

        if (this.grid.getRowCount() > 0) {
            for ( ix = 0; ix < this.grid.getRowCount(); ix++) {
                d = this.grid.getRow(ix);
                this.deleteURL(d);
            }
        }
    },

    deleteURL: function(d){
        var self = this;
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Delete_URL.sql';

        dataSet.replace_string = [{
            name    :   'was_id',
            value   :   d.data.was_id
        }];

        dataSet.bind = [{
            name    :   'url',
            value   :   d.data.url,
            type : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            self.insertURL(d);
        }, this);
    },

    insertURL: function(d){
        var self = this;
        var dataSet = {};
        dataSet.sql_file = 'IMXConfig_Insert_URL.sql';

        dataSet.replace_string = [{
            name    :   'was_id',
            value   :   d.data.was_id
        }];

        dataSet.bind = [{
            name    :   'url',
            value   :   d.data.url,
            type : SQLBindType.STRING
        }, {
            name    :   'method',
            value   :   d.data.method,
            type : SQLBindType.STRING
        }, {
            name    :   'param',
            value   :   d.data.param,
            type : SQLBindType.STRING
        }];

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }

        WS.SQLExec(dataSet, function() {
            setTimeout(function() {
                self.parent.onRefresh();
            }, 100);
        }, this);
    },

    update: function() {
        var dataSet = {};
        var self = this ;
        var ix;
        var parentData;
        var parentGrid = this.parent.urlServerAlertGrid;
        var urlEdit = this.urlEdit.getValue();
        var wasId = this.wasnameComboBox.getValue();
        //this.url, this.wasid는 부모에서 edit를 하면 파라미터로 받아옴.
        var parentURL = this.url;
        var parentWasId = this.wasid;

        // 부모의 grid에 data가 이미 있을 경우.
        for ( ix = 0; ix < parentGrid.getRowCount(); ix++ ) {
            parentData = parentGrid.getRow(ix).data;
            if(parentData.url === urlEdit && parentData.was_id === wasId){
                //자기 자신일 경우는 다음으로 진행.
                if(parentData.url === parentURL && parentData.was_id === parentWasId){
                    continue;
                }
                Ext.Msg.alert('Error', common.Util.TR('Already exists'));
                return ;
            }
        }

        dataSet.sql_file = 'IMXConfig_Update_URL.sql';

        dataSet.replace_string = [{
            name    :   'was_id',
            value   :   this.wasid
        }];

        dataSet.bind = [{
            name    :   'url',
            value   :   this.url,
            type : SQLBindType.STRING
        }, {
            name    :   'edit_url',
            value   :   this.urlEdit.getValue(),
            type : SQLBindType.STRING
        }, {
            name    :   'method',
            value   :   this.methodComboBox.getValue(),
            type : SQLBindType.STRING
        }, {
            name    :   'param',
            value   :   this.paramEdit.getValue(),
            type : SQLBindType.STRING
        }];

        WS.SQLExec(dataSet, function() {
            self.CancelButton.fireHandler('click');
            setTimeout(function() {
                self.parent.onRefresh();
            }, 100);
        }, this);

        if(common.Util.isMultiRepository()){
            dataSet.database = cfg.repositoryInfo.currentRepoName;
        }
    },

    onEdit: function() {
        this.ipComboBox.selectByName(this.ip);
        this.wasnameComboBox.selectByName(this.wasname);
        this.methodComboBox.selectByName(this.method);
        this.urlEdit.setValue(this.url);
        this.paramEdit.setValue(this.param);
    }
});
