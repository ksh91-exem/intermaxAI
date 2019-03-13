(function (){

    // Set Connect Parameters ----------------------------------------------------------------------
    var urlParams;
    (window.onpopstate = function () {
        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query  = window.location.search.substring(1);

        urlParams = {};
        while (match = search.exec(query)) {
           urlParams[decode(match[1])] = decode(match[2]);
        }
    })();

    // MaxGauge 화면과 연계시 자동로그인 처리 추가
    if (urlParams.mxgConnect === '1' && localStorage.getItem('Intermax_login') !== 'true') {
        localStorage.setItem('Intermax_login', 'true');
        localStorage.setItem('UserID', 'intermax');
    }

    // Check Replay Browser
    localStorage.removeItem('Intermax_Replay_Browser');
    if (urlParams.replay === 'true') {
        localStorage.setItem('Intermax_Replay_Browser', true);
        localStorage.setItem('Intermax_login', 'true');
        localStorage.setItem('UserID', 'intermax');
        window.location.href = './replay/';
        return;
    }

    // 트랜잭션 상세 화면을 표시하는데 필요한 값 설정 ---------------------------------------------------
    localStorage.removeItem('ImxConnect_TxnDetail_Params');
    if (+urlParams.txnConnect === 1) {
        urlParams = JSON.stringify(urlParams);
        localStorage.setItem('ImxConnect_TxnDetail_Params', urlParams);
    }
    urlParams = null;


    // Set Dashboard Connect Parameters ------------------------------------------------------------
    var connectUrl = window.location.href;
    var connectServiceName = connectUrl.split('#')[1]; // Service Name
    var userID             = connectUrl.split('#')[2]; // User
    var isTopologyView     = connectUrl.split('#')[3]; // View Topology

    if (connectServiceName && userID) {
        localStorage.setItem('Intermax_login', 'true');
        localStorage.setItem('UserID', userID);
        localStorage.setItem('ImxConnectServiceName_External', connectServiceName);

        // 하이닉스에서 대시보드 연계 시 토폴로지 뷰로 연계되게 요청을 해서 추가된 옵션인데
        // 실시간 화면으로 표시되게 변경 요청이 와서 토폴로지 뷰화면이 표시되지 않게 주석 처리함.
        // PS: 대시보드에서 연계 처리 시 설정되는 값을 false로 변경하면 해당 코드는 필요가 없으므로 삭제.

        //if (isTopologyView === 'true') {
        //    localStorage.setItem('ImxTopologyViewOn', isTopologyView);
        //}
    }
    window.location.href = './RTM/';
})();