Ext.define('common.LinkedManager', {
    singleton       : true,

    openViewType    : null,

    openParams      : null,


    /**
     * 연동 URL을 통해서 접속하는 경우 트랜잭션 화면을 표시하는지 PA 화면을 표시하는 경우인지 체크.
     * PA 화면을 표시하는 경우 관련 정보를 설정 후 실시간 화면이 표시되고 나서 PA 화면으로 이동하고
     * 트랜잭션 화면을 표시하는 경우는 조건에 따라 화면을 표시하게 한다.
     *
     * @param {object} serviceList
     */
    checkOpenUrl: function(serviceList) {
        var paParams  = localStorage.getItem('ImxConnect_PA_Params');
        var txnParams = localStorage.getItem('ImxConnect_TxnDetail_Params');

        if (txnParams) {
            // 트랜잭션 화면을 표시
            this.checkTxnDetailUrlOpen(serviceList);

        } else if (paParams) {
            // PA 화면을 표시
            this.checkPAUrl(serviceList);
        }
    },

    /**
     * Open Transaction Detail View By URL Parameters.
     *
     * txnConnect: 1
     * tid       : number  ex) 7227405324779716699
     * wasid     : number  ex) 91
     * starttime : number  ex) 1477634021000
     * endtime   : number  ex) 1477634082000
     * eventName : 'elapsed time'
     *
     * MaxGauge 연계 값
     * txnConnect: 1
     * mxgConnect: 1
     * time      : ex) 1482395852000
     * tid       : ex) 7227405324779716699
     * sqlid     : ex) 97B61775DE717BB5CB115B028E4EC84C11DB4088
     *
     * 예) intermax/?txnConnect=1&mxgConnect=1&tid=6817187628756697180&starttime=1522668408000&endtime=1522669098000
     */
    checkTxnDetailUrlOpen: function(serviceList) {
        var params = localStorage.getItem('ImxConnect_TxnDetail_Params');
        localStorage.removeItem('ImxConnect_TxnDetail_Params');

        if (!params) {
            return;
        }

        // 트랜젹션 Parameters: wasid, tid, starttime, endtitme
        var txnParams;
        try {
            txnParams = JSON.parse(params);
            console.debug(' [Popup Transaction Detail] - Set Parameters. ', txnParams);
        } catch(e) {
            console.debug('%c [Popup Transaction Detail] [WARNING] Failed Set Parameters.', 'color:#800000;background-color:gold;font-weight:bold;', e.message);
            return;
        }

        var isValidParams = true;

        // Valid Parameter
        if (!txnParams) {
            isValidParams = false;
        }

        // Valid WAS ID
        if (txnParams.mxgConnect !== '1' && (+txnParams.wasid <= 0 || +txnParams.wasid === -1)) {
            isValidParams = false;
        }

        // Valid TID, End Time, Start Time
        if (txnParams.mxgConnect !== '1' && (+txnParams.tid <= 0 || +txnParams.endtime <= 0 || txnParams.starttime <= 0)) {
            isValidParams = false;
        }

        // Valid Maxgauge Params
        if (txnParams.mxgConnect === '1' && txnParams.time) {
            txnParams.starttime = +new Date(new Date(+txnParams.time).setMilliseconds(0) - 1000 * 60 * 10);
            txnParams.endtime   = +new Date(new Date(+txnParams.time).setMilliseconds(0) + 1000 * 60 * 10);
        }

        if (!isValidParams) {
            console.debug('%c [Popup Transaction Detail] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'Invalid Parameters.');
            return;
        }

        var fT = new Date(new Date(+txnParams.starttime).setMilliseconds(0) - 30000);
        var tT = new Date(new Date(+txnParams.endtime).setMilliseconds(0) + 30000);

        var retrieveRange = {
            fromTime : Ext.Date.format( fT, 'Y-m-d H:i:s' ),
            toTime   : Ext.Date.format( tT, 'Y-m-d H:i:s' ),
            minElapse: 0,
            maxElapse: (+txnParams.endtime - +txnParams.starttime) * 1000,
            clientIp : '',
            txnName  : '',
            exception: '',
            loginName: '',
            tid      : txnParams.tid,
            sql_id   : txnParams.sqlid,
            sessionid: txnParams.sessionid,
            sid      : txnParams.sid,
            ip       : txnParams.ip,
            port     : txnParams.port
        };

        retrieveRange.wasId = +txnParams.wasid;

        localStorage.setItem('InterMax_PopUp_Param', JSON.stringify(retrieveRange));

        var currentWidth, currentHeight;
        if (txnParams.eventName === 'elapsed time') {
            currentWidth = 1000;
            currentHeight = 650;
        } else {
            currentWidth = 1500;
            currentHeight = 1000;
        }

        var dualScreenLeft = window.screenLeft != null? window.screenLeft : screen.left;
        var dualScreenTop  = window.screenTop  != null? window.screenTop  : screen.top;

        var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        var left = ((width / 2) - (currentWidth / 2)) + dualScreenLeft;
        var top = ((height / 2) - (currentHeight / 2)) + dualScreenTop;

        var popupOptions = 'scrollbars=yes, width=' + currentWidth + ', height=' + currentHeight + ', top=' + top + ', left=' + left;
        var popupWin;

        // MaxGauge에서 연계되어 표시된 경우 팝업화면을 바로 표시하지 않고
        // 서비스를 선택 후 실시간 화면이 보여지면서 화면을 표시하게 처리함.
        if (txnParams.mxgConnect === '1') {

            // 연계 정보에 WAS ID가 있는 경우 서비스를 선택하여 실시간 화면으로 이동해서 표시함.
            if (retrieveRange.wasId) {
                window.mxgCallOptions = popupOptions;
                serviceList.autoSelectServiceByWAS(retrieveRange.wasId);

            } else {
                Comm.RTComm.checkEndTxn(retrieveRange.tid, function(isEndTxn, serverId) {

                    // 서버 ID를 재설정한다.
                    retrieveRange.wasId = +serverId;
                    localStorage.setItem('InterMax_PopUp_Param', JSON.stringify(retrieveRange));

                    // 액티브 트랜잭션인지 끝난 트랜잭션인지에 따라 팝업되는 화면 크기를 재설정
                    if (isEndTxn) {
                        currentWidth = 1500;
                        currentHeight = 1000;
                    } else {
                        currentWidth = 1000;
                        currentHeight = 650;
                    }

                    popupOptions = 'scrollbars=yes, width=' + currentWidth + ', height=' + currentHeight + ', top=' + top + ', left=' + left;

                    // 실시간 화면에서 팝업 화면으로 표시할 때 사용할 팝업 옵션 설정
                    window.mxgCallOptions  = popupOptions;
                    window.mxgCallIsEndTxn = isEndTxn;

                    // 서버ID에 해당하는 서비스를 자동으로 선택하여 실시간 화면으로 넘어가게 처리
                    serviceList.autoSelectServiceByWAS(retrieveRange.wasId);

                }.bind(this));
            }

        } else {
            if (txnParams.eventName === 'elapsed time') {
                popupWin = window.open("../txnDetail/activeTxnDetail.html", "hide_referrer_2", popupOptions);
            } else {
                popupWin = window.open("../txnDetail/txnDetail.html", "hide_referrer_1", popupOptions);
            }

            if (txnParams.mxgConnect !== '1' && popupWin == null) {
                Ext.MessageBox.show({
                    title   : '',
                    icon    : Ext.MessageBox.INFO,
                    message : common.Util.TR('Pop-up blocked'),
                    modal   : true,
                    cls     : 'popup-message',
                    buttons : Ext.Msg.OK
                });
            }
        }

    },


    /**
     * PA 화면 표시
     *
     * @param {object} serviceList
     */
    checkPAUrl: function(serviceList) {
        var params = localStorage.getItem('ImxConnect_PA_Params');
        localStorage.removeItem('ImxConnect_PA_Params');

        if (!params) {
            serviceList = null;
            return;
        }

        var viewParams;
        var isValidParams = true;

        try {
            viewParams = JSON.parse(params);
            console.debug(' [LinkedManager] - Set Parameters. ', viewParams);
        } catch(e) {
            console.debug('%c [LinkedManager] [WARNING] Failed Set Parameters.', 'color:#800000;background-color:gold;font-weight:bold;', e.message);
            return;
        }

        // Valid Parameter
        if (!viewParams) {
            isValidParams = false;

        } else {
            this.openViewType = viewParams.paType;
            this.openParams   = viewParams;
        }

        if (!isValidParams) {
            console.debug('%c [LinkedManager] [WARNING] ', 'color:#800000;background-color:gold;font-weight:bold;', 'Invalid Parameters.');
            serviceList = null;
            return;

        } else {
            serviceList.autoSelectServiceByService(viewParams.serviceName);
        }

    },


    /**
     * 화면 타입에 따라 PA 화면 표시
     */
    showPAView: function() {
        if (this.openViewType == 'AlertHistory') {
            this.showAlertHistory();

        } else if (this.openViewType == 'TxnHistory') {
            this.showTxnHistory();

        } else if (this.openViewType == 'ResponseInspector') {
            this.showResponseInspector();

        } else if (this.openViewType == 'ExceptionHistory') {
            this.showExceptiontHistory();
        }
    },


    showResponseInspector: function() {
        var paView, mainTab;
        setTimeout(function() {
            paView = Ext.create('view.ResponseInspector', {
                title      : common.Util.TR('Transaction Trend'),
                closable   : true,
                isAllWasRetrieve: false,
                detailScatterYRange: 'fixed',
                autoRetrieveRange: {
                    timeRange: [
                        this.openParams.fromTime,
                        this.openParams.toTime
                    ],
                    elapseRange: [0],
                    wasName    : this.openParams.serverName
                },
                tid: this.openParams.tid
            });

            mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
            mainTab.add(paView);
            mainTab.setActiveTab(mainTab.items.length - 1);

            setTimeout(function() {
                paView.init();
                paView  = null ;
                mainTab = null ;
            });

        }.bind(this), 500);
    },


    showExceptiontHistory: function() {
        var paView, mainTab;

        setTimeout(function() {
            paView = Ext.create('view.ExceptionHistory', {
                title    : common.Util.TR('Exception Summary'),
                closable : true,
                autoRetrieveRange: {
                    wasId      : this.openParams.wasId,
                    wasName    : this.openParams.wasName,
                    alertName  : this.openParams.alertName,
                    fromTime   : this.openParams.fromTime,
                    toTime     : this.openParams.toTime
                }
            });

            setTimeout(function() {
                mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                mainTab.add(paView);
                mainTab.setActiveTab(mainTab.items.length - 1);
                paView.init();
                paView.executeSQL();
                paView  = null ;
                mainTab = null ;
            },500) ;



        }.bind(this), 500);
    },

    showAlertHistory: function() {
        var paView, mainTab;

        setTimeout(function() {
            if (!this.openParams.isCallRTM) {
                paView = common.OpenView.open('AlertHistory', {
                    monitorType: 'WAS'
                });

                setTimeout(function (){
                    paView.executeSQL();
                    paView = null;
                }, 500);

            } else {
                paView = Ext.create('view.AlertHistory', {
                    title      : common.Util.TR('Alert Summary'),
                    closable   : true,
                    was_id     : this.openParams.was_id,
                    server_type: this.openParams.server_type,
                    alert_level: this.openParams.alert_level,
                    alert_name : this.openParams.alert_name,
                    from_time  : this.openParams.from_time,
                    to_time    : this.openParams.to_time,
                    monitorType: this.openParams.monitorType,
                    isCallRTM  : true
                });

                mainTab = Ext.getCmp('viewPort').getComponent('mainTab');
                mainTab.add(paView);
                mainTab.setActiveTab(mainTab.items.length - 1);
                paView.init();
                setTimeout(function() {
                    paView.executeSQL();
                    paView  = null;
                    mainTab = null;
                }, 500);
            }

        }.bind(this), 500);
    },


    showTxnHistory: function() {
        var paView;

        setTimeout(function() {
            paView = common.OpenView.open('TxnHistory', {
                monitorType  : this.openParams.monitorType,
                toTime       : this.openParams.toTime,
                fromTime     : this.openParams.fromTime,
                transactionTF: '%' + this.openParams.transactionTF,
                wasId        : this.openParams.wasId
            });

            setTimeout(function (){
                paView.retrieve();
            }, 500);

        }.bind(this), 500);
    }


});
