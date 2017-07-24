define(["./base/baseApp", "../game/gameService"], function(app, service) {
	//定义变量
	var seedTop, seedLeft; //种子的top位置和left位置
	projectimgs = service.projectimgs;
	$.each(projectimgs, function(i, it) {
		projectimgs[i] = app.netConfig.pageRoot + "/imgs/game/" + it;
	});
	/**
	 * 创建杯子下的文字，显示种子名称
	 * @param {Object} cap
	 */
	function createCapText(cap,el){
		if(!app.capTexts){
			app.capTexts = {};
		}
		var textEl = null
		var capEl = el;
		if(!app.capTexts[cap.id]){
			app.capTexts[cap.id] = $("<div class='absolute'></div>");
			textEl = app.capTexts[cap.id]
			textEl.css({
				top:capEl[0].offsetTop+capEl.height(),
				"font-size":"0.6rem",
				"color":"#fff"
			});
			$("#gameBox").append(textEl);
		}else{
			textEl = app.capTexts[cap.id]
		}
		if(cap.seedid==0){
			textEl.text("");
			return;
		}
		var seedName = app.gameSeeds[cap.seedid].names;
		if(seedName.length>4){
			seedName = seedName.substring(0,4);
		}
		textEl.text(seedName)
		var width = textEl.width();
		var capElWidth = capEl.width();
		var cha = capElWidth -width;
		textEl.css({
			width:"100%",
			"text-align":"center",
			left:0
		});
	}
	/**
	 * 显示距离下一阶段还剩多少克
	 */
	function tipNextStep(){
		if(app.myCap.stage==5){//已经成熟了
			$(".nextStaupTip").hide();
		}else{
			var now = app.myCap.energy;
			var stage = app.myCap.stage;
			var need = 1;
			for(var i=0;i<=stage;i++){
				need+=app.mySeed.seeddevelop[i].energy;
			}
			
			$(".nextStaupTip").show().text("距离下个阶段还需 "+(need-now)+"g 能量");
		}
	}
	
	//定义变量结束

	/**
	 * 开始游戏
	 */
	function startGame() {
		if(!service.getGameInfo("showDetailsCover")){
			showCovers();
			return;
		}
		service.bottleInfo(function(data) {
			//防止图片
			var img = document.createElement("img");
			$(img).click(function(){
				if(app.isInAction){
					return;
				}
				if(app.myCap.stage==5){
					gameTip($(img),app.gameSysParam.VEGETABLERIPEN);
					return;
				}
				if(app.selecedNutrient){
					irrigationSeed();
				}
			});
			img.src = getSeedStatusImg(data);
			$(".seedBg").append(img);
			app.myCap = data;
			app.mySeed = app.gameSeeds[app.myCap.seedid];
			createCapText(app.myCap,$(img));
			//设置详情
			$("#description").html(app.mySeed.description);
			$("#description img").css({width:"100%","display":"block"})
			//设置成长进度
			setGrothProcess(true);
			//设置湿度
			setHumidity();
			//设置温度
			setTemperature();
			tipNextStep();
			if(app.mySeed.videourl&&app.mySeed.videoshow==1){
				$(".videoBox").show();
				$(".videoBox").html('<video style="width: 100%;height: 100%;" controls="controls">'+
					'<source src="'+app.mySeed.videourl+'" type="video/ogg">'+
				'</video>')
			}
			/**
			 * 初始化点击事件
			 */
			$(".gameBtn").click(function() {
				app.doAction($(this).attr("id"), this);
			});
			if(data.stage == 5) {
				createRIPENEDImg($(img), app.myCap);
			}
		}, app.UrlParams.bottleId);
	}
	/**
	 * 创建一个成熟提示图标
	 * @param {Object} el
	 */
	function createRIPENEDImg(el, cap) {
		setTimeout(function() {
			var style = {
				"position": "absolute",
				"z-index": 1,
				top: el[0].offsetTop,
				left: el[0].offsetLeft + el.width() / 3 * 2,
				"width": "2rem"
			}
			cap.RIPENEDImg = $("<img src='../imgs/game/ripened.png'>");
			cap.RIPENEDImg.css(style);
			$("#gameBox").append(cap.RIPENEDImg);
//			cap.RIPENEDImg.animateCssInfinite("headShake");
		}, Math.random() * 1000 + 10)
	}

	/**
	 * 添加应用液列表
	 */
	function appendNutrienSolution(data) {
		var box = $(".nutrientSolutionBox");
		$(".nutrientSolutionBox").unbind("click");
		if(data.length > 0) {
			var temp = app.getTempBySelector("#nutrientSolutiontemp");
			box.empty(); //清空
			box.append('<div class="triangle-up"></div>');
			$.each(data, function(i, item) {
				item.nutrientpic = app.getImgPath(item.nutrientpic);
				box.append(temp(item));
			});
			$(".nutrientSolutionBg").css("height", (box.height()) + "px")
		}else{
			box.append('<div class="triangle-up"></div>');
			box.append("<div class='nullNutrient'>还没有营养液哦~</div>");
			box.bind("click",function(){
				hideNutrientSolutionBox();
			});
			$(".nutrientSolutionBg").css("height", (box.height()) + "px");
		}
		
	}

	/**
	 * 显示营养液
	 */
	function showNutrientSolutionBox() {
		$(".nutrientSolutionBox").show().animateCss("zoomIn");
		$(".nutrientSolutionBg").show().animateCss("zoomIn");
		app.isNutrientBoxShow = true;
	}
	//点击单个营养液的
	app.clickNutr = function(id) {
		hideNutrientSolutionBox();
		//获取选中的营养液
		app.selecedNutrient = app.gameNutrient[id];
		$("#tjnlBtn img").animateCssInfinite("mypulse");
		irrigationSeed();
	};

	/**
	 * 浇灌营养液
	 * @param {Object} id 瓶子的id
	 * @param {Object} el 选择的瓶子的元素
	 */
	function irrigationSeed(ignoreBug) {
		var now = new Date().getTime();
		if(app.lastirrigationSeed){
			if(now-app.lastirrigationSeed<2000){
				return;
			}
		}
		var el = $(".seedBg img");
		var cap = app.myCap;
		//如果没有种植种子
		if(cap.seedid == 0) {
			gameTip(el, "这是个空瓶哦")
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
						irrigationSeed(true);
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
		//占用动作
		if(app.isInAction){
			return;
		}
		app.isInAction = true;
		gameLoading();
		app.POSTRequest(action, {
			data: data,
			success: function(data) {
				hideGameLoading();
				if(data.resultCode == 1) {
					data = data.resultObj;
					startWatering(el, function() {
						releaseAction();
						//计算成长了多少能量
						var energy = data.energy - cap.energy;
						el.animateCss("rubberBand");
						var isChange = cap.stage != data.stage;
						if(isChange&&data.stage!=5) {
							var description = app.mySeed.seeddevelop[data.stage]
												.description;
							gameTip(el, description);
						}else{
							var energy = data.energy - cap.energy;
							gameTip(el, "+" + energy + "g");
						}
						//如果浇水提示存在，移除
						if(cap.tipWateingImg) {
							//移除先前动画
							cap.tipWateingImg.removeClass("bounce animated infinite");
							//启动消失动画
							cap.tipWateingImg.animateCss("fadeOutUp", function() {
								cap.tipWateingImg.remove();
							});
						}
						//如果成长状态发送变化，更新瓶子信息
						app.myCap = data;
						setGrothProcess(true);
						el.attr("src", getSeedStatusImg(data));
						if(data.stage == 5) {
							createRIPENEDImg(el, data);
						}
						tipNextStep();
						//判断有没有执行过浇水
						if(!service.getGameInfo("isShowWATERSUCCESS")){
							showGameTip(app.gameSysParam.WATERSUCCESS);
							service.setGameInfo('isShowWATERSUCCESS',true);
						}
					});
				} else {
					app.selecedNutrient = null;
					$("#tjnlBtn img").removeClass("animated mypulse");
					data.resultMsg = data.resultMsg
							.replace("<DubboException>",'')
							.replace("</DubboException>",'');
					//处理错误情况
					if(data.resultMsg == 1003){
						gameAlert("该营养液不适用于该种子");
					}else if(data.resultMsg == 1004){//已经成熟的种子
						gameTip(el, app.gameSysParam.VEGETABLERIPEN);
					}else if(data.resultMsg == 1005){
						gameTip(el, "我今天已经喝饱啦，明天再来吧");
					}else if(data.resultMsg == 1006 || data.resultMsg ==1007){
						gameAlert( "营养液剩余数量不足");
					}
					app.isInAction = false;
				}
			},
			error: releaseAction
		});
	}

	//隐藏营养液选择框
	function hideNutrientSolutionBox() {
		$(".nutrientSolutionBox").animateCss("zoomOut");
		$(".nutrientSolutionBg").animateCss("zoomOut", function() {
			$(".nutrientSolutionBg").hide();
			$(".nutrientSolutionBox").hide();
			app.isNutrientBoxShow = false;
		});
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
	 * 设置进度
	 */
	function setGrothProcess(noanimate) {
		var now = app.myCap.energy;
		var total = 0
		app.mySeed.seeddevelop.map(function(level, i) {
			total += parseInt(level.energy);
		});
		if(now > total) {
			now = total;
		}
		//颜色条
		var process = now / total * 100;
		var el = $(".progressBox .inner div");
		//数字显示
		$(".processNum").text(now + "/" + total);
		$(".progressBox").show();
		if(noanimate) {
			el.animate({
				width: process + "%"
			});
			return;
		}
		var processAry = ["100%", "0", process / 2 + "%", "0", process + "%"];
		$.each(processAry, function(i, value) {
			el.animate({
				"width": value
			}, {
				duration: 200,
				queue: true
			});
		});

	}

	app.initPage = function() {
		var gameBoxHeight = $("#gameBox .gamebg").height();
		$("#gameBox").css("height", gameBoxHeight + "px");
		var el = $(".seedBg")[0];
		seedTop = el.offsetTop;
		seedLeft = el.offsetLeft;
	};
	/**
	 * 设置温度
	 */
	function setTemperature() {
		var el = $(".temperature span").eq(0);
		var textEl = $(".temperature span").eq(1);
		var tag = app.myCap.temperature;
		var hi = app.mySeed.maxtemperature;
		var mi = app.mySeed.mintemperature;
		el.text(tag);
		if(tag < mi) {
			app.captemperature = "big";
			textEl.text("（偏低）");
		} else if(tag > hi) {
			app.captemperature = "s";
			textEl.text("（偏高）");
		} else {
			app.captemperature = "";
			textEl.text("（适宜）");
		}

	}
	//设置湿度
	function setHumidity() {
		var el = $(".humidity span").eq(0);
		var textEl = $(".humidity span").eq(1);
		var tag = app.myCap.humidity;
		var hi = app.mySeed.maxhumidity;
		var mi = app.mySeed.minhumidity;
		el.text(tag);
		if(tag < mi) {
			app.caphumidity = "quik";
			textEl.text("（偏低）");
		} else if(tag > hi) {
			app.caphumidity = "slow";
			textEl.text("（偏高）");
		} else {
			app.caphumidity = "";
			textEl.text("（适宜）");
		}
	}

	//延迟一定时间后设置字符串
	function setTextTimeOut(el, tag, time) {
		setTimeout(function() {
			el.text(tag);
		}, time);
	}

	//结束阳光动画
	function endSunAnimation() {
		$(".sun").removeClass("mypulse pulse animated infinite").hide();
	}
	/**
	 * 执行阳光动画
	 * @param {Object} type
	 */
	function startSunAnimation(type) {
		var bigY = seedTop - app.REM2PX(2);
		var bigX = seedLeft + app.REM2PX(6);
		var bigStyle = {
			"top": bigY + "px",
			"left": bigX + "px",
			"width": "3.5rem",
			"height": "3.5rem"
		};
		el = $("#sunBtn")[0]
		var sY = el.offsetTop - app.REM2PX(1.2);
		var sX = el.offsetLeft + app.REM2PX(1.2);
		var sStyle = {
			"top": sY + "px",
			"left": sX + "px",
			"width": "1.2rem",
			"height": "1.2rem"
		};
		if(type == "big") {
			$(".sun").css(sStyle).show()
				.animate(bigStyle, 1000, function() {
					$(".sun").animateCssInfinite("mypulse");
				});
		} else {
			$(".sun").css(bigStyle).show()
				.animate(sStyle, 1000, function() {
					$(".sun").animateCssInfinite("pulse");
				});
		}
	}
	//结束风扇动画
	function endSpinAnimation() {
		$(".spin").removeClass("infinite slow quik toslow toquik").hide();
	}
	//风扇动画
	function startSpinAnimation(type) {
		var bigY = seedTop - app.REM2PX(3);
		var bigX = seedLeft + app.REM2PX(2.5);
		var style = {
			"top": bigY + "px",
			"left": bigX + "px",
		};

		if(type == "slow") {
			$(".spin").css(style).show()
				.animateCss("toslow", function() {
					$(".spin").animateCssInfinite("slow");
				});
		} else {
			$(".spin").css(style).show()
				.animateCss("toquik", function() {
					$(".spin").animateCssInfinite("quik");
				});
		}
	}
	//显示气泡信息
	function showBubble(msg) {
		var style = {
			top: seedTop - app.REM2PX(3),
			left: seedLeft + $(".seedBg").width() - app.REM2PX(1.6),
			display: "block"
		}
		$(".buddle").css(style).animateCss("flash");
	}
	//显示寓教于乐
	function showGameTip(msg) {
		var style = {
			"z-index": "10",
			top: seedTop - app.REM2PX(0.5),
			left: seedLeft - app.REM2PX(3),
			display: "block"
		}
		var bg = $("<div class='dlg_bg' style='display:block'></div>");
		$("#gameBox").append(bg);
		$(".gameTipBox").css(style).animateCss("zoomIn");
		$(".gameTipBox .msg").text(msg);
		setTimeout(function(){
			$(".gameTipBox").animateCss("zoomOut",function(){
				$(".gameTipBox").hide();
				bg.remove();
			});
		},3000)
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
					console.log(app.gameSysParam);
					hideGameLoading();
					//加载图片资源
					loadImages(projectimgs, 0);
				}, "biz")
			}, true);
		}, true);

	}
	/**
	 * 加载静态资源数据
	 */
	var loadEl = $('<div class="dlg_bg" style="display:block"><div class="aui-text-center aui-font-size-14 absolute" style="color: #fff;top: 9rem;z-index: 10;width: 100%;">资源加载中...</div></div>');

	function loadImages(data, index) {
		var proccess = $("#proccess");
		if(index == 0) {
			$("#gameBox").append(loadEl);
			loadEl.find("div").animateCssInfinite("flash")
			proccess.css({
				"z-index": "10",
				top: app.REM2PX(8),
				left: $(window).width() / 2 - proccess.width() / 2
			}).show();
			proccess.find(".processNum").text("0/" + data.length);
		}

		function load() {
			index++;
			proccess.find(".processNum").text(index + "/" + data.length);
			proccess.find(".inner div").css({
				"width": (index / data.length) * 100
			})
			if(index < data.length) {
				loadImages(data, index);
			} else { //图片资源加载完成
				proccess.remove();
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
	app.init = function() {
		loadBaseGameInfo();
	}
	/**
	 * 点击上面是个
	 */
	app.doAction = function(action, el) {
		if(app.isInAction) { //正在执行中，不做任何处理
			return;
		}
		if(app.isNutrientBoxShow) {
			hideNutrientSolutionBox();
			return;
		}
		/**
		 * 如果是选中营养液的情况
		 */
		if(app.selecedNutrient){
			app.selecedNutrient = null;
			$("#tjnlBtn img").removeClass("animated mypulse");
			if(action == "tjnlBtn") {
				return;
			}
		}
		if(action == "tjnlBtn") {
			app.isInAction = true;
			gameLoading();
			service.getNutrientList(function(data) {
				hideGameLoading();
				app.myNutrients = data;
				appendNutrienSolution(data);
				showNutrientSolutionBox();
				app.isInAction = false;
			}, false, 1);
		} else if(action == "sunBtn") { //点击太阳
			controlTemperature($(".seedBg img"));
		} else if(action == "spinBtn") { //点击风扇
			controlHumidity($(".seedBg img")); //调湿度
		} else { //捕虫
			catchingBug(app.myCap, $(".seedBg img"));
		}

	};
	//调温
	function controlTemperature(el) {
		if(app.captemperature == "") {
			gameTip(el,app.gameSysParam.CHANGETEM)
			return;
		}
		//占用动作
		app.isInAction = true;
		//开始动画
		startSunAnimation(app.captemperature);
		var action = "weixin/mall/bottle/controlTemperature.do";
		var data = {
			bottleId: app.myCap.id,
			seedId: app.myCap.seedid
		}
		setTimeout(function() {
			app.POSTRequest(action, {
				data: data,
				success: function(data) {
					if(data.resultCode == 1) {
						app.myCap = data.resultObj;
						setTemperature();
						//判断有没有执行过调温
						if(!service.getGameInfo("isShowCHANGETEM")){
							showGameTip(app.gameSysParam.CHANGEHIMSUCCESS);
							service.setGameInfo('isShowCHANGETEM',true);
						}
						gameTip(el, app.gameSysParam.CHANGEHIMSUCCESS);
					}
					endSunAnimation();
					releaseAction();
				},
				error: function() {
					endSunAnimation();
					releaseAction();
				}
			});
		}, 2000)

	}
	//条湿度
	function controlHumidity(el) {
		if(app.caphumidity == "") {
			gameTip(el,app.gameSysParam.CHANGEHIM)
			return;
		}
		//占用动作
		app.isInAction = true;
		//开始动画
		startSpinAnimation(app.caphumidity);
		var action = "weixin/mall/bottle/controlHumidity.do";
		var data = {
			bottleId: app.myCap.id,
			seedId: app.myCap.seedid
		}
		setTimeout(function() {
			app.POSTRequest(action, {
				data: data,
				success: function(data) {
					if(data.resultCode == 1) {
						app.myCap = data.resultObj;
						//判断有没有执行过调温
						if(!service.getGameInfo("isShowCHANGEHIM")){
							showGameTip(app.gameSysParam.CHANGEHIM);
							service.setGameInfo('isShowCHANGEHIM',true);
						}
						setHumidity();
						gameTip(el, app.gameSysParam.CHANGEHIM);
					}
					endSpinAnimation();
					releaseAction();
				},
				error: function() {
					endSpinAnimation();
					releaseAction();
				}
			});
		}, 2000)

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
			gameTip(el,app.gameSysParam.NOBUG);
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
						//判断有没有执行过调温
						if(!service.getGameInfo("isShowCARCHBUGSUCCESS")){
							showGameTip(app.gameSysParam.CARCHBUGSUCCESS);
							service.setGameInfo('isShowCARCHBUGSUCCESS',true);
						}
						//清楚cap中的有虫状态
						cap.isbug = 0;
						//切换图片
						el.attr("src", getSeedStatusImg(cap))
						gameTip(el, app.gameSysParam.CARCHBUGSUCCESS);
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
	 * 提示小的消息
	 * @param {Object} el
	 * @param {Object} msg
	 */
	function gameTip(el, msg) {
		var uuid = el.attr("uuid");
		var box = $("#"+uuid);
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
			box = $("<div><div id='"+uuid+"' style='position: relative;'></div></div>");
			$("#gameBox").append(box);
			box.css(style);
			box = box.find("#"+uuid);
		}
		var msgEl = "<div class='msg'>"+msg+"</div>"
		msgEl = $(msgEl);
		var style = {
			"position": "absolute",
			bottom:0,
			width:"4rem"
		}
		msgEl.css(style);
		box.append(msgEl);
		msgEl.css("bottom",(0-msgEl.height())+"px");
		var msgEls = box.find('.msg');
		for(var i=0;i<msgEls.length-1;i++){
			var EL = $(msgEls[i])
			EL.css("bottom",parseFloat(EL.css("bottom"))+msgEl.height()+"px");
		}
		setTimeout(function(){
			msgEl.animateCss("fadeOutUp", function() {
				msgEl.remove();
			})
		},700)
		
	}
	/**
	 * 浇水动画
	 */
	function startWatering(el, endBack) {
		$(".addpowerbox").css({
			top: (seedTop - 30) + "px",
			left: (seedLeft + app.REM2PX(4)) + "px",
			"display": "block"
		});
		$(".addpowerbox").animateCss("myswing", function() {
			$(".addpowerbox").hide();
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
			endBack();
		}, oncetime + startTime + animateTime + stopTime);
	}
	
	/**
	 * 释放动作占用
	 */
	function releaseAction() {
		//释放动作结束loading
		hideGameLoading();
		app.isInAction = false;
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
	function showCovers() {
		var coverData = [{
				el: $("#tjnlBtn"),
				text: app.gameSysParam.ADDNUTRIENTCOVER,
				isunder: true
			}, {
				el: $("#spinBtn"),
				text: app.gameSysParam.CHANGEHIMCOVER,
				isunder: true
			},
			{
				el: $("#sunBtn"),
				text: app.gameSysParam.CHANGETEMCOVER,
				isunder: true
			},{
				el: $("#catch"),
				text: app.gameSysParam.CATCBUGCOVER,
				isunder: true
			}
			
		];
		showCover(coverData, 0);
	}
	//显示新手指引页
	function showCover(data, index) {
		var item = data[index];
		var el = item.el;
		var text = item.text;
		var isunder = item.isunder;

		var cicleEl = $(".cover .cicle");
		var elLine = $(".coverLine");
		var elText = $(".coverText");

		function onclick() {
			index++;
			if(index < data.length) {
				showCover(data, index)
			} else {
				$(".cover").css({
					"z-index": -1
				});
				$(".coverText").css({
					"z-index": -1
				});
				$(".coverLine").css({
					"z-index": -1
				});
				service.setGameInfo("showDetailsCover", true);
				startGame();
			}
		}

		elText.unbind("click").bind("click", onclick);
		elLine.unbind("click").bind("click", onclick);
		$(".cover").unbind("click").bind("click", onclick);

		//控制覆盖圈的top位置的元素
		var topEl = $(".bgblock").eq(1);
		//控制覆盖圈的left位置的元素
		var leftEl = $(".bgblock").eq(0);
		//计算top偏移量
		var height = el[0].offsetTop - (cicleEl.height() - el.height()) / 2;
		//计算left偏移量
		var width = el[0].offsetLeft - (cicleEl.height() - el.width()) / 2;
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
		if($(window).width() / 2 > width) {
			elLine.addClass("left");
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
	return app;
});