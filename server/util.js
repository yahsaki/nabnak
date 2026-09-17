const fs = require('node:fs')
const path = require('node:path')
const { prng } = require('crypto')

const api = {
  uuid: () => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11)
  .replace(/[018]/g, b =>
    (((b ^ prng(1)[0]) % 16) >> (b / 4)).toString(16)),
  delay: ms =>
    new Promise(resolve =>
      setTimeout(() => resolve(), ms)),
  fs: {
    mkdir: (dir) => {
      try {
        fs.mkdirSync(dir, {recursive: true})
      } catch (err) {
        if (err.code !== 'EEXIST') { throw err }
      }
      return
    },
    readJson: (filePath) => {
      if (!filePath?.length) { throw new Error(`readJson: invalid args. expected string path, received '${typeof filePath}'`) }
      let binary
      try {
        // I dont think this is binary... whatever
        binary = fs.readFileSync(filePath)
      } catch(err) {
        return
      }

      if (!binary) { return }
      try {
        return JSON.parse(Buffer.from(binary).toString())
      } catch(err) { throw err }
    },
    writeJson: function(filePath, data, formatted = false) {
      if (!filePath?.length || typeof data !== 'object') {
        throw new Error(`writeJson: invalid args`)
      }
      const parsed = path.parse(filePath)
      if (formatted) {
        fs.writeFileSync(filePath, JSON.stringify(data,' ',2))
      } else {
        fs.writeFileSync(filePath, JSON.stringify(data))
      }
      return
    },
  },
}


module.exports = api