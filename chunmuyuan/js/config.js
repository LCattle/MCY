(function () {
    function urlArgs(url) {
        var versoin = {
            all:5,
            pay:6
        };
        var configs = [
            {"selectpay.js":"pay"},
            {"memberRecharge.js":"pay"}
        ];
        var v = versoin["all"];
        for(var conf in configs){
            var key = Object.keys(configs[conf])[0];
            if(url.indexOf(key) > -1){
                v = versoin[configs[conf][key]];
                v = v?v:versoin["all"];
                break;
            }
        }
        return "v="+v;

    }
    return urlArgs;
})();