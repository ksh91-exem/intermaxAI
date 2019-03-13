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


// Ʈ������ force fit ���� �÷� flex�� size�� ����Ǵ� ���� ������ �߰�. 2015-12-11  KJH
// ���� ���� Ext.layout.container.Box ������
//   roundFlex: function(width) {
//      return Math.floor(width);    // ����.
//   },
// ���� ������ width  flex ���� �ݿø�.

Ext.define('Ext.override.grid.ColumnLayout', {
    override: 'Ext.grid.ColumnLayout',
    roundFlex: function(width) {
        return Math.round(width);
    }
});

