Ext.define('rtm.src.rtmChartConfig',{
    extend: 'Exem.XMWindow',
    title : common.Util.TR('Chart Configuration'),
    width : 500,
    height: 500,
    minHeight: 320,
    minWidth : 500,
    layout: 'fit',
    modal : true,
    maximizable : false,
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

    // 차트 옵션
    txnOption: null,

    trendChart: null,

    maxRowValue: 4,
    maxColValue: 4,

    /**
     * 기본 프로퍼티 항목 설정
     */
    initProperty: function() {
        this.monitorType = this.monitorType || 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerId    = Comm.RTComm.getSelectedIdArr(this.openViewType);
        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        // E2E 인 경우에는 TP, WAS, WEB 을 같이 선택할 수 있기 때문에 해당 컴포넌트에서 모니터링되고
        // 있는 서버에 대해서만 필터되게 선택 서버 목록을 변경한다.
        if (this.openViewType === 'E2E') {
            this.selectedServerId    = Ext.Array.intersect(this.serverIdArr,   this.selectedServerId);
            this.selectedServerNames = Ext.Array.intersect(this.serverNameArr, this.selectedServerNames);
        }

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

        if (this.isHideArrangement) {
            this.globalLayer.setMargin('10 10 10 10');
        }

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
            items: [this.globalLayer]
        });

        this.add(this.chartOptionContainer);
        this.addCls('rtm-chartconfig-base');

        this.createLayer();

        this.createLineGuideLayout();

        if (!this.isHideArrangement) {
            this.chartOptionContainer.add(this.frameLayer);
            this.createChartLayout();
        }

        this.createBottomLayout();
    },

    createLayer: function() {
        var self = this;

        var instanceLayer;
        var colorLayer;
        var lineWidth;

        var instanceInfo;
        var instanceName;
        var serverId, serverColor;

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
            html : common.Util.TR('Change All'),
            style : {
                'font-size': '18px',
                'line-height': '22px'
            }
        },{
            xtype: 'button',
            flex : 1,
            text : common.Util.TR('Original Color'),
            cls  : 'instance-icon-button',
            listeners:{
                scope: this,
                click: function() {
                    var instanceInfo;
                    var color;
                    var instanceName;

                    var keys = Object.keys(this.instanceUpdateList);

                    for (var ix = 0; ix < keys.length; ix++) {
                        instanceName = keys[ix];

                        instanceInfo = this.instanceUpdateList[instanceName];
                        color = realtime.DefaultColors[this.serverNameArr.indexOf(instanceName)];

                        instanceInfo.instanceColor.style.backgroundColor = color;
                        instanceInfo.colorPicker.value = color;
                        instanceInfo.color = color;
                    }
                    keys = null;
                }
            }
        },{
            xtype : 'xmnumber',
            cls: 'rtm-list-condition',
            fieldLabel: common.Util.TR('Thickness'),
            labelWidth : 60,
            width: 120,
            maxLength: 1,
            minValue : 1,
            maxValue : 5,
            value    : 2,
            oldValue : 2,
            enforceMaxLength: true,
            enableKeyEvents: true,
            allowBlank: false,
            allowDecimals: false,
            allowExponential: false,
            listeners:{
                scope: this,
                keydown: function (me, e) {
                    if (!Ext.isNumeric(me.value)) {
                        e.stopEvent();
                        return;
                    }
                },
                change: function(me, newValue, oldValue) {
                    if (!Ext.isNumeric(me.value)) {
                        me.setValue(oldValue);
                        return;
                    } else {
                        if (me.value < me.minValue) {
                            me.setValue(me.minValue);
                            return;
                        } else if (me.value > me.maxValue) {
                            me.setValue(me.maxValue);
                            return;
                        }
                    }
                    var instanceInfo;
                    var instanceName;

                    var keys = Object.keys(this.instanceUpdateList);

                    for (var ix = 0; ix < keys.length; ix++) {
                        instanceName = keys[ix];
                        instanceInfo = this.instanceUpdateList[instanceName];

                        instanceInfo.lineWidth.setValue(newValue);
                    }
                    keys         = null;
                    instanceInfo = null;
                }
            }
        }]);

        this.globalLayer.add(itemContainer);

        this.scrollSpace = Ext.create('Ext.container.Container',{
            width : 17,
            hidden: true,
            style: {
                background : '#FFF'
            }
        });

        itemContainer.add(this.scrollSpace);

        var centerArea = Ext.create('Ext.container.Container',{
            layout: 'vbox',
            width: '100%',
            flex : 1,
            autoScroll: true,
            listeners: {
                resize: function() {
                    // Scroll Bar가 보이는 경우 Change All 패널 넓이를 조정.
                    self.scrollSpace.setVisible(this.getEl().isScrollable());
                }
            }
        });

        this.globalLayer.add(centerArea);

        this.instanceList = (this.selectedServerNames.length > 0)? this.selectedServerNames : this.serverNameArr;

        for (var ix = 0, ixLen = this.instanceList.length; ix < ixLen; ix++) {
            instanceName = this.instanceList[ix];
            serverId     = this.selectedServerId[ix];
            serverColor  = realtime.serverColorMap[window.rtmMonitorType][serverId];

            instanceInfo = this.instanceUpdateList[instanceName] = {
                index : ix,
                color : serverColor
            };

            instanceInfo.instanceColor = document.createElement('span');
            instanceInfo.instanceColor.setAttribute('class', 'instance-icon-circle');
            instanceInfo.instanceColor.setAttribute('style', 'position:absolute;left:2px;top:7px;border-radius:50%;box-shadow: rgb(91, 121, 107) 0px 0px 3px;width:10px;height:10px;background-color:'+ instanceInfo.color);

            instanceInfo.colorPicker = document.createElement('input');
            instanceInfo.colorPicker.setAttribute('type' , 'color');
            instanceInfo.colorPicker.setAttribute('class' , 'instance-icon-button');
            instanceInfo.colorPicker.setAttribute('style' , 'width:100%;cursor:pointer;');
            instanceInfo.colorPicker.value = serverColor;
            instanceInfo.colorPicker.dataset.instancename = instanceName;

            instanceInfo.colorPicker.onchange = this.changeOfColorPicker.bind(this);

            itemContainer = Ext.create('Ext.container.Container', {
                layout: 'hbox',
                width: '100%',
                height: 36,
                padding: 6,
                cls    : 'instance-area-row1'
            });

            instanceLayer = Ext.create('Ext.form.Label',{
                instanceName : instanceName,
                width: 140,
                html : instanceName,
                style : {
                    'text-indent': '18px',
                    'line-height': '22px',
                    'text-overflow': 'ellipsis',
                    'overflow': 'hidden'
                },
                listeners: {
                    scope: this,
                    render: this.renderInstanceLayer
                }
            });

            colorLayer = Ext.create('Ext.container.Container',{
                instanceName : instanceName,
                height: 30,
                flex : 1,
                listeners: {
                    scope: this,
                    render: this.renderColorLayer
                }
            });

            if (this.txnOption.chartOption[instanceName]) {
                lineWidth = this.txnOption.chartOption[instanceName].lineWidth || 1;
            } else {
                lineWidth = 1;
            }

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
                listeners: {
                    scope: this,
                    keydown: this.keyDownEventOfThickness,
                    change: this.changeEventOfThickness
                }
            });

            itemContainer.add([instanceLayer, colorLayer, instanceInfo.lineWidth]);

            centerArea.add(itemContainer);
        }
    },

    renderInstanceLayer: function(me) {
        me.el.dom.setAttribute('data-qtip', me.el.dom.innerHTML);
        me.el.dom.appendChild(this.instanceUpdateList[me.instanceName].instanceColor);
    },

    renderColorLayer: function(me) {
        me.el.dom.childNodes[0].childNodes[0].appendChild(this.instanceUpdateList[me.instanceName].colorPicker);
    },

    keyDownEventOfThickness: function (me, e) {
        // 'e' , '-' '.' 숫자 이외의 값 막기
        if (!Ext.isNumeric(me.value)) {
            e.stopEvent();
            return;
        }
    },

    changeEventOfThickness: function(me, newValue, oldValue) {
        if (!Ext.isNumeric(me.value)) {
            me.setValue(oldValue);
        } else {
            if (me.value < me.minValue) {
                me.setValue(me.minValue);
            } else if (me.value > me.maxValue) {
                me.setValue(me.maxValue);
            }
        }
    },

    changeOfColorPicker: function(e) {
        var color = e.currentTarget.value;
        var instanceInfo = this.instanceUpdateList[e.currentTarget.dataset.instancename];
        instanceInfo.instanceColor.style.backgroundColor = color;
        instanceInfo.color = color;

        instanceInfo = null;
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
                    maxValue: this.maxRowValue,
                    value : this.txnOption.defaultLayout[0],
                    maxLength: 1,
                    enforceMaxLength: true,
                    enableKeyEvents: true,
                    allowBlank: false,
                    allowDecimals: false,
                    allowExponential: false,
                    listeners:{
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
                            } else if (me.getValue() > 4) {
                                me.setValue(me.maxValue);
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
                    maxValue: this.maxColValue,
                    value : this.txnOption.defaultLayout[1],
                    maxLength: 1,
                    enforceMaxLength: true,
                    enableKeyEvents: true,
                    allowBlank: false,
                    allowDecimals: false,
                    allowExponential: false,
                    listeners:{
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
                            } else if (me.getValue() > 4) {
                                me.setValue(me.maxValue);
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
                        var instanceInfo;
                        var instanceName;
                        var serverId;

                        if (!this.isHideArrangement) {
                            this.txnOption.defaultLayout[0] = this.chartLayoutSet.getComponent('numberArea').getComponent('row').getValue();
                            this.txnOption.defaultLayout[1] = this.chartLayoutSet.getComponent('numberArea').getComponent('col').getValue();
                        }

                        var ix, ixLen;
                        var keys = Object.keys(this.instanceUpdateList);

                        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                            instanceName = keys[ix];
                            instanceInfo = this.instanceUpdateList[instanceName];

                            serverId = Comm.RTComm.getServerIdByName(instanceName, this.monitorType);

                            realtime.serverColorMap[window.rtmMonitorType][serverId] = instanceInfo.color;

                            if (this.monitorType === 'TP') {
                                Comm.tpInfoObj[serverId].labelColor = instanceInfo.color;

                            } else if (this.monitorType === 'WEB') {
                                Comm.webServersInfo[serverId].labelColor = instanceInfo.color;

                            } else {
                                Comm.wasInfoObj[serverId].labelColor = instanceInfo.color;
                            }

                            this.txnOption.chartOption[instanceName].lineWidth = instanceInfo.lineWidth.getValue();
                        }

                        Comm.RTComm.saveWasColor(JSON.stringify(realtime.serverColorMap));
                        Comm.RTComm.saveChartOption(this.trendChart.componentId, JSON.stringify(this.txnOption));

                        if (this.trendChart.changeOption) {
                            this.trendChart.changeOption();
                        }

                        // 메인 화면 좌측에 보여지는 그룹 목록에 있는 WAS 아이콘 색상을 변경하기 위해 호출
                        var rtmBase = Comm.RTComm.getRtmBaseContainer();
                        rtmBase.changeWasColor();

                        if (realtime.agentListId && realtime.agentListId.length > 0) {
                            for (ix = 0, ixLen = realtime.agentListId.length; ix < ixLen; ix++) {
                                Ext.getCmp(realtime.agentListId[ix]).changeWasColor();
                            }
                        }

                        rtmBase        = null;
                        keys           = null;
                        instanceInfo   = null;
                        this.chartList = null;

                        this.hide();
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
    }

});