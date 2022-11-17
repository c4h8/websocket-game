const fs = require('fs/promises');

const mockState = ({
  player1: [
    {
      rtt: 3000,
      ts: '23-23-23'
    }
  ]
});


const pathRoot = process.env?.RENDER_EXTERNAL_HOSTNAME
  ? '/var/data/'
  : './data/'

class StatRecorder {
  //state = ({})

  state = {}

  constructor() {
    this.state = mockState;
  }

  reset() {
    this.state = ({})
  };

  push (userID, payload) {
    if(!this.state[userID])
      this.state[userID] = []

      this.state[userID].push(payload)
  }

  async commit() {
    const t = new Date;
    const timestamp = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}-T-${t.getHours()}-${t.getSeconds()}`
    console.log('FS path root', pathRoot);

    return fs.writeFile(`${pathRoot}${timestamp}.json`, JSON.stringify(this.state))
      .then(() => {
        console.log(`Saved File ${timestamp}.json`);
        this.reset()
      })
      .catch(e => console.log(e))
  }
};

module.exports = StatRecorder;
