define(["base/baseApp"], function(app) {
	
	
	function activete(pwd){
		app.POSTRequest("weixin/mall/card/activateByPWD.do", {
			data: {
				loginedtoken: localStorage.loginedToken,
				password: pwd
			},
			loading: "校验中...",
			success: function(data) {
				if(data.resultCode == 1) {
					var finalObj = data.resultObj;
					if(data.resultObj.iscard == "Y"){
						app.href("rechargeSuccess.html?money=" + finalObj.integral+"&growUp=" + finalObj.integral);
					}else if(data.resultObj.iscard == "N"){
						app.href("../html/giftOrder.html?type=2"+"&skuid="+finalObj.skuid+"&cardid="+finalObj.cardid)
					}
					
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}
	
	//	输入4个多一个空格
    $('#pwdInput').on('keyup',function(e){
    	var pos = this.selectionStart;
        var $this = $(this),
            v = $this.val();
        //v = v.replace(v.replace(/([^A-Za-z0-9])/g,'');
       	var temp = "";
       	if(e.keyCode == 8 && pos%5 == 4){
       		temp = v.substring(0,pos-1) + v.substring(pos,v.length);
       		v = temp;
       		--pos;
       	}
       	v = v.replace(/[^A-Za-z0-9]/g,'');
       	v = v.replace(/([A-Za-z0-9]{4})(?=[A-Za-z0-9])/g,"$1 ");
       	$this.val(v);
       	if (e.keyCode == 8 || e.keyCode == 46) {
       		this.setSelectionRange(pos,pos);
       	}
    });
	
	//点击提交
	app.submit = function() {
		
		var pwd= $("#pwdInput").val().toString().replace(/\s/g,'');
		if(pwd.length < 10){
			app.tipInfo("请输入正确的密码");
			return;
		}else if(pwd.length > 16){
			app.tipInfo("请输入正确的密码");
			return;
		}else{
			activete(pwd);
		}
		
		

	};
	
	
	
	app.init = function() {
        if(!app.checkLogin()){
            app.toLoginPage(location.href,false);
            return;
        }
		var height=$(window).height()
		$("html").css("height",height)
	};
	
	
		return app;
});