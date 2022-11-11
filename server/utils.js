const startingPositionsArray = [
  { x: 1, y: 1 },
  { x: 1, y: 9 },
  { x: 17, y: 1 },
  { x: 17, y: 9 },
  { x: 9, y: 1 },
  { x: 9, y: 9 },
  { x: 5, y: 5 },
  { x: 12, y: 5 },
  { x: 3, y: 3 },
  { x: 15, y: 3 },
  { x: 3, y: 7 },
  { x: 15, y: 7 },
  { x: 7, y: 3 },
  { x: 13, y: 3 },
  { x: 7, y: 7 },
  { x: 13, y: 7 },
];

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 2, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const getRandomEmptyGridPosition = () => {
  const emptyPositions = map.map(
    (row, rowIndex) => row.map((number, column) => ({ x: column, y: rowIndex, number })),
  )
    .flat()
    .filter((element) => element.number === 0);

  const randomEmptyPositionIndex = Math.floor(Math.random() * emptyPositions.length)

  return emptyPositions[randomEmptyPositionIndex]
}

module.exports = { startingPositionsArray, map, getRandomEmptyGridPosition };