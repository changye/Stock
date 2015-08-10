/**
 * Created by changye on 15-8-10.
 */

function createTable(tkeys,values) {

    var tableOld = document.getElementById('fund_table');
    if(tableOld) document.body.removeChild(tableOld);

    var table = document.createElement('table');
    table.setAttribute('id', 'fund_table');
    table.appendChild(createHeader(tkeys));
    table.appendChild(createBody(values));
    document.body.appendChild(table);
}

function createHeader(tkeys) {
    var header = document.createElement('thead');
    var row = document.createElement('tr');
    for(var i in tkeys) {
        var col = document.createElement('th');
        col.innerText = tkeys[i];
        row.appendChild(col);
    }
    header.appendChild(row);
    return header;
}

function createBody(values) {
    var body = document.createElement('tbody');
    for(var i in values) {
        body.appendChild(createRow(values[i]));
    }
    return body;
}

function createRow(value) {
    var row = document.createElement('tr');
    for(var i in value) {
        var col = document.createElement('td');
        col.innerHTML =value[i];
        row.appendChild(col);
    }
    return row;
}

function reIndexBy(values,column,reverse) {
    var sortFun;
    if(!reverse) {
        sortFun = function(a, b) {
            return a[column] > b[column]? 1 : -1;
        };
    }else{
        sortFun = function (a, b) {
            return a[column] < b[column]? 1 : -1;
        };
    }

    values.sort(sortFun);
    return values;
}