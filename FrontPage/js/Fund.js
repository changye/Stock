/**
 * Created by changye on 15-8-10.
 */
var fundQuote = undefined;

function formatQuote(queryInArray) {
    var keys = ['name', 'open_today', 'close_yesterday', 'quote',
        'highest', 'lowest', 'buy', 'sell', 'deal', 'amount',
        'buy_quantity1','buy_quote1','buy_quantity2','buy_quote2',
        'buy_quantity3','buy_quote3','buy_quantity4','buy_quote4',
        'buy_quantity5','buy_quote5','sell_quantity1','sell_quote1',
        'sell_quantity2','sell_quote2','sell_quantity3','sell_quote3',
        'sell_quantity4','sell_quote4','sell_quantity5','sell_quote5',
        'date','time'];

    var result = Object();
    for (var i in keys) {
        result[keys[i]] = queryInArray[i];
    }
    return result;
}

function refresh(ids) {
    var fundIds;
    if(Array.isArray(ids)) {
        fundIds = ids;
    }else {
        fundIds = [ids];
    }
    var queryid = fundIds.join(',');
    var url = 'http://hq.sinajs.cn/list=' + queryid;
    //console.log('url is: ' + url );

    // Remove script if exists.
    var lastScript = document.getElementById('refreshScript');
    if(lastScript)
        document.head.removeChild(lastScript);

    // Start a new script to get quote.
    var script = document.createElement('script');
    script.setAttribute('src', url);
    script.setAttribute('id','refreshScript');
    script.setAttribute('charset','gb2312');
    script.setAttribute('async','false');
    script.onload = function () {
        fundQuote = Object();
        console.log(fundIds);
        for (var i in fundIds) {
            //console.log('hq_str_' + fundIds[i]);
            fundQuote[fundIds[i]] = formatQuote(eval('hq_str_' + fundIds[i]).split(','));
        }
        console.log(fundQuote);
    }
    document.head.appendChild(script);
}


refresh(['sh600036','sh600037']);