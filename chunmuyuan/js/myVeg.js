define(["base/baseApp", "../lib/exif-js/exif", "clipImg"], function(app) {

    var id = app.UrlParams.id;
    var body_width = $('body').width();
    var body_height = $('body').height();

    var tyFile = "";

    app.init = function () {
        effect();
        loadData();
    };
    
    function loadData() {
        app.POSTRequest("weixin/mall/memberinteractive/lookRow.do",{
            data:{
                memberinteractiveId:id
            },
            success: function(data) {
                console.log(data);
                if(data && data.resultCode == "1"){
                    renderTree(data.resultObj);
                    renderZS(data.resultObj);
                } else {
                    app.tipInfo(data.resultMsg);
                }
            }
        });
    }
    
    function updatePic() {
        app.POSTRequest("weixin/mall/memberinteractive/updateSeedNumber.do",{
            data:{
                memberinteractiveId:id,
                photopic:tyFile
            },
            success: function(data) {

            }
        });
    }
    
    function renderTree(data) {
        var temp = app.getTempBySelector("#treeNodeTemplate");
        var $tree = $(".tree");
        $tree.find(".node").remove();
        for(var i=1 ;i<7; i++){
            var node = {};
            var nodeStr = data["pic" + i];
            if(nodeStr){
                var nodeData = $.parseJSON(nodeStr);
                node.index = i;
                node.name = nodeData["picName"];
                node.time = nodeData["picDate"];
                node.pic = app.getImgPath(nodeData["picUrl"]);
                $tree.append(temp(node));
            }
        }
    }

    function renderZS(data){
        $("#userseedname").text(data.userseedname);
        var seedtime = data.seedtime;
        if(seedtime.indexOf(" ") > -1){
            seedtime = seedtime.substring(0,seedtime.indexOf(" "));
        }
        console.log(seedtime);
        seedtime = new Date(seedtime.replace(/-/g, '/'));
        var year = seedtime.getFullYear();//获得年份
        var month = seedtime.getMonth() + 1;//此方法获得的月份是从0---11，所以要加1才是当前月份
        month = month < 10?"0"+month:month;
        var day = seedtime.getDate();//获得当前日期

        $("#year").text(year);
        $("#month").text(month);
        $("#day").text(day);

        if(data.photopic){
            var dataURL = app.getImgPath(data.photopic).replace("/image/","")
            $('#hz_img').css("line-height","0px")
            $('#hz_img').html($("<img />").attr('src', dataURL).css({width:"100%",height:"100%"}));
        } else {
            $("#hz_img").on("click",function () {
                $("#file").click();
            });
        }
    }
    
    function imgLayer(src) {
        //var heights = document.body.clientHeight;//可视区域高度
        var heights =window.screen.availHeight;
        //var tops = $(document).scrollTop(); //滚动条到顶部的垂直高度
        $(".carrousel").css({height:heights}).show().find("img").attr("src", src);
        $(".carrousel").on("touchmove",function(e){
            app.stopBubble(e);
            e.preventDefault();
        });
    }

    //页面点击效果
    function effect(){
        $("#clipbox .clip").photoClip({
            width: body_width * 0.8125,
            height: body_width * 0.8125,
            file: "#file",
            ok: "#clipBtn",
            loadStart: function() {
                app.loading("图片加载中...");
            },
            loadComplete: function() {
                app.hideLoading();
                $("#clipbox").show();
            },
            loadError:function(){
                app.hideLoading();
            },
            clipFinish: function(dataURL) {//当图片剪切完成
                app.POSTRequest("weixin/mall/memberinteractive/uploadModifyAvatar.do",{
                    data:{
                        file:dataURL.split(",")[1],
                        biz:0//图片类型为用户头像
                    },
                    loading:"正在上传...",
                    success:function(data){
                        console.log(data);
                        if(data.resultCode==1){
                            tyFile = data.resultObj;
                            updatePic();
                            $('#hz_img').css("line-height","0px")
                            $('#hz_img').html($("<img />").attr('src', dataURL).css({width:"100%",height:"100%"}));
                        }else{
                            data.tipInfo(data.resultMsg);
                        }
                    }
                });
                $("#clipbox").hide();
            }
        });
        $("#clipCancel").on("click",function () {
            $("#clipbox").hide();
        });
        $(".tree").on("click",".like",function() {
            var src = $(this).children().attr('src');
            imgLayer(src)
        });
        $('.carrousel').click(function(){
            $(".carrousel").hide();
            $(".carrousel").find("img").attr("src", "");
        });
    }

    return app;
});