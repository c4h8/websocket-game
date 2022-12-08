
const fs = require('fs/promises');

const pathRoot = process.env?.RENDER_EXTERNAL_HOSTNAME
  ? '/var/data/'
  : './data/'

// normalizes data recording for display with chartsjs
const normalize = (data) => {
  playerIDs = Object.keys(data);

  const timestamps = playerIDs.reduce(
    (acc, id) => [...acc, data[id].map(o => o.s)],
    []
  );

  const minTimeStamp = Math.min(timestamps);

  const dataSets = playerIDs.map((id) => 
    ({ 
      data: data[id].map(o => ({ x: o.s - minTimeStamp, y: o.c }))
    })
  );
}

const renderChart = async (slug) => {
  try {
    const path = `${pathRoot}${slug}.json`;

    const jsonData = await fs.readFile(path);

    return renderToHTML(jsonData)
  } catch {
    return 'Data not found'
  }
}

const renderToHTML = (jsonData) => `
  <!DOCTYPE html>
  <html>
    <head>
      <!-- Required meta tags -->
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Title</title>
      <!--Chart.js JS CDN--> 
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.js"></script> 
    </head>
    <body>
      <div>
        <canvas id="asd"></canvas>
      </div>

      <script>
        const jsonData = ${data}
        const datasets = JSON.parse(jsonData)
        const ctx = document.getElementById('asd').getContext('2d');
        const myChart = new Chart(ctx, {
          type: "line",
          data: datasets
        });
      </script>
    </body>
  </html>
`

module.exports = renderChart;
