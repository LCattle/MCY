/**
 * Created by wuxuanhua on 17/5/10.
 */

define(["base/baseApp", "refresher", "./base/basePage"], function(app, refresher, page) {

    //获取页面模版 gardenDynamics
    var dynamicsHead = app.getTempBySelector("#dynamicsHeadTemplate"); //动态头部
    var dynamicsLi = app.getTempBySelector("#dynamicsLiTemplate"); //动态列表内容

    app.init = function () {
        initRefresh();
        kaleyardDynamicList();
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
            kaleyardDynamicList();
        }, function(me) {
            if(page.hasNextPage) {
                kaleyardDynamicList();
            } else {
                me.noData();
                me.resetload();
            }
        });
    }

    function drawList(dataObj){
        if(page.pageIndex == 1) {
            $("#list").empty();
        }
        console.log(dataObj);
        var dynamicList = '';
        var nowDay = app.formatDate(new Date(), 'day');
        for(var key in dataObj){
            var dataLabel = (nowDay == key)? '今天':key;
            var array = dataObj[key];

            var lists = '';
            array.forEach(function(item, i){
            		if(item.opertype==3){
            			item.number = "+"+item.unit+"ml";
            		}else if(item.opertype==1){
            			item.number = "+"+item.unit+"ml";
            		}else if(item.opertype==2){
            			item.number = "+"+item.unit+"颗";
            		}else if(item.opertype==6){
            			item.number = "+"+item.unit+"颗";
            		}else{
            			item.number ="";
            		}
                lists += dynamicsLi(item);
            });

            if($("#list").find('ul').hasClass(key+'')){
                $("."+key).append(lists);
            }else{
                dynamicList += dynamicsHead({
                    date: key,
                    dateLabel:dataLabel,
                    lists:lists,
                });
            }

        }

        $("#list").append(dynamicList);
    }

    var opertypeObj = {
        '1':'../imgs/game/dynamics/collect-nutrition@2x.png', //1.收取营养液 (暂时没图)
        '2':'../imgs/game/dynamics/plant-seeds@2x.png', //2.种植种子
        '3':'../imgs/game/dynamics/add-nutrition@2x.png', //3.用营养液浇灌种子 //vegetable-icon-l.png
        '4':'../imgs/game/dynamics/thermometer@2x.png', //4.某个瓶子调温
        '5':'../imgs/game/dynamics/hygrometer@2x.png', //5.某个瓶子调湿
        '6':'../imgs/game/dynamics/collect-vegetables@2x.png', //6.收取已成熟的菜
        '7':'../imgs/game/dynamics/insect-catching@2x.png' //7.捕虫成功
    };

    /**
     * 获取我的营养液列表信息
     */
    function kaleyardDynamicList(flag){
        var action = "weixin/mall/bottle/kaleyardDynamic.do";
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
                    var dataObj = {};
                    dataList.forEach(function(item, i){
                        item.day = app.formatDate(item.createtime, 'day');
                        item.time = app.formatDate(item.createtime, 'time');
                        //1.收取营养液 2.种植种子 3.用营养液浇灌种子 4.某个瓶子调温 5.某个瓶子调湿 6.收取已成熟的菜 7.捕虫成功
                        item.icon = opertypeObj[item.opertype+''] || '';
                        var obj = dataObj[item.day] || "";
                        if(!obj){
                            dataObj[item.day] = [item];
                        }else{
                            dataObj[item.day].push(item);
                        }
                    });

                    drawList(dataObj);

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