const path = require('node:path')
const util = require('./util')
const constants = require('./constants')
const helpers = require('./helpers')


const formatJsonForDebug = true

const responseTemplate = { success: true, errors: [], data: {} }

// 260917: want to do validate.project.post instead of assuming post in validate.project, then we can move
// all CRUD arg validations up here
const validate = {
  project: (args = {}) => {
    const project = args.project
    const existingProjects = args.existingProjects
    const errors = []

    if (!project.name) { errors.push(`project name must not be empty`) }
    else {
      const existingProject = existingProjects.find(x => x.name.toLowerCase() === project.name.toLowerCase())
      if (existingProject) { errors.push(`project '${project.name}' already exists`) }
    }

    if (!Array.isArray(project.tags)) { errors.push(`project.tags must be an array(of strings)`) }
    else {
      const tagDupes = helpers.checkForTagDupes(project.tags)
      if (tagDupes.length) { errors.push(`found duplicate tags '${tagDupes.join(', ')}'`) }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },
  story: (args = {}) => {
    const story = args.story
    const projects = args.projects
    const errors = []

    if (!story || typeof story !== 'object') { errors.push('story object invalid');return {isValid:false,errors} }

    if (!story.name?.length) { errors.push(`story name required`) }
    if (!story.description?.length) { errors.push(`story description field required`) }

    if (!story.projectId) { errors.push('story projectId field required') }
    else {
      const project = projects.find(x => x.id === story.projectId)
      if (!project) { errors.push(`story projectId must match an existing project`) }
      else {
        // IDGAF about duplicate story names but im leaving this check here for a bit
        const existingStory = project.stories.find(x => x.name.toLowerCase() === story.name?.toLowerCase())
        if (existingStory) { errors.push(`story '${story.name}' already exists in project '${project.name}'`) }
      }
    }

    if (!Array.isArray(story.tags)) { errors.push(`story.tags must be an array(of strings)`) }
    else {
      const tagDupes = helpers.checkForTagDupes(story.tags)
      if (tagDupes.length) { errors.push(`found duplicate tags '${tagDupes.join(', ')}'`) }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },
  task: (args = {}) => {
    const task = args.task
    const projects = args.projects
    const errors = []

    if (!task || typeof task !== 'object') { errors.push('task object invalid');return {isValid:false,errors} }

    if (!task.name?.length) { errors.push(`task name required`) }
    if (!task.description?.length) { errors.push(`task description field required`) }

    if (!task.projectId) { errors.push('task projectId field required');return {isValid:false,errors} }
    else {
      const project = projects.find(x => x.id === task.projectId)
      if (!project) { errors.push(`task projectId '${task.projectId}' must match an existing project`);return {isValid:false,errors} }

      if (task.storyId) {
        const story = project.stories.find(x => x.id === task.storyId)
        if (!story) {
          errors.push(`task storyId '${task.storyId}' must match an existing story if set`);return {isValid:false,errors}
        }
      }
    }

    if (!Array.isArray(task.tags)) { errors.push(`task.tags must be an array(of strings)`) }
    else {
      const tagDupes = helpers.checkForTagDupes(task.tags)
      if (tagDupes.length) { errors.push(`found duplicate tags '${tagDupes.join(', ')}'`) }
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
  
  project = {
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

      const date = new Date()
      project.id = util.uuid()
      project.date_create = date.toISOString()
      project.date_update = date.toISOString()
      // assume stories and tasks will be null at this point in the process
      project.stories = []
      // yeah I dont want to force 1:m stories to tasks
      project.tasks = []
      projects.push(project)
      util.fs.writeJson(
        path.join(this.#paths.data, this.#paths.projects),
        projects, 
        formatJsonForDebug)

      response.data.project = project
      return response
    },
    delete: (args) => {
      throw new 'unimplemented'
    },
    update: (args) => {
      throw new 'unimplemented'
    },
    story: {
      get: (args) => {
        const id = args.id
        
        let response = structuredClone(responseTemplate)
        if (!id?.length) {
          response.success = false
          response.errors.push(`project.story.get: invalid id '${id}'`)
          return response
        }

        const projects = util.fs.readJson(path.join(this.#paths.data, this.#paths.projects))
        if (!projects) { projects = [] }

        let stories
        const project = projects.find(x => x.id === id)
        if (project) { stories = project.stories }

        if (!stories) { stories = [] }
        response.data.stories = stories
        return response
      }
    },
    task: {
      get: (args) => {
        const id = args.id
        
        let response = structuredClone(responseTemplate)
        if (!id?.length) {
          response.success = false
          response.errors.push(`project.task.get: invalid id '${id}'`)
          return response
        }

        const projects = util.fs.readJson(path.join(this.#paths.data, this.#paths.projects))
        if (!projects) { projects = [] }

        let tasks
        const project = projects.find(x => x.id === id)
        if (project) { tasks = project.tasks }

        if (!tasks) { tasks = [] }
        response.data.tasks = tasks
        return response
      }
    }
  }
  story = {
    get: (args) => {
      const id = args.id
      
      let response = structuredClone(responseTemplate)

      if (!id?.length) {
        response.success = false
        response.errors.push(`story.get: invalid id '${id}'`)
        return response
      }
      
      const projects = util.fs.readJson(path.join(this.#paths.data, this.#paths.projects))
      if (!projects) { projects = [] }

      let story
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i]
        story = project.stories.find(x => x.id === id)
        if (story) { break }
      }

      if (!story) { story = {} }
      response.data.story = story
      return response
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

      const date = new Date()
      // we check existence in validate response
      const project = projects.find(x => x.id === story.projectId)
      story.id = util.uuid()
      story.date_create = date.toISOString()
      story.date_update = date.toISOString()
      project.stories.push(story)
      util.fs.writeJson(
        path.join(this.#paths.data, this.#paths.projects),
        projects, 
        formatJsonForDebug)

      response.data.story = story
      return response
    },
    delete: (args) => {
      // note: tasks can be orphaned
      throw new 'unimplemented'
    },
    update: (args) => {
      throw new 'unimplemented'
    },
    task: {
      // fetching story tasks is not the same as fetching stories for a project, logically wise.
      // lets require a projectId since we really dont want tasks across projects
      get: (args) => {
        const id = args.id
        const projectId = args.projectId
        let response = structuredClone(responseTemplate)

        if (!id?.length) {
          response.success = false
          response.errors.push(`story.task.get: invalid id '${id}'`)
          return response
        }
        if (!projectId?.length) {
          response.success = false
          response.errors.push(`story.task.get: invalid projectId '${projectId}'`)
          return response
        }

        const projects = util.fs.readJson(path.join(this.#paths.data, this.#paths.projects))
        if (!projects) { projects = [] }

        let tasks = []
        const project = projects.find(x => x.id === projectId)
        if (project) {
          for (let i = 0; i < project.tasks.length; i++) {
            if (project.tasks[i].storyId === id) {
              tasks.push(project.tasks[i])
            }
          }
        }

        response.data.tasks = tasks
        return response
      }
    }
  }
  task = {
    get: (args) => {
      const id = args.id
      let response = structuredClone(responseTemplate)

      if (!id?.length) {
        response.success = false
        response.errors.push(`task.get: invalid id '${id}'`)
        return response
      }

      const projects = util.fs.readJson(path.join(this.#paths.data, this.#paths.projects))
      if (!projects) { projects = [] }

      let task
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i]
        task = project.tasks.find(x => x.id === id)
        if (task) { break }
      }

      if (!task) { task = {} }
      response.data.task = task
      return response
    },
    post: (args) => {
      const task = args.task
      // 260917: I shouldve fixed this path.join call by now. will fix when I change how projects are saved
      const projects = util.fs.readJson(path.join(this.#paths.data, this.#paths.projects))
      // using object.assign({}, template) was causing the template to persist data
      let response = structuredClone(responseTemplate)

      const validateResponse = validate.task({task,projects})
      if (!validateResponse.isValid) {
        response.success = false
        response.errors = validateResponse.errors
        if (validateResponse.data) { response.data = validateResponse.data }
        return response
      }

      const date = new Date()
      const project = projects.find(x => x.id === task.projectId)
      task.id = util.uuid()
      task.date_create = date.toISOString()
      task.date_update = date.toISOString()
      project.tasks.push(task)
      // speed running into needing to refactor this call
      util.fs.writeJson(
        path.join(this.#paths.data, this.#paths.projects),
        projects, 
        formatJsonForDebug)

      response.data.task = task
      return response
    },
    delete: (args) => {
      throw new 'unimplemented'
    },
    update: (args) => {
      throw new 'unimplemented'
    }
  }
}

module.exports = Dal