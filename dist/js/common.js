var common = {
    /**
     *  搜索框的渲染
     */
    'search': function (obj, name, type, valOption, id) {
        var objLength, nameArr;
        if (typeof name != Array) {
            nameArr = name.split(",")
            objLength = name.split(",").length;
        } else {
            objLength = name.length;
            nameArr = name;
        }
        if (objLength > 0) {
            var html = '<div class="layui-row searchCon">'
            for (var i = 0; i < objLength; i++) {
                if (type[i]) {
                    if (objLength == 2) {
                        html += '<div class="layui-col-lg6 layui-col-sm6 layui-col-md6">';
                    } else if (objLength == 3) {
                        html += '<div class="layui-col-lg4 layui-col-sm4 layui-col-md4">';
                    } else if (objLength == 4) {
                        html += '<div class="layui-col-lg3 layui-col-sm3 layui-col-md3">';
                    }
                    html += '<label class="layui-form-label">' + nameArr[i] + ' :</label>';
                    html += '<div class="layui-input-inline">';
                    $type = type[i];
                    switch ($type) {
                        /*如果这是input框
                        */
                        case 'input': {
                            html += '<input type="text" id="' + id[i] + '" title="' + nameArr[i] + '" />'
                            break;
                        }
                        /*如果这是select框
                        **/
                        case 'select': {
                            html += '<select class="form-control" id="' + id[i] + '"  title="' + nameArr[i] + '">'
                            html += '<option value="0">全部</option>';
                            html += option(valOption[i]);
                            html += '</select>'
                        }
                    }
                    html += '</div></div>'
                }
            }
            html += '</div>'
            $(obj).append(html);
        }
    },
    /**
     * 表单生成
     */
    'form': function (obj, name, type, valOption, id) {
        var objLength, nameArr;
        if (typeof name != Array) {
            nameArr = name.split(",")
            objLength = name.split(",").length;
        } else {
            objLength = name.length;
            nameArr = name;
        }
        if (objLength > 0) {
            var html = '<form class="layui-row layui-form searchCon" id="formCom">'
            for (var i = 0; i < objLength; i++) {
                if (type[i]) {
                    if (objLength % 3 == 0) {
                        html += '<div class="layui-col-lg4 layui-col-sm4 layui-col-md4">';
                    } else if (objLength % 4 == 0) {
                        html += '<div class="layui-col-lg3 layui-col-sm3 layui-col-md3">';
                    } else {
                        html += '<div class="layui-col-lg6 layui-col-sm6 layui-col-md6">';
                    }
                    html += '<label class="layui-form-label">' + nameArr[i] + ' :</label>';
                    if (valOption[i].length >= 4) {
                        html += '<div class="layui-input-block">';
                    } else {
                        html += '<div class="layui-input-inline">';
                    }
                    $type = type[i];
                    switch ($type) {
                        /*如果这是input框
                        */
                        case 'input': {
                            html += '<input type="text" id="' + id[i] + '"  name="' + id[i] + '" title="' + nameArr[i] + '" />'
                            break;
                        }
                        /*如果这是select框
                        **/
                        case 'select': {
                            html += '<select class="form-control" id="' + id[i] + '"  name="' + id[i] + '"  title="' + nameArr[i] + '">'
                            html += '<option value="0">全部</option>';
                            html += option(valOption[i]);
                            html += '</select>';
                            break;
                        }
                        case 'switch': {
                            html += '<input type="checkbox" id="' + id[i] + '"  name="' + id[i] + '" title="' + nameArr[i] + '" lay-skin="switch" lay-text="' + valOption[i] + '" />'
                            break;
                        }
                        case 'primaryNew': {
                            html += '<div style="display:block;">' + primaryNew(valOption[i]) + '</div>';
                        }
                    }
                    html += '</div></div>'
                }
            }
            html += '</form>';
            $(obj).html(html);
        }
    }
}
/**
 * 搜索下面的select的option渲染
 * @param {search>select} Array 
 */
function option(Array) {
    var html = '';
    for (var i in Array) {
        html += '<option value="' + (Number(i) + 1) + '">' + Array[i] + '</option>'
    }
    return html;
}
/**
 * 搜索下面的primaryNew的新方法渲染
 * @param {search>primaryNew} Array 
 * 下面的name需要更改
 */
function primaryNew(Array) {
    var html = '';
    for (var i in Array) {
        html += ' <input type="checkbox" name="like[write]" title="' + Array[i] + '">'
    }
    return html;
}
/**
 * 搜索下面的primaryNew的原始方法渲染
 * @param {search>primaryOld} Array 
 * 下面的name需要更改
 */
function primaryOld(Array) {
    var html = '';
    for (var i in Array) {
        html += ' <input type="checkbox" name="like[write]" lay-skin="primary" title="' + Array[i] + '">'
    }
    return html;
}
/**
 * 转为年月日格式的函数
 * 调用方法 new Date().Format("yyyy-MM-dd hh:mm:ss") PS:(除了单词外其他都可以改)
 */
function time(obj){
    Date.prototype.Format = function (fmt) { // author: meizz
        var o = {
            "M+": this.getMonth() + 1, // 月份
            "d+": this.getDate(), // 日
            "h+": this.getHours(), // 小时
            "m+": this.getMinutes(), // 分
            "s+": this.getSeconds(), // 秒
            "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
            "S": this.getMilliseconds() // 毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
}