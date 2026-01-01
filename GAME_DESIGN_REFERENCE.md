# Dice Game Scorekeeper - Game Design Reference

This document outlines the core logic, scoring rules, and mechanics of the Dice Game Scorekeeper application. It is intended to serve as a blueprint for recreating the game's functionality.

## 1. Game Grid Structure

The game consists of a grid where **Rows** represent dice combinations and **Columns** represent requirements for when/how those combinations can be filled.

### Columns (4 Total)
1.  **Down (↓)**: Must be filled strictly from top to bottom (Ones → Poker).
2.  **Up (↑)**: Must be filled strictly from bottom to top (Poker → Ones).
3.  **Predicted (🎯)**: The player must "declare" (select) this cell before filling it.
    *   *Implementation Note*: In this app, auto-prediction logic exists: focusing an empty predicted cell marks it as "predicted".
4.  **Free (✨)**: No restrictions. Can be filled in any order.

### Rows (13 Total)

#### Section 1: Numbers (1-6)
*   **Ones**
*   **Twos**
*   **Threes**
*   **Fours**
*   **Fives**
*   **Sixes**

#### Section 2: Min/Max
*   **Minimum**: Sum of 5 dice (aim for low).
*   **Maximum**: Sum of 5 dice (aim for high).

#### Section 3: Figures
*   **Small Straight (1-5)**: Dice showing 1, 2, 3, 4, 5.
*   **Big Straight (2-6)**: Dice showing 2, 3, 4, 5, 6.
*   **Full**: 3 of one number, 2 of another.
*   **Kareta** (4 of a Kind): 4 dice showing the same number.
*   **Poker** (5 of a Kind): 5 dice showing the same number.

---

## 2. Scoring Logic & Calculations

### A. Number Section (Ones - Sixes)
*   **Validation**: The entered value must be a multiple of the row's number.
    *   *Example*: For "Fours", valid inputs are 4, 8, 12, 16, 20.
    *   *Max*: 5 × Number (e.g., Max for Fours is 20).
*   **Cell Score**: Simply the value entered.

### B. Min/Max Section (The "Modifier")
This section calculates a special score based on the **Ones** count.

*   **Formula**: `(Maximum - Minimum) × Count of Ones`
*   **Requirement**: Both "Minimum" and "Maximum" fields must be filled for this calculation to apply. If either is empty, this section totals 0.
*   **Dependency**: This calculation relies on the value entered in the **Ones** row of the *same column*.

### C. Figures Section
Figures have a base sum, a fixed bonus, and a potential "One Roll" multiplier.

1.  **Fixed Bonuses**:
    *   **Straight (1-5)**: +5 points
    *   **Straight (2-6)**: +10 points
    *   **Full**: +15 points
    *   **Kareta**: +25 points
    *   **Poker**: +50 points

2.  **Calculation Formula**:
    ```text
    Base Score = Sum of Dice  (e.g., Poker of 5s = 25)
    
    If "One Roll" is checked:
       Score = Base Score × 2
    Else:
       Score = Base Score
       
    Final Cell Score = Score + Fixed Bonus
    ```
    *   *Note*: If the cell value is 0 (failed/crossed out), no bonus or multiplier applies.

---

---

## 3. Initialization & Setup

### Start Game Screen
*   **Player Count Input**: A number input field accepting values from **1 to 6**.
*   **Name Configuration**: Upon changing the player count, generate dynamic text inputs to let users customize player names (Default: "Player 1", "Player 2", etc.).
*   **Start Action**: Clicking "Start Game" hides the setup section, initializes the `gameState`, and renders the specific player grid layout.

### Game State Reset
*   **Reset Scores**: Clears all entered scores and progress but retains player names and count.
*   **New Game**: returns to the Setup screen to allow changing player count.

---

## 4. Layout & Responsive Design

The application uses a responsive numbering system to adjust the grid based on the player count:

### Container Widths
*   **Standard (2, 4 players)**: Max-width **1100px**.
*   **Expanded (3, 5, 6 players)**: Max-width **1600px**.
*   **Center Alignment**: The Header and Game Controls are always constrained to 1100px and centered, even in the expanded layout.

### Grid Configurations
1.  **2 Players**: 2 columns, side-by-side.
2.  **3 Players**: 3 columns in a single row (Wide layout).
3.  **4 Players**: 2x2 Grid (Standard layout).
4.  **5 Players**: 3 columns top row, 2 columns bottom row centered (Wide layout).
5.  **6 Players**: 2 rows of 3 columns (Wide layout).

---

## 5. UI/UX Rules

### Turn Logic
*   **Active Turn**: Only the current player's card is interactive (opacity 1.0, editable). Other cards are dimmed (opacity 0.6).
*   **End Turn**: Clicking "END TURN" advances the `currentPlayerIndex` to the next player.

### Input Constraints
*   **Cross Out**: Typing `X` or `x` marks a cell as crossed (value 0).
*   **Validation**: Inputs exceeding the maximum possible dice sum for that row are rejected (e.g., entering >30 for Sixes).
*   **Blocking**:
    *   **Down Column**: A cell is disabled unless it is the *next* empty row from the top.
    *   **Up Column**: A cell is disabled unless it is the *next* empty row from the bottom.

### Totals Display
1.  **Subtotals**: Displayed after Numbers, Min/Max, and Figures sections.
2.  **Columns (Grand Total)**: The sum of the three section totals for that column.
3.  **Player Total**: Sum of all 4 Column Totals.

---

## 6. Data Structure (JSON Model)

To recreate the state management, use a structure similar to this:

```json
{
  "playerCount": 2,
  "currentPlayerIndex": 0,
  "players": [
    {
      "name": "Player 1",
      "scores": {
        "down": { 
            "ones": { "value": 3, "crossed": false, "oneRoll": false, "predicted": false },
            ... 
        },
        "up": { ... },
        "predicted": { ... },
        "free": { ... }
      },
      "nextUpRow": 0,       // Tracks valid row index for Up column
      "nextDownRow": 12     // Tracks valid row index for Down column
    }
  ]
}
```
