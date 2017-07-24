//购物车
define(["base/baseApp", "refresher", "animate", "./base/baseCardCar","fastclick"], function(app, refresher, animate, car,fastclick) {
	fastclick.attach(document.body);
	app.car = car;
	app.clickPlus = function(el, e, sku) {
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
		app.stoSkuIds = [];
		if(data.length > 0) {
			$("#shitilist").empty();
			$("#dianzilist").empty();
			$("#zhongzhilist").empty();
			var shitilen = 0; //实体卡个数
			var dianzilen = 0; //电子卡个数
			var zhongzhilen = 0 //种植机个数
			for(var i = 0; i < data.length; i++) {
				if(data[i].stock<1||data[i].product.isonline=="N") {
					data[i].isDisabled = true;
					app.stoSkuIds.push({
						id: data[i].id
					});
				}
				var id = data[i].skuPropertyList[0].columnpropid;
				data[i].ctype = id;
				if(data[i].product.type == 6){
					$("#zhongzhilisthead").show();
					zhongzhilen++;
					$("#zhongzhilist").append(this.template(data[i]));
				} else if(id == 1) {
					$("#shitilisthead").show();
					shitilen++;
					$("#shitilist").append(this.template(data[i]));
				} else {
					$("#dianzilisthead").show();
					dianzilen++;
					$("#dianzilist").append(this.template(data[i]));
				}
			}
			if(shitilen == 0) {
				$("#shitilisthead").hide();
			}
			if(dianzilen == 0) {
				$("#dianzilisthead").hide();
			}
			if(zhongzhilen == 0) {
				$("#zhongzhilisthead").hide();
			}
			swipperList();
			if(app.stoSkuIds.length > 0) {
				$("#shouqingBtn").show();
			} else {
				$("#shouqingBtn").hide();
			}
		} else {
			$("#shitilisthead").hide();
			$("#dianzilisthead").hide();
			app.emptyList("#shitilist");
		}
		countWeight();
	};
	/**
	 * 
	 */
	app.removeSq = function() {
		var str = "";
		$.each(app.stoSkuIds, function(i, it) {
			str += "," + it.id;
		});
		del(str.replace(",", ""), app.stoSkuIds, true);
	};
	//加载购物车中的商品
	function loadGoods() {
		var ids = car.getSkus();
		if(ids.length < 1) {
			app.pageRefresher.resetload();
			app.emptyList("#shitilist", "暂无商品 <span class='app-text-orange' onclick = 'location.href=\"cardList.html\"'>去逛逛</span>");
			return;
		};
		app.POSTRequest("weixin/mall/sku/queryBySkuid.do", {
			data: {
				skuid: ids
			},
			success: function(data) {
				if(data.resultCode == 1) {
					app.addList(data.resultObj);
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
				});
			} else {
				me.resetload();
			}
		});
	}
	//获取页面选中的商品id
	function getSelectSku(type) {

		var checkELs = $("#list .checkBtn.active").not(".type1").not(".type2").not(".type6");
		if(type == 1) {
			checkELs = $("#shitilist .checkBtn.active");
		} else if(type == 2) {
			checkELs = $("#dianzilist .checkBtn.active");
		} else if(type == 6) {
			checkELs = $("#zhongzhilist .checkBtn.active");
		}
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
		console.log(ids);
		var sum = 0;
		$.each(ids, function(i, it) {
			var price = $("#skuitem_" + it.id).attr("data-price");
			var item = car.data[it.id];
			var num = item ? item.skucount : 0;
			sum += parseFloat(price) * parseInt(num);
		});
		if(ids.length < 1) {
			$(".btn_submit_order").removeClass("app-bg-orange");
		} else {
			$(".btn_submit_order").addClass("app-bg-orange");
		}
		$("#sumWeight").html(app.getPriceStr(sum));
	}
	app.orderType = null;
	//当有点击的时候
	function onchecked(type) {
		if(type == 1) {
			app.orderType = app.ORDER_TYPE_ENTITY_CARD;
			$("#dianzilist .checkBtn").removeClass("active");
			$(".type2.checkBtn").removeClass("active");
			$("#zhongzhilist .checkBtn").removeClass("active");
			$(".type6.checkBtn").removeClass("active");
		} else if(type == 2) {
			app.orderType = app.ORDER_TYPE_ELECTRONIC_CARD;
			$("#shitilist .checkBtn").removeClass("active");
			$(".type1.checkBtn").removeClass("active");
			$("#zhongzhilist .checkBtn").removeClass("active");
			$(".type6.checkBtn").removeClass("active");
		} else if(type == 6){
			app.orderType = app.ORDER_PLANTER_MACHINE;
			$("#dianzilist .checkBtn").removeClass("active");
			$(".type2.checkBtn").removeClass("active");
			$("#shitilist .checkBtn").removeClass("active");
			$(".type1.checkBtn").removeClass("active");
			
		}
	}
	//全选/反选
	app.selectAll = function(type) {
		onchecked(type);
		if(type == 1) {
			if($(".type1.checkBtn").hasClass("active")) {
				$("#shitilist .checkBtn").removeClass("active");
			} else {
				$("#shitilist .checkBtn").addClass("active");
			}
			$(".type1.checkBtn").toggleClass("active");
		} else if(type == 2){

			if($(".type2.checkBtn").hasClass("active")) {
				$("#dianzilist .checkBtn").removeClass("active");
			} else {
				$("#dianzilist .checkBtn").addClass("active");
			}
			$(".type2.checkBtn").toggleClass("active");
		} else if(type == 6){
			if($(".type6.checkBtn").hasClass("active")) {
				$("#zhongzhilist .checkBtn").removeClass("active");
			} else {
				$("#zhongzhilist .checkBtn").addClass("active");
			}
			$(".type6.checkBtn").toggleClass("active");
		}
		countWeight();
	};
	//选择单个
	app.selectOne = function(id, type) {
		onchecked(type);
		$("#skuitem_" + id + " .checkBtn").toggleClass("active");
		if(type == 1) {
			if($("#shitilist .checkBtn").length&&$("#shitilist .checkBtn").length == $("#shitilist .checkBtn.active").length) {
				$(".type1.checkBtn").addClass("active");
			} else {
				$(".type1.checkBtn").removeClass("active");
			}
		} else if(type == 2) {
			if($("#shitilist .checkBtn").length&&$("#dianzilist .checkBtn").length == $("#dianzilist .checkBtn.active").length) {
				$(".type2.checkBtn").addClass("active");
			} else {
				$(".type2.checkBtn").removeClass("active");
			}
		}  else if(type == 6) {
			if($("#zhongzhilist .checkBtn").length&&$("#zhongzhilist .checkBtn").length == $("#zhongzhilist .checkBtn.active").length) {
				$(".type6.checkBtn").addClass("active");
			} else {
				$(".type6.checkBtn").removeClass("active");
			}
		} 

		countWeight();
	};
	//删除选中的sku
	app.delSelect = function(type) {
		var ids = getSelectSku(type);
		if(ids.length == 0) {
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
	function del(idsStr, ids, flag) {
		car.remove(idsStr, function() {
			$.each(ids, function(i, iem) {
				$("#skuitem_" + iem.id).animateCss(animate.slideOutLeft, function() {
					$("#skuitem_" + iem.id).remove();
				});
			});
			if(flag) {
				$("#shouqingBtn").remove();
			}
			setTimeout(function() {
				app.replace(location.href);
			}, 500);
			countWeight();
		});
	}
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
                console.log(ids);
                var ary = [];
                $.each(ids, function(i, item) {
                    var carObj = car.data[item.id];
                    if(carObj && carObj.skucount > 0) {
                        ary.push({
                            skuid: item.id,
                            num: carObj.skucount
                        });
                    }
                });
                console.log(ary);
                //清空选择地址
                app.setLocalObjet("selectAddress", ''); //清空选择的地址
                app.setLocalObjet("selectProduts", ary);
                localStorage.selectedPayway = '';
                if(app.checkLogin()){
                    app.href("../html/confirmOrder.html?type=" + app.orderType);
                }else{
                    app.toLoginPage(app.netConfig.pageRoot+"/html/confirmOrder.html?type=" + app.orderType);
                }
                clearInterval(interval);
			},100);
		}
	};
	//页面初始化
	app.initPage = function() {
		this.template = this.getTempBySelector("#template");
		var h = $(window).height() - $(".footer-bot")[0].clientHeight;
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
		$("#shitilist").on("change",".buynum",function() {
			app.isBuynumChange = true;
			if(!this.value){
                this.value = 1;
			}

			if(app.car.isNetBack){
                var skuid = $(this).data("skuid") * 1;
                var num = this.value*1;
                app.car.setNum(skuid,num,function () {
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
				}, 200)
				enable_scroll()
			});
	}
	//左右滑动依赖
	function prevent_default(e) {
		e.preventDefault();
	}
	//左右滑动依赖
	function disable_scroll() {
		$(document).on('touchmove', prevent_default);
	}
	//左右滑动依赖
	function enable_scroll() {
		$(document).unbind('touchmove', prevent_default)
	}
	return app;
});