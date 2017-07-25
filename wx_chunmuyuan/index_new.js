define(["./base/baseApp", "swipe", "refresher","base/baseCar"], function(app, swipe, refresher,baseCar) {
	//变量定义
	//广告位置
	//变量定义结束

    //标题头模板
    app.advTitleTemp = app.getTempBySelector("#advTitleTemplate");

    /**
     * 首页判断登录跳转
     * @param url 登录后回调地址
     * @param relativePath 登录页面相对当前页面的路径
     */
    app.indexGo = function (url, relativePath) {
        if(!app.checkLogin()){
            var varUrl = url;
            if(!url.startsWith("http")){
                varUrl = relativePath + url;
            }
            localStorage.loginBackUrl = varUrl;
            app.href(app.netConfig.pageRoot+"/html/login.html?back=true");
        } else {
            app.href(url);
        }
    };

    /**
     * 快捷入库跳转
     * @param url
     * @param name
     */
    app.navigationGo = function (url,name) {
        if(name === "客服"){
            location.href = "tel://" + url;
        } else if(name === "会员充值"){
            app.indexGo(url,"../");
        } else if(name === "卡券激活"){
            app.indexGo(url,"../");
		} else {
            app.href(url);
        }
    };

    var labelName = {
    	"new":"新品",
    	"recommend":"推荐",
    	"selling":"热销"
	};

	/**
	 * 舒适轮播图信息
	 * @param {Object} data
	 */
	function initBannerView(data) {
		$("#bannerbox .swiper-wrapper").empty();
		$("#bannerbox .swiper-pagination").empty();
		//计算banner图高度(计算原则 设计图是 width:height = 2:1)
		var bannerHeight = $(window).width() / 2;
		//设置banner顶级容器高度
		$("#bannerbox").css("height", bannerHeight + "px");
		//找到模板
		var temp = app.getTempBySelector("#bannerTemplate");
		//找到存放banner的容器
		var box = $("#bannerbox .swiper-wrapper");
		for(var i = 0; i < data.length; i++) {
			var item = data[i];
			//计算图片全路径
			//item.img = app.getImgPath(item.img);
			//将元素添加到容器
			box.append(temp(item));
		}
		//开启swipe
		startSwipe("#bannerbox");
	}
	/**
	 * 开始启用swipe组件
	 */
	function startSwipe(selector) {
		app.mySwiper = new Swiper(selector, {
			loop: true,
			initialSlide: 0,
			autoplay: 3000,
			pagination: selector + ' .swiper-pagination'
		});
	}

	// 启动swipe组件
	function openSwipe(selector) {
        app.slideSwiper = new Swiper(selector, {
            pagination: selector + ' .swiper-pagination',
            slidesPerView: 1.24,
            centeredSlides: true,
            paginationClickable: true,
            spaceBetween: 10,
        });
    }

// 启动swipe组件
	function openSwipe2(selector) {
        app.slideSwiper = new Swiper(selector, {
            loop : false,
			slidesPerView : 'auto',
			loopedSlides :8,
            spaceBetween:40,
        });
    }


	
	// 启动营养知识swipe组件
	function openSwipe1(selector) {
        app.slideSwiper1 = new Swiper(selector, {
            pagination: selector + ' .swiper-pagination',
            slidesPerView: 1.24,
            centeredSlides: true,
            paginationClickable: true,
            spaceBetween: 10,
            initialSlide :1,
            loop: true,
            loopAdditionalSlides :1,
        });
    }

    function marquee(selector,speed) {
        var box=$(selector)[0],can=true,liheight = $(selector + " li").height();
        box.innerHTML+=box.innerHTML;
        //box.onmouseover=function(){can=false};
        //box.onmouseout=function(){can=true};
        new function (){
            var stop=box.scrollTop%liheight==0&&!can;
            if(!stop)box.scrollTop==parseInt(box.scrollHeight/2)?box.scrollTop=0:box.scrollTop++;
            setTimeout(arguments.callee,box.scrollTop%liheight?10:speed);
        };
    }

	// 初始化营养知识
    function initNutrition(item) {
        $(".nutrition-swiper").text("");
        var template = app.getTempBySelector("#nutritionTemp");
        $.each(item.advs,function (index, item) {
            $(".nutrition-swiper").append(template(item));
        });
        changeBoxPosition($("#nutrition"));
        openSwipe1("#nutrition-swiper-container");
    }

    // 初始化分类
    function initColumn(item) {
        var template = app.getTempBySelector("#columnTemp");
        $.each(item.advs,function (index, item) {
            $("#columnUl").append(template(item));
        });
        changeBoxPosition($("#dh"));
    }

	//加载资讯内容
	function loadInformation(data) {
        var template = app.getTempBySelector("#informationTemp");
		$.each(data.advs,function (index, item) {
            $("#informationDiv ul").append(template(item));
        });
        changeBoxPosition($("#informationBox"));
        //$("#informationUl2").html($("#informationUl1").html());
        marquee("#informationDiv",1500);
	}
	/**
	 * 将盒子从body中移除，添加到contentbox，并显示
	 * @param {Object} boxSelector
	 */
	function changeBoxPosition(box) {
		//将盒子从body中移除
		box.remove();
		//将盒子添加到contentbox
		$("#contentBox").append(box);
		//将盒子设置为显示
		box.show();
	}
	//初始化导航按钮
	function initNaviAction(data) {
		//找到导航的盒子
		var box = $("#advNavigation");
		//生成盒子第一个子容器
		var row1 = $('<div layout layout-align="center center" style="height: 3.5rem"></div>');
		//生成盒子第二个子容器
		var row2 = $('<div layout class="aui-margin-b-15"></div>');
		//找到模板
		var temp = app.getTempBySelector("#advNavigationTemplate");
		for(var i = 0; i < 8; i++) {
			var item = data[i];
			if(i < 4) {
				//前面4个添加到第一行 如果没数据就添加一个占位div
				row1.append(item ? temp(item) : "<div flex></div>");
			} else {
				//后面4个添加到第二行 如果没数据就添加一个占位div
				row2.append(item ? temp(item) : "<div flex></div>");
			}
		}
		//将子容器加到盒子中
		box.append(row1, row2);
		//将盒子从body中移除，添加到contentbox，并显示
		changeBoxPosition(box);
        changeBoxPosition($("#hyqy"));
	}
	//生成一个广告的头部
	function createTitleBox(item, hideImg, hideMore) {
		item.hideImg = hideImg;
		item.hideMore = hideMore;
		//计算广告位 图片的真实地址
		//item.img = app.getImgPath(item.img);
		var box = app.advTitleTemp(item);
		return $(box);
	}

	//初始化 蔬菜广告（自选菜和宅配）
	function initVeg(item) {
		//生成容器盒子
		var box = $("<div style='margin-bottom: 0.5rem'></div>");
		//生成自选菜盒子
		var optionalBox = createTitleBox(item.header);
		//去掉下边距
		optionalBox.removeClass("aui-margin-b-10");
		if(item.sort != 5 && item.sort != 7){
			box.append("<div class='nav' style='width:100%;text-align:center;'><img src="+ kobe +" style='width:50%;' /></div>");
		}
		box.append(optionalBox);
		var listStr = '<div class="swiper-container" id="contant-scroll'+item.position+'" style="background-color: #FFFFFF;padding-left:0.2rem">' +
			'<div  class="swiper-wrapper">' +
			'</div></div>';
		var optionalList = $(listStr);
		
		optionalBox.append(optionalList);
		//找到蔬菜商品的模板
		var temp = app.getTempBySelector("#vegetablesTemplate");
		//计算一个模板的宽度(计算规则，全屏的2/5)
		var itemWidth = $(window).width() / 5 * 1.6;
		//alert(itemWidth)
		//添加自选菜
		$.each(item.advs, function(i, item) {
			item.width = itemWidth;
            item.labelname = item.label?labelName[item.label]:"";
			//计算蔬菜图片的全路径
			//item.img = app.getMiddelPath(item.img);
			//添加模板进去
			optionalList.find(".swiper-wrapper").append(temp(item));
		});

        changeBoxPosition(box);
        openSwipe2("#contant-scroll" + item.position);
	}
	
	//初始化  宅配套餐、种植机、盆栽
	function initVeg1(item) {
		console.log(item)
		//生成容器盒子
		var box = $("<div style='margin-bottom: 0.5rem'></div>");

		//生成自选菜盒子
		var optionalBox = createTitleBox(item.header);
		//去掉下边距
		optionalBox.removeClass("aui-margin-b-10");
		if(item.sort == 7){
			box.append("<div class='nav'><div class='middleNav'><div class='leftNav'></div>宅配套餐<div class='rightNav'></div></div></div>")
		}
		
		if(item.sort != 5 && item.sort != 7){
			box.append("<div class='nav' style='width:100%;text-align:center;'><img src="+ kobe +" style='width:50%;' /></div>");
		}
		
		box.append(optionalBox);
		var listStr = '<div class="swiper-container" id="contant-scroll'+item.position+'" style="background-color: #FFFFFF;padding-left:0.2rem">' +
			'<div  class="swiper-wrapper">' +
			'</div></div>';
		var optionalList = $(listStr);
		optionalBox.append(optionalList);
		//找到蔬菜商品的模板
		var temp = app.getTempBySelector("#vegetablesTemplate");
		var plantTemplate = app.getTempBySelector("#plantTemplate");
		//计算一个模板的宽度(计算规则，全屏的2/5)
		var itemWidth = $(window).width() / 5 * 2.6;
		//alert(itemWidth)
		//添加自选菜
		$.each(item.advs, function(i, item1) {
            item1.width = itemWidth;
            item1.labelname = item1.label?labelName[item1.label]:"";
			//计算蔬菜图片的全路径
			//item.img = app.getMiddelPath(item.img);
			//添加模板进去
            if(item.position === "POTTEDPLANT" || item.position === "PLANTMACHINE"){
                optionalList.find(".swiper-wrapper").append(plantTemplate(item1));
			} else {
                optionalList.find(".swiper-wrapper").append(temp(item1));
			}
		});

        changeBoxPosition(box);
        
        openSwipe2("#contant-scroll" + item.position);
	}
	
	
	//初始化热销商品
	function initGoods2(item) {
		var box1 = createTitleBox(item.header, false, true);
		//找到热销商品的模板\
		box.append(box1);
		var temp = app.getTempBySelector("#hotsellTemplate");
		//计算一个模板的宽度(计算规则，全屏的1/2)
		var itemWidth = $(window).width() / 2;
		var row = null;
		$.each(item.advs, function(i, item) {
			if(i % 2 == 0) {
				row = $("<div layout class='app_bg_white'></div>");
				box.append(row);
			}
			item.width = itemWidth;
            item.labelname = item.label?labelName[item.label]:"";
			//计算图片的全路径
			//item.img = app.getMiddelPath(item.img);
			row.append(temp(item));
		});
		changeBoxPosition(box);
	}
	//营销活动
	function initCampaings(item, data) {
		//改变标题颜色
		var last2Ch = item.title.substring(item.title.length - 2);
		item.title = item.title.substring(0, item.title.length - 2) +
			'<span class="app-text-orange">' + last2Ch + '</span>';
		//生成盒子
		var box = createTitleBox(item, true);

		var temp = null;
		var boxwidth = $(window).width();
		app.actImg1Height = boxwidth / 5 * 3;
		if(data.length == 1) { //一张图
			temp = app.getTempBySelector("#campaing1temp");
			//标准是 （750/450）
		} else if(data.length == 2) { //2张图
			temp = app.getTempBySelector("#campaing2temp");
		} else if(data.length == 3) {
			temp = app.getTempBySelector("#campaing3temp");
			app.actImg1Width = boxwidth / 25 * 14;
		} else {
			temp = app.getTempBySelector("#campaing4temp");
		}
		//计算图片全路径
		$.each(data, function(i, item) {
			item.img = app.getImgPath(item.img);
		});
		box.append(temp(data));
		changeBoxPosition(box);
	}

	//初始化下拉刷新
	function initRefresh() {
		$("#wrapper").css("height", $(window).height() - app.REM2PX(2.5))
		var isInpull = false;
		refresher.domDown = {
			domClass: 'nulldom',
			domRefresh: '<div></div>',
			domLoad: '<div></div>',
			domNoData: '<div></div>'
		}
		var dtime = 500; //头部隐藏和显示的动画时间
		refresher.onStartPull = function() {
			if(isInpull) {
				return;
			}
			isInpull = true;
			$("#header").animate({
				opacity: 0
			}, dtime, function() {
				$("#header").hide();
			});
			$("#headerbg").animate({
				opacity: 0
			}, dtime, function() {
				$("#headerbg").hide();
			});
		}
		refresher.onCancelPull = function() {
			$("#headerbg").show();
			$("#header").show();

			$("#header").animate({
				opacity: 1
			}, dtime, function() {
				isInpull = false;
			});
			$("#headerbg").animate({
				opacity: 0.5
			}, dtime, function() {});
		}
		app.pageRefresher = refresher.initDropload("#wrapper",
			function(me) {
				setTimeout(function() {
					me.resetload();
					refresher.onCancelPull();
				}, 2000);
			},
			function(me) {
				me.noData();
				me.resetload();
			});
	}
	//初始化底部栏
	function initTab() {
		new auiTab({
			element: document.getElementById("footer"),
			repeatClick: true
		}, function(ret) {
			if(ret.index == 4) {
				if(!app.checkLogin()) {
					app.toLoginPage();
				} else {
					app.href("html/userCenter.html");
				}
			} else if(ret.index == 3) {
				app.href("html/shoppingCar.html");
			} else if(ret.index == 2) {
				app.href("liveVideo/index.html");
			} else {
				app.replace(location.href);
			}
		});
	}


	app.init = function() {
		loadData(init);
		if(!app.checkLogin()) {
			$("#loginbtn").show();
		}
		scrolls()
	};
	
	//回到顶部
	function scrolls(){
		$("#wrapper").scroll(function(){  
			if($("#wrapper").scrollTop() >= $(window).height()*2){
				$("#mask").show();
			}else{
				$("#mask").hide();
			}
		})
		
		$("#mask").on("click",function(){
			 $('#wrapper').animate({scrollTop:0},300);  
                return false;  
		})
        
	}


	// 获取首页静态数据初始化
	function init(data) {
        initTab();
        initCar();
        renderAdvs(data);
        initRefresh();
        
    }

    // 渲染广告位
    function renderAdvs(data) {
		console.log(data);
        $.each(data,function (index, item) {
            if(item.position === "BANNER"){ //显示banner 0
                initBannerView(item.advs);
            } else if(item.position === "NAVIGATION"){ // "快捷入口" 1
                initNaviAction(item.advs);
            } else if(item.position === "INFORM"){// "资讯信息" 2
                loadInformation(item);
            } else if(item.position === "NAVIGATION"){// "营销活动" 3
                // initCampaings(item, campaingsData);
            } else if(item.position === "COLUMN"){// "商品分类" 4
                initColumn(item);
            } else if(item.position === "OPTIONAL"){// "自选菜" 5
                initVeg(item);
            } else if(item.position === "LEAF"){// "叶菜篇" 5
                initVeg(item);
            } else if(item.position === "FRUIT"){// "果菜篇" 5
                kobe = 'imgs/index1.png';
                initVeg(item);
            } else if(item.position === "PACKAGE"){// "宅配套餐" 6
                initVeg1(item);
            } else if(item.position === "HOTSELL"){// "热销推荐" 7
                // initGoods2(item, hotSellData);
            } else if(item.position === "CARD"){// "礼品卡" 8

            } else if(item.position === "PLANTMACHINE"){// "种植机" 9
                //处理种植机
                kobe = 'imgs/index2.png';
                initVeg1(item);
        		openSwipe2("#contant-scroll");
                //initGoods2(item);
            } else if(item.position === "POTTEDPLANT"){// "盆栽" 10
                //处理种盆栽              
//              kobe = 'imgs/index3.png';
//              initVeg1(item);
//              initGoods2(item);
            } else if(item.position.trim() === "OPERATIONENTY"){// "个人中心操作入口" 11

            } else if(item.position === "KNOWLEDGE"){// "营养知识" 12
                initNutrition(item);
            }
        });
        // 我种我送
        changeBoxPosition($("#wzws"));
        // 礼品卡vip
        changeBoxPosition($("#vipc"));
    }

    // 初始化购物车
    function initCar() {
        baseCar.init(function(){
            if(baseCar.sum>0){
                var sum = baseCar.sum>99?99:baseCar.sum;
                $("#carNum").show().text(sum);
            }
        });
    }

    //加载首页静态数据
    function loadData(callback) {
        require([app.getNetServer("d") + "wx_n_index_data.js?_=" + new Date().getTime()], function() {
            if(callback && typeof callback === "function"){
                callback(positionData);
            }
        }, function() {
            app.tipInfo("数据加载失败");
        });
    }

	return app;
});