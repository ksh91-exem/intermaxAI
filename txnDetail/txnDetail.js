Ext.application({
    name: 'IntermaxTransactionDetail',
    appFolder: location.pathname.split('/')[1],

    launch: function() {
        this.initProperty();
        this.initBaseLayout();
    },

    initProperty: function() {
        window.msgMap = opener.msgMap;
        window.Comm   = opener.Comm;
        window.common = opener.common;

        window.WS = opener.WS;
        window.WS2 = opener.WS2;

        // 선택/설정된 모니터링 타입이 있는 경우 해당 타입으로 설정하여 처리함.
        if (opener.selectedPopupMonitorType) {
            this.monitorType = opener.selectedPopupMonitorType;
            opener.selectedPopupMonitorType = null;

        } else {
            this.monitorType = !window.monitorType ? opener.rtmMonitorType : window.monitorType;
        }

        // keep refresh popup
        var popup = JSON.parse(localStorage.getItem('InterMax_PopUp_Param'));
        if (popup.hasOwnProperty('serverType') && (this.monitorType !== popup.serverType)) {
            this.monitorType = popup.serverType;
        } else if (popup.hasOwnProperty('monitorType') && (this.monitorType !== popup.monitorType)) {
            this.monitorType = popup.monitorType;
        }
    },

    initBaseLayout: function() {
        var baseFrameDiv, theme, baseContainer;

        baseFrameDiv = document.createElement('div');
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

        theme = opener.Comm.RTComm.getCurrentTheme();
        switch (theme) {
            case 'Black' :
                document.body.className = 'mx-theme-black';
                break;
            case 'Gray' :
                document.body.className = 'mx-theme-gray';
                break;
            default :
                break;
        }

        if (opener.window.nation === 'ja') {
            document.body.classList.add('ja');
        } else {
            document.body.classList.remove('ja');
        }


        if (this.monitorType == 'TP') {
            baseContainer = Ext.create('Exem.tpTxnDetail', {
                monitorType : this.monitorType,
                renderTo : Ext.get('baseFrame')
            });
        } else if (this.monitorType == 'TUX') {
            baseContainer = Ext.create('Exem.tuxTxnDetail', {
                monitorType : this.monitorType,
                renderTo : Ext.get('baseFrame')
            });
        } else if (this.monitorType == 'CD') {
            baseContainer = Ext.create('Exem.cdTxnDetail', {
                monitorType : this.monitorType,
                renderTo : Ext.get('baseFrame')
            });
        } else if (this.monitorType == 'E2E') {
            baseContainer = Ext.create('Exem.etoeTxnDetail', {
                monitorType : this.monitorType,
                renderTo : Ext.get('baseFrame')
            });
        } else {
            baseContainer = Ext.create('Exem.wasTxnDetail', {
                monitorType : this.monitorType,
                renderTo : Ext.get('baseFrame')
            });

        }

        baseContainer.init();
    }

});