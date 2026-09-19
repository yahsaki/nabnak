const path = require('node:path')
const util = require('./util')
const constants = require('./constants')
const helpers = require('./helpers')
const Dal = require('./dal')
let dal

// 260919: not actually planning on cloning this all over the place yet, more of a note atm
const responseTemplate = {data:{},messages:[],error:''}

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
    delete: (args) => {
      let errors = []
      if (!args.q.id?.length) {
        errors.push('query parameter id invalid')
      }

      return errors
    },
    update: (args) => {
      throw 'unimplemented'
    },
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
      if (errors.length) { args.res.writeHead(400);args.res.end(`{"error":"${errors.join(', ')}"}`);return }

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
      if (errors.length) { args.res.writeHead(400);args.res.end(`{"error":"${errors.join(', ')}"}`);return }

      const project = args.body.project
      const date = new Date()
      project.id = util.uuid()
      project.date_create = date.toISOString()
      project.date_update = date.toISOString()
      dal.createProject(project)

      args.res.writeHead(204)
      args.res.end(JSON.stringify({data:{projectId:project.id}}))
      return project.id
    },
    delete: (args) => {
      const errors = validate.project.delete(args)
      if (errors.length) { args.res.writeHead(400);args.res.end(`{"error":"${errors.join(', ')}"}`);return }

      const deleteRes = dal.deleteProject(args.q.id)
      if (deleteRes.success) {
        args.res.writeHead(204)
      } else {
        // TODO: send codes from dal so we arent assuming its a 404 in cases like this
        args.res.writeHead(404)
      }

      args.res.end()
      return deleteRes
    },
    update: (args) => {
      /*
        CRUDing stories/tasks will happen elsewhere so focus only on project properties like name and desc
        I think name and desc is all we have anyway. yeap thats it

        so patch call data should look like...
        {
          'name': { value: '' },
          'description: { value: '' },
        }

        how about:
        [
          {name: 'description', value: '' }
          {name: 'name', value: '' }
        ]

        lets go with second option, seems more standard
      */
      throw 'unimplemented'
    }
  }
}

module.exports = Handler