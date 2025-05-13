const OPEN = 1;
const CLOSE = 0;
const TOGGLE = 2;
const DO_NOTHING = -1;

const doors = convert(process.argv[2].split(''));
const target = convert(process.argv[3].split(''));
const orbs = process.argv.slice(4).map(x => convert(x.split('')));

const solutions = [];

for (let i = 0; i < orbs.length; i++) {
    if (orbs[i].length !== doors.length) {
        console.error(`Orb #${i+1} has wrong number of door associations - got ${orbs[i].length}, expected ${doors.length}`);
    }
}

for (let totalHits = 1; totalHits < 10; totalHits++) {
    console.log(`Checking combinations for ${totalHits} hit${totalHits !== 1 ? 's' : ''}`)
    const result = checkCombinations(totalHits, doors, []);

    if (solutions.length > 0) {
        console.log(solutions.map(x => " - " + x.join(", ")).join("\n"));
        console.log("")
        break;
    } else {
        console.log(" - No solutions found");
        console.log("")
    }
}

function checkCombinations(totalHits, fromState, combination) {
    if (totalHits === 0) {
        return;
    }

    for (let i = 0; i < orbs.length; i++) {
        const newState = hitOrb(fromState, i);

        if (isSame(fromState, newState)) {
            // Nothing changed, skip this branch
            continue;
        }

        if (isSame(newState, target)) {
            // Found solution
            solutions.push([...combination, i + 1]);

            // Don't check deeper but find other solutions for the same depth
            continue;
        }

        checkCombinations(totalHits - 1, newState, [...combination, i + 1]);
    }
}

function convert(stateArray) {
    return stateArray.map(x => {
        if (x === 'o') {
            return OPEN;
        } else if (x === 'c') {
            return CLOSE;
        } else if (x === 't') {
            return TOGGLE;
        } else {
            return DO_NOTHING;
        }
    })
}
function hitOrb(state, orbIndex) {
    const orb = orbs[orbIndex];

    return state.map((x, i) => mutate(x, orb[i]));
}

function mutate(state, mutation) {
    if (mutation === DO_NOTHING || state === mutation) {
        return state;
    } else if (state === CLOSE) {
        return mutation === OPEN || mutation === TOGGLE
            ? OPEN
            : CLOSE;
    } else if (state === OPEN) {
        return mutation === CLOSE || mutation === TOGGLE
            ? CLOSE
            : OPEN;
    }

    return state;
}

function isSame(left, right) {
    return left.join(":") === right.join(":");
}