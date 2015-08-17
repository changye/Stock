<?php
/**
 * Created by PhpStorm.
 * User: changye
 * Date: 15-8-10
 * Time: 下午1:14
 */
header("Content-type: text/html; charset=utf-8");

define('DBHOST', 'localhost');
define('DBNAME', 'FundDB');
define('DBUSER', 'changye');
define('DBPASSWD', '19820928');

$fundType = '';

if (isset($_GET['fund']) &&($_GET['fund'] == 'm' || $_GET['fund'] == 'b' || $_GET['fund'] == 'a')) {
    $fundType = $_GET['fund'];
}
$db = new mysqli(DBHOST, DBUSER, DBPASSWD, DBNAME);
if (!$db) {
    die('Could not connect: ' . mysqli_errno());
}
$db->query("SET NAMES utf8");

if($fundType != ''){
    $queryCmd = "select FundDetail.*,FundHistory.* from FundDetail,FundHistory where FundHistory.FUND_CODE=FundDetail.FUND_CODE and FundHistory.FUND_DATE=(select max(FUND_DATE) from FundHistory) and  FundDetail.FUND_TYPE='$fundType'";
}else{
    $queryCmd = "select FundDetail.*,FundHistory.* from FundDetail,FundHistory where FundHistory.FUND_CODE=FundDetail.FUND_CODE and FundHistory.FUND_DATE=(select max(FUND_DATE) from FundHistory)";
}
//echo $queryCmd;
$result = $db->query($queryCmd);

$items = array();

if($result) {
    while($item = $result->fetch_assoc())
    {
        foreach($item as $key=>$value){
            $value = str_replace("\r", "\\r", $value);
            $value = str_replace("\n", "\\n", $value);
            $item[$key] = urlencode($value);
        }
        $items[] = $item;
    }
}

//获得上一交易日的份额数据
$queryCmd = "select FUND_CODE,FUND_VOL from FundHistory where FUND_DATE=(select distinct FUND_DATE from FundHistory order by FUND_DATE desc limit 1,1)";
$result = $db->query($queryCmd);
$vols = array();
if($result){
    while($vol = $result->fetch_assoc())
    {
        $vols[$vol['FUND_CODE']] = $vol['FUND_VOL'];
    }
}

//两份数据合并
$funds = array();
foreach ($items as $fund) {
    if (isset($vols[$fund['FUND_CODE']])) {
        $fund['FUND_VOL_LAST'] = $vols[$fund['FUND_CODE']];
    }
    $funds[] = $fund;
}


$json = urldecode(json_encode($funds));
echo $json;

$db->close();

?>




