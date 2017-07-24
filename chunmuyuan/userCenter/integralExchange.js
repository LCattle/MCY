/**
 * Created by wuxuanhua on 17/5/8.
 */

define(["base/baseApp", "dialog", "animate", "refresher", "./base/basePage"], function(app, dialog, animate, refresher, page) {

    //获取模版
    var exchangeSeeds = app.getTempBySelector("#exchangeSeedsTemplate");
    var exchangeEnergy = app.getTempBySelector("#exchangeEnergyTemplate");

    var usedTag = 'list-seeds'; //list-energy
    var locked = false;

    app.init = function() {
        initRefresh('wrapper-seeds');
        getExchangeSeedList();
    };

    app.initPage = function() {
        var h = $(window).height() - $("#tab").height();

        $("#list-seeds").css("width", $(window).width() + "px");
        $("#list-seeds").css("min-height", h + "px");

        $("#list-energy").css("width", $(window).width() + "px");
        $("#list-energy").css("min-height", h + "px");
        
        $("#list-integral").css("width", $(window).width() + "px");
        $("#list-integral").css("min-height", h + "px");

        $("#wrapper-seeds").css("height", h + "px");
        $("#wrapper-seeds").css("overflow", "scroll");

        $("#wrapper-energy").css("height", h + "px");
        $("#wrapper-energy").css("overflow", "scroll");
        
        $("#wrapper-integral").css("height", h + "px");
        $("#wrapper-integral").css("overflow", "scroll");
    };

    //初始化下拉刷新
    function initRefresh(domId) {
        page.reset();
        $('.dropload-down').remove();
        app.pageRefresher = refresher.initDropload("#"+domId,
            function(me) {
                page.reset();
                me.noData(false);

                if(usedTag == 'list-seeds'){
                    getExchangeSeedList(me);
                }else{
                    getExchangeNutrientList(me);
                }
            },
            function(me) {
                if(page.hasNextPage) {
                    if(usedTag == 'list-seeds'){
                        getExchangeSeedList(me);
                    }else{
                        getExchangeNutrientList(me);
                    }
                } else {
                    me.noData();
                    me.resetload();
                }
            });
    }

    //TAB切换
    var animateFinished = true;
    app.changeTab = function(id){
        if(!animateFinished) return;
        if(id == 'seeds' && !$("#seeds").hasClass('aui-active')){
            $("#energy").removeClass('aui-active');
            $("#seeds").addClass('aui-active');
            $("#integral").removeClass('aui-active');
            
            $(".list-integral").hide();
            $(".list-energy").hide();
            $(".list-seeds").show();
//          animateFinished = false;
//          $(".list-energy").animateCss("slideOutRight", function() {
//              $(".list-energy").hide();
//          });
//          $(".list-seeds").show().animateCss("slideInLeft", function(){
//              animateFinished = true;
//          });
            usedTag =  'list-seeds';
            initRefresh('wrapper-seeds');
            $("#"+usedTag).empty();
            resetExchangeInfo();
        }else if(id == 'energy' && !$("#energy").hasClass('aui-active')){
            $("#energy").addClass('aui-active');
            $("#seeds").removeClass('aui-active');
            $("#integral").removeClass('aui-active');
            
            $(".list-integral").hide();
            $(".list-energy").show();
            $(".list-seeds").hide();
//          animateFinished = false;
//          $(".list-seeds").animateCss("slideOutLeft", function() {
//              $(".list-seeds").hide();
//          });
//          $(".list-energy").show().animateCss("slideInRight", function(){
//              animateFinished = true;
//          });
            usedTag =  'list-energy';
            initRefresh('wrapper-energy');
            $("#"+usedTag).empty();
            resetExchangeInfo();
        }else if(id == 'integral' && !$("#integral").hasClass('aui-active')){
            $("#energy").removeClass('aui-active');
            $("#seeds").removeClass('aui-active');
            $("#integral").addClass('aui-active');
            
            $(".list-integral").show();
            $(".list-energy").hide();
            $(".list-seeds").hide();
//          animateFinished = false;
//          $(".list-seeds").animateCss("slideOutLeft", function() {
//              $(".list-seeds").hide();
//          });
//          $(".list-energy").show().animateCss("slideInRight", function(){
//              animateFinished = true;
//          });
            usedTag =  'list-energy';
            initRefresh('wrapper-energy');
        }
    };

    //重置信息
    function resetExchangeInfo(){
        page.reset();
        $("#"+usedTag).empty();
        if(usedTag == 'list-seeds'){
            getExchangeSeedList();
        }else{
            getExchangeNutrientList();
        }
    }

    //重设content高度
    function resetContentHeight(tagId){
        var itemHeight = $("#"+tagId+" .aui-col-xs-6").height() || 0;
        var itemUnm = $("#"+tagId+" .aui-col-xs-6").length || 0;
        var height = itemHeight*itemUnm/2;
        var minHeight = $(window).height() - $("#tab").height();
        if(height > minHeight){
            $(".aui-content").css("min-height", height + "px");
        }else{
            $(".aui-content").css("min-height", minHeight + "px");
        }
    }

    /**
     * 绘制列表
     * @param dataList
     * @param tagId 'list-seeds' 'list-energy'
     */
    function drawList(dataList, tagId){
        if(page.pageIndex == 1) {
            $("#"+tagId).empty();
        }

        var exchangeItem = '';
        dataList.forEach(function(item, i){
            if(tagId == 'list-seeds'){
                exchangeItem += exchangeSeeds({
                    seedid: item.seedid,
                    ruleid: item.ruleid,
                    point: item.point,
                    picpath: app.getMiddelPath(item.seed.picpath), //getImgPath getThumbPath
                    skuname: item.seed.skuname,
                    names: item.seed.names,
                    tagId: tagId
                });
            }else{
                exchangeItem += exchangeEnergy({
                    nutrientid: item.nutrientid,
                    ruleid: item.ruleid,
                    quantity: item.quantity,
                    score:item.score,
                    nutrientpic: app.getMiddelPath(item.nutrient.nutrientpic), //getImgPath getThumbPath
                    nutrientname: item.nutrient.nutrientname,
                    tagId: tagId
                });
            }
        });

        $("#"+tagId).append(exchangeItem);

        //$(".item-img img").height($(".item-img img").width());
        //resetContentHeight(tagId);
    }

    /**
     * 可兑换的种子列表
     */
    function getExchangeSeedList(me){
        me = me || app.pageRefresher;
        if(locked) return;
        locked = true;
        var action = "member/exchange/exchangeSeedList.do";
        app.POSTRequest_m(action, { //POSTRequest
            data: {},
            loading:"请求中...",
            success: function(data) {
                me.resetload();
                if(data.resultCode === "1") {
                    page.hasNextPage = data.basePageObj.hasNextPage;
                    var dataList = data.dataList || [];
                    page.addData(dataList); //往page添加数据

                    drawList(dataList, usedTag);
                    locked = false;

                    page.pageIndex++;
                } else if(data.resultCode === "-1") {
                    app.toLoginPage(location.href);
                } else {
                    app.tipInfo(data.resultMsg);
                }
            }
        });
    };

    /**
     * 可兑换的营养液列表
     */
    function getExchangeNutrientList(me){
        me = me || app.pageRefresher;
        if(locked) return;
        locked = true;
        var action = "member/exchange/exchangeNutrientList.do";
        app.POSTRequest_m(action, { //POSTRequest
            data: {},
            loading:"请求中...",
            success: function(data) {
                me.resetload();
                if(data.resultCode === "1") {
                    page.hasNextPage = data.basePageObj.hasNextPage;
                    var dataList = data.dataList || [];
                    page.addData(dataList); //往page添加数据

                    drawList(dataList, usedTag);
                    locked = false;

                    page.pageIndex++;
                } else if(data.resultCode === "-1") {
                    app.toLoginPage(location.href);
                } else {
                    app.tipInfo(data.resultMsg);
                }
            }
        });
    };

    //兑换种子
    app.doExchangeSeeds = function(seedid, ruleid){
        var dialog = new auiDialog({});
        dialog.alert({
            title:"",
            msg:'确定要兑换该种子？',
            buttons:['取消','确定']
        },function(ret){
            if(ret.buttonIndex == 2){
                exchangeSeedSave(ruleid,seedid);//兑换种子
            }
        });
    };

    //兑换种子
    function exchangeSeedSave(ruleid,seedid){
        var action = "member/exchange/exchangeSeedSave.do";
        app.POSTRequest_m(action, { //POSTRequest
            data: {
                ruleid:ruleid,
                seedid:seedid
            },
            loading:"提交中...",
            success: function(data) {
                if(data.resultCode === "1") {
                    app.tipInfo('种子兑换成功～');
                } else if(data.resultCode === "-1") {
                    app.toLoginPage(location.href);
                } else {
                    app.tipInfo(data.resultMsg);
                }
            }
        });
    }

    //兑换营养液
    app.doExchangeNuLiquid = function(nutrientid, ruleid,score){
        var dialog = new auiDialog({});
        dialog.alert({
            title:"",
            msg:'确定要兑换该营养液？',
            buttons:['取消','确定']
        },function(ret){
            if(ret.buttonIndex == 2){
                exchangeNutrientSave(ruleid, nutrientid,score);
            }
        });
    };

    //兑换营养液
    function exchangeNutrientSave(ruleid, nutrientid,score){
        var action = "member/exchange/exchangeNutrientSave.do";
        app.POSTRequest_m(action, { //POSTRequest
            data: {
                ruleid:ruleid,
                nutrientid:nutrientid,
                score:score
            },
            loading:"提交中...",
            success: function(data) {
                if(data.resultCode === "1") {
                    app.tipInfo('营养液兑换成功～');
                } else if(data.resultCode === "-1") {
                    app.toLoginPage(location.href);
                } else {
                    app.tipInfo(data.resultMsg);
                }
            }
        });
    }
    //兑换积分
    app.doExchangeintegral = function(res){
        var dialog = new auiDialog({});
        dialog.alert({
            title:"",
            msg:'确定要兑换该积分？',
            buttons:['取消','确定']
        },function(ret){
            if(ret.buttonIndex == 2){
                exchangeSeedintegral(res);//兑换积分
            }
        });
    };
    //兑换积分
    function exchangeSeedintegral(res){
        var action = "member/exchange/updateAccountBalance.do";
        app.POSTRequest_m(action, { //POSTRequest
            data: {
                integral:res
            },
            loading:"提交中...",
            success: function(data) {
//              if(data.resultCode === "1") {
//                  app.tipInfo('积分兑换成功～');
//              } else if(data.resultCode === "-1") {
//                  app.toLoginPage(location.href);
//              } else {
//                  app.tipInfo(data.resultMsg);
//              }
                if(!data){
                    app.tipInfo("积分兑换接口异常");
                    return;
				}
				if(data.resultCode == "1"){
                    app.tipInfo('积分兑换成功～');
				} else {
                    app.tipInfo(data.resultMsg);
				}
            }
        });
    }
    
    return app;
});
