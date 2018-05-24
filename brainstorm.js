'use strict';

const markdown = require('markdown-it')();
const fs = require('fs');

const rawMD = fs.readFileSync('mock-tea-mat.md', 'utf8');

function seperateSyllabusWeeks(parsedMD) {
  let syllabusWeeks = [];
  let tempMD = parsedMD;
  
  while (tempMD[0].tag !== 'h2') {
      tempMD.shift();
  }

  return tempMD;
}

const parsedWeek = markdown.parse(rawMD);
const rawWeek = seperateSyllabusWeeks(parsedWeek);

const parseWeeks = (rawWeeks) => {
  return rawWeeks.reduce((acc, value) => {
    if (value.type === 'heading_open') {
      acc.push([])
    }
    acc[acc.length - 1].push(value);
    return acc;
  }, [])
}

const tableFromWeek = (week) => {
  const tableOpen = week.find((e) => e.type === 'table_open');
  const idx = week.indexOf(tableOpen);
  const table = week.slice(idx);
  return table;
}

const getWorkshopsFromTable = (table) => {
  const rawTableData = table.filter(workshop => workshop.level === 4 && workshop.map === null);
  const workshops = [];
  const magic = (markdownurl) => {
    const regex = /\[(.+)\]\((.+)\)/;
    const [_, title, url] = regex.exec(markdownurl);
    return { title, url };
  }

  for(let i = 0; i < rawTableData.length; i += 3) {
    workshops.push({
      index: rawTableData[i].content,
      ...(magic(rawTableData[i + 1].content)),
      description: rawTableData[i + 2].content
    });
  }

  return workshops;
}

// console.log(getWorkshopsFromTable(parsedWeek));
console.log(getWorkshopsFromTable(tableFromWeek(parseWeeks(parsedWeek)[0])));