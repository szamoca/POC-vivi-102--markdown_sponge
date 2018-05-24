'use strict';

const main = require('./main');

const spongeParsedMarkdown = main.spongeParsedMarkdown;
const parsedMock = main.parsedMock;

console.dir(spongeParsedMarkdown(parsedMock, 'https://kamu.com'), { depth: null });