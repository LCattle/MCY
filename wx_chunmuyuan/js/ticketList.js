define(["base/baseApp"], function(app) {

    app.init = function () {
        loadList();
    };
    
    function loadList() {
        app.POSTRequest("weixin/mall/sku/skuLists.do",{
            data:{
                productType:5,
                hide:1,
                beginPage:1,
                pageSize:20000
            },
            loading:"加载中。。。",
            success: function(result) {
                console.log(result);
                if(!result){
                    app.tipInfo("接口异常");
                }
                if(result.resultCode == '1'){
                    renderList(result.basePageObj.dataList);
                } else {
                    app.tipInfo(result.resultMsg);
                }
            }
        });
    }
    
    function renderList(data) {
        var temp = app.getTempBySelector("#ticketItem");
        var $ticketList = $("#ticketList");
        $ticketList.empty();
        $.each(data,function (index,it) {
            $ticketList.append(temp(it));
        });
    }

    return app;
});
