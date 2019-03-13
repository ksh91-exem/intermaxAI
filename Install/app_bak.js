Ext.application({
    name: 'Intermax',
    appFolder: 'Intermax5',

    launch: function() {
        this.WS    = new IMXWS();
        this.WS.Host = location.hostname;
        this.WS.Port = location.port;
        this.WS.parseJSON = true;
        this.WS.ExtractHeader = true;
        this.WS.PushData = false;
        this.WS.Open();
        this.count = 0 ;
        this.install_click = false ;


        var self = this ;

        $(window).resize(function(){
            //$(self)[0].viewport.setWidth('100%') ;
            //$(self)[0].viewport.setHeight('100%') ;

            //if ( $(window).height() > 700 ){
                //$(self)[0].viewport.scrollBy(0, $(window).height(), false) ;
                //$(self)[0].viewport.scrollBy(0, 1000, false) ;
            //}

        });

        //step panel
        var step_pnl = this.layout() ;

        var step1 = this.layout_step('step1', 195, 'step1_title', 150) ; //@param - id, label width(image), cls, height
        var step2 = this.layout_step('step2', 167, 'step2_title', 150) ;
        var step3 = this.layout_step('step3', 162, 'step3_title', 300) ;
        step_pnl.add( step1, step2, step3 ) ;
        self.step2 = step2 ;

        //STEP1

        $(step1.el.dom).append('<div class="was-image"></div><p class="was-title">'+'WAS(JAVA)'+'</p><p id="step-middle-line"></p>') ;
        $(step1.el.dom).append('<div class="wasdb-image"></div><p class="wasdb-title">'+'WAS(JAVA) + DB'+'</p>') ;
        //$(step1.el.dom).find('.was-image').on('click', function(e){
        //    $(this).css({
        //        'background-image': 'url(/Intermax5/Install/image/Install_image_1/icon_was.png)',
        //})
        //$(this).siblings()[1].style.color = '#4aa2fe' ;
        //})


        //STEP2
        $(step2.el.dom).append('<div class="user-image"></div><p class="user-title">'+'User'+'</p><p id="step-dot"></p>') ;
        $(step2.el.dom).append('<div class="web-image"></div><p class="web-title">'+'Web'+'</p><p id="step-dot2"></p><p id="btn-install"></p>') ;
        $(step2.el.dom).append('<div class="was2-image"></div><p class="was2-title">'+'WAS'+'</p><p id="step-dot3"></p>') ;
        $(step2.el.dom).append('<div class="db-image"></div><p class="db-title">'+'DB'+'</p>') ;
        var install_btn = document.getElementsByTagName("p")[7] ;
        install_btn.onclick = function(e){
            //$(this).addClass('gradient_install') ;
            $(this).css({
                'background-image': 'url(/Intermax5/Install/image/Install_image_2/Install_BTT_On.png)',
            }) ;


            $(self)[0].loading_mask.show() ;
            $(self)[0].install_click = true ;
            $(self.exp_pnl.el.dom).find('.message-text').remove() ;
            document.getElementsByTagName("p")[11].remove() ; //step1 line

            $(self.main_sub_pnl.el.dom).append('<p id="step2-line"></p>') ;
            $(self.exp_pnl.el.dom).append('<div class="message-text2"></div>');
            $(self)[0].get_was_info() ;
        }

        //STEP3
        this.loading_mask = new Ext.LoadMask(step3, {msg:"Please wait..."});


        //EXPLAIN
        var exp_pnl = Ext.create('Ext.container.Container',{
            itemId: 'exp_pnl',
            layout: 'fit',
            width : '100%',
            flex  : 1 ,
            style : {
                'border'       : '1px solid #d8d2c8',
                'border-radius': '7px'
            }
        }) ;
        this.explain_pnl.add( exp_pnl ) ;


        $(exp_pnl.el.dom).append('<div class="message-text"></div>');
        this.exp_pnl = exp_pnl ;



        var btn_con = Ext.create('Ext.container.Container',{
            itemId: 'btn_con',
            cls   : 'btn-config',
            width : 118,
            height: 28,
            listeners:{
                render: function(){
                    this.getEl().on('click', function(){
                        clearTimeout( self.timeout ) ;

                        if ( !self.install_click ){
                            self.showMessage('Confirmation', 'Please click the Install button', Ext.Msg.OK, Ext.MessageBox.WARNING, function(){
                                return ;
                            })
                        }else{
                            var path = document.location.pathname;
                            var dir = path.substring(0, path.lastIndexOf('/')-7);
                            self.open_in_new_tab( document.location.origin + dir + 'config' ) ;
                            //self.close() ;

                            path = null ;
                            dir = null ;
                        }
                    })
                }
            }
        }) ;
        step_pnl.add( btn_con );
        //step_pnl.add( {xtype: 'tbspacer', flex: 1}, btn_con, {xtype: 'tbspacer', flex: 1} ) ;

        //exp_pnl.add( /*this.step_lbl, this.step_cont*//*,  btn_con */) ;
        //$(exp_pnl.el.dom).append('<div class="step-lbl">'+'test'+'</div><ul class="step-cont"></ul>') ;


        //test = null ;
        //test2 = null ;
        btn_con = null ;
        exp_pnl = null ;
        step1 = null ;
        step2 = null ;
        step3 = null ;
        step_pnl = null ;


    },


    open_in_new_tab : function (url) {
        var win = window.open(url, '_blank');
        win.focus();
        win.opener = null ;

        //window.close() ;
    },


    get_was_info: function(){
        var ds = {};
        var self = this ;

        ds.sql =   'select t.status, '+
        '       t.server_type, '+
        '       w.was_id, '+
        '       w.ip     '+
        'from   xapm_was_info w '+
        'inner join xapm_server_time t '+
        'on    t.server_id = w.was_id '+
        'and   t.server_type = 1  '+
        'order by t.server_time desc ;' +
        ''+
        ''+
        ''+
        'select count(*)   '+
        'from xapm_was_info w   '+
        'inner join xapm_server_time t '+
        'on    t.server_id = w.was_id  '+
        'and   t.server_type = 1       '+
        'and   t.status = 0 ;'
        //ds.sql_file = 'IMXInstall_WasInfo.sql';
        this.WS.SQLExec(ds, function(header, data) {

            if ( this.count == 0 ){
                this.count = data[0].rows.length ;
                this.timeout = setTimeout( this.get_was_info.bind(this), 3000 ) ;
            }else{
                this.draw_grid( data[0] );
                $(this.step2.el.dom).append('<p class="was-count">'+ data[1].rows[0][0] + '</p>') ;
                this.timeout = setTimeout( this.get_was_info.bind(this), 3000 ) ;
            }
        }, self);
    } ,

    draw_grid: function(data){

        /*
         *
         * CONNECTED    = 0
         DISCONNECTED = 1
         SERVER_DOWN  = 2
         SERVER_HANG  = 3
         *
         * */

        var server_type ;
        var arr = [] ;
        this.grid_store.removeAll() ;
        for ( var ix = 0 ; ix < data.rows.length; ix++ ){
            if ( data.rows[ix][1] == 1 ){
                server_type = 'WAS' ;
            }else if ( data.rows[ix][1] == 2 ){
                server_type = 'DB'
            }else if ( data.rows[ix][1] == 3 ){
                server_type = 'WS'
            } ;

            console.log( 'install data-------------------------', data.rows[ix][2] );

            arr.push( {
                'status'     : data.rows[ix][0],
                'server_type': server_type,
                'server_id'  : data.rows[ix][2],
                'ip'         : data.rows[ix][3]
            } )
        } ;
        this.grid_store.loadData( arr ) ;
        this.loading_mask.hide() ;

        ix = null ;
        server_type = null ;
        arr = null ;
    } ,

    layout_step: function( _id, _width, _cls, _h  ){

        var self = this ;

        try{
            var _margin = ( _id == 'step1' ) ? '0' : '40 0 0 0' ;
            //var _margin = '0' ;


            var title_pnl = Ext.create('Ext.container.Container',{
                layout: 'fit',
                width : _width,
                height: 20,
                cls   : _cls
            }) ;


            if ( _id == 'step3' ){

                this.grid_store = Ext.create('Ext.data.Store',{
                    fields  : [
                        {name : 'status'     , type : 'string' },
                        {name : 'server_type', type : 'string' },
                        {name : 'server_id'  , type : 'string' },
                        {name : 'ip'         , type : 'string' }
                    ],
                    data    : []
                })

                var sub_pnl = Ext.create('Ext.grid.Panel',{
                    width : '100%',
                    height: 265,
                    //flex  : 1,
                    layout: 'fit',
                    hideHeaders : false,
                    forceFit    : true,
                    autoScroll  : true,
                    store       : this.grid_store,
                    columns     : [
                        {   text      : 'Status',
                            dataIndex : 'status',
                            width     : 50  ,
                            style     : {'text-align' : 'center' },
                            renderer: function(v, meta, record, rowIndex, colIndex, store) {

                                if ( record.data.status == 0 ){
                                    status_style = 'display: inline-block; width: 10px; height: 10px; border-radius: 50% ; border: 2px solid rgb(255, 255, 255) ; box-shadow: rgb(39, 183, 159) 0px 0px 4px; margin-left: 20px; /*right: auto;*/ background-color: rgb(40, 154, 249)';
                                }else{
                                    status_style = 'display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 2px solid rgb(244, 252, 249); box-shadow: rgb(136, 133, 170) 0px 0px 4px; margin-left: 20px; background-color: rgb(249, 75, 75);' ;
                                }

                                //ratio_style = 'background: -webkit-gradient(linear,left center,right center, color-stop(0%,#76addb ), color-stop(100%, #4a8fd7 )); width:'+ v +'%;height:13px';

                                //<div style="position:relative;overflow:hidden;height:13px;"><div style="position:absolute;left:0px;top:0px;text-align:center;width:100%;">'+ v +'</div>
                                return '<div style="position:relative;overflow:hidden;"><div style="'+ status_style +'"></div></div>';
                            }
                        },
                        { text: 'Server Type',    dataIndex : 'server_type'  , style     : {'text-align' : 'center' }, flex  : 1   },
                        { text: 'Server ID'  ,    dataIndex : 'server_id'    , style     : {'text-align' : 'center' }, flex  : 1   },
                        { text: 'IP'         ,    dataIndex : 'ip'           , style     : {'text-align' : 'center' }, flex  : 1   }
                    ]
                }) ;
            }else{



                var sub_pnl = Ext.create('Ext.container.Container',{
                    itemId: _id,
                    layout: 'hbox',
                    width : '100%',
                    height: 130,
                    style : {
                        'border'       : '1px solid #d8d2c8',
                        'border-radius': '7px',
                        'background'   : '#f8f6f3'
                    }
                }) ;


                if ( _id == 'step2' ){

                }
            }



            //step의 전체패널
            var pnl = Ext.create('Ext.container.Container',{
                layout: 'vbox',
                width : 600,
                margin: _margin,
                height: _h ,   //- label높이는 20. 고로 +20시켜줄것.
                //flex  : 1,
                items : [title_pnl, sub_pnl]
            }) ;


            return pnl ;

        }finally{

            _margin = null ;
            lbl     = null ;
            sub_pnl = null ;
            pnl     = null ;
        }


    } ,







    layout: function(){

        try{


            this.viewport = Ext.create('Ext.container.Container', {
                id       : 'viewPort',
                layout   : 'border',
                width    : '100%',
                height   : '100%',
                minHeight: 890,
                minWidth : 1000,
                autoScroll: true,
                cls      : 'viewport',
                renderTo : Ext.get('homediv')
            });

            var body = $('body') ;
            var title = 'INSTALL' ;
            body.append('<div class="header-log" style="background:url(../images/InterMax_Logo.png) no-repeat"></div>');
            body.append('<div class="rtm-header-log"><p class="header-line"></p><p class="header-title">' + title + '</p>'); // Main title



            var top_pnl = Ext.create('Ext.container.Container',{
                id    : 'top_pnl',
                layout: 'hbox',
                region: 'north',
                width : '100%',
                height: 59 ,
                style : { 'background': '#3F4249' }
            }) ;



            //이건 그냥 큰패널.
            var main_pnl = Ext.create('Ext.container.Container',{
                itemId: 'main_pnl',
                layout: 'fit',
                region: 'center',
                width : '100%',
                height: '100%'
            })

            //step이미지패널(step_pnl)과 설명패널(explain_pnl)을 담을 패널
            var main_sub_pnl = Ext.create('Ext.container.Container',{
                itemId: 'main_sub_pnl',
                layout: 'hbox',
                region: 'center',
                width : '100%',
                flex  : 1,
                margin: '10 10 10 10',
                style : {
                    'border-radius': '6px',
                    'background': 'white'
                }
            })
            this.main_sub_pnl = main_sub_pnl ;

            //왼쪽패널
            var step_pnl = Ext.create('Ext.container.Container',{
                itemId: 'step_pnl',
                layout: 'vbox',
                width : 650,
                height: '100%',
                //flex  : 1,
                padding: '30 0 0 40'
            })



            //오른쪽패널
            this.explain_pnl = Ext.create('Ext.container.Container',{
                itemId: 'explain_pnl',
                layout: 'vbox',
                height: '100%',
                width : 830,
                //flex : 1,
                //border: 1,
                //style: {borderColor:'#000000', borderStyle:'solid', borderWidth:'1px'},
                padding: '50 100 190 30'
            }) ;

            main_pnl.add( main_sub_pnl ) ;
            main_sub_pnl.add( step_pnl, this.explain_pnl ) ;
            this.viewport.add( top_pnl, main_pnl ) ;
            $(main_sub_pnl.el.dom).append('<p id="step-line"></p>') ;

            return step_pnl ;

        }finally{

            logo  = null ;
            line  = null ;
            title = null ;
            top_pnl = null ;
            step_pnl = null ;
            explain_pnl = null ;
            main_sub_pnl = null ;
            main_pnl = null ;

        }



        //var title = 'INSTALL' ;
        //var $body = document.getElementsByTagName("BODY") ; //$('body');
        //$body.append('<div class="header-log" style="background:url(../images/InterMax_Logo.png) no-repeat"></div>'); // Main title
        //$body.append('<div class="header-line"></p>' + title + '</p>');
    },


    showMessage: function(title, message, buttonType, icon, fn) {
        Ext.Msg.show({
            title  : title,
            msg    : message,
            buttons: buttonType,
            icon   : icon,
            fn     : fn
        });
    }
});
