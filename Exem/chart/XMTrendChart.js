(function(XM){
	/**
	 * @note XMCanvas 상속.
	 * @param arg
	 * @constructor
	 */
	var XMTrendChart = function(arg){
		this.legendNameHighLight = true;
		if(! this.initProperty(arg)){
			return ;
		}
		// this.firstShowLegend = false;
		this.init();

	};

	// 상속
	XMTrendChart.prototype = XM.cls.create('XMLineChart');

	XMTrendChart.prototype.xLabelFormat = function(value){
		var date = new Date(+value);
		return (date.getHours()   < 10 ? '0' : '') + date.getHours()   + ":" +
			(date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" +
			(date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
	};

	XMTrendChart.prototype.yLabelFormat = function(value){
		var prefix = d3.formatPrefix(value);
		if (value >= 1000) {
			return prefix.scale(value) + prefix.symbol;
		} else {
			return value;
		}
	};

	XMTrendChart.prototype.toolTipFormat = function(value){
		var date = new Date(value);
		return (date.getHours()   < 10 ? '0' : '') + date.getHours()   + ":" +
			(date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" +
			(date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
	};

	XMTrendChart.prototype.setYAxisFormatter = function(){

		var fn = this.checkUnitType(this.unitType);
		if(fn){
			this.yLabelFormat = fn;
		}

	};

	XMTrendChart.prototype.checkUnitType = function(type){
		var tickFormatFunc = null;

		if(!type){
			//tickFormatFunc = function(val, axis){
			//    return common.Util.numberWithComma(common.Util.toFixed(val, axis.tickDecimals));
			//}.bind(this);
			return tickFormatFunc;
		}

		switch(type){
			case 'count':
			case 'counts':
			case 'block':
			case 'blocks':
			case 'number':
			case 'byte':
			case 'bytes':
			case 'KB':
				tickFormatFunc = function suffixFormatter(val, axis) {
					var result = 0;
					if (val >= 1000000000) {
						if (val % 1000000000 == 0) {
							result = (val / 1000000000).toFixed(axis.tickDecimals) + "G";
						}
						else {
							result = (val / 1000000000).toFixed(1) + "G";
						}
						return result;
					}
					else if (val >= 1000000) {
						if (val % 1000000 == 0) {
							result = (val / 1000000).toFixed(axis.tickDecimals) + "M";
						}
						else {
							result = (val / 1000000).toFixed(1) + "M";
						}
						return result;
					}
					else if (val >= 1000) {
						if (val % 1000 == 0) {
							result = (val / 1000).toFixed(axis.tickDecimals) + "k";
						}
						else {
							result = (val / 1000).toFixed(1) + "k";
						}
						return result;
					}
					else{
						return val.toFixed(axis.tickDecimals);
					}
				};
				break;

			case '%':
				this.options.yaxis.max = 100;
				break;
			//tickFormatFunc = function suffixFormatter(val, axis) {
			//    if (val >= 1000000000000000000)
			//        return (val / 1000000000000000000).toFixed(axis.tickDecimals) + " ZB";
			//    else if (val >= 1000000000000000)
			//        return (val / 1000000000000000).toFixed(axis.tickDecimals) + " EB";
			//    else if (val >= 1000000000000)
			//        return (val / 1000000000000).toFixed(axis.tickDecimals) + " PB";
			//    else if (val >= 1000000000)
			//        return (val / 1000000000).toFixed(axis.tickDecimals) + " G";
			//    else if (val >= 1000000)
			//        return (val / 1000000).toFixed(axis.tickDecimals) + " M";
			//    else if (val >= 1000)
			//        return (val / 1000).toFixed(axis.tickDecimals) + " k";
			//    else
			//        return val.toFixed(axis.tickDecimals);
			//};
			//break;
            default:
                break;
		}

		return tickFormatFunc;
	};
//////////////////////////////////////////////////// OVERLAY ////////////////////////////////////////////////////

//////////////////////////////////////////////////// OVERLAY ACTION ////////////////////////////////////////////////////

//////////////////////////////////////////////////// EVENT ////////////////////////////////////////////////////
	/**
	 * @note 레전드 영역 컬러 클릭 이벤트
	 * @param e
	 */
	XMTrendChart.prototype.legendColorClick = function(e){
		var seriesIndex = e.target.dataset.seriesIndex;
		var check = +e.target.dataset.check;
		var color = this.serieseList[seriesIndex].color || this.options.colors[seriesIndex];
		// 색이 채워져 있는 상태
		if(check == 1){
			this.setSeriesVisible(seriesIndex, false);
			e.target.dataset.check = 0;
			e.target.style.backgroundColor = '';
			e.target.style.border = '2px solid ' + color;
		}else{
			this.setSeriesVisible(seriesIndex, true);
			e.target.dataset.check = 1;
			e.target.style.backgroundColor = color;
			e.target.style.border = 'none';
		}
		this.draw();
	};

	XMTrendChart.prototype.legendNameMouseEnter = function(e){
		var seriesIndex = e.target.dataset.seriesIndex;
        if (this.serieseList[seriesIndex].type == 'band') {
            return;
        }

		this.serieseList[seriesIndex].overLineWidth = this.serieseList[seriesIndex].lineWidth + 2;
		this.draw();
	};
	XMTrendChart.prototype.legendNameMouseLeave = function(e){
		var seriesIndex = e.target.dataset.seriesIndex;
		this.serieseList[seriesIndex].overLineWidth = null;
		this.draw();
	};
//////////////////////////////////////////////////// UTIL ////////////////////////////////////////////////////
	XM.cls['XMTrendChart'] = XMTrendChart;
})(window.EXEM);
