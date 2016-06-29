'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _utilsHelpersSerialize = require('./../../utils/helpers/serialize');

var _utilsHelpersSerialize2 = _interopRequireDefault(_utilsHelpersSerialize);

var _table = require('./../table');

/**
 * A Table Ajax Widget
 *
 * == How to use a Table Ajax in a component
 *
 * In your file
 *
 *   import Table from 'carbon/lib/components/table-ajax';
 *   import { TableRow, TableCell, TableHeader } from 'carbon/lib/components/table';
 *
 * To render a Table please see the Table Component
 *
 * TableAjax requires a path to be provided
 *
 * <TableAjax
 *    path='./path'
 * >
 *
 */

var TableAjax = (function (_Table) {
  _inherits(TableAjax, _Table);

  function TableAjax() {
    var _this = this;

    _classCallCheck(this, TableAjax);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _get(Object.getPrototypeOf(TableAjax.prototype), 'constructor', this).apply(this, args);
    this.timeout = null;
    this.state = {

      /**
       * Pagination
       * Current Visible Page
       *
       * @property currentPage
       * @type {String}
       */
      currentPage: this.props.currentPage || '1',

      /**
       * Pagination
       * Page Size of grid (number of visible records)
       *
       * @property pageSize
       * @type {String}
       */
      pageSize: this.defaultPageSize,

      /**
       * Pagination
       * Total number of records in the grid
       *
       * @property totalRecords
       * @type {String}
       */
      totalRecords: '0',

      /**
       * Sorting
       * either 'asc' or 'desc' order
       *
       * @property sortOrder
       * @type {String}
       */
      sortOrder: this.props.sortOrder || '',

      /**
       * Sorting
       * column name to sort
       *
       * @property sortedColumn
       * @type {String}
       */
      sortedColumn: this.props.sortedColumn || ''

    };

    this.getChildContext = function () {
      return {
        attachActionToolbar: _this.attachActionToolbar,
        detachActionToolbar: _this.detachActionToolbar,
        attachToTable: _this.attachToTable,
        detachFromTable: _this.detachFromTable,
        checkSelection: _this.checkSelection,
        onSort: _this.onSort,
        selectable: _this.props.selectable,
        highlightable: _this.props.highlightable,
        selectAll: _this.selectAll,
        selectRow: _this.selectRow,
        highlightRow: _this.highlightRow,
        sortedColumn: _this.sortedColumn,
        sortOrder: _this.sortOrder
      };
    };

    this.emitOnChangeCallback = function (element, options) {
      var timeout = arguments.length <= 2 || arguments[2] === undefined ? 250 : arguments[2];

      if (_this.selectAllComponent) {
        // reset the select all component
        _this.selectAllComponent.setState({ selected: false });
        _this.selectAllComponent = null;
      }

      var resetHeight = Number(options.pageSize) < Number(_this.pageSize),
          currentPage = element === "filter" ? "1" : options.currentPage;

      _this.setState({
        currentPage: currentPage,
        pageSize: options.pageSize,
        sortOrder: options.sortOrder,
        sortedColumn: options.sortedColumn
      });

      _this.stopTimeout();
      _this.timeout = setTimeout(function () {
        _superagent2['default'].get(_this.props.path).set('Accept', 'application/json').query(_this.queryParams(element, options)).end(function (err, response) {
          _this.handleResponse(err, response);
          if (resetHeight) {
            _this.resetTableHeight();
          }
        });
      }, timeout);
    };

    this.stopTimeout = function () {
      if (_this.timeout) {
        clearTimeout(_this.timeout);
      }
    };

    this.handleResponse = function (err, response) {
      if (!err) {
        var data = response.body;
        _this.props.onChange(data);
        _this.setState({ totalRecords: String(data.records) });
      }
    };

    this.queryParams = function (element, options) {
      var query = options.filter || {};
      query.page = element === "filter" ? "1" : options.currentPage;
      query.rows = options.pageSize;
      if (options.sortOrder) {
        query.sord = options.sortOrder;
      }
      if (options.sortedColumn) {
        query.sidx = options.sortedColumn;
      }
      return (0, _utilsHelpersSerialize2['default'])(query);
    };

    this.emitOptions = function () {
      var props = arguments.length <= 0 || arguments[0] === undefined ? _this.props : arguments[0];

      return {
        currentPage: _this.state.currentPage,
        filter: props.filter ? props.filter.toJS() : {},
        pageSize: _this.state.pageSize,
        sortedColumn: _this.state.sortedColumn,
        sortOrder: _this.state.sortOrder
      };
    };
  }

  /**
   * Timeout for firing ajax request
   *
   * @property timeout
   */

  _createClass(TableAjax, [{
    key: 'componentDidMount',

    /**
     * Request initial data on mount
     * @override
     *
     * @method componentDidMount
     * @return {Void}
     */
    value: function componentDidMount() {
      _get(Object.getPrototypeOf(TableAjax.prototype), 'componentDidMount', this).call(this);
      this.emitOnChangeCallback('data', this.emitOptions(), 0);
    }

    /**
     * Lifecycle for after a update has happened
     * Resize the grid to fit new content
     *
     * @method componentDidUpdate
     * @return {Void}
     */
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.resizeTable();
    }
  }, {
    key: 'pageSize',

    /**
     * Get pageSize for table
     * @override
     *
     * @method pageSize
     * @return {String} table page size
     */
    get: function get() {
      return this.state.pageSize;
    }

    /**
     * Returns the currently sorted column.
     *
     * @method sortedColumn
     * @return {String}
     */
  }, {
    key: 'sortedColumn',
    get: function get() {
      return this.state.sortedColumn;
    }

    /**
     * Returns the current sort order.
     *
     * @method sortOrder
     * @return {String}
     */
  }, {
    key: 'sortOrder',
    get: function get() {
      return this.state.sortOrder;
    }

    /**
     * Emit onChange event row data
     * @override
     *
     * @method emitOnChangeCallback
     * @param {String} element changed element
     * @param {Object} options base and updated options
     * @return {Void}
     */
  }, {
    key: 'pagerProps',

    /**
     * Props to pass to pager component
     * @override
     *
     * @method pagerProps
     * @return {Object} props
     */
    get: function get() {
      return {
        currentPage: this.state.currentPage,
        pageSize: this.state.pageSize,
        totalRecords: this.state.totalRecords,
        onPagination: this.onPagination,
        pageSizeSelectionOptions: this.props.pageSizeSelectionOptions,
        showPageSizeSelection: this.props.showPageSizeSelection
      };
    }
  }], [{
    key: 'propTypes',
    value: {
      /**
       * Data used to filter the data
       *
       * @property filter
       * @type {Object}
       */
      filter: _react2['default'].PropTypes.object,

      /**
       * Setting to true turns on pagination for the table
       *
       * @property paginate
       * @type {Boolean}
       */
      paginate: _react2['default'].PropTypes.bool,

      /**
       * Endpoint to fetch the data for table
       *
       * @property path
       * @type {String}
       */
      path: _react2['default'].PropTypes.string.isRequired
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      paginate: true
    },
    enumerable: true
  }, {
    key: 'childContextTypes',
    value: {
      /**
       * Defines a context object for child components of the table-ajax component.
       * https://facebook.github.io/react/docs/context.html
       *
       * @property childContextTypes
       * @type {Object}
       */
      attachActionToolbar: _react2['default'].PropTypes.func, // tracks the action toolbar component
      detachActionToolbar: _react2['default'].PropTypes.func, // tracks the action toolbar component
      attachToTable: _react2['default'].PropTypes.func, // attach the row to the table
      checkSelection: _react2['default'].PropTypes.func, // a function to check if the row is currently selected
      detachFromTable: _react2['default'].PropTypes.func, // detach the row from the table
      highlightable: _react2['default'].PropTypes.bool, // table can enable all rows to be highlightable
      onSort: _react2['default'].PropTypes.func, // a callback function for when a sort order is updated
      selectAll: _react2['default'].PropTypes.func, // a callback function for when all visible rows are selected
      selectRow: _react2['default'].PropTypes.func, // a callback function for when a row is selected
      highlightRow: _react2['default'].PropTypes.func, // a callback function for when a row is highlighted
      selectable: _react2['default'].PropTypes.bool, // table can enable all rows to be selectable
      sortOrder: _react2['default'].PropTypes.string, // the current sort order applied
      sortedColumn: _react2['default'].PropTypes.string // the currently sorted column
    },

    /**
     * Returns table object to child components.
     *
     * @method getChildContext
     * @return {void}
     */
    enumerable: true
  }]);

  return TableAjax;
})(_table.Table);

exports.TableAjax = TableAjax;
exports.TableRow = _table.TableRow;
exports.TableCell = _table.TableCell;
exports.TableHeader = _table.TableHeader;

/**
 * Clears the ajax timeout if present
 *
 * @method stopTimeout
 * @return {Void}
 */

/**
 * Handles what happens with response.
 *
 * @method handlerResponse
 * @param {Object} err
 * @param {Object} response
 */

/**
 * Formatted params for server request
 *
 * @method queryParams
 * @param {String} element changed element
 * @param {Object} options base and updated options
 * @return {Object} params for query
 */

/**
 * Base Options to be emitted by onChange
 * @override
 *
 * @method emitOptions
 * @return {Object} options to emit
 */