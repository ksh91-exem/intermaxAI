Ext.define("Exem.FormOnCollapseCondition", {
    extend: 'Exem.Form',
    width : '100%',
    height : '100%',
    layout : 'border',
    DisplayTime   :  DisplayTimeMode.HMS,

    config: {
        fromDateField: null,
        toDateField: null
    },

    constructor: function() {
        // constructor 에서 바로 initLayout function을 수행해도 무관하나, 추후 소스의 확장 기능을 위해 함수 분리
            this.callParent(arguments);
    },

    baseInit: function() {
        this.conditionBackground = Ext.create('Ext.panel.Panel', {
            region : 'north',
            height : 320,
            width : '100%',
            collapsible: true,
            collapsed  : false,
            collapseMode:'header',
            split  : true,
            layout : 'hbox',
            header : true,
            hideCollapseTool: true,
            headerPosition : 'bottom',
            animCollapse: false,
            floatable: false,
            cls : 'form-collapse-condition',
            style: 'background : #FFF; border : 5px 2px 2px 2px solid #AAA;',
            listeners: {
                afterrender : function(me) {
                    me.header.hide();
                },
                expand : function(me) {
                    me.header.hide();
                }
            }
        });

        this.workBackground = Ext.create('Exem.Container', {
            width : '100%',
            height: '100%',
            region : 'center',
            cls : 'form-collapse-workbody',
            style: 'overflow-x:hidden; overflow-y:auto; margin: 0 0 10px 0;'

        });

        this.add(this.conditionBackground, this.workBackground);
    },

    retrieve: function() {
        var self = this;
        self.executeSQL();
    },

    setTitleWithTimeRange: function() {
        if (this.tab) {

            var fromTime = this.datePicker.getFromDateTime();
            var toTime = this.datePicker.getToDateTime();

            if(fromTime.length == 13){
                fromTime += ':00';
            }else if(fromTime.length == 10){
                fromTime += ' 00:00';
            }

            if(toTime.length == 13){
                toTime += ':00';
            }else if(toTime.length == 10){
                toTime += ' 00:00';
            }

            common.DataModule.timeInfo.lastFromTime = fromTime;
            common.DataModule.timeInfo.lastToTime   = toTime;


            var findComponent = this.conditionArea.getComponent('wasCombo');

            if (findComponent == 'undefined' || findComponent == null) {
                findComponent = this.conditionArea.getComponent('dbCombo');
            }


            if (findComponent == 'undefined' || findComponent == null) {
                this.tab.setText(this.title + '<div>[' +
                    Ext.util.Format.date(fromTime, 'H:i~') +
                    Ext.util.Format.date(toTime, 'H:i]</div>')) ;
            } else {
                var InstanceName = findComponent.WASDBCombobox.getRawValue() + ' : ';

                if (InstanceName.length > 25)
                    InstanceName = InstanceName.substr(0, 20) + '... : ';

                if ( this.isDaily === true ) {
                    this.tab.setText(this.title + '<div>[' + InstanceName +
                        Ext.util.Format.date(fromTime, 'm-d~') +
                        Ext.util.Format.date(toTime, 'm-d]</div>'));

                } else if (this.DisplayTime == DisplayTimeMode.None || this.singleField === true) {
                    this.tab.setText(this.title + '<div>[' + InstanceName + Ext.util.Format.date(fromTime, 'Y-m-d]</div>'));
                } else {
                    this.tab.setText(this.title + '<div>[' + InstanceName +
                        Ext.util.Format.date(fromTime, 'H:i~') +
                        Ext.util.Format.date(toTime, 'H:i]</div>'));
                }
            }
            window.tabPanel.setRightScrollPosition();
        }
    },

    checkValid: function() {
        return true;
    },

    executeSQL: function() {
    }
});
