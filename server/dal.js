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
    if (args.testing) { 
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
  // 260918:  yeah im not actually using this outside of debugging. todo: clone properly
  get data() { return JSON.parse(JSON.stringify(this.#data)) }
  // actually using this one...
  get projects() { return JSON.parse(JSON.stringify(this.#data.projects)) }

  getProject(id) {
    if (!id?.length) {
      console.log('dal.getProject: id is invalid');return
    }
    return this.#data.projects.find(x => x.id === id)
  }
  saveProject(project) {
    // handler validates input before it reaches this point
    const existingProject = this.#data.projects.find(x => x.id === project.id)
    if (!existingProject) {
      this.#data.projects.push(project)
      // hmmm should we set the id here or handler? leaving it in handler for now
      console.log(`dal.saveProject: added new project '${project.name}'(${project.id})`)
    } else {
      existingProject = project
    }
    const date = new Date()
    this.#data.date_updated = date.toISOString()

    util.fs.writeJson(
      path.join(__dirname, this.#dataPath, this.#dataFilename),
      this.#data, this.#formatJsonForDebug)
    console.log(`dal.saveProject: data saved to disk`)
    this.#dirty = true
  }
}

module.exports = Dal