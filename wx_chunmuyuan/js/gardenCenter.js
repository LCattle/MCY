define(["base/baseApp", "base/wxconfig","../lib/exif-js/exif", "clipImg"], function(app,wx) {

    console.log(EXIF);

    var type = app.UrlParams.type;
    var code = app.UrlParams.code;
    var tyFile = "";

    var mySeed = "";

    var seedNameArry = {
        "xbc":"小白菜",
        "ymc":"油麦菜",
        "boc":"菠菜"
    };

    var body_width = $('body').width();
    var body_height = $('body').height();

    app.init = function () {
        // 判断登录
        if(!app.checkLogin()){
            app.toLoginPage(location.href,true);
        }
        wx.getJS_SDK();

        initEvent();

        app.loadData(true);
        
        $(".strategy").click(function(){
        	$(".strategyPic").show();
        	$(".mark").show();
        })
        $(".strategyPic").click(function(){
        	$(".strategyPic").hide();
        })
    };


    // 弹出领取框
    app.popGet = function () {
        app.POSTRequest("weixin/mall/memberinteractive/isSeedNumber.do",{
            data:{
                seednumber:code
            },
            success: function(data) {
                if(data && data.resultCode == "1"){
                    $(".my_dialog").show();
                    $(".my_tip_get").show();
                } else {
                    $(".my_dialog").show();
                    $(".fail_tip").show();
                    $(".fail_info").text(data.resultMsg);
                }
            }
        });
    };

    // 查询我的种子
    app.loadData = function (first) {
        app.POSTRequest("weixin/mall/memberinteractive/isUserSeedNumber.do",{
            success: function(data) {
                console.log(data);
                if(data && data.resultCode == "1"){
                    app.addList(data.resultObj);
                } else if(data && data.resultCode == "2"){
                    app.addList([]);
                    if(first && type && code){
                        app.popGet();
                    }
                } else {
                    app.tipInfo(data.resultMsg);
                }
            }
        });
    };

    // 渲染种子
    app.addList = function (list) {
        if(!list || list.length == 0){
            $(".have_zz").hide();
            $(".no_zz").show();
            return;
        }
        mySeed = list[0];
        $("#seedname").text(mySeed.seedname);
        $(".ty_img").attr("src",app.getImgPath(mySeed.seedpic).replace("/image/",""));

        $(".no_zz").hide();
        $(".have_zz").show();
    };

    // 扫码
    function initEvent() {
        $("#clipbox .clip").photoClip({
            width: body_width * 0.8125,
            height: body_width * 0.8125,
            file: "#file",
            ok: "#clipBtn",
            loadStart: function() {
                app.loading("图片加载中...");
            },
            loadComplete: function() {
                app.hideLoading();
                $("#clipbox").show();
            },
            loadError:function(){
                app.hideLoading();
            },
            clipFinish: function(dataURL) {//当图片剪切完成
                app.POSTRequest("weixin/mall/memberinteractive/uploadModifyAvatar.do",{
                    data:{
                        file:dataURL.split(",")[1],
                        biz:0//图片类型为用户头像
                    },
                    loading:"正在上传...",
                    success:function(data){
                        console.log(data);
                        if(data.resultCode==1){
                            tyFile = data.resultObj;
                            $('.upload_img').html($("<img />").attr('src', dataURL).css({width:"100%",height:"100%"}));
                        }else{
                            data.tipInfo(data.resultMsg);
                        }
                    }
                });
                $("#clipbox").hide();
            }
        });

        $("#clipCancel").on("click",function () {
            $("#clipbox").hide();
        });

        $(".scan").on("click",function () {
            wx.getWxObj().scanQRCode({
                needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
                success: function(res) {
                    var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
                    var _index = result.indexOf("?");
                    if(_index != -1){
                        var str = result.substr(_index);
                        var param = app.getUrlParams(str);
                        type = param.type;
                        code = param.code;

                        if(type && code){
                            app.popGet();
                        }
                    }

                }
            });
        });

        $(".get_btn").on("click",function () {
            bind();
        });

        $(".fail_btn").on("click",function () {
            $(".my_dialog").hide();
            $(".fail_tip").hide();
        });

        $(".confirm_btn").on("click",function () {
            $(".my_dialog").hide();
            $(".my_tip").hide();
        });

        $(".upload_img").on("click",function () {
            $("#file").click();
        });
        
        $(".ty").on("click",function () {
            if(mySeed){
                app.href("myVeg.html?id="+mySeed.id)
            }
        });
    }

    // 领取种子
    function bind() {
        var data = {};
        data.type = type;
        data.seednumber = code;
        data.seedpic = tyFile;
        data.userseedname = $("#mySign").val();
        data.seedname = seedNameArry[type];
        if(!type || !code){
            app.tipInfo("没有种子")
            return;
        }
        if(!tyFile){
            app.tipInfo("请上传图片")
            return;
        }
        if(!data.seedname){
            app.tipInfo("种子不存在")
            return;
        }
        if(!data.userseedname){
            app.tipInfo("请签名")
            return;
        }
        app.POSTRequest("weixin/mall/memberinteractive/insertSeedNumber.do",{
            data:data,
            loading:"加载中...",
            success:function(data){
                if(data.resultCode==1){
                    $(".my_tip_get").hide();
                    $(".my_tip").show();
                    app.loadData();
                }else{
                    app.tipInfo(data.resultMsg);
                    $(".my_tip_get").hide();
                    $(".fail_info").text(data.resultMsg);
                    $(".fail_tip").show();
                }
            },
            error:function () {
                $(".my_tip_get").hide();
                $(".my_dialog").hide();
            }
        });
    }

    return app;
});