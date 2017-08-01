//REACT MODULES
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Button,
} from 'react-native';
import {StackNavigator} from 'react-navigation';
import MapView from 'react-native-maps';
import {connect} from 'react-redux'
//MISC MODULES
import TimeFormatter from 'minutes-seconds-milliseconds'
import axios from 'axios'
import geolib from 'geolib'
//CUSTOM MODULES
import styles from '../Styles'
import {addNewRoute, fetchSelectedRacer} from './storeAndReducer'
import {runDataCoords, runDataTimes} from './RunData'
import {numToRGBConverter} from './Utils'
import {Btn, BtnSm, BigBtn, BtnHolder, BtnHolderVert, BtnViewRoute, BtnHome, BtnSuperSmall} from './Wrappers'
import {redish, blueish, beige, yellowish} from './Constants'



class ViewRoute extends Component {
	constructor(props) {
		super(props);
    this.state ={
    view: 'polylineView',
    type: 'regular',
    currentRunnerPointer: 0,
    phantomRacerPointer: 0,
    replayTimerStart: 0,
    timer: 0,
    replayingRun: false,
    phantomRacerInfo: {},
    heartrateCoordsArr: [],
    replaySpeed: 1,
    routeCoordsArr: [],
    midLat: {},
    midLng: {},
    deltaLat: 0,
    deltaLng: 0,
    winner: '',
    loser: '',
    showWinnerLoser: true,

  }

    this.submitRoute = this.submitRoute.bind(this)
    this.changeViewButton = this.changeViewButton.bind(this)
    this.showHeartRate = this.showHeartRate.bind(this)
    this.replayRoute = this.replayRoute.bind(this)
    this.home = this.home.bind(this)
    this.changeTypeSpeed = this.changeTypeSpeed.bind(this)
    this.changeTypeHeartRate = this.changeTypeHeartRate.bind(this)
    this.changeTypeRegular = this.changeTypeRegular.bind(this)
    this.changeReplaySpeed = this.changeReplaySpeed.bind(this)


	}


  changeTypeSpeed(){
    this.setState({
      type: 'speed'
    })
  }

  changeTypeHeartRate(){
    this.setState({
      type: 'heartrate'
    })
  }

  changeTypeRegular(){
    this.setState({
      type: 'regular'
    })
  }

  changeViewButton(){
  if (this.state.view === 'polylineView'){
    return this.setState({
      view: 'markerView'
    })
  } else if (this.state.view === 'markerView'){
    return this.setState({
      view: 'polylineView'
    })
  }
}

  componentWillMount() {
    // console.log("PROPS HERE!!!!!!!!!!!!!!!!", this.props)
    // let humanWon = this.props.user.personalCoords[this.props.user.personalCoords.length - 1] < this.props.selectedRacer.personalCoords[this.props.selectedRacer.personalCoords.length - 1] ? true : false

    // if (humanWon){
    //   this.setState({
    //     winner: 'You',
    //   })
    //   setTimeout(()=> {
    //     this.setState({
    //       showWinnerLoser: false
    //     })
    //   }, 5000)
    // } else {
    //   this.setState({
    //     winner: 'Phantom ' + this.props.selectedRacer.username
    //   })
    //   setTimeout(()=> {
    //     this.setState({
    //       showWinnerLoser: false
    //     })
    //   }, 5000)
    // }

    let givenprops = this.props.navigation.state.params
    // console.log('givenprops ', this.props.navigation.state.params )
    let heartrateInfo = givenprops.heartrateInfo

    // console.log('given heart rate', givenprops.heartrateInfo)
    // console.log('heartrateInfo', heartrateInfo, givenprops.personalTimeMarker)
    let heartrateCoordsArr = this.state.heartrateCoordsArr
     if (heartrateInfo && !heartrateCoordsArr.length){
    let tracker = 0
      heartrateCoordsArr = givenprops.personalTimeMarker.map((time, idx) => {
      // console.log('time ', time, heartrateInfo)
      let timeLess;
      let timeMore;
      for (tracker; tracker < heartrateInfo.length; tracker++){
        // console.log('heart info', heartrateInfo)
        // let info = heartrateInfo[tracker][0]
        // console.log('infooo ', info)
        if (+heartrateInfo[tracker][0] > time){
          timeMore = +heartrateInfo[tracker][0]
          timeLess = +heartrateInfo[tracker - 1][0]
          break;
        }
      }
        // console.log(timeMore, timeLess, heartrateInfo[tracker], heartrateInfo[tracker - 1])
        let heartRateValCloser = (timeMore - time) > (time - timeLess) ? heartrateInfo[tracker][1] : heartrateInfo[tracker - 1][1]
        // console.log('heartRateValCloser', heartRateValCloser)
        return {coords: givenprops.personalCoords[idx], heartrate: +heartRateValCloser}

      })
      this.setState({heartrateCoordsArr: heartrateCoordsArr})
    }

    let phantomRacerRoutetimeId = this.props.navigation.state.params.phantomRacerRoutetimeId
    // console.log('phantom racer id. ', phantomRacerRoutetimeId)
    if (phantomRacerRoutetimeId){
      this.props.fetchSelectedRacer(phantomRacerRoutetimeId)
      .then(phantomRacerInfo => {
        // console.log('phantom info ', phantomRacerInfo) //do I have to hold this on the state?
        this.setState({phantomRacerInfo: phantomRacerInfo})
      })
    }


    let nBound = +givenprops.personalCoords[0].latitude
    let sBound = +givenprops.personalCoords[0].latitude
    let eBound = +givenprops.personalCoords[0].longitude
    let wBound = +givenprops.personalCoords[0].longitude

    // console.log("GIVEN PROPS", givenprops)

    let routeCoordsArr = givenprops.personalCoords.map((coords, idx) => { //NEED TO FEED THE ACUTAL COORDS THROUGH THIS MAP LATER ON
      nBound = Math.max(nBound, +coords.latitude)
      sBound = Math.min(sBound, +coords.latitude)
      eBound = Math.min(eBound, +coords.longitude)
      wBound = Math.max(wBound, +coords.longitude)
      return {...coords, time: givenprops.personalTimeMarker[idx]}
    })

    let midLat = (nBound + sBound)/2
    let midLng = (eBound + wBound)/2
    let deltaLat = Math.abs(nBound-sBound)
    let deltaLng = Math.abs(wBound-eBound)

    console.log('midLat ', midLat, 'midLng ', midLng, 'deltaLat ', deltaLat, 'deltaLng ', deltaLng)

    this.setState({
      routeCoordsArr: routeCoordsArr,
      midLat: midLat,
      midLng: midLng,
      deltaLat: deltaLat +0.001,
      deltaLng: deltaLng +0.001
    })
  }


  submitRoute(){

    let {checkpointTimeMarker, personalCoords, personalTimeMarker, userId, startTime, endTime, phantomRacerRouteTimeId, routeId } = this.props.navigation.state.params
    // console.log('startTime is ', startTime)
    this.props.addNewRoute(checkpointTimeMarker, personalCoords, personalTimeMarker, userId, startTime, endTime, routeId, phantomRacerRouteTimeId)
    const { navigate } = this.props.navigation;
    navigate('OurApp')
  }

  showHeartRate (){
    // console.log('RUNNING')
    let givenprops = this.props.navigation.state.params

    // console.log('given props HR ', givenprops.heartrateInfo)
    if (givenprops.heartrateInfo){
      return (<BtnViewRoute style={styles.changeTypeHeartRate}>
                <Text onPress={this.changeTypeHeartRate}>View Heart Rate</Text>
              </BtnViewRoute>: null)
    }
  }

  changeReplaySpeed(event){
    // console.log('PRESSING')
    let speed = event
    // console.log('speed in change ', speed)
    this.setState({
      replaySpeed: speed
    })
  }

  replayRoute(){
    let givenprops = this.props.navigation.state.params
    // console.log('this is phantom racer info ', phantomRacerInfo)
    if (this.state.replayingRun){
      clearInterval(this.replayInterval)
      clearInterval(this.timerInterval)
      this.setState({
        replayingRun: false
      })
    } else {
    this.setState({
      replayTimer: Date.now(),
      replayingRun: true,
    })
    // console.log('inside of replay and this is the info ', givenprops)

      this.timerInterval = setInterval (()=> {//purely for visual purposes
        this.setState({timer: (Date.now() - this.state.replayTimer)*this.state.replaySpeed})
        // this.setState({timer: Date.now() - this.state.replayTimer})
      }, 50)
    // console.log('given props ', givenprops)
      // let selectedRacer= this.props.selectedRacer

      let personalTimeMarker = this.props.personalTimeMarker
      // console.log('this is the PR info ', this.state.phantomRacerInfo)


      // let phantomRacerTimeToCheck= selectedRacer.routetimes[0].timesArr[racerTimesArrPointer]
      // let phantomRacerCurrPos= this.props.selectedRoute.convCoords[racerCoordsPointer]
      this.replayInterval = setInterval (() => {
        let timeToCheck = (Date.now() - this.state.replayTimer)*this.state.replaySpeed
        let currentRunnerPointer= this.state.currentRunnerPointer
        let phantomRacerInfo = this.state.phantomRacerInfo
        let phantomRacerPointer = this.state.phantomRacerPointer
        if (phantomRacerInfo.personalCoords){
          // console.log('step one ')
          if (phantomRacerInfo.personalTimeMarker[phantomRacerPointer]-500 < timeToCheck){
            // console.log('step two')
            this.setState({
              phantomRacerPointer: phantomRacerPointer+1
            })
          }
        }
        // console.log('given props time', givenprops.personalTimeMarker[currentRunnerPointer], timeToCheck)
        if (givenprops.personalTimeMarker[currentRunnerPointer]- 500 < timeToCheck){
          if (currentRunnerPointer < givenprops.personalCoords.length){
            this.setState({
            currentRunnerPointer: currentRunnerPointer+1,
            timer: (Date.now()-this.state.replayTimer)*this.state.replaySpeed,
            })
          }
        } else if (currentRunnerPointer === givenprops.personalCoords.length){
            clearInterval(this.timerInterval)
            this.setState({replayingRun: false})
        }


      }, 1000)
    }
  }

   home(){
    const { navigate } = this.props.navigation;
    navigate('OurApp');
  }

  render() {
    // console.log('this is the states ', this.state)
    // console.log('phantom info ', this.state.phantomRacerInfo)
    let phantomRacerInfo = this.state.phantomRacerInfo
    if (this.state.phantomRacerInfo.personalCoords){
      // console.log('phantom racer info ', phantomRacerInfo)
    // console.log('phantom position ', phantomRacerInfo.personalCoords[this.state.phantomRacerPointer])
    }

    // console.log("REPLAY SPEED ", this.state.replaySpeed)

    let givenprops = this.props.navigation.state.params
     // console.log('current runner position ', givenprops.personalCoords[this.state.currentRunnerPointer] )
    let personalCoords = givenprops.personalCoords.slice(0)
    // console.log('this is given props', givenprops)
    let startPosition = givenprops.personalCoords[0] //This is setting the view of map to the start of the route
    // console.log('givenprops is ', givenprops)
    let finalTime = givenprops.personalTimeMarker[givenprops.personalTimeMarker.length-1]
    let totalDistance = (geolib.getPathLength(givenprops.personalCoords) * 0.000621371).toFixed(2)//the .000 whatvs is to convert meters to miles (to fixed is making it go to 2 decimal points)

    // console.log('this is the total distance', totalDistance)
    let oldRoute = givenprops.oldRoute //this will determine if the submit button is available

    //console.log('this is the total distance', totalDistance)

    // I THREW THESE IN TO POSSIBLY HELP SET THE BOUNDS OF THE MAP BASED ON THE ROUTE'S COORDINATES, SO THE ENTIRE ROUTE WOULD BE IN VIEW BY DEFAULT


    // console.log('routeCoordsArr ', routeCoordsArr)
    //HEARTRATE

    let heartrateCoordsArr = this.state.heartrateCoordsArr
    let routeCoordsArr = this.state.routeCoordsArr

    // console.log('HEART RATE', heartrateCoordsArr)
    // console.log('SPEED ', routeCoordsArr)


    return (
      <View>



         <View style={styles.mapcontainerNoNav}>

            <BtnHolderVert>

              {this.showHeartRate()}
              <BtnViewRoute>
                     <Text onPress={this.changeTypeRegular}>View Path</Text>
             </BtnViewRoute>
              <BtnViewRoute>
                      <Text onPress={this.changeTypeSpeed}>View Speed</Text>
              </BtnViewRoute>
              <BtnViewRoute>
                     <Text onPress={this.changeViewButton}>{this.state.view == 'polylineView' ? 'Marker View' : 'Line View'}</Text>
             </BtnViewRoute>



            {!oldRoute &&
              <BtnViewRoute style={styles.submitRoute}>
                    <Text onPress={this.submitRoute}>Submit Run</Text>
              </BtnViewRoute> }

              <BtnViewRoute style={styles.replayRoute}>
                    {!this.state.replayingRun ? <Text onPress={this.replayRoute}>Replay Run</Text> : <Text onPress={this.replayRoute}>Pause {TimeFormatter(this.state.timer)}</Text>}
              </BtnViewRoute>

            {
              this.state.replayingRun &&
              <View>
              <BtnSuperSmall >
                <Text onPress={this.changeReplaySpeed.bind(this, 1)}>1x</Text>
              </BtnSuperSmall>

              <BtnSuperSmall >
                <Text onPress={this.changeReplaySpeed.bind(this, 2)}>2x</Text>
              </BtnSuperSmall>

              <BtnSuperSmall >
                <Text onPress={this.changeReplaySpeed.bind(this, 4)}>4x</Text>
              </BtnSuperSmall>

              <BtnSuperSmall >
                <Text onPress={this.changeReplaySpeed.bind(this, 8)}>8x</Text>
              </BtnSuperSmall>
            </View>
            }

            </BtnHolderVert>

         <MapView
              region={{latitude: this.state.midLat, longitude: this.state.midLng, latitudeDelta: this.state.deltaLat, longitudeDelta: this.state.deltaLng}}
            style={styles.map}>



          {/*----REPLAY MARKERS----*/}
            {this.state.phantomRacerInfo.personalCoords && this.state.replayingRun ? <MapView.Marker
              coordinate={phantomRacerInfo.personalCoords[this.state.phantomRacerPointer]}
              pinColor='black'
              style={{height: 10, width: 10, borderRadius: 10}}
              title='phantom racer'
            /> : null}

            {this.state.replayingRun ? <MapView.Marker
                coordinate={givenprops.personalCoords[this.state.currentRunnerPointer]}
                pinColor={redish}
                style={{height: 10, width: 10, borderRadius: 10}}
                title='current runner'
              >
              </MapView.Marker> : null}




            {/*----MARKER/SPEED----*/}
            {(this.state.view === 'markerView' && this.state.type === 'speed') &&

              routeCoordsArr.map((coords, idx) =>{
                let speed = 0


                idx > 0 ? speed = geolib.getSpeed(routeCoordsArr[idx-1], coords, {unit: 'mph'}) : speed = 0
                // console.log("SPEED", speed)
                let speedColor = numToRGBConverter(speed,6, 100, 220, false)
                return (
                  <MapView.Marker
                    key={idx}
                    coordinate={coords}
                    pinColor={speedColor}
                    title={''+speed + ' mph'}
                    style={{height: 10, width: 10, backgroundColor: speedColor, borderRadius: 10}}
                  >
                  </MapView.Marker>
                )
              })
            }

            {/*----MARKER/HEARTRATE----*/}
              {(this.state.view === 'markerView' && this.state.type === 'heartrate') &&
              heartrateCoordsArr.map((info, idx) =>{
                  // console.log('info if ', info)
                  let heartrateColor = numToRGBConverter(info.heartrate, 70, 100, 220, false)

                return (
                  <MapView.Marker
                    key={idx}
                    coordinate={info.coords}
                    pinColor={heartrateColor}
                    title={ info.heartrate + ' bpm'}
                    style={{height: 10, width: 10, backgroundColor: heartrateColor, borderRadius: 10}}
                  >
                  </MapView.Marker>
                )
              })
            }

             {/*----MARKER/REGULAR----*/}
              {(this.state.view === 'markerView' && this.state.type === 'regular') &&
                givenprops.personalCoords.map((coords, idx) =>{

                return (
                  <MapView.Marker
                    key={idx}
                    coordinate={coords}
                    pinColor={redish}
                    style={{height: 10, width: 10, borderRadius: 10}}
                  >
                  </MapView.Marker>
                )
              })
            }

            {/*----POLYLINE/SPEED----*/}
              {((this.state.view === 'polylineView' && this.state.type === "speed") &&
              ////////SWITCH TO THIS FOR POLYLINE

              routeCoordsArr.length) && personalCoords.map((coords, idx) => {
                let speed = 0
                speed = (idx > 0) ? geolib.getSpeed(routeCoordsArr[idx-1], routeCoordsArr[idx], {unit: 'mph'}) : 0
                // console.log('routecoordsarr ',routeCoordsArr)
                // console.log("SPEED", speed)
                let speedColor = numToRGBConverter(speed, 6, 5, 13, true)
                // console.log("SPEEDCOLOR", speedColor)

                let firstCoord = personalCoords[idx - 1] || coords
                // console.log("Firstcoords, ", firstCoord, 'coords ',coords)

                return (
                  <View key={idx}>

                  <MapView.Polyline
                    key={idx}
                    // coordinates={[runDataCoords[idx-1], coords]}
                    coordinates={[firstCoord, coords]}
                    strokeColor={speedColor}
                    // strokeColor={'red'}
                    strokeWidth={10}
                    // title={''+speed}
                  />
                  </View>
                )
              })
            }

          {/*----POLYLINE/HEARTRATE----*/}
             {(this.state.view === 'polylineView' && this.state.type === "heartrate") &&


               heartrateCoordsArr.map((info, idx) => {
                // console.log('this is the info ', info, idx, heartrateCoordsArr[idx + 1])
               let heartrateColor = numToRGBConverter(info.heartrate, 70, 100, 220, false)
               let firstCoord = heartrateCoordsArr[idx].coords
               let nextCoord;
               if (heartrateCoordsArr[idx + 1]){
                  nextCoord = heartrateCoordsArr[idx + 1].coords
               } else {
                nextCoord = heartrateCoordsArr[idx].coords
               }
               // console.log('firstCoord ', firstCoord, 'next', nextCoord)
                return (
                  <View key={idx}>


                  <MapView.Polyline
                    key={idx}
                    // coordinates={[runDataCoords[idx-1], coords]}
                    coordinates={[firstCoord, nextCoord]}
                    strokeColor={heartrateColor}
                    // strokeColor={'red'}
                    strokeWidth={10}
                    // title={''+speed}
                  />
                  </View>
                )
              })
            }




            {/*----POLYLINE/REGULAR----*/}
            {(this.state.view === 'polylineView' && this.state.type === "regular") &&
              <MapView.Polyline coordinates={givenprops.personalCoords} strokeColor={redish} strokeWidth= {10} />
            }




          </MapView>

          <BtnHome style={styles.homeButton}>
            {/* <TouchableOpacity onPress={this.home}> */}
              <Text onPress={this.home} >Home</Text>
            {/* </TouchableOpacity> */}
          </BtnHome>


          </View>

          {
            ////MIGHT IMPLEMENT THIS LATER -"WINNER/LOSER" POPUP
            // <View style={{ position: 'absolute', top: 410}}>
            //   <Image source={require('../assets/runningredPopup.gif')} />
            //   <View style={{width: 375, height: 156, backgroundColor: 'transparent', borderColor: 'black', borderWidth: 10, position: 'relative', top: -156}}></View>
            //   <Text style={{fontFamily: 'BudmoJiggler-Regular', fontSize: 40, backgroundColor: 'transparent', textAlign: 'center', bottom: 280}}>CONSTRUCTING</Text>
            //   <Text style={{fontFamily: 'Magnum', fontSize: 50, textAlign: 'center', color: blueish, textShadowColor: 'black', textShadowOffset: {width: 3, height: 3}, textShadowRadius: 3, backgroundColor: 'transparent', position: 'relative', bottom: 260, marginRight: 10 }}>CITY LAYOUT</Text>
            // </View>
          }

        </View>
    )
  }
}

////Couldnt get this to display the speed in a callout bubble
// const CustomMarker = ({color}) => (
//   <View style={{height: 10, width: 10, backgroundColor: color, borderRadius: 10}}></View>
// )

const mapDispatchToProps = {addNewRoute, fetchSelectedRacer}

function mapStateToProps(state){
  return {
    user: state.user,
    selectedRacer: state.selectedRacer,
    selectedRoute: state.selectedRoute
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(ViewRoute)
