function WasSelectForm(arg){
    this.target = null;
    this.socket = null;
    this.instanceList = null;
    this.wasCount = 0;
    this.setTextTarget = null;
    var self = this;
    
    this.initArgument = function(arg) {
        for(var key in arg){
            if(this[key] !== undefined){
                this[key] = arg[key];
            }
        }
        
        this.$target = $('#' + this.target);
    };
    
    this.createForm = function(){
        var i = 0;
        this.$wasLayer = $('<div id="wasLayer"></div>');
        var wasHtml = '<div class="was-list-header">SelectWasForm<span class="form-close">X<span></div><div class="was-list-content"><div class="was-select-all"><input type="checkbox" id="wasSelectAll"/><label for="wasSelectAll">All</label></div>';
        
        $('body').append(this.$wasLayer);
        
        var wasList = _.groupBy(this.instanceList, function(n){return n[4];});
        // group 정보(server type 이 web, db인 경우)가 없는 데이터는 삭제한다
        delete wasList[''];
        
        for(var key in wasList){
            for(i= 0 ; i < wasList[key].length; i++){
                var groupName = wasList[key][i][4].replace(wasList[key][i][4].split(/[^0-9]/g)[0], '');
                if(i == 0){
                    wasHtml += '<ul><li class="was-list-parent "><span class="toggle collapse"></span><input type="checkbox" id="t_r'+ key + '"/><label for="t_r'+ key +'">' + groupName + '</label><ul class="was-list-child">';                 
                }
                wasHtml += '<li class="was-list-child"><input type="checkbox" id="t_r'+ key + '_' + i +'" value="'+ wasList[key][i][1] +'" data-wasname="'+ wasList[key][i][2]+'"/><label for="t_r'+ key + '_' + i +'">' + wasList[key][i][2] + '</label></li>';
                
                ++this.wasCount;
            }
            wasHtml += '</ul></li></ul>';
        }       
        wasHtml += '</div><div class="was-list-bottom"><button id="wasSelectOk">OK</button></div></div>';
        
        this.$wasLayer.append(wasHtml).find('.toggle').on('click', function(e){
            var $this = $(this).siblings('.was-list-child').toggle().end();
            if ($this.hasClass('collapse')) {
                $this.removeClass('collapse').addClass('expand');
            } else if ($this.hasClass('expand')) {
                $this.removeClass('expand').addClass('collapse');
            }
        }).end().find('#wasSelectOk').on('click', function(e){
            e.preventDefault();
            var wasId = [],
                wasName = [];
            self.$wasLayer.find('[type=checkbox]:checked').each(function(idx){
                var $self = $(this); 
                if($self.val() == 'on') return;
                wasId.push($self.val());
                wasName.push($self.data('wasname'));
            });


            self.setTextTarget.setValue(wasName.join(','));
            self.setTextTarget.setWasListId(wasId.join(','));

            self.$target.val(wasName.join(',')).data('id', wasId.join(','));
            
            self.$wasLayer.hide();
        }).end().find('.form-close').on('click', function(e){
            self.$wasLayer.hide();
        }).end().find('.was-list-content').on('contextmenu', function(e){
            e.preventDefault();
            
            $('.was-list-context').css({
                top: e.pageY -2,
                left: e.pageX -2
            }).show();
            
            return false;
        }).end().find('#wasSelectAll').on('change', function(e){
            if(this.checked){
                self.$wasLayer.find('[type=checkbox]').each(function(idx){
                    var $self = $(this);
                    this.checked = true;
                    if($self.hasClass('part-opacity')){
                        $self.removeClass('part-opacity');
                    }
                });
            }else{
                self.$wasLayer.find('[type=checkbox]').each(function(idx){
                    var $self = $(this);
                    this.checked = false;
                    if($self.hasClass('part-opacity')){
                        $self.removeClass('part-opacity');
                    }
                });
            }
        }).end().find('.was-list-parent>[type=checkbox]').on('change', function(e){
            var $self = $(this);
            if($self.hasClass('part-opacity')){
                $self.removeClass('part-opacity');
            }
            if(this.checked){
                $self.siblings('.was-list-child').find('li  [type=checkbox]').each(function(idx){
                    this.checked = true;
                });
            }else{
                $self.siblings('.was-list-child').find('li  [type=checkbox]').each(function(idx){
                    this.checked = false;
                });
            }
            self.allCheck();
        }).end().find('.was-list-child>[type=checkbox]').on('change', function(e){
            var $checkboxs = $(this).parent().parent().find('[type=checkbox]');
            
            if($checkboxs.length == $checkboxs.filter(':checked').length){
                $(this).parent().parent().parent().children('[type=checkbox]').removeClass('part-opacity')[0].checked = true;
            }else if($checkboxs.filter(':checked').length == 0){
                $(this).parent().parent().parent().children('[type=checkbox]').removeClass('part-opacity')[0].checked = false;
            }else{
                $(this).parent().parent().parent().children('[type=checkbox]').addClass('part-opacity')[0].checked = true;
            }
            self.allCheck();
        });
        
        this.$target.val(this.serverList.wasName.join(',')).data('id',this.serverList.wasId.join(',')).click(function(e){
            e.preventDefault();
            var $self = $(this)
                , offset = $self.offset()
                , serverList = $self.data('id').split(',')
                , $wasLayer = $('#wasLayer');
            
            $wasLayer.find('[type=checkbox]').each(function(idx){
                this.checked = false;
            });
            
            for(var i = 0 ; i < serverList.length; i++){
                $wasLayer.find('[value='+serverList[i]+']').each(function(e){
                    this.checked = true;
                });
            }
            $wasLayer.find('.was-list-child>[type=checkbox]').change();
            
            $wasLayer = $('#wasLayer').css({
                left: offset.left ,
                top: offset.top + 23
            }).show();
        });        
    };
    
    this.allCheck = function(){
        var $wasSelectAll = $('#wasSelectAll');
        var total = this.wasCount;
        var checked = $('#wasLayer .was-list-child>[type=checkbox]:checked').length; 
        
        if(total == checked){
            $wasSelectAll[0].checked = true;            
        }else{
            $wasSelectAll[0].checked = false;
        }
    };
    
    this.executeQuery = function(){
        this.socket.ServiceInfo(function(header, data){
            this.instanceList = data.rows;
            
            this.serverList = (function(instanceList){
                var wasName = [],
                    wasId = [];
                for(var i = 0 ; i < instanceList.length; i++){
                    if(instanceList[i][0] ==  1){
                        wasId.push(instanceList[i][1]);
                        wasName.push(instanceList[i][2]);                        
                    }
                }
                return {
                    wasName : wasName,
                    wasId : wasId
                };
            })(this.instanceList);
            
            this.createForm();
        }.bind(this));
    };
    
    this.initArgument(arg);
    this.executeQuery();    
    
    return this;
}