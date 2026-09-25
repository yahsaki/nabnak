const fs = require('node:fs')
const path = require('node:path')
const util = require('./util')

// 260918: renamed existing dal to handler since it wasnt a real data access layer
// going to implement caching and what not here as intended but way sooner than later
class Dal {
  #data
  #dataPath
  #dataFilename = 'projects.json'
  #formatJsonForDebug = true
  // todo: dont write to disk on every request, only do so every so often and only if there are changes of course
  #dirty = false
  constructor(args) {
    if (args?.testing) { 
      this.#dataPath = 'data_testing'
      fs.rmSync(path.join(__dirname, this.#dataPath), {force:true,recursive:true})
    }
    else { this.#dataPath = 'data' }

    util.fs.mkdir(path.join(__dirname, this.#dataPath))
    this.#data = util.fs.readJson(path.join(this.#dataPath, this.#dataFilename))
    if (!this.#data) {
      const date = new Date() 
      this.#data = {
        date_created: date.toISOString(),
        date_updated: date.toISOString(),
        projects: [],
      } 
    }
  }
  // not called during normal workflow yet, removed from debug/testing workflow(for some reason)
  get data() { return structuredClone(this.#data) }
  get projects() {
    // 260919: I dont particularly like these due to how easy it is to forget to update when schema changes
    return this.#data.projects.map(x => ({
      ...x,
      storyCount: x.stories.length,
      taskCount: x.tasks.length,
    }))
  }
  // 260919: there is no way from the API to call this fn atm
  get projectsFull() { return structuredClone(this.#data.projects) }

  getProject(id) {
    if (!id?.length) {
      console.log('dal.getProject: id is invalid');return
    }
    return this.#data.projects.find(x => x.id === id)
  }
  createProject(project) {
    // handler validates input before it reaches this point
    const existingProject = this.#data.projects.find(x => x.id === project.id)
    if (!existingProject) {
      this.#data.projects.push(project)
      // hmmm should we set the id here or handler? leaving it in handler for now
      console.log(`dal.saveProject: added new project '${project.name}'(${project.id})`)
    } else {
      // 260924: what was I thinking when I created this else case. truly pointless
      existingProject = project
    }
    const date = new Date()
    this.#data.date_updated = date.toISOString()

    util.fs.writeJson(
      path.join(__dirname, this.#dataPath, this.#dataFilename),
      this.#data, this.#formatJsonForDebug)
    console.log(`dal.saveProject: data saved to disk`)
    this.#dirty = true

    return {success:true}
  }
  deleteProject(id) {
    const i = this.#data.projects.findIndex(x => x.id === id)
    if (i > -1) {
      this.#data.projects.splice(i, 1)
      console.log(`dal.deleteProject: successfully removed project by id '${id}'`)
    } else {
      console.log(`dal.deleteProject: failed to find project by id '${id}'`)
      return {success:false}
    }

    util.fs.writeJson(
      path.join(__dirname, this.#dataPath, this.#dataFilename),
      this.#data, this.#formatJsonForDebug)
    console.log(`dal.deleteProject: data saved to disk`)
    this.#dirty = true
    return {success:true}
  }
  updateProject(id, fields) {
    // 260922: will not be mutating stories/tasks here
    let changes = []
    const project = this.#data.projects.find(x => x.id === id)
    for (const field in fields) {
      // this should be pushed upstream
      changes.push(`[${field} previous value: '${project[field]}', new value: '${fields[field]}']`)
      project[field] = fields[field]
    }
    // todo: unit test date updated
    if (changes.length) { project.date_updated = new Date().toISOString() }

    console.log(`dal.updateProject: changes: ${changes.join(', ')}`)
    return {success:true}
  }
  //getStory(id, projectId) { throw 'unimplemented' }
  //createStory(projectId, story) { throw 'unimplemented' }
  //deleteStory(id, projectId) { throw 'unimplemented' }
  //updateStory(id, projectId, fields) { throw 'unimplemented' }
  // I feel like skipping stories and going straight to tasks
  getTask(id, projectId) {
    const project = this.#data.projects.find(x => x.id === projectId)
    if (!project) { return }
    const task = project.tasks.find(x => x.id === id)
    return task // consider task.data
  }
  createTask(projectId, task) {
    const project = this.#data.projects.find(x => x.id === projectId)
    // im really trying to push all validation out of this class
    if (!project) { return {success:false} }
    project.tasks.push(task)

    this.#data.date_updated = new Date().toISOString()

    util.fs.writeJson(
      path.join(__dirname, this.#dataPath, this.#dataFilename),
      this.#data, this.#formatJsonForDebug)
    console.log(`dal.createTask: data saved to disk`)
    this.#dirty = true

    return {success:true}
  }
  deleteTask(id, projectId) {
    const project = this.#data.projects.find(x => x.id === projectId)
    if (!project) { return }
    const i = project.tasks.findIndex(x => x.id === id)
    if (i > -1) {
      project.tasks.splice(i, 1)
      console.log(`dal.deleteTask: successfully removed task '${id}' from project '${projectId}'`)
    }

    const date = new Date()
    this.#data.date_updated = date.toISOString()
    project.date_updated = date.toISOString()

    util.fs.writeJson(
      path.join(__dirname, this.#dataPath, this.#dataFilename),
      this.#data, this.#formatJsonForDebug)
    console.log(`dal.deleteTask: data saved to disk`)
    this.#dirty = true

    return {success:true}
  }
  updateTask(id, projectId, fields) {
    let changes = []
    const project = this.#data.projects.find(x => x.id === projectId)
    if (!project) { return {success:false} }
    const task = project.tasks.find(x => x.id === id)
    if (!task) { return {success:false} }
    for (const field in fields) {
      changes.push(`[${field} previous value: '${task[field]}', new value: '${fields[field]}']`)
      task[field] = fields[field]
    }

    if (!changes.length) { return {success:false} }

    const date = new Date()
    this.#data.date_updated = date.toISOString()
    project.date_updated = date.toISOString()
    task.date_updated = date.toISOString()

    util.fs.writeJson(
      path.join(__dirname, this.#dataPath, this.#dataFilename),
      this.#data, this.#formatJsonForDebug)
    console.log(`dal.updateTask: data saved to disk`)
    this.#dirty = true

    return {success:true}
  }
  // extremely yuck result of using json as a datastore: have to pass all ids along. I refuse to search all
  // projects for a nested comment with a specific id(and the likes). shouldve just used sqlite but still
  // rather not
  createTaskComment(taskId, projectId, comment) {
    const project = this.#data.projects.find(x => x.id === projectId)
    if (!project) { return {success:false} }
    const task = project.tasks.find(x => x.id === taskId)
    if (!task) { return {success:false} }

    task.comments.push(comment)
    
    const date = new Date()
    this.#data.date_updated = date.toISOString()
    project.date_updated = date.toISOString()
    task.date_updated = date.toISOString()

    util.fs.writeJson(
      path.join(__dirname, this.#dataPath, this.#dataFilename),
      this.#data, this.#formatJsonForDebug)
    console.log(`dal.createTaskComment: data saved to disk`)
    this.#dirty = true

    return {success:true}
  }
  deleteTaskComment(id, taskId, projectId) {
    const project = this.#data.projects.find(x => x.id === projectId)
    if (!project) { return {success:false} }
    const task = project.tasks.find(x => x.id === taskId)
    if (!task) { return {success:false} }
    const i = task.comments.findIndex(x => x.id === id)
    if (i > -1) {
      task.comments.splice(i, 1)
      console.log(`dal.deleteTaskComment: successfully removed comment '${id}' from task '${taskId}' from project '${projectId}'`)
    }

    const date = new Date()
    this.#data.date_updated = date.toISOString()
    project.date_updated = date.toISOString()
    task.date_updated = date.toISOString()

    util.fs.writeJson(
      path.join(__dirname, this.#dataPath, this.#dataFilename),
      this.#data, this.#formatJsonForDebug)
    console.log(`dal.deleteTask: data saved to disk`)
    this.#dirty = true

    return {success:true}
  }
  updateTaskComment(id, taskId, projectId, fields) {
    const project = this.#data.projects.find(x => x.id === projectId)
    if (!project) { return {success:false} }
    const task = project.tasks.find(x => x.id === taskId)
    if (!task) { return {success:false} }
    const comment = task.comments.find(x => x.id === id)
    for (const field in fields) {
      changes.push(`[${field} previous value: '${comment[field]}', new value: '${fields[field]}']`)
      comment[field] = fields[field]
    }

    const date = new Date()
    this.#data.date_updated = date.toISOString()
    project.date_updated = date.toISOString()
    task.date_updated = date.toISOString()

    util.fs.writeJson(
      path.join(__dirname, this.#dataPath, this.#dataFilename),
      this.#data, this.#formatJsonForDebug)
    console.log(`dal.updateTaskComment: data saved to disk`)
    this.#dirty = true

    return {success:true}
  }
}

module.exports = Dal