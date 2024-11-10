const cells = [
  ["A1", "B1", "C1", "D1", "E1", "F1"],
  ["A2", "B2", "C2", "D2", "E2", "F2"],
  ["A3", "B3", "C3", "D3", "E3", "F3"],
  ["A4", "B4", "C4", "D4", "E4", "F4"],
  ["A5", "B5", "C5", "D5", "E5", "F5"],
  ["A6", "B6", "C6", "D6", "E6", "F6"]
];

const activeCell = { x: 0, y: 0 };

function moveActiveCell(key) {
  const activeCellId = cells[activeCell.y][activeCell.x];
  const activeCellInput = document
    .getElementById(activeCellId)
    .querySelector("input");

  if (
    key !== "Enter" &&
    activeCellInput.hasAttribute("data-edit-mode-sticky")
  ) {
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
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("selected");

    const cellInput = cell.querySelector("input");
    cellInput.readOnly = true;
    cellInput.removeAttribute("data-edit-mode-sticky");
    cellInput.blur();
  });

  const activeCellId = cells[activeCell.y][activeCell.x];
  const activeCellEl = document.getElementById(activeCellId);
  activeCellEl.classList.add("selected");
}

function enableEditMode(clearCell) {
  const activeCellId = cells[activeCell.y][activeCell.x];
  const activeCellInput = document
    .getElementById(activeCellId)
    .querySelector("input");

  if (clearCell && activeCellInput.readOnly) {
    activeCellInput.value = "";
    activeCellInput.removeAttribute("data-edit-mode-sticky");
  } else if (!clearCell) {
    activeCellInput.setAttribute("data-edit-mode-sticky", "true");
  }

  activeCellInput.previousElementSibling.classList.add("d-none");
  activeCellInput.classList.remove("hidden");
  activeCellInput.readOnly = false;
  activeCellInput.focus();
}

function clearCell() {
  const activeCellId = cells[activeCell.y][activeCell.x];
  const activeCellInput = document
    .getElementById(activeCellId)
    .querySelector("input");

  if (activeCellInput.readOnly) {
    activeCellInput.previousElementSibling.innerHTML = "";
    activeCellInput.value = "";
  }
}

function main() {
  renderActiveCell();

  document.querySelectorAll(".cell input").forEach((cellInput) => {
    cellInput.addEventListener("blur", () => {
      console.log(cellInput.parentElement.id);
      cellInput.previousElementSibling.innerHTML = cellInput.value;
      cellInput.previousElementSibling.classList.remove("d-none");
      cellInput.classList.add("hidden");
    });
  });

  window.addEventListener("keydown", (ev) => {
    console.log(ev.key);

    // Cell Navigation
    if (ev.key.startsWith("Arrow") || ev.key === "Enter") {
      moveActiveCell(ev.key);
      return;
    }

    if (
      ev.key.match(
        /^[a-zA-Z0-9`~!@#$%^&*\(\)\-\_\+\=\{\}\[\]\;\'\:\"\<\>\?\,\.\/\\\|]$/
      ) ||
      ev.key === "Backspace"
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
      return;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  main();
});
