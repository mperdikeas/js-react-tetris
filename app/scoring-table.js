class DropBonusAdjective {
    constructor(bonus, adjective) {
        this.bonus = bonus;
        this.adjective = adjective;
    }
}

const SHORTEST_DROP = 4;
function dropBonusFunction(drop) {
    if (drop < SHORTEST_DROP)
        return null;
    switch (drop) {
    case  4: return new DropBonusAdjective(  5, 'courageous');
    case  5: return new DropBonusAdjective( 10, 'adventurous');
    case  6: return new DropBonusAdjective( 20, 'bold');
    case  7: return new DropBonusAdjective( 30, 'daring');        
    case  8: return new DropBonusAdjective( 50, 'fearless');
    case  9: return new DropBonusAdjective( 80, 'audacious');
    case 10: return new DropBonusAdjective(120, 'dauntless');
    case 11: return new DropBonusAdjective(150, 'interpid');
    case 12: return new DropBonusAdjective(200, 'audacious');
    case 13:
    case 14:
    case 15: return new DropBonusAdjective(300, 'heroic');
    case 16:
    case 17:
    case 18:
    case 19:
    case 20: return new DropBonusAdjective(400, 'epic');
    default:
        throw new Error(`unhandled drop: ${drop}`);
        
    }
}

const scoringTable = new (class ScoringTable {

    constructor(eachLine, bonus2Lines, bonus3Lines, bonus4Lines, brickScraped, shortestDrop, dropBonusFunction) {
        this.eachLine = eachLine;
        this.bonus2Lines = bonus2Lines;
        this.bonus3Lines = bonus3Lines;
        this.bonus4Lines = bonus4Lines;
        this.brickScraped = brickScraped;
        this.shortestDrop = shortestDrop;
        this.dropBonusFunction = dropBonusFunction;
    }

    bonusForLineClearance(n) {
        switch (n) {
        case 2: return this.bonus2Lines;
        case 3: return this.bonus3Lines;
        case 4: return this.bonus4Lines;
        default: throw new Error(`Unhanlded case ${n}`);
        }
    }
})(500, 500, 1000, 2000, -10, SHORTEST_DROP, dropBonusFunction);



exports.scoringTable       = scoringTable;
