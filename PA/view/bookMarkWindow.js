/**
 * Created by JONGHO on 14. 5. 30.
 */
Ext.define('view.bookMarkWindow',{
    extend: 'Exem.XMWindow',
    title : common.Util.TR('Quick Launch'),
    width : 700,
    height: 500,
    maximizable: false,
    modal: true,
    layout: 'fit',
    bodyStyle: {
        'z-index': 600000,
        background: '#FFFFFF'
    },
    listeners: {
        show: function(_this) {
            // 수정 2015-01-06   JH
            var lastInstance;
            // 1501.23 min 재수정.
            if (!this.activeTab.conditionArea) {
                return;
            }
            var combo = this.activeTab.conditionArea.getComponent('wasCombo');

            // 콤보가 없는 뷰가 있어서 없으면 0번 select
            if(combo) {
                lastInstance =   _this.activeTab.conditionArea.getComponent('wasCombo').getValue();
                // 멀티인 경우
                if(lastInstance.split(',').length > 1 || lastInstance === '(All)') {
                    _this.wasCombo.selectByIndex(0);
                } else {
                    // 멀티가 아닌 경우
                    _this.wasCombo.selectByValue(lastInstance);
                }
            } else {
                // 해당 뷰에 was combo가 없으면 그냥 0번 select
                _this.wasCombo.selectByIndex(0);
            }
        },

        close: {
            fn: function() {
                Comm.quickLauncher = false;
            }
        }
    },
    init  : function() {
        this.initEnvir();
        this.initLayout();
    },
    initEnvir: function(){
        this.imageList = {
            performancetrend   : '../images/thumbnail/performanceTrend.JPG',
            transactiontrend   : '../images/thumbnail/transactionTrend.JPG',
            topsql             : '../images/thumbnail/topSql.JPG',
            toptransaction     : '../images/thumbnail/topTransAcrtion.JPG',
            exceptionhistory   : '../images/thumbnail/exceptionHistory.JPG'
        };

        this.viewTitle = {
            performancetrend    : common.Util.TR('Performance Trend'),
            transactiontrend    : common.Util.TR('Transaction Trend'),
            topsql              : common.Util.TR('TOP SQL Summary'),
            toptransaction      : common.Util.TR('TOP Transaction Summary'),
            exceptionhistory    : common.Util.TR('Exception Summary')
        };

        var viewport = Ext.getCmp('viewPort');
        this.activeTab = viewport.getComponent('mainTab').getActiveTab();
    },


    initLayout: function(){
        var self = this;
        //  원래 보이는 thumbnail view
        self.backGroundFrame1 = Ext.create('Exem.Container',{
            width  : '100%',
            height : '100%',
            layout : 'vbox'
        });
        self.add(self.backGroundFrame1 );

        self.topArea = Ext.create('Ext.container.Container',{
            width : '100%',
            height: 40,
            margin: '5 0 0 0',
            border: 1,
            layout: {
                type: 'vbox',
                align: 'center'
            }
        });

        self.dateArea = Ext.create('Ext.container.Container',{
            width: '100%',
            height: 40,
            layout: {
                type:'hbox',
                align: 'middle',
                pack: 'center'
            }
        });

        self.wasCombo = Ext.create('Exem.wasDBComboBox', {
            fieldLabel      : common.Util.TR('WAS'),
            comboWidth      : 266,
            comboLabelWidth : 90,
            width           : 330,
            itemId          : 'wasCombo',
            addSelectAllItem: false,
            multiSelect     : false,
            selectType      : 'Agent',
            cls             : 'quick_lauch'
        });

        self.datePicker = Ext.create('Exem.DatePicker',{
            DisplayTime   :  DisplayTimeMode.HM,
            width: 400,
            height: 30,
            rangeOneDay   :  true,
            singleField   : false,
            isDaily       : false,
            useRetriveBtn : false,
            showAtTopLeft : true,
            cls : 'quick_lauch'
        });

        self.dateArea.add(self.wasCombo, self.datePicker);
        self.topArea.add(self.dateArea);

        // 상단에 있는 dataPicker, db combo를 set 해주기
        var from  = new Date() - (60 * 60 * 1000);
        var to    = new Date();

        if ( common.DataModule.timeInfo.lastFormType === 'WASWorkload' ){
            self.datePicker.mainFromField.setValue( Ext.util.Format.date( new Date(from), Comm.dateFormat['HM']) );
            self.datePicker.mainToField.setValue( Ext.util.Format.date( new Date(to), Comm.dateFormat['HM']) );
        }else{
            self.datePicker.mainFromField.setValue(Ext.util.Format.date(common.DataModule.timeInfo.lastFromTime, Comm.dateFormat['HM']) || Ext.util.Format.date( new Date(from), Comm.dateFormat['HM']));
            self.datePicker.mainToField.setValue(Ext.util.Format.date(common.DataModule.timeInfo.lastToTime, Comm.dateFormat['HM']) || Ext.util.Format.date( new Date(to), Comm.dateFormat['HM']));
        }

        self.bodyFrame = Ext.create('Ext.container.Container',{
            width  : '100%',
            flex: 1,
            layout : {
                type : 'vbox',
                pack : 'center',
                align: 'center'
            }
        });
        self.backGroundFrame1.add(self.topArea, self.bodyFrame);

        self.bodyContents1 =  Ext.create('Ext.container.Container',{
            width : '92%',
            height: 200,
            layout: {
                type: 'hbox',
                pack: 'center'
            }
        });
        self.bodyContents2 =  Ext.create('Ext.container.Container',{
            width : '80%',
            height: 200,
            layout: {
                type: 'hbox',
                pack: 'center'
            }
        });

        self.bodyFrame.add(self.bodyContents1, self.bodyContents2);
        self.backGroundFrame1.add(self.topArea, self.bodyFrame);

        self.performancetrendFrame    =   self.makeViewThumbNail(this.imageList.performancetrend,    this.viewTitle.performancetrend);
        self.transactiontrendFrame    =   self.makeViewThumbNail(this.imageList.transactiontrend,        this.viewTitle.transactiontrend);
        self.topsqlFrame              =   self.makeViewThumbNail(this.imageList.topsql,    this.viewTitle.topsql);
        self.toptransactionFrame      =   self.makeViewThumbNail(this.imageList.toptransaction,   this.viewTitle.toptransaction);
        self.exceptionhistoryFrame    =   self.makeViewThumbNail(this.imageList.exceptionhistory, this.viewTitle.exceptionhistory);

        self.bodyContents1.add( self.performancetrendFrame,  self.transactiontrendFrame, self.topsqlFrame);
        self.bodyContents2.add( self.toptransactionFrame, self.exceptionhistoryFrame);

        self.performancetrendFrame.addListener('afterrender', function(){
            self.performancetrendFrame.getEl().on('click', function() {
                self.openView(self.viewTitle.performancetrend);
            });
        });

        self.transactiontrendFrame.addListener('afterrender', function(){
            self.transactiontrendFrame.getEl().on('click', function() {
                self.openView(self.viewTitle.transactiontrend);
            });
        });

        self.topsqlFrame.addListener('afterrender', function(){
            self.topsqlFrame.getEl().on('click', function() {
                self.openView(self.viewTitle.topsql);
            });
        });

        self.toptransactionFrame.addListener('afterrender', function(){
            self.toptransactionFrame.getEl().on('click', function() {
                self.openView(self.viewTitle.toptransaction);
            });
        });

        self.exceptionhistoryFrame.addListener('afterrender', function(){
            self.exceptionhistoryFrame.getEl().on('click', function() {
                self.openView(self.viewTitle.exceptionhistory);
            });
        });

        self.show();
    },

    openView: function(viewTitle) {

        switch(viewTitle) {
            case  this.viewTitle.performancetrend:
                this.hide();
                var performanceTrend = common.OpenView.open('PerformanceTrend', {
                    fromTime : this.datePicker.getFromDateTime(),
                    toTime   : this.datePicker.getToDateTime(),
                    wasId   :  this.wasCombo.getValue()
                });

                var execInterval = setInterval(function () {
                    if (performanceTrend.isEndInitLoad) {
                        clearInterval(execInterval);
                        performanceTrend.retrieve();
                    }
                }, 100);

                this.close();
                break;

            case  this.viewTitle.transactiontrend:
                this.hide();
                var transactiontrend = common.OpenView.open('ResponseInspector', {
                    fromTime : this.datePicker.getFromDateTime(),
                    toTime   : this.datePicker.getToDateTime(),
                    wasId    :  this.wasCombo.getValue()
                });

                setTimeout(function (transactiontrend){
                    transactiontrend.retrieve();
                }, 300,transactiontrend);

                this.close();
                break;

            case  this.viewTitle.topsql:
                this.hide();
                var topSql = common.OpenView.open('TopSQL_MIN', {
                    fromTime : this.datePicker.getFromDateTime(),
                    toTime   : this.datePicker.getToDateTime(),
                    wasId    : this.wasCombo.getValue()
                });
                setTimeout(function (topSql){
                    topSql.retrieve();
                }, 300,topSql);
                this.close();
                break;

            case  this.viewTitle.toptransaction:
                this.hide();
                var topTransAction = common.OpenView.open('TOPTransaction', {
                    fromTime : this.datePicker.getFromDateTime(),
                    toTime   : this.datePicker.getToDateTime()
//                    ,wasId   :   this.wasCombo.getValue()
                });

                setTimeout(function (topTransAction){
                    topTransAction.retrieve();
                }, 300,topTransAction);
                this.close();
                break;

            case  this.viewTitle.exceptionhistory:
                this.hide();
                var exceptionhistory = common.OpenView.open('ExceptionHistory', {
                    fromTime : this.datePicker.getFromDateTime(),
                    toTime   : this.datePicker.getToDateTime(),
                    wasId   :   this.wasCombo.getValue()
                });

                setTimeout(function (exceptionhistory){
                    exceptionhistory.retrieve();
                }, 300,exceptionhistory);
                this.close();
                break;

            default:
                break;
        }
        Comm.quickLauncher = false;
    },

    makeViewThumbNail: function(imagesrc, viewName) {

        var viewThumNail=  Ext.create('Ext.container.Container',{
            width : 200,
            height: 180,
            margin: '4 4 4 4',
            layout: 'vbox',
            hidden: false,
            style : {
                border: '1px solid rgb(223, 223, 223)',
                'border-radius': '20px'
            },
            items: [{
                xtype  :'image',
                width  : 200,
                padding: '10 10 10 10',
                height : 160,
                src    : imagesrc
            },{
                xtype: 'container',
                width: '100%',
                height: 20,
                html  : '<div style="text-align: center; font-family: Roboto Condensed;">'+ viewName +'</div>'
            }],
            listeners: {
                render: function(){
                    this.getEl().on('mouseover',function(){
                        this.applyStyles({
                            'box-shadow': 'rgb(201, 201, 201) 0px 0px 4px 4px',
                            'fontWeight': 'bold',
                            'cursor'    : 'pointer'
                        });
                    });
                    this.getEl().on('mouseleave', function(){
                        this.applyStyles({
                            'box-shadow': 'none',
                            'fontWeight': 'normal'
                        });
                    });
                }
            }
        });

        return viewThumNail;
    }
});