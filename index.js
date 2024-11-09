const cells = [
  ["A1", "B1", "C1", "D1", "E1", "F1"],
  ["A2", "B2", "C2", "D2", "E2", "F2"],
  ["A3", "B3", "C3", "D3", "E3", "F3"],
  ["A4", "B4", "C4", "D4", "E4", "F4"],
  ["A5", "B5", "C5", "D5", "E5", "F5"],
  ["A6", "B6", "C6", "D6", "E6", "F6"]
];

const cellMap = {
  A1: { y: 0, x: 0 },
  B1: { y: 0, x: 1 },
  C1: { y: 0, x: 2 },
  D1: { y: 0, x: 3 },
  E1: { y: 0, x: 4 },
  F1: { y: 0, x: 5 },
  A2: { y: 1, x: 0 },
  B2: { y: 1, x: 1 },
  C2: { y: 1, x: 2 },
  D2: { y: 1, x: 3 },
  E2: { y: 1, x: 4 },
  F2: { y: 1, x: 5 },
  A3: { y: 2, x: 0 },
  B3: { y: 2, x: 1 },
  C3: { y: 2, x: 2 },
  D3: { y: 2, x: 3 },
  E3: { y: 2, x: 4 },
  F3: { y: 2, x: 5 },
  A4: { y: 3, x: 0 },
  B4: { y: 3, x: 1 },
  C4: { y: 3, x: 2 },
  D4: { y: 3, x: 3 },
  E4: { y: 3, x: 4 },
  F4: { y: 3, x: 5 },
  A5: { y: 4, x: 0 },
  B5: { y: 4, x: 1 },
  C5: { y: 4, x: 2 },
  D5: { y: 4, x: 3 },
  E5: { y: 4, x: 4 },
  F5: { y: 4, x: 5 },
  A6: { y: 5, x: 0 },
  B6: { y: 5, x: 1 },
  C6: { y: 5, x: 2 },
  D6: { y: 5, x: 3 }
};

const activeCell = { x: 0, y: 0 };

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

function enableEditMode(clearCell) {
  const activeCellId = cells[activeCell.y][activeCell.x];
  const activeCellInput = document
    .getElementById(activeCellId)
    .querySelector("input");

  if (clearCell && activeCellInput.readOnly === true) {
    activeCellInput.value = "";
    activeCellInput.removeAttribute("data-edit-mode-sticky");
  } else if (!clearCell) {
    activeCellInput.setAttribute("data-edit-mode-sticky", "true");
  }

  activeCellInput.readOnly = false;
  activeCellInput.focus();
}

function main() {
  renderActiveCell();

  window.addEventListener("keydown", (ev) => {
    console.log(ev.key);

    // Cell Navigation
    if (ev.key.startsWith("Arrow") || ev.key === "Enter") {
      moveActiveCell(ev.key);
      return;
    }

    if (ev.key.match(/^[a-zA-Z0-9]$/)) {
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
  });
}

document.addEventListener("DOMContentLoaded", () => {
  main();
});
