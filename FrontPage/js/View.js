/**
 * Created by changye on 15-8-10.
 */

function createTable() {

    var tableArea = document.getElementById('table_area');

    var tableOld = document.getElementById('fund_table');
    if(tableOld) tableArea.removeChild(tableOld);

    var table = document.createElement('table');
    table.setAttribute('id', 'fund_table');
    table.setAttribute('class','table table-striped table-hover');
    table.appendChild(createHeader());
    table.appendChild(createBody());
    tableArea.appendChild(table);
}

function createHeader() {
    var tkeys = document.fundHeader;
    var header = document.createElement('thead');
    var row = document.createElement('tr');
    for(var i in tkeys) {
        var col = document.createElement('th');
        col.setAttribute('class',document.fundHeader[i].class);
        col.innerHTML = tkeys[i].name;
        col.setAttribute('click-id', i );
        col.onclick = function () {
            var col = this.getAttribute('click-id');
            sort(col);
            flush();
        }
        row.appendChild(col);
    }
    header.appendChild(row);
    return header;
}

function createBody() {

    var values = document.fundValues;
    var body = document.createElement('tbody');
    for(var i in values) {
        body.appendChild(createRow(values[i]));
    }
    return body;
}

function createRow(value) {
    var row = document.createElement('tr');
    row.setAttribute('id',value[0]);
    for(var i in value) {
        var col = document.createElement('td');
        col.setAttribute('class',document.fundHeader[i].class);
        col.innerHTML =formatTableCell(value[i],document.fundHeader[i].type);
        row.appendChild(col);
    }
    return row;
}

function getPureValue(value,type) {
    var result;
    if(value == undefined || value == null) return 0;
    switch (type) {
        case 'number':
            result = value * 1.0;
            break;
        case 'text':
            result = value;
            break;
        case 'price_vol':
            result = value.match(/[+-]?[\d\.]+/);
            if(result == null) {
                result = 0;
            }else{
                result = result * 1.0;
            }
            break;
        case 'percent':
            result = value.match(/[+-]?[\d\.]+/);
            if(result == null) {
                result = 0;
            }else{
                result = result * 1.0;
            }
            break;
        default :
            result = value;
            break;
    }
    return result;
}


function reIndexBy(values,column,type,reverse) {
    var sortFun;
    if(!reverse) {
        sortFun = function(a, b) {
            return getPureValue(a[column],type) > getPureValue(b[column],type)? 1 : -1;
        };
    }else{
        sortFun = function (a, b) {
            return getPureValue(a[column],type) < getPureValue(b[column],type)? 1 : -1;
        };
    }

    values.sort(sortFun);
    return values;
}

function formatTableCell(value,type) {
    var result = value;
    switch (type) {
        case 'number':
            break;
        case 'text':
            break;
        case 'price_vol':
            var t = getPureValue(value,type);
            if(t > 0.0){
                result =  '<span style="color:red">' + value + '</span>';
            }
            if(t < 0.0){
                result =  '<span style="color:green">' + value + '</span>';
            }
            if(t == 0.0){
                result =  '<span style="color:black">' + value + '</span>';
            }
            break;
        case 'percent':
            break;
        default :
            break;
    }
    return result;
}

function sort(column) {
    if(document.indexColumn.column == column) {
        document.indexColumn.reverse = !document.indexColumn.reverse;
    }else{
        document.indexColumn.column = column;
        document.indexColumn.reverse = false;
    }
    //console.log(document.indexColumn.column + ';' + document.indexColumn.reverse);
}

function prepare(){
    document.lock = true;
    $("#refresh").removeClass('btn-primary');
    $("#refresh").addClass('btn-danger disabled');
}

function flush() {
    document.fundValues = reIndexBy(document.fundValues,document.indexColumn.column,document.fundHeader[document.indexColumn.column].type,document.indexColumn.reverse);
    createTable();

    markChanges();
    document.lastFlush = document.fundValues;
    document.lastIndexColumn = document.indexColumn;


    $("#refresh").removeClass('btn-danger');
    $("#refresh").removeClass('disabled');
    $("#refresh").addClass('btn-primary');
    document.lock = false;
}

function markChanges() {
    // 如果上一次数据不存在
    if(!document.lastFlush || !document.lastIndexColumn) {
        return;
    }

    // 如果上一次的排序列和这次的不同
    if(document.lastIndexColumn.column != document.indexColumn.column || document.lastIndexColumn.reverse != document.indexColumn.reverse) {
        return;
    }
    var rankingChange = Object();
    var oldRanking = Object();
    for(var i in document.lastFlush){
        var code = document.lastFlush[i][0];
        oldRanking[code] = i;
    }
    for(var i in document.fundValues){
        var code = document.fundValues[i][0];
        if(oldRanking[code] != undefined && oldRanking[code] != i){
            rankingChange[code] = oldRanking[code] - i;
        }
    }

    for(var i in rankingChange) {
        if(rankingChange[i] > 0){
            $("#"+i).addClass('success');
        }else{
            $("#"+i).addClass('danger');
        }
    }



}
