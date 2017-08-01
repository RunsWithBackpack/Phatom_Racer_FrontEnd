////THIS CONTAINS BOTH REDUCER AND STORE

////IMPORTS FOR STORE
import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger' ////from example

////IMPORTS FOR DISPATCHERS
import axios from 'axios';
import {herokuUrl, localHost} from '../config.js'

//MISC
import TimeFormatter from 'minutes-seconds-milliseconds'



/////CONSTANTS
const SET_USER = 'SET_USER'
const SET_USER_LOCATION = 'SET_USER_LOCATION'
const SET_NEARBY_ROUTES = 'SET_NEARBY_ROUTES'
const SET_SELECTED_ROUTE = 'SET_SELECTED_ROUTE'
const SET_SELECTED_RACER = 'SET_SELECTED_RACER'
const SET_USER_STATS = "SET_USER_STATS"
const SET_FITBIT_TOKEN = "SET_FITBIT_TOKEN"

// const SET_RUNNER_COORDS = 'SET_ALL_COORDS'


////CONFIG                          //CHANGE THIS TO MAKE ALL YOUR REQUESTS GO TO EITHER LOCALHOST OR THE DEPLOYED HEROKU SITE
const localHostorHeroku=''
// localHostorHeroku= localHost
localHostorHeroku= herokuUrl


////ACTION CREATORS

export const setUser = function(user){
  return {
    type: SET_USER,
    user: user
  }
}

export const setUserLocation = function(location){

  return {
    type: SET_USER_LOCATION,
    userLocation: location
  }
}

export const setNearbyRoutes = function(routesData){
  return {
    type: SET_NEARBY_ROUTES,
    nearbyRoutes: routesData
  }
}

export const setSelectedRoute = function(routeData){
  return {
    type: SET_SELECTED_ROUTE,
    selectedRoute: routeData,
  }
}

export const setSelectedRacer = function(racerData){
  return {
    type: SET_SELECTED_RACER,
    selectedRacer: racerData,
  }
}

export const setUserStats = function(statsData){
  return {
    type: SET_USER_STATS,
    userStats: statsData,
  }
}


export const setFitBitToken = function(access_token){
  // console.log('this is being invoked with this token ', access_token)
  return {
    type: SET_FITBIT_TOKEN,
    fitbitAccessToken: access_token
  }
}

////DISPATCHERS


export const fetchSession = ()=> {
  return dispatch => {
    return axios.get(`${localHostorHeroku}/api/me`)
    .then(res => {
      console.log('DATAAA ', res.data)
      return res.data
    })
    .then(user => {
      dispatch(setUser(user))
      return user
    })
    .catch(err => {
      console.log(err)})
  }
}

export const fetchUser = ({email, password}) => {
  return dispatch => {
    return axios.post(`${localHostorHeroku}/api/me/login`, { email, password} )
    .then(res => res.data)
    .then(foundUser => {
      if(foundUser) dispatch(setUser(foundUser))
      return 'userSetAllGravy';//this is so I can .then off the thunk in the login component
    })
    .catch(console.log)
  }
}


export const logout = () => {
  return dispatch => {
    return axios.post(`${localHostorHeroku}/api/me/logout`)
    .then(loggedout => {
      dispatch(setUser({}))
    })
    .catch(err => {
      console.log(err)
    })
  }
}

export const fetchUserLocation = location => {
  return dispatch => {
    return dispatch(setUserLocation(location))
  }
}


export const addNewRoute = (checkpointTimeMarker, personalCoords, personalTimeMarker, userId, startTime, endTime, routeId, phantomRacerRouteTimeId) => {
  return dispatch => {
    return axios.post(`${localHostorHeroku}/api/runroutes`, {checkpointTimeMarker, personalCoords, personalTimeMarker, userId, startTime, endTime, routeId, phantomRacerRouteTimeId})

    .then(response => {
          console.log('this is the response', response.data)
          //INVOKE THUNK TO RELOAD ALL ROUTES
          dispatch(fetchUserStats(userId))
    })

  }
}

export const fetchSelectedRoute = selectedRouteId => {
  return dispatch => {
  console.log('fetching with ', selectedRouteId)
    return axios.get(`${localHostorHeroku}/api/runroutes/${selectedRouteId}`)
    .then(res => res.data)
    .then(eagerLoadedRoute => {
      console.log('eager loaded route ', eagerLoadedRoute)
        eagerLoadedRoute.convCoords = eagerLoadedRoute.coords.map(coordPair=>{
          return {latitude:+coordPair[0], longitude:+coordPair[1]};
        })
        eagerLoadedRoute.checkpointConvCoords = eagerLoadedRoute.checkpointCoords.map(coordPair=>{
          return {latitude:+coordPair[0], longitude:+coordPair[1]};
        })
        eagerLoadedRoute.users = eagerLoadedRoute.users.map(user => {
          // console.log('user is ', user)
          user.routetimes[0].personalCoords = user.routetimes[0].personalCoords.map(coordPair => {
            // console.log('coord pair is ', coordPair)
             return {latitude:+coordPair[0], longitude:+coordPair[1]};
          })
          return user
        })
        // console.log('eager loaded route with convCoords, checkpointConvCoords, and users', eagerLoadedRoute)
        return dispatch(setSelectedRoute(eagerLoadedRoute))
      })
    .catch(console.log)
  }
}

export const fetchNearbyRoutes = (region) => {
// http://localhost:3000/api/runroutes/?latitude=35&longitude=-119&latitudeDelta=3&longitudeDelta=1000 //this is an example of a runroute query
  return dispatch => {
    let query=`?latitude=${region.latitude}&longitude=${region.longitude}&latitudeDelta=${region.latitudeDelta}&longitudeDelta=${region.longitudeDelta}`;
    return axios.get(`${localHostorHeroku}/api/runroutes/`+query)
    .then(res => res.data)
    .then(routes => {
      // console.log('routes are ',routes)
      let formattedRoutes = routes.map(routeWCoords => {
        let formattedCoordsPerRoute = routeWCoords.coords.map(coordPair => {
          return {latitude:+coordPair[0], longitude:+coordPair[1]}
        })
        return { id: routeWCoords.id, convCoords: formattedCoordsPerRoute, totalDist: +routeWCoords.totalDist}
      })
      return dispatch(setNearbyRoutes(formattedRoutes))
    })
    .catch(console.log)
  }
}


export const fetchSelectedRacer = (phantomRacerRoutetimeId) => {
  return dispatch => {
    // return axios.get(`${localHostorHeroku}/api/users/${phantomRacerId}`)
    return axios.get(`${localHostorHeroku}/api/runroutes/routetime/${phantomRacerRoutetimeId}`)
    .then(res => {
      return res.data
    })
    .then(phantomRacerInfo => {
      phantomRacerInfo.personalCoords = phantomRacerInfo.personalCoords.map(coordPair => {
        return {latitude:+coordPair[0], longitude:+coordPair[1]};
      })
      return phantomRacerInfo
    })
  }

}

export const sendSelectedRacer = (racerData) => {
  return dispatch => {
    return dispatch(setSelectedRacer(racerData))
  }
}

export const fetchUserStats = (userId) => {
  return dispatch => {
    return axios.get(`${localHostorHeroku}/api/users/${userId}`)
    .then(res => {
      return res.data
    })
    .then(user => {
      user.routes = user.routes.map(route => {
        route.convCoords = route.coords.map(coordPair => {
          let formattedCoordPair = {latitude:+coordPair[0], longitude:+coordPair[1]}
           return formattedCoordPair
        })
         route.routetimes = route.routetimes.map(routetime => {
          routetime.personalCoords = routetime.personalCoords.map(coordPair => {
            let formattedCoordPair = {latitude:+coordPair[0], longitude:+coordPair[1]}
            return formattedCoordPair
          })
          return routetime
         })
        return route
      })
      return user
    })
    .then(userStatsInfo => {
      return dispatch(setUserStats(userStatsInfo))
    })
    .catch(err => console.log(err))
  }
}


export const fetchFitBitInfo = () => {
  return (dispatch, getState) => {
  let storeState = getState()
    let access_token = storeState.fitbitAccessToken
    return axios({
        method: 'GET',
        url: 'https://api.fitbit.com/1/user/-/profile.json',
        headers: {
          'Authorization': `Bearer ${access_token}`
        }

      })
    .then((res) => {
      console.log('this is the res', res)
      return res.data
    })
    .then((userInfo) => {
      console.log('basic fitbit info')
    })
    .catch((err) => {
      console.error('Error: ', err);
    });
    }
}

export const fetchFitBitHeartrateInfo = (timeStart, timeEnd, routetimeId) => {
  return (dispatch, getState) => {
  let storeState = getState()
  let dateAndTime = new Date(+timeStart)
  // console.log('this is the timer start and end', timeStart, timeEnd)
  let timeFormattedStart = new Date(+timeStart).toTimeString().slice(0,5)
  let timeFormattedEnd = new Date(+timeEnd).toTimeString().slice(0,5)
  console.log('timeStart', timeStart, timeFormattedStart)
  let date = new Date(+timeStart).toDateString()
  let dateFormatted = dateAndTime.toISOString().slice(0,10)
    let access_token = storeState.fitbitAccessToken
    return axios({
        method: 'GET',
        // url: 'https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json',
        url: `https://api.fitbit.com/1/user/-/activities/heart/date/${dateFormatted}/1d/1sec/time/${timeFormattedStart}/${timeFormattedEnd}.json`,
        // url: 'https://api.fitbit.com/1/user/-/activities/heart/date/today/1d/1sec/time/11:20/11:50.json',
        headers: {
          'Authorization': `Bearer ${access_token}`
        }

      })
    .then((res) => {
      console.log('RES DATA. ', res.data)
      return res.data
    })
    .then(heartRateInfo => {
      // console.log('attempting to get this ', heartRateInfo["activities-heart-intraday"])
      let heartRateData = heartRateInfo["activities-heart-intraday"].dataset
      return heartRateData
    })
    .then(heartrateDataset => {
      let heartrateArr = heartrateDataset.map(timeValPair => {
        let fullStringToConvert = date + ' ' + timeValPair.time + ' GMT-0500 (CDT)'
        let fullDateToConvert = new Date(fullStringToConvert)
        // console.log('full date to convert ', fullDateToConvert)
        let millisecondTime = fullDateToConvert.valueOf()
        let timeValResult  = [millisecondTime - (Number(timeStart)), timeValPair.value]
        // if (timeValResult[0] > 0 && timeValResult[0] < (timeEnd - timeStart)){ //this is taking care of the extra data we receive for the first and last minute of their route because FitBit will only deliver the whole minute
          return timeValResult
        // }
      })
      return heartrateArr
    })

    .catch((err) => {
      return ('error fetching fitbit data')
      // console.error('Error: ', err);
    });
    }
}

export const insertHeartRateInfo = (routetimeId, heartrateInfo) => {
  return dispatch => {
    return axios.put(`${localHostorHeroku}/api/runroutes/routetime/${routetimeId}`, {heartrateInfo})
    .then(res => {
      console.log('res is ', res.data)
    })
  }

}

/////////////////////////REDUCER
const initialState = {
  user: {},
  userLocation: {},
  nearbyRoutes: [],
  selectedRoute: {},
  selectedRacer: {},
  userStats: {},
  fitbitAccessToken: '',
}

function reducer(state = initialState, action){

  const nextState = Object.assign({}, state);

  switch(action.type){

    case SET_USER:
      nextState.user = action.user
      break;
    case SET_USER_LOCATION:
      nextState.userLocation = action.userLocation
      break;
    case SET_NEARBY_ROUTES:
      nextState.nearbyRoutes = action.nearbyRoutes;
      break;
    case SET_SELECTED_ROUTE:
      nextState.selectedRoute = action.selectedRoute
      break;
    case SET_SELECTED_RACER:
      nextState.selectedRacer = action.selectedRacer
      break;
    case SET_USER_STATS:
      nextState.userStats = action.userStats
      break;
    case SET_FITBIT_TOKEN:
      nextState.fitbitAccessToken = action.fitbitAccessToken
      break;
    default:
      return state;
  }
  return nextState;
}

export default createStore(reducer, applyMiddleware(thunkMiddleware, logger));
