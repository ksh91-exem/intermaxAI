Ext.define('Exem.WidgetTimeLine', {
    extend  : 'Ext.Component',
    alias   : 'widget.TimeLine',
    layout  : 'fit',
    cls     : 'widgetTimeLine',

    init: function(column, widget, record) {
        this.initProperty(record);
        this.drawCanvasChart();
    },

    initProperty: function(record){
        // console.dir(record);
        var ix, ixLen;
        var that = this;
        var theme = Comm.RTComm.getCurrentTheme();

        this.rData = record.data;
        this.tierList = new Array(Comm.bizGroups.length);
        this.linear = d3.scale.linear();
        this.tierElapseArr = [];

        this.COLOR = ['#2B99F0', '#7FCD2A', '#514C7C', '#B75C5C', '#2F42BA', '#66CCC4', '#8C943B'];
        this.COLOR_DARK = ['#2789D8', '#72B826', '#45416E', '#A45353', '#2838B0', '#52BBB4', '#7D8531'];

        var labelStyle = {
            fontSize : 12,
            fontFamily : 'Droid Sans'
        };

        var girdLineColor, borderColor;

        switch (theme) {
            case 'Black' :
                labelStyle.color = realtime.lineChartColor.BLACK.label;
                girdLineColor    = realtime.lineChartColor.BLACK.gridLine;
                borderColor      = realtime.lineChartColor.BLACK.border;
                break;
            case 'Gray' :
                labelStyle.color = realtime.lineChartColor.GRAY.label;
                girdLineColor    = realtime.lineChartColor.GRAY.gridLine;
                borderColor      = realtime.lineChartColor.GRAY.border;
                break;
            default :
                labelStyle.color = realtime.lineChartColor.WHITE.label;
                girdLineColor    = realtime.lineChartColor.WHITE.gridLine;
                borderColor      = realtime.lineChartColor.WHITE.border;
                break;
        };

        if(this.getEl()){
            this.container = document.createElement('div');

            this.canvas = document.createElement('canvas');	// 메인 뷰 캔버스
            this.ctx = this.canvas.getContext('2d');

            this.el.dom.appendChild(this.canvas);

            this.canvas.width = this.lastBox.width;
            this.canvas.style.width = this.lastBox.width + 'px';
            this.canvas.height = 53;
            this.canvas.style.height = '53px';

            this.posY  = this.canvas.height / 2 - 14.5;

            this.canvas.addEventListener('mousemove', function(e){
                that.rect = this.getBoundingClientRect();
                var pos = [
                    e.clientX - that.rect.left,
                    e.clientY - that.rect.top
                ];
                that.checkMousePos(that, pos, 'mousemove');
            });

            this.canvas.addEventListener('mouseleave', function(e){
                that.barTooltip.css({'display': 'none'});
                that.toolTipOn = false;
            });

            if(!this.barTooltip) {
                this.setTooltip();
            }

            this.isReturn = false;
        }else{
            this.isReturn = true;
        }
    },

    drawCanvasChart: function(){
        if(this.isReturn){
            return;
        }

        var ix, ixLen, width, tickW;
        var start, end, isEmpty;

        width = (this.canvas.width - 10);
        tickW = width / 100;
        isEmpty = 1;
        this.tierElapseArr = this.getDataRange(this.rData.tierElapse);

        this.ctx.save();

        start = 0;
        end = 0;

        for(ix = 0, ixLen = this.tierElapseArr.length; ix < ixLen; ix++){
            if(this.tierElapseArr[ix] !== 0){
                start += end;
                end = this.tierElapseArr[ix] * tickW;

                this.ctx.beginPath();
                this.ctx.fillStyle = this.COLOR[ix];
                this.ctx.rect(start, this.posY, end, 15.5);
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.fillStyle = this.COLOR_DARK[ix];
                this.ctx.rect(start, this.posY + 15, end, 15);
                this.ctx.fill();

                isEmpty = 0;
            }
        }

        if(isEmpty){
            this.ctx.beginPath();
            this.ctx.fillStyle = '#1D2025';
            this.ctx.rect(0, this.posY, width, 15.5);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.fillStyle = '#24272C';
            this.ctx.rect(0, this.posY + 15, width, 15);
            this.ctx.fill();
        }

        this.ctx.restore();
    },

    getDataRange: function(arr){
        var tierId, sum, range, newArr, rangeVal;

        newArr = [];
        sum = 0;

        arr.map(function(d){
            sum += d.elapse;
        });

        range = this.linear.domain([0, sum]).range([0, 100]);

        arr.map(function(d){
            rangeVal = range(d.elapse);

            if(rangeVal > 0){
                newArr.push(rangeVal);
            }else{
                newArr.push(0);
            }
        });

        return newArr;
    },

    setTooltip: function() {
        if(this.barTooltip){
            return;
        }

        var ix, ixLen;
        var that = this;
        var updateStr, cls, tierNameList;

        updateStr = '';
        cls = '';

        this.barTooltip = $('<div class="stackbar-chart-tooltip tooltipPanel timeLineToolTip"></div>').css({
            'position': 'absolute',
            'display' : 'none',
            'z-index' : 20000,
            'color'   : '#000',
            'background-color': '#fff',
            'padding' : '0px 0px 0px 0px',
            'border'  : '1px solid #D8D8D8',
            'border-radius': '4px',
            'width'   : 200
        });

        updateStr +=
            '</div>'+
            '<div style="height: 1px; /*background: #aaaaaa;*/ margin: 5px 10px 5px 10px;"></div>'+
            '<div style ="display: block;height: 65px; margin: 0px 5px 0px 0px;" ;>';

        for(ix = 0, ixLen = Comm.sortTierInfo.length; ix < ixLen; ix++){
            cls = 'tier-' + Comm.sortTierInfo[ix].tierId;

            updateStr +=
                '<div style="float: left;width: 60%;margin-left: 9px;">' +
                '<div class="tierName" style="margin-bottom: 4px;font-size: 14px;">'+common.Util.TR(Comm.sortTierInfo[ix].tierName)+'</div>'+
                '</div>'+
                '<div style="margin-left: 4px;">' +
                '<div class="tierElapse" style="margin-bottom: 4px;font-size: 14px;">0</div>'+
                '</div>';
        }


        updateStr += '</div></span>';

        this.barTooltip.append(updateStr);

        tierNameList = this.barTooltip.find('.tierName');
        for(ix = 0, ixLen = tierNameList.length; ix < ixLen; ix++){
            tierNameList[ix].style.color = this.COLOR[ix];
        }

        $('body').append(this.barTooltip);

        this.barTooltip.bind('mouseleave', function(e) {
            e.preventDefault();
            that.barTooltip.css({'display': 'none'});
        });

    },

    checkMousePos: function(_this, pos, eventName){
        var ix, ixLen, tierElapseList;

        tierElapseList = [];

        if (pos[0] >= 5 && pos[0] <= _this.canvas.width - 5 && pos[1] >= this.posY + 5 && pos[1] <= this.posY + 40) {
            if (!this.toolTipOn) {
                tierElapseList = this.barTooltip.find('.tierElapse');

                for(ix = 0, ixLen = tierElapseList.length; ix < ixLen; ix++){
                    if(this.rData.tierElapse.length && this.rData.tierElapse[ix].elapse !== 0) {
                        tierElapseList[ix].textContent = common.Util.numberWithComma(this.rData.tierElapse[ix].elapse.toFixed(2));
                    }else{
                        tierElapseList[ix].textContent = 0;
                    }
                }

                this.barTooltip.css({
                    'top': this.rect.top + this.posY + 38,
                    'left': this.rect.left,
                    'display': 'block'
                });
                this.toolTipOn = true;
            }
        } else {
            this.barTooltip.css({'display': 'none'});
            this.toolTipOn = false;
        }
    }
});