/**
 * Created by JONGHO on 2015-07-23.
 */
Ext.define("Exem.TreeColumn", {
    extend: "Ext.tree.Column",
    alias: 'widget.exemtreecolumn',
    cellTpl: [
        '<tpl for="lines">',
        '<img src=" " class="{parent.childCls} {parent.elbowCls}-img ',
        '{parent.elbowCls}-<tpl if=".">line<tpl else>empty</tpl>" role="presentation"/>',
        '</tpl>',
        '<img src=" "  class="{childCls} {elbowCls}-img {elbowCls}',
        '<tpl if="isLast">-end</tpl><tpl if="expandable">-plus {expanderCls}</tpl>" role="presentation"/>',
        '<tpl if="checked !== null">',
        '<input type="button" {ariaCellCheckboxAttr}',
        ' class="{childCls} {checkboxCls}<tpl if="checked"> {checkboxCls}-checked</tpl>"/>',
        '</tpl>',
        '<img src=" " role="presentation" class="{childCls} {baseIconCls} ',
        '{baseIconCls}-<tpl if="leaf">leaf<tpl else>parent</tpl> {iconCls}"',
        '<tpl if="icon">style="background-image:url({icon})"</tpl>/>',
        '<tpl if="href">',
        '<a href="{href}" role="link" target="{hrefTarget}" class="{textCls} {childCls}">{value}</a>',
        '<tpl else>',
        '<span class="{textCls} {childCls}">{value}</span>',
        '</tpl>'
    ]
});


// 트리에서 force fit 사용시 컬럼 flex로 size가 변경되는 문제 때문에 추가. 2015-12-11  KJH
// 기존 파일 Ext.layout.container.Box 에서는
//   roundFlex: function(width) {
//      return Math.floor(width);    // 버림.
//   },
// 수정 내용은 width  flex 계산시 반올림.

Ext.define('Ext.override.grid.ColumnLayout', {
    override: 'Ext.grid.ColumnLayout',
    roundFlex: function(width) {
        return Math.round(width);
    }
});

