/**
 * Created by JONGHO on 2015-08-12.
 */
Ext.define("Exem.ReportBaseForm", {
    extend: 'Exem.Form',
    layout: 'fit',
    flex: 1,
    width: '100%',
    height: '100%',
    bodyLayout: 'vbox',
    padding: '0 20 0 20',
    cls : 'Exem-ReportBaseForm list-condition',

    isAgentDaily: false,
    isAgentWeekly: false,
    isAgentMonthly: false,
    isAgentCompMonthly: false,

    useReportAggregateValue : false,     // 'AVG', 'MAX', 'ALL'
    statAggregate : 'AVG',
    // 출력 방향 선택 버튼 사용 여부
    usePageDirectionBtn: true,
    // group <-> single view 선택 버튼 사용 여부
    useDocumentType: false,
    // Time Window 사용 여부
    useTimeWindow: true,
    // 주말 제외 사용 여부 (월간에서만 사용 예정)
    useExcludeWeekend : false,
    // datepicker format
    DisplayTime: DisplayTimeMode.None,
    sql : {
        WAS : {
            agent_report : {
                daily_overall_summary : 'IMXPA_Report_Agent_Daily_Overall_Summary.sql',
                daily_performance_summary : 'IMXPA_Report_Agent_Daily_Performance_Summary.sql',
                daily_agent_summary : 'IMXPA_Report_Agent_Daily_Agent_Summary.sql',
                daily_agent_detail : 'IMXPA_Report_Agent_Daily_Agent_Detail.sql',
                daily_alert_history : 'IMXPA_Report_Agent_Daily_Alert_History.sql',

                longterm_overall_summary : 'IMXPA_Report_Agent_LongTerm_Overall_Summary.sql',
                longterm_overall_detail : 'IMXPA_Report_Agent_LongTerm_Overall_Detail.sql',
                longterm_performance_summary : 'IMXPA_Report_Agent_LongTerm_Performance_Summary.sql',
                longterm_agent_summary : 'IMXPA_Report_Agent_LongTerm_Agent_Summary.sql',
                longterm_agent_detail : 'IMXPA_Report_Agent_LongTerm_Agent_Detail.sql',
                longterm_alert_history : 'IMXPA_Report_Agent_LongTerm_Alert_History.sql',

                agent_comp_monthly_report_summary : 'IMXPA_Report_Agent_Comp_Monthly_Report_Summary.sql',
                agent_comp_monthly_compare_summary : 'IMXPA_Report_Agent_Comp_Monthly_Compare_Summary.sql',
                agent_comp_monthly_report_summary_time_window : 'IMXPA_Report_Agent_Comp_Monthly_Report_Summary_TimeWindow.sql',
                agent_comp_monthly_compare_summary_time_window : 'IMXPA_Report_Agent_Comp_Monthly_Compare_Summary_TimeWindow.sql'
            }
        },
        TP : {
            agent_report : {
                daily_overall_summary : 'IMXPA_Report_Agent_TP_Daily_Overall_Summary.sql',
                daily_performance_summary : 'IMXPA_Report_Agent_TP_Daily_Performance_Summary.sql',
                daily_agent_summary : 'IMXPA_Report_Agent_TP_Daily_Agent_Summary.sql',
                daily_agent_detail : 'IMXPA_Report_Agent_TP_Daily_Agent_Detail.sql',
                daily_alert_history : 'IMXPA_Report_Agent_Daily_Alert_History.sql',

                longterm_overall_summary : 'IMXPA_Report_Agent_TP_LongTerm_Overall_Summary.sql',
                longterm_performance_summary : 'IMXPA_Report_Agent_TP_LongTerm_Performance_Summary.sql',
                longterm_agent_summary : 'IMXPA_Report_Agent_TP_LongTerm_Agent_Summary.sql',
                longterm_agent_detail : 'IMXPA_Report_Agent_TP_LongTerm_Agent_Detail.sql',
                longterm_alert_history : 'IMXPA_Report_Agent_TP_LongTerm_Alert_History.sql',

                agent_comp_monthly_report_summary : 'IMXPA_Report_Agent_Comp_Monthly_Report_Summary.sql',
                agent_comp_monthly_compare_summary : 'IMXPA_Report_Agent_Comp_Monthly_Compare_Summary.sql',
                agent_comp_monthly_report_summary_time_window : 'IMXPA_Report_Agent_Comp_Monthly_Report_Summary_TimeWindow.sql',
                agent_comp_monthly_compare_summary_time_window : 'IMXPA_Report_Agent_Comp_Monthly_Compare_Summary_TimeWindow.sql'
            }
        },
        WEB : {

        }
    },
    defaultOptions: {
        PAGE_DIRECTION  : 0,
        WAS_LIST        : [],
        WAS_NAME        : {},
        STAT_LIST       : {},
        AVG_CHECK       : true,
        MAX_CHECK       : false
    },

    initProperty: function () {

        this.options = this.templateOptions || this.defaultOptions;

        this.tree = null;

        this.monitorType = !this.monitorType ? window.rtmMonitorType : this.monitorType;

        this.pageType = { H:0, V:1 };
        this.pageDirection = this.options['PAGE_DIRECTION'];


        this.excelPositionMargin = {
            default : 1,
            chartHeight : 9,
            chartWidth : 11,
            chartTable : 3,
            sheetTitle : 2
        };


        this.execInfo = null;
        this.findComboData = [];
        this.failList = [];

        this.overallStatList = {
            WAS : [
                {name : 'visitor_count_avg',    type : 'float', text : common.Util.CTR('Visitor Count (AVG)')},
                {name : 'concurrent_users_avg', type : 'float', text : common.Util.CTR('Concurrent Users (AVG)')},
                {name : 'concurrent_users_max', type : 'int64', text : common.Util.CTR('Concurrent Users (MAX)')},
                {name : 'txn_exec_count',       type : 'int64', text : common.Util.CTR('Total Execute Count')},
                {name : 'tps_avg',              type : 'float', text : common.Util.CTR('TPS (AVG) ')},
                {name : 'tps_max',              type : 'float', text : common.Util.CTR('TPS (MAX) ')},
                {name : 'alert_count',          type : 'int64', text : common.Util.CTR('Alert Count')},
                {name : 'elapse_time_avg',      type : 'float', text : common.Util.CTR('Avg Elapse Time(sec)')},
                {name : 'elapse_time_max',      type : 'float', text : common.Util.CTR('Max Elapse Time(sec)')},
                {name : 'tps_max_agent',        type : 'float', text : common.Util.CTR('TPS (MAX) ')}
            ],
            TP : [
                {name : 'visitor_count_avg',    type : 'float', text : common.Util.CTR('Visitor Count (AVG)')},
                {name : 'concurrent_users_avg', type : 'float', text : common.Util.CTR('Concurrent Users (AVG)')},
                {name : 'concurrent_users_max', type : 'int64', text : common.Util.CTR('Concurrent Users (MAX)')},
                {name : 'txn_cnt_sum',          type : 'int64', text : common.Util.CTR('Transaction Count')},
                {name : 'tps_avg',              type : 'float', text : common.Util.CTR('TPS (AVG) ')},
                {name : 'tps_max',              type : 'float', text : common.Util.CTR('TPS (MAX) ')},
                {name : 'alert_count',          type : 'int64', text : common.Util.CTR('Alert Count')},
                {name : 'elapse_time_avg',      type : 'float', text : common.Util.CTR('Avg Elapse Time(sec)')},
                {name : 'elapse_time_max',      type : 'float', text : common.Util.CTR('Max Elapse Time(sec)')},
                {name : 'tps_max_agent',        type : 'float', text : common.Util.CTR('TPS (MAX) ')}
            ]
        };

        this.statList = {
            WAS : [
                {name: 'execute_count',        text: common.Util.CTR('Execute Count'),          defaultStat: true,  type: 'int64', statType: 'total'  },
                {name: 'visitor_count',        text: common.Util.CTR('Visitor Count'),          defaultStat: true,  type: 'int64', statType: 'total'  },
                {name: 'tps',                  text: common.Util.CTR('TPS'),                    defaultStat: true,  type: 'float', statType: 'overall'},
                {name: 'txn_elapse',           text: common.Util.CTR('Elapse Time'),            defaultStat: true,  type: 'float', statType: 'overall'},
                {name: 'concurrent_users',     text: common.Util.CTR('Concurrent Users'),       defaultStat: true,  type: 'float', statType: 'overall'},
                {name: 'os_cpu',               text: common.Util.CTR('OS CPU (%)'),             defaultStat: true,  type: 'float', statType: 'agent'  },
                {name: 'jvm_cpu_usage',        text: common.Util.CTR('JVM CPU Usage (%)'),      defaultStat: true,  type: 'float', statType: 'agent'  },
                {name: 'jvm_heap_usage',       text: common.Util.CTR('JVM Heap Usage (%)'),     defaultStat: true,  type: 'float', statType: 'agent'  },
                {name: 'os_memory_usage',      text: common.Util.CTR('OS Memory (%)'),          defaultStat: true,  type: 'float', statType: 'agent'  },
                {name: 'os_memory',            text: common.Util.CTR('OS Memory (MB)'),         defaultStat: false, type: 'int64', statType: 'agent'  },
                {name: 'fgc_count',            text: common.Util.CTR('Full GC Count'),          defaultStat: true,  type: 'int64', statType: 'agent'  },
                {name: 'fgc_time',             text: common.Util.CTR('Full GC Time (Sec)'),     defaultStat: true,  type: 'float', statType: 'agent'  },
                {name: 'ygc_count',            text: common.Util.CTR('Young GC Count'),         defaultStat: false, type: 'int64', statType: 'agent'  },
                {name: 'ygc_time',             text: common.Util.CTR('Young GC Time (Sec)'),    defaultStat: false, type: 'float', statType: 'agent'  },
                {name: 'exception_count',      text: common.Util.CTR('Exception Count'),        defaultStat: false, type: 'int64', statType: 'total'  },
                {name: 'exception_ratio',      text: common.Util.CTR('Exception Ratio (%)'),    defaultStat: false, type: 'float', statType: 'total'  },
                {name: 'active_db_sessions',   text: common.Util.CTR('Active DB Connections'),  defaultStat: false, type: 'int64', statType: 'agent'  },
                {name: 'active_transaction',   text: common.Util.CTR('Active Transactions'),    defaultStat: false, type: 'int64', statType: 'agent'  }

            ],
            TP : [
                {name: 'txn_count',            text: common.Util.CTR('Transaction Count'),      defaultStat: true,  type: 'int64', statType: 'total'  },
                {name: 'visitor_count',        text: common.Util.CTR('Visitor Count'),          defaultStat: true,  type: 'int64', statType: 'total'  },
                {name: 'tps',                  text: common.Util.CTR('TPS'),                    defaultStat: true,  type: 'float', statType: 'overall'},
                {name: 'elapse_time',          text: common.Util.CTR('Elapse Time'),            defaultStat: true,  type: 'float', statType: 'overall'},
                {name: 'concurrent_users',     text: common.Util.CTR('Concurrent Users'),       defaultStat: true,  type: 'float', statType: 'overall'},
                {name: 'proc_cnt',             text: common.Util.CTR('Process Count'),          defaultStat: true,  type: 'int64', statType: 'agent'  },
                {name: 'clients',              text: common.Util.CTR('Client Count'),           defaultStat: true,  type: 'float', statType: 'agent'  },
                {name: 'queuing_cnt',          text: common.Util.CTR('Queuing Count'),          defaultStat: true,  type: 'float', statType: 'agent'  },
                {name: 'queuing_time',         text: common.Util.CTR('Queuing Time'),           defaultStat: true,  type: 'float', statType: 'agent'  },
                {name: 'err_cnt',              text: common.Util.CTR('Error Count'),            defaultStat: true,  type: 'int64', statType: 'total'  },
                {name: 'aq_cnt',               text: common.Util.CTR('AQ Count'),               defaultStat: false, type: 'float', statType: 'agent'  },
                {name: 'failure_cnt',          text: common.Util.CTR('Failure Count'),          defaultStat: false, type: 'int64', statType: 'total'  }
            ]
        };

        this.alertColumnList = [
            {name : 'was_name', type : 'string', text : common.Util.CTR('Agent')},
            {name : 'alert_resource_name', type : 'string', text : common.Util.CTR('Alert Type')},
            {name : 'alert_status', type : 'string', text : common.Util.CTR('Alert Level')},
            {name : 'alert_count', type : 'int64', text : common.Util.CTR('Alert Count')}
        ];
    },

    init: function () {

        this.initProperty();

        this.background = Ext.create('Ext.container.Container', {
            width: '100%',
            height: '100%',
            layout: 'vbox'
        });
        this.add(this.background);

        this.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this.background
        });

        this.dateArea = Ext.create('Ext.container.Container', {
            width   : this.isConfiguration ? 750 : '100%',
            height  : this.isConfiguration ? 23 : 80,
            cls     : 'exem-BaseForm-dateArea',
            layout  : 'hbox',
            padding : this.isConfiguration ? '0 0 0 1' : '30 0 0 20'
        });

        this.background.add(this.dateArea);

        if(this.isAgentCompMonthly){
            this.addCompMonthlyDatePicker(this.dateArea);
        }
        else{
            this.datePicker = this.addDatePicker(this.dateArea);
        }

        if(this.useTimeWindow){
            this.timeWindow = Ext.create('Exem.TimeWindow',{
                width   : 200,
                height  : this.isConfiguration ? 24 : 30,
                margin  : this.isConfiguration ? 0 : '0 0 0 10',
                useOnlyHour: true,
                showRetrieveBtn: false
            });

            this.dateArea.add(this.timeWindow);
        }

        if(this.useExcludeWeekend) {
            this.excludeWeekend = false;

            this.chkExcludeWeekend = Ext.create('Ext.form.field.Checkbox', {
                boxLabel: common.Util.TR('Exclude Weekend'),
                name    : 'excludeWeekend',
                margin  : '0 5 0 10',
                checked : false
            });

            this.dateArea.add(this.chkExcludeWeekend);
        }

        this.directionBtnBGCon = Ext.create('Ext.container.Container', {
            width: 180,
            height: 40,
            layout: 'hbox',
            margin: '0 0 0 20'
        });

        this.addSerparator2(this.dateArea, '0 0 0 15');
        this.dateArea.add(this.directionBtnBGCon);

        this.verticalBtn = Ext.create('Ext.button.Button', {
            itemId: 'verticalBtn',
            width: 16,
            height: 19,
            allowDepress: false,
            cls: 'report-btn-vertical',
            pressed: this.pageDirection,
            enableToggle: true,
            toggleGroup: 'pageType' + this.id,
            toggleHandler: function (btn, state) {
                if (state) {
                    this.pageDirection = this.pageType.V;
                }
                else {
                    this.pageDirection = this.pageType.H;
                }
            }.bind(this)
        });

        var labelVertical = Ext.create('Ext.form.Label', {
            text: common.Util.TR('Vertical'),
            margin: '0 0 0 5',
            cls: 'report-label',
            listeners: {
                scope: this,
                render: function (_this) {
                    _this.el.on('click', function () {
                        this.verticalBtn.toggle(true);
                    }.bind(this));
                }
            }
        });

        this.horizontalBtn = Ext.create('Ext.button.Button', {
            itemId: 'horizontalBtn',
            width: 19,
            height: 17,
            cls: 'report-btn-horizontal',
            allowDepress: false,
            margin: '2 0 0 20',
            toggleGroup: 'pageType' + this.id,
            enableToggle: true,
            pressed: ! this.pageDirection
        });

        var labelHorizontal = Ext.create('Ext.form.Label', {
            text: common.Util.TR('Horizontal'),
            margin: '0 0 0 5',
            cls: 'report-label',
            listeners: {
                scope: this,
                render: function (_this) {
                    _this.el.on('click', function () {
                        this.horizontalBtn.toggle(true);
                    }.bind(this));
                }
            }
        });

        this.directionBtnBGCon.add(this.verticalBtn, labelVertical, this.horizontalBtn, labelHorizontal);


        this.bodyContainer = Ext.create('Ext.container.Container', {
            width: '100%',
            height: '100%',
            flex: 1,
            autoScroll: true,
            cls: 'exem-BaseForm-condition',
            padding: '0 0 20 0',
            layout: this.bodyLayout
        });

        this.buttonContainer = Ext.create('Ext.container.Container', {
            width: '100%',
            height: 50,
            margin: '0 0 0 20',
            layout: {
                type: 'hbox'
            }
        });

        if ( !this.isConfiguration ) {
            var btnBack = Ext.create('Exem.Button', {
                text: common.Util.TR('Previous'),
                width: 120,
                height: 30,
                margin: '0 10 0 0',
                listeners: {
                    scope: this,
                    click: function () {
                        var layout = this.mainPageInfo.getLayout();
                        layout.setActiveItem(0);
                    }
                }
            });
            this.buttonContainer.add(btnBack);
        }

        var btnExport = Ext.create('Exem.Button', {
            text: this.isConfiguration ? common.Util.TR('Save Template') : common.Util.TR('Export Excel'),
            width: 120,
            height: 30,
            margin: '0 10 0 0',
            listeners: {
                scope: this,
                click: function () {
                    this.executeSql();
                }
            }
        });
        this.buttonContainer.add(btnExport);

        if ( this.isConfiguration ) {
            var btnSetSchedule = Ext.create('Exem.Button', {
                text   : common.Util.TR('Set Schedule'),
                itemId : 'btnSetSchedule',
                width  : 120,
                height : 30,
                margin : '0 10 0 0',
                listeners: {
                    scope: this,
                    click: function () {
                        this.openSetScheduleWin();
                    }
                }
            });

            this.buttonContainer.add(btnSetSchedule);
        }

        this.background.add(this.bodyContainer, this.buttonContainer);

        if (this.innerInit) {
            this.innerInit();
            // 프로그레스 영역 생성
            this.progress =  this.createProgress();
        }
    },

    // progress 진행 영역 생성
    createProgress: function() {
        this.progressForm = Ext.create('Ext.panel.Panel',{
            modal : true,
            width : 700,
            height: 200,
            layout: {
                type : 'vbox',
                pack : 'center',
                align: 'center'
            },
            shadow   : false,
            floating : true,
            style: {
                'border': '10px solid',
                'border-radius': '20px'
            }
        });

        var progressBg = Ext.create('Ext.container.Container',{
            width: '90%',
            height: 120
        });
        this.progressForm.add(progressBg);

        var progressTitle = Ext.create('Ext.container.Container',{
            width : '100%',
            height: 30,
            html  : '<div style="font-size: 18px; text-indent: 10px; line-height: 30px;">'+common.Util.TR("Creating Analysis Report.")+'</div>'
        });

        progressBg.add(progressTitle);

        var progressBarBG = Ext.create('Ext.container.Container',{
            width : '100%',
            height: 40,
            layout: 'hbox'
        });

        this.progressBarArea = Ext.create('Ext.container.Container',{
            width : '90%',
            height: 40,
            html  : '<div class ="report-progress"><span class="bar" style="width: 10%;"><span class = "percent">0%</span></span></div>'
        });

        this.progressNum = Ext.create('Ext.container.Container',{
            width : '10%',
            height: 40,
            html  : '<div class ="report-progress-num"></div>'
        });

        progressBarBG.add(this.progressBarArea);
        progressBarBG.add(this.progressNum);

        progressBg.add(progressBarBG);

        this.instanceProcess = Ext.create('Ext.container.Container',{
            width : '100%',
            height: 30,
            html : '<div class ="report-progress-name"></div>'
        });

        progressBg.add(this.instanceProcess);
    },

    // progress 영역 초기화
    processInitialize: function() {
        this.instanceProcess.el.dom.getElementsByClassName('report-progress-name')[0].innerHTML = '';
        this.progressBarArea.el.dom.getElementsByClassName('bar')[0].style.width =   '0%';
        this.progressBarArea.el.dom.getElementsByClassName('percent')[0].innerHTML =   '';
        this.progressNum.el.dom.getElementsByClassName('report-progress-num')[0].innerHTML = '';
    },

    processClose: function() {
        setTimeout(function(){
            this.progressForm.hide();
            if (this.failList.length != 0) {
                common.Util.showMessage(common.Util.TR('Error'), common.Util.TR('Export failed ')+' ('+this.failList.join(',')+')', Ext.Msg.OK, Ext.MessageBox.ERROR);
            }
        }.bind(this), 1000);
    },

    chkStatAggregate: function() {
        var avgVal, maxVal;

        avgVal = this.chkAvg.getValue();
        maxVal = this.chkMax.getValue();

        if(avgVal && maxVal) {
            this.statAggregate = 'ALL';
        }
        else if(avgVal && !maxVal) {
            this.statAggregate = 'AVG';
        }
        else if(!avgVal && maxVal) {
            this.statAggregate = 'MAX';
        }
        else {
            console.warning('check stat aggregate');
        }
    },

    // 2 DEPTH, WASNAME에 false가 있는지 체크
    setParentState: function (node, checkstate) {
        var count = 0;
        node.cascadeBy(function (child) {
            if (child.data.depth == 2 && child.data.checked == checkstate) {
                count++;
            }
        });
        return count == 0;
    },

    // 에이전트 선택영역 콤보 박스와 tree
    addAgentComponent: function (target) {
        this.wasDBTreeCombo = Ext.create('Exem.wasDBTreeCombo', {
            width : '100%',
            height : '100%',
            flex : 1,
            style : {
                margin : '15px 0 0 0'
            },
            selectedAgentList : this.options['WAS_NAME']
        });
        target.add(this.wasDBTreeCombo);
    },

    addStatComponent: function (target) {
        var contentBG = Ext.create('Ext.container.Container', {
            width: '100%',
            padding: '0 0 0 0',
            height: '100%',
            layout: 'fit',
            flex: 1,
            border: true
        });

        target.add(contentBG);

        this.statChange = Ext.create('Exem.ReportStatChange', {
            statList : this.statList[this.monitorType],
            useDefaultStat : this.useDefaultStat
        });
        this.statChange.init();
        contentBG.add(this.statChange);

        var selectedStat =  this.options['STAT_LIST'];

        if(selectedStat){
            var selectedList = Object.keys(selectedStat);

            for(var ix = 0, ixLen = selectedList.length; ix < ixLen; ix++){
                this.statChange.setGridSelect({
                    name: selectedList[ix]
                });
            }
        }
    },

    getGroupName: function(wasId){
        var groupName;

        if(this.isBusinessDaily || this.isBusinessMonthly){
            groupName = Comm.RTComm.getGroupNameByWasId(wasId);
        }
        else{
            groupName = Comm.RTComm.HostRelWAS(wasId);
        }

        return groupName;
    },


    addCompMonthlyDatePicker: function(target){
        var pickerWidth = 115;

        var fixedArea = Ext.create('Ext.container.Container', {
            width: 180,
            height: '100%',
            layout: {
                type: 'hbox',
                pack: 'start'
            }
        });

        var fixedDateLabel = Ext.create('Ext.form.Label',{
            text: common.Util.TR('Fixed Date'),
            margin: '4px 5px 0px 0px'
        });

        this.fixedDate = Ext.create('Exem.DatePicker', {
            width: pickerWidth,
            label: common.Util.TR('Date'),
            DisplayTime: DisplayTimeMode.YM,
            rangeOneDay: false,
            useRetriveBtn: false,
            useGoDayButton: false,
            singleField: true,
            labelYPos: 7
        });

        fixedArea.add(fixedDateLabel, this.fixedDate);

        var compareArea = Ext.create('Ext.container.Container', {
            width: 190,
            height: '100%',
            layout: {
                type: 'hbox',
                pack: 'start'
            }
        });

        var compareDateLabel = Ext.create('Ext.form.Label',{
            text: common.Util.TR('Compare Date'),
            margin: '4px 5px 0px 0px'
        });

        this.compareDate = Ext.create('Exem.DatePicker', {
            width: pickerWidth,
            label: common.Util.TR('Date'),
            DisplayTime: DisplayTimeMode.YM,
            rangeOneDay: false,
            useRetriveBtn: false,
            useGoDayButton: false,
            singleField: true,
            labelYPos: 7
        });

        compareArea.add(compareDateLabel, this.compareDate);

        target.add(fixedArea, compareArea);
    },


    addDatePicker: function (target) {
        var pickerWidth, displayMode;
        this.useSingle = true;

        if (this.isAgentDaily) {
            target.add(this._addRadioBtn('Yesterday', 80, false), this._addRadioBtn('Today', 70, true));
            pickerWidth = 100;
        } else if(this.isAgentWeekly) {
            target.add(this._addRadioBtn('Last Week', 90, true), this._addRadioBtn('Current Week', 105, false));
            this.useSingle = false;
            pickerWidth = 205;
        } else if(this.isAgentMonthly) {
            target.add(this._addRadioBtn('Last Month', 90, true), this._addRadioBtn('Current Month', 105, false));
            this.useSingle = true;
            pickerWidth = 100;
        }

        displayMode = this.isAgentMonthly ? DisplayTimeMode.YM : DisplayTimeMode.None;

        var datePicker = Ext.create('Exem.DatePicker', {
            width : pickerWidth,
            label : common.Util.TR('Date'),
            executeSQL: this.executeSQL,
            executeScope: this,
            DisplayTime: displayMode,
            cls: 'report-datepicker',
            rangeOneDay: false,
            useRetriveBtn: false,
            useGoDayButton : this.isAgentDaily,
            singleField: this.useSingle,
            retrieveScope: this,
            labelYPos: 7,
            keyUpCheck: true,
            keyUpFn: function (fromTime, toTime) {
                /**
                 *  어제, 오늘, 이번달, 지난달을 차례로 검사 하고 하나도 없으면 모두 해제
                 */

                var dateObj = {};
                var today, calcLastWeek, calcCurWeek;

                today = new Date();

                calcLastWeek = today.getDate() - today.getDay();
                if(!today.getDay()) {
                    calcLastWeek = today.getDate() - today.getDay() - 7;
                }

                calcCurWeek = today.getDate() - today.getDay() + 1;
                if(!today.getDay()) {
                    calcCurWeek = today.getDate() - today.getDay() - 6;
                }

                dateObj.yesterDayFrom = Ext.Date.add(new Date(), Ext.Date.DAY, -1).setHours(0, 0, 0, 0);
                dateObj.yesterDayTo = Ext.Date.add(new Date(), Ext.Date.DAY, -1).setHours(23, 59, 59);
                dateObj.todayFrom = new Date().setHours(0, 0, 0, 0);
                dateObj.todayTo = new Date().setHours(23, 59, 59);

                dateObj.lastWeekFrom = new Date(today.getFullYear(), today.getMonth(), calcLastWeek - 6).setHours(0, 0, 0, 0);
                dateObj.lastWeekFrom_To = new Date(today.getFullYear(), today.getMonth(), calcLastWeek - 6).setHours(23, 59, 59);
                dateObj.lastWeekToFrom = new Date(today.getFullYear(), today.getMonth(), calcLastWeek).setHours(0, 0, 0, 0);
                dateObj.lastWeekToFrom_To = new Date(today.getFullYear(), today.getMonth(), calcLastWeek).setHours(23, 59, 59);

                dateObj.curWeekFrom = new Date(today.getFullYear(), today.getMonth(), calcCurWeek).setHours(0, 0, 0, 0);
                dateObj.curWeekFrom_To = new Date(today.getFullYear(), today.getMonth(), calcCurWeek).setHours(23, 59, 59);

                dateObj.lastMonthFrom = Ext.Date.add(new Date(), Ext.Date.MONTH, -1).setHours(0, 0, 0, 0);
                dateObj.lastMonthFrom_To = Ext.Date.add(new Date(), Ext.Date.MONTH, -1).setHours(23, 59, 59);

                if (this.useSingle) {
                    if (dateObj.yesterDayFrom <= fromTime && fromTime <= dateObj.yesterDayTo) {
                        this.setRadioValue('Yesterday', true);
                    }
                    else if (dateObj.todayFrom <= fromTime && fromTime <= dateObj.todayTo) {
                        this.setRadioValue('Today', true);
                    }
                    else {
                        this.setRadioValue(this._getRadioValue(), false);
                    }
                } else {
                    if ((dateObj.lastWeekFrom <= fromTime && fromTime <= dateObj.lastWeekFrom_To) &&
                        (dateObj.lastWeekToFrom <= toTime && toTime <= dateObj.lastWeekToFrom_To)) {
                        this.setRadioValue('Last Week', true);
                    }
                    else if((dateObj.curWeekFrom <= fromTime && fromTime <= dateObj.curWeekFrom_To) &&
                        (dateObj.todayFrom <= toTime && toTime <= dateObj.todayTo)) {
                        this.setRadioValue('Current Week', true);
                    }
                    else {
                        this.setRadioValue(this._getRadioValue(), false);
                    }
                }

            }.bind(this)
        });
        target.add(datePicker);
        return datePicker;
    },

    _addRadioBtn: function (label, width, checked) {

        var radioBtn = Ext.create('Ext.form.field.Radio', {
            boxLabel: common.Util.TR(label),
            itemId: label,
            width: width,
            name: this.id + 'dateType',
            checked: checked,
            listeners: {
                scope: this,
                render: function () {
                    radioBtn.getEl().on('click', function () {
                        this._dateClick(label);
                    }.bind(this));
                }
            }
        });

        return radioBtn;
    },

    createArea: function (title, target, isAggregate) {
        var self = this;

        var bgCon,
            titleLabel, titleArea,
            seperator,
            contentsArea;

        var _width = 310;

        bgCon = Ext.create('Ext.container.Container', {
            width: _width,
            padding: '0 10 0 10',
            height: '100%',
            minHeight: 600,
            //autoScroll: true,
            layout: 'vbox'
        });

        titleLabel = Ext.create('Ext.form.Label', {
            width: 130,
            height: 30,
            text: title,
            style: {
                'font-size': '16px',
                'line-height': '30px',
                'font-weight': '600'
            }
        });

        this.chkAvg = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('AVG'),
            name    : 'chkboxAvg',
            margin  : '0 10 0 0',
            checked : this.options['AVG_CHECK'],
            listeners: {
                scope: this,
                change: function(checkbox, newval, oldval) {
                    if(!newval && !self.chkMax.getValue()) {
                        common.Util.showMessage(common.Util.TR('Warning'),  common.Util.TR('Please select at least one item.') , Ext.Msg.OK, Ext.MessageBox.WARNING);
                        checkbox.setValue(oldval);
                    }
                    self.chkStatAggregate();
                }
            }
        });

        this.chkMax = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('MAX'),
            name    : 'chkboxMax',
            margin  : '0 10 0 0',
            checked : this.options['MAX_CHECK'],
            listeners: {
                scope: this,
                change: function(checkbox, newval, oldval) {
                    if(!newval && !self.chkAvg.getValue()) {
                        common.Util.showMessage(common.Util.TR('Warning'),  common.Util.TR('Please select at least one item.') , Ext.Msg.OK, Ext.MessageBox.WARNING);
                        checkbox.setValue(oldval);
                    }
                    self.chkStatAggregate();
                }
            }
        });

        titleArea = Ext.create('Ext.container.Container', {
            width: '100%',
            height : 30,
            layout: 'hbox'
        });

        // 각 파트별 회색 그라데이션 bar
        seperator = Ext.create('Ext.container.Container', {
            width: '100%',
            height: 15,
            cls: 'report-gradient-line'
        });

        contentsArea = Ext.create('Ext.container.Container', {
            width: '100%',
            flex: 1,
            padding: '0 10 0 10',
            layout: 'vbox'
        });


        if(isAggregate) {
            titleArea.add([titleLabel,  {xtype: 'tbspacer', width: 50}, this.chkAvg, this.chkMax]);
            bgCon.add([titleArea, seperator, contentsArea]);
        }
        else {
            bgCon.add([titleLabel, seperator, contentsArea]);

        }

        target.add(bgCon);

        return contentsArea;
    },

    // 영역간에 가운데 선
    addSerparator: function (target) {
        var line = Ext.create('Ext.container.Container', {
            width: 1,
            height: '100%',
            margin: '60 10 0 10',
            style: {
                background: '#e6e6e6'
            }
        });
        target.add(line);
    },

    addSerparator2: function (target, margin) {
        var line = Ext.create('Ext.container.Container', {
            width: 1,
            height: 22,
            margin: margin,
            cls : 'view_report_seperator'
        });
        target.add(line);
    },

    addTopNCheck: function (name) {
        var checkbox = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: name,
            height: 18
        });

        return checkbox;
    },

    _dateClick: function (btnType) {

        var fromTime = '';
        var toTime = '';
        var format = '';
        var isDateInit = true;

        var today,
            calc;

        switch (this.DisplayTime) {
            case DisplayTimeMode.None :
                isDateInit = false;
                format = Comm.dateFormat.NONE;
                break;
            case DisplayTimeMode.HMS :
                format = Comm.dateFormat.HMS;
                break;
            case DisplayTimeMode.HM :
                format = Comm.dateFormat.HM;
                break;
            case DisplayTimeMode.H :
                format = Comm.dateFormat.H;
                break;
            case DisplayTimeMode.YM :
                isDateInit = false;
                format = Comm.dateFormat.YM;
                break;
            default:
                break;
        }

        switch (btnType) {
            case 'Yesterday' :
                fromTime = Ext.Date.add(new Date(), Ext.Date.DAY, -1);
                toTime = Ext.Date.add(new Date(), Ext.Date.DAY, -1);
                break;
            case 'Today' :
            case 'Current Month' :
                fromTime = new Date();
                toTime = new Date();
                break;
            case 'Last Week':   // 그 전 [월-일]
                today = new Date();
                calc = today.getDate() - today.getDay();

                if(!today.getDay()) {         // 일요일인 경우 그 전주 처리
                    calc = today.getDate() - today.getDay()-7;
                }

                fromTime = new Date(today.getFullYear(), today.getMonth(), calc - 6);
                toTime = new Date(today.getFullYear(), today.getMonth(), calc);
                break;
            case 'Current Week':
                today = new Date();
                calc = today.getDate() - today.getDay() + 1;

                if(!today.getDay()) {
                    calc = today.getDate() - today.getDay() - 6;
                }

                fromTime = new Date(today.getFullYear(), today.getMonth(), calc);
                toTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                break;
            case 'Last Month':
                fromTime = Ext.Date.add(new Date(), Ext.Date.MONTH, -1);
                toTime = new Date();
                break;
            default:
                break;
        }

        // 하나일때 From 만 구하고 세팅
        if (this.singleField) {
            // format 이 none 아닐 때 시분초 00 으로 세팅
            if (isDateInit) {
                fromTime = Ext.util.Format.date(fromTime, common.Util.getLocaleType(DisplayTimeMode.None)) + ' 00:00';
                this.datePicker.mainFromField.setValue(Ext.Date.format(new Date(fromTime), format));
            }
            else {
                this.datePicker.mainFromField.setValue(Ext.Date.format(new Date(fromTime), format));
            }
        }
        // toField도 변경
        else {
            if (isDateInit) {
                fromTime = Ext.util.Format.date(fromTime, common.Util.getLocaleType(DisplayTimeMode.None)) + ' 00:00';
                toTime = Ext.util.Format.date(toTime, common.Util.getLocaleType(DisplayTimeMode.None)) + ' 23:59';
                this.datePicker.mainFromField.setValue(Ext.Date.format(new Date(fromTime), format));
                this.datePicker.mainToField.setValue(Ext.Date.format(new Date(toTime), format));
            }
            else {
                this.datePicker.mainFromField.setValue(Ext.Date.format(new Date(fromTime), format));
                this.datePicker.mainToField.setValue(Ext.Date.format(new Date(toTime), format));
            }
        }
    },

    executeSql: function() {
        this.execInfo = this.getReportParams();

        if(!this.execInfo) {
            return;
        }

        if(this.execInfo.from_time > this.execInfo.to_time){
            common.Util.showMessage(common.Util.TR('Error'),  common.Util.TR('Time value is incorrect.') , Ext.Msg.OK, Ext.MessageBox.ERROR);
            return;
        }

        this.progressForm.center();
        this.progressForm.show();
        this.processInitialize();

        if(this.isAgentDaily){
            this.executeAgentDaily(this.execInfo);
        }
        else if(this.isAgentWeekly){
            this.executeAgentWeekly(this.execInfo);
        }
        else if(this.isAgentMonthly){
            this.executeAgentMonthly(this.execInfo);
        }
        else if(this.isAgentCompMonthly) {
            this.executeAgentCompMonthly(this.execInfo);
        }
    },

    openSetScheduleWin: function(itemId) {
        // Override 용도
    },

    getReportParams: function() {
        var paramsObj = {};
        var fromTime, toTime, tmpTime,
            fromHour, toHour,
            fixedTime, compareTime,
            tmpFixedTime, tmpCompareTime,
            tmpMonthTime, monthTime, currDate, dateobjCurrDate;
        var selectedStatList;

        this.failList = [];

        this.agentList = this.getAgentList();
        currDate = Ext.util.Format.date(new Date(), 'Y-m-d 00:00:00');
        dateobjCurrDate = new Date(currDate);

        // 선택한 에이전트 없는경우
        if(this.agentList.length === 0) {
            common.Util.showMessage(common.Util.TR('Warning'),  common.Util.TR('Please select agent') , Ext.Msg.OK, Ext.MessageBox.WARNING);
            return;
        }
        else {
            if (this.agentList.length > 4) {
                this.useIntLegend = true;
            }
            else {
                this.useIntLegend = false;
            }
        }

        if(this.isAgentCompMonthly){
            if(Comm.Lang == 'en') {
                tmpFixedTime = this.fixedDate.getFromDateTime().split('/')[1] + "/" + this.fixedDate.getFromDateTime().split('/')[0];
                tmpCompareTime = this.compareDate.getFromDateTime().split('/')[1] + "/" + this.compareDate.getFromDateTime().split('/')[0];

                fixedTime = new Date(tmpFixedTime);
                compareTime = new Date(tmpCompareTime);
            }
            else {
                fixedTime = new Date(this.fixedDate.getFromDateTime());
                compareTime = new Date(this.compareDate.getFromDateTime());
            }

            if (fixedTime.getMonth() == compareTime.getMonth()) {
                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid Date Range'), Ext.Msg.OK, Ext.MessageBox.WARNING);
                return;
            }

            if(fixedTime.getYear() > dateobjCurrDate.getYear() || (fixedTime.getYear() == dateobjCurrDate.getYear() && fixedTime.getMonth() > dateobjCurrDate.getMonth())) {
                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid input'), Ext.Msg.OK, Ext.MessageBox.WARNING);
                return;
            }

            if(compareTime.getYear() > dateobjCurrDate.getYear() || (compareTime.getYear() == dateobjCurrDate.getYear() && compareTime.getMonth() > dateobjCurrDate.getMonth())) {
                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid input'), Ext.Msg.OK, Ext.MessageBox.WARNING);
                return;
            }

            if(fixedTime == 'Invalid Date' || compareTime == 'Invalid Date') {
                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid input'), Ext.Msg.OK, Ext.MessageBox.WARNING);
                return;
            }

            fixedTime.setDate(1);
            compareTime.setDate(1);
            paramsObj.fixedFromTime = Ext.util.Format.date(fixedTime, 'Y-m-d 00:00:00');
            paramsObj.compareFromTime = Ext.util.Format.date(compareTime, 'Y-m-d 00:00:00');

            fixedTime.setMonth(fixedTime.getMonth() + 1);
            compareTime.setMonth(compareTime.getMonth() + 1);
            fixedTime.setDate(0);
            compareTime.setDate(0);
            paramsObj.fixedToTime = Ext.util.Format.date(fixedTime, 'Y-m-d 23:59:59');
            paramsObj.compareToTime = Ext.util.Format.date(compareTime, 'Y-m-d 23:59:59');
        }
        else{
            selectedStatList = this.statChange.getSelectedList();
            if(selectedStatList.length == 0) {
                common.Util.showMessage(common.Util.TR('Warning'),  common.Util.TR('Please select stat condition') , Ext.Msg.OK, Ext.MessageBox.WARNING);
                return;
            }

            this.selectedStatList = this.getStatList(selectedStatList);
            paramsObj.from_time = Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d 00:00:00');

            if(this.isAgentWeekly) {
                paramsObj.to_time =  Ext.util.Format.date(this.datePicker.getToDateTime(), 'Y-m-d 23:59:59');

                fromTime =  +new Date(paramsObj.from_time);
                toTime   =  +new Date(paramsObj.to_time);

                if (toTime - fromTime < 0) {
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid Date Range'), Ext.Msg.OK, Ext.MessageBox.WARNING);
                    return;
                }

                if (toTime - fromTime < 86400000) {
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Select the date more than 1 days'), Ext.Msg.OK, Ext.MessageBox.WARNING);
                    return;
                }

                if(new Date(this.datePicker.getFromDateTime()) > currDate || new Date(this.datePicker.getToDateTime()) > currDate) {
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid Date Range'), Ext.Msg.OK, Ext.MessageBox.WARNING);
                    return;
                }

                if(new Date(this.datePicker.getFromDateTime()) == 'Invalid Date' || new Date(this.datePicker.getToDateTime()) == 'Invalid Date') {
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid input'), Ext.Msg.OK, Ext.MessageBox.WARNING);
                    return;
                }
            }
            else if(this.isAgentMonthly) {
                if(Comm.Lang == 'en') {
                    tmpMonthTime = this.datePicker.getFromDateTime().split('/')[1] + "/" + this.datePicker.getFromDateTime().split('/')[0];
                    monthTime = new Date(tmpMonthTime);
                }
                else {
                    monthTime = new Date(this.datePicker.getFromDateTime());
                }

                monthTime.setDate(1);
                paramsObj.from_time = Ext.util.Format.date(monthTime, 'Y-m-d 00:00:00');

                monthTime.setMonth(monthTime.getMonth() + 1);
                monthTime.setDate(0);

                paramsObj.to_time = Ext.util.Format.date(monthTime, 'Y-m-d 23:59:59');

                if(monthTime.getYear() > dateobjCurrDate.getYear() || (monthTime.getYear() == dateobjCurrDate.getYear() && monthTime.getMonth() > dateobjCurrDate.getMonth())) {
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid Date Range'), Ext.Msg.OK, Ext.MessageBox.WARNING);
                    return;
                }

                if(monthTime == 'Invalid Date') {
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid input'), Ext.Msg.OK, Ext.MessageBox.WARNING);
                    return;
                }
            }
            else {
                paramsObj.to_time = Ext.util.Format.date(this.datePicker.getFromDateTime(), 'Y-m-d 23:59:59');
                tmpTime = new Date(this.datePicker.getFromDateTime());

                if(tmpTime > currDate) {
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid Date Range'), Ext.Msg.OK, Ext.MessageBox.WARNING);
                    return;
                }

                if(tmpTime == 'Invalid Date') {
                    common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid input'), Ext.Msg.OK, Ext.MessageBox.WARNING);
                    return;
                }
            }
        }

        if(this.useTimeWindow){
            paramsObj.isTimeWindowChecked = this.timeWindow.isChecked();
        }

        if(paramsObj.isTimeWindowChecked){
            fromHour = this.timeWindow.getFromTime();
            toHour = this.timeWindow.getToTime();

            if (toHour - fromHour < 1) {
                common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Invalid Time Range'), Ext.Msg.OK, Ext.MessageBox.WARNING);
                return;
            }

            if(this.isAgentCompMonthly){
                fromTime = new Date(paramsObj.fixedFromTime);
                toTime = new Date(paramsObj.fixedToTime);
            }
            else {
                fromTime = new Date(paramsObj.from_time);
                toTime = new Date(paramsObj.to_time);
            }

            fromTime.setHours(fromHour);
            toTime.setHours(toHour - 1);

            if(this.isAgentDaily) {
                paramsObj.from_time  =  Ext.util.Format.date(fromTime, 'Y-m-d H:00:00');
                paramsObj.to_time    =  Ext.util.Format.date(toTime, 'Y-m-d H:59:59');
            }
            else {
                paramsObj.from_time_window = Ext.util.Format.date(new Date(fromTime), 'H:i');
                paramsObj.to_time_window = Ext.util.Format.date(new Date(toTime), 'H:i');
            }
        }

        if(this.useExcludeWeekend) {
            paramsObj.isExcludeWeekend = this.chkExcludeWeekend.getValue();
        }

        // 사용자 id
        paramsObj.userid = Comm.config.login.user_id;

        return paramsObj;
    },

    getStatList: function(statList){
        var tempList = [];
        var ix, ixLen, jx, jxLen;
        var prevIndex = -1;

        for(ix = 0, ixLen = statList.length; ix < ixLen; ix++){
            for(jx = 0, jxLen = this.statList[this.monitorType].length; jx < jxLen; jx++){
                if(statList[ix] == this.statList[this.monitorType][jx].name){
                    break;
                }
            }

            if(prevIndex == -1 || prevIndex < jx){
                tempList.push(this.statList[this.monitorType][jx]);
            }
            else if(prevIndex > jx){
                tempList.unshift(this.statList[this.monitorType][jx]);
            }

            prevIndex = jx;
        }

        return tempList;

        //var tempList = [], tempStatAvg, tempStatMax;
        //var ix, ixLen, jx, jxLen;
        //var prevIndex = -1;
        //
        //for(ix = 0, ixLen = statList.length; ix < ixLen; ix++){
        //    for(jx = 0, jxLen = this.statList[this.monitorType].length; jx < jxLen; jx++){
        //        if(statList[ix] == this.statList[this.monitorType][jx].name){
        //            break;
        //        }
        //    }
        //
        //    if(this.statAggregate == 'ALL' && this.statList[this.monitorType][jx].statType == 'agent') {
        //        tempStatAvg = this.statList[this.monitorType].slice(jx, jx+1)[0];
        //        tempStatAvg.name += '_avg';
        //        tempStatMax = this.statList[this.monitorType].slice(jx, jx+1)[0];
        //        tempStatMax.name += '_max';
        //    }
        //
        //
        //    if(prevIndex == -1 || prevIndex < jx){
        //        if(this.statAggregate == 'ALL' &&  this.statList[this.monitorType][jx].statType == 'agent') {
        //            tempList.push(tempStatAvg);
        //            tempList.push(tempStatMax);
        //        }
        //        else {
        //            tempList.push(this.statList[this.monitorType][jx]);
        //        }
        //    }
        //    else if(prevIndex > jx){
        //        if(this.statAggregate == 'ALL' &&  this.statList[this.monitorType][jx].statType == 'agent') {
        //            tempList.unshift(tempStatAvg);
        //            tempList.unshift(tempStatMax);
        //        }
        //        else {
        //            tempList.unshift(this.statList[this.monitorType][jx]);
        //        }
        //    }
        //
        //    prevIndex = jx;
        //}
        //
        //return tempList;
    },


    // type return 값이 db_id or db_name 선택.
    getAgentList: function() {
        var tempArr = [];
        var ix, ixLen;
        var checkedList =  this.wasDBTreeCombo.tree.getChecked();

        for (ix = 0, ixLen = checkedList.length; ix < ixLen; ix++) {
            // depth가 1인 경우는 group name
            if (checkedList[ix].data.depth == 2) {
                tempArr.push({
                    wasName : checkedList[ix].data.text,
                    wasId : checkedList[ix].data.id
                });
            }
        }

        return tempArr;
    },

    setRadioValue: function(itemId, checked) {
        for (var ix = 0, ixLen = this.dateArea.items.items.length; ix < ixLen; ix++) {
            if (itemId && this.dateArea.items.items[ix].itemId == itemId) {
                this.dateArea.items.items[ix].setValue(checked);
                break;
            }
        }
    },

    _getRadioValue: function() {
        var ix, ixLen, radioGroup;
        var result = null;
        radioGroup  = this.dateArea.items.items;

        if (!radioGroup) {
            return result;
        }

        for (ix = 0, ixLen = radioGroup.length; ix < ixLen; ix++) {
            if (radioGroup[ix].value) {
                result = radioGroup[ix].itemId;
                break;
            }
        }
        return result;
    },

    onReportUrl: function(aHeader, aData){
        if(aData.result == "COMPLETE"){
            var gridEl = this.scope.getEl();

            var el = Ext.DomHelper.append(gridEl, {
                tag: "a",
                download: this.fileName,
                href: aData.url
            });

            el.click();
            Ext.fly(el).destroy();
        }

        // instance process
        this.scope.instanceProcess.el.dom.getElementsByClassName('report-progress-name')[0].innerHTML = common.Util.TR('Complete')+'.';
        // % size
        this.scope.progressBarArea.el.dom.getElementsByClassName('bar')[0].style.width   = '100%';
        // % text
        this.scope.progressBarArea.el.dom.getElementsByClassName('percent')[0].innerHTML = '100%';
        // 진행률.(1/4)
        this.scope.progressNum.el.dom.getElementsByClassName('report-progress-num')[0].innerHTML = '1 / 1';

        this.scope.processClose();
    },

    downLoadFile: function(index){
        var fileName = null;
        var filePath = location.pathname.split('/');
        var compressExcelData, tempExcelPartData;
        var compressExcelDataKeys;
        var startIndex, endIndex, reportIndex = -1;
        var callbackOpt, AJSON2, parameter;
        var key = Comm.config.login.login_id + common.Util.getUniqueSeq();
        var partLen = 200;
        var ix, ixLen, jx, jxLen;

        if(this.isAgentDaily){
            compressExcelData = this.generateAgentDailyReport(index);
            fileName = 'agent-Daily';
        }
        else if(this.isAgentWeekly){
            compressExcelData = this.generateAgentWeeklyReport(index);
            fileName = 'agent-Weekly';
        }
        else if(this.isAgentMonthly){
            compressExcelData = this.generateAgentMonthlyReport(index);
            fileName = 'agent-Monthly';
        }
        else if(this.isAgentCompMonthly){
            compressExcelData = this.generateAgentCompMonthlyReport(index);
            fileName = 'agent-Compare-Monthly';
        }

        compressExcelDataKeys = Object.keys(compressExcelData);
        for(ix = 0, ixLen = (compressExcelDataKeys.length < partLen ? 1 : Math.floor(compressExcelDataKeys.length / partLen) + 1); ix < ixLen; ix++){
            startIndex = ix * partLen;
            endIndex = (startIndex + partLen > compressExcelDataKeys.length ? compressExcelDataKeys.length : startIndex + partLen);

            tempExcelPartData = {};
            for(jx = startIndex, jxLen = endIndex; jx < jxLen; jx++){
                tempExcelPartData[compressExcelDataKeys[jx]] = compressExcelData[compressExcelDataKeys[jx]];
            }

            callbackOpt = {};
            callbackOpt.scope = this;
            callbackOpt.fileName = fileName + "-" + Ext.Date.format(new Date(), 'YmdHisms') + '.xlsx';
            if(reportIndex != -1){
                callbackOpt.index = reportIndex;
            }

            parameter = {};
            _.extend(parameter, tempExcelPartData);
            parameter.report_key = key;
            parameter.packet_count = compressExcelDataKeys.length;
            parameter.user_name = Comm.config.login.login_id;
            parameter.file_name = fileName + "-" + Ext.Date.format(new Date(), 'YmdHisms') + '.xlsx';
            parameter.root = filePath[1];

            AJSON2 = {};
            AJSON2['function']  = "mxg_ReportStream";
            AJSON2.dll_name     = "IntermaxPlugin.dll";
            AJSON2.options      = parameter;
            AJSON2.return_param = false;
            WS.PluginFunction( AJSON2 , this.onReportUrl , callbackOpt);
        }

        compressExcelData = null;
        tempExcelPartData = null;
        parameter = null;
        callbackOpt = null;
        AJSON2 = null;
    },


    getOverallCellStyle: function(type) {
        var cellStyle;

        switch (type){
            case 'float':
                cellStyle = this.styleFormat.overallDataPoint.id;
                break;
            case 'int64':
                cellStyle = this.styleFormat.overallDataInteger.id;
                break;
            default :
                cellStyle = this.styleFormat.retrieveValue.id;
                break;
        }

        return cellStyle;
    },

    getCellStyle: function(type){
        var cellStyle;

        switch (type){
            case 'datetime':
                cellStyle = this.styleFormat.dateTimeColumns.id;
                break;
            case 'widememo':
            case 'string':
                cellStyle = this.styleFormat.retrieveColumns.id;
                break;
            case 'float':
                cellStyle = this.styleFormat.dataPoint.id;
                break;
            case 'int64':
                cellStyle = this.styleFormat.dataInteger.id;
                break;
            default :
                cellStyle = this.styleFormat.retrieveValue.id;
                break;
        }

        return cellStyle;
    },

    // jykim : 엑셀의 각 셀에 적용되는 스타일을 정의해둔 함수
    setStyleFormat: function(styleSheet){
        this.styleFormat = {};

        // 1000단위씩 콤마로 구분
        this.styleFormat.numFmt = styleSheet.createNumberFormatter('#,##0');
        // 1000단위씩 콤마로 구분 및 소수점 둘째자리
        this.styleFormat.numFmtPoint = styleSheet.createNumberFormatter('#,##0.00');
        // 셀의 값에 %를 붙여줌
        this.styleFormat.numFmtPercent = styleSheet.createNumberFormatter('0"%"');
        // 셀의 값을 안보이게 만듬
        this.styleFormat.valueHide = styleSheet.createNumberFormatter(';;;');

        // 셀의 선 스타일
        this.styleFormat.border = styleSheet.createBorderFormatter({
            bottom: {color: '474a53', style: 'thin'},
            top: {color: '474a53', style: 'thin'},
            left: {color: '474a53', style: 'thin'},
            right: {color: '474a53', style: 'thin'}
        });

        // 셀의 컬럼 배경색
        this.styleFormat.fill01 = styleSheet.createFill({
            type : 'pattern',
            patternType : 'solid',
            bgColor : {
                rgb : '5B9BD5'
            },
            fgColor : {
                rgb : '5B9BD5'
            }
        });

        // 글자 크기 : 10
        this.styleFormat.font10 = styleSheet.createFontStyle({
            size: 10
        });

        // 글자 크기 : 10, 진하게, 글자색 : 흰색
        this.styleFormat.font10BC = styleSheet.createFontStyle({
            bold : true,
            size: 10,
            color : 'ffffff'
        });

        // 제목 스타일
        this.styleFormat.title = styleSheet.createFormat({
            font : {
                size : 26
            },
            alignment : {
                horizontal : 'left',
                vertical : 'center'
            }
        });

        // 부제목 스타일
        this.styleFormat.subTitle = styleSheet.createFormat({
            font : {
                size : 16,
                color : '0070c0'
            }
        });

        // 차트, 그리드 제목 스타일
        this.styleFormat.thirdTitle = styleSheet.createFormat({
            font: {
                size: 12
            }
        });

        // 본문
        this.styleFormat.mainText = styleSheet.createFormat({
            font: {
                size: 11
            }
        });

        // 검색조건 column title 스타일
        this.styleFormat.retrieveColumnTitle =  styleSheet.createFormat({
            alignment : {
                horizontal : 'center',
                vertical : 'center',
                wrapText : true
            }
        });
        this.styleFormat.retrieveColumnTitle.fontId = this.styleFormat.font10BC.id;
        this.styleFormat.retrieveColumnTitle.fillId = this.styleFormat.fill01.id;
        this.styleFormat.retrieveColumnTitle.borderId = this.styleFormat.border.id;

        // 검색조건 column 스타일
        this.styleFormat.retrieveColumns =  styleSheet.createFormat({
            alignment : {
                horizontal : 'left',
                vertical : 'center'
            }
        });
        this.styleFormat.retrieveColumns.fontId = this.styleFormat.font10.id;
        this.styleFormat.retrieveColumns.borderId = this.styleFormat.border.id;

        // 검색조건 row 스타일
        this.styleFormat.retrieveValue =  styleSheet.createFormat({
            alignment : {
                horizontal : 'right',
                vertical : 'center'
            }
        });
        this.styleFormat.retrieveValue.fontId = this.styleFormat.font10.id;
        this.styleFormat.retrieveValue.borderId = this.styleFormat.border.id;

        // 검색조건 row 스타일(정수)
        this.styleFormat.dataInteger =  styleSheet.createFormat({
            alignment : {
                horizontal : 'right',
                vertical : 'center'
            }
        });
        this.styleFormat.dataInteger.fontId = this.styleFormat.font10.id;
        this.styleFormat.dataInteger.borderId = this.styleFormat.border.id;
        this.styleFormat.dataInteger.numFmtId = this.styleFormat.numFmt.id;

        // 검색조건 row 스타일(실수)
        this.styleFormat.dataPoint =  styleSheet.createFormat({
            alignment : {
                horizontal : 'right',
                vertical : 'center'
            }
        });
        this.styleFormat.dataPoint.fontId = this.styleFormat.font10.id;
        this.styleFormat.dataPoint.borderId = this.styleFormat.border.id;
        this.styleFormat.dataPoint.numFmtId = this.styleFormat.numFmtPoint.id;

        // 검색조건 row 스타일(가운데 정렬)
        this.styleFormat.alignCenter =  styleSheet.createFormat({
            alignment : {
                horizontal : 'center',
                vertical : 'center',
                wrapText : true
            }
        });
        this.styleFormat.alignCenter.fontId = this.styleFormat.font10.id;
        this.styleFormat.alignCenter.borderId = this.styleFormat.border.id;

        // 검색조건 column 스타일
        this.styleFormat.overrallSummray =  styleSheet.createFormat({
            alignment : {
                horizontal : 'center',
                vertical : 'center',
                wrapText : true
            }
        });
        this.styleFormat.overrallSummray.fontId = this.styleFormat.font10.id;
        this.styleFormat.overrallSummray.borderId = this.styleFormat.border.id;

        this.styleFormat.overallDataInteger =  styleSheet.createFormat({
            font : {
                size: 10,
                color : '0070c0',
                bold : true
            },
            alignment : {
                horizontal : 'right',
                vertical : 'center'
            }
        });
        this.styleFormat.overallDataInteger.borderId = this.styleFormat.border.id;
        this.styleFormat.overallDataInteger.numFmtId = this.styleFormat.numFmt.id;

        this.styleFormat.overallDataPoint =  styleSheet.createFormat({
            font : {
                size: 10,
                color : '0070c0',
                bold : true
            },
            alignment : {
                horizontal : 'right',
                vertical : 'center'
            }
        });
        this.styleFormat.overallDataPoint.borderId = this.styleFormat.border.id;
        this.styleFormat.overallDataPoint.numFmtId = this.styleFormat.numFmtPoint.id;

        this.styleFormat.agentSumamry =  styleSheet.createFormat({
            alignment : {
                horizontal : 'center',
                vertical : 'center',
                wrapText : true
            }
        });
        this.styleFormat.agentSumamry.fontId = this.styleFormat.font10.id;
        this.styleFormat.agentSumamry.borderId = this.styleFormat.border.id;

        // 시간 조건
        this.styleFormat.dateTimeColumns =  styleSheet.createFormat({
            alignment : {
                horizontal : 'center',
                vertical : 'center'
            }
        });
        this.styleFormat.dateTimeColumns.fontId = this.styleFormat.font10.id;
        this.styleFormat.dateTimeColumns.borderId = this.styleFormat.border.id;

    }

});
