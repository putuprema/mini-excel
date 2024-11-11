const cells = [
  ["A1", "B1", "C1", "D1", "E1", "F1"],
  ["A2", "B2", "C2", "D2", "E2", "F2"],
  ["A3", "B3", "C3", "D3", "E3", "F3"],
  ["A4", "B4", "C4", "D4", "E4", "F4"],
  ["A5", "B5", "C5", "D5", "E5", "F5"],
  ["A6", "B6", "C6", "D6", "E6", "F6"],
];

const activeCell = { x: 0, y: 0 };

/**
 * Key = Cell ID that is being referenced by other cells
 *
 * Value = Set of Cell IDs that are referencing the key cell
 *
 * @type {{[cellId: string]: Set<string>}}
 * @example { "A1": ["C1", "C2", "C3"] }
 */
const cellDependants = {};

function getActiveCellElement() {
  return document.getElementById(cells[activeCell.y][activeCell.x]);
}

/**
 * Gets the container that displays the evaluated cell value
 * @param {HTMLElement} parentCellElement 
 */
function getCellDisplayValueElement(parentCellElement) {
  return parentCellElement.querySelector(".cell-display-value");
}

/**
 * Gets the cell's input element that stores the raw cell value
 * @param {HTMLElement} parentCellElement 
 */
function getCellInputElement(parentCellElement) {
  return parentCellElement.querySelector("input");
}

function moveActiveCell(key) {
  const activeCellInput = getCellInputElement(getActiveCellElement());

  if (key !== "Enter" && activeCellInput.hasAttribute("data-edit-mode-sticky")) {
    return;
  }

  if (key === "ArrowRight") {
    activeCell.x = Math.min(activeCell.x + 1, cells[activeCell.y].length - 1);
  } else if (key === "ArrowLeft") {
    activeCell.x = Math.max(activeCell.x - 1, 0);
  } else if (key === "ArrowDown" || key === "Enter") {
    activeCell.y = Math.min(activeCell.y + 1, cells.length - 1);
  } else if (key === "ArrowUp") {
    activeCell.y = Math.max(activeCell.y - 1, 0);
  }

  renderActiveCell();
}

function renderActiveCell() {
  // Lock and blur the rest of the cells
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("selected");

    const cellInput = getCellInputElement(cell);
    cellInput.readOnly = true;
    cellInput.removeAttribute("data-edit-mode-sticky");
    cellInput.blur();
  });

  // Mark current cell as active
  const activeCellEl = getActiveCellElement();
  activeCellEl.classList.add("selected");
}

function enableEditMode(clearCell) {
  const activeCellEl = getActiveCellElement();
  const activeCellDisplayValue = getCellDisplayValueElement(activeCellEl);
  const activeCellInput = getCellInputElement(activeCellEl);

  if (clearCell && activeCellInput.readOnly) {
    activeCellInput.value = "";
    activeCellInput.removeAttribute("data-edit-mode-sticky");
  } else if (!clearCell) {
    activeCellInput.setAttribute("data-edit-mode-sticky", "true");
  }

  activeCellDisplayValue.classList.add("d-none");
  activeCellInput.classList.remove("hidden");
  activeCellInput.readOnly = false;
  activeCellInput.focus();
}

function clearCell() {
  const activeCellInput = getCellInputElement(getActiveCellElement());
  if (activeCellInput.readOnly) {
    activeCellInput.previousElementSibling.innerHTML = "";
    activeCellInput.value = "";
  }
}

/**
 * Evalutes the cell formula and return the result
 * @param {string} formula
 * @returns {string}
 */
function evaluateCell(formula) {
  formula = formula.replaceAll("=", "");

  let variables = new Set(formula.match(/([A-Z][0-9]+)/g));
  for (const variable of variables) {
    const variableValue = getCellInputElement(document.getElementById(variable)).value;

    if (variableValue.startsWith("=")) {
      formula = formula.replaceAll(variable, evaluateCell(variableValue));
    } else {
      formula = formula.replaceAll(variable, variableValue);
    }
  }

  return eval(formula);
}

/**
 * Evaluates all cells that are referencing the {@link cellId}
 * @param {string} cellId 
 */
function evaluateDependants(cellId) {
  /**
   * All cell IDs that are referencing the {@link cellId}
   * @type {Set<string>}
   */
  const dependantCellIds = cellDependants[cellId];
  if (dependantCellIds) {
    for (var cellId of dependantCellIds) {
      const cellEl = document.getElementById(cellId);
      const cellInputVal = getCellInputElement(cellEl).value;

      // If the cell value is a formula, evaluate the formula,
      // then apply the dependencies recursively
      if (cellInputVal.startsWith("=")) {
        getCellDisplayValueElement(cellEl).innerHTML = evaluateCell(cellInputVal);
        evaluateDependants(cellId);
      }
    }
  }
}

function renderCellsWithFormulaSection() {
  const cellsWithFormulaSection = document.getElementById("cellsWithFormula");
  cellsWithFormulaSection.innerHTML = "";

  const cellInputs = document.querySelectorAll(".cell input");
  for (const cellInput of cellInputs) {
    if (cellInput.value.startsWith("=")) {
      const formula = cellInput.value.replaceAll("=", "");
      const p = document.createElement("p");
      p.innerHTML = `<b>${cellInput.parentElement.id}</b> <span class="mx-1">⟶</span> ${formula}`;
      cellsWithFormulaSection.appendChild(p);
    }
  }
}

function main() {
  renderActiveCell();

  // Keyboard Navigation
  window.addEventListener("keydown", (ev) => {
    if (ev.key.startsWith("Arrow") || ev.key === "Enter") {
      moveActiveCell(ev.key);
      return;
    }
    if (
      ev.key === "Backspace" ||
      ev.key.match(/^[a-zA-Z0-9`~!@#$%^&*\(\)\-\_\+\=\{\}\[\]\;\'\:\"\<\>\?\,\.\/\\\|]$/)
    ) {
      enableEditMode(true);
      return;
    }
    if (ev.key === "F2") {
      enableEditMode(false);
      return;
    }
    if (ev.key === "Escape") {
      renderActiveCell();
      return;
    }
    if (ev.key === "Delete") {
      clearCell();
      renderCellsWithFormulaSection();
      return;
    }
  });

  // Handler when a cell is out of focus
  document.querySelectorAll(".cell").forEach((cell) => {
    const cellDisplayValueEl = getCellDisplayValueElement(cell);
    const cellInput = getCellInputElement(cell);
    cellInput.addEventListener("blur", () => {
      /**
       * @type {string}
       */
      let inputVal = cellInput.value;

      // Formula cell
      if (inputVal.startsWith("=")) {
        // Update the map of cell dependants
        let variables = inputVal.match(/([A-Z][0-9]+)/g);
        for (const variable of variables) {
          cellDependants[variable] = cellDependants[variable] ?? new Set();
          cellDependants[variable].add(cellInput.parentElement.id);
        }

        // Evaluate this cell's formula
        cellDisplayValueEl.innerHTML = evaluateCell(inputVal);
      } 
      // Non-formula cell
      else {
        cellDisplayValueEl.innerHTML = cellInput.value;
      }

      evaluateDependants(cellInput.parentElement.id);
      cellDisplayValueEl.classList.remove("d-none");
      cellInput.classList.add("hidden");

      renderCellsWithFormulaSection();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  main();
});
