define(["./base/baseApp","./base/rights"], function(app,rights) {

    var lectureid = app.UrlParams.lectureid;
    var rightstype = app.UrlParams.rightstype;
    var dialog = new auiDialog({});
    var userLevel = 1;

    var black_c = "<div class='top-black'><img src='../imgs/rights/cover.png' /></div>";
	app.init = function(){
        if(!app.checkLogin()) {
            app.toLoginPage(location.href);
        }
		if(lectureid){
            confirmAttend();
		}
		if(rightstype){
            confirmRight();
        }
		app.getUser(initUser,function(){
		});
        initEvent();
	}

	// 初始化用户
	function initUser(data) {
        console.log(data);
        if(!data){
        	return;
		}
        userLevel = data.level;
        showHead(data);
        rights.queryRightLog(rendar);
	}

	// 显示头部
	function showHead(data) {
        $(".user_card").text(data.levelName);
        $(".top_img").show();
        var arr1 = data.experience;
        if(data.avatar) {
            $("#hit").attr("src", app.getImgPath(data.avatar).replace("/image/", ""));
        } else {
            $("#hit").attr("src", "../imgs/xq-images/photo.png");
        }
        if(arr1 >= 0 && arr1 < 188){
            var str = 188 - arr1;
            $("#consume").text(str);
            $("#changeLeave").text("铜卡");
        }else if(arr1 >=188 && arr1< 1888){
            var str1 = 1888 - arr1;
            $("#consume").text(str1);
            $("#changeLeave").text("银卡");
        }else if(arr1 >=1888 && arr1< 3999){
            var str2 = 3999 - arr1;
            $("#consume").text(str2);
            $("#changeLeave").text("金卡");
        }else if(arr1 >=3999 && arr1< 7666){
            var str3 = 7666 - arr1;
            $("#consume").text(str3);
            $("#changeLeave").text("白金卡");
        }else if(arr1 >=7666 && arr1< 14888){
            var str4 = 14888 - arr1;
            $("#consume").text(str4);
            $("#changeLeave").text("钻石卡");
        }else{
            $(".change_leave").text("钻石卡会员可尊享9大权益，千万不要错过哦~");
        }
    }

    // 查询用户权益日志
    function rendar(rightlog){
		console.log(rightlog);
        ys(rightlog);
        sr(rightlog);
        pt();
        fh(rightlog);
        bx(rightlog);
        dj(rightlog);
        cx(rightlog);
        jd(rightlog);
        zzj(rightlog);
	}

	//养生
	function ys(rightlog){
    	if(!rightlog.totallecturenum){
			$("#ys_get_btn").text("升级立享");
			$("#ys_li").append($(black_c));
		} else if(!rightlog.surpluslecturenum){
            $("#ys_get_btn").text("已领取");
            $("#ys_li").append($(black_c));
            $("#ys_detail").text("恭喜您，您已参加完！");
		} else {
            app.POSTRequest('/weixin/mall/lectureuser/lecture.do' , {
                data : {
                    loginedtoken:localStorage.loginedToken
                },
                success:function(data){
                    console.log(data);
                    if(data.resultCode == 1){
                        if(data.resultObj == null){
                            $("#ys_detail").text("本次讲座已结束，下次再来吧！");
                            $("#ys_li").append($(black_c));
                        }else if(data.resultObj.signup == 2){
                            $("#ys_get_btn").text("已领取");
                            $("#ys_detail").text("您可以参加"+rightlog.totallecturenum+"次讲座，还剩"+rightlog.surpluslecturenum+"次");
                            $("#ys_li").append($(black_c));
                        }else if(data.resultObj.signup == 1){
                            $("#ys_get_btn").text("立即领取");
                            $("#ys_detail").text("您可以参加"+rightlog.totallecturenum+"次讲座，还剩"+rightlog.surpluslecturenum+"次");
                        }
                    }else {
                        app.tipInfo(data.resultMsg);
                    }
                }
            });
		}
	}

	//生日
	function sr(rightlog){
		// 铜卡会员以下
        if(userLevel < 2){
            $("#sr_get_btn").text("升级立享");
            $("#sr_li").append($(black_c));
		} else if( 'N' == rightlog.birthdaygift){
            $("#sr_get_btn").text("已领取");
            $("#sr_li").append($(black_c));
		} else if(rightlog.birthdaygift == 'Y'){
            $("#sr_get_btn").text("已收货");
            $("#sr_li").append($(black_c));
        } else {
            $("#sr_get_btn").text("立即领取");
		}
	}

	//跑腿
	function pt() {
        if(userLevel < 2){
            $("#pt_get_btn").text("升级立享");
            $("#pt_li").append($(black_c));
        } else {
            $("#pt_get_btn").text("查看");
		}
    }

    //反悔
    function fh(rightlog) {
        if(userLevel < 3){
            $("#fh_get_btn").text("升级立享");
            $("#fh_li").append($(black_c));
        } else {
            $("#fh_get_btn").text("查看");
        }
    }
    
    //保险
    function bx(rightlog) {
        if(userLevel < 3){
            $("#bx_get_btn").text("升级立享");
            $("#bx_li").append($(black_c));
        } else {
            if(rightlog.insurance > "0"){
                $("#bx_get_btn").text("立即领取");
            } else {
                $("#bx_get_btn").text("已领取");
                $("#bx_li").append($(black_c));
            }
        }
    }

    //度假-亲子游
    function dj(rightlog) {
        if(userLevel < 4){
            $("#dj_get_btn").text("升级立享");
            $("#dj_li").append($(black_c));
        } else {
            if(rightlog.surplustourism && rightlog.surplustourism > 0){
                $("#dj_get_btn").text("立即领取");
            } else {
                $("#dj_get_btn").text("已领取");
                $("#dj_li").append($(black_c));
            }
        }
    }

    //尝鲜
    function cx(rightlog) {
        $("#cx_get_btn").text("敬请期待");
        $("#cx_li").append($(black_c));
    }

    // 酒店
    function jd(rightlog){
        $("#jd_get_btn").text("敬请期待");
        $("#jd_li").append($(black_c));
	}

	// 种植机
	function zzj(rightlog) {
        if(userLevel < 6){
			$("#zzj_get_btn").text("升级立享");
			$("#zzj_li").append($(black_c));
		} else {
            if(rightlog.surplusplanter && rightlog.surplusplanter > 0){
                $("#zzj_get_btn").text("立即领取");
            } else {
                $("#zzj_get_btn").text("已领取");
                $("#zzj_li").append($(black_c));
            }
		}
    }

    // 签到
    function confirmAttend(){
        dialog.alert({
            title:"确认",
            msg:'是否确定参加本次讲座？',
            buttons:['取消','确定']
        },function(ret){
            if(ret && ret.buttonIndex == 2){
                attend();
            }
        });
    };

    function confirmRight(){
        if(rightstype != '4'){
            return;
        }
        var msg = "";
        if(rightstype == '4'){
            msg = "是否确定参加本次亲子一日游？"
        }
        dialog.alert({
            title:"确认",
            msg:msg,
            buttons:['取消','确定']
        },function(ret){
            if(ret && ret.buttonIndex == 2){
                attendRight();
            }
        });
    };
    
    function attendRight() {
        rights.updateDimensional(rightstype,function (data) {
            console.log(data);
            if(!data || !data.resultCode){
                alertMsg('签到失败！');
            }
            if(data.resultCode == 1){
                alertMsg('签到成功！');
            } else {
                alertMsg(data.resultMsg);
            }
        });
    }

    //确认签到
    function attend(){
        app.POSTRequest('/weixin/mall/lectureuser/attend.do' , {
            data : {
                lectureid:lectureid
            },
            success:function(data){
                console.log(data);
                if(!data || !data.resultCode){
                    alertMsg('签到失败！');
                }
                if(data.resultCode == 1){
                    alertMsg('签到成功！');
                } else {
                    alertMsg(data.resultMsg);
                }
            }
        });
    }

    function alertMsg(msg){
        setTimeout(function () {
			dialog.alert({
				title:"提示",
				msg: msg,
				buttons:['确定']
			},function(ret){
				app.replace("interest.html");
			});
        },500);
	}

	function initEvent(){
        $("#ys_li").on("click",function () {
			app.href("details.html");
        });
        $("#sr_li").on("click",function () {
            app.href("right_birthday.html");
        });
        $("#pt_li").on("click",function () {
            app.href("right_secretary.html");
        });
        $("#fh_li").on("click",function () {
            app.href("right_goback.html");
        });
        $("#bx_li").on("click",function () {
            app.href("right_insurance.html");
        });
        $("#dj_li").on("click",function () {
            app.href("right_tourism.html");
        });
        $("#cx_li").on("click",function () {
            //app.href("right_early.html");
        });
        $("#jd_li").on("click",function () {
            //app.href("right_hotel.html");
        });
        $("#zzj_li").on("click",function () {
            app.href("right_machine.html");
        });
	}

	return app;
})
