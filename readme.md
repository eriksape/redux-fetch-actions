_userActions.js_
```javascript
import fetch_actions from 'redux-fetch-actions'

const uri = '/api/users'

const action = new fetch_actions('users', '', {
  index:{uri:uri, method: 'get'},
  store:{uri:uri, method: 'post'},
  update:{uri:uri+'/:id', method: 'put'},
  destroy:{uri:uri+'/:id', method: 'delete'}
})

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
