/**
 * Created by wuxuanhua on 17/5/8.
 */
define(["base/baseApp", "refresher", "./base/basePage"], function(app, refresher, page) {

    //获取页面模版
    var myNutrition = app.getTempBySelector("#myNutritionTemplate"); //营养液模版
    var nutritionLi = app.getTempBySelector("#nutritionLiTemplate"); //列表模版

    app.init = function() {
        initRefresh();
        getNutritionList();
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
            getNutritionList();
        }, function(me) {
            if(page.hasNextPage) {
                getNutritionList();
            } else {
                me.noData();
                me.resetload();
            }
        });
    }

    app.moreList = function(code, classStr){
        app.href('myNutritionList.html?code='+code+'&classStr='+classStr);
    };

    function drawList(dataList){
        if(page.pageIndex == 1) {
            $("#list").empty();
            if(dataList.length==0){
            		app.emptyList("#list","没有相关数据")
            		return;
            }
        }

        var nutritionItem = '';
        dataList.forEach(function(item, i){
            console.log(i);
            console.log(item);
            var nutritionLogs = '';
            var nutrientlogs = item.nutrientlogs || [];
            nutrientlogs.forEach(function(obj, j){
                if(j < 4){
                    obj.tag = (obj.type == 2)? '-':'+';
                    obj.class = (i%2 == 0)? 'color-007447':'color-f38c03';
                    nutritionLogs += nutritionLi(obj);
                }
            });

            nutritionItem += myNutrition({
                id:item.id,
                nutrientcode:item.nutrientcode,
                nutrientname:item.nutrientname,
                nutrientpic:item.nutrientpic,
                quantity:item.quantity,
                liHtml:nutritionLogs,
                class: (i%2 == 0)? 'color-007447':'color-f38c03',
                index:i
            });
        });

        $("#list").append(nutritionItem);
    }

    /**
     * 获取我的营养液列表信息
     */
    function getNutritionList(){
        var action = "weixin/mall/menutrient/meNutrientList.do";
        app.POSTRequest(action, {
            data: {
                beginPage: page.pageIndex,
                pageSize: page.pageSize,
                ishasLog: 1 //1 是, -1 否
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

    return app;
});
