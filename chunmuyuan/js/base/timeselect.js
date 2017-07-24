define(["picker"], function(Picker){

    var timeselect = {};

    /**
     * 创建timePicker
     * @returns {{}}
     */
    timeselect.create = function () {
        var timePicker = {};

        //根据选择的生日初始化日期选择控件
        timePicker.initPickerByDay = function(birthday) {
            var timeAry = birthday.split("-");
            var yearIndex = parseInt(timeAry[0]) - yearStart;
            var monthIndex = parseInt(timeAry[1]) - 1;
            var dayIndex = parseInt(timeAry[2]) - 1;
            var selectedIndex = [yearIndex, monthIndex, dayIndex];
            timePicker.initPicker(selectedIndex);
        }

        var yearStart = 1900;

        //生日选择数据
        var timeData = (function() {
            //起始年

            var yeayEnd = new Date().getFullYear();
            var data = [
                [],
                [],
                []
            ];
            for(var i = yearStart; i <= yeayEnd; i++) {
                data[0].push({
                    text: i,
                    value: i
                });
            }
            for(var i = 1; i <= 12; i++) {
                data[1].push({
                    text: get2NumStr(i),
                    value: get2NumStr(i)
                });
            }
            for(var i = 1; i <= 31; i++) {
                data[2].push({
                    text: get2NumStr(i),
                    value: get2NumStr(i)
                });
            }
            return data;
        })();

        /**
         * 将数字转成两位字符串
         */
        function get2NumStr(i) {
            if(i < 10) {
                return "0" + i;
            }
            return i;
        }

        //改变日期
        function changeDays(year, momth) {
            var data = [];
            var days = 30;
            //大月
            if(momth == 1 || momth == 3 ||
                momth == 5 || momth == 7 ||
                momth == 8 || momth == 10 ||
                momth == 12
            ) {
                days = 31;
            }
            //二月
            if(momth == 2) {
                days = 28;
                //润年days = 29
                if((year % 4 == 0) && (year % 100 != 0 || year % 400 == 0)) {
                    days = 29;
                }
            }
            //计算日期
            for(var i = 1; i <= days; i++) {
                data.push({
                    text: get2NumStr(i),
                    value: get2NumStr(i)
                });
            }
            //根系第三列
            timePicker.picker.refillColumn(2, data);
        }

        /**
         * 初始化日期选择控件
         */
        timePicker.initPicker =  function(title,select,selectedIndex) {
            var picker = new Picker({
                data: timeData,
                selectedIndex: selectedIndex ? selectedIndex : [80, 0, 0],
                title: title
            });
            //当选择变化时
            picker.on('picker.change',
                function(index, selectedIndex) {
                    var year = timeData[0][picker.selectedIndex[0]].value;
                    var momth = timeData[1][picker.selectedIndex[1]].value;
                    changeDays(year, momth);
                });
            picker.on('picker.select', function(selectedVal, selectedIndex) {
                var year = timeData[0][picker.selectedIndex[0]].value;
                var momth = timeData[1][picker.selectedIndex[1]].value;
                var day = timeData[2][picker.selectedIndex[2]].value;
                var daytime = year + "-" + momth + "-" + day;
                if(select && typeof  select === "function"){
                    select(daytime);
                }
            });
            timePicker.picker = picker;
        }

        return timePicker;
    };



    return timeselect;
});