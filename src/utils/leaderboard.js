function normalizeArray(arr) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  if (!isFinite(min) || !isFinite(max) || max === min) {
    return arr.map(() => 0.5);
  }
  return arr.map((v) => (v - min) / (max - min));
}

export function computeWriterScores(list) {
  const booksArr = list.map((x) => Number(x.books || 0));
  const viewsArr = list.map((x) => Number(x.views || 0));
  const votesArr = list.map((x) => Number(x.votes || 0));

  const nBooks = normalizeArray(booksArr);
  const nViews = normalizeArray(viewsArr);
  const nVotes = normalizeArray(votesArr);

  const items = list.map((x, i) => ({
    ...x,
    score: 0.3 * nBooks[i] + 0.3 * nViews[i] + 0.4 * nVotes[i],
  }));

  items.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return items;
}