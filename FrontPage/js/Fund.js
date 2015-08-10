/**
 * Created by changye on 15-8-10.
 */
var fundQuote = undefined;


function getAllFund() {
    $.getJSON("/Server/fund.php", {'fund': 'a'}, function (data) {
        document.allFunds = data;
    });
}

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

function refresh() {
    var fundIds = Array();
    if(!document.focusFunds) return ;
    for(var i in document.focusFunds) {
        fundIds.push(document.focusFunds[i].FUND_MARKET + document.focusFunds[i].FUND_CODE);
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
        for (var i in fundIds) {
            //console.log('hq_str_' + fundIds[i]);
            fundQuote[fundIds[i]] = formatQuote(eval('hq_str_' + fundIds[i]).split(','));
        }

        recalc();

        remap();
        //console.log(fundQuote);
    }
    document.head.appendChild(script);
}

function recalc() {
    document.fundHeader = ['代码','名称','现价','涨幅','成交额','净值'];
    document.fundValues = Array();
    for(var i in document.focusFunds) {
        var fund = Array();
        var id = document.focusFunds[i].FUND_MARKET + document.focusFunds[i].FUND_CODE;
        fund.push(document.allFunds[i].FUND_CODE);
        fund.push(document.allFunds[i].FUND_ABBR);
        fund.push(fundQuote[id].quote);
        fund.push(Math.round(((fundQuote[id].quote / fundQuote[id].close_yesterday) - 1) * 10000)/100 + "%");
        fund.push(fundQuote[id].amount);
        fund.push(document.allFunds[i].FUND_NAV);
        document.fundValues.push(fund);
    }

}

function remap() {
    document.fundValues = reIndexBy(document.fundValues,5,false);
    createTable(document.fundHeader,document.fundValues);
}

function filterOut(funds, key, value) {
    var result = Array();
    var pattern = new RegExp(value);
    for(var i in funds) {
        if(pattern.test(funds[i][key]) ) {
            result.push({'FUND_CODE': funds[i]['FUND_CODE'], 'FUND_MARKET': funds[i]['FUND_MARKET']});
        }
    }
    return result;
}