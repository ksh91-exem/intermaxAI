Ext.define('Exem.WidgetTaskStatus', {
    extend : 'Ext.Component',
    alias  : 'widget.TaskStatus',
    layout : 'fit',
    cls    : 'widgetTaskStatus',
    listeners: {
        destroy : function() {
            if(this.barTooltip){
                this.hideBarToolTip();
            }

            common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, this);
        }
    },

    init: function(column, widget, record) {
        if(this.barTooltip){
            this.hideBarToolTip();
        }

        if(!this.frame){
            common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this);
            this.frame = true;
        }

        this.initProperty(record.data);
        this.drawManager();
    },

    initProperty: function(data){
        var that = this;
        var theme = Comm.RTComm.getCurrentTheme();

        // 데이터 관련
        this.linear    = d3.scale.linear();
        this.normal    = 0;
        this.warning   = 0;
        this.critical  = 0;
        this.bizId     = +data.bizId;
        this.tierList  = this.setTierList();
        this.packetKey = data.packetKey;
        this.gridCnt   = data.gridCnt;
        this.parent    = data.parent;
        this.parentId  = data.parentId;


        var labelStyle = {
            fontSize : 12,
            fontFamily : 'Droid Sans'
        };

        this.COLOR = {
            BACKGROUND            : "#2C2F36",
            BLACK                 : "#181B24",
            LEGEND                : "#4C5960",
            LABEL                 : "#ABAEB5",
            SERVER_NORMAL         : "#72B826",
            SERVER_NORMAL_LIGHT   : "#7FCD2A",
            SERVER_WARNING        : "#F69E1E",
            SERVER_WARNING_LIGHT  : "#F8B656",
            SERVER_CRITICAL       : "#F6191A",
            SERVER_CRITICAL_LIGHT : "#F85353",
            SERVER_DOWN           : "#393c43"
        };

        this.popupFrame = {
            'activeTxnList'      : 'rtm.src.rtmActiveTxnList',
            'trackByTaskDetail'  : 'rtm.src.rtmTrackByTaskDetail'
        };

        var girdLineColor, borderColor;

        switch (theme) {
            case 'Black' :
                labelStyle.color = realtime.lineChartColor.BLACK.label;
                girdLineColor    = realtime.lineChartColor.BLACK.gridLine;
                borderColor      = realtime.lineChartColor.BLACK.border;
                break;
            case 'Gray' :
                labelStyle.color = realtime.lineChartColor.GRAY.label;
                girdLineColor    = realtime.lineChartColor.GRAY.gridLine;
                borderColor      = realtime.lineChartColor.GRAY.border;
                break;
            default :
                labelStyle.color = realtime.lineChartColor.WHITE.label;
                girdLineColor    = realtime.lineChartColor.WHITE.gridLine;
                borderColor      = realtime.lineChartColor.WHITE.border;
                break;
        };

        this.iconImg = {
            src   : '../images/topology_icon.png'
        };
        this.iconPt = {
            graph : {x: 37,   y: 340,   w: 14,  h: 14},
            zoom  : {x: 37,   y: 324,   w: 14,  h: 14},
            bell  : {x: 12,   y: 340,   w: 13,  h: 15},
            xview : {x: 12,   y: 324,   w: 13,  h: 15}
        };

        this.image = new Image();
        this.image.src = this.iconImg.src;
        this.image.onload = function(){
            that.imgLoaded = true;
        };


        // 2등분으로 사용하기로 하면 이 부분을 사용할 것
        this.posXMove = [-0.6, 0.6];
        this.posYMove = [0, 0];
        this.startAng = [0.5, 1.5];
        this.endAng   = [1.5, 0.5];


        // 4등분으로 사용하기로 되면 이 부분을 사용할 것
        // this.posXMove = [0.5, 0.5, -0.5, -0.5];
        // this.posYMove = [0.5, -0.5, 0.5, -0.5];
        // this.startAng = [0, 1.5, 0.5, 1];
        // this.endAng   = [0.5, 2, 1, 1.5];

        this.eventFnManager = {
            'click'    : null,
            'mousemove': null
        };

        if(this.getEl()){
            this.container = document.createElement('div');

            this.canvas = document.createElement('canvas');	// 메인 뷰 캔버스
            this.canvasDark = document.createElement('canvas');
            this.canvasImg = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.ctxDark = this.canvas.getContext('2d');
            this.ctxImg = this.canvasImg.getContext('2d');

            this.el.dom.appendChild(this.canvas);
            this.el.dom.appendChild(this.canvasImg);

            this.canvas.width = this.lastBox.width;
            this.canvas.style.width = this.lastBox.width + 'px';
            this.canvas.height = 53;
            this.canvas.style.height = '53px';

            this.canvasDark.width = this.lastBox.width;
            this.canvasDark.style.width = this.lastBox.width + 'px';
            this.canvasDark.height = 53;
            this.canvasDark.style.height = '53px';

            this.canvasImg.width = this.lastBox.width;
            this.canvasImg.style.width = this.lastBox.width + 'px';
            this.canvasImg.height = 53;
            this.canvasImg.style.height = '53px';

            this.canvasImg.addEventListener('mousemove', function(e){
                that.rect = this.getBoundingClientRect();
                var pos = [
                    e.clientX - that.rect.left,
                    e.clientY - that.rect.top
                ];
                that.checkMousePos(that, pos, 'mousemove');
            });

            this.canvasImg.addEventListener('mouseleave', function(e){
                that.drawManager();
                that.cursorChanged = false;
                that.el.dom.style.cursor = 'default';
            });

            this.canvasImg.addEventListener('click', function(e){
                that.rect = this.getBoundingClientRect();
                var pos = [
                    e.clientX - that.rect.left,
                    e.clientY - that.rect.top
                ];
                that.checkMousePos(that, pos, 'click');
            });

            this.createClickToolTip();

            this.isReturn = false;

            // 알람 정보 데이터
            this.alarmStatus = ['normal', 'warning', 'critical', 'down'];
            this.alarmColor  = [this.COLOR.SERVER_NORMAL, this.COLOR.SERVER_WARNING, this.COLOR.SERVER_CRITICAL, this.COLOR.SERVER_DOWN];
            this.alarmInfos  = this.prevAlarmInfos ? common.Util.deepObjCopy(this.prevAlarmInfos) : {};
            this.maxLevel    = this.prevLevel || 0;
            this.color       = this.prevColor || this.alarmColor[this.maxLevel];
            this.wn          = $(this.canvasImg);

            this.setWidgetColumnColor();

        }else{
            this.isReturn = true;
        }

    },

    createClickToolTip: function(){
        var that = this;

        this.barTooltip = $('<div class="stackbar-chart-tooltip tooltipPanel barTooltip"></div>').css({
            'position': 'absolute',
            'display' : 'none',
            'z-index' : 20000,
            'color'   : this.COLOR.LABEL,
            'background-color': '#111111',
            'padding' : '5px 0px 0px 3px',
            'border'  : '1px solid #A3A3A3',
            'border-radius': '4px',
            'width'   : 100
        });

        this.barTail = $('<div class="barTail"></div>').css({
            'position': 'absolute',
            'width'   : 6,
            'height'  : 6,
            'z-index' : 30000,
            'background-color': '#111111',
            'transform'    : 'rotate(45deg)'
        });

        this.barTooltip.append(this.barTail);

        this.barTooltip.bind('mouseleave', function(e) {
            e.preventDefault();

            that.el.dom.style.cursor = 'default';

            that.barTooltip.css({'display': 'none'});
        });
        this.barTooltip.bind('mouseenter', function(e) {
            e.preventDefault();

            that.el.dom.style.cursor = 'pointer';

            that.barTooltip.css({'display': 'block'});
        });
    },

    setTierList: function(){
        var ix, tierList;

        tierList = [];

        for(ix in Comm.tierInfo){
            Comm.tierInfo[ix].serverList.map(function(d){
                if(tierList.indexOf(d) === -1){
                    tierList.push(d + '');
                }
            })
        }

        return tierList;
    },

    getTierName: function(tierId){
        var ix, ixLen, sortTier;

        sortTier = Comm.sortTierInfo;

        for(ix = 0, ixLen = sortTier.length; ix < ixLen; ix++){
            if(sortTier[ix].tierId === tierId){
                return sortTier[ix].tierName;
            }
        }

        return null;
    },

    drawManager: function() {
        if(this.isReturn){
            return;
        }

        if(!this.imgLoaded){
            setTimeout(this.drawManager.bind(this), 10);
            return;
        }


        var posX, posY;

        posX  = this.canvas.width / 2;
        posY  = this.canvas.height / 2;
        this.radian = (this.canvas.width < this.canvas.height) ? this.canvas.width / 2 : this.canvas.height / 2;
        this.radian += 0.7;

        this.posX = posX;
        this.posY = posY;

        this.clearCanvas(this.ctx, this.canvas);
        this.clearCanvas(this.ctxDark, this.canvasDark);
        this.clearCanvas(this.ctxImg, this.canvasImg);

        this.drawBackground(posX, posY, this.radian);
        this.drawImage(posX, posY);
    },

    drawBackground: function(x, y, r){
        var ix, ixLen;

        this.ctx.save();

        //Background
        this.ctx.fillStyle = this.COLOR.BLACK;
        this.ctx.beginPath();

        //2등분
        this.ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);
        //4등분
        // this.ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);

        this.ctx.lineTo(x, y);
        this.ctx.fill();

        //Server Status

        this.ctx.fillStyle = this.color;

        //2등분
        ixLen = 2;
        //4등분
        // ixLen = 4;

        for(ix = 0; ix < ixLen; ix++){
            this.ctx.beginPath();
            this.ctx.arc(x + this.posXMove[ix], y + this.posYMove[ix], r - 3, Math.PI * this.startAng[ix], Math.PI * this.endAng[ix]);
            this.ctx.lineTo(x + this.posXMove[ix], y + this.posYMove[ix]);
            this.ctx.fill();
        }

        this.ctx.restore();
    },

    drawImage: function(x, y){
        if(this.isReturn){
            return;
        }

        var iconPt;

        iconPt = this.iconPt;

        this.ctxImg.save();

        //2등분
        this.ctxImg.drawImage(
            this.image, iconPt['zoom'].x, iconPt['zoom'].y, iconPt['zoom'].w, iconPt['zoom'].h,
            x + 6, y- 6, iconPt['zoom'].w, iconPt['zoom'].h
        );
        this.ctxImg.drawImage(
            this.image, iconPt['xview'].x, iconPt['xview'].y, iconPt['xview'].w, iconPt['xview'].h,
            x - 18, y - 6, iconPt['xview'].w, iconPt['xview'].h
        );

        //4등분
        // this.ctxImg.drawImage(
        //     this.image, iconPt['zoom'].x, iconPt['zoom'].y, iconPt['zoom'].w, iconPt['zoom'].h,
        //     x + 6, y - 16, iconPt['zoom'].w, iconPt['zoom'].h
        // );
        // this.ctxImg.drawImage(
        //     this.image, iconPt['graph'].x, iconPt['graph'].y, iconPt['graph'].w, iconPt['graph'].h,
        //     x + 5, y + 2, iconPt['graph'].w, iconPt['graph'].h
        // );
        // this.ctxImg.drawImage(
        //     this.image, iconPt['bell'].x, iconPt['bell'].y, iconPt['bell'].w, iconPt['bell'].h,
        //     x - 17, y + 2, iconPt['bell'].w, iconPt['bell'].h
        // );
        // this.ctxImg.drawImage(
        //     this.image, iconPt['xview'].x, iconPt['xview'].y, iconPt['xview'].w, iconPt['xview'].h,
        //     x - 17, y - 16, iconPt['xview'].w, iconPt['xview'].h
        // );

        this.ctxImg.restore();
    },

    drawDarkLayer: function(x, y, imgName){
        var r, moveX, moveY, startAng, endAng;

        r = this.radian;

        this.drawManager();

        this.ctxDark.save();
        this.ctxDark.beginPath();
        this.ctxDark.fillStyle = 'rgba(24, 27, 36, 0.5)';

        //2등분
        switch(imgName){
            case 'zoom':
                moveX = x + 0.5;
                moveY = r - 1;
                startAng = 1.5;
                endAng   = 0.5;
                break;
            case 'xview':
                moveX = x - 0.5;
                moveY = r - 1;
                startAng = 0.5;
                endAng   = 1.5;
                break;
            default:
        }

        //4등분
        // switch(imgName){
        //     case 'zoom':
        //         moveX = x + 0.5;
        //         moveY = y - 0.5;
        //         startAng = 1.5;
        //         endAng = 2;
        //         break;
        //     case 'graph':
        //         moveX = x + 0.5;
        //         moveY = y + 0.5;
        //         startAng = 0;
        //         endAng = 0.5;
        //         break;
        //     case 'xview':
        //         moveX = x - 0.5;
        //         moveY = y - 0.5;
        //         startAng = 1;
        //         endAng = 1.5;
        //         break;
        //     case 'bell':
        //         moveX = x - 0.5;
        //         moveY = y + 0.5;
        //         startAng = 0.5;
        //         endAng = 1;
        //         break;
        //     default:
        // }

        this.ctxDark.arc(moveX, moveY, r - 3, Math.PI * startAng, Math.PI * endAng);
        this.ctxDark.lineTo(moveX, moveY);
        this.ctxDark.fill();
        this.ctxDark.restore();
    },

    getDataRange: function(nor, war, cri){
        var sum, range;

        sum = nor + war + cri;
        range = this.linear.domain([0, sum]).range([0, 30]);

        return {'normal': range(nor), 'warning': range(war), 'critical': range(cri), 'none': 0};
    },

    clearCanvas: function(ctx, canvas){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    checkMousePos: function(_this, pos, eventName){
        if(!_this){
            return;
        }

        var x, y;

        x = this.canvas.width / 2;
        y = this.canvas.height / 2;

        if(!_this.eventFnManager.mousemove){
            _this.eventFnManager.mousemove = _mouseMove;
        }
        if(!_this.eventFnManager.click){
            _this.eventFnManager.click = _click;
        }

        if(Math.pow(pos[0] - x, 2) + Math.pow(pos[1] - y, 2) <= Math.pow(this.radian - 2, 2)){
            _this.eventFnManager[eventName](this, pos, x, y);
        }else{
            _removeMouseMove(this);
        }

        function _mouseMove(_this, pos, x, y){
            var ix, imgName;


            if(_this.clicked){
                _this.showBarToolTip();
            }

            //2등분
            if(pos[0] >= x) {
                imgName = 'zoom';
            }else{
                imgName = 'xview';
            }

            //4등분
            // if(pos[0] >= x){
            //     if(pos[1] >= y){
            //         imgName = 'graph';
            //     }else{
            //         imgName = 'zoom';
            //     }
            // }else{
            //     if(pos[1] >= y){
            //         imgName = 'bell';
            //     }else{
            //         imgName = 'xview';
            //     }
            // }

            _this.drawDarkLayer.call(_this, x, y, imgName);
            _this.el.dom.style.cursor = 'pointer';
            _this.cursorChanged = true;
        }

        function _removeMouseMove(_this){
            _this.drawManager();
            _this.cursorChanged = false;
            _this.el.dom.style.cursor = 'default';

            _this.barTooltip.css('display', 'none');
            _this.clicked = false;
        }

        function _click(_this, pos, x, y){
            var ix, jx;
            var lastBusinessId, monitorType, agentIdList, typeList, split, isReturn;
            var popupType;

            agentIdList = _this.tierList;
            monitorType = _this._getMonitorType(agentIdList);
            typeList = _this._getAllTypeList(agentIdList);
            lastBusinessId = -1;

            for(ix in Repository.BizData){
                for(jx in Repository.BizData[ix]){

                    split = Repository.BizData[ix][jx].TREE_KEY.split('-');

                    if(+split[0] === +_this.bizId){
                        lastBusinessId = +split[split.length - 1];
                        isReturn = 1;
                        break;
                    }
                }

                if(isReturn){
                    break;
                }
            }

            //2등분
            if(monitorType === 'CD'){
                popupType = 'transaction';
            }else{
                if(pos[0] <= x){
                    popupType = 'transaction';
                }else{
                    popupType = 'active';
                }
            }
            _this.showClickToolTipDetail(typeList, popupType, lastBusinessId, agentIdList, _this.bizId, _this.tierList, monitorType, pos[0], pos[1]);

            // if(pos[0] >= x){
            //     common.OpenView.onMenuPopup(_this.popupFrame.activeTxnList, {'tier_list': _this.tierList, 'business_id': _this.bizId});
            // }else{
            //     popupOptions = 'width=850px,height=550px';
            //     // localStorage.setItem('bizName', );
            //     realtime.txnPopupMonitorWindow = window.open('../txnDetail/transaction.html', 'IMX_Transaction_Trend_Popup_Monitor', popupOptions);
            //     realtime.bizId = _this.bizId;
            //     realtime.bizData = Repository.BizData;
            //     realtime.agentIdList = _this.tierList;
            //     realtime.isBizView = true;
            //     realtime.bizViewRefresh = true;
            //     realtime.txnPopupMonitorType = Comm.RTComm.getServerTypeById(+realtime.agentIdList[0]);
            // }
        }
    },

    showClickToolTipDetail: function (typeList, popupType, lastBusinessId, agentIdList, businessId, tierList, monitorType, x, y) {
        var ix, ixLen, that, _x, _y, CDIdx;
        var updateStr, status, offset, marginCheck, top, left, clsType, scrollTop;

        CDIdx = typeList.indexOf('CD');


        if(typeList.length === 1){
            if(popupType === 'transaction'){
                this.openTxnPopup(lastBusinessId, agentIdList, typeList[0]);

            }else if(popupType === 'active'){
                this.openActivePopup(businessId, tierList, typeList[0]);

            }

            this.hideBarToolTip();

            return;
        }else if(typeList.length === 2){
            if(popupType === 'active') {
                if (CDIdx !== -1) {
                    typeList.splice(CDIdx, 1);
                }

                this.openActivePopup(businessId, tierList, typeList[0]);

                this.hideBarToolTip();

                return;
            }
        }

        _x = x;
        _y = y;
        that = this;

        updateStr = '';
        offset = this.wn.offset();
        scrollTop = this.wn.scrollTop();
        marginCheck = _x + offset.left + this.barTooltip.width();

        if(marginCheck < window.screen.width){
            top  = _y + offset.top - scrollTop;
            left = _x + offset.left;
            clsType = 'tailLeft';
        }
        else{
            top  = _y + offset.top - scrollTop;
            left = _x + offset.left - this.barTooltip.width() - 30;
            clsType = 'tailRight';
        }

        if(popupType === 'active'){
            if(typeList.indexOf('CD') !== -1){
                typeList.splice(typeList.indexOf('CD'),1);
            }
        }

        for (ix = 0, ixLen = typeList.length; ix < ixLen; ix++) {

            updateStr +=
                '<div style="float: left;width: 60%;margin-left: 9px;">' +
                '<div class="tierName" style="margin-bottom: 4px;font-size: 14px;">'+typeList[ix]+'</div>'+
                '</div>';
        }

        if(this.barTooltip) {
            this.barTooltip.remove();
            this.createClickToolTip();
            this.barTail.removeClass('tailLeft').removeClass('tailRight').addClass(clsType);
        }
        this.barTooltip.append(updateStr);
        $('body').append(this.barTooltip);

        this.barTooltip.css({
            'top': top,
            'left': left,
            'display': 'block'
        });

        this.clicked = true;

        this.barTooltip.find('.tierName').bind('mouseenter', function(e){
            this.style.cursor = 'pointer';
        });

        this.barTooltip.find('.tierName').bind('click', function(){
            var ix, target, type, fileName, wasIdList;

            target = arguments[0].target;
            type = target.innerText;
            wasIdList = [];
            status = Object.keys(Comm.Status[type]);

            for(ix = 0, ixLen = agentIdList.length; ix < ixLen; ix++){
                if(Comm.RTComm.getServerTypeById(+agentIdList[ix]) === type){
                    wasIdList.push(agentIdList[ix]);
                }
            }

            if(popupType === 'transaction'){
                that.openTxnPopup(lastBusinessId, wasIdList, type);

            }else if(popupType === 'active'){
                that.openActivePopup(businessId, tier, type);

            }

            that.hideBarToolTip();
        });
    },

    showBarToolTip: function(){
        this.barTooltip.css('display', 'block');
        this.clicked = true;
    },

    hideBarToolTip: function(){
        this.barTooltip.css('display', 'none');
        this.clicked = false;
    },

    openTxnPopup: function(lastBusinessId, wasIdList, type){
        var popupOptions;

        popupOptions= 'width=850px,height=550px';

        realtime.txnPopupMonitorWindow = window.open('../txnDetail/transaction.html', 'IMX_Transaction_Trend_Popup_Monitor', popupOptions);
        realtime.bizId = lastBusinessId;
        realtime.bizData = Repository.BizData;
        realtime.agentIdList = wasIdList;
        realtime.isBizView = true;
        realtime.bizViewRefresh = true;
        realtime.txnPopupMonitorType = type;

        if (!realtime.txnPopupMonitorType) {
            Ext.Msg.show({
                title: common.Util.TR('ERROR'),
                msg: common.Util.TR('No found the appropriate monitor type.'),
                buttons: Ext.Msg.OK,
                icon: Ext.MessageBox.ERROR
            });
        }
    },

    openActivePopup: function(businessId, tier, type){
        var fileName;

        switch(type){
            case 'TP':
                fileName = this.popupFrame.TPActiveTxnList;
                break;
            case 'WEB':
                fileName = this.popupFrame.WebActiveTxnList;
                break;
            case 'WAS':
                fileName = this.popupFrame.activeTxnList;
                break;
        }

        common.OpenView.onMenuPopup(fileName, {
            'tier_list': this.tierList,
            'business_id': businessId,
            'monitorType': type
        });
    },

    getMaxAlarmLevel: function () {
        var ix, ixLen, jx, jxLen, kx, kxLen;
        var keys, alarm;
        var bizId, tierId;
        var bizTierKeys;
        var nodeKey, alarmGroup, serverKeys, serverName, alarmList, alarmKeys, alarmName;

        var alarmInfoObj = Object.keys(this.alarmInfos);
        var maxLevel = 0;

        for (kx = 0, kxLen = alarmInfoObj.length; kx < kxLen; kx++) {
            nodeKey     = alarmInfoObj[kx];
            alarmGroup  = this.alarmInfos[nodeKey];

            bizTierKeys = nodeKey.split('_');
            bizId  = bizTierKeys[0];
            tierId = bizTierKeys[1];

            if (+bizId !== this.bizId) {
                continue;
            }

            serverKeys = Object.keys(alarmGroup);

            for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
                serverName = serverKeys[ix];
                alarmList  = alarmGroup[serverName];
                alarmKeys  = Object.keys(alarmList);

                for (jx = 0, jxLen = alarmKeys.length; jx < jxLen; jx++) {
                    alarmName = alarmKeys[jx];
                    alarm     = alarmList[alarmName];

                    if (alarm[6] != null && alarm.length > 7) {
                        maxLevel = Math.max(alarm[6], maxLevel);
                    }

                    if (maxLevel === 2) {
                        break;
                    }
                }
            }
        }

        this.maxLevel = maxLevel;
        this.prevLevel = this.maxLevel;
    },

    _getAllTypeList: function(agentList){
        var ix, ixLen, type, typeList;

        typeList = [];

        for(ix = 0, ixLen = agentList.length; ix < ixLen; ix++){
            type = Comm.RTComm.getServerTypeById(+agentList[ix]);

            if(typeList.indexOf(type) === -1){
                typeList.push(type);
            }
        }

        return typeList;
    },

    /**
     * 모니터 타입을 반환. idList중 한 개라도 CDM이 아닌 다른 타입이 있을 경우 해당 타입 반환
     * 모니터 타입이 CD 한개만 있으면 'CD' 반환
     *
     * @param {Array} - was id list
     * @return {String} - E2E | CD
     */
    _getMonitorType: function(idList){
        if(!Comm.wasInfoObj || !idList.length){
            return;
        }

        var ix, ixLen, status;

        status = Comm.wasInfoObj;

        for (ix = 0, ixLen = idList.length; ix < ixLen; ix++) {
            if (status[idList[ix]].type !== 'CD') {
                return status[idList[ix]].type;
            }
        }

        // console.debug('No found the appropriate monitor type.');
        return 'CD';
    },

    _getTopBizId: function(lastBizId){
        var ix, ixLen, jx, jxLen, parentId;

        for(ix = 0, ixLen = Comm.businessRegisterInfo.length; ix < ixLen; ix++){
            parentId = Comm.businessRegisterInfo[ix].parent.bizId;

            if(parentId === lastBizId){
                return parentId;
            }

            for(jx = 0, jxLen = Comm.businessRegisterInfo[ix].child.length; jx < jxLen; jx++){
                if(Comm.businessRegisterInfo[ix].child[jx].bizId === +lastBizId){
                    return parentId;
                }
            }
        }

        return 0;
    },

    setAlarminfo: function(data) {
        var time         = data[0];
        var serverType   = data[1];
        var serverID     = data[2];

        var alarmResName = data[4];
        var alarmValue   = data[5];
        var alarmLevel   = data[6];
        var levelType    = data[7];
        var alarmType    = data[8];
        var descr        = data[9];
        var resID        = data[10];
        var alarmKey     = data[4];

        var tierID       = data[11];
        var businessID   = data[12];
        var warning      = data[13];
        var critical     = data[14];
        var customData   = data[15];

        var serverName;
        if (serverType === 20) {
            if(Comm.etoeBizInfos[businessID]){
                serverName = Comm.etoeBizInfos[businessID].name;
            }
        } else {
            serverName = data[3];
        }

        var topBizId = Comm.RTComm.getParentBusinessIdById(businessID);

        if (!businessID || !tierID || (serverType !== 20 && alarmType !== 'Session Alert') || !topBizId) {
            return;
        }

        var alarmData;
        //var topBizId = Comm.RTComm.getParentBusinessIdById(businessID);
        var nodeAlarmKey = topBizId + '_' + tierID;

        switch(alarmResName) {
            case realtime.alarms.CONNECTED:
            case realtime.alarms.SERVER_BOOT :
            case realtime.alarms.API_BOOT :
            case realtime.alarms.TP_BOOT :
            case realtime.alarms.PROCESS_BOOT :
                alarmLevel = 0;
                levelType = '';
                break;

            case realtime.alarms.DISCONNECTED :
            case realtime.alarms.SERVER_DOWN :
            case realtime.alarms.API_DOWN :
            case realtime.alarms.TP_DOWN :
                alarmLevel = 2;
                levelType = 'Critical';
                alarmValue = '';
                break;

            default:
                break;
        }

        // 라이선스 알람을 체크할 때 알람 값이 0 이상인 경우 정상으로 체크한다.
        // description 항목 값이 'UNLIMITED' 인 경우 정상으로 체크해도 되지만 빈 값으로 오는 경우가 있어서
        // 화면에서 필터 처리를 함.
        if (alarmResName.toLocaleLowerCase() === 'license' && alarmLevel > 0 && alarmValue >= 0) {
            alarmLevel = 0;
        }

        if (alarmResName === realtime.alarms.ELAPSED_TIME) {
            alarmKey = alarmResName + '-' + resID;
            alarmValue = +alarmValue / 1000;

        } else if (alarmResName === realtime.alarms.TP_ERROR) {
            alarmKey = alarmResName + '-' + resID;

        } else if (alarmResName === realtime.alarms.CONNECTED) {
            alarmKey = realtime.alarms.DISCONNECTED;

        } else if (alarmResName === realtime.alarms.SERVER_BOOT) {
            alarmKey = realtime.alarms.SERVER_DOWN;

        } else if (alarmResName === realtime.alarms.API_BOOT) {
            alarmKey = realtime.alarms.API_DOWN;

        } else if (alarmResName === realtime.alarms.TP_BOOT) {
            alarmKey = realtime.alarms.TP_DOWN;

        } else if (alarmResName === realtime.alarms.PROCESS_BOOT) {
            alarmKey = realtime.alarms.PROCESS_DOWN;
        }

        if (!this.alarmInfos[nodeAlarmKey]) {
            this.alarmInfos[nodeAlarmKey] = {};
        }
        alarmData = this.alarmInfos[nodeAlarmKey];

        if (+alarmLevel === 0) {
            if (alarmData[serverName]) {
                if (alarmResName === realtime.alarms.CONNECTED) {
                    delete alarmData[serverName][realtime.alarms.DISCONNECTED];
                    delete alarmData[serverName].XM_JVM_OUTOFMEMORYERROR;

                } else if (alarmResName === realtime.alarms.SERVER_BOOT) {
                    delete alarmData[serverName][realtime.alarms.SERVER_DOWN];

                } else if (alarmResName === realtime.alarms.API_BOOT) {
                    delete alarmData[serverName][realtime.alarms.API_DOWN];

                } else if (alarmResName === realtime.alarms.TP_BOOT) {
                    delete alarmData[serverName][realtime.alarms.TP_DOWN];

                } else if (alarmResName === realtime.alarms.PROCESS_BOOT) {
                    delete alarmData[serverName][realtime.alarms.PROCESS_DOWN];

                } else if (alarmResName === realtime.alarms.ELAPSED_TIME ||
                    alarmResName === realtime.alarms.TP_ERROR) {
                    delete alarmData[serverName][alarmKey];

                } else {
                    delete alarmData[serverName][alarmResName];
                }
            }

        } else {
            if (alarmData[serverName]) {
                if (alarmData[serverName][alarmKey]) {
                    alarmData[serverName][alarmKey][5]  = alarmValue;
                    alarmData[serverName][alarmKey][6]  = alarmLevel;
                    alarmData[serverName][alarmKey][7]  = levelType;
                    alarmData[serverName][alarmKey][9]  = descr;
                    alarmData[serverName][alarmKey][10] = resID;
                    alarmData[serverName][alarmKey][12] = +new Date();
                    alarmData[serverName][alarmKey][13] = false;
                } else {
                    alarmData[serverName][alarmKey] = [time, serverType, serverID, serverName, alarmResName, alarmValue, alarmLevel, levelType, alarmType, descr, resID, tierID, +new Date(), false, businessID];
                }

            } else {
                alarmData[serverName] = {};
                alarmData[serverName][alarmKey] = [time, serverType, serverID, serverName, alarmResName, alarmValue, alarmLevel, levelType, alarmType, descr, resID, tierID, +new Date(), false, businessID];
            }
        }

        this.prevAlarmInfos = common.Util.deepObjCopy(this.alarmInfos);
    },

    setAlarmColor: function(){
        if(this.alarmColor[this.maxLevel] === this.color){
            return;
        }

        this.color  = this.alarmColor[this.maxLevel];
        this.prevColor = this.color;

        this.clearCanvas(this.ctx, this.canvas);

        this.drawBackground(this.posX, this.posY, this.radian);
    },

    setWidgetColumnColor: function(){
        var color;

        color = this.maxLevel === 0 ? '#ABAEB5' : this.color;

        $('#' + this.parentId).find('.txnCnt')[this.gridCnt].style.color = color;
        this.parent.packet[this.packetKey].tdColor = color;
    },

    clearAlarm: function() {
        this.diffSec = 0;

        var ix, ixLen, jx, jxLen, kx, kxLen;
        var alarmKeys, alarmName;
        var alarmList, alarmGroup;
        var serverName;
        var nodeKey;
        var serverKeys;

        var isChangeAlarmStatus = false;

        var alarmInfoObj = Object.keys(this.alarmInfos);

        for (kx = 0, kxLen = alarmInfoObj.length; kx < kxLen; kx++) {
            nodeKey    = alarmInfoObj[kx];
            alarmGroup = this.alarmInfos[nodeKey];

            serverKeys = Object.keys(alarmGroup);

            for (ix = 0, ixLen = serverKeys.length; ix < ixLen; ix++) {
                serverName = serverKeys[ix];
                alarmList  = alarmGroup[serverName];
                alarmKeys  = Object.keys(alarmList);

                for (jx = 0, jxLen = alarmKeys.length; jx < jxLen; jx++) {
                    alarmName = alarmKeys[jx];

                    this.diffSec = 0;

                    if (!Ext.Array.contains(realtime.notAutoClearAlarms, alarmName)) {
                        this.diffSec = Ext.Date.diff(alarmList[alarmName][12], new Date(), Ext.Date.SECOND);
                    }

                    if (this.diffSec > 3) {
                        //console.debug(nodeKey, serverName, alarmName);
                        //console.debug(this.alarmInfos[nodeKey][serverName][alarmName]);
                        delete this.alarmInfos[nodeKey][serverName][alarmName];
                    }
                }
            }
        }

        this.getMaxAlarmLevel();
        this.setAlarmColor();
        this.setWidgetColumnColor();
    },

    /**
     * 알람 실시간 패킷 데이터 처리
     *
     * 0: time
     * 1: server_type   (1: WAS, 2: DB, 3:WebServer, 9: Host, 15: apim, 20: BIZ)
     * 2: server_id
     * 3: server_name
     * 4: alert_resource_name
     * 5: value
     * 6: alert_level
     * 7: levelType
     * 8: alert_type (WAS STAT, OS STAT, JVM STAT, Exception Alert)
     * 9: descr
     * 10: alert_resource_ID
     * 11: tier_id
     * 12: business_id
     * 13: warning
     * 14: critical
     * 15: customData
     */
    onAlarm: function(data){
        if (!data) {
            return;
        }

        var tierID       = data[11];
        var businessID   = data[12];

        if (!tierID || !businessID) {
            return;
        }

        businessID = +Comm.RTComm.getParentBusinessIdById(businessID);

        if(!businessID || businessID !== this.bizId){
            return;
        }

        this.setAlarminfo(data);
        this.getMaxAlarmLevel();
        this.setAlarmColor();
        this.setWidgetColumnColor();
    }
});