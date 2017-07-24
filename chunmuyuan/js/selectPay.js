//选择支付方式-充值卡 //充值金额
define(["base/baseApp", "./base/order"], function(app, Order) {
	app.initPage = function() {};
	//开始执行
	app.init = function() {
		$("#wx-pay").trigger("click");
	};
	var payway = 10;
	app.clickCk = function(e, pw) { //10/50
		$(".checkBtn.active").removeClass("active");
		$(e).find(".checkBtn").addClass("active");
		payway = pw;
		if(pw==10&&app.UrlParams.money>10000){
			$("#wxTip").show();
		}else{
			$("#wxTip").hide();
		}
	}
    // 缓存中获取员工信息
    function getEmployeeno(){
        var currDate = new Date();
        var time = currDate.getTime();
        var currEmployee = app.getLocalObject("cmy_employee");
        if(!currEmployee){
            return "";
        }
        if(time > currEmployee.time){
            localStorage.removeItem("cmy_employee");
            return;
        }
        return currEmployee.employeeno;
    }

	app.next = function() {
		if(payway) {  //10/50
			if(app.UrlParams.replay==99){
				var data = {
	                loginedtoken:localStorage.loginedToken,
	                money:app.UrlParams.money,
	                couponId:app.UrlParams.couponId,
	                payway: Order.paywayMap[payway],
	                mobile: app.UrlParams.mobile,
	                staffNo:app.UrlParams.staffNo?app.UrlParams.staffNo:'',
	                giveamount:app.UrlParams.giveamount
	          };
	                   // 准备员工工号
	            var employeeno = getEmployeeno();
	            console.log(employeeno)
	            if(employeeno){
	                data.employeeno = employeeno;
	            }
	
				Order.submitOrder(data,99, function(order) {
	                console.log(data);
	                var oid = order.id;
					var ono = order.orderno;
					var money = order.actualpaied;
					var type = order.type;
					var virtualfee = order.virtualfee/1000;
					var replay=app.UrlParams.replay;
					var growUp=order.sprices;
					var giveamount = order.giveamount;
					location.href = "../html/confirmpay.html?type=" +
						type + "&money=" + money + "&ono=" +
						ono + "&oid=" + oid + "&payway=" + payway+ "&growUp=" + growUp+"&virtualfee="+virtualfee+"&replay="+replay+"&giveamount="+giveamount;
				});
			}else{
				var data = {
	                loginedtoken:localStorage.loginedToken,
	                money:app.UrlParams.money,
	                couponId:app.UrlParams.couponId,
	                payway: Order.paywayMap[payway],
	                staffNo:app.UrlParams.staffNo?app.UrlParams.staffNo:'',
	                giveamount:app.UrlParams.giveamount
	            };
	            // 准备员工工号
	            var employeeno = getEmployeeno();
	            if(employeeno){
	                data.employeeno = employeeno;
	            }
				Order.submitOrder(data, 5, function(order) {
	                console.log(data);
	                var oid = order.id;
					var ono = order.orderno;
					var money = order.actualpaied;
					var type = order.type;
					var virtualfee = order.virtualfee/1000;
					var giveamount = order.giveamount;
					location.href = "../html/confirmpay.html?type=" +
						type + "&money=" + money + "&ono=" +
						ono + "&oid=" + oid + "&payway=" + payway+"&virtualfee="+virtualfee+"&giveamount="+giveamount;
				});
			}
		} else {
			app.tipInfo("请选择支付方式");
		}
		
	}
	return app;
});