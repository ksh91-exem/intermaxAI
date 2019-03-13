/**
 * Created by min on 14. 5. 9.
 * 4와 다른 로직으로 진행.
 */
Ext.define("view.PerformanceTrendStatChangeWindow", {
    extend: 'Exem.XMWindow',
    title : common.Util.TR('Stat Change'),
    width : 415,
    height: 545,
    constrain: true,
    layout: 'fit',
    cls   : 'Exem-Form-workArea' ,
    stat_data :{
        Stat : [],
        DB   : [],
        Wait : [],
        GC   : [],
        Pool : []
    } ,
    useTab: {
        stat   : true ,
        db     : true ,
        wait   : true ,
        gc     : true ,
        pool   : true
    },
    useCheckBox: true,
    closeAction: 'hide',
    instanceId : null,
    was_id     : null,
    okFn       : null,
    bodyStyle: {
        background: '#ffffff',
        borderBottomRightRadius: '0px !important',
        borderBottomLeftRadius: '0px !important'
    },

    init: function() {
        var self = this;
        self.initLayout();
    },

    initLayout: function() {
        var self = this;

        var baseWrapCon = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            padding: 10,
            layout : 'vbox',
            style : {
                background: '#ffffff'
            }
        });


        self.statTab = Ext.create('view.PerformanceTrendStatChange',{
            instanceId: self.instanceId,
            was_id    : self.was_id,
            stat_data : self.stat_data ,
            useTab    : {
                stat   : self.useTab.stat,
                db     : self.useTab.db,
                wait   : self.useTab.wait,
                gc     : self.useTab.gc,
                pool   : self.useTab.pool
            },
            useCheckBox: self.useCheckBox
        });

        var okBtn = Ext.create('Ext.container.Container',{
            html   : common.Util.TR('OK'),
            height : 25,
            width  : 55,
            margin : '0 5 0 0',
            cls    : 'stat_change_b',
            style  : {
                //color: '#717171'
            },
//            style  : 'line-height: 23px',
            listeners: {
                render: function() {
                    this.getEl().on('click', function() {
                        if (self.okFn != null) {
                            if (self.isAleadySelected()) {
                                //pool인경우
                                //if ( self.statTab.getActiveTab()._type == 4 ){
                                self.okFn(self.statTab.getActiveTab()._type, self.getChangeName(), self.getChangeId(), self );
                                //}else{
                                //    self.okFn(self.statTab.getActiveTab()._type, self.getChangeName(), null );
                                //}

                                self.close() ;
                            }
                        }
                    });
                }
            }
        });

        var cancelBtn = Ext.create('Ext.container.Container',{
            html   : common.Util.TR('Cancel'),
            height : 25,
            width  : 55,
            margin : '0 5 0 0',
            cls    : 'stat_change_b',
            listeners: {
                render: function() {
                    this.getEl().on('click', function() {
                        self.close();
                    });
                }
            }
        });

        var bottomArea = Ext.create('Exem.Container', {
            width : '100%',
            margin: '10 0 0 0',
            height: 25,
            layout: {
                type : 'hbox',
                align: 'middle',
                pack: 'center'
            },
            style : 'background: #ffffff',
            items : [ okBtn,{ xtype:'tbspacer', width: 3 }, cancelBtn ]
        });

        baseWrapCon.add( self.statTab, bottomArea);
        self.add(baseWrapCon);
        self.statTab.init();

    },

    selectValue: function(type, statName) {
        var self  = this;
        self.show();

        self.statTab.setActiveTab(type);
        var grid   = self.statTab.getTargetGrid(type);
        var store  = grid.getStore();
        var row = store.findRecord('name',statName);

        if ( row == null ) {
            self.statTab.selectCheck.value = '' ;
            return ;
        }

        grid.getView().focusRow(row) ;
        grid.getSelectionModel().select(row);
        self.statTab.selectCheck.value = statName;
    },

    isAleadySelected: function() {
        var self = this;


        var grid   = self.statTab.getTargetGrid(self.statTab.getActiveTab()._type);

        if ( grid.getSelectionModel().getSelection()[0] == undefined ){
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Please select Stat.'), Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});
            return false;
        } ;

        var newValue = grid.getSelectionModel().getSelection()[0].data.name;
        var oldValue = self.statTab.selectCheck.value;

        if(newValue == oldValue) {
            common.Util.showMessage(common.Util.TR('Warning'), common.Util.TR('Already selected indicators'), Ext.Msg.OK, Ext.MessageBox.ERROR, function(){});
            return false;
        } else {
            return true;
        }
    },

    getChangeName: function() {
        var self = this;
        var grid   = self.statTab.getTargetGrid(self.statTab.getActiveTab()._type);
        var newValue = grid.getSelectionModel().getSelection()[0].data.name;
        return newValue;
    },


    getChangeId: function() {
        var self = this;
        var grid   = self.statTab.getTargetGrid(self.statTab.getActiveTab()._type);
        var newValue = grid.getSelectionModel().getSelection()[0].data._id;
        return newValue;
    },

    addWASData: function(data) {
        var self = this;
        self.statTab.addWASData(data);
    },
    addGCData: function(data) {
        var self = this;
        self.statTab.addGCData(data);
    },


    addDBList: function(data){
        this.statTab.addDBList(data) ;
    },


    addWaitList: function(data){
        this.statTab.addWaitList(data) ;
    },

    addPoolList: function(data){
        this.statTab.addPoolList(data) ;
    },

    setUseTab: function(type){
        var self = this;

        switch (type){
            case TrendStatChange.stat:
                self.statTab.useTab.stat = true;
                self.statTab.useTab.db = false;
                self.statTab.useTab.wait = false;
                self.statTab.useTab.gc = false;
                self.statTab.useTab.pool = false;
                break;
            case TrendStatChange.gc:
                self.statTab.useTab.stat = false;
                self.statTab.useTab.db = false;
                self.statTab.useTab.wait = false;
                self.statTab.useTab.gc = true;
                self.statTab.useTab.pool = false;
                break;
            default:
                break;
        }

        self.statTab.setTabDisplay();
    }

});