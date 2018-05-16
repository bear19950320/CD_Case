/**
 * common.js
 * @authors Bear (you@example.org)
 * @date    2018-4-26 15:20:23
 * @version $Id$
 */
/**
 * 公用加减的JS变量定义！ 
 * 
 */
$(function () {
    // bootstrap 的 鼠标悬停气泡定义
    $('[data-toggle="tooltip"]').tooltip()
})
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
                    html += '<label class="layui-form-label">' + nameArr[i] + ' </label>';
                    html += '<div class="layui-input-inline">';
                    $type = type[i];
                    switch ($type) {
                        /*如果这是input框
                        */
                        case 'input': {
                            html += ': <input type="text" id="' + id[i] + '" title="' + nameArr[i] + '" />';
                            break;
                        }
                        /*如果这是select框
                        **/
                        case 'select': {
                            html += ': <select class="form-control" id="' + id[i] + '"  title="' + nameArr[i] + '">'
                            html += '<option value="0">全部</option>';
                            html += commFun.option(valOption[i]);
                            html += '</select>';
                            break;
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
    'form': function (obj, name, type, valOption, id, col) {
        var objLength, nameArr;
        // 如果 name 不是数组是专为数组(是数组就不变)
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
                    //  判断是否是控制列数
                    if (col) {
                        if (col == 3) {
                            html += '<div class="layui-col-lg4 layui-col-sm4 layui-col-md4 formInput">';
                        } else if (col == 2) {
                            html += '<div class="layui-col-lg6 layui-col-sm6 layui-col-md6 formInput">';
                        } else if (col == 1) {
                            html += '<div class="formInput layui-col-lg10 layui-col-sm10 layui-col-md10 layui-col-md-offset1 layui-col-sm-offset1 layui-col-lg-offset1">';
                        }
                    } else {
                        //  已本身的名字的长度 来判断渲染什么样的删除格 
                        if (objLength % 3 == 0) {
                            html += '<div class="layui-col-lg4 layui-col-sm4 layui-col-md4 formInput">';
                        } else if (objLength % 4 == 0) {
                            html += '<div class="layui-col-lg3 layui-col-sm3 layui-col-md3 formInput">';
                        } else {
                            html += '<div class="layui-col-lg6 layui-col-sm6 layui-col-md6 formInput">';
                        }
                    }
                    // 填充label的内容
                    html += '<label class="layui-form-label">' + nameArr[i] + ': </label>';
                    // 判断是否是复选框
                    if (typeof valOption[i] == 'object') {
                        if (valOption[i].length >= 4) {
                            html += '<div class="layui-input-block">';
                        } else {
                            html += '<div class="layui-input-inline">';
                        }
                    } else {
                        html += '<div class="layui-input-inline">';
                    }
                    $type = type[i];
                    switch ($type) {
                        /*如果这是input框
                        */
                        case 'input': {
                            html += '<input type="text" id="' + id[i] + '"  name="' + id[i] + '" title="' + nameArr[i] + '"  placeholder="请输入' + nameArr[i] + '" />'
                            break;
                        }
                        /*如果这是select框
                        **/
                        case 'select': {
                            html += '<select class="form-control" id="' + id[i] + '"  name="' + id[i] + '" placeholder="请选择' + nameArr[i] + '"  title="' + nameArr[i] + '">'
                            html += '<option value="0">全部</option>';
                            html += commFun.option(valOption[i]);
                            html += '</select>';
                            break;
                        }
                        // switch(开关)渲染
                        case 'switch': {
                            html += '<input type="checkbox" id="' + id[i] + '"  name="' + id[i] + '" title="' + nameArr[i] + '" lay-skin="switch" lay-text="' + valOption[i] + '" />'
                            break;
                        }
                        // 复选框的渲染
                        case 'primaryNew': {
                            html += '<div style="display:block;">' + commFun.primaryNew(valOption[i], 'yyyy-MM-dd HH:mm:ss', '2018-5-12') + '</div>';
                            break;
                        }
                        // 文本输入框类型
                        case 'textArea': {
                            html += '<textarea rows="1" cols="18" placeholder="请输入' + nameArr[i] + '"></textarea>'
                            break;
                        }
                        // 时间格式
                        case 'date': {
                            var $$dateType = comm.dateType[valOption[i]];
                            var $$dataStyle = comm.dateStyle[valOption[i]];
                            html += '<input type="text" class="layui-input _' + id[i] + '" id="' + id[i] + '" name="' + id[i] + '" title="' + nameArr[i] + '" placeholder="请选择' + nameArr[i] + '" />'
                            // 根据格式初始化 layuiDate格式
                            if (valOption[i] == 11) {
                                commFun.layuiDate(id[i], $$dateType, '', $$dataStyle)// 1. class名字 2. 时间样式 3. 历史val 4. 时间的类型
                            } else if (valOption[i] == 12) {
                                commFun.layuiDate(id[i], $$dateType, '', $$dataStyle)
                            } else if (valOption[i] == 13) {
                                commFun.layuiDate(id[i], $$dateType, '', $$dataStyle)
                            } else if (valOption[i] == 14) {
                                commFun.layuiDate(id[i], $$dateType, '', $$dataStyle)
                            } else if (valOption[i] == 15) {
                                commFun.layuiDate(id[i], $$dateType, '', $$dataStyle)
                            }
                            break;
                        }
                        // 枚举按钮传入ID 请求接口渲染 tree 
                        case 'treeInput': {
                            html += '<input type="text" id="' + id[i] + '"  name="' + id[i] + '" title="' + nameArr[i] + '"  placeholder="请选择' + nameArr[i] + '"  onclick="commFun.treeFun(id)" />'
                            break;
                        }
                    }
                    html += '</div>';
                    //  判断是否是switch类型 添加 辅助文字---(注解)
                    if (type[i] != 'switch') {
                        html += '<div class="layui-form-mid layui-word-aux">辅助文字</div>'
                    }

                    html += '</div>'
                }
            }
            html += '</form>';
            // 添加到传入的DOM里
            $(obj).html(html);
        }
    }
}
var commFun = {
    /**
     * 搜索下面的select的option渲染
     * @param {search>select} Array 
     */
    "option": function (Array) {
        var html = '';
        for (var i in Array) {
            html += '<option value="' + (Number(i) + 1) + '">' + Array[i] + '</option>'
        }
        return html;
    },
    /**
     * 搜索下面的primaryNew的新方法渲染
     * @param {search>primaryNew} Array 
     * 下面的name需要更改
     */
    "primaryNew": function (Array) {
        var html = '';
        for (var i in Array) {
            html += ' <input type="checkbox" name="like[write]" title="' + Array[i] + '">'
        }
        return html;
    },
    /**
     * 搜索下面的primaryNew的原始方法渲染
     * @param {search>primaryOld} Array 
     * 下面的name需要更改
    */
    "primaryOld": function (Array) {
        var html = '';
        for (var i in Array) {
            html += ' <input type="checkbox" name="like[write]" lay-skin="primary" title="' + Array[i] + '">'
        }
        return html;
    },
    /**
     * layuiDate的渲染
     *  @param {layuiDate} object
     * 下面的name需要更改
     */
    "layuiDate": function (id, style, val, type) {
        layui.use('laydate', function () {
            var laydate = layui.laydate;
            //执行一个laydate实例
            laydate.render({
                elem: '._' + id //指定元素
                , type: type
                , format: style
                , value: val
                , istem: true
            });
        });
    },
    /**
     * 树(tree)的渲染
     * @param {id} string
     * 下面的ID是请求接口数据渲染出tree
     */
    "treeFun": function (id) {
        // 打开一个弹出框 赋一个带ID的身体
        layer.open({
            type: 1,
            content: '<div class="layui-form"><div id="xtree1" class="xtree_contianer"></div></div>' //这里content是一个普通的String
            , area: ['600px', '300px'],
            offset: 'auto',
            btn: ["确认", "取消", "清除"],
            btnAlign: 'c',
            yes: function (index, layero) {
                layer.msg("确认")
                //按钮【按钮一】的回调
            },
            btn2: function (index, layero) {
                layer.msg("取消");
                return false;
            },
            btn3: function (index, layero) {
                layuiXtree.prototype.render = function () {
                    var _this = this;
                    _this.Loading(_this._options);
                }
                layer.msg("清除")
                return false;
            }
        });
        //  已form表单渲染tree的样式 应该要推倒重做！ 
        layui.use(['form'], function () {
            var form = layui.form;
            $.ajax({
                url: 'treeJosn.json',
                type: 'GET',
                data: '',
                dataType: "JSON",
                processData: false,
                contentType: false,
                success: function (data) {
                    var xtree1 = new layuiXtree({
                        elem: 'xtree1'   //(必填) 放置xtree的容器，样式参照 .xtree_contianer
                        , form: form     //(必填) layui 的 from
                        , data: data     //(必填) json数据
                    });
                },
                error: function () {

                }
            });
        });

    }
}

// 全局格式定义
var comm = {
    // date样式
    dateType: {
        "10": "HH:mm",                  //时:分
        "11": "yyyy-MM-dd HH:mm:ss",   //年-月-日 时:分:秒
        "12": "yyyy-MM-dd",           //年-月-日
        "13": "yyyy-MM",             //年-月
        "14": "MM-dd",              //月-日
        "15": "HH:mm:ss",          //时:分:秒
    },
    // date类型
    dateStyle: {
        "10": "time",                    //时间类型
        "11": "datetime",               //年月日类型时间
        "12": "date",                  //年月日类型
        "13": "month",                //年月类型
        "14": "date",                //月日类型
        "15": "time",               //时间类型
    }
};

layui.use('element', function(){
    var element = layui.element;
    
});
// 读取图片文件
function readFile(obj) {
    var file = obj;
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e) {
        imgss.push(this.result)
    }
}
