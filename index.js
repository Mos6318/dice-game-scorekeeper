// Game State
let gameState = {
  playerCount: 0,
  players: []
};

// Row definitions
const ROWS = [
  { id: 'ones', label: 'Ones', type: 'number' },
  { id: 'twos', label: 'Twos', type: 'number' },
  { id: 'threes', label: 'Threes', type: 'number' },
  { id: 'fours', label: 'Fours', type: 'number' },
  { id: 'fives', label: 'Fives', type: 'number' },
  { id: 'sixes', label: 'Sixes', type: 'number' },
  { id: 'minimum', label: 'Minimum', type: 'special' },
  { id: 'maximum', label: 'Maximum', type: 'special' },
  { id: 'bigStraight15', label: 'Small Straight (1-5)', shortLabel: 'Small Str. (1-5)', type: 'figure', bonus: 5 },
  { id: 'bigStraight26', label: 'Big Straight (2-6)', shortLabel: 'Big Str. (2-6)', type: 'figure', bonus: 10 },
  { id: 'full', label: 'Full', type: 'figure', bonus: 15 },
  { id: 'karta', label: 'Kareta', type: 'figure', bonus: 25 },
  { id: 'poker', label: 'Poker', type: 'figure', bonus: 50 }
];

const COLUMNS = ['up', 'down', 'predicted', 'free'];

// Initialize player state
function createPlayer(name) {
  const player = {
    name: name,
    scores: {}
  };

  // Initialize all cells
  COLUMNS.forEach(col => {
    player.scores[col] = {};
    ROWS.forEach(row => {
      player.scores[col][row.id] = {
        value: null,
        crossed: false,
        oneRoll: false,
        predicted: false
      };
    });
  });

  // Trackers removed in favor of dynamic calculation

  return player;
}

// DOM Elements
const playerCountInput = document.getElementById('playerCount');
const startGameBtn = document.getElementById('startGameBtn');
const playersGrid = document.getElementById('playersGrid');
const playerNamesContainer = document.getElementById('playerNamesContainer');
const setupSection = document.getElementById('setupSection');
const gameControls = document.getElementById('gameControls');
const newGameBtn = document.getElementById('newGameBtn');
const calculateScoresBtn = document.getElementById('calculateScoresBtn');
const resetScoresBtn = document.getElementById('resetScoresBtn');
const resultsSection = document.getElementById('resultsSection');
const standingsList = document.getElementById('standingsList');
const endTurnBtn = document.getElementById('endTurnBtn');

// Track whether scores are visible
let scoresVisible = false;

// Event Listeners
startGameBtn.addEventListener('click', startNewGame);
if (endTurnBtn) endTurnBtn.addEventListener('click', handleEndTurn);
if (newGameBtn) newGameBtn.addEventListener('click', showSetup);
if (calculateScoresBtn) calculateScoresBtn.addEventListener('click', toggleScores);
if (resetScoresBtn) resetScoresBtn.addEventListener('dblclick', resetScores);
playerCountInput.addEventListener('change', updatePlayerNameInputs);
playerCountInput.addEventListener('input', updatePlayerNameInputs);

// Load game state from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
  loadGameState();

  // Ensure currentPlayerIndex is initialized
  if (gameState.currentPlayerIndex === undefined) {
    gameState.currentPlayerIndex = 0;
  }

  if (gameState.playerCount > 0) {
    renderPlayers();
    showGameView();
  } else {
    showSetup();
  }
});

// Update player name input fields based on count
function updatePlayerNameInputs() {
  const count = parseInt(playerCountInput.value);

  if (isNaN(count) || count < 1 || count > 6) {
    playerNamesContainer.innerHTML = '';
    return;
  }

  playerNamesContainer.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    formGroup.innerHTML = `
      <label for="playerName${i}">Player ${i + 1} Name</label>
      <input 
        type="text" 
        id="playerName${i}" 
        placeholder="Enter name"
        value="Player ${i + 1}"
      >
    `;
    playerNamesContainer.appendChild(formGroup);
  }
}

// Start new game
function startNewGame() {
  const count = parseInt(playerCountInput.value);

  if (isNaN(count) || count < 1 || count > 6) {
    alert('Please enter a number between 1 and 6');
    return;
  }

  gameState.playerCount = count;
  gameState.players = [];

  for (let i = 0; i < count; i++) {
    const nameInput = document.getElementById(`playerName${i}`);
    const playerName = nameInput ? nameInput.value.trim() : '';
    gameState.players.push(createPlayer(playerName || `Player ${i + 1}`));
  }

  gameState.currentPlayerIndex = 0;

  saveGameState();
  renderPlayers();
  showGameView();
}

// Show setup section (hide game)
function showSetup() {
  if (setupSection) setupSection.style.display = 'block';
  if (gameControls) gameControls.style.display = 'none';
  playersGrid.innerHTML = '';
  updatePlayerNameInputs();

  // Pre-fill player names if they exist
  if (gameState.players.length > 0) {
    playerCountInput.value = gameState.players.length;
    updatePlayerNameInputs();
    setTimeout(() => {
      gameState.players.forEach((player, i) => {
        const nameInput = document.getElementById(`playerName${i}`);
        if (nameInput) nameInput.value = player.name;
      });
    }, 50);
  }
}

// Show game view (hide setup)
function showGameView() {
  if (setupSection) setupSection.style.display = 'none';
  if (gameControls) gameControls.style.display = 'flex';
}

// Reset scores but keep players
function resetScores() {
  gameState.players.forEach(player => {
    // Reset all scores
    COLUMNS.forEach(col => {
      ROWS.forEach(row => {
        player.scores[col][row.id] = {
          value: null,
          crossed: false,
          oneRoll: false,
          predicted: false
        };
      });
    });

    // Trackers removed
  });

  gameState.currentPlayerIndex = 0;


  saveGameState();
  renderPlayers();

  // Hide scores again after reset
  scoresVisible = false;
  if (calculateScoresBtn) calculateScoresBtn.textContent = 'Calculate';
}

// Toggle score visibility
// Toggle score visibility
function toggleScores() {
  scoresVisible = !scoresVisible;

  // Show/Hide results section
  if (resultsSection) {
    resultsSection.style.display = scoresVisible ? 'flex' : 'none';
    if (scoresVisible) {
      updateStandings();
    }
  }

  // Re-render to update player totals
  renderPlayers();

  // Update button text
  if (calculateScoresBtn) {
    calculateScoresBtn.textContent = scoresVisible ? 'Hide' : 'Calculate';
  }
}

// Update standings list
function updateStandings() {
  if (!standingsList) return;
  standingsList.innerHTML = '';

  // Calculate and sort scores
  const rankings = gameState.players.map((p, i) => ({
    name: p.name,
    score: calculatePlayerTotal(p),
    filled: countFilledFields(p) // Add filled count data
  })).sort((a, b) => b.score - a.score);

  rankings.forEach((player, index) => {
    const rank = index + 1;
    const isWinner = index === 0;

    const div = document.createElement('div');
    div.className = `standing-item ${isWinner ? 'winner' : ''}`;
    div.innerHTML = `
      <div class="standing-rank">#${rank}</div>
      <div class="standing-name">
        ${player.name}
        <span class="standing-filled">(${player.filled} filled)</span>
      </div>
      <div class="standing-score">${player.score}</div>
    `;
    standingsList.appendChild(div);
  });
}
// Render all players
function renderPlayers() {
  playersGrid.innerHTML = '';
  // Set attribute on body to allow parent container styling
  document.body.setAttribute('data-player-count', gameState.playerCount);

  gameState.players.forEach((player, index) => {
    const playerCard = createPlayerCard(player, index);
    playersGrid.appendChild(playerCard);
  });
}

// Create player card
function createPlayerCard(player, playerIndex) {
  const card = document.createElement('div');

  // Apply turn-based styling
  // Default to active if undefined (for safety) or strictly equal
  const isTurn = (gameState.currentPlayerIndex === undefined) || (gameState.currentPlayerIndex === playerIndex);

  card.className = `player-card ${isTurn ? 'active-turn' : 'inactive-turn'}`;

  // Disable interactions for inactive players
  if (!isTurn) {
    card.style.pointerEvents = 'none';
  }

  const total = calculatePlayerTotal(player);

  let endText = '—';
  if (scoresVisible) {
    // Calculate rank
    const allScores = gameState.players.map(p => calculatePlayerTotal(p));
    // Sort logic to find rank - handle ties? Assuming simple sort
    // We want the rank of THIS player's score
    const sortedScores = [...allScores].sort((a, b) => b - a);
    const rankIndex = sortedScores.indexOf(total);
    const rank = rankIndex + 1;

    // Ordinal suffix
    let suffix = 'th';
    if (rank % 10 === 1 && rank % 100 !== 11) suffix = 'st';
    else if (rank % 10 === 2 && rank % 100 !== 12) suffix = 'nd';
    else if (rank % 10 === 3 && rank % 100 !== 13) suffix = 'rd';

    endText = `${rank}${suffix}`;
  }

  card.innerHTML = `
    <div class="player-header">
      <input 
        type="text" 
        class="player-name-input" 
        value="${player.name}"
        data-player="${playerIndex}"
      >
      <div class="player-total">${endText}</div>
    </div>
    <table class="score-table">
      <thead>
        <tr>
          <th>Row</th>
          <th><span class="desktop-text">Down</span><span class="mobile-text">↓</span> ↓</th>
          <th><span class="desktop-text">Up</span><span class="mobile-text">↑</span> ↑</th>
          <th>Pred. 🎯</th>
          <th>Free ✨</th>
        </tr>
      </thead>
      <tbody>
        ${createTableBodyWithSubtotals(player, playerIndex)}
      </tbody>
      <tfoot>
        <tr class="grand-total-row">
          <td>Columns</td>
          ${COLUMNS.map(col => `<td class="column-grand-total">${calculateColumnTotal(player, col)}</td>`).join('')}
        </tr>
      </tfoot>
    </table>
  `;

  // Attach event listeners
  attachEventListeners(card, player, playerIndex);

  // Manual End Turn Button for Active Player
  if (isTurn) {
    const btn = document.createElement('button');
    btn.className = 'btn-player-end-turn';
    btn.textContent = 'END TURN';
    btn.title = 'Confirm & End Turn';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleEndTurn();
    });
    // Append to card (will be positioned absolutely)
    card.appendChild(btn);
  }

  return card;
}

// Create table body with subtotals after each section
function createTableBodyWithSubtotals(player, playerIndex) {
  let html = '';
  let rowIndex = 0;

  // Numbers section (Ones through Sixes)
  ROWS.filter(r => r.type === 'number').forEach(row => {
    html += createRowHTML(player, playerIndex, row, rowIndex);
    rowIndex++;
  });
  html += `
    <tr class="subtotal-row">
      <td>Total</td>
      ${COLUMNS.map(col => `<td class="column-subtotal">${calculateNumbersTotal(player, col)}</td>`).join('')}
    </tr>
  `;

  // Min/Max section
  ROWS.filter(r => r.type === 'special').forEach(row => {
    html += createRowHTML(player, playerIndex, row, rowIndex);
    rowIndex++;
  });
  html += `
    <tr class="subtotal-row">
      <td>Total</td>
      ${COLUMNS.map(col => `<td class="column-subtotal">${calculateMinMaxTotal(player, col)}</td>`).join('')}
    </tr>
  `;

  // Figures section
  ROWS.filter(r => r.type === 'figure').forEach(row => {
    html += createRowHTML(player, playerIndex, row, rowIndex);
    rowIndex++;
  });
  html += `
    <tr class="subtotal-row">
      <td>Total</td>
      ${COLUMNS.map(col => `<td class="column-subtotal">${calculateFiguresTotal(player, col)}</td>`).join('')}
    </tr>
  `;

  return html;
}

// Create row HTML
function createRowHTML(player, playerIndex, row, rowIndex) {
  const labelHTML = row.shortLabel
    ? `<span class="desktop-label">${row.label}</span><span class="mobile-label">${row.shortLabel}</span>`
    : row.label;

  return `
    <tr>
      <td>${labelHTML}</td>
      ${COLUMNS.map(col => createCellHTML(player, playerIndex, row, rowIndex, col)).join('')}
    </tr>
  `;
}

// Create cell HTML
function createCellHTML(player, playerIndex, row, rowIndex, column) {
  const cell = player.scores[column][row.id];
  const isDisabled = isCellDisabled(player, row, rowIndex, column);
  const cellId = `cell-${playerIndex}-${column}-${row.id}`;

  let cellClass = 'score-input';
  if (cell.crossed) cellClass += ' crossed';
  else if (cell.value !== null) cellClass += ' filled';
  if (cell.predicted) cellClass += ' predicted';
  if (cell.oneRoll) cellClass += ' one-roll';

  const displayValue = cell.crossed ? 'X' : (cell.value !== null ? cell.value : '');

  let cellHTML = `
    <td class="score-cell">
      <input 
        type="text" 
        class="${cellClass}"
        id="${cellId}"
        value="${displayValue}"
        ${isDisabled ? 'disabled' : ''}
        data-player="${playerIndex}"
        data-column="${column}"
        data-row="${row.id}"
        data-row-index="${rowIndex}"
        placeholder="-"
      >
  `;

  // Checkbox removed - using double-click on input instead
  cellHTML += `</td>`;
  return cellHTML;
}

// Check if cell should be disabled
function isCellDisabled(player, row, rowIndex, column) {
  const cell = player.scores[column][row.id];

  // Allow editing if the cell has a value or is crossed
  if (cell.value !== null || cell.crossed) {
    return false;
  }

  if (column === 'up') {
    return rowIndex !== getNextRequiredRowIndex(player, 'up');
  }

  if (column === 'down') {
    return rowIndex !== getNextRequiredRowIndex(player, 'down');
  }

  // Predicted and Free columns: always allow editing
  return false;
}

// Helper to find the next required row index for restricted columns
function getNextRequiredRowIndex(player, column) {
  if (column === 'up') {
    // Top to Bottom (0 -> end)
    for (let i = 0; i < ROWS.length; i++) {
      const cell = player.scores.up[ROWS[i].id];
      if (cell.value === null && !cell.crossed) return i;
    }
  } else if (column === 'down') {
    // Bottom to Top (end -> 0)
    for (let i = ROWS.length - 1; i >= 0; i--) {
      const cell = player.scores.down[ROWS[i].id];
      if (cell.value === null && !cell.crossed) return i;
    }
  }
  return -1; // All filled or invalid column
}

// Attach event listeners to inputs
function attachEventListeners(card, player, playerIndex) {
  // Player name input
  const nameInput = card.querySelector('.player-name-input');
  if (nameInput) {
    nameInput.addEventListener('change', (e) => {
      const newName = e.target.value.trim();
      if (newName) {
        gameState.players[playerIndex].name = newName;
        saveGameState();
      }
    });
  }

  // Score inputs
  const inputs = card.querySelectorAll('.score-input');
  inputs.forEach(input => {
    input.addEventListener('change', handleScoreInput);
    input.addEventListener('contextmenu', handleRightClick);
    input.addEventListener('focus', handleFocus);
    input.addEventListener('dblclick', handleOneRollDoubleClick);
  });
}

// Handle focus - auto-predict for Predicted column
function handleFocus(e) {
  const column = e.target.dataset.column;

  if (column === 'predicted') {
    const playerIndex = parseInt(e.target.dataset.player);
    const rowId = e.target.dataset.row;
    const player = gameState.players[playerIndex];
    const cell = player.scores[column][rowId];

    // Auto-predict when focusing on an empty cell
    if (!cell.predicted && cell.value === null && !cell.crossed) {
      cell.predicted = true;
      saveGameState();
      renderPlayers();
      // Re-focus the input after re-render
      setTimeout(() => {
        const input = document.getElementById(`cell-${playerIndex}-${column}-${rowId}`);
        if (input) input.focus();
      }, 50);
    }
  }
}

// Validate score input based on row rules
function validateScoreInput(rowId, value) {
  const dieValues = {
    ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, sixes: 6
  };

  if (dieValues[rowId]) {
    const dieVal = dieValues[rowId];

    if (value < 0) {
      alert('Score cannot be negative');
      return false;
    }

    if (value > dieVal * 5) {
      alert(`Maximum score for ${rowId} is ${dieVal * 5}`);
      return false;
    }

    if (value % dieVal !== 0 && value !== 0) {
      alert(`Score for ${rowId} must be a multiple of ${dieVal}`);
      return false;
    }
  }

  // Validate Straights
  if (rowId === 'bigStraight15' && value !== 0 && value !== 15) {
    alert('Small Straight (1-5) must be 15 or X');
    return false;
  }

  if (rowId === 'bigStraight26' && value !== 0 && value !== 20) {
    alert('Big Straight (2-6) must be 20 or X');
    return false;
  }

  return true;
}

// Handle score input
function handleScoreInput(e) {
  const playerIndex = parseInt(e.target.dataset.player);
  const column = e.target.dataset.column;
  const rowId = e.target.dataset.row;
  const value = e.target.value.trim();

  const player = gameState.players[playerIndex];
  const cell = player.scores[column][rowId];

  // Check if user typed 'X' or 'x' to cross out the cell
  if (value.toLowerCase() === 'x') {
    cell.crossed = true;
    cell.value = 0;

    saveGameState();
    renderPlayers();
    return;
  }

  // Parse value
  if (value === '' || value === '-') {
    cell.value = null;
    cell.crossed = false;
  } else {
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      alert('Please enter a valid number or "X" to cross out');
      e.target.value = cell.value !== null ? cell.value : '';
      return;
    }

    // Validate number rules
    if (!validateScoreInput(rowId, numValue)) {
      e.target.value = cell.value !== null ? cell.value : '';
      return;
    }

    cell.value = numValue;
    cell.crossed = false;


  }

  saveGameState();
  renderPlayers();
  if (scoresVisible) {
    updateStandings();
  }
}

// Handle right-click to cross out a cell
function handleRightClick(e) {
  e.preventDefault();

  const playerIndex = parseInt(e.target.dataset.player);
  const column = e.target.dataset.column;
  const rowId = e.target.dataset.row;
  const rowIndex = parseInt(e.target.dataset.rowIndex);

  const player = gameState.players[playerIndex];
  const cell = player.scores[column][rowId];

  // Don't allow crossing if already filled
  if (cell.value !== null) {
    return;
  }

  // Check if cell can be crossed based on column rules
  if (column === 'up' && rowIndex !== getNextRequiredRowIndex(player, 'up')) {
    alert('You can only cross the next available row in the Up column');
    return;
  }

  if (column === 'down' && rowIndex !== getNextRequiredRowIndex(player, 'down')) {
    alert('You can only cross the next available row in the Down column');
    return;
  }

  if (column === 'predicted' && !cell.predicted) {
    // Auto-predict before crossing
    cell.predicted = true;
  }

  if (confirm(`Cross out ${ROWS.find(r => r.id === rowId).label} in ${column} column?`)) {
    cell.crossed = true;
    cell.value = 0;



    saveGameState();
    renderPlayers();
    if (scoresVisible) {
      updateStandings();
    }
  }
}

// Handle double-click to toggle "One Roll" status (replacing checkbox)
function handleOneRollDoubleClick(e) {
  const playerIndex = parseInt(e.target.dataset.player);
  const column = e.target.dataset.column;
  const rowId = e.target.dataset.row;

  // Only applicable to Figure rows
  const row = ROWS.find(r => r.id === rowId);
  if (!row || row.type !== 'figure') return;

  const player = gameState.players[playerIndex];
  const cell = player.scores[column][rowId];

  // Toggle state
  cell.oneRoll = !cell.oneRoll;

  saveGameState();
  renderPlayers();
  if (scoresVisible) {
    updateStandings();
  }
}

// Calculate column total (sum of all subtotals)
function calculateColumnTotal(player, column) {
  return calculateNumbersTotal(player, column) +
    calculateMinMaxTotal(player, column) +
    calculateFiguresTotal(player, column);
}

// Calculate numbers total (Ones through Sixes only)
function calculateNumbersTotal(player, column) {
  let total = 0;

  ROWS.forEach(row => {
    if (row.type === 'number') {
      const cell = player.scores[column][row.id];
      if (cell.value !== null) {
        total += cell.value;
      }
    }
  });

  return total;
}

// Calculate Min/Max total (modifier only)
function calculateMinMaxTotal(player, column) {
  let minimum = null;
  let maximum = null;
  let onesCount = 0;

  ROWS.forEach(row => {
    const cell = player.scores[column][row.id];

    if (row.id === 'minimum' && cell.value !== null) {
      minimum = cell.value;
    }

    if (row.id === 'maximum' && cell.value !== null) {
      maximum = cell.value;
    }

    // Get ones count for modifier
    if (row.id === 'ones' && cell.value !== null) {
      onesCount = cell.value;
    }
  });

  // Return ONLY the modifier, not min + max + modifier
  if (minimum !== null && maximum !== null) {
    return (maximum - minimum) * onesCount;
  }

  return 0;
}

// Calculate figures total (Big Straights, Full, Karta, Poker)
function calculateFiguresTotal(player, column) {
  let total = 0;

  ROWS.forEach(row => {
    if (row.type === 'figure') {
      const cell = player.scores[column][row.id];
      if (cell.value !== null) {
        let score = cell.value;

        // Apply one-roll multiplier
        if (cell.oneRoll) {
          score = score * 2;
        }

        // Add bonus ONLY if score > 0 (failed attempts don't get bonus)
        if (cell.value > 0) {
          score = score + row.bonus;
        }

        total += score;
      }
    }
  });

  return total;
}

// Calculate player total
function calculatePlayerTotal(player) {
  let total = 0;
  COLUMNS.forEach(col => {
    total += calculateColumnTotal(player, col);
  });
  return total;
}

// Count filled fields for a player
function countFilledFields(player) {
  let count = 0;
  COLUMNS.forEach(col => {
    ROWS.forEach(row => {
      const cell = player.scores[col][row.id];
      if (cell.value !== null || cell.crossed) {
        count++;
      }
    });
  });
  return count;
}

// Save game state to localStorage
function saveGameState() {
  localStorage.setItem('diceGameState', JSON.stringify(gameState));
}

// Load game state from localStorage
function loadGameState() {
  const saved = localStorage.getItem('diceGameState');
  if (saved) {
    try {
      gameState = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load game state:', e);
      gameState = { playerCount: 0, players: [] };
    }
  }
}

// Handle End Turn button click
function handleEndTurn() {
  gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  saveGameState();
  renderPlayers();
}
