define([], function() {
    var rights = {};
    rights.dialog = new auiDialog({});

    Date.prototype.format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o){
            if (new RegExp("(" + k + ")").test(fmt)){
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));

            }
        }
        return fmt;
    }

    rights._alert = function(msg) {
        dialog.alert({
            title:"确认",
            msg:msg,
            buttons:['确定']
        });
    }
    // 查询用户权益日志
    rights.queryRightLog = function(callback){
        app.POSTRequest('/weixin/mall/memberrights/queryGORight.do' , {
            data : {
                loginedtoken:localStorage.loginedToken
            },
            success:function(data){
                if(data.resultCode=='1'){
                    var rightLog = data.resultObj;
                    if(rightLog){
                        if(callback){
                            callback(rightLog);
                        }
                    } else {
                        app.tipInfo("查询权益记录异常！");
                    }
                }else{
                    app.tipInfo(data.resultMsg);
                }
            }
        });
    };

    // 查询该会员该类型的所有的申请记录
    rights.queryMemberRightList = function(rightstype,callback){
        app.POSTRequest('/weixin/mall/memberrights/queryMemberRihtList.do' , {
            data : {
                loginedtoken:localStorage.loginedToken,
                rightstype:rightstype
            },
            success:function(data){
                console.log(data);
                if(data.resultCode=='1'){
                    if(callback){
                        callback(data.resultObj);
                    }
                }else{
                    app.tipInfo(data.resultMsg);
                }
            }
        });
    };

    // 微信扫二维码 更改状态
    rights.updateDimensional = function(rightstype,callback){
        app.POSTRequest('/weixin/mall/memberrights/updateDimensional.do' , {
            data : {
                loginedtoken:localStorage.loginedToken,
                rightstype:rightstype
            },
            success:function(data){
                console.log(data);
                if(callback){
                    callback(data);
                }
            }
        });
    };

    rights.dateFormat = function (time) {
        time = time.replace(/-/g,"/");
        var date = new Date(time);
        var res = date.format("yyyy年MM月dd日")
        return res;
    };

    return rights;
});
