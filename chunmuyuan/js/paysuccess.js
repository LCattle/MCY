//支付成功
define(["base/baseApp", "./base/order"], function(app, Order) {
	app.getStartFee();
	app.initPage = function() {};
	app.toOrder = function() {
		location.href = "../html/orderDetails.html?oid=" + app.UrlParams.oid;
	};
	//开始执行
	app.init = function() {
		loadOrder();
		if(app.UrlParams.isCoupon == 'Y'){
			$("#vegetableBook").show();
			$(".vegetableBook").on("touchmove",function(e){
				app.stopBubble(e);
				e.preventDefault();
			});
			$("#vegetableBook").bind("click",function(){
				$("#vegetableBook").hide();
			})
		}
	};
	/**
	 * 检查有没有送种子
	 */
	function checkSeed(no) {
		app.POSTRequest("weixin/mall/meseed/budgetOrderSeed.do", {
			data: {
				orderno: no
			},
			success: function(data) {
				if(data.resultCode == 1) {
					$("body").append("<div class='dlg_bg'></div>")
					$("#seedsBox").click(function() {
						$(".dlg_bg").remove();
						$("#seedsBox").css({
							"visibility": "hidden"
						});
					})
					$("#seedsBox .title,.seedList").click(function(e) {
						app.stopBubble(e);
					})
					$(".dlgClose").click(function(e) {
						app.stopBubble(e);
						$(".dlg_bg").remove();
						$("#seedsBox").css({
							"visibility": "hidden"
						});
					})
					$("#seedsBox").css({
						"visibility": "visible"
					});
				}
			}
		})

	}
	//加载订单
	function loadOrder() {
		var Token = app.getLocalObject("loginedToken");
		Order.getOrder(app.UrlParams.oid, function(order) {
			console.log(order);
			loadUser(order);
			checkSeed(order.orderno);
			if(order.type == 8) {
				$("#infos_li").hide();
			}
			if((order.orderno).substring(0,2) == 'YX'){
				$("#integrate").parent().hide();
				$("#vipFare").parent().css("padding-top","0.4rem");
			}
			$("#logisticsbox .app-text-orange").html(app.getPriceStr(0));
			if((order.type == 9 || order.type == 1 || order.type == 2 || order.type == 3 || order.type == 10) && (order.message != "")) {
				$("#remark").show();
				$(".kobe").text("备注： " + order.message);
			}
			if(order.type == 1 || order.type == 2) {
				app.carriage = 0.00;
				$.each(order.items,function(i,item){
					app.carriage += (item.sellprice*1)*(item.amount*1);
				})
				var freightagefee = order.freightagefee*1;
				var actualpaied = order.actualpaied*1;
				$("#vipFare").text('¥' + (app.carriage+freightagefee-actualpaied).toFixed(2));
				$(".imgBox img").attr("src","../imgs/xq-images/zxc.png");
				$("#growUp").text("积分");
				$(".again").text("再去逛逛");
				if(app.UrlParams.reduce && (app.UrlParams.reduce != 0)) {
					$("#freebox").show();
					$("#actualbox").show();
					$(".freedom").text(app.UrlParams.reduce + 'kg');
					$(".freeactual").text(((app.UrlParams.virtualfee - parseFloat(app.UrlParams.reduce))).toFixed(2) + 'kg');
				} else if(order.reducePound != 0) {
					$("#freebox").show();
					$("#actualbox").show();
					$(".freedom").text(order.reducePound / 1000 + 'kg');
					$(".freeactual").text(((order.virtualfee - order.reducePound) / 1000).toFixed(2) + 'kg');
				}
				if(order.type == 9) {
					$("#integrate").parent().hide();
				} else if(order.closepayid) {//亲密付ID
					$("#integrate").text(0);
				} else {
					app.POSTRequest("weixin/mall/order/obtailValue.do", {
						data: {
							loginedtoken: Token,
							orderType: order.type
						},
						success: function(data) {
							if(data.resultCode == 1) {
								$("#integrate").text(Math.floor(data.resultObj));
							} else {
								app.tipInfo(data.resultMsg);
							}
						}
					});
				}
				if(app.UrlParams.deliverymode == 30) {
					if(app.UrlParams.modify == 1) {
						showAddress(order);
						$("#paystatus").append("<h2 class='app-text-orange' style='display:inline'>订单修改成功!<span></h2>待自提~");
						showVarval(order.modifyfee);
						if(order.modifyfee > 0) {
							$(".disappear").show();
						}
					} else {
						showAddress(order);
						$("#paystatus").append("<h2 class='app-text-orange' style='display:inline'>您已支付成功!<span></h2>待自提~");
                                                showVarval(order);//显示会员折扣
						showPreferential(order);
                                                showFare(order.freightagefee);//运费
						$(".disappear").show();
						$("#vipFavourable").show();//会员折扣价
                                                showVegetable(order);//蔬菜券
					}
				} else {
					if(app.UrlParams.modify == 1) {
						showAddress(order);
						$("#paystatus").append("<h2 class='app-text-orange' style='display:inline'>订单修改成功!<span></h2>待发货~");
						showVarval(order.modifyfee);
						if(order.modifyfee > 0) {
							$(".disappear").show();
						}
					} else {
						showAddress(order);
						$("#paystatus").append("<h2 class='app-text-orange' style='display:inline'>您已支付成功!<span></h2>待发货~");
			                        showVarval(order);
			                        showPreferential(order);
			                        showFare(order.freightagefee);//运费
			                        $(".disappear").show();
			                        $("#vipFavourable").show();//会员折扣价
                                                showVegetable(order);//蔬菜券
					}
				}
			} else if(order.type == app.ORDER_TYPE_ENTITY_CARD ||
				order.type == app.ORDER_TYPE_ELECTRONIC_CARD) { //实体卡和电子卡
				app.carriage = 0.00;
				$(".imgBox img").attr("src","../imgs/xq-images/dzk.png");
				$("#number").html(app.getPriceStr(order.sprices));
				$("#priceLable").text("商品金额：");
				$(".goodsIetm").height("12.5rem");
				$.each(order.items,function(i,item){
					app.carriage += (item.sellprice*1)*(item.amount*1)
				})
				$("#vipCount").text('¥' + (app.carriage).toFixed(2));
				var deposit = order.deposit;
				if(deposit && deposit > 0) { //有定金券，并且大于0
					$("#depositbox").show();
					$("#depositbox .app-text-orange").html("-" + app.getPriceStr(deposit));
				} else {
					deposit = 0;
				}
				var couponfee = order.couponfee;
				if(couponfee && couponfee > 0) { //有定金券，并且大于0
					$("#couponbox").show();
					$("#coupon").html("-" + app.getPriceStr(couponfee));
				}
				$("#paystatus").css("border-bottom", "none");
				if(order.payway == "30") { //货到付款显示提示
					$("#shsmbox").show();
					$("#paystatus").html("待发货");
				} else {
					$("#paystatus").append("<h2 class='app-text-orange' style='display:inline'>您已支付成功!<span></h2>待发货~");
				}

				if(order.payway == "90") {
                    $("#applePayUnion").show();
				}

				if(order.type == app.ORDER_TYPE_ELECTRONIC_CARD) { //电子卡
					$("#dzktsbox").show();
					$("#paystatus").html("您的订单已经完成");
				} else { //实体卡显示地址
					showcardAddress(order);
				}
				$("#totalbox").show();
				$("#payAmount").html(app.getPriceStr(order.actualpaied));
				$("#totalbox .app-text-orange").html(app.getPriceStr(order.actualpaied));
			} else if(order.type == 8)  {
                $(".imgBox img").attr("src","../imgs/chongz/czk.png");
                $(".goodsIetm").height("10.5rem");
                $("#paystatus").append("<h2 class='app-text-orange' style='display:inline'>您已支付成功!<span></h2>");
                $("#orderPhone").show();
                $("#number").html(app.getPriceStr(order.sprices));
                $("#priceLable").text("商品金额：");
                $("#totalbox .app-text-orange").html(app.getPriceStr(order.actualpaied));
                $("#totalbox").show();
                $("#vipCount").text('¥' + (app.carriage).toFixed(2));
			} else if(order.type == 10) {//种植机
				$(".imgBox img").attr("src","../imgs/xq-images/dzk.png");
                $(".goodsIetm").height("11.5rem");
                $("#paystatus").append("<h2 class='app-text-orange' style='display:inline'>您已支付成功!</h2>待发货~ <br/>您的专属顾问将联系您为您送货上门");
                $("#number").html(app.getPriceStr(order.sprices));
                $("#priceLable").text("商品金额：");
                $("#totalbox .app-text-orange").html(app.getPriceStr(order.actualpaied));
                $("#totalbox").show();
                app.carriage = 0;
                $.each(order.items,function(i,item){
					app.carriage += (item.sellprice*1)*(item.amount*1)
				})
				$("#vipCount").html(app.getPriceStr(app.carriage));
                showzzAddress(order);
			}
		});
	}

	//显示自选菜和宅配地址
	function showAddress(order) {
		console.log(order);
		var oaddModel = order.oaddModel;
		//var str = targetdeliverydate.split(" ");
		var infos = "收货人：" + oaddModel.consignee;
		infos += "<br>手机号码：" + oaddModel.mobile;
		infos += "<br>配送日期: " + order.dateWeek;
		infos += "<br>地区：" + oaddModel.provincename + " " + oaddModel.cityname + " " + oaddModel.countyname;
		infos += "<br>详细地址：" + oaddModel.detailaddress;
		$("#infos").html(infos);
	}
	//种植机显示
	function showzzAddress(order) {
		var oaddModel = order.oaddModel;
		//var str = targetdeliverydate.split(" ");
		var infos = "收货人：" + oaddModel.consignee;
		infos += "<br>手机号码：" + oaddModel.mobile;
		infos += "<br>地区：" + oaddModel.provincename + " " + oaddModel.cityname + " " + oaddModel.countyname;
		infos += "<br>详细地址：" + oaddModel.detailaddress;
		$("#infos").html(infos);
	}
	//显示买卡的地址
	function showcardAddress(order) {
		var oaddModel = order.oaddModel;
		var targetdeliverydate = order.targetdeliverydate;
		var str = targetdeliverydate.split(" ");
		var infos = "收货人：" + oaddModel.consignee;
		infos += "<br>手机号码：" + oaddModel.mobile;
		infos += "<br>地区：" + oaddModel.provincename + " " + oaddModel.cityname + " " + oaddModel.countyname;
		infos += "<br>详细地址：" + oaddModel.detailaddress;
		$("#infos").html(infos);
	}
	//显示折扣价
	function showVarval(num) {
		var productMemberPrice = 0.00;
		$.each(num.items, function(i,item) {
			productMemberPrice = productMemberPrice+(item.actualpaied*item.amount);
		});
		$("#priceLable").text("会员折扣价：");
		$("#number").text('¥' + productMemberPrice.toFixed(2));
	}
    //显示蔬菜券
    function showVegetable(order){
    	var couponfee = order.couponfee;
        if(couponfee && couponfee > 0) { //有蔬菜券，并且大于0
            $("#vegetableBox").show();
            $("#vegetableNumber").html("-" + app.getPriceStr(couponfee));
        }
    }
	//显示总价
	function showPreferential(num){
		app.carriage = 0;
		$.each(num.items,function(i,item){
			app.carriage += (item.sellprice*1)*(item.amount*1)
		})
		$("#vipCount").text('¥' + (app.carriage).toFixed(2));
		$("#vipCount").css({"text-decoration":"line-through","color":"rgb(169,169,169)"});
	}
	//显示运费
	function showFare(num){
		$("#fare").text('+¥' + num);
	}
	//显示余额，小于60就提示
	function showBalance(varval) {
		$("#varvalbox").show();
		if(varval < app.startCash) {
			$("#balanceTip").show();
		} else {
			$("#balanceTip").hide();
		}
		$("#varval").text('¥' + (varval*1).toFixed(2));
	}
	//加载用户信息
	function loadUser(order) {
		app.getUser(function(user) {
			console.log(user);
			if(order.type == app.ORDER_TYPE_OPTION ||
				order.type == app.ORDER_TYPE_PACKAGE) {
				var varval = user.cashMoney;
				showBalance(varval);
			} else if(order.type == app.ORDER_TYPE_ELECTRONIC_CARD) {
				var infos = "收货人：春沐源会员"
				infos += "<br>收信手机号：" + user.mobile;
				$("#infos").html(infos);
			} else if(order.type == 8) {
				$("#orderPhoneText").text(user.mobile);
			}

		});
	}
	return app;
});