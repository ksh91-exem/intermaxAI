Ext.define("Exem.FormOnCondition", {
    extend: 'Exem.Form',

    config: {
        fromDateField: null,
        toDateField: null
    },

    // properties
    conditionHeight: 60,
    conditionArea: null,
    workArea: null,
    retrieveButton: null,
    cls : 'list-condition Exem-FormOnCondition',

    DisplayTime   :  DisplayTimeMode.HMS,
    defaultTimeGap : null,                     // 1시간 단위
    rangeOneDay   : true,
    singleField   : false,

    isDiff        : false,                     // Daily DatePicker 일자 경고메시지 10일로 변경하기 위해 추가 - HK
    multiSelect   : false,                     // Instance Name을 Single or Multi로 하는 옵션 추가. jc.won
    selectType    : 'DB',                       // ComboBox의 타입을 변경하기 위해서 추가. jc.won
    addSelectAllItem : false,

    constructor: function() {
        this.callParent(arguments);
        var self = this;

        /**
         * Condition Area
         */
        self.conditionArea = Ext.create("Ext.container.Container", {
            xtype: 'container',
            itemId: 'containerArea',
            flex: 1,
            height: '100%',
            border: false,
            layout: 'absolute',
            style: {
                background: '#ffffff',
                padding: "5px 5px"
            }
        });

        // Calendar
        self.datePicker = Ext.create('Exem.DatePicker',{
            x: 25,
            y: 5,
            executeSQL: self.executeSQL,
            executeScope: self,
            //<0------ DatePicker Type 관련
            DisplayTime: self.DisplayTime,
            rangeOneDay: self.rangeOneDay,
            singleField: self.singleField,
            isDiff     : self.isDiff,
            defaultTimeGap : self.defaultTimeGap
        });

        self.conditionArea.add(self.datePicker);



        // Retrieve Button Area
        self.conditionRetrieveArea = Ext.create("Ext.container.Container", {
            xtype: 'container',
            layout: 'absolute',
            width: 100,
            height: '100%',
            border: false,
            items: Ext.create("Ext.button.Button", {
                text: common.Util.TR('Retrieve'),
                x: 0,
                y: '20%',
                width: 90,
                height: 35,
                cls: 'retrieve-btn',
                handler: function() {
                    self.retrieve(self);
                }
            })
        });

        var conditionBackground = Ext.create("Ext.container.Container", {
            layout: 'hbox',
            height: self.conditionHeight,
            width: '100%',
            style: {
                margin: '0px 0px 2px 0px',
                background: '#ffffff' ,
                borderRadius: '6px'
            }
        });

        conditionBackground.add([self.conditionArea, self.conditionRetrieveArea]);
        self.add(conditionBackground);
    },

    setWorkAreaLayout: function(atype) {
        var self = this;

        self.workArea = Ext.create("Ext.container.Container", {
            width: '100%',
            flex: 1,
            layout: atype,
            border: false,
            cls  : 'Exem-Form-workArea',
            style: {
                borderRadius: '6px'
            }
        });
        //self.add(self.workArea);
        self.add({ xtype: 'container', height : 10,  style: 'background : #e9e9e9' }, self.workArea);

        self.workArea.loadingMask = Ext.create('Exem.LoadingMask', {
            target: self.workArea,
            type: 'large-whirlpool'
        });
    },

    retrieve: function(scope) {
        var self = this;

        if (typeof scope != 'undefined')
            self = scope;

        var result = self.datePicker.checkValid() && self.checkValid();
        if (result) {
            self.executeSQL();
            self.setTitleWithTimeRange();
        }
        else {
            console.warn('Failed validation - ', self.title);
            if (typeof result == 'string')
                console.warn('message :', result);

        }
    },

    checkValid: function() {
        return true;
    },

    executeSQL: function() {
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
}
    ////////////////

    /**
     * 아래 콤보박스 부분은 향후 조건절이 필요없는 화면에서 콤보박스를 사용할
     * 경우가 있으면 Exem.Form으로 옮겨야 한다. 현재 인터맥스 PA에서 조건절이
     * 없는 화면에서 WAS ComboBox를 사용하는 일은 없다.
     * Process Monitor 같은 경우에 Auto Refresh 기능이 있긴 하지만, 특정 WAS
     * 를 선택하여 조회하는 것은 아니다.
     * (epikxm)
     */
    /*
     createCombo: function(label, store) {
     return Ext.create('Exem.ComboBox', {
     fieldLabel: label,
     store: store
     });
     },
     */
    // 주의!
    // 여러 컴포넌트에서 공유하는 스토어라면 콤보박스 생성할 때마다 all이 추가됨.
    // TO DO : 스토어 자체를 Deep Copy 하여 인스턴스화하면 공유 문제를 해결할 수 있긴함...
    //    createComboWithAll: function(label, store) {
    //        store.insert(0, {'1' : '(All)', '2' : '(All)'});
    //        return this.createCombo(label, store);
    //    },
    /*
     createWasCombo: function() {
     return this.createCombo('WAS', Comm.wasStore);
     },

     createWasComboWithAll: function() {
     return this.createCombo('WAS', Comm.wasStoreWithAll);
     }
     */
});
