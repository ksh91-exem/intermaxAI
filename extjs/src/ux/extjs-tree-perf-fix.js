//Ext.define('My.tree.Column', {
//    override: 'Ext.tree.Column',
//    alias: 'widget.fasttree',
//    cellTpl: [
//        '<tpl for="lines">',
//        '<img src="" class="{parent.childCls} {parent.elbowCls}-img ',
//        '{parent.elbowCls}-<tpl if=".">line<tpl else>empty</tpl>"',
//        'style="z-index:-1;" role="presentation"/>',
//        '</tpl>',
//        '<img src="" class="{childCls} {elbowCls}-img {elbowCls}',
//        'style="z-index:-1;" ',
//        '<tpl if="isLast">-end</tpl><tpl if="expandable">-plus {expanderCls}</tpl>" role="presentation"/>',
//        '<tpl if="checked !== null">',
//        '<input type="button" {ariaCellCheckboxAttr}',
//        ' class="{childCls} {checkboxCls}<tpl if="checked"> {checkboxCls}-checked</tpl>"/>',
//        '</tpl>',
//        '<img src="" role="presentation" class="{childCls} {baseIconCls} ',
//        '{baseIconCls}-<tpl if="leaf">leaf<tpl else>parent</tpl> {iconCls}"',
//        '<tpl if="icon">style="z-index:-1; background-image:url({icon})"</tpl>/>',
//        '<tpl if="href">',
//        '<a href="{href}" role="link" target="{hrefTarget}" class="{textCls} {childCls}">{value}</a>',
//        '<tpl else>',
//        '<span class="{textCls} {childCls}">{value}</span>',
//        '</tpl>'
//    ]
//});