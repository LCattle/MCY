define(["base/baseApp","base/net","base/wxconfig","../lib/zepto/fastclick"],
    function(app,net,wxconfig,FastClick) {
        app  = jQuery.extend(app, net);
        $(function() {
            FastClick.attach(document.body);
        });
        app.start= function(){};
        var wx = wxconfig.getWxObj();
        wxconfig.getJS_SDK();
        try{
            window.addEventListener("popstate", function(e) {
                alert("监听到回退事件")
                myvideo.pause(); //根据自己的需求实现自己的功能
                myvideo.src="";
            }, false);
        } catch(e) {

        }
        var myvideo=$("#myvideo")[0];
        myvideo.addEventListener('pause',function(){
            $(".Img_bg").removeClass('active');
            $(this).css({"width" : "100%", "height" : "1px", "z-index" : 0, "display":"none"});
            this.src="";

        });
        myvideo.addEventListener('playing',function(){
            $(".Img_bg").removeClass('active');
            $(this).css({"width" : "100%", "height" : "auto", "z-index" : "5", "display":"block"});
            //$(".Img_bg").removeClass('active');
        });
        myvideo.addEventListener('canplaythrough',function(){
            $(".Img_bg").removeClass('active');
            $(this).css({"width" : "100%", "height" : "auto", "z-index" : "5", "display":"block"});

            var cellerid = $(".liveImg img.curr").attr("data-cellerid");
            app.GETRequest('region/directseedingAddClick.do',{
                data:{"cellerid":cellerid},
                success:function(data) {
                    if(data && data.resultObj && data.resultCode == "1"){
                        $(".liveImg img.curr").closest(".liveImg").find(".clickcount").text(data.resultObj.clickcount);
                        $(".liveImg img.curr").removeClass("curr");
                    }
                }
            });
        });

        //请求数据
        var dataArray=[];
        app.GETRequest('region/directseedingDirect.do',{success:function(data) {
            var resultObj = data.resultObj;
            var list = resultObj.direclist;
            for (var i = 0; i < list.length; i++) {
                dataArray.push(list[i].videoplayurl);//把视频地址保存到一个数组
                var temp = app.getTempBySelector("#liveTemplate");
                $("#app").append(temp(list[i]));
            }
            $("#app").append($("<div style='height:0.5%'></div>"));
            var $imgPic = $('.pic');
            $.each($imgPic, function (index) {
                $imgPic.eq(index).attr('data-index', index); //赋值索引data-index
                $(".Img_bg").eq(index).attr('data-index', index);
            });
            $imgPic.on('click', function () {
                var $currimg = $(this);
                var $currimg_bg= $currimg.parent('.liveImg').find('.Img_bg');
                console.log($currimg_bg[0]);
                $(".Img_bg").removeClass('active');
                $currimg_bg.addClass('active');
                $imgPic.removeClass("curr");
                $currimg.addClass("curr");
                var dataIndex = this.getAttribute("data-index");
                myvideo.src = dataArray[dataIndex];//切换地址播放
                myvideo.load();//更改视频来源，并重载视频
                myvideo.play();//播放视频
            })
        }
        });

        app.refreshCount = function(){
            var cellerids = [];
            $(".liveImg img.pic").each(function (index,element){
                var cellerid = $(element).attr("data-cellerid");
                if(cellerid && cellerid != "0"){
                    cellerids.push(cellerid);
                }
            });
            var celleridsStr = cellerids.join();
            app.GETRequest('region/directseedingQueryClick.do',{
                data:{"cellerids":celleridsStr},
                success:function(data) {
                    if(data && data.resultObj && data.resultCode == "1"){

                        $(".liveImg img.pic").each(function (index,element){
                            var cellerid = $(element).attr("data-cellerid");
                            for(var i=0;i<data.resultObj.length;i++){
                                if(data.resultObj[i].cellerid == cellerid){
                                    $(element).closest(".liveImg").find(".clickcount").text(data.resultObj[i].clickcount);
                                }
                            }
                        });
                    }
                }
            });
        }

        //setInterval("app.refreshCount()",5000);
        return app;
    });
