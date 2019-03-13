Ext.define('rtm.src.rtmGroupView',{
    extend      : 'Exem.Panel',
    width       : '100%',
    height      : '100%',
    minWidth    : 250,
    layout      : 'fit',
    cls         : 'xm-frame-singleInstance',

    parentView   : null,
    groupType    : null,
    wasList      : [],

    intervalTime : PlotChart.time.exSecond * 2,
    refreshTimer : null,

    selectedColor    : '#1A8FFF',
    backgroundColor  : '#5A6F82',

    defaultFontColor  : '#B0B3B8',
    warningFontColor  : '#FFD300',
    criticalFontColor : '#E42526',

    fontColor     : '',
    fontWeight    : '',
    instanceColor : '',

    listeners   : {
        beforedestroy: function(me) {
            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, me);
        }
    },

    initProperty: function() {

        if (this.wasList === undefined || this.wasList === null) {
            this.wasList = [];
        }

        this.wasObjList = {};
        this.wasListKey = [];

        this.alarmList = {};
        this.alarmNameArr = [];

        if(this.dockContainer){
            this.frameList = this.dockContainer.dockList;
        }
    },

    init: function() {
        this.initProperty();

        if (this.groupType !== 0 || this.isOverAll) {
            this.createLayer();

        } else {
            this.createMarginLayer();
        }

        common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this);

        this.checkServerStatus();
    },

    /**
     * 화면 좌측에 표시되는 그룹 목록 생성.
     * 각 에이전트별로 CPU, Memory를 표시한다.
     */
    createLayer: function() {

        if (this.body == null) {
            return;
        }

        var target = this.body.el.dom;

        if (target == null) {
            return;
        }

        var wrapperEl           = null;
        var instanceWrapEl      = null;
        var instanceIconEl      = null;
        var selectedIconEl      = null;
        var instnaceIconStyle   = 'position: absolute;top: 11px;left: 7px;background-color: #8cc252;width: 8px;height: 13px;';
        var instanceEl          = null;
        var instanceStyle       = 'position:relative;width:100%;height:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#b0b3b8;font-size:14px;';

        var cpuEl               = null;
        var cpuCount            = null;
        var cpuWrapEl           = null;
        var memEl               = null;
        var memCount            = null;
        var memWrapEl           = null;
        var alarmEl             = null;

        var bar                 = null;

        var cpuWarpStyle    = 'position:absolute;width:55px;right:92px;';
        var memWarpStyle    = 'position:absolute;width:60px;right:17px;';
        var barStyle        = 'position:absolute;color:#62696f;font-size:10px;margin: 0px 6px;right:76px;';

        var cpuLabelStyle   = 'position:relative;float:left;font-size:12px;margin-right: 3px;color:'  + this.defaultFontColor;
        var cpuValueStyle   = 'position:relative;float:right;font-size:12px;margin-right: 3px;color:' + this.defaultFontColor;
        var memLabelStyle   = 'position:relative;float:left;font-size:12px;margin-right: 3px;color:'  + this.defaultFontColor;
        var memValueStyle   = 'position:relative;float:right;font-size:12px;margin-right: 3px;color:' + this.defaultFontColor;

        var wasName        = null;

        ///////////////////////////////// title //////////////////////////////

        if (this.groupName != null) {

            this.titleWrap = target.appendChild(document.createElement('div'));
            this.titleWrap.className = 'titlewrap';

            this.titleEl = this.titleWrap.appendChild(document.createElement('div'));
            this.titleEl.setAttribute('style', instanceStyle + 'font-weight: bold;');
            this.titleEl.style.color = '#fff';
            this.titleEl.textContent = this.groupName;
            this.titleEl.className = 'opacity-hover';

            this.titleEl.onclick = this.titleClickEvent.bind(this);

            // expand 아이콘
            this.titleExpandIcon = this.titleWrap.appendChild(document.createElement('div'));
            this.titleExpandIcon.className = 'xm-frame-singleInstance-left-group-tool xm-frame-singleInstance-left-collapse';
            this.titleExpandIcon.dataset.expandflag = 1;
            this.titleExpandIcon.onclick = function(e) {
                var titleHeight = 39;
                var self = e.target;

                var items = this.up().items;
                var index = items.items.indexOf(this);

                if (self.dataset.expandflag == 0) {
                    // 펼쳐진 상태
                    self.dataset.expandflag = 1;
                    self.className = self.className.replace('xm-frame-singleInstance-left-expand', 'xm-frame-singleInstance-left-collapse');

                    items.items[index].setHeight(this._originalHeight);
                } else {
                    // 숨긴 상태
                    self.dataset.expandflag = 0;
                    self.className = self.className.replace('xm-frame-singleInstance-left-collapse', 'xm-frame-singleInstance-left-expand');
                    items.items[index].setHeight(titleHeight);
                }

                self  = null;
                items = null;
                index = null;
            }.bind(this);
        }

        for (var ix = 0, ixLen = this.wasList.length; ix < ixLen; ix++) {
            wasName   = this.wasList[ix].name;
            wrapperEl = document.createElement('div');
            wrapperEl.className = 'basewrap biz';
            wrapperEl.dataset.index = ix;
            wrapperEl.dataset.wasName = wasName;

            alarmEl = document.createElement('div');
            alarmEl.className = 'alarm';

            //////////////// instance column set ///////////////////
            instanceWrapEl = document.createElement('div');
            instanceWrapEl.className = 'biz-waswrap';
            instanceWrapEl.id = 'RTM-AGENT-'+Ext.id();

            instanceIconEl = document.createElement('div');
            instanceIconEl.setAttribute('style', instnaceIconStyle + 'background-color:' + this.wasList[ix].labelColor);

            selectedIconEl = document.createElement('div');
            selectedIconEl.className = 'was-selected-icon';

            instanceEl = document.createElement('div');
            instanceEl.setAttribute('style', instanceStyle);
            instanceEl.setAttribute('title', wasName);
            instanceEl.className = 'opacity-hover';
            instanceEl.textContent = wasName;

            instanceWrapEl.appendChild(instanceIconEl);
            instanceWrapEl.appendChild(instanceEl);

            //////////////// CPU N Memory column set ///////////////////
            cpuWrapEl = document.createElement('div');
            cpuWrapEl.setAttribute('style', cpuWarpStyle);
            cpuWrapEl.className = 'opacity-hover';
            cpuWrapEl.dataset.statname = 'cpu';
            cpuWrapEl.dataset.kindstat = '2';

            cpuEl = document.createElement('div');
            cpuEl.setAttribute('style', cpuLabelStyle);
            cpuEl.textContent = 'CPU :';
            cpuCount = document.createElement('div');
            cpuCount.setAttribute('style', cpuValueStyle);
            cpuCount.textContent = 0;
            cpuWrapEl.appendChild(cpuEl);
            cpuWrapEl.appendChild(cpuCount);

            cpuWrapEl.onclick = this.jumpEvent;

            bar = document.createElement('div');
            bar.setAttribute('style', barStyle);
            bar.textContent = ' / ';

            memWrapEl = document.createElement('div');
            memWrapEl.setAttribute('style', memWarpStyle);
            memWrapEl.className = 'opacity-hover';
            memWrapEl.dataset.statname = 'mem';
            memWrapEl.dataset.kindstat = '2';

            memEl = document.createElement('div');
            memEl.setAttribute('style', memLabelStyle);
            memEl.textContent = 'MEM :';
            memCount = document.createElement('div');
            memCount.setAttribute('style', memValueStyle);
            memCount.textContent = 0;
            memWrapEl.appendChild(memEl);
            memWrapEl.appendChild(memCount);

            memWrapEl.onclick = this.jumpEvent;

            wrapperEl.appendChild(selectedIconEl);
            wrapperEl.appendChild(instanceWrapEl);
            wrapperEl.appendChild(cpuWrapEl);
            wrapperEl.appendChild(bar);
            wrapperEl.appendChild(memWrapEl);
            wrapperEl.appendChild(alarmEl);

            instanceWrapEl.onclick = this.instanceClickEvent;

            instanceWrapEl.selectAgent = this.selectAgentEvent.bind(instanceWrapEl);

            common.RTMDataManager.addAgent(Comm.RTComm.getWASIdbyName(wasName), instanceWrapEl.id);

            target.appendChild(document.createElement('div')).appendChild(wrapperEl);

            this.wasObjList[wasName] = {
                instanceEl      : instanceEl,
                instanceWrapEl  : instanceWrapEl,
                instanceIconEl  : instanceIconEl,
                cpuEl           : cpuEl,
                cpuCount        : cpuCount,
                memCount        : memCount,
                memEl           : memEl,
                wrapperEl       : wrapperEl,
                alarmEl         : alarmEl
            };
            if (this.wasListKey.indexOf(wasName) === -1) {
                this.wasListKey.push(wasName);
            }
        }

        target    = null;
        wrapperEl = null;
        instanceWrapEl = null;
        instanceIconEl = null;
        selectedIconEl = null;
        instanceEl = null;
        instnaceIconStyle = null;
        instanceStyle = null;
        cpuEl = null;
        cpuCount = null;
        cpuWrapEl = null;
        memEl = null;
        memCount = null;
        memWrapEl = null;
        bar = null;
        cpuWarpStyle = null;
        memWarpStyle = null;
        barStyle = null;
        cpuLabelStyle = null;
        cpuValueStyle = null;
        memLabelStyle = null;
        memValueStyle = null;
        wasName = null;
    },


    /**
     * 화면 좌측에 표시되는 그룹 목록 생성.
     * 각 그룹의 헤더부분에 CPU, Memory 를 표시한다.
     */
    createMarginLayer: function(){

        if (this.body == null) {
            return;
        }

        var target = this.body.el.dom;

        if (target == null) {
            return;
        }

        var titleInfoEl         = null;
        var titleElStyle        = 'height:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#b0b3b8;font-size:14px;float:left;width:42%;';
        titleElStyle           += (this.groupType === 0)? 'padding-right:8px;':'';

        var wrapperEl           = null;
        var instanceWrapEl      = null;
        var instanceIconEl      = null;
        var selectedIconEl      = null;
        var instnaceIconStyle   = 'position: absolute;top: 11px;left: 7px;background-color: #8cc252;width: 8px;height: 13px;';

        var instanceEl          = null;
        var instanceStyle       = 'height:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#b0b3b8;font-size:14px;float:left;width:100%;';
        instanceStyle          += (this.groupType === 0)? 'padding-right:8px;':'';

        var cpuEl               = null;
        var cpuCount            = null;
        var cpuWrapEl           = null;
        var memEl               = null;
        var memCount            = null;
        var memWrapEl           = null;
        var alarmEl             = null;

        var bar                 = null;

        var cpuWarpStyle    = 'float:left;margin-right:2px;';
        var memWarpStyle    = 'float:left;margin-right:2px;';
        var barStyle        = 'float:left;margin-right:2px;color:#b0b3b8;';

        var cpuLabelStyle   = 'position:relative;float:left;font-size:12px;margin-right: 3px;color:'  + this.defaultFontColor;
        var cpuValueStyle   = 'position:relative;float:right;font-size:12px;margin-right: 3px;color:' + this.defaultFontColor;
        var memLabelStyle   = 'position:relative;float:left;font-size:12px;margin-right: 3px;color:'  + this.defaultFontColor;
        var memValueStyle   = 'position:relative;float:right;font-size:12px;margin-right: 3px;color:' + this.defaultFontColor;

        var wasName         = null;

        ///////////////////////////////// title //////////////////////////////

        if (this.groupName != null) {

            this.titleWrap = target.appendChild(document.createElement('div'));
            this.titleWrap.className = 'titlewrap';

            this.titleEl = document.createElement('div');
            this.titleWrap.appendChild(this.titleEl);
            this.titleEl.setAttribute('style', titleElStyle + 'font-weight: bold;');
            this.titleEl.style.color = '#fff';
            this.titleEl.textContent = this.groupName;
            this.titleEl.className = 'opacity-hover';

            this.titleEl.onclick = this.titleClickEvent.bind(this);

            // expand 아이콘
            this.titleExpandIcon = this.titleWrap.appendChild(document.createElement('div'));
            this.titleExpandIcon.className = 'xm-frame-singleInstance-left-group-tool xm-frame-singleInstance-left-collapse';
            this.titleExpandIcon.dataset.expandflag = 1;
            this.titleExpandIcon.onclick = function(e) {
                var titleHeight = 39;
                var self = e.target;

                var items = this.up().items;
                var index = items.items.indexOf(this);

                if (self.dataset.expandflag == 0) {
                    // 펼쳐진 상태
                    self.dataset.expandflag = 1;
                    self.className = self.className.replace('xm-frame-singleInstance-left-expand', 'xm-frame-singleInstance-left-collapse');

                    items.items[index].setHeight(this._originalHeight);
                } else {
                    // 숨긴 상태
                    self.dataset.expandflag = 0;
                    self.className = self.className.replace('xm-frame-singleInstance-left-collapse', 'xm-frame-singleInstance-left-expand');

                    items.items[index].setHeight(titleHeight);
                }

                self  = null;
                items = null;
                index = null;
                titleInfoEl = null;

            }.bind(this);
        }


        for (var ix = 0, ixLen = this.wasList.length; ix < ixLen; ix++) {
            wasName   = this.wasList[ix].name;
            wrapperEl = document.createElement('div');
            wrapperEl.className = 'basewrap host';
            wrapperEl.dataset.index = ix;
            wrapperEl.dataset.wasName = wasName;

            alarmEl = document.createElement('div');
            alarmEl.className = 'alarm';

            //////////////// instance column set ///////////////////
            instanceWrapEl = document.createElement('div');
            instanceWrapEl.className = (this.groupType === 0)? 'host-waswrap':'biz-waswrap';
            instanceWrapEl.id = 'RTM-AGENT-'+Ext.id();

            instanceIconEl = document.createElement('div');
            instanceIconEl.setAttribute('style', instnaceIconStyle + 'background-color:' + this.wasList[ix].labelColor);

            selectedIconEl = document.createElement('div');
            selectedIconEl.className = 'was-selected-icon';

            instanceEl = document.createElement('div');
            instanceEl.setAttribute('style', instanceStyle);
            instanceEl.setAttribute('title', wasName);
            instanceEl.className = 'opacity-hover';
            instanceEl.textContent = wasName;

            instanceWrapEl.appendChild(instanceIconEl);
            instanceWrapEl.appendChild(instanceEl);

            if (ix === 0) {
                //////////////// CPU N Memory column set ///////////////////
                cpuWrapEl = document.createElement('div');
                cpuWrapEl.setAttribute('style', cpuWarpStyle);
                cpuWrapEl.className = 'opacity-hover';
                cpuWrapEl.dataset.statname = 'cpu';
                cpuWrapEl.dataset.kindstat = '2';

                cpuEl = document.createElement('div');
                cpuEl.setAttribute('style', cpuLabelStyle);
                cpuEl.textContent = 'CPU :';
                cpuCount = document.createElement('div');
                cpuCount.setAttribute('style', cpuValueStyle);
                cpuCount.textContent = 0;
                cpuWrapEl.appendChild(cpuEl);
                cpuWrapEl.appendChild(cpuCount);

                cpuWrapEl.onclick = this.jumpEvent;

                bar = document.createElement('div');
                bar.setAttribute('style', barStyle);
                bar.textContent = ' / ';

                memWrapEl = document.createElement('div');
                memWrapEl.setAttribute('style', memWarpStyle);
                memWrapEl.className = 'opacity-hover';
                memWrapEl.dataset.statname = 'mem';
                memWrapEl.dataset.kindstat = '2';

                memEl = document.createElement('div');
                memEl.setAttribute('style', memLabelStyle);
                memEl.textContent = 'MEM :';
                memCount = document.createElement('div');
                memCount.setAttribute('style', memValueStyle);
                memCount.textContent = 0;
                memWrapEl.appendChild(memEl);
                memWrapEl.appendChild(memCount);

                memWrapEl.onclick = this.jumpEvent;

                titleInfoEl = document.createElement('div');
                titleInfoEl.dataset.wasName = wasName;

                titleInfoEl.setAttribute('style', 'float:right;position:absolute;right:30px;');
                titleInfoEl.appendChild(cpuWrapEl);
                titleInfoEl.appendChild(bar);
                titleInfoEl.appendChild(memWrapEl);
            }

            instanceWrapEl.onclick = this.instanceClickEvent;

            instanceWrapEl.selectAgent = this.selectAgentEvent.bind(instanceWrapEl);

            common.RTMDataManager.addAgent(Comm.RTComm.getWASIdbyName(wasName), instanceWrapEl.id);

            wrapperEl.appendChild(selectedIconEl);
            wrapperEl.appendChild(instanceWrapEl);
            wrapperEl.appendChild(alarmEl);

            target.appendChild(document.createElement('div')).appendChild(wrapperEl);

            this.wasObjList[wasName] = {
                instanceEl      : instanceEl,
                instanceWrapEl  : instanceWrapEl,
                instanceIconEl  : instanceIconEl,
                cpuEl           : cpuEl,
                cpuCount        : cpuCount,
                memCount        : memCount,
                memEl           : memEl,
                wrapperEl       : wrapperEl,
                alarmEl         : alarmEl
            };
            if (this.wasListKey.indexOf(wasName) === -1) {
                this.wasListKey.push(wasName);
            }

        }

        if (titleInfoEl != null) {
            this.titleWrap.appendChild(titleInfoEl);
        }

        target         = null;
        wrapperEl      = null;
        titleInfoEl    = null;
        instanceWrapEl = null;
        instanceIconEl = null;
        selectedIconEl = null;
        instanceEl     = null;
        cpuEl          = null;
        cpuWrapEl      = null;
        memEl          = null;
        memWrapEl      = null;
        instnaceIconStyle = null;
        instanceStyle     = null;
        cpuCount = null;
        memCount = null;
        bar           = null;
        cpuWarpStyle  = null;
        memWarpStyle  = null;
        barStyle      = null;
        cpuLabelStyle = null;
        cpuValueStyle = null;
        memLabelStyle = null;
        memValueStyle = null;
        wasName       = null;
    },

    /**
     * Select Agent Event
     */
    selectAgentEvent: function() {
        $(this.parentElement.childNodes[0]).toggleClass('enable');
        $(this.parentElement).toggleClass('selected');
    },


    /**
     * Open Detail View
     */
    jumpEvent: function() {
        var wasName  = this.parentElement.dataset.wasName,
            wasID    = Comm.RTComm.getWASIdbyName(wasName),
            hostName = Comm.RTComm.HostRelWAS(wasID);

        if (realtime.ProcessMonitor == null) {
            realtime.ProcessMonitor = Ext.create('rtm.src.rtmProcessMonitor');
            realtime.ProcessMonitor.init();
            realtime.ProcessMonitor.selectTab(hostName);
            realtime.ProcessMonitor.pmWindow.on({
                beforeclose: function() {
                    Ext.Array.remove(Comm.onProcessMonitorTarget, realtime.ProcessMonitor);
                }
            });
            Comm.onProcessMonitorTarget.push(realtime.ProcessMonitor);
        } else {
            realtime.ProcessMonitor.selectTab(hostName);
            realtime.ProcessMonitor.pmWindow.show();
        }

        ix       = null;
        isTP     = null;
        wasName  = null;
        wasID    = null;
        hostName = null;

    },


    instanceClickEvent: function() {
        var wasName = arguments[0].path[2].dataset.wasName;

        if (!wasName) {
            return;
        }

        common.RTMDataManager.selectAgent(Comm.RTComm.getWASIdbyName(wasName));
        Ext.ComponentQuery.query('container[cls=rtm-base]')[0].wasSelect(wasName);

        if (Comm.RTComm.isSelectedWas() === false) {
            common.RTMDataManager.selectAgent('ALL');
        }
        realtime.SelectedGroupName = '';
    },

    titleClickEvent: function() {
        var ix, ixLen;

        if (Comm.RTComm.isSelectedWas() === true && this.isOverAll === false && realtime.SelectedGroupName === this.groupName) {
            var wasList = [];
            for (ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
                wasList[wasList.length] = {
                    name      : Comm.wasInfoObj[Comm.wasIdArr[ix]].wasName,
                    labelColor: Comm.wasInfoObj[Comm.wasIdArr[ix]].labelColor
                };
            }
            this.parentView.groupSelect(wasList, 0, 'OVERALL');

            common.RTMDataManager.clearSelectedAgent();
            common.RTMDataManager.selectAgent('ALL');

        } else {
            this.parentView.groupSelect(this.wasList, this.groupType, this.groupName);
            common.RTMDataManager.clearSelectedAgent();

            if (!this.isOverAll) {
                var wasName;
                for (ix = 0, ixLen = this.wasList.length; ix < ixLen; ix++) {
                    wasName = this.wasList[ix].name;

                    if (realtime.WasModeSelected.indexOf(wasName) === -1) {
                        realtime.WasModeSelected.push(wasName);
                    }
                    common.RTMDataManager.selectAgent(Comm.RTComm.getWASIdbyName(wasName));
                }
            } else {
                common.RTMDataManager.selectAgent('ALL');
            }
        }
        realtime.SelectedGroupName = this.groupName;
    },

    checkServerStatus: function() {
        var status  = null;
        var wasName = null;
        var wasObj  = null;
        var wasid   = null;

        if (Comm.Status.WAS === undefined || Comm.Status.WAS === null) {
            return;
        }

        for (var ix = 0, ixLen = Comm.wasIdArr.length; ix < ixLen; ix++) {
            wasid = Comm.wasIdArr[ix];

            if (Comm.wasInfoObj[wasid] == null) {
                continue;
            }
            wasName = Comm.wasInfoObj[wasid].wasName;

            // WAS
            wasObj = this.wasObjList[wasName];

            if (wasObj == null) {
                continue;
            }

            status = Comm.Status.WAS[wasid];

            if (Comm.RTComm.isDown(status) !== true && Comm.RTComm.isExpiredLicense(wasid) === true) {
                status = realtime.alarms.LICENSE;
            }

            switch (status) {
                case realtime.alarms.TP_DOWN :
                case realtime.alarms.SERVER_DOWN :
                case realtime.alarms.SERVER_HANG :
                    $(wasObj.wrapperEl).removeClass('disconnect');
                    $(wasObj.alarmEl).removeClass('disconnect');
                    $(wasObj.wrapperEl).addClass('nav-down');
                    $(wasObj.instanceWrapEl).addClass('alarm-on');
                    $(wasObj.alarmEl).addClass('on');
                    wasObj.alarmEl.textContent = 'DOWN';
                    wasObj.instanceEl.style.color = this.defaultFontColor;
                    break;

                case realtime.alarms.DISCONNECTED :
                    $(wasObj.wrapperEl).addClass('nav-down disconnect');
                    $(wasObj.alarmEl).addClass('on disconnect');
                    $(wasObj.instanceWrapEl).addClass('alarm-on');
                    wasObj.alarmEl.textContent = 'DISCONNECT';
                    wasObj.instanceEl.style.color = this.defaultFontColor;
                    break;

                case realtime.alarms.LICENSE  :
                    $(wasObj.wrapperEl).removeClass('disconnect');
                    $(wasObj.alarmEl).removeClass('disconnect');
                    $(wasObj.wrapperEl).addClass('nav-down');
                    $(wasObj.instanceWrapEl).addClass('alarm-on');
                    $(wasObj.alarmEl).addClass('on');
                    wasObj.alarmEl.textContent = 'LICENSE';
                    wasObj.instanceEl.style.color = this.defaultFontColor;
                    break;

                default :
                    $(wasObj.wrapperEl).removeClass('nav-down disconnect');
                    $(wasObj.alarmEl).removeClass('on disconnect');
                    $(wasObj.instanceWrapEl).removeClass('alarm-on');
                    wasObj.alarmEl.textContent = null;
                    break;
            }

        }

        ix      = null;
        ixLen   = null;
        wasid   = null;
        wasName = null;
        wasObj  = null;
        status  = null;

    },


    /**
     * 이벤트 알람 데이터
     * RTMDataManager.frameGroup에서 사용
     *
     * 0: time
     * 1: server_type   (1: WAS, 2: DB, 3:WEB-SERVER)
     * 2: server_id
     * 3: server_name
     * 4: alert_resource_name
     * 5: value
     * 6: alert_level
     * 7: levelType
     * 8: alert_type
     * 9: descr
     *
     * @param {Object} data
     */
    onAlarm: function(adata) {
        if (adata == null || 1 !== adata[1]) {
            adata = null;
            return;
        }

        this.drawAlarm(adata);

        adata = null;
    },


    /**
     * 이벤트 알람 정보 표시
     */
    drawAlarm: function(data) {
        var wasElement;

        var wasId       = data[2];
        var wasName     = data[3];
        var alert_name  = data[4];
        var alert_value = data[5];
        var alert_level = data[6];
        var alert_descr = data[9];

        if (!wasName) {
            wasName = Comm.RTComm.getWASNamebyId(wasId);
        }

        var wasObj      = this.wasObjList[wasName];

        if (alert_name.toLocaleLowerCase() === 'license' && alert_level > 0 &&
            alert_descr && alert_descr.toLocaleLowerCase() === 'unlimited') {
            alert_level = 0;
        }

        var isDefaultAlarm  = false;

        if (wasObj != null) {

            // 알람 레벨에 따른 폰트 스타일 설정.
            switch (alert_level) {
                case 2 :
                    this.fontWeight    = 'bold';
                    this.fontColor     = this.criticalFontColor;
                    this.instanceColor = this.criticalFontColor;
                    break;

                case 1 :
                    this.fontWeight    = 'bold';
                    this.fontColor     = this.warningFontColor;
                    this.instanceColor = this.warningFontColor;
                    break;

                default :
                    this.fontWeight    = 'normal';
                    this.fontColor     = this.defaultFontColor;
                    this.instanceColor = this.defaultFontColor;
                    break;
            }

            if (alert_level === 0) {
                this.deleteAlarmInfo(wasName, alert_name);
            }

            wasElement = wasObj.instanceEl;

            if (wasElement.style.color !== this.criticalFontColor) {
                wasElement.style.color = this.instanceColor;
            }
            wasElement.style.fontWeight = this.fontWeight;

            switch (alert_name) {
                case realtime.alarms.OS_CPU :
                    wasObj.cpuEl.style.color    = this.fontColor;
                    wasObj.cpuCount.style.color = this.fontColor;
                    wasObj.cpuCount.textContent = alert_value;
                    break;

                case realtime.alarms.OS_FREE_MEM :
                    wasObj.memEl.style.color    = this.fontColor;
                    wasObj.memCount.style.color = this.fontColor;
                    wasObj.memCount.textContent = alert_value;
                    break;

                case realtime.alarms.CONNECTED :
                case realtime.alarms.SERVER_BOOT :
                case realtime.alarms.TP_BOOT :
                    if (Comm.RTComm.isExpiredLicense(wasId) !== true) {
                        $(wasObj.wrapperEl).removeClass('nav-down disconnect');
                        $(wasObj.instanceWrapEl).removeClass('alarm-on');
                        $(wasObj.alarmEl).removeClass('on disconnect');
                        wasObj.alarmEl.textContent = null;
                        wasElement.style.color = this.defaultFontColor;
                    } else {
                        wasObj.alarmEl.textContent = 'LICENSE';
                    }
                    break;

                case realtime.alarms.TP_DOWN :
                case realtime.alarms.SERVER_DOWN :
                case realtime.alarms.SERVER_HANG :
                    $(wasObj.wrapperEl).removeClass('disconnect');
                    $(wasObj.alarmEl).removeClass('disconnect');
                    $(wasObj.wrapperEl).addClass('nav-down');
                    $(wasObj.alarmEl).addClass('on');
                    $(wasObj.instanceWrapEl).addClass('alarm-on');
                    wasObj.alarmEl.textContent = 'DOWN';
                    wasElement.style.color = this.defaultFontColor;
                    break;

                case realtime.alarms.DISCONNECTED :
                    $(wasObj.wrapperEl).addClass('nav-down disconnect');
                    $(wasObj.alarmEl).addClass('on disconnect');
                    $(wasObj.instanceWrapEl).addClass('alarm-on');
                    wasObj.alarmEl.textContent = 'DISCONNECT';
                    wasElement.style.color = this.defaultFontColor;
                    break;

                case realtime.alarms.LICENSE  :
                    if (alert_value < 0) {
                        $(wasObj.wrapperEl).removeClass('disconnect');
                        $(wasObj.alarmEl).removeClass('disconnect');
                        $(wasObj.wrapperEl).addClass('nav-down');
                        $(wasObj.instanceWrapEl).addClass('alarm-on');
                        $(wasObj.alarmEl).addClass('on');
                        wasObj.alarmEl.textContent = 'LICENSE';
                        wasObj.instanceEl.style.color = this.defaultFontColor;
                    } else {
                        isDefaultAlarm = true;
                    }
                    break;

                default:
                    isDefaultAlarm = true;
            }

            if (isDefaultAlarm) {
                this.setAlarmList(wasName, alert_name, alert_level);
            }

        }

        wasElement  = null;
        wasObj      = null;
        wasName     = null;
        alert_name  = null;
        data        = null;
    },


    /**
     * 좌측 메뉴에 표시되는 알람 목록을 설정.
     *
     * @param {string} wasName
     * @param {string} alert_name
     * @param {number} alert_level
     */
    setAlarmList: function(wasName, alert_name, alert_level) {
        if (this.alarmList[wasName] == null) {
            this.alarmList[wasName] = {};
        }
        if (this.alarmList[wasName][alert_name] == null) {
            this.alarmList[wasName][alert_name] = {};
        }
        this.alarmList[wasName][alert_name] = {
            lastTime   : +new Date()
        };

        this.addIdx = this.alarmNameArr.length;

        for (var ix = 0, ixLen = this.alarmNameArr.length; ix < ixLen; ix++) {
            if (wasName === this.alarmNameArr[ix].wasName && alert_name === this.alarmNameArr[ix].alertName) {
                this.addIdx = ix;
                break;
            }
        }
        this.alarmNameArr[this.addIdx] = {
            wasName   : wasName,
            alertName : alert_name,
            alertLevel: alert_level
        };
    },


    /**
     * 알람 삭제
     */
    deleteAlarmInfo: function(wasName, alertName) {
        var wasObj = this.wasObjList[wasName];

        if (wasObj != null) {
            if (this.alarmList[wasName] && this.alarmList[wasName][alertName]) {
                delete this.alarmList[wasName][alertName];
            }

            if (Ext.Object.isEmpty(this.alarmList[wasName])) {
                this.alarmList[wasName] = null;
            }

            for (var ix = 0, ixLen = this.alarmNameArr.length; ix < ixLen;) {
                if (this.alarmNameArr[ix] && wasName === this.alarmNameArr[ix].wasName && alertName === this.alarmNameArr[ix].alertName) {
                    Ext.Array.removeAt(this.alarmNameArr, ix);
                    ix--;
                }
                ix++;
            }

            wasObj = null;
        }

        this.updateAlarmInfo(wasName, alertName);

        wasName   = null;
        alertName = null;
    },


    updateAlarmInfo: function(wasName, alertName) {
        var wasObj = this.wasObjList[wasName];
        var maxLevel = 0;

        if (wasObj != null) {
            if (Ext.Object.isEmpty(this.alarmList[wasName])) {
                this.alarmList[wasName] = null;

                wasObj.instanceEl.style.color = this.defaultFontColor;
                wasObj.instanceEl.style.fontWeight = 'normal';
            }

            for (var ix = 0, ixLen = this.alarmNameArr.length; ix < ixLen; ix++) {
                if (wasName === this.alarmNameArr[ix].wasName &&
                    alertName === this.alarmNameArr[ix].alertName &&
                    maxLevel < this.alarmNameArr[ix].alertLevel) {
                    maxLevel = this.alarmNameArr[ix].alertLevel;
                }
            }
            switch (maxLevel) {
                case 2 :
                    wasObj.instanceEl.style.fontWeight = 'bold';
                    wasObj.instanceEl.style.color      = this.criticalFontColor;
                    break;
                case 1 :
                    wasObj.instanceEl.style.fontWeight = 'bold';
                    wasObj.instanceEl.style.color      = this.warningFontColor;
                    break;
                default :
                    wasObj.instanceEl.style.fontWeight = 'normal';
                    wasObj.instanceEl.style.color      = this.defaultFontColor;
                    break;
            }

            wasObj    = null;
            maxLevel  = null;
        }
    },


    /**
     * 알람 체크
     */
    clearAlarm: function() {
        this.diffSec = 0;
        var name, alert;

        for (var ix = 0, ixLen = this.alarmNameArr.length; ix < ixLen; ix++) {
            if (this.alarmNameArr[ix] == null) {
                continue;
            }
            name  = this.alarmNameArr[ix].wasName;
            alert = this.alarmNameArr[ix].alertName;

            // Server Down, Server Hang, Disconnected 이외의 알람에 대해서
            // 설정한 시간안에 알람데이터가 오지 않는 경우 화면에서 삭제처리한다.
            if (!Ext.Array.contains(realtime.downAlarms, alert) &&
                this.alarmList[name] && this.alarmList[name][alert]) {

                this.diffSec = Ext.Date.diff(this.alarmList[name][alert].lastTime , new Date(), Ext.Date.SECOND);
                if (this.diffSec > 3) {
                    this.deleteAlarmInfo(name, alert);
                }
            }
        }

        this.checkServerStatus();

        name  = null;
        alert = null;
    }


});