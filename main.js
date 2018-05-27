'use strict';

const fs = require('fs');
const mdi = require('markdown-it')();
const md5 = require('md5');

const rawMock = fs.readFileSync('mock-tea-mat.md', 'utf8');

const parsedMock = mdi.parse(rawMock);

function seperateSyllabusIntro(parsedMD) {
    let syllabusIntro = [];
    let tempMD = parsedMD.slice(0);
    
    while (tempMD[0].tag !== 'h2') {
        syllabusIntro.push(tempMD[0]);
        tempMD = tempMD.slice(1);
    }

    return syllabusIntro;
}

function getSyllabusTitle(parsedMD) {
    return parsedMD[1].content;
}

function getSyllabusDescription(parsedMD) {
    if (parsedMD[0].tag === 'h2') {
        return '';
    }

    if (parsedMD[0].content !== '') {
        return parsedMD[0].content + getSyllabusDescription(parsedMD.slice(1));
    } else if (parsedMD[0].type.includes('open')) {
        return `<${parsedMD[0].tag}>` + getSyllabusDescription(parsedMD.slice(1));
    } else {
        return `</${parsedMD[0].tag}>` + getSyllabusDescription(parsedMD.slice(1));
    }
}

function seperateSyllabusWeeks(parsedMD) {
    let tempMD = parsedMD.slice(0);
    
    while (tempMD[0].tag !== 'h2') {
        tempMD.shift();
    }

    return tempMD;
}

function getWeekDescription(weekMD) {
    if (weekMD[0].type === 'table_open') {
        return '';
    }

    if (weekMD[0].content !== '') {
        return weekMD[0].content + getWeekDescription(weekMD.slice(1));
    } else if (weekMD[0].type.includes('open')) {
        return `<${weekMD[0].tag}>` + getWeekDescription(weekMD.slice(1));
    } else {
        return `</${weekMD[0].tag}>` + getWeekDescription(weekMD.slice(1));
    }
}

function groupWeeks(parsedWeeks) {
    return parsedWeeks.reduce(function(acc, value) {
        if (value.type === 'heading_open') {
            acc.push([]);
        }
        acc[acc.length - 1].push(value);
        return acc;
    }, [])
}

function getTableFromWeek(parsedWeek) {
    const tableOpen = parsedWeek.find(function(element) {
        return element.type === 'table_open';
    });

    const indexOfTableOpen = parsedWeek.indexOf(tableOpen);

    const parsedTable = parsedWeek.slice(indexOfTableOpen);

    return parsedTable;
}

function getWorkshopsFromTable(parsedTable) {
    const parsedTableData = parsedTable.filter(function(table) {
        return table.level === 4 && table.map === null;
    });

    const workshops = [];

    function urlRegex(urlMarkdownFormat) {
        const regex = /\[(.+)\]\((.+)\)/;
        const [_, title, url] = regex.exec(urlMarkdownFormat);
        return { title, url };
    }

    for (let i = 0; i < parsedTableData.length; i += 3) {
        workshops.push({
            index: parsedTableData[i].content,
            ...(urlRegex(parsedTableData[i + 1].content)),
            description: parsedTableData[i + 2].content
        });
    }

    return workshops;
}

function spongeParsedMarkdown(parsedMD, urlMD) {
    return {
        syllabus: {
            id: md5(urlMD).substr(0, 8),
            title: getSyllabusTitle(parsedMD),
            description: getSyllabusDescription(parsedMD.slice(3)),
            url: urlMD
        },
        weeks: groupWeeks(seperateSyllabusWeeks(parsedMD)).map(function(week) {
                return {
                    title: week[1].content,
                    description: getWeekDescription(week.slice(3)),
                    workshops: getWorkshopsFromTable((getTableFromWeek(week)))
                }
            })
    }    
}

console.dir(spongeParsedMarkdown(parsedMock, 'https://raw.githubusercontent.com/green-fox-academy/mock-teaching-materials/master/syllabus/modules/foundation/javascript.md?token=AhHGaKU9k9EPK_IdJr5LjY0yvAP21g6Sks5bBtJTwA%3D%3D'), { depth: null });

module.exports = {
    spongeParsedMarkdown: spongeParsedMarkdown,
    parsedMock: parsedMock,
    groupWeeks: groupWeeks,
    seperateSyllabusWeeks: seperateSyllabusWeeks,
    seperateSyllabusIntro: seperateSyllabusIntro,
    getTableFromWeek: getTableFromWeek
};