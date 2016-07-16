class GameState {
    constructor(state) {
        this.state = state;
    }
    toString() {
        return this.state;
    }
}

GameState.RUNNING  = new GameState('running');
GameState.HELP     = new GameState('help');
GameState.LOST     = new GameState('lost');


export default GameState;
