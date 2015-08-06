__author__ = 'changye'

import json
import re
import requests
from datetime import datetime, timedelta
import tools
import logging
logging.basicConfig(level=logging.INFO)

def getFromUrl(url):
    header = {
        'User-Agent': "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:34.0) Gecko/20100101 Firefox/34.0",
        'Referer': "http://www.sse.com.cn/assortment/fund/fjlof/netvalue/",
        'Connection': "keep-alive",
        'Accept': "*/*",
        'Accept-Encoding': 'gzip, deflate, sdch',
        'Accept-Language': 'zh-CN,zh;q=0.8'
    }
    url = url + '&_=' + '%d' %int(datetime.now().timestamp() * 1000)
    logging.info(url)
    r = requests.get(url, headers=header, allow_redirects=False)
    logging.info(r.status_code)
    if(r.status_code == 200):
        return r.text
    else:
        return None

def getJson(text):
    m = re.match(r'mycallback\(({.*})\)', text)
    if(m):
        logging.info(m.group(1))
        return json.loads(m.group(1))['result']


def queryFund(*date, query='value'):
    if len(date) < 1:
        queryDate = tools.lastValidMarketDay().strftime('%Y%m%d')
        logging.info('Default date is:\t' + queryDate)
    else:
        queryDate = datetime.strptime(date[0], '%Y-%m-%d').strftime('%Y%m%d')

    if query == 'value':
        queryKeyWord = 'COMMON_SSE_FUND_FJLOF_NETVALUE_CX_S'
    elif query == 'scale':
        queryKeyWord = 'COMMON_SSE_FUND_FJLOF_SCALE_CX_S'

    url = 'http://query.sse.com.cn/commonQuery.do?' \
          'jsonCallBack=mycallback&' \
          'isPagination=true&' \
          'sqlId=' + queryKeyWord + '&' \
          'FILEDATE=' + queryDate + '&' \
          'pageHelp.pageSize=10000'

    valueText = getFromUrl(url)
    if(valueText):
        values = getJson(valueText)

    return values
    # logging.info(values)

def getFundValue(*date):
    values = queryFund(*date, query='value')
    funds = dict()
    for v in values:
        v['DATE'] = v['ASSESS_DATE']
        v['FUND_NAV'] = (float)(v['NAV'].replace(r',', ''))
        funds[v['FUND_CODE']] = v
    return funds

def getFundInfo(*date):
    values = queryFund(*date, query='scale')
    funds = dict()
    for v in values:
        v['DATE'] = datetime.strptime(v['TRADE_DATE'], '%Y%m%d').strftime('%Y-%m-%d')
        v['FUND_VOL'] = (int)((float)(v['INTERNAL_VOL'].replace(r',', '')) * 10000)
        funds[v['FUND_CODE']] = v
    return funds


def getFund(*date):

    fundInfo = getFundInfo(*date)
    fundValue = getFundValue(*date)

    fundIds = set((list)(fundInfo.keys()) + (list)(fundValue.keys()))
    funds = dict()

    for f in fundIds:
        fund = dict()
        fund['FUND_VOL'] = fund['FUND_NAV'] = 0
        if f in fundInfo:
            fund['FUND_DATE'] = fundInfo[f]['DATE']
            fund['FUND_VOL'] = fundInfo[f]['FUND_VOL']
        if f in fundValue:
            fund['FUND_NAV'] = fundValue[f]['FUND_NAV']
        funds[f] = fund

    return funds


if __name__ == '__main__':
    [print(x) for x in getFund().items()]