;(function() {

    var TableSift = {};
    window.TableSift = TableSift;

    var aProto = Array.prototype;
    var nativeEach = aProto.forEach;
    var nativeMap = aProto.map;

    var oProto = Object.prototype;
    var toString = oProto.toString;

    var _each = function(col, fn, scope) {
        if (col == null) {
            return;
        }

        if (nativeEach && col.forEach === nativeEach) {
            col.forEach(fn, scope);
        }

        var i, l;
        for (i = 0, l = col.length; i < l; ++i) {
            if (i in col) {
                fn.call(scope, col[i], i, col);
            }
        }
    };

    var _map = function(col, fn, scope) {
        var payload = [];

        if (col == null) {
            return payload;
        }

        if (nativeMap && col.map === nativeMap) {
            return col.map(fn, scope);
        }

        _each(col, function(val, idx, list) {
            payload.push(fn.call(scope, val, idx, list));
        });

        return payload;
    };

    var _sort = function(col, fn, scope) {
        return _map(_map(col, function(value, index, list) {
            return {
                value : value,
                index : index,
                criteria : fn.call(scope, value, index, list)
            };
        }).sort(function(left, right) {
            var a = left.criteria;
            var b = right.criteria;

            if (a !== b) {

                if (a > b || a === void 0) {
                    return 1;
                }

                if (a < b || b === void 0) {
                    return -1;
                }
            }

            return left.index < right.index ? -1 : 1;

            }), function(item) {
                return item.value;
            });
    };

    var _isString = function(obj) {
        return toString.call(obj) === '[object String]';
    };

    var _getDomHook = function(id) {
        return _isString(id) ? document.getElementById(id) : id;
    };

    var _collect_table_rows = function(tableBody) {
        var store = [];

        _each(tableBody.rows, function(row) {
            var cellStore = [];
            _each(row.children, function(cell) {
                var content = cell.textContent;
                if (content.indexOf(',') !== -1) {
                    content = content.replace(/,/g, '');
                }

                if (content.indexOf('$') !== -1) {
                    content = content.replace(/\$/g, '');
                }

                cellStore.push(isNaN(+content) ? content : +content);
            });

            store.push([cellStore, row]);
        });

        return store;
    };

    TableSift.init = function(id) {
        var table = _getDomHook(id);
        var tableHead = table.tHead;
        var tableBody = table.tBodies[0];
        var rowData = _collect_table_rows(tableBody);

        _each(tableHead.getElementsByTagName('th'), function(c) {
            c.addEventListener('click', function() {
                var i = c.cellIndex;
                var prevSortOrder = c.getAttribute('data-sort');

                var sorted = _sort(rowData, function(row) {
                    return row[0][i];
                });

                if (prevSortOrder === 'asc') {
                    sorted.reverse();
                    c.setAttribute('data-sort', 'des');
                } else {
                    c.setAttribute('data-sort', 'asc');
                }

                var frag = document.createDocumentFragment();

                _each(sorted, function(s) {
                    frag.appendChild(s[1]);
                });

                tableBody = table.removeChild(tableBody).cloneNode();
                table.appendChild(tableBody).appendChild(frag);
            });
        });
    };

}).call(this);