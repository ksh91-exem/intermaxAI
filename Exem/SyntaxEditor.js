Ext.define("Exem.SyntaxEditor", {
    alias: 'widget.syntaxEditer',
    extend : 'Ext.form.field.TextArea',
    flex : 1,
    layout:'fit',
    edit : null,
    mode : 'sql',
    readOnly : true,
    showNavigate: true,
    formattingLayer : null,
    useEmptyText: false,
    drag        : false,
    editTheme : 'ace/theme/eclipse',
    fadeFold: false,
    constructor : function(config) {
        this.superclass.constructor.call(this, config);
        this.initProperty();
    },

    initProperty: function(){
        this.formattingLayer = $('<textarea></textarea>');
        this.eventList = [];
        this.themeEnum = {
            white : 'ace/theme/eclipse',
            black : 'ace/theme/dark_imx'
        };

        this.bindDisableLayer = null;
    },

    addEventListeners: function(event, fn, scope){
        if(document.getElementById(this.id)){
            document.getElementById(this.id).addEventListener(event, fn.bind(scope), false);
        }else{
            this.eventList.push({
                event: event,
                fn: fn,
                scope: scope
            });
        }
    },

    /**
     * syntax hilighting 스크립트 설정 (sql , java, javascript, jsp...)
     * Envir.js 파일의 Syntax 오브젝트 참조
     * @param mode
     */
    setMode: function(mode){
        if(this.edit){
            this.edit.getSession().setMode('ace/mode/'+ mode.toLowerCase());
        }else{
            this.mode = mode;
        }
    },

    /**
     * text 값 설정
     * @param text
     */
    setText: function(text){
        if (text) {
            text = text.replace(/\f/g, '');
        }
        if (this.edit) {
            this.edit.setValue(text || '', -1);
        } else {
            this.editText = text;
        }

        if(this.useEmptyText) {
            this.emptyCheck();
        }


    },

    setFormatting: function(text){
        this.formattingLayer.val(text || this.edit.getValue());
        this.formattingLayer.format({
            method: this.mode
        });

        if(this.edit){
            this.edit.setValue(this.formattingLayer.val(), -1);
        }
    },

    /**
     * read only 설정
     * @param flag
     */
    setReadOnly: function(flag){
        if(this.edit){
            this.edit.setReadOnly(flag);
        }else{
            this.readOnly = flag;
        }
    },

    /**
     * 텍스트 라인(네이게이트) 설정
     * @param flag
     */
    setNavigate: function(flag){
        if(this.edit){
            this.edit.renderer.setShowGutter(flag);
        }else{
            this.showNavigate = flag;
        }
    },


    setDrag: function(flag){

        //drag = false 면 clearselection
        if ( this.edit && flag ){
            this.edit.getSession().selection.on('changeSelection', function () {
                this.edit.getSession().selection.clearSelection();
            }.bind(this));
        }
    },

    /**
     * 텍스트 값을 가져온다
     * @returns ''
     */
    getText : function() {
        return this.edit.getValue() ;
    },

    /**
     * @note 에디터 테마 변경 함수. 'white', 'black' 중 하나를 선택.
     * 다른 테마를 원할 경우 에디터 형식에 맞는 테마 스트링을 파라메터로 전달해주면 됩니다 (ex. 'ace/theme/eclipse')
     *
     * @param theme{String} 'white' | 'black' or 'ace/theme/eclipse'
     */
    setEditTheme: function(theme){

        if(this.themeEnum[theme]){
            this.edit.setTheme(this.themeEnum[theme]);
        }else{
            this.edit.setTheme(theme);
        }

    },

    /**
     * @note setText 호출 시 빈 공란을 체크해서 비었을 경우 메시지를 표시해준다.
     */
    emptyCheck: function(){
        if(this.emptyLayer == null && this.el && this.el.dom){
            this.emptyLayer = document.createElement('div');
            this.emptyLayer.setAttribute('style', 'display:none;position:absolute;top:30%;left:0px;width:100%;text-align:center;z-index:1;font-size:11px;color: gray;');
            this.emptyLayer.textContent = common.Util.TR('Information does not exist in your current item requests.');
            this.el.dom.getElementsByClassName('ace_scroller')[0].appendChild(this.emptyLayer);
        }

        if(this.edit.getValue() === ''){
            this.emptyLayer.style.display = 'block';
        }else{
            this.emptyLayer.style.display = 'none';
        }
    },

    bindDisable: function() {
        if (this.bindDisableLayer == null && this.el && this.el.dom) {
            this.bindDisableLayer = document.createElement('div');
            this.bindDisableLayer.setAttribute('class', 'not_support');
            this.bindDisableLayer.setAttribute('style', 'display:block;position:absolute;top:55%;left:0px;width:100%;text-align:center;z-index:1;font-size:14px !important;color: gray;');
            //this.bindDisableLayer.setAttribute('style', 'position:absolute; margin: auto;  top: 0; left: 0; bottom: 0; right: 0; height:100%;  background:transparent;width:100%;text-align:center;z-index:10;font-size:14px !important;color: #FFB100;')
            this.bindDisableLayer.textContent = common.Util.TR('You do not have enough privilege to view bind variables');
            //this.bindDisableLayer.textContent = common.Util.TR('Not Authorized')
            this.el.dom.getElementsByClassName('ace_scroller')[0].appendChild(this.bindDisableLayer);
        }
    },



    listeners: {
        afterRender : function() {
            this.edit = ace.edit( this.id );
            this.edit.setTheme(this.editTheme);
            this.setMode(this.mode);
            this.setReadOnly(this.readOnly);
            this.setNavigate(this.showNavigate);
            this.setDrag( this.drag ) ;
            this.edit.renderer.updateFull();
            this.setText(this.editText || '');

            // font 폭이 고정이아닌경우는 커서 밀리는 문제 있어서  2015-07-07 JH
            this.edit.setOptions({
                fontFamily: "monospace",
                fadeFoldWidgets: this.fadeFold
            });

            if(this.eventList.length > 0){
                for(var i = 0; i < this.eventList.length; i++){
                    this.addEventListeners(this.eventList[i].event, this.eventList[i].fn, this.eventList[i].scope);
                }
            }
        },
        resize: function(){
            this.edit.resize();
        }

    }


});