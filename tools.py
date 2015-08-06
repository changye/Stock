__author__ = 'changye'

import requests
import logging
import json
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)

def isValidMarketDay(date):

    if date.isoweekday() > 5:
        return False

    dateString = date.strftime('%Y%m%d')
    r = requests.get('http://www.easybots.cn/api/holiday.php?d=' + dateString)
    result = json.loads(r.text)
    logging.info(result)
    if result[dateString] == 0:
        return True
    else:
        return False

def lastValidMarketDay(date = datetime.now()):
    lastDate = date - timedelta(days=1)
    while(not isValidMarketDay(lastDate)):
        lastDate = lastDate - timedelta(days=1)
    return lastDate

if __name__ == '__main__':

    date = datetime.strptime('2015-10-02', '%Y-%m-%d')
    print(lastValidMarketDay(date))

