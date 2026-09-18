const path = require('node:path')
const util = require('./util')
const constants = require('./constants')
const helpers = require('./helpers')
const Dal = require('./dal')
const dal = new Dal()

const validate = {
  project: {
    get: (args) => {
      const id = args.q.id
      let errors = []
      if (!id?.length) {
        errors.push('id invalid')
      }

      return errors
    }
  }
}
module.exports = {
  project: {
    get: (args) => {
      const errors = validate.project.get(args)
      if (errors.length) { args.res.writeHead(400);res.end(`{"error":"${errors.join(', ')}"}`);return }

      const id = args.q.id
      const project = dal.getProject(id)
      if (!project) { args.res.writeHead(404);args.res.end();return }
      
      args.res.setHeader('Content-Type', 'application/json')
      res.writeHead(200)
      res.end(JSON.stringify(project))
      return
    }
  }
}