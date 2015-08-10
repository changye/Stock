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

$fundType = 'a';

if ($_GET['fund'] == 'm' || $_GET['fund'] == 'b' || $_GET['fund'] == 'a') {
    $fundType = $_GET['fund'];
}
$db = new mysqli(DBHOST, DBUSER, DBPASSWD, DBNAME);
if (!$db) {
    die('Could not connect: ' . mysqli_errno());
}
$db->query("SET NAMES utf8");

$queryCmd = "select FundDetail.*,FundHistory.* from FundDetail,FundHistory where FundHistory.FUND_CODE=FundDetail.FUND_CODE and FundHistory.FUND_DATE=(select max(FUND_DATE) from FundHistory) and  FundDetail.FUND_TYPE='$fundType'";
//echo $queryCmd;
$result = $db->query($queryCmd);
if($result) {
    $items = array();

    while($item = $result->fetch_assoc())
    {
        foreach($item as $key=>$value){
            $value = str_replace("\r", "\\r", $value);
            $value = str_replace("\n", "\\n", $value);
            $item[$key] = urlencode($value);
        }
        $items[] = $item;
    }
    $json = urldecode(json_encode($items));
    echo $json;

}

$db->close();

?>




