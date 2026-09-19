const path = require('node:path')
const util = require('./util')
const constants = require('./constants')
const helpers = require('./helpers')
const Dal = require('./dal')
let dal

const validate = {
  project: {
    get: (args) => {
      let errors = []
      if (Object.hasOwn(args.q, 'id')) {
        if (!args.q.id.length) {
          errors.push('query parameter id invalid')
        }
      }

      return errors
    },
    post: (args) => {
      const errors = []
      const project = args?.body?.project
      const projects = dal.projects // not the full projects data set

      console.log('validate.project.post: project', project)
      console.log('validate.project.post: dal projects', projects)

      if (!project.name) { errors.push(`project name must not be empty`) }
      else {
        const existingProject = projects.find(x => x.name.toLowerCase() === project.name.toLowerCase())
        if (existingProject) { errors.push(`project '${project.name}' already exists`) }
      }

      if (!Array.isArray(project.tags)) { errors.push(`project.tags must be an array(of strings)`) }
      else {
        const tagDupes = helpers.checkForTagDupes(project.tags)
        if (tagDupes.length) { errors.push(`found duplicate tags '${tagDupes.join(', ')}'`) }
      }

      return errors
    },
    delete: (args) => {},
    update: (args) => {},
  }
}
class Handler {
  constructor(args) {
    if (args?.testing) {
      dal = new Dal({testing:true})
    } else {
      dal = new Dal({})
    }
  }

  project = {
    get: (args) => {
      const errors = validate.project.get(args)
      if (errors.length) { args.res.writeHead(400);res.end(`{"error":"${errors.join(', ')}"}`);return }

      let responseData
      if (Object.hasOwn(args.q, 'id')) {
        responseData = dal.getProject(args.q.id)
        if (!responseData) { args.res.writeHead(404);args.res.end();return }
      } else {
        responseData = dal.projects
      }
      
      args.res.setHeader('Content-Type', 'application/json')
      args.res.writeHead(200)
      args.res.end(JSON.stringify({data:responseData}))
      return responseData
    },
    post: (args) => {
      if (!args.body.project) { args.body.project = {} }
      args.body.project = {...constants.schema.project, ...args.body.project}

      const errors = validate.project.post(args)
      if (errors.length) { args.res.writeHead(400);res.end(`{"error":"${errors.join(', ')}"}`);return }

      const project = args.body.project
      const date = new Date()
      project.id = util.uuid()
      project.date_create = date.toISOString()
      project.date_update = date.toISOString()
      dal.createProject(project)

      args.res.writeHead(204)
      args.res.end(JSON.stringify({projectId:project.id}))
      return project.id
    },
  }
}

module.exports = Handler