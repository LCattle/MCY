define(["base/baseApp", '../lib/citySelector/lArea', '../lib/citySelector/address', './base/validate', 'animate', 'css!../lib/citySelector/lArea'], function(app, area, address, validate, animate) {

    var area = new lArea();
    var dialog = new auiDialog({});
    var oid = app.UrlParams.oid;
    var otype = app.UrlParams.otype;
    var isApply = false;
    var applyInfo = null;
    var isSubmit = false;

    app.addVals = [];
    app.init = function () {
        if(!check()){
            return;
        }
        initContentText();
        if(isApply){
            showOnlyRead(applyInfo);
        } else {
            $("#submitApplyDiv").show();
            initAddress();
            initEvent();
        }
    };
    app.initPage = function () {};
    
    function showOnlyRead(data) {
        $(".headInfo").attr("disabled","disabled");
        $("#nameInput").attr("disabled","disabled");
        $("#phoneInput").attr("disabled","disabled");
        $("#addressDetail").attr("disabled","disabled");

        $(".invoiceType").removeClass("active");
        $(".invoiceType[data-value="+data.type+"]").addClass("active");
        $(".headType .checkBtn").removeClass("active");
        $(".headType .checkBtn[data-value="+data.lookup+"]").addClass("active");
        $(".headInfo").val(data.headcontent);
        $("#nameInput").val(data.receiver);
        $("#phoneInput").val(data.mobile);
        $(".contentText").text(data.content);
        $("#selectArea").text(data.provincename + " " + data.cityname + " " + data.countyname);
        $("#addressDetail").val(data.detailaddress);
    }

    function initContentText() {
        // 蔬菜
        if(otype == 10){
            $(".contentText").text("种植机");
        } else {
            $(".contentText").text("蔬菜");
        }

    }
    
    function check() {
        if(!oid){
            app.tipInfo("订单id不能为空");
            return false;
        }
        if(!otype){
            app.tipInfo("订单类型不能为空");
            return false;
        }
        if(otype != 3 && otype != 4 && otype != 5 && otype != 6 && otype != 10){
            app.tipInfo("订单类型不能正确");
            return false;
        }
        // 判断是否已经申请过开发票
        app.POSTRequest("weixin/mall/invoice/isApply.do", {
            data: {
                orderid: oid
            },
            async:false,
            success: function(data){
                console.log(data);
                if(data.resultCode == '1'){
                    applyInfo = data.resultObj;
                    if(data.resultObj){
                        isApply = true;
                    } else {
                        isApply = false
                    }
                } else {
                    app.tipInfo(data.resultMsg);
                }
            }
        });

        return true;
    }

    function initAddress() {
        area.init({
            'trigger': '#address',
            'data': address.data,
            onselected: function(vals, provinceText, cityText, countyText) {
                app.addVals = vals;
                $("#selectArea").text(provinceText + " " + cityText + " " + countyText);
            }
        });
    }
    
    app.submitApply = function () {
        var invoiceType = $(".invoiceType.active").data("value");
        var lookup = $(".headType .checkBtn.active").data("value");
        var headInfo = $(".headInfo").val();
        var name = $("#nameInput").val();
        var phone = $("#phoneInput").val();
        var contentText = $(".contentText").text();
        var selectArea = $("#selectArea").text();
        var addressDetail = $("#addressDetail").val();
        if(validate.checkIsEmpty(invoiceType)){
            app.tipInfo("请选择发票类型");
            return;
        }
        if(validate.checkIsEmpty(lookup)){
            app.tipInfo("请选择发票抬头类型");
            return;
        }
        if(validate.checkIsEmpty(headInfo)){
            app.tipInfo("请填写发票抬头信息");
            return;
        }
        if(validate.checkIsEmpty(name)){
            app.tipInfo("请填写收件人");
            return;
        }
        if(validate.checkIsEmpty(phone)){
            app.tipInfo("请填写手机号码");
            return;
        }
        if(!validate.checkMobilePhone(phone)){
            app.tipInfo("请正确填写手机号码");
            return;
        }
        if(validate.checkIsEmpty(contentText)){
            app.tipInfo("请选择发票内容");
            return;
        }
        if(validate.checkIsEmpty(selectArea)){
            app.tipInfo("请选择所在地区");
            return;
        }
        if(validate.checkIsEmpty(addressDetail)){
            app.tipInfo("请填写详细地址");
            return;
        }
        //设置在提交
        if(isSubmit){
            return;
        }
        isSubmit = true;
        var province = address.data[app.addVals[0]];
        var city = province.child[app.addVals[1]];
        var county = city.child[app.addVals[2]];

        var data = {};
        data.orderid = oid;        //订单id
        data.type = invoiceType;        //发票类型,1-纸质发票
        data.lookup = lookup;         //发票抬头(1-个人，2-单位)
        data.headcontent = headInfo;    //抬头内容
        data.content = contentText;     //发票内容
        data.receiver = name;       //收货人
        data.mobile = phone;       //手机号码
        data.provinceid = province.id;      //省id
        data.cityid = city.id;      //城市id
        data.countyid = county.id;       //区id
        data.detailaddress = addressDetail;   //详细地址
        console.log(data);

        app.POSTRequest("weixin/mall/invoice/saveInvoice.do", {
            data: data,
            success: function(data){
                isSubmit = false;
                console.log(data);
                if(data.resultCode == '1'){
                    dialog.alert({
                        title:"提示",
                        msg: "提交成功，我们会尽快将发票邮寄给您",
                        buttons:['确定']
                    },function (ret) {
                        if(ret.buttonIndex == 1){
                            app.replace("applyInvoice.html?oid="+oid+"&otype="+otype);
                        }
                    });
                } else {
                    app.tipInfo(data.resultMsg);
                }
            },
            error: function () {
                isSubmit = false;
            }
        });
    }
    
    
    function initEvent() {
        $(".headType").on("click",function () {
            if($(this).find(".checkBtn").hasClass("active")){
                return;
            }
            if($(this).index() == 0){
                $(".headInfo").attr("placeholder","请填写单位名称")
            } else {
                $(".headInfo").attr("placeholder","请填写您的姓名");
            }
            $(".headType .checkBtn").removeClass("active");
            $(this).find(".checkBtn").addClass("active");
        });
    }

    app.showNote = function () {
        $(".note").show();
    };

    app.hideNote = function () {
        $(".note").hide();
    };

    return app;
});
