Ext.define('rtm.src.rtmTPActiveTxnList', {
    extend : 'rtm.src.rtmActiveTxnList',
    title  : this.title,
    layout : 'fit',

    isOption: false,

    /**
     * Init Property Parameters
     */
    initProperty: function() {
        this.monitorType = 'TP';
        this.openViewType =  Comm.RTComm.getCurrentMonitorType();

        // 그리드 정보를 저장하는 키 값
        this.saveGridName = 'rtm_grid_tp_activetxn';

        // 목록에 표시하지 않을 컬럼의 데이터 인덱스
        this.hideDataIndex = ['classmethod', 'methodtype'];

        // 그리드 목록에서 클래스 자바 소스 및 트랜잭션 자보 소스를 볼 수 있는 메뉴 표시
        // TP, WEB 인 경우에는 false 로 설정되어 소스보기 메뉴가 표시되지 않는다.
        this.enableClassView  = false;
        this.enableThreadDump = false;

        // 관리자 권한인 경우에 대해서만 옵션 창을 볼 수 있게 설정
        if (cfg.login.admin_check !== 1 && this.optionBtn) {
            this.optionBtn.setVisible(false);
        }

        this.wasList = [];
        this.selectedServrList = [];

        if (realtime.selectedTPNames.length > 0) {
            this.wasList = Comm.selectedTpArr.concat();
        } else {
            this.wasList = Comm.tpIdArr.concat();
        }

        this.timerCount   = 0;
        this.refreshTimer = null;
        this.sqlFullText  = null;

        this.activeTxnRefreshCheck = true;
        this.useActiveTimeColor = Comm.RTComm.getBooleanValue(Comm.web_env_info['TPuseActiveTimeColor']);

        // 기본 값
        this.warningTime  = 3000;
        this.criticalTime = 7000;

        var activeLevel = Comm.web_env_info['TP_ACTTIME_LEVEL(MS)'];

        if (activeLevel) {
            this.warningTime  = activeLevel.split(',')[0];
            this.criticalTime = activeLevel.split(',')[1];
        }

        this.formatLabel = {
            over   : common.Util.TR('{0} MilliSec and over'),
            between: common.Util.TR('{0} MilliSec and over under {1} MilliSec')
        };

        this.title = 'TP ' + common.Util.CTR('Active Transaction');

        if (this.floatingLayer) {
            this.up().setTitle(this.title);
        }
    }

});
