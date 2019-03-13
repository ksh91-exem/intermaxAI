Ext.define('Exem.XMAlarmSound', {

    /**
     * # Example usage
     *
     *     #### 1. Single Url ####
     *
     *     var sound = Ext.create('Exem.XMAlarmSound',{
     *         warningUrl      : '../sound/warning.mp3',
     *         criticalUrl     : '../sound/critical.mp3',
     *         loop            : false,
     *         getAlarmSoundOn : function() {
     *             return true;
     *         },
     *         getCriticalSoundOn: function() {
     *             return true;
     *         },
     *         getWarningSoundOn : function() {
     *             return false;
     *         }
     *     });
     *
     *     sound.critical.play();
     *
     *
     *     #### 2. Multi Urls ####
     *
     *     var sound = Ext.create('Exem.XMAlarmSound',{
     *         soundUrls : {
     *             KO : {
     *                 warning  : '../sound/warning_ko.mp3',
     *                 critical : '../sound/critical_ko.mp3'
     *             },
     *             EN : {
     *                 warning  : '../sound/warning_en.mp3',
     *                 critical : '../sound/critical_en.mp3'
     *             },
     *             JA : {
     *                 warning  : '../sound/warning_ja.mp3',
     *                 critical : '../sound/critical_ja.mp3'
     *             },
     *             ZH : {
     *                 warning  : '../sound/warning_zh.mp3',
     *                 critical : '../sound/critical_zh.mp3'
     *             }
     *         },
     *         loop            : false,
     *         getAlarmSoundOn : function() {
     *             return true;
     *         },
     *         getCriticalSoundOn: function() {
     *             return true;
     *         },
     *         getWarningSoundOn : function() {
     *             return false;
     *         }
     *     });
     *
     *     sound.critical.play();
     */

    /**
     * 알람 소리 재생 유무를 설정하는 상태값.
     * OFF: 재생하지 않음, ON: 재생
     * @private
     */
    alarmSoundOn: 'OFF',

    /**
     * Critical 알람 소리 재생 유무 설정
     * OFF: 재생하지 않음, ON: 재생
     * @private
     */
    criticalSoundOn: 'OFF',

    /**
     * Warning 알람 소리 재생 유무 설정
     * OFF: 재생하지 않음, ON: 재생
     * @private
     */
    warningSoundOn: 'OFF',

    /**
     * @function
     * @return 'ON' or 'OFF'
     */
    getAlarmSoundOn: null,

    /**
     * @function
     * @return 'ON' or 'OFF'
     */
    getCriticalSoundOn: null,

    /**
     * @function
     * @return 'ON' or 'OFF'
     */
    getWarningSoundOn: null,

    /**
     * Warning 알람 파일 경로.
     * @require
     */
    warningUrl: null,

    /**
     * Critical 알람 파일 경로.
     * @require
     */
    criticalUrl: null,

    /**
     * 알람소리 반복 재생 유무
     * true: 반복 재생, false: 한번 재생
     */
    loop: false,

    /**
     * 알람소리 반복 재생 유무값을 가져오기
     * @function
     * @return true or false
     */
    getSoundLoop: null,


    /**
     * Critical 알람 재생이 끝나고 실행될 함수
     * @function
     */
    afterPlayEndCritical: null,

    /**
     * Warning 알람 재생이 끝나고 실행될 함수
     * @function
     */
    afterPlayEndWarning: null,

    /**
     * 언어에 따른 재생 파일 경로
     * 설정 언어 타입
     *   KO, EN, JA, ZH
     * @object
     *
     * # Example usage
     *
     *     soundUrls : {
     *         KO : {
     *             warning  : '../sound/warning_ko.mp3',  critical : '../sound/critical_ko.mp3'
     *         },
     *         EN : {
     *             warning  : '../sound/warning_en.mp3',  critical : '../sound/critical_en.mp3'
     *         },
     *         JA : {
     *             warning  : '../sound/warning_ja.mp3',  critical : '../sound/critical_ja.mp3'
     *         },
     *         ZH : {
     *             warning  : '../sound/warning_zh.mp3',  critical : '../sound/critical_zh.mp3'
     *         }
     *     }
     *
     */
    soundUrls: null,

    /**
     * 언어별 알람 사운드 파일 설정시 기본 언어로 사용되는 값.
     * 브라우저 언어 정보를 알 수 없거나 잘못된 언어 정보가 설정된 경우 사용됨.
     * @private
     */
    defaultLanguage: 'EN',

    /**
     * 언어별 알람 사운드 파일 설정시 사용자가 설정한 언어로 사용되는 값.
     */
    userLanguage: 'EN',

    /**
     * 알람 사운드를 지원하는 언어.
     *
     * # 현재 지원 언어 : KO, EN, JA, ZH
     * @private
     */
    supportSoundLanguage: ['KO', 'EN', 'JA', 'ZH'],


    constructor: function(config) {
        var me = this;

        Ext.apply(me, config, me);

        if (me.getAlarmSoundOn == null) {
            me.getAlarmSoundOn = function() {
                return me.alarmSoundOn;
            };
        }

        if (me.getCriticalSoundOn == null) {
            me.getCriticalSoundOn = function() {
                return me.criticalSoundOn;
            };
        }

        if (me.getWarningSoundOn == null) {
            me.getWarningSoundOn = function() {
                return me.warningSoundOn;
            };
        }

        if ((me.warningUrl == null || me.criticalUrl == null) && me.soundUrls == null) {
            console.debug('%cRequire Sound File URL.', 'color:red;font-weight:bold;');
            return;
        }

        if (me.userLanguage == null) {
            me.userLanguage = me.defaultLanguage;
        } else {
            var langIndex = me.supportSoundLanguage.indexOf(me.userLanguage.toUpperCase());

            if (langIndex > -1) {
                me.userLanguage = me.userLanguage.toUpperCase();
            } else {
                console.debug('%cNot support sound language.', 'color:red;font-weight:bold;');
                return;
            }
        }

        var wEl = document.createElement('audio');
        var cEl = document.createElement('audio');

        wEl.id = 'alarm-sound-'+Ext.id();
        cEl.id = 'alarm-sound-'+Ext.id();

        if (me.warningUrl != null && me.criticalUrl != null) {
            wEl.src = me.warningUrl;
            cEl.src = me.criticalUrl;

        } else if (me.soundUrls != null) {
            var urlKeys = Object.keys(me.soundUrls);

            if (urlKeys.length > 0) {
                if (me.soundUrls[me.userLanguage] != null) {
                    wEl.src = me.soundUrls[me.userLanguage].warning;
                    cEl.src = me.soundUrls[me.userLanguage].critical;

                } else {
                    wEl.src = me.soundUrls[urlKeys[0]].warning;
                    cEl.src = me.soundUrls[urlKeys[0]].critical;
                }
            }
        }

        if (wEl.src == null) {
            console.debug('%cUndefined warning src.', 'color:red;font-weight:bold;');
            return;
        } else if (cEl.src == null) {
            console.debug('%cUndefined critical src.', 'color:red;font-weight:bold;');
            return;
        }

        if (me.loop === true) {
            wEl.loop = true;
            cEl.loop = true;
        }

        if (me.getSoundLoop == null) {
            me.getSoundLoop = function() {
                return me.loop;
            };
        }

        var sound = {
            playStatus : null,
            audioEl : {}
        };

        sound.audioEl.Warning = wEl;
        sound.audioEl.Critical = cEl;

        sound.audioEl.Critical.addEventListener('ended', function() {
            sound.playStatus = null;

            if (me.afterPlayEndCritical != null && Ext.isFunction(me.afterPlayEndCritical) === true) {
                me.afterPlayEndCritical();
            }
        });

        sound.audioEl.Warning.addEventListener('ended', function() {
            sound.playStatus = null;

            if (me.afterPlayEndWarning != null && Ext.isFunction(me.afterPlayEndWarning) === true) {
                me.afterPlayEndWarning();
            }
        });

        wEl = null;
        cEl = null;

        me.critical = {
            samplePlay: function() {
                if (sound.audioEl.Critical != null) {
                    sound.audioEl.Critical.pause();
                    sound.audioEl.Critical.currentTime = 0;
                    sound.audioEl.Critical.play();
                }
            },

            play: function() {
                if (me.getAlarmSoundOn() === 'ON' && me.getCriticalSoundOn() === 'ON' &&
                    sound.playStatus !== 'CRITICAL' && sound.audioEl.Critical != null) {

                    sound.playStatus = 'CRITICAL';

                    if (sound.audioEl.loop !== me.getSoundLoop()) {
                        sound.audioEl.loop = me.getSoundLoop();
                    }

                    sound.audioEl.Warning.pause();
                    sound.audioEl.Critical.currentTime = 0;
                    sound.audioEl.Critical.play();

                    setTimeout(function() {
                        sound.audioEl.Critical.play();
                    }, 100);
                }
            },

            pause: function() {
                if (sound.audioEl.Critical != null) {
                    sound.audioEl.Critical.pause();
                }
            },

            stop: function() {
                if (sound.audioEl.Critical != null) {
                    sound.audioEl.Critical.pause();
                    sound.audioEl.Critical.currentTime = 0;
                }
                sound.playStatus = null;
            }
        };

        me.warning = {
            samplePlay: function() {
                if (sound.audioEl.Warning != null) {
                    sound.audioEl.Warning.pause();
                    sound.audioEl.Warning.currentTime = 0;
                    sound.audioEl.Warning.play();
                }
            },

            play: function() {
                if (me.getAlarmSoundOn() === 'ON' && me.getWarningSoundOn() === 'ON' &&
                    sound.playStatus !== 'CRITICAL' && sound.audioEl.Warning != null) {

                    sound.playStatus = 'WARNING';
                    sound.audioEl.Warning.pause();
                    sound.audioEl.Warning.currentTime = 0;

                    setTimeout(function() {
                        sound.audioEl.Warning.play();
                    }, 100);
                }
            },

            pause: function () {
                if (sound.audioEl.Warning != null) {
                    sound.audioEl.Warning.pause();
                }
            },

            stop: function() {
                if (sound.audioEl.Warning != null) {
                    sound.audioEl.Warning.pause();
                    sound.audioEl.Warning.currentTime = 0;
                }
                sound.playStatus = null;
            }
        };

        me.getAudioEl = function() {
            return sound;
        };
    },


    /**
     * 알람 발생 언어를 변경.
     * 클래스 생성시 soundUrls에 해당 언어에 대한 경로를 설정해야 되며
     * 지원하는 언어(KO, EN, JA, ZH) 이외의 값을 주는 경우 변경하지 않는다.
     *
     * # Example usage
     *
     *    var sound = Ext.create('Exem.XMAlarmSound',{
     *        ....
     *    });
     *
     *    sound.changeSoundByLang('EN');
     *
     */
    changeSoundByLang: function(lang) {

        if (!lang || !this.soundUrls) {
            return;
        }

        var urlIndex = this.supportSoundLanguage.indexOf(lang.toUpperCase());

        if (urlIndex === -1) {
            console.debug('%cNot support sound language.', 'color:red;font-weight:bold;');
            return;
        }

        var wUrl = this.soundUrls[this.supportSoundLanguage[urlIndex]].warning;
        var cUrl = this.soundUrls[this.supportSoundLanguage[urlIndex]].critical;

        var sound = this.getAudioEl();
        sound.audioEl.Warning.src = wUrl;
        sound.audioEl.Critical.src = cUrl;

        sound = null;
        cUrl = null;
        wUrl = null;
    }

});
