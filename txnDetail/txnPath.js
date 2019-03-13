Ext.application({
    name: 'IntermaxTransactionPath',
    appFolder: location.pathname.split('/')[1],

    initProperty: function(){
        window.msgMap = opener.msgMap;
        window.Comm   = opener.Comm;
        window.common = opener.common;

        window.WS = opener.WS;
        window.WS2 = opener.WS2;
    },

    launch: function(){
        this.initProperty();

        this.createLayout();
    },

    createLayout: function(){
        var parameter = JSON.parse(localStorage.getItem('InterMax_PopUp_Param') || null);

        if(!parameter){
            console.debug('txnDetail-executeSQL');
            console.debug('does not exist parameter');
            return;
        }

        var baseFrameDiv = document.createElement('div');

        baseFrameDiv.className = 'rtm-base';
        baseFrameDiv.id = 'baseFrame';
        baseFrameDiv.style.position = 'absolute';
        baseFrameDiv.style.top = '0px';
        baseFrameDiv.style.left = '0px';
        baseFrameDiv.style.bottom = '0px';
        baseFrameDiv.style.width = '100%';
        baseFrameDiv.style.height = '100%';
        baseFrameDiv.style.minWidth = '700px';
        baseFrameDiv.style.minHeight = '400px';
        document.body.appendChild(baseFrameDiv);

        this.baseFrame = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            minWidth: 700,
            minHeight: 400,
            renderTo: baseFrameDiv
        });

        this.txnDetailView = Ext.create('view.TransactionDetailView',{
            endTime: parameter.endTime,
            wasId: parameter.wasId,
            name: parameter.name,
            txnName: parameter.txnName,
            tid: parameter.tid,
            startTime: parameter.startTime,
            elapseTime : parameter.elapseTime,
            gid: parameter.gid,
            socket: WS
        });

        this.baseFrame.add(this.txnDetailView);
        this.txnDetailView.init();


        window.addEventListener('resize', function() {
            this.baseFrame.setSize(window.innerWidth, window.innerHeight);
        }.bind(this));
    }
});