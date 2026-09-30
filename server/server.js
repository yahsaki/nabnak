const http = require('node:http')
const url = require('node:url')
const qs = require('node:querystring')
const Handler = require('./handler')
const handler = new Handler({})

const port = 8000
const host = 'localhost'

const listener = function(req, res) {
  let body = ''
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Security-Policy', `default-src 'none' 'unsafe-inline'`)
  req.on('data', chunk => { body += chunk.toString() })
  req.on('end', () => { /*console.log('received body', body)*/ onRequest(req, res, body) })
}

const server = http.createServer(listener)
server.listen(port, host, () => { console.log(`server is running on ${port}`) })

function onRequest(req, res, body) {
  console.log(`${req.method} - ${req.url}`, body)
  const pu = url.parse(req.url)
  const q = qs.parse(pu.query)

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, PATCH')
    res.writeHead(200)
    res.end()
    return
  }
  if (body.length) {
    try {
      body = JSON.parse(body)
    } catch (err) {}
  }
  let pathname = pu.pathname.toLowerCase()
  if (pathname.charAt(pathname.length-1) === '/') { pathname = pathname.substring(pathname.length-1, 0) }

  const switchVar = `${req.method}:${pathname}`
  switch(switchVar) {
    case 'GET:/project':         { handler.project.get({q,req,res,body}) }; break
    case 'POST:/project':        { handler.project.post({q,req,res,body}) }; break
    case 'DELETE:/project':      { handler.project.delete({q,req,res,body}) }; break
    case 'PATCH:/project':       { handler.project.update({q,req,res,body}) }; break
    case 'GET:/project/story':   { handler.project.story.get({q,req,res,body}) }; break
    case 'GET:/project/task':    { handler.project.task.get({q,req,res,body}) }; break

    case 'GET:/story':           { handler.story.get({q,req,res,body}) }; break
    case 'POST:/story':          { handler.story.post({q,req,res,body}) }; break
    case 'DELETE:/story':        { handler.story.delete({q,req,res,body}) }; break
    case 'PATCH:/story':         { handler.story.update({q,req,res,body}) }; break
    case 'GET:/story/task':      { handler.story.task.get({q,req,res,body}) }; break
    case 'GET:/story/task':      { handler.story.task.get({q,req,res,body}) }; break

    case 'GET:/task':            { handler.task.get({q,req,res,body}) }; break
    case 'POST:/task':           { handler.task.post({q,req,res,body}) }; break
    case 'DELETE:/task':         { handler.task.delete({q,req,res,body}) }; break
    case 'PATCH:/task':          { handler.task.update({q,req,res,body}) }; break
    case 'POST:/task/comment':   { handler.task.comment.post({q,req,res,body}) }; break
    case 'DELETE:/task/comment': { handler.task.comment.delete({q,req,res,body}) }; break
    case 'UPDATE:/task/comment': { handler.task.comment.update({q,req,res,body}) }; break

    default: { res.writeHead(404);res.end();return }
  }
}