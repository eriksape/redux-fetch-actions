_This is an extremely young library, so the API may change. Comments and feedback welcome._

##Introduction
`redux-fetch-actions` makes yours communication with reducers to the server easy. It only generates the actions for making AJAX calls to API endpoints, so it let you are free to generate your reducer as you want you need to fill it with the action.payload.

## Installation
```
npm i --save redux-fetch-actions
```

## How it works

With a react project with the next project structure

```
project
│   README.md
│   file001.txt    
│
└───reducers
    │   index.js
    │   authorization.js
    │
    ├───users
    │   │   actions.js
    │   │   reducer.js
```

_reducers/users/actions.js_
```javascript
import fetch_actions from 'redux-fetch-actions'
import authorization from './../authorization'

const uri = '/api/users'
const server = 'http://api.server:8080' // if is left empty ('') wiil be from your current origin

// these are options for the fetch api
const options = {
  mode:        'same-origin',
  credentials: 'include',
  headers:     {
    "Content-type":     "application/json",
    'X-Requested-With': 'XMLHttpRequest',
  },
}

export default const action = new fetch_actions('users', server, {
  index:{uri:uri, method: 'get'}, // this will be GET 'http://api.server:8080/api/users'
  store:{uri:uri, method: 'post'},
  update:{uri:uri+'/:id', method: 'put'},
  destroy:{uri:uri+'/:id', method: 'delete'},
  //you can make your custom action
  custom:{uri:uri+'/:your/:custom', method:'post' }
}, authorization, options)

```

_reducers/users/reducer.js_

```javascript
import action from './actions.js'

const { success, fail } = action.constants

export default (state = [], action)=>{
  const {type, payload} = action
  let index = -1
  switch (type) {
    case success.index:
      return payload.response
      break
    case success.store:
      return state.push(payload.response)
      break
    case success.update:
      index = state.findIndex( obj => obj.id == payload.response.id )
      state[index] = action.payload.value
      return state
      break
    case success.destroy:
      index = state.findIndex( obj => obj.id == payload.pathKeys.id )
      state.splice(index,1)
      return state
      break
    case fail.store:
    case fail.update:
      return state
    default:
      return state
  }
}
```

_reducers/authorization.js_
```javascript
//this files is for handle jwt only if is needed
const Authorization = () => localStorage.getItem('jwt')!==null?`Bearer ${localStorage.getItem('jwt')}`:false;

export default Authorization
```

_reducers/index.js_
```javascript
...
import { reducer as isFetching } from 'redux-fetch-actions'

import users from './users/reducer'
...

const rootReducer = combineReducers({
  ...
  users, // <-- this is the reducer
  isFetching // <---- this is for handle fetching state in your application
})
...
```
_dispatch action_
```javascript

import userActions from './userActions.js'

//get index -> GET http://localhost:8080/api/users
dispatch(userActions.index())

//post store -> POST http://localhost:8080/api/users

dispatch(userActions.store(
  {
    body:{
      name:'name',
      age:20,
    }
  }
))

//put update -> PUT http://localhost:8080/api/users/:id

dispatch(userActions.update(
  {
    pathKeys:{
      id:1 // this will become http://localhost:8080/api/users/1
    },
    body:{
      name:'name',
      age:20,
    }
  }

  //delete destroy -> DELETE http://localhost:8080/api/users/:id

  dispatch(userActions.destroy(
    {
      pathKeys:{
        id:1 // this will become http://localhost:8080/api/users/1
      }
    }

    //your custom action -> POST http://localhost:8080/api/users/:your/:custom

    dispatch(userActions.custom(
      {
        pathKeys:{
          your:'custom',
          custom:'action' // this will become http://localhost:8080/api/users/custom/action
        },
        body:{
          ... //your data
        }
      }
))

//
```
