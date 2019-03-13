Ext.application({
    name: 'IntermaxActiveTransactionDetail',
    appFolder: location.pathname.split('/')[1],

    initProperty: function(){
        window.msgMap = opener.msgMap;
        window.Comm   = opener.Comm;
        window.common = opener.common;
        window.realtime = opener.realtime;
        window.cfg      = opener.cfg;

        window.WS  = opener.WS;
        window.WS2 = opener.WS2;
    },

    launch: function() {
        this.initProperty();

        this.createLayout();

        this.addEvents();
    },


    /**
     * 레이아웃 구성
     */
    createLayout: function(){
        var baseFrameDiv = document.createElement('div');

        baseFrameDiv.className = 'rtm-base';
        baseFrameDiv.id = 'baseFrame';
        baseFrameDiv.style.position = 'absolute';
        baseFrameDiv.style.top = '0px';
        baseFrameDiv.style.left = '0px';
        baseFrameDiv.style.bottom = '0px';
        baseFrameDiv.style.width = '100%';
        baseFrameDiv.style.height = '100%';
        baseFrameDiv.style.minWidth = '1000px';
        baseFrameDiv.style.minHeight = '650px';

        document.body.appendChild(baseFrameDiv);

        var theme = opener.Comm.RTComm.getCurrentTheme();

        switch (theme) {
            case 'Black' :
                document.body.className = 'mx-theme-black';
                console.debug(document.body.className);
                break;
            case 'Gray' :
                document.body.className = 'mx-theme-gray';
                console.debug(document.body.className);
                break;
            default :
                document.body.classList.remove('mx-theme-gray', 'mx-theme-black');
                break;
        }

        if (opener.window.nation === 'ja') {
            document.body.classList.add('ja');
        } else {
            document.body.classList.remove('ja');
        }

        this.baseFrame = Ext.create('Exem.Container', {
            layout: 'vbox',
            width : '100%',
            height: '100%',
            renderTo: 'baseFrame'
        });

        this.baseFrame.loadingMask = Ext.create('Exem.LoadingMask', {
            target: this.baseFrame
        });
        this.baseFrame.loadingMask.show(true);

        setTimeout(function() {
            var parameter = JSON.parse(localStorage.getItem('InterMax_PopUp_Param') || null);

            this.txnDetail = Ext.create('rtm.src.rtmActiveTxnDetail');
            this.txnDetail.stack_dump   = false;
            this.txnDetail.tid          = parameter.tid;
            this.txnDetail.wasid        = parameter.wasId;
            this.txnDetail.starttime    = parameter.fromTime;
            this.txnDetail.current_time = parameter.toTime;

            var record = {
                tid       : parameter.tid,
                wasid     : parameter.wasId,
                txnname   : '',
                starttime : parameter.fromTime,
                time      : parameter.toTime
            };

            this.txnDetail.initBaseFrame();
            this.baseFrame.add(this.txnDetail);

            setTimeout(function() {
                this.txnDetail.init(record);
                this.baseFrame.loadingMask.hide();
            }.bind(this), 10);

        }.bind(this), 10);
    },


    /**
     * 이벤트 추가
     */
    addEvents: function() {
        window.addEventListener('resize', function() {
            this.baseFrame.setSize(window.innerWidth, window.innerHeight);
            this.txnDetail.setSize(window.innerWidth, window.innerHeight);
        }.bind(this));

        window.onbeforeunload = function() {
            window.msgMap   = null;
            window.Comm     = null;
            window.common   = null;
            window.realtime = null;
            window.cfg      = null;

            window.WS  = null;
            window.WS2 = null;
        };

        opener.window.addEventListener('beforeunload', function() {
            if (window) {
                window.msgMap = null;
                window.Comm = null;
                window.common = null;
            }

            if (window) {
                window.close();
            }
        });

    }

});