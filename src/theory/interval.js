"use strict";
/**
 * Intervals — the distance between two notes, measured two ways at once:
 * how many letter names it spans (the "number") and how many semitones it
 * covers (which decides the "quality").
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LETTER_SEMITONE_TABLE = exports.SIMPLE_INTERVALS = exports.INTERVAL_REFERENCES = void 0;
exports.interval = interval;
exports.intervalBetween = intervalBetween;
exports.transpose = transpose;
exports.transposeDown = transposeDown;
exports.intervalName = intervalName;
exports.intervalAbbr = intervalAbbr;
exports.parseInterval = parseInterval;
exports.simplify = simplify;
exports.invert = invert;
exports.consonance = consonance;
exports.intervalFromSemitones = intervalFromSemitones;
const pitch_1 = require("./pitch");
/** Numbers that take perfect/aug/dim rather than major/minor. */
const PERFECT_NUMBERS = [1, 4, 5];
const QUALITY_ABBR = {
    perfect: 'P',
    major: 'M',
    minor: 'm',
    augmented: 'A',
    diminished: 'd',
    'doubly-augmented': 'AA',
    'doubly-diminished': 'dd',
};
const SIMPLE_SEMITONES = [0, 2, 4, 5, 7, 9, 11];
function isPerfectNumber(simpleNumber) {
    return PERFECT_NUMBERS.includes(simpleNumber);
}
/** Semitone size of the major or perfect version of an interval number. */
function baseSemitones(number) {
    const octaves = Math.floor((number - 1) / 7);
    const simple = (0, pitch_1.mod)(number - 1, 7);
    return octaves * 12 + SIMPLE_SEMITONES[simple];
}
function qualityFromDeviation(number, deviation) {
    const simple = (0, pitch_1.mod)(number - 1, 7) + 1;
    if (isPerfectNumber(simple)) {
        switch (deviation) {
            case 0:
                return 'perfect';
            case 1:
                return 'augmented';
            case -1:
                return 'diminished';
            case 2:
                return 'doubly-augmented';
            case -2:
                return 'doubly-diminished';
        }
    }
    else {
        switch (deviation) {
            case 0:
                return 'major';
            case -1:
                return 'minor';
            case 1:
                return 'augmented';
            case -2:
                return 'diminished';
            case 2:
                return 'doubly-augmented';
            case -3:
                return 'doubly-diminished';
        }
    }
    return deviation > 0 ? 'doubly-augmented' : 'doubly-diminished';
}
function deviationFromQuality(number, quality) {
    const simple = (0, pitch_1.mod)(number - 1, 7) + 1;
    const perfect = isPerfectNumber(simple);
    switch (quality) {
        case 'perfect':
            return 0;
        case 'major':
            return 0;
        case 'minor':
            return -1;
        case 'augmented':
            return 1;
        case 'diminished':
            return perfect ? -1 : -2;
        case 'doubly-augmented':
            return 2;
        case 'doubly-diminished':
            return perfect ? -2 : -3;
    }
}
function interval(number, quality) {
    return {
        number,
        quality,
        semitones: baseSemitones(number) + deviationFromQuality(number, quality),
    };
}
/** The interval from `low` to `high`, correctly spelled. */
function intervalBetween(low, high) {
    const letterDistance = (high.octave - low.octave) * 7 + (high.letter - low.letter);
    const number = letterDistance + (letterDistance >= 0 ? 1 : -1);
    const semitones = (0, pitch_1.toMidi)(high) - (0, pitch_1.toMidi)(low);
    const absNumber = Math.abs(number);
    const deviation = Math.abs(semitones) - baseSemitones(absNumber);
    return {
        number: absNumber,
        quality: qualityFromDeviation(absNumber, deviation),
        semitones: Math.abs(semitones),
    };
}
/** Apply an interval upward from a note, preserving spelling. */
function transpose(n, iv) {
    return (0, pitch_1.shiftNote)(n, iv.number - 1, iv.semitones);
}
/** Apply an interval downward. */
function transposeDown(n, iv) {
    return (0, pitch_1.shiftNote)(n, -(iv.number - 1), -iv.semitones);
}
const ORDINALS = [
    'unison',
    'second',
    'third',
    'fourth',
    'fifth',
    'sixth',
    'seventh',
    'octave',
    'ninth',
    'tenth',
    'eleventh',
    'twelfth',
    'thirteenth',
    'fourteenth',
    'fifteenth',
];
function intervalName(iv) {
    const ordinal = ORDINALS[iv.number - 1] ?? `${iv.number}th`;
    const quality = iv.quality === 'doubly-augmented'
        ? 'doubly augmented'
        : iv.quality === 'doubly-diminished'
            ? 'doubly diminished'
            : iv.quality;
    return `${quality} ${ordinal}`;
}
function intervalAbbr(iv) {
    return `${QUALITY_ABBR[iv.quality]}${iv.number}`;
}
/** Parse "P5", "m3", "A4", "M13". */
function parseInterval(input) {
    const match = /^(dd|d|m|M|P|A|AA)(\d{1,2})$/.exec(input.trim());
    if (!match)
        return null;
    const number = parseInt(match[2], 10);
    const simple = (0, pitch_1.mod)(number - 1, 7) + 1;
    const perfect = isPerfectNumber(simple);
    const map = {
        P: 'perfect',
        M: 'major',
        m: 'minor',
        A: 'augmented',
        d: 'diminished',
        AA: 'doubly-augmented',
        dd: 'doubly-diminished',
    };
    const quality = map[match[1]];
    // "M5" and "P3" are not real intervals; reject rather than silently coerce.
    if (perfect && (quality === 'major' || quality === 'minor'))
        return null;
    if (!perfect && quality === 'perfect')
        return null;
    return interval(number, quality);
}
/** Compound intervals (9ths, 13ths) reduced to within one octave. */
function simplify(iv) {
    if (iv.number <= 8)
        return iv;
    const number = (0, pitch_1.mod)(iv.number - 1, 7) + 1;
    return interval(number, iv.quality);
}
/** Interval inversion: a major third inverts to a minor sixth. */
function invert(iv) {
    const simple = simplify(iv);
    const number = 9 - (simple.number === 8 ? 8 : simple.number);
    const inverted = {
        perfect: 'perfect',
        major: 'minor',
        minor: 'major',
        augmented: 'diminished',
        diminished: 'augmented',
        'doubly-augmented': 'doubly-diminished',
        'doubly-diminished': 'doubly-augmented',
    };
    return interval(number === 0 ? 1 : number, inverted[simple.quality]);
}
function consonance(iv) {
    const s = (0, pitch_1.mod)(iv.semitones, 12);
    if ([0, 7].includes(s))
        return 'perfect consonance';
    if (s === 5)
        return 'perfect consonance'; // perfect fourth, contextually
    if ([3, 4, 8, 9].includes(s))
        return 'imperfect consonance';
    return 'dissonance';
}
/**
 * Reference songs whose opening leap is the interval — the single most
 * effective mnemonic device in ear training.
 */
exports.INTERVAL_REFERENCES = {
    0: { up: 'Same note', down: 'Same note', colour: 'Total rest — no tension at all.' },
    1: {
        up: 'Jaws — the two-note theme',
        down: 'Für Elise — the opening trill',
        colour: 'Claustrophobic, grinding. The smallest step in Western music.',
    },
    2: {
        up: 'Happy Birthday — "Hap-py"',
        down: 'Mary Had a Little Lamb',
        colour: 'Neutral and stepwise. The default motion of melody.',
    },
    3: {
        up: 'Greensleeves — "A-las"',
        down: 'Hey Jude — "Hey Jude"',
        colour: 'Soft sadness. The interval that makes a chord minor.',
    },
    4: {
        up: 'When the Saints Go Marching In',
        down: 'Beethoven’s 5th — the famous drop',
        colour: 'Bright, open, confident. The interval that makes a chord major.',
    },
    5: {
        up: 'Here Comes the Bride',
        down: 'Eine Kleine Nachtmusik',
        colour: 'Hollow and heraldic. Sturdy but slightly unresolved.',
    },
    6: {
        up: 'The Simpsons — "The Simp-sons"',
        down: 'Even Flow (Pearl Jam) riff',
        colour: 'The tritone. Unstable, restless, the engine of tension.',
    },
    7: {
        up: 'Twinkle Twinkle Little Star',
        down: 'The Flintstones theme',
        colour: 'The most stable interval after the octave. Power chords live here.',
    },
    8: {
        up: 'Love Story (Where Do I Begin)',
        down: 'Five for Fighting — Superman',
        colour: 'Yearning, cinematic, a little noir.',
    },
    9: {
        up: 'My Bonnie Lies Over the Ocean',
        down: 'Nobody Knows the Trouble I’ve Seen',
        colour: 'Warm, nostalgic, wide open.',
    },
    10: {
        up: 'Somewhere (West Side Story)',
        down: 'An American in Paris',
        colour: 'Bluesy and unresolved. The top of a dominant 7th chord.',
    },
    11: {
        up: 'Take On Me — the chorus leap',
        down: 'I Love You (Cole Porter)',
        colour: 'Aching, cinematic reach. One semitone short of home.',
    },
    12: {
        up: 'Somewhere Over the Rainbow',
        down: 'Willow Weep for Me',
        colour: 'The same note, a whole world higher. Pure identity.',
    },
};
/** The twelve simple intervals with canonical spellings, for drills and charts. */
exports.SIMPLE_INTERVALS = [
    interval(1, 'perfect'),
    interval(2, 'minor'),
    interval(2, 'major'),
    interval(3, 'minor'),
    interval(3, 'major'),
    interval(4, 'perfect'),
    interval(4, 'augmented'),
    interval(5, 'perfect'),
    interval(6, 'minor'),
    interval(6, 'major'),
    interval(7, 'minor'),
    interval(7, 'major'),
    interval(8, 'perfect'),
];
/** Look up the canonical simple interval for a semitone count. */
function intervalFromSemitones(semitones) {
    const octaves = Math.floor(semitones / 12);
    const simple = (0, pitch_1.mod)(semitones, 12);
    const found = exports.SIMPLE_INTERVALS.find((iv) => iv.semitones === simple) ?? exports.SIMPLE_INTERVALS[0];
    if (octaves === 0)
        return found;
    return {
        number: found.number + octaves * 7,
        quality: found.quality,
        semitones,
    };
}
/** Every letter-name distance is also a semitone distance; expose the table. */
exports.LETTER_SEMITONE_TABLE = pitch_1.LETTER_SEMITONES;
