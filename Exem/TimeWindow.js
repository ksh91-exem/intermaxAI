Ext.define('Exem.TimeWindow', {
    extend: 'Ext.container.Container',
    layout: 'hbox',
    width: 250,
    height: 30,
    border: false,
    boxLabel : null,
    itemId: 'timeWindow',


    valueType: 'timePicker',
    executeScope: null,
    useOnlyHour: false,
    showRetrieveBtn: true,
    useFixedMinute: false,

    constructor: function() {
        this.callParent(arguments);

        if(this.useOnlyHour || this.useFixedMinute){
            this.defaultFromTime = '09';
            this.defaultToTime = '18';
        }else{
            this.defaultFromTime = '09:00';
            this.defaultToTime = '18:00';
        }

        this._initProperty();
        this._createLayer();
    },

    _initProperty: function(){
        if(this.boxLabel == null){
            this.boxLabel = common.Util.TR('Time Window');
        }
    },

    _createLayer: function(){

        this.timeWindowCheck = Ext.create('Exem.Checkbox',{
            itemId : 'timeWindowCheck',
            boxLabel: this.boxLabel,
            margin: '0 10 0 0',
            cls: 'exem-BaseForm-condition',
            listeners: {
                scope: this,
                change: function(me, newValue, oldValue){
                    this.timeWindow.setDisabled(! newValue);

                    if(this.callBack){
                        this.callBack(newValue, oldValue, this.timeWindow, this.parentScope);
                    }
                }
            }
        });

        this.timeWindow = Ext.create('Exem.TimePicker',{
            valueType: 'timePicker',
            itemId: 'timeWindow',
            width: null,
            height: null,
            flex: 1,
            useOnlyHour: this.useOnlyHour,
            useFixedMinute: this.useFixedMinute,
            disabled: true,
            executeScope: this.executeScope,
            showRetrieveBtn: this.showRetrieveBtn
        });

        if(this.useOnlyHour){
            this.timeWindow.fromTimeBg.setWidth(22);
            this.timeWindow.fromTimeField.setWidth(22);

            this.timeWindow.toTimeBg.setWidth(60);
            this.timeWindow.toTimeField.setWidth(22);
        }else{
            this.timeWindow.fromTimeBg.setWidth(45);
            this.timeWindow.fromTimeField.setWidth(45);

            this.timeWindow.toTimeBg.setWidth(70);
            this.timeWindow.toTimeField.setWidth(45);
        }

        this.timeWindow.fromTimeField.setValue(this.defaultFromTime);
        this.timeWindow.toTimeField.setValue(this.defaultToTime);

        this.timeWindow.fromLabel.hide();

        this.add([this.timeWindowCheck , this.timeWindow]);
    },

    /**
     * @note BaseForm 에 맞춘 형식
     * @returns {{isChecked: *, fromTime: *, toTime: *}}
     */
    //getValue: function(){
    //    return {
    //        isChecked: this.timeWindowCheck.getValue(),
    //        fromTime: this.timeWindow.getFromTime(),
    //        toTime: this.timeWindow.getToTime()
    //    };
    //},

    /**
     *
     * @returns {boolean} true | false
     */
    isChecked: function(){
        return this.timeWindowCheck.getValue();
    },

    /**
     *
     * @param hour {integer}
     * @param min {integer}
     */
    setFromTime: function(hour, min){
        this.timeWindow.setFromTime(hour, min);
    },

    /**
     *
     * @returns {string}  ex) '09:00'
     */
    getFromTime: function(){
        return this.timeWindow.getFromTime();
    },

    /**
     *
     * @param hour {integer}
     * @param min {integer}
     */
    setToTime: function(hour, min){
        this.timeWindow.setToTime(hour, min);
    },

    /**
     *
     * @returns {string} ex) '18:00'
     */
    getToTime: function(){
        return this.timeWindow.getToTime();
    },
    /**
     *
     * @param value {boolean} true | false
     */
    setTimeWindowCheck: function(value){
        this.timeWindowCheck.setValue(value);
    }

});