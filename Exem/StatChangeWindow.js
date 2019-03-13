/**
 * Created by JONGHO on 14. 4. 11.
 */
Ext.define("Exem.StatChangeWindow", {
    extend: 'Exem.XMWindow',
    title : common.Util.TR('Stat Change'),
    width : 415,
    height: 545,
    constrain: true,
    layout: 'fit',
    cls   : 'Exem-Form-workArea' ,
    useTab: {
        stat   : true,
        wait   : true,
        ratio  : true,
        osstat : true
    },
    useCheckBox: true,
    closeAction: 'hide',
    instanceId : null,
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
            flex  : 1,
            //height: '100%',
            padding: 10,
            layout : 'vbox',
            cls    : 'statchange-base-container',
            style : {
                background: '#ffffff'
            }
        });


        self.statTab = Ext.create('Exem.StatChange',{
            instanceId: self.instanceId,
            useTab    : {
                osstat:  self.useTab.osstat,
                stat   : self.useTab.stat,
                wait   : self.useTab.wait,
                ratio  : self.useTab.ratio
            },
            useCheckBox: self.useCheckBox
        });


        var okBtn = Ext.create('Ext.container.Container',{
            html   : common.Util.TR('OK'),
            height : 25,
            width  : 55,
            margin : '0 5 0 0',
            cls    : 'stat_change_b',
            listeners: {
                render: function() {
                    this.getEl().on('click', function() {
                        if (self.okFn != null && self.isAleadySelected()) {
                            self.okFn(self.statTab.getActiveTab()._type, self.getChangeName());
                            self.close() ;
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
            cls   : 'statchange-bottom-area',
            items : [ okBtn,{ xtype:'tbspacer', width: 3 }, cancelBtn ]
        });

        baseWrapCon.add( self.statTab, bottomArea);
        self.add(baseWrapCon);
        self.statTab.init();

    },

    selectValue: function(type, statName) {

        this.show();

        this.statTab.setActiveTab(type);
        var grid  = this.statTab.getTargetGrid(type);
        var store = grid.getStore();
        var row   = store.findRecord('name',statName);

        store.remove(row, true);
        store.insert(0, row);

        this.statTab.nowSelection = {
            record: row,
            index: 0,
            type : type
        };

        if ( row == null ) {
            if (this.statTab && this.statTab.selectCheck) {
                this.statTab.selectCheck.value = '';
            }
            return ;
        }

        grid.getView().focusRow(row) ;
        grid.getSelectionModel().select(row);
        this.statTab.selectCheck.value = statName;

    },

    isAleadySelected: function() {
        var self = this;
        var grid   = self.statTab.getTargetGrid(self.statTab.getActiveTab()._type);
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
        var self = this;;
        var grid   = self.statTab.getTargetGrid(self.statTab.getActiveTab()._type);
        var newValue = grid.getSelectionModel().getSelection()[0].data.name;
        return newValue;
    },

    addRatioData: function(data) {
        var self = this;
        self.statTab.addRatioData(data);
    },
    addOSStatData: function(data) {
        var self = this;
        self.statTab.addOSStatData(data);
    }


});
