/**
 * Created by wuxuanhua on 17/5/11.
 */

define(["base/baseApp", "refresher", "./base/basePage"], function(app, refresher, page) {

    //获取页面模版
    var goodsLi = app.getTempBySelector("#goodsLiTemplate"); //商品列表
    var keyWord = app.UrlParams.keyWords; //搜索关键字
	keyWord = decodeURIComponent(keyWord);
	if(keyWord.length>0){
		app.changeDOCTitle(keyWord);
	}
    app.init = function() {
        initRefresh();
        searchResultList(keyWord);
    };

    //初始化页面
    app.initPage = function() {
        var h = $(window).height();
        $("#list").css("min-height", h + "px");
        $("#wrapper").css("height", h + "px");
        $("#wrapper").css("overflow", "scroll");
    };

    //初始化下拉刷新
    function initRefresh() {
        app.pageRefresher = refresher.initDropload("#wrapper", function(me) {
            page.reset();
            me.noData(false);
            searchResultList(keyWord);
        }, function(me) {
            if(page.hasNextPage) {
                searchResultList(keyWord);
            } else {
                me.noData(true);
                me.resetload();
            }
        });
    }

    function drawList(dataList){
        if(page.pageIndex == 1) {
            $("#list").empty();
            if(dataList.length==0){
            		app.emptyList("#list","没有符合要求的结果")
            		return;
            }
        }

        var searchList = '';
        dataList.forEach(function(item, i){
            item.pic = app.getImgPath(item.pic);
            searchList += goodsLi(item);
        });

        $("#list").append(searchList);
        $("#list img").css('max-height',$("#list img").width()+'px');
    }

    /**
     * 获取搜索结果
     */
    function searchResultList(keyWords){
        var action = "weixin/mall/ProducSearch/skeyWords.do";
        app.POSTRequest(action, {
            data: {
                beginPage: page.pageIndex,
                pageSize: page.pageSize,
                keyWords: keyWords
            },
            loading:"请求中...",
            success: function(data) {
                app.pageRefresher.resetload();
                if(data.resultCode === "1") {
                    page.hasNextPage = data.basePageObj.hasNextPage;
                    var dataList = data.resultObj || [];
                    page.addData(dataList); //往page添加数据

                    drawList(dataList);
                    page.pageIndex++;
                } else if(data.resultCode === "-1") {
                    app.toLoginPage(location.href);
                } else {
                    app.tipInfo(data.resultMsg);
                }
            }
        });
    };

    //跳转商品详情叶
    app.toGoodsDetails = function(id,type){
    		if(type==1||type==2){
    			app.href('goodsDetails.html?pid=s'+id);
    		}else{
    			app.href('goodsDetails.html?pid=p'+id);
    		}
        
    };

    return app;
});