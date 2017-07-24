define([], function() {
    var levelMap = {
      1:"LEVELONE",
      2:"LEVELTWO",
      3:"LEVELTHREE",
      4:"LEVELFOUR",
      5:"LEVELFIVE",
      6:"LEVELSIX"
    };
    
    var levelOpen = {
      1:"普通会员价:",
      2:"铜卡会员价:",
      3:"银卡会员价:",
      4:"金卡会员价:",
      5:"白金卡会员价:",
      6:"钻石卡会员价:"
    };
    var discount = {};

    discount.minDiscount = function() {
        var min = 1;
        app.getSysParam("MEMBERLEVELDISCOUNT",function(data){
            var arr = [];
            $.each(data,function(i,item){
                arr.push(item.paramvalue);
            })
            min = Math.min.apply(null, arr);
        },'biz');
        return min;
    };

    discount.discountMap = function() {
        var map = {};
        app.getSysParam("MEMBERLEVELDISCOUNT",function(data){
            $.each(data,function(i,item){
                map[item.innercode] = item.paramvalue;
            })
        },'biz');
        return map;
    };
     
    discount.currDiscount = function() {
        if(app.checkLogin()){
            var res = null;
            app.getUser(function (data) {
                res = discount.discountMap()[levelMap[data.level]];
                app.vipLeave = levelOpen[data.level];
                app.level = data.level
            });
            return res;
        } else {
            return discount.minDiscount();
        }

    };

    return discount;
});