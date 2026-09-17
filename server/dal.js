const path = require('node:path')
const util = require('./util')
const constants = require('./constants')

const formatJsonForDebug = true

const responseTemplate = { success: true, errors: [], data: {} }

const validate = {
  project: (args) => {
    const project = args.project
    const existingProjects = args.existingProjects
    const errors = []

    if (!project.name) { errors.push(`project name must not be empty`) }
    else {
      const existingProject = existingProjects.find(x => x.name.toLowerCase() === project.name.toLowerCase())
      if (existingProject) { errors.push(`project '${project.name}' already exists`) }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },
  story: (args) => {
    const story = args.story
    const projects = args.projects
    const errors = []

    if (!story || typeof story !== 'object') {
      errors.push('story object invalid');return { isValid:false, errors }
    }

    if (!story.name?.length) { errors.push(`story name required`) }
    if (!story.description?.length) { errors.push(`story.description field required`) }

    if (!story.projectId) { errors.push('story projectId field required') }
    else {
      const project = projects.find(x => x.id === story.projectId)
      if (!project) { errors.push(`story projectId must match an existing project`) }
      else {
        const existingStory = project.stories.find(x => x.name.toLowerCase() === story.name?.toLowerCase())
        if (existingStory) { errors.push(`story '${story.name}' already exists in project '${project.name}'`) }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },
}

class Dal {
  #paths
  constructor(args) {
    if (args.testing) {
      this.#paths = constants.settings.path_test
    } else {
      this.#paths = constants.settings.path
    }

    util.fs.mkdir(this.#paths.data)
  }
  get paths() {
    return {...this.#paths}
  }
  
  projects = {
    get: (args) => {
      const id = args?.id

      let response = structuredClone(responseTemplate)
      const projects = util.fs.readJson(path.join(this.#paths.data, this.#paths.projects))
      if (!projects) { projects = [] }

      if (id) {
        const project = projects.find(x => x.id === id)
        if (!project) { response.data = {} }
        else { response.data.project = project }
        return response
      }

      response.data = projects
      return response
    },
    post: (args) => {
      const project = args.project
      let response = structuredClone(responseTemplate)
      let projects = util.fs.readJson(path.join(this.#paths.data, this.#paths.projects))
      if (!projects) { projects = [] }

      const validateResponse = validate.project({project,existingProjects:projects})
      if (!validateResponse.isValid) {
        response.success = false
        response.errors = validateResponse.errors
        if (validateResponse.data) { response.data = validateResponse.data }
        return response
      }

      project.id = util.uuid()
      project.stories = []
      projects.push(project)
      util.fs.writeJson(
        path.join(this.#paths.data, this.#paths.projects),
        projects, 
        formatJsonForDebug)

      response.data.project = project
      return response
    }
  }
  story = {
    get: (args) => {
      const id = args.id

      let response = structuredClone(responseTemplate)
    },
    post: (args) => {
      const story = args.story
      const projects = util.fs.readJson(path.join(this.#paths.data, this.#paths.projects))
      let response = structuredClone(responseTemplate)

      const validateResponse = validate.story({story,projects})
      if (!validateResponse.isValid) {
        response.success = false
        response.errors = validateResponse.errors
        if (validateResponse.data) { response.data = validateResponse.data }
        return response
      }

      // we check existence in validate response
      const project = projects.find(x => x.id === story.projectId)
      story.id = util.uuid()
      story.items = []
      project.stories.push(story)
      util.fs.writeJson(
        path.join(this.#paths.data, this.#paths.projects),
        projects, 
        formatJsonForDebug)

      response.data.story = story
      return response
    }
  }
}

module.exports = Dal