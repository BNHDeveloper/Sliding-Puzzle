const SIZE = 4;
const TOTAL = SIZE * SIZE;
const board = document.querySelector("#puzzle-board");
const movesDisplay = document.querySelector("#moves");
const timerDisplay = document.querySelector("#timer");
const message = document.querySelector("#message");
const restartButton = document.querySelector("#restart-btn");

let tiles = [];
let moves = 0;
let seconds = 0;
let timerId = null;
let started = false;
let finished = false;

function solvedBoard() {
  // The last cell is the empty space. Tiles keep their original image index.
  return Array.from({ length: TOTAL - 1 }, (_, index) => index).concat(null);
}

function getEmptyIndex() {
  return tiles.indexOf(null);
}

function getNeighbours(index) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const neighbours = [];

  if (row > 0) neighbours.push(index - SIZE);
  if (row < SIZE - 1) neighbours.push(index + SIZE);
  if (col > 0) neighbours.push(index - 1);
  if (col < SIZE - 1) neighbours.push(index + 1);

  return neighbours;
}

function shuffleBoard() {
  tiles = solvedBoard();
  let previousEmpty = -1;

  // Shuffle with legal moves, so the puzzle is always solvable.
  for (let step = 0; step < 220; step++) {
    const empty = getEmptyIndex();
    let options = getNeighbours(empty).filter(index => index !== previousEmpty);
    if (options.length === 0) options = getNeighbours(empty);

    const chosen = options[Math.floor(Math.random() * options.length)];
    [tiles[empty], tiles[chosen]] = [tiles[chosen], tiles[empty]];
    previousEmpty = empty;
  }

  // Avoid starting in the solved state by chance.
  if (isSolved()) {
    const empty = getEmptyIndex();
    const chosen = getNeighbours(empty)[0];
    [tiles[empty], tiles[chosen]] = [tiles[chosen], tiles[empty]];
  }
}

function renderBoard() {
  board.innerHTML = "";

  tiles.forEach((tileValue, position) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = tileValue === null ? "tile empty" : "tile";
    button.setAttribute("aria-label",
      tileValue === null ? "Empty space" : `Image tile, position ${position + 1}`);
    button.disabled = tileValue === null || finished;

    if (tileValue !== null) {
      const originalRow = Math.floor(tileValue / SIZE);
      const originalCol = tileValue % SIZE;
      const x = (originalCol / (SIZE - 1)) * 100;
      const y = (originalRow / (SIZE - 1)) * 100;
      button.style.backgroundPosition = `${x}% ${y}%`;
      button.addEventListener("click", () => moveTile(position));
    }

    board.appendChild(button);
  });
}

function moveTile(position) {
  if (finished) return;

  const empty = getEmptyIndex();
  if (!getNeighbours(empty).includes(position)) return;

  startTimer();
  [tiles[empty], tiles[position]] = [tiles[position], tiles[empty]];
  moves++;
  movesDisplay.textContent = moves;
  renderBoard();

  if (isSolved()) {
    finishGame();
  } else {
    message.textContent = "Nice move! Keep rebuilding the image.";
  }
}

function isSolved() {
  return tiles.every((tile, index) =>
    index === TOTAL - 1 ? tile === null : tile === index
  );
}

function startTimer() {
  if (started || finished) return;
  started = true;
  timerId = window.setInterval(() => {
    seconds++;
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    timerDisplay.textContent = `${mins}:${secs}`;
  }, 1000);
}

function finishGame() {
  finished = true;
  window.clearInterval(timerId);
  renderBoard();
  message.textContent = `Image restored! You solved it in ${moves} moves and ${timerDisplay.textContent}.`;
  message.classList.add("win");
}

function restartGame() {
  window.clearInterval(timerId);
  moves = 0;
  seconds = 0;
  started = false;
  finished = false;
  movesDisplay.textContent = "0";
  timerDisplay.textContent = "00:00";
  message.textContent = "Tap a tile beside the empty space to move it.";
  message.classList.remove("win");
  shuffleBoard();
  renderBoard();
}

restartButton.addEventListener("click", restartGame);
restartGame();
