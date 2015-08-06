__author__ = 'changye'

from urllib import request
import re
import logging
logging.basicConfig(level=logging.WARNING)

def formatQuote(str):
    string = str.strip()

    if string == '':
        return None

    m = re.match(r'var hq_str_(\S+)="(\S+)"', string)
    if(len(m.groups()) > 1):

        stockInfo = dict()
        stockInfo['id'] = m.group(1)
        logging.info(stockInfo['id'])
        stockInfoArray = re.split(r'[\,]+', m.group(2))
        if len(stockInfoArray) < 1:
            return None
        logging.info(stockInfoArray)
        keys = ['name', 'open_today', 'close_yesterday', 'quote',
                'highest', 'lowest', 'buy', 'sell', 'deal', 'amount']
        for i, value in enumerate(keys):
            stockInfo[value] = stockInfoArray[i]

        stockInfo['buy_quote'] = stockInfoArray[11:21:2]
        stockInfo['buy_quantity'] = stockInfoArray[10:20:2]
        stockInfo['sell_quote'] = stockInfoArray[21:31:2]
        stockInfo['sell_quantity'] = stockInfoArray[20:30:2]
        stockInfo['date'] = stockInfoArray[30]
        stockInfo['time'] = stockInfoArray[31]

        logging.info(stockInfo)

        return stockInfo
    else:
        return None



def getQuote(ids):

    if ids == '' or id == None:
        return None

    quoteId = ','.join(ids)
    url = r'http://hq.sinajs.cn/list=' + quoteId
    logging.info("connecting:\t" + url)
    with request.urlopen(url) as f:
        data = f.read()

    quoteMsg = data.decode('gb2312').replace('\n', '')
    quotes = [x for x in quoteMsg.split(';') if x != '']
    logging.info(quotes)

    return [formatQuote(x) for x in quotes]


if __name__ == '__main__':
    print(getQuote(['sz150209','sz150221']))
