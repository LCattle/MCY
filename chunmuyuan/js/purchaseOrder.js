//确认订单
define(["base/baseApp", "dialog", "picker", "./base/baseCar", "./base/baseCardCar", "./base/order","picker"], function(app, dialog, Picker, car, cardCar, Order,picker) {
	app.initPage = function() {};
	//订单类型
	app.orderType = app.UrlParams.type;
	//收货地址
	var address = null;
	//自提地址
	var kobe = null;
	//配送日期
	app.DeliveryDate = null;
	//支付方式
	app.payway = "20";
	//须支付金额
	app.totalPrice = 0;
	//商品的虚拟价值
	app.goodsVerVal = 0;
	//提示余额用
	var userBalance = -100;
	//减免斤数
	var reduce = 0;
	
	app.skus = app.getLocalObject("purchasedata");
	 //var userInfo=JSON.parse(localStorage.userInfo);
	//如果没有选中type，或者type不是所需值 算作异常进入，直接跳到首页
	//app.ORDER_TYPE_ELECTRONIC_CARD 电子卡
	//app.ORDER_TYPE_ENTITY_CARD 实体卡
//	if(!app.orderType || (
//			app.orderType != app.ORDER_TYPE_OPTION &&
//			app.orderType != app.ORDER_TYPE_PACKAGE &&
//			app.orderType != app.ORDER_TYPE_ELECTRONIC_CARD &&
//			app.orderType != app.ORDER_TYPE_ENTITY_CARD
//		)) {
//		location.href = "../index.html";
//	}
	//显示余额不足
	function showBalanceTip() {
		$("#balanceTip").show();
	}
	//获取skuids拼接字符串
	function getSkuIds() {
		var ids = "";
		$.each(app.skus, function(i, item) {
			if(item && item.skuid) {
				ids += "," + item.skuid;
			}
		});
		ids = ids.replace(",", "");
		return ids;
	}
	//开始执行
	app.init = function() {
		showAddress();
		//点击选择支付方式
		$("#paywaySelect").click(function() {
			localStorage.BackUrl = location.href;
			if(isInAppEnviroment()){
				location.href = "../payment/selectPay.html?money=" + app.totalPrice + "&type=" + app.orderType;
				return;
			}
			location.href = "../html/selectPayforOrder.html?money=" + app.totalPrice + "&type=" + app.orderType;
		});
		 if(!localStorage.selectedPayway){
            localStorage.selectedPayway = 10;
		}
		app.payway = localStorage.selectedPayway;
		var pw = Order.getPayWay(localStorage.selectedPayway)
		$("#payway").text(pw ? pw : "请选择");
		//电子卡不需要这些
		if(app.orderType == app.ORDER_TYPE_ELECTRONIC_CARD) {
            //改变地址的显示方式
            $("#addressDiv").show();
            $("#addressinfo").hide();
            $("#addressDef").show();
		}else {
            $("#addressDiv").show();
            var addressType = localStorage.addressType;
            if(addressType == 2 && localStorage.addressSelected == 1){
                inner2Click();
            }else{
                inner1Click();
            }
            localStorage.addressSelected = 0;
//          if(app.orderType != app.ORDER_TYPE_ENTITY_CARD) { //不是礼品卡
//              $("#paywaySelect").removeClass("aui-list-item-arrow");
//          }

            $("#addressAdd").bind("click", function() {
                localStorage.addressBackUrl = location.href;
                location.href = "addressEdit.html";
            });
            $("#addressInfo").bind("click", function() {
                localStorage.selectAdressBackUrl = location.href;
                location.href = "addressSelect.html";
                localStorage.addressSelected = 1;
            });
            $("#addressInfo1").bind("click", function() {
                localStorage.selectztAdressBackUrl = location.href;
                location.href = "addressSelect_before.html";
                localStorage.addressSelected = 1;
            });
       }
		showSkus();
		$("#buyBtn").bind("click", function() { //绑定提交订单按钮
			if(localStorage.addressType == 2){
				ztSubmitOrder();
					}else{
				submitOrder();
			}     
		});
	};

	// #ipt-inner2 点击回调
	var inner2Click = function(){
        $("#ipt-inner2").find("#ipt2").addClass("active");
        $("#ipt-inner2").siblings(".inner1").find("#ipt1").removeClass("active");
        $('#addressinfo1').show();
        $('#addressinfo').hide();
        $('#addressAdd').hide();
        localStorage.addressType = 2;
        loadztAddress();
    }

    var inner1Click = function(){
        $("#ipt-inner1").find("#ipt1").addClass("active");
        $("#ipt-inner1").siblings(".inner2").find("#ipt2").removeClass("active");
        $('#addressinfo').show();
        $('#addressinfo1').hide();
        localStorage.addressType = 1;
        //loadDeliveryDate();
        loadAddress(); //加载地址信息
    }
	//单选框点击效果
	function showAddress(){
		$('#ipt-inner2').on('click',inner2Click);
		$('#ipt-inner1').on('click',inner1Click);
	}
	//加载自提默认地址
	function loadztDefAddress(){
		app.POSTRequest_m("/member/address/addressLists.do", {
			data: {
					addType: 1,
					isdefault: 1
				},
			success: function(data) {
				if(data.resultCode == 1) {
					console.log(data.resultObj);
					kobe =data.resultObj[0];
					app.setLocalObjet("selectztAddress", kobe);
					initztAddressInfo();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}
	//自提地址信息同步到页面
	function initztAddressInfo() {
		    var str = kobe.fulladdress;
			str = str.replace(/:/g,"").replace(/：/g,"");

        	var index1 = str.indexOf("联系人");
        	var str1 = str.substring(0,index1).trim();
        	var str2 = str.substring(index1 + 3).trim();

        	index1 = str2.indexOf("-");
        	var str3 = str2.substring(0,index1 - 3).trim();
        	var str4 = str2.substring(index1 - 3).trim().replace(/-/g,"");

			$("#ztName").text(str3);
        	$("#ztPhone").text(str4);
		    $("#ztFull").text(str1);
		    ztLoadDeliveryDate(); //加载配送日期
	}
	function loadztAddress() {
		//获取本地存储的地址
		var data = app.getLocalObject("selectztAddress");
		if(data) { //如果存在且有id
			kobe = data;
			initztAddressInfo();
		}else {	
			//加载默认地址
			loadztDefAddress();
		}
	}
	//判断是否显示输入框
	function showInput(){
    	    app.POSTRequest("/weixin/mall/order/queryMemberRecommender.do", {
                data: {
                    loginedToken: localStorage.loginedToken,
                },
                success: function(data) {
                	console.log(data);
                    if(data.resultObj == 'n'){
                    	$("#zskfbox").parent().parent().parent().show();
	            }
            }
        });		
 }
	//提交订单（自选菜，实体卡，宅配）
	function submitOrder() {
		var data = {};
		data.loginedtoken = localStorage.loginedToken;
		data.skuid = app.skus["package"].id;
		if(app.orderType != app.ORDER_TYPE_ELECTRONIC_CARD && app.orderType != 8) { //不是电子卡就要校验地址
			if(!address) { //如果地址不存在
				app.tipInfo("请添加地址");
				return;
			}
			data.addressId = address.id; //写入地址
		}
		if(app.orderType == 9) {
			//自选菜和宅配需要校验配送日期
			if(app.DeliveryDate == null) {
				app.tipInfo("请选择配送日期");
				return;
			}
			data.delivertime = app.DeliveryDate;
		}
		data.payway = Order.paywayMap[app.payway];
		//提交订单
//		Order.submitOrder(data, app.orderType, function(order) {
//			toComfirmPay(order);
//		});
		app.POSTRequest("weixin/mall/orderhd/OneMoneryOrder.do", {
					data: data,
					loading: "订单提交中...",
					success: function(data) {
                        console.log(data);
                        if(data.resultCode == 1) {
							toComfirmPay(data);
						} else {
							app.tipInfo(data.resultMsg);
						}
					}
				});
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

	function ztSubmitOrder() {
		var data = {};
		data.orderType = 'zt';
		data.loginedtoken = localStorage.loginedToken;
		data.skuid = app.skus["package"].id;
		if(app.orderType != app.ORDER_TYPE_ELECTRONIC_CARD && app.orderType != 8) { //不是电子卡就要校验地址
			if(!address) { //如果地址不存在
				app.tipInfo("请添加地址");
				return;
			}
			data.addressId = address.id; //写入地址
		}
		if(app.orderType == 9) {
			//自选菜和宅配需要校验配送日期
			if(app.DeliveryDate == null) {
				app.tipInfo("请选择配送日期");
				return;
			}
			data.delivertime = app.DeliveryDate;
		}
		data.payway = Order.paywayMap[app.payway];
		//提交订单
//		Order.submitOrder(data, app.orderType, function(order) {
//			ztToComfirmPay(order);
//		});
        app.POSTRequest("weixin/mall/orderhd/OneMoneryOrder.do", {
					data: data,
					loading: "订单提交中...",
					success: function(data) {
                        console.log(data);
                        if(data.resultCode == 1) {
							toComfirmPay(data);
						} else {
							app.tipInfo(data.resultMsg);
						}
					}
				});
	}
	//配送跳转到确认支付页面
	function toComfirmPay(data) {
		var order = data.resultObj;
		var money = order.actualpaied;
		if(isInAppEnviroment()){
			location.replace("../payment/confirmpay.html?type=" +
			9 + "&ono=" + order.orderno +
			"&money=" + money + "&oid=" + order.id+"&payway="+order.payway+"&virtualfee="+order.virtualfee/1000 + "&reduce=" + reduce)
			return;
		}
		location.replace("../html/confirmpay.html?type=" +
			9 + "&ono=" + order.orderno +
			"&money=" + money + "&oid=" + order.id+"&payway="+order.payway+"&virtualfee="+order.virtualfee/1000 + "&reduce=" + reduce);
	}
	//自提跳转到确认支付页面
	function ztToComfirmPay(order) {
		var order = data.resultObj;
		var money = order.actualpaied;
		if(isInAppEnviroment()){
			location.replace("../html/confirmpay.html?type=" +
			9 + "&ono=" + order.orderno +
			"&money=" + money + "&oid=" + order.id+"&payway="+order.payway+"&virtualfee="+order.virtualfee/1000+"&deliverymode="+order.deliverymode+ "&reduce=" + reduce);
			return;
		}
		location.replace("../html/confirmpay.html?type=" +
			9 + "&ono=" + order.orderno +
			"&money=" + money + "&oid=" + order.id+"&payway="+order.payway+"&virtualfee="+order.virtualfee/1000+"&deliverymode="+order.deliverymode+ "&reduce=" + reduce);
	}
	//获取skuid对应的购买数量
	function getSkuNum(skuid) {
		for(var i = 0; i < app.skus.length; i++) {
			if(app.skus[i].skuid == skuid) {
				return app.skus[i].num;
			}
		}
		return 0; //如果找不到就返回0
	}

	//显示商品信息
	function showSkus() {
		if(app.orderType == 9) { //宅配
			var item = app.skus["package"];
			item.buyNum = getSkuNum(item.id);
			app.goodsVerVal += parseFloat(item.virtualvalue);
			var temp = app.getTempBySelector("#gdsTemp2");
			$("#goodsList").append(temp(item));
			var combo = app.skus["combo"];
			temp = app.getTempBySelector("#gdsTemp4");
			$.each(combo, function(i, it) {
				$("#skubox_" + item.id).append(temp(it));
			})
		}
		
		//宅配和自选
		if(app.orderType == 9) {
			var payWay = app.getLocalObject("selectedPayway");
			$("#goodsPriceLable").text("商品斤数")
		    var kg = (app.goodsVerVal / 1000).toFixed(2) + "kg";
//			$("#payway").text(Order.getPayWay(payWay));
			$("#goodsPrice").text(kg);
		}
	}

	/**地址信息同步到页面*/
	function initAddressInfo() {
		if(!address) { //如果没有地址提示用户去添加地址
			$("#addressinfo").hide();
			$("#addressAdd").show();

		} else { //初始化地址信息
			$("#adName").text(address.consignee);
			$("#adPhone").text(address.mobile);
			$("#adFull").text(address.fulladdress);
				loadDeliveryDate(); //加载配送日期
		}
	}
	/**加载地址信息*/
	function loadAddress() {
		//获取本地存储的地址
		var data = app.getLocalObject("selectAddress");
		if(data && data.id) { //如果存在且有id
			address = data;
			initAddressInfo();
		} else {
			//加载默认地址
			loadDefAddress();
		}
	}

    app.coupon = null;
	/**加载默认地址*/
	function loadDefAddress() {
		app.POSTRequest_m("/member/address/getDefaultAddress.do", {
			success: function(data) {
				if(data.resultCode == 1) {
					address = data.resultObj;
					app.setLocalObjet("selectAddress", address);
					initAddressInfo();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}
	//加载用户信息 主要是加载用户的余额
	function loadUser() {
		app.getUser(function(user) {
            app.userInfo = user;
			$("#userMobile").text(user.mobile);
			userBalance = user.virtualmoney; //用户余额
			if(app.orderType == app.ORDER_TYPE_OPTION
				|| app.orderType == app.ORDER_TYPE_PACKAGE) {
				freemoney();
			}
			//礼品卡订单
			if(app.orderType == app.ORDER_TYPE_ENTITY_CARD
				|| app.orderType == app.ORDER_TYPE_ELECTRONIC_CARD) {
				app.allPrice = app.totalPrice;
				if(user.deposit > 0) {
					$("#deposit").html("-" + app.getPriceStr(user.deposit));
					app.totalPrice -= user.deposit;
					if(app.totalPrice<0){
						app.totalPrice = 0;
					}
					$("#depositBox").show();
				}
                var skuids = "";
                $.each(app.skus, function(i, item) {
                    skuids += "," + item.skuid ;
                });
                skuids = skuids.replace(",","");
                var couponParam = {};
                couponParam.skuids = skuids;
                couponParam.price = app.allPrice;
                couponParam.couponType = 1;
                couponParam.couponStatus = 1;
                app.getCoupon(couponParam,function (res) {
					if(res &&　res.length > 0){
						app.coupon = res[0];
                        var useCoupon = app.getLocalObject("use_coupon");
                        if(useCoupon){
                            app.coupon = useCoupon;
                            localStorage.use_coupon = "";
                        }
                        if(res && res.length > 1){
                            $("#couponLength").text(res.length);
                            $("#couponBox").addClass("aui-list-item-arrow");
                            $("#couponBox").on("click",function () {
                                localStorage.BackUrl = location.href;
                                app.href("selectCoupon.html?skuids=" + skuids + "&price=" + app.allPrice + "&couponId="+app.coupon.id + "&back=true");
                            });
                            $("#couponMore").show();
                        }
						if(app.coupon.value > 0){
							app.totalPrice -= app.coupon.value;
							if(app.totalPrice > app.coupon.value){
								$("#coupon").html("-" + app.getPriceStr(app.coupon.value));
								$("#couponBox").show();
							}
						}
					}
                    $("#totalprice").html(app.getPriceStr(app.totalPrice));
                    $("#goodCount").html(app.getPriceStr(app.totalPrice));
                });
//				if(!user.consultantno){
//					//显示客服专员
//					$("#zskfbox").parent().parent().parent().show();
//				}
			}

		}, function() {
			app.toLoginPage(location.href);
		})
	}

	//加载配送日期
	function loadDeliveryDate() {
		app.POSTRequest("weixin/mall/order/queryOrderDeliveryDate.do", {
			data:{
				addressId:address.id,
				type:2
			},
			success: function(data) {
				if(data.resultCode === "1") {
					var deliDate = data.resultObj;
					initPicker(deliDate.map(function(item, index) {
						return {
							text: item.date + "[" + item.week + "]",
							value: item.date
						}
					}));
					app.DeliveryDate = deliDate[0].date;
					$("#DeliveryDate").text(deliDate[0].date + "[" + deliDate[0].week + "]");
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}
	//自提加载配送日期
	function ztLoadDeliveryDate() {
		app.POSTRequest("weixin/mall/order/queryOrderDeliveryDate.do", {
			data:{
				addressId:kobe.id,
				type:1,
                deliveryMode:"30"
			},
			success: function(data) {
				if(data.resultCode === "1") {
					var deliDate = data.resultObj;
					ztInitPicker(deliDate.map(function(item, index) {
						return {
							text: item.date + "[" + item.week + "]",
							value: item.date
						}
					}));
					app.DeliveryDate = deliDate[0].date;
					$("#DeliveryDate").text(deliDate[0].date + "[" + deliDate[0].week + "]");
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}
	var picker
	//选择自提配送日期
	function ztInitPicker(data) {
		picker = new Picker({
			data: [
				data
			],
			selectedIndex: [0],
			title: '选择配送日期'
		});
		picker.on('picker.select', function(selectedVal, selectedIndex) {
			$("#DeliveryDate").text(data[selectedIndex[0]].text);
			app.DeliveryDate = selectedVal[0];
		});
		$("#DeliveryDate").parent().parent().bind("click", function() {
			picker.show();
		});
	}
	//选择配送日期
	function initPicker(data) {
		picker = new Picker({
			data: [
				data
			],
			selectedIndex: [0],
			title: '选择配送日期'
		});
		picker.on('picker.select', function(selectedVal, selectedIndex) {
			$("#DeliveryDate").text(data[selectedIndex[0]].text);
			app.DeliveryDate = selectedVal[0];
		});
		$("#DeliveryDate").parent().parent().bind("click", function() {
			picker.show();
		});
	}
	//选择配送方式
	function psInitPicker(data) {
		picker = new Picker({
			data: [
				data
			],
			selectedIndex: [0],
			title: '选择配送日期'
		});
		picker.on('picker.select', function(selectedVal, selectedIndex) {
			$("#DeliveryDate").text(data[selectedIndex[0]].text);
			app.DeliveryDate = selectedVal[0];
		});
		$("#DeliveryDate").parent().parent().bind("click", function() {
			picker.show();
		});
	}
	//显示，隐藏套餐下的内容
	app.showCombo = function(e, id) {
			$(e).toggleClass("active");
			if($(e).hasClass("active")) {
				$("#skubox_" + id).slideDown(200);
			} else {
				$("#skubox_" + id).slideUp(200);
			}
		};
		//商品展开动画
	function showProductAnimation(list, index) {
		if(list[index]) {
			$(list[index]).slideDown(100, function() {
				showProductAnimation(list, index + 1);
			});
		}
	}
	//商品收起动画
	function hideProductAnimation(list, index) {
		if(list[index]) {
			$(list[index]).slideUp(20, function() {
				hideProductAnimation(list, index - 1);
			});
		}
	}

	//页面点击 查看更多/收起
	app.clickShowMore = function(e) {
		var text = $(e).find(".aui-text-center").text();
		var list = $("#goodsList .none");
		if(text == "查看更多") {
			showProductAnimation(list, 0);
			$(e).find(".aui-text-center").text("收起");
		} else {
			hideProductAnimation(list, list.length - 1);
			$(e).find(".aui-text-center").text("查看更多");
		}
	}
	return app;
});