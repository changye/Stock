/**
 * Created by changye on 15-8-10.
 */

/* 全局变量初始化 */
var fundQuote = undefined;
var indexQuote = undefined;
document.fundHeader = [
    {'name': '代码', 'type': 'number', 'class': ''},
    {'name': '名称', 'type': 'text', 'class': ''},
    {'name': '现价', 'type': 'number', 'class': ''},
    {'name': '涨幅', 'type': 'price_vol', 'class': 'warning'},
    {'name': '成交(万)', 'type': 'number', 'class': ''},
    {'name': '净值', 'type': 'number', 'class': 'danger'},
    {'name': '折价率', 'type': 'percent', 'class': ''},
    {'name': '净价', 'type': 'number', 'class': 'info'},
    {'name': '规则', 'type': 'text', 'class': ''},
    {'name': '本期', 'type': 'number', 'class': ''},
    {'name': '下期', 'type': 'number', 'class': ''},
    {'name': '定折日期', 'type': 'text', 'class': ''},
    {'name': '收益率', 'type': 'percent', 'class': 'success'},
    {'name': '参考指数', 'type': 'text', 'class': ''},
    {'name': '指数涨幅', 'type': 'price_vol', 'class': ''},
    {'name': '下折需跌', 'type': 'percent', 'class': ''},
    {'name': '份额(万)', 'type': 'number', 'class': ''},
    {'name': '变化(万)', 'type': 'number', 'class': ''},
    {'name': '溢价(估)', 'type': 'percent', 'class': ''}
];
document.indexColumn = {'column': 12, 'reverse': true};
document.lastFlush = null;
document.lastIndexColumn = null;
/* 初始化结束 */

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
    prepare();
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

        flush();
        //console.log(fundQuote);
    }
    document.head.appendChild(script);
}

function recalc() {
    document.fundValues = Array();
    for(var i in document.focusFunds) {
        var fund = Array();
        var id = document.focusFunds[i].FUND_MARKET + document.focusFunds[i].FUND_CODE;
        var detail = getFundDetail(document.focusFunds[i].FUND_CODE);
        //代码
        var code = document.focusFunds[i].FUND_CODE;
        fund.push(code);
        //名称
        var link = "http://www.jisilu.cn/data/sfnew/detail/" + code;
        var fundAbbr = "<a href=\"" + link + "\" target=\"_blank\">" + detail.FUND_ABBR + "</a>";
        fund.push(fundAbbr);
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
        //净价
        var netPrice = 0;
        if(netValue){
            netPrice = price - (netValue - 1);
        }
        fund.push(netPrice > 0?netPrice.toFixed(3):null);
        //利率规则
        fund.push(detail.FUND_INT_MODE);
        //本期利率
        fund.push(detail.FUND_INT);
        //下期利率
        fund.push(detail.FUND_INT_NEXT);
        //剩余年限（计算但不显示）
        var leftYear = '永续';
        if(detail.FUND_MATURITY_DATE){
            var maturity = detail.FUND_MATURITY_DATE.split('-');
            leftYear = (((new Date(maturity[0],maturity[1]-1,maturity[2])) - (new Date())) / 31536000000);
        }
        //fund.push(leftYear=='永续'?leftYear:leftYear.toFixed(2));
        //定折日期
        var nextCalcDate;
        fund.push(detail.FUND_NEXT_RECALC_DATE);
        //修正收益率
        var fundReturn = '-';
        var nextRecalcDate = detail.FUND_NEXT_RECALC_DATE.split('-');
        var yearToRecalc = (((new Date(nextRecalcDate[0],nextRecalcDate[1]-1,nextRecalcDate[2])) - (new Date())) / 31536000000);
        var c0 = detail.FUND_INT / 100;
        var c1 = detail.FUND_INT_NEXT / 100;
        if(leftYear == '永续' && netValue) {
            //fundReturn = detail.FUND_INT_NEXT / (100 * (price - netValue + 1) + yearToRecalc * (detail.FUND_INT_NEXT - detail.FUND_INT));
            fundReturn = detail.FUND_CODE.match(/15020[3|5]/)?specialForPenghua(yearToRecalc,price,netValue,c0,0.05):returnForFundA(yearToRecalc,price,netValue,c0,c1);
            fundReturn = (100 * fundReturn).toFixed(3) + '%';
        }else{
            if(netValue){
                fundReturn = specialForFixedYear(yearToRecalc,leftYear,price,netValue,c0,c1);
                fundReturn = (100 * fundReturn).toFixed(3) + '%';
            }
        }
        fund.push(fundReturn);
        //参考指数
        var indexName = detail.FUND_INDEX_ABBR;
        fund.push(indexName);
        //指数涨幅
        var indexVolatility = null;
        var indexId = completeIndexId(detail.FUND_INDEX_CODE);
        if(indexQuote[indexId]) {
            indexVolatility = (((indexQuote[indexId].quote / indexQuote[indexId].close_yesterday) - 1) * 100);
        }
        fund.push(indexVolatility?indexVolatility.toFixed(2) + '%':'NaN%');
        //下折母鸡需跌
        var fundBLowerCalcValue = detail.FUND_LOWER_RECALC * 1.0;
        var fundBId = detail.FUND_B_CODE;
        var netValueA = netValue;
        //console.log(fundBId);
        var netValueB = getFundDetail(fundBId).FUND_NAV * 1.0;
        var ratioA = detail.FUND_A_RATIO * 1;
        var ratioB = detail.FUND_B_RATIO * 1;
        var netValueM = (ratioA * netValueA + ratioB * netValueB) / (ratioA + ratioB);
        var lowerRecalcValue = (ratioA * netValueA + ratioB * fundBLowerCalcValue) / (ratioA + ratioB);
        var mDec = null;
        if(netValueA && netValueB){
            mDec = ((1 - lowerRecalcValue / netValueM) * 100) ;
        }
        mDec = mDec?mDec.toFixed(2) + '%':null;
        fund.push(mDec);
        //总份额
        var vol = (detail.FUND_VOL /10000);
        fund.push(vol.toFixed(0));
        //份额变化
        var volChange = vol - detail.FUND_VOL_LAST / 10000;
        fund.push(volChange.toFixed(0));
        //溢价率, 假设仓位为90%
        var premium = null;
        if(netValueA && netValueB) {
            var priceB = fundQuote[detail.FUND_MARKET+detail.FUND_B_CODE].quote * 1.0;
            var priceM = (ratioA * price + ratioB * priceB) / (ratioA + ratioB);
            premium = (priceM / (netValueM * (1 + indexVolatility*0.9/100)) - 1) * 100;
        }

        fund.push(premium?premium.toFixed(2) + '%':null);

        document.fundValues.push(fund);
    }

}

function filter() {
    //选出A类
    document.focusFunds = filterOut(document.allFunds,'FUND_TYPE',"a",'reg');
    //选出永续
    document.focusFunds = filterOut(document.focusFunds,'FUND_MATURITY_DATE','','exact');

    var value = $('#select').val();
    switch (value) {
        case 'all':
            break;
        case '+3.0%':
            document.focusFunds = filterOut(document.focusFunds,'FUND_INT_MODE',"\\+3\\.0%",'reg');
            break;
        case '+3.5%':
            document.focusFunds = filterOut(document.focusFunds,'FUND_INT_MODE',"\\+3\\.5%",'reg');
            break;
        case '+4.0%':
            document.focusFunds = filterOut(document.focusFunds,'FUND_INT_MODE',"\\+4\\.0%",'reg');
            break;
        default:
            break;
    }
}



function filterOut(funds, key, value, mode) {
    var result = Array();

    if(mode == 'exact') {
        for(var i in funds) {
            if(funds[i][key] == value) {
                result.push(funds[i]);
            }
        }
        return result;
    }

    var pattern = new RegExp(value);
    for(var i in funds) {
        if(pattern.test(funds[i][key]) ) {
            result.push(funds[i]);
        }
    }
    return result;
}

function returnForFundA(t,p,nav,c0,c1) {
    var r = 0.20;
    var rc = 0;
    do {
        r = (r+rc)/2;
        rc = (r/p) * ((c0*t+(nav-1))/Math.pow(1+r,t) +  c1/r/Math.pow(1+r,t));
    }while(Math.abs(r-rc)>0.000001)
    return r;
}

function specialForPenghua(t,p,nav,c0,c1) {
    //console.log('penghua');
    var r = 0.20;
    var rc = 0;
    do {
        r = (r+rc)/2;
        //rc = r*c0*(2+r)/Math.pow(1+r,t)/(1+r) + c1/(1+r)/Math.pow(1+r,t)
        rc = (r/p) * ((c0*t+(nav-1))/Math.pow(1+r,t) + c0/Math.pow(1+r,t+1) + c1/r/(1+r)/Math.pow(1+r,t));
    }while(Math.abs(r-rc)>0.000001)
    return r;
}

function specialForFixedYear(t,n,p,nav,c0,c1) {
    var r = 0.20;
    var rc = 0;
    var np = Math.floor(n-t);
    var lastpay = n-np;
    do {
        r = (r+rc)/2;
        if(np==1){
            rc = ((c0*t+(nav-1))*r/Math.pow(1+r,t) + (1+c1*(lastpay+1))*r/Math.pow(1+r,n)) / p;
        }else{
            rc = ((c0*t+(nav-1))*r/Math.pow(1+r,t) + c1*(1-1/Math.pow(1+r,np))/Math.pow(1+r,t) + (1+c1*lastpay)*r/Math.pow(1+r,n)) / p;
        }
    //console.log(rc);
    }while(Math.abs(r-rc)>0.000001)
    return r;
}