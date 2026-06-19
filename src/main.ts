import './styles/global.css';
import { createGame } from './game/createGame';

// Initialize game
const game = createGame();

// Export for potential debugging
export { game };
