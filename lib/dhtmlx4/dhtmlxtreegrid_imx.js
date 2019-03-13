
eXcell_tree.prototype.setValue = function(valAr){
	if (this.cell.parentNode.imgTag)
		return this.setLabel(valAr);
		
		
	if ((this.grid._tgc.iconTree==null)||(this.grid._tgc.iconTree!=this.grid.iconTree)){
		var _tgc={};
		_tgc.spacer="<img src='"+this.grid.iconTree+"blank.gif'  align='top' class='space'>";
		_tgc.imst="<img style='margin-top:0px;' src='"+this.grid.iconTree;
		_tgc.imsti="<img style='padding-top:2px;'  src='"+(this.grid.iconURL||this.grid.iconTree);
		_tgc.imact="' align='top' onclick='this."+(_isKHTML?"":"parentNode.")+"parentNode.parentNode.parentNode.parentNode.grid.doExpand(this);event.cancelBubble=true;'>"
		_tgc.plus=_tgc.imst+"plus.gif"+_tgc.imact;
		_tgc.minus=_tgc.imst+"minus.gif"+_tgc.imact;
		_tgc.blank=_tgc.imst+"blank.gif"+_tgc.imact;
		_tgc.start="<div class='treegrid_cell' style='overflow:hidden; white-space : nowrap; line-height:21px; height:"+(_isIE?21:21)+"px;'>";
		
		_tgc.itemim="' align='top' "+(this.grid._img_height?(" height=\""+this.grid._img_height+"\""):"")+(this.grid._img_width?(" width=\""+this.grid._img_width+"\""):"")+" ><span id='nodeval'>";
		_tgc.close="</span></div>";
		this.grid._tgc=_tgc;
	}
	var _h2=this.grid._h2;
	var _tgc=this.grid._tgc;
			
	var rid=this.cell.parentNode.idd;
	var row=this.grid._h2.get[rid];
	
	if (this.grid.kidsXmlFile || this.grid._slowParse) { 
		row.has_kids=(row.has_kids||(this.cell.parentNode._attrs["xmlkids"]&&(row.state!="minus")));
		row._xml_await=!!row.has_kids;
	}
	
	
	row.image=row.image||(this.cell._attrs["image"]||"leaf.gif");
	row.label=valAr;
           
    var html=[_tgc.start];
	
    for(var i=0;i<row.level;i++)
    	html.push(_tgc.spacer);
    
   //if has children
    if(row.has_kids){
    	html.push(_tgc.plus);
    	row.state="plus"
    	}
    else
    	html.push(_tgc.imst+row.state+".gif"+_tgc.imact);
                    
	html.push(_tgc.imsti);
	html.push(row.image);
	html.push(_tgc.itemim);
	html.push(row.label);
	html.push(_tgc.close);
	
                

	this.cell.innerHTML=html.join("");
	this.cell._treeCell=true;
	this.cell.parentNode.imgTag=this.cell.childNodes[0].childNodes[row.level];
	this.cell.parentNode.valTag=this.cell.childNodes[0].childNodes[row.level+2];
	if (_isKHTML) this.cell.vAlign="top";
	if (row.parent.id!=0 && row.parent.state=="plus") {
			this.grid._updateTGRState(row.parent,false);
			this.cell.parentNode._skipInsert=true;		
		}

	this.grid.callEvent("onCellChanged",[rid,this.cell._cellIndex,valAr]);
}

dhtmlXGridObject.prototype._fillRow = function(r, text){
    if (this.editor && this.editor.parentNode && this.editor.parentNode.idd == r.idd)
        this.editStop();

    for (var i = 0; i < r.childNodes.length; i++){
        if ((i < text.length)||(this.defVal[i])){
            
            var ii=r.childNodes[i]._cellIndex;
            var val = text[ii];
            var aeditor = this.cells4(r.childNodes[i]);

            if ((this.defVal[ii])&&((val == "")||( typeof (val) == "undefined")))
                val=this.defVal[ii];

            if (aeditor) aeditor.setValue(val)
        } else {
            r.childNodes[i].innerHTML="&nbsp;";
            r.childNodes[i]._clearCell=true;
        }
    }

    return r;
}

dhtmlXGridObject.prototype._addRow = function(new_id, text, ind){
    if (ind == -1|| typeof ind == "undefined")
        ind=this.rowsBuffer.length;
    if (typeof text == "string") text=text.split(this.delim);
    var row = this._prepareRow(new_id);
    row._attrs={
    };

    for (var j = 0; j < row.childNodes.length; j++)row.childNodes[j]._attrs={
    };


    this.rowsAr[row.idd]=row;
    if (this._h2) this._h2.get[row.idd].buff=row;   //treegrid specific
    this._fillRow(row, text);
    this._postRowProcessing(row);
    if (this._skipInsert){
        this._skipInsert=false;
        return this.rowsAr[row.idd]=row;
    }

    if (this.pagingOn){
        this.rowsBuffer._dhx_insertAt(ind,row);
        this.rowsAr[row.idd]=row;
        return row;
    }

    if (this._fillers){ 
        this.rowsCol._dhx_insertAt(ind, null);
        this.rowsBuffer._dhx_insertAt(ind,row);
        if (this._fake) this._fake.rowsCol._dhx_insertAt(ind, null);
        this.rowsAr[row.idd]=row;
        var found = false;

        for (var i = 0; i < this._fillers.length; i++){
            var f = this._fillers[i];

            if (f&&f[0] <= ind&&(f[0]+f[1]) >= ind){
                f[1]=f[1]+1;
                var nh = f[2].firstChild.style.height=parseInt(f[2].firstChild.style.height)+this._srdh+"px";
                found=true;
                if (this._fake){
                    this._fake._fillers[i][1]++;
                    this._fake._fillers[i][2].firstChild.style.height = nh;
                }
            }

            if (f&&f[0] > ind){
                f[0]=f[0]+1
                if (this._fake) this._fake._fillers[i][0]++;
            }
        }

        if (!found)
            this._fillers.push(this._add_filler(ind, 1, (ind == 0 ? {
                parentNode: this.obj.rows[0].parentNode,
                nextSibling: (this.rowsCol[1])
                } : this.rowsCol[ind-1])));

        return row;
    }
    this.rowsBuffer._dhx_insertAt(ind,row);
    return this._insertRowAt(row, ind);
}
    
dhtmlXGridObject.prototype._updateLine=function(z,row){ 
    row=row||this.rowsAr[z.id];
    if (!row) return;
    var im=row.imgTag;
    if (!im) return;
    if (z.state=="blank") {
        return im.src=this.iconTree+"blank.gif";
    }
    
        var n=1;
        if (z.index==0){
            if (z.level==0){
                if ((z.parent.childs.length-1)>z.index)
                    n=3;
                else n=1;
            }
            else
            {
                if ((z.parent.childs.length-1)>z.index)
                    n=3;
                else
                    n=2;
            }
        }
        else
            if ((z.parent.childs.length-1)>z.index)
                n=3;
            else
                n=2;
        
        im.src=''; //this.iconTree+z.state+n+".gif";
        im.src=this.iconTree+"blank.gif";
        $(im).removeClass('line1');
        $(im).removeClass('line2');
        $(im).removeClass('line3');
        $(im).removeClass('line3');
        $(im).removeClass('line4');
        $(im).removeClass('plus');
        $(im).removeClass('plus1');
        $(im).removeClass('plus2');
        $(im).removeClass('plus3');
        $(im).removeClass('plus4');
        $(im).removeClass('plus5');
        $(im).removeClass('minus');
        $(im).removeClass('minus1');
        $(im).removeClass('minus2');
        $(im).removeClass('minus3');
        $(im).removeClass('minus4');
        $(im).removeClass('minus5');
        $(im).addClass(z.state+n);
}

dhtmlXGridObject.prototype._updateParentLine=function(z,row){
    row=row||this.rowsAr[z.id];
    if (!row) return;
    var im=row.imgTag;
    if (!im) return;
    for (var i=z.level; i>0; i--){
        if (z.id==0) break;
        im=im.previousSibling;
        z=z.parent;
        if ((z.parent.childs.length-1)>z.index) {
            im.src='';//this.iconTree+"line1.gif";
            im.src=this.iconTree+"blank.gif";
            $(im).addClass('line1');
        } else {
            im.src= this.iconTree+"blank.gif";
            $(im).removeClass('line1');
            $(im).addClass('blank');
        }
    }
}