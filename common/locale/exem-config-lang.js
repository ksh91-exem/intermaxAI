(function (){
    // 다국어 지원
    var myLang = String(localStorage.getItem('Intermax_MyLanguage'));
    if (myLang === 'null') {
        myLang = null;
    }
    var local = myLang || navigator.language || window.nation;

    $('body').removeClass('ja');

    //언어 체크 시 대소문자 예외가 있을 수 있어 일괄 소문자로 변경하여 체크
    if (local) {
        local = local.toLocaleLowerCase();
    }

    //한국어
    if (local === 'ko' || local === 'ko-kr') {
        local = 'ko';

    //일본어
    } else if (local === 'ja') {
        document.body.className += ' ja ';
        local = 'ja';

    //그 외 언어인 경우에는 영어로 표시 처리
    } else {
        local = 'en';
    }

    window.nation = local;

    document.write( '<script type="text/javascript" src="../common/locale/exem-lang-'+local+'.js" charset="utf-8"><\/script>');
})();