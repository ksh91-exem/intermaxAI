Ext.define('rtm.src.rtmActiveTxnGroupCount',{
    extend: 'Exem.DockForm',
    title : common.Util.CTR('Active Transaction Group Count'),
    layout: 'fit',

    listeners: {
        beforedestroy: function() {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ACTIVITY, this);

            this.frameStopDraw();
        }
    },


    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.envKeyChartFit = 'rtm_activeTxnGroupChart_fit';

        this.isFitChart = Comm.RTComm.getBooleanValue(Comm.web_env_info[this.envKeyChartFit]);
    },


    init: function() {
        this.initProperty();

        this.initLayout();

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ACTIVITY, this);
    },


    initLayout: function() {

        this.background = Ext.create('Exem.Container', {
            layout : 'vbox',
            width  : '100%',
            height : '100%',
            margin : '0 0 0 0',
            cls    : 'rtm-activitygroup-base'
        });

        this.topArea = Ext.create('Exem.Container', {
            width : '100%',
            height: 25,
            layout: 'hbox'
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height: 20,
            margin: '5 0 0 10',
            cls   : 'header-title',
            text  : common.Util.CTR('Active Transaction Group Count')
        });

        this.expendIcon = Ext.create('Ext.container.Container',{
            width : 17,
            height: 17,
            margin: '7 10 0 4',
            html  : '<div class="trend-chart-icon" title="' + common.Util.TR('Expand View') + '"/>',
            listeners: {
                scope: this,
                render : function(me) {
                    me.el.on( 'click', function(){
                        if (this.dockContainer) {
                            this.dockContainer.toggleExpand(this);
                        }
                    }, this);
                },
                show: function() {
                    this.topArea.show();
                }
            }
        });

        this.optionChartFit = Ext.create('Ext.form.field.Checkbox', {
            boxLabel: common.Util.TR('Auto Scale'),
            name    : 'autoRefreshCheckbox',
            cls     : 'rtm-combobox-label',
            margin  : '4 20 0 0',
            checked : this.isFitChart,
            listeners: {
                scope: this,
                change: function(checkbox, newVal) {
                    this.barChart.isFitChart = newVal;
                    this.barChart.fireEvent('resize', this.barChart);

                    common.WebEnv.Save(this.envKeyChartFit, newVal);
                }
            }
        });

        this.topArea.add([ this.frameTitle, {xtype: 'tbspacer', flex : 1}, this.optionChartFit, this.expendIcon]);

        if (this.floatingLayer === true) {
            this.expendIcon.hide();
            this.frameTitle.hide();
        }

        this.pnlCenter = Ext.create('Exem.Panel', {
            bodyCls  : 'group-center-base',
            layout   : 'fit',
            flex     : 1,
            height   : '100%',
            width    : '100%',
            minHeight: 80,
            margin   : '0 5 0 10',
            split    : false,
            border   : false
        });

        var barColors, barImg;
        var theme = Comm.RTComm.getCurrentTheme();

        switch (theme) {
            case 'Black' :
                barColors = realtime.BarChartColor.Black;
                barImg = '../images/EqualTopBlack_3_2Pixel.png';
                break;
            case 'White' :
                barColors = realtime.BarChartColor.White;
                barImg = '../images/EqualTopWhite_3_2Pixel.png';
                break;
            default :
                barColors = realtime.BarChartColor.Gray;
                barImg = '../images/EqualTopGray_3_2Pixel.png';
                break;
        }

        this.barChart = Ext.create('Exem.chart.StackBarChart', {
            color        : barColors,
            devMode      : false,
            isBarStripe  : true,
            barStripeImg : barImg,
            maxValue     : 30,
            maxBarWidth  : 55,
            maxBarHeight : 50,
            margin       : '0 0 0 0',
            isGroupView  : true, // 인터페이스는 없으나 논리적으로 이해하기 쉽게 만들어둠.
            isCPUView    : false,
            isSingleView : false,
            isFitChart   : this.isFitChart,
            openActiveTxnCount: null
        });

        this.barChart.openActiveTxnCount = function(wasId) {
            realtime.openTxnFilterWasId = wasId;

            if (Ext.isEmpty(realtime.openTxnFilterWasId) !== true) {
                common.OpenView.onMenuPopup('rtm.src.rtmActiveTxnCount');
            }
            wasId = null;
        };

        /*Was별 Group Key를 만든다.*/
        this.WasToGroupLink = {};

        this.checkReceivekServer = [];

        this.setGroupValues();

        this.background.add([this.topArea, this.pnlCenter]);

        this.add(this.background);

        this.pnlCenter.add(this.barChart);

        var arr_id = [];
        this.arr_group = [];

        for (var ix = 0, ixLen = this.GroupValues.length;  ix < ixLen; ix++) {
            arr_id.push(  [].concat( this.GroupValues[ix][3] ) );
            this.arr_group.push(  this.GroupValues[ix][4] );
        }
        this.barChart.setChartLabels( [].concat(arr_id), [].concat(this.arr_group));
    },


    /**
     * Create Init Group Data.
     */
    setGroupValues: function() {
        var groupname, waslist, wasname;
        var ix, ixLen, jx, jxLen;

        this.GroupValues = [];

        for (ix = 0 , ixLen = Comm.bizGroups.length; ix < ixLen ; ++ix ) {
            groupname = Comm.bizGroups[ix].toString();
            waslist = Comm.bizGroupWasNamePairObj[ groupname ];

            if (!waslist) {
                continue;
            }

            // 그룹 데이터를 만들어둔다. 추가된 list랑 groupvalue list랑 순서가 같음.
            this.GroupValues.push([
                null                //       0: Time
                , 0                 //     * 1: Start_TXNs
                , 0                 //     * 2: End_TXNs
                , []                //     * 3: Was_ID
                , groupname.toString() //     * 4: Was_Name
                ,''                 //     * 5: Host_Name
                ,0                  //     * 6: Active_Count1
                ,0                  //     * 7: Active_Count2
                ,0                  //     * 8: Active_Count3
                ,0                  //     * 9: Active_Count4
                ,0                  //     * 10: Active_Count5
                ,0                  //     * 11: Active_Count6
                ,0                  //     * 12: Active_Count7
                ,0                  //     * 13: Active_Count8
            ]);

            for (jx = 0, jxLen = waslist.length; jx < jxLen ; ++jx ) {
                wasname = waslist[jx][0].toString();

                if (!this.WasToGroupLink[wasname]) {
                    this.WasToGroupLink[wasname]= [groupname];

                } else {
                    if (this.WasToGroupLink[ wasname ].indexOf(groupname) === -1) {
                        this.WasToGroupLink[ wasname ].push(  groupname );
                    }
                }

                this.GroupValues[ this.GroupValues.length-1 ][3].push( wasname );
            }
        }
    },


    /**
     * Receive Activity Packet Data.
     *
     * 0: Time
     * 1: Start_TXNs
     * 2: End_TXNs
     * 3: Was_ID
     * 4: Was_Name
     * 5: Host_Name
     * 6: Active_Count1
     * 7: Active_Count2
     * 8: Active_Count3
     * 9: Active_Count4
     * 10: Active_Count5
     * 11: Active_Count6
     * 12: Active_Count7
     * 13: Active_Count8
     * 14: End_TXN_Cnt
     */
    onData: function(adata) {
        if (!adata) {
            return;
        }

        this.tempGroupValues = {};

        // 그룹 값 초기화한다.
        this.initGroupValues();

        var values = adata.rows;
        this.checkReceivekServer = [];

        var arrWas_list, wasid, group_idx;
        var ix, len, k, kcnt;

        // 값 넣기
        for (ix = 0, len = values.length; ix < len; ix++) {
            wasid = values[ix][3];
            arrWas_list = this.WasToGroupLink[ wasid ];

            if (!arrWas_list ||
                !arrWas_list.length ||
                this.checkReceivekServer.indexOf(+wasid) !== -1) {
                continue;
            }

            this.checkReceivekServer[this.checkReceivekServer.length] = +wasid;

            // Was 가 여러개의 그룹에 들어갈수 있어서, 이렇게 함.
            for (k = 0, kcnt = arrWas_list.length; k < kcnt; ++ k ) {
                group_idx = this.arr_group.indexOf( arrWas_list[k] );

                if (group_idx === -1) {
                    continue;
                }
                // 그룹서머리 값에 업데이트 해준다.
                if (values[ix][6] === 255) {
                    values[ix][6] = 0;
                }
                this.GroupValues[group_idx][6]+= values[ix][6];
                this.GroupValues[group_idx][7]+= values[ix][7];
                this.GroupValues[group_idx][8]+= values[ix][8];

                this.GroupValues[group_idx][9] += values[ix][9];
                this.GroupValues[group_idx][10]+= values[ix][10];
                this.GroupValues[group_idx][11]+= values[ix][11];

                this.GroupValues[group_idx][12]+= values[ix][12];
                this.GroupValues[group_idx][13]+= values[ix][13];
            }
        }

        this.barChart.onData({ rows: [].concat( this.GroupValues )});

        return;
    },


    /**
     * Init Server Group Transaction count.
     */
    initGroupValues: function() {
        var ix, ixLen;
        for (ix = 0, ixLen = this.GroupValues.length ; ix < ixLen ; ++ix ) {
            this.GroupValues[ix][6] = 0;
            this.GroupValues[ix][7] = 0;
            this.GroupValues[ix][8] = 0;
            this.GroupValues[ix][9] = 0;
            this.GroupValues[ix][10] = 0;
            this.GroupValues[ix][11] = 0;
            this.GroupValues[ix][12] = 0;
            this.GroupValues[ix][13] = 0;
        }
    },


    /**
     * 모니터링 서버 대상 변경
     */
    updateServer: function() {
        this.serverIdArr   = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.serverNameArr = Comm.RTComm.getServerNameArr(this.monitorType).concat();

        this.selectedServerNames = Comm.RTComm.getSelectedNameArr(this.monitorType, this.openViewType);

        this.frameChange(this.serverNameArr.concat());
    },


    /**
     * Reconfigure the monitoring WAS list.
     *
     * @param {string[]} wasNameList - WAS명 배열
     * @param {string[] | number[]} wasIDList - WAS ID 배열
     */
    frameChange: function(wasNameList, wasIDList) {

        /// 변형 뷰에서는 wasNameList 가 넘어오고 ( 이름 ) 그룹 트랜잭션에서는 wasIDList 로 넘어온다.
        var arr_param = [];

        var idx, wasname;

        if (wasNameList) {
            for (var i = 0, icnt = wasNameList.length; i < icnt; ++i ) {
                wasname = wasNameList[i];
                idx = this.serverNameArr.indexOf( wasname ) ;

                if (idx === -1 ) {
                    continue;
                }
                arr_param.push( this.serverIdArr[idx].toString() );
            }
        }

        if (Ext.isEmpty(wasIDList) !== true && typeof(wasIDList.length) === 'number') {
            arr_param = [].concat(wasIDList);
        }

        this.barChart.viewWasList= [].concat( arr_param );
        this.barChart.resize = true; // 리사이즈 해서 아이템 재정렬

        arr_param = null;
    },


    /**
     * Start Bar chart rendering.
     */
    frameRefresh: function() {
        this.barChart.startAnimationFrame();
    },


    /**
     * Stop Bar chart rendering.
     */
    frameStopDraw: function() {
        this.barChart.stopAnimationFrame();
    }


});
