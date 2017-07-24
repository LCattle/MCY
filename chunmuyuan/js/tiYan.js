//确认订单
define(["base/baseApp", "dialog", "picker", "./base/baseCar", "./base/baseCardCar", "./base/order"], function(app, dialog, Picker, car, cardCar, Order) {
	app.initPage = function() {};

	app.skus = app.getLocalObject("selectProduts"); //订单skuid及购买数量
	//收货地址
	var address = null;
	//用户token
    var lt = localStorage.loginedToken;

    var tastecardid = app.UrlParams.tastecardid;

    var skuid = app.UrlParams.skuid;

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
	
	//开始执行
	app.init = function() {

        loadOrder2();
		
		loadAddress(); //加载地址信息
		
		$("#paywaySelect").removeClass("aui-list-item-arrow");
		$("#buyBtn").bind("click", function() { //绑定提交订单按钮
			if(app.orderType == ""){
			  app.tipInfo("请添加地址");
			}else{
				var paramdata = {
                    loginedtoken:lt,
                    tastecardid:tastecardid,
                    addressId:app.getLocalObject("ty_selectAddress").id,
                    delivertime:app.DeliveryDate,
                    delivertime1:app.DeliveryDate1,
                    goods:skuid+":1",
                    goods1:skuid+":1"
                };
                app.POSTRequest("weixin/mall/order/deliveryGoodsSubmitOrder.do", {
                    data:paramdata,

                    success: function(data) {
                        if(data.resultCode == 1) {
							var oid = data.resultObj[0].id;
                            localStorage["ty_selectAddress"] = "";
                            location.href = "../html/ty_paysuccess.html?oid="+oid;
                        } else {
                            app.tipInfo(data.resultMsg);
                        }
                    }
                });
			}
		});
	};

	/**地址信息同步到页面*/
	function initAddressInfo() {
		if(!address) { //如果没有地址提示用户去添加地址
			$("#addressInfo").hide();
			$("#addressAdd").show();
		} else { //初始化地址信息
			$("#adName").text(address.consignee);
			$("#adPhone").text(address.mobile);
			$("#adFull").text(address.fulladdress);
			loadDeliveryDate();
			//显示配送日期
		}
		$("#addressAdd").bind("click", function() {
			localStorage.addressBackUrl = location.href;
			location.href = "addressEdit_tastecard.html";
		});
		$("#addressInfo").bind("click", function() {
            localStorage.selectAdressBackUrl = location.href;
            location.href = "addressSelect_ty.html";
		});
	}
	/**加载地址信息*/
	function loadAddress() {
		//获取本地存储的地址
		var data = app.getLocalObject("ty_selectAddress");
		if(data && data.id) { //如果存在且有id
			address = data;	
			initAddressInfo();			
		} else {
			//加载默认地址
			loadDefAddress();
		}
	}
	/**加载默认地址*/
	function loadDefAddress(){
		app.POSTRequest_m("/member/address/getDefaultAddress.do", {
			success: function(data) {
				if(data.resultCode == 1) {
					address = data.resultObj;
					app.setLocalObjet("ty_selectAddress", address);
					initAddressInfo();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}

	//加载配送日期
	function loadDeliveryDate() {
		app.POSTRequest("/weixin/mall/experiencecard/queryExperienceCardDate.do", {
			data:{
				addressId:app.getLocalObject("ty_selectAddress").id,
				type:2
			},
			success: function(data) {
				if(data.resultCode === "1") {
					console.log(data);
					var deliDate = data.resultObj;
					initPicker(deliDate.map(function(item, index) {
						return {
							text: item.date + "[" + item.week + "]",
							value: item.date
						}
					}));
                    app.DeliveryDate = deliDate[0].date;
                    app.DeliveryDate1 = deliDate[1].date;
					$("#DeliveryDate").text(deliDate[0].date + "[" + deliDate[0].week + "]");
					$("#DeliveryDate1").text(deliDate[1].date + "[" + deliDate[1].week + "]");
					$("#DeliveryDateBox").show(); 
					$("#DeliveryDateBox1").show();
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
		});
	}

	//选择配送日期
	function initPicker(data) {
		var picker = new Picker({
			data: [
				data
			],
			selectedIndex: [0],			
			title: '选择配送日期'
		});
		
		var picker1 = new Picker({
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
	    picker1.on('picker.select', function(selectedVal, selectedIndex) {
			$("#DeliveryDate1").text(data[selectedIndex[0]].text);
			app.DeliveryDate = selectedVal[0];
		});
		
		$("#DeliveryDate").parent().parent().bind("click", function() {
			picker.show();
		});
		$("#DeliveryDate1").parent().parent().bind("click", function() {
			picker1.show();
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

    //按订单2的方式去加载
    function loadOrder2() {
        if(skuid) {
            //网络请求商品数据
            app.POSTRequest("weixin/mall/sku/queryPackageBySkuid.do", {
                data: {
                    comboId: skuid
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

    //显示商品信息
    function showSkus(data) {
		var item = data["package"];
		console.log(data);
        item.buyNum = 2;
        app.goodsVerVal += parseFloat(item.virtualvalue) * item.buyNum;
        var temp = app.getTempBySelector("#gdsTemp2");
        $("#goodsList").append(temp(item));
        var combo = data["combo"];
        temp = app.getTempBySelector("#gdsTemp4");
        $.each(combo, function(i, it) {
            $("#skubox_" + item.id).append(temp(it));
        });

        var tw = item.weight*2/1000;
        $("#goodCount").text(tw+"kg");
        $("#goodsPrice").text(tw+"kg");
    }

	return app;
});