__author__ = 'changye'

import requests
import json
import mysql.connector
import logging
# logging.basicConfig(level=logging.WARNING)


def get_fund_detail():
    url = 'http://www.jisilu.cn/data/sfnew/fundm_list/'
    r = requests.get(url)
    if r:
        try:
            j = json.loads(r.text)
            if 'rows' in j:
                return j['rows']
            else:
                return None
        except:
            return None
    else:
        return None


def format_fund(fund_json):
    key_pair = {
        'FUND_CODE' : 'base_fund_id',
        'FUND_ABBR' : 'base_fund_nm',
        'FUND_TYPE' : '',
        'FUND_TRADEABLE' : 'mtrade',
        'FUND_MARKET' : 'market',
        'FUND_MANAGER' : 'fund_manager',
        'FUND_COMPANY' : 'fund_company_nm',
        'FUND_ISSUE_DATE' : 'issue_dt',
        'FUND_MATURITY_DATE' : 'maturity_dt',
        'FUND_A_CODE' : 'fundA_id',
        'FUND_A_ABBR' : 'fundA_nm',
        'FUND_A_RATIO' : 'a_ratio',
        'FUND_B_CODE' : 'fundB_id',
        'FUND_B_ABBR' : 'fundB_nm',
        'FUND_B_RATIO' : 'b_ratio',
        'FUND_M_CODE' : 'base_fund_id',
        'FUND_M_ABBR' : 'base_fund_nm',
        'FUND_LOWER_RECALC' : 'lower_recalc_price',
        'FUND_UPPER_RECALC' : 'upper_recalc_price',
        'FUND_NEXT_RECALC_DATE' : 'next_recalc_dt',
        'FUND_INT_MODE' : 'coupon_descr_s',
        'FUND_INT' : 'coupon',
        'FUND_INT_NEXT' : 'coupon_next',
        'FUND_INDEX_CODE' : 'index_id',
        'FUND_INDEX_ABBR' : 'index_nm',
        'FUND_REDEEM_FEE' : 'redeem_fee',
        'FUND_REDEEM_NOTE' : 'redeem_fee_tip',
        'FUND_MANAGE_FEE' : 'manage_fee',
        'FUND_APPLY_FEE' : 'apply_fee',
        'FUND_APPLY_NOTE' : 'apply_fee_tip',
        'FUND_NOTE' : 'fund_descr'
    }
    fund = dict()
    for key_in_db, key_in_json in key_pair.items():
        if key_in_json != '':
            try:
                fund[key_in_db] = fund_json['cell'][key_in_json]
            except:
                fund[key_in_db] = ''
        else:
            fund[key_in_db] = ''

    return fund


def fund_to_m(fund):
    fund_m = fund
    fund_m['FUND_CODE'] = fund['FUND_M_CODE']
    fund_m['FUND_ABBR'] = fund['FUND_M_ABBR']
    fund_m['FUND_TYPE'] = 'm'
    return fund_m


def fund_to_a(fund):
    fund_a = fund
    fund_a['FUND_CODE'] = fund['FUND_A_CODE']
    fund_a['FUND_ABBR'] = fund['FUND_A_ABBR']
    fund_a['FUND_TYPE'] = 'a'
    fund_a['FUND_TRADEABLE'] = 'y'
    return fund_a


def fund_to_b(fund):
    fund_b = fund
    fund_b['FUND_CODE'] = fund['FUND_B_CODE']
    fund_b['FUND_ABBR'] = fund['FUND_B_ABBR']
    fund_b['FUND_TYPE'] = 'b'
    fund_b['FUND_TRADEABLE'] = 'y'
    return fund_b


def __save_single_item(fund,conn):
    keys = []
    holder = []
    values = []
    for key, value in fund.items():
        if value and value != '' and value != '-':
            keys.append(key)
            holder.append('%s')
            values.append(value)
    query_keys = ','.join(keys)
    query_holders = ','.join(holder)
    if conn:
        cursor = conn.cursor()
        logging.info('replace into FundDetail (' + query_keys + ') values (' + query_holders + ')')
        logging.info(values)
        cursor.execute('replace into FundDetail (' + query_keys + ') values (' + query_holders + ')', values)
        conn.commit()
    else:
        logging.error('Can not open connection to database!')


def save_to_db(funds, dbhost='localhost', dbname='FundDB', user='changye', password='19820928'):

    conn = mysql.connector.connect(host=dbhost, db=dbname, user=user, passwd=password)
    if not conn:
        logging.error('Can not open connection to database!')
        return False

    for fund in funds:
        fund_m = fund_to_m(fund)
        __save_single_item(fund_m, conn)

        fund_a = fund_to_a(fund)
        __save_single_item(fund_a, conn)

        fund_b = fund_to_b(fund)
        __save_single_item(fund_b, conn)
    return True


if __name__ == '__main__':
    funds = [format_fund(f) for f in get_fund_detail()]
    save_to_db(funds)
