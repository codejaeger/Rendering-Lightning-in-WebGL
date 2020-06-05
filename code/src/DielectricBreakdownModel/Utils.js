
// calc distance b/w two points(3D)
export function distance(p1, p2) {
    return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2)
}

// src : https://gist.github.com/brannondorsey/dc4cfe00d6b124aebd3277159dcbdb14
// sample from probability
export function getSampleIndex(probs) {
    const sum = probs.reduce((a, b) => a + b, 0)
    if (sum <= 0) throw Error('probs must sum to a value greater than zero')
    const normalized = probs.map(prob => prob / sum)
    const sample = Math.random()
    let total = 0
    for (let i = 0; i < normalized.length; i++) {
        total += normalized[i]
        if (sample < total) return i
    }
}

export function potFuncForUnitCenteredCharge(pos,rad) {
    return (p) => {
        let r = distance(p, pos)
        return 1 - rad / r;
    }
}