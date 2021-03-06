import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import TableCell from '../table-cell';
import TableHeader from '../table-header';
import Checkbox from '../../checkbox/checkbox';
import guid from '../../../utils/helpers/guid/guid';
import WithDrop from '../../drag-and-drop/with-drop/with-drop';
import DraggableTableCell from '../draggable-table-cell';
import { validProps } from '../../../utils/ether/ether';
import tagComponent from '../../../utils/helpers/tags/tags';

/**
 * A TableRow widget.
 *
 * == How to use a TableRow in a component:
 *
 * See documentation for Table component.
 *
 * If you add an onClick event to a Table Row, will display the cursor as a pointer
 * when hovering over the row.
 */
class TableRow extends React.Component {
  state = {
    /**
     * Internal state to track if the row is currently highlighted.
     */
    highlighted: false,

    /**
     * Internal state to track if the row is currently selected.
     */
    selected: false
  }

  componentWillMount() {
    if (this.context.dragDropManager) {
      if (this.props.as !== 'header' && this.props.index === undefined) {
        throw new Error('You need to provide an index for rows that are draggable');
      }
    }

    if (this.requiresUniqueID && !this.props.uniqueID) {
      throw new Error('A TableRow which is selectable or highlightable should provide a uniqueID.');
    }

    if (this.context.attachToTable && this.props.uniqueID && !this.props.selectAll && !this.isHeader) {
      // generate row id
      this.rowID = guid();
      // only attach to the table if we have a unique id
      this.context.attachToTable(this.rowID, this);
      // also check if row is already selected/highlighted
      this.context.checkSelection(this.props.uniqueID, this);
    }

    if (this.props.selected) {
      // if developer is controlling selected state - set it
      this.setState({ selected: true });
    }

    if (this.props.highlighted) {
      // if developer is controlling highlighted state - set it
      this.setState({ highlighted: true });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.uniqueID !== nextProps.uniqueID) {
      // if unique id has changed, check if the table has the new id as selected or not
      this.context.checkSelection(nextProps.uniqueID, this);
    }

    if (this.props.selected !== nextProps.selected) {
      // if developer is controlling selected state - set it
      this.setState({ selected: nextProps.selected });
    }

    if (this.props.highlighted !== nextProps.highlighted) {
      // if developer is controlling highlighted state - set it
      this.setState({ highlighted: nextProps.highlighted });
    }
  }

  componentWillUnmount() {
    if (this.context.detachFromTable) {
      this.context.detachFromTable(this.rowID);
    }
  }

  /**
   * Call the selectAll callback.
   */
  onSelectAll = () => {
    this.context.selectAll(this);
  }

  /**
   * Call the selectRow callback and call any custom event the developer may have set.
   */
  onRowClick = (...args) => {
    if (this.props.onHighlight) {
      // trigger onHighlight callback if defined
      this.props.onHighlight(this.props.uniqueID, !this.state.highlighted, this);
    } else {
      // trigger highlightRow method on the table
      this.context.highlightRow(this.props.uniqueID, this);
    }
    // trigger any custom onClick event the developer may have set
    if (this.props.onClick) { this.props.onClick(...args); }
  }

  /**
   * Call the selectRow callback.
   */
  onSelect = (ev) => {
    if (this.props.onSelect) {
      // trigger onSelect callback if defined
      this.props.onSelect(this.props.uniqueID, ev.target.value, this);
    } else {
      // trigger selectRow method on the table
      this.context.selectRow(this.props.uniqueID, this, !this.state.selected);
    }
  }

  /**
   * Classes to be applied to the table row component
   */
  get mainClasses() {
    const isDragIndexMatch = this.context.dragAndDropActiveIndex === this.props.index;
    return classNames(
      'carbon-table-row',
      this.props.className, {
        'carbon-table-row--clickable': this.props.onClick || this.props.highlightable || this.context.highlightable,
        'carbon-table-row--selected': this.state.selected,
        'carbon-table-row--highlighted': (this.state.highlighted && !this.state.selected),
        'carbon-table-row--dragged': (this.draggingIsOccurring() && isDragIndexMatch),
        'carbon-table-row--dragging': (this.draggingIsOccurring())
      }
    );
  }

  /**
   * Sets additional props to the row.
   */
  get rowProps() {
    const { ...props } = validProps(this);

    props.className = this.mainClasses;

    if (this.context.highlightable || this.props.highlightable) {
      props.onClick = this.onRowClick;
    }

    return props;
  }

  /**
   * Determines if the developer has flagged this row as a header.
   */
  get isHeader() {
    return this.props.as === 'header';
  }

  /**
   * Determines what kind of cell to render for the checkbox.
   */
  get multiSelectCell() {
    // renders a TableHeader if row is flagged as a header.
    const cell = this.isHeader ? TableHeader : TableCell;

    return React.createElement(cell, {
      key: 'select', className: 'carbon-table-cell--select'
    }, this.multiSelect);
  }

  /**
   * Returns the checkbox for the select action.
   */
  get multiSelect() {
    if (this.props.hideMultiSelect) { return null; }

    // determines which action to use (multi-select or select-all)
    const action = (this.props.selectAll || this.isHeader) ? this.onSelectAll : this.onSelect;

    return (
      <Checkbox
        onClick={ ev => ev.stopPropagation() }
        onChange={ action }
        checked={ this.state.selected }
      />
    );
  }

  /**
   * Determines if the row should have a multi select column.
   */
  get shouldHaveMultiSelectColumn() {
    // if component specifically disables selectable, don't put the cell in
    if (this.props.selectable !== false) {
      // if multi-seletable, add the checkbox cell
      if (this.props.selectAll || this.context.selectable || this.props.selectable) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determines if the row requires a unique ID.
   */
  get requiresUniqueID() {
    const highlightable = this.props.highlightable !== false
                          && (this.props.highlightable || this.context.highlightable),
        selectable = this.props.selectable !== false && (this.props.selectable || this.context.selectable);

    return highlightable || selectable;
  }

  /**
   * Determines if dragging is occurring within the current draggable context.
   */
  draggingIsOccurring = () => {
    return typeof this.context.dragAndDropActiveIndex === 'number';
  }

  /**
   * Returns a draggable cell if required.
   */
  renderDraggableCell = () => {
    if (!this.context.dragDropManager || this.isHeader) {
      return null;
    }

    return (
      <DraggableTableCell
        identifier={ this.props.dragAndDropIdentifier }
        draggableNode={ () => { return this._row; } }
        canDrag={ !this.props.hideDrag }
      />
    );
  }

  /**
   * Returns the row wrapped in draggable functionality if required.
   */
  renderDraggableRow = (row) => {
    if (!this.context.dragDropManager || this.isHeader) {
      return row;
    }

    return (
      <WithDrop
        identifier={ this.props.dragAndDropIdentifier }
        index={ this.props.index }
        canDrop={ () => { return !this.props.hideDrag; } }
      >
        { row }
      </WithDrop>
    );
  }

  /**
   * Renders the component
   */
  render() {
    const content = [this.props.children];

    if (this.shouldHaveMultiSelectColumn) {
      content.unshift(this.multiSelectCell);
    }

    return this.renderDraggableRow(
      <tr
        { ...this.rowProps }
        { ...tagComponent('table-row', this.props) }
        ref={ (node) => { this._row = node; } }
      >
        { this.renderDraggableCell() }

        { content }
      </tr>
    );
  }
}

TableRow.propTypes = {
  /**  Children elements */
  children: PropTypes.node,

  /** A custom class name for the component. */
  className: PropTypes.string,

  /** Allows developers to specify a callback after the row is clicked. */
  onClick: PropTypes.func,

  /** Enables multi-selectable table rows. */
  selectable: PropTypes.bool,

  /** Enables highlightable table rows. */
  highlightable: PropTypes.bool,

  /** Allows developers to manually control selected state for the row. */
  selected: PropTypes.bool,

  /** Allows developers to manually control highlighted state for the row. */
  highlighted: PropTypes.bool,

  /** Define a unique ID so the table can track the row (useful for highlightable or selectable rows). */
  uniqueID: PropTypes.string,

  /** What the row should be displayed as, set to 'header' to display as header */
  as: PropTypes.string,

  /** Whether to hide the multiSelect */
  hideMultiSelect: PropTypes.bool,

  /** Whether to select all */
  selectAll: PropTypes.bool,

  /** Callback for when a row is highlighted */
  onHighlight: PropTypes.func,

  /** Callback for when a row is selected */
  onSelect: PropTypes.func,

  /** Used if this row is within a draggable context */
  index: PropTypes.number,

  /** Optional to associate the drag and drag context. */
  dragAndDropIdentifier: PropTypes.string,

  /** Used to determine if line is empty or not */
  hideDrag: PropTypes.bool,

  /** Used to determine if line is dragged */
  dragged: PropTypes.bool,

  /** Used to determine if line is empty is dragging */
  dragging: PropTypes.func
};

TableRow.safeProps = ['onClick'];

TableRow.contextTypes = {
  attachToTable: PropTypes.func, // attach the row to the table
  detachFromTable: PropTypes.func, // detach the row from the table
  checkSelection: PropTypes.func, // a function to check if the row is currently selected
  highlightRow: PropTypes.func, // highlights the row
  selectAll: PropTypes.func, // a callback function for when all visible rows are selected
  highlightable: PropTypes.bool, // table can enable all rows to be highlightable
  selectable: PropTypes.bool, // table can enable all rows to be multi-selectable
  selectRow: PropTypes.func, // a callback function for when a row is selected
  dragDropManager: PropTypes.object, // the React DND DragDropManager
  dragAndDropActiveIndex: PropTypes.number // tracks the currently active index
};

export default TableRow;
