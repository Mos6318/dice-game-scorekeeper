# 🎲 Dice Game Scorekeeper

A beautiful, mobile-first web application for tracking scores in your family dice game. No more paper, no more math, no more arguments.

## Features

✅ **Up to 6 players** with individual score tables  
✅ **Real-time score calculation** with automatic totals  
✅ **Rule enforcement** - can't skip rows in Up/Down columns  
✅ **Predicted column** with pre-roll locking  
✅ **Figure bonuses** with one-roll multipliers  
✅ **Min/Max modifier** calculated automatically  
✅ **LocalStorage persistence** - games survive page refreshes  
✅ **Mobile-first design** - works perfectly on phones and tablets  
✅ **Premium dark theme** with smooth animations  

## How to Use

### Starting a Game

1. Open `index.html` in your browser
2. Enter the number of players (1-6)
3. Click "Start New Game"
4. Enter names for each player
5. Start playing!

### Scoring Rules

#### Columns

**Up Column (↑)**
- Fill rows from **top to bottom**
- Cannot skip rows
- Next available row is automatically enabled

**Down Column (↓)**
- Fill rows from **bottom to top**
- Cannot skip rows
- Next available row is automatically enabled

**Predicted Column (🎯)**
- Click a cell to **predict** it before rolling
- After rolling, enter the score or right-click to cross it out
- Each row can only be used once

**Free Column (✨)**
- Fill any row at any time
- No restrictions

#### Rows

**Number Rows** (Ones through Sixes)
- Score = sum of matching dice
- Example: Three 4s = 12 points

**Minimum**
- Score = sum of all five dice
- Aim for the lowest possible value

**Maximum**
- Score = sum of all five dice
- Aim for the highest possible value

**Column Modifier:**
```
(Maximum − Minimum) × number of ones in that column
```

**Figure Rows**

| Figure             | Condition                 | Bonus |
| ------------------ | ------------------------- | ----- |
| Small Straight (1-5) | 1,2,3,4,5                 | +5    |
| Big Straight (2-6) | 2,3,4,5,6                 | +10   |
| Full               | 3 of one + 2 of another   | +15   |
| Karta              | 4 of a kind + 1 different | +25   |
| Poker              | 5 of a kind               | +50   |

**Figure Scoring:**
```
Base dice sum × (2 if thrown in one roll, else 1) + bonus
```

**Important:** Check the "1 roll" box if you achieved the figure in a single roll to **double the base score** before adding the bonus.

### Controls

**Enter Score**
- Click a cell and type the score
- Press Enter to save

**Cross Out Row**
- Right-click a cell to cross it out (scores as 0)
- Useful for Predicted column failures

**One Roll Bonus**
- Check the "1 roll" box for figure rows achieved in a single roll
- This doubles the base dice sum before adding the bonus

**Reset Game**
- Click "Reset Game" to start over
- Confirms before deleting all data

## Technical Details

- **No dependencies** - pure HTML, CSS, and JavaScript
- **No build process** - just open and play
- **LocalStorage** - games are saved automatically
- **Responsive** - works on any screen size
- **Print-friendly** - can print score sheets if needed

## Browser Support

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## Tips

1. **Mobile users:** Tap a cell to enter scores, long-press to cross out
2. **Desktop users:** Right-click to cross out cells
3. **Predictions:** Make your prediction BEFORE rolling in the Predicted column
4. **One Roll:** Don't forget to check the box if you nail a figure in one roll!

## Game Flow Example

1. Player 1 rolls: 3, 3, 3, 4, 5 (sum = 18)
2. They have "Full" (three 3s, but only two other dice - not a full)
3. They decide to score it as "Threes" in the Up column
4. Enter "9" in the Threes/Up cell
5. The Up column automatically moves to the next row (Fours)
6. Column total updates automatically
7. Player total updates automatically

---

**Enjoy the game! May your rolls be lucky and your scores be high! 🎲**
