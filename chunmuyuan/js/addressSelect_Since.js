//地址选择
define(["base/baseApp", 'animate', "dialog"], function(app, animate, dialog) {
    app.initPage = function() {
        var h = $(window).height() - $("footer").height();
        $("#list").height(h);
    };
    var addressList = [];
    app.selected = function(id) {
        $.each(addressList, function(i, item) {
            if(item.id == id) {
                if(item.isDefault != 1) {
                    app.setLocalObjet("selectztAddress",item);
                    var backUrl = localStorage.selectztAdressBackUrl;
                    if(backUrl){
                        app.replace(backUrl);
                    }else{
                        app.replace("confirmOrder.html");
                    }
                }
            }
        });
    }

    //跳转到编辑页面
    app.editAddress = function(id, e) {
        app.stopBubble(e);
        localStorage.addressBackUrl = location.href;
        location.href = "addressEdit.html?addressId=" + id;
    };
    //开始执行
    app.init = function() {
        var selectAddress = app.getLocalObject("selectztAddress");
        if(selectAddress){
            app.selectedId = selectAddress.id;
        }
        loadAddress();
    };
    app.clickDel = function(id) {
        var dialog = new auiDialog();
        dialog.alert({
            title: "提示",
            msg: '是否删除该地址？',
            buttons: ['取消', '确定']
        }, function(ret) {
            if(ret.buttonIndex == 2) {
                delAddress(id);
            }
        })
    };

    function delAddress(id) {
        app.POSTRequest_m("member/address/addressDelete.do", {
            data: {
                useraddressId: id
            },
            loading: "处理中...",
            success: function(data) {
                if(data.resultCode == 1) {
                    $("#address_" + id).animateCss("fadeOut", function() {
                        $("#address_" + id).remove();
                    });
                } else {
                    app.tipInfo(data.resultMsg);
                }
            }
        });
    }
    /**
     *加载地址信息
     */
    function loadAddress() {
        app.POSTRequest_m("member/address/addressLists.do?addType=1", {
            data: {},
            loading: "数据加载中...",
            success: function(data) {
            	console.log(data.resultObj);
                if(data.resultCode == 1) {
                    showAddreses(data.resultObj);
                } else {
                    app.tipInfo(data.resultMsg);
                }
            }
        });
    }
    //显示自提地址信息
    function showAddreses(data) {
        var temp = app.getTempBySelector("#address_SinceTemplate");
        addressList = data;
        $.each(data, function(i, item) {
            //算错选中的id  app.selectedId=1
            if(app.selectedId==item.id){ //值为1
                item.selected = true;
            }else if(!app.selectedId&&item.isdefault){
                item.selected = true;
            }
            var str = item.fulladdress;
            str = str.replace(/:/g,"").replace(/：/g,"");

            var index1 = str.indexOf("联系人");
            var str1 = str.substring(0,index1).trim();
            var str2 = str.substring(index1 + 3).trim();

            index1 = str2.indexOf("-");
            var str3 = str2.substring(0,index1 - 3).trim();
            var str4 = str2.substring(index1 - 3).trim().replace(/-/g,"");
		    item.addressPart1 = str1;
		    item.addressPart2 = "联系人:" +　str3;
		    item.addressPart3 = str4;
            $("#list").append(temp(item))
        });
    }
    //重新登录超时方法
    app.loginTimeOut = function() {
        app.toLoginPage(location.href);
    }
    return app;
});