define(["base/baseApp", "./base/wxconfig"],function(app, wxconfig) {

    app.initPage = function () {};

    app.init = function () {
        if(localStorage.wxMemberOpenid && localStorage.wxMemberOpenid.length > 20) {
            if(window.parent.app.wxAuthCallBack){
                window.parent.app.wxAuthCallBack(localStorage.wxMemberOpenid);
            }
            return;
        }
        if(app.UrlParams.code) {
            getOpenId();
            return;
        }
        wxAuthorization();

    };
    
    function getOpenId() {
        //用code 向服务器请求openid
        app.POSTRequest_i("infrastructure/wx/mp/getOpenid.do", {
            data: {
                wx_code: app.UrlParams.code,
                loginedtoken: localStorage.loginedToken
            },
            success: function(data) {
                if(data.resultCode == 1) {
                    localStorage.wxMemberOpenid = data.resultObj.openid;
                    console.log(localStorage.wxMemberOpenid );
                    if(window.parent.app.wxAuthCallBack){
                        window.parent.app.wxAuthCallBack(data.resultObj.openid);
                    }
                }
            }
        });
    }

    //获取js-sdk授权签名
    function getJS_SDK() {
        app.POSTRequest_i("infrastructure/wx/mp/getJSSDKConfig.do", {
            data: {
                url: encodeURIComponent(location.href)
            },
            success: function(data) {
                if(data.resultCode == 1){
                    wxconfig.JsSDKConfig(data.resultObj);
                    console.log(data.resultObj);
                    wxconfig.wxauthorization(location.href);
                }
            }
        });
    }

    //微信授权
    function wxAuthorization() {
        getJS_SDK();
    }

    return app;
});