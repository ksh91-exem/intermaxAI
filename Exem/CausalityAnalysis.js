Ext.define("Exem.CausalityAnalysis", {
    extend: 'Exem.XMWindow',
    layout: 'vbox',
    maximizable: true,
    width: 950,
    height: 800,
    minWidth: 950,
    minHeight: 600,
    resizable: true,
    closeAction: 'destroy',
    title: common.Util.TR('Causality Analysis'),

    bodyStyle: { background: '#f5f5f5' },

    wasId    : null,
    statId   : null,
    statName : '',
    moment   : null,
    fromTime : null,
    toTime   : null,
    isFirstFlag : false,

    usefont: function(size, text, color) {
        var clr;
        if (color === undefined || color === null) {
            clr = '#000000';
        } else {
            clr = color;
        }
        return '<span style="padding-left: 0px; padding-top: 0px; font-family: Roboto Condensed; font-size: ' + size + 'px; color: ' + clr + '">' + text + '</span>';
    },

    initProperty: function() {
        this.gridArr  = [];
        this.chartArr = [];

        this.wasStat = {
            'was_sessions'       : 'Concurrent Users',
            'app_sessions'       : 'Queue',
            'active_txns'        : 'Active Transaction Count',
            'db_sessions'        : 'Total DB Connections',
            'active_db_sessions' : 'Active DB Connections',
            'sql_elapse'         : 'SQL Elapse Time',
            'sql_exec_count'     : 'SQL Execute Count',
            'sql_prepare_count'  : 'SQL Prepare Count',
            'sql_fetch_count'    : 'SQL Fetch Count',
            'jvm_cpu_usage'      : 'JVM CPU Usage (%)',
            'jvm_free_heap'      : 'JVM Free Heap (MB)',
            'jvm_heap_size'      : 'JVM Heap Size (MB)',
            'jvm_heap_usage'     : 'JVM Heap Usage (%)',
            'jvm_used_heap'      : 'JVM Used Heap (MB)',
            'jvm_mem_size'       : 'JVM Memory Size (MB)',
            'jvm_thread_count'   : 'JVM Thread Count',
            'os_cpu'             : 'OS CPU (%)',
            'tps'                : 'TPS',
            'os_cpu_sys'         : 'OS CPU Sys (%)',
            'os_cpu_user'        : 'OS CPU User (%)',
            'os_cpu_io'          : 'OS CPU IO (%)',
            'os_free_memory'     : 'OS Free Memory (MB)',
            'os_total_memory'    : 'OS Total Memory (MB)',
            'os_send_packets'    : 'OS Send Packets',
            'os_rcv_packets'     : 'OS Rcv Packets',
            'active_client_ip'   : 'Active Users',
            'txn_elapse'         : 'Transaction Elapse Time (AVG)',
            'txn_end_count'      : 'Transaction Count'
        };

        this.wasStatArr = [
            { id: 'active_txns',          name: 'Active Transaction Count'      },
            { id: 'jvm_cpu_usage',        name: 'JVM CPU Usage (%)'             },
            { id: 'jvm_used_heap',        name: 'JVM Used Heap (MB)'            },
            { id: 'txn_end_count',        name: 'Transaction Count'             },
            { id: 'txn_elapse',           name: 'Transaction Elapse Time (AVG)' },

            { id: 'tps',                  name: 'TPS'                           }
        ];

        this.dbStatArr = [
            { id: 'os_cpu',               name: 'cpu_usage'                     },
            { id: 'logical_read',         name: 'session logical reads'         },
            { id: 'db_time',              name: 'DB time'                       },
            { id: 'nonidle_wait_time',    name: 'non-idle wait time'            },
            { id: 'physical_read',        name: 'physical reads'                },
            { id: 'physical_write',       name: 'physical writes'               },
            { id: 'execute_count',        name: 'execute count'                 },
            { id: 'active_session',       name: 'active sessions'               },
            { id: 'lock_waiting_session', name: 'lock waiting sessions'         },

            { id: 'user_cpu',             name: 'cpu_usage'                     }
        ];

        var ix, ixLen;
        for (ix = 0, ixLen = this.wasStatArr.length; ix < ixLen; ix++) {
            if (this.statId === this.wasStatArr[ix].id) {
                this.statName = this.wasStatArr[ix].name;
                this.type = 'WAS';
                this.basedStatTname = 'was_stat';
            }
        }

        for (ix = 0, ixLen = this.dbStatArr.length; ix < ixLen; ix++) {
            if (this.statId === this.dbStatArr[ix].id) {
                this.statName = this.dbStatArr[ix].name;
                this.type = 'DB';
                this.basedStatTname = 'db_stat';
                if (this.statName == 'cpu_usage') {
                    this.basedStatTname = 'os_stat';
                }
            }
        }

        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        if (this.moment) {
            this.fromTime = this.moment - 20 * 60 * 1000;
            this.toTime   = this.moment + 5  * 60 * 1000;
        }

        this.classNameLabel = this.usefont(12, common.Util.TR('Time') + ' : ') + '&nbsp;' + this.usefont(12, common.Util.getDate(this.fromTime).substring(0,16) + ' ~ ' + common.Util.getDate(this.toTime).substring(0,16), '#3191C8');
    },

    init: function() {

        this.initProperty();

        var targetPanel = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            width: '100%',
            height: 102,
            margin: '4 4 4 4',
            border: false,
            autoScroll: true,
            bodyStyle: { background: '#ffffff' }
        });

        var conditionArea = Ext.create("Ext.container.Container", {
            xtype: 'container',
            itemId: 'containerArea',
            flex: 1,
            height: '100%',
            border: false,
            layout: 'absolute',
            cls : 'list-condition Exem-FormOnCondition',
            style: {
                background: '#ffffff !important',
                padding: "5px 5px"
            },
            items: [{
                xtype: 'label',
                x: 0,
                y: 5,
                margin: '5 5 0 5',
                itemId: 'labelClassName',
                html: this.classNameLabel
            }]
        });

        this.statType = Ext.create('Exem.ComboBox', {
            x           : 270,
            y           : 25,
            margin      : '5 5 0 5',
            fieldLabel  : common.Util.TR('Stat Type'),
            labelWidth  : 60,
            width       : 200,
            store       : Ext.create('Exem.Store'),
            editable    : false,
            useSelectFirstRow : false
        });

        conditionArea.add(this.statType);

        this.wasCombo = Ext.create('Exem.wasDBComboBox', {
            x: 270,
            y: 5,
            width: 250,
            comboWidth: 200,
            labelWidth: 60,
            comboLabelWidth: 60,
            selectType: common.Util.TR('Agent'),
            addSelectAllItem: false
        });

        this.rdoServerTypeField = Ext.create('Exem.FieldContainer', {
            defaultType : 'radiofield',
            layout      : 'hbox',
            labelWidth  : 40,
            x           : 490,
            y           : 5
        });

        this.rdoServerTypeField.add([
            this.addRadioBtn('servergroup', 'agent_type', 'Agent', 90, (this.type == 'WAS'), 'was_stat', 'server'),
            this.addRadioBtn('servergroup', 'db_type',    'DB',    90, (this.type == 'DB'), 'db_stat', 'server')
        ]);

        conditionArea.add(this.wasCombo, this.rdoServerTypeField);

        var self = this;

        this.analysisButton = Ext.create("Ext.button.Button", {
            text: common.Util.TR('Analysis'),
            x: 0,
            y: '15%',
            width: 90,
            height: 40,
            cls: 'retrieve-btn',
            handler: function() {
                self.confirm();
            }
        });

        // Retrieve Button Area
        var conditionRetrieveArea = Ext.create("Ext.container.Container", {
            xtype: 'container',
            layout: 'absolute',
            width: 100,
            height: '100%',
            border: false,
            items: this.analysisButton
        });

        var panelA = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            width: '100%',
            height: 60,
            margin: '4 4 0 4',
            border: false,
            bodyStyle: { background: '#ffffff' }
        });

        panelA.add([conditionArea, conditionRetrieveArea]);

        var panelB = Ext.create('Ext.panel.Panel', {
            layout: 'vbox',
            cls: 'x-grid-panel',
            width: '100%',
            flex: 1,
            margin: '4 4 4 4',
            border: false,
            autoScroll: true,
            bodyStyle: { background: '#ffffff' }
        });


        chartContainer = this.createChart('based_stat');
        targetPanel.add(chartContainer);

        var ix, ixLen, chartContainer;
        for (ix = 0, ixLen = 19; ix < ixLen; ix++) {
            chartContainer = this.createChart();
            panelB.add(chartContainer);
        }

        this.show();

        this.add(targetPanel, panelA, panelB);

        this.wasCombo.selectByValue(this.wasId);
        this.confirm();
    },

    confirm: function() {
        Ext.MessageBox.confirm(common.Util.TR('Info'), common.Util.TR('The analysis may take some time. Do you want to continue?'), function(btn) {
            if (btn === 'yes') {
                this.loadingMask.show();
                this.analysisButton.disable();
                this.call_execute();

                this.isFirstFlag = true;
            }
        }.bind(this));
    },

    call_execute: function() {
        var self = this;

        try {
            var AJSON = {}, name,
                ix, ixLen;

            if (this.type == 'DB') {
                name = this.statName;
            } else {
                name = this.statId;
            }

            AJSON.dll_name = 'IntermaxPlugin.dll';
            AJSON.options  = {
                func_name : 'ExemImxCausalityWas',
                was_id    : this.wasId,
                target    : this.wasId,
                based_stat_name  : name,
                based_stat_tname : this.basedStatTname,
                query_was_db_id : this.wasCombo.getValue(),
                query_stat_tname : this.statType.getValue(),
                from_time        : common.Util.getDate(this.fromTime),
                to_time          : common.Util.getDate(this.toTime),
                moment           : this.moment == null ? '' : common.Util.getDate(this.moment)
            };
            AJSON['function'] = 'get_extends_script';

            for (ix = 0, ixLen = this.gridArr.length; ix < ixLen; ix++) {
                this.gridArr[ix].el.clearRows();

                this.chartArr[ix].clearValues();
                this.chartArr[ix].clearAllSeires();
                this.chartArr[ix].removeAllSeries();
                this.chartArr[ix].plotRedraw();
            }

            // console.log(AJSON.options);

            // var adata = [{"corr":1,"data":{"2018-12-04 15:27:00":346,"2018-12-04 15:29:00":348,"2018-12-04 15:44:00":345,"2018-12-04 15:25:00":351,"2018-12-04 15:21:00":346,"2018-12-04 15:23:00":358,"2018-12-04 15:42:00":345,"2018-12-04 15:38:00":534,"2018-12-04 15:34:00":347,"2018-12-04 15:36:00":345,"2018-12-04 15:32:00":344,"2018-12-04 15:30:00":357,"2018-12-04 15:28:00":432,"2018-12-04 15:45:00":343,"2018-12-04 15:26:00":345,"2018-12-04 15:43:00":351,"2018-12-04 15:24:00":345,"2018-12-04 15:40:00":355,"2018-12-04 15:22:00":346,"2018-12-04 15:41:00":344,"2018-12-04 15:39:00":345,"2018-12-04 15:35:00":345,"2018-12-04 15:37:00":345,"2018-12-04 15:33:00":352,"2018-12-04 15:31:00":349},"name":"cpu_usage","tname":"os_stat","inst_id":1},{"corr":1,"data":{"2018-12-04 15:27:00":16,"2018-12-04 15:29:00":17,"2018-12-04 15:44:00":16,"2018-12-04 15:25:00":16,"2018-12-04 15:21:00":16,"2018-12-04 15:23:00":31,"2018-12-04 15:42:00":16,"2018-12-04 15:38:00":344,"2018-12-04 15:34:00":16,"2018-12-04 15:36:00":17,"2018-12-04 15:32:00":18,"2018-12-04 15:30:00":47,"2018-12-04 15:28:00":179,"2018-12-04 15:45:00":16,"2018-12-04 15:26:00":16,"2018-12-04 15:43:00":20,"2018-12-04 15:24:00":16,"2018-12-04 15:40:00":47,"2018-12-04 15:22:00":19,"2018-12-04 15:41:00":16,"2018-12-04 15:39:00":16,"2018-12-04 15:35:00":16,"2018-12-04 15:37:00":16,"2018-12-04 15:33:00":20,"2018-12-04 15:31:00":20},"name":"non-idle wait count","tname":"db_stat","inst_id":1},{"corr":0.99,"data":{"2018-12-04 15:27:00":0,"2018-12-04 15:29:00":0,"2018-12-04 15:44:00":0,"2018-12-04 15:25:00":0,"2018-12-04 15:21:00":0,"2018-12-04 15:23:00":0,"2018-12-04 15:42:00":0,"2018-12-04 15:38:00":524991,"2018-12-04 15:34:00":0,"2018-12-04 15:36:00":0,"2018-12-04 15:32:00":0,"2018-12-04 15:30:00":0,"2018-12-04 15:28:00":186719,"2018-12-04 15:45:00":0,"2018-12-04 15:26:00":0,"2018-12-04 15:43:00":0,"2018-12-04 15:24:00":0,"2018-12-04 15:40:00":0,"2018-12-04 15:22:00":0,"2018-12-04 15:41:00":0,"2018-12-04 15:39:00":0,"2018-12-04 15:35:00":0,"2018-12-04 15:37:00":0,"2018-12-04 15:33:00":0,"2018-12-04 15:31:00":0},"name":"scheduler wait time","tname":"db_stat","inst_id":1},{"corr":0.99,"data":{"2018-12-04 15:27:00":0,"2018-12-04 15:29:00":0,"2018-12-04 15:44:00":0,"2018-12-04 15:25:00":0,"2018-12-04 15:21:00":0,"2018-12-04 15:23:00":1,"2018-12-04 15:42:00":0,"2018-12-04 15:38:00":45,"2018-12-04 15:34:00":0,"2018-12-04 15:36:00":0,"2018-12-04 15:32:00":0,"2018-12-04 15:30:00":0,"2018-12-04 15:28:00":18,"2018-12-04 15:45:00":0,"2018-12-04 15:26:00":0,"2018-12-04 15:43:00":0,"2018-12-04 15:24:00":0,"2018-12-04 15:40:00":0,"2018-12-04 15:22:00":0,"2018-12-04 15:41:00":0,"2018-12-04 15:39:00":0,"2018-12-04 15:35:00":0,"2018-12-04 15:37:00":0,"2018-12-04 15:33:00":0,"2018-12-04 15:31:00":0},"name":"recursive cpu usage","tname":"db_stat","inst_id":1},{"corr":0.99,"data":{"2018-12-04 15:27:00":0,"2018-12-04 15:29:00":0,"2018-12-04 15:44:00":0,"2018-12-04 15:25:00":0,"2018-12-04 15:21:00":0,"2018-12-04 15:23:00":1,"2018-12-04 15:42:00":0,"2018-12-04 15:38:00":45,"2018-12-04 15:34:00":0,"2018-12-04 15:36:00":0,"2018-12-04 15:32:00":0,"2018-12-04 15:30:00":0,"2018-12-04 15:28:00":18,"2018-12-04 15:45:00":0,"2018-12-04 15:26:00":0,"2018-12-04 15:43:00":0,"2018-12-04 15:24:00":0,"2018-12-04 15:40:00":0,"2018-12-04 15:22:00":0,"2018-12-04 15:41:00":0,"2018-12-04 15:39:00":0,"2018-12-04 15:35:00":0,"2018-12-04 15:37:00":0,"2018-12-04 15:33:00":0,"2018-12-04 15:31:00":1},"name":"CPU used by this session","tname":"db_stat","inst_id":1},{"corr":0.99,"data":{"2018-12-04 15:27:00":0,"2018-12-04 15:29:00":0,"2018-12-04 15:44:00":0,"2018-12-04 15:25:00":0,"2018-12-04 15:21:00":0,"2018-12-04 15:23:00":0,"2018-12-04 15:42:00":0,"2018-12-04 15:38:00":2,"2018-12-04 15:34:00":0,"2018-12-04 15:36:00":0,"2018-12-04 15:32:00":0,"2018-12-04 15:30:00":0,"2018-12-04 15:28:00":1,"2018-12-04 15:45:00":0,"2018-12-04 15:26:00":0,"2018-12-04 15:43:00":0,"2018-12-04 15:24:00":0,"2018-12-04 15:40:00":0,"2018-12-04 15:22:00":0,"2018-12-04 15:41:00":0,"2018-12-04 15:39:00":0,"2018-12-04 15:35:00":0,"2018-12-04 15:37:00":0,"2018-12-04 15:33:00":0,"2018-12-04 15:31:00":0},"name":"parse count (hard)","tname":"db_stat","inst_id":1},{"corr":0.99,"data":{"2018-12-04 15:27:00":5695,"2018-12-04 15:29:00":6000,"2018-12-04 15:44:00":4912,"2018-12-04 15:25:00":3753,"2018-12-04 15:21:00":4312,"2018-12-04 15:23:00":22812,"2018-12-04 15:42:00":3245,"2018-12-04 15:38:00":543349,"2018-12-04 15:34:00":4821,"2018-12-04 15:36:00":3769,"2018-12-04 15:32:00":5884,"2018-12-04 15:30:00":10499,"2018-12-04 15:28:00":201612,"2018-12-04 15:45:00":4049,"2018-12-04 15:26:00":3366,"2018-12-04 15:43:00":18615,"2018-12-04 15:24:00":4519,"2018-12-04 15:40:00":3732,"2018-12-04 15:22:00":6959,"2018-12-04 15:41:00":3379,"2018-12-04 15:39:00":4302,"2018-12-04 15:35:00":3480,"2018-12-04 15:37:00":5140,"2018-12-04 15:33:00":15714,"2018-12-04 15:31:00":4167},"name":"non-idle wait time","tname":"db_stat","inst_id":1},{"corr":0.99,"data":{"2018-12-04 15:27:00":0,"2018-12-04 15:29:00":0,"2018-12-04 15:44:00":0,"2018-12-04 15:25:00":0,"2018-12-04 15:21:00":0,"2018-12-04 15:23:00":0,"2018-12-04 15:42:00":0,"2018-12-04 15:38:00":9830,"2018-12-04 15:34:00":0,"2018-12-04 15:36:00":0,"2018-12-04 15:32:00":0,"2018-12-04 15:30:00":0,"2018-12-04 15:28:00":3276,"2018-12-04 15:45:00":0,"2018-12-04 15:26:00":0,"2018-12-04 15:43:00":0,"2018-12-04 15:24:00":0,"2018-12-04 15:40:00":0,"2018-12-04 15:22:00":0,"2018-12-04 15:41:00":0,"2018-12-04 15:39:00":0,"2018-12-04 15:35:00":0,"2018-12-04 15:37:00":0,"2018-12-04 15:33:00":0,"2018-12-04 15:31:00":0},"name":"KTFB alloc space (block)","tname":"db_stat","inst_id":1},{"corr":0.99,"data":{"2018-12-04 15:27:00":0,"2018-12-04 15:29:00":0,"2018-12-04 15:44:00":0,"2018-12-04 15:25:00":0,"2018-12-04 15:21:00":0,"2018-12-04 15:23:00":0,"2018-12-04 15:42:00":0,"2018-12-04 15:38:00":11,"2018-12-04 15:34:00":0,"2018-12-04 15:36:00":0,"2018-12-04 15:32:00":0,"2018-12-04 15:30:00":0,"2018-12-04 15:28:00":5,"2018-12-04 15:45:00":0,"2018-12-04 15:26:00":0,"2018-12-04 15:43:00":0,"2018-12-04 15:24:00":0,"2018-12-04 15:40:00":0,"2018-12-04 15:22:00":0,"2018-12-04 15:41:00":0,"2018-12-04 15:39:00":0,"2018-12-04 15:35:00":0,"2018-12-04 15:37:00":0,"2018-12-04 15:33:00":0,"2018-12-04 15:31:00":0},"name":"KTFB alloc time (ms)","tname":"db_stat","inst_id":1},{"corr":0.99,"data":{"2018-12-04 15:27:00":0,"2018-12-04 15:29:00":0,"2018-12-04 15:44:00":0,"2018-12-04 15:25:00":0,"2018-12-04 15:21:00":0,"2018-12-04 15:23:00":0,"2018-12-04 15:42:00":0,"2018-12-04 15:38:00":2,"2018-12-04 15:34:00":0,"2018-12-04 15:36:00":0,"2018-12-04 15:32:00":0,"2018-12-04 15:30:00":0,"2018-12-04 15:28:00":1,"2018-12-04 15:45:00":0,"2018-12-04 15:26:00":0,"2018-12-04 15:43:00":0,"2018-12-04 15:24:00":0,"2018-12-04 15:40:00":0,"2018-12-04 15:22:00":0,"2018-12-04 15:41:00":0,"2018-12-04 15:39:00":0,"2018-12-04 15:35:00":0,"2018-12-04 15:37:00":0,"2018-12-04 15:33:00":0,"2018-12-04 15:31:00":0},"name":"ASSM gsp:L2 bitmaps examined","tname":"db_stat","inst_id":1},{"corr":0.98,"data":{"2018-12-04 15:27:00":0,"2018-12-04 15:29:00":0,"2018-12-04 15:44:00":0,"2018-12-04 15:25:00":0,"2018-12-04 15:21:00":0,"2018-12-04 15:23:00":0,"2018-12-04 15:42:00":0,"2018-12-04 15:38:00":30,"2018-12-04 15:34:00":0,"2018-12-04 15:36:00":0,"2018-12-04 15:32:00":0,"2018-12-04 15:30:00":0,"2018-12-04 15:28:00":20,"2018-12-04 15:45:00":0,"2018-12-04 15:26:00":0,"2018-12-04 15:43:00":0,"2018-12-04 15:24:00":0,"2018-12-04 15:40:00":0,"2018-12-04 15:22:00":0,"2018-12-04 15:41:00":0,"2018-12-04 15:39:00":0,"2018-12-04 15:35:00":0,"2018-12-04 15:37:00":0,"2018-12-04 15:33:00":0,"2018-12-04 15:31:00":0},"name":"redo blocks checksummed by FG (exclusive)","tname":"db_stat","inst_id":1},{"corr":0.891,"data":{"2018-12-04 15:27:00":0,"2018-12-04 15:29:00":18,"2018-12-04 15:44:00":0,"2018-12-04 15:25:00":0,"2018-12-04 15:21:00":0,"2018-12-04 15:23:00":0,"2018-12-04 15:42:00":0,"2018-12-04 15:38:00":0,"2018-12-04 15:34:00":0,"2018-12-04 15:36:00":0,"2018-12-04 15:32:00":0,"2018-12-04 15:30:00":0,"2018-12-04 15:28:00":0,"2018-12-04 15:45:00":0,"2018-12-04 15:26:00":0,"2018-12-04 15:43:00":0,"2018-12-04 15:24:00":0,"2018-12-04 15:40:00":0,"2018-12-04 15:22:00":0,"2018-12-04 15:41:00":0,"2018-12-04 15:39:00":52,"2018-12-04 15:35:00":0,"2018-12-04 15:37:00":0,"2018-12-04 15:33:00":0,"2018-12-04 15:31:00":0},"name":"acknowledge over PGA limit","tname":"db_wait","inst_id":1},{"corr":0.8370000000000001,"data":{"2018-12-04 15:27:00":0,"2018-12-04 15:29:00":5,"2018-12-04 15:44:00":0,"2018-12-04 15:25:00":0,"2018-12-04 15:21:00":0,"2018-12-04 15:23:00":0,"2018-12-04 15:42:00":0,"2018-12-04 15:38:00":0,"2018-12-04 15:34:00":0,"2018-12-04 15:36:00":0,"2018-12-04 15:32:00":0,"2018-12-04 15:30:00":0,"2018-12-04 15:28:00":0,"2018-12-04 15:45:00":0,"2018-12-04 15:26:00":0,"2018-12-04 15:43:00":0,"2018-12-04 15:24:00":0,"2018-12-04 15:40:00":0,"2018-12-04 15:22:00":0,"2018-12-04 15:41:00":0,"2018-12-04 15:39:00":5,"2018-12-04 15:35:00":0,"2018-12-04 15:37:00":0,"2018-12-04 15:33:00":0,"2018-12-04 15:31:00":0},"name":"PL/SQL lock timer","tname":"db_wait","inst_id":1},{"corr":0.67,"data":{"2018-12-04 15:27:00":4199,"2018-12-04 15:29:00":4199,"2018-12-04 15:44:00":4198,"2018-12-04 15:25:00":4199,"2018-12-04 15:21:00":4199,"2018-12-04 15:23:00":4386,"2018-12-04 15:42:00":4529,"2018-12-04 15:38:00":4199,"2018-12-04 15:34:00":4198,"2018-12-04 15:36:00":4199,"2018-12-04 15:32:00":4199,"2018-12-04 15:30:00":4194,"2018-12-04 15:28:00":4199,"2018-12-04 15:45:00":4199,"2018-12-04 15:26:00":4194,"2018-12-04 15:43:00":4194,"2018-12-04 15:24:00":4182,"2018-12-04 15:40:00":4184,"2018-12-04 15:22:00":3999,"2018-12-04 15:41:00":3869,"2018-12-04 15:39:00":4194,"2018-12-04 15:35:00":4194,"2018-12-04 15:37:00":13199,"2018-12-04 15:33:00":4199,"2018-12-04 15:31:00":4199},"name":"rdbms ipc message","tname":"db_wait","inst_id":1},{"corr":0.621,"data":{"2018-12-04 15:27:00":231,"2018-12-04 15:29:00":1865,"2018-12-04 15:44:00":2071,"2018-12-04 15:25:00":52,"2018-12-04 15:21:00":355,"2018-12-04 15:23:00":542,"2018-12-04 15:42:00":317,"2018-12-04 15:38:00":300,"2018-12-04 15:34:00":1915,"2018-12-04 15:36:00":375,"2018-12-04 15:32:00":220,"2018-12-04 15:30:00":122,"2018-12-04 15:28:00":428,"2018-12-04 15:45:00":59,"2018-12-04 15:26:00":345,"2018-12-04 15:43:00":210,"2018-12-04 15:24:00":1804,"2018-12-04 15:40:00":45,"2018-12-04 15:22:00":244,"2018-12-04 15:41:00":356,"2018-12-04 15:39:00":2235,"2018-12-04 15:35:00":105,"2018-12-04 15:37:00":206,"2018-12-04 15:33:00":300,"2018-12-04 15:31:00":359},"name":"LGWR worker group idle","tname":"db_wait","inst_id":1},{"corr":0.5940000000000001,"data":{"2018-12-04 15:27:00":0,"2018-12-04 15:29:00":1500,"2018-12-04 15:44:00":1500,"2018-12-04 15:25:00":0,"2018-12-04 15:21:00":0,"2018-12-04 15:23:00":0,"2018-12-04 15:42:00":0,"2018-12-04 15:38:00":0,"2018-12-04 15:34:00":1500,"2018-12-04 15:36:00":0,"2018-12-04 15:32:00":0,"2018-12-04 15:30:00":0,"2018-12-04 15:28:00":0,"2018-12-04 15:45:00":0,"2018-12-04 15:26:00":0,"2018-12-04 15:43:00":0,"2018-12-04 15:24:00":1500,"2018-12-04 15:40:00":0,"2018-12-04 15:22:00":0,"2018-12-04 15:41:00":0,"2018-12-04 15:39:00":1500,"2018-12-04 15:35:00":0,"2018-12-04 15:37:00":0,"2018-12-04 15:33:00":0,"2018-12-04 15:31:00":0},"name":"smon timer","tname":"db_wait","inst_id":1},{"corr":0.5249999999999999,"data":{"2018-12-04 15:27:00":0,"2018-12-04 15:29:00":0,"2018-12-04 15:44:00":0,"2018-12-04 15:25:00":0,"2018-12-04 15:21:00":12,"2018-12-04 15:23:00":0,"2018-12-04 15:42:00":0,"2018-12-04 15:38:00":0,"2018-12-04 15:34:00":0,"2018-12-04 15:36:00":0,"2018-12-04 15:32:00":0,"2018-12-04 15:30:00":0,"2018-12-04 15:28:00":0,"2018-12-04 15:45:00":0,"2018-12-04 15:26:00":0,"2018-12-04 15:43:00":0,"2018-12-04 15:24:00":0,"2018-12-04 15:40:00":0,"2018-12-04 15:22:00":0,"2018-12-04 15:41:00":12,"2018-12-04 15:39:00":0,"2018-12-04 15:35:00":0,"2018-12-04 15:37:00":0,"2018-12-04 15:33:00":0,"2018-12-04 15:31:00":12},"name":"SQL*Net message from client","tname":"db_wait","inst_id":1},{"corr":0.423,"data":{"2018-12-04 15:27:00":0,"2018-12-04 15:29:00":327,"2018-12-04 15:44:00":0,"2018-12-04 15:25:00":0,"2018-12-04 15:21:00":0,"2018-12-04 15:23:00":463,"2018-12-04 15:42:00":0,"2018-12-04 15:38:00":0,"2018-12-04 15:34:00":0,"2018-12-04 15:36:00":0,"2018-12-04 15:32:00":0,"2018-12-04 15:30:00":122,"2018-12-04 15:28:00":0,"2018-12-04 15:45:00":0,"2018-12-04 15:26:00":0,"2018-12-04 15:43:00":0,"2018-12-04 15:24:00":250,"2018-12-04 15:40:00":197,"2018-12-04 15:22:00":0,"2018-12-04 15:41:00":0,"2018-12-04 15:39:00":253,"2018-12-04 15:35:00":0,"2018-12-04 15:37:00":0,"2018-12-04 15:33:00":0,"2018-12-04 15:31:00":0},"name":"jobq slave wait","tname":"db_wait","inst_id":1},{"corr":0.378,"data":{"2018-12-04 15:27:00":599,"2018-12-04 15:29:00":599,"2018-12-04 15:44:00":599,"2018-12-04 15:25:00":599,"2018-12-04 15:21:00":599,"2018-12-04 15:23:00":624,"2018-12-04 15:42:00":629,"2018-12-04 15:38:00":599,"2018-12-04 15:34:00":599,"2018-12-04 15:36:00":599,"2018-12-04 15:32:00":599,"2018-12-04 15:30:00":599,"2018-12-04 15:28:00":599,"2018-12-04 15:45:00":599,"2018-12-04 15:26:00":599,"2018-12-04 15:43:00":599,"2018-12-04 15:24:00":599,"2018-12-04 15:40:00":599,"2018-12-04 15:22:00":569,"2018-12-04 15:41:00":569,"2018-12-04 15:39:00":599,"2018-12-04 15:35:00":599,"2018-12-04 15:37:00":599,"2018-12-04 15:33:00":599,"2018-12-04 15:31:00":599},"name":"DIAG idle wait","tname":"db_wait","inst_id":1},{"corr":0.376,"data":{"2018-12-04 15:27:00":280,"2018-12-04 15:29:00":280,"2018-12-04 15:44:00":280,"2018-12-04 15:25:00":280,"2018-12-04 15:21:00":280,"2018-12-04 15:23:00":280,"2018-12-04 15:42:00":280,"2018-12-04 15:38:00":280,"2018-12-04 15:34:00":280,"2018-12-04 15:36:00":280,"2018-12-04 15:32:00":280,"2018-12-04 15:30:00":280,"2018-12-04 15:28:00":280,"2018-12-04 15:45:00":280,"2018-12-04 15:26:00":420,"2018-12-04 15:43:00":280,"2018-12-04 15:24:00":280,"2018-12-04 15:40:00":420,"2018-12-04 15:22:00":280,"2018-12-04 15:41:00":280,"2018-12-04 15:39:00":280,"2018-12-04 15:35:00":280,"2018-12-04 15:37:00":280,"2018-12-04 15:33:00":420,"2018-12-04 15:31:00":280},"name":"Streams AQ: qmn slave idle wait","tname":"db_wait","inst_id":1},{"corr":0.376,"data":{"2018-12-04 15:27:00":280,"2018-12-04 15:29:00":280,"2018-12-04 15:44:00":280,"2018-12-04 15:25:00":280,"2018-12-04 15:21:00":280,"2018-12-04 15:23:00":280,"2018-12-04 15:42:00":280,"2018-12-04 15:38:00":280,"2018-12-04 15:34:00":280,"2018-12-04 15:36:00":280,"2018-12-04 15:32:00":280,"2018-12-04 15:30:00":280,"2018-12-04 15:28:00":280,"2018-12-04 15:45:00":280,"2018-12-04 15:26:00":420,"2018-12-04 15:43:00":280,"2018-12-04 15:24:00":280,"2018-12-04 15:40:00":420,"2018-12-04 15:22:00":280,"2018-12-04 15:41:00":280,"2018-12-04 15:39:00":280,"2018-12-04 15:35:00":280,"2018-12-04 15:37:00":280,"2018-12-04 15:33:00":420,"2018-12-04 15:31:00":280},"name":"Streams AQ: qmn coordinator idle wait","tname":"db_wait","inst_id":1}];

            // if (adata && adata.length > 0) {
            //     for (ix = 0, ixLen = this.gridArr.length; ix < ixLen; ix++) {
            //         if (!adata[ix]) {
            //             this.gridArr[ix].el.up('container').up('container').hide();
            //         } else {
            //             this.gridArr[ix].el.up('container').up('container').show();
            //
            //             this.drawGrid(this.gridArr[ix], adata[ix], ix);
            //             this.drawChart(this.chartArr[ix], adata, ix);
            //         }
            //     }
            // }

            // self.loadingMask.hide();
            // self.analysisButton.setDisabled(false);

            WS.PluginFunction(AJSON, function (aheader, adata) {
                try {
                    // console.log(adata);
                    if (aheader.success) {
                        if (adata && adata.length > 0) {
                            for (ix = 0, ixLen = this.gridArr.length; ix < ixLen; ix++) {
                                if (!adata[ix] || adata[ix].corr < 0.6) {
                                    this.gridArr[ix].el.up('container').up('container').hide();
                                } else {
                                    this.gridArr[ix].el.up('container').up('container').show();

                                    this.drawGrid(this.gridArr[ix], adata[ix], ix);
                                    this.drawChart(this.chartArr[ix], adata, ix);
                                }
                            }
                        } else {
                            common.Util.showMessage('', common.Util.TR('No data to display'), Ext.Msg.OK, Ext.MessageBox.INFO);
                            console.warn(aheader);
                        }
                    } else {
                        common.Util.showMessage(common.Util.TR('Error'), common.Util.TR('Failed to retrieve the data for this request.'), Ext.Msg.OK, Ext.MessageBox.ERROR);
                        console.warn(aheader);
                    }
                } catch (e) {
                    self.loadingMask.hide();
                    self.analysisButton.setDisabled(false);
                } finally {
                    self.loadingMask.hide();
                    self.analysisButton.setDisabled(false);
                }
            }, this);

        } catch(e) {
            this.loadingMask.hide();
            this.analysisButton.setDisabled(false);
        }
    },

    createChart:function(based_stat) {
        var chartContainer = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width : '100%',
            height: 97,
            style : {
                'overflow' : 'hidden'
            }
        });

        var leftContainer = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width : '25%',
            height: '100%'
        });

        var grid = Ext.create('Exem.BaseGrid', {
            layout: 'fit',
            usePager: false,
            hideGridHeader : true,
            borderVisible: true,
            baseGridCls: 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            margin : '5 5 5 5',
            flex: 1
        });

        grid.beginAddColumns();
        grid.addColumn('Param',  'param',   70, Grid.String, true, false);
        grid.addColumn('Value',  'value',   70, Grid.String, true, false);
        grid.endAddColumns();

        grid._columnsList[0].flex = 1;
        grid._columnsList[1].flex = 2;

        grid._columnsList[0].renderer = this.createProperty.bind(this);

        leftContainer.add(grid);
        this.gridArr.push({
            tname : based_stat ? 'based_stat' : '',
            el : grid
        });

        var rightContainer = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width : '75%',
            height: '100%'
        });

        var yaxes;
        if (based_stat) {
            yaxes = [{
                ticks: 2
            }]
        } else {
            yaxes = [{
                ticks: 2
            }, {
                ticks: 2,
                position: 'right'
            }]
        }

        var flowChart = Ext.create('Exem.chart.CanvasChartLayer',{
            titleBackgroundColor:'#E3EAF1',
            showTooltip   : true,
            dataBufferSize: 60,
            interval  : PlotChart.time.exMin,
            showLegend: true,
            legendWidth: 140,
            legendNameWidth: 120,
            legendTextAlign: 'east',
            legendNameStyle: {
                'font-size' : '11px'
            },
            showHistoryInfo : false,
            showTooltip: true,
            toolTipFormat: '[%s] %x [value:%y]',
            toolTipTimeFormat: '%H:%M',
            fillIntervalValue: true,
            chartProperty : {
                xaxis: false,
                yMin : null,
                yaxes: yaxes,
                yLabelFont: { size: 8, color: 'black' },
                xLabelFont: { size: 8, color: 'black' }
            },
            plotdblclick : function(event, pos, item, xAxis) {
                var fromTime, toTime;

                if (pos.x < 0 || !xAxis) {
                    return;
                }

                fromTime = this.fromTime;
                toTime   = this.toTime;

                if (pos.x < fromTime || pos.x > toTime) {
                    return;
                }

                this.setIndicatorTime(common.Util.getDate(xAxis.x));
                this.moveIndicator();
            }.bind(this)
        });

        rightContainer.add(flowChart);
        this.chartArr.push(flowChart);

        chartContainer.add([leftContainer, rightContainer]);

        return chartContainer;
    },

    createProperty: function (value, meta) {
        meta.tdAttr = 'data-qtip="' + value + '"';
        meta.tdCls = 'frame-causalityView-propertycell';
        return value;
    },

    addRadioBtn: function(name, itemId, label, width, checked, typeValue, type, hidden) {
        var radioBtn;

        radioBtn = Ext.create('Ext.form.field.Radio', {
            boxLabel: common.Util.TR(label),
            itemId: itemId,
            width: width,
            name: this.id + '_' + name,
            inputValue : typeValue,
            checked: checked,
            hidden : hidden,
            listeners: {
                change: function(field) {
                    this.radioButtonEvent(type, field);
                }.bind(this),
                render: function(field) {
                    this.radioButtonEvent(type, field);
                }.bind(this)
            }
        });

        return radioBtn;
    },

    radioButtonEvent: function(type, field) {
        var selectType, selectRadioType;
        if (type === 'server' && field.getValue()) {
            this.statType.removeAll();

            if (common.Util.TR(field.boxLabel) === common.Util.TR('Agent')) {
                selectRadioType = 'WAS';
                selectType = common.Util.TR('Agent');

                this.statType.addItem('was_stat', common.Util.TR('WAS Stat'), 0);
                this.statType.addItem('os_stat' , common.Util.TR('OS Stat'), 1);
            } else if (field.boxLabel === 'DB') {
                selectType = 'DB';

                this.statType.addItem('db_stat' , common.Util.TR('DB Stat / DB Wait'), 0);
                this.statType.addItem('os_stat' , common.Util.TR('OS Stat'), 1);
            }

            this.statType.selectRow(0);
            this.wasCombo.WASDBCombobox.setFieldLabel(selectType);
            this.wasCombo.selectType = selectType;
            this.wasCombo.selectRadioType = selectRadioType;
            this.wasCombo._getServiceInfo();

            this.radioChange = true;
        }
    },

    drawGrid: function(grid, data, idx) {
        var label, name, stat;

        if (idx == 0) {
            if (this.basedStatTname.indexOf('was') != -1) {
                label = common.Util.TR('Agent');
                stat  = this.getDisplayStatName(data.name, 'was');
                name = Comm.RTComm.getWASNamebyId(data.inst_id);
            } else {
                label = common.Util.TR('DB');
                stat = this.getDisplayStatName(data.name);
                name = Comm.RTComm.getDBNameById(data.inst_id);
            }
        } else {
            if (data.tname.indexOf('was') != -1) {
                label = common.Util.TR('Agent');
                stat  = this.getDisplayStatName(data.name, 'was');
                name = Comm.RTComm.getWASNamebyId(data.inst_id);
            } else {
                label = common.Util.TR('DB');
                stat = this.getDisplayStatName(data.name);
                name = Comm.RTComm.getDBNameById(data.inst_id);
            }
        }

        stat = stat == 'Cpu Usage' ? 'CPU Usage' : stat;

        grid.el.addRow([label                         , name]);
        grid.el.addRow([common.Util.TR('Stat')        , common.Util.TR(stat)]);
        grid.el.addRow([common.Util.TR('Stat Type')   , this.getDisplayStatType(data.tname)]);
        grid.el.addRow([common.Util.TR('Correalation'), common.Util.numberFixed(data.corr, 2)]);

        grid.tname = idx == 0 ? 'based_stat' : data.tname;

        grid.el.drawGrid();
    },

    drawChart: function(chart, dataArr, idx) {
        var basedData, data, basedLabel, label,
            keys, key, ix, ixLen;

        basedData = dataArr[0].data;
        data      = dataArr[idx].data;

        if (this.type == 'WAS') {
            for (ix = 0, ixLen = this.wasStatArr.length; ix < ixLen; ix++) {
                if (this.wasStatArr[ix].id == dataArr[0].name) {
                    basedLabel = this.getDisplayStatName(this.wasStatArr[ix].name, 'was');
                }

                label = this.getDisplayStatName(dataArr[idx].name, 'was');
            }
        } else {
            basedLabel = this.getDisplayStatName(dataArr[0].name);
            label = this.getDisplayStatName(dataArr[idx].name);
        }

        basedLabel = basedLabel == 'Cpu Usage' ? 'CPU Usage' : basedLabel;
        label      = label      == 'Cpu Usage' ? 'CPU Usage' : label;

        if (idx == 0) {
            chart.addSeries({
                id: 0,
                color: '#d97009',
                lineWidth: 1,
                label: common.Util.TR(basedLabel)
            });
        } else {
            chart.addSeries({
                id       : 0,
                color    : '#d97009',
                lineWidth: 1,
                label    : common.Util.TR(basedLabel)
            });

            chart.addSeries({
                id: 1,
                color: '#237DE6',
                lineWidth: 1,
                label: common.Util.TR(label),
                yaxis: 2
            });
        }

        keys = Object.keys(basedData).sort();
        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key = keys[ix];

            if (idx == 0) {
                chart.addValue(0, [+new Date(key), basedData[key]]);
            } else {
                chart.addValue(0, [+new Date(key), basedData[key]]);
                chart.addValue(1, [+new Date(key), data[key]]);
            }
        }

        chart.plotDraw();
    },

    getDisplayStatType: function(stat_type) {
        if (stat_type == 'was_stat') {
            return common.Util.TR('WAS Stat');
        } else if (stat_type == 'db_stat') {
            return common.Util.TR('DB Stat');
        } else if (stat_type == 'db_wait') {
            return common.Util.TR('DB Wait');
        } else if (stat_type == 'os_stat') {
            return common.Util.TR('OS Stat');
        }
    },

    getDisplayStatName: function(stat_name, type) {
        if (type == 'was') {
            return this.wasStat[stat_name] ? this.wasStat[stat_name] : getDisplayStatName(stat_name);
        } else {
            return getDisplayStatName(stat_name);
        }

        function getDisplayStatName(stat_name) {
            var Arr = stat_name.split('_'),
                ix, ixLen;

            if (stat_name.indexOf('_') == -1) {
                return stat_name;
            }

            for (ix = 0, ixLen = Arr.length; ix < ixLen; ix++) {
                Arr[ix] = Arr[ix].charAt(0).toUpperCase() + Arr[ix].slice(1);
            }

            return Arr.join(' ');
        }
    }
});




