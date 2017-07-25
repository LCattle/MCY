//购物车
define(["base/baseApp", "refresher", "animate", "./base/baseCar","./base/discount"], function(app, refresher, animate, car, discount) {
	app.car = car;

    app.getStartFee();

    app.skuStock = {};

	app.clickPlus = function(el, e, sku) {
        if((app.car.data[sku].skucount + 1) > app.skuStock[sku].stock){
            app.tipInfo(app.skuStock[sku].skuname + "商品库存只有" + app.skuStock[sku].stock + "个哦！");
            return;
		}
		if(app.car.isNetBack) {
			this.car.add(sku, 1, function() {
				app.isCarCallback = true;
				var num = $(el).prev().val();
				$(el).prev().val(++num);
				countWeight();
			});
		}
	};
	app.clickMinus = function(el, e, sku) {
		var num = $(el).next().val();
		if(num <= 1) {
			$(el).next().val(1);
			if($(el).next().val() == 1){
				var dialog = new auiDialog();
				dialog.alert({
					title: "提示",
					msg: '是否从购物车中移除该商品',
					buttons: ['取消', '确定']
				}, function(ret) {
					if(ret.buttonIndex == 2) {
						del(sku, [{
							id: sku
						}]);
					}
				});
			}
			return;
		}
		if(app.car.isNetBack) {
			this.car.minus(sku, 1, function() {
				$(el).next().val(--num);
				countWeight();
			});
		}
	};
	app.clickAll = function(e) {
		if($(e).hasClass("active")) {
			$(".myTab").removeClass("active");
		} else {
			$(".myTab").addClass("active");
		}
	}
	app.stoSkuIds = []; 
	app.addList = function(data) {
		console.log(data);
		app.stoSkuIds = [];
		if(data.length > 0) {
			$("#list").empty();
			if(!app.checkLogin()){//未登录购物车显示状态
				for(var i = 0; i < data.length; i++) {
					if(data[i].stock<1||data[i].product.isonline=="N"){
						data[i].isDisabled = true;
						app.stoSkuIds.push({id:data[i].id});
					}
					data[i].minPrice = (data[i].sellprice).toFixed(2);
					data[i].yuanPrice = "";
				    data[i].up = "";
                    data[i].isShow = 1;
                    data[i].isPadding = true;
					$("#list").append(this.template(data[i]));
			    }
				$("#bookPrice").text("总计:");
			}else{//登录之后购物车显示状态
				for(var i = 0; i < data.length; i++) {
					if(data[i].stock<1||data[i].product.isonline=="N"){
						data[i].isDisabled = true;
						app.stoSkuIds.push({id:data[i].id});
					}
					if(app.level == 1){
						data[i].isShow = 1;
					}else{
						data[i].isShow = 2;
					}
					data[i].minPrice = (data[i].sellprice*app.sellMin).toFixed(2);
					data[i].yuanPrice = "会员价";
				    data[i].up = " ";
					$("#list").append(this.template(data[i]));
			    }
				$("#bookPrice").text(app.vipLeave);
			}
			swipperList();
			if(app.stoSkuIds.length>0){
				$("#list").append(app.getTempBySelector("#shouqing")({}));
			}
		} else {
			
		}
		countWeight();
	};
	
	app.updateCar = function (data) {
        if(data.length > 0) {
            if(app.car.isNetBack) {
            	var flag = true;
				$.each(app.car.data,function (skuid,val) {
					if(val.skucount > app.skuStock[skuid].stock){
						if(flag){
                            flag = false;
                            app.tipInfo(app.skuStock[skuid].skuname + "商品库存只有" + app.skuStock[skuid].stock + "个哦！");
						}
						app.car.minus(skuid, val.skucount - app.skuStock[skuid].stock, function() {
							$("#buynum"+skuid).val(app.skuStock[skuid].stock);
							countWeight();
						});
					}
				});
            }
		}
    };
	/**
	 * 
	 */
	app.removeSq = function(){
		var str = "";
		$.each(app.stoSkuIds, function(i, it) {
			str += "," + it.id;
		});
		del(str.replace(",",""),app.stoSkuIds,true);	
	};
	//加载购物车中的商品
	function loadGoods() {
		app.vipLeave = null;
		app.level = null;
		var ids = car.getSkus();
		if(ids.length < 1) {
			app.emptyList("#list","暂无商品 <span class='app-text-orange' onclick = 'location.href=\"OptionalDishes.html\"'>去逛逛</span>");
			app.pageRefresher.resetload();
			return;
		};
		app.POSTRequest("weixin/mall/sku/queryBySkuid.do", {
			data: {
				skuid: ids
			},
			success: function(data) {
				if(data.resultCode == 1) {
                    app.sellMin = discount.currDiscount();
					$.each(data.resultObj,function (i,it) {
                        app.skuStock[it.id] = it;
                    });
                    app.updateCar(data.resultObj);
					app.addList(data.resultObj);
			    $("#list").on("change",".buynum",function() {
						app.isBuynumChange = true;
						if(!this.value){
			                this.value = 1;
						}
						if(app.car.isNetBack){
			                var skuid = $(this).attr("skuid") * 1;
			                var num = this.value*1;
			                app.car.numSet(skuid,num,function () {
			                    app.isBuynumChange = false;
			                    countWeight();
			                });
						}
			
			        }).on("keyup",".buynum",function() {
			        	if(this.value == "0"){
			                this.value = "";
						} else {
			                this.value = this.value.replace(/\D/g,'');
			                this.value = this.value.substring(0,3);
						}
			        });
				} else {
					app.tipInfo("商品加载失败：" + data.resultMsg);
				}
			},
			complete: function() {
				app.pageRefresher.resetload();
			}
		});
	}
	//初始化下拉刷新
	function initRefresh() {
		app.pageRefresher = refresher.initDropload("#wrapper", function(me) {
			if(car.isNetBack) {
				car.init(function() {
					loadGoods();
		            $("#checkAllBtn").addClass("active");
				});
			} else {
				me.resetload();
			}
		});
	}
	//获取页面选中的商品id
	function getSelectSku() {
		var checkELs = $("#list .checkBtn.active");
		var ids = [];
		for(var i = 0; i < checkELs.length; i++) {
			var id = $(checkELs[i]).attr("data-sku");
			ids.push({
				id: id
			});
		}
		return ids;
	}
	//计算并显示总计重量
	function countWeight() {
		var ids = getSelectSku();
		var sum = 0;
		$.each(ids, function(i, it) {
			var wegiht = $("#skuitem_" + it.id).attr("data-memberprice");
			var item = car.data[it.id];
			var num = item ? item.skucount : 0;
			sum += parseFloat(wegiht) * parseInt(num);
		});
		if(sum < app.startCash) { //提示凑单
			$("#chaKg").text((app.startCash-sum).toFixed(2) + "元");
			$("#infotip").show();
            $("#vipTip").hide();
			$(".btn_submit_order").removeClass("app-bg-orange");
		} else {
			if(!app.checkLogin()){
                $("#vipTip").show();
			}
			$(".btn_submit_order").addClass("app-bg-orange");
			$("#infotip").hide();
		}
		$("#sumWeight").html(sum.toFixed(2) + "元");
	}
	//全选/反选
	app.selectAll = function() {
		var sel = $("#checkAllBtn").hasClass("active");
		if(sel) {
			$(".checkBtn").removeClass("active");
		} else {
			$(".checkBtn").addClass("active");
		}
		countWeight();
	};
	//选择单个
	app.selectOne = function(id) {
		$("#skuitem_" + id + " .checkBtn").toggleClass("active");
		if($("#list .checkBtn").length&&$("#list .checkBtn").length == $("#list .checkBtn.active").length){
			$("#checkAllBtn").addClass("active");
		}else{
			$("#checkAllBtn").removeClass("active");
		}
		countWeight();
	};
	//删除选中的sku
	app.delSelect = function() {
		var ids = getSelectSku();
		if(ids.length == 0) {
			app.tipInfo("您还没有选择任何商品哦");
			return;
		}
		var str = "";
		$.each(ids, function(i, it) {
			str += "," + it.id;
		});
		str = str.replace(",", "");
		var dialog = new auiDialog();
		dialog.alert({
			title: "提示",
			msg: '是否从购物车中移除选择商品',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				del(str, ids);
			}
		});
	};
	app.delOne = function(id) {
		var dialog = new auiDialog();
		dialog.alert({
			title: "提示",
			msg: '是否从购物车中移除该商品',
			buttons: ['取消', '确定']
		}, function(ret) {
			if(ret.buttonIndex == 2) {
				del(id, [{
					id: id
				}]);
			}
		});
	};
	
	//执行删除操作 flag是否删除售罄按钮
	function del(idsStr, ids,flag) {
		car.remove(idsStr, function() {
			$.each(ids, function(i, iem) {
				$("#skuitem_" + iem.id).animateCss(animate.slideOutLeft, function() {
					$("#skuitem_" + iem.id).remove();
				});
			});
			if(flag){
				$("#shouqingBtn").remove();
			}
			setTimeout(function(){
				app.replace(location.href);
			},500);
			countWeight();
		});
	}
	
	app.checkStock = function (ids,callback) {
        if(ids.length < 1) {
            return;
        }
        app.POSTRequest("weixin/mall/sku/queryBySkuid.do", {
            data: {
                skuid: ids
            },
            success: function(data) {
                if(data.resultCode == 1) {
                    for(var i = 0,iLenght = data.resultObj.length;i<iLenght;i++){
                        var it = data.resultObj[i];
                        if(it.stock < app.car.data[it.id].skucount){
                        	app.tipInfo(it.skuname + "库存不足！");
                            return ;
                        }
                    }
                    callback();
                } else {
                    app.tipInfo(data.resultMsg);
                }
            },
            complete: function() {

            }
        });
    };
	//点击去结算
	app.toSubmit = function(e) {
		if($(e).hasClass("app-bg-orange")) {
			var startTime = new Date().getTime();
			var interval = setInterval(function(){
                var endTime = new Date().getTime();
                console.log((endTime - startTime) > 5*1000);
                console.log(app.isBuynumChange);
                if((endTime - startTime) > 5*1000){
                    clearInterval(interval);
                    return;
                }
                if(app.isBuynumChange){
					return;
				}
                var ids = getSelectSku();
				var sum = 0;
				$.each(ids, function(i, it) {
					var wegiht = $("#skuitem_" + it.id).attr("data-virtualvalue");
					var item = car.data[it.id];
					var num = item ? item.skucount : 0;
					sum += parseFloat(wegiht) * parseInt(num);
				});	
				if(sum < app.startCash) { //提示凑单
					app.tipInfo("对不起，小于最低下单金额无法提交订单");
					clearInterval(interval);
					return;
				}
				var ary = [];
				var strIds = "";
				$.each(ids, function(i, item) {
					var carObj = car.data[item.id];
					if(carObj && carObj.skucount > 0) {
						ary.push({
							skuid: item.id,
							num: carObj.skucount
						});
	                    strIds += "," + item.id;
					}
				});
	            strIds = strIds.replace(",","");
	            if(!app.checkLogin()){
	                app.toLoginPage(location.href);
                    clearInterval(interval);
                    re
				}
	            app.checkStock(strIds,function () {
	                //清空选择地址
	                app.setLocalObjet("selectAddress", ''); //清空选择的地址
	                app.setLocalObjet("selectProduts", ary);
	                if(app.checkLogin()){
	                    location.href = "../html/confirmOrder.html?type=" + app.ORDER_TYPE_OPTION;
	                }else{
	                    app.toLoginPage(location.href);
	                }
	            });
                clearInterval(interval);
			},100);
		}
	};
	//页面初始化
	app.initPage = function() {
		this.template = this.getTempBySelector("#template");
		var h = $(window).height() - $("#head")[0].clientHeight - $(".footer-bot")[0].clientHeight;
		$("#list").css("min-height", h + "px");
		$("#wrapper").css("height", h + "px");
		$("#wrapper").css("overflow", "scroll");
	};
	//开始执行
	app.init = function() {
		initRefresh();
		car.init(function() {
			loadGoods();
		});
	};

	function swipperList() {
		var x;
		var y;
		var direction = "";
		$('#wrapper .swiper')
			.on('touchstart', function(e) {
				$('.swipe-delete li > a.open').css('left', '0px').removeClass('open') // close em all
				$(e.currentTarget).addClass('open')
				x = e.originalEvent.targetTouches[0].pageX // anchor point
				y = e.originalEvent.targetTouches[0].pageY // anchor point
				direction = "";
			})
			.on('touchmove', function(e) {
				var change = e.originalEvent.targetTouches[0].pageX - x
				var changey = e.originalEvent.targetTouches[0].pageY - y;
				var os = $(this).offset();
				change = Math.min(Math.max(-100, change), 100);
				if(direction == "") {
					if(Math.abs(changey) > 10 || Math.abs(change < 10)) {
						if(os.left >= 0) { //在右边的时候
							if(Math.abs(changey) > 10 && change > 0) {
								direction = "y";
							} else if(Math.abs(changey) >= Math.abs(change)) {
								direction = "y";
							} else {
								direction = "x";
							}
						} else {
							direction = "x";
						}
					}
				}
				if(direction == "y") {
					return;
				} else {
					app.stopBubble(e);
					e.preventDefault();
					if(direction == "") {
						return;
					}
				}
				if(os) {
					var left = os.left;
					left += change;
					change = Math.min(Math.max(-100, left), 0);
					e.currentTarget.style.left = change + 'px'
				} else {
					e.currentTarget.style.left = change + 'px'
				}

			})
			.on('touchend', function(e) {
				var left = parseInt(e.currentTarget.style.left)
				var new_left;
				if(left < -50) {
					new_left = '-100px'
				} else {
					new_left = '0px'
				}
				// e.currentTarget.style.left = new_left
				$(e.currentTarget).animate({
					left: new_left
				}, 200);
				enable_scroll()
			});
	}

	function prevent_default(e) {
		e.preventDefault();
	}

	function disable_scroll() {
		$(document).on('touchmove', prevent_default);
	}

	function enable_scroll() {
		$(document).unbind('touchmove', prevent_default)
	}
	return app;
});