/**
 *
 * Data Refresh Time
 * Node, Txn Path: 1 Minute
 * Active Count: 3 sec
 * @type
 */

/**
 * Topology
 */
var XMTopology = function() {

    this.fps = 15;
    this.fpsInterval = 1000 / this.fps;
    this.fpsNow = null;
    this.fpsThen = Date.now();

    this.nodePath = {};
    this.linePath = {};
    this.nodeList = [];
    this.displayNodeList = [];
    this.subNodeList = [];

    this.nodeMap  = {};

    this.groupList           = [];
    this.selectGroupIdArr    = [];
    this.nodeNameBoxList     = [];
    this.remoteInfoBoxList   = [];
    this.callTreeIconList    = [];
    this.lineList            = [];
    this.lineEffectList      = null;
    this.relationData        = [];
    this.displayRelationData = [];
    this.subRelationData     = [];
    this.remoteWasList       = [];
    this.lastReceiveCount    = {};
    this.lastReceiveDest     = {};
    this.lineStartWas        = [];
    this.elapsedTimeAvgMin   = {};
    this.tpsAvgMin           = {};
    this.activateDest        = {};
    this.originalTxnDestData = {};
    this.detailNodePos       = {};

    // 선택된 그룹 노드
    this.selectedGroupCircle = null;

    this.groupCanvasList    = [];
    this.childCanvasList    = [];
    this.groupContextList   = [];
    this.groupChildCtxtList = [];

    this.filterServerList = [];

    this.nodeSeq = 0;

    this.clikIconPt   = null;
    this.xviewIconPt  = null;
    this.zoomIconPt   = null;
    this.groupIconPt  = null;
    this.folderViewPt = null;
    this.groupChildPt = null;
    this.closeXPt     = null;

    this.mergeAgentList  = null;
    this.mergeTargetNode = null;

    this.isInit                     = false;
    this.isDisplayGroupMode         = false;
    this.isCheckCreateGroup         = false;
    this.isNodeDragMove             = false;
    this.isRemoteInfoTextRotate     = false;
    this.isDisplayRemoteActiveCount = true;
    this.isDisplayAgentType         = false;
    this.isDrawingPath              = false;
    this.isTxnPathMode              = false;
    this.isTxnPathRefresh           = false;
    this.isEndTxnPath               = false;
    this.isRealDragDraw             = false;
    this.isLoadSaveNodeInfo         = false;
    this.isEnableAlarmTooltip       = true;
    this.isDebugLogMode             = false;
    this.isAutoSave                 = true;
    this.isCenterDetailLayout       = true;
    this.isDrawingLayout            = false;
    this.isDrawFrame                = true;

    this.isAlarmAnimate             = true;
    this.isLineAnimate              = true;

    this.limitAnimateNodeCount = 60;

    this.selectNodeObj         = null;
    this.folderImgCnt          = undefined;
    this.refreshTimerId        = null;
    this.refreshTxnPathTimerId = null;
    this.alarmGradient         = null;
    this.displayNodeLevel      = 0;

    // Function
    this.openTxnMonitor   = null;         // 트랜잭션 모니터 화면을 여는 함수
    this.openTxnList      = null;         // 트랜잭션 목록 화면을 팝업으로 여는 함수
    this.saveNodePosition = null;         // 토폴로지 노드 위치 및 구성을 저장하는 함수
    this.getNodeNameById  = null;         // 노드 ID에 해당하는 노드명을 가져오는 함수
    this.openCallTree     = null;         // 실시간 트랜잭션 경로 모드일 경우, 콜트리 화면 표시 함수
    this.openFullSQLText  = null;         // 실시간 트랜잭션 경로 모드일 경우, SQL 전문보기 화면 표시 함수

};

XMTopology.prototype = {

    inputMode: {
        BLANK: -1,
        GROUP_NAME: 0,
        NODE_NAME: 1
    },

    // ALARM DEFINE ----------------------------------------------------------------------
    alarmType: {
        NORMAL   : 0,
        WARNING  : 1,
        CRITICAL : 2,
        DOWN     : 3
    },

    // Icon Image Position DEFINE --------------------------------------------------------
    imagePoint: {
        xview        : {x: 12,  y: 324, w: 13,  h: 15},
        zoom         : {x: 37,  y: 324, w: 14,  h: 14},
        group        : {x: 60,  y: 324, w: 17,  h: 14},
        tuxedo       : {x: 23,  y: 3,   w: 64,  h: 55},
        tp           : {x: 23,  y: 66,  w: 64,  h: 55}, // tmax icon image
        http         : {x: 8,   y: 128, w: 91,  h: 54},
        tcp          : {x: 8,   y: 192, w: 91,  h: 54},
        sap          : {x: 23,  y: 256, w: 64,  h: 55},
        mssql        : {x: 132, y: 5,   w: 59,  h: 65},
        sqlserver    : {x: 132, y: 5,   w: 59,  h: 65},
        ms           : {x: 207, y: 5,   w: 55,  h: 65},
        oracle       : {x: 132, y: 70,  w: 59,  h: 65},
        pg           : {x: 207, y: 70,  w: 55,  h: 65},
        postgresql   : {x: 132, y: 140, w: 59,  h: 65},
        infomix      : {x: 132, y: 211, w: 59,  h: 65},
        sysbase      : {x: 207, y: 211, w: 55,  h: 65},
        mysql        : {x: 132, y: 281, w: 59,  h: 65},
        db           : {x: 293, y: 397, w: 59,  h: 65},
        down_db      : {x: 293, y: 467, w: 59,  h: 65},
        warning_db   : {x: 293, y: 538, w: 59,  h: 65},
        critical_db  : {x: 293, y: 608, w: 59,  h: 65},
        xicon        : {x: 82,  y: 326, w: 11,  h: 11},
        xiconover    : {x: 94,  y: 326, w: 11,  h: 11},
        folder       : {x: 0,   y: 0,   w: 79,  h: 73},
        folder00     : {x: 277, y: 3,   w: 79,  h: 70},
        folder01     : {x: 277, y: 81,  w: 79,  h: 70},
        folder02     : {x: 277, y: 160, w: 79,  h: 70},
        folder03     : {x: 277, y: 238, w: 79,  h: 70},
        folder04     : {x: 277, y: 316, w: 79,  h: 70},

        tuxedo_group   : {x: 386,  y: 3,   w: 76,  h: 71},
        server_group   : {x: 386,  y: 3,   w: 76,  h: 71},
        oracle_group   : {x: 386,  y: 81,  w: 76,  h: 71},
        cloud_group    : {x: 386,  y: 159, w: 76,  h: 71},
        http_group     : {x: 386,  y: 159, w: 76,  h: 71},
        tcp_group      : {x: 386,  y: 240, w: 76,  h: 71},
        server_db      : {x: 386,  y: 324, w: 76,  h: 71},
        db_cloud       : {x: 386,  y: 404, w: 76,  h: 71},
        server_cloud   : {x: 386,  y: 484, w: 76,  h: 71},
        server_db_cloud: {x: 386,  y: 564, w: 76,  h: 71},

        down_tuxedo_group   : {x: 469,  y: 3,   w: 76,  h: 71},
        down_server_group   : {x: 469,  y: 3,   w: 76,  h: 71},
        down_oracle_group   : {x: 469,  y: 81,  w: 76,  h: 71},
        down_cloud_group    : {x: 469,  y: 159, w: 76,  h: 71},
        down_http_group     : {x: 469,  y: 159, w: 76,  h: 71},
        down_tcp_group      : {x: 469,  y: 240, w: 76,  h: 71},
        down_server_db      : {x: 469,  y: 324, w: 76,  h: 71},
        down_db_cloud       : {x: 469,  y: 404, w: 76,  h: 71},
        down_server_cloud   : {x: 469,  y: 484, w: 76,  h: 71},
        down_server_db_cloud: {x: 469,  y: 564, w: 76,  h: 71}
    },

    // Init ------------------------------------------------------------------------------
    init: function() {
        if (!this.isImageLoad) {
            this.iconImg = new Image();
            this.iconImg.src = this.property.iconImg.src;

            this.iconImg.onload = function() {
                this.isImageLoad = true;
                this.init();
            }.bind(this);
            return;
        }

        this.initProperty();

        if (this.getInitInfo) {
            this.getInitInfo();
        }

        this.isFullCloudName    = common.Menu.topologyCloudFullName;
        this.isDisplayCloudNode = common.Menu.topologyEnableCloud;
        this.isDisplayTmaxNode  = common.Menu.topologyEnableTmax;

        var target = this.target || document.body;
        target.classList.add('topology');

        if (!this.target) {
            this.target = target;
        }

        this.displayCanvas = document.createElement('canvas');
        this.canvas = document.createElement('canvas');      // 버퍼 캔버스

        this.lineCanvas       = document.createElement('canvas');
        this.lineEffectCanvas = document.createElement('canvas');
        this.dragCanvas       = document.createElement('canvas');
        this.groupCanvas      = document.createElement('canvas');
        this.groupChildCanvas = document.createElement('canvas');
        this.navigateCanvas   = document.createElement('canvas');
        this.nodeInfoCanvas   = document.createElement('canvas');
        this.overCanvas       = document.createElement('canvas');
        this.alarmCanvas      = document.createElement('canvas');

        this.displayLineCanvas = document.createElement('canvas');

        this.groupNameInputBox = document.createElement('input');
        this.groupNameInputBox.style.display = 'none';
        this.groupNameInputBox.style.position = 'absolute';

        //this.lineCanvas.className       = 'topology-line-canvas';
        this.displayLineCanvas.className= 'topology-line-canvas';
        this.lineEffectCanvas.className = 'topology-line-effect-canvas';
        this.dragCanvas.className       = 'topology-drag-canvas';
        this.groupCanvas.className      = 'topology-group-canvas first';
        this.groupChildCanvas.className = 'topology-groupchild-canvas first';
        this.navigateCanvas.className   = 'topology-navigate-canvas';
        this.nodeInfoCanvas.className   = 'topology-nodeinfo-canvas';

        this.overCanvas.className       = 'topology-over-canvas first';

        this.alarmCanvas.className      = 'topology-alarm-canvas';

        //target.appendChild(this.lineCanvas);
        //target.appendChild(this.canvas);
        target.appendChild(this.displayLineCanvas);
        target.appendChild(this.displayCanvas);
        target.appendChild(this.alarmCanvas);
        target.appendChild(this.lineEffectCanvas);
        target.appendChild(this.overCanvas);
        target.appendChild(this.groupCanvas);
        target.appendChild(this.groupChildCanvas);
        target.appendChild(this.navigateCanvas);
        target.appendChild(this.nodeInfoCanvas);
        target.appendChild(this.dragCanvas);
        target.appendChild(this.groupNameInputBox);

        //this.lineCanvas.style.zIndex = 0;
        this.displayLineCanvas.style.zIndex = 0;
        this.displayCanvas.style.zIndex     = 1;
        this.alarmCanvas.style.zIndex       = 2;
        this.lineEffectCanvas.style.zIndex  = 3;
        this.overCanvas.style.zIndex        = 4;

        this.groupCanvas.style.zIndex       = 5;
        this.groupChildCanvas.style.zIndex  = 6;

        this.navigateCanvas.style.zIndex    = 130;
        this.nodeInfoCanvas.style.zIndex    = 140;
        this.dragCanvas.style.zIndex        = 150;
        this.groupNameInputBox.style.zIndex = 160;

        this.componentHeight = $(target).height();
        this.componentWidth = $(target).width();
        this.maxNodePosY = this.componentHeight;
        this.maxNodePosX = this.componentWidth;

        this.canvas.width = this.componentWidth;
        this.canvas.height = this.componentHeight;
        this.canvas.style.top = '0px';
        this.canvas.style.left = '0px';
        this.canvas.style.position = 'absolute';

        this.displayCanvas.width = this.componentWidth;
        this.displayCanvas.height = this.componentHeight;
        this.displayCanvas.style.top = '0px';
        this.displayCanvas.style.left = '0px';
        this.displayCanvas.style.position = 'absolute';

        this.lineCanvas.width = this.componentWidth;
        this.lineCanvas.height = this.componentHeight;
        this.lineCanvas.style.top = '0px';
        this.lineCanvas.style.left = '0px';
        this.lineCanvas.style.position = 'absolute';

        this.displayLineCanvas.width = this.componentWidth;
        this.displayLineCanvas.height = this.componentHeight;
        this.displayLineCanvas.style.top = '0px';
        this.displayLineCanvas.style.left = '0px';
        this.displayLineCanvas.style.position = 'absolute';

        this.lineEffectCanvas.width = this.componentWidth;
        this.lineEffectCanvas.height = this.componentHeight;
        this.lineEffectCanvas.style.top = '0px';
        this.lineEffectCanvas.style.left = '0px';
        this.lineEffectCanvas.style.position = 'absolute';

        this.dragCanvas.width = this.componentWidth;
        this.dragCanvas.height = this.componentHeight;
        this.dragCanvas.style.top = '0px';
        this.dragCanvas.style.left = '0px';
        this.dragCanvas.style.position = 'absolute';

        this.groupCanvas.width = this.componentWidth;
        this.groupCanvas.height = this.componentHeight;
        this.groupCanvas.style.top = '0px';
        this.groupCanvas.style.left = '0px';
        this.groupCanvas.style.position = 'absolute';

        this.groupChildCanvas.width = this.componentWidth;
        this.groupChildCanvas.height = this.componentHeight;
        this.groupChildCanvas.style.top = '0px';
        this.groupChildCanvas.style.left = '0px';
        this.groupChildCanvas.style.position = 'absolute';

        this.navigateCanvas.width = this.componentWidth;
        this.navigateCanvas.height = this.componentHeight;
        this.navigateCanvas.style.top = '0px';
        this.navigateCanvas.style.left = '0px';
        this.navigateCanvas.style.position = 'absolute';

        this.nodeInfoCanvas.width = this.componentWidth;
        this.nodeInfoCanvas.height = this.componentHeight;
        this.nodeInfoCanvas.style.top = '0px';
        this.nodeInfoCanvas.style.left = '0px';
        this.nodeInfoCanvas.style.position = 'absolute';

        this.overCanvas.width = 0;
        this.overCanvas.height = 0;
        this.overCanvas.style.top = '0px';
        this.overCanvas.style.left = '0px';
        this.overCanvas.style.position = 'absolute';

        this.alarmCanvas.width = this.componentWidth;
        this.alarmCanvas.height = this.componentHeight;
        this.alarmCanvas.style.top = '0px';
        this.alarmCanvas.style.left = '0px';
        this.alarmCanvas.style.position = 'absolute';

        this.ctx              = this.canvas.getContext('2d');
        this.displayCtx       = this.displayCanvas.getContext('2d');
        this.lineCtx          = this.lineCanvas.getContext('2d');
        this.displayLineCtx   = this.displayLineCanvas.getContext('2d');
        this.lineEffectCtx    = this.lineEffectCanvas.getContext('2d');
        this.dragCtx          = this.dragCanvas.getContext('2d');
        this.groupCtx         = this.groupCanvas.getContext('2d');
        this.groupChildCtx    = this.groupChildCanvas.getContext('2d');
        this.naviCtx          = this.navigateCanvas.getContext('2d');
        this.nodeInfoCtx      = this.nodeInfoCanvas.getContext('2d');
        this.overCtx          = this.overCanvas.getContext('2d');
        this.alarmCtx         = this.alarmCanvas.getContext('2d');


        this.groupCanvasList[this.groupCanvasList.length] = this.groupCanvas;
        this.childCanvasList[this.childCanvasList.length] = this.groupChildCanvas;

        this.groupContextList[this.groupContextList.length]     = this.groupCtx;
        this.groupChildCtxtList[this.groupChildCtxtList.length] = this.groupChildCtx;


        // Add linear gradient -----------------------------------------------------------
        this.applyAngle = function (point, angle, distance) {
            return {
                  x : point.x + (Math.cos(angle) * distance),
                  y : point.y + (Math.sin(angle) * distance)
            };
        };

        this.isInit = true;

        this.addEvents();

        if (!this.isTxnPathMode) {
            this.refreshData();

        } else {
            this.refreshTxnPathData();
        }
        this.repeatCheckCountData();

        this.repeatCheckLastDest();

        this.drawAlarmEffect();
    },


    /**
     * 각 Node 사이의 연결선을 설정한다.
     */
    nodePathInit: function() {
        var ix, ixLen;

        this.nodePath = {};
        this.linePath = {};

        var nodeObj, lineObj;

        for (ix = 0, ixLen = this.lineList.length; ix < ixLen; ix++) {

            lineObj = this.lineList[ix];
            nodeObj = this.nodeMap[lineObj.to];

            if (!nodeObj || nodeObj.level !== this.displayNodeLevel) {
                continue;
            }

            if (!this.nodePath[lineObj.from]) {
                this.nodePath[lineObj.from] = [];
                this.linePath[lineObj.from] = [];
            }

            this.nodePath[lineObj.from].push( nodeObj );
            this.linePath[lineObj.from].push( lineObj );
        }

        if (this.lineList) {
            if (!this.lineEffectList && this.lineEffectCtx) {
                this.lineEffectList = new XMTopology.LineEffect(this.lineEffectCtx);
            }
            this.lineEffectList.isLineAnimate = this.isLineAnimate;

            if (this.lineEffectCanvas) {
                this.lineEffectList.lineList     = this.lineList;
                this.lineEffectList.drawLineList = this.remoteWasList;
                this.lineEffectList.nodeList     = this.nodeList;
                this.lineEffectList.nodeMap      = this.nodeMap;
                this.lineEffectList.canvasWidth  = this.lineEffectCanvas.width;
                this.lineEffectList.canvasHeight = this.lineEffectCanvas.height;

                if (this.lineEffectList.isDrawing === false) {
                    this.lineEffectList.drawLineEffect(0);
                }
            }
        }

        lineObj = null;
        nodeObj = null;
    },


    /**
     * Update Transaction Path (Transaction Path Mode)
     */
    refreshTxnPathData: function() {
        this.stopRefreshTxnPath();

        if (this.isTxnPathRefresh === true) {
            this.canvasTxnPathDraw();
        }
        this.refreshTxnPathTimerId = setTimeout(this.refreshTxnPathData.bind(this), 1000);
    },


    /**
     * Stop Update Transaction Path (Transaction Path Mode)
     */
    stopRefreshTxnPath: function() {
        if (this.refreshTxnPathTimerId) {
            clearTimeout(this.refreshTxnPathTimerId);
        }
    },


    /**
     */
    refreshData: function() {
        if (this.refreshTimerId) {
            clearTimeout(this.refreshTimerId);
        }

        if (this.isRealDragDraw !== true) {
            this.canvasDraw();
        }

        this.refreshTimerId = setTimeout(this.refreshData.bind(this), 1000);
    },


    /**
     */
    repeatCheckCountData: function() {
        if (this.repeatCheckTimerId) {
            clearTimeout(this.repeatCheckTimerId);
        }

        var lastTime;
        for (var ix = 0; ix < this.remoteWasList.length; ) {
            lastTime = this.lastReceiveCount[this.remoteWasList[ix][0]];
            this.diffSec = Ext.Date.diff(lastTime, new Date(), Ext.Date.SECOND);

            if ((!this.diffSec && this.diffSec !== 0) || this.diffSec > 1) {
                delete this.lastReceiveCount[this.remoteWasList[ix][0]];
                this.remoteWasList.splice(ix, 1);
                ix--;
            }
            ix++;
        }

        this.repeatCheckTimerId = setTimeout(this.repeatCheckCountData.bind(this), 1000*3);
    },


    /**
     */
    repeatCheckLastDest: function() {
        if (this.lastDestCheckTimeId) {
            clearTimeout(this.lastDestCheckTimeId);
        }

        if (this.activateDest) {
            var diffSec;
            var lastTime;
            var keys = Object.keys(this.activateDest);

            for (var ix = 0; ix < keys.length; ix++) {
                lastTime = this.lastReceiveDest[keys[ix]];
                diffSec = Ext.Date.diff(lastTime, new Date(), Ext.Date.SECOND);

                if ((!diffSec && diffSec !== 0) || diffSec > 3) {
                    delete this.activateDest[keys[ix]];
                }
            }
        }

        this.lastDestCheckTimeId = setTimeout(this.repeatCheckLastDest.bind(this), 1000*3);
    },


    /**
     * Check Receive Data
     *
     * @param {number} lastTime - Last Packet Data Receive Time
     * @return {boolean}
     */
    checkOldReceiveData: function(lastTime) {
        var isOldData = false;

        if (lastTime) {
            var diffSec = Ext.Date.diff(new Date(lastTime), new Date(), Ext.Date.SECOND);
            if (diffSec > 3) {
                isOldData = true;
            }
        }
        return isOldData;
    },


    /**
     * 노드를 선택하고 움직이려고 하면 실행되는 처리.
     */
    renderLoop: function() {
        this.isRealDragDraw = true;

        this.canvasDraw();

        this.animationHandle = window.requestAnimationFrame(this.renderLoop.bind(this));
    },


    /**
     * 노드를 선택해서 움직이는 것을 끝낸 경우 실행되는 처리.
     */
    stopRenderLoop: function() {
        this.isRealDragDraw = false;
        window.cancelAnimationFrame(this.animationHandle);

        this.refreshData();
    },


    /**
     * Draw Transactoin Path.
     *
     * Draw a path for the transaction of the selected WAS (Transaction Path Mode).
     */
    canvasTxnPathDraw: function() {

        this.clearLayout();
        this.clearLineLayout();

        this.drawTxnNodeLayout();
        this.drawTxnLineLayout();
    },


    /**
     * 토폴로지 뷰 구성 요소들 그리기
     */
    canvasDraw: function() {
        if (this.isInit !== true || !this.isDrawFrame) {
            return;
        }

        this.clearLayout();
        this.clearLineLayout();
        this.clearNodeInfoLayout();

        this.checkServerStatus();
        this.drawLineLayout();
        this.drawNodeLayout();

        if (this.isDisplayGroupMode && this.selectedGroupCircle && this.selectedGroupCircle.isGroupMode) {
            this.clearGroupChildLayout();

            // 선택된 노드에 웹 서버가 포함된 경우는 그룹을 분리하는 버튼을 표시하지 않는다.
            if (!this.selectedGroupCircle.isWebContain) {
                this.drawGroupSplitX(this.selectedGroupCircle, this.getGroupCircleRadius(this.selectedGroupCircle.childList.length, this.groupCircleRadius));
            }
            this.drawGroupCloseX(this.selectedGroupCircle, this.getGroupCircleRadius(this.selectedGroupCircle.childList.length, this.groupCircleRadius));
            this.drawGroupChild(this.selectedGroupCircle);
        }

    },


    clearLayout: function() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.componentWidth, this.componentHeight);
        }

        if (this.displayCtx) {
            this.displayCtx.clearRect(0, 0, this.componentWidth, this.componentHeight);
        }
    },

    clearOverLayout: function() {
        if (this.overCtx) {
            this.overCtx.clearRect(0, 0, this.componentWidth, this.componentHeight);
        }

        this.overCanvas.width  = 0;
        this.overCanvas.height = 0;
    },

    clearNodeInfoLayout: function() {
        if (this.nodeInfoCtx) {
            this.nodeInfoCtx.clearRect(0, 0, this.componentWidth, this.componentHeight);
        }
    },

    clearAlarmLayout: function() {
        if (this.alarmCtx) {
            this.alarmCtx.clearRect(0, 0, this.componentWidth, this.componentHeight);
        }
    },

    clearLineLayout: function() {
        if (this.lineCtx) {
            this.lineCtx.clearRect(0, 0, this.componentWidth, this.componentHeight);
        }
        if (this.displayLineCtx) {
            this.displayLineCtx.clearRect(0, 0, this.componentWidth, this.componentHeight);
        }
    },

    clearLineEffectLayout: function() {
        if (this.lineEffectCtx) {
            this.lineEffectCtx.clearRect(0, 0, this.componentWidth, this.componentHeight);
        }
    },

    clearDragLayout: function() {
        if (this.dragCtx) {
            this.dragCtx.clearRect(0, 0, this.dragCanvas.width, this.dragCanvas.height);
        }
    },

    clearGroupLayout: function() {
        if (this.displayGroupViewStep > 1) {
            this.groupContextList[this.displayGroupViewStep - 1].clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.groupChildCtxtList[this.displayGroupViewStep - 1].clearRect(0, 0, this.canvas.width, this.canvas.height);

        } else {
            this.groupCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.groupChildCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.naviCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    clearAllGroupLayout: function() {
        for (var ix = 0, ixLen = this.groupContextList.length; ix < ixLen; ix++) {
            this.groupContextList[ix].clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.groupChildCtxtList[ix].clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.naviCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.displayGroupViewStep = 0;
        this.selectGroupIdArr.length = 0;

        this.isDisplayGroupMode = false;
    },

    clearGroupChildLayout: function() {
        if (this.displayGroupViewStep > 1) {
            this.groupChildCtxtList[this.displayGroupViewStep - 1].clearRect(0, 0, this.groupChildCanvas.width, this.groupChildCanvas.height);

        } else {
            this.groupChildCtx.clearRect(0, 0, this.groupChildCanvas.width, this.groupChildCanvas.height);
        }
    },

    clearNaviLayout: function() {
        this.naviCtx.clearRect(0, 0, this.navigateCanvas.width, this.navigateCanvas.height);
    },


    /**
     * 노드 좌측 하단에 표시되는 노드 정보를 그리기
     *
     * @descr 그룹 노드: 노드 갯수, 일반 노드: 에이전트 타입 (JAVA)
     */
    drawNodeInfo: function(node) {
        var cx = node.x;
        var cy = node.y;

        var radius = this.property.outCircle.radius;

        this.nodeInfoCtx.beginPath();
        this.nodeInfoCtx.arc(
            cx - radius - 18,
            cy + radius + 4,
            21,
            0,
            2 * Math.PI
        );
        this.nodeInfoCtx.closePath();

        if (node.isHide) {
            this.nodeInfoCtx.fillStyle = 'transparent';
        } else {
            this.nodeInfoCtx.fillStyle = 'rgba('+this.getHexToRgb(this.backgroundColor) +','+ 0.2 + ')';;
        }
        this.nodeInfoCtx.fill();

        this.nodeInfoCtx.beginPath();
        this.nodeInfoCtx.arc(
            cx - radius - 18,
            cy + radius + 4,
            19,
            0,
            2 * Math.PI
        );
        this.nodeInfoCtx.closePath();

        if (node.isHide) {
            this.nodeInfoCtx.fillStyle = 'transparent';
        } else {
            this.nodeInfoCtx.fillStyle = '#30A0F8';
        }
        this.nodeInfoCtx.fill();

        this.nodeInfoCtx.fillStyle = (node.isHide)? 'transparent' : '#FFFFFF';
        this.nodeInfoCtx.textAlign = 'center';

        // 노드 에이전트 타입 설정
        var appType = 'JAVA';

        var serverId = node.id.split('-')[1];
        var serverType;

        if (Comm.wasInfoObj[serverId]) {
            serverType = Comm.wasInfoObj[serverId].type;
        }

        if (serverType === 'TP') {
            appType = 'TP';

        } else if (serverType === '.NET') {
            appType = '.NET';

        } else if (Comm.wasAppType) {
            appType = Comm.wasAppType[serverId] || 'JAVA';
        }

        if (node.isGroupMode === true) {
            this.nodeInfoCtx.font = 'normal 13px "Droid Sans"';
            this.nodeInfoCtx.fillText(
                node.childNodeAllCount,
                cx - radius - 18,
                cy + radius + 2
            );
            this.nodeInfoCtx.font = 'normal 10px "Droid Sans"';
            this.nodeInfoCtx.fillText(
                'Nodes',
                cx - radius - 18,
                cy + radius + 13
            );

        } else {
            this.nodeInfoCtx.font = 'normal 11px "Droid Sans"';
            this.nodeInfoCtx.fillText(
                appType,
                cx - radius - 18,
                cy + radius + 8
            );
        }

        //this.drawGroupDownAlarm(node);
    },

    /**
     * 노드 좌측 상단에 웹 아이콘 정보를 그리기
     * WAS 서버와 연결된 Web Server가 있는 경우 아이콘 표시를 함.
     *
     * @param {object} node - 선택된 서버 개체
     */
    drawNodeWebInfo: function(node) {
        var cx = node.x;
        var cy = node.y;

        var radius = this.property.outCircle.radius;

        // 웹 정보가 표시되는 원 그리기
        this.nodeInfoCtx.beginPath();
        this.nodeInfoCtx.arc(
            cx - radius - 18,
            cy + radius - 46,
            21,
            0,
            2 * Math.PI
        );
        this.nodeInfoCtx.closePath();

        if (node.isHide) {
            this.nodeInfoCtx.fillStyle = 'transparent';
        } else {
            this.nodeInfoCtx.fillStyle = 'rgba('+this.getHexToRgb(this.backgroundColor) +','+ 0.2 + ')';;
        }
        this.nodeInfoCtx.fill();

        this.nodeInfoCtx.beginPath();
        this.nodeInfoCtx.arc(
            cx - radius - 18,
            cy + radius - 46,
            19,
            0,
            2 * Math.PI
        );
        this.nodeInfoCtx.closePath();

        if (node.isHide) {
            this.nodeInfoCtx.fillStyle = 'transparent';
        } else {
            this.nodeInfoCtx.fillStyle = '#30A0F8';
        }
        this.nodeInfoCtx.fill();

        // 아이콘에 보여지는 정보 그리기
        this.nodeInfoCtx.fillStyle = (node.isHide)? 'transparent' : '#FFFFFF';
        this.nodeInfoCtx.textAlign = 'center';

        this.nodeInfoCtx.font = 'normal 13px "Droid Sans"';
        this.nodeInfoCtx.fillText(
            node.webNodeAllCount,
            cx - radius - 18,
            cy + radius - 49
        );
        this.nodeInfoCtx.font = 'normal 10px "Droid Sans"';
        this.nodeInfoCtx.fillText(
            node.webNodeAllCount > 1? 'WEBS' : 'WEB',
            cx - radius - 18,
            cy + radius - 36
        );

    },



    /**
     * 
     * @param {object} node
     */
    drawGroupDownAlarm: function(node) {
        if (node.isGroupMode !== true) {
            return;
        }

        var downCount = this.getDownAlarmCountInNode(node);

        if (downCount === 0) {
            return;
        }

        this.nodeInfoCtx.beginPath();
        this.nodeInfoCtx.arc(
            node.x + this.property.outCircle.radius + 14,
            node.y + this.property.outCircle.radius + 4,
            13,
            0,
            2 * Math.PI
        );
        this.nodeInfoCtx.closePath();

        if (node.isHide) {
            this.nodeInfoCtx.fillStyle = 'transparent';
        } else {
            this.nodeInfoCtx.fillStyle = 'rgba('+this.getHexToRgb(this.backgroundColor) +','+ 0.2 + ')';;
        }
        this.nodeInfoCtx.fill();

        this.nodeInfoCtx.beginPath();
        this.nodeInfoCtx.arc(
            node.x + this.property.outCircle.radius + 14,
            node.y + this.property.outCircle.radius + 4,
            11,
            0,
            2 * Math.PI
        );
        this.nodeInfoCtx.closePath();

        if (node.isHide) {
            this.nodeInfoCtx.fillStyle = 'transparent';
        } else {
            this.nodeInfoCtx.fillStyle = '#72757B';
        }
        this.nodeInfoCtx.fill();

        this.nodeInfoCtx.fillStyle = (node.isHide)? 'transparent' : (this.fontColor || '#FFFFFF');
        this.nodeInfoCtx.textAlign = 'center';

        this.nodeInfoCtx.font = 'normal 13px "Droid Sans"';
        this.nodeInfoCtx.fillText(
            downCount,
            node.x + this.property.outCircle.radius + 14,
            node.y + this.property.outCircle.radius + 8
        );
    },


    /**
     */
    drawNodeData: function(node) {
        var agentId = node.id.split('-')[1];
        var childNodeId;
        var tps = 0;
        var txnElapse = 0;

        var ix, ixLen;
        if (node.id.indexOf('GROUP-') === 0) {
            for (ix = 0, ixLen = node.childList.length; ix < ixLen; ix++) {
                childNodeId = this.getServerIdByNodeId(node.childList[ix].id);
                tps += this.tpsAvgMin[childNodeId] || 0;
                txnElapse += this.elapsedTimeAvgMin[childNodeId] || 0;
            }
            if (ixLen > 0) {
                tps = tps / ixLen;
                txnElapse = txnElapse / ixLen;
            }
            tps = Math.ceil(tps);
            txnElapse = Math.round(txnElapse * 1000) / 1000;
        } else {
            tps = this.tpsAvgMin[agentId] || 0;
            txnElapse = this.elapsedTimeAvgMin[agentId] || 0;
            txnElapse = Math.round(txnElapse * 1000) / 1000;
        }

        if (node.isHide) {
            this.ctx.fillStyle = 'transparent';
        } else {
            this.ctx.fillStyle = 'rgba('+this.getHexToRgb(this.backgroundColor) +','+ 0.7 + ')';
        }
        this.ctx.fillRect(
            node.x + this.property.outCircle.radius * 2 + 10,
            node.y - this.property.outCircle.radius, 60, 12
        );
        this.ctx.fillRect(
            node.x + this.property.outCircle.radius * 2 + 10,
            node.y - this.property.outCircle.radius + 15, 30, 12
        );

        this.ctx.fillStyle = this.fontColor || '#FFFFFF';
        this.ctx.textAlign = 'left';

        this.ctx.font = 'normal 12px "Droid Sans"';
        this.ctx.fillText(
            tps + ' calls/sec',
            node.x + this.property.outCircle.radius * 2 + 12,
            node.y - this.property.outCircle.radius + 10
        );
        this.ctx.fillText(
            txnElapse + ' s' + ((node.remoteType === 'TIBCO (async)')? ' (async)':''),
            node.x + this.property.outCircle.radius * 2 + 12,
            node.y - this.property.outCircle.radius + 25
        );
    },


    /**
     * Transaction Path Popup Monitor
     *
     * @param {} node
     */
    drawTxnRect: function(node) {
        var px = node.x - 25;
        var py = node.y - 40;

        var rectFillStyle = this.property.rect.fillStyle;

        var grd = this.ctx.createLinearGradient(px, py ,px, py + 70);

        if (this.alarmType.DOWN === node.status) {
            grd.addColorStop(0.3, '#65B509');
            grd.addColorStop(1, '#3C6E04');

        } else if (this.alarmType.CRITICAL === node.status) {
            grd.addColorStop(0.3, '#B50909');
            grd.addColorStop(1, '#760404');

        } else if (this.alarmType.WARNING === node.status) {
            grd.addColorStop(0.3, '#FF9803');
            grd.addColorStop(1, '#BF7202');

        } else {
            grd.addColorStop(0.3, '#65B509');
            grd.addColorStop(1, '#3C6E04');
        }

        this.ctx.fillStyle = grd;
        this.ctx.shadowColor = '#000000';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;

        this.roundRect(
            this.ctx, px, py,
            this.property.rect.width,
            this.property.rect.height,
            this.property.rect.radius,
            true,
            false
        );

        this.ctx.shadowColor= 'transparent';
        this.ctx.shadowBlur = 0;

        this.ctx.fillStyle = '#FFF';
        this.ctx.font      = 'normal 11px "Droid Sans"';
        this.ctx.textAlign = 'left';

        // Agent Name
        this.ctx.fillText(
            this.fittingString(this.ctx, node.name, 120),
            node.x - 15,
            node.y - 20
        );

        //grd = this.ctx.createLinearGradient(px + 5, py + 27 ,px + 130, py + 27);
        //grd.addColorStop(0.3, '#65B509');
        //grd.addColorStop(1, '#3C6E04');

        if (this.alarmType.DOWN === node.status) {
            this.ctx.strokeStyle = '#212227';

        } else if (this.alarmType.CRITICAL === node.status) {
            this.ctx.strokeStyle = '#212227';

        } else if (this.alarmType.WARNING === node.status) {
            this.ctx.strokeStyle = '#482B01';

        } else {
            this.ctx.strokeStyle = '#264403';
        }
        this.ctx.lineWidth = this.property.rect.lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(px + 5, py + 27);
        this.ctx.lineTo(px + 130, py + 27);
        //this.ctx.closePath();
        this.ctx.stroke();

        // Txn Name
        this.ctx.fillText(
            this.fittingString(this.ctx, node.txnName, 120),
            //node.txnName,
            node.x - 15,
            node.y
        );

        this.ctx.beginPath();
        this.ctx.moveTo(px + 5, py + 46);
        this.ctx.lineTo(px + 130, py + 46);
        //this.ctx.closePath();
        this.ctx.stroke();

        // Elapsed Time
        this.ctx.fillText(
            'Elapsed : ' + ((node.status === 3)? 0 : node.elapseTime),
            node.x - 15,
            node.y + 19
        );

        // CallTree Icon
        this.ctx.beginPath();
        this.ctx.arc(
            px + this.property.rect.width - 8,
            py + this.property.rect.height - 9,
            22,
            0,
            2 * Math.PI
        );
        this.ctx.closePath();

        this.ctx.fillStyle = 'rgba('+this.getHexToRgb(this.backgroundColor) +','+ 0.2 + ')';;
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(
            px + this.property.rect.width - 9,
            py + this.property.rect.height - 10,
            20,
            0,
            2 * Math.PI
        );
        this.ctx.closePath();

        this.ctx.fillStyle = '#1D95F4';
        this.ctx.fill();

        this.ctx.fillStyle = this.fontColor || '#FFFFFF';
        this.ctx.textAlign = 'center';
        this.ctx.font = 'normal 12px "Droid Sans"';

        this.ctx.fillText(
            'Call',
            px + this.property.rect.width - 9,
            py + this.property.rect.height - 11
        );
        this.ctx.fillText(
            'Tree',
            px + this.property.rect.width - 9,
            py + this.property.rect.height
        );

        this.callTreeIconList[this.callTreeIconList.length] =
            new this.nodeClass.callTreeIcon(
                node.id,
                px + this.property.rect.width - 10,
                py + this.property.rect.height - 10,
                20,
                'CallTree'
            );
    },


    /**
     * 노드 그리기
     *
     * @param {object} node
     */
    drawCircle: function(node) {
        var ix, ixLen;

        this.ctx.beginPath();
        this.ctx.arc(
            node.x,
            node.y,
            this.property.outCircle.radius * 2,
            0,
            2 * Math.PI
        );
        this.ctx.arc(
            node.x,
            node.y,
            this.property.inCircle.radius * 2 + 6,
            0,
            2 * Math.PI,
            true
        );
        this.ctx.closePath();

        if (node.isHide) {
            this.ctx.strokeStyle = 'transparent';
        } else if (node.status === 3) {
            this.ctx.strokeStyle = '#72757B';
        } else if (node.status === 2) {
            this.ctx.strokeStyle = this.property.outCircle.criticalFill;
        } else if (node.status === 1) {
            this.ctx.strokeStyle = this.property.outCircle.warningFill;
        } else {
            this.ctx.strokeStyle = this.property.outCircle.fillStyle;
        }

        this.ctx.lineWidth = this.property.outCircle.lineWidth;
        this.ctx.stroke();

        if (node.isHide) {
            this.ctx.fillStyle = 'transparent';
        } else if (node.status === 3) {
            this.ctx.fillStyle = '#72757B';
        } else if (node.status === 2) {
            this.ctx.fillStyle = this.property.outCircle.criticalFill;
        } else if (node.status === 1) {
            this.ctx.fillStyle = this.property.outCircle.warningFill;
        } else {
            this.ctx.fillStyle = this.property.outCircle.fillStyle;
        }

        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(
            node.x,
            node.y,
            this.property.inCircle.radius * 2,
            0,
            2 * Math.PI
        );
        this.ctx.closePath();

        this.ctx.strokeStyle = 'transparent';
        this.ctx.stroke();

        if (node.isHide) {
            this.ctx.fillStyle = 'transparent';
        } else if (node.status === 3) {
            this.ctx.fillStyle = '#72757B';
        } else if (node.status === 2) {
            this.ctx.fillStyle = this.property.inCircle.criticalFill;
        } else if (node.status === 1) {
            this.ctx.fillStyle = this.property.inCircle.warningFill;
        } else {
            this.ctx.fillStyle = this.property.inCircle.fillStyle;
        }

        this.ctx.fill();

        // 노드 중앙에 표시되는 액티브 트랜잭션 건수 그리기 -----------------------------------
        this.ctx.fillStyle = (node.isHide)? 'transparent' : '#FFF';
        this.ctx.font      = 'normal 20px "Droid Sans"';
        this.ctx.textAlign = 'center';

        var activeCnt = this.getActiveCountByNodeId(node);

        this.ctx.fillText(activeCnt, node.x, node.y + 7);

//        if (node.isGroupMode) {
//            // 서버가 Down, Disconnected 상태일 때는 건수를 0으로 표시
//            if (node.status === 3) {
//                this.ctx.fillText(0, node.x, node.y + 7);
//
//            } else {
//                var activeCount = 0;
//                var childNode, childNodeId;
//
//                // 그룹에 포함된 에이전트의 트랜잭션 건수를 합계하여 표시
//                for (ix = 0, ixLen = node.childIdAllList.length; ix < ixLen; ix++) {
//                    childNodeId = node.childIdAllList[ix];
//                    childNode = this.getNodeById(childNodeId);
//                    activeCount += childNode.value;
//                }
//                this.ctx.fillText(activeCount, node.x, node.y + 7);
//            }
//        } else {
//            // 서버가 Down, Disconnected 상태일 때는 건수를 0으로 표시
//            if (node.status === 3) {
//                this.ctx.fillText(0, node.x, node.y + 7);
//            } else {
//                this.ctx.fillText(node.value, node.x, node.y + 7);
//            }
//        }

        // 에이전트 타입명 그리기
        if (this.isDisplayAgentType) {
            this.ctx.fillStyle = (node.isHide)? 'transparent' : '#FFF';
            this.ctx.font      = 'normal 9px "Droid Sans"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(node.type, node.x, node.y + 19);
        }

        // 노드명 그리기
        this.ctx.fillStyle = (node.isHide)? 'transparent' : this.fontColor || '#FFF';
        this.ctx.font      = 'bold 15px "Droid Sans"';
        this.ctx.textAlign = 'center';

        var lines = this.getWordWrap(this.ctx, node.alias);
        for (ix = 0, ixLen = lines.length; ix < ixLen; ix++) {
            this.ctx.fillText(lines[ix], node.x, node.y + 54 + (14 * ix));
        }

        this.nodeNameBoxList[this.nodeNameBoxList.length] =
            new this.nodeClass.nodeNameBox(
                node.id,
                node.x,
                node.y + 54,
                node.alias,
                this.ctx.measureText(node.alias).width
            );


        if (this.isPressCtrlKey) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.property.selectCircle.strokeStyle;
            this.ctx.setLineDash([5]);
            this.ctx.arc(
                node.x,
                node.y,
                this.property.selectCircle.radius * 2,
                0,
                2 * Math.PI
            );
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.setLineDash([]);
        }

    },


    /**
     * Draw Server Node (ex. TUXEDO, TMAX, SAP)
     */
    drawServer: function(node) {
        if (node.isHide) {
            return;
        }
        var iconPt = this.getImagePoint(node.type.toLowerCase());
        this.ctx.drawImage(
            this.iconImg, iconPt.x, iconPt.y, iconPt.w, iconPt.h,
            node.x - 64 / 2,
            node.y - 55 / 2,
            iconPt.w,
            iconPt.h
        );

        // Node Label
        this.ctx.fillStyle = this.fontColor || '#FFFFFF';
        this.ctx.font      = 'bold 13px "Droid Sans"';
        this.ctx.textAlign = 'center';

        if (node.isGroupMode) {
            this.ctx.fillText(node.alias, node.x + 37, node.y + 80);
        } else {
            this.ctx.fillText(node.alias, node.x + 35 - 64 / 2, node.y + 70 - 55 / 2);
        }

        this.nodeNameBoxList[this.nodeNameBoxList.length] =
            new this.nodeClass.nodeNameBox(
                node.id,
                node.x + 35 - 64 / 2,
                node.y + 70 - 55 / 2,
                node.alias,
                this.ctx.measureText(node.alias).width + 20
            );
    },


    /**
     * Draw Http, TCP Node
     */
    drawCloud: function(node) {
        if (node.isHide) {
            return;
        }

        var iconPt = this.getImagePoint(node.type.toLowerCase());
        this.ctx.drawImage(
            this.iconImg, iconPt.x, iconPt.y, iconPt.w, iconPt.h,
            node.x - 91 / 2,
            node.y - 54 / 2,
            iconPt.w,
            iconPt.h
        );

        // Node Label
        this.ctx.fillStyle = this.fontColor || '#FFFFFF';
        this.ctx.font      = 'bold 13px "Droid Sans"';
        this.ctx.textAlign = 'center';

        if (node.isGroupMode) {
            this.ctx.fillText(node.alias, node.x + 45, node.y + 75);
        } else {
            this.ctx.fillText(node.alias, node.x + 45 - 91 / 2, node.y + 70 - 54 / 2);
        }

        this.nodeNameBoxList[this.nodeNameBoxList.length] =
            new this.nodeClass.nodeNameBox(
                node.id,
                node.x + 45 - 91 / 2,
                node.y + 70 - 54 / 2,
                node.alias,
                this.ctx.measureText(node.alias).width + 20
            );
    },


    /**
     * Draw Database Node (ex. MSSQL, Oracle, PostgreSQL, MS, PG, Informix)
     *
     * @param {object} node
     * @param {boolean} isTxnPath
     */
    drawDatabase: function(node, isTxnPathMode) {
        if (node.isHide) {
            return;
        }

        var imageKey;
        switch (node.status) {
            case this.alarmType.WARNING:
                imageKey = 'warning_db';
                break;
            case this.alarmType.CRITICAL:
                imageKey = 'critical_db';
                break;
            case this.alarmType.DOWN:
                imageKey = 'down_db';
                break;
            default:
                imageKey = 'db';
                break;
        }

        var iconPt    = this.getImagePoint(imageKey);
        var dbId      = this.getServerIdByNodeId(node.id);
        var isMonitor = (Comm.dbInfoObj[dbId])? true : false;

        var activeSessions = 0, lockSessions = 0;

        if (Repository.DBStat[dbId]) {
            lockSessions   = Repository.DBStat[dbId].lock   || 0;
            activeSessions = Repository.DBStat[dbId].active || 0;
        }

        // Draw DB Icon Image
        this.ctx.drawImage(
            this.iconImg, iconPt.x, iconPt.y, iconPt.w, iconPt.h,
            node.x - 59 / 2,
            node.y - 64 / 2,
            iconPt.w,
            iconPt.h
        );

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font      = 'normal 14px "Droid Sans"';
        this.ctx.textAlign = 'center';

        // DB Active Sessions Value
        // 스펙: 모니터링 대상이 아닌 DB 인 경우 액티브 세션 정보를 보여주지 않는다.
        if (isMonitor) {
            this.ctx.fillText(
                activeSessions,
                node.x + 30 - 59/2,
                node.y + 38 - 65/2
            );
        }

        // DB Lock Sessions Value
        // 스펙: 모니터링 대상이 아닌 DB 인 경우 락 세션 정보를 보여주지 않는다.
        if (lockSessions > 0 && isMonitor) {
            this.ctx.beginPath();
            this.ctx.arc(
                node.x + 20,
                node.y - 20,
                11,
                0,
                2 * Math.PI
            );
            this.ctx.closePath();
            this.ctx.fillStyle = 'rgba('+this.getHexToRgb(this.property.inCircle.criticalFill) +','+ 0.8 + ')';
            this.ctx.fill();

            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText(
                lockSessions,
                node.x + 20,
                node.y - 15
            );
        }

        // DB Type Label
        this.ctx.font = 'normal 10px "Droid Sans"';

        this.ctx.fillText(
            node.type.toUpperCase(),
            node.x + 30 - 59/2,
            node.y + 52 - 65/2
        );

        // Node Label
        this.ctx.fillStyle = this.fontColor || '#FFFFFF';
        this.ctx.font = 'bold 13px "Droid Sans"';
        //this.ctx.textAlign = 'center';

        if (node.isGroupMode) {
            this.ctx.fillText(node.alias, node.x + 37, node.y + 85);
        } else {
            this.ctx.fillText(node.alias, node.x + 30 - 59/2, node.y + 80 - 65/2);
        }

        this.nodeNameBoxList[this.nodeNameBoxList.length] =
            new this.nodeClass.nodeNameBox(
                node.id,
                node.x + 30 - 59 / 2,
                node.y + 80 - 65 / 2,
                node.alias,
                this.ctx.measureText(node.alias).width + 20
            );

        // Transaction Path Mode
        if (isTxnPathMode) {
            // SQL
            this.ctx.beginPath();
            this.ctx.arc(
                node.x + this.imagePoint.down_tuxedo_group.w / 2 - 10,
                node.y - 17,
                20,
                0,
                2 * Math.PI
            );
            this.ctx.closePath();

            this.ctx.fillStyle = 'rgba('+this.getHexToRgb(this.backgroundColor) +','+ 0.5 + ')';
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(
                node.x + this.imagePoint.down_tuxedo_group.w / 2 - 10,
                node.y - 17,
                18,
                0,
                2 * Math.PI
            );
            this.ctx.closePath();

            this.ctx.fillStyle = '#1D95F4';
            this.ctx.fill();

            this.ctx.fillStyle = this.fontColor || '#FFFFFF';
            this.ctx.textAlign = 'center';
            this.ctx.font = 'normal 12px "Droid Sans"';

            this.ctx.fillText(
                'SQL',
                node.x + this.imagePoint.down_tuxedo_group.w / 2 - 10,
                node.y - 12
            );

            this.callTreeIconList[this.callTreeIconList.length] =
                new this.nodeClass.callTreeIcon(
                    node.id,
                    node.x + this.imagePoint.down_tuxedo_group.w / 2 - 10,
                    node.y - 12,
                    20,
                    'SQL'
                );

            // Txn Path Info
            this.ctx.fillStyle = 'rgba('+this.getHexToRgb(this.backgroundColor) +','+ 0.7 + ')';
            this.ctx.fillRect(
                node.x + this.imagePoint.down_tuxedo_group.w,
                node.y - 17,
                60,
                12
            );

            this.ctx.fillStyle = this.fontColor || '#FFFFFF';
            this.ctx.textAlign = 'left';

            this.ctx.font = 'normal 12px "Droid Sans"';
            this.ctx.fillText(
                'Elapse:',
                node.x + this.imagePoint.down_tuxedo_group.w - 18,
                node.y - 18
            );
            this.ctx.fillText(
                'Exec   :',
                node.x + this.imagePoint.down_tuxedo_group.w - 18,
                node.y - 6
            );

        }
    },


    /**
     * Draw Complex Node
     */
    drawComplexGroup: function(node) {
        if (node.isHide) {
            return;
        }
        var iconPt = this.getImagePoint(node.type.toLowerCase());
        this.ctx.drawImage(
            this.iconImg, iconPt.x, iconPt.y, iconPt.w, iconPt.h,
            node.x - 76 / 2,
            node.y - 71 / 2,
            iconPt.w,
            iconPt.h
        );

        // Node Label
        this.ctx.fillStyle = this.fontColor || '#FFFFFF';
        this.ctx.font      = 'bold 13px "Droid Sans"';
        this.ctx.textAlign = 'center';

        this.ctx.fillText(node.alias, node.x + 37 - 76/2, node.y + 85 - 71/2);

        this.nodeNameBoxList[this.nodeNameBoxList.length] =
            new this.nodeClass.nodeNameBox(
                node.id,
                node.x + 37 - 76 / 2,
                node.y + 85 - 71 / 2,
                node.alias,
                this.ctx.measureText(node.alias).width + 20
            );
    },


    /**
     * Draw Alarm Animation Effect
     */
    drawAlarmEffect: function(radius, zoomOut) {
        if (this.isAlarmAnimate !== true || !this.nodeList) {
            return;
        }

        // Check Animation Frame Performance
        //window.cancelAnimationFrame(this.alarmAnimateHandle);

        radius = (radius === undefined)? this.property.outCircle.radius + 24 : radius;
        zoomOut = (zoomOut === undefined)? false : zoomOut;

        var ix, ixLen;
        var nodeObj;
        var x, y;
        var alarmColor;
        this.fpsNow = Date.now();
        this.delta = this.fpsNow - this.fpsThen;

        if (this.delta > this.fpsInterval && this.isDrawFrame) {
            this.clearAlarmLayout();

            if (zoomOut === true) {
                if (radius < this.property.outCircle.radius + 40) {
                    radius += 1.4; // Alarm Effect Speed
                } else {
                    zoomOut = false;
                }
            } else {
                if (radius > this.property.inCircle.radius + 24) {
                    radius = this.property.inCircle.radius + 24;
                } else {
                    zoomOut = true;
                }
            }

            for (ix = 0, ixLen =  this.nodeList.length; ix < ixLen ; ix++) {
                nodeObj = this.nodeList[ix];

                if (nodeObj.level !== 0 || (+nodeObj.status !== 1 && +nodeObj.status !== 2) ) {
                    continue;
                }

                x = nodeObj.x;
                y = nodeObj.y;

                alarmColor = (nodeObj.status === 2)? '#DB121A' : '#FF9803';
                this.alarmGradient = this.groupCtx.createRadialGradient(x, y, this.property.outCircle.radius + 24, x, y, this.property.outCircle.radius + 40);
                this.alarmGradient.addColorStop(0, 'rgba('+this.getHexToRgb(alarmColor) +','+ 0.7 + ')');
                this.alarmGradient.addColorStop(0.2, 'rgba('+this.getHexToRgb(alarmColor) +','+ 0.5 + ')');
                this.alarmGradient.addColorStop(0.4, 'rgba('+this.getHexToRgb(alarmColor) +','+ 0.3 + ')');
                this.alarmGradient.addColorStop(0.8, 'rgba('+this.getHexToRgb(alarmColor) +','+ 0.1 + ')');
                this.alarmGradient.addColorStop(1, 'transparent');

                // draw the circle
                this.alarmCtx.beginPath();
                this.alarmCtx.arc(x, y, radius, 0, Math.PI * 2, false);
                this.alarmCtx.closePath();

                this.alarmCtx.strokeStyle = this.alarmGradient;
                this.alarmCtx.lineWidth = 6;
                this.alarmCtx.stroke();

                this.fpsThen = this.fpsNow - ( this.delta % this.fpsInterval);
            }
        }

        if (radius >= this.property.outCircle.radius + 40) {
            this.clearAlarmLayout();
            setTimeout(function(radius, zoomOut) {
                this.alarmAnimateHandle = window.requestAnimationFrame(this.drawAlarmEffect.bind(this, radius, zoomOut));
            }.bind(this, radius, zoomOut), 200);
        } else {
            this.alarmAnimateHandle = window.requestAnimationFrame(this.drawAlarmEffect.bind(this, radius, zoomOut));
        }

    },


    /**
     */
    drawDownEffect: function(angle) {
        // Check Animation Frame Performance
        //window.cancelAnimationFrame(this.downAnimateHandle);

        var ix, ixLen;
        var nodeObj;
        var x, y;

        angle = (angle === undefined)? 0 : angle;
        var radius = 28 * Math.abs(Math.cos(angle));

        for (ix = 0, ixLen =  this.nodeList.length; ix < ixLen ; ix++) {
            nodeObj = this.nodeList[ix];

            if (nodeObj.isGroupMode !== true || nodeObj.status !== 3) {
                continue;
            }

            x = nodeObj.x;
            y = nodeObj.y;

            this.alarmCtx.beginPath();
            this.alarmCtx.arc(
                x,
                y,
                radius,
                0,
                2 * Math.PI,
                false
            );
            this.alarmCtx.closePath();
    //        this.ctx.strokeStyle = this.property.inCircle.strokeStyle;
    //        this.ctx.lineWidth = this.property.inCircle.lineWidth;
    //        this.ctx.stroke();
            this.alarmCtx.fillStyle = '#72757B';
            this.alarmCtx.fill();

            angle += Math.PI / 64;

    //        mainContext.arc(225, 225, radius, 0, Math.PI * 2, false);
    //        mainContext.closePath();

    //        // color in the circle
    //        mainContext.fillStyle = "#006699";
    //        mainContext.fill();

    //        angle += Math.PI / 64;

            this.alarmCtx.fillStyle = '#FFF';
            this.alarmCtx.font      = 'bold 6px "Droid Sans"';
            this.alarmCtx.textAlign = 'center';
            this.alarmCtx.fillText('DOWN', x, y);
        }

        this.downAnimateHandle = window.requestAnimationFrame(this.drawDownEffect.bind(this, angle));
    },


    /**
     * 그룹 노드 만드는 것을 취소
     */
    cancelGroupFolder: function() {
        this.folderImgCnt = 0;

        this.displayCanvas.style.cursor = '';
        this.dragCanvas.style.cursor = '';

        this.clearOverLayout();

        this.isCheckCreateGroup = false;
        this.groupNameInputBox.style.display = 'none';

        // 텍스트 필드값을 초기화
        this.groupNameInputBox.value = '';

        if (this.selectNodeObj) {
            this.selectNodeObj.x = this.firstClickPoint.x;
            this.selectNodeObj.y = this.firstClickPoint.y;
            this.selectNodeObj = null;
        }

        if (this.mergeTargetNode) {
            this.mergeTargetNode.isHide = false;
        }

        if (this.mergeAgentList) {
            for (var jx = 0, jxLen = this.mergeAgentList.length; jx < jxLen; jx++) {
                this.mergeAgentList[jx].isHide = false;
            }
        }

        this.displayGroupViewStep = 0;

        this.clearGroupLayout();

        //this.canvasDraw();
        this.refreshData();
    },


    /**
     */
    drawFolderClose: function() {
        if (this.folderImgCnt === null) {
            this.folderImgCnt = 4;
        }

        // 노드명을 입력한 텍스트 창 정보를 초기화
        this.groupNameInputBox.style.top = '-200px';

        this.displayGroupViewStep = 0;

        if (this.folderImgCnt < 0) {
            window.cancelAnimationFrame(this.closeFolderAnimateId);

            this.folderImgCnt = 0;
            this.folderViewPt = null;

            if (!this.isCreateMultiGroup) {
                this.mergeDragDropNode();

            } else if (this.dragSelectionNodeList.length > 1) {
                this.mergeDragSelectionNode();

            } else {
                this.isCheckCreateGroup = false;
                this.isDragMultiSelection = false;

                this.groupNameInputBox.style.display = 'none';
                this.groupNameInputBox.value = '';

                //this.overCanvas.width = 0;
                //this.overCanvas.height = 0;
                this.clearOverLayout();

                this.clearGroupLayout();
            }
            this.isCreateMultiGroup = false;

            return;
        }

        var iconPt = this.getImagePoint('folder0' + this.folderImgCnt);
        var marginX = 36;
        var marginY = 32;

        if (this.mergeTargetNode.clazz && this.mergeTargetNode.clazz !== 'AGENT') {
            marginY = -10;
        }

        this.displayGroupViewStep = 0;

        this.clearGroupLayout();
        this.groupCtx.drawImage(
            this.iconImg,
            iconPt.x, iconPt.y, iconPt.w, iconPt.h,
            this.mergeTargetNode.x - marginX,
            this.mergeTargetNode.y - marginY,
            iconPt.w,
            iconPt.h
        );
        this.folderImgCnt--;

        this.closeFolderAnimateId = window.requestAnimationFrame(this.drawFolderClose.bind(this));
    },


    /**
     * 그룹 노드를 만드 때 보여지는 폴더 이미지를 그리기
     *
     * @param {function} callback
     */
    drawFolderOpen: function(callback) {
        this.isDrawingFolder = true;
        if (this.folderImgCnt === null) {
            this.folderImgCnt = 0;

        } else if (this.folderImgCnt > 4 ) {
            clearTimeout(this.openFolderAnimateId);

            this.folderImgCnt = 4;

            if (callback) {
                callback();
            }

            setTimeout(function() {
                this.isDrawingFolder = false;
                this.isWorkingMergeNode = false;
            }.bind(this), 100);

            return;
        }

        var iconPt = this.getImagePoint('folder0' + this.folderImgCnt);
        var marginX = 36;
        var marginY = 32;

        if (this.mergeTargetNode.clazz && this.mergeTargetNode.clazz !== 'AGENT') {
            marginY = -10;
        }

        this.displayGroupViewStep = 0;

        this.clearGroupLayout();

        this.groupCtx.drawImage(
            this.iconImg,
            iconPt.x, iconPt.y, iconPt.w, iconPt.h,
            this.mergeTargetNode.x - marginX,
            this.mergeTargetNode.y - marginY,
            iconPt.w,
            iconPt.h
        );
        this.folderImgCnt++;

        this.openFolderAnimateId = setTimeout(this.drawFolderOpen.bind(this, callback), 20);
    },


    /**
     * 그룹 노드를 분할하는 버튼 그리기.
     *
     * @param {object} node - 노드
     * @param {number} radius - 반지름
     */
    drawGroupSplitX: function(node, radius) {
        var angle = (radius > 60)? 300 : 290;
        var x = (radius * 2) * Math.cos(angle * Math.PI / 180);
        var y = (radius * 2) * Math.sin(angle * Math.PI / 180);

        var cx = this.detailNodePos.x;
        var cy = this.detailNodePos.y;

        var ctx;
        var step = this.displayGroupViewStep;

        if (step > 1) {
            ctx = this.getGroupChildContext(step);
        } else {
            ctx = this.groupChildCtx;
        }

        ctx.beginPath();
        ctx.arc(
            cx + x,
            cy + y,
            8,
            0,
            2 * Math.PI
        );
        ctx.closePath();
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = this.isSplitHover? '#30A0F8':'#C7C7C7';
        ctx.lineWidth = 2;
        ctx.moveTo(cx + x - 4, cy + y);
        ctx.lineTo(cx + x + 4, cy + y);
        ctx.stroke();
        ctx.closePath();

        this.groupSplitIconPt = {x: cx + x, y: cy + y, r: 4};
    },


    /**
     * 그룹 노드의 그룹 뷰를 닫은 버튼 그리기
     *
     * @param {object} node
     * @param {number} radius
     */
    drawGroupCloseX: function(node, radius) {
        var x = (radius * 2) * Math.cos(310 * Math.PI / 180);
        var y = (radius * 2) * Math.sin(310 * Math.PI / 180);

        var cx = this.detailNodePos.x;
        var cy = this.detailNodePos.y;

        var ctx;
        var step = this.displayGroupViewStep;

        if (step > 1) {
            ctx = this.getGroupChildContext(step);
        } else {
            ctx = this.groupChildCtx;
        }

        ctx.beginPath();
        ctx.arc(
            cx + x,
            cy + y,
            8,
            0,
            2 * Math.PI
        );
        ctx.closePath();
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = this.isCloseHover? '#30A0F8':'#C7C7C7';
        ctx.lineWidth = 2;
        ctx.moveTo(cx + x - 4, cy + y - 4);
        ctx.lineTo(cx + x + 4, cy + y + 4);
        ctx.moveTo(cx + x + 4, cy + y - 4);
        ctx.lineTo(cx + x - 4, cy + y + 4);
        ctx.stroke();
        ctx.closePath();

        this.groupCloseIconPt = {x: cx + x, y: cy + y, r: 4};
    },


    /**
     * 그룹 노드에 포함된 하위 노드 그리기
     *
     * @param {object} node
     */
    drawGroupChild: function(node) {
        if (node.childList.length > 0) {

            this.groupChildPt = [];

            var radius = this.property.outCircle.radius * 3 + 2;
            var x, y;
            var angle;
            var childNode, iconPt,
                activeSessions, lockSessions, imageKey, dbId, isMonitor;

            var cx = this.detailNodePos.x;
            var cy = this.detailNodePos.y

            var ctx;
            var step = this.displayGroupViewStep;

            if (step > 1) {
                ctx = this.getGroupChildContext(step);
            } else {
                ctx = this.groupChildCtx;
            }

            var childCount = node.childList.length;

            for (var ix = 1; ix <= childCount; ix++) {
                if (childCount < 8) {
                    angle = Math.trunc(360 / childCount);
                    x = (radius * 1 + 18) * Math.cos(angle * ix * Math.PI / 180);
                    y = (radius * 1 + 18) * Math.sin(angle * ix * Math.PI / 180);
                } else if (ix >= 0 && ix <= 8) {
                    angle = Math.trunc(360 / 8);
                    x = (radius * 1 + 18) * Math.cos(angle * ix * Math.PI / 180);
                    y = (radius * 1 + 18) * Math.sin(angle * ix * Math.PI / 180);

                } else if (ix > 8 && ix <= 23) {
                    angle = Math.trunc(360 / 15);
                    x = (radius * 2 + 18) * Math.cos(angle * ix * Math.PI / 180);
                    y = (radius * 2 + 18) * Math.sin(angle * ix * Math.PI / 180);

                } else if (ix > 23 && ix <= 43) {
                    angle = Math.trunc(360 / 20);
                    x = (radius * 3 + 18) * Math.cos(angle * ix * Math.PI / 180);
                    y = (radius * 3 + 18) * Math.sin(angle * ix * Math.PI / 180);

                } else if (ix > 43 && ix <= 73) {
                    angle = Math.trunc(360 / 28);
                    x = (radius * 4 + 18) * Math.cos(angle * ix * Math.PI / 180);
                    y = (radius * 4 + 18) * Math.sin(angle * ix * Math.PI / 180);

                } else if (ix > 73 && ix <= 102) {
                    angle = Math.trunc(360 / 30);
                    x = (radius * 5 + 18) * Math.cos(angle * ix * Math.PI / 180);
                    y = (radius * 5 + 18) * Math.sin(angle * ix * Math.PI / 180);
                }

                childNode = node.childList[ix - 1];
                this.groupChildPt[this.groupChildPt.length] = {
                    id: childNode.id,
                    x: cx + x,
                    y: cy + y,
                    r: 18,
                    clazz: node.clazz
                };

                if (childNode.clazz === 'AGENT') {
                    // Draw out circle layout
                    ctx.beginPath();
                    ctx.arc(
                        cx + x,
                        cy + y,
                        22,
                        0,
                        2 * Math.PI
                    );
                    ctx.arc(
                        cx + x,
                        cy + y,
                        20,
                        0,
                        2 * Math.PI,
                        true
                    );
                    ctx.closePath();

                    if (childNode.status === 3) {
                        ctx.fillStyle = '#72757B';
                    } else if (childNode.status === 2) {
                        ctx.fillStyle = this.property.outCircle.criticalFill;
                    } else if (childNode.status === 1) {
                        ctx.fillStyle = this.property.outCircle.warningFill;
                    } else {
                        ctx.fillStyle = this.property.outCircle.fillStyle;
                    }
                    ctx.fill();

                    // Draw in-circle layout
                    ctx.beginPath();
                    ctx.arc(
                        cx + x,
                        cy + y,
                        15,
                        0,
                        2 * Math.PI
                    );
                    ctx.closePath();

                    if (childNode.status === 3) {
                        ctx.fillStyle = '#72757B';
                    } else if (childNode.status === 2) {
                        ctx.fillStyle = this.property.inCircle.criticalFill;
                    } else if (childNode.status === 1) {
                        ctx.fillStyle = this.property.inCircle.warningFill;
                    } else {
                        ctx.fillStyle = this.property.inCircle.fillStyle;
                    }
                    ctx.fill();

                    var activeCnt = this.getActiveCountByNodeId(childNode);

                    // Text - Node Value (Active Count)
                    ctx.fillStyle = '#FFF';
                    ctx.font      = 'bold 11px "Droid Sans"';
                    ctx.textAlign = 'center';
                    ctx.fillText(activeCnt, cx + x, cy + y + 4);
                    //ctx.fillText(childNode.value, cx + x, cy + y + 4);

                    //Text - Node Name
                    ctx.fillStyle = '#FFF';
                    ctx.font      = 'bold 6px "Droid Sans"';
                    ctx.textAlign = 'center';
                    ctx.fillText(childNode.alias, cx + x, cy + y + 31);

                } else if (childNode.clazz === 'DB') {
                    switch (childNode.status) {
                        case this.alarmType.WARNING:
                            imageKey = 'warning_db';
                            break;
                        case this.alarmType.CRITICAL:
                            imageKey = 'critical_db';
                            break;
                        case this.alarmType.DOWN:
                            imageKey = 'down_db';
                            break;
                        default:
                            imageKey = 'db';
                            break;
                    }
                    iconPt    = this.getImagePoint(imageKey);
                    dbId      = this.getServerIdByNodeId(childNode.id);
                    isMonitor = (Comm.dbInfoObj[dbId])? true : false;

                    ctx.drawImage(
                        this.iconImg, iconPt.x, iconPt.y, iconPt.w, iconPt.h,
                        cx + x - Math.trunc(iconPt.w / 1.5 / 2),
                        cy + y - Math.trunc(iconPt.h / 1.5 / 2),
                        Math.trunc(iconPt.w / 1.5),
                        Math.trunc(iconPt.h / 1.5)
                    );

                    activeSessions = 0, lockSessions = 0;

                    if (Repository.DBStat[dbId]) {
                        lockSessions   = Repository.DBStat[dbId].lock   || 0;
                        activeSessions = Repository.DBStat[dbId].active || 0;
                    }

                    ctx.fillStyle = '#FFFFFF';
                    ctx.font      = 'normal 6px "Droid Sans"';
                    ctx.textAlign = 'center';

                    // DB Active Sessions Value
                    if (isMonitor) {
                        ctx.fillText(
                            activeSessions,
                            cx + x + 1,
                            cy + y + 6
                        );
                    }

                    // DB Lock Sessions Value
                    if (lockSessions > 0 && isMonitor) {
                        ctx.beginPath();
                        ctx.arc(
                            cx + x + 14,
                            cy + y - 13,
                            8,
                            0,
                            2 * Math.PI
                        );
                        ctx.closePath();
                        ctx.fillStyle = 'rgba('+this.getHexToRgb(this.property.inCircle.criticalFill) +','+ 0.8 + ')';
                        ctx.fill();

                        ctx.fillStyle = this.fontColor || '#FFFFFF';
                        ctx.fillText(
                            lockSessions,
                            cx + x + 14,
                            cy + y - 10
                        );
                    }

                    // Node Label
                    ctx.fillStyle = this.fontColor || '#FFFFFF';
                    ctx.font = 'bold 6px "Droid Sans"';

                    ctx.fillText(
                        childNode.alias,
                        cx + x + 20 - Math.trunc(iconPt.w / 1.5 / 2),
                        cy + y + 56 - Math.trunc(iconPt.h / 1.5 / 2)
                    );

                } else  {
                    iconPt = this.getImagePoint(childNode.type.toLowerCase());
                    ctx.drawImage(
                        this.iconImg, iconPt.x, iconPt.y, iconPt.w, iconPt.h,
                        cx + x - Math.trunc(iconPt.w / 1.5 / 2),
                        cy + y - Math.trunc(iconPt.h / 1.5 / 2),
                        Math.trunc(iconPt.w / 1.5),
                        Math.trunc(iconPt.h / 1.5)
                    );

                    // Node Label
                    ctx.fillStyle = this.fontColor || '#FFFFFF';
                    ctx.font      = 'bold 6px "Droid Sans"';
                    ctx.textAlign = 'center';

                    if (childNode.clazz === 'DB') {
                        ctx.fillText(
                            childNode.alias,
                            cx + x + 20 - Math.trunc(iconPt.w / 1.5 / 2),
                            cy + y + 56 - Math.trunc(iconPt.h / 1.5 / 2)
                        );
                    } else if (childNode.clazz === 'SERVER') {
                        ctx.fillText(
                            childNode.alias,
                            cx + x + 20 - Math.trunc(iconPt.w / 1.5 / 2),
                            cy + y + 48 - Math.trunc(iconPt.h / 1.5 / 2)
                        );
                    } else if (childNode.clazz === 'CLOUD') {
                        ctx.fillText(
                            childNode.alias,
                            cx + x + 30 - Math.trunc(iconPt.w / 1.5 / 2),
                            cy + y + 48 - Math.trunc(iconPt.h / 1.5 / 2)
                        );
                    } else {
                        ctx.fillText(
                            childNode.alias,
                            cx + x + 15 - Math.trunc(iconPt.w / 1.5 / 2),
                            cy + y + 48 - Math.trunc(iconPt.w / 1.5 / 2)
                        );
                    }
                }
            }

        }
    },


    /**
     * 그룹 뷰 그리기
     *
     * @param {object} node
     * @param {number} radius
     */
    drawGroupCircle: function(node, radius) {
        var ctx, oCtx, oCanvas;
        var step = this.displayGroupViewStep;

        this.checkGroupCanvas(step);

        this.clearGroupLayout();

        this.getDetailNodePos(node.x, node.y);

        oCtx    = this.overCtx;
        oCanvas = this.overCanvas;

        if (step > 0) {
            ctx = this.getGroupContext(step);
            oCanvas.style.zIndex = (step * 3 + 1);
        } else {
            ctx = this.groupCtx;
            oCanvas.style.zIndex = 4;
        }

        ctx.beginPath();
        ctx.shadowBlur = 1;
        ctx.shadowColor = '#30A0F8';
        ctx.arc(
            this.detailNodePos.x,
            this.detailNodePos.y,
            radius,
            0,
            2 * Math.PI,
            false
        );
        ctx.closePath();
        ctx.strokeStyle = '#30A0F8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        ctx.fillStyle = 'rgba('+this.getHexToRgb('#212227') +','+ 0.8 + ')';
        ctx.fill();

        if (this.groupCircleRadius * 2 !== radius) {
            radius = radius + 10;
        }

        if (this.groupCircleRadius * 2 > radius) {
            this.drawGroupAnimateId = window.requestAnimationFrame(this.drawGroupCircle.bind(this, node, radius));
        } else {
            if (this.groupCircleRadius * 2 !== radius) {
                radius = this.groupCircleRadius * 2;
                this.drawGroupCircle(node, radius);

            } else {
                window.cancelAnimationFrame(this.drawGroupAnimateId);
                this.drawGroupAnimateId = null;

                if (node.childList.length > 8) {
                    this.clearGroupLayout();
                    ctx.beginPath();
                    ctx.shadowBlur = 1;
                    ctx.shadowColor = '#30A0F8';
                    ctx.arc(
                        this.detailNodePos.x,
                        this.detailNodePos.y,
                        this.getGroupCircleRadius(node.childList.length, radius),
                        0,
                        2 * Math.PI,
                        false
                    );
                    ctx.closePath();
                    ctx.strokeStyle = '#30A0F8';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    ctx.shadowColor = 'transparent';
                    ctx.fillStyle = 'rgba('+this.getHexToRgb('#212227') +','+ 0.8 + ')';
                    ctx.fill();
                }

                this.nodeInfoCanvas.style.zIndex = 3;

                oCanvas.width = this.componentWidth;
                oCanvas.height = this.componentHeight;

                oCtx.save();
                oCtx.fillStyle = 'rgba('+this.getHexToRgb('#212227') +','+ 0.6 + ')';
                oCtx.fillRect(0, 0, this.dragCanvas.width, this.dragCanvas.height);
                oCtx.restore();

                this.drawGroupSplitX(node, this.getGroupCircleRadius(node.childList.length, this.groupCircleRadius));
                this.drawGroupCloseX(node, this.getGroupCircleRadius(node.childList.length, this.groupCircleRadius));
                this.drawGroupChild(node);

                if (node.clazz === 'AGENT') {
                    this.drawNavigateCircle(node);
                }

                this.isDrawingLayout = false;
            }
        }
    },


    /**
     * 웹 서버 그룹 뷰 그리기
     * 웹 서버 아이콘을 클릭하였을 때 표시되는 그룹영역 그리기
     *
     * @param {object} node
     * @param {number} radius
     */
    drawWebGroupCircle: function(node, radius) {
        var ctx, oCtx, oCanvas;
        var step = this.displayGroupViewStep;

        this.clearGroupLayout();

        this.getDetailNodePos(node.x, node.y);

        oCtx    = this.overCtx;
        oCanvas = this.overCanvas;

        if (step > 0) {
            ctx = this.getGroupContext(step);
            oCanvas.style.zIndex = (step * 3 + 1);
        } else {
            ctx = this.groupCtx;
            oCanvas.style.zIndex = 4;
        }

        ctx.beginPath();
        ctx.shadowBlur = 1;
        ctx.shadowColor = '#30A0F8';
        ctx.arc(
            this.detailNodePos.x,
            this.detailNodePos.y,
            radius,
            0,
            2 * Math.PI,
            false
        );
        ctx.closePath();
        ctx.strokeStyle = '#30A0F8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        ctx.fillStyle = 'rgba('+this.getHexToRgb('#212227') +','+ 0.8 + ')';
        ctx.fill();

        if (this.groupCircleRadius * 2 !== radius) {
            radius = radius + 10;
        }

        if (this.groupCircleRadius * 2 > radius) {
            this.drawGroupAnimateId = window.requestAnimationFrame(this.drawWebGroupCircle.bind(this, node, radius));
        } else {
            if (this.groupCircleRadius * 2 !== radius) {
                radius = this.groupCircleRadius * 2;
                this.drawWebGroupCircle(node, radius);

            } else {
                window.cancelAnimationFrame(this.drawGroupAnimateId);
                this.drawGroupAnimateId = null;

                if (node.webList.length > 8) {
                    this.clearGroupLayout();
                    ctx.beginPath();
                    ctx.shadowBlur = 1;
                    ctx.shadowColor = '#30A0F8';
                    ctx.arc(
                        this.detailNodePos.x,
                        this.detailNodePos.y,
                        this.getGroupCircleRadius(node.webList.length, radius),
                        0,
                        2 * Math.PI,
                        false
                    );
                    ctx.closePath();
                    ctx.strokeStyle = '#30A0F8';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    ctx.shadowColor = 'transparent';
                    ctx.fillStyle = 'rgba('+this.getHexToRgb('#212227') +','+ 0.8 + ')';
                    ctx.fill();
                }

                this.nodeInfoCanvas.style.zIndex = 3;

                oCanvas.width = this.componentWidth;
                oCanvas.height = this.componentHeight;

                oCtx.save();
                oCtx.fillStyle = 'rgba('+this.getHexToRgb('#212227') +','+ 0.6 + ')';
                oCtx.fillRect(0, 0, this.dragCanvas.width, this.dragCanvas.height);
                oCtx.restore();

                this.drawGroupCloseX(node, this.getGroupCircleRadius(node.webList.length, this.groupCircleRadius));
                this.drawGroupChild(node);

                if (node.clazz === 'AGENT') {
                    this.drawNavigateCircle(node);
                }

                this.isDrawingLayout = false;
            }
        }
    },


    /**
     * 그룹 노드의 그룹 뷰 레이아웃 그리기
     *
     * @param {string} nodeId - 선택 노드 ID
     * @param {boolean} isDisableAnimate - 애니메이션 표현 여부
     */
    drawGroupLayout: function(nodeId, isDisableAnimate) {

        if (!nodeId) {
            return;
        }

        var node = this.getNodeById(nodeId);

        this.groupCircleRadius = this.property.outCircle.radius * 3.5;

        this.selectedGroupCircle = node;

        var drawStartRadius = (isDisableAnimate)? this.groupCircleRadius * 2 : 2;

        if (this.drawGroupAnimateId) {
            window.cancelAnimationFrame(this.drawGroupAnimateId);
        }

        this.isDrawingLayout = true;

        // 연결된 웹 서버가 포함되어 있는 경우
        if (this.selectedGroupCircle.isWebContain) {
            this.drawWebGroupCircle(node, drawStartRadius);
        } else {
            this.drawGroupCircle(node, drawStartRadius);
        }
    },


    /**
     * 노드에 포함된 웹 서버의 그룹 뷰 레이아웃 그리기
     *
     * @param {string} nodeId - 선택 노드 ID
     * @param {boolean} isDisableAnimate - 애니메이션 표현 여부
     */
    drawWebGroupLayout: function(nodeId, isDisableAnimate) {

        if (!nodeId) {
            return;
        }

        var node = this.getNodeById(nodeId);

        this.groupCircleRadius = this.property.outCircle.radius * 3.5;

        this.selectedGroupCircle = node;

        var drawStartRadius = (isDisableAnimate)? this.groupCircleRadius * 2 : 2;

        if (this.drawGroupAnimateId) {
            window.cancelAnimationFrame(this.drawGroupAnimateId);
        }

        this.isDrawingLayout = true;

        this.drawWebGroupCircle(node, drawStartRadius);
    },


    /**
     * Draw Node Navigate Menu (2 Menu)
     */
    drawNavigateCircle: function(node) {

        var gradient, iconPt;

        var cx = this.detailNodePos.x;
        var cy = this.detailNodePos.y;

        //================================================================================
        // Draw Icon Background
        //================================================================================
        // Navigate Icon Background - Zoom
        gradient = this.naviCtx.createRadialGradient(
            cx + 1,
            cy,
            this.property.inCircle.radius - 6,
            cx + 1,
            cy,
            this.property.inCircle.radius + 10
        );

        this.setNaviMenuGradient(node, gradient, this.isFocusZoomIcon && node.isDisplayNavigate);

        this.naviCtx.beginPath();
        this.naviCtx.arc(
            cx,
            cy,
            this.property.inCircle.radius * 2,
            1.5 * Math.PI,
            0.5 * Math.PI
        );
        this.naviCtx.fillStyle = gradient;
        this.naviCtx.fill();

        // Navigate Icon Background - Xview
        gradient = this.naviCtx.createRadialGradient(
            cx,
            cy,
            this.property.inCircle.radius - 6,
            cx,
            cy,
            this.property.inCircle.radius + 10
        );

        this.setNaviMenuGradient(node, gradient, this.isFocusXviewIcon && node.isDisplayNavigate);

        if (this.isFocusXviewIcon && node.isDisplayNavigate) {
            this.isHoverIcon = false;
        }

        this.naviCtx.beginPath();
        this.naviCtx.arc(
            cx,
            cy,
            this.property.inCircle.radius * 2,
            0.5 * Math.PI,
            1.5 * Math.PI
        );
        this.naviCtx.fillStyle = gradient;
        this.naviCtx.fill();

        this.naviCtx.beginPath();
        this.naviCtx.moveTo(cx, cy - this.property.inCircle.radius * 2);
        this.naviCtx.lineTo(cx, cy + this.property.inCircle.radius * 2);
        this.naviCtx.closePath();
        this.naviCtx.lineWidth = 0.6;
        this.naviCtx.strokeStyle = this.backgroundColor;
        this.naviCtx.stroke();

        //================================================================================
        // Draw Icon Image
        //================================================================================
        // Naviagte Icon Image - Xview
        iconPt = this.getImagePoint('xview');
        this.naviCtx.drawImage(
            this.iconImg,
            iconPt.x, iconPt.y, iconPt.w, iconPt.h,
            cx - 20,
            cy - iconPt.h / 2,
            iconPt.w,
            iconPt.h
        );
        this.xviewIconPt = {
            x1: cx - 20,
            y1: cy - iconPt.h / 2,
            x2: cx - 20 + iconPt.w,
            y2: cy - iconPt.h / 2 + iconPt.h
        };

        // Naviagte Icon Image - Zoom
        iconPt = this.getImagePoint('zoom');
        this.naviCtx.drawImage(
            this.iconImg,
            iconPt.x, iconPt.y, iconPt.w, iconPt.h,
            cx + 7,
            cy - iconPt.h / 2,
            iconPt.w,
            iconPt.h
        );
        this.zoomIconPt = {
            x1: cx + 7,
            y1: cy - iconPt.h / 2,
            x2: cx + 7 + iconPt.w,
            y2: cy - iconPt.h / 2 + iconPt.h
        };
    },


    /**
     *  그룹 노드에 마우스가 위치하였을 때 보여지는 메뉴 구성.
     *
     * 표시 메뉴 아이콘
     * 액티브 트랜잭션 모니터, 액티브 트랜잭션 목록, 그룹 뷰
     *
     * @param {number} menuX
     * @param {number} menuY
     * @param {object} node - 그룹 노드
     * @param {number} radius - 반지름
     * @param {boolean} isChild - 하위 노드 여부
     */
    drawNavigateMultiAgent: function(menuX, menuY, node, radius, isChild) {
        var gradient, iconPt;
        var outRadius;

        var cx = menuX;
        var cy = menuY;

        var iconX, iconY;

        radius = radius || this.property.inCircle.radius;

        if (isChild) {
            outRadius = this.property.childOutCircle.radius + 3.8;
        } else {
            outRadius = this.property.outCircle.radius; 
        }

        var isAgentType = node.clazz === 'AGENT';

        if (!this.isDisplayGroupMode) {
            this.nodeInfoCanvas.style.zIndex = 14;
        }

        // Navigate Icon Background - Zoom -----------------------------------------------
        gradient = this.naviCtx.createRadialGradient(
            cx + 1,
            cy,
            radius - 6,
            cx + 1,
            cy,
            radius + 10
        );

        this.setNaviMenuGradient(node, gradient, this.isFocusZoomIcon);

        this.naviCtx.beginPath();
        this.naviCtx.arc(
            cx,
            cy,
            radius * 2,
            1.5 * Math.PI,
            0.2 * Math.PI
        );
        this.naviCtx.lineTo(cx, cy);
        this.naviCtx.closePath();
        this.naviCtx.fillStyle = gradient;
        this.naviCtx.fill();

        // Navigate Icon Background - Group ----------------------------------------------
        gradient = this.naviCtx.createRadialGradient(
            cx + 0.5,
            cy + 0.5,
            radius - 6,
            cx + 0.5,
            cy + 0.5,
            radius + 10
        );

        this.setNaviMenuGradient(node, gradient, this.isFocusGroupIcon);

        this.naviCtx.beginPath();
        this.naviCtx.arc(
            cx,
            cy,
            radius * 2,
            0.2 * Math.PI,
            0.8 * Math.PI
        );
        this.naviCtx.lineTo(cx, cy);
        this.naviCtx.closePath();
        this.naviCtx.fillStyle = gradient;
        this.naviCtx.fill();

        // Navigate Icon Background - Xview ----------------------------------------------
        gradient = this.naviCtx.createRadialGradient(
            cx,
            cy,
            radius - 6,
            cx,
            cy,
            radius + 10
        );

        this.setNaviMenuGradient(node, gradient, this.isFocusXviewIcon);

        this.naviCtx.beginPath();
        this.naviCtx.arc(
            cx,
            cy,
            radius * 2,
            0.8 * Math.PI,
            1.5 * Math.PI
        );
        this.naviCtx.lineTo(cx, cy);
        this.naviCtx.closePath();
        this.naviCtx.fillStyle = gradient;
        this.naviCtx.fill();

        this.naviCtx.lineWidth = 0.6;
        this.naviCtx.strokeStyle = this.backgroundColor;
        this.naviCtx.beginPath();
        this.naviCtx.moveTo(cx, cy);
        this.naviCtx.lineTo(cx, cy - outRadius * 2 + 8);
        this.naviCtx.closePath();
        this.naviCtx.stroke();

        this.naviCtx.beginPath();
        var x = (outRadius * 2 - 8) * Math.cos(35 * Math.PI / 180);
        var y = (outRadius * 2 - 8) * Math.sin(35 * Math.PI / 180);
        this.naviCtx.moveTo(cx, cy);
        this.naviCtx.lineTo(cx + x, cy + y);
        this.naviCtx.closePath();
        this.naviCtx.stroke();

        this.naviCtx.beginPath();
        x = (outRadius * 2 - 8) * Math.cos(145 * Math.PI / 180);
        y = (outRadius * 2 - 8) * Math.sin(145 * Math.PI / 180);
        this.naviCtx.moveTo(cx, cy);
        this.naviCtx.lineTo(cx + x, cy + y);
        this.naviCtx.closePath();
        this.naviCtx.stroke();

        //================================================================================
        // 메뉴 아이콘 이미지 그리기
        //================================================================================

        // 메뉴 아이콘 이미지 - Xview (트랜잭션 모니터 ) -------------------------------------
        iconPt = this.getImagePoint('xview');
        iconX = cx - 20 + (isAgentType? (isChild? 4 : 0) : 25);
        iconY = cy - iconPt.h / 2 - 7 + (isAgentType? (isChild? 2 : 0) : 25);

        this.naviCtx.drawImage(
            this.iconImg,
            iconPt.x, iconPt.y, iconPt.w, iconPt.h,
            iconX,
            iconY,
            iconPt.w,
            iconPt.h
        );
        this.xviewIconPt = {
            x1: iconX,
            y1: iconY,
            x2: iconX + iconPt.w,
            y2: iconY + iconPt.h
        };

        // 메뉴 아이콘 이미지 - Zoom (액티브 트랜잭션 목록) ----------------------------------
        iconPt = this.getImagePoint('zoom');
        iconX = cx + 8 + (isAgentType? (isChild? -6 : 0) : 25);
        iconY = cy - iconPt.h / 2 - 6 + (isAgentType? (isChild? 1 : 0) : 25);

        this.naviCtx.drawImage(
            this.iconImg,
            iconPt.x, iconPt.y, iconPt.w, iconPt.h,
            iconX,
            iconY,
            iconPt.w,
            iconPt.h
        );
        this.zoomIconPt = {
            x1: iconX,
            y1: iconY,
            x2: iconX + iconPt.w,
            y2: iconY + iconPt.h
        };

        // 메뉴 아이콘 이미지 - Group (그룹 노드 뷰) ----------------------------------------
        iconPt = this.getImagePoint('group');
        iconX = cx - iconPt.w / 2 + (isAgentType? 0 : 25);
        iconY = cy + radius - 4   + (isAgentType? (isChild? -1 : 0) : 25);

        this.naviCtx.drawImage(
            this.iconImg,
            iconPt.x, iconPt.y, iconPt.w, iconPt.h,
            iconX,
            iconY,
            iconPt.w,
            iconPt.h
        );
        this.groupIconPt = {
            x1: iconX,
            y1: iconY,
            x2: iconX + iconPt.w,
            y2: iconY + iconPt.h
        };
    },


    /**
     *  그룹 노드가 아닌 에이전트 노드에 마우스가 위치하였을 때 보여지는 메뉴 구성.
     *
     * 표시 메뉴 아이콘
     * 액티브 트랜잭션 모니터, 액티브 트랜잭션 목록
     *
     * @param {number} menuX
     * @param {number} menuY
     * @param {object} node - 노드
     * @param {number} radius - 반지름
     * @param {boolean} isChild
     */
    drawNavigateSingleAgent: function(menuX, menuY, node, radius, isChild) {
        var gradient;

        if (!this.isDisplayGroupMode) {
            this.nodeInfoCanvas.style.zIndex = 14;
        }

        var cx = menuX;
        var cy = menuY;

        radius = radius || this.property.inCircle.radius;
        isChild = (!isChild)? false : isChild;

        //================================================================================
        // Draw Icon Background - Gradient Color
        //================================================================================
        // Navigate Icon Background - Zoom
        gradient = this.naviCtx.createRadialGradient(
            cx + 1,
            cy,
            radius - 6,
            cx + 1,
            cy,
            radius + 10
        );

        this.setNaviMenuGradient(node, gradient, this.isFocusZoomIcon && node.isDisplayNavigate);

        this.naviCtx.beginPath();
        this.naviCtx.arc(
            cx,
            cy,
            radius * 2,
            1.5 * Math.PI,
            0.5 * Math.PI
        );
        this.naviCtx.fillStyle = gradient;
        this.naviCtx.fill();

        // Navigate Icon Background - Xview
        gradient = this.naviCtx.createRadialGradient(
            cx,
            cy,
            radius - 6,
            cx,
            cy,
            radius + 10
        );

        this.setNaviMenuGradient(node, gradient, this.isFocusXviewIcon && node.isDisplayNavigate);

        this.naviCtx.beginPath();
        this.naviCtx.arc(
            cx,
            cy,
            radius * 2,
            0.5 * Math.PI,
            1.5 * Math.PI
        );
        this.naviCtx.fillStyle = gradient;
        this.naviCtx.fill();

        this.naviCtx.beginPath();
        this.naviCtx.moveTo(cx, cy - radius * 2);
        this.naviCtx.lineTo(cx, cy + radius * 2);
        this.naviCtx.closePath();
        this.naviCtx.lineWidth = 0.6;
        this.naviCtx.strokeStyle = this.backgroundColor;
        this.naviCtx.stroke();

        //================================================================================
        // 메뉴 아이콘 이미지 그리기
        //================================================================================

        // 메뉴 아이콘 이미지 - Xview (트랜잭션 모니터 ) -------------------------------------
        var iconPt = this.getImagePoint('xview');
        this.naviCtx.drawImage(
            this.iconImg,
            iconPt.x, iconPt.y, iconPt.w, iconPt.h,
            cx - 18 + (isChild? 2 : 0),
            cy - iconPt.h / 2 - 1 + (isChild? 2 : 0),
            iconPt.w,
            iconPt.h
        );
        this.xviewIconPt = {
            x1: cx - 18 + (isChild? 2 : 0),
            y1: cy - iconPt.h / 2 - 1 + (isChild? 2 : 0),
            x2: cx - 18 + iconPt.w + (isChild? 2 : 0),
            y2: cy - iconPt.h / 2 - 1 + iconPt.h + (isChild? 2 : 0)
        };

        // 메뉴 아이콘 이미지 - Zoom (액티브 트랜잭션 목록) ----------------------------------
        iconPt = this.getImagePoint('zoom');
        this.naviCtx.drawImage(
            this.iconImg,
            iconPt.x, iconPt.y, iconPt.w, iconPt.h,
            cx + 7 + (isChild? -4 : 0),
            cy - iconPt.h / 2 - 1 + (isChild? 2 : 0),
            iconPt.w,
            iconPt.h
        );
        this.zoomIconPt = {
            x1: cx + 5,
            y1: cy - iconPt.h / 2 - 1,
            x2: cx + 7 + iconPt.w,
            y2: cy - iconPt.h / 2 - 1 + iconPt.h
        };
    },


    /**
     * 
     * @param {object} node
     * @param {object} gradient
     * @param {boolean} isFocus
     */
    setNaviMenuGradient: function(node, gradient, isFocus) {
        if (isFocus) {
            if (node.status === 3) {
                gradient.addColorStop(0, '#56585C');
                gradient.addColorStop(1, '#56585C');
            } else if (node.status === 2) {
                gradient.addColorStop(0, '#99070A');
                gradient.addColorStop(1, '#99070A');
            } else if (node.status === 1) {
                gradient.addColorStop(0, '#BF7202');
                gradient.addColorStop(1, '#BF7202');
            } else {
                gradient.addColorStop(0, '#3B7D05');
                gradient.addColorStop(1, '#3B7D05');
            }
        } else {
            if (node.status === 3) {
                gradient.addColorStop(0, '#72757B');
                gradient.addColorStop(1, '#72757B');
            } else if (node.status === 2) {
                gradient.addColorStop(0, '#E22E37');
                gradient.addColorStop(1, '#DC1319');
            } else if (node.status === 1) {
                gradient.addColorStop(0, '#FFD300');
                gradient.addColorStop(1, '#FF9803');
            } else {
                gradient.addColorStop(0, '#83C628');
                gradient.addColorStop(1, '#65B40D');
            }
        }
    },


    /**
     * Draw an arrow that appears at the end of the relationship line.
     */
    drawArrow: function(arrow, ptArrow, endPt, status) {
        var angleInDegrees = this.getAngleBetweenPoints(ptArrow, endPt);

        // first save the untranslated/unrotated context
        this.lineCtx.save();

        // move the rotation point to the center of the rect
        this.lineCtx.translate(ptArrow.x, ptArrow.y);
        // rotate the rect
        this.lineCtx.rotate(angleInDegrees * Math.PI/180);

        this.lineCtx.beginPath();
        this.lineCtx.moveTo(0,0);
        this.lineCtx.lineTo( 0, -arrow.h);
        this.lineCtx.lineTo( arrow.w, 0);
        this.lineCtx.lineTo( 0, +arrow.h);
        this.lineCtx.closePath();

        if (status === 3) {
            this.lineCtx.fillStyle = '#72757B';
        } else if (status === 2) {
            this.lineCtx.fillStyle = this.property.relationLine.criticalFill;
        } else if (status === 1) {
            this.lineCtx.fillStyle = this.property.relationLine.warningFill;
        } else {
            this.lineCtx.fillStyle = 'rgba('+this.getHexToRgb(this.property.relationLineArrow.fillStyle) +','+ 0.8 + ')';
        }
        this.lineCtx.fill();

        // restore the context to its untranslated/unrotated state
        this.lineCtx.restore();
    },


    /**
     * Draw an arrow that appears at the end of the relationship line.
     */
    drawArrowOfRect: function(arrow, ptArrow, endPt, status) {
        var angleInDegrees = this.getAngleBetweenPoints(ptArrow, endPt);

        // first save the untranslated/unrotated context
        this.lineCtx.save();

        // move the rotation point to the center of the rect
        this.lineCtx.translate(ptArrow.x, ptArrow.y);
        // rotate the rect
        this.lineCtx.rotate(angleInDegrees * Math.PI/180);

        this.lineCtx.beginPath();
        this.lineCtx.moveTo(0,0);
        this.lineCtx.lineTo( 0, -arrow.h);
        this.lineCtx.lineTo( arrow.w, 0);
        this.lineCtx.lineTo( 0, +arrow.h);
        this.lineCtx.closePath();

        if (status === 3) {
            this.lineCtx.fillStyle = '#72757B';
        } else if (status === 2) {
            this.lineCtx.fillStyle = this.property.relationLine.criticalFill;
        } else if (status === 1) {
            this.lineCtx.fillStyle = this.property.relationLine.warningFill;
        } else {
            this.lineCtx.fillStyle = 'rgba('+this.getHexToRgb(this.property.relationLineArrow.fillStyle) +','+ 0.8 + ')';
        }
        this.lineCtx.fill();

        // restore the context to its untranslated/unrotated state
        this.lineCtx.restore();
    },


    /**
     * nodePath 에서 시작 노드로 부터 연결되는 node 리스트를 array 로 돌려받는다
     *
     * @param {array} pathList -  nodePath 데이터
     * @param {array} result - 결과
     * @param {number} index - depth
     */
    getNodePathToArray: function(pathList, result, index) {
        if (!pathList) {
            return;
        }
        if (index == null) {
            index = -1;
        }

        index++;

        if (result[index] === undefined) {
            result[index] = [];
        }

        var nextNode;
        for (var ix = 0, ixLen = pathList.length; ix < ixLen; ix++) {
            result[index].push(pathList[ix]);
            nextNode = this.nodePath[pathList[ix].id];

            if (nextNode != null) {
                this.getNodePathToArray(nextNode, result, index);
            }
        }
    },


    /**
     * nodePath 에서 시작 노드로 부터 연결되는 line 리스트를 array 로 돌려받는다
     *
     * @param {array} pathList -  nodePath 데이터
     * @param {array} result - 결과
     * @param {number} index - depth
     */
    getLinePathToArray: function(pathList, result, index) {
        if (pathList == null) {
            return;
        }
        if (index == null) {
            index = -1;
        }

        index++;

        if (result[index] === undefined) {
            result[index] = [];
        }

        var nextNode;

        for (var ix = 0, ixLen = pathList.length; ix < ixLen; ix++) {
            result[index].push(pathList[ix]);
            nextNode = this.linePath[pathList[ix].to];

            if (nextNode != null) {
                this.getLinePathToArray(nextNode, result, index);
            }
        }
    },


    /**
     */
    getLineNode: function(from, to) {
        for (var ix = 0, ixLen = this.lineList.length; ix < ixLen; ix++) {
            if (this.lineList[ix].from === from && this.lineList[ix].to === to) {
                return this.lineList[ix];
            }
        }
    },


    /**
     * 노드 및 그룹 노드에 보여지는 액티브 트랜잭션 건수 합계를 구하기
     *
     * @param {object} node 표시되는 노드(서버) 개체
     */
    getActiveCountByNodeId: function(node) {
        var ix, ixLen;
        var childNode, childNodeId;
        var activeCount = 0;

        // 노드가 그룹 노드인 경우
        if (node.isGroupMode) {
            // 서버가 Down, Disconnected 상태일 때는 건수를 0 으로 표시
            if (node.status === 3) {
                activeCount = 0;

            } else {
                // 그룹에 포함된 에이전트의 트랜잭션 건수를 합계하여 표시
                for (ix = 0, ixLen = node.childIdAllList.length; ix < ixLen; ix++) {
                    childNodeId  = node.childIdAllList[ix];
                    childNode    = this.getNodeById(childNodeId);
                    activeCount += childNode.value;
                }
            }

        // 노드가 단일 노드인 경우
        } else {
            // 서버가 Down, Disconnected 상태일 때는 건수를 0 으로 표시
            if (node.status === 3) {
                activeCount = 0;
            } else {
                activeCount = node.value;
            }
        }
        return activeCount;
    },


    /**
     * 노드 ID에서 WAS(서버) ID 구하기
     *
     * @param {string} nodeId - 노드 ID
     * @return {number} WAS ID
     */
    getWasIdByNodId: function(nodeId) {
        var nodeKeys = nodeId.split('-');

        if (nodeKeys.length < 2 || nodeKeys[0] !== 'WAS') {
            return -1;
        } else {
            return +nodeKeys[1];
        }
    },


    /**
     * 노드 ID에서 서버 ID 구하기
     *
     * @param {string} nodeId - 노드 ID
     * @return {number} 서버 ID
     */
    getServerIdByNodeId: function(nodeId) {
        var nodeKeys = nodeId.split('-');

        if (nodeKeys.length < 2) {
            return -1;
        } else {
            return +nodeKeys[1];
        }
    },


    /**
     * 노드 또는 그룹 노드에 해당하는 서버 ID를 반환.
     *
     * @param {string} nodeId
     * @return {string} ',' 로 구분된 서버 ID 목록
     */
    getWasIdArrByNodeId: function(nodeId) {
        var wasIds;
        var childNodeId, serverId;
        var nodeObj;

        var isGroupNode = this.isGroupNodeByNodeId(nodeId);

        if (!isGroupNode) {
            wasIds = this.getServerIdByNodeId(nodeId);

        } else {
            nodeObj = this.getNodeById(nodeId);

            if (nodeObj && nodeObj.childIdAllList.length > 0) {
                wasIds = '';

                for (var ix = 0, ixLen = nodeObj.childIdAllList.length; ix < ixLen; ix++) {
                    childNodeId = nodeObj.childIdAllList[ix];
                    serverId = this.getServerIdByNodeId(childNodeId);

                    wasIds += ((ix === 0)? '' : ',');
                    wasIds += serverId;
                }
            }
        }

        return wasIds;
    },


    /**
     * 노드와 노드 사이에 연결되는 선 그리기
     */
    drawRelationLine: function() {
        var startPt  = arguments[0];
        var endPt    = arguments[1];
        var rStartPt = arguments[2];
        var rEndPt   = arguments[3];
        var status   = arguments[4];
        var from     = arguments[5];
        var to       = arguments[6];
        var type     = arguments[7];

        var ix, jx, ixLen, jxLen;

        var fromNode = this.getNodeById(from);
        var toNode   = this.getNodeById(to);

        this.lineCtx.lineWidth = this.property.relationLine.lineWidth;

        this.lineRemoteCount = 0;

        if (fromNode.status === 3 || toNode.status === 3) {
            this.lineCtx.strokeStyle = '#72757B';
            this.lineCtx.fillStyle   = '#72757B';
        } else if (status === 2) {
            this.lineCtx.strokeStyle = this.property.relationLine.criticalStroke;
            this.lineCtx.fillStyle = this.property.relationLine.criticalFill;
        } else if (status === 1) {
            this.lineCtx.strokeStyle = this.property.relationLine.warningStroke;
            this.lineCtx.fillStyle = this.property.relationLine.warningFill;
        } else {
            this.lineCtx.strokeStyle = this.property.relationLine.strokeStyle;
            this.lineCtx.fillStyle = this.property.relationLine.fillStyle;
        }

        // Draw relation line
        var isCurveLine = false;
        if (this.relationLinePoint.indexOf((startPt.x +':'+ startPt.y) +'-'+ (endPt.x  + ':' + endPt.y)) === -1) {
            if (this.relationLinePoint.indexOf((endPt.x  + ':' + endPt.y) +'-'+ (startPt.x +':'+ startPt.y)) === -1) {
                isCurveLine = false;
                this.relationLinePoint.push((startPt.x +':'+ startPt.y) +'-'+ (endPt.x  + ':' + endPt.y));
            } else {
                isCurveLine = true;
            }
        }

        this.lineCtx.beginPath();
        this.lineCtx.moveTo(startPt.x, startPt.y);

        if (isCurveLine) {
            this.lineCtx.quadraticCurveTo(startPt.x + (endPt.x - startPt.x) / 2, endPt.y - 20 - (endPt.y - startPt.y) / 2 - 20, endPt.x, endPt.y);

        } else {
            this.lineCtx.lineTo(endPt.x, endPt.y);
        }
        this.lineCtx.stroke();

        var line = this.lineList[this.lineList.length];
        if (line) {
            line.sx = rStartPt.x;
            line.sy = rStartPt.y;
            line.ex = rEndPt.x;
            line.ey = rEndPt.y;
            line.from = from;
            line.to = to;
            line.status = status;
            line.isCurve = isCurveLine;
        } else {
            this.lineList[this.lineList.length] = {
                sx: rStartPt.x,
                sy: rStartPt.y,
                ex: rEndPt.x,
                ey: rEndPt.y,
                from: from,
                to: to,
                status: status,
                isCurve: isCurveLine
            };
        }

        // Draw relation line point
        this.lineCtx.beginPath();
        this.lineCtx.arc(
            rStartPt.x,
            rStartPt.y,
            this.property.relationPoint.radius * 2,
            0,
            2 * Math.PI
        );

        this.lineCtx.arc(
            rEndPt.x,
            rEndPt.y,
            this.property.relationPoint.radius * 2,
            0,
            2 * Math.PI
        );
        this.lineCtx.closePath();
        this.lineCtx.fillStyle = 'transparent';
        this.lineCtx.fill();

        this.lineCtx.fillStyle = '#FFFFFF';
        this.lineCtx.font      = 'normal 13px "Droid Sans"';
        this.lineCtx.save();
        this.lineCtx.textAlign = 'center';

//        var diffSec = Ext.Date.diff(fromNode.remoteCountTimer, new Date(), Ext.Date.SECOND);
//        if (diffSec > 3) {
//            fromNode.remoteCount = 0;
//        }

        var changePosY = 0;
        if (isCurveLine) {
            changePosY = 26;
        }

        // 노드 연결선 위에 연결 타입, 리모트 건수 등 연결 정보 그리기 --------------------------

        // 정보가 연결선 각도와 동일하게 회전되어 표시
        if (this.isRemoteInfoTextRotate) {
            var angle = this.getAngleBetweenPoints(startPt, endPt);
            if ((angle >= -180 && angle <= -90) || (angle >= 90 && angle <= 180)) {
                angle = angle + 180;
            }
            this.lineCtx.translate(startPt.x + (endPt.x - startPt.x) / 2, endPt.y - (endPt.y - startPt.y) / 2);
            this.lineCtx.rotate(angle * Math.PI / 180);

            if (this.isDisplayRemoteActiveCount) {
                this.lineCtx.fillText(type, 0, -10);

                if (fromNode.status === 3 || toNode.status === 3) {
                    this.lineRemoteCount = 0;

                } else {
                    this.isOldRemoteValue = this.checkOldReceiveData(fromNode.remoteCount.lastTime[toNode.id]);
                    if (this.isOldRemoteValue) {
                        fromNode.remoteCount[toNode.id] = 0;
                    }

                    this.lineRemoteCount = 0;
                    if (toNode.id && toNode.id.indexOf('GROUP-') === 0) {
                        for (ix = 0, ixLen = toNode.childList.length; ix < ixLen; ix++) {
                            this.lineRemoteCount += fromNode.remoteCount[toNode.childList[ix].id];
                        }

                    } else {
                        this.lineRemoteCount = fromNode.remoteCount[toNode.id] || 0;
                    }

                }
                this.lineCtx.fillText(this.lineRemoteCount + ' calls', 0, 4 - changePosY);
            } else {
                this.lineCtx.fillStyle = this.lineCtx.strokeStyle || '#FFFFFF';
                this.lineCtx.fillText(type, 0, -2 - changePosY);
            }

            this.remoteInfoBoxList[this.remoteInfoBoxList.length] =
                new this.nodeClass.remoteInfoBox(
                    +this.getWasIdByNodId(fromNode.id),
                    startPt.x + (endPt.x - startPt.x) / 2 - 20,
                    endPt.y - (endPt.y - startPt.y) / 2 - changePosY,
                    40,
                    26
                );

            this.remoteInfoBoxList[this.remoteInfoBoxList.length - 1].dest         = fromNode.activeDest[toNode.id] || [];
            this.remoteInfoBoxList[this.remoteInfoBoxList.length - 1].destKey      = fromNode.id + '-' + toNode.id;
            this.remoteInfoBoxList[this.remoteInfoBoxList.length - 1].fromServerId = this.getWasIdArrByNodeId(fromNode.id);
            this.remoteInfoBoxList[this.remoteInfoBoxList.length - 1].toServerId   = this.getWasIdArrByNodeId(toNode.id);
            this.remoteInfoBoxList[this.remoteInfoBoxList.length - 1].toServerType = toNode.clazz;
            this.remoteInfoBoxList[this.remoteInfoBoxList.length - 1].fromName     = fromNode.alias;
            this.remoteInfoBoxList[this.remoteInfoBoxList.length - 1].toName       = toNode.alias;

        } else {
            // 연결선 정보가 항상 수평으로 표시
            if (this.backgroundColor) {
                this.lineCtx.fillStyle = 'rgba('+this.getHexToRgb(this.backgroundColor) +','+ 0.7 + ')';
                this.lineCtx.fillRect(startPt.x + (endPt.x - startPt.x) / 2 - 20, endPt.y - (endPt.y - startPt.y) / 2 - 11 - changePosY, 40, 13);
                this.lineCtx.fillRect(startPt.x + (endPt.x - startPt.x) / 2 - 18, endPt.y - (endPt.y - startPt.y) / 2 + 2 - changePosY, 36, 12);
            }

            this.lineCtx.fillStyle = this.lineCtx.strokeStyle || '#FFFFFF';
            this.lineCtx.fillText(type, startPt.x + (endPt.x - startPt.x) / 2, endPt.y - (endPt.y - startPt.y) / 2 + 12 - changePosY);

            // 연결선에 리모트 건수를 표시하는 경우
            if (this.isDisplayRemoteActiveCount) {

                // 출발 노드 상태가 Down, Disconnected 이면 건수를 0으로 표시
                if (fromNode.status === 3 || toNode.status === 3) {
                    this.lineRemoteCount = 0;

                } else {
                    this.isOldRemoteValue = this.checkOldReceiveData(fromNode.remoteCount.lastTime[toNode.id]);

                    if (this.isOldRemoteValue) {
                        fromNode.remoteCount[toNode.id] = 0;
                    }

                    this.lineRemoteCount = 0;

                    var fromChildNode, fromChildNodeId, toChildNodeId;

                    // 시작 노드가 그룹 노드인 경우
                    if (fromNode.id && fromNode.id.indexOf('GROUP-') === 0) {

                        for (ix = 0, ixLen = fromNode.childIdAllList.length; ix < ixLen; ix++) {

                            fromChildNodeId = fromNode.childIdAllList[ix];
                            fromChildNode = this.getNodeById(fromChildNodeId);

                            if (!fromChildNode) {
                                continue;
                            }

                            if (toNode.id && toNode.id.indexOf('GROUP-') === 0) {
                                for (jx = 0, jxLen = toNode.childIdAllList.length; jx < jxLen; jx++) {
                                    toChildNodeId = toNode.childIdAllList[jx];
                                    this.lineRemoteCount += (fromChildNode.remoteCount[toChildNodeId] || 0);
                                }

                            } else {
                                if (fromChildNode.remoteCount[toNode.id]) {
                                    this.lineRemoteCount += fromChildNode.remoteCount[toNode.id];

                                } else if (this.getNodeById(fromChildNode.id).remoteCount[toNode.id]) {
                                    this.lineRemoteCount += this.getNodeById(fromChildNode.id).remoteCount[toNode.id];

                                } else {
                                    this.lineRemoteCount += 0;
                                }

                                //this.lineRemoteCount += fromChildNode.remoteCount[toNode.id] || 0;
                            }
                        }

                    } else {
                        if (toNode.id && toNode.id.indexOf('GROUP-') === 0) {
                            for (jx = 0, jxLen = toNode.childIdAllList.length; jx < jxLen; jx++) {
                                toChildNodeId = toNode.childIdAllList[jx];
                                this.lineRemoteCount += (fromNode.remoteCount[toChildNodeId] || 0);
                            }

                        } else {
                            this.lineRemoteCount = fromNode.remoteCount[toNode.id] || 0;
                        }
                    }

                }
                this.lineCtx.fillText(
                    this.lineRemoteCount + ' calls',
                    startPt.x + (endPt.x - startPt.x) / 2,
                    endPt.y   - (endPt.y - startPt.y) / 2 - changePosY
                );
            }

            this.remoteInfoBoxList[this.remoteInfoBoxList.length] =
                new this.nodeClass.remoteInfoBox(
                    +this.getWasIdByNodId(fromNode.id),
                    startPt.x + (endPt.x - startPt.x) / 2 - 20,
                    endPt.y - (endPt.y - startPt.y) / 2 - 12 - changePosY,
                    40, 26
                );

            this.remoteInfoBoxList[this.remoteInfoBoxList.length - 1].dest         = fromNode.activeDest[toNode.id] || [];
            this.remoteInfoBoxList[this.remoteInfoBoxList.length - 1].destKey      = fromNode.id + '-' + toNode.id;
            this.remoteInfoBoxList[this.remoteInfoBoxList.length - 1].fromServerId = this.getWasIdArrByNodeId(fromNode.id);
            this.remoteInfoBoxList[this.remoteInfoBoxList.length - 1].toServerId   = this.getWasIdArrByNodeId(toNode.id);
            this.remoteInfoBoxList[this.remoteInfoBoxList.length - 1].toServerType = toNode.clazz;
            this.remoteInfoBoxList[this.remoteInfoBoxList.length - 1].fromName     = fromNode.alias;
            this.remoteInfoBoxList[this.remoteInfoBoxList.length - 1].toName       = toNode.alias;
        }

        this.lineCtx.restore();
    },


    /**
     * Draw the line between Rect nodes relationship.
     */
    drawRelationLineOfRect: function() {
        var startPt  = arguments[0];
        var endPt    = arguments[1];
        var rStartPt = arguments[2];
        var rEndPt   = arguments[3];
        var status   = arguments[4];
        var from     = arguments[5];
        var to       = arguments[6];
        var type     = arguments[7];

        var fromNode = this.getNodeById(from);
        var toNode   = this.getNodeById(to);

        this.lineCtx.lineWidth = this.property.relationLine.lineWidth;

        if (fromNode.status === 3 || toNode.status === 3) {
            this.lineCtx.strokeStyle = '#72757B';
            this.lineCtx.fillStyle = '#72757B';
        } else if (status === 2) {
            this.lineCtx.strokeStyle = this.property.relationLine.criticalStroke;
            this.lineCtx.fillStyle = this.property.relationLine.criticalFill;
        } else if (status === 1) {
            this.lineCtx.strokeStyle = this.property.relationLine.warningStroke;
            this.lineCtx.fillStyle = this.property.relationLine.warningFill;
        } else {
            this.lineCtx.strokeStyle = this.property.relationLine.strokeStyle;
            this.lineCtx.fillStyle = this.property.relationLine.fillStyle;
        }

        // Draw relation line
        var isCurveLine = false;
        if (this.relationLinePoint.indexOf((startPt.x +':'+ startPt.y) +'-'+ (endPt.x  + ':' + endPt.y)) === -1) {
            if (this.relationLinePoint.indexOf((endPt.x  + ':' + endPt.y) +'-'+ (startPt.x +':'+ startPt.y)) === -1) {
                isCurveLine = false;
                this.relationLinePoint.push((startPt.x +':'+ startPt.y) +'-'+ (endPt.x  + ':' + endPt.y));
            } else {
                isCurveLine = true;
            }
        }

        this.lineCtx.beginPath();
        this.lineCtx.moveTo(startPt.x, startPt.y);
        if (isCurveLine) {
            this.lineCtx.quadraticCurveTo(startPt.x + (endPt.x - startPt.x) / 2, endPt.y - 20 - (endPt.y - startPt.y) / 2 - 20, endPt.x, endPt.y);

        } else {
            this.lineCtx.lineTo(endPt.x, endPt.y);
        }
        this.lineCtx.stroke();

        var line = this.lineList[this.lineList.length];
        if (line) {
            line.sx = rStartPt.x;
            line.sy = rStartPt.y;
            line.ex = rEndPt.x;
            line.ey = rEndPt.y;
            line.from = from;
            line.to = to;
            line.status = status;
            line.isCurve = isCurveLine;
        } else {
            this.lineList[this.lineList.length] = {
                sx: rStartPt.x,
                sy: rStartPt.y,
                ex: rEndPt.x,
                ey: rEndPt.y,
                from: from,
                to: to,
                status: status,
                isCurve: isCurveLine
            };
        }

        // Draw relation line point
        this.lineCtx.beginPath();
        this.lineCtx.arc(
            rStartPt.x,
            rStartPt.y,
            this.property.relationPoint.radius * 2,
            0,
            2 * Math.PI
        );

        this.lineCtx.arc(
            rEndPt.x,
            rEndPt.y,
            this.property.relationPoint.radius * 2,
            0,
            2 * Math.PI
        );
        this.lineCtx.closePath();
        this.lineCtx.fillStyle = 'transparent';
        this.lineCtx.fill();

        if (type) {
            this.lineCtx.fillStyle = '#FFFFFF';
            this.lineCtx.font      = 'normal 13px "Droid Sans"';
            this.lineCtx.save();
            this.lineCtx.textAlign = 'center';

            if (this.backgroundColor) {
                this.lineCtx.fillStyle = 'rgba('+this.getHexToRgb(this.backgroundColor) +','+ 0.7 + ')';
                this.lineCtx.fillRect(startPt.x + (endPt.x - startPt.x) / 2 - 20, endPt.y - (endPt.y - startPt.y) / 2 - 11, 40, 13);
                this.lineCtx.fillRect(startPt.x + (endPt.x - startPt.x) / 2 - 18, endPt.y - (endPt.y - startPt.y) / 2 + 2, 36, 12);
            }

            this.lineCtx.fillStyle = this.lineCtx.strokeStyle || '#FFFFFF';
            this.lineCtx.textAlign = 'center';
            this.lineCtx.fillText(type, startPt.x + (endPt.x - startPt.x) / 2, endPt.y - (endPt.y - startPt.y) / 2 + 12);
        }

        this.lineCtx.restore();
    },


    /**
     * Draw a layout nodes.
     */
    drawNodeLayout: function() {
        var nodeObj, ix, ixLen;

        this.nodeNameBoxList = [];
        this.isResizeCanvas = false;

        this.marginHeight = 70;
        this.marginWidth = 70;

        for (ix = 0, ixLen =  this.nodeList.length; ix < ixLen ; ix++) {
        //for (ix = 0, ixLen =  this.displayNodeList.length; ix < ixLen ; ix++) {
            nodeObj = this.nodeList[ix];
            //nodeObj = this.displayNodeList[ix];

            if (this.displayNodeLevel !== +nodeObj.level) {
                continue;
            }

            if (nodeObj.clazz === 'FOLDER') {
                this.drawFolderOpen(this.drawGroupInput(nodeObj.x, nodeObj.y).bind(this));

            } else if (nodeObj.clazz === 'AGENT') {
                this.drawCircle(nodeObj);
                this.drawNodeInfo(nodeObj);

                // TODO Web Node Draw
                if (nodeObj.isWebContain) {
                    //nodeObj.isWebContain = true;
                    //this.drawNodeWebInfo(nodeObj);
                }

                this.drawGroupDownAlarm(nodeObj);
                this.drawNodeData(nodeObj);

            } else if (nodeObj.clazz === 'DB') {
                this.drawDatabase(nodeObj);

            } else if (nodeObj.clazz === 'SERVER') {
                this.drawServer(nodeObj);

            } else if (nodeObj.clazz === 'CLOUD') {
                this.drawCloud(nodeObj);

            } else if (nodeObj.clazz === 'GROUP') {
                this.drawComplexGroup(nodeObj);
            }

            if (this.componentHeight < nodeObj.y) {
                this.maxNodePosY = nodeObj.y + this.marginHeight;
                this.isResizeCanvas = true;
            }
            if (this.componentWidth < nodeObj.x) {
                this.maxNodePosX = nodeObj.x + this.marginWidth;
                this.isResizeCanvas = true;
            }

        }

        this.displayCtx.drawImage(this.canvas, 0 , 0);

        if (this.isResizeCanvas) {
            this.isResizeCanvas = false;
            this.resize(this.maxNodePosY, this.maxNodePosX);
        }
    },


    /**
     * Draw a layout rect nodes.
     */
    drawTxnNodeLayout: function() {
        var nodeObj, ix, ixLen;

        this.callTreeIconList = [];

        for (ix = 0, ixLen =  this.nodeList.length; ix < ixLen ; ix++) {
            nodeObj = this.nodeList[ix];

            if (nodeObj.clazz === 'AGENT') {
                this.drawTxnRect(nodeObj);

            } else if (nodeObj.clazz === 'DB') {
                this.drawDatabase(nodeObj, true);

            } else if (nodeObj.clazz === 'SERVER') {
                this.drawServer(nodeObj);

            } else if (nodeObj.clazz === 'CLOUD') {
                this.drawCloud(nodeObj);
            }
        }

        this.displayCtx.drawImage(this.canvas, 0 , 0);

        if (this.isResizeCanvas) {
            this.isResizeCanvas = false;
            this.resize(this.maxNodePosY, this.maxNodePosX);
        }
    },


    /**
     * 그룹 노드명을 입력하는 텍스트 필드를 표시.
     *
     * @param {number} x - 그룹 노드 X 좌표
     * @param {number} y - 그룹 노드 Y 좌표
     */
    drawGroupInput: function(x, y) {
        this.textInputMode = this.inputMode.GROUP_NAME;

        this.nodeInfoCanvas.style.zIndex = 3;

        this.overCanvas.width  = this.componentWidth;
        this.overCanvas.height = this.componentHeight;

        this.overCtx.save();
        this.overCtx.fillStyle = 'rgba('+this.getHexToRgb('#212227') +','+ 0.6 + ')';
        this.overCtx.fillRect(0, 0, this.dragCanvas.width, this.dragCanvas.height);
        this.overCtx.restore();

        this.groupNameInputBox.style.display = '';

        this.groupNameInputBox.focus();
        this.groupNameInputBox.style.top     = y + 'px';
        this.groupNameInputBox.style.left    = x - 90 + 'px';
        this.groupNameInputBox.style.opacity = 0.9;
        this.groupNameInputBox.style.width   = '180px';
    },


    /**
     * 그룹된 노드를 하위 노드 개별로 일괄 분리한다.
     *
     * @descr 그룹 노드안에 그룹 노드가 포함될 수 있기 때문에 하위 노드에 그룹노드가 있는 경우
     *        해당 노드는 분리하지 않고 그룹 노드를 그대로 표시를 한다.
     *        (2017-02-13 인터맥스 회의에서 결정된 사항)
     */
    splitGroupNode: function() {
        var ix, ixLen;
        var node, childNode, baseNode;
        var savePot;

        // 선택된 그룹 노드
        var groupNode = this.selectedGroupCircle;
        var parentNode = this.getNodeById(groupNode.parentId);

        // 부모 노드가 있는 경우 부모 노드의 하위 노드에 노드 개별로 분리하여 추가 ----------------
        if (parentNode) {
            for (ix = 0, ixLen = groupNode.childList.length; ix < ixLen; ix++) {
                childNode = groupNode.childList[ix];
                parentNode.childList[parentNode.childList.length] = childNode;

                this.deleteRelationData(childNode.id, groupNode.id);

                this.copyRelationPoint(parentNode, childNode);
            }

            for (ix = 0; ix < parentNode.childList.length; ix++) {
                if (parentNode.childList[ix].id === groupNode.id) {
                    parentNode.childList.splice(ix, 1);
                    break;
                }
            }

            // 연결 관계 삭제
            this.deleteRelationData(groupNode.id, parentNode.id);

            // 그룹 노드는 없어지게 되므로 목록에서 제거
            groupNode.childList.length = 0;
            this.deleteNodeByNodeId(groupNode.id);

            this.closeGroupView();

        // 부모 노드가 없으면 분리하여 표시 --------------------------------------------------
        } else {
            for (ix = 0; ix < groupNode.childList.length; ) {
                node = groupNode.childList[ix];

                baseNode = this.getNodeById(node.id);

                // TODO baseNode 사용에 문제가 없으면 아래 노드 설정 코드를 삭제
                // 노드 정보를 초기화
                //node.level = 0;
                //node.parentId = '';
                //node.isHide = false;

                baseNode.level    = 0;
                baseNode.parentId = '';
                baseNode.isHide   = false;

                // 기존에 설정되었던 노드 위치를 설정
                savePot = this.getSaveNodePosition(node.id);
                node.x = (savePot.x === 0)? groupNode.x + (50 * ix) : savePot.x;
                node.y = (savePot.y === 0)? groupNode.y + (70 * ix) : savePot.y;

                baseNode.x = node.x;
                baseNode.y = node.y;

                // 그룹 노드에 있는 하위 노드 목록으로부터 제거
                groupNode.childList.splice(ix, 1);
                ix--;

                this.deleteRelationData(node.id, groupNode.id);

                // 마지막 남은 하위 노드를 처리.
                if (groupNode.childList.length === 1) {

                    node = groupNode.childList[0];

                    baseNode = this.getNodeById(node.id);

                    // 노드 정보를 초기화
                    //node.level = 0;
                    //node.parentId = '';
                    //node.isHide = false;

                    baseNode.level    = 0;
                    baseNode.parentId = '';
                    baseNode.isHide   = false;

                    this.deleteRelationData(node.id, groupNode.id);

                    // 그룹 노드는 없어지게 되므로 목록에서 제거
                    this.deleteNodeByNodeId(groupNode.id);

                    groupNode.childList.length = 0;
                }

                ix++;
            }

            //this.canvasDraw();
            this.refreshData();

            this.selectGroupIdArr.length = 0;
            this.isDisplayGroupMode      = false;
            this.isSplitHover            = false;
        }

        this.saveCurrentNodeStruct();
    },


    /**
     * 그룹 노드에서 표시한 그룹 뷰 닫기
     */
    closeGroupView: function() {

        if (this.displayGroupViewStep > 1) {
            this.groupContextList[this.displayGroupViewStep - 1].clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.groupChildCtxtList[this.displayGroupViewStep - 1].clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.selectGroupIdArr.length = this.displayGroupViewStep - 1;

        } else {
            this.groupCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.groupChildCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.selectGroupIdArr.length = 0;
        }

        this.naviCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 열린 그룹 뷰가 있는 경우 해당 그룹 뷰를 보여주게 처리
        if (this.selectGroupIdArr.length > 0) {
            this.displayGroupViewStep--;

            var nodeId = this.selectGroupIdArr[this.selectGroupIdArr.length - 1];
            this.drawGroupLayout(nodeId, true);

        } else {
            this.displayGroupViewStep = 0;
            this.isDisplayGroupMode = false;
        }
    },



    /**
     * 그룹 노드에서 하위 노드를 선택 후 드래그 & 드랍하여하여 그룹 노드에서 분리.
     *
     * @param {object} groupNode - 그룹 노드
     * @param {object} selectNode - 선택 노드
     * @param {number} x - 노드를 드래그한 위치의 X 좌표
     * @param {number} y - 노드를 드래그한 위치의 Y 좌표
     */
    spliceGroupNode: function(groupNode, selectNode, x, y) {
        var ix, ixLen;
        var node, baseNode;
        var isChange = false;

        for (ix = 0, ixLen = groupNode.childList.length; ix < ixLen; ) {
            if (groupNode.childList[ix].id === selectNode.id) {
                node = groupNode.childList[ix];

                // TODO baseNode 사용에 문제가 없으면 아래 노드 설정 코드를 삭제
                //node.level = 0;
                //node.parentId = '';
                //node.isHide = false;
                //node.x = x;
                //node.y = y;

                baseNode = this.getNodeById(node.id);
                baseNode.level = 0;
                baseNode.parentId = '';
                baseNode.isHide = false;
                baseNode.x = x;
                baseNode.y = y;

                // 그룹노드에서 하위 노드 갯수 빼기
                groupNode.childList.splice(ix, 1);
                groupNode.childNodeAllCount -= (node.childNodeAllCount > 0)? node.childNodeAllCount : 1;
                groupNode.webNodeAllCount   -= (node.webNodeAllCount > 0)?   node.webNodeAllCount   : 1;
                ix--;
                ixLen--;

                // 그룹 노드와 연결선 제거
                this.deleteRelationData(node.id, groupNode.id);

                if (groupNode.childList.length === 1) {
                    node = groupNode.childList[0];

                    this.deleteNodeInParentNode(groupNode.parentId, groupNode.id);

                    this.deleteRelationData(node.id, groupNode.id);

                    // 그룹 노드는 없어지게 되므로 목록에서 제거
                    this.deleteNodeByNodeId(groupNode.id);
                    groupNode.childList.length = 0;

                    //node.level = 0;
                    //node.parentId = '';
                    //node.isHide = false;

                    baseNode = this.getNodeById(node.id);
                    baseNode.level = 0;
                    baseNode.parentId = '';
                    baseNode.isHide = false;
                }

                isChange = true;
                break;
            }

            ix++;
        }

        if (isChange === true) {
            var groupType = this.getSelectionNodeType(groupNode.childList);
            groupNode.type = groupType;

            if (groupType === 'AGENT') {
                groupNode.clazz = 'AGENT';
            }
            //this.canvasDraw();
            this.refreshData();

            this.saveCurrentNodeStruct();
        }
    },


    getSaveNodePosition: function(id) {
        var nodePot;
        var savePot = {x: 0, y: 0};

        if (Comm.web_env_info.topologyNodePosition) {
            nodePot = JSON.parse(Comm.web_env_info.topologyNodePosition);
        }

        if (nodePot && nodePot[id]) {
            savePot.x = nodePot[id].x;
            savePot.y = nodePot[id].y;
        }
        try {
            return savePot;
        } finally {
            savePot = null;
            nodePot = null;
        }
    },


    /**
     * Grouping the agent contained in the selected region.
     */
    mergeGroupMultiSelectNode: function(x, y, w, h) {

        this.clearDragLayout();
        this.clearOverLayout();

        this.dragCtx.save();

        this.dragCtx.strokeStyle = '#349BE7';
        this.dragCtx.lineWidth = 1;
        this.dragCtx.lineJoin = 'round';
        this.dragCtx.fillStyle = 'rgba('+this.getHexToRgb('#349BE7') +','+ 0.5 + ')';

        this.dragCtx.fillRect(x, y, w, h);
        this.dragCtx.strokeRect(x, y, w, h);

        this.dragCtx.restore();

        this.isCreateMultiGroup = true;
        this.isCheckCreateGroup = true;
        this.folderViewPt = {x: x + w / 2 + 58, y: y + h / 2 - 70};

        this.mergeTargetNode = {x: x + w / 2, y: y + h / 2};

        this.drawFolderOpen(function() {
            this.drawGroupInput(this.mergeTargetNode.x, this.mergeTargetNode.y);
        }.bind(this));
    },


    /**
     * Check Group Type
     * 노드를 선택하여 다른 노드로 드래그 & 드랍 하여 그룹노드를 생성함.
     * 선택된 노드 및 대상 노드 모두 그룹노드가 아닌 경우에 실행됨.
     */
    mergeDragDropNode: function() {
        var type = this.getSelectionNodeType(this.mergeAgentList, this.mergeTargetNode);

        switch(type) {
            case 'SERVER_GROUP':
            case 'HTTP_GROUP':
            case 'ORACLE_GROUP':
                this.mergeGroup(type);
                break;
            case 'SERVER_DB':
            case 'DB_CLOUD':
            case 'SERVER_CLOUD':
            case 'SERVER_DB_CLOUD':
                this.mergeComplexGroup(type);
                break;
            case 'AGENT':
                this.mergeAgentGroup();
                break;
            default:
                this.mergeAgentGroup();
                break;
        }
    },


    /**
     * 마우스를 드래그하여 선택된 영역안에 포함되어 있는 노드들을 그룹 노드로 구성.
     *
     * @descr 마우스를 드래그하여 선택된 영역에 포함된 노드들을 그룹 노드로 생성한다.
     */
    mergeDragSelectionNode: function() {
        var ix, ixLen;
        var selectNode;

        this.isCheckCreateGroup = false;
        this.isDragMultiSelection = false;

        // 그룹 노드 타입 체크
        var type  = this.getSelectionNodeType(this.dragSelectionNodeList);
        var clazz = this.getClazzByType(type);

        var nodeId   = 'GROUP-' + Date.now() + this.nodeSeq++;
        var nodeName = this.groupNameInputBox.value;

        // 노드명을 입력한 텍스트 창 정보를 초기화
        this.groupNameInputBox.style.display = 'none';
        this.groupNameInputBox.value = '';

        // 그룹 노드 생성
        var newGroupNode = new this.nodeClass.node(clazz, nodeId, nodeName, type, this.mergeTargetNode.x, this.mergeTargetNode.y, true);
        newGroupNode.remoteCount          = {};
        newGroupNode.remoteCount.lastTime = {};
        newGroupNode.activeDest           = {};
        newGroupNode.activeDest.lastTime  = {};
        newGroupNode.isSetPos             = true;
        newGroupNode.childNodeAllCount    = 0;
        newGroupNode.webNodeAllCount      = 0;

        // 신규 생성된 그룹 노드를 노드 목록에 추가
        this.nodeList[this.nodeList.length] = newGroupNode;
        this.nodeMap[newGroupNode.id]       = newGroupNode;

        // 드래그 해서 선택한 영역에 포함되는 노드를 그룹 노드의 하위노드 목록에 추가
        for (ix = 0, ixLen = this.dragSelectionNodeList.length; ix < ixLen; ix++) {
            selectNode = this.dragSelectionNodeList[ix];
            selectNode.level = 1;
            selectNode.parentId = nodeId;

            newGroupNode.childList[newGroupNode.childList.length] = selectNode;
            newGroupNode.childNodeAllCount += (selectNode.childList.length > 0)? selectNode.childNodeAllCount : 1;
            newGroupNode.webNodeAllCount   += (selectNode.webList.length   > 0)? selectNode.webNodeAllCount   : 1;

            if (selectNode.childIdAllList.length > 0) {
                newGroupNode.childIdAllList = Ext.Array.merge(newGroupNode.childIdAllList, selectNode.childIdAllList);

            } else if (newGroupNode.childIdAllList.indexOf(selectNode.id) === -1) {
                newGroupNode.childIdAllList.push(selectNode.id);
            }

            // 그룹된 노드와 연결 관계 설정
            this.copyRelationPoint(newGroupNode, selectNode);

            // 그룹 노드의 알람 상태 설정
            switch (selectNode.status) {
                case this.alarmType.CRITICAL :
                    newGroupNode.status = this.alarmType.CRITICAL;
                    break;

                case this.alarmType.WARNING :
                    if (newGroupNode.status < this.alarmType.WARNING) {
                        newGroupNode.status = this.alarmType.WARNING;
                    }
                    break;

                default :
                    newGroupNode.status = this.alarmType.NORMAL;
                    break;
            }

        }

        // 노드에 포함되어 있는 리모트 카운트 정보 및 액티브 데스트 정보를 그룹 노드에 취합한다.
        // TODO 그룹노드에서 특정 노드를 제거할 때 해당 노드의 리모트 카운트 정보 및 액티브 데스트 정보가 올바르게 변경되는지 확인 필요
        for (ix = 0, ixLen = newGroupNode.childList.length; ix < ixLen; ix++) {
            Ext.merge(newGroupNode.remoteCount, newGroupNode.childList[ix].remoteCount);
            Ext.merge(newGroupNode.activeDest, newGroupNode.childList[ix].activeDest);
        }

        //this.overCanvas.width = 0;
        //this.overCanvas.height = 0;
        this.clearOverLayout();

        this.clearGroupLayout();

        if (this.isAutoSave) {
            this.saveNodePosition(newGroupNode.id, this.mergeTargetNode.x, this.mergeTargetNode.y);
        }

        //this.canvasDraw();
        this.refreshData();
    },


    /**
     * 선택한 에이전트 노드를 다른 에이전트 노드에 드래그해서 그룹 노드를 생성.
     */
    mergeAgentGroup: function() {
        var ix, jx, jxLen, ixLen;
        var selectNode, childNode;
        var nodeId;

        this.isCheckCreateGroup = false;

        var newNodeName = this.groupNameInputBox.value;
        this.groupNameInputBox.style.display = 'none';
        this.groupNameInputBox.value = '';

        nodeId = 'GROUP-' + Date.now() + this.nodeSeq++;

        var newGroupNode = new this.nodeClass.node('AGENT', nodeId, newNodeName, '', this.mergeTargetNode.x, this.mergeTargetNode.y, true);
        newGroupNode.remoteCount          = {};
        newGroupNode.remoteCount.lastTime = {};
        newGroupNode.activeDest           = {};
        newGroupNode.activeDest.lastTime  = {};
        newGroupNode.isSetPos             = true;
        newGroupNode.childNodeAllCount    = 0;

        this.nodeList[this.nodeList.length] = newGroupNode;
        this.nodeMap[newGroupNode.id]       = newGroupNode;

        // 선택한 노드 정보를 그룹 노드에 추가
        for (ix = 0, ixLen = this.mergeAgentList.length; ix < ixLen; ix++) {
            selectNode = this.mergeAgentList[ix];
            selectNode.parentId = nodeId;

            this.addNodeToNewGroup(newGroupNode, selectNode);
        }

        // 노드 추가 2
        if (this.mergeTargetNode.isGroupMode) {
            for (jx = 0, jxLen = this.mergeTargetNode.childList.length; jx < jxLen; jx++) {
                childNode = this.mergeTargetNode.childList[jx];
                childNode.parentId = nodeId;

                this.addNodeToNewGroup(newGroupNode, childNode);
            }

        } else if (this.mergeTargetNode.childList.length <= 0) {
            this.mergeTargetNode.parentId = nodeId;
            this.addNodeToNewGroup(newGroupNode, this.mergeTargetNode);
        }

        for (ix = 0, ixLen = newGroupNode.childList.length; ix < ixLen; ix++) {
            Ext.merge(newGroupNode.remoteCount, newGroupNode.childList[ix].remoteCount);
            Ext.merge(newGroupNode.activeDest, newGroupNode.childList[ix].activeDest);
        }

        if (this.isGroupNodeByNodeId(this.mergeTargetNode.id)) {
            this.deleteNodeByNodeId(this.mergeTargetNode.id);
        }

        this.selectNodeObj = null;

        this.clearOverLayout();

        this.clearGroupLayout();

        if (this.isAutoSave) {
            this.saveNodePosition(newGroupNode.id, this.mergeTargetNode.x, this.mergeTargetNode.y);
        }

        //this.canvasDraw();
        this.refreshData();
    },




    /**
     * 그룹 생성
     *
     * @param {string} groupType - 그룹 타입
     */
    mergeGroup: function(groupType) {
        var jx, jxLen, ix, ixLen;
        var selectNode;
        var nodeId;

        this.isCheckCreateGroup = false;

        var newNodeName = this.groupNameInputBox.value;
        this.groupNameInputBox.style.display = 'none';
        this.groupNameInputBox.value = '';

        nodeId = 'GROUP-' + Date.now() + this.nodeSeq++;

        var newGroupNode = new this.nodeClass.node('GROUP', nodeId, newNodeName, groupType, this.mergeTargetNode.x, this.mergeTargetNode.y, true);
        newGroupNode.remoteCount          = {};
        newGroupNode.remoteCount.lastTime = {};
        newGroupNode.activeDest           = {};
        newGroupNode.activeDest.lastTime  = {};
        newGroupNode.isSetPos             = true;
        newGroupNode.childNodeAllCount    = 0;
        newGroupNode.webNodeAllCount      = 0;

        // 신규 생성된 그룹 노드를 노드 목록에 추가
        this.nodeList[this.nodeList.length] = newGroupNode;
        this.nodeMap[newGroupNode.id]       = newGroupNode;

        for (ix = 0, ixLen = this.mergeAgentList.length; ix < ixLen; ix++) {
            selectNode = this.mergeAgentList[ix];
            selectNode.level = 1;
            selectNode.parentId = nodeId;

            newGroupNode.childList[newGroupNode.childList.length] = selectNode;
            newGroupNode.childNodeAllCount += (selectNode.childList.length > 0)? selectNode.childNodeAllCount : 1;
            newGroupNode.webNodeAllCount   += (selectNode.webList.length   > 0)? selectNode.webNodeAllCount   : 1;

            switch (selectNode.status) {
                case this.alarmType.CRITICAL :
                    newGroupNode.status = this.alarmType.CRITICAL;
                    break;

                case this.alarmType.WARNING :
                    if (newGroupNode.status < this.alarmType.WARNING) {
                        newGroupNode.status = this.alarmType.WARNING;
                    }
                    break;

                default :
                    newGroupNode.status = this.alarmType.NORMAL;
                    break;
            }
        }

        if (this.mergeTargetNode.childList.length <= 0) {
            newGroupNode.childList[newGroupNode.childList.length] = this.mergeTargetNode;
        }

        for (ix = 0, ixLen = newGroupNode.childList.length; ix < ixLen; ix++) {
            Ext.merge(newGroupNode.remoteCount, newGroupNode.childList[ix].remoteCount);
            Ext.merge(newGroupNode.activeDest, newGroupNode.childList[ix].activeDest);
        }

        this.mergeTargetNode.level = 1;

        if (this.mergeAgentList[ix].status === 3) {
            newGroupNode.isContainDown = true;

        } else if (this.mergeTargetNode.status === 2) {
            newGroupNode.status = 2;

        } else if (newGroupNode.status < 1 && this.mergeTargetNode.status === 1) {
            newGroupNode.status = 1;
        }

        for (jx = 0, jxLen = this.mergeAgentList.length; jx < jxLen; jx++) {
            selectNode = this.mergeAgentList[jx];
            this.copyRelationPoint(newGroupNode, selectNode);
        }

        this.copyRelationPoint(newGroupNode, this.mergeTargetNode);

        this.selectNodeObj.x = this.firstClickPoint.x;
        this.selectNodeObj.y = this.firstClickPoint.y;
        this.selectNodeObj = null;

        //this.overCanvas.width = 0;
        //this.overCanvas.height = 0;
        this.clearOverLayout();

        this.clearGroupLayout();

        if (this.isAutoSave) {
            this.saveNodePosition(newGroupNode.id, this.firstClickPoint.x, this.firstClickPoint.y);
        }

        //this.canvasDraw();
        this.refreshData();
    },


    /**
     * Create Node Group - Agent + Http or DB + Server
     */
    mergeComplexGroup: function(type) {
        var jx, jxLen, ix, ixLen;
        var clazz;
        var node;

        this.isCheckCreateGroup = false;
        this.isDragMultiSelection = false;

        var newNodeName = this.groupNameInputBox.value;
        this.groupNameInputBox.style.display = 'none';
        this.groupNameInputBox.value = '';

        clazz = this.getClazzByType(type);

        var newGroupNode = new this.nodeClass.node(clazz, 'GROUP-' + Date.now() + this.nodeSeq++, newNodeName, type, this.mergeTargetNode.x, this.mergeTargetNode.y, true);
        newGroupNode.remoteCount = {};
        newGroupNode.remoteCount.lastTime = {};
        newGroupNode.activeDest = {};
        newGroupNode.activeDest.lastTime = {};

        this.nodeList[this.nodeList.length] = newGroupNode;
        this.nodeMap[newGroupNode.id]       = newGroupNode;

        for (ix = 0; ix < this.mergeAgentList.length; ix++) {
            newGroupNode.childList = this.mergeTargetNode.childList.concat(this.mergeAgentList[ix].childList);
            if (!this.mergeAgentList[ix].isGroupMode) {
                newGroupNode.childList[newGroupNode.childList.length] = this.mergeAgentList[ix];
            }

            this.mergeAgentList[ix].childList = [];
            this.mergeAgentList[ix].level = 1;

            if (this.mergeAgentList[ix].status === 3) {
                newGroupNode.isContainDown = true;

            } else if (this.mergeAgentList[ix].status === 2) {
                newGroupNode.status = 2;

            } else if (this.mergeAgentList[ix].status === 1) {
                newGroupNode.status = 1;
            }
        }

        if (this.mergeTargetNode.childList.length <= 0) {
            newGroupNode.childList[newGroupNode.childList.length] = this.mergeTargetNode;
        }

        for (ix = 0, ixLen = newGroupNode.childList.length; ix < ixLen; ix++) {
            Ext.merge(newGroupNode.remoteCount, newGroupNode.childList[ix].remoteCount);
            Ext.merge(newGroupNode.activeDest, newGroupNode.childList[ix].activeDest);
        }

        this.mergeTargetNode.level = 1;
        if (this.mergeTargetNode.status === 2) {
            newGroupNode.status = 2;
        }

        for (jx = 0, jxLen = this.mergeAgentList.length; jx < jxLen; jx++) {
            node = this.mergeAgentList[jx];
            this.copyRelationPoint(newGroupNode, node);
        }

        this.copyRelationPoint(newGroupNode, this.mergeTargetNode);

        this.selectNodeObj.x = this.firstClickPoint.x;
        this.selectNodeObj.y = this.firstClickPoint.y;
        this.selectNodeObj = null;

        //this.overCanvas.width = 0;
        //this.overCanvas.height = 0;
        this.clearOverLayout();

        this.clearGroupLayout();

        if (this.isAutoSave) {
            this.saveNodePosition(newGroupNode.id, this.firstClickPoint.x, this.firstClickPoint.y);
        }

        //this.canvasDraw();
        this.refreshData();
    },


    /**
     * 타입에 따라 그룹 노드를 생성하여 노드를 설정한다.
     * 현재 해당 함수는 사용을 하지 않지만 업무 또는 호스트별로 자동으로 그룹화하는 기능을
     * 추가할 때 사용할 예정.
     *
     * @param {object} wasIdGroup - ex) {name1: [1,2,5], name2: [4,7,9]}
     */
    mergeNodeByGroupType: function(wasIdGroup) {
        var ix, jx, jxLen, ixLen;
        //var pattern;
        var node;
        //var types = [0, 0, 0, 0]; // 0: Agent, 1: Server, 2: Cloud(http, tcp), 3: DB
        var type;

        var wasIdArr;
        var groupNames;
        var nodeName;

        var nodeObj;
        var startPosX = 100;
        var startPosY = 100;

        var addNodeIdList = [];

        groupNames = Object.keys(wasIdGroup);

        this.clearMergeNode();

        for (jx = 0, jxLen = groupNames.length; jx < jxLen; jx++) {
            nodeName = groupNames[jx];
            wasIdArr = wasIdGroup[nodeName];

            this.dragSelectionNodeList = [];

            // TODO Change Point - Node List
            for (ix = 0, ixLen = this.nodeList.length; ix < ixLen ; ix++) {
                if (wasIdArr.indexOf(this.getWasIdByNodId(this.nodeList[ix].id)) !== -1) {
                    this.dragSelectionNodeList[this.dragSelectionNodeList.length] = this.nodeList[ix];
                    addNodeIdList[addNodeIdList.length] = this.nodeList[ix].id;
                }
            }

//            for (ix = 0; ix < this.dragSelectionNodeList.length; ix++) {
//                node = this.dragSelectionNodeList[ix];
//
//                if ('AGENT' === node.clazz) {
//                    types[0] = 1;
//                } else if ('SERVER' === node.clazz) {
//                    types[1] = 1;
//                } else if ('CLOUD' === node.clazz) {
//                    types[2] = 1;
//                } else if ('DB' === node.clazz) {
//                    types[3] = 1;
//                }
//            }

            //pattern = types.join('');

            //type = this.getTypeByPattern(pattern);

            type = this.getSelectionNodeType(this.dragSelectionNodeList);

            this.mergeNodeByType(type, nodeName, startPosX, startPosY);

            startPosX += 150;
            if (startPosX > this.canvas.width) {
                startPosY += 100;
                startPosX = 100;
            }
        }

        // Configuration Non-group Agent Node
        if (startPosY !== 100) {
            startPosY += 100;
            startPosX = 100;
        }

        // TODO Change Point - Node List
        for (ix = 0, ixLen = this.nodeList.length; ix < ixLen ; ix++) {
            nodeObj = this.nodeList[ix];

            if (nodeObj.clazz == 'AGENT' && nodeObj.id.indexOf('GROUP-') !== 0 && addNodeIdList.indexOf(nodeObj.id) === -1) {
                nodeObj.x = startPosX;
                nodeObj.y = startPosY;

                this.drawCircle(nodeObj);
                this.drawNodeInfo(nodeObj);
                this.drawGroupDownAlarm(node);
                this.drawNodeData(nodeObj);

                startPosX += 150;
                if (startPosX > this.canvas.width) {
                    startPosY += 100;
                    startPosX = 100;
                }
            }
        }

        // Configuration DB Node
        startPosY += 200;
        startPosX = 100;

        // TODO Change Point - Node List
        for (ix = 0, ixLen = this.nodeList.length; ix < ixLen ; ix++) {
            if (this.nodeList[ix].clazz == 'DB') {

                this.nodeList[ix].x = startPosX;
                this.nodeList[ix].y = startPosY;

                this.drawDatabase(this.nodeList[ix]);

                startPosX += 150;
                if (startPosX > this.canvas.width) {
                    startPosY += 100;
                    startPosX = 100;
                }
            }
        }

        // Configuration Server Node
        startPosY += 200;
        startPosX = 100;

        // TODO Change Point - Node List
        for (ix = 0, ixLen = this.nodeList.length; ix < ixLen ; ix++) {
            if (this.nodeList[ix].clazz == 'SERVER') {
                this.nodeList[ix].x = startPosX;
                this.nodeList[ix].y = startPosY;

                this.drawServer(this.nodeList[ix]);

                startPosX += 150;
                if (startPosX > this.canvas.width) {
                    startPosY += 100;
                    startPosX = 100;
                }
            }
        }

        // Configuration Cloud Node
        startPosY += 200;
        startPosX = 100;

        for (ix = 0, ixLen = this.nodeList.length; ix < ixLen ; ix++) {
            if (this.nodeList[ix].clazz == 'CLOUD') {

                this.nodeList[ix].x = startPosX;
                this.nodeList[ix].y = startPosY;

                this.drawCloud(this.nodeList[ix]);

                startPosX += 150;
                if (startPosX > this.canvas.width) {
                    startPosY += 100;
                    startPosX = 100;
                }
            }
        }

        // Save Configuration Node Positoin
        this.saveCurrentNodeStruct();

        //this.overCanvas.width = 0;
        //this.overCanvas.height = 0;
        this.clearOverLayout();

        this.clearGroupLayout();

        //this.canvasDraw();
        this.refreshData();
    },


    /**
     *  It merges the agent.
     *
     * @param {string} type - node type
     * @param {string} nodeName - Node Name (Host Name, Biz Name, Etc)
     * @param {number} posX - X Position
     * @param {number} posY - Y Position
     * @param {string} clazz - node class name (AGENT, DB, SERVER)
     */
    mergeNodeByType: function(type, nodeName, posX, posY, clazz) {
        var jx, jxLen, ix, ixLen;
        var agent;
        var isContainAsync = false;

        this.isCheckCreateGroup = false;
        this.isDragMultiSelection = false;

        switch (type) {
            case 'AGENT':
                clazz = 'AGENT';
                break;
            case 'ORACLE_GROUP':
            case 'SERVER_GROUP':
            case 'CLOUD_GROUP':
            case 'HTTP_GROUP':
            case 'TCP_GROUP':
            case 'SERVER_DB':
            case 'SERVER_CLOUD':
            case 'DB_CLOUD':
            case 'SERVER_DB_CLOUD':
                clazz = 'GROUP';
                break;
            default:
                clazz = clazz || 'AGENT';
                break;
        }

        var selectNode;
        var nodeId = 'GROUP-' + Date.now() + this.nodeSeq++;
        var newGroupNode = new this.nodeClass.node(clazz, nodeId, nodeName, type, posX, posY, true);
        newGroupNode.remoteCount = {};
        newGroupNode.remoteCount.lastTime = {};
        newGroupNode.activeDest = {};
        newGroupNode.activeDest.lastTime = {};

        this.nodeList[this.nodeList.length] = newGroupNode;
        this.nodeMap[newGroupNode.id] = newGroupNode;

        for (ix = 0; ix < this.dragSelectionNodeList.length; ix++) {
            selectNode = this.dragSelectionNodeList[ix];
            newGroupNode.childList = newGroupNode.childList.concat(selectNode.childList);

            if (!selectNode.isGroupMode) {
                newGroupNode.childList[newGroupNode.childList.length] = selectNode;
            }

            selectNode.childList = [];
            selectNode.level = 1;
            selectNode.parentId = nodeId;

            if (selectNode.status === 2) {
                newGroupNode.status = 2;
            } else if (newGroupNode.status < 1 && selectNode.status === 1) {
                newGroupNode.status = 1;
            }
        }

        for (ix = 0, ixLen = newGroupNode.childList.length; ix < ixLen; ix++) {
            Ext.merge(newGroupNode.remoteCount, newGroupNode.childList[ix].remoteCount);
            Ext.merge(newGroupNode.activeDest, newGroupNode.childList[ix].activeDest);

            if (newGroupNode.childList[ix].remoteType === 'TIBCO (async)') {
                newGroupNode.remoteType = 'TIBCO (async)';
                isContainAsync = true;
            }
        }
        if (!isContainAsync) {
            newGroupNode.remoteType = '';
        }

        for (jx = 0, jxLen = this.dragSelectionNodeList.length; jx < jxLen; jx++) {
            agent = this.dragSelectionNodeList[jx];
            this.copyRelationPoint(newGroupNode, agent);
        }

        //this.saveNodePosition(newGroupNode.id, posX, posY);
    },


    /**
     * 신규 그룹 노드에 노드 추가
     *
     * @param {} newGroupNode
     * @param {} selectNode
     */
    addNodeToNewGroup: function(newGroupNode, selectNode) {
        selectNode.level = 1;

        newGroupNode.childList[newGroupNode.childList.length] = selectNode;
        newGroupNode.childNodeAllCount += (selectNode.childList.length > 0)? selectNode.childNodeAllCount : 1;
        newGroupNode.webNodeAllCount   += (selectNode.webList.length   > 0)? selectNode.webNodeAllCount   : 1;

        if (selectNode.childIdAllList.length > 0) {
            newGroupNode.childIdAllList = Ext.Array.merge(newGroupNode.childIdAllList, selectNode.childIdAllList);

        } else if (newGroupNode.childIdAllList.indexOf(selectNode.id) === -1) {
            newGroupNode.childIdAllList.push(selectNode.id);
        }

        // 그룹된 노드와 연결 관계 설정
        this.copyRelationPoint(newGroupNode, selectNode);

        // 그룹 노드의 알람 상태 설정
        switch (selectNode.status) {
            case this.alarmType.CRITICAL :
                newGroupNode.status = this.alarmType.CRITICAL;
                break;

            case this.alarmType.WARNING :
                if (newGroupNode.status < this.alarmType.WARNING) {
                    newGroupNode.status = this.alarmType.WARNING;
                }
                break;

            default :
                newGroupNode.status = this.alarmType.NORMAL;
                break;
        }
    },


    /**
     * Clear Merge Node
     */
    clearMergeNode: function() {
        var ix, ixLen,
            nodeId;

        for (ix = 0, ixLen = this.nodeList.length; ix < ixLen;) {
            nodeId = this.nodeList[ix].id;

            if (nodeId.indexOf('GROUP-') === 0) {
                this.nodeList.splice(ix, 1);
                ix--;
                ixLen--;

                delete this.nodeMap[nodeId];
            } else {
                this.nodeList[ix].level = 0;
            }
            ix++;
        }
    },


    getSelectionNodeType: function(checkNodeList, checkNode) {
        var ix, ixLen;
        var typePattern, type;
        var selectNode;

        // 0: Agent, 1: Server, 2: Cloud(http, tcp), 3: DB
        var types = [0, 0, 0, 0];

        for (ix = 0, ixLen = checkNodeList.length; ix < ixLen; ix++) {
            selectNode = checkNodeList[ix];

            switch (selectNode.clazz) {
                case 'AGENT' :
                    types[0] = 1;
                    break;
                case 'SERVER' :
                    types[1] = 1;
                    break;
                case 'CLOUD' :
                    types[2] = 1;
                    break;
                case 'DB' :
                    types[3] = 1;
                    break;
                default:
                    types[0] = 1;
                    break;
            }
        }

        if (checkNode) {
            switch (checkNode.clazz) {
                case 'AGENT' :
                    types[0] = 1;
                    break;
                case 'SERVER' :
                    types[1] = 1;
                    break;
                case 'CLOUD' :
                    types[2] = 1;
                    break;
                case 'DB' :
                    types[3] = 1;
                    break;
                default:
                    types[0] = 1;
                    break;
            }
        }

        // 드래그 또는 선택된 노드들의 타입 패턴 확인
        typePattern = types.join('');

        // 패턴에 따른 타입 확인
        type = this.getTypeByPattern(typePattern);

        checkNodeList = null;

        return type;
    },


    getTypeByPattern: function(typePattern) {
        var nodeType;

        switch(typePattern) {
            case '1000': // Agent
            case '1001': // Agent + etc
            case '1010':
            case '1100':
            case '1011':
            case '1101':
            case '1110':
                nodeType = 'AGENT';
                break;
            case '0100': // Server + Server
                nodeType = 'SERVER_GROUP';
                break;
            case '0010': // Cloud(http, tcp)
                nodeType = 'CLOUD_GROUP';
                break;
            case '0001': // Database
                nodeType = 'ORACLE_GROUP';
                break;
            case '0101': // Server + Database
                nodeType = 'SERVER_DB';
                break;
            case '0110': // Server + Cloud
                nodeType = 'SERVER_CLOUD';
                break;
            case '0011': // Database + Cloud
                nodeType = 'DB_CLOUD';
                break;
            case '0111': // Server + Database + cloud
                nodeType = 'SERVER_DB_CLOUD';
                break;
            default:
                nodeType = 'AGENT';
                break;
        }
        return nodeType;
    },


    getClazzByType: function(nodeType) {
        var clazz;
        switch (nodeType) {
            case 'AGENT':
                clazz = 'AGENT';
                break;
            case 'ORACLE_GROUP':
            case 'SERVER_GROUP':
            case 'CLOUD_GROUP':
            case 'HTTP_GROUP':
            case 'TCP_GROUP':
            case 'SERVER_DB':
            case 'SERVER_CLOUD':
            case 'DB_CLOUD':
            case 'SERVER_DB_CLOUD':
                clazz = 'GROUP';
                break;
            default:
                clazz = 'AGENT';
                break;
        }
        return clazz;
    },


    /**
     * Node 정보 목록에서 해당 ID에 해당하는 Node 를 제거함.
     *
     * @param {string} nodeId Node ID
     */
    deleteNodeByNodeId: function(nodeId) {
        var ix, ixLen;

        for (ix = 0, ixLen = this.nodeList.length; ix < ixLen;) {
            if (this.nodeList[ix].id === nodeId) {
                this.nodeList.splice(ix, 1);
                ix--;
                ixLen--;

                delete this.nodeMap[nodeId];

                break;
            }
            ix++;
        }
    },


    /**
     * 부모 노드에서 하위 노드를 삭제
     *
     * @param {string} parentNodeId - 부모 노드 ID
     * @param {string} childNodeId - 하위 노드 ID
     */
    deleteNodeInParentNode: function(parentNodeId, childNodeId) {
        var ix, ixLen;

        var parentNode = this.getNodeById(parentNodeId);
        var childNode  = this.getNodeById(childNodeId);

        // 부모 노드가 없는 경우 처리하지 않는다.
        if (!parentNode) {
            return;
        }

        for (ix = 0, ixLen = parentNode.childList.length; ix < ixLen; ) {
            if (parentNode.childList[ix].id === childNodeId) {

                // 그룹노드에서 하위 노드 갯수 빼기
                parentNode.childList.splice(ix, 1);
                parentNode.childNodeAllCount -= (childNode.childNodeAllCount > 0)? childNode.childNodeAllCount : 1;
                parentNode.webNodeAllCount   -= (childNode.webNodeAllCount   > 0)? childNode.webNodeAllCount   : 1;
                ix--;
                ixLen--;

                // 그룹 노드와 연결선 제거
                this.deleteRelationData(childNodeId, parentNodeId);

                break;
            }
            ix++;
        }
    },


    /**
     * 선택한 단일노드를 그룹 노드에 드래그 & 드랍하여 추가.
     *
     * @param {object} selectNode - 선택한 노드
     * @param {object} groupNode - 추가 대상 그룹 노드
     */
    addAgentToGroup: function(selectNode, groupNode) {
        selectNode.parentId = groupNode.id;

        this.addNodeToNewGroup(groupNode, selectNode);

        this.selectNodeObj = null;

        //this.canvasDraw();
        this.refreshData();
    },


    /**
     * Add Node to Group
     */
    addNodeToGroup: function(node, groupNode) {
        groupNode.childList[groupNode.childList.length] = node;
        node.parentId = groupNode.id;

        node.level = 1;

        if (node.status === 2) {
            groupNode.status = 2;
        } else if (groupNode.status < 1 && node.status === 1) {
            groupNode.status = 1;
        }

        this.reconfigRelationPoint(node, groupNode);
        this.selectNodeObj = null;

        if (node.clazz === 'DB') {
            switch (groupNode.type) {
                case 'SERVER_GROUP':
                    groupNode.type = 'SERVER_DB';
                    break;
                case 'CLOUD_GROUP':
                case 'HTTP_GROUP':
                case 'TCP_GROUP':
                    groupNode.type = 'DB_CLOUD';
                    break;
                case 'SERVER_CLOUD':
                    groupNode.type = 'SERVER_DB_CLOUD';
                    break;
                default:
                    break;
            }

        } else if (node.clazz === 'SERVER') {
            switch (groupNode.type) {
                case 'ORACLE_GROUP':
                    groupNode.type = 'SERVER_DB';
                    break;
                case 'CLOUD_GROUP':
                case 'HTTP_GROUP':
                case 'TCP_GROUP':
                    groupNode.type = 'SERVER_CLOUD';
                    break;
                case 'DB_CLOUD':
                    groupNode.type = 'SERVER_DB_CLOUD';
                    break;
                default:
                    break;
            }

        } else if (node.clazz === 'CLOUD') {
            switch (groupNode.type) {
                case 'ORACLE_GROUP':
                    groupNode.type = 'DB_CLOUD';
                    break;
                case 'SERVER_GROUP':
                    groupNode.type = 'SERVER_CLOUD';
                    break;
                case 'SERVER_DB':
                    groupNode.type = 'SERVER_DB_CLOUD';
                    break;
                default:
                    break;
            }
        } else {
            groupNode.type = '';
            groupNode.clazz = 'AGENT';
        }

        //this.canvasDraw();
        this.refreshData();
    },


    /**
     * Draw Line path (Rect -> Rect)
     */
    drawRectNodeToRectNode: function() {
        var fNode, tNode;
        var ptCircle1, ptCircle2, ptCircle3, ptCircle4;
        var ptArrow, status;
        var tmpLinePath = [];

        this.relationLinePoint = [];

        for (var ix = 0; ix < this.relationData.length; ix++) {
            fNode = this.getTxnNodeById(this.relationData[ix].fN, this);
            tNode = this.getTxnNodeById(this.relationData[ix].tN, this);

            if (!fNode || !tNode) {
                continue;
            }
            if (fNode.level !== this.displayNodeLevel || tNode.level !== this.displayNodeLevel) {
                continue;
            }

            if (tmpLinePath.indexOf(fNode.id + tNode.id) !== -1) {
                continue;
            }

            if (fNode.id === tNode.id) {
                continue;
            }

            tmpLinePath[tmpLinePath.length] = fNode.id + tNode.id;

            if (fNode.clazz === 'AGENT' && tNode.clazz === 'AGENT') {
                ptCircle1 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 6, fNode, tNode);
                ptCircle2 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 6, tNode, fNode);
                ptArrow   = this.getPointOnCircle(this.property.outCircle.radius * 2 + 6 + this.property.arrow.w , tNode, fNode);
                ptCircle3 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 3, fNode, tNode);
                ptCircle4 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 3, tNode, fNode);

            } else if (fNode.clazz === 'DB' || tNode.clazz === 'DB') {
                ptCircle1 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 6, fNode, tNode);
                ptCircle2 = this.getPointOnCircle(45, tNode, fNode);
                ptArrow   = this.getPointOnCircle(45 + this.property.arrow.w , tNode, fNode);
                ptCircle3 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 6, fNode, tNode);
                ptCircle4 = this.getPointOnCircle(42, tNode, fNode);

            } else if (fNode.clazz === 'CLOUD' || tNode.clazz === 'CLOUD') {
                ptCircle1 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 6, fNode, tNode);
                ptCircle2 = this.getPointOnCircle(45, tNode, fNode);
                ptArrow   = this.getPointOnCircle(45 + this.property.arrow.w , tNode, fNode);
                ptCircle3 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 3, fNode, tNode);
                ptCircle4 = this.getPointOnCircle(42, tNode, fNode);

            } else if (fNode.clazz === 'SERVER' || tNode.clazz === 'SERVER') {
                ptCircle1 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 6, fNode, tNode);
                ptCircle2 = this.getPointOnCircle(45, tNode, fNode);
                ptArrow   = this.getPointOnCircle(45 + this.property.arrow.w , tNode, fNode);
                ptCircle3 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 3, fNode, tNode);
                ptCircle4 = this.getPointOnCircle(42, tNode, fNode);
            }

            if (fNode.status === 3 || tNode.status === 3) {
                status = 3;
            } else if (fNode.status === 2) {
                status = 2;
            } else if (fNode.status === 1) {
                status = 1;
            } else {
                status = 0;
            }
            this.drawArrowOfRect(this.property.arrow, ptArrow, ptCircle2, status);

            this.drawRelationLineOfRect(ptCircle1, ptCircle2, ptCircle3, ptCircle4, status, fNode.id, tNode.id, tNode.remoteType || '' );
        }
    },


    /**
     * Draw Line path
     */
    drawNodeToNode: function() {
        var fNode, tNode;
        var ptCircle1, ptCircle2, ptCircle3, ptCircle4;
        var ptArrow, status;
        var tmpLinePath = [];
        var remoteType;

        this.relationLinePoint = [];
        this.remoteInfoBoxList = [];

        var relationList;
        if (this.isChangeDisplayRelation && this.displayRelationData.length > 0) {
            relationList = this.displayRelationData;

        } else {
            relationList = this.relationData;
            this.displayRelationData = [];
        }

        for (var ix = 0, ixLen = relationList.length; ix < ixLen; ix++) {
            fNode = this.getNodeById(relationList[ix].fN);
            tNode = this.getNodeById(relationList[ix].tN);

            remoteType = relationList[ix].type || '';

            if (!remoteType && tNode.remoteType) {
                remoteType = tNode.remoteType;
            }

            if (!fNode || !tNode) {
                continue;
            }
            // continue 많은 순서입니다.
            if (fNode.level !== this.displayNodeLevel || tNode.level !== this.displayNodeLevel) {
                continue;
            }

            if (fNode.id === tNode.id) {
            //if (fNode.uniqID === tNode.uniqID || fNode.id === tNode.id) {
              continue;
            }

            if (tmpLinePath.indexOf(fNode.id + tNode.id) !== -1) {
                continue;
            }

            tmpLinePath[tmpLinePath.length] = fNode.id + tNode.id;

            if (this.isChangeDisplayRelation === false) {
                this.displayRelationData[this.displayRelationData.length] = relationList[ix];
            }

            if ((fNode.clazz === 'AGENT' || fNode.clazz === 'GROUP') && (tNode.clazz === 'AGENT' || tNode.clazz === 'GROUP')) {
                ptCircle1 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 6, fNode, tNode);
                ptCircle2 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 6, tNode, fNode);
                ptArrow   = this.getPointOnCircle(this.property.outCircle.radius * 2 + 6 + this.property.arrow.w , tNode, fNode);
                ptCircle3 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 3, fNode, tNode);
                ptCircle4 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 3, tNode, fNode);

            } else if (fNode.clazz === 'DB' || tNode.clazz === 'DB') {
                ptCircle1 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 6, fNode, tNode);
                ptCircle2 = this.getPointOnCircle(45, tNode, fNode);
                ptArrow   = this.getPointOnCircle(45 + this.property.arrow.w , tNode, fNode);
                ptCircle3 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 6, fNode, tNode);
                ptCircle4 = this.getPointOnCircle(42, tNode, fNode);

            } else if (fNode.clazz === 'CLOUD' || tNode.clazz === 'CLOUD' || fNode.clazz === 'SERVER' || tNode.clazz === 'SERVER') {
                ptCircle1 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 6, fNode, tNode);
                ptCircle2 = this.getPointOnCircle(45, tNode, fNode);
                ptArrow   = this.getPointOnCircle(45 + this.property.arrow.w , tNode, fNode);
                ptCircle3 = this.getPointOnCircle(this.property.outCircle.radius * 2 + 3, fNode, tNode);
                ptCircle4 = this.getPointOnCircle(42, tNode, fNode);
            }

            if (fNode.status === 3 || tNode.status === 3) {
                status = 3;
            } else if (fNode.status === 2) {
                status = 2;
            } else if (fNode.status === 1) {
                status = 1;
            } else {
                status = 0;
            }

            //remoteType = fNode.remoteType || tNode.remoteType || '';

            this.drawArrow(this.property.arrow, ptArrow, ptCircle2, status);
            this.drawRelationLine(ptCircle1, ptCircle2, ptCircle3, ptCircle4, status,
                                  fNode.id, tNode.id,
                                  remoteType);
        }

        if (this.isChangeDisplayRelation === false) {
            this.isChangeDisplayRelation = true;
        }

        relationList = null;
    },


    /**
     */
    drawTxnLineLayout: function() {
        if (this.nodeList.length > 0) {
            this.lineList.length = 0;
            this.drawRectNodeToRectNode();
        }
        this.nodePathInit();

        this.displayLineCtx.drawImage(this.lineCanvas, 0 , 0);
    },


    /**
     */
    drawLineLayout: function() {
        if (this.nodeList.length > 0) {
            this.lineList.length = 0;
            this.drawNodeToNode();
        }
        this.nodePathInit();

        this.displayLineCtx.drawImage(this.lineCanvas, 0 , 0);
    },


    /**
     */
    addEvents: function() {

        this.dragCanvas.onmousedown = this.Event.mouseDown.bind(this);
        this.dragCanvas.onmouseup   = this.Event.mouseUp.bind(this);
        this.dragCanvas.onmousemove = this.Event.mouseMove.bind(this);

        this.target.addEventListener('resize', function() {
            this.componentHeight = $(this.target).height();
            this.componentWidth = $(this.target).width();

            this.canvas.width = this.componentWidth;
            this.canvas.height = this.componentHeight;

            this.displayCanvas.width = this.componentWidth;
            this.displayCanvas.height = this.componentHeight;

            this.dragCanvas.width = this.componentWidth;
            this.dragCanvas.height = this.componentHeight;

            this.groupCanvas.width = this.componentWidth;
            this.groupCanvas.height = this.componentHeight;

            this.groupChildCanvas.width = this.componentWidth;
            this.groupChildCanvas.height = this.componentHeight;

            this.lineCanvas.width = this.componentWidth;
            this.lineCanvas.height = this.componentHeight;

            this.displayLineCanvas.width = this.componentWidth;
            this.displayLineCanvas.height = this.componentHeight;

            this.lineEffectCanvas.width = this.componentWidth;
            this.lineEffectCanvas.height = this.componentHeight;

            if (this.overCanvas.width !== 0) {
                this.overCanvas.width = this.componentWidth;
                this.overCanvas.height = this.componentHeight;
            }

            this.navigateCanvas.width = this.componentWidth;
            this.navigateCanvas.height = this.componentHeight;

            this.alarmCanvas.width = this.componentWidth;
            this.alarmCanvas.height = this.componentHeight;

            //this.canvasDraw();
            this.refreshData();
        }.bind(this));

        // InputBox Keyevent
        this.groupNameInputBox.addEventListener('blur', function(e) {
            this.clearDragLayout();
            this.isOnFocusNodeName = false;
            this.isCreateMultiGroup = false;
            this.cancelGroupFolder();
            this.textInputMode = this.inputMode.BLANK;
            this.groupNameInputBox.style.display = 'none';
            this.groupNameInputBox.value = '';
        }.bind(this), false);

        this.groupNameInputBox.addEventListener('keydown', function(e) {
            // Esc Key
            if (e.keyCode === 27) {
                this.isCreateMultiGroup = false;

                if (this.mergeTargetNode) {
                    this.mergeTargetNode.isHide = false;
                }

                if (this.mergeAgentList) {
                    for (var jx = 0, jxLen = this.mergeAgentList.length; jx < jxLen; jx++) {
                        this.mergeAgentList[jx].isHide = false;
                    }
                }

                if (this.textInputMode === this.inputMode.GROUP_NAME) {
                    this.cancelGroupFolder();
                    this.clearDragLayout();

                } else if (this.textInputMode === this.inputMode.NODE_NAME) {
                    this.cancelGroupFolder();
                    this.clearDragLayout();
                    this.textInputMode = this.inputMode.BLANK;
                    this.groupNameInputBox.style.display = 'none';
                    this.groupNameInputBox.value = '';
                }

            // Enter Key
            } else if (e.keyCode === 13) {
                if (this.groupNameInputBox && this.groupNameInputBox.value.trim() !== '') {
                    if (this.textInputMode === this.inputMode.GROUP_NAME) {
                        // TODO Check Unique Node Name

                        this.drawFolderClose();
                        this.clearDragLayout();

                    } else if (this.textInputMode === this.inputMode.NODE_NAME) {
                        this.editNameNode.alias = this.groupNameInputBox.value;
                        this.textInputMode = this.inputMode.BLANK;
                        this.groupNameInputBox.style.display = 'none';
                        this.groupNameInputBox.value = '';

                        // 변경된 노드 별칭 저장
                        this.saveCurrentNodeStruct();

                        this.refreshData();
                        this.cancelGroupFolder();
                    }
                }
            }
        }.bind(this), false);
    },


    resize: function(resizeHeight, resizeWidth) {
        if (!this.isInit) {
            return;
        }

        this.componentHeight = $(this.target).height();
        this.componentWidth = $(this.target).width();

        if (this.componentHeight < resizeHeight) {
            this.componentHeight = resizeHeight ;
        }

        if (this.componentWidth < resizeWidth) {
            this.componentWidth = resizeWidth ;
        }

        this.canvas.width = this.componentWidth;
        this.canvas.height = this.componentHeight;

        this.displayCanvas.width = this.componentWidth;
        this.displayCanvas.height = this.componentHeight;

        this.dragCanvas.width = this.componentWidth;
        this.dragCanvas.height = this.componentHeight;

        this.lineCanvas.width = this.componentWidth;
        this.lineCanvas.height = this.componentHeight;

        this.displayLineCanvas.width = this.componentWidth;
        this.displayLineCanvas.height = this.componentHeight;

        this.lineEffectCanvas.width = this.componentWidth;
        this.lineEffectCanvas.height = this.componentHeight;

        if (this.overCanvas.width !== 0) {
            this.overCanvas.width = this.componentWidth;
            this.overCanvas.height = this.componentHeight;
        }

        this.alarmCanvas.width = this.componentWidth;
        this.alarmCanvas.height = this.componentHeight;

        if (!this.isTxnPathMode) {
            this.groupCanvas.width = this.componentWidth;
            this.groupCanvas.height = this.componentHeight;

            this.groupChildCanvas.width = this.componentWidth;
            this.groupChildCanvas.height = this.componentHeight;

            this.navigateCanvas.width = this.componentWidth;
            this.navigateCanvas.height = this.componentHeight;

            this.nodeInfoCanvas.width = this.componentWidth;
            this.nodeInfoCanvas.height = this.componentHeight;

            //this.canvasDraw();
            this.refreshData();
        } else {
            this.canvasTxnPathDraw();
        }
    },


    /**
     */
    reconfigRelationPoint: function(fromNode, toNode) {
        var ix;
        var changePath = [];

        for (ix = 0; ix < this.relationData.length; ix++) {
            if (this.relationData[ix].fN === fromNode.id && toNode.id !== this.relationData[ix].tN) {
                changePath[changePath.length] = {
                    fN  : toNode.id,
                    tN  : this.relationData[ix].tN,
                    key : fromNode.id + '-' + toNode.id,
                    type: this.relationData[ix].type
                };
            }
        }

        for (ix = 0; ix < this.relationData.length; ix++) {
            if (this.relationData[ix].tN === fromNode.id && this.relationData[ix].fN !== toNode.id) {
                changePath[changePath.length] = {
                    fN  : this.relationData[ix].fN,
                    tN  : toNode.id,
                    key : fromNode.id + '-' + toNode.id,
                    type: this.relationData[ix].type
                };
            }
        }

        if (changePath.length > 0) {
            this.relationData = this.relationData.concat(changePath);
        }

        this.isChangeDisplayRelation = false;

        fromNode = null;
        toNode = null;
    },


    /**
     */
    copyRelationPoint: function(toNode, fromNode) {
        var ix;
        var addPath = [];
        for (ix = 0; ix < this.relationData.length; ix++) {
            if (this.relationData[ix].fN === fromNode.id && toNode.id !== this.relationData[ix].tN) {
                addPath[addPath.length] = {
                    fN  : toNode.id,
                    tN  : this.relationData[ix].tN,
                    key : fromNode.id + '-' + toNode.id,
                    type: this.relationData[ix].type
                };
            }
        }

        for (ix = 0; ix < this.relationData.length; ix++) {
            if (this.relationData[ix].tN === fromNode.id && this.relationData[ix].fN !== toNode.id) {
                addPath[addPath.length] = {
                    fN  : this.relationData[ix].fN,
                    tN  : toNode.id,
                    key : fromNode.id + '-' + toNode.id,
                    type: this.relationData[ix].type
                };
            }
        }

        if (addPath.length <= 0) {
            return;
        }

        this.relationData = this.relationData.concat(addPath);

        this.isChangeDisplayRelation = false;
    },


    /**
     */
    copyTempRelationPoint: function(toNode, fromNode) {
        var ix;
        var tempRelationPath = [];
        for (ix = 0; ix < this.relationData.length; ix++) {
            if (this.relationData[ix].fN === fromNode.id) {
                tempRelationPath[tempRelationPath.length] = {
                    fN  : toNode.id,
                    tN  : this.relationData[ix].tN,
                    type: this.relationData[ix].type
                };
            }
        }

        for (ix = 0; ix < this.relationData.length; ix++) {
            if (this.relationData[ix].tN === fromNode.id) {
                tempRelationPath[tempRelationPath.length] = {
                    fN  : this.relationData[ix].fN,
                    tN  : toNode.id,
                    type: this.relationData[ix].type
                };
            }
        }
        return tempRelationPath
    },


    /**
     * Save Current Topology Node Struct.
     *
     * @param {boolean} isSave
     */
    saveCurrentNodeStruct: function(isSave) {
        if (!isSave && !this.isAutoSave) {
            return;
        }

        var nodePositon = {};
        var saveNodeList = Ext.clone(this.nodeList);

        for (var ix = 0, ixLen = saveNodeList.length; ix < ixLen; ix++) {
            nodePositon[saveNodeList[ix].id] = {
                x: saveNodeList[ix].x,
                y: saveNodeList[ix].y
            };

            if (saveNodeList[ix].addr) {
                saveNodeList[ix].addr.length = 0;
            }
        }

        common.WebEnv.Save('topologyNodeList', JSON.stringify(saveNodeList));
        common.WebEnv.Save('topologyNodePosition', JSON.stringify(nodePositon));
        common.WebEnv.Save('topologyNodeRelation', JSON.stringify(this.relationData));
    },


    /**
     * 노드 정보 생성 및 설정
     *
     * @param {number} id           - 서버 ID
     * @param {string} methodType   - 메소드 타입 (TP, DB, HTTP, TCP 등)
     * @param {number | null} depth - 노드 단계 (현재 미사용)
     * @param {string} addr         - 주소
     * @param {number} type         - 타입 (80 = P, 67 = C)
     * @param {number} destCount    - dest 개수
     */
    setNode: function(id, methodType, depth, addr, type, destCount) {
        var node, nodeName;
        var isContain = false;

        node = this.nodeMap['WAS-' + id];

        if (node) {
            if (+node.depth < depth) {
                node.depth = depth;
            }

            if (node.destCount < destCount) {
                node.destCount = destCount;
            }

            if (node.addr.indexOf(+addr) === -1) {
                node.addr[node.addr.length] = +addr;
            }

            if (methodType === 'HTTP' || methodType === 'TCP' || methodType === 'TP') {
                node.isGoCloud = (type === 80);
            } else {
                node.isGoCloud = false;
            }

            if (node.isGoCloud && methodType === 'TP') {
                node.isGoTPServer = true;
            } else {
                node.isGoTPServer = false;
            }

            if (node.remoteType === '' && methodType !== 'DB') {
                node.remoteType = methodType;
            } else if (methodType !== '' && node.remoteType !== methodType) {
                node.remoteType = (methodType === 'DB')? 'JDBC' : methodType;
            }

            isContain = true;
        }

        // 기존에 Comm.wasIdArr에 포함되는지만 체크하던 것을 필터된 서버가 있는 경우 해당 서버만 표시가 되도록
        // 조건을 변경함.
        if (!isContain && this.isDisplayServer(id)) {
            nodeName = this.getNodeNameById(id) || id + '';
            node = new this.nodeClass.node('AGENT', 'WAS-' + id, nodeName, '', 50, 50, false, (methodType === 'DB')? '' : methodType, id);
            node.depth = depth;
            node.destCount = destCount;

            if (methodType === 'HTTP' || methodType === 'TCP' || methodType === 'TP') {
                node.isGoCloud = (type === 80);
            } else {
                node.isGoCloud = false;
            }

            if (node.isGoCloud && methodType === 'TP') {
                node.isGoTPServer = true;
            } else {
                node.isGoTPServer = false;
            }

            if (!node.addr) {
                node.addr = [];
            }

            if (node.addr.indexOf(+addr) === -1) {
                node.addr[node.addr.length] = +addr;
            }

            node.remoteCount = {};
            node.remoteCount.lastTime = {};
            node.activeDest = {};
            node.activeDest.lastTime = {};
            node.listIndex = this.nodeList.length;

            this.nodeList[this.nodeList.length] = node;
            this.nodeMap[node.id] = node;
        }

        // Check Node Database
        node = null;
        isContain = false;

        // WAS와 연결된 웹 서버 정보가 있는 경우 설정
        if (methodType === 'WEB') {

            node = this.nodeMap['WEB-' + id];

            if (!node) {
                var webInfo = Comm.webServersInfo[id];

                if (webInfo) {
                    nodeName = webInfo.name || id + '';
                    node = new this.nodeClass.node('AGENT', 'WEB-' + id, nodeName, '', 50, 50, false, methodType);
                    node.depth = depth;
                    node.destCount = destCount;
                    node.isGoCloud = false;

                    if (!node.addr) {
                        node.addr = [];
                    }

                    if (node.addr.indexOf(+addr) === -1) {
                        node.addr[node.addr.length] = +addr;
                    }
                    node.remoteCount = {};
                    node.remoteCount.lastTime = {};
                    node.activeDest = {};
                    node.activeDest.lastTime = {};
                    node.listIndex = this.nodeList.length;
                }

                this.nodeList[this.nodeList.length] = node;
                this.nodeMap[node.id] = node;
            }
        }

        // DB 정보 설정
        if (methodType === 'DB') {

            var dbInfo = this.getDBInfoByHashCode(addr);

            if (!dbInfo) {
                return;
            }

            node = this.nodeMap['DB-' + dbInfo.id];

            if (node) {
                if (+node.depth < depth) {
                    node.depth = depth;
                }

                if (node.destCount < destCount) {
                    node.destCount = destCount;
                }

                if (node.addr.indexOf(+addr) === -1) {
                    node.addr[node.addr.length] = +addr;
                }

                node.isGoCloud = false;

                isContain = true;
            }

            if (!isContain) {
                dbInfo = this.getDBInfoByHashCode(addr);

                // 기존에 Comm.wasIdArr에 포함되는지만 체크하던 것을 필터된 서버가 있는 경우 해당 서버만 표시가 되도록
                // 조건을 변경함.
                if (!dbInfo || (!this.isDisplayServer(id) && !Comm.dbInfoObj[dbInfo.id])) {
                    return;
                }
                node = new this.nodeClass.node('DB', 'DB-' + dbInfo.id, dbInfo.name, dbInfo.type, 50, 50, false, 'JDBC');
                node.depth = depth;
                node.destCount = destCount;
                node.isGoCloud = false;

                if (!node.addr) {
                    node.addr = [];
                }

                if (node.addr.indexOf(+addr) === -1) {
                    node.addr[node.addr.length] = +addr;
                }
                node.remoteCount = {};
                node.remoteCount.lastTime = {};
                node.activeDest = {};
                node.activeDest.lastTime = {};
                node.listIndex = this.nodeList.length;

                this.nodeList[this.nodeList.length] = node;
                this.nodeMap[node.id] = node;
            }
        }

    },


    /**
     * 실시간 트랜잭션 패스화면의 노드 정보 설정
     */
    setRectNode: function(id, methodType, depth, addr, type, tid, txnName, elapseTime, instance, sqlId, bindList, dest) {
        var ix, ixLen;
        var node;
        var isContain = false;
        var nodeName;

        for (ix = 0, ixLen = this.nodeList.length; ix < ixLen; ix++ ) {
            node = this.nodeList[ix];

            if (+node.depth < depth) {
                node.depth = depth;
            }

            isContain = true;
            break;
        }

        if (!isContain) {
            this.rectPx = 100 + (depth * 140) ;
            this.rectPy = (this.rectPy || 0) + 90;

            nodeName = this.getNodeNameById(id) || id + '';

            node = new this.nodeClass.node(
                'AGENT',
                'WAS-' + id + '-'+txnName,
                nodeName,
                '',
                this.rectPx,
                this.rectPy,
                false,
                methodType
            );
            node.depth      = depth;
            node.tid        = tid;
            node.txnName    = txnName;
            node.elapseTime = elapseTime;
            node.isGoCloud  = false;
            node.sqlId      = sqlId;
            node.bindList   = bindList;
            node.isTxnPathMode = this.isTxnPathMode;

            // 실시간 트랜잭션 패스 화면에 노드 위치 저장
            //if (Comm.web_env_info.topologyTxnNodePosition) {
            //    var nodePot = JSON.parse(Comm.web_env_info.topologyTxnNodePosition);
            //    if (nodePot[node.id]) {
            //        node.x = nodePot[node.id].x || 0;
            //        node.y = nodePot[node.id].y || 0;
            //    }
            //}

            if (!node.addr) {
                node.addr = [];
            }

            for (ix = 0, ixLen = this.nodeList.length; ix < ixLen; ix++ ) {
                if (this.nodeList[ix].x < node.x && this.nodeList[ix].x + this.property.rect.width > node.x &&
                    this.nodeList[ix].y < node.y && this.nodeList[ix].y + this.property.rect.height >= node.y) {
                    node.x += this.property.rect.width;
                    node.y += this.property.rect.height
                }
            }

            node.remoteCount          = {};
            node.remoteCount.lastTime = {};
            node.activeDest           = {};
            node.activeDest.lastTime  = {};
            this.nodeList[this.nodeList.length] = node;
            this.nodeMap[node.id] = node;
        }


        // Check Node Database
        node = null;
        isContain = false;

        if (instance) {
            for (ix = 0, ixLen = this.nodeList.length; ix < ixLen; ix++ ) {
                node = this.nodeList[ix];

                var dbInfo = this.getDBInfoByHashCode(addr);
                if (dbInfo && node.id === 'DB-' + dbInfo.id) {
                    if (+node.depth < depth) {
                        node.depth = depth;
                    }

                    if (node.destCount < destCount) {
                        node.destCount = destCount;
                    }

                    if (node.addr.indexOf(addr) === -1) {
                        node.addr[node.addr.length] = +addr;
                    }

                    if (methodType === 'HTTP' || methodType === 'TCP' || methodType === 'TP') {
                        node.isGoCloud = (type === 80);
                    } else {
                        node.isGoCloud = false;
                    }

                    isContain = true;
                    break;
                }
            }

            if (!isContain) {
                dbInfo = this.getDBInfoByHashCode(addr);
                if (!dbInfo) {
                    return;
                }
                node = new this.nodeClass.node('DB', 'DB-' + dbInfo.id, dbInfo.name, dbInfo.type, 50, 50, false, 'JDBC');
                node.depth = depth;
                node.destCount = destCount;

                if (methodType === 'HTTP' || methodType === 'TCP' || methodType === 'TP') {
                    node.isGoCloud = (type === 80);
                } else {
                    node.isGoCloud = false;
                }

                if (!node.addr) {
                    node.addr = [];
                }

                node.remoteCount = {};
                node.remoteCount.lastTime = {};
                node.activeDest = {};
                node.activeDest.lastTime = {};

                this.nodeList[this.nodeList.length] = node;
                this.nodeMap[node.id] = node;
            }
        }

    },


    /**
     */
    getWordWrap: function(ctx, text) {
        var maxWidth = 150;
        var textLines =  [];
        var ix, jx;
        var result;

        while (text.length) {
            for (ix = text.length; ctx.measureText(text.substr(0,ix)).width > maxWidth; ix-- );

            result = text.substr(0, ix);

            if (ix !== text.length) {
                for (jx = 0; result.indexOf(" ", jx) !== -1; jx = result.indexOf(" ", jx) + 1);
            }

            textLines[textLines.length] = result.substr(0, jx || result.length);
            text  = text.substr(textLines[textLines.length - 1].length, text.length);
        }
        return textLines;
    },


    getGroupStatus: function(list) {
        var status = 0;

        for (var ix = 0; ix < list.length; ix++) {
            if (+status < +list[ix].status) {
                status = +list[ix].status;
            }
        }
        return status;
    },


    /**
     */
    copyNodePosition: function(toNode, fromNode) {
        fromNode.x = toNode.x;
        fromNode.y = toNode.y;
    },


    /**
     */
    getDisplayNodeCount: function(nodeCount) {
        var count;
        if (nodeCount > 15) {
            count = 4;
        } else if (nodeCount > 10) {
            count = 3;
        } else if (nodeCount > 8) {
            count = 2;
        } else {
            count = 1;
        }
        return count;
    },


    /**
     * Get Group Circle radius.
     *
     * @param {number} nodeCount - node count
     * @param {number} radius - before change radius
     * @return {number} after change radius
     */
    getGroupCircleRadius: function(nodeCount, radius) {
        if (nodeCount > 70) {
            return radius * 2.8;
        } else if (nodeCount > 23) {
            return radius * 2.0;
        } else if (nodeCount > 8) {
            return radius * 1.6;
        } else {
            return radius;
        }
    },


    /**
     */
    getRadiusGradient: function(radius, x1, y1, x2, y2) {
        var gradient = this.groupCtx.createRadialGradient(x1, y1, radius - 6, x2, y2, radius + 10);
        gradient.addColorStop(0, '#83C628');
        gradient.addColorStop(1, '#65B40D');
        return gradient;
    },


    /**
     */
    getPointOnCircle: function(radius, originPt, endPt) {
        var angleInDegrees = this.getAngleBetweenPoints(originPt, endPt);

        // Convert from degrees to radians via multiplication by PI/180
        var x = radius * Math.cos(angleInDegrees * Math.PI / 180) + originPt.x;
        var y = radius * Math.sin(angleInDegrees * Math.PI / 180) + originPt.y;

        return { x: x, y: y };
    },


    /**
     * 두개 지점사이의 각도를 구하기.
     *
     * @param {object} originPt - From Point
     * @param {object} endPt - To Point
     * @return {number} angle
     */
    getAngleBetweenPoints: function(originPt, endPt) {
        var interPt = {
            x: endPt.x - originPt.x,
            y: endPt.y - originPt.y
        };

        return Math.atan2(interPt.y, interPt.x) * 180 / Math.PI;
    },


    /**
     * Get Mouse point.
     *
     * @param {event object} e
     * @return {object} mouse point {x: x1, y: y1}
     */
    getPointOnMouse: function(e) {
        var element = this.displayCanvas;
        var rect = element.getBoundingClientRect(), // abs. size of element
            scaleX = element.width / rect.width,    // relationship bitmap vs. element for X
            scaleY = element.height / rect.height;  // relationship bitmap vs. element for Y

        return {
            x: (e.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
            y: (e.clientY - rect.top) * scaleY     // been adjusted to be relative to element
        }
    },


    fittingString: function(c, str, maxWidth) {
        var width = c.measureText(str).width;
        var ellipsis = '..';
        var ellipsisWidth = c.measureText(ellipsis).width;

        if (width <= maxWidth || width <= ellipsisWidth) {
            return str;
        } else {
            var len = str.length;
            while (width >= maxWidth - ellipsisWidth && len-- > 0) {
                str = str.substring(0, len);
                width = c.measureText(str).width;
            }
            return str + ellipsis;
        }
    },


    /**
     */
    getHexToRgb: function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var r = parseInt(result[1], 16);
        var g = parseInt(result[2], 16);
        var b = parseInt(result[3], 16);

        return r + ',' + g + ',' + b;
    },


    /**
     * 그룹 뷰 레이어 인덱스에 해당하는 그룹 캔버스의 컨텍스트를 반환
     *
     * @param {number} groupLayerIdx - 그룹 레이어 인덱스
     * @return {object} context
     */
    getGroupContext: function(groupLayerIdx) {
        var groupContext;

        if (this.groupCanvasList.length < groupLayerIdx) {
            this.checkGroupCanvas(groupLayerIdx);
        }
        groupContext = this.groupContextList[groupLayerIdx - 1];

        return groupContext;
    },


    /**
     * 그룹 뷰 레이어 인덱스에 해당하는 하위 그룹 캔버스의 컨텍스트를 반환
     *
     * @param {number} groupLayerIdx - 그룹 레이어 인덱스
     * @return {object} context
     */
    getGroupChildContext: function(groupLayerIdx) {
        var groupChildContext;

        if (this.groupChildCtxtList.length < groupLayerIdx) {
            this.checkGroupCanvas(groupLayerIdx);
        }
        groupChildContext = this.groupChildCtxtList[groupLayerIdx - 1];

        return groupChildContext;
    },


    /**
     * 그룹 레이어 인덱스에 해당하는 캔버스가 있는지 체크.
     * 인덱스에 해당하는 캔버스가 없는 경우 캔버스를 생성하여 캔버스 목록에 추가한다.
     *
     * @param {number} index - 그룹 레이어 인덱스
     */
    checkGroupCanvas: function(index) {
        if (this.groupCanvasList.length >= index) {
            return;
        }

        var groupCanvas = document.createElement('canvas');
        var childCanvas = document.createElement('canvas');

        groupCanvas.className = 'topology-group-canvas group-index-' + index;
        childCanvas.className = 'topology-groupchild-canvas group-index-' + index;

        this.target.appendChild(groupCanvas);
        this.target.appendChild(childCanvas);

        groupCanvas.style.zIndex = 8 + (index - 1) * 3;
        childCanvas.style.zIndex = 9 + (index - 1) * 3;

        groupCanvas.width      = this.componentWidth;
        groupCanvas.height     = this.componentHeight;
        groupCanvas.style.top  = '0px';
        groupCanvas.style.left = '0px';
        groupCanvas.style.position = 'absolute';

        childCanvas.width      = this.componentWidth;
        childCanvas.height     = this.componentHeight;
        childCanvas.style.top  = '0px';
        childCanvas.style.left = '0px';
        childCanvas.style.position = 'absolute';

        this.groupCanvasList[this.groupCanvasList.length] = groupCanvas;
        this.childCanvasList[this.childCanvasList.length] = childCanvas;

        this.groupContextList[this.groupContextList.length]     = groupCanvas.getContext('2d');
        this.groupChildCtxtList[this.groupChildCtxtList.length] = childCanvas.getContext('2d');
    },


    /**
     * 겹친 Node가 있는지 체크해서 있다면 해당 Node정보를 반환
     *
     * @param {string} id - node id
     * @param {number} mx - x position
     * @param {number} my - y position
     * @return {object}
     */
    checkCrossNode: function(id, mx, my) {
        var ix, ixLen;
        var nodeObj;

        for (ix = 0, ixLen = this.nodeList.length; ix < ixLen; ix++ ) {
        //for (ix = 0, ixLen = this.displayNodeList.length; ix < ixLen; ix++ ) {
            nodeObj = this.nodeList[ix];
            //nodeObj = this.displayNodeList[ix];

            if (this.displayNodeLevel !== +nodeObj.level) {
                continue;
            }

            if (nodeObj.clazz === 'AGENT' || nodeObj.clazz === 'GROUP') {
                if (nodeObj.id !== id &&
                    mx < nodeObj.x + 80 + this.canvas.offsetLeft && mx > nodeObj.x - 80 - this.canvas.offsetLeft &&
                    my < nodeObj.y + 80 + this.canvas.offsetTop  && my > nodeObj.y - 80 - this.canvas.offsetTop) {
                    return nodeObj;
                }
            } else if (nodeObj.clazz === 'CLOUD' || nodeObj.clazz === 'SERVER') {
                if (nodeObj.id !== id && mx < nodeObj.x + 90 + this.canvas.offsetLeft && mx > nodeObj.x - 0 - this.canvas.offsetLeft &&
                    my < nodeObj.y + 58 + this.canvas.offsetTop  && my > nodeObj.y - 0 - this.canvas.offsetTop) {
                    return nodeObj;
                }
            } else if (nodeObj.clazz === 'DB') {
                if (nodeObj.id !== id &&
                    mx < nodeObj.x + 45 + this.canvas.offsetLeft && mx > nodeObj.x - 45 - this.canvas.offsetLeft &&
                    my < nodeObj.y + 35 + this.canvas.offsetTop  && my > nodeObj.y - 35 - this.canvas.offsetTop) {
                    return nodeObj;
                }
            }
        }
        return null;
    },


    /**
     * 노드 ID가 그룹 노드의 ID인지 확인
     *
     * @param {string} nodeId
     * @return {boolena} true: 그룹 노드 ID, false: 다른 노드 ID
     */
    isGroupNodeByNodeId: function(nodeId) {
        return (nodeId && nodeId.indexOf('GROUP-') === 0);
    },


    /**
     * Node Group.
     */
    checkMergeNode: function(node) {
        if (!node) {
            return;
        }
        var x = node.x;
        var y = node.y;
        var id =node.id;
        var nodeObj;

        this.mergeTargetNode = null;

        for (var ix = 0, ixLen = this.nodeList.length; ix < ixLen; ix++ ) {
        //for (var ix = 0, ixLen = this.displayNodeList.length; ix < ixLen; ix++ ) {
            nodeObj = this.nodeList[ix];
            //nodeObj = this.displayNodeList[ix];

            if (this.displayNodeLevel !== +nodeObj.level) {
                continue;
            }

            if (nodeObj.id !== id) {
                if (x < nodeObj.x + 70 + this.canvas.offsetLeft && x > nodeObj.x - 70 - this.canvas.offsetLeft &&
                    y < nodeObj.y + 70 + this.canvas.offsetTop  && y > nodeObj.y - 70 - this.canvas.offsetTop) {

                    node.x = nodeObj.x;
                    node.y = nodeObj.y;

                    if (node.isGroupMode) {
                        this.isCheckCreateGroup = true;
                        this.folderViewPt = {x: x + 58, y: y - 70};

                        this.mergeTargetNode = nodeObj;

                        this.mergeAgentList = [node];
                        nodeObj.isHide = true;
                        node.isHide = true;

                        this.drawFolderOpen(this.drawGroupInput.bind(this, nodeObj.x, nodeObj.y));

                    } else if (nodeObj.isGroupMode) {
                        if (nodeObj.clazz === 'AGENT') {
                            this.addAgentToGroup(node, nodeObj);
                        } else {
                            this.addNodeToGroup(node, nodeObj);
                        }

                    } else {
                        this.isCheckCreateGroup = true;
                        this.folderViewPt = {x: x + 58, y: y - 70};

                        this.mergeTargetNode = nodeObj;

                        this.mergeAgentList = [node];
                        nodeObj.isHide = true;
                        node.isHide = true;

                        var marginY = 0;
                        if (this.mergeTargetNode.clazz && this.mergeTargetNode.clazz !== 'AGENT') {
                            marginY = 33;
                        }
                        this.drawFolderOpen(this.drawGroupInput.bind(this, nodeObj.x, nodeObj.y + marginY));
                    }

                    break;
                }
            }
        }
    },


    /**
     * Check draw animate effect
     *
     * @param {string} fid - From Node ID
     * @param {string} tid - To Node ID
     * @return {boolean}
     */
    isDrawAnimateLine: function(fid, tid) {
        var ix, ixLen;
        var fNodeId, tNodeId;
        var isContain = false;

        for (ix = 0, ixLen = this.remoteWasList.length; ix < ixLen; ix++) {
            fNodeId = this.remoteWasList[ix][0];
            tNodeId = this.remoteWasList[ix][1];

            if (fNodeId === fid && tNodeId === tid) {
                isContain = true;
                break;
            }
        }
        return !isContain;
    },


    /**
     * @param {string} id - node id
     * @param {string} addr - dest
     * @return {boolean}
     */
//    isDrawAnimateLine: function(id, addr) {
//        var ix, ixLen;
//        var dest, nodeId;
//        var isContain = false;
//
//        for (ix = 0, ixLen = this.remoteWasList.length; ix < ixLen; ix++) {
//            nodeId = this.remoteWasList[ix][0];
//            dest = this.remoteWasList[ix][1];
//
//            if (nodeId === id && dest === addr) {
//                isContain = true;
//                break;
//            }
//        }
//        return !isContain;
//    },


    /**
     * Show Current Alarm List of Selected Agent
     *
     * @param {object} node - mouse over node
     */
    showAlarmTooltip: function(node) {

        var currentAlarmList = this.getCurrentAlarmByNode(node);

        var ix, ixLen;
        var posY;
        var alarmObj;
        var alarmLevelTxt;
        var alarmCount = 0;
        var alarmValue;

        if (!currentAlarmList || currentAlarmList.length <= 0 || node.status === 0) {
            return;
        }

        var px = node.x + 20;
        var py = node.y + 10;

        if (px + this.property.alarmTipRect.width > this.lineEffectCanvas.width) {
            px = px - (px + this.property.alarmTipRect.width - this.lineEffectCanvas.width);
        }

        var grd = this.dragCtx.createLinearGradient(px, py ,px, py + 70);
        grd.addColorStop(0.3, 'rgba('+this.getHexToRgb('#212227') +','+ 0.5 + ')');
        grd.addColorStop(1, 'rgba('+this.getHexToRgb('#212227') +','+ 0.7 + ')');

        this.dragCtx.fillStyle = grd;
        this.dragCtx.shadowColor = '#000000';
        this.dragCtx.shadowBlur = 5;
        this.dragCtx.shadowOffsetX = 3;
        this.dragCtx.shadowOffsetY = 3;

        for (ix = 0, ixLen = currentAlarmList.length; ix < ixLen; ix++) {
            alarmObj = currentAlarmList[ix];

            if (+alarmObj.alarmLevel !== 0) {
                alarmCount++
            }
        }

        var toolTipHeight = this.property.alarmTipRect.height;
        if (alarmCount * 22 > toolTipHeight) {
            toolTipHeight = alarmCount * 22;
        }

        this.roundRect(
            this.dragCtx, px, py,
            this.property.alarmTipRect.width,
            toolTipHeight,
            this.property.alarmTipRect.radius,
            true,
            false
        );

        this.dragCtx.shadowColor= 'transparent';
        this.dragCtx.shadowBlur = 0;

        this.dragCtx.fillStyle = '#FFFFFF';
        this.dragCtx.font      = 'normal 11px "Droid Sans"';
        this.dragCtx.textAlign = 'left';

        this.dragCtx.strokeStyle = '#264403';
        this.dragCtx.lineWidth = this.property.alarmTipRect.lineWidth;

        alarmCount = 0;

        for (ix = 0, ixLen = currentAlarmList.length; ix < ixLen; ix++) {
            alarmObj = currentAlarmList[ix];

            if (+alarmObj.alarmLevel === 0) {
                continue;
            }

            posY = node.y + 25 + (alarmCount++ * 19);

            this.dragCtx.fillStyle = '#FFFFFF';
            this.dragCtx.textAlign = 'left';

            // Agent Name
            this.dragCtx.fillText(
                this.fittingString(this.dragCtx, alarmObj.name, 50),
                px + 10,
                posY
            );

            // Alarm Name
            this.dragCtx.fillText(
                this.fittingString(this.dragCtx, alarmObj.alarmName, 100),
                px + 60,
                posY
            );

            // Alarm Value
            alarmValue = alarmObj.alarmValue;
            if (alarmObj.alarmName === 'Elapsed Time') {
                alarmValue = alarmValue / 1000;
            }

            this.dragCtx.fillText(
                this.fittingString(this.dragCtx, alarmValue || '', 70),
                px + 160,
                posY
            );

            // Set Level Text By Alarm Level
            this.dragCtx.textAlign = 'center';

            if (+alarmObj.alarmLevel === 2) {
                alarmLevelTxt = 'CRITICAL';
                this.dragCtx.fillStyle = this.property.alarmTipRect.fontColor.critical;

            } else if (+alarmObj.alarmLevel === 1) {
                alarmLevelTxt = 'WARNING';
                this.dragCtx.fillStyle = this.property.alarmTipRect.fontColor.warning;
            }

            // Alarm Level
            this.dragCtx.fillText(
                alarmLevelTxt,
                px + 240,
                posY
            );

            // Draw Line
            this.dragCtx.beginPath();
            this.dragCtx.moveTo(px, py + 22);
            this.dragCtx.lineTo(px + this.property.alarmTipRect.width - 10, py + 22);
            this.dragCtx.stroke();
        }

        this.dragCtx.shadowBlur = 0;
        this.dragCtx.shadowOffsetX = 0;
        this.dragCtx.shadowOffsetY = 0;

        currentAlarmList = null;
        alarmObj = null;
    },


    /**
     * Get Current Alarm List
     *
     * @param {object} nodeObj - selected node
     */
    getCurrentAlarmByNode: function(nodeObj) {

        if (!Repository.alarmListInfo) {
            return;
        }

        var childNode;
        var ix, ixLen, jx, jxLen;
        var serverId, serverName;
        var alarmList = [];
        var logList;

        if (nodeObj.isGroupMode) {
            for (ix = 0, ixLen = nodeObj.childList.length; ix < ixLen; ix++) {
                childNode = nodeObj.childList[ix];
                serverId = this.getServerIdByNodeId(childNode.id);

                if (childNode.clazz === 'DB' &&
                    Repository.alarmListInfo.DB &&
                    Repository.alarmListInfo.DB[serverId]) {

                    logList = Repository.alarmListInfo.DB[serverId].concat();
                    serverName = Comm.RTComm.getDBNameById(serverId);

                    for (jx = 0, jxLen = logList.length; jx < jxLen; jx++) {
                        alarmList[alarmList.length] = {
                            id        : serverId,
                            name      : serverName || childNode.name,
                            alarmName : logList[jx].name,
                            alarmLevel: logList[jx].level,
                            alarmValue: logList[jx].value
                        };
                    }

                // 기존에 Comm.wasIdArr에 포함되는지만 체크하던 것을 필터된 서버가 있는 경우 해당 서버만 표시가 되도록
                // 조건을 변경함.
                } else if (this.isDisplayServer(serverId) &&
                    Repository.alarmListInfo.WAS && 
                    Repository.alarmListInfo.WAS[serverId]) {

                    logList = Repository.alarmListInfo.WAS[serverId].concat();
                    serverName = Comm.RTComm.getWASNamebyId(serverId);

                    for (jx = 0, jxLen = logList.length; jx < jxLen; jx++) {
                        alarmList[alarmList.length] = {
                            id        : serverId,
                            name      : serverName,
                            alarmName : logList[jx].name,
                            alarmLevel: logList[jx].level,
                            alarmValue: logList[jx].value
                        };
                    }
                }
            }
        } else {
            serverId = this.getServerIdByNodeId(nodeObj.id);

            if (nodeObj.clazz === 'DB' &&
                Repository.alarmListInfo.DB &&
                Repository.alarmListInfo.DB[serverId]) {

                logList = Repository.alarmListInfo.DB[serverId].concat();
                serverName = Comm.RTComm.getDBNameById(serverId);

                for (jx = 0, jxLen = logList.length; jx < jxLen; jx++) {
                    alarmList[alarmList.length] = {
                        id        : serverId,
                        name      : serverName || nodeObj.name,
                        alarmName : logList[jx].name,
                        alarmLevel: logList[jx].level,
                        alarmValue: logList[jx].value
                    };
                }

            // 기존에 Comm.wasIdArr에 포함되는지만 체크하던 것을 필터된 서버가 있는 경우 해당 서버만 표시가 되도록
            // 조건을 변경함.
            } else if (this.isDisplayServer(serverId) &&
                Repository.alarmListInfo.WAS && 
                Repository.alarmListInfo.WAS[serverId]) {

                logList = Repository.alarmListInfo.WAS[serverId].concat();
                serverName = Comm.RTComm.getWASNamebyId(serverId);

                for (jx = 0, jxLen = logList.length; jx < jxLen; jx++) {
                    alarmList[alarmList.length] = {
                        id        : serverId,
                        name      : serverName,
                        alarmName : logList[jx].name,
                        alarmLevel: logList[jx].level,
                        alarmValue: logList[jx].value
                    };
                }

            }
        }
        return alarmList;
    },


    setDisplayAlarmList: function() {
    },


    /**
     * Image point(x, y) & size(width, height)
     */
    getImagePoint: function(type) {
        var point = this.imagePoint[type];
        return point;
    },


    /**
     * 노드 ID에 해당하는 노드 객체 반환
     *
     * @param {string} id - node ID
     * @return {object} node object
     */
    getNodeById: function(id) {
        return this.nodeMap[id];
    },


    /**
     */
    getTxnNodeById: function(id) {
        var ix = 0,
            ixLen = this.nodeList.length;
        var lineKeys, lineKeyId;

        for (; ix < ixLen; ix++) {
            lineKeys = this.nodeList[ix].id.split('-');
            lineKeyId = lineKeys[1] + '-' + lineKeys[2];

            if (lineKeyId === id) {
                return this.nodeList[ix];
            }
        }
        return null;
    },


    /**
     * Dest에 해당하는 Node List를 반환.
     *
     * @param {integer} addr
     * @param {string} nodeId
     * @param {string} serverType - (AGENT, DB, CLOUD, SERVER)
     * @return {array}
     */
    getNodeArrByDest: function(addr, nodeId, serverType) {
        var node;
        var nodeArr = [];

//        var nodeIndex;

//        if (this.nodeListByDest[addr] && this.nodeListByDest[addr].length > 0) {
//            nodeArr = this.nodeListByDest[addr].concat();
//            nodeIndex = nodeArr.indexOf(node.id);
//
//            if (nodeIndex !== -1) {
//                nodeArr.splice(nodeIndex, 1);
//            }
//        }


        for (var ix = 0, ixLen = this.nodeList.length; ix < ixLen; ix++ ) {
            node = this.nodeList[ix];

            if (serverType && serverType !== node.clazz) {
                continue;
            }

            if (node.addr && node.addr.indexOf(+addr) !== -1 && nodeArr.indexOf(node.id) === -1 &&
                nodeId !== node.id) {
                nodeArr[nodeArr.length] = node;
            }
        }
        return nodeArr;
    },


    /**
     * Check relation agent data.
     *
     * @param {string} dbNodeId - DB Node ID ex) DB-19
     * @return {boolean} - true: contain relatoin agent, false: no relation agent
     */
    isRelationNodeByDBID: function(dbNodeId) {
        var ix, ixLen;
        var data;
        var serverId;
        var isContain = false;

        for (ix = 0, ixLen = this.relationData.length; ix < ixLen; ix++) {
            data = this.relationData[ix];

            if (data.fN.indexOf(dbNodeId) === 0 && data.tN.indexOf('WAS-') === 0) {
                serverId = this.getServerIdByNodeId(data.tN);
                isContain = this.isDisplayServer(serverId);

            } else if (data.tN.indexOf(dbNodeId) === 0  && data.fN.indexOf('WAS-') === 0) {
                serverId = this.getServerIdByNodeId(data.fN);
                isContain = this.isDisplayServer(serverId);
            }

            if (isContain) {
                break;
            }
        }
        return isContain;
    },


    /**
     */
    getChildNodeById: function(parentNode, id) {
        var ix = 0,
            ixLen = parentNode.childList.length;

        for (; ix < ixLen; ix++) {
            if (parentNode.childList[ix].id === id) {
                return parentNode.childList[ix];
            }
        }
        return null;
    },


    /**
     * 그룹 노드와 그룹 노드에 포함되어 있던 하위 노드와의 연결 정보를 삭제.
     * 그룹노드가 삭제되면서 해당 그룹노드 정보와 관련된 연결 정보를 삭제한다.
     *
     * @param {string} childNodeId
     * @param {string} parentNodeId
     */
    deleteRelationData: function(childNodeId, parentNodeId) {
        var ix, ixLen;
        var joinData;

        for (ix = 0, ixLen = this.relationData.length; ix < ixLen;) {
            joinData = this.relationData[ix];

            if (joinData.key === childNodeId  + '-' + parentNodeId ||
                joinData.key === parentNodeId + '-' + childNodeId) {

                this.relationData.splice(ix, 1);
                ix--;
                ixLen--;
            }
            ix++;
        }

        childNodeId  = null;
        parentNodeId = null;

        // 노드간에 연결 정보가 변경되었는지 알 수 있는 구분 값.
        this.isChangeDisplayRelation = false;
    },


    /**
     * 노드간에 연결관계 설정
     *
     * @param {string} fromId     - 시작 노드 ID
     * @param {string} toId       - 끝 노드 ID
     * @param {string} methodType - 연결 타입
     */
    setRelationData: function(fromId, toId, methodType) {
        var ix, ixLen;
        var joinData;
        var isContain = false;

        for (ix = 0, ixLen = this.relationData.length; ix < ixLen; ix++) {
            joinData = this.relationData[ix];

            if (joinData.fN === fromId && joinData.tN === toId) {
                isContain = true;

                if (!joinData.type) {
                    joinData.type = methodType;
                }

                break;
            }
        }

        if (!isContain) {
            this.relationData[this.relationData.length] = {fN: fromId, tN: toId, type: methodType};
        }
    },


    resortNodeByDepth: function() {
        var ix, ixLen;
        var nodeObj;
        var nodePt;
        var startPosX = 100;
        var startPosY = 100;

        for (ix = 0, ixLen = this.nodeList.length; ix < ixLen; ix++ ) {
            nodeObj =  this.nodeList[ix];

            if (nodeObj.isSetPos) {
                continue;
            }
            nodeObj.isSetPos = true;
            nodePt = this.getSaveNodePosition(nodeObj.id);

            if (nodePt && nodePt.x !== 0) {
                nodeObj.x = nodePt.x;
                nodeObj.y = nodePt.y;
            } else {
                nodeObj.x = startPosX;
                nodeObj.y = startPosY;
                startPosX += 150;

                if (startPosX > this.canvas.width) {
                    startPosY += 100;
                    startPosX = 100;
                }
            }
        }
    },


    resortNodeByDepth_bak: function(maxDepth) {
        var ix, ixLen, jx, jxLen;
        var nodeObj;
        var sortList = [];
        var nodePt;

        for (ix = 0; ix < maxDepth; ix++ ) {
            sortList[ix] = []
        }

        for (ix = 0, ixLen = this.nodeList.length; ix < ixLen; ix++ ) {
            nodeObj = this.nodeList[ix];

            if (!sortList[+nodeObj.depth]) {
                sortList[+nodeObj.depth] = [];
            }
            sortList[+nodeObj.depth].push(nodeObj);
        }

        this.nodeList = [];

        var posStepX = 0;
        var posStepY;

        for (ix = 0, ixLen = sortList.length; ix < ixLen; ix++ ) {
            if (sortList[ix] !== undefined && sortList[ix] !== null) {
                posStepY = this.canvas.height / (sortList[ix].length + 1);
                posStepX = posStepX + 150;

                for (jx = 0, jxLen = sortList[ix].length; jx < jxLen; jx++ ) {
                    if (sortList[ix][jx] !== undefined && sortList[ix][jx] !== null) {
                        nodeObj = sortList[ix][jx];
                        nodeObj.y = posStepY * (jx + 0.3);
                        nodeObj.x = posStepX;

                        this.nodeList[this.nodeList.length] = nodeObj;
                    }
                }
            }
        }

        for (ix = 0, ixLen = this.nodeList.length; ix < ixLen; ix++ ) {
            nodeObj =  this.nodeList[ix];
            nodePt = this.getSaveNodePosition(nodeObj.id);

            if (nodePt && nodePt.x !== 0) {
                nodeObj.x = nodePt.x;
                nodeObj.y = nodePt.y;
            }
        }

        sortList = null;
    },


    reconfigNodeTree: function(nodeId) {
        var ix, ixLen;
        var data;

        if (typeof nodeId !== 'number' && !nodeId) {
            return;
        }

//        for (ix = 0, ixLen = this.nodeList.length; ix < ixLen; ix++ ) {
        for (ix = 0, ixLen = this.relationData.length; ix < ixLen; ix++ ) {
            data = this.relationData[ix];

            if (data.fN === nodeId) {

                if (this.subNodeList.indexOf(nodeId) === -1) {
                    this.subNodeList[this.subNodeList.length] = nodeId;
                }

                this.subRelationData[this.subRelationData.length] = [];

                this.reconfigNodeTree(data.tN);
                break;
            }
        }
    },


    /**
     * 노드 상세정보를 보여주는 위치의 기준을 설정
     *
     * 1) isCenterDetailLayout 값이 true 인 경우
     *    화면 의 폭, 높이를 계산하여 상세정보를 가운데 표시.
     * 2) isCenterDetailLayout 값이 false 인 경우
     *    노드가 위치한 곳을 기준으로 표시
     *
     * @param {number} x - node x position
     * @param {number} y - node y position
     */
    getDetailNodePos: function(x, y) {
        if (this.isCenterDetailLayout) {
            this.detailNodePos.x = this.canvas.width / 2 + (this.selectGroupIdArr.length - 1) * 10;
            this.detailNodePos.y = this.canvas.height / 2 - (this.selectGroupIdArr.length - 1) * 10;
        } else {
            this.detailNodePos.x = x;
            this.detailNodePos.y = y;
        }
    },


    /**
     * WebEnv에 저장된 Topology 데이터를 설정
     */
    configurationSaveNode: function() {
        var saveNodeList;
        var saveRelationData;
        var nodeObj, childNodeObj;
        var ix, ixLen, jx, jxLen;
        var serverId;

        if (this.isLoadSaveNodeInfo) {
            return;
        }
        this.isLoadSaveNodeInfo = true;

        // Check Node Relation Data & Configuration Node Relation Data
        if (Comm.web_env_info.topologyNodeRelation) {
            if (typeof Comm.web_env_info.topologyNodeRelation === 'string') {
                saveRelationData = JSON.parse(Comm.web_env_info.topologyNodeRelation);
            } else {
                saveRelationData = Comm.web_env_info.topologyNodeRelation;
            }
            this.relationData = saveRelationData;
            saveRelationData = null;
        }

        // Check Save Node List & Configuration Node List
        if (Comm.web_env_info.topologyNodeList) {
            if (typeof Comm.web_env_info.topologyNodeList === 'string') {
                saveNodeList = JSON.parse(Comm.web_env_info.topologyNodeList);
            } else {
                saveNodeList = Ext.clone(Comm.web_env_info.topologyNodeList);
            }

            // TODO
            this.nodeList = saveNodeList;
            this.saveNodeList = null;

            delete this.nodeMap;
            this.nodeMap = {};

            for (jx = 0, jxLen = this.nodeList.length; jx < jxLen; jx++) {
                nodeObj = this.nodeList[jx];
                nodeObj.status = 0;
                nodeObj.value  = 0;
                nodeObj.uniqID = 0;
                nodeObj.remoteCount          = {};
                nodeObj.remoteCount.lastTime = {};
                nodeObj.activeDest           = {};
                nodeObj.activeDest.lastTime  = {};

                serverId = this.getServerIdByNodeId(nodeObj.id);

                if (!nodeObj.childIdAllList) {
                    nodeObj.childIdAllList = [];
                }

                if (!nodeObj.webList) {
                    nodeObj.webList = [];
                }

                if (nodeObj.clazz === 'AGENT') {
                    if (!this.isDisplayServer(serverId) && !this.isGroupNodeByNodeId(nodeObj.id)) {
                        nodeObj.level = 1;

                    } else if (this.isDisplayServer(serverId) && !nodeObj.parentId) {
                        nodeObj.level = 0;
                    }

                } else if (nodeObj.clazz === 'DB') {
                    if (!Comm.dbInfoObj[serverId] && !this.isRelationNodeByDBID(nodeObj.id) ) {
                        nodeObj.level = 1;
                    }
                }

                // 설정된 서버(노드)정보를 설정
                if (!this.nodeMap[nodeObj.id]) {
                    this.nodeMap[nodeObj.id] = nodeObj;
                }

                for (ix = 0, ixLen = nodeObj.childList.length; ix < ixLen; ix++) {
                    childNodeObj = nodeObj.childList[ix];
                    childNodeObj.status = 0;
                    childNodeObj.value  = 0;
                    childNodeObj.uniqID = 0;
                    childNodeObj.remoteCount          = {};
                    childNodeObj.remoteCount.lastTime = {};
                    childNodeObj.activeDest           = {};
                    childNodeObj.activeDest.lastTime  = {};

                    serverId = this.getServerIdByNodeId(childNodeObj.id);

                    if (childNodeObj.clazz === 'AGENT') {
                        if (!this.isDisplayServer(serverId) && !this.isGroupNodeByNodeId(childNodeObj.id)) {
                            childNodeObj.level = 1;

                        } else if (this.isDisplayServer(serverId)) {
                            childNodeObj.level = 0;
                        }

                    } else if (childNodeObj.clazz === 'DB' && (!Comm.dbInfoObj[serverId])) {
                        if (!this.isRelationNodeByDBID(childNodeObj.id) ) {
                            childNodeObj.level = 1;
                        }
                    }

                    // 설정된 서버(노드)정보를 설정
                    if (!this.nodeMap[nodeObj.id]) {
                        this.nodeMap[childNodeObj.id] = childNodeObj;
                    }

                }
            }
        }
    },


    /**
     * 모든 DB 정보를 화면에 구성.
     * 현재는 사용을 하지 않지만 추후에 진행될 때 사용하기 위해 추가.
     */
    setAllDBNode: function() {
        var dbObjKeys = Object.keys(Comm.allDBInfo);

        var node, dbId, dbName, dbType;

        for (var ix = 0, ixLen = dbObjKeys.length; ix < ixLen; ix++) {
            dbId   = dbObjKeys[ix];
            dbName = Comm.allDBInfo[dbId].instanceName;
            dbType = Comm.allDBInfo[dbId].db_type;

            node = this.nodeMap['DB-' + dbId];

            if (!node) {
                node = new this.nodeClass.node('DB', 'DB-' + dbId, dbName, dbType, 50, 50, false, 'JDBC');
                node.depth = 0;
                node.destCount = 0;
                node.isGoCloud = false;
                node.addr = [];
                node.remoteCount = {};
                node.remoteCount.lastTime = {};
                node.activeDest = {};
                node.activeDest.lastTime = {};
                node.listIndex = 0;

                this.nodeList[this.nodeList.length] = node;
                this.nodeMap[node.id] = node;
            }
        }

        node = null;
    },


    /**
     * 0:"Was_ID"
     * 1:"Was_Name"
     * 2:"TID"
     * 3:"TXN_Name"
     * 4:"Elapsed_Time"
     * 5:"Instance_Name"
     * 6:"State"
     * 7:"SQL_ID1"
     * 8:"SQL_Exec_Count"
     * 9:"Remote_Type"
     * 10:"Bind_List"
     * 11:"Dest"
     * 12: Depth
     * 13: GUID
     */
    onTxnPathData: function(data, lines, callback) {

        var ix, jx, ixLen, jxLen;

        if (!data || data.length <= 0) {
            return;
        }

        // TODO
        this.nodeList.length = 0;
        this.rectPx = 0;
        this.rectPy = 0;

         for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            this.setRectNode(
                data[ix][0],                        // id
                this.getTxnPathType(data[ix][6]),   // method type
                data[ix][12],                       // depth
                '',                                 // addr
                '',                                 // type
                data[ix][2],                        // tid
                data[ix][3],                        // txnName
                data[ix][4],                        // elapse time
                data[ix][5],                        // instance
                data[ix][7],                        // sql id
                data[ix][10],                       // bind list
                data[ix][11]                        // dest
            );
        }

        var tempLines = [];
        var lineKeys, lineKeyId;


        for (jx = 0, jxLen = this.nodeList.length; jx < jxLen; jx++) {

            for (ix = 0, ixLen = lines.length; ix < ixLen; ix++) {

                lineKeys  = this.nodeList[jx].id.split('-');
                lineKeyId = lineKeys[1] + '-' + lineKeys[2];

                if (lineKeyId === lines[ix].fN || lineKeyId === lines[ix].tN) {

                    if (tempLines.indexOf(lines[ix]) === -1) {
                        tempLines[tempLines.length] = lines[ix];
                    }
                }
            }
        }

        this.relationData = tempLines.concat();

        if (callback) {
            callback();
        }
    },


    /**
     * Topology Node Structure Packet Data
     *
     * 0: Was_ID
     * 1: Type (80 = P, 67 = C)
     * 2: Method
     *      EJB = 10, RMI = 20, TCP = 40, DB = 50, HTTP = 70, TMAX = 80, TUEXDO = 90, SAP = 100, TIBCO(async) = 120, TIBCO(sync) = 121, WEB = 150
     *      PJS_TEMP: -1 
     *      Mehtod Type 이 80 (TMAX) 인 경우에는 연결선 위에 TMAX 로 표시하지 않고 TP 로 표시한다.
     *      Mehtod Type 이 -1 이면서 Type 이 80(P) 인 경우 화면에 해당 노드를 그리지 않게 처리한다.
     * 3: Depth          {Number Type}
     * 4: Addr           {String Type}
     * 5: DestList       {Array Type}
     *   [0]: server id
     *   [1]: method
     *   [2]: addr
     * 6: Elapse         {Number Type} - Avg 1 minute data
     * 7: Txn_End_Count  {Number Type} - Avg 1 minute data
     *
     * @param {object} data - Topology Node Configuration Data
     */
    onConfigLineData: function(data) {

        // WebEnv에 저장된 Topology 데이터를 가져와서 설정
        this.configurationSaveNode();

        var ix, jx, ixLen, jxLen;
        var serverId, toServerId;
        var methodId, methodType, toMethodType;
        var destList;
        var depth;
        var maxDepth = 0;
        var addr, subAddr, cloudAddr;
        var destCount;
        var type;
        var nodeObj, node;
        var dbInfo;
        var nodeName, nodeClazz;

        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            if (!data.rows[ix]) {
                continue;
            }

            serverId = data.rows[ix][0];
            type     = data.rows[ix][1];
            methodId = data.rows[ix][2];
            depth    = data.rows[ix][3];
            addr     = data.rows[ix][4];
            destList = data.rows[ix][5];

            methodType = this.getMethodType(methodId) || '';

            // 화면에 보여지는 대상 서버인지 체크, 해당하는 정보만 보여지게 처리
            if (!this.isDisplayServer(serverId)) {
                continue;
            }

            // -------------------------------------------------------------------------------------
            // 노드간에 연결 관계를 체크하여 설정.
            // -------------------------------------------------------------------------------------
            this.elapsedTimeAvgMin[serverId] = +data.rows[ix][6] / 1000;
            this.tpsAvgMin[serverId]         = +data.rows[ix][7];

            if (methodType === 'DB') {
                dbInfo = this.getDBInfoByHashCode(addr);

                if (dbInfo) {
                    this.setRelationData('WAS-'+serverId, 'DB-'+dbInfo.id, 'JDBC');
                }

            // 웹 서버는 WAS 노드에 포함하여 보여지기 때문에 연결 관계 설정 처리를 하지 않음.
            } else if (methodType !== 'WEB') {
                for (jx = 0; jx < destList.length; jx++) {
                    toServerId   = destList[jx][0];
                    toMethodType = this.getMethodType(destList[jx][1]) || '';

                    this.setRelationData('WAS-' + serverId, 'WAS-' + toServerId, toMethodType);
                }
            }

            // -------------------------------------------------------------------------------------
            // 노드 데이터를 구성.
            // -------------------------------------------------------------------------------------
            destCount = destList.length;
            maxDepth = (maxDepth < depth)? depth : maxDepth;

            this.setNode(serverId, methodType, depth, addr, type, destCount);

            for (jx = 0, jxLen = destList.length; jx < jxLen; jx++) {
                toServerId   = destList[jx][0];
                toMethodType = this.getMethodType(destList[jx][1]) || '';
                subAddr      = +destList[jx][2];

                this.setNode(toServerId, toMethodType, null, subAddr, type, 0);
            }

            // -------------------------------------------------------------------------------------
            // 외부로 연결되는 노드(데이터) 유무를 체크하여 데이터가 있는 경우, 해당 노드를 구성.
            // -------------------------------------------------------------------------------------

            // type 이 80 이면서 method 값이 -1인 노드인 경우 외부로 연결되는 처리는 하지 않게 설정함.
            // 해당 데이터는 토폴로지 뷰 화면을 초기에 표시할 때 에이전트 노드를 모두 보여주기 위해 PJS에서
            // 추가 작업을 하면서 설정된 값.
            if (type === 80 && methodId === -1) {
                continue;
            }

            if (methodType === 'DB') {
                if (dbInfo) {
                    nodeObj = this.getNodeById('DB-' + dbInfo.id);
                }
            } else {
                nodeObj = this.getNodeById('WAS-' + serverId);
            }

            if (!nodeObj) {
                continue;
            }

            // HTTP, TCP 등 외부 연결 노드 구성
            if (this.isDisplayCloudNode && nodeObj.isGoCloud && !destCount) {
                cloudAddr = this.originalTxnDestData[+addr] || '';

                if (this.isFullCloudName) {
                    nodeName = cloudAddr;

                } else {
                    nodeName = cloudAddr.split('/');
                    if (nodeName.length > 1) {
                        nodeName.length = 3;
                        nodeName = nodeName.join("/").split(':')[0] +':'+ nodeName.join("/").split(':')[1];
                    } else {
                        nodeName = nodeName[0];
                    }
                }

                // TP 아이콘의 표시 유무 값이 false 인 경우 비표시
                //if (this.isDisplayTmaxNode === false && nodeObj.isGoTPServer) {
                //    continue;
                //}

                // TP 아이콘을 표시하는데 이름이 '(' 로 시작되는 경우 표시하지 않게 처리 (PJS 요청 사항)
                if (nodeObj.isGoTPServer && nodeName.indexOf('(') === 0) {
                    continue;
                }

                node = this.getNodeById('CLOUD-'+nodeName);

                if (!node) {
                    nodeClazz = nodeObj.isGoTPServer? 'SERVER' : 'CLOUD';
                    node = new this.nodeClass.node(
                        nodeClazz, 'CLOUD-'+nodeName, nodeName, methodType.toUpperCase(), 50, 50, false, methodType
                    );

                    node.listIndex = this.nodeList.length;
                    node.addr = [];

                    this.nodeList[this.nodeList.length] = node;
                    this.nodeMap[node.id] = node;
                }

                if (!node.addr) {
                    node.addr = [];
                }

                if (node.addr.indexOf(+addr) === -1) {
                    node.addr[node.addr.length] = +addr;
                }

                this.setRelationData(nodeObj.id, node.id, methodType);
            }

        }

        if (!this.isNodeDragMove && !this.isDisplayGroupMode && (this.textInputMode == null || this.textInputMode === this.inputMode.BLANK) ) {
            this.resortNodeByDepth(maxDepth);
        }

        if (this.nodeList.length > this.limitAnimateNodeCount) {
            this.isAlarmAnimate = false;
            this.isLineAnimate = false;
        }

        this.isChangeDisplayRelation = false;

        //this.canvasDraw();
        this.refreshData();

        addr     = null;
        subAddr  = null;
        data     = null;
        nodeObj  = null;
        destList = null;
    },


    /**
     * 토폴로지 실시간 패킷 데이터 처리
     *
     * @param {object} data
     *   0: was_id
     *   1: total_txn_count
     *   2: dest_count
     *   3: array
     *      [0]: dest
     *      [1]: dest_remote_count
     *      [2]: p_c_hash
     *           p_c hash 값이 -9999999 인 경우
     *           --> dest_remote_count값을 WAS-DB 간에 execute count 값으로 표시
     *               (-9999999 값은 PlatformJS에서 설정해서 보내준다.)
     *
     *           p_c_hash 값이 -1 이면서 해당 노드가 외부 연계인 경우
     *           --> dest_remote_count 값을 WAS-CLOUD 간에 execute count 값으로 표시
     */
    onData: function(data) {
        var ix, kx, ixLen, kxLen, lx, lxLen;
        var countData;
        var destData;
        var wasId;
        var nodeIdByDest;
        var filterKey;
        var nodeObj;
        var childNodeObj;
        var serverId;
        var isDBExecCount, isCloudConnect;

        var destId, destRemoteCount, pcHash;
        var fromNode, fromNodeId;


        // 토폴로지 뷰 로그 출력 유무 설정
        var isPrintLog = window.isTopologyLogPrint;
        var isFilterServer = false;

        if (isPrintLog) {
            console.debug('============================================================');

            if (window.topologyFilterID && window.topologyFilterID.length > 0) {
                isFilterServer = true;
            }
        }


        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            countData = data.rows[ix];
            wasId = +countData[0];

            nodeObj = this.nodeMap['WAS-' + wasId];

            if (nodeObj) {
                nodeObj.value = +countData[1];

                nodeObj.remoteCount = {};
                nodeObj.remoteCount.lastTime = {};
                nodeObj.activeDest = {};
                nodeObj.activeDest.lastTime = {};


                if (isPrintLog) {
                    console.debug(
                        'Node_ID:',     nodeObj.id,
                        ' Node_Alias:', nodeObj.alias
                    );
                }


                if (+countData[2] > 0) {
                    destData = countData[3];

                    for (kx = 0, kxLen = destData.length; kx < kxLen; kx++) {
                        destId          = +destData[kx][0];
                        destRemoteCount = +destData[kx][1];
                        pcHash          = +destData[kx][2];


                        if (isPrintLog) {
                            console.debug(
                                'Dest_ID:',            destId,
                                ' Dest_Remote_Count:', destRemoteCount,
                                ' P_C_Hash:',          pcHash
                            );
                        }


                        // P_C Hash 값이 -9999999 인 경우는 WAS-DB 간에 execute count 값으로 표시
                        // -9999999 값은 PlatformJS에서 설정해서 보내주는 값.
                        isDBExecCount = (pcHash === -9999999);

                        // P_C_Hash 값이 -1 이면서 해당 노드가 외부 연계인 경우
                        // WAS-CLOUD 간에 execute count 값을 표시
                        isCloudConnect = (nodeObj.isGoCloud && pcHash === -1);

                        if (isPrintLog && isDBExecCount) {
                            console.debug(
                                'To DB Count:', destRemoteCount
                            );
                        }

                        if (isPrintLog && isCloudConnect) {
                            console.debug(
                                'To ' + nodeObj.remoteType + ' Count:', destRemoteCount
                            );
                        }

                        if (pcHash < 0 && !isDBExecCount && !isCloudConnect) {
                            continue;
                        }

                        // DB Execute Count 값인지 체크 
                        if (isDBExecCount) {
                            nodeIdByDest = this.getNodeArrByDest(destId, nodeObj.id, 'DB');

                        } else if (isCloudConnect) {
                            if (nodeObj.isGoTPServer) {
                                nodeIdByDest = this.getNodeArrByDest(destId, nodeObj.id, 'SERVER');
                            } else {
                                nodeIdByDest = this.getNodeArrByDest(destId, nodeObj.id, 'CLOUD');
                            }

                        } else {
                            nodeIdByDest = this.getNodeArrByDest(pcHash, nodeObj.id);
                        }

                        for (lx = 0, lxLen = nodeIdByDest.length; lx < lxLen; lx++) {

                            fromNode   = nodeIdByDest[lx];
                            fromNodeId = fromNode.id;


                            if (isPrintLog) {
                                console.debug(
                                    'From_Node_ID:',     nodeObj.id,
                                    ' From_Node_Alias:', nodeObj.alias,
                                    ' To_Node_ID:',      fromNodeId,
                                    ' To_Node_Alias:',   fromNode.alias
                                );
                            }


                            // Set Remote Count Of Node ----------------------------------
                            if (this.isDrawAnimateLine(nodeObj.id, fromNodeId)) {
                                this.remoteWasList[this.remoteWasList.length] = [nodeObj.id, fromNodeId];
                            }

                            if(!nodeObj.remoteCount[fromNodeId]) {
                                nodeObj.remoteCount[fromNodeId] = 0;
                            }
                            nodeObj.remoteCount[fromNodeId]         += destRemoteCount;
                            nodeObj.remoteCount.lastTime[fromNodeId] = +new Date();
                            this.lastReceiveCount[nodeObj.id]        = +new Date();

                            // Set Active Dest Of Node -----------------------------------
                            if (!nodeObj.activeDest[fromNodeId]) {
                                nodeObj.activeDest[fromNodeId] = [];
                            }

                            nodeObj.activeDest.lastTime[fromNodeId] = Date.now();

                            if (nodeObj.activeDest[fromNodeId].indexOf(destId) === -1) {
                                nodeObj.activeDest[fromNodeId].push(destId);
                            }

                            filterKey = nodeObj.id + '-' + fromNodeId;
                            if (!this.activateDest[filterKey]) {
                                this.activateDest[filterKey] = [];
                            }

                            // Set Active Dest (WAS -> WAS) ------------------------------
                            if (this.activateDest[filterKey].indexOf(destId) === -1) {
                                this.activateDest[filterKey].push(destId);
                            }

                            if (filterKey) {
                                this.lastReceiveDest[filterKey] = +new Date();
                            }

                            // Clear Filter Key
                            filterKey = null;

                            // Set Active Dest (Group -> Group) --------------------------
                            if (nodeObj.parentId && fromNode.parentId) {
                                if (nodeObj.parentId !== fromNode.parentId) {
                                    filterKey = nodeObj.parentId + '-' + fromNode.parentId;

                                    if (!this.activateDest[filterKey]) {
                                        this.activateDest[filterKey] = [];
                                    }
                                }

                            // Set Active Dest (WAS -> Group) ----------------------------
                            } else if (nodeObj.parentId) {
                                filterKey = nodeObj.parentId + '-' + fromNodeId;

                                if (!this.activateDest[filterKey]) {
                                    this.activateDest[filterKey] = [];
                                }

                            // Set Active Dest (Group -> WAS) ----------------------------
                            } else if (fromNode.parentId) {
                                filterKey = nodeObj.id + '-' + fromNode.parentId;

                                if (!this.activateDest[filterKey]) {
                                    this.activateDest[filterKey] = [];
                                }
                            }

                            if (filterKey) {
                                if (this.activateDest[filterKey].indexOf(destId) === -1) {
                                    this.activateDest[filterKey].push(destId);
                                }
                                this.lastReceiveDest[filterKey] = +new Date();
                            }
                        }

                    }
                }

                for (kx = 0, kxLen = nodeObj.childList.length; kx < kxLen; kx++) {
                    childNodeObj = nodeObj.childList[kx];
                    serverId = this.getServerIdByNodeId(childNodeObj.id);

                    if (wasId === +serverId) {
                        childNodeObj.value = +countData[1];
                    }
                }
            }

        }

        if (this.updateDestFilter) {
            this.updateDestFilter(this.activateDest);
        }

        data = null;
    },


    /**
     * 메소드 ID값에 따른 메소드 타입 반환.
     * 
     * 메소드 타입이 80 (TMAX)인 경우에는 'TP' 로 반환한다. (17.04.12 APM팀 요청사항)
     *
     * @param {number} method type
     * @return {string} type Name
     */
    getMethodType: function(type) {
        var typeName;
        switch(type) {
            case 10:
                typeName = 'EJB';
                break;
            case 20:
                typeName = 'RMI';
                break;
            case 40:
                typeName = 'TCP';
                break;
            case 50:
                typeName = 'DB';
                break;
            case 70:
                typeName = 'HTTP';
                break;
            case 80:
                typeName = 'TP';  // TMAX
                break;
            case 90:
                typeName = 'TUEXDO';
                break;
            case 100:
                typeName = 'SAP';
                break;
            case 120:
                typeName = 'TIBCO (async)';
                break;
            case 121:
                typeName = 'TIBCO';
                break;
            case 150:
                typeName = 'WEB';
                break;
           default:
                typeName = 'HTTP';
               break;
        }
        return typeName;
    },


    /**
     * Get Txn Path Type
     *
     * @param {number} method type
     * @return {string} type Name
     */
    getTxnPathType: function(type) {
        var typeName;
        switch(type) {
            case 40:
                typeName = 'TCP';
                break;
            case 63:
                typeName = 'JDBC';
                break;
            case 70:
                typeName = 'HTTP';
                break;
            case 80:
                typeName = 'TP';
                break;
           default:
                typeName = '';
               break;
        }
        return typeName;
    },


    getFocus: function() {
        var isFocus = 
            this.isFocusGroupIcon ||
            this.isFocusZoomIcon ||
            this.isFocusXviewIcon ||
            this.isSplitHover ||
            this.isCloseHover;
        return isFocus;
    },


    /**
     * Check Server Status (Server Down, Disconnected, Server Boot)
     */
    checkServerStatus: function() {
        var ix, ixLen, jx, jxLen;
        var nodeObj, childNodeObj;
        var serverId, nodeId;
        var status;
        var downCount;

        // TODO
        for (ix = 0, ixLen = this.nodeList.length; ix < ixLen; ix++) {
            nodeObj = this.nodeList[ix];

            serverId = this.getServerIdByNodeId(nodeObj.id);
            status = this.getServerStatus(nodeObj.clazz, serverId, nodeObj.status);

            if (status !== 3) {
                status = this.checkAlertByServerId(serverId, nodeObj.clazz);
            }

            if (nodeObj.isGroupMode && status < 2) {
                downCount = this.getDownAlarmCountInNode(nodeObj);

                if (downCount === nodeObj.childList.length) {
                    status = 3;
                } else if (downCount > 0) {
                    status = 2;
                }
            }
            nodeObj.status = status;

            //for (jx = 0, jxLen = nodeObj.childList.length; jx < jxLen; jx++) {
            for (jx = 0, jxLen = nodeObj.childIdAllList.length; jx < jxLen; jx++) {
                nodeId = nodeObj.childIdAllList[jx];
                //childNodeObj = this.getNodeById(nodeId);
                childNodeObj = this.getChildNodeById(nodeObj, nodeId);

                if (!childNodeObj) {
                    continue;
                }

                serverId = this.getServerIdByNodeId(nodeId);
                status = this.getServerStatus(childNodeObj.clazz, serverId, childNodeObj.status);

                if (status !== 3) {
                    status = this.checkAlertByServerId(serverId, childNodeObj.clazz);
                }
                childNodeObj.status = status;

                if (nodeObj.status !== 3 && childNodeObj.status !== 3 && nodeObj.status < childNodeObj.status) {
                    nodeObj.status = childNodeObj.status;
                }
            }
        }
    },


    /**
     * 서버 마지막 알람 상태 체크
     *
     * @param {number | string} serverId - 서버 ID
     * @param {string} serverType - 서버 타입
     * @return {number} 마지막 알람 레벨
     */
    checkAlertByServerId: function(serverId, serverType) {
        var lastStatus = 0;
        var ix, ixLen;
        var wasList;

        if (serverType === 'DB' && Comm.dbInfoObj[serverId]) {
            if (Repository.alarmListInfo.DB) {
                wasList = Repository.alarmListInfo.DB[serverId];
            }
        } else {
            if (Repository.alarmListInfo.WAS) {
                wasList = Repository.alarmListInfo.WAS[serverId];
            }
        }

        if (wasList && wasList.length > 0) {
            for (ix = 0, ixLen = wasList.length; ix < ixLen; ix++) {
                if (lastStatus < wasList[ix].level) {
                    lastStatus = +wasList[ix].level;
                }
            }
        }
        return lastStatus;
    },


    getDownAlarmCountInNode: function(nodeObj) {
        var jx, jxLen;
        var childNodeObj;
        var serverId;
        var status;
        var downCount = 0;

        serverId = this.getServerIdByNodeId(nodeObj.id);
        status = this.getServerStatus(nodeObj.clazz, serverId, nodeObj.status);
        if (status !== 3) {
            status = this.checkAlertByServerId(serverId, nodeObj.clazz);
        }

        if (status === 3) {
            downCount++;
        }

        for (jx = 0, jxLen = nodeObj.childList.length; jx < jxLen; jx++) {
            childNodeObj = nodeObj.childList[jx];
            serverId = this.getServerIdByNodeId(childNodeObj.id);
            status = this.getServerStatus(childNodeObj.clazz, serverId, childNodeObj.status);
            if (status !== 3) {
                status = this.checkAlertByServerId(serverId, childNodeObj.clazz);
            }

            if (status === 3) {
                downCount++;
            }
        }
        return downCount;
    },


    /**
     * Get Server Status By Server Type, ID
     *
     * @param {string} serverType
     * @param {string | number} serverId
     * @param {number} serverStatus
     *
     * @return {boolean} server status level (0: normal, 1: warning, 2: critical, 3: down)
     */
    getServerStatus: function(serverType, serverId, serverStatus) {
        var isDown;
        var status;

        if (serverType === 'DB' && Comm.dbInfoObj[serverId]) {
            isDown = Comm.RTComm.isDown(Comm.Status.DB[serverId]);

        } else {
            isDown = Comm.RTComm.isDown(Comm.Status.WAS[serverId]);
        }

        if (isDown) {
            status = 3;
        } else {
            status = (serverStatus > 0 && serverStatus < 3)? serverStatus : 0;
        }
        return status;
    },


    /**
     * 토폴로지 뷰에 표시할 서버인지 체크.
     *
     * @param {number | string} serverId 서버ID
     * @return {boolean} true: 표시, false: 숨김
     */
    isDisplayServer: function(serverId) {
        // 필터설정된 서버가 있는 경우
        if (this.filterServerList && this.filterServerList.length > 0) {
            return this.filterServerList.indexOf(+serverId) !== -1;

        } else {
            return Comm.wasIdArr.indexOf(+serverId) !== -1;
        }
    },


    /**
     * Receive Alarm Data
     * 0: time
     * 1: server_type   (1: WAS, 2: DB, 3: WebServer, 9: Host, 15: APIM)
     * 2: server_id
     * 3: server_name
     * 4: alert_resource_name
     * 5: value
     * 6: alert_level
     * 7: levelType
     * 8: alert_type
     * 9: descr
     * 10: alert_resource_ID
     *
     * @param {object} adata
     */
    onAlarm: function(data) {
        if (!data) {
            return;
        }

        var serverType = +data[1];
        var serverId   = +data[2];
        var alertLevel = +data[6];
        var alertName  = data[4];

        var typeName;
        var nodeObj, parentNode, childNode;

        // 서버 타입이 DB 인데 모니터링 대상이 아닌 경우 처리하지 않느다.
        if (+serverType === 2 && !Comm.dbInfoObj[serverId]) {
            return;
        }

        // 서버 타입이 Webserver인데 모니터링 대상 웹 서버가 아닌 경우 처리하지 않느다.
        if (+serverType === 3 && Comm.webIdArr.indexOf(serverId) === -1) {
            return;
        }

        switch(serverType) {
            case 1 :
                typeName = 'WAS';
                break;
            case 2 :
                typeName = 'DB';
                break;
            case 3 :
                typeName = 'WebServer';
                break;
            default :
                typeName = '';
                break;
        }

        // WAS, DB, WebServer 알람만 체크하며 그 외의 알람은 체크하지 않는다.
        if (typeName === '') {
            return;
        }

        nodeObj = this.nodeMap[typeName  + '-' + serverId];

        if (nodeObj) {
            switch(alertName) {
                case realtime.alarms.SERVER_DOWN:
                case realtime.alarms.DISCONNECTED:
                case realtime.alarms.TP_DOWN:
                    nodeObj.status = 3;
                    break;
                case realtime.alarms.SERVER_HANG:
                    nodeObj.status = 2;
                    break;

                case realtime.alarms.SERVER_BOOT:
                case realtime.alarms.CONNECTED:
                    nodeObj.status = 0;
                    break;

                default:
                    nodeObj.status = alertLevel;
                    break;
            }
            parentNode = this.getNodeById(nodeObj.parentId);

            if (parentNode) {
                if (nodeObj.status === 3) {
                    parentNode.isContainDown = true;
                } else {
                    parentNode.status = nodeObj.status;
                }
                childNode = this.getChildNodeById(parentNode, nodeObj.id);
                if (childNode) {
                    childNode.status = nodeObj.status;
                }
            }
        }

    },


    onTxnPathAlarm: function() {
    },


    drawAlarm: function() {
        window.cancelAnimationFrame(this.alarmAnimateHandle);
        window.cancelAnimationFrame(this.downAnimateHandle);

        this.drawAlarmEffect();

        //this.drawDownEffect();
    },


    /**
     * Draws a rounded rectangle using the current state of the canvas.
     * If you omit the last three params, it will draw a rectangle outline with a 5 pixel border radius
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Number} width The width of the rectangle
     * @param {Number} height The height of the rectangle
     * @param {Number} [radius = 5] The corner radius; It can also be an object
     *                 to specify different radius for corners
     * @param {Number} [radius.tl = 0] Top left
     * @param {Number} [radius.tr = 0] Top right
     * @param {Number} [radius.br = 0] Bottom right
     * @param {Number} [radius.bl = 0] Bottom left
     * @param {Boolean} [fill = false] Whether to fill the rectangle.
     * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
     */
    roundRect: function(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof stroke === 'undefined') {
            stroke = true;
        }
        if (typeof radius === 'undefined') {
            radius = 5;
        }

        if (typeof radius === 'number') {
            radius = {tl: radius, tr: radius, br: radius, bl: radius};
        } else {
            var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
//            for (var side in defaultRadius) {
//                radius[side] = radius[side] || defaultRadius[side];
//            }
            radius.tl = radius.tl || defaultRadius.tl;
            radius.tr = radius.tr || defaultRadius.tr;
            radius.br = radius.br || defaultRadius.br;
            radius.bl = radius.bl || defaultRadius.bl;
        }

        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();

        if (fill) {
            ctx.fill();
        }

        if (stroke) {
            ctx.stroke();
        }
    },


    /**
     * 토폴로지 뷰에서 사용하는 변수를 초기화
     */
    initProperty: function() {
        this.fpsNow      = null;
        this.fpsThen     = Date.now();

        this.nodePath        = {};
        this.linePath        = {};
        this.nodeList        = [];
        this.displayNodeList = [];
        this.subNodeList     = [];
        this.nodeMap         = {};

        this.groupList           = [];
        this.selectGroupIdArr    = [];
        this.nodeNameBoxList     = [];
        this.remoteInfoBoxList   = [];
        this.callTreeIconList    = [];
        this.lineList            = [];
        this.lineEffectList      = null;
        this.relationData        = [];
        this.displayRelationData = [];
        this.subRelationData     = [];
        this.remoteWasList       = [];
        this.lastReceiveCount    = {};
        this.lastReceiveDest     = {};
        this.lineStartWas        = [];
        this.elapsedTimeAvgMin   = {};
        this.tpsAvgMin           = {};
        this.activateDest        = {};
        this.originalTxnDestData = {};
        this.detailNodePos       = {};

        //this.groupCanvasList    = [];
        //this.childCanvasList    = [];
        //this.groupContextList   = [];
        //this.groupChildCtxtList = [];

        this.nodeSeq = 0;

        this.clikIconPt   = null;
        this.xviewIconPt  = null;
        this.zoomIconPt   = null;
        this.groupIconPt  = null;
        this.folderViewPt = null;
        this.groupChildPt = null;
        this.closeXPt     = null;

        this.mergeAgentList   = null;
        this.mergeTargetNode  = null;

        this.isInit                      = false;
        this.isDisplayGroupMode          = false;
        this.isCheckCreateGroup          = false;
        this.isNodeDragMove              = false;
        this.isRemoteInfoTextRotate      = false;
        this.isDisplayRemoteActiveCount  = true;
        this.isDisplayAgentType          = false;
        this.isDrawingPath               = false;
        //this.isTxnPathMode               = false;
        //this.isTxnPathRefresh            = false;
        //this.isEndTxnPath                = false;
        this.isRealDragDraw              = false;
        this.isLoadSaveNodeInfo          = false;
        this.isEnableAlarmTooltip        = true;
        this.isDebugLogMode              = false;
        this.isAutoSave                  = true;
        this.isCenterDetailLayout        = true;
        this.isDrawingLayout             = false;

        this.isAlarmAnimate              = true;
        this.isLineAnimate               = true;

        this.selectNodeObj         = null;
        this.folderImgCnt          = null;
        this.refreshTimerId        = null;
        this.refreshTxnPathTimerId = null;
        this.alarmGradient         = null;

        this.isFullCloudName    = common.Menu.topologyCloudFullName;
        this.isDisplayCloudNode = common.Menu.topologyEnableCloud;

    }

};



/**
 * Event Manager
 */
XMTopology.prototype.Event = {

    /**
     * 캔버스에서 마우스 다운 이벤트 처리
     */
    mouseDown: function(e) {
        e.preventDefault();
        e.stopPropagation();

        // 그룹 생성 표시, 레이아웃 표시 처리 중인 경우에는 마우스 다운 이벤트 처리를 하지 않는다.
        if (this.isDrawingFolder || this.isWorkingMergeNode || this.isDrawingLayout) {
            return;
        }

        // 마우스 오른쪽 버튼 이벤트는 처리하지 않는다.
        if (e.button === 2) {
            return;
        }

        // 노드를 다중선택해서 이동을 할 수 있게 하는 기능 준비
        //if (e.ctrlKey) {
        //    this.isPressCtrlKey = true;
        //} else {
        //    this.isPressCtrlKey = false;
        //}

        // 그룹 노드를 생성하는 중인 경우이면 그룹 노드 생성을 취소한다.
        if (this.isCheckCreateGroup) {
            this.cancelGroupFolder();
        }

        this.selectNodeObj = null;
        this.clikIconPt = null;

        // 마우스 다운 이벤트가 발생된 위치 가져오기
        var mouse = this.getPointOnMouse(e);
        var mx = mouse.x;
        var my = mouse.y;

        // 드래그 영역을 그리기 위해 마우스 이벤트가 발생된 위치값을 시작 위치로 설정.
        this.dragSelectionStartPt = {x: mx, y: my};

        // 마우스 다운 이벤트가 발생면서 선택된 노드의 위치값
        this.firstClickPoint = null;

        var nodeObj, nodePt, ix, ixLen;

        //================================================================================
        // 노드 위에서 마우스 다운 이벤트가 발생되었는지 체크
        //================================================================================
        for (ix = 0, ixLen = this.nodeList.length; ix < ixLen; ix++ ) {
            nodeObj = this.nodeList[ix];

            // TODO 그룹노드의 하위에 있는 그룹 노드를 처리하기 위해서는 디스플레이 레벨의 재설정이 필요

            if (this.displayNodeLevel !== +nodeObj.level) {
                continue;
            }

            if (nodeObj.clazz === 'AGENT' || nodeObj.clazz === 'GROUP') {
                if (mx < nodeObj.x + 35 + this.canvas.offsetLeft && mx > nodeObj.x - 35 - this.canvas.offsetLeft &&
                    my < nodeObj.y + 35 + this.canvas.offsetTop  && my > nodeObj.y - 35 - this.canvas.offsetTop) {

                    this.isNodeDragMove = true;
                    this.selectNodeObj = nodeObj;
                    this.firstClickPoint = {x: nodeObj.x, y: nodeObj.y};
                    break;

                } else if (nodeObj.isWebContain &&
                    mx < nodeObj.x - 18 + this.canvas.offsetLeft && mx > nodeObj.x - 45 - this.canvas.offsetLeft &&
                    my < nodeObj.y - 18 + this.canvas.offsetTop  && my > nodeObj.y - 45 - this.canvas.offsetTop) {

                    this.selectNodeObj = nodeObj;
                    break;
                }

            } else if (nodeObj.clazz === 'SERVER') {
                if (mx < nodeObj.x + 64/2 + this.canvas.offsetLeft && mx > nodeObj.x - 64/2 - this.canvas.offsetLeft &&
                    my < nodeObj.y + 55/2 + this.canvas.offsetTop  && my > nodeObj.y - 55/2 - this.canvas.offsetTop) {

                    this.isNodeDragMove = true;
                    this.selectNodeObj = nodeObj;
                    this.firstClickPoint = {x: nodeObj.x, y: nodeObj.y};

                    break;
                }
            } else if (nodeObj.clazz === 'CLOUD') {
                if (mx < nodeObj.x + 91/2 + this.canvas.offsetLeft && mx > nodeObj.x - 91/2 - this.canvas.offsetLeft &&
                    my < nodeObj.y + 54/2 + this.canvas.offsetTop  && my > nodeObj.y - 54/2 - this.canvas.offsetTop) {

                    this.isNodeDragMove = true;
                    this.selectNodeObj = nodeObj;
                    this.firstClickPoint = {x: nodeObj.x, y: nodeObj.y};

                    break;
                }
            } else if (nodeObj.clazz === 'DB') {
                if (mx < nodeObj.x + 59/2 + this.canvas.offsetLeft && mx > nodeObj.x - 59/2 - this.canvas.offsetLeft &&
                    my < nodeObj.y + 65/2 + this.canvas.offsetTop  && my > nodeObj.y - 65/2 - this.canvas.offsetTop) {

                    this.isNodeDragMove = true;
                    this.selectNodeObj = nodeObj;
                    this.firstClickPoint = {x: nodeObj.x, y: nodeObj.y};

                    break;
                }
            }
        }

        // 마우스 우클릭 이거나 트랜잭션 패스 모드인 경우에는 진행하지 않는다.
        if (e.button === 2 || this.isTxnPathMode) {
            return;
        }

        //================================================================================
        // 그룹에 속한 하위 노드에 대해서 마우스 이벤트가 발생한 것인지 체크
        //================================================================================
        this.isChildNodeDragMove = false;
        this.isChildNodeSelected = false;

        // 그룹 뷰 모드이면서 그룹 뷰에 보여지는 하위노드의 위치 정보가 있는 경우.
        if (this.isDisplayGroupMode && this.groupChildPt) {
            for (ix = 0, ixLen = this.groupChildPt.length; ix < ixLen; ix++) {
                nodePt = this.groupChildPt[ix];

                if (nodePt.clazz === 'AGENT') {
                    if (mx < nodePt.x + nodePt.r + this.canvas.offsetLeft && mx > nodePt.x - nodePt.r - this.canvas.offsetLeft &&
                        my < nodePt.y + nodePt.r + this.canvas.offsetTop  && my > nodePt.y - nodePt.r - this.canvas.offsetTop) {

                            //this.isChildNodeDragMove = true;
                            this.isChildNodeSelected = true;
                            this.selectNodeObj = nodePt;
                            break;
                    }
                } else {
                    if (mx < nodePt.x + 20 + nodePt.r + this.canvas.offsetLeft && mx > nodePt.x - nodePt.r - this.canvas.offsetLeft &&
                        my < nodePt.y + 20 + nodePt.r + this.canvas.offsetTop  && my > nodePt.y - nodePt.r - this.canvas.offsetTop) {

                            //this.isChildNodeDragMove = true;
                            this.isChildNodeSelected = true;
                            this.selectNodeObj = nodePt;
                            break;
                    }
                }
            }
            return;
        }

        //================================================================================
        // 영역을 선택하는지 노드를 이동하는지 체크
        //================================================================================
        if (this.isNodeDragMove !== true) {
            this.isDragMultiSelection = true;

        } else {
            // 노드를 선택해서 움직이는 경우
            if (!this.refreshTimerId) {
                clearTimeout(this.refreshTimerId);
            }
            this.renderLoop();
        }

    },


    /**
     * 캔버스에서 마우스 이동 이벤트 처리
     */
    mouseMove: function(e) {
        e.preventDefault();
        //e.stopPropagation();

        // 그룹 생성 표시, 레이아웃 표시 처리 중인 경우에는 마우스 다운 이벤트 처리를 하지 않는다.
        if (this.isDrawingFolder || this.isWorkingMergeNode || this.isDrawingLayout) {
            return;
        }

        // 마우스 오른쪽 버튼 이벤트는 처리하지 않는다.
        if (e.button === 2) {
            return;
        }

        //================================================================================
        // 마우스 커서 모양 초기화
        //================================================================================
        if (this.canvas.style.cursor !== '') {
            this.canvas.style.cursor = '';
        }

        if (this.dragCanvas.style.cursor !== '') {
            this.dragCanvas.style.cursor = '';
        }

        // 마우스 이벤트가 발생된 위치 가져오기
        var mouse = this.getPointOnMouse(e);
        var mx = mouse.x;
        var my = mouse.y;

        var ix, ixLen;
        var nodeObj, nodePt, namePt;
        var marginWidth, marginHeight;

        //================================================================================
        // 실시간 트랜잭션 패스 뷰 모드인 경우
        //================================================================================
        if (this.isTxnPathMode) {

            for (ix = 0, ixLen = this.callTreeIconList.length; ix < ixLen; ix++ ) {
                nodePt = this.callTreeIconList[ix];

                if (mx < nodePt.x + nodePt.radius + this.canvas.offsetLeft && mx > nodePt.x - nodePt.radius - this.canvas.offsetLeft &&
                    my < nodePt.y + nodePt.radius + this.canvas.offsetTop  && my > nodePt.y - nodePt.radius - this.canvas.offsetTop) {

                        this.canvas.style.cursor     = 'pointer';
                        this.dragCanvas.style.cursor = 'pointer';
                        return;
                }
            }


            if (this.isNodeDragMove && this.selectNodeObj) {
                this.onNodeId = this.selectNodeObj.id;
                this.selectNodeObj.x = mx;
                this.selectNodeObj.y = my;
                this.canvasTxnPathDraw();
            }
            return;
        }

        // 노드명을 입력하고 있는 상태일 경우, 마우스 이동 이벤트는 처리하지 않는다. 
        if (this.textInputMode && this.textInputMode !== this.inputMode.BLANK) {
            return;
        }

        // 그룹을 생성하는 중일 경우, 마우스 커서를 변경하지 않으며 마우스 이동 이벤트는 처리하지 않는다. 
        if (this.isCheckCreateGroup) {
            this.canvas.style.cursor = '';
            this.dragCanvas.style.cursor = '';
            return;
        }

        this.isOnFocusNodeName = false;

        //================================================================================
        // Hide Line Info
        //================================================================================
//        if (this.isDisplayRemoteActiveCount === true) {
//            this.isDisplayRemoteActiveCount = false;
//            this.clearLineLayout();
//            this.drawLineLayout();
//        }

        //================================================================================
        // 노드명 위에 마우스 포커스가 위치하면 텍스트 입력 포커스로 변경.
        //================================================================================
        if (!this.isDisplayGroupMode && !this.isNodeDragMove && !this.isChildNodeSelected) {
        //if (!this.isDisplayGroupMode && !this.isNodeDragMove && !this.isChildNodeDragMove) {

            for (ix = 0, ixLen = this.nodeNameBoxList.length; ix < ixLen; ix++ ) {
                namePt = this.nodeNameBoxList[ix];

                if (namePt.width > 150) {
                    marginWidth = 75;
                    marginHeight = Math.trunc(12 * namePt.width / 150);
                } else {
                    marginWidth = 45;
                    marginHeight = 0;
                }
                if (mx < namePt.x + marginWidth  + this.canvas.offsetLeft && mx > namePt.x - marginWidth - this.canvas.offsetLeft &&
                    my < namePt.y + marginHeight + this.canvas.offsetTop  && my > namePt.y - 10 - this.canvas.offsetTop) {

                    this.isOnFocusNodeName       = true;
                    this.canvas.style.cursor     = 'text';
                    this.dragCanvas.style.cursor = 'text';
                    return;
                }
            }
        }

        //================================================================================
        // 노드와 노드사이에 있는 리모트 정보위에 마우스 포커스가 위치하면 손가락으로 포커스 변경.
        //================================================================================
        if (!this.isDisplayGroupMode && !this.isNodeDragMove && !this.isChildNodeSelected) {
        //if (!this.isDisplayGroupMode && !this.isNodeDragMove && !this.isChildNodeDragMove) {

            for (ix = 0, ixLen = this.remoteInfoBoxList.length; ix < ixLen; ix++ ) {
                namePt = this.remoteInfoBoxList[ix];

                marginWidth  = 45;
                marginHeight = 26;

                if (mx < namePt.x + marginWidth  + this.canvas.offsetLeft && mx > namePt.x - this.canvas.offsetLeft &&
                    my < namePt.y + marginHeight + this.canvas.offsetTop  && my > namePt.y - this.canvas.offsetTop) {

                    this.isOnFocusRemoteInfo     = true;
                    this.canvas.style.cursor     = 'pointer';
                    this.dragCanvas.style.cursor = 'pointer';
                    return;
                }
            }
        }

        //================================================================================
        // 마우스 클릭을 하였는데 드래그 이벤트가 발생하는 경우가 있어서 드래그 시점의 좌표와
        // 같은 좌표인 경우에는 마우스 이동 이벤트 처리가 실행되지 않게 체크.
        //================================================================================
        if (this.dragSelectionStartPt &&
            this.dragSelectionStartPt.x === mx && this.dragSelectionStartPt.y === my) {
            return;
        }

        // 영역을 드래그 해서 선택하는 경우가 아니라면 드래그 해서 표시되었던 레이어를 클리어 한다.
        if (!this.isDragMultiSelection) {
            this.clearDragLayout();
        }

        //================================================================================
        // 그룹 표시 모드 상태에서 마우스 이벤트 처리
        //================================================================================
        this.onNodeId = '';
        if (this.isDisplayGroupMode && !this.isChildNodeSelected) {
        //if (this.isDisplayGroupMode === true && !this.isChildNodeDragMove) {
            this.canvas.style.cursor = '';
            this.dragCanvas.style.cursor = '';

            if (this.isCloseHover === true || this.isSplitHover === true) {
                this.isCloseHover = false;
                this.isSplitHover = false;

                if (this.selectedGroupCircle) {
                    this.drawGroupLayout(this.selectedGroupCircle.id, true);
                }
            }

            // Child Node Mouse Focus ----------------------------------------------------
            this.isChildNodeFocus = false;
            if (this.groupChildPt) {
                for (ix = 0; ix < this.groupChildPt.length; ix++) {
                    nodePt = this.groupChildPt[ix];

                    if (mx < nodePt.x + nodePt.r + this.canvas.offsetLeft && mx > nodePt.x - nodePt.r - this.canvas.offsetLeft &&
                        my < nodePt.y + nodePt.r + this.canvas.offsetTop  && my > nodePt.y - nodePt.r - this.canvas.offsetTop) {

                        if (!this.selectedGroupCircle) {
                            continue;
                        }
                        nodeObj = this.getChildNodeById(this.selectedGroupCircle, nodePt.id);

                        if (nodeObj && nodeObj.clazz === 'AGENT' && nodeObj.status !== 3) {
                            this.canvas.style.cursor = 'pointer';
                            this.dragCanvas.style.cursor = 'pointer';

                            this.onNodeId = nodeObj.id;

                            this.isChildNodeFocus = true;
                            nodeObj.isDisplayNavigate = true;

                            if (nodeObj.isGroupMode !== true) {
                                this.drawNavigateSingleAgent(nodePt.x, nodePt.y, nodeObj, this.property.childOutCircle.radius, true);
                            } else {
                                this.drawNavigateMultiAgent(nodePt.x, nodePt.y, nodeObj, this.property.childOutCircle.radius, true);
                            }
                        }
                        break;
                    }
                }

                if (!this.isChildNodeFocus) {
                    this.clearNaviLayout();
                    if (this.selectedGroupCircle && this.selectedGroupCircle.clazz === 'AGENT') {
                        // TODO
                        // 하위 노드가 보여지고 있는 상태에서 마우스 이동시 아래 함수가 호출되고 있음.
                        // 코드 확인 필요.
                        this.drawNavigateCircle(this.selectedGroupCircle);
                    }
                }
            }

            this.isCloseHover = false;
            if (this.groupCloseIconPt && this.selectedGroupCircle &&
                this.groupCloseIconPt.x - 6 <= mx && this.groupCloseIconPt.x + 6 >= mx &&
                this.groupCloseIconPt.y - 6 <= my && this.groupCloseIconPt.y + 6 >= my ) {

                this.isCloseHover = true;
                this.dragCanvas.style.cursor = 'pointer';
                this.drawGroupLayout(this.selectedGroupCircle.id, true);
            }

            this.isSplitHover = false;
            if (this.groupSplitIconPt && this.selectedGroupCircle &&
                this.groupSplitIconPt.x - 6 <= mx && this.groupSplitIconPt.x + 6 >= mx &&
                this.groupSplitIconPt.y - 6 <= my && this.groupSplitIconPt.y + 6 >= my ) {

                this.isSplitHover = true;
                this.dragCanvas.style.cursor = 'pointer';
                this.drawGroupLayout(this.selectedGroupCircle.id, true);
            }

            // Image Icon Mouse Focus - Xview --------------------------------------------
            this.isFocusXviewIcon = false;
            if (this.xviewIconPt) {
                if (this.xviewIconPt.x1 <= mx && this.xviewIconPt.x2 >= mx &&
                    this.xviewIconPt.y1 <= my && this.xviewIconPt.y2 >= my ) {
                    this.isFocusXviewIcon = true;
                    this.isChangeColor = true;
                    this.canvas.style.cursor = 'pointer';
                    this.dragCanvas.style.cursor = 'pointer';

                    if (!this.isChildNodeFocus && this.selectedGroupCircle) {
                        this.clearNaviLayout();
                        this.selectedGroupCircle.isDisplayNavigate = true;
                        this.drawNavigateCircle(this.selectedGroupCircle);
                        this.onNodeId = this.selectedGroupCircle.id;
                    }
                    return;
                }
            }

            // Image Icon Mouse Focus - Zoom ---------------------------------------------
            this.isFocusZoomIcon = false;
            if (this.zoomIconPt) {
                if (this.zoomIconPt.x1 <= mx && this.zoomIconPt.x2 >= mx &&
                    this.zoomIconPt.y1 <= my && this.zoomIconPt.y2 >= my ) {
                    this.isFocusZoomIcon = true;
                    this.isChangeColor = true;
                    this.canvas.style.cursor = 'pointer';
                    this.dragCanvas.style.cursor = 'pointer';

                    if (!this.isChildNodeFocus && this.selectedGroupCircle) {
                        this.clearNaviLayout();
                        this.selectedGroupCircle.isDisplayNavigate = true;
                        this.drawNavigateCircle(this.selectedGroupCircle);
                        this.onNodeId = this.selectedGroupCircle.id;
                    }
                    return;
                }
            }

            // Image Icon Mouse Focus - Group --------------------------------------------
            this.isFocusGroupIcon = false;
            if (this.groupIconPt) {
                if (this.groupIconPt.x1 <= mx && this.groupIconPt.x2 >= mx &&
                    this.groupIconPt.y1 <= my && this.groupIconPt.y2 >= my ) {
                    this.isFocusGroupIcon = true;
                    this.isChangeColor = true;
                    this.canvas.style.cursor = 'pointer';
                    this.dragCanvas.style.cursor = 'pointer';

                    if (!this.isChildNodeFocus) {
                        this.clearNaviLayout();
                        this.selectedGroupCircle.isDisplayNavigate = true;
                        this.drawNavigateCircle(this.selectedGroupCircle);
                    }
                    return;
                }
            }

            // Image Icon Mouse Blur -----------------------------------------------------
            if (this.isChangeColor === true && this.isChildNodeFocus !== true) {
                this.isChangeColor = false;
                this.selectedGroupCircle.isDisplayNavigate = false;
                this.clearNaviLayout();
                this.drawNavigateCircle(this.selectedGroupCircle);
            }

            return;
        }

        //================================================================================
        // 메인 노드위에 마우스 오버 시 처리
        //================================================================================
        if (!this.isNodeDragMove && !this.isChildNodeSelected) {
        //if (!this.isNodeDragMove && !this.isChildNodeDragMove) {
            this.isNavigateDisplayInfo = false;

            this.isFocusWebNode = false;

            for (ix = 0, ixLen = this.nodeList.length; ix < ixLen; ix++ ) {
                nodeObj = this.nodeList[ix];
                nodeObj.isDisplayLineInfo = false;

                if (this.displayNodeLevel !== +nodeObj.level || (nodeObj.isGroupMode !== true && nodeObj.status === 3)) {
                    continue;
                }

                if (nodeObj.clazz === 'DB' &&
                    mx < nodeObj.x + 59/2 + this.canvas.offsetLeft && mx > nodeObj.x - 59/2 - this.canvas.offsetLeft &&
                    my < nodeObj.y + 65/2 + this.canvas.offsetTop  && my > nodeObj.y - 65/2 - this.canvas.offsetTop) {

                    this.onNodeId = nodeObj.id;
                    this.canvas.style.cursor = 'move';
                    this.dragCanvas.style.cursor = 'move';
                    return;
                    //break;

                } else if (nodeObj.clazz === 'SERVER' &&
                    mx < nodeObj.x + 64/2 + this.canvas.offsetLeft && mx > nodeObj.x - 64/2 - this.canvas.offsetLeft &&
                    my < nodeObj.y + 55/2 + this.canvas.offsetTop  && my > nodeObj.y - 55/2 - this.canvas.offsetTop) {

                    this.onNodeId = nodeObj.id;
                    this.canvas.style.cursor = 'move';
                    this.dragCanvas.style.cursor = 'move';
                    return;
                    //break;

                } else if (nodeObj.clazz === 'CLOUD' &&
                    mx < nodeObj.x + 91/2 + this.canvas.offsetLeft && mx > nodeObj.x - 91/2 - this.canvas.offsetLeft &&
                    my < nodeObj.y + 54/2 + this.canvas.offsetTop  && my > nodeObj.y - 54/2 - this.canvas.offsetTop) {

                    this.onNodeId = nodeObj.id;
                    this.canvas.style.cursor = 'move';
                    this.dragCanvas.style.cursor = 'move';
                    return;
                    //break;

                } else if (nodeObj.clazz === 'GROUP' &&
                    mx < nodeObj.x + 76/2 + this.canvas.offsetLeft && mx > nodeObj.x - 76/2 - this.canvas.offsetLeft &&
                    my < nodeObj.y + 71/2 + this.canvas.offsetTop  && my > nodeObj.y - 71/2 - this.canvas.offsetTop) {

                    this.onNodeId = nodeObj.id;
                    this.canvas.style.cursor = 'move';
                    this.dragCanvas.style.cursor = 'move';
                    return;
                    //break;

                } else if ((nodeObj.clazz === 'AGENT') &&
                    mx < nodeObj.x + 35 + this.canvas.offsetLeft && mx > nodeObj.x - 35 - this.canvas.offsetLeft &&
                    my < nodeObj.y + 35 + this.canvas.offsetTop  && my > nodeObj.y - 35 - this.canvas.offsetTop) {

                    if (this.isEnableAlarmTooltip) {
                        this.showAlarmTooltip(nodeObj);
                    }

                    this.onNodeId = nodeObj.id;

                    this.canvas.style.cursor = 'move';
                    this.dragCanvas.style.cursor = 'move';

                    if (this.xviewIconPt) {
                        if (this.xviewIconPt.x1 <= mx && this.xviewIconPt.x2 >= mx &&
                            this.xviewIconPt.y1 <= my && this.xviewIconPt.y2 >= my ) {
                            this.canvas.style.cursor = 'pointer';
                            this.dragCanvas.style.cursor = 'pointer';
                            this.onNodeId = nodeObj.id;
                        }
                    }

                    if (this.zoomIconPt) {
                        if (this.zoomIconPt.x1 <= mx && this.zoomIconPt.x2 >= mx &&
                            this.zoomIconPt.y1 <= my && this.zoomIconPt.y2 >= my ) {
                            this.canvas.style.cursor = 'pointer';
                            this.dragCanvas.style.cursor = 'pointer';
                            this.onNodeId = nodeObj.id;
                        }
                    }

                    if (this.groupIconPt) {
                        if (this.groupIconPt.x1 <= mx && this.groupIconPt.x2 >= mx &&
                            this.groupIconPt.y1 <= my && this.groupIconPt.y2 >= my ) {
                            this.canvas.style.cursor = 'pointer';
                            this.dragCanvas.style.cursor = 'pointer';
                        }
                    }

                    this.isNavigateDisplayInfo = true;
                    this.clearNaviLayout();

                    this.isDisplayRemoteActiveCount = true;
                    nodeObj.isDisplayLineInfo = true;
                    nodeObj.isDisplayNavigate = true;
                    //this.clearLineLayout();
                    //this.drawLineLayout();

                    if (nodeObj.isGroupMode !== true) {
                        this.drawNavigateSingleAgent(nodeObj.x, nodeObj.y, nodeObj);
                    } else {
                        this.drawNavigateMultiAgent(nodeObj.x, nodeObj.y, nodeObj);
                    }
                    break;

                // 웹 서버가 포함된 노드에서 웹 서버 아이콘에 마우스를 오버한 경우
                } else if (nodeObj.clazz === 'AGENT' && nodeObj.isWebContain &&
                    mx < nodeObj.x - 18 + this.canvas.offsetLeft && mx > nodeObj.x - 45 - this.canvas.offsetLeft &&
                    my < nodeObj.y - 18 + this.canvas.offsetTop  && my > nodeObj.y - 45 - this.canvas.offsetTop) {

                        this.canvas.style.cursor = 'pointer';
                        this.dragCanvas.style.cursor = 'pointer';
                        this.isFocusWebNode = true;
                        break;

                } else {
                    this.canvas.style.cursor = '';
                    this.dragCanvas.style.cursor = '';
                }
            }
        }

        //================================================================================
        // 노드 메뉴가 숨김 상태일 경우
        //================================================================================
        if (!this.isNavigateDisplayInfo) {
            this.isNavigateDisplayInfo = false;
            this.clearGroupLayout();
        }

        //================================================================================
        // 노드 메뉴 위치에 마우스가 위치했는지 여부 체크
        //================================================================================
        // X-View Image Icon Position
        this.isFocusXviewIcon = false;
        if (this.xviewIconPt) {
            if (this.xviewIconPt.x1 <= mx && this.xviewIconPt.x2 >= mx &&
                this.xviewIconPt.y1 <= my && this.xviewIconPt.y2 >= my ) {
                this.isFocusXviewIcon = true;
                return;
            }
        }
        // Zoom Image Icon Position
        this.isFocusZoomIcon = false;
        if (this.zoomIconPt) {
            if (this.zoomIconPt.x1 <= mx && this.zoomIconPt.x2 >= mx &&
                this.zoomIconPt.y1 <= my && this.zoomIconPt.y2 >= my ) {
                this.isFocusZoomIcon = true;
                return;
            }
        }
        // Group Image Icon Position
        this.isFocusGroupIcon = false;
        if (this.groupIconPt) {
            if (this.groupIconPt.x1 <= mx && this.groupIconPt.x2 >= mx &&
                this.groupIconPt.y1 <= my && this.groupIconPt.y2 >= my ) {
                this.isFocusGroupIcon = true;
                return;
            }
        }

        //================================================================================
        // 그룹 뷰에서 하위 노드를 선택해서 드래그하는 경우
        //================================================================================
        if (this.isChildNodeSelected) {
        //if (this.isChildNodeDragMove) {
            this.clearDragLayout();
            this.dragCtx.beginPath();
            this.dragCtx.arc(
                mx,
                my,
                this.property.outCircle.radius * 2,
                0,
                2 * Math.PI
            );
            this.dragCtx.closePath();
            this.dragCtx.strokeStyle = 'rgba('+this.getHexToRgb('#FFFFFF') +','+ 0.8 + ')';
            this.dragCtx.lineWidth = 1;
            this.dragCtx.stroke();
            this.dragCtx.fillStyle = 'transparent';
            this.dragCtx.fill();

            this.dragCtx.fillStyle = 'rgba('+this.getHexToRgb('#FFFFFF') +','+ 0.8 + ')';
            this.dragCtx.font      = 'normal 14px "Droid Sans"';
            this.dragCtx.textAlign = 'center';
            this.dragCtx.fillText(this.getNodeById(this.selectNodeObj.id).name, mx, my + 54);

            this.isChildNodeDragMove = true;
            return;
        }

        //================================================================================
        // 노드를 선택해서 드래그 하는 경우
        //================================================================================
        if (this.isNodeDragMove) {
            this.clearGroupLayout();

            //this.overCanvas.width = 0;
            //this.overCanvas.height = 0;
            this.clearOverLayout();

            if (this.selectNodeObj) {
                this.onNodeId = this.selectNodeObj.id;

                this.selectNodeObj.x = mx;
                this.selectNodeObj.y = my;
            }
            //this.canvasDraw();

            return;
        }

        //================================================================================
        // 화면 영역을 드래그하는 경우
        //================================================================================
        this.dragArea = null;
        if (this.isDragMultiSelection) {
            var x = Math.min(this.dragSelectionStartPt.x, mx) + 0.5,
                y = Math.min(this.dragSelectionStartPt.y, my) + 0.5,
                w = Math.abs(mx - this.dragSelectionStartPt.x) - 1,
                h = Math.abs(my - this.dragSelectionStartPt.y) - 1;

            this.clearDragLayout();
            this.dragCtx.save();

            this.dragCtx.strokeStyle = '#349BE7';
            this.dragCtx.lineWidth   = 1;
            this.dragCtx.lineJoin    = 'round';
            this.dragCtx.fillStyle   = 'rgba('+this.getHexToRgb('#349BE7') +','+ 0.5 + ')';

            this.dragCtx.fillRect(x, y, w, h);
            this.dragCtx.strokeRect(x, y, w, h);

            this.dragCtx.restore();

            this.dragArea = {x1: x, y1: y, x2: x + w, y2: y + h};

            return;
        }
    },


    /**
     * 캔버스에서 마우스 업 이벤트 처리
     */
    mouseUp: function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.isDrawingFolder || this.isWorkingMergeNode || this.isDrawingLayout) {
            return;
        }

        // mouse right click
        if (e.button === 2) {
            return;
        }

        if (e.ctrlKey && this.isPressCtrlKey) {
            return;
        }

        this.isPressCtrlKey = false;

        var mouse = this.getPointOnMouse(e);
        var mx = mouse.x;
        var my = mouse.y;
        var ix, ixLen;
        var nameBoxObj, nodeObj;

        var marginWidth, marginHeight;

        //================================================================================
        // Transaction Path View Mode
        //================================================================================
        if (this.isTxnPathMode) {
            for (ix = 0, ixLen = this.callTreeIconList.length; ix < ixLen; ix++ ) {
                nodeObj = this.callTreeIconList[ix];

                if (mx < nodeObj.x + nodeObj.radius + this.canvas.offsetLeft && mx > nodeObj.x - nodeObj.radius - this.canvas.offsetLeft &&
                    my < nodeObj.y + nodeObj.radius + this.canvas.offsetTop  && my > nodeObj.y - nodeObj.radius - this.canvas.offsetTop) {

                    if (nodeObj.type === 'SQL') {
                        if (this.openFullSQLText) {
                            nodeObj = this.getNodeById(nodeObj.id);
                            this.openFullSQLText(nodeObj.sqlId, nodeObj.bindList);
                        }
                    } else if (nodeObj.type === 'CallTree' && this.openCallTree) {
                        nodeObj = this.getNodeById(nodeObj.id);

                        if (nodeObj) {
                            this.openCallTree(nodeObj.tid, this.getServerIdByNodeId(nodeObj.id));
                        }
                    }
                    return;
                }
            }

            if (this.onNodeId) {
                this.saveTxnNodePosition(this.onNodeId, mx, my);
            }
            this.isNodeDragMove = false;
            return;
        }


        this.dragSelectionNodeList = [];

        if (this.isCheckCreateGroup) {
            this.canvas.style.cursor = '';
            this.dragCanvas.style.cursor = '';
            return;
        }

        if (this.isDisplayGroupMode === true) {

            if (this.isChildNodeDragMove === true) {

                if (mx < this.selectedGroupCircle.x + this.groupCircleRadius * 2 + this.canvas.offsetLeft &&
                    mx > this.selectedGroupCircle.x - this.groupCircleRadius * 2 - this.canvas.offsetLeft &&
                    my < this.selectedGroupCircle.y + this.groupCircleRadius * 2 + this.canvas.offsetTop  &&
                    my > this.selectedGroupCircle.y - this.groupCircleRadius * 2 - this.canvas.offsetTop) {

                } else {
                    this.spliceGroupNode(this.selectedGroupCircle, this.selectNodeObj, mx, my);
                    this.isDisplayGroupMode = false;
                }
                this.selectNodeObj = null;
            }

            if (this.dragSelectionStartPt && this.dragSelectionStartPt.x === mx && this.dragSelectionStartPt.y === my) {
                if (this.groupSplitIconPt &&
                    mx < this.groupSplitIconPt.x + this.groupSplitIconPt.r + 2 && mx > this.groupSplitIconPt.x - this.groupSplitIconPt.r - 2 &&
                    my < this.groupSplitIconPt.y + this.groupSplitIconPt.r + 2 && my > this.groupSplitIconPt.y - this.groupSplitIconPt.r - 2) {
                    this.splitGroupNode();

                } else if (this.groupCloseIconPt &&
                    mx < this.groupCloseIconPt.x + this.groupCloseIconPt.r + 2 && mx > this.groupCloseIconPt.x - this.groupCloseIconPt.r - 2 &&
                    my < this.groupCloseIconPt.y + this.groupCloseIconPt.r + 2 && my > this.groupCloseIconPt.y - this.groupCloseIconPt.r - 2) {
                    this.closeGroupView();
                }
            }

//            if (!this.isFocusGroupIcon  || this.selectGroupIdArr.length <= 0) {
//                this.isDisplayGroupMode = false;
//            }
            this.isChildNodeDragMove = false;
            this.isChildNodeSelected = false;
        }

        this.clearDragLayout();

        //if (!this.isDisplayGroupMode) {
        if (!this.getFocus()) {
            //this.clearGroupLayout();
            this.clearAllGroupLayout();
        }


        this.stopRenderLoop();

        // Clear icon image position
        this.xviewIconPt = null;
        this.zoomIconPt  = null;
        this.groupIconPt = null;

        //================================================================================
        // Merge Selected Node (create Group Node)
        //================================================================================
        if (this.selectNodeObj && !this.isDisplayGroupMode) {
            var crossNode = this.checkCrossNode(this.selectNodeObj.id, mx, my);

            if (crossNode) {
                this.checkMergeNode(this.selectNodeObj);
                this.canvasDraw();
            }
        }

        //================================================================================
        // Merge drag selection node (Create Group Node)
        //================================================================================
        if (this.dragArea) {
            for (ix = 0, ixLen = this.nodeList.length; ix < ixLen ; ix++) {
                nodeObj = this.nodeList[ix];

                if (this.displayNodeLevel !== +nodeObj.level) {
                    continue;
                }

                if (nodeObj.clazz === 'AGENT' || nodeObj.clazz === 'GROUP') {
                    if (this.dragArea.x1 < nodeObj.x + 5 + this.canvas.offsetLeft && this.dragArea.x2 > nodeObj.x - 5 - this.canvas.offsetLeft &&
                        this.dragArea.y1 < nodeObj.y + 5 + this.canvas.offsetTop  && this.dragArea.y2 > nodeObj.y - 5 - this.canvas.offsetTop) {
                        this.dragSelectionNodeList[this.dragSelectionNodeList.length] = nodeObj;
                    }
                } else if (nodeObj.clazz === 'SERVER') {
                    if (this.dragArea.x1 < nodeObj.x + 45 + this.canvas.offsetLeft && this.dragArea.x2 > nodeObj.x - 0 - this.canvas.offsetLeft &&
                        this.dragArea.y1 < nodeObj.y + 25 + this.canvas.offsetTop  && this.dragArea.y2 > nodeObj.y - 0 - this.canvas.offsetTop) {
                        this.dragSelectionNodeList[this.dragSelectionNodeList.length] = nodeObj;
                    }
                } else if (nodeObj.clazz === 'CLOUD') {
                    if (this.dragArea.x1 < nodeObj.x + 45 + this.canvas.offsetLeft && this.dragArea.x2 > nodeObj.x - 0 - this.canvas.offsetLeft &&
                        this.dragArea.y1 < nodeObj.y + 25 + this.canvas.offsetTop  && this.dragArea.y2 > nodeObj.y - 0 - this.canvas.offsetTop) {
                        this.dragSelectionNodeList[this.dragSelectionNodeList.length] = nodeObj;
                    }
                } else if (nodeObj.clazz === 'DB') {
                    if (this.dragArea.x1 < nodeObj.x + 45 + this.canvas.offsetLeft && this.dragArea.x2 > nodeObj.x - 0 - this.canvas.offsetLeft &&
                        this.dragArea.y1 < nodeObj.y + 25 + this.canvas.offsetTop  && this.dragArea.y2 > nodeObj.y - 0 - this.canvas.offsetTop) {
                        this.dragSelectionNodeList[this.dragSelectionNodeList.length] = nodeObj;
                    }
                }
            }

            if (this.dragSelectionNodeList.length > 1) {
                this.isWorkingMergeNode = true;
                this.mergeGroupMultiSelectNode(
                    this.dragArea.x1,
                    this.dragArea.y1,
                    this.dragArea.x2 - this.dragArea.x1,
                    this.dragArea.y2 - this.dragArea.y1
                );
            }
            this.dragArea = null;
        }

        this.isDragMultiSelection = false;
        this.isNodeDragMove = false;

        //================================================================================
        // 마우스 클릭 이벤트
        //================================================================================
        if (this.dragSelectionStartPt && this.dragSelectionStartPt.x === mx && this.dragSelectionStartPt.y === my) {

            // Group Node (Exclude Circle Type Group)
            for (ix = 0, ixLen = this.nodeList.length; ix < ixLen; ix++ ) {
                nodeObj = this.nodeList[ix];

                if (nodeObj.clazz === 'AGENT' || nodeObj.isGroupMode !== true) {
                    continue;
                }

                if (mx < nodeObj.x + 76/2 + this.canvas.offsetLeft && mx > nodeObj.x - 76/2  - this.canvas.offsetLeft &&
                    my < nodeObj.y + 71/2 + this.canvas.offsetTop  && my > nodeObj.y - 71/2 - this.canvas.offsetTop && this.selectNodeObj) {

                    this.isDisplayGroupMode = true;
                    this.drawGroupLayout(this.selectNodeObj.id);

                    //this.overCanvas.width = 0;
                    //this.overCanvas.height = 0;
                    this.clearOverLayout();

                    return;
                }
            }
        }

        //================================================================================
        // 노드 메뉴에서 마우스 클릭 이벤트
        //================================================================================
        var wasId;

        // 노드 메뉴 클릭 - 액티브 트랜잭션 모니터 아이콘
        if (this.isFocusXviewIcon && this.openTxnMonitor) {
            this.isFocusXviewIcon = false;

            nodeObj = this.getNodeById(this.onNodeId);

            wasId = [];
            if (nodeObj && nodeObj.childList.length > 0) {
                for (ix = 0; ix < nodeObj.childList.length; ix++) {
                    //wasId += (((ix === 0)? '':',') + nodeObj.childList[ix].id.split('-')[1]);
                    if (nodeObj.childList[ix].clazz === 'AGENT' && nodeObj.childList[ix].type === ''){
                        wasId[wasId.length] = nodeObj.childList[ix].id.split('-')[1];
                    }

                }
                this.openTxnMonitor(wasId.join(), nodeObj.alias);
            } else {
                if (nodeObj) {
                    this.openTxnMonitor(this.onNodeId.split('-')[1], nodeObj.alias);
                }
            }

            this.clearAllGroupLayout();

            //this.overCanvas.width = 0;
            //this.overCanvas.height = 0;
            this.clearOverLayout();

            return;
        }

        // 노드 메뉴 클릭 - 액티브 트랜잭셕 목록 아이콘
        if (this.isFocusZoomIcon && this.openTxnList) {
            this.isFocusZoomIcon = false;

            nodeObj = this.getNodeById(this.onNodeId);

            wasId = [];
            if (nodeObj && nodeObj.childList.length > 0) {
                for (ix = 0; ix < nodeObj.childList.length; ix++) {
                    //wasId += (((ix === 0)? '':',') + nodeObj.childList[ix].id.split('-')[1]);
                    wasId[wasId.length] = nodeObj.childList[ix].id.split('-')[1];
                }

                this.openTxnList(wasId.join(), null, null, null, null, nodeObj.alias, null);
            } else {
                if (nodeObj) {
                    this.openTxnList(+this.onNodeId.split('-')[1], null, null, null, null, nodeObj.alias, null);
                }
            }

            this.clearAllGroupLayout();

            //this.overCanvas.width   = 0;
            //this.overCanvas.height  = 0;
            this.clearOverLayout();

            return;
        }

        // 노드 메뉴 클릭 - 그룹 뷰 아이콘
        if (this.isFocusGroupIcon && this.selectNodeObj) {
            if (this.isDisplayGroupMode) {
                this.displayGroupViewStep = this.displayGroupViewStep > 0? this.displayGroupViewStep + 1 : 1;
            } else {
                this.displayGroupViewStep = 1;
            }

            this.isFocusGroupIcon = false;
            this.isDisplayGroupMode = true;
            this.drawGroupLayout(this.selectNodeObj.id);

            this.selectGroupIdArr.push(this.selectNodeObj.id);

            return;
        }

        // 노드 클릭 - 웹 노드 아이콘
        if (this.isFocusWebNode && this.selectNodeObj) {
            this.displayGroupViewStep = 1;

            this.isFocusWebNode = false;
            this.isDisplayGroupMode = true;

            this.drawWebGroupLayout(this.selectNodeObj.id);

            return;
        }

        //================================================================================
        // Save Node List, Position, Relation
        //================================================================================
        if (!this.isCheckCreateGroup && this.onNodeId) {
            if (this.isAutoSave) {
                this.saveNodePosition(this.onNodeId, mx, my);
            }
        }

        if (this.displayGroupViewStep > 1) {
            this.overCanvas.style.zIndex = 7;

        } else if (this.displayGroupViewStep > 0) {
            this.overCanvas.style.zIndex = 4;
        }

        if (this.displayGroupViewStep === 0) {
            this.overCanvas.style.zIndex = 4;
            this.clearOverLayout();
        }

        if (!this.isCheckCreateGroup) {
            this.selectNodeObj = null;
        }

        //================================================================================
        // 노드명 편집
        //================================================================================
        this.textInputMode = this.inputMode.BLANK;

        this.groupNameInputBox.style.display = 'none';
        this.groupNameInputBox.value = '';

        if (this.isOnFocusNodeName === true && this.dragSelectionNodeList.length <= 0) {

            for (ix = 0, ixLen = this.nodeNameBoxList.length; ix < ixLen; ix++ ) {
                nameBoxObj = this.nodeNameBoxList[ix];

                if (nameBoxObj.width > 120) {
                    marginWidth = 75;
                    marginHeight = Math.trunc(12 * nameBoxObj.width / 120);
                } else {
                    marginWidth = 45;
                    marginHeight = 0;
                }

                if (mx < nameBoxObj.x + marginWidth + this.canvas.offsetLeft && mx > nameBoxObj.x - marginWidth - this.canvas.offsetLeft &&
                    my < nameBoxObj.y + marginHeight + this.canvas.offsetTop  && my > nameBoxObj.y - marginHeight - 10 - this.canvas.offsetTop) {

                    this.textInputMode = this.inputMode.NODE_NAME;
                    this.editNameNode = this.getNodeById(nameBoxObj.parentId);

                    this.nodeInfoCanvas.style.zIndex = 3;
                    this.overCanvas.width = this.componentWidth;
                    this.overCanvas.height = this.componentHeight;
                    this.overCtx.save();
                    this.overCtx.fillStyle = 'rgba('+this.getHexToRgb('#212227') +','+ 0.6 + ')';
                    this.overCtx.fillRect(0, 0, this.overCanvas.width, this.overCanvas.height);
                    this.overCtx.restore();

                    this.groupNameInputBox.style.display = '';
                    this.groupNameInputBox.style.opacity = 1;
                    this.groupNameInputBox.style.width = nameBoxObj.width + 10 + 'px';
                    this.groupNameInputBox.value = nameBoxObj.value;
                    this.groupNameInputBox.focus();
                    this.groupNameInputBox.style.top = nameBoxObj.y - 12 + 'px';
                    this.groupNameInputBox.style.left = nameBoxObj.x - (nameBoxObj.width/2) + 'px';
                    break;
                }
            }
            return;
        }

        //================================================================================
        // Click Line Event - Open Active Txn List
        //================================================================================
        if (this.isOnFocusRemoteInfo === true) {

            for (ix = 0, ixLen = this.remoteInfoBoxList.length; ix < ixLen; ix++ ) {
                nameBoxObj = this.remoteInfoBoxList[ix];

                marginWidth = 40;
                marginHeight = 26;

                if (mx < nameBoxObj.x + marginWidth + this.canvas.offsetLeft && mx > nameBoxObj.x - this.canvas.offsetLeft &&
                    my < nameBoxObj.y + marginHeight + this.canvas.offsetTop  && my > nameBoxObj.y - this.canvas.offsetTop) {

                    if (this.openTxnList) {
                        this.openTxnList(
                            nameBoxObj.fromServerId,
                            nameBoxObj.dest,
                            nameBoxObj.destKey,
                            nameBoxObj.toServerId,
                            nameBoxObj.toServerType,
                            nameBoxObj.fromName,
                            nameBoxObj.toName
                        );

                        //this.overCanvas.width = 0;
                        //this.overCanvas.height = 0;
                        this.clearOverLayout();

                        return;
                    }
                    break;
                }
            }
            return;
        }

    }
};



/**
 * @type
 */
XMTopology.prototype.nodeClass = {

    node: function(clazz, id, name, type, objX, objY, isGroup, remoteType, serverType, serverId) {
        arguments[7] // server type
        arguments[8] // server id

        this.clazz = clazz || 'AGENT';               // 노드 타입
        this.id    = id;                             // 노드 ID
        this.name  = name || '';                     // 노드명
        this.alias = this.name;                      // 노드 별칭
        this.type  = type || '';                     // 구간 타입
        this.level = 0;                              // 표시 계층 레벨
        this.isGroupMode = isGroup || false;         // 그룹 표시 상태인지 아닌지 구분값
        this.status = 0;                             // 알람 상태
        this.x      = objX || 0;                     // 가로 표시 위치
        this.y      = objY || 0;                     // 세로 표시 위치
        this.value  = 0;                             // 액티브 트랜잭션 건수
        this.depth  = 0;                             // 표시 순서 (현재는 미사용)
        this.childList         = [];                 // 노드에 포함된 하위 노드 목록
        this.childIdAllList    = [];                 // 노드에 포함된 하위 노드 ID 목록
        this.childNodeAllCount = 0;                  // 노드에 포함된 하위 노드 개수
        this.webList           = [];                 // 노드와 연결된 웹 서버 목록
        this.webNodeAllCount   = 0;                  // 노드와 연결된 웹 서버 개수
        this.isWebContain      = false;              // 노드에 웹 서버 연결 유무
        this.parentId    = '';                       // 하위 노드인 경우, 상위 노드 ID
        this.remoteType  = remoteType || '';         // 연결 타입
        this.serverType  = serverType || '';         // 서버 타입
        this.serverId    = serverId   || 0;          // 서버 ID
        this.remoteCount = {};                       // 리모트 개수

        var nodePot;

        if (Comm.web_env_info.topologyNodePosition && !isGroup) {
            nodePot = JSON.parse(Comm.web_env_info.topologyNodePosition);
            if (nodePot[id]) {
                this.x = nodePot[id].x || 0;
                this.y = nodePot[id].y || 0;
            }
        }

        if (this.isTxnPathMode && Comm.web_env_info.topologyTxnNodePosition) {
            nodePot = JSON.parse(Comm.web_env_info.topologyTxnNodePosition);
            if (nodePot[id]) {
                this.x = nodePot[id].x || 0;
                this.y = nodePot[id].y || 0;
            }
        }
        return this;
    },
    nodeNameBox: function(parentId, x, y, name, width) {
        this.parentId = parentId;
        this.x = x || 0;
        this.y = y || 0;
        this.value = name || '';
        this.width = (width && width > 120)? width : 120;

        return this;
    },
    remoteInfoBox: function(wasId, x, y, width, height) {
        this.wasId = wasId;
        this.x = x || 0;
        this.y = y || 0;
        this.width = (width && width > 120)? width : 120;
        this.height = (height && height > 120)? height : 120;

        return this;
    },
    callTreeIcon: function(nodeId, x, y, radius, type) {
        this.id = nodeId;
        this.x = x || 0;
        this.y = y || 0;
        this.radius = radius || 20;
        this.type = type || ''

        return this;
    }
};


/**
 * Node, Connect, DB Property
 */
XMTopology.prototype.property = {
    childInCircle: {
        strokeStyle : '#FFF',
        lineWidth   : 6,
        fillStyle   : '#64b40a',
        criticalFill: '#db121a',
        warningFill : '#FF9803',
        radius      : 7
    },
    childOutCircle: {
        strokeStyle : '#FFF',
        lineWidth   : 1,
        fillStyle   : '#64b40a',
        criticalFill: '#db121a',
        warningFill : '#FFD300',
        radius      : 9
    },
    inCircle: {
        strokeStyle : '#FFF',
        lineWidth   : 15,
        fillStyle   : '#64b40a',
        criticalFill: '#db121a',
        warningFill : '#FF9803',
        radius      : 13
    },
    outCircle: {
        strokeStyle : '#FFF',
        lineWidth   : 1,
        fillStyle   : '#7fe60d',
        criticalFill: '#f5989d',
        warningFill : '#FFD300',
        radius      : 17
    },
    selectCircle: {
        strokeStyle : '#FFF',
        lineWidth   : 1,
        fillStyle   : '#FFFFFF',
        radius      : 32
    },
    alarmTipRect: {
        lineWidth: 0.3,
        fontColor: {
            normal  : '#64B40A',
            warning : '#FFD300',
            critical: '#DF6264'
        },
        fillStyle: {
            normal  : '#64B40A',
            warning : '#FF9803',
            critical: '#DB121A',
            down    : '#72757B'
        },
        width : 280,
        height: 70,
        radius: 5
    },
    rect: {
        lineWidth: 0.3,
        fillStyle: {
            normal  : '#64B40A',
            warning : '#FF9803',
            critical: '#DB121A',
            down    : '#72757B'
        },
        width : 140,
        height: 70,
        radius: 5
    },
    xViewIcon: {
        strokeStyle: '#FFF',
        lineWidth  : 3.5,
        fillStyle  : '#b2b2b2',
        radius     : 5
    },
    agentType: {
        strokeStyle: '#FFF',
        lineWidth  : 1.5,
        fillStyle  : '#2384f2',
        radius     : 6
    },
    cloud: {
        width : 20,
        height: 20
    },
    iconImg: {
        src: '../images/topology_icon.png'
    },
    relationPoint: {
        strokeStyle: '#000000',
        lineWidth  : 1,
        fillStyle  : '#000000',
        radius     : 1
    },
    relationLine: {
        strokeStyle   : '#7fe60d',
        fillStyle     : '#7fe60d',
        criticalStroke: '#f5989d',
        criticalFill  : '#f5989d',
        warningStroke : '#FFD300',
        warningFill   : '#FFD300',
        lineWidth     : 0.3,
        type          : ''
    },
    relationLineArrow: {
        fillStyle: '#7fe60d'
    },
    relationBox: {
        fillStyle     : '#db121a',
        strokeStyle   : '#db121a',
        criticalStroke: '#db121a',
        criticalFill  : '#db121a',
        warningStroke : '#FF9803',
        warningFill   : '#FF9803',
        lineWidth     : 1.5,
        type          : ''
    },
    arrow: {
        h: 5,
        w: 10
    }
};


//////////////////////////////////////////////////////////////////////////////////////////
// Relation Line Effect Class
//////////////////////////////////////////////////////////////////////////////////////////
XMTopology.LineEffect = function(targetCtx) {
    this.effectCtx = targetCtx;
    this.lineDrawAnimateId = null;
    this.lineList = null;
    this.line = null;
    this.ballColor = null;
    this.isDrawing = false;

    this.criticalBall = '#f5989d';
    this.warningBall  = '#FFD300'
    this.normalBall   = '#7fe60d'

    this.linePositionLength = 100;

    this.ballPos = null;

    this.lineFPS = {
        fps: 25,
        now: null,
        then: Date.now(),
        interval : 1000 / 45
    };

    this.drawLineEffect = function(index) {
        // Check Animation Frame Performance
        //window.cancelAnimationFrame(this.lineDrawAnimateId);

        if (!this.effectCtx) {
            return;
        }

        if (this.isLineAnimate !== true) {
            this.effectCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            return;
        }

        this.lineFPS.now = Date.now();
        this.delta = this.lineFPS.now - this.lineFPS.then;

        if (this.delta > this.lineFPS.interval) {

            this.effectCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

            this.isDrawing = true;

            for (var ix = 0; ix < this.lineList.length; ix++) {

                if (!this.isDrawAnimate(this.lineList[ix].from, this.lineList[ix].to)) {
                    continue
                }
                this.ballPos = this.getRelationLinePosIndex(this.lineList[ix], index);

                if (!this.ballPos) {
                    continue;
                }

                this.effectCtx.beginPath();
                this.effectCtx.arc(
                    this.lineList[ix].sx + this.ballPos[0],
                    this.lineList[ix].sy + this.ballPos[1],
                    3,
                    0,
                    2 * Math.PI
                );
                this.effectCtx.closePath();

                if (this.lineList[ix].status === 2) {
                    this.ballColor =  this.criticalBall;
                } else if (this.lineList[ix].status === 1) {
                    this.ballColor =  this.warningBall;
                } else {
                    this.ballColor =  this.normalBall;
                }
                this.effectCtx.fillStyle = (index % 20 > 10)? this.ballColor : '#FFFFFF';
                this.effectCtx.fill();
            }

            this.lineFPS.then = this.lineFPS.now - (this.delta % this.lineFPS.interval);
        }

        index++;

        if (index > this.linePositionLength) {
            index = 0;
            setTimeout(function(index) {
                this.lineDrawAnimateId = window.requestAnimationFrame(this.drawLineEffect.bind(this, index));
            }.bind(this), 100, index);
        } else {
            this.lineDrawAnimateId = window.requestAnimationFrame(this.drawLineEffect.bind(this, index));
        }

    },

    this.getRelationLinePosIndex = function(line, index){
        var xDistance = line.sx - line.ex;
        var yDistance = line.sy - line.ey;
        var xDirect;
        var distance;
        var point;
        var angle;
        var xRatio;

        // X 방향
        if (xDistance > 0) {
            xDirect = -1;
        } else {
            xDirect = 1;
        }
        xDistance = Math.abs(xDistance);
        yDistance = Math.abs(yDistance);
        distance = Math.max(Math.abs(xDistance), Math.abs(yDistance));

        xRatio = xDistance / distance;
        // 기울기
        angle = Math.max(((line.ey - line.sy) || 1) / ((line.ex - line.sx) || 1));

        point = (distance / this.linePositionLength) * index;

        var x = point * xDirect * xRatio;
        var y = angle * x;

        return [x, y];
    },

    this.isDrawAnimate = function(fromId, toId){
        var ix, ixLen;
        var fromNodeId, toNodeId;
        var isFromNodeMatch, isToNodeMatch;
        var isDraw = false;

        for (ix = 0, ixLen = this.drawLineList.length; ix < ixLen; ix++) {

            isFromNodeMatch = false;
            isToNodeMatch   = false;

            fromNodeId = this.drawLineList[ix][0];
            toNodeId   = this.drawLineList[ix][1];

            // 출발 노드가 그룹 노드인 경우
            if (fromId && fromId.indexOf('GROUP-') === 0) {
                isFromNodeMatch = this.getNodeIdArrById(fromId).indexOf(fromNodeId) !== -1;

            } else if (fromNodeId === fromId) {
                isFromNodeMatch = true;
            }

            // 도착 노드가 그룹 노드인 경우
            if (toId && toId.indexOf('GROUP-') === 0) {
                isToNodeMatch = this.getNodeIdArrById(toId).indexOf(toNodeId) !== -1;

            } else if (toNodeId === toId) {
                isToNodeMatch = true;
            }

            // 값이 일치하는 경우 애니메이션 처리
            if (isFromNodeMatch && isToNodeMatch) {
                isDraw = true;
                break;
            }
        }
        return isDraw;
    },


    this.getNodeIdArrById = function(id) {
        var nodeIdArr = [];

        var parentNode = this.nodeMap[id];
        if (parentNode && parentNode.childIdAllList && parentNode.childIdAllList.length > 0) {
            nodeIdArr = parentNode.childIdAllList.concat();
        }
        parentNode = null;

        return nodeIdArr;
    },

    this.getNodeIdArrById_old = function(id) {
        var ix = 0, ixLen = this.nodeList.length;
        var jx, jxLen;
        var parentNode;
        var nodeIdArr = [];

        for (; ix < ixLen; ix++) {
            if (this.nodeList[ix].id === id) {
                parentNode = this.nodeList[ix];
                for (jx = 0, jxLen = parentNode.childList.length; jx < jxLen; jx++) {
                    nodeIdArr[nodeIdArr.length] = parentNode.childList[jx].id;
                }
            }
        }

        if (parentNode) {
            parentNode = null;
        }

        return nodeIdArr.concat();
    }

};

