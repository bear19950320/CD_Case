// 全局页面跳转加载到ifream的Dom里面
var ifreamUrl=function(obj){
    document.title = $(obj).text();
    flagAdmin = 0;
    $(".admin-menu").hide()
    // 组件目录/html的名字
    $("#iframe-content").attr("src", './pages/' + $(obj).attr("url") + '.html');
}
