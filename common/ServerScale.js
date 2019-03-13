Ext.define('common.ServerScale', {
    singleton : true,

    /**
     * WAS 정보를 조회
     *
     * @param {function} callbackFn
     */
    getServerList: function(callbackFn) {
        console.debug('%c [Server Scale]  Auto Scaling - Loading WAS Info...', 'color:#63A5E0;');

        WS.SQLExec({
            sql_file: 'IMXRT_UserWas_AutoID.sql',
            replace_string: [{
                name: 'user_id', value: Comm.web_env_info.user_id
            },{
                name: 'service_id', value: Comm.serviceid.join(',')
            }]
        }, function(header, data) {
            var ix, ixLen;
            var wasId, wasName, wasType, appType, wasColor, host, oldData;

            if (header && header.success === false && !data) {

                console.debug('%c [Server Scale] [ERROR] Failed to retrieve the data of WAS.', 'color:white;background-color:red;font-weight:bold;', header.message);
                return;
            }

            if (data[0].rows.length <= 0) {
                console.debug('%c [Server Scale] [ERROR] Agent is not set to the selected service.', 'color:white;background-color:red;font-weight:bold;');
                common.Util.showMessage(
                    common.Util.TR('ERROR'),
                    common.Util.TR('Agent is not set to the selected service.'),
                    Ext.Msg.OK, Ext.MessageBox.ERROR,
                    function() {
                        localStorage.setItem('Intermax_login', false);
                        window.parent.location.href = location.origin + '/' + location.pathname.split('/')[1];
                    });
                return;
            }

            console.debug('%c [Server Scale]  Auto Scaling - Loading WAS Info... Complete', 'color:blue;');

            Comm.wasStore.fireEvent('ondata', data[0]);


            this.beforeWasIdArr  = Comm.wasIdArr.concat();

            var addServerList = [];
            var randomIdx = 0;

            // 기존 WAS 정보 초기화
            window.realtime.WasNames = [];

            Comm.wasInfoObj   = {};
            Comm.wasIdArr     = [];
            Comm.wasNameArr   = [];
            Comm.wasAppType   = {};
            Comm.selectedWasArr = [];
            Comm.serverInfoObj = {
                WAS : {},
                TP  : {},
                TUX : {},
                WEB : {}
            };

            Comm.oldServerInfo = {};
            Comm.oldServerIdArr = [];
            Comm.oldHosts = [];

            for (ix = 0, ixLen = data[0].rows.length; ix < ixLen; ix++) {
                wasId    = data[0].rows[ix][0];
                wasName  = data[0].rows[ix][1];
                appType  = data[0].rows[ix][2];
                wasType  = data[0].rows[ix][3] || 'WAS';
                host     = data[0].rows[ix][4];

                if (realtime.serverColorMap[wasType] && realtime.serverColorMap[wasType][wasId]) {
                    wasColor = realtime.serverColorMap[wasType][wasId];
                } else {
                    wasColor = Comm.RTComm.decimalToHex(realtime.Colors[randomIdx++]);
                    realtime.serverColorMap[wasType][wasId] = wasColor;
                }

                if (this.beforeWasIdArr.indexOf(wasId) === -1) {
                    addServerList.push(wasId);

                    this.setRepositoryInitData(wasId);
                }

                realtime.WasNames.push(wasName);

                Comm.wasInfoObj[wasId] = {
                    wasName    : wasName,
                    type       : wasType,
                    labelColor : wasColor,
                    host       : host
                };


                Comm.wasIdArr[Comm.wasIdArr.length] = wasId;
                Comm.wasNameArr[Comm.wasNameArr.length] = wasName;
                Comm.selectedWasArr[Comm.selectedWasArr.length] = wasId;
                Comm.serverInfoObj.WAS[wasId] = Comm.wasInfoObj[wasId];
                Comm.wasAppType[wasId] = appType;

            }

            // 자동 ID 발급/해제 처리에서 해제된 WAS ID에 해당하는 로그 데이터 삭제
            var delIdArr = Ext.Array.difference(this.beforeWasIdArr, Comm.wasIdArr);
            for (ix = 0, ixLen = delIdArr.length; ix < ixLen; ix++) {
                this.removeRepositoryData(delIdArr[ix]);
            }

            if (realTimeWS && addServerList.length > 0) {
                // Set WAS Timezone
                realTimeWS.send({
                    command: COMMAND.TIMEZONE,
                    data: {
                        //wasIdAddr: addServerList.join(','),
                        wasIdAddr: Comm.wasIdArr.join(','),
                        repository: Comm.currentRepositoryInfo.database_name
                    }
                });

                // Set WAS Packet
                realTimeWS.send({
                    command: COMMAND.ADD_SERVER,
                    data: {
                        wasNames: Comm.wasIdArr.join(',')
                    }
                });

                this.beforeWasIdArr = Ext.Array.merge(this.beforeWasIdArr, addServerList);
            }

            //1506.8 add (min)
            for (ix in data[1].rows) {
                if (data[1].rows.hasOwnProperty(ix)) {
                    Comm.config.login.wasInfoObj[data[1].rows[ix][0]] = {wasName: data[1].rows[ix][1]};
                }
            }

            // 데이터 처리가 완료된 후 실시간 화면에 모니터링 대상을 업데이트 처리.
            this.getBizData(callbackFn);

            // Auto Scacle 처리로 추가가 되었다가 삭제된 서버 목록 설정
            if (data.length > 4) {
                oldData = data[4].rows;

                for (ix = 0, ixLen = oldData.length; ix < ixLen; ix++) {
                    Comm.oldServerInfo[oldData[ix][0]] = {
                        id: oldData[ix][0],
                        wasName: oldData[ix][1],
                        type: oldData[ix][3],
                        labelColor: null,
                        host: oldData[ix][2],
                        isDotNet: false
                    };

                    if (Comm.oldHosts.indexOf(oldData[ix][2]) === -1) {
                        Comm.oldHosts.push(oldData[ix][2]);
                    }

                    if (Comm.oldServerIdArr.indexOf(oldData[ix][0]) === -1) {
                        Comm.oldServerIdArr.push(oldData[ix][0]);
                    }
                }
            }

        }, this);
    },


    /**
     * 변경된 WAS에 해당하는 호스트/업무 정보를 가져오기
     *
     * @param {} callbackFn
     */
    getBizData: function(callbackFn) {
        var result, temp;

        console.debug('%c [Server Scale]  Auto Scaling - Loading Biz Info...', 'color:#63A5E0;');

        WS.SQLExec({
            replace_string: [{
                name: 'serviceid', value: Comm.serviceid.join(',')
            }, {
                name: 'wasid', value: Comm.wasIdArr.join(',')
            }, {
                name: 'user_id', value: Comm.web_env_info.user_id
            }],
            sql_file: 'IMXRT_Scale_BaseInfo.sql'
        }, function(header, data) {
            var i, ix, jx, ixLen, jxLen;
            var serverId;

            if (header && header.success === false && !data) {
                console.debug('%c [Server Scale] [ERROR] Failed to retrieve the data of Base Configuration.', 'color:white;background-color:red;font-weight:bold;', header.message);
                return;
            }

            console.debug('%c [Server Scale]  Auto Scaling - Loading Biz Info... Complete', 'color:blue;');

            for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
                result = data[ix].rows;

                switch (ix) {
                    case 0 :
                        Comm.bizGroups = [];
                        Comm.bizGroupWasIdPairObj   = {};
                        Comm.bizGroupWasNamePairObj = {};

                        for (jx = 0, jxLen = result.length; jx < jxLen; jx++) {
                            temp = result[jx][0];

                            if (!Comm.bizGroupWasIdPairObj[temp]) {
                                Comm.bizGroupWasIdPairObj[temp] = [];
                            }

                            if (!Comm.bizGroupWasNamePairObj[temp]) {
                                Comm.bizGroupWasNamePairObj[temp] = [];
                            }

                            Comm.bizGroupWasIdPairObj[temp].push(result[jx][1]);
                            Comm.bizGroupWasNamePairObj[temp].push([result[jx][1], result[jx][2]]);
                        }

                        for (i in Comm.bizGroupWasIdPairObj) {
                            if (Comm.bizGroupWasIdPairObj.hasOwnProperty(i)) {
                                Comm.bizGroups.push(i);
                            }
                        }
                        i = null;
                        break;

                    case 1 :
                        if (result.length > 0) {
                            Comm.hosts.length = 0;
                        }

                        for (jx = 0, jxLen = result.length; jx < jxLen; jx++) {
                            if (Comm.hosts.indexOf(result[jx][0]) > -1 ) {
                                continue;
                            }
                            Comm.hosts.push(result[jx][0]);
                        }
                        break;

                    case 2 :
                        for (jx = 0, jxLen = result.length; jx < jxLen; jx++) {
                            serverId = result[jx][0];

                            if (Comm.allDBInfo[serverId]) {
                                continue;
                            }

                            if (+result[jx][4] === 1) {
                                Comm.dbInfoObj[serverId] = {
                                    instanceName: result[jx][1],
                                    db_type : result[jx][2],
                                    db_id   : serverId,
                                    dbAddr  : result[jx][3],
                                    host_ip : result[jx][5] || '',
                                    sid     : result[jx][6] || '',
                                    port    : result[jx][7] || ''
                                };
                            }

                            Comm.allDBInfo[serverId] = {
                                instanceName: result[jx][1],
                                db_type : result[jx][2],
                                db_id   : serverId,
                                dbAddr  : result[jx][3],
                                host_ip : result[jx][5] || '',
                                sid     : result[jx][6] || '',
                                port    : result[jx][7] || ''
                            };
                        }
                        break;

                    case 3 :
                        for (jx = 0, jxLen = result.length; jx < jxLen; jx++) {
                            if (Comm.bizGroups.indexOf(result[jx][0]) === -1) {
                                Comm.bizGroups.push(result[jx][0]);
                            }
                        }
                        break;

                    case 4 :
                        realtime.HostRelWAS.length = 0;
                        realtime.HostRelServer.length = 0;

                        for (jx = 0, jxLen = result.length; jx < jxLen; jx++) {
                            realtime.HostRelWAS.push([result[jx][0], result[jx][1], result[jx][2]]);
                            realtime.HostRelServer.push([result[jx][0], result[jx][1], result[jx][2]]);
                        }
                        break;

                    default:
                        break;
                }
            }
            temp   = null;
            result = null;


            if (callbackFn) {
                callbackFn();
            }

        }, this);
    },


    /**
     * 실시간 화면의 각 차트에서 사용되는 로그 데이터 삭제
     *
     * @param {number} wasId
     */
    removeRepositoryData: function(wasId) {
        // WAS 성능 지표 데이터
        delete Repository.trendChartData[wasId];
        delete Repository.trendDataLog[wasId];

        // WAS 동시접속자수 데이터
        delete Repository.WasSessionData[wasId];
        delete Repository.WasSessionDataLog[wasId];

        // WAS 일일 데이터 (동시사용자수, 실행건수, 방문자수)
        delete Repository.WasMonitorDaily[wasId];

        // WAS 알람 정보
        delete Repository.alarmListInfo.WAS[wasId];

        // GC 지표 데이터
        delete Repository.JVMGCStat[wasId];
    },


    /**
     * 실시간화면에서 관리되는 패킷 로그 데이터 설정
     *
     * @param {number} wasId - WAS ID
     */
    setRepositoryInitData: function(wasId) {
        var jx, kx, jxLen, kxLen;
        var statName, wasStatNameList;

        if (!Repository.trendChartData[wasId]) {
            Repository.trendChartData[wasId] = {};
            Repository.trendDataLog[wasId]   = {};

            wasStatNameList = Comm.RTComm.getWasStatIdArr();
            wasStatNameList[wasStatNameList.length] = 'TIME';

            for (jx = 0, jxLen = wasStatNameList.length; jx < jxLen; jx++) {
                statName = wasStatNameList[jx];

                Repository.trendChartData[wasId][statName] = 0;
                Repository.trendDataLog[wasId][statName]   = [];

                for (kx = 0, kxLen = 30; kx < kxLen; kx++) {
                    Repository.trendDataLog[wasId][statName].push(0);
                }
            }
        }

        if (!Repository.WasSessionData[wasId]) {
            Repository.WasSessionData[wasId] = {};
            Repository.WasSessionDataLog[wasId] = {};

            Repository.WasSessionData[wasId].SESSION_COUNT    = 0;
            Repository.WasSessionDataLog[wasId].SESSION_COUNT = [];

            for (kx = 0, kxLen = 60; kx < kxLen; kx++) {
                Repository.WasSessionDataLog[wasId].SESSION_COUNT.push(0);
            }
        }
    },


    /**
     * 서버 리스트 변경
     */
    updateServerList: function() {
        var rtmView = Ext.ComponentQuery.query('container[cls=rtm-base]')[0];

        if (rtmView.setMenuGroupList) {
            rtmView.setMenuGroupList();
        }

        var wasList = [];

        var ix, ixLen;
        var windowComponent;

        var windowFloatingList = Ext.WindowManager.zIndexStack.items;
        if (windowFloatingList.length) {
            for (ix = 0, ixLen = windowFloatingList.length; ix < ixLen; ix++) {
                windowComponent = windowFloatingList[ix].items.items[0];

                if (windowComponent &&
                    windowComponent.$className.indexOf('rtm.src.') === 0 &&
                    windowComponent.updateServer) {

                    windowComponent.updateServer(wasList);

                    if (windowComponent.frameRefresh) {
                        windowComponent.frameRefresh();
                    }
                }
            }
        }

        for (ix = 0, ixLen = rtmView.dockLayer.dockList.length; ix < ixLen; ix++) {
            if (rtmView.dockLayer.dockList[ix].obj.updateServer) {
                rtmView.dockLayer.dockList[ix].obj.updateServer(wasList);

                if (rtmView.dockLayer.dockList[ix].obj.frameRefresh) {
                    rtmView.dockLayer.dockList[ix].obj.frameRefresh();
                }
            }
        }

        for (ix = 0, ixLen = realtime.rtmPopupList.length; ix < ixLen; ix++) {
            if (realtime.rtmPopupList[ix]['IMX_POPUP'].app.updateServer) {
                realtime.rtmPopupList[ix]['IMX_POPUP'].app.updateServer(wasList);

                if (realtime.rtmPopupList[ix]['IMX_POPUP'].app.frameRefresh) {
                    realtime.rtmPopupList[ix]['IMX_POPUP'].app.frameRefresh();
                }
            }
        }

        wasList = null;
    },


    /**
     * common.ServerScale.autoScale()
     */
    autoScale: function() {
        if (!this.rtmView) {
            this.rtmView = Ext.ComponentQuery.query('container[cls=rtm-base]')[0];
        }


        console.debug('%c [Server Scale]  Auto Scaling - Start', 'color:blue;');

        common.ServerScale.getServerList(this.updateServerList.bind(this));
    }

});
