define([], function() {
    var recharge = {};

    /**
     * "wxsc"微信
     * "pos" pos机
     * "app" app应用
     * "pc"  pc机
     *
     * @type {{currPlatform: string}}
     * @private
     */
    var _config = {
        currPlatform:"wxsc"
    }

    /**
     * 查询充值优惠列表
     * @param success
     * @param err
     */
    recharge.queryRechargeActivityList = function (success,err) {
        app.POSTRequest("weixin/mall/recharge/queryRechargeActivityList.do", {
            async:false,
            success: function(data) {
                console.log(data);
                if(data.resultCode == '1'){
                    if(success && typeof success === "function"){
                        success(data.resultObj);
                    }
                } else {
                    app.tipInfo(data.resultMsg);
                }
            },
            error:function(error, status) {
                if(err && typeof err === "function"){
                    err(error, status);
                }
            }
        });
    };

    /**
     * 获取用户优惠数据
     * @param success
     * @param err
     */
    recharge.processRechargeActivityList = function (success,err) {
        recharge.queryRechargeActivityList(function (data) {
            var arr = data.list;
            var level = data.level;
            var targetList = [];
            $.each(arr, function(i,item) {
                var platform = JSON.parse(item.platform);
                var membertype = JSON.parse(item.membertype);
                var levelChar = recharge.userLevel(level);
                if(platform[_config.currPlatform] == 1 && membertype[levelChar] == 1){
                    targetList.push(item);
                }
            });
            success(targetList);
        },err)
    }

    /**
     * 获取某个金钱的优惠金额
     * @param money
     * @returns {number}
     */
    recharge.getGiveAmount = function (money) {
        var giveamount = 0;
        recharge.processRechargeActivityList(function (list) {
            $.each(list,function (index,item) {
                if(money == item.rechargepamount){
                    giveamount = item.addamount;
                    return false;
                }
            });
        });
        return giveamount;
    }

    //自定义充值卡匹配兑换斤数
    recharge.countPounds= function(money,success,err){
        app.POSTRequest("/weixin/mall/order/countPounds.do", {
            async: false,
            data: {
                money:money
            },
            success: function(data) {
                console.log(data);
                if(data.resultCode == '1'){
                    if(success && typeof success === "function"){
                        success(data.resultObj);
                    }
                } else {
                    app.tipInfo(data.resultMsg);
                }
            },
            error:function(error, status) {
                if(err && typeof err === "function"){
                    err(error, status);
                }
            }
        });
    }

    /**
     * 用户等级转换字符串
     * @param index
     * @returns {string}
     */
    recharge.userLevel = function(index){
        var str ="";
        switch (index)
        {
            case 1:
                str="p";
                break;
            case 2:
                str="t";
                break;
            case 3:
                str="y";
                break;
            case 4:
                str="j";
                break;
            case 5:
                str="b";
                break;
            case 6:
                str="z";
                break;
        }
        return str;
    };

    /**
     *  获取充值活动赠送
     * @returns {{}}
     */
    recharge.showBuygifts = function(activityCall){
        var activityMap = {};
        recharge.queryRechargeActivityList(function (data) {
            console.log(data);
            var arr = data.list;
            var level = data.level;
            $.each(arr, function(i,item) {
                var platform = JSON.parse(item.platform);
                var membertype = JSON.parse(item.membertype);
                var levelChar = recharge.userLevel(level);
                if(platform[_config.currPlatform] == 1 && membertype[levelChar] == 1){
                    if(activityCall && typeof  activityCall === "function"){
                        activityCall(item.rechargepamount,item.addamount);
                    }
                }
            });
        });
        return activityMap;
    }

    return recharge;
});