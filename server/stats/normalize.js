
const fs = require('fs/promises');
const stats = require("stats-lite");

const pathRoot = process.env?.RENDER_EXTERNAL_HOSTNAME
  ? '/var/data/'
  : './data/'

// normalizes data recording for display with chartsjs
const normalize = (data) => {
  playerIDs = Object.keys(data);

  const timestamps = playerIDs.reduce(
    (acc, id) => [...acc, ...(data[id].map(o => o.s))],
    []
  );

  const minTimeStamp = Math.min(...timestamps);

  const dataSets = playerIDs.map((id, index) => 
    ({
      showLine: true,
      tension: 0.2,
      label: `Player ${index}`,
      // backgroundColor: id, 
      data: data[id].map(o => ({ x: o.s - minTimeStamp, y: o.c }))
    })
  );

  return dataSets;
}

const flatten = (data) => {
  playerIDs = Object.keys(data);

  return playerIDs.reduce(
    (acc, id) => [...acc, ...(data[id].map(o => o.c))],
    []
  );
}

const renderChart = async (slug) => {
    const path = `${pathRoot}${slug}.json`;
  
    const jsonData = await fs.readFile(path).then(res => JSON.parse(res));
    const parsedData = normalize(jsonData)



    return renderToHTML(parsedData, jsonData)
}

const renderToHTML = (rawdata, d) => `
  <!DOCTYPE html>
  <html>
    <head>
      <!-- Required meta tags -->
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Title</title>
      <!--Chart.js JS CDN--> 
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> 
    </head>
    <body>
      <div>
        <canvas id="asd"></canvas>
        <div id="avg">Mean: ${stats.mean(flatten(d))}</div>
        <div id="avg">Var: ${stats.variance(flatten(d))}</div>
      </div>

      <script>
        const jsonData = '${JSON.stringify(rawdata)}';
        const d = JSON.parse(jsonData);
        console.log('datasets', d)
        const ctx = document.getElementById('asd').getContext('2d');
        const myChart = new Chart(ctx, {
          type: "scatter",
          data: { datasets: d },
          options: {
            scales: {
              y: { title: {text: "rtt (ms)", display: true }},
              x: { title: {text: "time (ms)", display: true }}
            }
          }
        });
      </script>
    </body>
  </html>
`

module.exports = renderChart;
