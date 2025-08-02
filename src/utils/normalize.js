// src/utils/normalize.js
const removeDiacritics = str =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function normalize(text) {
  return removeDiacritics(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

module.exports = { normalize };
