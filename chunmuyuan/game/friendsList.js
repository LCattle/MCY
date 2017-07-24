/**
 * Created by wuxuanhua on 17/5/9.
 */

define(["base/baseApp", "refresher", "./base/basePage"], function(app, refresher, page) {

    //获取页面模版
    var friendsLi = app.getTempBySelector("#friendsLiTemplate");

    app.init = function () {
        initRefresh();
         rankingList();
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
            rankingList();
        }, function(me) {
            if(page.hasNextPage) {
                rankingList();
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
            		app.emptyList("#list","暂无好友排行");
            		return;
            }
        }

        var rankingList = '';
        dataList.forEach(function(item, index){
            if(index >= 3){
                item.number = '<i class="color-999999">'+(index+1)+'</i>';
            }else{
                item.number = '<img src="../imgs/game/f-'+(index+1)+'.png" />';
            }
            item.name = item.nickname ? item.nickname : "春沐源会员";
			item.name = item.remark?item.remark:item.name;
			item.avatar =  app.getImgPath(item.avatar).replace("/image/","");
            rankingList += friendsLi(item);
        });

        $("#list").append(rankingList);
    }

    /**
     * 获取好友排行榜
     */
    function rankingList(){
        var action = "weixin/mall/bottle/ranking.do";
        app.POSTRequest(action, {
            data: {
                beginPage: page.pageIndex,
                pageSize: page.pageSize
            },
            loading:"请求中...",
            success: function(data) {
                app.pageRefresher.resetload();
                if(data.resultCode === "1") {
                    page.hasNextPage = data.basePageObj.hasNextPage;
                    var dataList = data.basePageObj.dataList || data.dataList || [];
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

    return app;
});