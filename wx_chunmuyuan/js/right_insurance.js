define(["./base/baseApp","./base/rights"], function(app,rights) {
    var userLevel = 1;

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
        var money = '';
        if(userLevel == 3){
            money = '_10';
        } else if(userLevel == 4){
            money = '_30';
        } else if(userLevel == 5){
            money = '_50';
        } else if(userLevel == 6){
            money = '_100';
        }
        $(".head_img img").attr("src"," ../imgs/rights/bhs"+money+".png");
        $(".head_img img").css("display", "");
        _init(userLevel);
    }

    //初始化
    function _init(userLevel) {
        if(userLevel < 3){
            return;
        } else {
            rights.queryRightLog(render);
            rights.queryMemberRightList(3,renderDetail);
        }
    }
    
    function render(rightLog) {
        console.log(rightLog);
        if(rightLog.insurance > "0"){
            $("#get_form form").show();
            initEvent();
        }
    }

    function renderDetail(data){
        var temp = app.getTempBySelector("#detailItem");
        $("#details .detail-ul").empty();
        if(data.length > 0){
            $.each(data, function (i, item) {
                var tempData = {};
                tempData.receivepeople = "";
                for (var i = 0,iLength = item.receivepeople.length;i< iLength;i ++) {
                    if(i == 0){
                        tempData.receivepeople += item.receivepeople.charAt(i);
                    } else {
                        tempData.receivepeople += "*";
                    }
                }
                tempData.cardid = "";
                for(var i = 0,iLength = item.cardid.length;i< iLength;i ++){
                    if(i < 6 || i> iLength-3) {
                        tempData.cardid += item.cardid.charAt(i);
                    } else {
                        tempData.cardid += "*";
                    }
                }
                if(!item.goodsreceipttime){
                    tempData.goodsreceipttime = "待确定";
                } else {
                    tempData.goodsreceipttime = rights.dateFormat(item.goodsreceipttime);
                }
                tempData.isuse = item.isuse;
                $("#details .detail-ul").append(temp(tempData));
            });
            $("#details").show();
        }
    }
    
    function initEvent() {
        $(".submit_btn").on("click",function () {
            var advisername = $("#advisername").val().trim();
            if(!advisername){
                app.tipInfo("申请人姓名不能为空");
                return;
            }
            var cardid = $("#cardid").val().trim();
            if(!cardid){
                app.tipInfo("申请人身份证号不能为空");
                return;
            }
            var occupation = $("#occupation").val().trim();
            if(!occupation){
                app.tipInfo("申请人职业不能为空");
                return;
            }
            app.POSTRequest('/weixin/mall/memberrights/insurance.do' , {
                data : {
                    loginedtoken:localStorage.loginedToken,
                    receivepeople:advisername,
                    occupation: occupation,
                    cardid:cardid
                },
                success:function(data){
                    console.log(data);
                    if(data.resultCode=='1'){
                        $(".my_dialog").css("display","block");
                    }else{
                        app.tipInfo(data.resultMsg);
                    }
                }
            });
        });

        $(".my_dialog .get_btn").on("click",function () {
            app.replace("right_insurance.html");
        });

        $("#cardid").on("keyup",function () {
            var cardid = $("#cardid").val().trim();
            if(cardid.length > 18){
                cardid = cardid.substring(0,18);
            }
            $("#cardid").val(cardid);
        });
    }

    return app;
});
