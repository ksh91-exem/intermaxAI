(function() {

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        var obj;

        if (this.readyState === 4 && this.status === 200) {

            window.common = {};
            window.common.Menu = {};

            window.common.Menu.useTxnTrendMonitor              = true;
            window.common.Menu.useElapseDistribution           = false;
            window.common.Menu.useExtMaxGaugeDetail            = false;
            window.common.Menu.usePcidFilter                   = false;
            window.common.Menu.useTxnPathBizGroup              = false;
            window.common.Menu.useTxnPathAsyncMethod           = false;
            window.common.Menu.isAutoIDScaleVersion            = false;
            window.common.Menu.useTxnResponseChart             = false;
            window.common.Menu.useEtoePaMenu                   = false;    // 임시 etoe tab pa menu
            window.common.Menu.etoeLinkForTxnPath              = { isUsed: false, grouping: { make: false } };
            window.common.Menu.useTxnDetailTimeLine            = false;
            window.common.Menu.useExecuteScript                = false;    // Script 실행 기능 사용 여부
            window.common.Menu.hideTierIDColumn                = false;    // 에이전트 설정 > ETE Tier ID 컬럼 hide
            window.common.Menu.useActiveTxnTableLimit          = false;    // #6382 조회 sql limit 설정 여부
            window.common.Menu.useTxnDetailBrowserTimeTab      = false;    // #6551 브라우저 시간 탭 사용 여부
            window.common.Menu.isBusinessPerspectiveMonitoring = false;    // 업무 그룹 관점 모니터링 뷰
            window.common.Menu.useOTP                          = false;    // OTP 사용 여부
            window.common.Menu.useTidForDebugInTxnDetail       = false;  // 트랜잭션 상세 > 콜트리, 콜트리 팝업에서 TID 표시 여부
            window.common.Menu.userAlert                       = { isUsed: false, isDashBoard : false };    // #6857 [SK하이닉스] 사용자 알람 추가 (닷넷용)
            window.common.Menu.linkPopup                       = { isUsed: false }; // #6933 [우리은행] active txn 에 url 링크 기능 추가 요청
            window.common.Menu.useEtoEChartMonitoring          = false; // 업무별 모니터링 화면 구성 기준. (EtoE 트랜잭션 모니터 기준)

            obj = decode(this.responseText);

            try {
                common.Menu.useTxnTrendMonitor              = obj.useTxnTrendMonitor;
                common.Menu.useElapseDistribution           = obj.useElapseDistribution;
                common.Menu.usePcidFilter                   = obj.usePcidFilter;
                common.Menu.useExtMaxGaugeDetail            = obj.useExtMaxGaugeDetail;
                common.Menu.useTxnPathBizGroup              = obj.useTxnPathBizGroup;
                common.Menu.useTxnPathAsyncMethod           = obj.useTxnPathAsyncMethod;
                common.Menu.useRemoteTreeColor              = obj.useRemoteTreeColor;
                common.Menu.useTxnResponseChart             = obj.useTxnResponseChart;
                common.Menu.useTxnDetailTimeLine            = obj.useTxnDetailTimeLine;
                common.Menu.useExecuteScript                = obj.useExecuteScript;
                common.Menu.hideTierIDColumn                = obj.hideTierIDColumn;
                common.Menu.useActiveTxnTableLimit          = obj.useActiveTxnTableLimit;
                common.Menu.useTxnDetailBrowserTimeTab      = obj.useTxnDetailBrowserTimeTab;
                common.Menu.isBusinessPerspectiveMonitoring = obj.isBusinessPerspectiveMonitoring;
                common.Menu.useOTP                          = obj.useOTP;
                common.Menu.userAlert                       = obj.userAlert ? obj.userAlert : { isUsed: false, isDashBoard: false };

                common.Menu.hideBulletTxnLevel      = obj.hideBulletTxnLevel ? obj.hideBulletTxnLevel : false;

                common.Menu.topologyEnableCloud     = obj.topologyEnableCloud ? obj.topologyEnableCloud : false;
                common.Menu.topologyEnableTmax      = obj.topologyEnableTmax ? obj.topologyEnableTmax : false;
                common.Menu.topologyCloudFullName   = obj.topologyCloudFullName ? obj.topologyCloudFullName : false;

                common.Menu.useRealtimeMultiTab     = obj.useRealtimeMultiTab ? obj.useRealtimeMultiTab : false;

                common.Menu.isAutoIDScaleVersion    = obj.isAutoIDScaleVersion ? obj.isAutoIDScaleVersion : false;

                if (common.Menu.useExtMaxGaugeDetail) {
                    common.Menu.useExtMaxGaugeURL   = obj.useExtMaxGaugeURL;
                }

                common.Menu.useEtoePaMenu = obj.useEtoePaMenu;
                common.Menu.etoeLinkForTxnPath = obj.etoeLinkForTxnPath ? obj.etoeLinkForTxnPath : { isUsed: false, grouping: { make: false } };
                common.Menu.useTidForDebugInTxnDetail = obj.useTidForDebugInTxnDetail ? obj.useTidForDebugInTxnDetail : false;
                common.Menu.linkPopup = obj.linkPopup ? obj.linkPopup : { isUsed: false };
                common.Menu.useBizDashURL   = obj.useBizDashURL;
                common.Menu.useSearchAgent = obj.useSearchAgent;
                common.Menu.useEtoEChartMonitoring = obj.useEtoEChartMonitoring;
                common.Menu.useAutoLogin           = obj.useAutoLogin;

            } catch (e) {
                console.debug('%c [Option Configuration] [ERROR] ', 'color:white;background-color:red;font-weight:bold;', e.message);
            }

        }


        function decode(json) {
            return eval('(' + json + ')');
        }

    };
    xhttp.open('GET', '../Option.conf', true);
    xhttp.send();

})();