/**
 * 工具类
 * @type {{addMenuRelySettingValue: commUnits.addMenuRelySettingValue}}
 */
var commUnits = {
    /**
     * 添加枚举依赖设置
     * @param obj
     * @param id
     * @param data
     */
    'addMenuRelySettingValue': function (obj, id, data) {
        if (id == 0) {
            return;
        }
        if (data) {
            // 设置 枚举依赖值
            var funSetRelyValue = function (obj, id, data, fun) {
                // 有可能是一个 枚举依赖类型
                $.post(base + "/sysDictionary/helper/getEnumDependFieIdByFieIdId", {
                    'fieldId': id,
                    'enumId': data.id
                }, function (json) {
                    if (json && json.length) {
                        if (typeof fun != 'undefined') {
                            fun(json);
                        }
                    }
                });
            }
            funSetRelyValue(obj, id, data, function (json) {
                for (var i = 0; i < json.length; i++) {
                    var $o = $(obj).find("*[s_title='" + json[i]["fname"] + "']");
                    if ($o && $o.length) {
                        if(json[i]["value"]==''){
                            json[i]["value"]=' ';
                        }
                        $o.val(json[i]["value"]);
                        $o.attr('data-isrely', 1);
                        $o.next("input[type='hidden']").val(json[i]["enumid"]);
                    }
                }
            });
        }
    },
};

/**
 * 项目中的公共 js 文件
 */
var comm = {
    'auditText': "审核状态",
    'PHOTO_EXTENSIONS': "gif,jpg,jpeg,bmp,png",
    'WEB_FILE_EXTENSIONS': "pdf,wps,doc,docx,xlsb,xlsx,xlsm,xls,ppt",
    // 文件上传路径(默认)
    'UPLOAD_URL': "/FileUploadact?module=other",
    "tree": {
        // 下拉枚举
        "Pull": "enum",
        // 树形枚举
        'Tree': "enumTree",
        // 枚举依赖
        "Rely": "enumRely",
    },
    // 加载枚举的URl地址(入股欧式web端就用 web 地址 , 如果是 管理端 就用 admin)
    "web":"/user/ReviewTitle/getEnumValues",
    "admin":"/sysDictionary/helper/getEnumValues",
    "booleanV": {
        '1': "是",
        '0': "否"
    },
    // 审核数据内容
    "auditArrs": [
        {id: 1, pid: -1, name: "未审", code: '0'},
        {id: 2, pid: -1, name: "初审", code: '1'},
        {id: 3, pid: -1, name: "终审", code: '2'},
        {id: 3, pid: -1, name: "空值", code: ''}
    ],
    // 产生 input 的 class 名称
    "inputSelectTextAreaClass": "form-control",
    "formGroup": "form-group",
    "inputGroup":"input-group"
};

/**
 * 上传文件
 * @param option
 * @returns {boolean}
 *
 * option 参数格式
 * {
 *    id: 接受文件的id
 *    title:弹窗的title
 *    fileExtensions: 格式
 *
 * }
 */
comm.getUploadImgOrFile = function (option) {
    if (!option.title || !option.fileExtensions) {
        console.debug("参数错误")
        return false;
    }
    var $that = this;
    HUCuploadFile.multiUpload({
        'url': $that.url || $that.UPLOAD_URL,
        'fileExtensions': option.fileExtensions || $that.PHOTO_EXTENSIONS,
        'ids':option.ids,
        'targ':"fileId_"+option.targ,
        'title': option.title || "请选择文件",
        'delete': function (arrs) {
            var hi = $(option.$targ).prev("input[type='hidden']");
            if(!arrs.length ){
                $(option.$targ).next("span").hide();
            }else{
                $(option.$targ).next("span").show();
            }
            hi.val(arrs.join(",")).prev("input").val(arrs.join(","));
        },
        'ok': function (layerIndex, attachListData) {
            if (attachListData && attachListData.length > 0) {
                var _attr = [],_t = $(option.$targ).prev("input[type='hidden']"),
                    _o = _t.prev("input"), _v = _o.val();
                _v = _v || undefined;
                if (_v) {
                    _attr.push(_v);
                }
                for (var i = 0, len = attachListData.length; i < len; i++) {
                    _attr.push(attachListData[i].id);
                }
                if(option.$targ[0].nodeName === 'INPUT'){
                    option.$targ[0].value = _attr.join(",");
                }
                _o.val(_attr.join(","));
                _t.val(_attr.join(","));
                $(option.$targ).next("span").show(); // 显示下载按钮
                layer.msg("文件上传成功", {'icon': 1, time: '2000'});
            } else {
                layer.msg("文件上传失败,请重新上传", {'icon': 2, time: '2000'});
            }
            layer.close(layerIndex);
        }
    });
};

/**
 * 为查询生成枚举字段
 *
 * 专门 为 查询选择字段使用
 *
 * 不要隐藏域来接受枚举ID
 *
 * @param option
 */
comm.getDataQueryEnumChooseInputNoHidden = function (option) {
    if (!option) {
        return;
    }
    var $$Fun = function (option) {
        personRosterData.ZtreeShowChooseEnumMinTree({
            title: (option.labelText || "") + '内容选择',
            url: typeof option.url != 'undefined' ? option.url : comm.admin,
            isCheckbox: option.treeIsCheckbox,
            otherParam: {
                'enumId': option.enumId,
                'enumType': option.enumType,
                "fieldType": option.fieldType,
                "fieldId": option.fieldId,
            },
            target: ["", option.id],
            isChooseLeaf: option.isChooseLeaf || false,
            isAudit: option.isAudit || false,
            additional: option.additional || false,
            data: typeof option.data != 'undefined' ? option.data : {id: "id", pid: "parentid", name: "text"},  // 返回的是其他值,不是Id  result:指定
            onOk: function (data) {
                if (typeof option._fun != 'undefined' && option._fun.constructor.name == 'Function') {
                    option._fun(data);
                }
                return true;
            }
        });
    };
    // isBtn 是否显示 按钮选择
    var $$div = new Object();
    $$div.$o = comm.funAddWidget;
    $$div.from = $$div.$o.getfromGroup();
    $$div.label = $$div.$o.getLaber({
        "data": option.title_data || option.labelData ,
        "title": option.title || option.labelText ,
        "labelText": option.labelText ,
    })
    $$div.label.innerText = option.labelText;

    $$div.input = $$div.$o.getInput({
        "class": comm.inputSelectTextAreaClass || "",
        "id": option.id,
        "name": option.name,
        "readonly": true,
        "val": option.val || "",
        "s_title": (option.labelText).replace(/:$/gi, ""),
        "ph": "请选择" + option.labelText,
    });
    // isBtn 是否显示 按钮 选择
    if (option.isBtn) {
        $$div.inputGroup = $$div.$o.getfromInput();
        // 按钮
        $$div.span = $$div.$o.getBtn({"id": "addPersonType"});
        $$div.inputGroup.appendChild($$div.input);
        $$div.inputGroup.appendChild($$div.span);

        $$div.from.appendChild($$div.label);
        $$div.from.appendChild($$div.inputGroup);
        option.el.append($$div.from);
        // 依赖字段不能修改
        // if (!option.isRely) {
        $($$div.span).on("click", function () {
            $$Fun(option);
        });
        // }
    } else {
        $$div.from.appendChild($$div.label);
        $$div.from.appendChild($$div.input);
        option.el.append($$div.from);
        // 依赖字段不能修改
        // if (!option.isRely) {
        $($$div.input).on("click", function () {
            $$Fun(option);
        });
        // }
    }
};


/**
 * 数据查询生成枚举字段 ( )
 * @param option
 */
comm.getDataQueryEnumChooseInput = function (option) {
    if (!option) {
        return;
    }

    var $$Fun = function (option) {
        personRosterData.ZtreeShowChooseEnumMinTree({
            title: '选择查询条件',
            url: comm.admin,
            isCheckbox: option.treeIsCheckbox,
            otherParam: {
                'enumId': option.enumId,
                'enumType': option.enumType,
                "fieldType": option.fieldType,
                "fieldId": option.fieldId,
            },
            target: ["", option.id],
            isChooseLeaf: option.isChooseLeaf || false,
            isAudit: option.isAudit || false,
            additional: option.additional || false,
            data: {id: "id", pid: "parentid", name: "text"},  // 返回的是其他值,不是Id  result:指定
            onOk: function (data) {
                if(typeof option._fun != 'undefined' && option._fun.constructor.name == 'Function'){
                    option._fun(data);
                }
                // 为枚举依赖赋值
                commUnits.addMenuRelySettingValue($(option.el), option.fieldId, data);
                return true;
            }
        });
    };
    // isBtn 是否显示 按钮选择
    var $$div = new Object();
    $$div.$o = comm.funAddWidget;
    $$div.from = $$div.$o.getfromGroup();
    $$div.label = $$div.$o.getLaber({
        "data": option.labelData || "",
        "title": option.labelText || "",
        "labelText": option.labelText
    })
    $$div.label.innerText = option.labelText;

    $$div.input = $$div.$o.getInput({
        "class": comm.inputSelectTextAreaClass || "",
        "id": option.id,
        "name": option.name,
        "readonly": true,
        "val": option.val || "",
        "s_title": (option.labelText).replace(/:$/gi, ""),
        "ph": option.isRely ? "枚举依赖不能修改" : "请选择" + option.labelText,
    });

    // 是否加载隐藏域来存放枚举ID
    if (option.isHidden) {
        $$div.hidden = $$div.$o.getHiddenInput({"id": option.id + "_enumId", "name": option.name + "_enumId"});
    }
    // isBtn 是否显示 按钮选择
    if (option.isBtn) {
        $$div.inputGroup = $$div.$o.getfromInput();
        // 按钮
        $$div.span = $$div.$o.getBtn({"id": "addPersonType"});

        // $$div.inputGroup.appendChild($$div.hidden);
        $$div.inputGroup.appendChild($$div.input);
        $$div.inputGroup.appendChild($$div.span);

        $$div.from.appendChild($$div.label);
        $$div.from.appendChild($$div.inputGroup);
        option.el.append($$div.from);
        // 依赖字段不能修改
        if (!option.isRely) {
            $($$div.span).on("click", function () {
                $$Fun(option);
            });
        }
    }else{
        $$div.from.appendChild($$div.label);
        // $$div.from.appendChild($$div.hidden);
        $$div.from.appendChild($$div.input);
        option.el.append($$div.from);
        // 依赖字段不能修改
        if (!option.isRely) {
            $($$div.input).on("click", function () {
                $$Fun(option);
            });
        }
    }
};

/**
 *  数据查询生成枚举字段 (有枚举选择按钮)
 * @param option
 */
comm.getDataAuditEnumChooseInput = function (option) {

    if (!option) {
        return;
    }
    // 添加枚举单击事件
    var _fnAddEvent = function ($th, $$$$) {
        personRosterData.ZtreeShowChooseEnumMinTree({
            $el: $th,
            title: (option.labelText + '内容选择'),
            url: (option.url && typeof option.url != 'undefined' ? option.url : (comm[top.enumUrl] || comm.admin)),//comm.admin,
            isCheckbox: option.treeIsCheckbox,
            otherParam: {
                'enumId': option.enumId,
                'enumType': option.enumType,
                "fieldType": option.fieldType,
                "fieldId": option.fieldId,
            },
            isChooseLeaf: true,
            target: [option.id + "_enumId", option.id],
            isAudit: option.isAudit || false,
            additional: option.additional || false,
            data: {id: "id", pid: "parentid", name: "text"},  // 返回的是其他值,不是Id  result:指定
            onOk: function (data) {
                var _opData=JSON.parse(JSON.stringify(data));
                //  控制必填不可填的方法
                var showHidefun = function(arr){
                     $("#publf_87_8").siblings("#addPersonType").show();
                    $("#publf_87_15").siblings('span').css({'color': '#00a5e0',cursor:'pointer'})
                     for (var i in arr.show) {
                        $('#'+ arr.show[i]).parents('.form-group').find('label').find('span').remove();
                        $("#" + arr.show[i]).attr("disabled",false);
                        $('#'+ arr.show[i]).parents('.form-group').find('label').append('<span style="color:red">*<span>');

                    }
                    for (var k in arr.hide) {
                        $('#'+ arr.hide[k]).parents('.form-group').find('label').find('span').remove();
                        $("#" + arr.hide[k]).attr("disabled",true);
                        if(arr.hide[k] == 'publf_87_8'){
                            $("#"+arr.hide[k]).siblings("#addPersonType").hide();
                        }else{
                            $("#"+arr.hide[k]).siblings("#addPersonType").show();
                        }
                        if(arr.hide[k] == 'publf_87_15'){
                            $("#"+arr.hide[k]).siblings('span').css({'color': '#333',cursor:'not-allowed'});
                        }else{
                            $("#"+arr.hide[k]).siblings('span').css({'color': '#00a5e0',cursor:'pointer'})
                        }
                    }
                    for (var j in arr.auto) {
                        $('#'+ arr.auto[j]).parents('.form-group').find('label').find('span').remove();
                    }
                };

                /* 1.G_DE取得学历等于无  2.H_DE最高学历学位情况  3.最高学历情况  4.最高学位情况  5.研究生学历学位情况/大学学历学位情况 */
                //  取得学历等于无的时候所不能填的几个项
                var G_DE = ['publf_87_9','publf_87_10','publf_87_15'];

                //  最高学历学位情况
                var H_DE = {
                        show:['publf_87_2','publf_87_3','publf_87_4','publf_87_6','publf_87_7','publf_87_8','publf_87_9','publf_87_10','publf_87_11','publf_87_13','publf_87_14','publf_87_15'],
                        hide:[]
                    };

                //  最高学历情况 上面必填下面不可填写
                var H_E =  {
                        show:['publf_87_2','publf_87_3','publf_87_4','publf_87_6','publf_87_7','publf_87_13','publf_87_14'],
                        hide:['publf_87_8','publf_87_9','publf_87_10','publf_87_15']
                    };

                //  最高学位情况 上面必填下面不可填写
                var H_D =  {
                        show:['publf_87_3','publf_87_4','publf_87_6','publf_87_7','publf_87_8','publf_87_9','publf_87_10','publf_87_11','publf_87_13','publf_87_15'],
                        hide:['publf_87_2']
                    };

                //  研究生学历学位情况/大学学历学位情况
                var H_DY={
                        show:['publf_87_2','publf_87_3','publf_87_4','publf_87_5','publf_87_6','publf_87_7','publf_87_13','publf_87_14'],
                        hide:[],
                        auto:['publf_87_8','publf_87_9','publf_87_10','publf_87_15']
                    };

                //  通过学习经历的最高情况改变必填和非必填项;

                if(option.id=='publf_87_1'){

                    if(_opData.text=='最高学历学位情况') {
                        showHidefun(H_DE)
                    }else if(_opData.text=='最高学历情况'){
                        showHidefun(H_E)
                    }else if(_opData.text=='最高学位情况') {
                        showHidefun(H_D)
                    }else if(_opData.text=='研究生学历学位情况' || _opData.text=='大学学历学位情况'){
                        showHidefun(H_DY)
                    }
                }

                if(option.id=='publf_87_8'){

                    if(_opData.text=='无'){
                        for (var i in G_DE) {
                            $('#' + G_DE[i]).parents('.form-group').find('label').find('span').remove();
                            $('#' + G_DE[i]).attr("disabled", true);
                            $('#publf_87_15').siblings('span').css({'color': '#333',cursor:'not-allowed'})
                        }
                    }else{
                        for (var i in G_DE){
                            $('#publf_87_15').siblings('span').css({'color': '#00a5e0',cursor:'pointer'})
                            $('#'+G_DE[i]).parents('.form-group').find('label').find('span').remove();
                            $('#'+G_DE[i]).attr("disabled",false);
                            $('#'+G_DE[i]).parents('.form-group').find('label').append('<span style="color:red">*<span>');

                        }
                    }
                }

                if (typeof option.fun != 'undefined') {
                    exec(option.fun, data);
                }
                var relyEnumObj = $$$$;
                if (relyEnumObj && relyEnumObj.length) {
                    relyEnumObj = relyEnumObj.prev("input[type='hidden']");
                }
                var arrs = [];
                if (!option.treeIsCheckbox) {
                    arrs.push(data.id)
                } else {
                    for (var i = 0, len = data.length; i < len; i++) {
                        arrs.push(data[i].id)
                    }
                }
                if (relyEnumObj.length) {
                    $(relyEnumObj).val(arrs.join(","));
                }
                // 为枚举依赖赋值
                commUnits.addMenuRelySettingValue($(option.el), option.fieldId, data);
                return true;
            }
        });
    };
    // 执行的事件
    var exec = function ($$fun, data) {
        if ($$fun) {
            if ($$fun.constructor.name === "Array") {
                for (var i = 0, len = $$fun.length; i < len; i++) {
                    $$fun(data);
                }
            } else if ($$fun.constructor.name === "Function") {
                $$fun(data);
            }
        }
    };

    var $$div = new Object();
    $$div.$o = comm.funAddWidget;
    $$div.group = $$div.$o.getfromGroup();
    $$div.label = $$div.$o.getLaber({
            "id": "lab_" + option.id,
            "data": option.labelData || "",
            "title": option.labelText || "",
            "s_title": (option.labelText).replace(/:$/gi, ""),
            "labelText": option.labelText
        }
    );

    $$div.ingroup = $$div.$o.getfromInput();
    $$div.input = $$div.$o.getInput({
        "id": option.id,
        "name": option.name,
        "val": option.val || "",
        "readonly":true,
        "s_title": (option.labelText).replace(/:$/gi, ""),
        "ph": option.isRely ? "枚举依赖不能修改" : "请选择" + option.labelText
    });
    $$div.hidden = $$div.$o.getHiddenInput({
        "id": option.id + "_enumId",
        "name": option.name + "_enumId",
    });

    $$div.ingroup.appendChild($$div.input);
    $$div.ingroup.appendChild($$div.hidden);

    if (!option.isRely) {
        $$div.span = $$div.$o.getBtn({"id": "addPersonType"});
        $$div.ingroup.appendChild($$div.span);
    }

    $$div.group.appendChild($$div.label);
    $$div.group.appendChild($$div.ingroup);

    // 依赖字段不能修改
    if (!option.isRely) {
        $($$div.span, $$div.input).on("click", function () {
            _fnAddEvent($($$div.input), $($$div.span));
        });
    }
    option.el.append($$div.group);
};

/**
 *  数据查询生成审核状态字段
 * @param option
 */
comm.getDataAuditTypeChooseInput = function (option) {
    if (!option) {
        return;
    }
    var obj = comm.funAddWidget;
    obj.fromGroup = obj.getfromGroup();
    obj.label = obj.getLaber({
        data: option.labelData || "",
        labeltext: option.labelText || "",
        title: option.labelText || "",
        labelText: option.labelText,
    });
    obj.input = obj.getInput({
        "id": option.id,
        "name": option.name,
        "readonly": true,
        "placeholder": '请选择审核状态',
        val: option.val,
    });

    $(obj.input).on("click", function () {
        personRosterData.ZtreeShowChooseAuditTypeTree({
            title: '审核状态选择',
            isCheckbox: option.treeIsCheckbox,
            zNodes: [
                {id: 1, pid: -1, name: "未审", code: '0'},
                {id: 2, pid: -1, name: "初审", code: '1'},
                {id: 3, pid: -1, name: "终审", code: '2'}
            ],
            target: ["", option.id],
            data: {id: "id", pid: "pid", name: "name", result: "code"},
            onOk: function (data) {
                return true;
            }
        });
    });
    obj.fromGroup.appendChild(obj.label);
    obj.fromGroup.appendChild(obj.input);
    option.el.append(obj.fromGroup);
};

/**
 *
 * ---- 人员管理 卡片 匹配范围设置   ----
 *
 *  form 表单 专用  通过 id 来 得到 控件的类型
 *
 *  注意 : 查询 可以使用这个 控件
 *
 * @param $obj   添加元素的对象
 * @param typeId 类型 ()
 * @param id     控件的id
 * @param name   控件的name
 * @param ismiu  是否出现删除按钮
 * @param labelText  label 标签文本
 * @param value   控件的 显示 value 值
 * @param fieldId 字段的ID 用于(查询枚举依赖字段)
 */

comm.getFormHtmlByType = function ($obj, fieldId, typeId, id, name, ismiu, labelText, value, fun) {

    if(!$obj){
        throw new Error("error => one parameter not null or undefined");
    }

    if(!fieldId){
        throw new Error("error => two parameter not null or undefined");
    }

    if(!typeId){
        throw new Error("error => three parameter not null or undefined");
    }

    if(typeId.search("!")<=0){
        throw new Error("three error => format:字段类型!字符的枚举ID!字段长度");
    }
    if(!id){
        throw new Error("four error => 这个参数是控件的ID(必须要的参数) , 不能为null");
    }
    // 转换 中文括号
    if(value){
        value = value+"".replace(/（/g,"(").replace(/）/g,"(");
    }
    // 第一个 元素为类型 , 第二个元素为 enum 的 id  , 第三个 元素 为 最大长度
    var ids = typeId.split("!");
    var $_opt = new Object();
    $_opt.type = ids[0];
    $_opt.enumId = ids[1];
    $_opt.lenght = 1000;
    // $_opt.lenght = ids[2];
    $_opt.obj = $obj;
    $_opt.fieldId = fieldId;
    $_opt.typeId = typeId;
    // 替换 回车符号
    $_opt.inId = id;
    $_opt.inName = name;
    $_opt.isMiu = ismiu;
    $_opt.inLabel = labelText;
    // 转换 中文括号
    $_opt.val = value;
    $_opt._fun = fun;
    // 产生控件方法
    $_opt._fnAddfun = comm.funAddWidget;
    if (id) {
        // 处理系统字段
        if (/(用户编号|用户名|姓名|身份证号码|用户类型|用户单位|用户单位编码|记录排序|记录增加日期|记录修改日期|审核状态|用户类型编码)/g.test($_opt.inLabel)) {
            console.log("系统字段", "---------------", $_opt.inLabel);
            if (/(用户编号|用户名|记录排序)/g.test($_opt.inLabel)) {
                $_opt.type = 3;
            } else if (/(身份证号码)/g.test($_opt.inLabel)) {
                $_opt.type = 3;
                $_opt.lenght = 18;
            } else if (/(用户类型|用户单位|用户单位编码|用户类型编码)/g.test($_opt.inLabel)) {
                $_opt.type = 0;
            } else if (/(审核状态)/g.test($_opt.inLabel)) {
                $_opt.type = -1;
            } else if (/(记录增加日期|记录修改日期)/g.test($_opt.inLabel)) {
                $_opt.type = 12;
            } else if (/(姓名)/g.test($_opt.inLabel)) {
                $_opt.type = 6;
            }
        }
        var $type = comm.json[$_opt.type];
        var _form = new Object();
        // 产生 div 控件
        _form._f = $_opt._fnAddfun.getfromGroup();
        // 产生label
        _form._l = $_opt._fnAddfun.getLaber({'labelText':$_opt.inLabel});
        switch ($type) {
            case "sysEnum": {
                var data = {
                    el: $obj,
                    enumId: ids[1],
                    enumType: "enumTree",
                    fieldType: ids[0],
                    labelText: labelText,
                    fieldId: fieldId,
                    id: id,
                    name: name,
                    val: value,
                    isChooseLeaf: true,
                    treeIsCheckbox: true,
                };
                if (/(用户类型|用户类型编码)/g.test($_opt.inLabel)) {
                    data.url = "/sysDictionary/helper/getUserTypeList";
                    data.isAudit = /(用户类型编码)/g.test($_opt.inLabel) ? "code" : "name";
                    data.data = {"id": "id", "pid": "parentId", "name": "name"};
                } else if (/(用户单位|用户单位编码)/g.test($_opt.inLabel)) {
                    data.url = "/platfun/org/tree";
                    data.isAudit = /(用户单位编码)/g.test($_opt.inLabel) ? "unitcode" : "unitname";
                    data.data = {"id": "unitid", "pid": "parentunitid", "name": "unitname"};
                }
                comm.getDataQueryEnumChooseInputNoHidden(data);
                _form.type = 0;
                _form.isadd = false;
                break;
            }
            case "audit": {
                _form._in = $_opt._fnAddfun.getSelect({"id": $_opt.inId, "name": $_opt.inName});
                for (var i = 0; i < comm.auditArrs.length; i++) {
                    var _opt = document.createElement("option"), $o = comm.auditArrs[i];
                    _opt.value = $o.code;
                    _opt.innerText = $o["name"];
                    if ($_opt.val == _opt.value) {
                        _opt.setAttribute("selected", "selected");
                    }
                    _form._in.appendChild(_opt);
                }
                _form.type = 0;
                _form.isadd = true;
                break;
            }
            case "boolean": {  // 布尔值
                _form._in = $_opt._fnAddfun.getSelect({"id": $_opt.inId, "name": $_opt.inName});
                _form._is = ["是","1",1];
                for (var key in comm.booleanV){
                    var _opt = document.createElement("option");
                    _opt.value = key;
                    _opt.innerText = comm.booleanV[key];
                    if($.inArray($_opt.val,_form._is) >= 0){
                        _opt.setAttribute("selected" , "selected");
                    }
                    _form._in.appendChild(_opt);
                }
                _form.type = 0;
                _form.isadd = true;
                break;
            }
            case "int": {  // int 类型值
                _form._in = $_opt._fnAddfun.getInput({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    'length': $_opt.lenght,
                    "name":$_opt.inName,
                    "ph": "请输入" + $_opt.inLabel
                });

                _form.type = 1;
                _form.isadd = true;
                break;
            }
            case "float": {  // 精确 到好多位 小数
                _form._ph = "请输入"+$_opt.inLabel;
                _form._in = $_opt._fnAddfun.getInput({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    "ph": _form._ph});

                _form.type = 2;
                _form.isadd = true;
                break;
            }
            case "anyString": {  // 任意字符串
                _form._ph = "请输入"+$_opt.inLabel;
                _form._in = $_opt._fnAddfun.getInput({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'length':$_opt.lenght,
                    "ph": _form._ph});

                _form.type = 0;
                _form.isadd = true;
                break;
            }
            case "numberString": {  // 数字 字符串
                _form._ph = "请输入"+$_opt.inLabel;
                _form._in = $_opt._fnAddfun.getInput({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'length':$_opt.lenght,
                    "ph": _form._ph});

                _form.type = 3;
                _form.isadd = true;
                break;
            }
            case "letterString": {  // 字母字符串
                _form._ph = "请输入"+$_opt.inLabel;
                _form._in = $_opt._fnAddfun.getInput({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'length':$_opt.lenght,
                    "ph": _form._ph});

                _form.type = 4;
                _form.isadd = true;
                break;
            }
            case "numberLetterString": {  // 数字字母字符串
                _form._ph = "请输入"+$_opt.inLabel;
                _form._in = $_opt._fnAddfun.getInput({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'length':$_opt.lenght,
                    "ph": _form._ph});

                _form.type = 5;
                _form.isadd = true;
                break;
            }
            // 时间类型
            case "dateTime":
            case "yearMonthDay":
            case "yearMonth":
            case "time":
            case "monthDay": {
                _form._ph = "请选择"+$_opt.inLabel;
                _form._in = $_opt._fnAddfun.getInput({
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'readonly':true,
                    "ph": _form._ph});
                _form._in.value = personRosterData.convertTime({
                    'data': $_opt.val,
                    'type': $_opt.type,
                    'language': 'e'
                });
                personRosterData.initLayerDate2({
                    elem: _form._in,
                    format: comm.newtype[$_opt.type],
                    value: $_opt.val || ""
                });
                _form.type = 0;
                _form.isadd = true;
                break;
            }
            case "doc":
            case "picture": {
                _form._hidden = $_opt._fnAddfun.getHiddenInput({
                    "id":"fileId_"+$_opt.inId,
                    "name":"fileId_"+$_opt.inName
                });
                _form._in = $_opt._fnAddfun.getInput({
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'readonly':true,
                    "ph": "单击上传"+$_opt.inLabel +"附件"});

                _form._f.appendChild(_form._l);
                _form._f.appendChild(_form._hidden);
                _form._f.appendChild(_form._in);
                $_opt.obj.append(_form._f).on("click","#"+$_opt.inId,function () {
                    var $$ = $(this);
                    comm.getUploadImgOrFile({
                        "id": $_opt.inId,
                        "ids":$$.prev("input[type='hidden']").val(),
                        "targ":id,
                        "$targ":$$,
                        "title": "请选择要上传" + $_opt.inLabel + "的文件",
                        'fileExtensions': ($type == 'doc' ? comm.WEB_FILE_EXTENSIONS : comm.PHOTO_EXTENSIONS)
                    });
                });
                _form.type = 0;
                _form.isadd = false;
                break;
            }
            case "string": {  // 表达式类型
                _form._ph = "请输入"+$_opt.inLabel;
                _form._in = $_opt._fnAddfun.getInput({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'length':$_opt.lenght,
                    "ph": _form._ph});

                _form.type = 0;
                _form.isadd = true;
                break;
            }
            // 下拉 -- 树形 -- 依赖
            case 'enumPullAdd_text':
            case 'enumPullAdd_code':
            case 'enumTreeAdd_text':
            case 'enumTreeAdd_code':
            case 'enumRelyAdd_code':
            case 'enumRelyAdd_text': {
                comm.getDataQueryEnumChooseInputNoHidden({
                    el: $obj,
                    enumId: ids[1],
                    enumType: comm.tree[$type.substr(4, 4)],
                    fieldType: ids[0],
                    labelText: labelText,
                    fieldId: fieldId,
                    id: id,
                    name: name,
                    val: value,
                    isChooseLeaf: true,
                    treeIsCheckbox: true,
                    isRely: $type.search("Rely") > -1,
                    isAudit: $type.substr($type.indexOf("_") + 1, 4)
                });
                _form.type = 0;
                _form.isadd = false;
                break;
            }
            // 附加值 (下拉枚举附加值 ,树形枚举附加值 , 依赖枚举附加值)
            case "enumPullAdd_1":
            case "enumPullAdd_2":
            case "enumPullAdd_3":
            case "enumPullAdd_4":
            case "enumPullAdd_5":
            case "enumPullAdd_6":
            case "enumPullAdd_7":
            case "enumPullAdd_8":
            case "enumPullAdd_9":
            case "enumPullAdd_10":
            case "enumPullAdd_11":
            case "enumPullAdd_12":
            case "enumPullAdd_13":
            case "enumPullAdd_14":
            case "enumPullAdd_15":
            case "enumPullAdd_16":
            case "enumPullAdd_17":
            case "enumPullAdd_18":
            case "enumPullAdd_19":
            case "enumPullAdd_20":
            case "enumTreeAdd_1":
            case "enumTreeAdd_2":
            case "enumTreeAdd_3":
            case "enumTreeAdd_4":
            case "enumTreeAdd_5":
            case "enumTreeAdd_6":
            case "enumTreeAdd_7":
            case "enumTreeAdd_8":
            case "enumTreeAdd_9":
            case "enumTreeAdd_10":
            case "enumTreeAdd_11":
            case "enumTreeAdd_12":
            case "enumTreeAdd_13":
            case "enumTreeAdd_14":
            case "enumTreeAdd_15":
            case "enumTreeAdd_16":
            case "enumTreeAdd_17":
            case "enumTreeAdd_18":
            case "enumTreeAdd_19":
            case "enumTreeAdd_20":
            case "enumRelyAdd_1":
            case "enumRelyAdd_2":
            case "enumRelyAdd_3":
            case "enumRelyAdd_4":
            case "enumRelyAdd_5":
            case "enumRelyAdd_6":
            case "enumRelyAdd_7":
            case "enumRelyAdd_8":
            case "enumRelyAdd_9":
            case "enumRelyAdd_10":
            case "enumRelyAdd_11":
            case "enumRelyAdd_12":
            case "enumRelyAdd_13":
            case "enumRelyAdd_14":
            case "enumRelyAdd_15":
            case "enumRelyAdd_16":
            case "enumRelyAdd_17":
            case "enumRelyAdd_18":
            case "enumRelyAdd_19":
            case "enumRelyAdd_20": {
                comm.getDataQueryEnumChooseInputNoHidden({
                    el: $obj,
                    enumId: ids[1],
                    enumType: comm.tree[$type.substr(4, 4)],
                    fieldType: ids[0],
                    labelText: labelText,
                    fieldId: fieldId,
                    id: id,
                    name: name,
                    val: value,
                    isChooseLeaf: true,
                    treeIsCheckbox: true,
                    isRely: $type.search("Rely") > -1,
                    additional: $type.substring($type.indexOf("_") + 1, $type.length)
                });
                _form.type = 0;
                _form.isadd = false;
                break;
            }
            default : {  // 文本框控件
                _form._ph = "请输入"+$_opt.inLabel;
                _form._in = $_opt._fnAddfun.getInput({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'length':$_opt.lenght,
                    "ph": _form._ph});

                _form.type = 0;
                _form.isadd = true;
            }
        }
        // 添加 元素
        if(_form.isadd){
            _form._f.appendChild(_form._l);
            _form._f.appendChild(_form._in);
            $_opt.obj.append(_form._f);
        }
        // 判断类型
        if(_form.type){
            _RegExp().RegExp(_form._in, _form.type, $_opt.lenght)
        }
        // 是否添加删除按钮
        if(ismiu){
            $obj.children("div.form-group:last-child")
                .append(
                    $("<div class='form-control pointer' id='" + id + "Remove'>")
                        .append("<i class='icon-trash'></i>")
                        .on("click", function () {
                            try {
                                if (fun && name.indexOf("-_-") >= 0) {
                                    fun(name.split("-_-")[0]);
                                }
                            } catch (e) {
                                console.log("参数分分割符不统一,应该不影响 功能的使用的");
                            }
                            // 删除元素
                            $(this).parents("div.form-group").remove();
                        }).hide()
                ).hover(function () {
                $(this).find("div:last-child").show();              // 显示当前的删除按钮
                $(this).siblings().find("div:last-child").hide();   // 隐藏 其他 的删除按钮
            }, function () {
                $(this).find("div:last-child").hide();
            });
        }
        return $obj.find("div.form-group:last-child"); // 返回当前的元素
    } else {
        throw new Error("error:element id not null");
    }
}


/**
 *
 * ---- 教育局这边 首页修改数据 弹窗 显示控件  ----
 *
 * @param $obj   添加元素的对象
 * @param typeId 类型 ()
 * @param id     控件的id
 * @param name   控件的name
 * @param ismiu  是否多选
 * @param labelText  label 标签文本
 * @param value   控件的 显示 value 值
 * @param fieldId 字段的ID 用于(查询枚举依赖字段)
 */

comm.getEDUFormHtmlByType = function (opt) {
    // {
    //     el:对象元素(from对象)
    //     fieldId:字段id
    //     typeId:第一个为元素类型 , 第二个为 enumId
    //     id: 控件的ID
    //     name:控件的Name,
    //     ismiu:是否显示删除按钮
    //     labelText:label名称
    //     val:控件的显示值
    //     len: 控件有效长度
    //     isCheck:是否出现复选框
    //     deletefun:控件的删除方法
    //     isChooseLeaf  是否只能选择子节点
    //     isBtn:是否显示后面的选择按钮图标
    //     fun: 其他方法
    //     isMust:是否必填
    //     img:{
    //       width:// 不要px单位(可以不用传),
    //       height:// 不要px单位(可以不用传)
    //       src:文件路径(在路径前面不用加 ${base} 这个参数了)
    //      }
    // }

    if(!opt){
        throw new Error("参数为空");
    }
    if(!opt.el || typeof opt.el == 'undefined'){
        throw new Error("object is not find el attr");
    }
    if(!opt.typeId || typeof opt.typeId == 'undefined'){
        throw new Error("object is not find typeId attr");
    }
    if(opt.typeId.search("!")<=0){
        throw new Error("object is not find typeId attr");
    }
    var $$obj = new Object();
    $$obj.ids = opt.typeId.split("!");
    $$obj.type = comm.json[$$obj.ids[0]];
    $$obj.opt = {
        el: opt.el,
        type: $$obj.type,
        labelText: opt.labelText,
        fieldId: opt.fieldId,
        id: opt.id,
        ids: $$obj.ids,
        name: opt.name,
        // 转换 中文括号
        value: opt.val ? opt.val+"".replace(/（/g,"(").replace(/）/g,"(") : "" ,
        isCheck: opt.isCheck || false,
        isMust:opt.isMust || false,
        ismiu:opt.ismiu || false,
        isChooseLeaf: true,
        // 是否出现隐藏域来先存放枚举的ID
        isHidden: true,
        isBtn: true,
        _fun: opt.fun || undefined,
        img:{
            width:100,
            height:120,
            src: base + "/static/imgages/defaultvatar.jpg"
        }
    };
    if(opt.isMust){
        $$obj.opt.isMust =  opt.isMust
    }
    if(opt.len){
        $$obj.opt.length =  opt.len;
    }
    if (opt.isChooseLeaf == false) {
        $$obj.opt.isChooseLeaf = false;
    }
    if (opt.isBtn == false) {
        $$obj.opt.isBtn = false;
    }
    if (opt.isHidden == false) {
        $$obj.opt.isHidden = false;
    }
    if($.inArray($$obj.ids[0],["25","26","27"]) > -1){
        if(typeof opt.img != 'undefined'){
            if(typeof opt.img.width != 'undefined'){
                $$obj.opt.img.width = opt.img.width;
            }
            if(typeof opt.img.height != 'undefined') {
                $$obj.opt.img.height = opt.img.height;
            }
            if(typeof opt.img.src != 'undefined') {
                $$obj.opt.img.height = base + opt.img.src;
            }
        }
    }
    $$obj.div = _fnAddWidget($$obj.opt);
    // 下拉枚举
    if ($$obj.div.type && typeof $$obj.div.type != 'undefined') {
        if ($$obj.div.type != -1) {
            // 添加元素
            opt.el.append($$obj.div.div);
            // 添加事件
            switch ($$obj.div.type) {
                case 7:{
                    break;
                }
                case 6: {  // 时间
                    personRosterData.initLayerDate2({
                        elem: $$obj.div.input,
                        format: comm.newtype[$$obj.ids[0]],
                        value: personRosterData.convertTime({"data":$$obj.opt.value ,type :$$obj.ids[0]})
                    });
                    break;
                }
                case 8: {  // 下拉框 (产生下拉框中的值)
                    _getEDUEnumChooseInput({
                        el: $$obj.div.input,
                        enumId: $$obj.ids[1],
                        fieldType: $$obj.ids[0],
                        labelText: opt.labelText,
                        fieldId: opt.fieldId,
                        id: $$obj.opt.id,
                        name: $$obj.opt.name,
                        value: $$obj.opt.value || "",
                        fun: $$obj.opt._fun,
                        data: {"id": "id", name: "text", reset: $$obj.div.code}
                    });
                    break;
                }
                default: {
                    // 添加验证事件
                    _RegExp().RegExp($$obj.div.input, $$obj.div.type, opt.len);
                }
            }
        }
    }
    if($$obj.opt.ismiu){
        // 添加 删除 按钮   icon-trash  只有 鼠标移上去 才有
        opt.el.children("div.form-group:last-child")
            .append(
                $("<div class='form-control pointer' id='" + opt.id + "Remove'>")
                    .append("<i class='icon-trash'></i>")
                    .on("click", function () {
                        if (fun && fun.constructor.name === "Function") {
                            fun(opt.el,$$obj.div.div);
                        }
                        // 删除元素
                        $(this).parents("div.form-group").remove();

                    }).hide()
            ).hover(function () {
            $(this).find("div:last-child").show();              // 显示当前的删除按钮
            $(this).siblings().find("div:last-child").hide();   // 隐藏 其他 的删除按钮
        }, function () {
            $(this).find("div:last-child").hide();
        });
    }
    return $($$obj.div.div); // 返回当前的元素
}


/**
 *  用作 查询接口 时 选择字段使用
 *  注意 : 这个 接口 只适用于 数据查询 --- 名册查询,高级查询
 *  说明 :

 *   (1)  不显示 时间与时间控件 右边的 删除 按钮
 *   (2)  指定是否显示 form-group 元素的删除按钮
 *   (3)  不对 用户输入的任何内容 做 有效性检查
 *   (4)  不对 文档附件 与图片附件进行查询
 *
 * @param $obj   添加元素的对象
 * @param typeId 类型 ()
 * @param id     控件的id
 * @param name   控件的name
 * @param ismiu  是否显示 删除按钮
 * @param labelText  label 标签文本
 * @param value   控件的 显示 value 值
 * @param fieldId 字段的id
 */

comm.getFormHtmlByTypeNotRemove = function ($obj, fieldId, typeId, id, name, ismiu, labelText, value, fun) {
    // typeId 参数说明: 第一个 元素为类型 , 第二个元素为 enum 的 id  , 第三个 元素 为 最大长度 ,第四个参数为:是否是年龄
    var ids = typeId.split("!");
    if (id) {
        // 转换 中文括号
        if(value){
            value = value+"".replace(/（/g,"(").replace(/）/g,"(");
        }
        var labelText_name = labelText ,_ids = ids[0] ;
        if(labelText && labelText.indexOf("-_-") >=0 ){
            var _l = labelText.split("-_-"),labelText_name = _l[0];
            labelText = _l[1];
        }
        var _labelText = labelText.split(":")[0];
        // 处理系统字段
        if (/(用户编号|用户名|姓名|身份证号码|用户类型|用户单位|用户单位编码|记录排序|记录增加日期|记录修改日期|审核状态|用户类型编码)/g.test(_labelText)) {
            if (/(用户编号|用户名|记录排序)/g.test(_labelText)) {
                _ids = 3;
            } else if (/(身份证号码)/g.test(_labelText)) {
                _ids = 3;
                ids[2] = 18;
            } else if (/(用户类型|用户单位|用户单位编码|用户类型编码)/g.test(_labelText)) {
                _ids = 0;
            } else if (/(审核状态)/g.test(_labelText)) {
                _ids = -1;
            } else if (/(记录增加日期|记录修改日期)/g.test(_labelText)) {
                _ids = 12;
            } else if (/(姓名)/g.test(_labelText)) {
                _ids = 6;
            }
        }
        var $type = comm.json[_ids];
        switch ($type) {
            case "sysEnum": {
                var data = {
                    el: $obj,
                    enumId: ids[1],
                    enumType: "enumTree",
                    fieldType: ids[0],
                    labelText: _labelText,
                    fieldId: fieldId,
                    id: id,
                    name: name,
                    val: value,
                    isChooseLeaf: true,
                    treeIsCheckbox: true,
                    title_data:labelText_name,
                    title:labelText
                };
                if (/(用户类型|用户类型编码)/g.test(_labelText)) {
                    data.url = "/sysDictionary/helper/getUserTypeList";
                    data.isAudit = /(用户类型编码)/g.test(_labelText) ? "code" : "name";
                    data.data = {"id": "id", "pid": "parentId", "name": "name"};
                } else if (/(用户单位|用户单位编码)/g.test(_labelText)) {
                    data.url = "/platfun/org/tree";
                    data.isAudit = /(用户单位编码)/g.test(_labelText) ? "unitcode" : "unitname";
                    data.data = {"id": "unitid", "pid": "parentunitid", "name": "unitname"};
                }
                comm.getDataQueryEnumChooseInputNoHidden(data);
                break;
            }
            case "audit": {
                $obj.append(
                    $("<div class='form-group'>")
                        .append("<label data='" + labelText_name + "' title='" + labelText + "'>" + labelText + "</label>")
                        .append(
                            $("<select class='form-control'>").attr("id", id).attr("name", name)
                                .append("<option value='' >空值</option><option value=0>未审</option><option value=1 >初审</option><option value=2 >终审</option>")));
                break;
            }
            case "boolean": {  // 布尔型
                if (ids.length == 4 && ids[3]) {
                    comm.addAgeSearchWidget($obj, labelText, id, name, fun, labelText_name, value);
                    break;
                }
                $obj.append(
                    $("<div class='form-group'>")
                        .append("<label data='" + labelText_name + "' title='" + labelText + "'>" + labelText + "</label>")
                        .append(
                            $("<select class='form-control'>").attr("id", id).attr("name", name)
                                .append("<option value=1>是</option><option value=0 >否</option>")))
                    .find("select[name='"+name+"']").val((function (){
                        if(value == "" || typeof value == 'undefined'){
                            return 0;
                        }
                        if(typeof value == "string"){
                            if(value == "是" || value == '1'){
                                return 1;
                            }else if(value == "否" || value == '0'){
                                return 0;
                            }
                        }else{
                            return value;
                        }
                })());
                break;
            }
            case "int": // int 类型
            case "float": {  // 精确 到好多位 小数
                if (ids.length == 4 && ids[3]) {
                    comm.addAgeSearchWidget($obj, labelText, id, name, fun, labelText_name, value);
                    break;
                }
                $obj.append(
                    $("<div class='form-group'>")
                        .append("<label data='" + labelText_name + "' title='" + labelText + "'>" + labelText + "</label>")
                        .append(
                            $("<input class='form-control' placeholder='请输入数字[0~9]的任意组合' >")
                                .attr("id", id).attr("name", name).val(value)));

                break;
            }
            // 字符串类型
            case "anyString":
            case "numberString":
            case "letterString":
            case "numberLetterString": {
                if (ids.length == 4 && ids[3]) {
                    comm.addAgeSearchWidget($obj, labelText, id, name, fun, labelText_name, value);
                    break;
                }
                $obj.append(
                    $("<div class='form-group'>")
                        .append("<label data='" + labelText_name + "' title='" + labelText + "'>" + labelText + "</label>")
                        .append(
                            $("<input class='form-control' placeholder='请输入任意字符' >")
                                .attr("id", id).attr("name", name).val(value)
                        )
                );

                break;
            }

            // 时间类型
            case "dateTime":
            case "yearMonthDay":
            case "yearMonth":
            case "time":
            case "monthDay": {
                $obj.append(
                    $("<div class='form-group'>")
                        .append("<label data='" + labelText_name + "' class='label-title' title='" + labelText + "'>" + labelText + "</label>")
                        .append(
                            $("<input class='form-control year-month-day' readonly >").attr("id", id).attr("name", name).attr("placeholder", "请选择" + _labelText).val(value)
                        )
                )
                personRosterData.initLayerDate2({
                    elem: "#" + id,
                    format: comm.newtype[ids[0]],
                    value: value || ""
                });
                break;
            }
            // 数据查询 这边 不对 文档附件 与图片附件进行查询
            case "doc":
            case "picture": {
                $obj.append(
                    $("<div class='form-group'>")
                        .append("<label data='" + labelText_name + "' class='label-title' title='" + labelText + "'>" + labelText + "</label>")
                        .append($("<input class='form-control' readonly placeholder='不能作为查询条件' >").attr("id", id).attr("name", name))
                );
                break;
            }
            case "string": {  // 表达式类型 不能编辑
                if (ids.length == 4 && ids[3]) {
                    comm.addAgeSearchWidget($obj, labelText, id, name, fun, labelText_name, value);
                    break;
                }
                // 对时间表达式是进行处理
                if (ids[0] === '30') {  // 时间下拉框
                    $obj.append(
                        $("<div class='form-group'>")
                            .append("<label data='" + labelText_name + "' class='label-title' title='" + labelText + "'>" + labelText + "</label>")
                            .append(
                                personRosterData.initLayerDate(
                                    $("<input class='form-control year-month-day' placeholder='请选择时间' readonly >").val(value)
                                        .attr("id", id).attr("name", name).css("width", '180'), "ymd", "", "", false)))
                } else {
                    $obj.append(
                        $("<div class='form-group'>")
                            .append("<label data='" + labelText_name + "' title='" + labelText + "' >" + labelText + "</label>")
                            .append($("<input class='form-control' placeholder='请输入值'>")
                                .attr("id", id).attr("name", name).val(value)
                            )
                    );
                }
                break;
            }
            // 下拉 -- 树形 -- 依赖
            case 'enumPullAdd_text':
            case 'enumPullAdd_code':
            case 'enumTreeAdd_text':
            case 'enumTreeAdd_code':
            case 'enumRelyAdd_code':
            case 'enumRelyAdd_text': {
                comm.getDataQueryEnumChooseInput({
                    el: $obj,
                    enumId: ids[1],
                    enumType: comm.tree[$type.substr(4, 4)],
                    fieldType: ids[0],
                    labelData: labelText_name,
                    labelText: labelText,
                    fieldId: fieldId,
                    id: id,
                    name: name,
                    val: value,
                    isChooseLeaf: true,
                    treeIsCheckbox: true,
                    isAudit: $type.substr($type.indexOf("_") + 1, 4)
                });
                break;
            }
            // 附加值 (下拉枚举附加值 ,树形枚举附加值 , 依赖枚举附加值)
            case "enumPullAdd_1":
            case "enumPullAdd_2":
            case "enumPullAdd_3":
            case "enumPullAdd_4":
            case "enumPullAdd_5":
            case "enumPullAdd_6":
            case "enumPullAdd_7":
            case "enumPullAdd_8":
            case "enumPullAdd_9":
            case "enumPullAdd_10":
            case "enumPullAdd_11":
            case "enumPullAdd_12":
            case "enumPullAdd_13":
            case "enumPullAdd_14":
            case "enumPullAdd_15":
            case "enumPullAdd_16":
            case "enumPullAdd_17":
            case "enumPullAdd_18":
            case "enumPullAdd_19":
            case "enumPullAdd_20":
            case "enumTreeAdd_1":
            case "enumTreeAdd_2":
            case "enumTreeAdd_3":
            case "enumTreeAdd_4":
            case "enumTreeAdd_5":
            case "enumTreeAdd_6":
            case "enumTreeAdd_7":
            case "enumTreeAdd_8":
            case "enumTreeAdd_9":
            case "enumTreeAdd_10":
            case "enumTreeAdd_11":
            case "enumTreeAdd_12":
            case "enumTreeAdd_13":
            case "enumTreeAdd_14":
            case "enumTreeAdd_15":
            case "enumTreeAdd_16":
            case "enumTreeAdd_17":
            case "enumTreeAdd_18":
            case "enumTreeAdd_19":
            case "enumTreeAdd_20":
            case "enumRelyAdd_1":
            case "enumRelyAdd_2":
            case "enumRelyAdd_3":
            case "enumRelyAdd_4":
            case "enumRelyAdd_5":
            case "enumRelyAdd_6":
            case "enumRelyAdd_7":
            case "enumRelyAdd_8":
            case "enumRelyAdd_9":
            case "enumRelyAdd_10":
            case "enumRelyAdd_11":
            case "enumRelyAdd_12":
            case "enumRelyAdd_13":
            case "enumRelyAdd_14":
            case "enumRelyAdd_15":
            case "enumRelyAdd_16":
            case "enumRelyAdd_17":
            case "enumRelyAdd_18":
            case "enumRelyAdd_19":
            case "enumRelyAdd_20": {
                comm.getDataQueryEnumChooseInput({
                    el: $obj,
                    enumId: ids[1],
                    enumType: comm.tree[$type.substr(4, 4)],
                    fieldType: ids[0],
                    labelData: labelText_name,
                    labelText: labelText,
                    fieldId: fieldId,
                    id: id,
                    name: name,
                    val: value,
                    isChooseLeaf: true,
                    treeIsCheckbox: true,
                    additional: $type.substring($type.indexOf("_") + 1, $type.length)
                });
                break;
            }
            default : {  // 文本框控件
                if (ids.length == 4 && ids[3]) {
                    comm.addAgeSearchWidget($obj, labelText, id, name, fun, labelText_name, value);
                    break;
                }
                $obj.append(
                    $("<div class='form-group'>")
                        .append("<label data='" + labelText_name + "' title='" + labelText + "'>" + labelText + "</label>")
                        .append($("<input class='form-control' placeholder='请输入值'>")
                            .attr("id", id).attr("name", name).val(value)
                        )
                )
            }
        }
        // 单独处理 审核状态
        if (labelText.indexOf(comm.auditText) > -1) {
            $obj.find("div.form-group:last-child").remove();
            comm.getDataAuditTypeChooseInput({
                el: $obj,
                labelData: labelText_name,
                labelText: labelText,
                id: id,
                name: name,
                val: value,
                treeIsCheckbox: true,
            });
        }

        // 添加 删除 按钮   icon-trash  只有 鼠标移上去 才有
        if (ismiu) {   // ismiu 为 true 才显示 上删除 按钮
            var _pp = $obj.children("div.form-group:last-child");  // 普通按钮 不是年龄字段
            if (ids.length == 4 && ids[3]) {
                _pp = $obj.children("div.age-group").find("div.form-group:last-child");
            }
            _pp.append(
                $("<div class='form-control pointer remove-btn-div'>")
                    .attr("id", id + "Remove")
                    .css("cursor", "pointer")
                    .append("<i class='icon-trash'></i>")
                    .on("click", function () {
                        var _kid = $(this), _input = "INPUT|SELECT".split("|");

                        if (ids[3]) {  // 年龄删除
                            var _age_group = _kid.parents("div.age-group");         // 元素  --- age-group
                            var _form_groups = _age_group.find("div.form-group");   // 所有的 form-group
                            var _from_group = _kid.parents("div.form-group");          // 当前元素的 form-group
                            _kid = _kid.prev().children("input"); // 获取id
                            if (_form_groups.length == 1) {
                                fun(_kid.attr("id"));
                                _age_group.remove();
                            } else {
                                _from_group.remove();
                            }
                        } else {  // 不是年龄 选择
                            do {
                                _kid = _kid.prev();
                            } while (_kid[0].nodeName && $.inArray(_kid[0].nodeName, _input) == -1);
                            fun(_kid.attr("id"));

                            _kid.parents("div.form-group").remove();
                        }
                    }).hide()
            ).hover(function () {
                // 显示当前的删除按钮
                $(this).find("div.remove-btn-div").show();
                // 隐藏 其他 的删除按钮
                $(this).siblings().find("div.remove-btn-div").hide();
            }, function () {
                $(this).find("div.remove-btn-div").hide();
            });
        }

        return $obj.find("div.form-group:last-child");
    } else {
        throw new Error("参数错误");
    }
}


/**
 *  这个 接口 只适用于:
 *  (1) 数据审核里面的 [分组数据审核]与[个人数据审核]
 *  (2) 扩展业务里面的 核对工作
 *  说明 :

 *   (1)  不显示 时间与时间控件 右边的 删除 按钮
 *   (2)  指定是否显示 form-group 元素的删除按钮
 *   (3)  不对 用户输入的任何内容 做 有效性检查
 *
 * @param $obj   添加元素的对象
 * @param typeId 类型 ()
 * @param id     控件的id
 * @param name   控件的name
 * @param ismiu  是否多选
 * @param labelText  label 标签文本
 * @param value   控件的 显示 value 值
 * @param fieldId 字段的id
 */

comm.getDataAuditFormHtmlByTypeNotRemove = function ($obj, fieldId, typeId, id, name, ismiu, labelText, value, fun , url) {
    if(!$obj){
        throw new Error("error => one parameter not null or undefined");
    }

    if(!fieldId){
        throw new Error("error => two parameter not null or undefined");
    }

    if(!typeId){
        throw new Error("error => three parameter not null or undefined");
    }

    if(typeId.search("!")<=0){
        throw new Error("three error => format:字段类型!字符的枚举ID!字段长度");
    }
    if(!id){
        throw new Error("four error => 这个参数是控件的ID(必须要的参数) , 不能为null");
    }
    // // 第一个 元素为类型 , 第二个元素为 enum 的 id  , 第三个 元素 为 最大长度 , 第四个 元素为 权限 , 第五个参数为 是否必填[1,0]
    var ids = typeId.split("!");
    var $_opt = new Object();
    $_opt.type = ids[0];
    $_opt.enumId = ids[1];
    $_opt.lenght = ids[2];
    $_opt.obj = $obj;
    $_opt.fieldId = fieldId;
    $_opt.typeId = typeId;
    $_opt.inId = id;
    $_opt.inName = name;
    $_opt.isMiu = ismiu;
    $_opt.inLabel = labelText;
    // 转换 中文括号
    $_opt.val = value ? value+"".replace(/（/g,"(").replace(/）/g,"(") : ""
    $_opt._fun = fun;
    // 产生控件方法
    $_opt._fnAddfun = comm.funAddWidget;

    /*
     权限 判断
     0: 表示不可见
     1: 表示只读
     2: 表示可读写
     */
    if(ids.length >= 4 && ids[3] == 0){
        console.info("字段:"+labelText+"权限设置为不可见,请开启对字段的操作权限")
        return false;
    }
    if (id) {
        var $type = comm.json[$_opt.type];
        console.log($type)
        var _form = new Object();
        // 产生 div 控件
        _form._f = $_opt._fnAddfun.getfromGroup();
        // 产生label
        _form._l = $_opt._fnAddfun.getLaber({'labelText':$_opt.inLabel,"id":"lab_"+$_opt.inId});
        switch ($type) {
            case "boolean": {  // 布尔值
                _form._in = $_opt._fnAddfun.getSelect({
                    "id":$_opt.inId,
                    "name":$_opt.inName});
                _form._is = ["是","1",1];
                for (var key in comm.booleanV){
                    var _opt = document.createElement("option");
                    _opt.value = key;
                    _opt.innerText = comm.booleanV[key];
                    if($.inArray($_opt.val,_form._is) >= 0){
                        _opt.setAttribute("selected" , "selected");
                    }
                    _form._in.appendChild(_opt);
                }
                _form.type = 0;
                _form.isadd = true;
                break;
            }
            case "int": {  // int 类型值
                _form._in = $_opt._fnAddfun.getInput({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    "ph": "请输入整数"});

                _form.type = 1;
                _form.isadd = true;
                break;
            }
            case "float": {  // 精确 到好多位 小数
                _form._ph = "请输入"+$_opt.inLabel;
                if($_opt.lenght){
                    _form._ph  =  "有效位数为"+$_opt.lenght+"位";
                }
                _form._in = $_opt._fnAddfun.getInput({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    "ph": _form._ph});

                _form.type = 2;
                _form.isadd = true;
                break;
            }
            case "anyString": {  // 任意字符串
                _form._ph = "请输入"+$_opt.inLabel;
                if($_opt.lenght){
                    _form._ph  =  "长度为"+$_opt.lenght+"字符";
                }
                _form._in = $_opt._fnAddfun.getTextArea({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'length':$_opt.lenght,
                    "ph": _form._ph});

                _form.type = 0;
                _form.isadd = true;
                break;
            }
            case "numberString": {  // 数字 字符串
                _form._ph = "请输入"+$_opt.inLabel;
                if($_opt.lenght){
                    _form._ph  =  "长度为"+$_opt.lenght+"位数字字符";
                }
                _form._in = $_opt._fnAddfun.getTextArea({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'length':$_opt.lenght,
                    "ph": _form._ph});

                _form.type = 3;
                _form.isadd = true;
                break;
            }
            case "letterString": {  // 字母字符串
                _form._ph = "请输入"+$_opt.inLabel;
                if($_opt.lenght){
                    _form._ph  =  "长度为"+$_opt.lenght+"位字母字符";
                }
                _form._in = $_opt._fnAddfun.getTextArea({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'length':$_opt.lenght,
                    "ph": _form._ph});

                _form.type = 4;
                _form.isadd = true;
                break;
            }
            case "numberLetterString": {  // 数字字母字符串
                _form._ph = "请输入"+$_opt.inLabel;
                if($_opt.lenght){
                    _form._ph  =  "长度为"+$_opt.lenght+"位数字或字母字符";
                }
                _form._in = $_opt._fnAddfun.getTextArea({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'length':$_opt.lenght,
                    "ph": _form._ph});

                _form.type = 5;
                _form.isadd = true;
                break;
            }
            case "dateTime":
            case "yearMonthDay":
            case "yearMonth":
            case "time":
            case "monthDay": { // time
                _form._ph = "请选择"+$_opt.inLabel;
                _form._in = $_opt._fnAddfun.getInput({
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'readonly':true,
                    "ph": _form._ph});

                if ($_opt.type == 10 || $_opt.type == 11) {
                    $_opt.val = $_opt.val.replace(/(年|月)/gi, "-").replace(/日/gi, "")
                        .replace(/(时|分)/gi, ":").replace(/秒/gi, "")
                } else if ($_opt.type == 12) {
                    $_opt.val = $_opt.val.replace(/(年|月)/gi, "-").replace(/日/gi, "")
                } else if ($_opt.type == 13) {
                    $_opt.val = $_opt.val.replace(/(年)/gi, "-").replace(/月/gi, "")
                } else if ($_opt.type == 14) {
                    $_opt.val = $_opt.val.replace(/(月)/gi, "-").replace(/日/gi, "")
                } else if ($_opt.type == 15) {
                    $_opt.val = $_opt.val.replace(/(时|分)/gi, ":").replace(/秒/gi, "")
                }
                _form._in.value = personRosterData.convertTime({
                    'data': $_opt.val || "",
                    'type': $_opt.type,
                    'language': 'e'
                });
                personRosterData.initLayerDate2({
                    elem: _form._in,
                    format: comm.newtype[$_opt.type],
                });
                _form.type = 0;
                _form.isadd = true;
                break;
            }

            // 文件类型
            case "doc":
            case "picture": {
                // TODO 添加文件上传 与 下载按钮

                _form._input_group = $_opt._fnAddfun.getfromInput();

                _form._input = $_opt._fnAddfun.getInput({
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    "readonly":true,
                    val: $_opt.val || "",
                    "placeholder": '请选择'+$_opt.inLabel+"附件",
                });
                _form._input.style.display = 'none';

                _form._hidinput = $_opt._fnAddfun.getHiddenInput({
                    'id':"fileId_"+$_opt.inId,
                    "name":"fileId_"+$_opt.inName,
                });
                _form._hidinput.value=$_opt.val || "";

                // 上传按钮
                _form._updateBtn = document.createElement("span");
                _form._updateBtn.setAttribute("class","add-on input-group-addon pointer");
                _form._updateBtn.setAttribute("id","uploadBtn");
                _form._updateBtn.innerText="上传";
                _form._updateBtn.style.color = "#00a5e0";
                _form._updateBtn.style.cursor = "pointer";
                _form._updateBtn.style.textAlign = "center";

                // 下载按钮
                _form._downloadBtn = document.createElement("span");
                _form._downloadBtn.setAttribute("class","add-on input-group-addon pointer");
                _form._downloadBtn.setAttribute("id", "downloadBtn_" + $_opt.fieldId);
                _form._downloadBtn.innerText="下载";
                _form._downloadBtn.style.color = "#00a5e0";
                _form._downloadBtn.style.cursor = "pointer";
                _form._downloadBtn.style.textAlign = "center";

                if ($type == 'picture') {
                    // 查看按钮
                    _form._loolBtn = document.createElement("span");
                    _form._loolBtn.setAttribute("class", "add-on input-group-addon pointer");
                    _form._loolBtn.setAttribute("id", "lookBtn_" + $_opt.fieldId);
                    _form._loolBtn.innerText = "查看";
                    _form._loolBtn.style.color = "#00a5e0";
                    _form._loolBtn.style.cursor = "pointer";
                    _form._loolBtn.style.textAlign = "center";
                }

                // ------
                _form._input_group.appendChild(_form._input);
                _form._input_group.appendChild(_form._hidinput);
                _form._input_group.appendChild(_form._updateBtn);
                _form._input_group.appendChild(_form._downloadBtn);
                if ($type == 'picture') {
                    _form._input_group.appendChild(_form._loolBtn);
                }
                // 添加事件
                $(_form._updateBtn).on("click" ,function () {
                    var $$ = $(this) , _prev = $$.parents("div.input-group");
                    if(_prev){
                        _prev = _prev.find("input[type='hidden']").val()
                    }
                    comm.getUploadImgOrFile({
                        "id": id,
                        "ids":_prev,
                        "targ":id,
                        "$targ":$$,
                        "title": "请选择要上传" + $_opt.inLabel + "的文件",
                        'fileExtensions': ($type == 'doc' ? comm.WEB_FILE_EXTENSIONS : comm.PHOTO_EXTENSIONS)
                    });
                });
                $(_form._downloadBtn).on("click" ,function () {
                    var $$ = $(this) , _prev = $$.parents("div.input-group");;
                    if(_prev){
                        _prev = _prev.find("input[type='hidden']").val()
                    }
                    if(!_prev){
                        layer.msg("没有可以下载文件附件");
                    }else{
                        exportExcel.exExcel({
                            url:'/download/imgZip',
                            data:{
                                'ids':_prev,
                            }
                        })
                    }
                });
                // 查看
                $(_form._loolBtn).on("click", function () {
                    var $$ = $(this), _prev = $$.parents("div.input-group");;
                    if (_prev) {
                        _prev = _prev.find("input[type='hidden']").val()
                    }
                    if (!_prev) {
                        layer.msg("无查看的文件附件");
                    } else {
                        comm.lookPhoto({'ids': _prev})
                    }
                });
                _form._in =_form._input_group;
                _form.type = 0;
                _form.isadd = true;
                break;
            }
            // 表达式类型 不能编辑
            case "string": {
                _form._ph = "表达式字段 @name 不能修改".replace(/@name/gi, $_opt.inLabel);
                _form._in = $_opt._fnAddfun.getTextArea({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'length':$_opt.lenght,
                    'readonly':true,
                    "ph": _form._ph});
                _form.type = 0;
                _form.isadd = true;
                break;
            }
            // 下拉 -- 树形 -- 依赖
            case 'enumPullAdd_text':
            case 'enumPullAdd_code':
            case 'enumTreeAdd_text':
            case 'enumTreeAdd_code':
            case 'enumRelyAdd_code':
            case 'enumRelyAdd_text': {  //  下拉选择
                comm.getDataAuditEnumChooseInput({
                    el: $obj,
                    enumId: ids[1],
                    enumType: comm.tree[$type.substr(4, 4)],
                    fieldType: ids[0],
                    labelText: labelText,
                    fieldId: fieldId,
                    url: url || "",
                    id: id,
                    name: name,
                    val: value,
                    treeIsCheckbox:  ismiu || false,
                    isRely: $type.search("Rely") > -1,
                    isAudit: $type.substr($type.indexOf("_") + 1, 4),
                    fun:!ismiu ? fun : "",
                });
                _form.type = 0;
                _form.isadd = false;
                break;
            }
            // 附加值 (下拉枚举附加值 ,树形枚举附加值 , 依赖枚举附加值)
            case "enumPullAdd_1":
            case "enumPullAdd_2":
            case "enumPullAdd_3":
            case "enumPullAdd_4":
            case "enumPullAdd_5":
            case "enumPullAdd_6":
            case "enumPullAdd_7":
            case "enumPullAdd_8":
            case "enumPullAdd_9":
            case "enumPullAdd_10":
            case "enumPullAdd_11":
            case "enumPullAdd_12":
            case "enumPullAdd_13":
            case "enumPullAdd_14":
            case "enumPullAdd_15":
            case "enumPullAdd_16":
            case "enumPullAdd_17":
            case "enumPullAdd_18":
            case "enumPullAdd_19":
            case "enumPullAdd_20":
            case "enumTreeAdd_1":
            case "enumTreeAdd_2":
            case "enumTreeAdd_3":
            case "enumTreeAdd_4":
            case "enumTreeAdd_5":
            case "enumTreeAdd_6":
            case "enumTreeAdd_7":
            case "enumTreeAdd_8":
            case "enumTreeAdd_9":
            case "enumTreeAdd_10":
            case "enumTreeAdd_11":
            case "enumTreeAdd_12":
            case "enumTreeAdd_13":
            case "enumTreeAdd_14":
            case "enumTreeAdd_15":
            case "enumTreeAdd_16":
            case "enumTreeAdd_17":
            case "enumTreeAdd_18":
            case "enumTreeAdd_19":
            case "enumTreeAdd_20":
            case "enumRelyAdd_1":
            case "enumRelyAdd_2":
            case "enumRelyAdd_3":
            case "enumRelyAdd_4":
            case "enumRelyAdd_5":
            case "enumRelyAdd_6":
            case "enumRelyAdd_7":
            case "enumRelyAdd_8":
            case "enumRelyAdd_9":
            case "enumRelyAdd_10":
            case "enumRelyAdd_11":
            case "enumRelyAdd_12":
            case "enumRelyAdd_13":
            case "enumRelyAdd_14":
            case "enumRelyAdd_15":
            case "enumRelyAdd_16":
            case "enumRelyAdd_17":
            case "enumRelyAdd_18":
            case "enumRelyAdd_19":
            case "enumRelyAdd_20": {
                comm.getDataAuditEnumChooseInput({
                    el: $obj,
                    enumId: ids[1],
                    enumType: comm.tree[$type.substr(4, 4)],
                    fieldType: ids[0],
                    labelText: labelText,
                    fieldId: fieldId,
                    url: url || "",
                    id: id,
                    name: name,
                    val: value,
                    treeIsCheckbox: ismiu || false,
                    isRely: $type.search("Rely") > -1,
                    additional: $type.substring($type.indexOf("_") + 1, $type.length),
                    fun:!ismiu ? fun : "",
                });
                _form.type = 0;
                _form.isadd = false;
                break;
            }
            default : {  // 文本框控件
                _form._in = $_opt._fnAddfun.getTextArea({
                    'val':$_opt.val,
                    "id":$_opt.inId,
                    "name":$_opt.inName,
                    'length':$_opt.lenght,
                    "ph": "请输入"+$_opt.inLabel});

                _form.type = 0;
                _form.isadd = true;
            }
        }

        // 是否是必填字段
        if(ids.length == 5 && (ids[4] && ids[4] == 1 )){
            if(!_form._in){
                _form._l = document.getElementById("lab_"+$_opt.inId);
                _form._in = document.getElementById($_opt.inId);
            }
            _form._ismust = document.createElement("span");
            _form._ismust.innerText = "*";
            _form._ismust.style.marginLeft = "3px";
            _form._ismust.style.marginRight = "3px";
            _form._ismust.style.color = "red";
            _form._in.setAttribute("data-must",1); //
            _form._l.appendChild(_form._ismust);
        }
        // 判断 元素是否(可读)
        if(ids.length >= 4 && ids[3] == 1){
            if(_form._in){
                _form._in.setAttribute("disabled" , true);
                $obj.find('#' + id).attr("disabled", true).nextAll("span").remove();
                $obj.find('#' + id+"_enumId").attr("disabled", true);
                $obj.find('#fileId_' + id).attr("disabled", true);
            }else{
                $obj.find('#' + id).attr("disabled", true).nextAll("span").remove();
                $obj.find('#' + id+"_enumId").attr("disabled", true);
                $obj.find('#fileId_' + id).attr("disabled", true);
            }
        }
        // 添加 元素
        if(_form.isadd){
            _form._f.appendChild(_form._l);
            _form._f.appendChild(_form._in);
            $_opt.obj.append(_form._f);
        }
        // 判断类型
        if(_form.type){
            _RegExp().RegExp(_form._in, _form.type, $_opt.lenght)
        }
        return $obj.find("div.form-group:last-child");
    } else {
        throw new Error("error:element attr id not null");
    }
}

/**
 * 添加 年度 选择 下拉框
 * @param id  产生 年度 的下拉框 id
 * @param rid 回显 数据 的文本框 id
 * @param chaneIds 要 显示与 隐藏的 id 集合
 */
comm.addYearSelectOption = function (id, rid, chaneIds, width) {

    if (id) {
        $.ajax({
            url: base + '/extention/teacherInfoManager/getTime',
            type: 'POST',
            data: {},
            dataType: "JSON",
            success: function (data) {
                if (data && data.length > 0) {
                    var $obj = $("#" + id),
                        year = data[0],  // 年
                        month = data[1],  // 月
                        dq = '<option value="">请选择</option>';
                    dq += (month > 9 ?
                        "<option name='year' value='[" + year + ",01]'>" + year + "第一学期</option><option name='year' value='[" + year + ",02]'>" + year + "第二学期</option>"
                        : "<option name='year' value='[" + year + ",02]'>" + year + "第二学期</option>" );

                    for (var i = 1; i <= 10; i++) {
                        dq += "<optgroup label='" + (year - i) + "年'>";
                        dq += "<option name='year' value='[" + (year - i) + ",01]'>" + (year - i) + "第一学期</option>";
                        dq += "<option name='year' value='[" + (year - i) + ",02]'>" + (year - i) + "第二学期</option>";
                        dq += "</optgroup>";
                    }
                    // 绑定 事件
                    $obj.html(dq).multiselect({maxHeight: 300, buttonWidth: width});
                }
            },
            error: function () {

            }
        });
        return $("#" + id);
    } else {
        throw new Error("参数错误");
    }
};

/**
 * 查看 批文 图片
 *
 * 参数形式 :
 * {
 *   title : "" // 窗口的名称（默认不显示）
 *   exportBtn: true | false // 是否 显示 导出按钮
 *   ids: ""  // string 多个用 逗号分割 (图片的id值)
 *   fun:
 *   navPage: 是否显示 下面的小导航按钮
 *   downloadUrl:  下载地址 (支持跨域)
 *
 *
 *   注意 : 如果 后台 是下载文件 , 请 用 ids 来接受参数 (是一个 用 逗号分隔的 字符串)
 * }
 */
comm.lookPhoto = function (option) {
    var _e = {};  //
    if (!option) {
        throw new Error("参数错误,对象应该包含 ids 参数");
    }
    if (!option.ids || option.ids == null || option.ids == "" || typeof option.ids == 'undefined') {
        top.layer.msg("没有可查看的附件");
        return false;
    }
    _e.layerIndex;
    _e._imgArrs = [];
    _e.JSON = {
        exportBtn: true,
        ids: "",
        fun: null,
        navPage: true,
        title: false,
        navbar: false,
        // 这个参数不能修改 (默认 显示在 最上面 )
        zIndex: Date.now(),
        // why 修改 是否显示 按钮
        noDown: false,
        // 川大查看华西图片接口：查看本地接口。why修改
        initUrl: option.url || "/attachList",
        //川大：本地；图片查看；why修改; (不要加 base)
        lookUrl: "/attachAct",
        downloadItemUrl: "@base@url".replace(/@base/gi, base).replace(/@url/gi, option["downloadUrl"] || "/download/imgZip"),
        downloadAllUrl: "@base@url".replace(/@base/gi, base).replace(/@url/gi, option["downloadUrl"] || "/download/imgZip"),
        closeFun: function () {
            var parentElement = parent.document;
            var element = parentElement.getElementsByTagName("body")[0];
            if (element != null) {
                var ulElement = parentElement.getElementById("zxq20180207");
                var contentElement = parentElement.getElementsByClassName("viewer-container")[0];
                if (ulElement != null) {
                    element.removeChild(ulElement)
                }
                if (contentElement != null) {
                    element.removeChild(contentElement)
                }
                ulElement = null;
                contentElement = null;
                element = null;
                parentElement = null;
            }
        },
    },
        _e.prototype = {
            _init: function () {
                // 初始化数据
                _e.temp = $.extend({}, _e.JSON, option);
                _e.download = option.exportBtn && !option.noDown;
                _e.prototype._getImgDate();

                // 加载 图片 (通过 图片 id 来加载 )
                _e.prototype._getImghtml();
                if (_e._imgArrs && _e._imgArrs.length) {
                    parent.$("#zxq20180207").viewer(_e.temp);
                }
            },
            // 请求数据
            _getImgDate: function () {
                if (!_e.temp.ids) {
                    console.error("参数不正确或参数为空----------ids")
                }
                $.ajax({
                    url: base + _e.temp.initUrl,
                    type: "POST",
                    dataType: "JSON",
                    async: false,
                    data: {
                        attachlist: _e.temp.ids
                    },
                    success: function (json) {
                        if (json && json.ok) {
                            json = json.data;
                            for (var i = 0, len = json.length; i < len; i++) {
                                var obj = json[i];
                                _e._imgArrs.push({
                                    "alt": obj.name,   // alt 提示
                                    'path': obj.path,   // 保存路径
                                    'ext': obj.ext,   // 文件格式
                                    'id': obj.id   // 文件ID
                                });
                            }
                        } else {
                            console.dir("error 没有可以查看的图片")
                        }
                    },
                    error: function () {
                        console.dir("error 没有可以查看的图片")
                    },
                });
            },
            // 得到 图片html
            _getImghtml: function () {
                var _arrs = _e._imgArrs;
                if (!_arrs || _arrs.length == 0) {
                    console.error("没有可以查看的附件");
                    return;
                } else {
                    var $obj = new Object();
                    $obj.now = "ul@id".replace(/@id/gi, Date.now());
                    $obj.div = parent.document.getElementsByTagName("body")[0];

                    $obj.ullist = document.createElement("ul");
                    $obj.ullist.setAttribute("class", "list");
                    $obj.ullist.setAttribute("id", "zxq20180207");
                    $obj.ullist.style.display = "none";

                    for (var i = 0, len = _arrs.length; i < len; i++) {
                        var reg = (/jpg$|jpeg$|gif$|png$|bmp$/gi);
                        if (reg.test(_arrs[i].ext)) {
                            var opt = document.createElement("li");
                            var img = document.createElement("img");
                            img.setAttribute("src", "@base@url?id=@id".replace(/@base/g, base).replace(/@url/g, _e.temp.lookUrl).replace(/@id/g, _arrs[i].id));
                            img.setAttribute("alt", _arrs[i].alt);
                            // 这里 的uuid 很重要
                            img.setAttribute("data-uuid", _arrs[i].id);
                            opt.appendChild(img);
                            $obj.ullist.appendChild(opt);
                        }
                    }
                    $obj.div.appendChild($obj.ullist);
                }
            },
        };
    _e._l = function (option) {
        this.prototype._init();
    };

    _e._l(option);
};
comm.lookPhoto2 = function (option) {
    var _e = {};  //
    if (!option) {
        throw new Error("参数错误,对象应该包含 ids 参数");
    }
    if(!option.ids || option.ids == null || option.ids == ""  || typeof option.ids == 'undefined' ){
        top.layer.msg("没有可查看的附件");
        return false;
    }
    var cong = {
        shade: 0.3,
        closeBtn: 2,
        shadeClose: false,
        title: option.title || false,    // boolean
        w: "800px",  // 800px
        h: "600px",
        exportBtn: typeof option.exportBtn == 'undefined' ? true : option.exportBtn ,  // boolean
        fun: option.fun || "",
    };
    _e.layerIndex;
    _e._imgArrs = [];
    _e.prototype = {
        _init: function () {
            this.layerIndex = parent.layer.open({
                type: 1,
                shade: cong.shade,
                closeBtn: cong.closeBtn,
                area: [cong.w, cong.h],
                shadeClose: cong.shadeClose,
                title: cong.title,
                scrollbar: false,
                // skin: 'layui-layer-nobg',  // 没有边框
                skin: 1,  // 没有边框
                content: "<div class='wrap' id='img-wrap'></div>",
                success: function (index, layero) {
                    // 初始化数据
                    _e.prototype._getImgDate();
                    // 加载 图片 (通过 图片 id 来加载 )
                    _e.prototype._getImghtml();
                    if (_e._imgArrs && _e._imgArrs.length) {
                        parent.$("#slide").MdsSlideFade({
                            pageNum: true,
                            page: typeof option.navPage != 'undefined' ? option.navPage : "page",
                            nextText:'<i class="icon-angle-right"></i>',
                            prevText:'<i class="icon-angle-left"></i>',
                        });
                        if (cong.exportBtn) {
                            parent.$(".close-btn").on("click", _e.prototype.winClose)
                        }
                    }
                    if (cong.fun && (typeof cong.fun === "function")) {
                        cong.fun(index,layero);
                    }
                }
            });
        },
        // 请求数据
        _getImgDate: function () {
            if (!option.ids) {
                console.error("参数不正确或参数为空----------ids")
            }
            var url=option.url?option.url:"/attachList";//川大查看华西图片接口：查看本地接口。why修改
            $.ajax({
                url: base + url,
                type: "POST",
                dataType: "JSON",
                async: false,
                data: {
                    attachlist: option.ids
                },
                success: function (json) {
                    if (json && json.ok) {
                        json = json.data;
                        for (var i = 0, len = json.length; i < len; i++) {
                            var obj = json[i];
                            _e._imgArrs.push({
                                "alt": obj.name,   // alt 提示
                                'path': obj.path,   // 保存路径
                                'ext': obj.ext,   // 文件格式
                                'id': obj.id   // 文件ID
                            });
                        }
                    } else {
                        throw  new Error("没有可以查看的图片");
                    }
                },
                error: function () {
                    throw  new Error("网络连接异常");
                },
            });
        },
        //窗口关闭
        winClose: function () {
            parent.layer.close(_e.prototype.layerIndex);
        },
        // 得到 图片html
        _getImghtml: function () {
            var _arrs = _e._imgArrs;
            var attachAct_Url=option.lookUrl?option.lookUrl:'/attachAct';//川大：本地；图片查看；why修改;
            if (!_arrs || _arrs.length == 0) {
                console.error("没有可以查看的附件");
                return;
            } else {
                var $obj = new Object();
                $obj.div = document.getElementById("img-wrap") || parent.document.getElementById("img-wrap");
                $obj.slide = document.createElement("div");;
                $obj.slide.setAttribute("id","slide");

                $obj.ullist = document.createElement("ul");
                $obj.ullist.setAttribute("class" , "list");

                for (var i = 0, len = _arrs.length; i < len; i++) {
                    var reg = (/jpg$|jpeg$|gif$|png$|bmp$/gi);
                    if (reg.test(_arrs[i].ext)) {
                        var opt = document.createElement("li");
                        var img = document.createElement("img");
                        img.setAttribute("src","@base@url?id=@id".replace(/@base/g,base).replace(/@url/g,attachAct_Url).replace(/@id/g,_arrs[i].id));
                        img.setAttribute("alt",_arrs[i].alt);
                        if(cong.exportBtn&&!option.noDown){
                            img.setAttribute("onclick","window.open(this.src)");
                        }
                        $(img).on("load", function () {
                            var parHeight = $(this).parent('li').height();
                            var myHeight = $(this).height();
                            if (myHeight <= parHeight) {
                                $(this).css({"padding-top": ((parHeight - myHeight ) / 2),"padding-bottom": ((parHeight - myHeight ) / 2)});
                            }
                        }).on("error", function () {
                            var doc = document.createElement("div");
                            doc.innerText="图片加载失败";
                            doc.style.color = "#d2d2d2";
                            doc.style.fontSize = "20px";
                            this.parentNode.appendChild(doc);
                            this.src = base + "/static/dist/img/img_error.gif";
                            $($obj.div).find("a.export-btn").attr("href", "javascript:void(0);");
                            $($obj.div).find("button#transform-img").attr("disabled", true);
                        });
                        opt.appendChild(img);
                        $obj.ullist.appendChild(opt);
                    }else{
                        var opt = document.createElement("li");
                        var i = document.createElement("i");
                        i.setAttribute("class","icon-cloud-download");
                        opt.appendChild(i);
                        $obj.ullist.appendChild(opt);
                    }
                }
                $obj.slide.appendChild($obj.ullist);
                $obj.div.appendChild($obj.slide);
                if (cong.exportBtn&&!option.noDown) {//why修改，跨域屏蔽下载按钮
                    $obj.btn = document.createElement("div");
                    $obj.btn.setAttribute("class" , "btn-div-top");
                    var download = document.createElement("a");
                    download.setAttribute("class","btn btn-sm export-file export-btn");
                    download.setAttribute("href","@base/download/imgZip?ids=@ids".replace(/@base/g,base).replace(/@ids/g,option.ids));
                    download.innerText = "下载";
                    $obj.btn.appendChild(download);
                    $obj.div.appendChild($obj.btn)
                }
            }
        },
    };

    _e._l = function (option) {
        this.prototype._init();
    };

    _e._l(option);
};

/**
 * 添加 年龄 选择
 *
 *  (1) 仅用于 数据查询 里面的 年龄字段
 *
 * @param obj  对象
 * @param labelText  label名称
 * @param id
 * @param name
 * @param fun
 * @param labelText_name  存放的是字段的物理名称
 * @param value
 */
comm.addAgeSearchWidget = function (obj, labelText, id, name, fun, labelText_name, labelText_value) {

    var _t1 = _t2 = "", style_class = "\"cursor:pointer;\"",
        border_class = "\"border:none;padding:0px 5px;\"";
    if (obj) {
        var $that = this;
        $that.openLayer = {
            'index': 0,
            'border_class': "1px dashed red",
            'compare': {
                "NULL": function (_v) {
                    return !_v;
                },
                "regular": function (_v) {
                    return !/^[0-9]{1,3}$/.test(_v);
                },
                "degree": function (_v) {
                    return (_v <= 0 || _v >= 100);
                },
                "comparativeSize": function (_v1, _v2) {
                    _v1 = parseInt(_v1, 10) , _v2 = parseInt(_v2, 10);
                    return _v1 > _v2;
                }
            },
            /**
             * * 比较 数据
             * @param obj
             * @returns {boolean}
             */
            'validate': function (obj) {

                var compare = $that.openLayer.compare,
                    _o = $(obj).find("div.form-group:last-child").find("input.age-input");
                if (!_o.length) {
                    return false;
                    throw  new Error("没有年龄数据数据");
                }

                var _o1 = $(_o[0]), _v1 = _o1.val(), _o2 = $(_o[1]), _v2 = _o2.val();
                //  空值 判断
                if (compare.NULL(_v1)) {
                    // _o1.css("border",$that.openLayer.border_class);
                    layer.msg("请输入最小年龄", {"icon": 7, "time": 2000});
                    return false;
                } else {
                    _o1.removeAttr("style");
                }

                if (compare.NULL(_v2)) {
                    //_o2.css("border",$that.openLayer.border_class);
                    layer.msg("请输入最大年龄", {"icon": 7, "time": 2000});
                    return false;
                } else {
                    _o2.removeAttr("style");
                }

                //  合法性 判断
                if (compare.regular(_v1)) {
                    //_o1.css("border",$that.openLayer.border_class);
                    layer.msg("最小输入不合法,只能输入数字(0-100)", {"icon": 7, "time": 2000});
                    return false;
                } else {
                    _o1.removeAttr("style");
                }

                if (compare.regular(_v2)) {
                    // _o2.css("border",$that.openLayer.border_class);
                    layer.msg("最大输入不合法,只能输入数字(0-100)", {"icon": 7, "time": 2000});
                    return false;
                } else {
                    _o2.removeAttr("style");
                }

                // 超界 判断
                if (compare.degree(_v1)) {
                    // _o1.css("border",$that.openLayer.border_class);
                    layer.msg("最小年龄应在(0-100)之间", {"icon": 7, "time": 2000});
                    return false;
                } else {
                    _o1.removeAttr("style");
                }

                if (compare.degree(_v2)) {
                    // _o2.css("border",$that.openLayer.border_class);
                    layer.msg("最大年龄应在(0-100)之间", {"icon": 7, "time": 2000});
                    return false;
                } else {
                    _o2.removeAttr("style");
                }

                // 比较 判断
                if (compare.comparativeSize(_v1, _v2)) {
                    //_o1.css("border",$that.openLayer.border_class);
                    layer.msg("输入最小年龄应小于 " + _v2, {"icon": 7, "time": 2000});
                    return false;
                }
                return true;
            },

            "appendHtml": function () {
                var $t = $(obj).hasClass("age-group");
                if ($t) {
                    /**
                     * 判断输入的数据是否合法
                     */
                    if (!$that.openLayer.validate(obj)) {
                        return false;
                    }
                } else {
                    obj.append($("<div class='age-group'>"));
                    obj = obj.find("div.age-group");
                }
                obj.append(
                    $("<div class='form-group age-form age-form-group-" + $that.openLayer.index + "'><label class='text-middle' data='" + labelText_name + "'>" + labelText + "</label>")
                        .append(
                            $("<div class='input-group'>" + //
                                "<input maxlength='3' class='form-control age-input' id='" + id + "' name = '" + name + "' placeholder='请输入开始年龄' value='" + _t1 + "'>" +//
                                "<div class='input-group-addon label-title' style=" + border_class + ">至</div>" +//
                                "<input maxlength='3' class='form-control age-input' id='" + id + "' name = '" + name + "'  placeholder='请输入终止年龄' value='" + _t2 + "'>" +//
                                "<div class='input-group-addon' id='addAge' style=" + style_class + "><i class='icon-plus'></i></div>" +//
                                "</div>")

                            // 添加事件
                        ).on("click", "#addAge", $that.openLayer.appendHtml)
                        .hover(function () {
                            $(this).find(".pointer").show();                 // 显示当前的删除按钮
                            $(this).siblings().find(".pointer").hide();   // 隐藏 其他 的删除按钮
                        }, function () {
                            $(this).find(".pointer").hide();
                        })
                );
                if ($that.openLayer.index) {
                    obj.find("div.age-form-group-" + $that.openLayer.index).append(
                        // 删除按钮
                        $("<div class='form-control pointer'><i class='icon-trash'></i>")
                            .on("click", function () {
                                var _kid = $(this),
                                    _input = _kid.prev("div.input-group").children("input"), // 得到文本框
                                    _form_group = _kid.parents("div.form-group"),  // 得到 当前单击的 form-group
                                    _age_group = _form_group.parent(),  // 得到 _age_group 元素
                                    _form_groups = _age_group.find("div.form-group");  // 得到 _age_group 元素 下面的 所有 form_group

                                if (_form_groups.length == 1) {
                                    if (fun) {
                                        _input = _input.attr("id");
                                        fun(_input);
                                    }
                                    _form_group.remove();
                                    _age_group.remove();
                                } else {
                                    _form_group.remove();
                                }
                            }).hide()
                    )
                }
                $that.openLayer.index++;
            }
        }
    }
    ;

    if (labelText_value) {
        for (var i = 0, _t = labelText_value.split(","), _t1 = "",
                 _t2 = "", len = _t.length; i < len;) {
            _t1 = _t[i];
            _t2 = _t[i + 1];
            this.openLayer.appendHtml();
            i += 2;
            _t1 = _t2 = "";
        }

    } else {
        this.openLayer.appendHtml();
    }
    _t1 = _t2 = "";

}

// 导入 上传到 文件 js
function _fnLoadUploadFileWithJs () {
    var scropts = document.getElementsByTagName("script");
    var flog = new Array();
    for (var i = 0, len = scropts.length; i < len; i++) {
        var obj = scropts[i], _src = obj.getAttribute('src');
        if (_src && typeof _src != 'undefined') {
            _src = _src.substr(_src.lastIndexOf("/"));
            if (_src.search('upload') >= 0 && _src.search('exportExcel') >=0  ) {  // 不存在才导入
                flog[0] = true;
            }
            if (_src.search('laydate') >= 0) {  // 存在才导入
                flog[1] = true;
            }
        }
    };
    if(typeof personRosterData != 'undefined'){
        if (!flog[0]) {
            personRosterData.loadUploadFileWithJsOrCss()
                .script(["/static/dist/js/main/core/comm/exportExcel.js",
                    '/static/admin/js/upload.js']);
        }

        if (flog[1]) {
            personRosterData.loadUploadFileWithJsOrCss()
                .script(["/static/plugins/laydate/new/laydate.js"]);
        }
    }
}


/**
 * 添加元素
 * @returns {{getInput: (addInput|*), getfromGroup: (addFromGroup|*), getfromInput: (addFromInput|*), getHiddenInput: (addFromHiddenInput|*), getBtn: (addFromBtn|*), getLaber: (addFromLabel|*)}}
 * @private
 */
function _fnEDUAddWidget() {
    var _$obj = new Object();
    /**
     *
     */
    _$obj.addAttr = function (_$widget, data) {
        if(data){
            for (var key in data) {
                if(data[key]){
                    _$widget.setAttribute(key,data[key]);
                }
            }
            return _$widget;
        }
    }
    // 产生 textArea 元素
    _$obj.addTextArea = function (opt) {
        var $$input = document.createElement("textArea");
        $$input.value = opt.val || "";
        return _$obj.addAttr($$input,{
            "id":opt.id || "",
            "maxlength":opt.length || 1000,
            "class":comm.inputSelectTextAreaClass,
            "name":opt.name || "",
            "readonly":opt.readonly || false,
            "placeholder": opt.ph || '请选择值',
        });
    };

    // 产生 select 元素
    _$obj.addSelect = function (opt) {
        var $$input = document.createElement("select");
        $$input.value = opt.val || "";
        return _$obj.addAttr($$input,{
            "id":opt.id || "",
            "class":comm.inputSelectTextAreaClass,
            "name":opt.name || "",
        });
    };

    // 产生 input 元素
    _$obj.addInput = function (opt) {
        var $$input = document.createElement("input");
        $$input.value = opt.val || "";
        var data = {
            "id": opt.id || "",
            "maxlength": opt.length || 1000,
            "class": comm.inputSelectTextAreaClass,
            "name": opt.name || "",
            "readonly": opt.readonly || false,
            "placeholder": opt.ph || '请选择值',
        };
        if (typeof  opt.s_title != 'undefined') {
            data["s_title"] = opt.s_title;
        }
        return _$obj.addAttr($$input, data);
    };
    // 产生 form-group 元素
    _$obj.addFromGroup = function () {
        var $$input = document.createElement("div");
        $$input.setAttribute("class",comm.formGroup);
        return $$input;
    };
    // 产生 input-group 按钮
    _$obj.addFromInput = function () {
        var $$input = document.createElement("div");
        $$input.setAttribute("class",comm.inputGroup);
        return $$input;
    };
    // 产生 hidden 元素
    _$obj.addFromHiddenInput = function (opt) {
        var $$input = document.createElement("input");
        $$input.value = opt.val || "";
        return _$obj.addAttr($$input,{
            'id':opt.id || "",
            "name":opt.name || "",
            "type":'hidden'
        });
    };
    // 产生按钮
    _$obj.addFromBtn = function (opt) {
        var $$span = document.createElement("span");
        $$span = _$obj.addAttr($$span,{"class":"add-on input-group-addon pointer","id":opt.id});

        var _$$i = document.createElement("i");
        _$$i = _$obj.addAttr(_$$i,{"class":"icon-reorder"});
        $$span.appendChild(_$$i);
        return $$span;
    };
    // 产生label
    _$obj.addFromLabel = function (option) {
        var $$span = document.createElement("label");
        $$span = _$obj.addAttr($$span,option);
        $$span.innerText = option.labelText;
        return $$span;
    };

    return {
        getInput:_$obj.addInput,
        getfromGroup:_$obj.addFromGroup,
        getfromInput:_$obj.addFromInput,
        getHiddenInput:_$obj.addFromHiddenInput,
        getBtn:_$obj.addFromBtn,
        getLaber:_$obj.addFromLabel,
        getTextArea:_$obj.addTextArea,
        getSelect:_$obj.addSelect,
    }
}

/**
 * 这个接口 就只有教育局 专用
 * 为教育局这边产生 下拉框的值 (取消 枚举下拉弹窗)
 * @param option
 */
function _getEDUEnumChooseInput(option) {
    if (!option) {
        return;
    }

    var $$selectFun = new Object();
    // 没有值的时候产生默认的input
    $$selectFun.default = function () {
        var $$input = document.createElement("input");
        $$input.setAttribute("disabled", "true");
        $$input.setAttribute("class", comm.inputSelectTextAreaClass);
        $$input.setAttribute("id", option.id);
        $$input.setAttribute("name", option.name);
        $$input.setAttribute("placeholder", "没有查到对应的选择值");
        var prev = $(option.el).prev();
        if (prev && prev.length) {
            $(prev).after($$input);
            $(option.el).remove();
        }
    };
    $$selectFun.isNumber = function (value) {
        return /^\d$/g.test(value);
    };

    $$selectFun.getAdded = function (value) {
        return value.split(personRosterData.additional);
    };
    $$selectFun.getDefault = function () {
        var _input = document.createElement("option");
        _input.innerText = "";
        _input.value = "";
        return _input;
    };

    $$selectFun.getAddedVal = function (len, array) {
        if (len && len.constructor.name == "String") {
            len = parseInt(len, 10);
        }
        if(!array && array.constructor.name != "Array"){
            return "";
        }
        if (len <= 0) {
            return "";
        } else if (len > array.length) {
            return "";
        } else {
            len = array[len - 1];
            return len === personRosterData.space ? "" : len;
        }
        return "";
    };
    $$selectFun.ajax = function () {
        var $th = $$selectFun;
        $.ajax({
            url: base + comm.admin,
            type: "POST",
            data: {
                'enumId': option.enumId,
                'enumType': comm.tree["Pull"],
                "fieldType": option.fieldType,
                "fieldId": option.fieldId,
            },
            dataType: "JSON",
            async: false,
            success: function (json) {
                if (json && json.length) {
                    //  reset 为提交给后台的值
                    //  name 为显示给用户看的值
                    var reset = option.data["reset"] || 'text';
                    if (!reset || typeof reset == 'undefined') {
                        throw new Error("参数错误");
                    }
                    var _index = 0 , isNum = $th.isNumber(reset) ;
                    if(isNum){
                        _index = parseInt(reset,10);
                    }
                    for (var i = 0; i < json.length; i++) {
                        // if(i==0){
                        //     option.el.appendChild($$selectFun.getDefault());
                        // }
                        var opt = document.createElement("option") , _value = "" , adds = [];
                        if(isNum){
                            adds = $$selectFun.getAdded(json[i].additional);
                            _value = adds[_index-1];
                        }else{
                            _value = json[i][reset];
                        }
                        opt.setAttribute("value",isNum ? $$selectFun.getAddedVal(reset,adds) : json[i][option.data["reset"]]);
                        opt.setAttribute("data-id", json[i][option.data["id"]]);
                        opt.innerHTML = json[i][option.data["name"]];  // text
                        if (_value && _value == option.value) {
                            opt.setAttribute("selected", "selected");
                        }
                        option.el.appendChild(opt);
                    }

                    $(option.el).on("change", function () {
                        if (typeof option.fun != 'undefined') {
                            option.fun();
                        }
                        // 设置隐藏域枚举ID
                        $(option.el).prev("input[type='hidden']").val(
                            $(this).find("option:eq('" + option.el.selectedIndex + "')").data("id")
                        );
                        // 加载其他的枚举依赖值
                        // commUnits.addMenuRelySettingValue();
                    })
                } else {
                    $$selectFun.default();
                }
            }
        });
    };
    $$selectFun.ajax();
};

/**
 * 添加控件元素
 */
function _fnAddWidget(opttion) {

    var $$div = new Object();
    $$div.div = document.createElement("div");
    $$div.input = undefined;
    $$div.isMust = false;
    $$div.label = document.createElement("label");
    $$div.div.setAttribute("class", comm.formGroup);
    $$div.label.innerHTML = opttion.labelText;

    $$div.div.isNumber = function (value) {
        return /^[1-9][0-9]*$/g.test(value);
    };
    // 是否是必填 字段
    if (opttion.isMust && opttion.isMust.constructor.name === "Boolean") {
        $$div.span = document.createElement("span");
        $$div.span.setAttribute("class", "must-title-info")
        $$div.span.innerText = "*";
        $$div.span.style.color = "red";
        $$div.span.style.marginLeft = "3px";
        $$div.span.style.marginright = "3px";
        $$div.isMust = true;
        $$div.label.appendChild($$div.span);
    }
    $$div.div.appendChild($$div.label);

    /**
     *  $$div.type 1 int
     * @type {*}
     */
    var isNumber = $$div.div.isNumber;
    switch (opttion.type) {
        case "boolean": {  // 布尔值
            $$div.input = document.createElement("select");
            $$div.input.setAttribute("id", opttion.id);
            $$div.input.setAttribute("name", opttion.name);
            $$div.input.setAttribute("class", comm.inputSelectTextAreaClass);
            $$div.input.value = opttion.value;
            for (var key in comm.booleanV) {
                var option = document.createElement("option");
                option.setAttribute("value", key);
                option.innerText = comm.booleanV[key];
                if (opttion.value && opttion.value == key) {
                    option.setAttribute("selected", "selected");
                }
                $$div.input.appendChild(option);
            }
            $$div.type = 10;
            break;
        }
        case "int": {  // int 类型值
            $$div.input = document.createElement("input");
            $$div.input.setAttribute("id", opttion.id);
            $$div.input.setAttribute("name", opttion.name);
            $$div.input.setAttribute("class", comm.inputSelectTextAreaClass);
            $$div.input.value = opttion.value;
            $$div.input.setAttribute("placeholder", "请输入整数");
            if (opttion.length && isNumber(opttion.length)) {
                $$div.input.setAttribute("maxlength", opttion.length);
                $$div.input.setAttribute("placeholder", "请输入" + opttion.length + "位整数");
            }
            $$div.type = 1;
            break;
        }
        case "float": {  // 精确 到好多位 小数
            $$div.input = document.createElement("input");
            $$div.input.setAttribute("id", opttion.id);
            $$div.input.setAttribute("name", opttion.name);
            $$div.input.setAttribute("class", comm.inputSelectTextAreaClass);
            $$div.input.value = opttion.value;
            $$div.input.setAttribute("placeholder", "请输入小数");
            if (opttion.length && isNumber(opttion.length)) {
                $$div.input.setAttribute("maxlength", opttion.length);
                $$div.input.setAttribute("placeholder", "请输入小数,有效位数为" + opttion.length);
            }
            $$div.type = 2;
            break;
        }
        case "anyString": {  // 任意字符串
            $$div.input = document.createElement("textarea");
            $$div.input.setAttribute("id", opttion.id);
            $$div.input.setAttribute("name", opttion.name);
            $$div.input.setAttribute("class", comm.inputSelectTextAreaClass);
            $$div.input.value = opttion.value;
            $$div.input.setAttribute("placeholder", "请输入"+opttion.labelText);
            if (opttion.length && isNumber(opttion.length)) {
                $$div.input.setAttribute("maxlength", opttion.length);
                $$div.input.setAttribute("placeholder", "长度为" + opttion.length + "位");
            }
            $$div.type = 10;
            break;
        }
        case "numberString": {  // 数字 字符串
            $$div.input = document.createElement("textarea");
            $$div.input.setAttribute("id", opttion.id);
            $$div.input.setAttribute("name", opttion.name);
            $$div.input.setAttribute("class", comm.inputSelectTextAreaClass);
            $$div.input.value = opttion.value;
            $$div.input.setAttribute("placeholder", "请输入[0~9]的任意数字");
            if (opttion.length && isNumber(opttion.length)) {
                $$div.input.setAttribute("maxlength", opttion.length);
                $$div.input.setAttribute("placeholder", "请输入" + opttion.length + "位[0~9]的数字" + opttion.length);
            }
            $$div.type = 3;
            break;
        }
        case "letterString": {  // 字母字符串
            $$div.input = document.createElement("textarea");
            $$div.input.setAttribute("id", opttion.id);
            $$div.input.setAttribute("name", opttion.name);
            $$div.input.setAttribute("class", comm.inputSelectTextAreaClass);
            $$div.input.value = opttion.value;
            $$div.input.setAttribute("placeholder", "请输入[a~z或A~Z]的任意字母");
            if (opttion.length && isNumber(opttion.length)) {
                $$div.input.setAttribute("maxlength", opttion.length);
                $$div.input.setAttribute("placeholder", "请输入"+opttion.length+"位[a~z或A~Z]字母");
            }
            $$div.type = 4;
            break;
        }
        case "numberLetterString": {  // 数字字母字符串
            $$div.input = document.createElement("textarea");
            $$div.input.setAttribute("id", opttion.id);
            $$div.input.setAttribute("name", opttion.name);
            $$div.input.setAttribute("class", comm.inputSelectTextAreaClass);
            $$div.input.value = opttion.value;
            $$div.input.setAttribute("placeholder", "请输入[0~9或a~z或A~Z]的数字或字母");
            if (opttion.length && isNumber(opttion.length)) {
                $$div.input.setAttribute("maxlength", opttion.length);
                $$div.input.setAttribute("placeholder", "请输入"+opttion.length+"位[0~9或a~z或A~Z]的数字或字母");
            }
            $$div.type = 5;
            break;
        }
        // 时间类型
        case "dateTime":
        case "yearMonthDay":
        case "yearMonth":
        case "time":
        case "monthDay": {
            $$div.input = document.createElement("input");
            $$div.input.setAttribute("id", opttion.id);
            $$div.input.setAttribute("name", opttion.name);
            $$div.input.setAttribute("class", comm.inputSelectTextAreaClass);
            $$div.input.setAttribute("placeholder", "请选择" + opttion.labelText);
            $$div.input.setAttribute("readonly", true);
            $$div.input.value = personRosterData.convertTime({
                'data': opttion.value || "",
                'type': opttion.ids[0],
                'language': 'e'
            });
            $$div.type = 6; // 时间
            break;
        }
        case "doc":
        case "picture": {
            // 没得突变会显示 默认的图片
            $$div.imgDiv = document.createElement("div");
            $$div.imgDiv.setAttribute("class", "user-photo-img");

            $$div.hinput = document.createElement("input");
            $$div.hinput.setAttribute("id", opttion.id);
            $$div.hinput.setAttribute("type", "hidden");
            $$div.hinput.setAttribute("name", opttion.name);
            $$div.hinput.setAttribute("class", comm.inputSelectTextAreaClass);
            $$div.hinput.value = opttion.value;

            $$div.img = document.createElement("img");
            $$div.img.setAttribute("width", opttion.img.width+"px");
            $$div.img.setAttribute("height", opttion.img.height+"px");
            $$div.img.setAttribute("alt", "用户头像");
            $$div.img.setAttribute("src", opttion.img.src);


            $$div.btn = document.createElement("input");
            $$div.btn.setAttribute("type", "button");
            $$div.btn.setAttribute("class", "btn btn-sm user-photo-img-btn");
            $$div.btn.setAttribute("value", "修改图片");

            $$div.imgDiv.appendChild($$div.img);
            $$div.imgDiv.appendChild($$div.hinput);
            $$div.imgDiv.appendChild($$div.btn);

            $$div.input = $$div.imgDiv;
            $$div.type = 7;
            break;
        }
        case "string": {  // 表达式类型
            $$div.input = document.createElement("input");
            $$div.input.setAttribute("id", opttion.id);
            $$div.input.setAttribute("name", opttion.name);
            $$div.input.setAttribute("class", comm.inputSelectTextAreaClass);
            $$div.input.setAttribute("disabled", "true");
            $$div.input.value = opttion.value;
            $$div.input.setAttribute("placeholder", "请输入"+opttion.labelText);
            if (opttion.length && isNumber(opttion.length)) {
                $$div.input.setAttribute("maxlength", opttion.length);
                $$div.input.setAttribute("placeholder", "请输入"+opttion.labelText+",有效长度为" + opttion.length);
            }
            $$div.type = 10;
            break;
        }
        // 下拉 --
        case 'enumPullAdd_text':
        case 'enumPullAdd_code':
        case "enumPullAdd_1":
        case "enumPullAdd_2":
        case "enumPullAdd_3":
        case "enumPullAdd_4":
        case "enumPullAdd_5":
        case "enumPullAdd_6":
        case "enumPullAdd_7":
        case "enumPullAdd_8":
        case "enumPullAdd_9":
        case "enumPullAdd_10":
        case "enumPullAdd_11":
        case "enumPullAdd_12":
        case "enumPullAdd_13":
        case "enumPullAdd_14":
        case "enumPullAdd_15":
        case "enumPullAdd_16":
        case "enumPullAdd_17":
        case "enumPullAdd_18":
        case "enumPullAdd_19":
        case "enumPullAdd_20": {

            // TODO 加一个 隐藏域
            $$div.hinput = document.createElement("input");
            $$div.hinput.setAttribute("id", opttion.id + "_enumId");
            $$div.hinput.setAttribute("type", "hidden");
            $$div.hinput.setAttribute("name", opttion.name + "_enumId");

            $$div.select = document.createElement("select");
            $$div.select.setAttribute("id", opttion.id);
            $$div.select.setAttribute("name", opttion.name);
            $$div.select.setAttribute("class", comm.inputSelectTextAreaClass);

            $$div.option = document.createElement("option");
            $$div.option.setAttribute("value", "");
            $$div.option.innerText = "请选择" + opttion.labelText;
            $$div.select.appendChild($$div.option);

            $$div.div.appendChild($$div.hinput);
            $$div.input = $$div.select;

            $$div.type = 8
            $$div.code = opttion.type.substr(opttion.type.indexOf("_") + 1);
            break;
        }
        //树形 -- 依赖
        case 'enumTreeAdd_text':
        case 'enumTreeAdd_code':
        case 'enumRelyAdd_code':
        case 'enumRelyAdd_text': {
            comm.getDataQueryEnumChooseInput({
                el: opttion.el,
                enumId: opttion.ids[1],
                enumType: comm.tree[opttion.type.substr(4, 4)],
                fieldType: opttion.ids[0],
                labelText: opttion.labelText,
                fieldId: opttion.fieldId,
                id: opttion.id,
                name: opttion.name,
                val: opttion.value,
                isChooseLeaf: opttion.isChooseLeaf,
                treeIsCheckbox: opttion.isCheck,
                isBtn: opttion.isBtn,
                isHidden: opttion.isHidden,
                isRely:opttion.type.search("Rely") > -1,
                _fun:opttion._fun,
                isAudit: opttion.type.substr(opttion.type.indexOf("_") + 1, 4)
            });
            $$div.type = -1;
            break;
        }
        // 附加值 (树形枚举附加值 , 依赖枚举附加值)
        case "enumTreeAdd_1":
        case "enumTreeAdd_2":
        case "enumTreeAdd_3":
        case "enumTreeAdd_4":
        case "enumTreeAdd_5":
        case "enumTreeAdd_6":
        case "enumTreeAdd_7":
        case "enumTreeAdd_8":
        case "enumTreeAdd_9":
        case "enumTreeAdd_10":
        case "enumTreeAdd_11":
        case "enumTreeAdd_12":
        case "enumTreeAdd_13":
        case "enumTreeAdd_14":
        case "enumTreeAdd_15":
        case "enumTreeAdd_16":
        case "enumTreeAdd_17":
        case "enumTreeAdd_18":
        case "enumTreeAdd_19":
        case "enumTreeAdd_20":
        case "enumRelyAdd_1":
        case "enumRelyAdd_2":
        case "enumRelyAdd_3":
        case "enumRelyAdd_4":
        case "enumRelyAdd_5":
        case "enumRelyAdd_6":
        case "enumRelyAdd_7":
        case "enumRelyAdd_8":
        case "enumRelyAdd_9":
        case "enumRelyAdd_10":
        case "enumRelyAdd_11":
        case "enumRelyAdd_12":
        case "enumRelyAdd_13":
        case "enumRelyAdd_14":
        case "enumRelyAdd_15":
        case "enumRelyAdd_16":
        case "enumRelyAdd_17":
        case "enumRelyAdd_18":
        case "enumRelyAdd_19":
        case "enumRelyAdd_20": {
            comm.getDataQueryEnumChooseInput({
                el: opttion.el,
                enumId: opttion.ids[1],
                enumType: comm.tree[opttion.type.substr(4, 4)],
                fieldType: opttion.ids[0],
                labelText: opttion.labelText,
                fieldId: opttion.fieldId,
                id: opttion.id,
                name: opttion.name,
                val: opttion.value,
                isBtn: opttion.isBtn,
                isHidden: opttion.isHidden,
                isChooseLeaf: opttion.isChooseLeaf,
                treeIsCheckbox: opttion.isCheck,
                isRely: opttion.type.search("Rely") > -1,
                _fun:opttion._fun,
                additional: opttion.type.substring(opttion.type.indexOf("_") + 1, opttion.type.length)
            });
            $$div.type = -1;
            break;
        }
        default : {  // 文本框控件
            $$div.input = document.createElement("input");
            $$div.input.setAttribute("id", opttion.id);
            $$div.input.setAttribute("name", opttion.name);
            $$div.input.setAttribute("class", comm.inputSelectTextAreaClass);
            $$div.input.setAttribute("placeholder", "请输入"+opttion.labelText);
            $$div.input.value = opttion.value;
            if (opttion.length && isNumber(opttion.length)) {
                $$div.input.setAttribute("maxlength", opttion.length);
            }
        }
    }
    if ($$div.input || $$div.isMust) {
        $$div.input.setAttribute("data-must", true);
        $$div.div.appendChild($$div.input);
    }
    return $$div;
};

/**
 * 正则
 * @param type
 * @private
 */
function _RegExp() {

    var $$Reg = new Object();
    /**
     * 正则配备
     * @param _type
     * @param value
     * @param len
     * @returns {boolean}
     * @constructor
     */
    $$Reg.REG = function (_type, value, len) {
        var flog = false;
        switch (_type) {
            case 1: { // int
                flog = /^-?\d+$/g.test(value);
                break
            }
            case 2: {  // float
                var patt1 = new RegExp("^-?\\d+(\\.\\d{1," + len + "})?$");
                flog = patt1.test(value);
                break
            }
            case 3: {  //  数字 字符串
                flog = /^\d+$/.test(value);
                break
            }
            case 4: {  // 字母 字符串
                flog = /^[A-Za-z]+$/.test(value);
                break
            }
            case 5: {  // 数字字母字符串
                flog = /^[A-Za-z0-9]+$/.test(value);
                break
            }
            default:{  //  其他的控件就不检查 输入的内容
                flog = true;
            }
        }
        return flog;
    };
    /**
     *
     * @param obj  元素对象
     * @param _type  元素类型
     * @param len    元素的输入最大长度
     * @constructor
     */
    $$Reg.Event = function (obj, _type, len) {
        if(typeof obj == 'undefined' ){
            throw new Error("parameter error:add event element is null or undefined ");
        }
        // 失去焦点事件
        $(obj).on("blur", function () {
            var _v = this.value.trim();
            if(_v){
                if (!$$Reg.REG(_type, _v, len)) {
                    layer.msg("输入有误,"+$(obj).attr("placeholder") || "输入有误,请重新输入",
                        {icon: 7, time: 1500});
                    $(this).attr("data-isReg",false);
                    $(obj).select();
                }
                $(this).attr("data-isReg",true);
            }

        })
    };
    return {
        RegExp: $$Reg.Event
    }
}

// 页面已加载就执行
$().ready(function () {
    comm.funAddWidget = _fnEDUAddWidget();
    _fnLoadUploadFileWithJs();
});

/**
 * 以post形式跳转页面
 * @param URL 跳转的url地址
 * @param PARAMS 需要传递的参数
 */
function toPostPage(URL, PARAMS) {
    var temp_form = document.createElement("form");
    temp_form .action = URL;
    temp_form .method = "post";
    for (var x in PARAMS) {
        var opt = document.createElement("input");
        opt.name = x;
        opt.value = PARAMS[x];
        temp_form .appendChild(opt);
    }
    document.body.appendChild(temp_form);
    temp_form .submit();
}

/**
 *以post形式打开新的页面
 * @param URL 跳转的url地址
 * @param PARAMS 需要传递的参数
 */
function toPostOpen(URL, PARAMS) {
    var temp_form = document.createElement("form");
    temp_form .action = URL;
    temp_form .target = "_blank";
    temp_form .method = "post";
    temp_form .style.display = "none";
    for (var x in PARAMS) {
        var opt = document.createElement("textarea");
        opt.name = x;
        opt.value = PARAMS[x];
        temp_form .appendChild(opt);
    }
    document.body.appendChild(temp_form);
    temp_form .submit();
}


// laydate 旧时间控件
comm.type = {
    "10": "TIME",            //  时间类型
    "11": "TIME",            //	年月日类型时间
    "12": "YMD",             //	年月日类型
    "13": "YM",              //	年月类型
    "14": "MD",              //	月日类型
    "15": "TIME",            //	时间类型
};

// laydateNew 时间控件
comm.newtype = {
    "10": "HMS",            //  时间类型
    "11": "YMDT",            //	年月日类型时间
    "12": "YMD",             //	年月日类型
    "13": "YM",              //	年月类型
    "14": "MD",              //	月日类型
    "15": "TIME",            //	时间类型
};

/**
 * 控件规则
 */
comm.json = {
    "0": "sysEnum",              //     系统枚举字段类型
    "-1": "audit",              //		系统审核字段类型
    "1": "boolean",              //		布尔类型
    "2": "",                     //		数值类型
    "3": "int",                  //		整数类型
    "4": "float",                //		实数类型
    "5": "",                     //		字符串类型
    "6": "anyString",            //	    任意字符串类型
    "7": "numberString",         //	    数字符串类型
    "8": "letterString",         //	    字母符串类型
    "9": "numberLetterString",   //	    数字字母混合类型
    "10": "",                    //      时间类型
    "11": "dateTime",            //	    年月日类型时间
    "12": "yearMonthDay",        //	    年月日类型
    "13": "yearMonth",           //	    年月类型
    "14": "monthDay",            //	    月日类型
    "15": "time",                //		时间类型
    "16": "",                    //      枚举类型
    "17": "enum",                //		枚举实体类型
    "18": "enumRely",            //		枚举依赖类型
    "19": "",                    //		关联类型
    "20": "",                    //		关联布尔类型
    "21": "",                    //		关联整型
    "22": "",                    //		关联实数类型
    "23": "",                    //		关联字符型
    "24": "",                    //		关联时间类型
    "25": "",                    //		附件类型
    "26": "doc",                 //	    文档附件
    "27": "picture",             //		图片附件
    "28": "string",              //		数字类型表达式类型
    "29": "string",              //		字符串表达式类型
    "30": "string",              //		日期表达式类型
    "31": "enumTreeAdd_text",    //	    树型枚举名称
    "32": "enumTreeAdd_code",    //	    树型枚举值
    "33": "enumTreeAdd_1",       //	    树型枚举附加值一
    "34": "enumTreeAdd_2",       //	    树型枚举附加值二
    "35": "enumPullAdd_text",    //		下拉型枚举名称
    "36": "enumPullAdd_code",    //		下拉型枚举值
    "37": "enumPullAdd_1",       //	    下拉型枚举附加值一
    "38": "enumPullAdd_2",       //		下拉型枚举附加值二
    "39": "enumRelyAdd_text",    //	    枚举名称依赖
    "40": "enumRelyAdd_code",    //		枚举值依赖
    "41": "enumRelyAdd_1",       //	    枚举附加值一依赖
    "42": "enumRelyAdd_2",       //		枚举附加值二依赖
    "43": "",                    //      私有枚举类型
    "44": "enumTreeAdd_3",       //      树型枚举附加值三
    "45": "enumTreeAdd_4",       //      树型枚举附加值四
    "46": "enumTreeAdd_5",       //      树型枚举附加值五
    "47": "enumTreeAdd_6",       //      树型枚举附加值六
    "48": "enumTreeAdd_7",       //      树型枚举附加值七
    "49": "enumTreeAdd_8",       //      树型枚举附加值八
    "50": "enumTreeAdd_9",       //      树型枚举附加值九
    "51": "enumTreeAdd_10",                    //      树型枚举附加值十
    "52": "enumTreeAdd_11",                    //      树型枚举附加值十一
    "53": "enumTreeAdd_11",                    //      树型枚举附加值十二
    "54": "enumTreeAdd_13",                    //      树型枚举附加值十三
    "55": "enumTreeAdd_14",                    //      树型枚举附加值十四
    "56": "enumTreeAdd_15",                    //      树型枚举附加值十五
    "57": "enumTreeAdd_16",                    //      树型枚举附加值十六
    "58": "enumTreeAdd_17",                    //      树型枚举附加值十七
    "59": "enumTreeAdd_18",                    //      树型枚举附加值十八
    "60": "enumTreeAdd_19",                    //      树型枚举附加值十九
    "61": "enumTreeAdd_20",                    //      树型枚举附加值二十
    "62": "enumPullAdd_3",       //      下拉型枚举附加值三
    "63": "enumPullAdd_4",       //      下拉型枚举附加值四
    "64": "enumPullAdd_5",       //      下拉型枚举附加值五
    "65": "enumPullAdd_6",       //      下拉型枚举附加值六
    "66": "enumPullAdd_7",       //      下拉型枚举附加值七
    "67": "enumPullAdd_8",       //      下拉型枚举附加值八
    "68": "enumPullAdd_9",       //      下拉型枚举附加值九
    "69": "enumPullAdd_10",      //      下拉型枚举附加值十
    "70": "enumPullAdd_11",      //      下拉型枚举附加值十一
    "71": "enumPullAdd_12",      //      下拉型枚举附加值十二
    "72": "enumPullAdd_13",      //      下拉型枚举附加值十三
    "73": "enumPullAdd_14",      //      下拉型枚举附加值十四
    "74": "enumPullAdd_15",      //      下拉型枚举附加值十五
    "75": "enumPullAdd_16",      //      下拉型枚举附加值十六
    "76": "enumPullAdd_17",      //      下拉型枚举附加值十七
    "77": "enumPullAdd_18",      //      下拉型枚举附加值十八
    "78": "enumPullAdd_19",      //      下拉型枚举附加值十九
    "79": "enumPullAdd_20",      //      下拉型枚举附加值二十
    "80": "enumRelyAdd_3",                    //      枚举附加值三依赖
    "81": "enumRelyAdd_4",                    //      枚举附加值四依赖
    "82": "enumRelyAdd_5",                    //      枚举附加值五依赖
    "83": "enumRelyAdd_6",                    //      枚举附加值六依赖
    "84": "enumRelyAdd_7",                    //      枚举附加值七依赖
    "85": "enumRelyAdd_8",                    //      枚举附加值八依赖
    "86": "enumRelyAdd_9",                    //      枚举附加值九依赖
    "87": "enumRelyAdd_10",                    //      枚举附加值十依赖
    "88": "enumRelyAdd_11",                    //      枚举附加值十一依赖
    "89": "enumRelyAdd_12",                    //      枚举附加值十二依赖
    "90": "enumRelyAdd_13",                    //      枚举附加值十三依赖
    "91": "enumRelyAdd_14",                    //      枚举附加值十四依赖
    "92": "enumRelyAdd_15",                    //      枚举附加值十五依赖
    "93": "enumRelyAdd_16",                    //      枚举附加值十六依赖
    "94": "enumRelyAdd_17",                    //      枚举附加值十七依赖
    "95": "enumRelyAdd_18",                    //      枚举附加值十八依赖
    "96": "enumRelyAdd_19",                    //      枚举附加值十九依赖
    "97": "enumRelyAdd_20",                    //      枚举附加值二十依赖
};