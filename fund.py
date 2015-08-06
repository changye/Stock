__author__ = 'changye'

import shFund
import szFund
import mysql.connector

import logging
logging.basicConfig(level=logging.INFO)

class Fund(object):
    def __init__(self, dbhost='localhost', dbname='FundDB', user='changye', password='19820928'):
        self._sh = None
        self._sz = None
        self.__dbhost = dbhost
        self.__dbname = dbname
        self.__user = user
        self.__password = password

    def getLastBusinessDayFundInfomation(self):
        self._sh= shFund.getFund()
        self._sz = szFund.getFund()

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
            conn.commit()
        finally:
            conn.close()



    def saveToDb(self):
        success = False

        if self._sh:
            self.__save(self._sh)
            success = True
        if self._sz:
            self.__save(self._sz)
            success = True

        return success





if __name__ == '__main__':
    f = Fund()
    f.getLastBusinessDayFundInfomation()
    f.saveToDb()
