_This is an extremely young library, so the API may change. Comments and feedback welcome._

## Installation
```
npm i --save redux-fetch-actions
```

## How it works

_authorization.js_
```javascript

const jwt = localStorage.getItem("jwt");

const authorization = jwt!==null?`Bearer ${jwt}`:false;

export default authorization
```

_userActions.js_
```javascript
import fetch_actions from 'redux-fetch-actions'
import authorization from './authorization'

const uri = '/api/users'
const server = 'http://localhost:8080'
const options = {
  mode:        'same-origin',
  credentials: 'include',
  headers:     {
    "Content-type":     "application/json",
    'X-Requested-With': 'XMLHttpRequest',
  },
}

const action = new fetch_actions('users', server, {
  index:{uri:uri, method: 'get'},
  store:{uri:uri, method: 'post'},
  update:{uri:uri+'/:id', method: 'put'},
  destroy:{uri:uri+'/:id', method: 'delete'},
  //you can make your custom action
  custom:{uri:uri+'/:your/:custom', method:'post' }
}, authorization, options)

export default action;
```

_userReducer.js_

```javascript
import _ from 'lodash'
import action from './userActions.js'

const { success, fail } = action.constants

export default (state = [], action)=>{
  switch (action.type) {
    case success.index:
      return [
        ...state,
        ...action.payload.value
      ]
      break
    case success.store:
      state.push(action.payload.value)
      action.payload.extra.resolve(true)
      return[
        ...state
      ]
      break

    case success.update:
      const key = _.findKey(state, _.pick(action.payload.value, ['id']) )
      state[key] = action.payload.value
      action.payload.extra.resolve(true)
      return[
        ...state
      ]
      break
    case success.destroy:
    const keyDelete = _.find(state, action.payload.body)
    state.splice(keyDelete,1)
    return [
      ...state
    ]
      break
    case fail.store:
    case fail.update:
    action.payload.extra.reject(action.payload.value)
    return[
      ...state
    ]
    default:
      return state
  }
}
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

    dispatch(userActions.destroy(
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
