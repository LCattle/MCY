//订单详情
define(["base/baseApp", "./base/order"], function(app, Order) {

    app.initPage = function() {};
    //开始执行
    app.init = function() {
        if(app.checkLogin()) {
            loadOrder();
        } else {
            app.toLoginPage(location.href);
        }
    };

    //显示价格
    function showPrice(price) {
        $("#price").html(app.getPriceStr(price));
        $("#priceLable").text("商品金额");
    }
    app.order = null;
    //加载订单
    function loadOrder() {
        Order.getOrder(app.UrlParams.oid, function(order) {
            console.log(order);
            if(order.deliverymode == 30){
                $('.Name').hide();
                $('#addressPhone').hide();
            }
            if(order.reducePound != 0){
                $("#derate").show();
                $("#actual").show();
                $("#freeprice").text(order.reducePound/1000 + 'kg');
                $("#actualprice").text(((order.virtualfee - order.reducePound)/1000).toFixed(2) + 'kg');
            }
            app.order = order;
            showStatus(order);
            showPayType(order);
            $("#orderno").text(order.orderno);
            $("#logisticsprice").html("+ " + app.getPriceStr(0));
            app.orderType = order.type;
            if((order.type == 1 || order.type == 2 || order.type == 3 || order.type == 10)&&(order.message != "")){
                $(".jordan").show();
                $(".kobe").text("备注: " + order.message);
            }
            var deposit = order.deposit;
            if(deposit && deposit > 0) {
                $("#depositbox").show();
                $("#depositbox .app-text-orange").html("- " + app.getPriceStr(deposit));
            }
            var couponfee = order.couponfee;
            if(couponfee && couponfee > 0) {
                $("#couponBox").show();
                $("#coupon").html("- " + app.getPriceStr(couponfee));
            }
            if(order.type == 5) {
                showProduct3(order);
                showPrice(order.sprices);
                $("#totalbox").show();
                $("#totalbox .app-text-orange").html(app.getPriceStr(order.actualpaied));
            }

            if(order.type == app.ORDER_TYPE_ELECTRONIC_CARD ||
                order.type == app.ORDER_TYPE_ENTITY_CARD ||
                order.type == app.ORDER_TYPE_OFFLINE_CARD) {
                showProduct3(order);
                showPrice(order.sprices);
                if(order.type == app.ORDER_TYPE_ELECTRONIC_CARD) {
                    loadUser(order)
                } else {
                    showAddress(order);
                }

                $("#totalbox").show();
                $("#totalbox .app-text-orange").html(app.getPriceStr(order.actualpaied));
            }
        });
    }

    //显示地址
    function showAddress(order) {
        try {
            $("#address").show(); //显示地址
            var oaddModel = order.oaddModel;
            $("#addressName").text(oaddModel.consignee);

            var str = oaddModel.fulladdress;
            str = str.replace(/:/g,"").replace(/：/g,"");

            var index1 = str.indexOf("联系人");
            if(index1 != -1){
                var str1 = str.substring(0,index1).trim();
                var str2 = str.substring(index1 + 3).trim();

                index1 = str2.indexOf("-");
                var str3 = str2.substring(0,index1 - 3).trim();
                var str4 = str2.substring(index1 - 3).trim().replace(/-/g,"");

                var varhtml = str3 + " " +str4 + "<br />";
                varhtml += str1;


                $("#addressFull").html(varhtml);


                $("#addressPhone").text(oaddModel.mobile);
            }else{
                $("#addressFull").html(str);


                $("#addressPhone").text(oaddModel.mobile);
            }

        } catch(e) {
            $("#address").hide();
        }

    }
    //显示支付方式
    function showPayType(order) {
        $("#payType").text(Order.getPayWay(order.payway));
    }
    //显示订单状态
    function showStatus(order) {
        var status = Order.getStatus(order);
        $("#orderStatus").text(status.text);
        var iconMap = {
            1: "icon-zhifu",
            2: "icon-daifahuo2",
            3: "icon-daifahuo1",
            6: "icon-jiaoyiguanbi",
            5: "icon-qianshou101",
            4: "icon-qianshou101"
        }
        $("#orderStatusIcon").addClass(iconMap[status.status]);
    }
    //显示商品-卡
    function showProduct3(order) {
        var data = order.items;
        var temp = app.getTempBySelector("#gdsTemp3");
        $.each(data, function(i, item) {
            console.log(item);
            if(item) {
                if(i > 4) {
                    item.hide = true;
                }
                $("#goodsList").append(temp(item));
            }
        });
        if(data.length > 5) {
            $("#goodsList").append(app.getTempBySelector("#showMoreTemp")({}));
        }
    }
    //加载用户信息
    function loadUser(order) {
        app.getUser(function(user) {
            if(order.type == app.ORDER_TYPE_ELECTRONIC_CARD) {
                $("#addressdzk").show();
                $("#userMobile").text(user.mobile);
            }
            if(order.type==8){
                $("#addressggq").show();
                $("#ggqUserMobile").text(user.mobile);
            }
        });
    };

    app.toOrder = function() {
        location.href = "../html/orderDetails.html?oid=" + app.UrlParams.oid;
    };
    return app;
});
