_.load.projects = () => {
  _.current.onLoad = () => {
    console.log('projects onLoad')
    _.current.fn.bind()
    _.current.fn.project.get()
  }
  // removed .script in place of .fn. didnt make sense in this scope unlike default website, .onLoad handles .script(for now)
  //_.current.script = () => {}
  _.current.css = () => {
    const style = document.createElement('style')
    style.setAttribute('id', 'core')
    style.innerText = `
    html {
      background-color: #222529;
      color: #e1e4e8;
      font-size: 12px;
    }
    .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .item {
      box-sizing: border-box;
    }
    .error {
      color: red;
      font-weight: bold;
    }
    .success {
      color: green;
      font-weight: bold;
    }
    #${_.current.dom.list.projects} li {
      cursor: pointer;
      font-size: 20px;
    }
    `
    document.head.append(style)
  }
  // not even close to sold on this naming convention but I love the reuse of course(_.current.data.project.text.name)
  // alright I really like this naming convention now(_.current.dom.text.name)
  _.current.dom = {
    text: {
      name: 'txt-projects-name',
      description: 'txt-projects-description',
      message: 'txt-projects-message', // was 'createProjectFormMessage'
    },
    button: {
      create: 'btn-projects-create-project',
    },
    list: {
      projects: 'list-projects-projects', // lol
    }
  }
  _.current.data = {}
  _.current.fn = {
    clear: () => {
      
    },
    bind: () => {
      const btnCreateProject = document.getElementById(_.current.dom.button.create)
      if (btnCreateProject) {
        btnCreateProject.addEventListener('click', _.current.fn.project.create)
      }
    },
    setMessage: (text, state = 'error') => {
      const message = document.getElementById(_.current.dom.text.message)
      message.innerText = text
      if (!message.classList.contains(state)) {
        message.classList.add(state)
      }
    },
    project: {
      create: async () => {
        const message = document.getElementById(_.current.dom.text.message)
        message.innerText = ''
        message.setAttribute('class', '')
        // being EXCEPTIONALLY LAZY at the moment. im not going to validate ANYTHING and expect the server to do ALL
        // the work for me(the UI). GANBARE SERVER you can do it!
        console.log('fn.project.create')
        const res = await fetch('http://localhost:8000/project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            project: {
              name: document.getElementById(_.current.dom.text.name).value,
              description: document.getElementById(_.current.dom.text.description).value
            }
          })
        })
        if (res.ok) {
          console.log('sccessfully created project maybe')
        } else {
          const data = await res.json()
          console.log('data', data)
          if (data.error) {
            _.current.fn.setMessage(data.error)
          }
        }
        
      },
      get: async () => {
        console.log('fn.project.fetch')
        const res = await fetch('http://localhost:8000/project')
        if (res.ok) {
          const data = await res.json()
          console.log('get projects data', data)
          const list = document.getElementById(_.current.dom.list.projects)
          for (let i = 0; i < data.data.length; i++) {
            const project = data.data[i]
            const li = _.helpers.createElement('li', [
              {name: 'id', val: project.id},
            ], project.name)
            li.addEventListener('click', () => {
              console.log('TODO: implement render project view!')
              _.load.project(project.id, project.name)
              _.init()
            })
            list.appendChild(li)
          }
        } else {
          console.error('failed to get projects for some reason', res)
        }
      }
    }
  }
  _.current.html = () => {
    const title = document.createElement('title')
    title.innerText = 'nabnak | select project'
    document.head.append(title)

    const charset = document.createElement('meta')
    charset.setAttribute('charset', 'utf-8')
    document.head.append(charset)

    const html = document.createElement('div')
    html.setAttribute('id', 'content')
    html.innerHTML = `
    <div class="container">
      <div class="item">
        <h2>Project List</h2>
        <ul id="${_.current.dom.list.projects}"></ul>
      </div>
      <div class="item">
        <h2>Create Project</h2>
        <p id="${_.current.dom.text.message}" class="poop"></p>
        <p>name</p>
        <input type="text" id="${_.current.dom.text.name}" />
        <p>description</p>
        <input type="text" id="${_.current.dom.text.description}" placeholder="todo: make this a textarea" />
        <button id="${_.current.dom.button.create}">Create Project</button>
      </div>
    </div>
    `
    document.body.append(html)
  }
  _.mode = 'projects'
}