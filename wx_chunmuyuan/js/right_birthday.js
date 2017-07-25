define(["./base/baseApp","./base/rights","base/timeselect"], function(app, rights, timeselect) {

    var userLevel = 1;
    var dialog = new auiDialog({});

    var birthdayPicker = timeselect.create();

    birthdayPicker.initPicker("请维护生日信息",saveBirthday);

    /**
     * 保存生日
     */
    function saveBirthday(daytime) {
        app.POSTRequest_m("member/usersinfo/updateBrithday.do",{
            data:{
                birthday:daytime
            },
            success:function (result) {
                if(result.resultCode == '1'){
                    app.tipInfo("保存成功");
                } else {
                    app.tipInfo(result.resultMsg);
                }
            }
        });
    }

    function _alert(msg) {
        dialog.alert({
            title:"确认",
            msg:msg,
            buttons:['确定']
        });
    }
    function _confirm(msg,callback) {
        dialog.alert({
            title:"确认",
            msg:msg,
            buttons:['取消','确定']
        },
        function(ret){
            callback(ret);
        });
    }
    app.init = function () {
        app.getUser(initUser,function(){
        });
    };

    // 初始化用户
    function initUser(data) {
        if(!data){
            return;
        }
        userLevel = data.level;
        _init(userLevel);
    }
    
    //初始化
    function _init(userLevel) {
        if(userLevel < 2){
            $(".get_btn_row .get_btn").hide();
        } else {
            rights.queryRightLog(render);
        }
    }
    
    function render(rightLog) {
        if('N' == rightLog.birthdaygift){
            $(".get_btn_row .get_btn").css("background-image","url('../imgs/rights/ylq.png')");
        } else if ('Y' == rightLog.birthdaygift){
            $(".get_btn_row .get_btn").css("background-image","url('../imgs/rights/ysh.png')");
        } else {
            $(".get_btn_row .get_btn").css("background-image","url('../imgs/rights/ljlq.png')");
            initEvent();
        }
        $(".get_btn_row .get_btn").show();
    }
    
    function initEvent() {
        $(".get_btn_row .get_btn").on("click",function () {
            app.POSTRequest('/weixin/mall/memberrights/queryRightLog.do' , {
                data : {
                    loginedtoken:localStorage.loginedToken
                },
                success:function(data){
                    if(data.resultCode=='1'){
                        $(".my_dialog").css("display","block");
                    } else if(data.resultCode=='2'){
                        birthdayPicker.picker.show();
                    } else if(data.resultCode=='3'){
                        _alert("您的生日不在本月");
                    } else if(data.resultCode=='4'){
                        _alert("您今年的生日礼物已领取");
                    } else if(data.resultCode=='5'){
                        _alert("您的会员等级，不能领取生日礼物");
                    } else {
                        app.tipInfo(data.resultMsg);
                    }
                }
            });
        });
        
        $(".my_dialog .get_btn").on("click",function () {
            $(".get_btn_row .get_btn").css("background-image","url('../imgs/rights/ylq.png')");
            $(".get_btn_row .get_btn").off("click");
            $(".my_dialog").css("display","none");
        });
    }

    return app;
});
