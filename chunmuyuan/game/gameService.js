/**
 * 定义游戏需要的接口
 */
define([], function() {
	var service = {};
	//本地资源
	service.projectimgs = ["0.png",
		"1.png",
		"2.png",
		"3.png",
		"4.png",
		"5.png",
		"6.png",
		"7.png",
		"8.png",
		"9.png",
		"nutrient.png",
		"bigsun.png",
		"bubble.png",
		"cailan.png",
		"caizai.png",
		"cap1.png",
		"cap2.png",
		"cap3.png",
		"cap4.png",
		"capgamenull.png",
		"cap5.png",
		"cap6.png",
		"converText.png",
		"cover.png",
		"coverLine.png",
		"gamebg.png",
		"gamedelbg.png",
		"gonglue.png",
		"gongluebanner.png",
		"humidity.png",
		"jinpai.png",
		"net.png",
		"package.png",
		"powerball.png",
		"seedbg.png",
		"shelf.png",
		"ripened.png",
		"shuidi1.png",
		"shuidi2.png",
		"shuihu.png",
		"spin.png",
		"sun.png",
		"temperature.png",
		"tipbg.png",
		"tjnl.png",
		"tongpai.png",
		"x.png",
		"ripenedBig.png",
		"yinpai.png"
	];
	/**
	 * 游戏本地信息
	 */
	service.gameInfo = null;
	/**
	 * 获取本地游戏状态
	 * @param {Object} key
	 */
	service.getGameInfo = function(key) {
		if(service.gameInfo == null) {
			var temp = app.getLocalObject("gameInfos");
			service.gameInfo = temp ? temp : {}
		}
		return this.gameInfo[key];
	}
	/**
	 * 设置本地游戏状态
	 * @param {Object} key
	 * @param {Object} value
	 */
	service.setGameInfo = function(key, value) {
		if(service.gameInfo == null) {
			var temp = app.getLocalObject("gameInfos");
			service.gameInfo = temp ? temp : {}
		}
		this.gameInfo[key] = value;
		app.setLocalObjet("gameInfos", this.gameInfo);
	}

	service.post = function(action, callBack, data, err) {
		app.POSTRequest(action, {
			data: data,
			success: function(data) {
				if(data.resultCode == 1) {
					callBack(data.resultObj);
				} else {
					if(err) {
						err();
					}
					app.tipInfo(data.resultMsg);
				}
			},
			error: function() {
				if(err) {
					err();
				}
			}
		});
	};

	/**
	 * 获取我的种子袋
	 * @param {Object} callBack
	 */
	service.getMeSeedList = function(callBack) {
		var action = "weixin/mall/meseed/meSeedList.do";
		this.post(action, callBack);
	};

	/**
	 * 获取营养液
	 * @param {Object} callBack
	 */
	service.getNutrientList = function(callBack, ishasLog, pageSize, error) {
		var action = "weixin/mall/menutrient/meNutrientList.do";
		var data = {
			ishasLog: ishasLog == 1 ? 1 : -1,
			pageSize: pageSize
		}
		this.post(action, callBack, data, error);
	};

	/**
	 * 获取所有的种子
	 * @param {Object} callBack
	 */
	service.getAllSeeds = function(callBack, useCache, error) {
		var action = "weixin/mall/meseed/allSeedInfo.do";
		var key = "allSeeds";
		var cache = app.getLocalObject(key);
		if(useCache) {
			callBack(cache)
			return;
		}
		this.post(action, function(data) {
			app.setLocalObjet(key, data);
			callBack(data);
		}, {}, error);
	};
	/**
	 * 获取所有的营养液信息
	 * @param {Object} callBack
	 * @param {Object} useCache
	 */
	service.getAllNutrient = function(callBack, useCache, error) {
		var action = "weixin/mall/menutrient/allNutrientInfo.do";
		var key = "allNutrient";
		var cache = app.getLocalObject(key);
		if(useCache) {
			callBack(cache)
			return;
		}
		this.post(action, function(data) {
			app.setLocalObjet(key, data);
			callBack(data);
		}, {}, error);
	}
	/**
	 * 获取游戏首页数据
	 * @param {Object} callBack
	 */
	service.getKaleyardInfo = function(callBack, error) {
		var action = "weixin/mall/bottle/kaleyardInfo.do";
		var data = {
			rPageSize: 3,
			fPageSize: 10
		}
		this.post(action, callBack, data, error);
	}
	/**
	 * 收取能量
	 */
	service.pickNutrient = function(nutrientId, callBack, error) {
		var action = "weixin/mall/bottle/pickNutrient.do";
		var data = {
			nutrientDetailId: nutrientId
		}
		service.post(action, callBack, data, error);
	}
	/**
	 * 种植
	 */
	service.plantSeed = function(seedId, bottleId, callBack, error) {
		var action = "weixin/mall/bottle/plantSeed.do";
		var data = {
			bottleId: bottleId,
			seedId: seedId
		}
		service.post(action, callBack, data, error);
	}

	/**
	 * 浇灌
	 */
	service.irrigationSeed = function(data, callBack, error) {
		service.post(action, callBack, data, error);
	}
	/**
	 * 我的菜篮
	 */
	service.myBasket = function(callBack,error) {
		var action = "weixin/mall/bottle/myBasket.do";
		var data = {
			beginPage: 1,
			pageSize: 999,
			flag: 1
		};
		app.POSTRequest(action,{
			data:data,
			success:function(data){
				if(data.resultCode==1){
					callBack(data.basePageObj.dataList);
				}
			}
		});
	}
	/**
	 * 获取单个瓶子的详情
	 */
	service.bottleInfo = function(callBack,id){
		var action = "weixin/mall/bottle/bottleInfo.do";
		var data = {
			bottleId:id
		};
		service.post(action,callBack,data);
	}
	return service;
});