/**
 * @note 전체 창에 중요 알람(서버 on, down 등)의 상태를 관리한다.
 */
var AlertWindowManager = function(arg){
    this.initProperty(arg);
    this.init();
    this.bindEvent();

    this.aa = 1;

    arg = null;
};

AlertWindowManager.prototype.init = function(){
    this.container = document.createElement('div');
    this.container.setAttribute('style', 'position:absolute;right:15px;bottom:21px;');

    this.target.appendChild(this.container);
};

AlertWindowManager.prototype.initProperty = function(arg){
    this.id         = null;
    //this.alertList  = [];
    this.alertList  = {};
    this.firstAlarm = true;

    this.alertWindowWidth = 800;
    this.alertWindowHeight = 400;

    for(var key in arg){
        if(this[key] !== undefined){
            this[key] = arg[key];
        }
    }

    this.target = document.body;

    arg = null;
};

AlertWindowManager.prototype.bindEvent = function(){
    var self = this;

    window.onresize = function(e){
        if(e){
            e.preventDefault();
        }


        //this.resizeTimer = setTimeout(function(){
        var margin = 10;
        var alertHeight = self.alertWindowHeight + margin;
        var list = Object.keys(self.alertList);
        var len = list.length;
        var row = Math.ceil(window.innerHeight / alertHeight) - 1;
        var lineHeight = alertHeight * row;
        var col = -1;

        for(var ix = 0; ix < len; ix++){
            if(ix % row == 0){
                col++;
            }

            self.alertList[list[ix]].style.top = ((alertHeight * -(ix + 1)) + (lineHeight * col)) + 'px';
            self.alertList[list[ix]].style.left = ((self.alertWindowWidth * -(col + 1)) - (margin * col)) + 'px';

            if(ix == 0){
                if(self.alertList[list[ix]].className.indexOf('first') == -1){
                    self.alertList[list[ix]].className += ' first';
                }
            }
        }
        //}, 300);

    };
};

AlertWindowManager.prototype.createItem = function(alert){
    if(this.alertList[ alert.instanceName ] == null){
        var alertLayer = document.createElement('div');
        alertLayer.className = 'xm-server-status-alarm';
        alertLayer.dataset.instanceName = alert.instanceName;

        var headerLayer = document.createElement('div');
        headerLayer.className = 'xm-server-status-alarm-header';

        var title = document.createElement('div');
        // title.textContent = alert.instanceName;
        title.textContent = '';
        title.className = 'xm-server-status-alarm-header-title';

        var headerFin = document.createElement('div');

        headerLayer.appendChild(title);
        headerLayer.appendChild(headerFin);

        var headerCloseBtn = document.createElement('div');
        headerCloseBtn.textContent = 'x';
        headerCloseBtn.className = 'xm-server-status-alarm-header-close opacity-hover';
        headerCloseBtn.onclick = this.closeEvent.bind(this);

        var headerCloseAllBtn = document.createElement('div');
        headerCloseAllBtn.textContent = common.Util.TR('CLOSE ALL');
        headerCloseAllBtn.className = 'xm-server-status-alarm-header-close-all opacity-hover';
        headerCloseAllBtn.onclick = this.closeAllEvent.bind(this);

        headerLayer.appendChild(headerCloseAllBtn);
        headerLayer.appendChild(headerCloseBtn);

        var contentLayer = document.createElement('div');
        // contentLayer.innerHTML = '<div>[ ' + Ext.Date.format(new Date(alert.time), Comm.dateFormat.HMSMS) + ' ] ' + alert.alertName + '</div>';
        contentLayer.innerHTML = '<div>' +
            '11시 36분 현재, 1개 거래 트랜잭션에서 이상이 탐지되었습니다.<br>' +
            '문제 거래 트랜잭션의 평균 수행 시간이, 정상 범위를 3.54 편차만큼 벗어났습니다.<br>'+
            '추가로 해당 거래 트랜잭션의 1개 수치에서 이상이 발견되었습니다.<br>' +
            'SQL 처리 관련 수치입니다.<br><br>' +

            '구간별 근본원인 분석 결과, Oracle Database, 1개의 구간에서 문제를 발견했습니다.<br><br>' +

            'Oracle Database 구간에서는 1개의 인스턴스에서 문제가 발견되었으며<br>' +
            '세부적으로는, 인스턴스 6에서 동시성 제어 관련, 유입 부하 증감 관련 지표에 변화가 발생했습니다.<br>' +
            'SQL 상세 분석 결과, 특정 SQL에서 다음의 문제가 발견되었습니다.<br>' +
            'SQL wait 이벤트에서, enq: TX - row lock contention 이벤트가 비정상적으로 증가했습니다.<br>' +
            'SQL stat에서, physical reads, redo size 수치가 비정상적으로 증가했습니다.'
        + '</div>';
        contentLayer.className = 'xm-server-status-alarm-body';

        alertLayer.appendChild(headerLayer);
        alertLayer.appendChild(contentLayer);

        this.container.appendChild(alertLayer);
        this.alertList[ alert.instanceName ] = alertLayer;
    }else{
        var content = this.alertList[ alert.instanceName].childNodes[1];
        content.innerHTML = '<div>[ ' + Ext.Date.format(new Date(alert.time), Comm.dateFormat.HMSMS) + ' ] ' + alert.alertName + '</div>' + content.innerHTML;
    }
};

/**
 *
 * @param data
 * [time, serverType, serverId, serverName, alertResourceName, alertValue, alertResourceName, alertLevel, alertType, description]
 */
AlertWindowManager.prototype.addItem = function(data){
    var alert = {
        width   : this.alertWindowWidth,
        height  : this.alertWindowHeight,
        time    : +new Date(data[0]),
        instanceName: data[3],
        level   : data[7],
        alertName : data[4],
        firstAlarm: this.firstAlarm
    };

    if (this.aa == 1) {
        this.createItem(alert);
        this.aa = 2;
    }

    this.firstAlarm = false;

    window.onresize();

    data = null;
};


AlertWindowManager.prototype.removeItem = function(instanceName){
    if(this.alertList[instanceName] == null){
        return;
    }
    this.alertList[instanceName].remove();
    delete this.alertList[instanceName];

    var margin = 10;
    var alertHeight = this.alertWindowHeight + margin;
    var list = Object.keys(this.alertList);
    var len = list.length;
    var row = Math.ceil(window.innerHeight / alertHeight) - 1;
    var lineHeight = alertHeight * row;
    var col = -1;

    for(var ix = 0; ix < len; ix++){
        if(ix % row == 0){
            col++;
        }

        this.alertList[list[ix]].style.top = ((alertHeight * -(ix + 1)) + (lineHeight * col)) + 'px';
        this.alertList[list[ix]].style.left = ((this.alertWindowWidth * - (col + 1)) - (margin * col)) + 'px';

        if(ix == 0){
            if(this.alertList[list[ix]].className.indexOf('first') == -1){
                this.alertList[list[ix]].className += ' first';
            }
        }
    }
};


AlertWindowManager.prototype.removeAllItem = function(){
    var list = Object.keys(this.alertList);
    for(var ix = 0, ixLen = list.length; ix < ixLen; ix++){
        this.alertList[list[ix]].remove();
        delete this.alertList[list[ix]];
    }

    this.firstAlarm = true;
};

AlertWindowManager.prototype.closeEvent = function(e){
    this.removeItem(e.target.parentElement.parentElement.dataset.instanceName);
};

AlertWindowManager.prototype.closeAllEvent = function(){
    this.removeAllItem();
};
