__author__ = 'changye'

import re
import logging
import requests
import tools
# logging.basicConfig(level=logging.INFO)

def table2List(text):
    text = text.replace('\n', '')
    text = text.replace('</td>', '\t')
    text = text.replace('</tr>', ';')
    text = re.sub('<[^>]*?>', '', text)
    lines = re.split(r';', text.strip(r'[\n;]'))
    values = [re.split(r'\t+', l.strip()) for l in lines if l.strip() != '']
    return values

def getFundValue(*date):
    if len(date) == 0:
        startDate = endDate = tools.lastValidMarketDay().strftime('%Y-%m-%d')
        logging.info('Default date is:\t' + startDate)
    elif len(date) > 1:
        startDate = date[0]
        endDate = date[1]
    else:
        startDate = endDate = date[0]

    url = 'http://www.szse.cn/szseWeb/FrontController.szse?ACTIONID=8&CATALOGID=1833&txtKsrq=START_DATE&txtZzrq=END_DATE&ENCODE=1&TABKEY=tab1'

    excelUrl = url.replace('START_DATE', startDate).replace('END_DATE', endDate)
    logging.info(excelUrl);
    r = requests.get(excelUrl)
    text = bytes.decode(r.content, 'GBK')
    values = table2List(text)
    [logging.info(v) for v in values]
    def formatvalue(v):
        keys = ['DATE', 'FUND_CODE', 'FUND_ABBR', 'FUND_NAV']
        fund = dict()
        for i, value in enumerate(v):
            fund[keys[i]] = v[i]
        try:
            fund['FUND_NAV'] = float(fund['FUND_NAV'].replace(r',', ''))
        except:
            pass
        finally:
            pass
        return fund
    funds = dict()
    for v in values:
        fund = formatvalue(v)
        if 'FUND_CODE' in fund and fund['FUND_CODE'].startswith("1"):
            funds[fund['FUND_CODE']] = fund
    # logging.info(funds)
    return funds


def getFundInfo():
    url = 'http://www.szse.cn/szseWeb/FrontController.szse?ACTIONID=8&CATALOGID=1105&ENCODE=1&TABKEY=tab1'
    r = requests.get(url)
    text = bytes.decode(r.content, 'GBK')
    values = table2List(text)

    date = tools.lastValidMarketDay()
    def formatInfo(v):
        keys = ['FUND_CODE', 'FUND_ABBR', 'FUND_STARTDATE', 'FUND_VOL']
        fund = dict()
        for i, value in enumerate(keys):
            fund[keys[i]] = v[i]
        fund['DATE'] = date.strftime('%Y-%m-%d')
        try:
            fund['FUND_VOL'] = int(fund['FUND_VOL'].replace(r',', ''))
        except:
            pass
        finally:
            pass
        return fund
    funds = dict()
    for v in values:
        fund = formatInfo(v)
        if 'FUND_CODE' in fund and fund['FUND_CODE'].startswith("1"):
            funds[fund['FUND_CODE']] = fund
    # logging.info(funds)
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
    # getFundValue('2015-07-29', '2015-08-03')
    [print(x) for x in getFund().items()]
