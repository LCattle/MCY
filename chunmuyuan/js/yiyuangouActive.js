//购物车
define(["base/baseApp", "./base/baseCar"], function(app, car) {
    
    app.init = function() {
    	if(!app.checkLogin()) {
	    	localStorage.loginBackUrl = "yiyuangou.html";
			app.toLoginPage(localStorage.loginBackUrl);
		}
	};
    app.toBuying = function(){
    	app.POSTRequest("/weixin/mall/activity/takeActivity.do" , {
			data : {
				loginedtoken:localStorage.loginedToken
			},
			success: function(data) {
				console.log(data);
                if(data.resultCode == "1"){
                	var name = data.resultObj
                	app.setLocalObjet("purchasedata", name);
                	if(app.checkLogin()){
			            app.replace("../html/purchaseOrder.html?type=" + 9);
			        }else{
			            app.toLoginPage(location.href);
			        }
                }else if(data.resultCode == "-10"){
                	var dialog = new auiDialog();
					dialog.alert({
						title:"温馨提示",
						msg: data.resultMsg,
						buttons:["确定"]
					},function(ret){
						if(ret.buttonIndex == 1) {
							app.replace("../html/orderList.html");
			            }
					});      
                }else{
                	var dialog = new auiDialog();
					dialog.alert({
						title:"温馨提示",
						msg: data.resultMsg,
						buttons:["确定"]
					},function(ret){
						if(ret.buttonIndex == 1) {
				            app.replace("../index.html");
			            }
					});         
                }
            }
		})
    	
    }
	
	return app;
});