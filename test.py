__author__ = 'changye'

import time
import SinaApi
import os

while(True):
    time.sleep(1)
    os.system('clear')
    quote = SinaApi.getQuote(['sz150209'])[0]
    print(quote['name'])

    for i, value in enumerate(quote['sell_quantity']):
        print(quote['sell_quote'][4-i] + "\t" + quote['sell_quantity'][4-i])

    print(quote['quote'])

    for i, value in enumerate(quote['buy_quantity']):
        print(quote['buy_quote'][i] + "\t" + value)

