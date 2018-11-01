function isRowSelected(rowId) {
  const rows = this.selectStatus.find({ rowId }).fetch();
  return rows.length > 0;
}

function getSelectedRows() {
    const rows = this.selectStatus.find().fetch();
    return rows.map(row => row.rowId);
}

// Clear all selected studies
function doClearSelections() {
    this.selectStatus.remove({});
}

function doSelectRow($studyRow, data) {
    // Mark the current study as selected if it's not marked yet
    if (!isRowSelected.call(this, data._id)) {
        this.selectStatus.insert({ rowId: data.rowId });
    }


    // Set it as the previously selected row, so the user can use Shift to select from this point on
    this.$lastSelectedRow = $studyRow;
}

function doSelectSingleRow($studyRow, data) {
    // Clear all selected rows
    doClearSelections.call(this);

    // Add selected row to selection list
    doSelectRow.call(this, $studyRow, data);
}

function doUnselectRow($studyRow, data) {
    this.selectStatus.remove({ rowId: data.rowId });
}

function handleShiftClick($studyRow, data) {
    let study;
    let $previousRow = this.$lastSelectedRow;
    if ($previousRow && $previousRow.length > 0) {
        data = Blaze.getData($previousRow.get(0));
        if (!isRowSelected.call(this, data._id)) {
            $previousRow = $(); // undefined
            this.$lastSelectedRow = $previousRow;
        }
    }

    // Select all rows in between these two rows
    if ($previousRow.length) {
        let $rowsInBetween;
        if ($previousRow.index() < $studyRow.index()) {
            // The previously selected row is above (lower index) the
            // currently selected row.

            // Fill in the rows upwards from the previously selected row
            $rowsInBetween = $previousRow.nextAll('tr');
        } else if ($previousRow.index() > $studyRow.index()) {
            // The previously selected row is below the currently
            // selected row.

            // Fill in the rows upwards from the previously selected row
            $rowsInBetween = $previousRow.prevAll('tr');
        } else {
            // nothing to do since $previousRow.index() === $studyRow.index()
            // the user is shift-clicking the same row...
            return;
        }

        // Loop through the rows in between current and previous selected studies
        $rowsInBetween.each((index, row) => {
            const $row = $(row);

            // Retrieve the data context through Blaze
            const data = Blaze.getData(row);

            // If we find one that is already selected, do nothing
            if (isRowSelected.call(this, data._id)) return;

            // Set the current study as selected
            doSelectRow.call(this, $row, { rowId: data._id });

            // When we reach the currently clicked-on $row, stop the loop
            return !$row.is($studyRow);
        });
    } else {
        // Set the current study as selected
        doSelectSingleRow.call(this, $studyRow, { rowId: data._id });
    }
}

function handleCtrlClick($studyRow, data) {
    const handler = isRowSelected.call(this, data.rowId) ? doUnselectRow : doSelectRow;
    handler.call(this, $studyRow, data);
}

JF.ui.rowSelect = {
  isRowSelected,
  getSelectedRows,
  doClearSelections,
  doSelectRow,
  doSelectSingleRow,
  doUnselectRow,
  handleShiftClick,
  handleCtrlClick
}
