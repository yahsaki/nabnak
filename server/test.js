const fs = require('node:fs')
const path = require('node:path')
const Dal = require('./dal')
const util = require('./util')
const dal = new Dal({testing:true})

const tests = [
  createProject,
  getProjects,
  createStory,
]
;(async () => {
  // blow away any existing data, not the folder though
  fs.rmSync(path.join(__dirname, dal.paths.data, dal.paths.projects), {force:true,recursive:true})
  await util.delay(500)

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i]
    console.log(`name of fn: '${test.name}'`)
    try {
      const res = test()
      if (!res.success) {
        throw res//res.errors.join(', ')
      }
      await util.delay(500)
    } catch(err) {
      console.log(`failed to run test '${test.name}'`)
      console.log(err)
      process.exit()
    }
  }
  console.log(`all ${tests.length} tests ran successfully`)
})()

function getTasks() {}
function createTask() {}
function getStories() {}
function createStory() {
  // todo: check failure cases, check duplicate case
  const createProjectResponse = createProject()
  console.log('createProjectResponse', createProjectResponse)

  const date = new Date()
  const name = `storyName-${date.toISOString()}`
  const story = {
    projectId: createProjectResponse.data.project.id,
    name,
    description: 'awesome story'
  }
  const createStoryResponse0 = dal.story.post({story})
  console.log('createStoryResponse0', createStoryResponse0)
  if (!createStoryResponse0.success) {
    throw `failed to create story: ${createStoryResponse0.errors.join(', ')}`
  }
  if (createStoryResponse0.data.story.name !== name) { 
    throw `create story response name '${createStoryResponse0.data.story.name}' not equal to name '${name}'`
  }
  if (!createStoryResponse0.data.story.id) { throw `failed to set id for story` }
  if (createStoryResponse0.data.story.projectId !== createProjectResponse.data.project.id) {
    throw `story's project id supposed to be '${createProjectResponse.data.project.id}', instead it is '${createStoryResponse0.data.story.projectId}'`
  }

  return createStoryResponse0
}
function getProjects() {
  const getResponse0 = dal.projects.get()
  if (!getResponse0.success) {
    throw `failed to get projects, ${getResponse0.errors.join(', ')}`
  }

  const createProjectResponse = createProject()
  console.log('createProjectResponse', createProjectResponse)
  
  const getResponse1 = dal.projects.get()
  if (!getResponse1.success) {
    throw `failed to get projects, ${getResponse1.errors.join(', ')}`
  }
  if (!(getResponse0.data.length < getResponse1.data.length)) {
    throw `second projects fetch should be higher than first fetch. first fetch count: ${getResponse0.data.length}, second fetch count: ${getResponse1.data.length}`
  }

  const getResponse2 = dal.projects.get({id:'n/a'})
  if (!getResponse2.success) { throw `failed to get project, ${getResponse2.errors.join(', ')}` }
  console.log('gr2', getResponse2)
  if (Object.keys(getResponse2.data).length !== 0) { throw `should be an empty object` }

  const getResponse3 = dal.projects.get({id:createProjectResponse.data.project.id})
  console.log('gr3', getResponse3)
  // really need an object equality tool, no way im building that
  if (getResponse3.data.project.id !== createProjectResponse.data.project.id) {
    throw `failed to get project by id '${createProjectResponse.data.project.id}'`
  }

  return { success:true }
}
function createProject() {
  const date = new Date()
  const name = `projectName-${date.toISOString()}`
  const project = { name }

  const postResponse = dal.projects.post({project})
  console.log(`create project response`, postResponse)
  if (postResponse.data.project.name != name) { throw `project name '${postResponse.data.project.name}' not equal to '${name}'` }
  if (!postResponse.data.project.id?.length) { throw `project id '${postResponse.data.project.id}' not properly set` }

  const duplicateProjectResponse = dal.projects.post({project})
  console.log('duplicateProjectResponse', duplicateProjectResponse)
  if (duplicateProjectResponse.success) {
    throw `was supposed to fail with duplicate project name error`
  }

  return postResponse
}