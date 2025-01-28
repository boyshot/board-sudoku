import React, { useState } from 'react';
import './App.css';

function App() {
  const [board, setBoard] = useState(generateEmptyBoard());
  const [level, setLevel] = useState(30);

  // Função para gerar um tabuleiro vazio
  function generateEmptyBoard() {
    return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
  }

  // Função para verificar se um número é válido em uma posição
  function isValid(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num || board[x][col] === num) {
        return false;
      }
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i + startRow][j + startCol] === num) {
          return false;
        }
      }
    }
    return true;
  }

  // Função para resolver o Sudoku usando backtracking
  function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solveSudoku(board)) {
                return true;
              }
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  // Função para gerar um Sudoku completo
  function generateCompleteSudoku() {
    const newBoard = generateEmptyBoard();
    for (let i = 0; i < 9; i += 3) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      nums.sort(() => Math.random() - 0.5);
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          newBoard[i + row][i + col] = nums.pop();
        }
      }
    }
    solveSudoku(newBoard);
    return newBoard;
  }

  // Função para remover números e criar o puzzle
  function generateSudokuPuzzle() {
    const completeBoard = generateCompleteSudoku();
    for (let i = 0; i < level; i++) {    
      zeroDistinctCells(completeBoard);
    }
    return completeBoard;
  }

  function zeroDistinctCells(board) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] !== 0) {
      board[row][col] = 0;
    } else {
      zeroDistinctCells(board);
    }
  }




  // Função para lidar com o clique no botão
  const handleGenerateSudoku = () => {
    const newSudoku = generateSudokuPuzzle();
    setBoard(newSudoku);
  };

  return (
    <div className="App">
      <h1>Gerador de Sudoku</h1>      
      <div className="sudoku-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="sudoku-row">
            {row.map((cell, colIndex) => (
              <div key={colIndex} className="sudoku-cell">
                {cell !== 0 ? cell : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
      <br></br>
      <label htmlFor="level">Dificuldade: {level < 40 ? "facil" : level > 40 && level < 51 ? "medio" : "dificil" }</label>
      <input type="range" min="30" max="60" value={level} onChange={(e) => setLevel(e.target.value)} />
      <br></br>
      <button onClick={handleGenerateSudoku}>Novo Sudoku</button>
    </div>
  );
}

export default App;