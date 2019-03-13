(function (){

    var isNotSupport = false;
    var notSupprtChromeVersion = 40;

    // Check Chrome Browser
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    if (isChrome !== true) {
        isNotSupport = true;
    }

    // Check Chrome Browser Version
    try {
        var majorVer = navigator.userAgent.substring(navigator.userAgent.indexOf('Chrome')+7).split('.');
        if (majorVer != null && majorVer.length > 0 &&
            +majorVer[0] <= notSupprtChromeVersion) {
            isNotSupport = true;
        }
    } catch (e) {
        console.debug(e.message);
    }

    if (isNotSupport === true) {
        var sorryDiv = document.createElement('div');
        sorryDiv.style.position = 'absolute';
        sorryDiv.style.left = '0px';
        sorryDiv.style.right = '0px';
        sorryDiv.style.top = '0px';
        sorryDiv.style.background = 'url(../images/browserNotSupport.png) center center no-repeat';
        sorryDiv.style.backgroundColor = '#32373D';
        sorryDiv.style.backgroundPositionX = '55%';
        sorryDiv.style.backgroundPositionY = '50%';
        sorryDiv.style.width = '100%';
        sorryDiv.style.height = '100%';
        document.body.appendChild(sorryDiv);

        document.documentElement.style.overflowX = 'auto';

        try {
            window.stop();
        } catch (e) {
            document.execCommand('Stop');
        }
    }

})();