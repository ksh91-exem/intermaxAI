Ext.define('config.config_alert_serveralert', {
    extend: 'Exem.Form',
    layout: { type: 'vbox', align: 'stretch' },
    width: '100%',
    height: '100%',

    MODE: '',
    target: null,

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    constructor: function(config) {
        this.superclass.constructor.call(this, config);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    init: function() {
        var self = this;

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            width: '100%',
            height: 30,
            border: false,
            items: [{
                text: common.Util.TR('Apply'),
                //    id: 'cfg_wasalert_apply',
                cls : 'x-btn-default-toolbar-small',
                style : { backgroundColor: '#fafafa',
                    borderColor : '#bbb'
                },
                scope: this,
                handler: function() { self.apply(); }
            }]
        });

        this.target.add(toolbar);

        this.sms = [];

        var dataset  = {};
        dataset.sql_file = 'IMXConfig_Schedule.sql';

        WS.SQLExec(dataset, function(aheader, adata) {
            self.sms.length = 0;
            for (var ix = 0; ix < adata.rows.length; ix++) {
                self.sms.push({name: adata.rows[ix][0], value: adata.rows[ix][0]});
            }

            self.ServerAlertGrid = Ext.create('Exem.adminGrid', {
                flex: 1,
                width: '100%',
                border: false,
                editMode: true,
                useCheckBox: false,
                checkMode: Grid.checkMode.SINGLE,
                showHeaderCheckbox: false,
                rowNumber: true,
                localeType: 'H:i:s',
                stripeRows: true,
                defaultHeaderHeight: 26,
                usePager: false
            });
            self.target.add(self.ServerAlertGrid);

            self.ServerAlertGrid.beginAddColumns();
            self.ServerAlertGrid.addColumn({text: common.Util.TR('Server Id'),              dataIndex: 'server_id',    width: 150, type: Grid.StringNumber, alowEdit: false, editMode: false, hide: true});
            self.ServerAlertGrid.addColumn({text: common.Util.CTR('Server Type'),           dataIndex: 'server_type',           width: 300, type: Grid.String,       alowEdit: false, editMode: false, hide: true});
            self.ServerAlertGrid.addColumn({text: common.Util.CTR('Alert Type'),            dataIndex: 'alert_type',            width: 150, type: Grid.String,       alowEdit: false, editMode: false, hide: true});
            self.ServerAlertGrid.addColumn({text: common.Util.CTR('Alert Name'),            dataIndex: 'alert_name',            width: 150, type: Grid.String,       alowEdit: false, editMode: false});
            self.ServerAlertGrid.addColumn({text: common.Util.TR('Alert Resource Name'),    dataIndex: 'alert_resource_name',   width: 150, type: Grid.String,       alowEdit: false, editMode: false, hide: true});
            self.ServerAlertGrid.addColumn({text: common.Util.TR('SMS Apply'),              dataIndex: 'enable',                width: 150, type: Grid.CheckBox,     alowEdit: true, editMode: true});
            if (cfg.alert.sltMode == 'Agent') {
                self.ServerAlertGrid.addColumn({text: common.Util.TR('Use Script'),             dataIndex: 'use_script',            width: 150, type: Grid.CheckBox,     alowEdit: true, editMode: true});
            }
            self.ServerAlertGrid.addColumn({text: common.Util.CTR('SMS Schedule'),          dataIndex: 'sms_schedule',          width: 150, type: Grid.ComboBox,     comboData: this.sms, alowEdit: true, editMode: true});
            self.ServerAlertGrid.endAddColumns();
        }, this);
    },

    onRefresh: function() {
        this.WASdefaultValue = [
            ['WAS'              , 'Server Alert'    , 'Agent Connected'     , 'Connected'   ],
            ['WAS'              , 'Server Alert'    , 'Agent Disconnected'  , 'Disconnected'],
            ['WAS'              , 'Server Alert'    , 'JVM Boot'            , 'Server Boot' ],
            ['WAS'              , 'Server Alert'    , 'JVM Down'            , 'Server Down' ]
        ];

        this.DBdefaultValue = [
            [cfg.alert.sltType  , 'Server Alert'   , 'Connected'            , 'Connected'   ],
            [cfg.alert.sltType  , 'Server Alert'   , 'Disconnected'         , 'Disconnected'],
            [cfg.alert.sltType  , 'Server Alert'   , 'Server Boot'          , 'Server Boot' ],
            [cfg.alert.sltType  , 'Server Alert'   , 'Server Down'          , 'Server Down' ]
        ];

        this.APIMdefaultValue = [
            ['APIM'             , 'Server Alert'   , 'Agent Connected'       , 'Connected'   ],
            ['APIM'             , 'Server Alert'   , 'Agent Disconnected'    , 'Disconnected']
            //['APIM'             , 'Server Alert'   , 'Boot'                 , 'Boot'        ],
            //['APIM'             , 'Server Alert'   , 'Down'                 , 'Down'        ]
        ];

        this.TPdefaultValue = [
            ['TP'               , 'Server Alert'   , 'Agent Connected'       , 'Connected'   ],
            ['TP'               , 'Server Alert'   , 'Agent Disconnected'    , 'Disconnected']
            //['TP'               , 'Server Alert'   , 'Boot'                 , 'Boot'        ],
            //['TP'               , 'Server Alert'   , 'Down'                 , 'Down'        ]
        ];

        if(cfg.alert.sltGroup == 'Root'){
            if(cfg.alert.sltExistSub){
                this.serverSetQuery(cfg.alert.wasIds);
            } else {
                this.serverSetQuery(cfg.alert.sltId);
            }
        } else{
            this.serverSetQuery(cfg.alert.sltId);
        }
    },

    serverSetQuery: function(id) {
        if(!id){
            return;
        }
        var dataSet = {};
        //////////////////데이터 변환//////////////////
        var ix;
        var was_id = [];
        var serverType;
        this.data = null;

        if(cfg.alert.sltGroup == 'Root'){
            if(cfg.alert.sltExistSub){
                for (ix = 0; ix < id.length; ix++) {
                    was_id.push(parseInt(id[ix]));
                    this.data = was_id.join();
                }
            } else {
                this.data = id;
            }
        } else{
            this.data = id;
        }

        if (cfg.alert.sltMode == 'Agent') {
            serverType = 'WAS';
        } else if (cfg.alert.sltMode == 'DB') {
            serverType = cfg.alert.sltType;
        } else if (cfg.alert.sltMode == 'APIM') {
            serverType = 'APIM';
        } else if (cfg.alert.sltMode == 'TP') {
            serverType = 'TP';
        }

        dataSet.sql_file = 'IMXConfig_Get_Server_Alert.sql';

        dataSet.replace_string = [{
            name: 'server_id' ,
            value: this.data
        }];

        dataSet.bind = [{
            name    : 'server_type' ,
            value   : serverType,
            type    : SQLBindType.STRING
        }];

        WS.SQLExec(dataSet, this.serverSetQueryResult, this);
    },

    serverSetQueryResult: function(aheader, adata) {
        if(!aheader.success){
            return;
        }
        if (!this.serverSet) {
            this.serverSet = [];
        } else {
            this.serverSet.length = 0;
        }

        var ix,ixLen, jx,jxLen,
            serverSet =  adata[0].rows,
            serverTagValue = adata[1].rows;

        for (ix = 0, ixLen = serverSet.length; ix < ixLen; ix++) {
            this.serverSet.push([
                serverSet[ix][0],   /* server_id */
                serverSet[ix][1],   /* alert_resource_name */
                serverSet[ix][2],   /* sms_schedule_name */
                serverSet[ix][3]    /* enable */
            ]);
        }

        if(cfg.alert.sltMode == 'Agent') {
            for (ix = 0, ixLen = this.serverSet.length; ix < ixLen; ix++) {
                for (jx = 0, jxLen = serverTagValue.length; jx < jxLen; jx++) {
                    if (this.serverSet[ix][0] === serverTagValue[jx][0] &&
                        this.serverSet[ix][1] === serverTagValue[jx][1]) {
                        this.serverSet[ix].push(serverTagValue[jx][2]); /* use_script */
                    }
                }
            }
        }

        this.serverDataDraw();
    },

    serverDataDraw: function() {
        var ix;
        var jx;

        if (!this.serverDs) {
            this.serverDs = [];
        } else {
            this.serverDs.length = 0;
        }

        if(cfg.alert.sltMode == 'Agent'){
            // DEFAULT DATA(WAS)
            for (ix = 0; ix < this.WASdefaultValue.length; ix++) {
                this.serverDs.push([
                    this.WASdefaultValue[ix][0],    /* server_type */
                    this.WASdefaultValue[ix][1],    /* alert_type */
                    this.WASdefaultValue[ix][2],    /* 화면에 보일 TEXT */
                    this.WASdefaultValue[ix][3]     /* alert_resource_name */
                ]);
            }
        } else if (cfg.alert.sltMode == 'DB') {
            // DEFAULT DATA(DB)
            for (ix = 0; ix < this.DBdefaultValue.length; ix++) {
                this.serverDs.push([
                    this.DBdefaultValue[ix][0],
                    this.DBdefaultValue[ix][1],
                    this.DBdefaultValue[ix][2],
                    this.DBdefaultValue[ix][3]
                ]);
            }
        } else if (cfg.alert.sltMode == 'APIM') {
            // DEFAULT DATA(APIM)
            for (ix = 0; ix < this.APIMdefaultValue.length; ix++) {
                this.serverDs.push([
                    this.APIMdefaultValue[ix][0],
                    this.APIMdefaultValue[ix][1],
                    this.APIMdefaultValue[ix][2],
                    this.APIMdefaultValue[ix][3]
                ]);
            }
        } else if (cfg.alert.sltMode == 'TP') {
            // DEFAULT DATA(TP)
            for (ix = 0; ix < this.TPdefaultValue.length; ix++) {
                this.serverDs.push([
                    this.TPdefaultValue[ix][0],
                    this.TPdefaultValue[ix][1],
                    this.TPdefaultValue[ix][2],
                    this.TPdefaultValue[ix][3]
                ]);
            }
        }

        // SQL 데이터 추가
        if (this.serverSet.length > 0) {
            for (ix = 0; ix < this.serverDs.length; ix++) {
                for (jx = 0; jx < this.serverSet.length; jx++) {
                    if (this.serverDs[ix][3] == this.serverSet[jx][1]) { /* alert_resource_name */
                        this.serverDs[ix][6] = this.serverSet[jx][2];  /* sms_schedule_name    */
                        this.serverDs[ix][4] = this.serverSet[jx][3];  /* enable */
                        if(cfg.alert.sltMode == 'Agent'){
                            this.serverDs[ix][5] = this.serverSet[jx][4];  /* use_script */
                        }
                    }
                }
            }
        }

        // 디폴트 + SQL 데이터 표시
        this.ServerAlertGrid.clearRows();
        for (ix = 0; ix < this.serverDs.length; ix++) {
            if (this.serverDs[ix][2] == 'null') {
                this.serverDs[ix][2] = '';
            }

            if(cfg.alert.sltMode == 'Agent'){
                this.ServerAlertGrid.addRow([
                    this.data,              /* server_id */
                    this.serverDs[ix][0],   /* server_type */
                    this.serverDs[ix][1],   /* alert_type */
                    this.serverDs[ix][2],   /* alert_name */
                    this.serverDs[ix][3],   /* alert_resource_name */
                    this.serverDs[ix][4],   /* enable */
                    (this.serverDs[ix][5] === 'Y'),   /* use_script */
                    this.serverDs[ix][6]    /* sms_schedule_name */
                ]);
            } else {
                this.ServerAlertGrid.addRow([
                    this.data,              /* server_id */
                    this.serverDs[ix][0],   /* server_type */
                    this.serverDs[ix][1],   /* alert_type */
                    this.serverDs[ix][2],   /* alert_name */
                    this.serverDs[ix][3],   /* alert_resource_name */
                    this.serverDs[ix][4],   /* enable */
                    this.serverDs[ix][6]    /* sms_schedule_name */
                ]);
            }
        }
        this.ServerAlertGrid.drawGrid();
    },

    apply: function () {
        var d;
        var modified;
        var dataSet = {};
        this.count = 0;

        modified = this.ServerAlertGrid.getModified();

        for (var ix = 0; ix < modified.length; ix++) {
            d = modified[ix].data;

            if (!d.sms_schedule) {
                d.sms_schedule = '';
            }

            dataSet.sql_file = 'IMXConfig_Server_Alert_Delete.sql';
            dataSet.bind = [{
                name    : 'server_type',
                value   : d.server_type,
                type    : SQLBindType.STRING
            },{
                name    : 'alert_resource_name',
                value   : d.alert_resource_name,
                type    : SQLBindType.STRING
            }];

            dataSet.replace_string =[{
                name    :   'server_id',
                value   :   d.server_id
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }

            WS.SQLExec(dataSet, this.serverAlertDeleteInsert, this);
        }
    },
    serverAlertDeleteInsert: function(aheader){
        var ix, jx, d, dataSet = {},
            modified = this.ServerAlertGrid.getModified();

        this.count++;
        if(aheader.success && this.count == modified.length) {
            var serverIds;
            this.modifiedCount = 0;

            for ( ix = 0; ix < modified.length; ix++) {
                serverIds = [];
                d = modified[ix].data;

                if (!d.sms_schedule) {
                    d.sms_schedule = '';
                }
                if(cfg.alert.sltId == undefined) {
                    serverIds = this.data.split(',');
                } else {
                    serverIds.push(this.data) ;
                }
                for ( jx = 0; jx < serverIds.length; jx++) {
                    dataSet = {};

                    if(d.enable && d.enable === true || d.enable === 1){
                        d.enable = 1;
                    } else {
                        d.enable = 0;
                    }


                    if(d.use_script && d.use_script === true || d.use_script === 'Y'){
                        d.use_script = 'Y';
                    } else{
                        d.use_script = 'N';
                    }

                    dataSet.sql_file = 'IMXConfig_Server_Alert_Insert.sql';
                    dataSet.bind = [{
                        name    : 'server_type',
                        value   : d.server_type,
                        type    : SQLBindType.STRING
                    }, {
                        name    : 'alert_resource_name',
                        value   : d.alert_resource_name,
                        type    : SQLBindType.STRING
                    }, {
                        name    : 'sms',
                        value   : d.sms_schedule,
                        type    : SQLBindType.STRING
                    }, {
                        name    : 'alert_tag_value',
                        value   : d.use_script,
                        type    : SQLBindType.STRING
                    }];

                    dataSet.replace_string = [{
                        name: 'enable',
                        value: d.enable
                    }, {
                        name: 'server_id',
                        value: serverIds[jx]
                    }];

                    if (common.Util.isMultiRepository()) {
                        dataSet.database = cfg.repositoryInfo.currentRepoName;
                    }
                    WS.SQLExec(dataSet, this.serverAlertRefresh, this);
                }
            }
        }
    },

    serverAlertRefresh: function(aheader) {
        var modified = this.ServerAlertGrid.getModified();


        this.modifiedCount++;

        if(aheader.success && this.modifiedCount == modified.length){
            Ext.Msg.alert(common.Util.TR('Message'), common.Util.TR('Save Success'));
            this.onRefresh();
        }
    }
});
