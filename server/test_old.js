const fs = require('node:fs')
const path = require('node:path')
const Dal = require('./dal')
const dal = new Dal({testing:true})
const util = require('./util')
const helpers = require('./helpers')

const tests = [
  //checkForTagDupes,
  //createProject,
  //getProjects,
  //createStory,
  //getStories,
  //createTask,
  getTasks,
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

  console.log(`all ${tests.length} test groups ran successfully`)
})()

function getTasks() {
  const createProjectResponse = createProject()

  const date = new Date()
  const story = {
    projectId: createProjectResponse.data.project.id,
    name: 'story name',
    description: 'awesome story',
    tags: [],
  }
  const createStoryResponse = dal.story.post({story})

  const task = {
    projectId: createProjectResponse.data.project.id,
    storyId: createStoryResponse.data.story.id,
    name: `taskName-${date.toISOString()}`,
    description: 'task description',
    tags: []
  }
  const createTaskResponse = dal.task.post({task})

  console.log('getTasks: get task by task id')
  const getTaskResponse = dal.task.get({id:createTaskResponse.data.task.id})
  if (!getTaskResponse.success) { throw `failed to get task: ${getTaskResponse.errors.join(', ')}` }
  if (getTaskResponse.data.task.id !== createTaskResponse.data.task.id) {
    throw `wheeew getting lazy on these messages. task ids dont match`
  }

  console.log('getTasks: get tasks by story id')
  const getTasksByStoryIdResponse = dal.story.task.get({
    id: createStoryResponse.data.story.id,
    projectId: createProjectResponse.data.project.id
  })
  if (!getTasksByStoryIdResponse.success) { 
    throw `failed to get tasks by story id: ${getTasksByStoryIdResponse.errors.join(', ')}`
  }
  if (!getTasksByStoryIdResponse.data.tasks.length) {
    throw `shouldve found at least one task by story id`
  }

  console.log('getTasks: get tasks by project id')
  const getTasksByProjectIdResponse = dal.project.task.get({
    id: createProjectResponse.data.project.id
  })
  if (!getTasksByProjectIdResponse.success) { 
    throw `failed to get tasks by project id: ${getTasksByProjectIdResponse.errors.join(', ')}`
  }
  if (!getTasksByProjectIdResponse.data.tasks.length) {
    throw `shouldve found at least one task by project id`
  }

  return {success:true}
}
function createTask() {
  // LOTS of edge cases missing. I mean ALL edge cases missing lol
  const createProjectResponse = createProject()

  const date = new Date()
  const story = {
    projectId: createProjectResponse.data.project.id,
    name: 'story name',
    description: 'awesome story',
    tags: [],
  }
  const createStoryResponse = dal.story.post({story})

  const task = {
    projectId: createProjectResponse.data.project.id,
    storyId: createStoryResponse.data.story.id,
    name: `taskName-${date.toISOString()}`,
    description: 'task description',
    tags: []
  }

  console.log('createTask: create task successfully')
  const createTaskResponse = dal.task.post({task})
  if (!createTaskResponse.success) { throw `failed to create task: ${createTaskResponse.errors.join(', ')}` }
  if (!createTaskResponse.data.task.id) { throw `failed to set task id` }
  if (createTaskResponse.data.task.projectId !== createProjectResponse.data.project.id) {
    throw `tasks's project id supposed to be '${createProjectResponse.data.project.id}', instead it is '${createTaskResponse.data.task.projectId}'`
  }
  if (createTaskResponse.data.task.storyId !== createStoryResponse.data.story.id) {
    throw `tasks's story id supposed to be '${createStoryResponse.data.story.id}', instead it is '${createTaskResponse.data.task.storyId}'`
  }

  return {success:true}
}
function getStories() {
  const createProjectResponse = createProject()

  const date = new Date()
  const name = `storyName-${date.toISOString()}`
  const story = {
    projectId: createProjectResponse.data.project.id,
    name,
    description: `description-${date.toISOString()}`,
    tags: [],
  }

  const createStoryResponse = dal.story.post({story})
  //console.log('getStories createStoryResponse', createStoryResponse)

  console.log('getStories: get story by storyId')
  const getStoryResponse = dal.story.get({id:createStoryResponse.data.story.id})
  //console.log(`getStories: getStoryResponse`, getStoryResponse)
  if (!getStoryResponse.success) { throw `failed to get story: ${getStoryResponse.errors.join(', ')}` }
  if (getStoryResponse.data.story.name !== name) {
    throw `story name '${getStoryResponse.data.story.name}' does not equal original name '${name}'`
  }
  if (getStoryResponse.data.story.id !== createStoryResponse.data.story.id) {
    throw `fetched story id '${getStoryResponse.data.story.id}' does not equal initially created story id '${createStoryResponse.data.story.id}'`
  }
  if (getStoryResponse.data.story.description !== story.description) {
    throw `feched story description '${getStoryResponse.data.story.description}' is not equal to initial description '${story.description}'`
  }

  console.log('getStories: get all project stories')
  const getStoriesResponse = dal.project.story.get({id:createProjectResponse.data.project.id})
  if (!getStoriesResponse.success) { throw `failed to get stories: ${getStoriesResponse.errors.join(', ')}` }
  if (getStoriesResponse.data.stories?.length !== 1) {
    throw `expected 1 story, received ${getStoriesResponse.data.stories?.length}`
  }
  // test empty array

  return {success:true}
}
function createStory() {
  // todo: check edge cases
  const createProjectResponse = createProject()
  //console.log('createProjectResponse', createProjectResponse)

  const date = new Date()
  const name = `storyName-${date.toISOString()}`
  const story = {
    projectId: createProjectResponse.data.project.id,
    name,
    description: 'awesome story',
    tags: [],
  }

  console.log('createStory: create story success')
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
  console.log('getProjects: can get all projects')
  const getResponse0 = dal.project.get()
  if (!getResponse0.success) {
    throw `failed to get projects, ${getResponse0.errors.join(', ')}`
  }

  const createProjectResponse = createProject()
  //console.log('createProjectResponse', createProjectResponse)
  
  console.log('getProjects: get all projects count updated properly')
  const getResponse1 = dal.project.get()
  if (!getResponse1.success) {
    throw `failed to get projects, ${getResponse1.errors.join(', ')}`
  }
  if (!(getResponse0.data.length < getResponse1.data.length)) {
    throw `second projects fetch should be higher than first fetch. first fetch count: ${getResponse0.data.length}, second fetch count: ${getResponse1.data.length}`
  }

  console.log('getProjects: bad projectId should return no results')
  const getResponse2 = dal.project.get({id:'n/a'})
  if (!getResponse2.success) { throw `failed to get project, ${getResponse2.errors.join(', ')}` }
  console.log('gr2', getResponse2)
  if (Object.keys(getResponse2.data).length !== 0) { throw `should be an empty object` }

  console.log('getProjects: fetch by id should return 1 result')
  const getResponse3 = dal.project.get({id:createProjectResponse.data.project.id})
  //console.log('gr3', getResponse3)
  // really need an object equality tool, no way im building that
  if (getResponse3.data.project.id !== createProjectResponse.data.project.id) {
    throw `failed to get project by id '${createProjectResponse.data.project.id}'`
  }

  return { success:true }
}
function createProject() {
  const date = new Date()
  const name = `projectName-${date.toISOString()}`
  const project = {
    name,
    tags: [],
  }

  console.log('createProject: can create project successfully')
  const postResponse = dal.project.post({project})
  if (!postResponse.success) { throw `failed to create project, ${postResponse.errors.join(', ')}` }
  //console.log(`createProject: create project response`, postResponse)
  if (postResponse.data.project.name != name) { throw `project name '${postResponse.data.project.name}' not equal to '${name}'` }
  if (!postResponse.data.project.id?.length) { throw `project id '${postResponse.data.project.id}' not properly set` }

  console.log('createProject: check for duplicate project names')
  const duplicateProjectResponse = dal.project.post({project})
  //console.log('createProject: duplicateProjectResponse', duplicateProjectResponse)
  if (duplicateProjectResponse.success) {
    throw `was supposed to fail with duplicate project name error`
  }

  return postResponse
}
function checkForTagDupes() {
  console.log('checkForTagDupes: should have no dupes')
  let arr = ['a','b','c']
  let dupes = helpers.checkForTagDupes(arr)
  if (dupes.length) { throw `arr '${arr.join(', ')}' should have no dupes but '${dupes.join(', ')}' dupes found` }

  console.log('checkForTagDupes: should have 1 dupe')
  arr = ['a','b','c','a']
  dupes = helpers.checkForTagDupes(arr)
  if (dupes.length !== 1) { throw `expected to find 1 dupe, found '${dupes.join(', ')}'` }
  if (dupes[0] !== 'a') { throw `expected 'a' as dupe, found '${dupes[0]}'` }

  console.log('checkForTagDupes: should have 1 dupe case agnostic')
  arr = ['A','b','c','a']
  dupes = helpers.checkForTagDupes(arr)
  if (dupes.length !== 1) { throw `expected to find 1 dupe, found '${dupes.join(', ')}'` }
  if (dupes[0] !== 'A') { throw `expected 'A' as dupe, found '${dupes[0]}'` }

  arr = []
  dupes = helpers.checkForTagDupes(arr)
  if (dupes.length) { throw `arr '${arr.join(', ')}' should have no dupes but '${dupes.join(', ')}' dupes found` }
  return {success:true}
}