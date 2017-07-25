define(["base/baseApp","base/net","base/wxconfig","../lib/liveVideo/ScrollBox","../lib/zepto/fastclick"],
    function(app,net,wxconfig,ScrollBox,FastClick) {
        app  = jQuery.extend(app, net);
        $(function() {
            FastClick.attach(document.body);
        });
        app.start= function(){}
        var wx = wxconfig.getWxObj();
        wxconfig.getJS_SDK();
        var video=document.getElementById('myvideo');
        var $img = $('img');
        video.addEventListener('pause',function(){
            $(this).css({
                "width" : "100%",
                "height" : "1px",
                "z-index" : -1,
                "display":"none"
            });
            this.src='';
            //Hide()
        });
        video.addEventListener('play',function(){
            //Hide();
            $(this).css({
                "width" : "100%",
                "height" : "1px",
                "z-index" : "1",
                "display":"block"
            });
        });

        //视频的元数据已加载时
        video.addEventListener("canplaythrough", function(){
            this.play();
            $(this).css({
                "height" : "auto"
            });
        });
        app.getTempBySelector = function(Selector){
            var temp = $(Selector).text();
            return this.getTemp(temp);
        };
        app.getTemp = function(temp){
            var expList = temp.match(/<@{1}.{0,}?>{1}/ig);
            return function(it){
                var html = temp;
                for(var i = 0; i < expList.length; i++){
                    var exp = expList[i];
                    var evalExp = exp.replace(/^<@{1}/, "").replace(/>{1}$/, "").replace(/Eval/g, "_Eval");
                    try{
                        var result = eval(evalExp);
                        html = html.replace(exp, result);
                    } catch (e) {
                        console.error("[" + e.message + "]" + evalExp);
                    }
                }
                return html;
            }
        };
        //请求数据
        var dataArray=[];
        app.GETRequest('region/directseedingDirect.do',{
            success:function(data){
                //console.log(data);
                var resultObj = data.resultObj;
                var list = resultObj.direclist;
                //console.log(list);
                for(var i = 0; i < list.length; i++){
                    dataArray.push(list[i].videoplayurl);//把视频地址保存到一个数组
                    var temp = app.getTempBySelector("#liveTemplate");
                    $("#app").append(temp(list[i]));
                }
                console.log(dataArray);
                var $img = $('img');
                $.each($img, function(i){
                    $img.eq(i).attr('data-index', i); //赋值索引data-index
                });
                $img.on('click', function(){
                    var dataIndex=this.getAttribute("data-index");
                    var video=document.getElementById('myvideo');
                    video.src=dataArray[dataIndex];//切换地址播放
                    console.log(video.src);
                    //微信授权成功
                    wx.ready(function() {
                        //检查网络情况
                        wx.getNetworkType({
                            success: function(res) {
                                var networkType = res.networkType; // 返回网络类型2g，3g，4g，wifi
                                if(networkType!=="wifi"){
                                    //alert("温馨提示：非Wi-fi环境下，播放视频会消耗较多流量！")
                                    video.pause();//暂停播放
                                    $('.box,.bg').css("display","block");
                                    $("body").css("overflow","hidden");
                                    $('.box,.bg').bind("touchmove",function(e){
                                        e.preventDefault();
                                    });
                                    //继续播放
                                    $("#btn1").on("click", function(){
                                        $('.box,.bg').css("display","none");
                                        $("body").css("overflow","scroll")
                                        video.load();//更改视频来源，并重载视频
                                        video.play();//播放视频

                                    })

                                    //取消播放
                                    $("#btn2").on("click", function(){
                                        $('.box,.bg').css("display","none");
                                        $("body").css("overflow","scroll")
                                    })

                                }else{
                                    video.load();//更改视频来源，并重载视频
                                    video.play();//播放视频
                                }

                            }
                        });
                    });

                    //video.load();//更改视频来源，并重载视频
                    //video.play();//播放视频
                    var u = navigator.userAgent;
                    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
                    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
                    if(isAndroid){
                    }
                })

            }
        });

        return app;
    });


////图片比例根据父盒子调整
//var resetVideoSize = function(){
//    var $liveImg=$(".liveImg");
//    var liveImgWidth = $(window).width();
//    $liveImg.width(liveImgWidth);
//    var ratio = 1440/900;
//    var liveImgHeight = liveImgWidth/ratio;
//    $liveImg.height(liveImgHeight);
//};
//resetVideoSize();
//window.onresize= function(){
//    resetVideoSize();
//}
























