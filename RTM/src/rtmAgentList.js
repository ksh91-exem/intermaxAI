Ext.define ('rtm.src.rtmAgentList', {
    extend: 'Exem.DockForm',
    title : common.Util.TR('Agent List'),
    layout: 'fit',
    width : '100%',
    height: 33,
    minHeight: 33,

    listeners: {
        beforedestroy: function(me) {
            var ix, ixLen;
            for (ix = 0, ixLen = this.removeAgentKeys.length; ix < ixLen; ix++) {
                common.RTMDataManager.removeAgent(this.removeAgentKeys[ix].was, this.removeAgentKeys[ix].id, me.openViewType);
            }
            delete this.removeAgentKeys;

            Ext.Array.remove(realtime.agentListId, this.id);

            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, me);
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        this.serverIdArr = Comm.RTComm.getServerIdArr(this.monitorType).concat();
        this.selectedServerIdArr = Comm.RTComm.getSelectedIdArr(this.openViewType).concat();

        this.alarmList    = {};
        this.alarmNameArr = [];
        this.agentList    = {};

        this.removeAgentKeys = [];

        if (!realtime.agentListId) {
            realtime.agentListId = [];
        }
    },

    init: function() {

        this.initProperty();

        var isContain = Ext.Array.contains(realtime.agentListId, this.id);
        if (isContain !== true) {
            realtime.agentListId[realtime.agentListId.length] = this.id;
        }

        this.baseFrame = Ext.create('Exem.Container', {
            padding  : '0px 6px 0px 6px',
            height   : 33,
            minHeight: 33,
            border   : 1
        });

        this.add(this.baseFrame);

        this.baseFrame.addCls('rtm-agentlist-base');

        if (this.serverIdArr.length > 0) {
            this.initAgentList();
        }

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this);
    },


    initAgentList: function() {
        var target = this.baseFrame.getEl().dom;

        this.createNamePanel(Ext.id(), 'ALL', 'transparent', target, true);

        var ix, ixLen;
        var id, name, color;

        for (ix = 0, ixLen = this.serverIdArr.length; ix < ixLen; ix++) {
            id    = this.serverIdArr[ix];
            name  = Comm.RTComm.getServerNameByID(id, this.monitorType);
            color = realtime.serverColorMap[this.openViewType][id];

            this.createNamePanel(+id, name, color, target, false);
        }

        target  = null;
    },


    createNamePanel: function(id, name, iconColor, target, isAll) {
        var baseEl, sepEl, iconEl, wasEl;

        var selectedCls = '';

        if (Comm.RTComm.isSelectedServer() === false) {
            if (isAll === true) {
                selectedCls = 'selected';
            }
        //} else if (Comm.selectedWasArr.indexOf(id) !== -1) {
        } else if (this.selectedServerIdArr.indexOf(id) !== -1) {
            selectedCls = 'selected';
        }

        var pnlId = 'rtm-agentlist-id-' + id;
        var KeyName;

        baseEl    = target.appendChild(document.createElement('div'));
        baseEl.id = 'RTM-AGENT-' + Ext.id();

        baseEl.setAttribute('class', 'wasinfo ' + this.openViewType);
        baseEl.setAttribute('overall', '' + isAll);
        baseEl.setAttribute('wasName', name);

        baseEl.onclick     = this.wasSelect.bind(baseEl, this.monitorType, this.openViewType);
        baseEl.selectAgent = this.selectAgent.bind(baseEl, this.openViewType);

        KeyName = (name !== 'ALL') ? Comm.RTComm.getServerIdByName(name, this.monitorType) : name;

        common.RTMDataManager.addAgent(KeyName, baseEl.id, this.openViewType);

        this.removeAgentKeys[this.removeAgentKeys.length] = {was: KeyName, id: baseEl.id};

        if (isAll !== true) {
            sepEl = baseEl.appendChild(document.createElement('div'));
            sepEl.setAttribute('class', 'sep');

            iconEl = baseEl.appendChild(document.createElement('div'));
            iconEl.setAttribute('class', 'icon');
            iconEl.setAttribute('style', 'background-color:' + iconColor);

        } else {
            iconEl = baseEl.appendChild(document.createElement('div'));
            iconEl.setAttribute('class', 'checkbox ' + selectedCls);
        }

        wasEl = baseEl.appendChild(document.createElement('div'));
        wasEl.setAttribute('class', 'was ' + selectedCls);
        wasEl.textContent = name;

        var lineEl = baseEl.appendChild(document.createElement('div'));
        if (isAll !== true) {
            lineEl.setAttribute('class', 'underline ' + selectedCls);
        } else {
            lineEl.setAttribute('class', 'underline');
        }

        this.agentList[pnlId] = {
            base       : baseEl,
            lastTime   : +new Date(),
            wasIcon    : iconEl,
            wasLabel   : wasEl
        };

        sepEl           = null;
        wasEl           = null;
        lineEl          = null;
        iconEl          = null;
        baseEl          = null;
        target          = null;
    },


    wasSelect: function() {
        var serverId;
        var serverName  = this.getAttribute('wasName');
        var monitorType = arguments[0];
        var viewType    = arguments[1];

        if (serverName === 'ALL') {
            serverName = '';
        }

        var rtmBase = Comm.RTComm.getRtmBaseContainer();
        rtmBase.wasSelect(serverName);

        if (serverName === '' || Comm.RTComm.isSelectedServer() === false) {
            common.RTMDataManager.selectAgent('ALL', viewType);
        } else {
            serverId = Comm.RTComm.getServerIdByName(serverName, monitorType);
            common.RTMDataManager.selectAgent(serverId, viewType);
        }
    },


    selectAgent: function() {
        var viewType = arguments[0];
        if (Comm.RTComm.getBooleanValue(this.getAttribute('overall'))) {
            common.RTMDataManager.clearSelectedAgent(viewType);

            $(this.children[1]).addClass('selected');

            if (!$(this.children[0]).hasClass('selected') ) {
                $(this.children[0]).toggleClass('selected');
            }
        } else {
            $(this.parentElement.childNodes[0].children[0]).removeClass('selected');
            $(this.parentElement.childNodes[0].children[1]).removeClass('selected');

            $(this.children[1]).toggleClass('selected');
            $(this.children[2]).toggleClass('selected');
            $(this.children[3]).toggleClass('selected');
        }
    },


    changeWasColor: function() {
        var iconEl, wasObj, id, color,
            ix, ixLen;

        var idArr = Comm.RTComm.getServerIdArr(this.monitorType);

        for (ix = 0, ixLen = idArr.length; ix < ixLen; ix++) {
            id = idArr[ix];
            wasObj = this.agentList['rtm-agentlist-id-' + id];

            if (wasObj !== undefined && wasObj !== null) {
                color = realtime.serverColorMap[this.openViewType][id];
                iconEl = wasObj.wasIcon;
                iconEl.setAttribute('style', 'background-color:' + color);
            }
        }
        iconEl = null;
        wasObj = null;
    },


    /**
     * 실시간 알람 데이터를 받아서 처리.
     * RTMDataManager.onAlarmFrame 함수에서 실행
     *
     * @param {array} adata - 알람 패킷 데이터
     *
     * 알람데이터
     *  0: time
     *  1: server_type   (1: WAS, 2: DB, 3:WebServer, 9:Host, 15: apim)
     *  2: server_id
     *  3: server_name
     *  4: alert_resource_name
     *  5: value
     *  6: alert_level
     *  7: levelType
     *  8: alert_type
     *  9: descr
     *  10: alert_resource_ID
     */
    onAlarm : function(adata) {
        if (adata === null || adata === undefined) {
            adata = null;
            return;
        }

        if ((this.monitorType === 'WAS' || this.monitorType === 'TP') && adata[1] !== 1) {
            return;
        }

        if (this.monitorType === 'WEB' && adata[1] !== 3) {
            return;
        }

        this.drawAlarm(adata);

        adata = null;
    },


    drawAlarm: function(data) {
        var wasElement;

        var serverId    = data[2];
        var serverName  = data[3];
        var alertName   = data[4];
        var alertLevel  = data[6];
        var ix, ixLen;

        var wasObj      = this.agentList['rtm-agentlist-id-' + serverId];

        if (wasObj) {
            switch (alertLevel) {
                case 2 :
                    this.wasClass = 'critical';
                    break;
                case 1 :
                    this.wasClass = 'warning';
                    break;
                default :
                    this.wasClass = '';
                    break;
            }

            if (+alertLevel === 0) {
                this.deleteAlarmInfo(serverId, serverName, alertName);
            }

            wasElement = wasObj.wasLabel;

            if (!$(wasElement).hasClass('critical')) {
                $(wasElement).removeClass('warning').addClass(this.wasClass);
            }

            switch (alertName) {
                case realtime.alarms.OS_CPU :
                case realtime.alarms.OS_FREE_MEM :
                    $(wasElement).removeClass('warning critical').addClass(this.wasClass);
                    break;
                case realtime.alarms.CONNECTED :
                case realtime.alarms.SERVER_BOOT :
                case realtime.alarms.API_BOOT :
                case realtime.alarms.TP_BOOT :
                    $(wasElement).removeClass('warning critical');
                    break;

                case realtime.alarms.TP_DOWN :
                case realtime.alarms.API_DOWN :
                case realtime.alarms.SERVER_DOWN :
                case realtime.alarms.SERVER_HANG :
                case realtime.alarms.DISCONNECTED :
                    $(wasElement).removeClass('warning').addClass('critical');
                    break;

                default:
                    if (this.alarmList[serverName] === undefined || this.alarmList[serverName] === null) {
                        this.alarmList[serverName] = {};
                    }
                    if (this.alarmList[serverName][alertName] === undefined || this.alarmList[serverName][alertName] === null) {
                        this.alarmList[serverName][alertName] = {};
                    }
                    this.alarmList[serverName][alertName] = {
                        lastTime   : +new Date()
                    };

                    this.addIdx = this.alarmNameArr.length;

                    for (ix = 0, ixLen = this.alarmNameArr.length; ix < ixLen; ix++) {
                        if (serverName === this.alarmNameArr[ix].wasName && alertName === this.alarmNameArr[ix].alertName) {
                            this.addIdx = ix;
                            break;
                        }
                    }
                    this.alarmNameArr[this.addIdx] = {
                        wasName   : serverName,
                        alertName : alertName,
                        alertLevel: alertLevel
                    };
                    break;
            }

        }

        wasElement  = null;
        wasObj      = null;
        serverId    = null;
        serverName  = null;
        alertName   = null;
        alertLevel  = null;
        data        = null;
    },


    deleteAlarmInfo: function(serverId, serverName, alertName) {
        var wasObj = this.agentList['rtm-agentlist-' + 'id-' + serverId];
        var ix;

        if (wasObj) {
            if (this.alarmList[serverName] && this.alarmList[serverName][alertName]) {
                delete this.alarmList[serverName][alertName];
            }

            if (Ext.Object.isEmpty(this.alarmList[serverName])) {
                this.alarmList[serverName] = null;
            }

            for (ix = 0; ix < this.alarmNameArr.length;) {
                if (serverName === this.alarmNameArr[ix].wasName && alertName === this.alarmNameArr[ix].alertName) {
                    Ext.Array.removeAt(this.alarmNameArr, ix);
                    ix--;
                }
                ix++;
            }

            this.updateAlarmInfo(serverId, serverName, alertName);
        }

        wasObj     = null;
        serverId   = null;
        serverName = null;
        alertName  = null;
    },


    updateAlarmInfo: function(serverId, serverName, alertName) {
        var wasObj = this.agentList['rtm-agentlist-' + 'id-' + serverId];
        var maxLevel = 0,
            ix, ixLen;

        if (wasObj) {
            if (Ext.Object.isEmpty(this.alarmList[serverName])) {
                this.alarmList[serverName] = null;

                $(wasObj.wasLabel).removeClass('warning critical');
            }

            for (ix = 0, ixLen = this.alarmNameArr.length; ix < ixLen; ix++) {
                if (serverName === this.alarmNameArr[ix].wasName && alertName === this.alarmNameArr[ix].alertName &&
                    maxLevel < this.alarmNameArr[ix].alertLevel) {

                    maxLevel = this.alarmNameArr[ix].alertLevel;
                }
            }

            switch (maxLevel) {
                case 2 :
                    $(wasObj.wasLabel).removeClass('warning').addClass('critical');
                    break;
                case 1 :
                    $(wasObj.wasLabel).removeClass('critical').addClass('warning');
                    break;
                default :
                    $(wasObj.wasLabel).removeClass('warning critical');
                    break;
            }

            wasObj    = null;
            maxLevel  = null;
        }
    },


    /**
     * RTMDataManager.onClearAlarm 함수에서 실행.
     *
     * @see {@link RTMDataManager}
     */
    clearAlarm: function() {
        var name, alert, wasid,
            ix, ixLen;

        this.diffSec = 0;

        for (ix = 0, ixLen = this.alarmNameArr.length; ix < ixLen; ix++) {
            if (this.alarmNameArr[ix] === undefined || this.alarmNameArr[ix] === null) {
                continue;
            }
            name  = this.alarmNameArr[ix].wasName;
            alert = this.alarmNameArr[ix].alertName;

            // Server Down, Server Hang, Disconnected, TP Down, API Down 이외의 알람에 대해서
            // 설정한 시간안에 알람데이터가 오지 않는 경우 화면에서 삭제처리한다.
            if (!Ext.Array.contains(realtime.downAlarms, alert) && this.alarmList[name] && this.alarmList[name][alert]) {
                this.diffSec = Ext.Date.diff(this.alarmList[name][alert].lastTime , new Date(), Ext.Date.SECOND);

                if (this.diffSec > 3) {
                    wasid = Comm.RTComm.getWASIdbyName(name);
                    this.deleteAlarmInfo(wasid, name, alert);
                }
            }
        }

        wasid = null;
        name  = null;
        alert = null;
    },


    /**
     * 모니터링 서버 대상 변경에 따른 화면 재구성
     */
    updateServer: function() {
        var ix, ixLen;

        // 기존에 설정된 에이전트 키 삭제
        for (ix = 0, ixLen = this.removeAgentKeys.length; ix < ixLen; ix++) {
            common.RTMDataManager.removeAgent(this.removeAgentKeys[ix].was, this.removeAgentKeys[ix].id, this.openViewType);
        }
        delete this.removeAgentKeys;

        Ext.Array.remove(realtime.agentListId, this.id);

        // 컴포넌트 화면 구성 삭제
        this.removeAll();

        // 컴포넌트 화면 구성
        this.init();
    }

});

