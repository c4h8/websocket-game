const fs = require('fs/promises');

const pathRoot = process.env?.RENDER_EXTERNAL_HOSTNAME
  ? '/var/data/'
  : './data/'

class StatRecorder {
  state = {}

  constructor(initialState) {
    this.state = initialState || {};
  }

  reset() {
    this.state = ({})
  };

  push (userID, payload) {
    if(!this.state[userID])
      this.state[userID] = []

    this.state[userID] = [...this.state[userID], ...payload]
  }

  async commit() {
    const t = new Date;
    const timestamp = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}-T-${t.getHours()}-${t.getSeconds()}`
    console.log('FS path root', pathRoot);

    return fs.writeFile(`${pathRoot}${timestamp}-ws-v2.json`, JSON.stringify(this.state))
      .then(() => {
        console.log(`Saved File ${timestamp}.json`);
        this.reset()
      })
      .catch(e => console.log(e))
  }
};

module.exports = StatRecorder;
