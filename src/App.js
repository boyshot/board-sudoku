import React, { useState, useCallback } from "react";
import "./App.css";

function generateEmptyBoard() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function isValid(board, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num || board[x][col] === num) return false;
  }
  const sr = Math.floor(row / 3) * 3;
  const sc = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (board[sr + i][sc + j] === num) return false;
  return true;
}

function solveSudoku(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        for (let n = 1; n <= 9; n++) {
          if (isValid(board, r, c, n)) {
            board[r][c] = n;
            if (solveSudoku(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generatePuzzle(level) {
  const board = generateEmptyBoard();
  for (let i = 0; i < 9; i += 3) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        board[i + r][i + c] = nums[r * 3 + c];
  }
  solveSudoku(board);

  let removed = 0;
  while (removed < level) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (board[r][c] !== 0) { board[r][c] = 0; removed++; }
  }
  return board;
}

function getCombinedBoard(puzzle, userBoard) {
  return puzzle.map((row, r) =>
    row.map((cell, c) => (cell !== 0 ? cell : userBoard[r][c] || 0))
  );
}

function App() {
  const [level, setLevel] = useState(30);
  const [puzzle, setPuzzle] = useState(() => generatePuzzle(30));
  const [userBoard, setUserBoard] = useState(() => Array.from({ length: 9 }, () => Array(9).fill(null)));
  const [selected, setSelected] = useState(null);
  const [gameWon, setGameWon] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);

  const startNewGame = useCallback((lvl) => {
    const newPuzzle = generatePuzzle(lvl ?? level);
    setPuzzle(newPuzzle);
    setUserBoard(Array.from({ length: 9 }, () => Array(9).fill(null)));
    setSelected(null);
    setGameWon(false);
    setConfirmQuit(false);
  }, [level]);

  function hasConflict(r, c, combined) {
    const val = combined[r][c];
    if (!val) return false;
    for (let x = 0; x < 9; x++) {
      if (x !== c && combined[r][x] === val) return true;
      if (x !== r && combined[x][c] === val) return true;
    }
    const sr = Math.floor(r / 3) * 3;
    const sc = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if ((sr + i !== r || sc + j !== c) && combined[sr + i][sc + j] === val) return true;
    return false;
  }

  function checkWin(newUserBoard) {
    const combined = getCombinedBoard(puzzle, newUserBoard);
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (!combined[r][c] || hasConflict(r, c, combined)) return false;
    return true;
  }

  function handleKeyDown(r, c, e) {
    if (puzzle[r][c] !== 0) return;
    const key = e.key;
    if (key >= "1" && key <= "9") {
      e.preventDefault();
      const newBoard = userBoard.map(row => [...row]);
      newBoard[r][c] = parseInt(key);
      setUserBoard(newBoard);
      if (checkWin(newBoard)) setGameWon(true);
    } else if (key === "Backspace" || key === "Delete") {
      e.preventDefault();
      const newBoard = userBoard.map(row => [...row]);
      newBoard[r][c] = null;
      setUserBoard(newBoard);
    }
  }

  function isHighlighted(r, c) {
    if (!selected) return false;
    const { row, col } = selected;
    return r === row || c === col ||
      (Math.floor(r / 3) === Math.floor(row / 3) && Math.floor(c / 3) === Math.floor(col / 3));
  }

  const combined = getCombinedBoard(puzzle, userBoard);
  const levelLabel = level < 40 ? "fácil" : level <= 50 ? "médio" : "difícil";

  return (
    <div className="App">
      <div className="titulo">
        <a className="link-wikipedia" target="_blank" href="https://pt.wikipedia.org/wiki/Sudoku" rel="noreferrer">
          Gerador de Sudoku
        </a>
      </div>

      <div className="sudoku-board">
        {combined.map((row, r) => (
          <div key={r} className="sudoku-row">
            {row.map((cell, c) => {
              const isFixed = puzzle[r][c] !== 0;
              const isSelected = selected?.row === r && selected?.col === c;
              const conflict = hasConflict(r, c, combined);
              const highlighted = isHighlighted(r, c);

              const classes = ["sudoku-cell",
                isFixed ? "cell-fixed" : "cell-editable",
                isSelected ? "cell-selected" : highlighted ? "cell-highlight" : "",
                conflict && !isFixed ? "cell-error" : "",
              ].filter(Boolean).join(" ");

              return (
                <div
                  key={c}
                  className={classes}
                  tabIndex={isFixed ? -1 : 0}
                  onClick={() => !isFixed && setSelected({ row: r, col: c })}
                  onFocus={() => !isFixed && setSelected({ row: r, col: c })}
                  onKeyDown={(e) => handleKeyDown(r, c, e)}
                >
                  {cell || ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="label-dificuldade">
        <label htmlFor="level">Dificuldade: {levelLabel}</label>
        <input
          type="range" min="30" max="60" value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
        />
      </div>

      <div className="botoes">
        <button className="botao-arredondado" onClick={() => startNewGame()}>
          Novo Sudoku
        </button>

        {!confirmQuit ? (
          <button className="botao-arredondado botao-desistir" onClick={() => setConfirmQuit(true)}>
            Desistir
          </button>
        ) : (
          <div className="confirm-quit">
            <span>Tem certeza?</span>
            <button className="botao-arredondado botao-confirmar" onClick={() => startNewGame()}>Sim</button>
            <button className="botao-arredondado" onClick={() => setConfirmQuit(false)}>Não</button>
          </div>
        )}
      </div>

      {gameWon && (
        <div className="overlay">
          <div className="win-panel">
            <div className="win-emoji">🎉</div>
            <h2>Parabéns!</h2>
            <p>Você completou o Sudoku!</p>
            <button className="botao-arredondado" onClick={() => startNewGame()}>
              Novo Jogo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
