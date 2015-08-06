create database FundDB;
grant all privileges on FundDB.* to 'changye'@'%' identified by '19820928';
CREATE TABLE FundHistory (
	ID INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
       FUND_CODE  CHAR(10)  NOT NULL,
       FUND_DATE  DATE NOT NULL,
       FUND_NAV DECIMAL(7,3),
       FUND_VOL BIGINT UNSIGNED,
       PRIMARY KEY(ID),
       INDEX(FUND_CODE,FUND_DATE) 
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8;  

