Ext.define('Exem.WidgetActiveTxn', {
    extend : 'Ext.Component',
    alias  : 'widget.ActiveTxn',
    layout : 'fit',
    cls    : 'widgetActiveTxn',
    listeners: {
        beforedestroy: function() {
            if (this.barTooltip) {
                this.barTooltip.css({'display': 'none'});
                this.barTooltip.remove();
                this.toolTipOn = false;
            }
        },
    },

    init: function(column, widget, record) {
        this.initProperty(record);
        this.drawCanvasChart();
    },

    initProperty: function(record){
        var that = this;
        var rData = record.data;
        var theme = Comm.RTComm.getCurrentTheme();

        // 데이터 관련
        this.linear = d3.scale.linear();
        this.normal = rData.active_normal;
        this.warning = rData.active_warning;
        this.critical = rData.active_critical;

        var labelStyle = {
            fontSize : 12,
            fontFamily : 'Droid Sans'
        };

        this.COLOR = {
            BACKGROUND            : "#2C2F36",
            BLACK                 : "#181B24",
            LEGEND                : "#4C5960",
            LABEL                 : "#ABAEB5",
            CHART_BORDER_OUTER    : "#B9F6F9",
            CHART_BORDER_INNER    : "#3B4B53",
            SERVER_NORMAL         : "#40BFFF",
            SERVER_NORMAL_LIGHT   : "#61CAFF",
            SERVER_NORMAL_DARK    : "#00A9FF",
            SERVER_WARNING        : "#F8B656",
            SERVER_WARNING_LIGHT  : "#F0D761",
            SERVER_WARNING_DARK   : "#F69E1E",
            SERVER_CRITICAL       : "#F85353",
            SERVER_CRITICAL_LIGHT : "#F06161",
            SERVER_CRITICAL_DARK  : "#F6191A",
            SERVER_DOWN           : "#1D2025",
            SERVER_DOWN_LIGHT     : "#85878c",
            SERVER_DOWN_DARK      : "#24272C",
            PGBAR_BORDER          : "#1D1F26",
            PGBAR_SERVER_ON       : "#004790",
            PGBAR_DATA_ON         : "#00A9FF"
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

            this.posY  = this.canvas.height / 2 - 10;

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

    drawCanvasChart: function(data) {
        if(this.isReturn){
            return;
        }

        var sum, nor, war, cri, maximum;

        sum = this.normal + this.warning + this.critical;

        if(sum <= 30){
            nor = this.normal;
            war = this.warning;
            cri = this.critical;
        }else {
            maximum = 30;

            cri = this.critical > maximum ? maximum : this.critical;
            maximum = (maximum - cri) < 0 ? 0 : maximum - cri;

            war = this.warning > maximum ? maximum : this.warning;
            maximum = (maximum - war) < 0 ? 0 : maximum - war;

            nor = this.normal > maximum ? maximum : this.normal;
        }

        this.ctx.save();


        var width = (this.canvas.width - 20);
        var tickW = width / 30;

        //TOTAL
        this.ctx.fillStyle = this.COLOR.LABEL;
        this.ctx.font = '12px Gulim';
        this.ctx.textAlign = 'right';
        this.ctx.beginPath();
        this.ctx.fillText(this.normal + this.warning + this.critical, width + 20, this.posY + 13);

        //CRITICAL
        this.ctx.fillStyle = this.COLOR.SERVER_CRITICAL;
        this.ctx.beginPath();
        this.ctx.rect(width, this.posY, -tickW * cri, 10.5);
        this.ctx.fill();

        this.ctx.fillStyle = this.COLOR.SERVER_CRITICAL_DARK;
        this.ctx.beginPath();
        this.ctx.rect(width, this.posY + 10, -tickW * cri, 10);
        this.ctx.fill();

        //WARNING
        this.ctx.fillStyle = this.COLOR.SERVER_WARNING;
        this.ctx.beginPath();
        this.ctx.rect(width - tickW * cri , this.posY, -tickW * war, 10.5);
        this.ctx.fill();

        this.ctx.fillStyle = this.COLOR.SERVER_WARNING_DARK;
        this.ctx.beginPath();
        this.ctx.rect(width - tickW * cri , this.posY + 10, -tickW * war, 10);
        this.ctx.fill();

        //NORMAL
        this.ctx.fillStyle = this.COLOR.SERVER_NORMAL;
        this.ctx.beginPath();
        this.ctx.rect(width - tickW * (cri + war) , this.posY, -tickW * nor, 10.5);
        this.ctx.fill();

        this.ctx.fillStyle = this.COLOR.SERVER_NORMAL_DARK;
        this.ctx.beginPath();
        this.ctx.rect(width - tickW * (cri + war) , this.posY + 10, -tickW * nor, 10);
        this.ctx.fill();

        //NONE
        this.ctx.fillStyle = this.COLOR.SERVER_DOWN;
        this.ctx.beginPath();
        this.ctx.rect(0, this.posY, width - tickW * (cri + war + nor), 10.5);
        this.ctx.fill();

        this.ctx.fillStyle = this.COLOR.SERVER_DOWN_DARK;
        this.ctx.beginPath();
        this.ctx.rect(0, this.posY + 10, width - tickW * (cri + war + nor), 10);
        this.ctx.fill();

        this.ctx.restore();
    },

    setTooltip: function() {
        if(this.barTooltip){
            return;
        }
        var that = this;
        var updateStr = '';

        this.barTooltip = $('<div class="stackbar-chart-tooltip tooltipPanel activeTxnToolTip"></div>').css({
            'position': 'absolute',
            'display' : 'none',
            'z-index' : 20000,
            'color'   : '#000',
            'background-color': '#fff',
            'padding' : '0px 0px 0px 0px',
            'border'  : '1px solid #D8D8D8',
            'border-radius': '4px',
            'width'   : 150
        });

        updateStr +=
            '</div>'+
            '<div style="height: 1px; /*background: #aaaaaa;*/ margin: 5px 10px 5px 10px;"></div>'+
            '<div style ="display: block;height: 65px; margin: 0px 5px 0px 0px;" ;>';

        // Normal
        updateStr +=
            '<div style="float: left;width: 60%;margin-left: 9px;">' +
            '<div style="color:#42A5F6;margin-bottom: 4px;font-size: 14px;">'+common.Util.TR('Normal')+'</div>'+
            '</div>'+
            '<div style="margin-left: 4px;">' +
            '<div class="normal" style="margin-bottom: 4px;font-size: 14px;"></div>'+
            '</div>';
        // Warning
        updateStr +=
            '<div style="float: left;width: 60%;margin-left: 9px;">' +
            '<div style="color:#FF9803;margin-bottom: 4px;font-size: 14px;">'+common.Util.TR('Warning')+'</div>'+
            '</div>'+
            '<div style="margin-left: 4px;">' +
            '<div class="warning" style="margin-bottom: 4px;font-size: 14px;"></div>'+
            '</div>';
        // Critical
        updateStr +=
            '<div style="float: left;width: 60%;margin-left: 9px;">' +
            '<div style="color:#D7000F;margin-bottom: 4px;font-size: 14px;">'+common.Util.TR('Critical')+'</div>'+
            '</div>'+
            '<div style="margin-left: 4px;">' +
            '<div class="critical" style="margin-bottom: 4px;font-size: 14px;"></div>'+
            '</div>';

        updateStr += '</div></span>';

        this.barTooltip.append(updateStr);
        $('body').append(this.barTooltip);

        this.barTooltip.bind('mouseleave', function(e) {
            e.preventDefault();
            that.barTooltip.css({'display': 'none'});
        });

    },

    getDataRange: function(nor, war, cri){
        var sum, range;

        sum = nor + war + cri;
        range = this.linear.domain([0, sum]).range([0, 30]);

        return {'normal': range(nor), 'warning': range(war), 'critical': range(cri), 'none': 0};
    },

    checkMousePos: function(_this, pos, eventName){
        if (pos[0] >= 5 && pos[0] <= _this.canvas.width - 20 && pos[1] >= this.posY && pos[1] <= this.posY + 20) {
            if (!this.toolTipOn) {
                this.barTooltip.find('.normal').text(this.normal);
                this.barTooltip.find('.warning').text(this.warning);
                this.barTooltip.find('.critical').text(this.critical);
                this.barTooltip.css({
                    'top': this.rect.top + this.posY + 20,
                    'left': this.rect.left + this.canvas.width / 2,
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