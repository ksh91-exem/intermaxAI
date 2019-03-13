Ext.define('view.TxnRankingAnalysis', {
    extend: 'Exem.Form',
    minWidth: 1080,
    width: '100%',
    height: '100%',
    title: '',
    cls : 'list-condition Exem-FormOnCondition',

    init: function() {
        this.initLayout();
    },

    initLayout: function() {
        var self = this;

        // Single View, Multi View Tab
        this.conditionTab = Ext.create('Exem.TabPanel', {
            width: '100%',
            height: '100%',
            flex: 1,
            layout: 'fit',
            listeners : {
                tabchange : function(me) {
                    var tabItem = null;

                    if(!me.getActiveTab().loadTab) {
                        tabItem = me.getActiveTab().items.items[0];
                        me.getActiveTab().loadTab = true;
                        tabItem.baseSetting();
                    }
                }
            }
        });

        this.tabSingle = Ext.create('Exem.Container', {
            title : '1:N',
            name : 'single',
            width : '100%',
            height: '100%',
            border : 0,
            layout : 'fit',
            cls : 'rank-analysis-view',
            loadTab : false,
            items : Ext.create('view.RankingAnalysisSingle', {
                        width : '100%',
                        height : '100%',
                        analysisMode : 'TXN',
                        extCondition : self.txnExtendCondition
                    })
        });

        this.tabMulti = Ext.create('Exem.Container', {
            title : 'N:M',
            name : 'multi',
            width : '100%',
            height: '100%',
            border : 0,
            layout : 'fit',
            cls : 'rank-analysis-view',
            loadTab : false,
            items : Ext.create('view.RankingAnalysisMulti', {
                        width : '100%',
                        height : '100%',
                        analysisMode : 'TXN',
                        extCondition : self.txnExtendCondition
                    })
        });

        this.conditionTab.add(this.tabSingle);
        this.conditionTab.add(this.tabMulti);


        this.add(this.conditionTab);
        this.conditionTab.setActiveTab(0);
    },

    txnExtendCondition: function(tabItem) {

        /****
         * 기존 레이아웃과 독립적으로 위치를 강제로 지정하기 위해
         * class 추가 및 css에 important 레벨로 top, left 지정
         ****/

        tabItem.txnNameField = Ext.create('Exem.TextField', {
            itemId: 'txnNameField',
            fieldLabel: common.Util.CTR('Transaction Name'),
            labelWidth: 120,
            width: 450,
            value: '%',
            maxLength: 300,
            cls : 'ranking-ext-condition-txnnamefield'
        });

        tabItem.avgElapseRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel: common.Util.TR('AVG'),
            itemId: 'avgElapseRdo',
            width: 70,
            name: tabItem.id + 'elapseRdo',
            checked: true,
            cls : 'ranking-ext-condition-avgelapserdo',
            listeners: {
                change: function (me, newValue) {
                    var currRdo = me.itemId;
                    if (newValue) {
                        if (currRdo == 'avgElapseRdo') {
                            tabItem.elapseBase = 'avg';
                        }
                        else {
                            tabItem.elapseBase = 'max';
                        }
                    }
                }
            }
        });

        tabItem.maxElapseRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel: common.Util.TR('MAX'),
            itemId: 'maxElapseRdo',
            width: 70,
            name: tabItem.id + 'elapseRdo',
            checked: false,
            cls : 'ranking-ext-condition-maxelapserdo',
            listeners: {
                change: function (me, newValue) {
                    var currRdo = me.itemId;
                    if (newValue) {
                        if (currRdo == 'avgElapseRdo') {
                            tabItem.elapseBase = 'avg';
                        }
                        else {
                            tabItem.elapseBase = 'max';
                        }
                    }
                }
            }
        });

        tabItem.elapseField = Ext.create('Exem.NumberField', {
            fieldLabel: common.Util.CTR('Elapse Time >= '),
            labelWidth: 81,
            value: 0,
            width: 137,
            maxLength: 9,
            step: 0.1,
            decimalPrecision: 3,
            allowExponential: false,
            cls : 'ranking-ext-condition-elapsefield'
        });

        tabItem.elapseBase = 'avg';  // init value
        tabItem.conditionBackground.add(tabItem.txnNameField, tabItem.avgElapseRadio, tabItem.maxElapseRadio, tabItem.elapseField);
    }
});







