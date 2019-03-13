/**
 * Created by min on 2015-07-13.
 */
XMTransactionPath_sap = function(arg){
    this.target = null;
    this.id = null;
    this.width = null;
    this.socket = null;
    this.height = null;
    this.param = {};
    this.clientData = null;
    this.webData = null;
    this.dbData = null;
    this.javaData = null;
    this.box_design = [];
    this.box_connect = [];
    this.elapsefilter = null;
    this.focusingObj = {};
    this.$target = null;
    this.path_list = [] ; //1505.15
    var self = this;

    this.initArgument = function(arg) {
        for(var key in arg){
            if(this[key] !== undefined){
                this[key] = arg[key];
            }
        }

        if(! this.target && ! this.$target){
            console.debug('Transaction Path no target!');
            return;
        }

        this.$target = this.target ? $('#' + this.target) : this.$target;
        this.width = this.$target.width();
        this.height = this.$target.height();

        this.$target.on('resize', function(e){

            try {

                var connections = jsPlumb.getConnections({scope: 'path' + self.id});

                for(var i = 0, len = connections.length; i < len ; i++){
                    jsPlumb.repaint(connections[i].target[0].id);
                }
            } catch (e) {
                console.debug(e.message);
            }
        });
    };


    /**
     * data : 0: client_ip, 1: CLIENT_TIME
     */
    this.clientDataParser = function(data){
        var design = {};
        for(var i = 0 ;i < data.length; i++){
            if(data[i][0]){
                // 중복 체크
                if(! design[data[i][0]]){
                    this.box_design.push({
                        t : null,
                        id: data[i][0],
                        name : data[i][0],
                        type : 'CLIENT',
                        elapse_time_sum : self.toMliFix(data[i][1]),
                        exec_sum : 1,
                        tid: null,
                        isMulti : false,
                        lvl: 0
                    });
                    design[data[i][0]] = true;
                }
            }
        }
    };

    /**
     * @note 2014-06-25 5번째 데이터 txn_name 추가
     * data : 0: web_ip, 1: was_id, 2: was_name, 3:exec_count, 4:w_elapse_time 5: txn_name
     */
    this.webDataParser = function(data){

        for(var j = 0 ;j < this.box_design.length; j++){
            if(data.length){
                this.box_connect.push({
                    from : this.box_design[j].id,
                    to : data[0][0],
                    connect_elapse : self.toMliFix(0),
                    connect_exec : data[0][3] || 0
//                  dest : box_design[j].id
                });
            }
        }

        for(var i = 0 ;i < data.length; i++){
            if(data[i][0]){
                this.box_design.push({
                    t : null,
                    id: data[i][0],
                    name : data[i][0],
                    type : 'WEB',
                    elapse_time_sum : self.toMliFix(data[i][4]),
                    exec_sum : data[i][3] || 0,
                    tid: null,
                    isMulti : false,
                    lvl : 1
                });

                this.box_connect.push({
                    from : data[i][0],
                    to : data[i][1] + '_' + data[i][6].replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]]/g, ''),
                    connect_elapse : self.toMliFix(data[i][4]),
                    connect_exec : data[i][3] || 0
                });
            }
        }
    };
    /**
     * @note 7번 txn_name 추가됨
     * data : 0: WAS_ID, 1: was_name, 2: DB_ID, 3:INSTANCE_NAME, 4: exec_cnt, 5:elapse_time, 6:elapse_time_max, 7:txn_name
     * 1409.22 param - was추가(min)
     * */
    this.dbDataParser = function(data, was, wasInfo, wasRemoteInfo){
        var boxes = {},
            connect = {},
            wasId = null;

        var db_name ;
        var exec ;
        var elapse ;

        for(var i = 0 ;i < data.length; i++){
            if(data[i][2]){
                data[i][2] += 'DB';
                wasId = data[i][0] + '_' + data[i][8].replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]]/g, '');
                exec = data[i][4] ;
                elapse = self.toMliFix(data[i][5]) ;

                if(boxes[data[i][2]]){

                    for ( var idx = 0 ; idx < this.box_connect.length; idx++ ){
                        if ( this.box_connect[idx].to.indexOf(wasId) > -1 ){


                            this.box_connect.push({
                                from : this.box_connect[idx].to,
                                to : data[i][2],
                                connect_elapse : elapse,
                                connect_exec : exec || 0
                            });

                            boxes[data[i][2]].elapse_time_sum += (data[i][5] || 0) * 1 ;
                            boxes[data[i][2]].exec_sum += (data[i][4] || 0) *1 ;
                        }
                    }

                }else{

                    if ( data[i][3].indexOf(':') >= 0 ){
                        db_name = data[i][3].split('.') ;
                        db_name = db_name[0]+'.'+db_name[4] ;
                    }else{
                        db_name = data[i][3].split('.') ;
                        db_name = db_name[0]+'.'+db_name[4]+':'+db_name[5] ;
                    } ;
                    //data[i][3] = db_name ;


                    boxes[data[i][2]] = {
                        t : null,
                        id: data[i][2],
                        name : db_name,
                        type : 'DB',
                        elapse_time_sum : (data[i][5]  || 0 ) * 1,
                        exec_sum : (data[i][4] || 0) *1,
                        tid: null,
                        isMulti : false,
                        lvl : 5
                    };

                    for ( var idx = 0 ; idx < this.box_connect.length; idx++ ){
                        if ( this.box_connect[idx].to.indexOf(wasId) > -1 ){
                            this.box_connect.push({
                                from : this.box_connect[idx].to,
                                to : data[i][2],
                                connect_elapse : elapse,
                                connect_exec : exec || 0
                            });
                        }
                    }
                }



                /*if(! boxes[wasId]){

                    //1504.30 txn_name에 공백이 있는경우 없애버리도록. 두줄로나오므로 by axa_(min)
                    wasInfo[0][6] = wasInfo[0][6].replace(' ', '') ;

                    if(! _.find(self.box_design, function(o){ return o.id == wasId;})){
                        boxes[wasId] = {
                            t : null,
                            id: wasId,
                            name : data[i][1],
                            type : 'WAS',
                            elapse_time_sum : +wasInfo[0][9] || 0,
                            exec_sum : was[0][3] || 0 , //+wasInfo[0][8] || 0,  //1409.24 remote없이 단순 db에 연결된 was의 execute count는 상위의 값을 가져다 써야하므로 값변경.(min)
                            remote_time_sum : wasRemoteInfo.length > 0 ? ((wasRemoteInfo[0][1] / 1000).toFixed(3) || 0) : 0,
                            tid: null,
                            isMulti : false,
                            txnName: wasInfo[0][6] || '',
                            lvl : 2
                        };
                    }
                }*/
            }
        }//end for

        var is_exist ;

        for(var key3 in boxes){

            is_exist = false ;

            for( var idx = 0 ; idx < this.box_design.length; idx++ ){
                if ( this.box_design[idx].default_id !== key3 ) {
                    continue ;
                }

                is_exist = true ;
                boxes[key3] = this.box_design[idx] ;
            } ;

            boxes[key3].elapse_time_sum = self.toMliFix(boxes[key3].elapse_time_sum);
            boxes[key3].connect_exec = self.toMliFix(boxes[key3].connect_exec);
            if ( !is_exist ){
                this.box_design.push(boxes[key3]);
            } ;
        }

        idx = null ;
        key3 = null ;
    };
    /**
     *  13번째 인덱스에 c_txn_name 추가 됨
     *  2014-06-25
     *  id 만으로 구분하던걸 id + txn_name 로 구분하는걸로 변경
     *
     *  0: "lvl" 1: "time" 2: "tid" 3: "type" 4: "p_was" 5: "WAS_NAME" 6: "txn_id"
     *  7: "TXN_NAME" 8: "method" 9: "c_tid" 10: "was" 11: "c_was_name" 12: "c_txn_id"
     *  13: "c_txn_name" 14: "dest" 15: "p_elapse_time" 16: "c_elapse_time" 17: "p_exec_cnt"
     *  18: "c_exec_cnt" 19: "txn_elapse" 20: "c_txn_elapse" 21: "web_ip" 22: "exception" 23: "c_exception"
     */
    this.javaDataParser= function(data){
        var boxes = {}
            , connect = {}
            , tid = ''
            , type = ''
            , name = ''
            , was = ''
            , txn_elapse = 0
            , elapse_time = 0
            , exec_cnt = 1
            , exception = 0
            , txn_name = null
            , txn_id = null
        //, c_name = ''
            , c_id = ''
        //, time = ''
        //, c_type = 'WAS'
        //, c_elapse_time = 0
        //, c_exec_count = 0
        //, c_remote_time = 0
        //, c_tid = null
        //, c_txn_name = null
        //, c_exception = 0
            , dest = ''
            , lvl = 0
            , parent = null
            , parent_lvl = 0
            , default_id = null ;


        if(data.length){

            var dp_flag = false ;
            var last_p_name = '' ;
            var last_c_name = '' ;

            for(var i = 0 ; i < data.length; i++) {

                //lvl = Number(data[i][0]) ;
                //time = data[i][1] ;
                tid = data[i][2];
                name = data[i][4];
                elapse_time = Number(data[i][9]);
                txn_elapse = Number(data[i][10]);
                exception = Number(data[i][11]);
                type = data[i][12]; // P or C
                txn_name = data[i][15];
                exec_cnt = 1;
                dest = data[i][13];
                txn_id = data[i][17];

                dp_flag = false;

                if (tid == null || tid == '') {
                    continue;
                }


                switch (data[i][16].toUpperCase()) {
                    case 'GW':
                        lvl = 0;
                        break;
                    case 'DP':
                        lvl = 1;
                        break;
                    case 'WP':
                        lvl = 2;
                        break;
                    default:
                        break;
                }




                //p node
                if ( type == 'P' ){
                    //처음받아온 tid와 다른 tid라면 그리지않는다.
                    //단 DP는 C있는 P만 그릴것이며 TID는 다다를것이므로 고려하지않는다.
                    if ( data[i][16] == 'DP' ){

                        dp_flag = true ;
                    }else{
                        if ( this.param.topTid !== tid ) {
                            continue ;
                        }
                    }


                    //다음에 오는 row의 type이 또 P인경우가 있으므로 넣은 조건.
                    if ( data[i+1] !== undefined && data[i+1][12] == 'C' ){

                        was = data[i][3] + '_' + (tid || '').replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]]/g, '') + '_' + (data[i+1][2]|| '').replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]]/g, '') ;
                        c_id = data[i+1][3] + '_' + (data[i+1][2] || '').replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]]/g, '') + '_' + (tid|| '').replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]]/g, '') ;

                    }else{


                        was = data[i][3] + '_' + (tid || '').replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]]/g, '');

                    }


                    //was name이 처음꺼와 같다면 입력하지않도록한다.
                   if ( last_p_name == name ){
                       name = '-' ;
                   }else if ( last_p_name == '-' ){
                       name = '-' ;
                   } ;


                    //dp가 호출하러 온경우 이미그려진 노드에서 찾는다.
                    if ( dp_flag ){
                        if ( c_id == '' ) {
                            continue ;
                        }

                        was = '' ;
                        for ( var kx = 0 ; kx < this.box_design.length; kx++ ){
                            if ( this.box_design[kx].default_id == undefined ) {
                                continue ;
                            }

                            if ( self.box_design[kx].tid.indexOf(tid) > -1 ){
                                was = this.box_design[kx].id ;

                                this.box_design[kx].elapse_time_sum = txn_elapse;
                                this.box_design[kx].remote_time_sum = elapse_time ;
                                this.box_design[kx].exec_sum = exec_cnt ;

                            }
                        }//end for
                        kx = null;

                    }else{
                        if ( boxes[was] ){


                            if(boxes[was].tid.indexOf(tid) < 0){
                                boxes[was].tid.push(tid);
                            }

                            boxes[was].elapse_time_sum += txn_elapse;
                            boxes[was].remote_time_sum += elapse_time ;
                            boxes[was].exec_sum += exec_cnt ;


                        }else{

                            boxes[was] = {
                                id              : was,
                                elapse_time_sum : txn_elapse,
                                remote_time_sum : elapse_time,
                                exec_sum        : exec_cnt,
                                tid             : [tid],
                                name            : name ,
                                exception       : exception,
                                txnName         : txn_name,
                                type            : 'NONAME',
                                lvl             : lvl + 2
                            } ;

                            last_p_name = name ;
                        }
                    }


                }else{
                    //type = 'C'

                    //i가 오자마자 C면 패쓰
                    if ( data[i-1] == undefined ) {
                        continue ;
                    }
                    if ( data[i-1][12] == type ) {
                        continue ;
                    }  //C == C

                    if ( last_c_name == name ){
                        name = '-' ;
                    }else if ( last_c_name == '-' ){
                        name = '-' ;
                    } ;


                    //처음받아온 tid와 다른 tid라면 그리지않는다.
                    if ( data[i-1][16] == 'DP' && data[i][16] == 'WP' ){

                        dp_flag = true ;


                    }else{

                        if ( this.param.topTid !== data[i-1][2] ) {
                            continue ;
                        }
                    }


                    was = data[i-1][3] + '_' + (data[i-1][2] || '').replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]]/g, '') + '_' + (tid|| '').replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]]/g, '') ;
                    c_id = data[i][3] + '_' + (tid || '').replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]]/g, '') + '_' + (data[i-1][2]|| '').replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]]/g, '') ;




                    if ( dp_flag ){
                        //내부모찾기.
                        was = '' ;
                        for ( var kx = 0 ; kx < this.box_design.length; kx++ ){
                            if ( this.box_design[kx].default_id == undefined ) {
                                continue ;
                            }

                            if ( this.box_design[kx].tid.indexOf(data[i-1][2]) > -1 ){
                                was = this.box_design[kx].id ;

                                boxes[was] = this.box_design[kx] ;
                                boxes[was].elapse_time_sum = txn_elapse;
                                boxes[was].remote_time_sum = elapse_time ;
                                boxes[was].exec_sum = exec_cnt ;

                                //tid = boxes[was].tid ;
                                //c_id = data[i][3] + '_' + (tid || '').replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]]/g, '');
                            }
                        }//end for
                        kx = null ;
                    }



                    if ( boxes[c_id] ){

                        if(boxes[c_id].tid.indexOf(tid) < 0){
                            boxes[c_id].tid.push(tid);
                        }

                        boxes[c_id].elapse_time_sum += txn_elapse;
                        boxes[c_id].remote_time_sum += elapse_time ;
                        boxes[c_id].exec_sum += exec_cnt ;

                    }else{
                        if ( was == '' ) {
                            continue ;
                        }
                        if ( boxes[was] == undefined ) {
                            parent_lvl = lvl + 1;
                        }
                        else{ parent_lvl = boxes[was].lvl ; }

                        boxes[c_id] = {
                            id              : c_id ,
                            elapse_time_sum : txn_elapse,
                            remote_time_sum : elapse_time,
                            exec_sum        : exec_cnt,
                            tid             : [tid],
                            name            : name ,
                            exception       : exception,
                            txnName         : txn_name,
                            type            : 'NONAME',
                            lvl             : lvl + 2,
                            parent          : was,
                            parent_lvl      : parent_lvl,
                            default_id      : data[i][3] + '_' + (data[i][2] || '').replace(/[\/~!@\#$%<>^&*\()\-=+_\'\[\]]/g, '')
                        } ;

                        last_c_name = name ;
                    }


                }



                //box connect
                if( was && c_id ){
                    var tmp = was + 'to' + c_id;

                    if(connect[tmp]){
                        connect[tmp].connect_elapse += txn_elapse;
                        connect[tmp].connect_exec += exec_cnt;
                    }else{
                        connect[tmp] = {
                            from : was,
                            to   : c_id,
                            connect_elapse : txn_elapse,
                            connect_exec   : exec_cnt,
                            dest           : dest
                        };
                    }

                    tmp = null ;
                }
            }




            var is_exist  ;
            for(var key in boxes){

                is_exist = false ;

                for( var idx = 0 ; idx < this.box_design.length; idx++ ){
                    if ( this.box_design[idx].id !== key ) {
                        continue ;
                    }

                    is_exist = true ;
                    boxes[key] = this.box_design[idx] ;
                } ;

                boxes[key].elapse_time_sum = self.toMliFix(boxes[key].elapse_time_sum);
                boxes[key].remote_time_sum = self.toMliFix(boxes[key].remote_time_sum);
                boxes[key].isMulti = (boxes[key].exec_sum > 1 ? true : false);

                if ( !is_exist ){
                    this.box_design.push(boxes[key]);
                } ;
            }
            key = null ;
            idx = null  ;

            for(var key2 in connect){
                connect[key2].connect_elapse = self.toMliFix(connect[key2].connect_elapse);
                this.box_connect.push(connect[key2]);
            }
            key2 = null ;
        }else{
            return ;
        }
    };

    /*
     *  0: "lvl" 1: "time" 2: "tid" 3: "type" 4: "p_was" 5: "WAS_NAME" 6: "txn_id"
     *  7: "TXN_NAME" 8: "method" 9: "c_tid" 10: "was" 11: "c_was_name" 12: "c_txn_id"
     *  13: "c_txn_name" 14: "dest" 15: "p_elapse_time" 16: "c_elapse_time" 17: "p_exec_cnt"
     *  18: "c_exec_cnt" 19: "txn_elapse" 20: "c_txn_elapse" 21: "web_ip" 22: "exception" 23: "c_exception"
     */
    this.defaultJavaDataParser = function(data){
        this.box_design.push({
            t : 'p',
            lvl : data[0] + 2,
            id: data[4],
            name : data[5],
            type : 'WAS',
            exec_sum : 1,
            elapse_time_sum : data[19],
            remote_time_sum : data[15],
            tid: data[2],
            txnName: data[7],
            exception: data[22],
            isMulti : false
        });
    };

    this.createFilter = function(){
        var el =
            '<div class="txn-path-filter">'+
            '<input type="number" pattern="[0-9]*" title=" '+common.Util.TR('Please enter only the numbers.')+' " min="0" value="' + this.elapsefilter + '">'+
            '<button>' + common.Util.TR('Elapse Filter') + '</button>'+
            '</div>';


        var $filter = $(el);
        this.$elapseFileterNumberField = $filter.find('input').on('blur', function(e){
            var value = this.$elapseFileterNumberField.val();
            if(value == null || value == ''){
                //this.$elapseFileterNumberField.val(1);
                this.$elapseFileterNumberField.val(this.elapsefilter);
            }
        }.bind(this));
        this.$elapseFileterButton = $filter.find('button').on('click', function(e){
            e.preventDefault();

            var $self = this.$target;
            var elapseValue = this.$elapseFileterNumberField.val();
            var i = 0, className = null, elapse = null;
            var focusingObj = {};

            if(isNaN(+elapseValue)){
                return;
            }else if(elapseValue == ''){
                //this.$elapseFileterNumberField.val(1);
                this.$elapseFileterNumberField.val(this.elapsefilter);
                return;
            }

            elapseValue = +elapseValue;

            $self.children().removeClass('focus');

            var $boxs = $self.children('.boxs'), boxLen = $boxs.length;
            var $connector = $self.children('svg'), conLen = $connector.length;
            //var $overlay = $self.children('.node-label'), overLen = $overlay.length;

            //box
            for(i; i < boxLen; i++){
                if(+$boxs[i].dataset.elapse > elapseValue){
                    $boxs[i].className += ' focus';
                    focusingObj[$boxs[i].dataset.id] = true;
                }
            }
            //connecter
//            for(i = 0; i < conLen; i++){
//                className = $connector[i].className.animVal;
//                elapse = +(className.substr(className.indexOf('elapse') + 7, className.lastIndexOf(' ')));
//                //baseVal
//                if(+elapse > elapseValue){
//                    if($connector[i].className.baseVal.indexOf('focus') == -1){
//                        $connector[i].className.baseVal += ' focus';
//                    }
//                }else{
//                    $connector[i].className.baseVal = $connector[i].className.baseVal.replace(' focus', '');
//                }
//            }
            //overlay
            //for(i = 0; i < overLen; i++){
            //    if($overlay[i]){
            //        if(focusingObj[$overlay[i].childNodes[0].dataset.to]){
            //            $overlay[i].className += ' focus';
            //
            //            if($connector[i]){
            //                if($connector[i].className.baseVal.indexOf('focus') == -1){
            //                    $connector[i].className.baseVal += ' focus';
            //                }
            //            }
            //        }else{
            //            if($connector[i]){
            //                $connector[i].className.baseVal = $connector[i].className.baseVal.replace(' focus', '');
            //            }
            //        }
            //    }
            //}
        }.bind(this));

        this.$target.append($filter);
    };

    this.createDesign =  function() {
        var result = '';
        var newDom = '';
        var server_id = '';
        var levelInfo = {};
        var box_design = self.box_design;
        var posMetrix = [];
        var maxNodeCount = 0;

        for(var i = 0 ;i < box_design.length; i++){
            if(posMetrix[box_design[i].lvl]){
                posMetrix[box_design[i].lvl].push(box_design[i].id);
            }else{
                posMetrix[box_design[i].lvl] = [box_design[i].id];
            }
        }

        for(var j =0; j < posMetrix.length; j++){
            if(posMetrix[j]){
                if(posMetrix[j].length > maxNodeCount){
                    maxNodeCount = posMetrix[j].length;
                }
            }
        }

        var pHeight = self.$target.parent().height(),
            cHeight = maxNodeCount * 80,
            pWidth = self.$target.parent().width(),
            cWidth = posMetrix.length * 300;

//      self.$target.height(Math.max(pHeight,cHeight)).width(Math.max(pWidth,cWidth));
//      self.$target.width(Math.max(pWidth,cWidth));

        _.each(box_design, function(idx, i) {
            var c_id = self.converter_id(idx.id);
            var isMulti = idx.isMulti;
            var top = 50;
            var dif = 0;
            var node = posMetrix[idx.lvl];
//          var pos = 0;
            var focusCss = '';
            var elapse_time = idx.elapse_time_sum;
            var left_size = 230 ;
            var parent_node = null ;

            switch (isMulti) {
                case 'true':
                    isMulti = 'multi';
                    break;
                case 'false':
                    isMulti = 'single';
                    break;
                default:
                    isMulti = 'single';
                    break;
            }

            if(self.elapsefilter != 0 && elapse_time > self.elapsefilter){
                focusCss = 'focus';
                self.focusingObj[idx.id] = true;
            }

            if(node.length != 1){
                if ( idx.lvl < 3 ){
                    dif = (100 / (node.length + 1));
                    top = dif * (node.indexOf(idx.id) + 1);
                }else{

                    if ( idx.parent_lvl == undefined ) {
                        return ;
                    }

                    parent_node = posMetrix[idx.parent_lvl] ;

                    dif = (100 / (parent_node.length + 1));
                    top = dif * (parent_node.indexOf(idx.parent)+1);
                }

            } ;

            if ( idx.lvl == 2 && posMetrix[1] == undefined ){
                if ( left_size == 230 ){
                    left_size = 200;
                }else{
                    left_size = 230 ;
                }

            } ;
            result += '<div id="' + c_id + '" class="boxs ' + idx.type + ' ' + isMulti + ' ' + focusCss + '"data-elapse="' + elapse_time + '" data-tid="' + idx.tid + '" data-id="' + idx.id +'" style="left:' + (((idx.lvl) * left_size ) || 50) + 'px;top:' + top + '%;">';
            result += '<span class="box_name">' + idx.name + '</span>';
            if(idx.txnName){
                result += '<span class="box_txn_name" title="'+ idx.txnName +'">' + idx.txnName + '</span>';
            }
            result += '<span class="box_elapse">' + elapse_time + '</span>';

            if(idx.type == 'WAS'){
                result += '<span class="box_remote">' + idx.remote_time_sum + '</span>';
            }

            if(idx.type != 'CLIENT'){
                result += '<span class="box_exec">' + idx.exec_sum + '</span>';
            }

            if(idx.exception){
                result += '<span class="box_exception">X</span>';
            }

            if (isMulti === 'multi') {
                result += '<div class="box_ico"></div>';
                result += '<div class="multi_expand"></div>';
            } else {
                result += '<div class="box_ico"></div>';
            }
            result += '</div>';



            if ( idx.type == 'WAS' ){
                if ( self.path_list.indexOf(idx.name+':'+idx.txnName) < 0 ){
                    self.path_list.push( idx.name+':'+idx.txnName ) ;
                } ;
            }

        });

        this.$target.append(result);



        //self.$target.find('div').on('dblclick', function(e){
        //console.debug('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa') ;
        //}) ;

        return result;
    };

    this.jsPlumbConnect = function(elapse) {
        console.debug('jsPlumbConenct call..');
        var linecolor = '#000';

        try{


            if ( self.box_connect.length == 0  ) {
                return ;
            }

            jsPlumb.importDefaults({
                DragOptions: {
                    cursor: 'move',
                    zIndex: 2000
                },
                HoverClass: 'connector-hover'
            });

//          jsPlumb.setSuspendDrawing(true);

            _.each(self.box_connect, function(idx) {
                var from = self.converter_id(idx.from),
                    to = self.converter_id(idx.to),
                    ip = (idx.dest || '').split('.'),
                    color = linecolor,
                    focusing = false,
                    focusCss = '';

                if(self.focusingObj[idx.to]){
                    focusing = true;
                    focusCss = 'focus';
                }
                var dest = idx.dest ? (idx.dest.indexOf('.') > 0 ? ( ip[2] + '.' + ip[3] + '<br/>') : (idx.dest + '<br/>')) : '';

                var con = jsPlumb.connect({
                    scope: 'path' + self.id,
                    source: from,
                    target: to,
                    // connector: 'Bezier',
                    connector: 'Straight',
//                  hoverPaintStyle:{strokeStyle:"#5d94a6"},
//                  cssClass: 'c1' + (idx%2 == 0? '' : ' c2'),
                    cssClass: focusCss + ' elapse=' + idx.connect_elapse,
                    endpoint: ['Dot', {
                        radius: 2
                    }],
                    anchor: 'AutoDefault',
                    paintStyle: {
                        lineWidth: 1,
                        strokeStyle: color
                    },
                    endpointStyle: {
                        fillStyle: linecolor
                    },
                    overlays: [
                        //['Label', {
                        //    cssClass: 'node-label' + (focusing ? ' focus' : ''),
                        //    label: '<div id="' + from + '_' + 'label" data-elapse="' + idx.connect_elapse + '" data-serverid="' + idx.from + '" data-to="' + idx.to + '">' + dest + idx.connect_elapse + ' s / ' + idx.connect_exec + '</div>',
                        //    location: 0.5,
                        //    id: 'label'
                        //}],
                        ['Arrow', {
                            // cssClass: 'l1arrow',
                            location: 1,
                            width: 6,
                            length: 10
                        }]
                    ]
                });
                con.focusing = focusing;
                con.highLight= true;
            });

        }catch(e){
            console.debug(e);
        }finally{
        }

        $('.boxs')
            .hover(function(e){
                jsPlumb.select({source: this.id}).each(function(connection) {
                    connection.setPaintStyle({
                        strokeStyle: 'blue',
                        lineWidth: 1.5
                    });

                    $(connection.getOverlays()[0].canvas).addClass('light');
                });
            },function(e){
                jsPlumb.select({source: this.id}).each(function(connection) {
                    if(connection.focusing){
                        connection.setPaintStyle({
                            strokeStyle: '#f00',
                            lineWidth: 0.5
                        });
                    }else{
                        connection.setPaintStyle({
                            strokeStyle: '#505050',
                            lineWidth: 0.5
                        });
                    }
                    if(! connection.highLighting){
                        $(connection.connector.canvas).css('opacity' , .1);
                    }
                    $(connection.getOverlays()[0].canvas).removeClass('light');
                });
            })
            .on('dblclick', function(e){
                var target = this.id;
                var $self  = $(this);
                var realId = $self.data('id');
                var $pathView = self.$target;





                $pathView.children('.boxs, .node-label').addClass('opacity');
                $pathView.children('svg').each(function(index){
                    var $self = $(this);
                    var className = $self.attr('class');

                    if(className.indexOf('opacity') < 0){
                        $self.attr('class', 'opacity ' + className);
                    }
                });

                var connections = jsPlumb.getConnections({scope: 'path' + self.id})|| [];

                for(var i = 0 ;i < connections.length; i++){
                    connections[i].highLighting = false;
                }

                downSearch(target, realId, $pathView);
                upSearch(target, realId, $pathView);

                function downSearch(target, realId, $pathView){
                    var $node = $pathView.find('#' + target);
                    var $t = null;

                    if(! $node) {
                        return;
                    }

                    $node.removeClass('opacity');

                    jsPlumb.select({source: target}).each(function(connection) {
                        // overlay
                        $(connection.getOverlays()[0].canvas).removeClass('opacity');

                        $(connection.connector.canvas).each(function(index){
                            var $self = $(this);
                            var className = $self.attr('class');
                            $self.attr('class', className.replace('opacity ', ''));
                        });

                        connection.highLighting = true;
                    });

                    var childs = _.filter(self.box_connect, function(num){
                        return num.from == realId;
                    });
                    for(var i = 0 ;i < childs.length; i++){
                        $t = $pathView.find('#' + self.converter_id(childs[i].to));
                        downSearch($t.attr('id'), $t.data('id'), $pathView);
                    }
                }

                function upSearch(target, realId, $pathView){
                    var $node = $pathView.find('#' + target);
                    var $t = null;

                    if(! $node) {
                        return;
                    }

                    $node.removeClass('opacity');

                    jsPlumb.select({target: target}).each(function(connection) {
                        $(connection.getOverlays()[0].canvas).removeClass('opacity');
                        $(connection.connector.canvas).each(function(index){
                            var $self = $(this);
                            var className = $self.attr('class');
                            $self.attr('class', className.replace('opacity ', ''));
                        });
                        connection.highLighting = true;
                    });

                    var childs = _.filter(self.box_connect, function(num){
                        return num.to == realId;
                    });
                    for(var i = 0 ;i < childs.length; i++){
                        $t = $pathView.find('#' + self.converter_id(childs[i].from));
                        upSearch($t.attr('id'), $t.data('id'), $pathView);
                    }
                }



                var txn_name = this.innerText.split('\n') ;
                txn_name = txn_name[0]+':'+txn_name[1] ;
                var idx ; //= self.path_list.indexOf(txn_name) ;
                var tid = $self.attr('data-tid') ;

                if ( tid !== 'null' ){
                    var call_txn ;

                    for ( var ix = 0 ; ix < self.param.calltree.find('.txn-detail-center-call-tab span').length; ix++ ){
                        call_txn = self.param.calltree.find('.txn-detail-center-call-tab span')[ix].innerText ;

                        if ( self.path_list.indexOf(call_txn) == -1 ) {
                            continue ;
                        }
                        if ( call_txn !== txn_name ) {
                            continue ;
                        }
                        idx = ix ;
                    }

                    if ( idx !== undefined ){
                        idx = Number( self.param.calltree.find('.txn-detail-center-call-tab span')[idx].attributes['data-index'].value ) ;
                        $pathView.hide() ;
                        self.param.calltree.show() ;
                        self.param.pagetree.hide() ;
                        self.param.calltree.find('.txn-detail-center-call-tab span').eq(idx).click();
                        $(self.param.center_side.find('li')[1]).addClass('active').siblings().removeClass('active');
                    }

                    txn_name = null ;
                    idx = null ;
                    tid = null ;
                    ix = null ;
                } ;


                e.stopPropagation();


            });

        this.$target.parent().on('dblclick', function(){
            var $self = $(this);
            $self.find('path, .boxs, .node-label').removeClass('opacity');
            $self.find('svg').css('opacity', 1);
        });

        jsPlumb.draggable(this.$target.find('.boxs'),  { containment: this.$target});
    };

    this.draw = function(){
        this.$target.parent().show();
        this.createDesign();
        this.jsPlumbConnect(this.elapsefilter);
        this.createFilter();
    };



    /* util */

    this.toMliFix = function(value){
        return ((value*1 || 0) / 1000).toFixed(3);
    };

    this.converter_id = function(string) {
        var result = '';
        result = (this.id + '_' + string).
            split(':').join('').
            split(' ').join('').
            split('.').join('').
            split('?').join('').
            split(';').join('');

        return result;
    };


    this.initArgument(arg);

    return this;
};