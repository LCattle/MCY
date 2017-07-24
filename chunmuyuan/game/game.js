define(["./base/baseApp", "swipe", "../game/gameService"], function(app, swipe, service) {
	if(!app.checkLogin()) {
		app.toLoginPage(location.href);
		return;
	}
	//变量定义
	app.captemp = app.getTempBySelector("#captemp");
	//用户当前操作的类型
	app.selectAction = {
		type: null,
		animateEl: null
	}
	projectimgs = service.projectimgs;
	$.each(projectimgs, function(i, it) {
		projectimgs[i] = app.netConfig.pageRoot + "/imgs/game/" + it;
	});
	//定义结束
	//初始化页面
	app.initPage = function() {
		var gameBoxHeight = $("#gameBox .gamebg").height();
		$("#gameBox").css("height", gameBoxHeight + "px");
	};
	/**
	 * 创建杯子下的文字，显示种子名称
	 * @param {Object} cap
	 */
	function createCapText(cap) {
		if(!app.capTexts) {
			app.capTexts = {};
		}
		var textEl = null
		var capEl = $(".cap.cap" + cap.id);
		if(!app.capTexts[cap.id]) {
			app.capTexts[cap.id] = $("<div class='absolute'></div>");
			textEl = app.capTexts[cap.id]
			textEl.css({
				top: capEl[0].offsetTop + capEl.height(),
				"font-size": "0.6rem",
				"color": "#fff"
			});
			$("#gameBox").append(textEl);
		} else {
			textEl = app.capTexts[cap.id]
		}
		if(cap.seedid == 0) {
			textEl.text("");
			return;
		}
		var seedName = app.gameSeeds[cap.seedid].names;
		if(seedName.length > 4) {
			seedName = seedName.substring(0, 4);
		}
		textEl.text(seedName)
		var width = textEl.width();
		var capElWidth = app.capWidth;
		var cha = capElWidth - width;
		textEl.css({
			left: capEl[0].offsetLeft + cha / 2
		});
	}
	/**
	 * 显示动态列表
	 * @param {Object} data
	 */
	function showDynamics(data) {
		var temp = app.getTempBySelector("#dynamictemp");
		var box = $("#dynamicList");
		if(data && data.length > 0) {
			$.each(data, function(i, item) {
				if(item.opertype == 3) {
					item.number = "+" + item.unit + "ml";
				} else if(item.opertype == 1) {
					item.number = "+" + item.unit + "ml";
				} else if(item.opertype == 2) {
					item.number = "+" + item.unit + "颗";
				} else if(item.opertype == 6) {
					item.number = "+" + item.unit + "颗";
				} else {
					item.number = "";
				}
				box.append(temp(item));
			});
		} else {
			box.next().hide();
			$("#dynamicList").addClass("aui-margin-b-10");
			$("#dynamicList").html("<div class='aui-text-center'>暂无动态</div>");
		}
	}
	/**
	 * 加载所有总之信息
	 */
	function loadBaseGameInfo() {
		gameLoading();
		//加载所有种子
		service.getAllSeeds(function(data) {
			app.gameSeeds = {};
			$.each(data, function(i, item) {
				app.gameSeeds[item.id] = item;
				//将图片资源提出来，做预加载
				//				$.each(item.seeddevelop,function(i,level){
				//					projectimgs.push(app.getImgPath(level.imgsrc));
				//				});
			})
			//加载所有营养液
			service.getAllNutrient(function(data) {
				app.gameNutrient = {};
				$.each(data, function(i, item) {
					app.gameNutrient[item.id] = item;
					projectimgs.push(app.getImgPath(item.nutrientpic));
				});
				//加载系统参数
				app.getSysParam("KALEYARD", function(param) {
					app.gameSysParam = {};
					param.map(function(item, i) {
						app.gameSysParam[item.innercode] = item.paramvalue;
					});
					hideGameLoading();
					//加载图片资源
					loadImages(projectimgs, 0);
				}, "biz")
			});
		});

	}

	app.init = function() {
		loadBaseGameInfo(); //加载游戏支撑数据
	}

	/**
	 * 初始化杯子
	 * @param {Object} data
	 */
	function initCap(data) {
		app.myCaps = {};
		data.sort(function(item1, item2) {
			return item2.id - item1.id;
		});
		$.each(data, function(i, item) {
			//计算行列
			var line = parseInt(i / 3);
			var column = i % 3;
			var seedid = item.seedid;
			if(seedid != 0) { //这个瓶子有种菜
				item.src = getSeedStatusImg(item);
			} else {
				//没种菜
				item.src = "../imgs/game/capgamenull.png";
			}
			app.appendCap(item, line, column);
			createCapText(item)
		});
	}

	/**
	 * 添加一个杯子
	 * @param {Object} line
	 * @param {Object} colum
	 */
	app.appendCap = function(data, line, colum) {
		app.myCaps[data.id] = data;
		var shelfHeight = $(".shelf").height();
		var margin = 165;
		data.height = shelfHeight * 180 / 530;
		if(line == 1) {
			data.bottom = shelfHeight * 330 / 530 + app.REM2PX(3);
		} else {
			data.bottom = shelfHeight * 108 / 530 + app.REM2PX(3);
		}
		app.capWidth = data.height / 195 * 130;
		var left = 140;
		if(colum == 2) {
			data.left = $(window).width() * left / 750;
		} else if(colum == 1) {
			data.left = $(window).width() * (left + margin) / 750;
		} else {
			data.left = $(window).width() * (left + margin * 2) / 750;
		}
		var el = $(app.captemp(data));
		$("#gameBox").append(el);

		//获取上次浇水时间
		var lastTime = app.parseDate(data.irrigationtime).getTime();
		//获取当前时间
		var timeNow = new Date().getTime();
		//判断距离上次浇水时间是否满足提示条件
		var isNeedTip = app.gameSysParam.WATERTIME * (1000 * 60 * 60 * 24) <= timeNow - lastTime;
		if(isNeedTip && data.stage != 5 && data.seedid != 0) {
			createShuiDi(data, el);
		}
		if(data.stage == 5) {
			createRIPENEDImg(el, data);
		}

	};

	function createShuiDi(data, el) {
		var time = Math.random() * 1000;
		setTimeout(function() {
			var style = {
				"position": "absolute",
				"z-index": 4,
				top: el[0].offsetTop + el.height() / 3,
				left: el[0].offsetLeft + app.capWidth / 2,
				"width": "1rem"
			}
			data.tipWateingImg = $("<img class='needStopOnBoxShow animated infinite bounce' src='../imgs/game/nutrient.png'>");
			data.tipWateingImg.css(style);
			$("#gameBox").append(data.tipWateingImg);
		}, time + 20);
	}
	/**
	 * 创建一个成熟提示图标
	 * @param {Object} el
	 */
	function createRIPENEDImg(el, cap) {
		setTimeout(function() {
			var style = {
				"position": "absolute",
				"z-index": 2,
				top: el[0].offsetTop,
				left: el[0].offsetLeft + app.capWidth / 3 * 2,
				"width": "1rem"
			}
			cap.RIPENEDImg = $("<img class='needStopOnBoxShow' src='../imgs/game/ripened.png'>");
			cap.RIPENEDImg.css(style);
			$("#gameBox").append(cap.RIPENEDImg);
			//			cap.RIPENEDImg.animateCssInfinite("bounce");
		}, Math.random() * 1000 + 20)
	}
	/**
	 * 设置底部按钮点击效果
	 * @param {Object} type 操作类型
	 * @param {Object} el 点击的元素
	 * @param {Object} callBack 
	 */
	function setGameBtnStatus(type, el) {
		if(app.selectAction.type != null) {
			//停止上次的动画
			app.selectAction.animateEl.removeClass("mypulse animated infinite");
			//如果上次选择是采摘，那么清空selectAction
			if(app.selectAction.type == type) {
				app.selectAction.type = null;
				app.selectAction.animateEl = null;
				return;
			}
		}
		if(el) {
			var el = el.find("img");
			app.selectAction.type = type;
			app.selectAction.animateEl = el;
			el.animateCssInfinite("mypulse");
		} else {
			app.selectAction.type = null;
			app.selectAction.animateEl = null;
		}
	}

	/**
	 * 点击下面四个动作按钮
	 * @param {Object} el
	 */
	app.clickGameBtn = function(el) {
		if(app.isInAction) {
			//如果处于动作状态忽略这次点击
			return;
		}
		if(app.isSeedsBoxShow) {
			//种子
			app.hideSeedBox();
		}
		if(app.isNutrientBoxShow) {
			//如果选择营养液的盒子处于显示状态
			//关闭
			hideNutrientSolutionBox();
			if(id == "addNutrient") {
				return;
			}
		}
		var id = $(el).attr("id");
		var callBack = null;
		if(id == "addNutrient") {

			if(app.selectAction.type == "addNutrient") {
				setGameBtnStatus(null, null);
				return;
			}
			setGameBtnStatus(null, null);
			app.isInAction = true;
			gameLoading();
			service.getNutrientList(function(data) {
				hideGameLoading();
				app.myNutrients = data;
				appendNutrienSolution(data);
				showNutrientSolutionBox();
				if(!app.isshowcover) {
					showCover({
							el: $(".nutrientSolutionBox"),
							//							offsetTop: app.REM2PX(2),
							text: app.gameSysParam.ADDNUTRIENTCOVER,
							isunder: false
						},
						function() {
							$(".nutrientSolutionBox .nutrientSolution")[0].onclick();
							if(!app.isshowcover) {
								showCover({
										el: app.coverCap,
										text: "点击培养瓶，浇灌营养液",
										isunder: false
									},
									function() {
										app.coverCap.click();
										$(".coverLine").css("visibility", "hidden");
										$(".coverText").css("visibility", "hidden");
										$(".cover").css("visibility", "hidden");
									});
							}

						});
				}
				app.isInAction = false;
			}, false, 1);
		} else {
			setGameBtnStatus(id, $(el));
		}
	}

	/**
	 * 浇水动画
	 */
	function startWatering(elTop, elLeft, el, endCall) {
		$(".addpowerbox").css({
			top: (elTop - 30) + "px",
			left: (elLeft + 10) + "px",
			"display": "block"
		});
		//设置整个游戏处于动作状态，其他点击无效
		$(".addpowerbox").animateCss("myswing", function() {
			$(".addpowerbox").hide();
			endCall();
			//释放动作
			app.isInAction = false;
		});
		//隐藏水滴
		$(".shuidi1").css({
			opacity: 0
		});
		$(".shuidi2").css({
			opacity: 0
		});
		var startTime = 250;
		var animateTime = 100;
		var stopTime = 300;
		var oncetime = 1000;
		//第一次 水滴2
		setTimeout(function() {
			$(".shuidi2").animate({
				opacity: 1
			}, animateTime);
		}, startTime);
		//第一次 水滴1
		setTimeout(function() {
			$(".shuidi1").animate({
				opacity: 1
			}, animateTime);
		}, startTime + animateTime);
		//第一次停止
		setTimeout(function() {
			$(".shuidi1").animate({
				opacity: 0
			}, 50);
			$(".shuidi2").animate({
				opacity: 0
			}, 50);
		}, startTime + animateTime + stopTime);
		//第2次 水滴2
		setTimeout(function() {
			$(".shuidi2").animate({
				opacity: 1
			}, animateTime);
		}, oncetime + startTime);
		//第一次 水滴1
		setTimeout(function() {
			$(".shuidi1").animate({
				opacity: 1
			}, animateTime);
		}, oncetime + startTime + animateTime);
		//第2次停止
		setTimeout(function() {
			$(".shuidi1").animate({
				opacity: 0
			}, 50);
			$(".shuidi2").animate({
				opacity: 0
			}, 50);
		}, oncetime + startTime + animateTime + stopTime);
	}
	/**
	 * 点击坑位
	 */
	app.clickCap = function(id) {
		if(app.isInAction) {
			//如果当前处于动作状态，就忽略此次点击
			return;
		}
		var el = $(".cap.cap" + id); //选中的杯子
		var elTop = el[0].offsetTop;
		var elLeft = el[0].offsetLeft;
		//获取当前操作的瓶子
		var cap = app.myCaps[id];

		//浇水动作
		if(app.selectAction.type == "addNutrient") {
			irrigationSeed(cap, el, elTop, elLeft);
		} //采摘
		else if(app.selectAction.type == "caizhai") {
			pickingVegetables(cap, el);
		} else if(app.selectAction.type == "catchBtn") {
			//捕虫
			catchingBug(cap, el);
		} else {
			el.animateCss("rubberBand");
			if(cap.seedid != 0)
				app.href("bottleDetails.html?bottleId=" + cap.id);
		}
	};
	/**
	 * 开始摘菜动作
	 * @param {Object} el
	 */
	function startCaizhai(el) {
		app.isInAction = true;
		var data = {
			src: "../imgs/game/ripenedBig.png",
			height: el.height() / 2,
			top: el[0].offsetTop,
			left: el[0].offsetLeft
		}
		var cailan = $("#mycailan");
		var width = cailan.width() / 2;
		var toData = {
			height: (width / 3 * 2) + "px",
			top: cailan[0].offsetTop,
			left: cailan[0].offsetLeft + width / 2,
			opacity: 0.7
		}
		var str = app.getTempBySelector("#maturetemp")(data);
		var el = $(str);
		$("#gameBox").append(el);
		el.animate(toData, 1200, function() {
			$(el).remove();
			$("#mycailan img").animateCss("mypulse")
			showBasketNum(); //更新数组显示
			releaseAction();
		});
	}
	/**
	 * 显示种子列表
	 */
	app.showSeedBox = function() {
		if(app.mySwiper) {
			app.mySwiper.destroy();
		}
		//		$(".needStopOnBoxShow").removeClass("animated")
		app.isSeedsBoxShow = true;
		if(app.isNutrientBoxShow) {
			hideNutrientSolutionBox();
		}
		service.getMeSeedList(function(data) {
			//存储我的种子
			app.mySeeds = {};
			data.map(function(data, i) {
				app.mySeeds[data.id] = data;
			});
			appenSeeds(data);

			$(".dlg_bg").show();
			$(".seedsBox").show().animateCss("zoomIn");
			initSwiper(data.length);
		});

	};
	//应酬种子列表
	app.hideSeedBox = function() {
		$(".seedsBox").animateCss("zoomOut", function() {
			$(".dlg_bg").hide();
			$(".seedsBox").hide();
		});
		//		$(".needStopOnBoxShow").addClass("animated");
		app.isSeedsBoxShow = false;
	}

	function initSwiper(len) {
		var index = 0;
		if(len > 2) {
			index = 1;
		}
		var el = $(".swiper-slide.seed").eq(index);
		if(!app.isshowcover) {
			showCover({
				el: el.find(".zhongzhi"),
				offsetTop: $(".seedsBox").height() - app.REM2PX(3.25),
				offsetLeft: app.REM2PX(1),
				text: "点击，种植种子。",
				isunder: false
			}, function() {
				el.find(".zhongzhi")[0].onclick();
			})
		}

		app.mySwiper = new Swiper('.swiper-container', {
			//			loop: true,
			initialSlide: index,
			effect: 'coverflow',
			slidesPerView: 2,
			centeredSlides: true,
			coverflow: {
				rotate: 20,
				stretch: -10,
				depth: 200,
				modifier: 2,
				slideShadows: false
			}
		});
	}
	/**
	 * 显示排行信息
	 */
	function showPaihang(data) {
		if(data && data.length > 0) {
			var temp = app.getTempBySelector("#paihangTemp")
			$.each(data, function(i, item) {
				if(i == 0) {
					item.storeStr = '<img src="../imgs/game/jinpai.png" />';
				} else if(i == 1) {
					item.storeStr = '<img src="../imgs/game/yinpai.png" />';
				} else if(i == 2) {
					item.storeStr = '<img src="../imgs/game/tongpai.png" />';
				} else {
					item.storeStr = i + 1;
				}
				item.header = app.getImgPath(item.avatar).replace("/image/", "");
				item.name = item.nickname ? item.nickname : "春沐源会员";
				item.name = item.remark ? item.remark : item.name;
				$("#paihangbox").append(temp(item));
			});
		} else {
			app.emptyList("#paihangbox", "没有排行信息");
			$("#paihangbox").next().hide();
		}

	}

	/**
	 * 获取种子袋数字html
	 * @param {Object} number
	 */
	function getSeedNumStr(number) {
		var num = number + "";
		var ary = num.split("");
		var str = '<img src="../imgs/game/x.png" style="height: 0.8rem;" />';
		for(var k = 0; k < ary.length; k++) {
			str += '<img src="../imgs/game/' + ary[k] + '.png">'
		}
		return str;
	}
	/**
	 * 添加种子
	 * @param {Object} data
	 */
	function appenSeeds(data) {
		var temp = app.getTempBySelector("#seedtemp");
		$("#seedlist").empty();
		if(data.length == 0) {
			var vHtml = "<div class='aui-text-center' style='width:100%;height:100%;' layout='column'  >"
            vHtml += "<div flex></div>";
			vHtml += "<div><p>袋子空空的哦~</p><p>去<a href=\"javascript:app.href('../html/memberRecharge.html')\" style='text-decoration:underline;color:#f28b02;font-size:0.8rem;'>赚种子</a></p></div>";
            vHtml += "<div flex></div>";
            vHtml += "</div>";
			$("#seedlist").html(vHtml);
			return;
		}
		$.each(data, function(i, item) {
			item.seednumerStr = getSeedNumStr(item.hasAmount);
			item.seedImg = app.getImgPath(item.picpath);
			$("#seedlist").append(temp(item));
		});
	}

	function showCovers() {
		var coverData = [{
				el: $("#nutrBtn"),
				text: app.gameSysParam.NUTRIENTCOVER,
				isunder: true
			}, {
				el: $("#seedsBtn"),
				text: app.gameSysParam.SEEDBAGCOVER,
				isunder: true
			}, {
				el: $("#caizhai"),
				text: app.gameSysParam.PICKCOVER,
				isunder: false
			},
			{
				el: $("#addNutrient"),
				text: app.gameSysParam.ADDNUTRIENTCOVER,
				isunder: false
			},
			{
				el: $("#catchBtn"),
				text: app.gameSysParam.CATCBUGCOVER,
				isunder: false
			},
			{
				el: $("#mycailan"),
				text: app.gameSysParam.BASKETCOVER,
				isunder: false
			}
		];
		showCover(coverData, 0);
	}
	//显示新手指引页
	function showCover(item, callBack) {
		var el = item.el;
		var text = item.text;
		var isunder = item.isunder;

		var cicleEl = $(".cover .cicle");
		var elLine = $(".coverLine");
		var elText = $(".coverText");

		function onclick() {
			callBack();
		}

		$(".cicle").unbind("click").bind("click", onclick);

		//控制覆盖圈的top位置的元素
		var topEl = $(".bgblock").eq(1);
		//控制覆盖圈的left位置的元素
		var leftEl = $(".bgblock").eq(0);
		//计算top偏移量
		var height = el[0].offsetTop - (cicleEl.height() - el.height()) / 2;
		if(item.offsetTop) {
			height += item.offsetTop;
		}
		//计算left偏移量
		var width = el[0].offsetLeft - (cicleEl.height() - el.width()) / 2;
		if(item.offsetLeft) {
			width += item.offsetLeft;
		}
		topEl.css("height", height + "px");
		leftEl.css("width", width + "px");

		var coverTextLeft = ($(window).width() - elText.width()) / 2;
		var textTop = height + elLine.height() + cicleEl.height();
		var lineTop = height + cicleEl.height();
		elLine.removeClass("upper");
		if(!isunder) {
			//如果不是显示在下方调整top
			textTop = height - elLine.height() - elText.height();
			lineTop = height - elLine.height();
			elLine.addClass("upper");
		}

		//调整文字框位置
		elText.css({
			top: textTop,
			left: coverTextLeft,
			"z-index": 101
		}).find("div").eq(1).text(text);
		var lineLeft = width - elLine.width() + cicleEl.width() / 2;
		if($(window).width() / 2 > coverTextLeft+width) {
			if(isunder){
				elLine.addClass("upper");
				elLine.removeClass("left");
			}else{
				elLine.addClass("left");
				elLine.removeClass("upper");
			}
			
			lineLeft = width + cicleEl.width() / 2;
		} else {
			elLine.removeClass("left");
		}

		//调整线条
		elLine.css({
			top: lineTop,
			left: lineLeft,
			"z-index": 101
		});
		//显示背景
		$(".cover").css("z-index", "100");
	}

	function hideCover() {
		app.isshowcover = true;
		$(".cover").css("z-index", "-1");
		$(".coverLine").css("z-index", "-1");
		$(".coverText").css("z-index", "-1");
	}
	/**
	 * 显示菜篮的数量
	 */
	function showBasketNum() {
		if(app.BasketNum > 0) {
			$("#mycailan .aui-badge").show().text(app.BasketNum);
		} else {
			$("#mycailan .aui-badge").hide();
		}
	}
	/**
	 * 开始游戏
	 */
	function startGame() {
		//		if(service.getGameInfo("isShowCover")) {
		service.myBasket(function(data) {
			app.BasketNum = 0;
			$.each(data, function(i, item) {
				app.BasketNum += item.eAmount;
			});
			showBasketNum();
			app.getUser(function(user) {
				app.isshowcover = user.isgame != 0;
				service.getKaleyardInfo(function(data) {
					initCap(data.bottles);
					//					if(user.isGame){
					//						
					//					}
					if(!app.isshowcover) {
						showCover({
							el: $("#seedsBtn"),
							text: app.gameSysParam.SEEDBAGCOVER,
							isunder: true
						}, function() {
							$("#seedsBtn")[0].onclick();
						});
					}

					showPaihang(data.ranking);
					showDynamics(data.records);
					initBublles(data.nutrients)
				});
			})

			/**
			 * 统计种子数量
			 */
			countSeedsNum();
		});

		//		} else {
		//			if(localStorage.)
		//			showCovers();
	}

	function countSeedsNum() {
		if(app.mySeeds) {
			var num = 0;
			$.each(app.mySeeds, function(key, val) {
				num += val.hasAmount;
			});
			if(num > 0) {
				$("#seedsBtn .aui-badge").text(num)
					.show();
			} else {
				$("#seedsBtn .aui-badge").text(num)
					.hide();
			}
			return;
		}
		service.getMeSeedList(function(data) {
			//存储我的种子
			app.mySeeds = {};
			data.map(function(data, i) {
				app.mySeeds[data.id] = data;
			});
			countSeedsNum();
		});
	}

	/**
	 * 加载静态资源数据
	 */
	var loadEl = $('<div class="aui-text-center aui-font-size-14 absolute" style="color: #fff;top: 9rem;z-index: 10;width: 100%;">资源加载中...</div>');

	function loadImages(data, index) {
		if(index == 0) {
			$("#gameBox .dlg_bg").show().append(loadEl);
			loadEl.animateCssInfinite("flash")
			$(".progressBox").css({
				"z-index": "10",
				top: app.REM2PX(8),
				left: $(window).width() / 2 - $(".progressBox").width() / 2
			}).show();
			$(".processNum").text("0/" + data.length);
		}

		function load() {
			index++;
			$(".processNum").text(index + "/" + data.length);
			$(".progressBox .inner div").css({
				"width": (index / data.length) * 100
			})
			if(index < data.length) {
				loadImages(data, index);
			} else { //图片资源加载完成
				$("#gameBox .dlg_bg").hide();
				$(".progressBox").hide();
				loadEl.remove();
				$("#gameBox .Spirit").show();
				startGame();
			}
		}
		var img = new Image();
		img.onload = load;
		img.onerror = load;
		img.src = data[index];
	}

	/**
	 * 添加应用液列表
	 */
	function appendNutrienSolution(data) {
		var box = $(".nutrientSolutionBox");
		$(".nutrientSolutionBox").unbind("click");
		if(data.length > 0) {
			var temp = app.getTempBySelector("#nutrientSolutiontemp");
			box.empty(); //情况
			$.each(data, function(i, item) {
				item.nutrientpic = app.getImgPath(item.nutrientpic);
				box.append(temp(item));
			});
			box.append('<div class="triangle-down"></div>');
			$(".nutrientSolutionBg").css("height", (box.height()) + "px")
		} else {
			$(".nutrientSolutionBox").html("<div class='nullNutrient'>还没有营养液哦~</div>");
			box.append('<div class="triangle-down"></div>');
			$(".nutrientSolutionBox").bind("click", function() {
				hideNutrientSolutionBox();
			});
			$(".nutrientSolutionBg").css("height", (box.height()) + "px");
		}
	}

	/**
	 * 显示营养液
	 */
	function showNutrientSolutionBox() {
		//		$(".needStopOnBoxShow").removeClass("animated")
		$(".nutrientSolutionBox").css({
			"z-index": 10,
			top: "auto",
			right: "4.5rem",
			bottom: "3rem"
		}).show().animateCss("zoomIn");
		$(".nutrientSolutionBg").css({
			"z-index": 10,
			top: "auto",
			bottom: "3.2rem",
			right: "4.5rem"
		}).show().animateCss("zoomIn");
		app.isNutrientBoxShow = true;
	}
	//点击单个营养液的
	app.clickNutr = function(id) {
		hideNutrientSolutionBox();
		var el = $("#addNutrient");
		setGameBtnStatus(el.attr("id"), el);
		//获取选中的营养液
		app.selecedNutrient = app.gameNutrient[id];
		console.log(app.selecedNutrient);
	};
	//隐藏营养液选择框
	function hideNutrientSolutionBox() {
		//		$(".nutrientSolutionBox").animateCss("zoomOut");
		$(".nutrientSolutionBg").hide(300);
		app.isNutrientBoxShow = false;
		$(".nutrientSolutionBox").hide(300);
	}

	//创建一个能量球
	function createBubble(data, index) {
		console.log(data);
		var opertypeMap = {
			1: "会员注册",
			2: "邀请注册",
			3: "完善信息",
			4: "买卡/充值",
			6: "分享",
			8: "任务"
		}
		data.opertype = opertypeMap[data.opertype];
		if(!data.opertype) {
			data.opertype = "";
		}
		var bubble = $("<div class='bubble'><div class='needStopOnBoxShow animated infinite jello'>" + data.quantity + "ml</div><br>" + data.opertype + "</div>");
		var topBase = $("#gameBox").height() / 4;
		var baseLeft = $("#gameBox").width() / 8;
		var positions = [{
				top: topBase + 10,
				left: baseLeft + index * app.REM2PX(3)
			}, {
				top: topBase - 5,
				left: baseLeft + index * app.REM2PX(3)
			},
			{
				top: topBase,
				left: baseLeft + index * app.REM2PX(3)
			}, {
				top: topBase + 15,
				left: baseLeft + index * app.REM2PX(3)
			}
		]
		bubble.css(positions[index]);
		//点击漂浮的营养液
		bubble.click(function() {
			if(app.isInAction) { //如果处于动作中忽略点击
				return;
			}
			app.isInAction = true;
			service.pickNutrient(data.id, function() {
				app.myNutrients = null; //清空能量液
				gameTip(bubble, "+" + data.quantity + "ml")
				if(!app.isshowcover) {
					showCover({
							el: $("#addNutrient"),
							text: app.gameSysParam.ADDNUTRIENTCOVER,
							isunder: false
						},
						function() {
							$("#addNutrient")[0].onclick();
						});
				}
				bubble.remove();
				var next = app.nutrients.shift();
				if(next) {
					console.log(next);
					console.log("index:" + index);
					createBubble(next, index);
				}
				app.isInAction = false;
			}, function() { //报错的时候
				app.isInAction = false;
			});
		});
		$("#gameBox").append(bubble);
		bubble.animateCss("zoomIn");
	}

	function initBublles(list) {
		app.nutrients = list;
		for(var i = 0; i < 4; i++) {
			var data = list.shift();
			if(data) {
				createBubble(data, i);
			}
		}
	}
	/**
	 * 提示小的消息
	 * @param {Object} el
	 * @param {Object} msg
	 */
	function gameTip(el, msg) {
		var uuid = el.attr("uuid");
		var box = $("#" + uuid);
		if(!uuid) {
			uuid = app.uuid();
			el.attr("uuid", uuid);
			style = {
				"position": "absolute",
				"z-index": 3,
				"font-size": "0.7rem",
				"color": "white",
				width: "4rem",
				top: el[0].offsetTop,
				left: el[0].offsetLeft
			}
			box = $("<div><div id='" + uuid + "' style='position: relative;'></div></div>");
			$("#gameBox").append(box);
			box.css(style);
			box = box.find("#" + uuid);
		}
		console.log(uuid);
		var msgEl = "<div class='msg'>" + msg + "</div>"
		msgEl = $(msgEl);
		var style = {
			"position": "absolute",
			bottom: 0,
			width: "4rem"
		}
		msgEl.css(style);
		box.append(msgEl);
		msgEl.css("bottom", (0 - msgEl.height()) + "px");
		var msgEls = box.find('.msg');
		for(var i = 0; i < msgEls.length - 1; i++) {
			var EL = $(msgEls[i])
			var bottom = parseFloat(EL.css("bottom")) + msgEl.height();
			console.log("bottom:" + bottom);
			EL.css("bottom", bottom + "px");
		}
		hidemsgEl(msgEl);
	}

	function hidemsgEl(msgEl) {
		setTimeout(function() {
			msgEl.animateCss("fadeOutUp", function() {
				msgEl.remove();
			})
		}, 700)
	}
	/**
	 * 点击种子的种植
	 */
	app.clickPlantSeed = function(seedId) {
		if(app.isInAction) {
			return;
		}
		var seed = app.mySeeds[seedId];
		//选出可种植的
		var caps = [];
		$.each(app.myCaps, function(id, item) {
			if(item.seedid == 0) {
				caps.push(item);
			}
		});
		if(caps.length == 0) {
			hideCover();
			gameAlert(app.gameSysParam.BOTTLEFULL);
			return;
		}
		caps.sort(function(item1, item2) {
			return item1.id - item2.id;
		});

		//动作占用
		app.isInAction = true;
		plantSeed(seed, caps, 0);
	}

	function plantSeed(seed, caps, index) {

		var action = "weixin/mall/bottle/plantSeed.do";
		var data = {
			bottleId: caps[index].id,
			seedId: seed.id
		}
		app.POSTRequest(action, {
			data: data,
			success: function(data) {
				if(data.resultCode == 1) {
					//获取当前操作的瓶子
					var cap = caps[index];
					console.log(cap.sort);
					//caps下标加1
					index++;
					if(!service.getGameInfo("isShowgPLANTSUCCESS")) {
						showGameTip(app.gameSysParam.PLANTSUCCESS);
						service.setGameInfo("isShowgPLANTSUCCESS", true);
					}
					//更新cap的的seedid
					cap.seedid = seed.id;
					cap.stage = 0;
					//找到种植对应的图片
					var imgPath = getSeedStatusImg(cap);
					//更换瓶子的图片
					var capEl = $(".cap" + cap.id);
					capEl.attr("src", imgPath);
					if(!app.isshowcover) {
						app.hideSeedBox();
						app.coverCap = capEl;
						createShuiDi(cap, capEl);
						showCover({
							el: $(".bubble").eq(0),
							text: "点击收取营养液",
							isunder: true
						}, function() {
							$(".bubble").eq(0).click();
						})

					}

					//更换种子的数字
					seed.hasAmount--;
					if(seed.hasAmount < 1) {
						var els = $(".swiper-slide.seed");
						$.each(els, function(i, item) {
							if($(item).attr("id") == "seed" + seed.id) {
								app.mySwiper.removeSlide(i)
							}
						});
						els = $(".swiper-slide.seed");
						if(els.length == 0) {
                            var vHtml = "<div class='aui-text-center' style='width:100%;height:100%;' layout='column'  >"
                            vHtml += "<div flex></div>";
                            vHtml += "<div><p>袋子空空的哦~</p><p>去<a href=\"javascript:app.href('../html/memberRecharge.html')\" style='text-decoration:underline;color:#f28b02;font-size:0.8rem;'>赚种子</a></p></div>";
                            vHtml += "<div flex></div>";
                            vHtml += "</div>";
                            $("#seedlist").html(vHtml);
						}
					}
					//更换种子数字的显示
					$("#seedNum" + seed.id).html(
						getSeedNumStr(seed.hasAmount));
					createCapText(cap);
					//判断是否能继续种植
					var isCanBeContinue = seed.hasAmount > 0 && caps.length > index;
					countSeedsNum();
					app.isInAction = false;
					app.success("种子成功");
					//					if(isCanBeContinue) {
					//						//继续种植
					//						plantSeed(seed, caps, index);
					//					} else {
					//						if(caps.length <= index) {
					//							gameAlert(app.gameSysParam.BOTTLEFULL);
					//						}
					//						setTimeout(function() {
					//							//动作结束
					//							app.isInAction = false;
					//							app.hideSeedBox();
					//						}, 500)
					//					}

				} else {
					app.isInAction = false;
					new auiDialog().alert({
						title: "提示",
						"msg": "游戏内容发生变化，请刷新页面",
						buttons: ["刷 新"]
					}, function() {
						app.replace(location.href);
					});
				}
			},
			error: function(e) {
				//出现错误时，动作结束
				app.isInAction = false;
			}
		})
	}
	/**
	 * 获取一个种子的状态图片
	 */
	function getSeedStatusImg(cap) {
		var relativePath = null;
		var index = cap.stage;
		//判断是否成熟
		if(cap.stage == 5) {
			index = 4;
		}
		relativePath = app.gameSeeds[cap.seedid].seeddevelop[index].imgsrc;
		//判断是否有虫子
		if(cap.isbug == 1) {
			return "../imgs/game/7@2x.png"
		}
		return app.getImgPath(relativePath);
	}
	/**
	 * 浇灌营养液
	 * @param {Object} id 瓶子的id
	 * @param {Object} el 选择的瓶子的元素
	 */
	function irrigationSeed(cap, el, elTop, elLeft, ignoreBug) {
		var now = new Date().getTime();
		if(app.lastirrigationSeed) {
			if(now - app.lastirrigationSeed < 2000) {
				return;
			}
		}
		app.lastirrigationSeed = now;
		//如果没有种植种子
		if(cap.seedid == 0) {
			gameTip(el, "这是个空瓶哦")
			el.animateCss("rubberBand")
			return;
		}
		//判断有没有虫子生成
		var isbug = cap.isbug == 1;
		if(isbug) {
			if(ignoreBug) {
				//用户选择如果忽略虫子就继续
			} else {
				new auiDialog().alert({
					title: "是否确定添加",
					msg: app.gameSysParam.WATERWARING,
					buttons: ["取消", "确定"]
				}, function(ret) {
					//用户选择忽略虫子提示
					if(ret.buttonIndex == 2) {
						irrigationSeed(cap, el, elTop, elLeft, true);
					}
				});
				return;
			}
		}
		//判断有没有成熟
		if(cap.stage == 5) { //已经成熟的
			el.animateCss("rubberBand");
			gameTip(el, app.gameSysParam.VEGETABLERIPEN);
			return;
		}

		//组装数据
		var data = {
			bottleId: cap.id,
			seedId: cap.seedid,
			nutrientId: app.selecedNutrient.id
		}
		//请求的action
		var action = "weixin/mall/bottle/irrigationSeed.do";
		if(app.isInAction) {
			return;
		}
		//占用动作
		app.isInAction = true;
		gameLoading();

		function showCoverLast() {
			if(!app.isshowcover) {
				$(".coverLine").css("visibility", "visible");
				$(".coverText").css("visibility", "visible");
				$(".cover").css("visibility", "visible");
				showCover({
					el: $("#glbtn"),
					text: "点击按钮，查看游戏攻略",
					isunder: true
				}, function() {
					hideCover();
					$("#glbtn")[0].onclick();
				});
			}
		}

		app.POSTRequest(action, {
			data: data,
			success: function(data) {
				hideGameLoading();
				if(data.resultCode == 1) {
					data = data.resultObj;
					startWatering(elTop, elLeft, el, function() {
						//计算成长了多少能量
						el.animateCss("rubberBand");
						//如果浇水提示存在，移除
						if(cap.tipWateingImg) {
							//移除先前动画
							cap.tipWateingImg.removeClass("bounce animated infinite");
							//启动消失动画
							cap.tipWateingImg.animateCss("fadeOutUp", function() {
								cap.tipWateingImg.remove();
							});
						}
						showCoverLast();
						if(!service.getGameInfo("isShowgWATERSUCCESS")) {
							showGameTip(app.gameSysParam.WATERSUCCESS);
							service.setGameInfo("isShowgWATERSUCCESS", true);
						}
						var isChange = cap.stage != data.stage;
						if(isChange && data.stage != 5) {
							var description = app.gameSeeds[cap.seedid]
								.seeddevelop[data.stage]
								.description;
							gameTip(el, description);
						} else {
							var energy = data.energy - cap.energy;
							gameTip(el, "+" + energy + "g");
						}
						//如果成长状态发送变化，更新瓶子信息
						app.myCaps[data.id] = data;
						el.attr("src", getSeedStatusImg(data));
						if(data.stage == 5) {
							createRIPENEDImg(el, data);
						}
					});
				} else {
					showCoverLast();
					data.resultMsg = data.resultMsg
						.replace("<DubboException>", '')
						.replace("</DubboException>", '');
					//处理错误情况
					if(data.resultMsg == 1003) {
						gameAlert("该营养液不适用于该种子");
					} else if(data.resultMsg == 1004) { //已经成熟的种子
						gameTip(el, app.gameSysParam.VEGETABLERIPEN);
					} else if(data.resultMsg == 1005) {
						gameTip(el, "我今天已经喝饱啦，明天再来吧");
					} else if(data.resultMsg == 1006 || data.resultMsg == 1007) {
						gameAlert("营养液剩余数量不足");
					}
					app.isInAction = false;
				}
			},
			error: releaseAction
		});
	}
	/**
	 * 弹窗提示
	 * @param {Object} msg
	 */
	function gameAlert(msg) {
		new auiDialog().alert({
			title: "温馨提示",
			msg: msg,
			buttons: ["确定"],
		}, function(ret) {});
	}
	//显示加载动画
	function gameLoading() {
		//		$(".gameLoading").css("visibility", "visible");
	}
	//隐藏加载动画
	function hideGameLoading() {
		//		$(".gameLoading").css("visibility", "hidden");
	}
	/**
	 * 采摘蔬菜
	 */
	function pickingVegetables(cap, el) {
		if(cap.seedid == 0) {
			//没种植
			el.animateCss("rubberBand");
			gameTip(el, '蔬菜还没有种植哦');
			return;
		}
		//判断是否成熟
		if(cap.stage != 5) {
			//未成熟
			el.animateCss("rubberBand");
			gameTip(el, app.gameSysParam.NOTPICKTIP);
			return;
		}
		//占用动作
		app.isInAction = true;
		gameLoading();
		var action = "weixin/mall/bottle/pickingVegetables.do";
		app.POSTRequest(action, {
			data: {
				bottleId: cap.id,
				seedId: cap.seedid
			},
			success: function(data) {
				hideGameLoading();
				if(data.resultCode == 1) { //采摘成功
					//将图片缓存空瓶
					el.attr("src", "../imgs/game/capgamenull.png");
					el.animateCss("bounceInDown");
					//更新菜篮数字
					app.BasketNum++;
					//清除收割提示
					cap.RIPENEDImg ? cap.RIPENEDImg.remove() : "";
					//修改瓶子的状态
					app.myCaps[cap.id] = data.resultObj;
					createCapText(data.resultObj);
					//执行采摘动画
					startCaizhai(el);
					if(!service.getGameInfo("isShowgPICKSUCCESS")) {
						showGameTip(app.gameSysParam.PICKSUCCESS);
						service.setGameInfo("isShowgPICKSUCCESS", true);
					}
				} else {

					releaseAction();
				}

			},
			error: releaseAction
		});
	}
	//显示寓教于乐
	function showGameTip(msg) {
		var height = $(".gameTipBox").height();
		var gameHeight = $("#gameBox").height();
		var top = (gameHeight - height) / 2;
		var bg = $("<div class='dlg_bg' style='display:block'></div>");
		$("#gameBox").append(bg);
		$(".gameTipBox").parent().css({
			top: top
		}).show();
		$(".gameTipBox").show().animateCss("zoomIn");
		$(".gameTipBox .msg").text(msg);
		setTimeout(function() {
			$(".gameTipBox").animateCss("zoomOut", function() {
				$(".gameTipBox").parent().hide();
				bg.remove();
			});
		}, 3000)
	}

	/**
	 * 捕虫
	 * @param {Object} cap
	 * @param {Object} el
	 */
	function catchingBug(cap, el) {
		//判断当前瓶子上是否有虫子
		var isHasBug = cap.seedid != 0 && cap.isbug;
		if(!isHasBug) {
			el.animateCss("rubberBand");
			gameTip(el, app.gameSysParam.NOBUG);
			return;
		}
		var action = "weixin/mall/bottle/catchingBug.do";
		//占用动作
		app.isInAction = true;
		//捕虫动画
		var animateEl = $("<img src='../imgs/game/net.png' class='bugnet'>");
		animateEl.css({
			"position": "absolute",
			"z-index": "9",
			"width": el.width() + "px",
			top: (el[0].offsetTop + el.height() / 7) + "px",
			left: el[0].offsetLeft
		});
		$("#gameBox").append(animateEl);
		animateEl.animateCssInfinite("tada");
		//延时执行请求，让动画先跑一段时间
		setTimeout(function() {
			app.POSTRequest(action, {
				data: {
					bottleId: cap.id,
					seedId: cap.seedid,
				},
				success: function(data) {
					if(data.resultCode == 1) {
						//清楚cap中的有虫状态
						cap.isbug = 0;
						if(!service.getGameInfo("isShowgCARCHBUGSUCCESS")) {
							showGameTip(app.gameSysParam.CARCHBUGSUCCESS);
							service.setGameInfo("isShowgCARCHBUGSUCCESS", true);
						} else {
							gameTip(el, app.gameSysParam.CARCHBUGSUCCESS);
						}
						//切换图片
						el.attr("src", getSeedStatusImg(cap))
					} else {
						gameTip(el, "虫子太顽固，再试一次");
					}
					animateEl.remove();
					releaseAction();
				},
				error: function() {
					animateEl.remove();
					gameTip(el, "虫子太顽固，再试一次");
					releaseAction();
				}
			})
		}, 1000);
	}

	/**
	 * 释放动作占用
	 */
	function releaseAction() {
		//释放动作结束loading
		hideGameLoading();
		app.isInAction = false;
	}
	
	
	return app;
});