define(["./base/baseApp", "swipe", "refresher","base/baseCar", "./base/cmycounts"], function(app, swipe, refresher,car, _CMY) {

    app.car = car; //购物车对象赋值

    app.stock = {}; //商品库存

    var carSkus = {}; // 购物车商品
    
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
        if(name === "客服小二"){
            location.href = "tel://" + url;
        } else if(name === "会员充值"){
            app.indexGo(url,"../");
        } else if(name === "卡券激活"){
            app.indexGo(url,"../");
        } else {
            app.href(url);
        }
    };

    // 初始化购物车
    function initCar() {
        car.init(function(){
            if(car.sum>0){
                var sum = car.sum>99?99:car.sum;
                $("#carNum").show().text(sum);
            }
            loadCard();
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

    app.init = function(){
        if(!app.checkLogin()) {
            $("#loginbtn").show();
        }
        initTab();
        initCar();
        loadData(render);
    };


    app.initPage = function () {
        this.carTop = $(window).height() - $("#car_icon").height() * 2;
        this.carLeft = $("#car_icon").offset().left;
    };

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

    // mapdata
    var mapdata = {};

    // 渲染数据
    function render(data) {
        console.log(data);
        $.each(data,function (index, item) {
            mapdata[item.position] = item;
        });
        initBannerView(mapdata["BANNER"]); //首页banner
        loadInformation(mapdata["INFORM"]); // "资讯信息" 2
        initNaviAction(mapdata["NAVIGATION"].advs);// "快捷入口" 1
        initColumn();// "商品分类" 4 mapdata["COLUMN"]
        common.changeBoxPosition($("#tab-content"));
        changeTab(0);
    }
    
    function changeTab(index) {
        $("#tab-content").height($("#tab-content").height());
        $("#tab-content").empty();
        switch(index){
            case 0 :
                recommendTab();
                break;
            case 1 :
                optionalTab();
                break;
            case 2 :
                packageTab();
                break;
            case 3 :
                cardTab();
                break;
            case 4 :
                planterTab();
                break;
            default:
                recommendTab();
                break;
        }
    }

    // 推荐tab
    function recommendTab() {
        query4Sku(1,function (data) {
            initToday(mapdata["FRUIT"]);  // 今日推荐
            addSeparate();
            initVeg(mapdata["LEAF"]);  // "自选菜" 5
            addSeparate();
            initVeg(mapdata["PACKAGE"]);  // "宅配套餐" 6
            addSeparate();
            initNutrition(mapdata["KNOWLEDGE"]);
            addSeparate();
            initWZWS();
            $("#tab-content").height("auto");
        });
    }

    // 时令蔬果
    function optionalTab() {
        query4Sku(1,renderTab4Sku);
    }

    // 渲染蔬菜
    function renderTab4Sku(data) {
        var contentTemp = app.getTempBySelector("#vegTabContentTemp");
        var temp = app.getTempBySelector("#vegTemp");

        var $content = $(contentTemp());
        for(var i = 0; i < data.length; i++) {
            var item = data[i];
            var tempData = {
                id:item.id,
                img:app.getMiddelPath(item.picpath),
                url:"goods/goodsDetails.html?pid="+(item.product.type==3?("p"+item.product.id):("s"+item.id)),
                name:item.skuname,
                ads:item.product.ads,
                sellprice:item.sellprice,
                weight:item.weight,
                skuType:item.product.type,
                stock:item.stock
            }
            getCarSkuCount(tempData);
            $content.append(temp(tempData));
        }
        $("#tab-content").append($content);
        $("#tab-content").height("auto");
    }

    function renderTab4Product(data){
        var contentTemp = app.getTempBySelector("#vegTabContentTemp");
        var temp = app.getTempBySelector("#vegTemp");

        var $content = $(contentTemp());
        for(var i = 0; i < data.length; i++) {
            var item = data[i];
            var tempData = {
                id:item.id,
                img:app.getMiddelPath(item.picpath),
                url:"goods/goodsDetails.html?pid=p"+item.id,
                name:item.names,
                ads:item.ads,
                sellprice:item.price,
                weight:item.weight,
                skuType:item.type
            }
            $content.append(temp(tempData));
        }
        $("#tab-content").append($content);
        $("#tab-content").height("auto");
    }

    // 营养套餐
    function packageTab() {
        query4Sku(2,renderTab4Sku);
    }

    // 礼品卡
    function cardTab() {
        query4Product(3,renderTab4Product);
    }

    // 种植机
    function planterTab() {
        query4Product(6,renderTab4Product);
    }

    // 初始化我种我送
    function initWZWS() {
        var temp = app.getTempBySelector("#wzwsTemp");
        $("#tab-content").append(temp({}));
    }

    // 初始化蔬菜
    function initVeg(item){
        var advs = item.advs;
        var contentTemp = app.getTempBySelector("#vegContentTemp");
        var temp = app.getTempBySelector("#vegTemp");

        var $content = $(contentTemp($.extend(item.header,common.vegData[item.position])));
        for(var i = 0; i < advs.length; i++) {
            var tempData = advs[i];
            tempData.labelname = tempData.label?common.labelName[tempData.label]:"";
            getCarSkuCount(tempData);
            $content.append(temp(tempData));
        }
        $("#tab-content").append($content);
    }

    // 初始化今日推荐
    function initToday(item) {
        var advs = item.advs;
        var contentTemp = app.getTempBySelector("#todayContentTemp");
        var temp = app.getTempBySelector("#todayTemp");

        var $content = $(contentTemp({}));
        for(var i = 0; i < advs.length; i++) {
            var tempData = advs[i];
            tempData.labelname = tempData.label?common.labelName[tempData.label]:"";
            getCarSkuCount(tempData);
            $content.append(temp(tempData));
        }
        $("#tab-content").append($content);
    }

    /**
     * 获取购物车数量
     * @param tempData
     */
    function getCarSkuCount(tempData) {
        if(app.car.data[tempData.id]) { //购物车同步到页面
            tempData.count = app.car.data[tempData.id].skucount;
            if(app.car.data[tempData.id].skucount > app.stock[tempData.id].stock){
                tempData.count = app.stock[tempData.id].stock;
                app.car.minus(tempData.id, app.car.data[tempData.id].skucount - app.stock[tempData.id].stock, function() {
                    setCarSum();
                });
            }
        } else {
            tempData.count = 0;
        }
    }

    function addSeparate() {
        var temp = app.getTempBySelector("#separateTemp");
        $("#tab-content").append(temp({}));

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

    // 加载轮播图
    function initBannerView(item) {
        if(!item || !item.advs){
            return
        }
        var data = item.advs;
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

    //加载资讯内容
    function loadInformation(data) {
        var marquee = function (selector,speed) {
            var box=$(selector)[0],can=true,liheight = $(selector + " li").height();
            box.innerHTML+=box.innerHTML;
            //box.onmouseover=function(){can=false};
            //box.onmouseout=function(){can=true};
            new function (){
                var stop=box.scrollTop%liheight==0&&!can;
                if(!stop)box.scrollTop==parseInt(box.scrollHeight/2)?box.scrollTop=0:box.scrollTop++;
                setTimeout(arguments.callee,box.scrollTop%liheight?10:speed);
            };
        };
        var template = app.getTempBySelector("#informationTemp");
        $.each(data.advs,function (index, item) {
            $("#informationDiv ul").append(template(item));
        });
        common.changeBoxPosition($("#informationBox"));
        //$("#informationUl2").html($("#informationUl1").html());
        marquee("#informationDiv",1500);
    }

    //初始化导航按钮
    function initNaviAction(data) {
        //找到导航的盒子
        var box = $("#advNavigation");
        //生成盒子第一个子容器
        var row1 = $('<div layout layout-align="center center" style="height: 3.5rem"></div>');
        //生成盒子第二个子容器
        var row2 = $('<div layout class=""></div>');
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
        common.changeBoxPosition(box);
    }

    // 初始化分类
    function initColumn() {
        var template = app.getTempBySelector("#columnTemp");
        var advs = [{
            name:"今日推荐",
            index:0
        },{
            name:"时令蔬果",
            index:1
        },{
            name:"营养套餐",
            index:2
        },{
            name:"礼品卡",
            index:3
        },{
            name:"种植工厂",
            index:4
        }];
        $.each(advs,function (index, item) {

            $("#columnUl").append(template(item));
        });
        app.colClick = function (el) {
            if($(el).hasClass("active")){
                return;
            }
            $("#dh li").removeClass("active");
            $(el).addClass("active");
            var index = $(el).data("index");
            changeTab(index);
        };
        common.changeBoxPosition($("#dh"));
        $("#columnUl li:first-of-type").addClass("active");
    }

    // 初始化营养知识
    function initNutrition(item) {
        var advs = item.advs;
        var contentTemp = app.getTempBySelector("#nutritionContentTemp");
        var temp = app.getTempBySelector("#nutritionTemp");
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

        var $content = $(contentTemp({}));
        var $swiper = $content.find(".nutrition-swiper");
        for(var i = 0; i < advs.length; i++) {
            var tempData = advs[i];
            tempData.labelname = tempData.label?common.labelName[tempData.label]:"";
            $swiper.append(temp(tempData));
        }
        $("#tab-content").append($content);
        openSwipe1("#nutrition-swiper-container");
    }

    /**
     * 查询sku
     */
    function query4Sku(productType,callback,skuids) {
        app.POSTRequest("weixin/mall/sku/skuLists.do", {
            data: {
                productType: productType, //商品类型(1:自选菜,2:宅配套餐,3:礼品卡,4:充值卡)
                columnId: "", //商品所属分类id
                beginPage: 1,
                key: "", //搜索关键字
                hide: "0", //是否隐藏售罄商品
                pageSize: 100000000,
                skuids: skuids?skuids:""
            },
            loading: "加载中...",
            success: function(data) {
                console.log(data);
                if(data.resultCode === "1") {
                    if(callback && typeof callback === "function"){
                        $.each(data.basePageObj.dataList,function (i,it) {
                            app.stock[it.id] = it	;
                            it.minPrice = (it.sellprice*app.sellMin).toFixed(2);
                        });
                        callback(data.basePageObj.dataList);
                    }
                } else if(data.resultCode === "-1") {
                    app.toLoginPage(location.href);
                } else {
                    app.tipInfo(data.resultMsg);
                }
            },
            error: function() {

            }
        });
    }

    /**
     * 查询product
     */
    function query4Product(productType,callback) {

        app.POSTRequest("weixin/mall/sku/queryProductList.do", {
            data: {
                productType: productType, //商品类型(1:自选菜,2:宅配套餐,3:礼品卡,4:充值卡,6:种植机)
                beginPage: 1,
                pageSize: 1000000000
            },
            loading: "加载中...",
            success: function(data) {
                console.log(data);
                if(data.resultCode === "1") {
                    if(callback && typeof callback === "function"){
                        callback(data.basePageObj.dataList, productType);
                    }
                } else if(data.resultCode === "-1") {
                    app.toLoginPage(location.href);
                } else {
                    app.tipInfo(data.resultMsg);
                }
            },
            error: function() {

            }
        });
    }

    app.clickPlus = function(el, e, sku) {
        if(!app.stock[sku]){
            app.tipInfo("该商品已下架！");
            return;
        }
        if((app.car.data[sku]?app.car.data[sku].skucount + 1:1) > app.stock[sku].stock){
            app.tipInfo(app.stock[sku].skuname + "商品库存只有" + app.stock[sku].stock + "个哦！");
            return;
        }
        if(app.car.isNetBack) {
            app.car.add(sku, 1, function() {
                var num = $(el).prev().val();
                $(el).prev().val(++num);
                app.showCarAnimate(el, e);
                setCarSum(); //显示购物车总数
            });
        }

    };

    app.clickMinus = function(el, e, sku) {
        var num = $(el).next().val();
        if(num<=1){
            $(el).parent().hide();
            $(el).parent().prev().show();
        }
        if(num <= 0) {
            $(el).next().val(0);
            return;
        }
        if(app.car.isNetBack) {
            this.car.minus(sku, 1, function() {
                $(el).next().val(--num);
                setCarSum(); //显示购物车总数
            });
        }
    };

    // 切换添加购物车按钮
    app.clickShow = function(el, e, sku, skuType){
        if(skuType == 1){
            showOptional(el ,e ,sku);
        } else if(skuType == 2){
            app.href('goods/goodsDetails.html?pid=s' + sku);
        } else if(skuType == 3){
            app.href('goods/goodsDetails.html?pid=p' + sku);
        } else if(skuType == 6){
            app.href('goods/goodsDetails.html?pid=p' + sku);
        }
    }

    function showOptional(el ,e ,sku) {
        if(!app.stock[sku]){
            app.tipInfo("该商品已下架！");
            return;
        }
        if((app.car.data[sku]?app.car.data[sku].skucount + 1:1) > app.stock[sku].stock){
            app.tipInfo(app.stock[sku].skuname + "商品库存只有" + app.stock[sku].stock + "个哦！");
            return;
        }
        $(el).hide();
        $(el).next().show();
        $(el).next().find('input').val(1);
        if(app.car.isNetBack) {
            app.car.add(sku, 1, function() {
                var num = $(el).next().find('input').val();
                $(el).prev().val(++num);
                app.showCarAnimate(el, e);
                setCarSum(); //显示购物车总数
            });
        }
    }

    //点击加号后的动画效果
    app.showCarAnimate = function(e, event) {
        event.stopPropagation();
        var $img = $(e).closest(".img-card-li").find(".img-card-show");
        var imgOffset = $img.offset();
        var x = imgOffset.left;
        var y = imgOffset.top - $(window).scrollTop();
        var dx = this.carLeft;
        var dy = this.carTop;
        var id = "move_logo" + this.uuid();
        //$("body").append("<div id='" + id + "' class='move_logo' style='top:" + y + "px;left:" + x + "px;'><img src='' ><div>");
        var img = $img.attr("src");
        var imgWidth = $img.width();
        var imgHeight = $img.height();
        var tempData = {
            id:id,
            x:x,
            y:y,
            img:img,
            imgWidth:imgWidth,
            imgHeight:imgHeight
        };
        var temp = app.getTempBySelector("#moveImgTemp");
        $("body").append(temp(tempData));
        setTimeout(function() {
            $("#" + id).animate({
                "left": dx + "px",
                "top": dy + "px",
                "width": 10 + "px",
                "height": 10 + "px",
            }, 800, function() {
                $("#" + id).remove();
            });
        }, 10);
    }

    //显示购物车总数
    function setCarSum() {
        var sum = app.car.sum;
        if(sum < 1) {
            $("#carNum").hide();
        } else {
            $("#carNum").show();
            $("#carNum").text(sum > 99 ? 99 : sum);
        }
    }

    //添加数据
    function addCarSkus(data) {
        $.each(data, function(index, item) {
            carSkus["sku" + item.id] = item;
        });
    }

    // 加载购物车中的商品
    function loadCard() {
        var ids = car.getSkus();
        if(ids.length < 1) {
            return;
        };
        app.POSTRequest("weixin/mall/sku/queryBySkuid.do", {
            data: {
                skuid: ids
            },
            success: function(data) {
                if(data.resultCode == 1) {
                    addCarSkus(data.resultObj);
                } else {
                    app.tipInfo("购物车商品加载失败");
                }
            },
            complete: function() {

            }
        });

    }

    // 显示vip优惠
    app.showVipDailog = function(){
        $(".vipDialog").show();
    };

    // 关闭vip优惠
    app.hideVipDailog = function(){
        $(".vipDialog").hide();
    };

    /**
     * 公用方法
     *
     */
    var common = {
        vegData:{
            LEAF:{
                headerName:"时令蔬果",
                headerAds:"从春沐源到餐桌的每一棵蔬菜，保证安全无农残"
            },
            PACKAGE:{
                headerName:"营养套餐",
                headerAds:"营养师为您精心搭配，每周配两次"
            }
        },
        labelName: {
            "new":"新品",
            "recommend":"推荐",
            "selling":"热销"
        },
        /**
         * 将盒子从body中移除，添加到contentbox，并显示
         * @param {Object} boxSelector
         */
        changeBoxPosition: function(box) {
            //将盒子从body中移除
            box.remove();
            //将盒子添加到contentbox
            $("#contentBox").append(box);
            //将盒子设置为显示
            box.show();
        }
    };

    $(window).scroll(function(){
        $("#dh").offset().top < $(window).scrollTop()?$("#columnUl").addClass("fixed"): $("#columnUl").removeClass("fixed");
        if($(window).scrollTop() >= $(window).height()*2){
            $("#mask").show();
        }else{
            $("#mask").hide();
        }
    });


    $("#mask").on("click",function(){
        $(window).animate({scrollTop:0},300);
        return false;
    })

	console.log('统计的有吗？');
    _CMY.init({
    	page_view: '首页',
    	clickDom: '.j-counts',
    	attrKey: 'data-type'
    });

    return app;
});