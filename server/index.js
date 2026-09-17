const http = require('node:http')
const url = require('node:url')
const qs = require('node:querystring')
const dal = require('./dal')

const port = 8000
const host = 'localhost'

const listener = function(req, res) {
  let body = ''
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  req.on('data', chunk => {
    body += chunk.toString()
  })
  req.on('end', () => {
    console.log('received body', body)
    onRequest(req, res, body)
  })
}

const server = http.createServer(listener)

;(async () => {
  server.listen(port, host, () => {
    console.log(`server is running on ${port}`)
  })
})

function onRequest(req, res, body) {
  console.log(`${req.method} - ${req.url}`)
  const parsedUrl = url.parse(req.url)
  console.log('parsedUrl', parsedUrl)

  const pathParts = parsedUrl.pathname.split('/')
  if (pathParts.length === 1) {
    res.writeHead(200)
    res.end('nothing here, move along')
  }

  switch(parsedUrl.pathname) {
    case 'projects': {
      switch (req.method) {
        case 'OPTIONS': {
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
          res.writeHead(204);res.end()
        } return
        case 'GET': {
          const projects = dal.projects.get()
          res.setHeader('Content-Type', 'application/json')
          res.writeHead(200)
          res.end(JSON.stringify(projects))
        } return
      }
    } break
  }
}