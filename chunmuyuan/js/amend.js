//订单详情
define(["base/baseApp", "./base/order","picker"], function(app, Order,Picker) {

    var dialog = new auiDialog({});

	var localSkus = {};

	var localSkuMap = {};
	
	var selectskus = app.getLocalObject("selectskus");
	if(!selectskus){
		selectskus = {};
	}
	
	var selectskus1 = app.getLocalObject("selectskus1");
	if(!selectskus1){
		selectskus1 = {};
	}
	var temp;

	var oldOder = {};

	var oldfee;

	var addfee;

	var newfee;

	var userBalance = 0;

	var currentUser = {};

	var userAddressId = 0;
    //配送日期
    app.DeliveryDate = null;
	
	app.initPage = function() {
	};
	
	function isEmpty(obj)
	{
	    for (var name in obj) 
	    {
	        return false;
	    }
	    return true;
	}
	//开始执行
	app.init = function() {
		var kobe = app.UrlParams.oid;
        localStorage.selectztAdressBackUrl = "";
        localStorage.selectAdressBackUrl = "";
		$("#addNext").bind("click", function() {
			app.setLocalObjet("selectskus1",selectskus);
			app.setLocalObjet("localcombo",localSkus);
            window.location.href = "selectOptional.html?oid=" + kobe;
        });
		if(app.checkLogin()) {
            loadCurrUser();
			loadOrder();          
		} else {
			app.toLoginPage(location.href);
		}
	};
	//显示价格
	function showPrice(price) {
		$("#price").html(app.getPriceStr(price));
		$("#priceLable").text("商品金额：");
	}
	app.order = null;
	//加载订单
	function loadOrder() {
		Order.getOrder(app.UrlParams.oid, function(order) {
			console.log(order);
			if(order.closepayid){
                app.POSTRequest_m("member/closepay/detail.do",{
                	async:false,
                	data:{
                		id:order.closepayid
					},
					success:function (data) {
						if(data.resultCode == '1' && data.resultObj){
							if(data.resultObj.remain*1 > data.resultObj.mastervirtualmoney*1){
                                userBalance = data.resultObj.mastervirtualmoney*1;
							} else {
                                userBalance = data.resultObj.remain*1;
							}
						}
                    }
				});
			} else {
                userBalance = currentUser.virtualmoney; //用户余额
			}
			console.log(userBalance);
            $.extend(oldOder,order);
			//判断地址是自提还是配送
			app.order = order;
            if(app.order.deliverymode == 30){
				$("#orderStatus").text("待自提");
			} else {
                $("#orderStatus").text("待发货");
			}
            calOldAllfee();
	        loadAddress();
			showPayType(order);
			showBtns(order);
			showLogistics(order);
			$("#logisticsprice").html("+ " + app.getPriceStr(0));
			app.orderType = order.type;
			if(order.type == 1 || order.type == 2 || order.type == 3) {
				$("#remark").show();
				$("#search-input").val(order.message);
			}
			if(order.type == 1 || order.type == 2 || order.type == 7) {
				showDeliveryTime(order);
				showVarval(order.virtualfee);
				if(order.type == 1 || order.type == 7) {
					showProduct1(order);
				} else {
					showProduct2(order);
				}

                calAllthings();
			}
			var deposit = order.deposit;
			if(deposit && deposit > 0) {
				$("#depositbox").show();
				$("#depositbox .app-text-orange").html("- " + app.getPriceStr(deposit));
			}
			if(order.type == 5) {
				showProduct3(order);
				showPrice(order.sprices);
				$("#totalbox").show();
				$("#totalbox .app-text-orange").html(app.getPriceStr(order.actualpaied));
			}

			if(order.type == app.ORDER_TYPE_ELECTRONIC_CARD ||
				order.type == app.ORDER_TYPE_ENTITY_CARD ||
				order.type == app.ORDER_TYPE_OFFLINE_CARD) {
				showProduct3(order);
				showPrice(order.sprices);
				if(order.type == app.ORDER_TYPE_ELECTRONIC_CARD) {
					loadUser(order)
				} else {
					showAddress(order);
				}

				$("#totalbox").show();
				$("#totalbox .app-text-orange").html(app.getPriceStr(order.actualpaied));
			};
		});
	}
	/**加载地址信息*/
	function loadAddress() {
		//获取本地存储的地址
		var data ;
        if(app.order.deliverymode == 30){
            data = app.getLocalObject("selectztAddress");
            if(data){
                userAddressId = data.id;
            }
        } else {
            data = app.getLocalObject("selectAddress");
            if(data){
                userAddressId = data.id;
            }
        }
        if(!data){
            data = app.order.oaddModel;
            userAddressId = 0;
        }
	    address = data;
		console.log(address);
	    showAddress();
	}
	
	function showAddress(){
		var url = "addressSelect.html";
		if(app.order.deliverymode == 30){
	        url = "addressSelect_Since.html"
            localStorage.selectztAdressBackUrl = location.href;
        } else {
            localStorage.selectAdressBackUrl = location.href;
		}
		$(".Name").text(address.consignee);
		$("#addressPhone").text(address.mobile);
		$("#addressFull").text(address.fulladdress);
		$("#address").bind("click", function() {
            app.setLocalObjet("selectskus1",selectskus);
            app.setLocalObjet("localcombo",localSkus);
            location.href = url;
        });
		loadDeliveryDate(); //加载配送日期
	}

	var weekName = {
		"1":"周一",
		"2":"周二",
		"3":"周三",
		"4":"周四",
		"5":"周五",
		"6":"周六",
		"7":"周日"
	};
	
	//加载配送日期
	function loadDeliveryDate() {
		app.POSTRequest("weixin/mall/experiencecard/getLaterWeekdayByCity.do", {
			data:{
                cityId:address.cityid,
                deliveryMode:app.order.deliverymode
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
					if(!deliDate || deliDate.length == 0){
						return ;
					}
					app.DeliveryDate = deliDate[0].date;
                    var olddeliverydate = app.order.targetdeliverydate.split(" ")[0];
                    if(!userAddressId && olddeliverydate > deliDate[0].date){
                        app.DeliveryDate = olddeliverydate;
                        var date = new Date(Date.parse(olddeliverydate.replace(/-/g, "/")));
                        $("#targetdeliverydate").text(olddeliverydate + "[" + weekName[(date.getDay() == 0?7:date.getDay())] + "]");
					} else {
                        $("#targetdeliverydate").text(deliDate[0].date + "[" + deliDate[0].week + "]");
					}
				} else {
					app.tipInfo(data.resultMsg);
				}
			}
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
			$("#targetdeliverydate").text(data[selectedIndex[0]].text);
			app.DeliveryDate = selectedVal[0];
		});
		$("#targetdeliverydatebox").bind("click", function() {
			picker.show();
		});
	}
	//显示支付方式
	function showPayType(order) {
		$("#payType").text(Order.getPayWay(order.payway));
	}
	//显示最新的订单日志
	function showLogistics(order) {
		var log = order.logs[0];
		$("#delivertime").text(log.createtime);
	}
	//显示配送时间
	function showDeliveryTime(order) {
		$("#targetdeliverydatebox").show(); //显示配送日期
		$("#targetdeliverydate").text("加载中...");
	}
	//显示按钮组
	function showBtns(order) {
		var group = Order.getBtnGroupId(order);
		order = jQuery.extend(order, order, group);
		var temp = app.getTempBySelector("#btnGroup");
		if((!group.btnCancle) && (!group.btnCommend) && (!group.btnQrcode) && (!group.btnDelete)) {
			$("#footer").hide();
		}
		$("#btns").html(temp(order));
	}
	
	function showLocal_1(items){
		var localcombo = app.getLocalObject("localcombo");
		var tempItems = []
		if(localcombo){
			$.each(items, function(i, it){
				if(localcombo[it.skuid] || localcombo[it.skuid] == 0){
                    it.refundamount = localcombo[it.skuid];
                    it.amount = localcombo[it.skuid];
                    localSkus[it.skuid] = it.refundamount;
                    localSkuMap[it.skuid] = it;
                    tempItems.push(it);
				}
			});
			localStorage.localcombo = "";
		} else {
			$.each(items, function(i, it){
                tempItems.push(it);
				localSkus[it.skuid] = it.amount;
                localSkuMap[it.skuid] = it;
			});
		}
		showGoods_1(tempItems);
	}
	
	function showSelectskus1_1(){
		var selectskuarr1 = [];
		if(selectskus1){
			for(var key in selectskus1){
				selectskuarr1.push(selectskus1[key]);
			}
			localStorage.selectskus1 = "";
			
			showGoods_1(selectskuarr1);
		}
		return selectskuarr1;
	}
	
	function showSelectskus_1(){
		var selectskuarr = [];
		if(selectskus){
			for(var key in selectskus){
				selectskuarr.push(selectskus[key]);
			}
			localStorage.selectskus = "";
			showGoods_1(selectskuarr);
		}
		return selectskuarr;
	}
	
	function showGoods_1(data){
		$.each(data, function(i, item) {
			$("#goodsList").append(temp(item));
		});
	}
	//显示商品1-自选菜
	function showProduct1(order) {
		var data = order.items;
		temp = app.getTempBySelector("#gdsTemp1");
		showLocal_1(data);
		var selectskuarr1 = showSelectskus1_1();
		var selectskuarr = showSelectskus_1();
		
		$.each(selectskuarr1, function(i, it) {
			selectskus[it.skuid] = it;
		});
	}
	//显示宅配套餐商品
	function showProduct2(order) {
		//comboItems宅配里面的单品
		var item = order.items[0];
		console.log(item);
		temp = app.getTempBySelector("#gdsTemp2");

		showLocal_2(item);
		
		var selectskuarr1 = showSelectskus1_2(item);
		
		var selectskuarr = showSelectskus_2(item);
		
		$.each(selectskuarr1, function(i, it) {
			selectskus[it.skuid] = it;
		});
	}
	//显示商品-卡
	function showProduct3(order) {
		var data = order.items;
		var temp = app.getTempBySelector("#gdsTemp3");
		$.each(data, function(i, item) {
			console.log(item);
			if(item) {
				if(i > 4) {
					item.hide = true;
				}
				$("#goodsList").append(temp(item));
			}
		});
		if(data.length > 5) {
			$("#goodsList").append(app.getTempBySelector("#showMoreTemp")({}));
		}
	}
	app.clickMinus = function(el, e, sku) {
		var num = $(el).next().val();
		if(num <= 0) {
			$(el).next().val(0);
			return;
		}
		var count = --num;
		$(el).next().val(count);
		if(localSkus[sku] || localSkus[sku] == 0){
			localSkus[sku] = count;
		}
		
		if(selectskus[sku]){
		    selectskus[sku].count = count;
		    selectskus[sku].refundamount = count;
		}
        calAllthings();
	};
	app.clickPlus = function(el, e, sku) {
		var num = $(el).prev().val();
		var count = ++num;
	    $(el).prev().val(count);
		if(localSkus[sku] || localSkus[sku] == 0){
			localSkus[sku] = count;
		}
		
		if(selectskus[sku]){
		    selectskus[sku].count = count;
		    selectskus[sku].refundamount = count;
		}
        calAllthings();
	};
	//点击提交按钮
	app.clickNext = function(){

        dialog.alert({
            title:"提示",
            msg: "确认提交并支付订单",
            buttons:['取消','确定']
        },function (ret) {
			if(ret.buttonIndex == 2){
                app.submitPay();
			}
        });
	}

	// 提交并支付
	app.submitPay = function(){
		var skuarr = [];
		for(var key in localSkus){
			if(localSkus[key] > 0){
                var sku = {
                    "skuid":key*1,
                    "amount":localSkus[key]
                }
                skuarr.push(sku);
			}
		}

		for(var key in selectskus){
			var amount = "";
			if(oldOder.type == 1){
                amount = selectskus[key].refundamount;
			} else if (oldOder.type == 2){
                amount = selectskus[key].count;
			}
			if(amount > 0){
                var sku = {
                    "skuid":key*1,
                    "amount":amount
                }
                skuarr.push(sku);
			}
		}

        var orderId = oldOder.id;
        var addressId = userAddressId;
        var targetdeliverydate = app.DeliveryDate;
		var skus = JSON.stringify(skuarr);

        var data = {};
        data.message = $("#search-input").val().replace(/[\ud800-\udbff][\udc00-\udfff]/g,'').trim();
        if(orderId){
            data.orderId = orderId;
		} else {
            app.tipInfo("订单id不能为空");
            return;
		}
        if(addressId){
            data.userAddressId = addressId;
        }
        if(targetdeliverydate){
            data.targetdeliverydate = targetdeliverydate;
        } else {
            app.tipInfo("配送时间不能为空");
            return;
        }
		if(skus){
            data.skus = skus;
        }

        console.log(data);

        app.POSTRequest("weixin/mall/order/pay4Modify.do", {
            data: data,
            success: function(data) {
                if(data.resultCode == 1) {
                    app.replace("paysuccess.html?oid="+orderId+"&modify=1&deliverymode="+app.order.deliverymode+"&type="+app.order.type);
                } else {
                    app.tipInfo(data.resultMsg);
                }
            }
        });

    }
	
	function showLocal_2(item){
		var combo = item["comboItems"];
		var localcombo = app.getLocalObject("localcombo");

		var tempCombo = [];
		if(localcombo){
			$.each(combo, function(i, it){
				if(localcombo[it.skuid] || localcombo[it.skuid] == 0){
                    it.count = localcombo[it.skuid]*item.amount;
                    localSkus[it.skuid] = it.count/item.amount;
                    localSkuMap[it.skuid] = it;
                    tempCombo.push(it);
				}
			});
			localStorage.localcombo = "";
		} else {
			$.each(combo, function(i, it){
                tempCombo.push(it);
				localSkus[it.skuid] = it.count/item.amount;
                localSkuMap[it.skuid] = it;
			});
		}
		
		showGoods(tempCombo, item);
	}
	
	function showSelectskus1_2(item){
		var selectskuarr1 = [];
		var selectskuarr11 = [];
		if(selectskus1){
			for(var key in selectskus1){
                var selectsku = {};
                $.extend(selectsku,selectskus1[key]);
                selectsku.count = selectskus1[key].count * item.amount;
				selectskuarr1.push(selectsku);
                selectskuarr11.push(selectskus1[key]);
			}
			localStorage.selectskus1 = "";
			
			showGoods(selectskuarr1, item);
		}
		return selectskuarr11;
	}
	
	function showSelectskus_2(item){
		var selectskuarr = [];
		if(selectskus){
			for(var key in selectskus){
                var selectsku = {};
                $.extend(selectsku,selectskus[key]);
                selectsku.count = selectskus[key].count * item.amount;
				selectskuarr.push(selectsku);
			}
			localStorage.selectskus = "";
			
			showGoods(selectskuarr, item);
		}
		return selectskuarr;
	}
	
	function showGoods(combo, item){
		$.each(combo, function(i, it) {
			it.refundamount = item.amount;
			it.traceback = item.traceback == "true";
			$("#goodsList").append(temp(it));
		});
	}
	
	app.toTrace = function(flag, sn) {
		if(flag)
			location.href = "../Trace/projectTempDemo.html?orderid=" + app.order.id + "&skusn=" + sn;
	};
	//显示扣减的虚拟斤数
	function showVarval(num) {
		$("#priceLable").text("已支付斤数：");
		$("#price").text((num / 1000).toFixed(2) + "kg");
        $("#oldprice").text((num / 1000).toFixed(2));
        //calAllthings(num);
		//$("#allthings").text((num / 1000).toFixed(2) + "kg");
	}
	//显示余额，小于3就提示
	function showBalance(varval) {
		$("#varvalbox").show();
		if(varval < 3) {
			$("#balanceTip").show();
		} else {
			$("#balanceTip").hide();
		}

		$("#varval").text(varval + "kg");
	}
	//加载用户信息
	function loadUser(order) {
		app.getUser(function(user) {
			if(order.type == app.ORDER_TYPE_ELECTRONIC_CARD) {
				$("#addressdzk").show();
				$("#userMobile").text(user.mobile);
			}
		});
	};
	//去支付
	app.toPay = function(id) {
		var order = app.order;
		if(order.type == app.ORDER_TYPE_OPTION ||
			order.type == app.ORDER_TYPE_PACKAGE) {
			location.href = "../html/confirmpay.html?oid=" + order.id + "&ono=" + order.orderno +
				"&money=" + order.virtualfee + "&type=" + order.type;
		} else {
			location.href = "../html/confirmpay.html?oid=" + order.id + "&ono=" + order.orderno +
				"&money=" + order.actualpaied +
				"&type=" + order.type + "&payway=" + order.payway +
				"&virtualfee=" + order.virtualfee / 1000;
		}
	};

	//去评论
	app.toCommend = function(id) {
		app.setLocalObjet("evaorder", app.order);
		location.href = "../html/evaluation.html?oid=" + id;
	};

	//查看订单日志
	app.toLogisticsDetails = function(id) {
		location.href = "../html/logisticsDetails.html?oid=" + id;
	};
	//取消订单
	app.cancleOrder = function(id) {
		var dialog = new auiDialog();
		dialog.alert({
			title: "提示",
			msg: '是否取消该订单?',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				Order.cancleOrder(id, function() {
					app.replace(location.href);
				});
			}
		});
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
	//显示二维码
	app.showCode = function() {
		$("body").append("<div class='dlg_bg' ></div>");
		$("body").append("<div onclick='app.hideCode()' id='qrcodebox' style='position:fixed;z-index:1000;top:0;bottom:0;width:100%;'><div class='center_outter' style='width:100%;height:100%'><div class='center_inner'><img src='" + app.order.qrcode.replace("/image/", "") + "' width='70%'></div></div></div>")
		$("#qrcodebox").on("touchmove", function(e) {
			app.stopBubble(e);
			e.preventDefault();
		});
		$(".dlg_bg").on("touchmove", function(e) {
			app.stopBubble(e);
			e.preventDefault();
		});
		$("#qrcodebox").animateCss("zoomIn");
	};
	//隐藏二维码
	app.hideCode = function() {
		$("#qrcodebox").animateCss("zoomOut", function() {
			$(".dlg_bg").remove();
			$("#qrcodebox").remove();
		});
	};
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
	};

    app.selectAll = function(){
        var selectAll = true;
        $("#goodsList li .checkBtn").each(function(index,el) {
			if(!$(el).hasClass("active")){
                selectAll = false;
			}
        });
        if(selectAll){
            $("#goodsList li .checkBtn").removeClass("active");
		} else {
            $("#goodsList li .checkBtn").addClass("active");
		}
	};

	app.selectOne = function(me,id){
    	if($(me).hasClass("active")){
            $(me).removeClass("active");
		} else {
            $(me).addClass("active");
		}
        var selectAll = true;
        $("#goodsList li .checkBtn").each(function(index,el) {
        	if(!($(el).attr("id") == "checkAllBtn")){
                if(!$(el).hasClass("active")){
                    selectAll = false;
                }
			}
		});

        if(selectAll){
            $("#checkAllBtn").addClass("active");
        } else {
            $("#checkAllBtn").removeClass("active");
        }
	};

    app.delSelect = function(){
        $("#goodsList li .checkBtn.active").each(function (index,el) {
            if(!($(el).attr("id") == "checkAllBtn")){
                var skuid = $(el).attr("data-sku");
                if(localSkus[skuid] || localSkus[skuid] == 0){
					delete localSkus[skuid];
				}

				if(selectskus[skuid]){
					delete selectskus[skuid];
				}
                $(el).closest("li").remove();
			}
		});
        calAllthings();
	};

	function calOldAllfee(){
		var num = 0;
        if(oldOder.type == 1){
           var items = oldOder.items;
           for(var i=0;i<items.length;i++){
               num += items[i].amount * items[i].virtualfee;
		   }
        } else if(oldOder.type == 2) {
            var item = oldOder.items[0];
            var combos = item["comboItems"];
            $.each(combos,function (i, it) {
                num += it.count * it.virtualfee;
            });
        }
        oldfee = num;
	}

    function calAllthings(){
    	var num = 0;
    	if(app.order.type == 1){
            for(var key in localSkus){
                num += localSkus[key] * localSkuMap[key].virtualfee
            }

            for(var key in selectskus){
                num += selectskus[key].refundamount * selectskus[key].virtualfee;
            }
		} else if(app.order.type == 2) {
            for(var key in localSkus){
                num += localSkus[key] * localSkuMap[key].virtualfee
            }

            for(var key in selectskus){
                num += selectskus[key].count * selectskus[key].virtualfee;
            }

            num = num*app.order.items[0].amount;
		}
		addfee = (num - oldfee);
        newfee = (num - oldfee) + oldOder.virtualfee;

        $("#allthings").text((newfee / 1000).toFixed(2) + "kg");
        $("#feeprice").text((addfee / 1000).toFixed(2));
        if(addfee > userBalance){
			$("#notEnough").css("display","");
		} else {
            $("#notEnough").css("display","none");
		}

		if(addfee < 0){
            $("#lg_old_price").css("display","none");
            $("#sg_old_price").css("display","block");
		} else {
            $("#lg_old_price").css("display","block");
            $("#sg_old_price").css("display","none");
		}

		if(addfee < 0 || addfee > userBalance){
			$("#dis_nextBtn").css("display","block");
			$("#nextBtn").css("display","none");
		} else {
            $("#dis_nextBtn").css("display","none");
            $("#nextBtn").css("display","block");
		}
	}

    function loadCurrUser() {
        app.getUser(function (user) {
            $("#userMobile").text(user.mobile);
            currentUser = user;
        });
    }

    return app;
});