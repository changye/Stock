__author__ = 'changye'

import shFund
import szFund
import mysql.connector
import logging
# logging.basicConfig(level=logging.WARNING)

class Fund(object):
    def __init__(self, dbhost='localhost', dbname='FundDB', user='changye', password='19820928'):
        self._sh = None
        self._sz = None
        self.__dbhost = dbhost
        self.__dbname = dbname
        self.__user = user
        self.__password = password

    def getLastBusinessDayFundInfomation(self):
        logging.warning('Start connecting to sse.....')
        self._sh = shFund.getFund()
        if self._sh:
            logging.warning('Ok!')
        else:
            logging.warning('Failed!')

        logging.warning('Start connect to szse.....')
        self._sz = szFund.getFund()
        if self._sz:
            logging.warning('Ok!')
        else:
            logging.warning('Failed!')

    def __save(self, funds):
        conn = mysql.connector.connect(host=self.__dbhost, db=self.__dbname, user=self.__user, passwd=self.__password)
        try:
            cursor = conn.cursor()

            for fundcode, value in funds.items():
                cursor.execute('select * from FundHistory where FUND_CODE = %s and FUND_DATE = %s',
                               [fundcode, value['FUND_DATE']])
                r = cursor.fetchone()
                if not r:
                    logging.info(fundcode, value)
                    cursor.execute('insert into FundHistory (FUND_CODE,FUND_DATE,FUND_NAV,FUND_VOL) '
                                   'values (%s, %s, %s, %s)',
                                   [fundcode, value['FUND_DATE'], value['FUND_NAV'], value['FUND_VOL']])
                else:
                    update_key = list()
                    update_value = list()
                    if value['FUND_NAV'] != 0:
                        update_key.append('FUND_NAV=%s')
                        update_value.append(value['FUND_NAV'])
                    if value['FUND_VOL'] != 0:
                        update_key.append('FUND_VOL=%s')
                        update_value.append(value['FUND_VOL'])

                    if len(update_key) > 0:
                        # logging.info('update FundHistory set ' + ','.join(update_key) +
                        #                ' where FUND_CODE=%s and FUND_DATE=%s')
                        cursor.execute('update FundHistory set ' + ','.join(update_key) +
                                       ' where FUND_CODE=%s and FUND_DATE=%s',
                                        update_value + [fundcode, value['FUND_DATE']])

            conn.commit()
        finally:
            conn.close()

    def save_to_db(self):
        success = False

        if self._sh:
            self.__save(self._sh)
            success = True
            logging.warning('sh funds is saved into database.')
        if self._sz:
            self.__save(self._sz)
            success = True
            logging.warning('sz funds is saved into database.')

        return success

if __name__ == '__main__':
    f = Fund()
    f.getLastBusinessDayFundInfomation()
    f.save_to_db()
