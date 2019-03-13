var XMAlertWindow = function(arg){
    this.initProperty(arg);
    this.init();

    arg = null;
};

XMAlertWindow.prototype.init = function(){
    this.createLayer();
};

XMAlertWindow.prototype.initProperty = function(arg){
    this.parent = null;
    this.target = null;
    this.width = 200;
    this.height = 60;
    this.level = null;
    this.alertName = null;
    this.instanceName = null;
    this.time = null;
    this.desc = null;
    this.timer = null;
    this.index = null;

    this.criticalCss = {
        'box-shadow': '0px 0px 6px #CD3F3F',
        'background': 'linear-gradient(to bottom, #FACAD4 0%, #f8b2c2 50%, #f694ab 100%)',
        'border'    : '2px solid #c1002c'
    };

    for(var key in arg){
        if(this[key] !== undefined){
            this[key] = arg[key];
        }
    }

    arg = null;
};

XMAlertWindow.prototype.createLayer = function(){
    this.$alertLayer  = $('<div class="xm-server-status-alarm"></div>').css({
        position        : 'absolute',
        width           : this.width,
        height          : this.height,
        display         : 'none',
        transition      : 'all',
        borderRadius    : '5px',
        zIndex          : 999999,
        border          : '1px solid #ff2b2b',
        fontSize        : '14px',
        color           : '#fff'
    });

    var $headerLayer = $('<div></div>').css({
        position    : 'relative',
        top         : '0px',
        left        : '0px',
        height      : 38,
        width       : '100%'
    });

    var $title = $('<div></div>',{
        text : this.instanceName
    }).css({
        position    : 'absolute',
        top         : '17px',
        left        : '23px',
        fontSize    : '15px'
    });

    this.$headerCloseBtn = $('<div>x</div>',{
        'class' : 'opacity-hover'
    }).css({
        position    : 'absolute',
        top         : '3px',
        right       : '9px',
        cursor      : 'pointer',
        color       : '#fff',
        fontSize    : '18px',
        textShadow  : '0px 0px 1px #000'
    }).click(function(){
        this.parent.removeItem(this.index);

    }.bind(this));

    this.$headerFin = $('<div></div>').css({

    });

    this.$contentLayer = $('<div></div>',{
        text: '[ ' + Ext.Date.format(new Date(this.time), Comm.dateFormat.HMSMS) + ' ] ' + this.alertName
    }).css({
        position        : 'relative',
        width           : '100%',
        height          : '60px',
        paddingLeft     : '23px'
    });

    $headerLayer.append($title).append(this.$headerFin).append(this.$headerCloseBtn);

    this.$alertLayer.append($headerLayer).append(this.$contentLayer);
};

/////////////////////////////////////////////////////////////////////////////////////////


/**
 * @note 전체 창에 중요 알람(서버 on, down 등)의 상태를 관리한다.
 */
var AlertWindowManager = function(arg){
    this.initProperty(arg);
    this.init();
    this.bindEvent();

    arg = null;
};

AlertWindowManager.prototype.init = function(){
    this.$container = $('<div></div>').css({
        position    : 'absolute',
        right       : '0px',
        bottom      : '0px'
    });

    this.$target.append(this.$container);
};

AlertWindowManager.prototype.initProperty = function(arg){
    this.id         = null;
    this.$target    = null;
    this.alertList  = [];
    // 오른쪽 하단부터 시작
    this.offSet     = {
        x: 0,
        y: 0
    };

    this.alertWindowWidth = 300;
    this.alertWindowHeight = 100;

    for(var key in arg){
        if(this[key] !== undefined){
            this[key] = arg[key];
        }
    }

    this.$target = $('#' + this.id);
    arg = null;

};

AlertWindowManager.prototype.bindEvent = function(){
    window.addEventListener('resize', function(){
        if(this.resizeTimer){
            clearTimeout(this.resizeTimer);
        }

        this.resizeTimer = setTimeout(function(){
            var margin = 10;
            var alertHeight = this.alertWindowHeight + margin;
            var len = this.alertList.length;
            var row = Math.ceil(this.$target.height() / alertHeight) - 1;
            var lineHeight = alertHeight * row;
            var col = -1;

            for (var ix = 0; ix < len; ix++) {
                if (ix % row === 0) {
                    col++;
                }

                this.alertList[ix].$alertLayer.css({
                    top: (alertHeight * -(ix + 1)) + (lineHeight * col),
                    left: (this.alertWindowWidth * -(col + 1)) - (margin * col)
                });
            }
        }.bind(this), 300);

    }.bind(this));
};

/**
 *
 * @param data [ instanceName, date, alarm name,
 */
AlertWindowManager.prototype.addItem = function(data){
    var alert = new XMAlertWindow({
        parent  : this,
        width   : this.alertWindowWidth,
        height  : this.alertWindowHeight,
        time    : +data[1],
        instanceName: data[0],
        level   : data[5],
        alertName : data[6],
        index   : this.alertList.length
    });

    this.$container.append(alert.$alertLayer);
    this.alertList.push(alert);

    window.onresize();

    alert.$alertLayer.fadeIn();
};

AlertWindowManager.prototype.setItemPosition = function(){

};

AlertWindowManager.prototype.removeItem = function(index){
    this.alertList[index].$alertLayer.remove();
    delete this.alertList[index];
    this.alertList.splice(index,1);

    var margin = 10;
    var alertHeight = this.alertWindowHeight + margin;
    var len = this.alertList.length;
    var row = Math.ceil(this.$target.height() / alertHeight) - 1;
    var lineHeight = alertHeight * row;
    var col = -1;

    for(var ix = 0; ix < len; ix++){
        if(ix % row === 0){
            col++;
        }

        this.alertList[ix].index = ix;

        this.alertList[ix].$alertLayer.css({
            top: (alertHeight * -(ix + 1)) + (lineHeight * col),
            left: (this.alertWindowWidth * -(col + 1)) - (margin * col)
        });
    }
};

