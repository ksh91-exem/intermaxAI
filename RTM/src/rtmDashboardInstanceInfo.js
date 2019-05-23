Ext.define('rtm.src.rtmDashboardInstanceInfo', {
    extend: 'Exem.DockForm',
    layout: 'fit',
    width : '100%',
    height: '100%',

    title : '2019-05-16 11:36:00',

    interval : 3000,
    wooriPocDataFolder : realtime.wooriPocDataFolder,

    listeners: {
        destroy: function() {
            if (this.timer) {
                clearTimeout(this.timer);
            }
        }
    },

    initProperty: function() {
        this.monitorType  = 'WAS';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();
    },

    initLayout: function() {
        this.background = Ext.create('Exem.Container', {
            layout: 'vbox',
            width : '100%',
            height: '100%',
            cls   : 'rtm-database-base'
        });

        this.topContentsArea = Ext.create('Ext.container.Container',{
            width  : '100%',
            height : 50,
            layout : 'hbox',
            margin : '5 10 10 10'
        });

        this.frameTitle = Ext.create('Ext.form.Label',{
            height : 50,
            margin : '30 0 0 5',
            cls    : 'header-title',
            text   : this.title,
            style  : {
                'font-size' : '15px'
            }
        });

        this.instanceInfoArea = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width : '100%',
            flex  : 1,
            margin: '0 10 10 10',
            style : {
                background : '#1c8ffc'
            },
            listeners : {
                element  : 'el',
                click    : function() {
                    if (this.status == 'critical') {

                    }
                }.bind(this)
            }
        });

        this.instanceText = Ext.create('Ext.form.Label',{
            xtype : 'label',
            margin: '70 0 0 10',
            width : '100%',
            height: '100%',
            style : {
                'font-size' : '15px',
                'text-align' : 'center',
                'color' : '#ffffff'
            }
        });
        
        this.topContentsArea.add(this.frameTitle);
        this.instanceInfoArea.add(this.instanceText);

        this.background.add([this.topContentsArea, this.instanceInfoArea]);

        this.add(this.background);
    },

    init: function() {
        this.initProperty();
        this.initLayout();

        if (this.floatingLayer) {
            this.frameTitle.hide();
        }

        this.drawFrame();
    },

    /**
     * 차트 그리기
     */
    drawFrame: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        $.ajax({
            type : 'get',
            url  : '../service/' + this.wooriPocDataFolder + '/result_' + this.wooriPocDataFolder + '.json',
            dataType: 'json',
            contentType: 'application/json',
            success: function(data) {
                if (data.status == 'critical') {
                    this.instanceInfoArea.setStyle('background', '#ff4a6a');
                } else {
                    this.instanceInfoArea.setStyle('background', '#1c8ffc');
                }
                this.status = data.status;
                // this.instanceText.setText(data.description);
                this.instanceText.setText('이상이 탐지되었습니다.');
            }.bind(this),
            error: function(XHR, textStatus, errorThrown) {
                console.log(XHR, textStatus, errorThrown);
            }
        });

        this.timer = setTimeout(this.drawFrame.bind(this), this.interval);
    },


    /**
     * 트랜잭션 모니터 차트 렌더링 시직
     */
    frameRefresh: function() {
        setTimeout(this.drawFrame.bind(this),10);
    },


    /**
     * 트랜잭션 모니터 차트 렌더링 중지
     */
    frameStopDraw: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
});