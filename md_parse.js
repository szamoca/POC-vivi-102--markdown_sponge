'use strict';

const fs = require('fs');
const md = require('markdown-it')();
const md5 = require('md5');

const mock = fs.readFileSync('mock-tea-mat.md', 'utf8');

const parsedMock = md.parse(mock);

function seperateSyllabusIntro(parsedMD) {
    let syllabusHeading = [];
    let tempMD = parsedMD;
    
    while (tempMD[0].tag !== 'h2') {
        syllabusHeading.push(tempMD[0]);
        tempMD = tempMD.slice(1);
    }

    return syllabusHeading;
}

function seperateSyllabusWeeks(parsedMD) {
    let syllabusWeeks = [];
    let tempMD = parsedMD;
    
    while (tempMD[0].tag !== 'h2') {
        tempMD.shift();
    }

    return tempMD;
}

function readSyllabusTitle(parsedMD) {
    return parsedMD[1].content;
}

function readSyllabusDescription(parsedMD) {
    if (parsedMD[0].tag === 'h2') {
        return '';
    }

    if (parsedMD[0].content !== '') {
        return parsedMD[0].content + '<br>' + readSyllabusDescription(parsedMD.slice(1));
    } else {
        return readSyllabusDescription(parsedMD.slice(1));
    }
}

function readSyllabusWorkshops(parsedMD) {
    let weeks = [];
    
    let weekTitles = [];
    let weekDescriptions = [];
    let weekWorkshops = [];
    
    /* parsedWorkshops.forEach(function(element) {
        if (element.content.startsWith('Week')) {
            weekTitles.push(element.content);
        }
    }); */
    
    parsedMD.forEach(function(element, index) {
        if (element.tag === 'h2' && element.type === 'heading_open') {
            const title = parsedMD[index + 1].content;
            let desc = '';
            
            parsedMD.slice(index + 1).forEach(function(elem) {
                if (elem.type === 'table_open') {
                    console.log(elem.tag + 'helo beléotem');
                    return;
                    console.log(elem.tag + 'helo nem kell látnod');
                }

                else if (elem.content !== '') {
                    desc += elem.content + '\n';
                }
            });
            
            // console.log('title: ' + title);
            // console.log('desc: ' + desc);
        }
    });

    return weeks;
}

function spongeUsefulMarkdownData(parsedMD, url) {
    return {
        syllabus: {
            id: md5(url).substr(0, 8),
            title: readSyllabusTitle(parsedMD),
            description: readSyllabusDescription(parsedMD.slice(3)),
            url: url
        }
    }
}

console.log(spongeUsefulMarkdownData(parsedMock, 'https://raw.githubusercontent.com/green-fox-academy/mock-teaching-materials/master/syllabus/modules/foundation/javascript.md?token=AhHGaKU9k9EPK_IdJr5LjY0yvAP21g6Sks5bBtJTwA%3D%3D'));
// readSyllabusWorkshops(parsedMock);
// console.log(readSyllabusDescription(parsedMock));
// console.log(spongeUsefulMarkdownData(parsedMock));
// console.log(readSyllabusWorkshops(parsedMock));