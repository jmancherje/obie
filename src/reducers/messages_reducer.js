import {FETCH_MESSAGES} from '../actions'

const INITIAL_STATE = []

export default function(state = INITIAL_STATE, action) {
  switch(action.type) {
    case FETCH_MESSAGES: 
      return [...state, ...action.payload.data]
    default: 
      return state
  }
}