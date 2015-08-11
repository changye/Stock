/**
 * Created by changye on 15-8-10.
 */
var fundQuote = undefined;
var indexQuote = undefined;


function getAllFund() {
    $.getJSON("/Server/fund.php", function (data) {
        document.allFunds = data;
    });
}

function getAllIndex() {
    document.indexes = Object();
    for(var i in document.allFunds) {
        document.indexes[document.allFunds[i].FUND_INDEX_CODE] = 1;
    }
}

function completeIndexId(code) {
    if(code.match('^0')) {
        return 'sh' + code;
    }
    if(code.match('^3')) {
        return 'sz' + code;
    }
    return code;
}

function map() {
    document.fundMap = Object();
    for(var i in document.allFunds) {
        document.fundMap[document.allFunds[i].FUND_CODE] = i;
    }
}

function getFundDetail(fundCode) {
    return document.allFunds[document.fundMap[fundCode]];
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
    if(!document.allFunds) return ;
    for(var i in document.allFunds) {
        fundIds.push(document.allFunds[i].FUND_MARKET + document.allFunds[i].FUND_CODE);
    }

    var indexId = Array();
    for(var i in document.indexes) {
        indexId.push(completeIndexId(i));
    }
    var queryid = fundIds.join(',') + ',' + indexId.join(',');
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
        indexQuote = Object();
        for (var i in indexId) {
            indexQuote[indexId[i]] = formatQuote(eval('hq_str_' + indexId[i]).split(','));
        }

        recalc();

        remap();
        //console.log(fundQuote);
    }
    document.head.appendChild(script);
}

function recalc() {
    document.fundHeader = ['代码','名称','现价','涨幅','成交额','净值','折价率','利率规则',
                            '本期利率','下期利率','剩余年限','修正收益率','参考指数','指数涨幅',
                            '下折母鸡需跌'];
    document.fundValues = Array();
    for(var i in document.focusFunds) {
        var fund = Array();
        var id = document.focusFunds[i].FUND_MARKET + document.focusFunds[i].FUND_CODE;
        var detail = getFundDetail(document.focusFunds[i].FUND_CODE);
        //代码
        fund.push(document.focusFunds[i].FUND_CODE);
        //名称
        fund.push(detail.FUND_ABBR);
        //现价
        var price = fundQuote[id].quote * 1.0;
        fund.push(price.toFixed(3));
        //涨幅
        var volatility = (((fundQuote[id].quote / fundQuote[id].close_yesterday) - 1) * 100).toFixed(2);
        fund.push(volatility + "%");
        //成交量
        var amount = (fundQuote[id].amount /10000);
        fund.push(amount.toFixed(2));
        //净值
        var netValue = null;
        if(detail.FUND_NAV > 0){
            netValue = detail.FUND_NAV * 1.0;
        }
        fund.push(netValue?netValue.toFixed(3):netValue);
        //折价率
        var discount = '-';
        if(detail.FUND_NAV > 0){
            discount = ((1 - (fundQuote[id].quote / detail.FUND_NAV)) * 100).toFixed(2) + '%'
        }
        fund.push(discount);
        //利率规则
        fund.push(detail.FUND_INT_MODE);
        //本期利率
        fund.push(detail.FUND_INT);
        //下期利率
        fund.push(detail.FUND_INT_NEXT);
        //剩余年限
        var leftYear = '永续';
        if(detail.FUND_MATURITY_DATE){
            var maturity = detail.FUND_MATURITY_DATE.split('-');
            leftYear = (((new Date(maturity[0],maturity[1]-1,maturity[2])) - (new Date())) / 31536000000).toFixed(2);
            //leftYear = detail.FUND_MATURITY_DATE;
        }
        fund.push(leftYear);
        //修正收益率
        var fundReturn = '-';
        if(leftYear == '永续' && netValue) {
            var nextRecalcDate = detail.FUND_NEXT_RECALC_DATE.split('-');
            var yearToRecalc = (((new Date(nextRecalcDate[0],nextRecalcDate[1]-1,nextRecalcDate[2])) - (new Date())) / 31536000000).toFixed(2);
            fundReturn = detail.FUND_INT_NEXT / (100 * (price - netValue + 1) + yearToRecalc * (detail.FUND_INT_NEXT - detail.FUND_INT));
            fundReturn = (100 * fundReturn).toFixed(3) + '%';
        }
        fund.push(fundReturn);
        //参考指数
        var indexName = detail.FUND_INDEX_ABBR;
        fund.push(indexName);
        //指数涨幅
        var indexVolatility = null;
        var indexId = completeIndexId(detail.FUND_INDEX_CODE);
        if(indexQuote[indexId]) {
            indexVolatility = (((indexQuote[indexId].quote / indexQuote[indexId].close_yesterday) - 1) * 100).toFixed(2);
            indexVolatility = indexVolatility + '%';
        }
        fund.push(indexVolatility);
        //下折母鸡需跌
        var fundBLowerCalcValue = detail.FUND_LOWER_RECALC * 1.0;
        var fundBId = detail.FUND_B_CODE;
        var netValueA = netValue;
        console.log(fundBId);
        var netValueB = getFundDetail(fundBId).FUND_NAV * 1.0;
        var mDec = null;
        if(netValue){
            mDec = ((1 - (fundBLowerCalcValue + netValue) / (netValueA + netValueB)) * 100).toFixed(2) ;
        }
        mDec = mDec?mDec + '%' : mDec;
        fund.push(mDec);

        document.fundValues.push(fund);
    }

}

function remap() {
    document.fundValues = reIndexBy(document.fundValues,11,false);
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