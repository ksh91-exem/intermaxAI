Ext.define('view.SqlRankingAnalysis', {
    extend: 'Exem.Form',
    minWidth: 1080,
    width: '100%',
    height: '100%',
    title: '',
    cls : 'list-condition Exem-FormOnCondition',
    listeners: {

    },

    init: function() {
        this.initLayout();
    },

    initLayout: function() {
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
                        analysisMode : 'SQL'
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
                        analysisMode : 'SQL'
                    })
        });

        this.conditionTab.add(this.tabSingle);
        this.conditionTab.add(this.tabMulti);


        this.add(this.conditionTab);
        this.conditionTab.setActiveTab(0);

    }
});







