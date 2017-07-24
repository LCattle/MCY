//确认订单
define(["base/baseApp", "dialog", "picker", "./base/baseCar", "./base/baseCardCar", "./base/order","./base/fare"], function(app, dialog, Picker, car, cardCar, Order,fare) {
	app.initPage = function() {};
	//订单类型
	app.orderType = app.UrlParams.type;
	app.skus = app.getLocalObject("selectProduts"); //订单skuid及购买数量
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
	var closepays = [];
	//减免斤数
	var reduce = 0;
	//折扣系数
	var arr = [];
	//运费
    var freight = 0;
    //订单金额
    var kg = 0;
    //蔬菜券
    var vegetableValue = 0;
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
	//按订单类型1,3去加载商品信息
	function loadOrder1_3() {
		if(app.skus) {
			//网络请求商品数据
			app.POSTRequest("weixin/mall/sku/queryBySkuid.do", {
				data: {
					skuid: getSkuIds()
				},
				success: function(data) {
					if(data.resultCode == 1) {
						showSkus(data.resultObj);
					} else {
						app.tipInfo("商品加载失败：" + data.resultMsg);
					}
				}
			});
		}
	}
	//按订单2的方式去加载
	function loadOrder2() {
		if(app.skus) {
			//网络请求商品数据
			app.POSTRequest("weixin/mall/sku/queryPackageBySkuid.do", {
				data: {
					comboId: getSkuIds()
				},
				success: function(data) {
					if(data.resultCode == 1) {
						showSkus(data.resultObj);
					} else {
						app.tipInfo("商品加载失败：" + data.resultMsg);
					}
				}
			});
		}
	}

	var seedObj = null;

	function showSeed() {
		app.POSTRequest("weixin/mall/memberinteractive/queryMemberBymobile.do", {
			success: function(data) {
				console.log(data);
				if(data.resultCode == 1) {
					seedObj = data.resultObj;
					$("#seedName").text(seedObj.seedname + "(你种我送)");
					$("#mySeedImg").attr("src", "../imgs/plantVeg/" + seedObj.type + ".jpg");
					$("#mySeed").show();
				}
			}
		});
	}

	//开始执行
	app.init = function() {
		//加载兑换商品信息
		loadExchangeProduct();
		//礼品和实体卡判断
		if(app.orderType == 3 || app.orderType == 4 || app.orderType == 10) {
			$("#tjr_div").show();
			showInput();
		}
		//如果是游戏兑换
		if(app.orderType == 9) {
			//游戏兑换的实付为0
			$("#goodsPriceLable").text("商品斤数")
			$("#goodCount").html(app.getPriceStr(0));

			$("#goodsPrice").html(app.getPriceStr(0));
			
			$(".outer").show();
			$("#tjr_div").show();
			showAddress();
		} else if(
			app.orderType == 9 ||
			app.orderType == app.ORDER_TYPE_OPTION ||
			app.orderType == app.ORDER_TYPE_PACKAGE
		) {
			$(".outer").show();
			$("#tjr_div").show();
			showAddress();
			showSeed();
		} else {
			$(".outer").hide();
		}
		if(app.orderType == 9 || app.orderType == 3 || app.orderType == 2 || app.orderType == 1 || app.orderType == 10) {
			$("#remark").show();
		}

		//电子卡不需要这些
		if(app.orderType == app.ORDER_TYPE_ELECTRONIC_CARD) {
			//改变地址的显示方式
			$("#addressDiv").show();
			$("#addressinfo").hide();
			$("#addressDef").show();
		} else if(app.orderType == 8) {

		} else {
            $("#addressDiv").show();
            var addressType = localStorage.addressType;
            if(addressType == 2 && localStorage.addressSelected == 1){
                innertwoClick();
            }else{
                inneroneClick();
            }
            localStorage.addressSelected = 0;
            if(app.orderType != app.ORDER_TYPE_ENTITY_CARD && app.orderType != app.ORDER_PLANTER_MACHINE) { //不是礼品卡也不是种植机的时候
                $("#paywaySelect").removeClass("aui-list-item-arrow");
            }

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
				location.href = "addressSelect_Since.html";
				localStorage.addressSelected = 1;
			});
		}
		if(app.orderType == app.ORDER_TYPE_ELECTRONIC_CARD ||
			app.orderType == app.ORDER_TYPE_ENTITY_CARD || app.orderType == app.ORDER_PLANTER_MACHINE) {
			$("#totalLable").text("实付：");
		}
		loadSkus(); //加载商品信息
		$("#buyBtn").bind("click", function() { //绑定提交订单按钮
			//如果是游戏订单，不验证金额直接提交
			if(app.orderType == 9) {
				submitOrder();
				return;
			}
			if(app.orderType == app.ORDER_TYPE_OPTION ||
				app.orderType == app.ORDER_TYPE_PACKAGE) {
				console.log(app.goodsVerVal);
			} else if(app.orderType == 8) {
				ggSubmitOrder();
			} else {
				//弹框提示支付金额小于等于0的情况
				if(app.totalPrice <= 0) {
					showTipPrice();
					return;
				}
			};
			if(app.orderType != 8 && app.orderType != 10) {
				decidePeople();
			} else {
				decidePerson();
			}
		});
	};

	// #ipt-inner2 点击回调,自提没有运费
	var inner2Click = function(){
        $("#ipt-inner2").find("#ipt2").addClass("active");
        $("#ipt-inner2").siblings(".inner1").find("#ipt1").removeClass("active");
        $('#addressinfo1').show();
        $('#addressinfo').hide();
        $('#addressAdd').hide();
        localStorage.addressType = 2;
        loadztAddress();
        freight = 0;//计算物流费
		$("#freight").text(freight.toFixed(2));
		$("#goodCount").html(app.getPriceStr(kg*1 + freight*1 - vegetableValue*1));
    }
    var innertwoClick = function(){//开始不计算总价
        $("#ipt-inner2").find("#ipt2").addClass("active");
        $("#ipt-inner2").siblings(".inner1").find("#ipt1").removeClass("active");
        $('#addressinfo1').show();
        $('#addressinfo').hide();
        $('#addressAdd').hide();
        localStorage.addressType = 2;
        loadztAddress();
        freight = 0;//计算物流费
		$("#freight").text(freight.toFixed(2));
		//$("#goodCount").text((kg*1 + freight*1).toFixed(2));
    }
    
    //配送
    var inner1Click = function(){
        $("#ipt-inner1").find("#ipt1").addClass("active");
        $("#ipt-inner1").siblings(".inner2").find("#ipt2").removeClass("active");
        $('#addressinfo').show();
        $('#addressinfo1').hide();
        localStorage.addressType = 1;
        //loadDeliveryDate();
        loadAddress(); //加载地址信息
        freight = fare.vegetableFare(kg);//计算物流费
        
		$("#freight").text((freight*1).toFixed(2));
		$("#goodCount").html(app.getPriceStr(kg*1 + freight*1 - vegetableValue*1));
    }
    
     var inneroneClick = function(){//开始不计算总价
        $("#ipt-inner1").find("#ipt1").addClass("active");
        $("#ipt-inner1").siblings(".inner2").find("#ipt2").removeClass("active");
        $('#addressinfo').show();
        $('#addressinfo1').hide();
        localStorage.addressType = 1;
        //loadDeliveryDate();
        loadAddress(); //加载地址信息
        freight = fare.vegetableFare(kg);//计算物流费
        if(app.orderType==3||app.orderType==4||app.orderType==10){
        	freight = 0;
        }
		$("#freight").html(app.getPriceStr(freight));
		//$("#goodCount").text((kg*1 + freight*1).toFixed(2));
    }
	//单选框点击效果
	function showAddress() {
		$('#ipt-inner2').on('click', inner2Click);
		$('#ipt-inner1').on('click', inner1Click);
	}
	//加载自提默认地址
	function loadztDefAddress() {
		app.POSTRequest_m("/member/address/addressLists.do", {
			data: {
				addType: 1,
				isdefault: 1
			},
			success: function(data) {
				if(data.resultCode == 1) {
					console.log(data.resultObj);
					kobe = data.resultObj[0];
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
		str = str.replace(/:/g, "").replace(/：/g, "");

		var index1 = str.indexOf("联系人");
		var str1 = str.substring(0, index1).trim();
		var str2 = str.substring(index1 + 3).trim();

		index1 = str2.indexOf("-");
		var str3 = str2.substring(0, index1 - 3).trim();
		var str4 = str2.substring(index1 - 3).trim().replace(/-/g, "");

		$("#ztName").text(str3);
		$("#ztPhone").text(str4);
		$("#ztFull").text(str1);
		if(app.orderType == 9 || app.orderType == 1 || app.orderType == 2) {
			ztLoadDeliveryDate(); //加载配送日期
			$("#DeliveryDateBox").show(); //显示配送日期
		}
	}

	function loadztAddress() {
		//获取本地存储的地址
		var data = app.getLocalObject("selectztAddress");
		if(data) { //如果存在且有id
			kobe = data;
			initztAddressInfo();
		} else {
			//加载默认地址
			loadztDefAddress();
		}
	}
	//判断是否显示输入框
	function showInput() {
		app.POSTRequest("/weixin/mall/order/queryMemberRecommender.do", {
			data: {
				loginedToken: localStorage.loginedToken,
			},
			success: function(data) {
				console.log(data);
				if(data.resultObj == 'n') {
					$("#zskfbox").parent().parent().parent().show();
				}
			}
		});
	}
	//判断
	function decidePeople() {
		var staffNo = $("#zskfbox").val().trim();
		if(staffNo == "") {
			if(localStorage.addressType == 2) {
				ztSubmitOrder();
			} else {
				submitOrder();
			}
		} else if(staffNo == app.userInfo.mobile) {
			app.tipInfo("推荐人不能是会员自己，请重新输入");
		} else if(staffNo.length != 11) {
			app.tipInfo("手机号输入长度不正确，请重新输入");
		} else {
			app.POSTRequest("/weixin/mall/order/queryMemberMobile.do", {
				data: {
					mobile: staffNo
				},
				success: function(data) {
					if(data.resultObj == 'y') {
						if(localStorage.addressType == 2) {
							ztSubmitOrder();
						} else {
							submitOrder();
						}
					} else {
						app.tipInfo("推荐人手机号码不是会员");
					}
				}
			});
		}
	}
	//判断是否是种植机订单
	function decidePerson() {
		var staffNo = $("#zskfbox").val().trim();
		if(staffNo == "") {
			zzSubmitOrder();
		} else if(staffNo == app.userInfo.mobile) {
			app.tipInfo("推荐人不能是会员自己，请重新输入");
		} else if(staffNo.length != 11) {
			app.tipInfo("手机号输入长度不正确，请重新输入");
		} else {
			app.POSTRequest("/weixin/mall/order/queryMemberMobile.do", {
				data: {
					mobile: staffNo
				},
				success: function(data) {
					if(data.resultObj == 'y') {
						zzSubmitOrder();
					} else {
						app.tipInfo("推荐人手机号码不是会员");
					}
				}
			});
		}
	}

	//提示余额小于等于0的情况
	function showTipPrice() {
		var dialog = new auiDialog();
		dialog.alert({
			title: "温馨提示",
			msg: "订金券金额大于商品金额，不允许提交订单",
			buttons: ["确定"]
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				submitOrder();
			}
		});
	}
	//提交种植机页面订单
	function zzSubmitOrder() {
		var data = {};
		data.loginedtoken = localStorage.loginedToken;
		if(app.orderType == app.ORDER_PLANTER_MACHINE) { //不是电子卡就要校验地址
			if(!address) { //如果地址不存在
				app.tipInfo("请添加地址");
				return;
			}
			data.addressId = address.id; //写入地址
		}
		//准备商品信息 skuid:num,skuid:num
		var goods = "";
		$.each(app.skus, function(i, item) {
			goods += "," + item.skuid + ":" + item.num;
		});
		data.goods = goods.replace(",", "");
		if(!app.payway || app.payway == 20) {
			app.tipInfo("请选择支付方式");
			return;
		}
		data.payway = Order.paywayMap[app.payway];
		data.recommender = $("#zskfbox").val();
		data.message = $("#search-input").val().replace(/[\ud800-\udbff][\udc00-\udfff]/g, '').trim();
		//提交订单
		Order.submitOrder(data, app.orderType, function(order) {
			toComfirmPay(order);
		});
	}
	// 提交观光券订单
	function ggSubmitOrder() {
		var data = {};
		if(!app.payway || app.payway == 20) {
			app.tipInfo("请选择支付方式");
			return;
		}
		if(!app.skus || app.skus.length == 0) {
			app.tipInfo("请选择商品");
			return;
		}
		data.payway = Order.paywayMap[app.payway];
		$.each(app.skus, function(i, item) {
			data.skuid = item.skuid;
			data.num = item.num;
		});

		//提交订单
		Order.submitOrder(data, app.orderType, function(order) {
			toComfirmPay(order);
		});
	}
	//提交订单（自选菜，实体卡，宅配）
	function submitOrder() {
		var data = {};
		//

		if(app.orderType != app.ORDER_TYPE_ELECTRONIC_CARD && app.orderType != 8) { //不是电子卡就要校验地址
			//写入地址
			if(localStorage.addressType == 2) {
				if(!kobe) { //如果地址不存在
					app.tipInfo("请添加地址");
					return;
				}
				data.orderType = "zt";
				data.addressId = kobe.id; //写入地址
			} else {
				if(!address) { //如果地址不存在
					app.tipInfo("请添加地址");
					return;
				}
				data.addressId = address.id;
			}
		}
		if(app.orderType == 9 || app.orderType == app.ORDER_TYPE_OPTION ||
			app.orderType == app.ORDER_TYPE_PACKAGE) {
			//自选菜和宅配需要校验配送日期
			if(app.DeliveryDate == null) {
				app.tipInfo("请选择配送日期");
				return;
			}
			data.delivertime = app.DeliveryDate;
		}
		//实体卡和电子卡需要验证支付方式
		if(app.orderType == app.ORDER_TYPE_ELECTRONIC_CARD ||
			app.orderType == app.ORDER_TYPE_ENTITY_CARD) { //判断支付方式
			if(!app.payway || app.payway == 20) {
				app.tipInfo("请选择支付方式");
				return;
			}
		}
		data.payway = Order.paywayMap[app.payway];
		//准备推荐人手机号
		data.staffNo = $("#zskfbox").val();
		//准备商品信息 skuid:num,skuid:num
		var goods = "";
		data.message = $("#search-input").val().replace(/[\ud800-\udbff][\udc00-\udfff]/g, '').trim();
		$.each(app.skus, function(i, item) {
			goods += "," + item.skuid + ":" + item.num;
		});
		data.goods = goods.replace(",", "");
		//减免斤数
		data.reducePound = reduce;
		//游戏兑换蔬菜skuid
		try {
			data.gameVegetableIds = app.selectedExchangeSku.join(",");
		} catch(e) {}
		console.log(reduce);
		// 准备员工工号
		var employeeno = getEmployeeno();
		if(employeeno) {
			data.employeeno = employeeno;
		}

		if(app.coupon && app.coupon.value > 0) {
			data.couponId = app.coupon.id;
		}
        if(app.vegetable && app.vegetable.value > 0){
        	data.couponId = app.vegetable.id;
        }
		//提交订单
		Order.submitOrder(data, app.orderType, function(order) {
			//如果是自选菜需要清除掉共享数据里的购物车数据
			if(app.orderType==1){
				car.clean();
			}
			toComfirmPay(order);
		});
	}

	// 缓存中获取员工信息
	function getEmployeeno() {
		var currDate = new Date();
		var time = currDate.getTime();
		var currEmployee = app.getLocalObject("cmy_employee");
		if(!currEmployee) {
			return "";
		}
		if(time > currEmployee.time) {
			localStorage.removeItem("cmy_employee");
			return;
		}
		return currEmployee.employeeno;
	}

	function ztSubmitOrder() {
		var data = {};
		data.orderType = 'zt';
		if(app.orderType != app.ORDER_TYPE_ELECTRONIC_CARD) { //不是电子卡就要校验地址
			if(!kobe) { //如果地址不存在
				app.tipInfo("请添加地址");
				return;
			}
			data.addressId = kobe.id; //写入地址
		}
		if(app.orderType == app.ORDER_TYPE_OPTION ||
			app.orderType == app.ORDER_TYPE_PACKAGE) {
			//自选菜和宅配需要校验配送日期
			if(app.DeliveryDate == null) {
				app.tipInfo("请选择配送日期");
				return;
			}
			data.delivertime = app.DeliveryDate;
		}

		//实体卡和电子卡需要验证支付方式
		if(app.orderType == app.ORDER_TYPE_ELECTRONIC_CARD ||
			app.orderType == app.ORDER_TYPE_ENTITY_CARD) { //判断支付方式
			if(!app.payway || app.payway == 20) {
				app.tipInfo("请选择支付方式");
				return;
			}
		}
		data.payway = Order.paywayMap[app.payway];
		//准备推荐人手机号
		data.staffNo = $("#zskfbox").val();
		//准备商品信息 skuid:num,skuid:num
		var goods = "";
		$.each(app.skus, function(i, item) {
			goods += "," + item.skuid + ":" + item.num;
		});
		data.goods = goods.replace(",", "");
		//减免斤数
		data.reducePound = reduce;
		data.message = $("#search-input").val().replace(/[\ud800-\udbff][\udc00-\udfff]/g, '').trim();
		// 准备员工工号
		var employeeno = getEmployeeno();
		if(employeeno) {
			data.employeeno = employeeno;
		}

        if(app.coupon && app.coupon.value > 0){
            data.couponId = app.coupon.id;
        }
        if(app.vegetable && app.vegetable.value > 0){
        	data.couponId = app.vegetable.id;
        }
		//提交订单
		Order.submitOrder(data, app.orderType, function(order) {
			toComfirmPay(order);
		});
	}
	//配送跳转到确认支付页面
	function toComfirmPay(order) {
		console.log(reduce);
		var money = order.actualpaied;
		if(order.type == app.ORDER_TYPE_OPTION ||
			order.type == app.ORDER_TYPE_PACKAGE) {
			if(seedObj) {
				app.POSTRequest("weixin/mall/memberinteractive/bindingMemberOrder.do", {
					data: {
						orderno: order.orderno
					},
					success: function(data) {

					}
				});
			}
            if(order.isneworder=='Y'){//新订单用现金账户余额支付

            }else{//老订单用斤数支付
                money = order.virtualfee - (reduce*1000);
            }
		}
		var data = {
			type: app.orderType, //订单类型，
			ono: order.orderno, //订单编号
			money: money, //实付金额或实付配送斤数
			oid: order.id, //订单id
			payway: order.payway, //选择的支付方式
			virtualfee: order.virtualfee / 1000, //兑换的配送斤数
			deliverymode: order.deliverymode, //配送方式
			reduce: reduce //减免金额
		}
		//如果是游戏兑换订单去往支付成功
		if(app.orderType == 9) {
			app.replace("../html/paysuccess.html?" + app.dataToSearchStr(data));
			return;
		}
		if(isInAppEnviroment()) {
			app.replace("../payment/confirmpay.html?" + app.dataToSearchStr(data));
		} else {
			if(order.type == app.ORDER_TYPE_ENTITY_CARD && order.payway == '40') {
				app.replace("../html/offlinePay.html?oid=" + order.id);
			} else {
				app.replace("../html/confirmpay.html?" + app.dataToSearchStr(data));
			}
		}

	}
	//加载要下单的内容
	function loadSkus() {
		if(app.orderType == app.ORDER_TYPE_PACKAGE) {
			loadOrder2();
		} else {
			loadOrder1_3();
		}
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
    
    function userLevel(index){
        var str ="";
        switch (index)
        {
            case 1:
                str="LEVELONE";
                break;
            case 2:
                str="LEVELTWO";
                break;
            case 3:
                str="LEVELTHREE";
                break;
            case 4:
                str="LEVELFOUR";
                break;
            case 5:
                str="LEVELFIVE";
                break;
            case 6:
                str="LEVELSIX";
            break;    
        }
        return str;
    }

    function checkUserBalance(actualPay){
        if(userBalance >= (actualPay).toFixed(2)){
        	return true;
		}

		var flag = false;
		$.each(closepays,function (index, item) {
            var remain = item.remain
            if(item.mastercashmoney * 1 < remain * 1) {
                remain = item.mastercashmoney;
            }

            if(remain >= (actualPay).toFixed(2)){
            	flag = true;
            	return false;
			}
        });

		return flag;
	}
    
	//显示商品信息
	function showSkus(data) {
		if(app.orderType == app.ORDER_TYPE_OPTION||
            app.orderType == 9) {//自选
		loadUser();
			app.getSysParam("MEMBERLEVELDISCOUNT",function(data){
						$.each(data,function(i,item){
						    arr.push(item);
						})
			},'biz');
			var levelStr = userLevel(parseInt(app.userInfo.level));
			$.each(arr,function(i,item){
				if(item.innercode == levelStr){
					app.paramvalue = item.paramvalue;
				}
			});
			$.each(data, function(i, item) {
				if(item) {
					item.buyNum = getSkuNum(item.id);
					app.totalPrice += item.sellprice * item.buyNum;
					app.goodsVerVal += item.sellprice * item.buyNum * app.paramvalue;
					if(i > 4) {
						item.hide = true;
					}
                    item.orderType = app.orderType;
					var temp = app.getTempBySelector("#gdsTemp1");
					$("#goodsList").append(temp(item));
				}
			});
			if(data.length > 5) {
				$("#goodsList").append(app.getTempBySelector("#showMoreTemp")({}));
			}
		}
		if(app.orderType == app.ORDER_TYPE_PACKAGE) { //宅配
		loadUser();
			app.getSysParam("MEMBERLEVELDISCOUNT",function(data){
						$.each(data,function(i,item){
						    arr.push(item);
						})
			},'biz');
			var levelStr = userLevel(parseInt(app.userInfo.level));
			$.each(arr,function(i,item){
				if(item.innercode == levelStr){
					app.paramvalue = item.paramvalue;
				}
			})
			var item = data["package"];
			item.buyNum = getSkuNum(item.id);
			app.totalPrice += item.sellprice * item.buyNum;
			app.goodsVerVal += item.sellprice * item.buyNum * app.paramvalue;
			var temp = app.getTempBySelector("#gdsTemp2");
			$("#goodsList").append(temp(item));
			var combo = data["combo"];
			temp = app.getTempBySelector("#gdsTemp4");
			$.each(combo, function(i, it) {
				$("#skubox_" + item.id).append(temp(it));
			})
		}
		if(app.orderType == app.ORDER_TYPE_ELECTRONIC_CARD ||
			app.orderType == app.ORDER_TYPE_ENTITY_CARD) { //礼品卡
			$.each(data, function(i, item) {
				if(item) {
					item.buyNum = getSkuNum(item.id);
					app.totalPrice += parseFloat(item.sellprice) * item.buyNum;
					if(i > 4) {
						item.hide = true;
					}
					var temp = app.getTempBySelector("#gdsTemp3");
					$("#goodsList").append(temp(item));
				}
			});
			if(data.length > 5) {
				$("#goodsList").append(app.getTempBySelector("#showMoreTemp")({}));
			}
			//点击选择支付方式
			$("#paywaySelect").click(function() {
				localStorage.BackUrl = location.href;
				if(isInAppEnviroment()) {
					location.href = "../payment/selectPay.html?money=" + app.totalPrice + "&type=" + app.orderType;
				} else {
					location.href = "../html/selectPayforOrder.html?money=" + app.totalPrice + "&type=" + app.orderType;
				}

			});

			if(!localStorage.selectedPayway) {
				localStorage.selectedPayway = 10;
			}
			//如果是游戏兑换切换支付方式成游戏兑换
			if(app.orderType == 9) {
				localStorage.selectedPayway = 100;
			}
			app.payway = localStorage.selectedPayway;
			var pw = Order.getPayWay(localStorage.selectedPayway)
			$("#payway").text(pw ? pw : "请选择");
			$("#goodsPriceLable").text("商品金额");
			$("#goodsPrice").html(app.getPriceStr(app.totalPrice));
			$("#totalBox").show();
			$("#totalprice").html(app.getPriceStr(app.totalPrice));
			//加载用户信息
		    loadUser();
		}
		//种植机
		if(app.orderType == app.ORDER_PLANTER_MACHINE) {
			$.each(data, function(i, item) {
				if(item) {
					item.buyNum = getSkuNum(item.id);
					app.totalPrice += parseFloat(item.sellprice) * item.buyNum;
					if(i > 4) {
						item.hide = true;
					}
					var temp = app.getTempBySelector("#gdsTemp3");
					$("#goodsList").append(temp(item));
				}
			});
			if(data.length > 5) {
				$("#goodsList").append(app.getTempBySelector("#showMoreTemp")({}));
			}
			//点击选择支付方式
			$("#paywaySelect").click(function() {
				localStorage.BackUrl = location.href;
				if(isInAppEnviroment()) {
					location.href = "../payment/selectPay.html?money=" + app.totalPrice + "&type=" + app.orderType;
					return;
				}
				location.href = "../html/selectPayforOrder.html?money=" + app.totalPrice + "&type=" + app.orderType;
			});

			if(!localStorage.selectedPayway) {
				localStorage.selectedPayway = 10;
			}
			app.payway = localStorage.selectedPayway;
			var pw = Order.getPayWay(localStorage.selectedPayway)
			$("#payway").text(pw ? pw : "请选择");
			$("#goodsPriceLable").text("商品金额");
			$("#goodsPrice").html(app.getPriceStr(app.totalPrice));
			$("#goodCount").html(app.getPriceStr(app.totalPrice));
		}
		//宅配和自选
		if(app.orderType == 9 || app.orderType == app.ORDER_TYPE_OPTION ||
			app.orderType == app.ORDER_TYPE_PACKAGE) {
			$("#goodsPriceLable").text("商品金额");
			if(app.userInfo && app.userInfo.level != 1){
				if(app.orderType == 9){
                    $("#vipFavourable").hide();
				} else {
                    $("#vipFavourable").show();
				}
				$("#goodsPrice").text('¥' + app.totalPrice.toFixed(2)).css("text-decoration","line-through");
			}else{
				$("#vipFavourable").hide();
				$("#goodsPrice").text('¥' + app.totalPrice.toFixed(2)).css("color","orange");
			}
            $("#payway").text(Order.getPayWay("20"));
			if(app.orderType != 9){
                kg = app.goodsVerVal.toFixed(2);
                var totalMoney = (app.totalPrice - app.goodsVerVal).toFixed(2);
                $("#vipCount").html(app.getPriceStr(kg));
		loadVegetable();
                if(!checkUserBalance(kg*1 + freight*1 - vegetableValue)) {
                    showBalanceTip();
                    $("#buyBtn").unbind("click");
                    $("#buyBtn").removeClass("app_bg_green");
                    $("#buyBtn").css("background","#dbdbdb");
                }
			}

		
		}
		if(app.orderType == 8){
            $.each(data, function(i, item) {
                if(item) {
                    item.buyNum = getSkuNum(item.id);
                    app.totalPrice += parseFloat(item.sellprice) * item.buyNum;
                    if(i > 4) {
                        item.hide = true;
                    }
                    var temp = app.getTempBySelector("#gdsTemp8");
                    $("#goodsList").append(temp(item));
                }
            });
            if(data.length > 5) {
                $("#goodsList").append(app.getTempBySelector("#showMoreTemp")({}));
            }
            //点击选择支付方式
            $("#paywaySelect").click(function() {
                localStorage.BackUrl = location.href;
                location.href = "../html/selectPayforOrder.html?money=" + app.totalPrice + "&type=" + app.orderType;
            });

			if(!localStorage.selectedPayway) {
				localStorage.selectedPayway = 10;
			}
			app.payway = localStorage.selectedPayway;
			var pw = Order.getPayWay(localStorage.selectedPayway)
			$("#payway").text(pw ? pw : "请选择");
			$("#goodsPriceLable").text("商品金额");
			$("#goodsPrice").html(app.getPriceStr(app.totalPrice));
			$("#totalBox").show();
			$("#goodCount").html(app.getPriceStr(app.totalPrice));
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
			if(app.orderType == 9 || app.orderType == 1 || app.orderType == 2) {
				loadDeliveryDate(); //加载配送日期
				$("#DeliveryDateBox").show(); //显示配送日期
			}
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
	//蔬菜券
	function loadVegetable(){
		app.allPrice = app.totalPrice;
	     var skuids = "";
        $.each(app.skus, function(i, item) {
            skuids += "," + item.skuid ;
        });
        skuids = skuids.replace(",","");
        var vegetableParam = {};
        vegetableParam.skuids = skuids;
        vegetableParam.price = app.goodsVerVal;
		vegetableParam.couponType = 2;
		vegetableParam.couponStatus = 1;
        app.getVegetable(vegetableParam,function (res) {
			if(res &&　res.length > 0){
				app.vegetable = res[0];
				var useCoupon = app.getLocalObject("use_coupon");
                if(useCoupon){
                    app.vegetable = useCoupon;
                    localStorage.use_coupon = "";
                }
                if(res && res.length > 1){
                    $("#vegetableLength").text(res.length);
                    $("#vegetableBox").addClass("aui-list-item-arrow");
                    $("#vegetableBox").on("click",function () {
                        localStorage.BackUrl = location.href;
                        app.href("selectCoupon.html?skuids=" + skuids + "&price=" + app.allPrice + "&couponId="+app.vegetable.id + "&back=true" + "&vegetable=" + 1 );
                    });
                    $("#vegetableMore").show();
                }
				if(app.vegetable.value > 0){
					if(app.totalPrice > app.vegetable.value){
						$("#vegetable").html("-" + app.getPriceStr(app.vegetable.value));
						$("#vegetableBox").show();
					}
				}
			}
			vegetableValue = app.vegetable?app.vegetable.value:0;
			var kgVegetable = kg*1 - vegetableValue*1;
			freight = fare.vegetableFare(kgVegetable);//计算物流费
			if(localStorage.addressType == 2){
				freight = 0;
			}
			$("#freight").html(app.getPriceStr((freight*1).toFixed(2)));
            $("#goodCount").html(app.getPriceStr(kg*1 + freight*1 - vegetableValue*1));
        });
	}
//  //赠送斤数200克以内
//  function freemoney(){
//  	var Token = localStorage.loginedToken;
//		var Total = app.goodsVerVal/1000;
//  	app.POSTRequest("/weixin/mall/order/reducePound.do", {
//                  data: {
//                      loginedtoken:Token,
//                      totalValue:Total 
//                  },
//                  success: function(data) {   
//                  	console.log(data);
//	                    var derate = data.resultObj;                    
//	                    if(derate.flag == "true"){
//	                    	$(".mitigate").show();
//	                    	$("#goodSurplus").text(derate.reduce + 'kg');
//	                    	$("#goodCount").text((userBalance/1000).toFixed(2)+'kg');
//	                    	reduce = derate.reduce;
//	                    }else{	  
//	                    	reduce = 0;
//	                    	$("#goodCount").text(Total.toFixed(2) + "kg");
//					        if(userBalance < app.goodsVerVal){
//						       showBalanceTip();
//					        }
//	                    }
//                  }
//         });
//  }
	//加载用户信息 主要是加载用户的余额
	function loadUser() {
		app.getUser(function(user) {
            app.userInfo = user;
			$("#userMobile").text(user.mobile);
			userBalance = Number(user.cashMoney); //用户余额
//			if(app.orderType == app.ORDER_TYPE_OPTION
//				|| app.orderType == app.ORDER_TYPE_PACKAGE) {
//				freemoney();
//			}

            app.POSTRequest_m("member/closepay/payQuery.do", {
            	async:false,
                success: function(data) {
                    if(data.resultCode == 1) {
                        if(!data.resultObj || data.resultObj.length == 0) {
                            return;
                        }
                        closepays = data.resultObj;
					}
				}
            });
			//礼品卡订单
			if(app.orderType == app.ORDER_TYPE_ENTITY_CARD ||
				app.orderType == app.ORDER_TYPE_ELECTRONIC_CARD) {
				app.allPrice = app.totalPrice;
				if(user.deposit > 0) {
					$("#deposit").html("-" + app.getPriceStr(user.deposit));
					app.totalPrice -= user.deposit;
					if(app.totalPrice < 0) {
						app.totalPrice = 0;
					}
					$("#depositBox").show();
				}
				var skuids = "";
				$.each(app.skus, function(i, item) {
					skuids += "," + item.skuid;
				});
				skuids = skuids.replace(",", "");
				var couponParam = {};
				couponParam.skuids = skuids;
				couponParam.price = app.allPrice;
				couponParam.couponType = 1;
				couponParam.couponStatus = 1;
				app.getCoupon(couponParam, function(res) {
					if(res && 　res.length > 0) {
						app.coupon = res[0];
						var useCoupon = app.getLocalObject("use_coupon");
						if(useCoupon) {
							app.coupon = useCoupon;
							localStorage.use_coupon = "";
						}
						if(res && res.length > 1) {
							$("#couponLength").text(res.length);
							$("#couponBox").addClass("aui-list-item-arrow");
							$("#couponBox").on("click", function() {
								localStorage.BackUrl = location.href;
								app.href("selectCoupon.html?skuids=" + skuids + "&price=" + app.allPrice + "&couponId=" + app.coupon.id + "&back=true");
							});
							$("#couponMore").show();
						}
						if(app.coupon.value > 0) {
							app.totalPrice -= app.coupon.value
							//if(app.totalPrice > app.coupon.value){
								$("#coupon").html("-" + app.getPriceStr(app.coupon.value));
								$("#couponBox").show();
							//}
						}
					}
					$("#totalprice").html(app.getPriceStr(app.totalPrice));
					$("#goodCount").html(app.getPriceStr(app.totalPrice));
				});
			}

		}, function() {
			app.toLoginPage(location.href);
		})
	}

	//加载配送日期
	function loadDeliveryDate() {
		app.POSTRequest("weixin/mall/order/queryOrderDeliveryDate.do", {
			data: {
				addressId: address.id,
				type: 1
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
			data: {
				addressId: kobe.id,
				type: 1,
				deliveryMode: "30"
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

	/**
	 * 显示赠品box
	 */
	app.showGiftBox = function() {
		$("body").append('<div class="dlg_bg"></div>');
		$("#GiftBox").show();
		$("#GiftBox").animateCss("fadeInUp");
		$(".dlg_bg").click(function() {
			app.hideGiftBox();
		});
	};
	//隐藏赠品盒子
	app.hideGiftBox = function() {
		$("#GiftBox").animateCss("fadeOutDown", function() {
			$("#GiftBox").hide();
			$(".dlg_bg").remove();
		});
	}
	/**
	 * 显示要选择的商品
	 * @param {Object} data
	 */
	function appendExchangeProduct(data) {
		var temp = app.getTempBySelector("#selectTemplate");
		app.exchanges = {};
		var width = $(window).width() * 0.4;
		$.each(data, function(i, item) {
			app.exchanges[item.id] = item;
			item.img = app.getImgPath(item.picpath);
			item.boxWidth = width;
			$("#exchanePruductBox").append(temp(item));
		});
		$("#exchanePruductBox .checkBtn").eq(0).addClass("active");
		$("#exchanePruductBox").css("width",(width+15)*data.length+"px");
	}

	/**
	 * 加载兑换商品
	 */
	function loadExchangeProduct() {
		//如果订单类型是自选菜和宅配套餐
		if(app.orderType == app.ORDER_TYPE_OPTION ||
			app.orderType == app.ORDER_TYPE_PACKAGE) {
			var action = "weixin/mall/bottle/myBasket.do";
			var data = {
				beginPage: 1,
				pageSize: 999,
				flag: 1
			};
			app.POSTRequest(action, {
				data: data,
				success: function(data) {
					if(data.resultCode == 1) {
						var pruducts = data.basePageObj.dataList;
						//如果有可兑换的菜
						if(pruducts && pruducts.length > 0) {

							appendExchangeProduct(pruducts);
							$("#exchangegoodsListBox").show();
						}

					}
				}
			});
		}
	}
	/**
	 *点击确定兑换菜品 
	 */
	app.clickSelectExchane = function() {
		var checkBtns = $("#exchanePruductBox .checkBtn.active");
		app.selectedExchangeSku = [];
		$.each(checkBtns, function(i, item) {
			var skuid = $(item).attr("data-sku");
			app.selectedExchangeSku.push(skuid);
		})
		appendSelectedExchangeProduct()
		app.hideGiftBox();
	}

	function appendSelectedExchangeProduct() {
		//清空容器
		$("#exchangegoodsList .productItem").remove();
		if(app.selectedExchangeSku.length > 0) {
			var temp = app.getTempBySelector("#exchanePruductItemTemp");
			app.selectedExchangeSku.map(function(id) {
				var sku = app.exchanges[id];
				$("#exchangegoodsList ").append(temp(sku));
			});
			$("#exchangegoodsList .aui-list-item-right").text("重新选择");
			
		} else {
			$("#exchangegoodsList .aui-list-item-right").text("点击选择");
		}
	}

	return app;
});