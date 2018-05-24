'use strict';

const main = require('./main');

const spongeParsedMarkdown = main.spongeParsedMarkdown;
const parsedMock = main.parsedMock;
const groupWeeks = main.groupWeeks;
const seperateSyllabusWeeks = main.seperateSyllabusWeeks;
const mockUrl = 'https://raw.githubusercontent.com/green-fox-academy/mock-teaching-materials/master/syllabus/modules/foundation/javascript.md?token=AhHGaKU9k9EPK_IdJr5LjY0yvAP21g6Sks5bBtJTwA%3D%3D';

// console.dir(spongeParsedMarkdown(parsedMock, 'https://kamu.com'), { depth: null });

const allowedDescriptionTags = [
    'p',
    'ul',
    'ol',
    'a'
];

function checkSyllabusHeading(parsedMD) {
    if (parsedMD[0].tag !== 'h1') {
        throw new Error('Markdown Structure Error: file must start with a single # as the syllabus h1 header');
    }
}

function checkWeekEnding(parsedMD) {
    if (parsedMD[parsedMD.length - 1].type !== 'table_close') {
        throw new Error('Markdown Structure Error: each week\'s last element should be a table');
    }
}

function validateMarkdown(parsedMD) {
    checkSyllabusHeading(parsedMD);
    groupWeeks(seperateSyllabusWeeks(parsedMD)).some(function(week) {
        checkWeekEnding(week);
    })

    try {
        console.dir(main.spongeParsedMarkdown(parsedMock, mockUrl), { depth: null });
    }
    catch(e) {
        console.log(e.message);
    }
}

validateMarkdown(parsedMock);