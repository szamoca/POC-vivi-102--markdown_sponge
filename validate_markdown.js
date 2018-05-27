'use strict';

const main = require('./main');

const spongeParsedMarkdown = main.spongeParsedMarkdown;
const parsedMock = main.parsedMock;
const groupWeeks = main.groupWeeks;
const seperateSyllabusWeeks = main.seperateSyllabusWeeks;
const seperateSyllabusIntro = main.seperateSyllabusIntro;
const getTableFromWeek = main.getTableFromWeek;
const mockUrl = 'https://raw.githubusercontent.com/green-fox-academy/mock-teaching-materials/master/syllabus/modules/foundation/javascript.md?token=AhHGaKU9k9EPK_IdJr5LjY0yvAP21g6Sks5bBtJTwA%3D%3D';

const allowedDescriptionTags = [
    'p',
    'ul',
    'li',
    'a'
];

function checkSyllabusHeading(parsedMD) {
    if (parsedMD[0].tag !== 'h1') {
        throw new Error('Markdown Structure Error: file must start with a single # as the syllabus h1 header');
    }
}

function checkMultipleHOnes(parsedMD) {
    let h1Objects = [];

    parsedMD.forEach(function(element, index) {
        if (element.tag === 'h1') {
            h1Objects.push(index);
        }
    });

    if (h1Objects.length > 3) {
        throw new Error('Markdown Structure Error: file should contain only one h1 element')
    }
}

function checkWeekEnding(parsedMD) {
    if (parsedMD[parsedMD.length - 1].type !== 'table_close') {
        throw new Error('Markdown Structure Error: each week\'s last element should be a table');
    }
}

function checkTableFormat(parsedTable) {
    const parsedTableData = parsedTable.filter(function(table) {
        return table.level === 4 && table.map === null;
    });

    for (let i = 0; i < parsedTableData.length; i += 3) {
        if (isNaN(parsedTableData[i].content)) {
            throw new Error('Markdown Structure Error: first element of table row must be an integer index');
        }
        if (!(/\[(.+)\]\((.+)\)/.test(parsedTableData[i + 1].content))) {
            throw new Error('Markdown Structure Error: second element of table row must be a title and a link URL')
        }
        if (typeof parsedTableData[i + 2].content !== 'string') {
            console.log(typeof parsedTableData[i + 2].content)
            throw new Error('Markdown Structure Error: third element of table row must be a description string')
        }
    }
}

function checkValidTags(parsedSection) {
    parsedSection.forEach(function(element) {
        if (element.tag !== '' && !(allowedDescriptionTags.includes(element.tag))) {
            throw new Error(`Markdown Structure Error: you have somehing in one of your descriptions that is not allowed - tag: ${element.tag}`);
        }
    });
}

function getWeekDescription(parsedWeek) {
    let tempWeek = parsedWeek.slice(3);
    let description = [];

    while (tempWeek[0].type !== 'table_open') {
        description.push(tempWeek[0]);
        tempWeek = tempWeek.slice(1);
    }

    return description;
} 

function validateMarkdown(parsedMD) {
    checkSyllabusHeading(parsedMD);
    checkMultipleHOnes(parsedMock);
    groupWeeks(seperateSyllabusWeeks(parsedMD)).some(function(week) {
        checkWeekEnding(week);
    });
    checkValidTags(seperateSyllabusIntro(parsedMD).slice(3));
    groupWeeks(seperateSyllabusWeeks(parsedMD)).forEach(week => checkValidTags(getWeekDescription(week)));
    groupWeeks(seperateSyllabusWeeks(parsedMD)).forEach(week => checkTableFormat(getTableFromWeek(week)));

    try {
        console.dir(main.spongeParsedMarkdown(parsedMock, mockUrl), { depth: null });
    }
    catch(e) {
        console.log(e.message);
    }
}

validateMarkdown(parsedMock);