/**
 * Created by changye on 15-8-10.
 */

function createTable() {



    var tableOld = document.getElementById('fund_table');
    if(tableOld) document.body.removeChild(tableOld);

    var table = document.createElement('table');
    table.setAttribute('id', 'fund_table');
    table.setAttribute('class','table table-striped table-hover');
    table.appendChild(createHeader());
    table.appendChild(createBody());
    document.body.appendChild(table);
}

function createHeader() {
    var tkeys = document.fundHeader;
    var header = document.createElement('thead');
    var row = document.createElement('tr');
    for(var i in tkeys) {
        var col = document.createElement('th');
        col.innerHTML = tkeys[i];
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


function sort(column) {
    if(document.indexColumn.column == column) {
        document.indexColumn.reverse = !document.indexColumn.reverse;
    }else{
        document.indexColumn.column = column;
        document.indexColumn.reverse = false;
    }
    //console.log(document.indexColumn.column + ';' + document.indexColumn.reverse);
}

function flush() {
    document.fundValues = reIndexBy(document.fundValues,document.indexColumn.column,document.indexColumn.reverse);
    createTable();
}