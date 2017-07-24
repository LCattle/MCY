//商品详情
define(["base/baseApp",
		"../lib/aui/script/aui-slide",
		"animate",
		"./base/baseCar",
		"./base/baseCardCar",
		"./base/basePage",
		"fastclick"
	],
	function(app, slide, animate, car, cardCar, page, fastclick) {
		fastclick.attach(document.body);
		app.initPage = function() {
			app.slideWidth = $(window).width();
			app.slideHeight = app.slideWidth / 3 * 2;
			$("#slideBox").css({
				"width": "100%",
				"display": "block",
				"height": app.slideHeight + "px"
			});
			if(app.slide) {
				app.slide.destroy();
				app.startSlide();
			}
			app.commTemplat = app.getTempBySelector("#commendTemplate");
		};
		//上拉加载评论
		$(window).bind("scroll", function(e) {
			var marginBot = 0;
			if(document.compatMode === "CSS1Compat") {
				marginBot = document.documentElement.scrollHeight - (document.documentElement.scrollTop + document.body.scrollTop) - document.documentElement.clientHeight;
			} else {
				marginBot = document.body.scrollHeight - document.body.scrollTop - document.body.clientHeight;
			}
			if(marginBot <= 0) {
				loadCommend();
			}
		});
		app.skus = {}; //sku信息列表
		//加载商品下的每一个sku信息
		function loadSkus(productInfo, index) {
			if(productInfo.skulist.length > index) {

				var id = productInfo.skulist[index].id;
				if(app.skus[id]) {
					loadSkus(productInfo, index + 1);
					return;
				}
				require([app.getNetServer("d") + "s" + id + ".js"], function(skuinfo) {
					app.skus[id] = skuinfo;
					loadSkus(productInfo, index + 1);
				}, function() {
					app.skus[id] = productInfo;
					loadSkus(productInfo, index + 1);
				});
			} else {
				initData(productInfo);
			}
		}
		//加载商品信息 加载的是静态js
		function loadGoods() {
			require([app.getNetServer("d") + app.UrlParams.pid + ".js?_=" + new Date().getTime()], function(productInfo) {
				querystore(productInfo);
			}, function() {
				app.tipInfo("找不到该商品信息");
				//              querystore({ //wxh 新加 5.11
				//                  id: app.UrlParams.pid
				//              });
			});
		}

		function querystore(productInfo) {
			console.log(productInfo);
			app.POSTRequest("weixin/mall/sku/isSoldOut.do", {
				data: {
					skuid: productInfo.id
				},
				success: function(data) {
					console.log(data);
					if(data.resultCode === "1" || data.resultCode === "-2") {
						if(data.resultObj) {
							app.currsku = data.resultObj;
						}
						productInfo.storeStatus = data.resultCode;

						//$.extend(productInfo, data.resultObj); //wxh 新加 5.11

						console.log(app.UrlParams.pid.startsWith("p"));
						if(app.UrlParams.pid.startsWith("p")) { //商品进来的
							app.skus[productInfo.id] = productInfo;
							loadSkus(productInfo, 0);
						} else {
							initData(productInfo);
						}
					} else {
						app.tipInfo(data.resultMsg);
					}
				},
				error: function() {}
			});
		}
		//商品id
		app.productId = null;
		//商品信息
		app.productInfo = null;
		//初始化数据
		function initData(productInfo) {
			console.log(productInfo);
			app.productInfo = productInfo;
			app.productId = productInfo.product.id;
			initBanner(productInfo.skupicturelist || productInfo.skupictureList); //wxh 修改 5.11
			$("#skuname").text(productInfo.skuname); //商品
			$("#describe").text(productInfo.product.ads); //广告语
			var shareData = {
				title: productInfo.skuname,
				content: productInfo.product.ads,
				url: location.href,
				imgUrl: app.getImgPath(app.productInfo.picpath)
			}
			nativeRegistShareBtn(shareData);
			if(productInfo.product.productdescModel) {
				$("#detailsbox>div").html(productInfo.product.productdescModel.fulldesc);
				$("#detailsbox>div img").css({
					"width": "100%",
					height: "auto"
				});
			}
			//分类型处理
			var type = productInfo.product.type;
			if(type == 1) { //自选菜
				initType1(productInfo);
			} else if(type == 2) { //宅配
				initType2(productInfo);
			} else if(type == 3) { //礼品卡
				initType3(productInfo);
			} else if(type == 5) { //观光券
                initType5(productInfo);
            } else if(type == 6) {//种植机
            	initType4(productInfo);
            }
			$("#footer").show();
		}
		/**
		 * 显示菜篮数量
		 */
		function setCarSum() {
			var sum = parseInt(car.sum);
			if(sum < 1) {
				$("#carNum").hide();
			} else {
				$("#carNum").show();
				$("#carNum").text(sum > 99 ? 99 : sum);
			}
		}
		/**
		 * 显示购物车数量
		 */
		function setCardCarSum() {
			var sum = cardCar.sum;
			if(sum < 1) {
				$("#shoppingCar .aui-badge").hide();
			} else {
				$("#shoppingCar .aui-badge").show();
				$("#shoppingCar .aui-badge").text(sum > 99 ? 99 : sum);
			}
		};
		//点击加号后的动画效果
		app.showCarAnimate = function(x, y, dx, dy, callBack, num) {
			num = num || 1;
			var id = "move_logo" + this.uuid();
			$("body").append("<div id='" + id + "' class='move_logo' style='top:" + y + "px;left:" + x + "px;'>" + num + "<div>");
			setTimeout(function() {
				$("#" + id).animate({
					"left": dx + "px",
					"top": dy + "px"
				}, 500, function() {
					$("#" + id).remove();
					callBack();
				});
			}, 10);
		}
		app.addCar = function(sku, num, event) {
			if(app.currsku && car.data[sku] && ((parseInt(car.data[sku].skucount) + parseInt(num)) > app.currsku.stock)) {
				app.tipInfo(app.currsku.skuname + "商品库存只有" + app.currsku.stock + "个哦！");
				return;
			}
			if(car.isNetBack) {
				car.add(sku, num, function() {
					app.showCarAnimate(event.pageX,
						event.pageY,
						$("#carBtn")[0].offsetLeft + $("#carBtn")[0].clientWidth / 2,
						$("#footer")[0].offsetTop,
						function() {
							setCarSum(); //显示购物车总数
						});
				});
			}
		};

		//跳转到确认订单页
		function toConfirm(skuId, num, type) {
			app.setLocalObjet("selectAddress", ''); //清空选择的地址
			localStorage.selectedPayway = "";
			app.setLocalObjet("selectProduts", [{
				skuid: skuId,
				num: num
			}]);
			if(app.checkLogin()) {
				app.href("../html/confirmOrder.html?type=" + type);
			} else {
				app.toLoginPage(app.netConfig.pageRoot + "/html/confirmOrder.html?type=" + type);
			}
		}

		function initType1(productInfo) {
			car.init(function() {
				setCarSum();
			});

			if(productInfo.storeStatus === "1") {
				$("#buyBtn").bind("click", function(event) {
					app.addCar(productInfo.id, $("#countNum").val(), event);
				});
			} else if(productInfo.storeStatus === "-2") {
				$("#buyBtn").text("已售罄");
				$("#buyBtn").css("background", "#eeeeee");
				$("#buyBtn").css("color", "#f59b29");
				$("#buyBtn").removeClass("app_bg_green");
				$("#buyBtn").removeClass("btnfilter");
			}

			$("#carBtn").bind("click", function() {
				app.href("../html/shoppingCar.html");
			});
			var price = (productInfo.sellprice).toFixed(2);
			var oneWeight = productInfo.weight;
			$(".inputBox").show();
			$("#logisticsInfo").text("实付满¥60配送");
			$("#priceName").html("市场价");
            $("#price").html(app.getPriceStr(price));
            $("#vipCoupon").show();
			// app.getSysParam("MEMBERLEVELDISCOUNT",function(data){
			// 				var arr = [];
			// 				$.each(data,function(i,item){
			// 				    arr.push(item.paramvalue);
			// 				})
			// 			app.sellMin = Math.min.apply(null, arr);
			// },'biz');
            //$("#sellPrice").text((price*app.sellMin).toFixed(2));
            //$("#vipPrice").hide();
            //$("#price").css({"text-decoration":"line-through","color":"rgb(169,169,169)"});
			var temp = app.getTemp("<span class='spec_name aui-clearfix'><@ it.name>：</span><span class='spec_value '><@ it.value></span><br>")
			$("#specBox p").append(temp({
				"name": "重量",
				"value": productInfo.weight + "g"
			}));
			$("#specBox p").append(temp({
				"name": "包装",
				"value": productInfo.product.packagewayname
			}));
			$("#specBox p").append(temp({
				"name": "保质期",
				"value": productInfo.product.qualityperiod + "天"
			}));
			$("#specBox p").append(temp({
				"name": "贮存方法",
				"value": productInfo.product.storewayname
			}));
		}
		//改菜，加购物车功能
		function changeSg(productInfo) {
			var ids = "";
			var nums = ""
			$.each(productInfo.skucomboList,
				function(i, item) {
					ids += "," + item.subskuid;
					nums += "," + item.count;
				});
			ids = ids.replace(",", "");
			nums = nums.replace(",", "");
			if(app.checkLogin()) {
				//参数准备完成
				app.POSTRequest("weixin/mall/shoppingcart/merge.do", {
					data: {
						productIds: ids,
						numbers: nums,
						cartType: "basket"
					},
					success: function(data) {
						if(data.resultCode === "1") {
							app.href("../html/OptionalList.html?ids=" + ids);
						} else {
							app.tipInfo(data.resultMsg);
						}
					},
					error: function() {}
				});
			} else { //未登录，加本地购物车
				$.each(productInfo.skucomboList,
					function(i, item) {
						car.addLocal(item.subskuid, item.count);
					});
				app.href("../html/OptionalList.html?ids=" + ids);
			}
		}

		function initType2(productInfo) {
			car.init(function() {});

			var price = (productInfo.sellprice).toFixed(2);
			var weight = productInfo.weight;
			weight += "g";
            $("#priceName").html("市场价");
            $("#price").html(app.getPriceStr(price));
            $("#vipCoupon").show();
			// app.getSysParam("MEMBERLEVELDISCOUNT",function(data){
			// 				var arr = [];
			// 				$.each(data,function(i,item){
			// 				    arr.push(item.paramvalue);
			// 				})
			// 			app.sellMin = Math.min.apply(null, arr);
			// },'biz');
			// $("#sellPrice").text((price*app.sellMin).toFixed(2));
			// $("#vipPrice").show();
            if(productInfo.storeStatus === "1") {
                $("#changeBtn").bind("click", function() {
                    changeSg(productInfo);
                });
                $("#changeBtn").css("width", "1.5%");
                $("#changeBtn").show();
//              $("#countNum").attr("readonly","");
                $("#buyBtn").bind("click", function() {
                    toConfirm(productInfo.id, $("#countNum").val(), app.ORDER_TYPE_PACKAGE);
                });
                $("#buyBtn").text("立即购买");
                $("#buyBtn").css("width", "1.5%");
			} else {
				$("#buyBtn").text("已售罄");
				$("#buyBtn").css("background", "#eeeeee");
				$("#buyBtn").css("color", "#f59b29");
				$("#buyBtn").removeClass("app_bg_green");
				$("#buyBtn").removeClass("btnfilter");
			}

			var temp = app.getTemp("<span class='spec_name aui-clearfix'><@ it.name>：</span><span class='spec_value '><@ it.value></span><br>")
			$("#specBox p").append(temp({
				"name": "重量",
				"value": productInfo.weight + "g"
			}));
			$("#specBox p").append(temp({
				"name": "包装",
				"value": productInfo.product.packagewayname
			}));
			$("#logisticsInfo").text("实付满¥60配送");
			$("#carBtn").hide();
		}
		app.cardSkid = null;
		app.type = 3;

		function initType3(productInfo) {
			cardCar.init(function() {
				setCardCarSum();
			});
			$("#carBtn").hide();
			var price = productInfo.sellprice;
			$("#buyBtn").text("立即购买");
			$("#buyBtn").bind("click", function() {
				var countNum = $("#countNum").val();
				if(countNum == "") {
					app.tipInfo("卡数量不能为空");
					return;
				}
				toConfirm(app.cardSkid, $("#countNum").val(), app.type);
			});
			$("#logisticsInfo").text("礼品卡包邮");
			price = app.getPriceStr(price);
			productInfo.skulist.sort(function(item1, item2) {
				try {
					var sort = item1.skupropertylist[0].textvalue < item2.skupropertylist[0].textvalue;
					return sort ? 0 : 1;
				} catch(e) {
					return 0;
				}
			});
			$.each(productInfo.skulist, function(index, item) {
				if(!item.skupropertylist || item.skupropertylist.length == 0) {
					return;
				}
				var name = item.skupropertylist[0].textname;
				var value = item.skupropertylist[0].textvalue;
				var id = item.id;
				var bgclass = "app_bg_gray";
				var type = value == "1" ? app.ORDER_TYPE_ENTITY_CARD : app.ORDER_TYPE_ELECTRONIC_CARD;
				if(type == app.ORDER_TYPE_ENTITY_CARD) {
					app.cardSkid = id
					bgclass = "app_bg_yellow";
				}
				var str = '<div class="aui-btn ' + bgclass +
					' app-text-white aui-margin-r-10" onclick="app.selectCard(this,' + id + ',' + type + ')" >' + name +
					'</div>'
				$("#Cards").append(str);
			});
			var temp = app.getTemp("<span class='spec_name aui-clearfix'><@ it.name>：</span><span class='spec_value '><@ it.value></span><br>")
			$("#specBox p").append(temp({
				"name": "面额",
				"value": productInfo.sellprice + "元"
			}));
//			$("#specBox p").append(temp({
//				"name": "可兑换配送斤数",
//				"value": app.getKg(productInfo.product.virtualvalue)
//			}));
			$("#Cards").show();
			$("#changeBtn").show();
			$("#changeBtn").text("加入购物车");
			$("#changeBtn").bind("click", function(event) {
				var num = parseInt($("#countNum").val());
				cardCar.add(app.cardSkid, num, function() {
					app.showCarAnimate(event.pageX,
						event.pageY,
						$("#shoppingCar")[0].offsetLeft + $("#shoppingCar")[0].clientWidth / 2,
						$("#shoppingCar")[0].offsetTop,
						function() {
							setCardCarSum(); //显示购物车总数
						}, num);
				});
			});
			$("#shoppingCar").show(); //显示购物车图标
			$("#buyBtn").css("width", "1.5%");
			$("#changeBtn").css("width", "1.5%");
			$("#price").html(price);

			// 如果没有实体卡，默认选择电子卡
			if(!app.cardSkid) {
				$($("#Cards .app_bg_gray")[0]).click();
			}

		};

		function initType4(productInfo) {
			cardCar.init(function() {
				setCardCarSum();
			});
			$("#carBtn").hide();
			var price = productInfo.sellprice;
			$("#buyBtn").text("立即购买");
			$("#buyBtn").bind("click", function() {
				var countNum = $("#countNum").val();
				if(countNum == "") {
					app.tipInfo("种植机数量不能为空");
					return;
				}
				toConfirm(app.cardSkid, $("#countNum").val(), 10);
			});
			$("#logisticsInfo").text("包邮");
			price = app.getPriceStr(price);
			productInfo.skulist.sort(function(item1, item2) {
				try {
					var sort = item1.skupropertylist[0].textvalue < item2.skupropertylist[0].textvalue;
					return sort ? 0 : 1;
				} catch(e) {
					return 0;
				}
			});
			$.each(productInfo.skulist, function(index, item) {
				if(!item.skupropertylist || item.skupropertylist.length == 0) {
					return;
				}
				var name = item.skupropertylist[0].textname;
				var value = item.skupropertylist[0].textvalue;
				var id = item.id;
				var bgclass = "app_bg_gray";
				var type = value == "1" ? app.ORDER_TYPE_ENTITY_CARD : app.ORDER_TYPE_ELECTRONIC_CARD;
				if(type == app.ORDER_TYPE_ENTITY_CARD) {
					app.cardSkid = id
					bgclass = "app_bg_yellow";
				}
				var str = '<div class="aui-btn ' + bgclass +
					' app-text-white aui-margin-r-10" onclick="app.selectCard(this,' + id + ',' + type + ')" >' + name +
					'</div>'
				$("#Cards").append(str);
			});
			$("#Cards").hide();
			$("#specBox").hide();
			$("#changeBtn").show();
			$("#changeBtn").text("加入购物车");
			$("#changeBtn").bind("click", function(event) {
				var num = parseInt($("#countNum").val());
				cardCar.add(app.cardSkid, num, function() {
					app.showCarAnimate(event.pageX,
						event.pageY,
						$("#shoppingCar")[0].offsetLeft + $("#shoppingCar")[0].clientWidth / 2,
						$("#shoppingCar")[0].offsetTop,
						function() {
							setCardCarSum(); //显示购物车总数
						}, num);
				});
			});
			$("#shoppingCar").show(); //显示购物车图标
			$("#buyBtn").css("width", "1.5%");
			$("#changeBtn").css("width", "1.5%");
			$("#price").html(price);

			// 如果没有实体卡，默认选择电子卡
			if(!app.cardSkid) {
				$($("#Cards .app_bg_gray")[0]).click();
			}

		};

		//点击选择卡片切换
		app.selectCard = function(el, id, type) {
			if($(el).hasClass("app_bg_yellow")) {
				return;
			}
			app.cardSkid = id
			initBanner(app.skus[id].skupicturelist);
			$("#skuname").text(app.skus[id].skuname); //商品
			$("#price").html(app.getPriceStr(app.skus[id].sellprice));
			$("#specBox p").html("");
			var temp = app.getTemp("<span class='spec_name aui-clearfix'><@ it.name>：</span><span class='spec_value '><@ it.value></span><br>");
			$("#specBox p").append(temp({
				"name": "面额",
				"value": app.skus[id].sellprice + "元"
			}));
//			$("#specBox p").append(temp({
//				"name": "可兑换配送斤数",
//				"value": app.getKg(app.productInfo.product.virtualvalue)
//			}));
			app.type = type;
			$("#Cards .app_bg_yellow").addClass("app_bg_gray");
			$("#Cards .app_bg_yellow").removeClass("app_bg_yellow");
			$(el).removeClass("app_bg_gray");
			$(el).addClass("app_bg_yellow");
		};
		//初始化页面数据信息
		function initBanner(data) {
			var temp = app.getTempBySelector("#bannerTemplate");
			$("#bannerImgs").html("");
			$("#bannerImgs").next().html("");
			$.each(data, function(i, item) {
				$("#bannerImgs").append(temp(item));
			})
			app.startSlide();
		};
		app.startSlide = function() {
			if(app.slide) {
				app.slide.destroy();
			}
			app.slide = new auiSlide({
				container: document.getElementById("aui-slide"),
				"width": app.slideWidth,
				"height": app.slideHeight,
				"speed": 400,
				"autoPlay": 5000, //自动播放
				"loop": true,
				"pageShow": true,
				"pageStyle": 'dot',
				'dotPosition': 'center'
			})
		};

		function initType5(productInfo) {
			$("#carBtn").hide();
			$("#specBox").hide();
			var price = productInfo.sellprice;
			$("#buyBtn").text("立即购买");
			var skuid = productInfo.id;
			$("#buyBtn").bind("click", function() {
				var countNum = $("#countNum").val();
				if(countNum == "") {
					app.tipInfo("卡数量不能为空");
					return;
				}
				toConfirm(skuid, $("#countNum").val(), 8);
			});
			$("#logisticsInfo").text("");
			$("#buyBtn").css("width", "1.5%");
			$("#price").html(app.getPriceStr(price));

		};
		//开始执行
		app.init = function() {
			loadGoods();
			$("#countNum").on("keyup", function() {
				if(this.value == "0") {
					this.value = "";
					return;
				}
				this.value = this.value.substring(0, 3).replace(/\D/g, '');
			});
			//获取用户，拼接imurl
			app.getUser(function(data) {
				app.imLinkUrlReal = app.imLinkUrl + "&nickName=" + data.crmnickname + "&customerId=" + data.crmnickname;
			});
		};
		app.clickMinus = function(el, event) {
			var num = $("#countNum").val();
			if(--num <= 1) {
				num = 1
			}
			$("#countNum").val(num);
		}
		app.clickPlus = function(el, event) {
			var num = $("#countNum").val();
			$("#countNum").val(++num);
		}
		app.tabChangeed = true;
		/**是否已经加载评论信息*/
		var isCommendLoad = false;

		//显示评论
		function showComment(data) {
			page.addData(data);
			$.each(data, function(i, item) {
				item.mobile = item.mobile.replace(/^(\d{4})\d{4}(\d+)/, "$1****$2");
				if(item.userPath)
					item.img = app.getImgPath(item.userPath).replace('/image/', '');
				$("#commendbox").append(app.commTemplat(item))
			});
			if(page.data.length == 0) {
				app.emptyList("#commendbox", "暂无评论");
			}
		}
		var isNetBack = true;
		//加载评论信息
		function loadCommend() {
			if(isNetBack && !$("#commendbox").hasClass("app-text-orange")) {
				isNetBack = false;
				if(!page.hasNextPage) { //如果没有下一页，就不用请求了
					return;
				}
				app.POSTRequest("weixin/mall/comment/queryProductComment.do", {
					data: {
						pid: app.productId,
						beginPage: page.pageIndex,
						pageSize: page.pageSize
					},
					success: function(data) {
						if(data.resultCode == 1) {
							console.log(data);
							showComment(data.basePageObj.dataList);
							page.pageIndex++;
							page.hasNextPage = data.basePageObj.hasNextPage
							isCommendLoad = true;
						}
					},
					complete: function() {
						isNetBack = true;
					}
				});
			}
		}
		/**切换tab*/
		app.changeTab = function(e) {
			if($(e).hasClass("app-text-orange") || !app.tabChangeed) {
				return;
			}
			$(".myTab.app-text-orange").removeClass("app-text-orange");
			$(e).addClass("app-text-orange");
			var id = $(e).attr("page_id");
			if(id === "commendbox") {
				$("#detailsbox").hide();
				$("#commendbox").show();
				if(!isCommendLoad) {
					loadCommend();
				}
			} else {
				$("#commendbox").hide();
				$("#detailsbox").show();
			}
		};

		app.showVipDailog = function(){
			$(".vipDialog").show();
		};

        app.hideVipDailog = function(){
            $(".vipDialog").hide();
        };
		return app;
	});