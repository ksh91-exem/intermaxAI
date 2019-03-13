/**
 * Created by jykim on 2015-10-21.
 */
Ext.define("view.Report", {
    extend: 'Exem.Form',
    style : {
        background: '#cccccc'
    },
    initProperty: function() {
        var ix, typeKeys, reportKeys;

        this.monitorType = window.rtmMonitorType;
        this.TYPE = {
            AGENT : {
                DEFAULT_DAILY   : 0,
                DEFAULT_WEEKLY  : 1,
                DEFAULT_MONTHLY : 2,
                COMPARE_MONTHLY : 3
            },
            TRANSACTION : {
                DEFAULT_DAILY   : 0,
                DEFAULT_WEEKLY  : 1,
                DEFAULT_MONTHLY : 2
            }
        };

        this.btnNameList = {
            AGENT : [
                common.Util.TR('Agent Daily Report'),
                common.Util.TR('Agent Weekly Report'),
                common.Util.TR('Agent Monthly Report'),
                common.Util.TR('Agent Comparison Monthly Report')
            ],
            TRANSACTION : [
                common.Util.TR('Daily Report (Transaction)'),
                common.Util.TR('Weekly Report (Transaction)'),
                common.Util.TR('Monthly Report (Transaction)')
            ]
        };

        this.viewTitleList = {
            AGENT : [
                common.Util.TR('Agent Daily Report'),
                common.Util.TR('Agent Weekly Report'),
                common.Util.TR('Agent Monthly Report'),
                common.Util.TR('Agent Comparison Monthly Report')
            ],
            TRANSACTION : [
                common.Util.TR('Daily Report (Transaction)'),
                common.Util.TR('Weekly Report (Transaction)'),
                common.Util.TR('Monthly Report (Transaction)')
            ]
        };

        this.cssCls = {
            AGENT : [
                'report-agent-daily-single',
                'report-agent-weekly-single',
                'report-agent-monthly-single',
                'report-agent-monthly-comparison'
            ],
            TRANSACTION : [
                'report-transaction-daily-single',
                'report-transaction-weekly-single',
                'report-transaction-monthly-single'
            ]
        };

        this.viewObject = {
            AGENT : [
                'view.ReportAgentDaily',
                'view.ReportAgentWeekly',
                'view.ReportAgentMonthly',
                'view.ReportAgentCompMonthly'
            ],
            TRANSACTION : [
                'view.ReportAgentDaily',
                'view.ReportAgentWeekly',
                'view.ReportAgentMonthly'
            ]
        };

        this.agentReportInfo = [];
        this.txnReportInfo = [];

        //AGENT TYPE INFO
        for(ix=0, typeKeys=Object.keys(this.TYPE.AGENT); ix<typeKeys.length; ix++) {
            this.agentReportInfo[ix] = {};
            this.agentReportInfo[ix].btnText     = this.btnNameList.AGENT[ix];
            this.agentReportInfo[ix].title       = this.viewTitleList.AGENT[ix];
            this.agentReportInfo[ix].cssCls      = this.cssCls.AGENT[ix];
            this.agentReportInfo[ix].viewObject  = this.viewObject.AGENT[ix];
        }

        for(ix=0, typeKeys=Object.keys(this.TYPE.TRANSACTION); ix<typeKeys.length; ix++) {
            this.txnReportInfo[ix] = {};
            this.txnReportInfo[ix].btnText     = this.btnNameList.TRANSACTION[ix];
            this.txnReportInfo[ix].title       = this.viewTitleList.TRANSACTION[ix];
            this.txnReportInfo[ix].cssCls      = this.cssCls.TRANSACTION[ix];
            this.txnReportInfo[ix].viewObject  = this.viewObject.TRANSACTION[ix];
        }

        this.reportPageIndex = 0;

        typeKeys = null;
        reportKeys = null;
    },

    init: function() {
        var ix, typeKeys;

        this.initProperty();

        this.background = Ext.create('Exem.Panel',{
            width :'100%',
            height: '100%',
            flex  : 1,
            border: true,
            autoScroll: true,
            padding: '10 20 20 20',
            bodyStyle: {
                'border-radius': '5px',
                'border': '1px solid #C6C6C6'
            },
            layout: 'card'
        });

        // 첫번째
        this.selectPage = Ext.create('Exem.Container',{
            width  : '100%',
            height : '100%',
            layout : 'vbox',
            padding: '20 30 30 30',
            cls    : 'report-main-body'
        });

        this.labelArea = Ext.create('Exem.Container',{
            width  : '100%',
            height : 40,
            layout : {
                type  : 'hbox',
                align : 'bottom'
            }
        });

        this.templateLabel = Ext.create('Ext.form.Label',{
            text  : common.Util.TR('Report Template'),
            height: 40,
            style : {
                'line-height': '40px',
                'text-indent': '30px',
                'font-size'  : '25px'
            }
        });

        this.templateDescLabel = Ext.create('Ext.form.Label',{
            text  : '|   ' + common.Util.TR('Please select report template type.'),
            height: 30,
            style : {
                'line-height': '30px',
                'text-indent': '6px',
                'font-size'  : '15px',
                'color'      : '#c8c8c8'
            }
        });

        this.labelArea.add(this.templateLabel, this.templateDescLabel);



        // Total Report Area
        var totalReportArea = Ext.create('Exem.Container', {
            width  : '100%',
            height : '100%',
            flex   : 1,
            layout : {
                type : 'table',
                columns : 4 // side header 1 , default report 3, compare report 1
            },
            cls    : 'report-body-total',
            style  : 'padding: 10px 0 0 35px; overflow : auto;'
        });

        this.selectPage.add(this.labelArea, totalReportArea);
        this.background.add(this.selectPage);

        var agentReportLabel = Ext.create('Exem.Container', {
            colspan : 4,
            width   : 800,
            height  : '100%',
            html    : '<span class="report-label-align">&nbsp;&nbsp;</span><span class="report-label-title">' + common.Util.TR('Agent') + '</span>',
            cls     : 'report-type-label'
        });

        totalReportArea.add(agentReportLabel);

        // INSTANCE REPORT LIST LOOP
        if(this.monitorType == 'TP') { // 임시
            this.reportPageIndex++;
            this.createPageArea(this.TYPE.AGENT.DEFAULT_DAILY, this.agentReportInfo);
            this.createClickCon(totalReportArea, this.TYPE.AGENT.DEFAULT_DAILY, true, this.agentReportInfo);
        }
        else {
            for(ix=0, typeKeys=Object.keys(this.TYPE.AGENT); ix<typeKeys.length; ix++) {
                this.reportPageIndex++;
                this.createPageArea(this.TYPE.AGENT[typeKeys[ix]], this.agentReportInfo);
                this.createClickCon(totalReportArea, this.TYPE.AGENT[typeKeys[ix]], true, this.agentReportInfo);
            }
        }

        var splitLine = Ext.create('Exem.Container', {
            colspan : 4,
            width  : 785,
            height : 25,
            cls    : 'report-split-line'
        });

        //totalReportArea.add(splitLine);

        var transactionReportLabel = Ext.create('Exem.Container', {
            colspan : 4,
            width   : 800,
            height  : '100%',
            html    : '<span class="report-label-align">&nbsp;&nbsp;</span><span class="report-label-title">Transaction</span>',
            cls     : 'report-type-label'
        });

        //totalReportArea.add(transactionReportLabel);


        // TRANSACTION REPORT LIST LOOP
        //
        //for(ix=0, typeKeys=Object.keys(this.TYPE.TRANSACTION); ix<typeKeys.length; ix++) {
        //    this.reportPageIndex++;
        //    this.createPageArea(this.TYPE.TRANSACTION[typeKeys[ix]], this.txnReportInfo);
        //    this.createClickCon(totalReportArea, this.TYPE.TRANSACTION[typeKeys[ix]], true, this.txnReportInfo);
        //}



        this.add( this.background );
    },

    createClickCon: function(target, index, visible, typeInfo) {
        var con      = null;
        var label    = null;

        var textHeight = '28px';
        var labelWidth =  '80%';

        con = Ext.create('Exem.Container',{
            width  : 185,
            height : 370,
            margin : '10 0 0 0',
            padding: '280 0 0 0',
            hidden : !visible,
            layout : {
                type : 'vbox',
                align: 'start'
            },
            border: true,
            _index: this.reportPageIndex,
            cls   : typeInfo[index].cssCls,
            listeners: {
                afterrender: function(_this) {
                    _this.el.on('click',function() {
                        this.movePage(_this._index);
                    }.bind(this));

                    _this.el.on('mouseenter',function() {
                        _this.items.items[0].el.dom.style.color = '#00baff';
                    }.bind(this));

                    _this.el.on('mouseleave',function() {
                        _this.items.items[0].el.dom.style.color = '#848484';
                    }.bind(this));


                }.bind(this)
            }
        });

        // title
        label = Ext.create('Ext.form.Label',{
            text: typeInfo[index].btnText,
            height: 60,
            margin: '0 0 0 20',
            width : labelWidth,
            style: {
                'line-height': textHeight,
                'cursor'     : 'pointer',
                'color': '#848484',
                'font-size'  : '18px',
                'text-align' : 'left',
                'margin-top' : '50px' ,
                'font-style': 'italic'
            }
        });

        con.add(label);

        target.add(con);

        con      = null;
        label    = null;
    },


    movePage: function(index) {
        var layout = this.background.getLayout();
        layout.setActiveItem(index);
    },

    createPageArea: function(reportType, typeInfo) {

        var pageBG = Ext.create('Ext.container.Container',{
            width  : '100%',
            height : '100%',
            layout : 'vbox',
            padding: '20 20 0 20'
        });

        var labelCon = Ext.create('Ext.container.Container',{
            width  : '100%',
            height : 40,
            layout : 'hbox',
            padding: '10 20 0 30'
        });

        var mainLabel = Ext.create('Ext.form.Label',{
            text  : common.Util.TR('Report Template'),
            cls : 'view_report_mainLabel',
            listeners: {
                afterrender: function(_this) {
                    // 라벨 클릭시 맨 처음 page로 이동
                    _this.el.on('click',function() {
                        this.movePage(0);
                    }.bind(this));
                }.bind(this)
            }
        });

        var separateLabel = Ext.create('Ext.form.Label',{
            text  : '>',
            cls : 'view_report_separateLabel'
        });

        var label = Ext.create('Ext.form.Label',{
            text  : common.Util.TR(typeInfo[reportType].title),
            cls : 'view_report_label'
        });

        labelCon.add(mainLabel, separateLabel, label);

        var underLine = Ext.create('Ext.container.Container', {
            width: '100%',
            height: 15,
            cls: 'report-gradient-line',
            margin: '5 20 0 25'
        });

        var viewName = typeInfo[reportType].viewObject;

        if(viewName){
            var view = Ext.create(viewName,{
                mainPageInfo : this.background,
                monitorType : this.monitorType
            });
            view.init();

            pageBG.add(labelCon, underLine, view);

            this.background.add(pageBG);
        }
    }

});