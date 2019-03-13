Ext.define('rtm.src.rtmBizChartConfig',{
    extend: 'Exem.XMWindow',
    title : common.Util.TR('Business Color Setting'),
    width : 350,
    height: 350,
    minHeight: 300,
    minWidth : 300,
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

    /**
     * 기본 프로퍼티 항목 설정
     */
    initProperty: function() {
        window.rtmMonitorType = 'BIZ';

        this.monitorType = this.monitorType || 'Business';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getBizIdList(Comm.businessRegisterInfo);
        this.serverNameArr = Comm.RTComm.getBizNameList(Comm.businessRegisterInfo);

        this.selectedServerId    = this.serverIdArr;
        this.selectedServerNames = this.serverNameArr;

        this.instanceUpdateList = {};
    },


    init: function() {
        this.initProperty();

        this.globalLayer = Ext.create('Ext.container.Container',{
            layout: 'vbox',
            flex: 1,
            width: '100%',
            autoScroll: true,
            margin: '10 10 10 10',
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
            items: [this.globalLayer]
        });

        this.add(this.chartOptionContainer);
        this.addCls('rtm-chartconfig-base');

        this.createLayer();

        this.createBottomLayout();
    },

    createLayer: function() {
        var instanceLayer, colorLayer,
            instanceInfo, instanceName,
            serverId, serverColor, centerArea,
            ix, ixLen;

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
                    var instanceInfo, instanceName, color;
                    var ix;

                    var keys = Object.keys(this.instanceUpdateList);

                    for (ix = 0; ix < keys.length; ix++) {
                        instanceName = keys[ix];

                        instanceInfo = this.instanceUpdateList[instanceName];
                        color = realtime.DefaultColors[this.serverNameArr.indexOf(instanceName)];

                        instanceInfo.instanceColor.style.backgroundColor = color;
                        instanceInfo.colorPicker.value = color;
                        instanceInfo.color = color;
                    }
                }
            }
        }]);

        this.scrollSpace = Ext.create('Ext.container.Container',{
            width : 17,
            hidden: true,
            style: {
                background : '#FFF'
            }
        });

        centerArea = Ext.create('Ext.container.Container',{
            layout: 'vbox',
            width: '100%',
            flex : 1,
            autoScroll: true,
            listeners: {
                scope: this,
                resize: function(me) {
                    // Scroll Bar가 보이는 경우 Change All 패널 넓이를 조정.
                    this.scrollSpace.setVisible(me.getEl().isScrollable());
                }
            }
        });

        itemContainer.add(this.scrollSpace);

        this.globalLayer.add(itemContainer, centerArea);

        this.instanceList = (this.selectedServerNames.length > 0) ? this.selectedServerNames : this.serverNameArr;

        for (ix = 0, ixLen = this.instanceList.length; ix < ixLen; ix++) {
            instanceName = this.instanceList[ix];
            serverId     = this.selectedServerId[ix];

            if (realtime.serverColorMap['BIZ']) {
                serverColor  = realtime.serverColorMap['BIZ'][serverId];
            } else {
                serverColor  = realtime.Colors[ix];
            }

            instanceInfo = this.instanceUpdateList[instanceName] = {
                index : ix,
                color : serverColor
            };

            instanceInfo.instanceColor = document.createElement('span');
            instanceInfo.instanceColor.setAttribute('class', 'instance-icon-circle');
            instanceInfo.instanceColor.setAttribute('style', 'position:absolute;left:2px;top:7px;border-radius:50%;box-shadow: rgb(91, 121, 107) 0px 0px 3px;width:10px;height:10px;background-color:' + instanceInfo.color);

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

            itemContainer.add([instanceLayer, colorLayer]);

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

    changeOfColorPicker: function(e) {
        var color = e.currentTarget.value;
        var instanceInfo = this.instanceUpdateList[e.currentTarget.dataset.instancename];
        instanceInfo.instanceColor.style.backgroundColor = color;
        instanceInfo.color = color;
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
                        var instanceInfo, instanceName;
                        var serverId;

                        var ix, ixLen;
                        var keys = Object.keys(this.instanceUpdateList);

                        var bizElapseChart, bizTPSChart;

                        if (!realtime.serverColorMap.BIZ) {
                            realtime.serverColorMap.BIZ = {};
                        }

                        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
                            instanceName = keys[ix];
                            instanceInfo = this.instanceUpdateList[instanceName];

                            serverId = Comm.RTComm.getServerIdByName(instanceName, this.monitorType);

                            realtime.serverColorMap.BIZ[serverId] = instanceInfo.color;

                            Comm.etoeBizInfos[serverId].labelColor = instanceInfo.color;
                        }

                        Comm.RTComm.saveWasColor(JSON.stringify(realtime.serverColorMap));

                        this.bizChart.drawManager();

                        bizElapseChart = Ext.getCmp('rtmBizElapseMonitor').chartList;
                        bizTPSChart = Ext.getCmp('rtmBizTPSMonitor').chartList;

                        for (ix = 0, ixLen = bizElapseChart.length; ix < ixLen; ix++) {
                            bizElapseChart[ix].chart.removeAllSeries();
                            bizElapseChart[ix].setChartSeries();
                        }

                        for (ix = 0, ixLen = bizTPSChart.length; ix < ixLen; ix++) {
                            bizTPSChart[ix].chart.removeAllSeries();
                            bizTPSChart[ix].setChartSeries();
                        }

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