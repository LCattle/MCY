/**
 * Created by wuxuanhua on 17/5/8.
 */
define(["base/baseApp", "refresher", "./base/basePage"], function(app, refresher, page) {
    var code = app.UrlParams.code;
    var classStr = app.UrlParams.classStr;
    var nutritionLi = app.getTempBySelector("#nutritionLiTemplate"); //营养液logs

    app.init = function() {
        initRefresh();
        getNutritionDetail();
    };

    //初始化页面
    app.initPage = function() {
        $("#name").addClass(classStr);
        $("#quantity").addClass(classStr);
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
            getNutritionDetail();
        }, function(me) {
            if(page.hasNextPage) {
                getNutritionDetail();
            } else {
                me.noData();
                me.resetload();
            }
        });
    }

    function drawList(dataList){
        if(page.pageIndex == 1) {
            $("#list").empty();
            if(dataList.length==0){
            		app.emptyList("#list","没有相关数据")
            		return;
            }
        }

        var liHtml = '';
        dataList.forEach(function(item){
            item.tag = (item.type == 2)? '-':'+';
            item.class = classStr;
            liHtml += nutritionLi(item);
        });

        $("#list").append(liHtml);
    }

    //获取我的营养液列表信息
    function getNutritionDetail() {
        app.POSTRequest("weixin/mall/menutrient/meNutrientDetail.do", {
            data: {
                nutrientId: code,
                beginPage: page.pageIndex,
                pageSize: page.pageSize
            },
            success: function(data) {
                app.pageRefresher.resetload();
                if(data.resultCode === "1") {
                    //page.hasNextPage = data.basePageObj.hasNextPage;

                    var resultObj = data.resultObj || {};
                    page.hasNextPage = resultObj.nutrientLogs.hasNextPage;
                    $("#name").html(resultObj.nutrient.nutrientname);
                    $("#quantity").html(resultObj.nutrient.quantity+'ml');
                    var dataList = resultObj.nutrientLogs.dataList || [];
                    page.addData(dataList); //往page添加数据

                    drawList(dataList);

                    page.pageIndex++;
                } else if(data.resultCode === "-1") {
                    app.toLoginPage(location.href);
                } else {
                    app.tipInfo(data.resultMsg);
                }
            },
            error: function() {
                app.pageRefresher.resetload();
            }
        });

    }

    return app;
});
