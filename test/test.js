import expect from 'expect'
import nock from 'nock'
import thunk from 'redux-thunk';
import _ from 'lodash'
import { combineReducers, bindActionCreators, createStore, applyMiddleware } from 'redux'

import Actions from '../src.js'

const uri           = '/api/users'
const server        = 'http://example.com'
const authorization = () => false

const user_actions = new Actions('users', server, {
  index:   {uri:uri, method:'get'},
  store:   {uri:uri, method:'post'},
  update:  {uri:uri+'/:id', method:'put'},
  destroy: {uri:uri+'/:id', method:'delete'},
  custom1: {uri:uri+'/:id/:sub', method:'get' }
},authorization,{})

let data = [{
    id:         "220d27cf-3c3d-4160-82c2-8cdb09a75e9f",
    name:       "Erik Sanchez",
    email:      "erik.sanchez@apscreativas.com",
    created_at: "2016-01-18 22:27:59",
    updated_at: "2016-01-18 22:28:24"
  },{
    id:         "87e88b8a-a74b-4196-86cc-7a3a443ec33f",
    name:       "Roger Burgos",
    email:      "rburgos90@gmail.com",
    created_at: "2016-01-18 22:28:57",
    updated_at: "2016-01-18 22:28:57"
  }]

const user_reducer = (state = [], action)=>{
  switch (action.type) {
    case 'users_INDEX_SUCCESS':
      return [
        ...state,
        ...action.payload.value
      ]
      break
    case 'users_STORE_SUCCESS':
      state.push(action.payload.value)
      return[
        ...state
      ]
      break

    case 'users_UPDATE_SUCCESS':
      const key = _.findKey(state, _.pick(action.payload.value, ['id']) )
      state[key] = action.payload.value
      return[
        ...state
      ]
      break
    case 'users_DESTROY_SUCCESS':
    const keyDelete = _.find(state, action.payload.body)
    state.splice(keyDelete,1)
    return [
      ...state
    ]
      break
    case 'users_CUSTOM1_SUCCESS':
      state = {ok:'ok'}
      return state
      break
    default:
      return state
  }
}

const rootReducer   = combineReducers({
  users:user_reducer,
})

const createStoreWithMiddleware = applyMiddleware(
  thunk
)(createStore)

function configureStore(initialState) {
  const store = createStoreWithMiddleware(rootReducer, initialState)
  return store
}

const store = configureStore()

describe('actions with class', () => {
  afterEach(() => { nock.cleanAll() })
  it('should get users list', (done) =>{

    let api = nock(server)
    .get(uri)
    .reply(200, data)

    const index = {
      users: data,
    }

    store.dispatch(user_actions.index()).then(()=>{
      expect(store.getState()).toEqual(index)
      done()
    }).catch((e)=>done(e))


  })

  it('should post user in users list', (done) =>{
    const postData = {
        "id":         "220d27cf-3c3d-ffff-82c2-8cdb09a75e9f",
        "name":       "Leyvi Silvan",
        "email":      "leyvi.silvan@apscreativas.com",
        "created_at": "2016-01-18 22:27:59",
        "updated_at": "2016-01-18 22:28:24"
      }

    data.push(postData)
    const storeData = {
      users: data,
    }
    let api = nock(server)
    .post(uri)
    .reply(201, postData)

    store.dispatch(user_actions.store({body:postData})).then(()=>{
      expect(store.getState()).toEqual(storeData)
      done()
    }).catch((e)=>done(e))

  })

  it('should update user in users list', (done) =>{
    const putData = {
        "id":         "220d27cf-3c3d-ffff-82c2-8cdb09a75e9f",
        "name":       "Leyvi Silvan Silvan",
        "email":      "leyvi.silvan@apscreativas.com",
        "created_at": "2016-01-18 22:27:59",
        "updated_at": "2016-01-18 22:28:24"
      }

      const key = _.findKey(data, _.pick(putData, ['id']) )
      data[key] = putData


    const updateData = {
      users: data,
    }
    let api = nock(server)
    .put(uri+'/220d27cf-3c3d-ffff-82c2-8cdb09a75e9f')
    .reply(200, putData)

    store.dispatch(user_actions.update({
      pathKeys:{id:'220d27cf-3c3d-ffff-82c2-8cdb09a75e9f'},
      body:putData
    })).then(()=>{
      expect(store.getState()).toEqual(updateData)
      done()
    }).catch((e)=>done(e))

  })

  it('should delete user in users list', (done) =>{

    const deleteId = '220d27cf-3c3d-4160-82c2-8cdb09a75e9f'

      const key = _.find(data, {id:deleteId})
      data.splice(key,1)
      //delete data[key]


    const deleteData = {
      users: data,
    }

    let api = nock(server)
    .delete(uri+'/220d27cf-3c3d-4160-82c2-8cdb09a75e9f')
    .reply(204)

    store.dispatch(user_actions.destroy({
      pathKeys:{id:'220d27cf-3c3d-4160-82c2-8cdb09a75e9f'}
    })).then(()=>{
      expect(store.getState()).toEqual(deleteData)
      done()
    }).catch((e)=>done(e))

  })

  it('should return all constants', (done) =>{
    const _expect = {
      'finalize':   'users_finalize',
      'initialize': 'users_initialize',
      success:{
        index:   'users_INDEX_SUCCESS',
        store:   'users_STORE_SUCCESS',
        update:  'users_UPDATE_SUCCESS',
        destroy: 'users_DESTROY_SUCCESS',
        custom1: 'users_CUSTOM1_SUCCESS'
      },
      fail:{
        index:   'users_INDEX_FAIL',
        store:   'users_STORE_FAIL',
        update:  'users_UPDATE_FAIL',
        destroy: 'users_DESTROY_FAIL',
        custom1: 'users_CUSTOM1_FAIL'
      }
    }

    expect(user_actions.constants).toEqual(_expect)
    done()
  })

  it('should be a custom callback', (done) =>{
    const _custom_expected = {users:{ok:'ok'}}

    let api = nock(server)
    .get(uri+'/id1/sub2')
    .reply(200, _custom_expected.users)

    store.dispatch(user_actions.custom1({
      pathKeys:{id:'id1', sub:'sub2'}
    })).then(()=>{
      expect(store.getState()).toEqual(_custom_expected)
      done()
    }).catch((e)=>done(e))

  })

})
