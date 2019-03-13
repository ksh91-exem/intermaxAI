Ext.define('rtm.src.rtmSumChartConfig',{
    extend: 'Exem.XMWindow',
    title : common.Util.TR('Chart Configuration'),
    width : 500,
    height: 350,
    minHeight: 320,
    minWidth : 500,
    layout: 'fit',
    modal : true,
    maximizable : false,
    resizable: false,
    border: true,
    style : {
        border : '1px solid #BEBEBE',
        borderRadius : '5px',
        background : '#fff'
    },
    bodyStyle: {
        padding: 0
    },
    chartList : null,
    maxChartCount : 16,

    // 차트 옵션
    txnOption: null,

    trendChart: null,


    /**
     * 기본 프로퍼티 항목 설정
     */
    initProperty: function() {

        this.instanceColor = Comm.RTComm.getSumChartColor() || realtime.Colors[0];

        this.instanceUpdateList = {};

        this.chartList = this.chartList || [];

        this.txnOption = Comm.RTComm.getChartOption(this.trendChart.componentId, true);
    },

    init: function() {

        this.initProperty();

        this.globalLayer = Ext.create('Ext.container.Container',{
            layout: 'vbox',
            flex: 1,
            width: '100%',
            autoScroll: true,
            margin: '10 10 0 10',
            padding: 10,
            cls    : 'instance-area-base'
        });

        this.frameLayer = Ext.create('Ext.container.Container',{
            layout: 'hbox',
            height: 80,
            width: '100%',
            margin: 10,
            padding: 10,
            cls    : 'instance-area-base'
        });

        this.chartOptionContainer = Ext.create('Ext.container.Container',{
            layout: 'vbox',
            autoScroll: true,
            items: [this.globalLayer, this.frameLayer]
        });

        this.add(this.chartOptionContainer);
        this.addCls('rtm-chartconfig-base');

        this.createLayer();

        this.createLineGuideLayout();

        this.createChartLayout();

        this.createBottomLayout();
    },


    createLayer: function() {
        // top area
        var itemContainer = Ext.create('Ext.container.Container',{
            layout: 'hbox',
            width: '100%',
            height: 40,
            padding: 6,
            cls    : 'instance-area-row2'
        });

        itemContainer.add([{
            xtype: 'container',
            width: 140,
            html : ''
        },{
            xtype: 'button',
            flex : 1,
            text : common.Util.TR('Original Color'),
            cls  : 'instance-icon-button',
            listeners:{
                scope: this,
                click: function(){
                    var color = realtime.defaultSumChartColor;
                    var instanceInfo = this.instanceUpdateList.Total;

                    instanceInfo.instanceColor.style.backgroundColor = color;
                    instanceInfo.colorPicker.value = color;
                    instanceInfo.color = color;
                }
            }
        },{
            xtype: 'container',
            width: 120,
            html : ''
        }]);
        this.globalLayer.add(itemContainer);

        var centerArea = Ext.create('Ext.container.Container',{
            layout: 'vbox',
            width: '100%',
            flex : 1,
            autoScroll: true
        });

        this.globalLayer.add(centerArea);

        var instanceName = 'Total';

        var instanceInfo = this.instanceUpdateList[instanceName] = {
            index : 0,
            color : this.instanceColor
        };

        instanceInfo.instanceColor = document.createElement('span');
        instanceInfo.instanceColor.setAttribute('class', 'instance-icon-circle');
        instanceInfo.instanceColor.setAttribute('style', 'position:absolute;left:2px;top:7px;border-radius:50%;box-shadow: rgb(91, 121, 107) 0px 0px 3px;width:10px;height:10px;background-color:'+ instanceInfo.color);

        instanceInfo.colorPicker = document.createElement('input');
        instanceInfo.colorPicker.setAttribute('type' , 'color');
        instanceInfo.colorPicker.setAttribute('class' , 'instance-icon-button');
        instanceInfo.colorPicker.setAttribute('style' , 'width:100%;cursor:pointer;');
        instanceInfo.colorPicker.value = instanceInfo.color;
        instanceInfo.colorPicker.dataset.instancename = instanceName;

        instanceInfo.colorPicker.onchange = function(e){
            var color = e.currentTarget.value;
            var instanceInfo = this.instanceUpdateList[e.currentTarget.dataset.instancename];
            instanceInfo.instanceColor.style.backgroundColor = color;
            instanceInfo.color = color;

            instanceInfo = null;
        }.bind(this);

        itemContainer = Ext.create('Ext.container.Container',{
            layout: 'hbox',
            width: '100%',
            height: 36,
            padding: 6,
            cls    : 'instance-area-row1'
        });

        var instanceLayer = Ext.create('Ext.form.Label',{
            instanceName : instanceName,
            width: 140,
            html : instanceName,
            style : {
                'text-indent': '18px',
                'line-height': '22px'
            },
            listeners: {
                scope: this,
                render: function(me){
                    me.el.dom.setAttribute('data-qtip', me.el.dom.innerHTML);
                    me.el.dom.appendChild(this.instanceUpdateList[me.instanceName].instanceColor);
                }
            }
        });

        var colorLayer = Ext.create('Ext.container.Container',{
            instanceName : instanceName,
            height: 30,
            flex : 1,
            listeners: {
                scope: this,
                render: function(me){
                    me.el.dom.childNodes[0].childNodes[0].appendChild(this.instanceUpdateList[me.instanceName].colorPicker);
                }
            }
        });

        if (!this.txnOption.chartOption[instanceName]) {
            this.txnOption.chartOption[instanceName] = {};
            this.txnOption.chartOption[instanceName].lineWidth = 2;
        }
        var lineWidth = this.txnOption.chartOption[instanceName].lineWidth;

        instanceInfo.lineWidth = Ext.create('Exem.NumberField',{
            cls: 'rtm-list-condition',
            instanceName : instanceName,
            fieldLabel: common.Util.TR('Thickness'),
            labelWidth : 60,
            width: 120,
            maxLength: 1,
            minValue: 1,
            maxValue: 5,
            value   : lineWidth,
            enforceMaxLength: true,
            enableKeyEvents: true,
            allowBlank: false,
            allowDecimals: false,
            allowExponential: false,
            listeners:{
                scope: this,
                // 'e' , '-' '.' 숫자 이외의 값 막기
                keydown: function (me, e) {
                    if (!Ext.isNumeric(me.value)) {
                        e.stopEvent();
                        return;
                    }
                },
                change: function(me, newValue, oldValue){
                    if (!Ext.isNumeric(me.value)) {
                        me.setValue(oldValue);
                    } else {
                        if (me.value < me.minValue) {
                            me.setValue(me.minValue);
                        } else if (me.value > me.maxValue) {
                            me.setValue(me.maxValue);
                        }
                    }
                }
            }
        });

        itemContainer.add([instanceLayer, colorLayer, instanceInfo.lineWidth]);

        centerArea.add(itemContainer);
    },


    createLineGuideLayout: function() {
        this.globalLayer.add({
            xtype : 'container',
            layout : {
                type  : 'hbox',
                align : 'middle',
                pack  : 'center'
            },
            width  : '100%',
            height : 60,
            cls    : 'thickness-description',
            html :
                '<div class="sub-title">' + common.Util.TR('Line Thickness Description') + '</div>'+
                '<div style="float:left;margin: 4px 10px;">'+
                    '<div style="float:left;font-size:17px;line-height:22px;">1 : </div>'+
                    '<div class="thickness-type1" style="float:left;width:28px;height:25px;"></div>'+
                '</div>'+
                '<div style="float:left;margin: 4px 18px;">'+
                    '<div style="float:left;font-size:17px;line-height:22px;">2 : </div>'+
                    '<div class="thickness-type2" style="float:left;width:28px;height:25px;"></div>'+
                '</div>'+
                '<div style="float:left;margin: 4px 18px;">'+
                    '<div style="float:left;font-size:17px;line-height:22px;">3 : </div>'+
                    '<div class="thickness-type3" style="float:left;width:28px;height:25px;"></div>'+
                '</div>'+
                '<div style="float:left;margin: 4px 18px;">'+
                    '<div style="float:left;font-size:17px;line-height:22px;">4 : </div>'+
                    '<div class="thickness-type4" style="float:left;width:28px;height:25px;"></div>'+
                '</div>'+
                '<div style="float:left;margin: 4px 18px;">'+
                    '<div style="float:left;font-size:17px;line-height:22px;">5 : </div>'+
                    '<div class="thickness-type5" style="float:left;width:28px;height:25px;"></div>'+
                '</div>'
        });
    },


    createChartLayout: function() {
        this.chartLayoutSet = Ext.create('Ext.container.Container', {
            width: '100%',
            height: 60,
            layout: 'vbox',
            items : [{
                xtype: 'container',
                layout: 'fit',
                height: 20,
                html : common.Util.TR('Set up arrangement'),
                cls  : 'sub-title'
            },{
                xtype: 'container',
                itemId: 'numberArea',
                flex : 1,
                layout: {
                    type  : 'hbox',
                    align : 'middle',
                    pack  : 'center'
                },
                items: [{
                    xtype : 'xmnumber',
                    cls: 'rtm-list-condition',
                    itemId : 'row',
                    fieldLabel: common.Util.TR('Row'),
                    labelWidth : 60,
                    width: 120,
                    minValue: 1,
                    maxValue: 1,
                    value : this.txnOption.defaultLayout[0],
                    maxLength: 1,
                    enforceMaxLength: true,
                    enableKeyEvents: true,
                    allowBlank: false,
                    allowDecimals: false,
                    allowExponential: false,
                    listeners: {
                        scope: this,
                        // 'e' , '-' '.' 숫자 이외의 값 막기
                        keydown: function (numField, e) {
                            if ((e.button === 189) || (e.button === 188) || (e.button === 186) || (e.button === 68) || (e.button === 228)) {
                                e.stopEvent();
                            }
                        },
                        keyup: function(me) {
                            // 0만 입력할경우에는 1로 변경
                            if (!Ext.isNumeric(me.value) || +me.getValue() === 0) {
                                me.setValue(me.minValue);
                            } else if(me.getValue() > 4) {
                                me.setValue(me.maxValue);
                            }
                        },
                        change: function(me) {
                            var colVal = me.up().getComponent('col').getValue();
                            var rowVal = me.getValue();

                            if ((colVal * rowVal) > 6) {
                                me.setValue(Math.floor(6/colVal));
                            }
                        }
                    }

                },{
                    xtype : 'xmnumber',
                    cls: 'rtm-list-condition',
                    itemId : 'col',
                    fieldLabel: common.Util.TR('Column'),
                    labelWidth : 60,
                    width: 120,
                    minValue: 1,
                    maxValue: 4,
                    value : this.txnOption.defaultLayout[1],
                    maxLength: 1,
                    enforceMaxLength: true,
                    enableKeyEvents: true,
                    allowBlank: false,
                    allowDecimals: false,
                    allowExponential: false,
                    listeners: {
                        scope: this,
                        // 'e' , '-' '.' 숫자 이외의 값 막기
                        keydown: function (numField, e) {
                            if ((e.button === 189) || (e.button === 188) || (e.button === 186) || (e.button === 68) || (e.button === 228)) {
                                e.stopEvent();
                            }
                        },
                        keyup: function(me) {
                            // 0만 입력할경우에는 1로 변경
                            if (!Ext.isNumeric(me.value) || +me.getValue() === 0) {
                                me.setValue(me.minValue);
                            } else if(me.getValue() > 4) {
                                me.setValue(me.maxValue);
                            }
                        },
                        change: function(me) {
                            var rowVal = me.up().getComponent('row').getValue();
                            var colVal = me.getValue();

                            if ((colVal * rowVal) > 6) {
                                me.setValue(Math.floor(6/rowVal));
                            }

                        }
                    }
                }]
            }]
        });

        this.frameLayer.add(this.chartLayoutSet);
    },

    createBottomLayout: function() {
        // bottom area
        this.chartOptionContainer.add({
            xtype : 'container',
            layout : {
                type  : 'hbox',
                align : 'middle',
                pack  : 'center'
            },
            width  : '100%',
            height : 25,
            margin : '0 0 10 0',
            items  : [{
                xtype : 'button',
                text  : common.Util.TR('OK'),
                cls   : 'rtm-btn',
                width : 55,
                height: 25,
                listeners: {
                    scope: this,
                    click: function() {
                        this.clickEventOk();
                    }
                }
            }, {
                xtype : 'tbspacer',
                width : 5
            }, {
                xtype : 'button',
                text  : common.Util.TR('Cancel'),
                cls   : 'rtm-btn',
                height: 25,
                listeners: {
                    scope: this,
                    click: function() {
                        this.hide();
                    }
                }
            }]
        });
    },

    clickEventOk: function() {
        this.txnOption.defaultLayout[0] = this.chartLayoutSet.getComponent('numberArea').getComponent('row').getValue();
        this.txnOption.defaultLayout[1] = this.chartLayoutSet.getComponent('numberArea').getComponent('col').getValue();

        var instanceName = 'Total';
        var instanceInfo = this.instanceUpdateList[instanceName];
        this.instanceColor = instanceInfo.color;

        this.txnOption.chartOption[instanceName].lineWidth = instanceInfo.lineWidth.getValue();

        Comm.RTComm.saveSumChartColor(this.instanceColor);
        Comm.RTComm.saveChartOption(this.trendChart.componentId, JSON.stringify(this.txnOption));

        this.trendChart.changeOption();

        // Change All Sum Chart Color
        Ext.ComponentQuery.query('container[cls=rtm-base]')[0].changeSumChartColor(instanceInfo.color);

        instanceInfo   = null;
        this.chartList = null;

        this.hide();
    }

});