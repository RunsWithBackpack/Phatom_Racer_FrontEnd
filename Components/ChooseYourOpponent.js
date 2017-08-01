import React, { Component } from 'react'
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Button,
  ScrollView
} from 'react-native'
import styles from '../Styles'
import {StackNavigator} from 'react-navigation'
import MapView from 'react-native-maps'
import TimeFormatter from 'minutes-seconds-milliseconds'

//added for react-redux
import {connect} from 'react-redux'
import {sendSelectedRacer} from './storeAndReducer'
import {redish, blueish, beige, yellowish} from './Constants'
import {Triangle, Triangle2} from './Wrappers'



class OpponentsView extends Component {
    constructor(){
      super()
      this.goToRace = this.goToRace.bind(this)
    }

    goToRace(userIdx){
      const { navigate } = this.props.navigation
      console.log('this is users', this.props.selectedRoute.users)
      let racer = this.props.selectedRoute.users[userIdx]
      this.props.sendSelectedRacer(racer)
      navigate('RunARoute')
    }

    render(){
      console.log('this is props ', this.props)

    const users = this.props.selectedRoute.users
    // const filterStyle = {width: 5, height: 5, backgroundColor: 'skyblue'} // have I written over this? -Alyssa
    // borderWidth: 3, borderColor: 'red'
    return(
      <View style={styles.container2}>

        <Image source={require('../assets/chicagoSkylineSmaller.jpg')}>

          <View style={styles.opponentHeader}>
            <Text style={styles.opponentHeaderTextTop}>Choose Your</Text>
            <Text style={styles.opponentHeaderTextBottom}>OPPONENT</Text>
          </View>
        </Image>

        <View style={styles.opponentListWrapper}>
          <View style={styles.opponentListRow}>
            <Text style={styles.scrollListHeader2}>Racer</Text>
            <Text style={styles.scrollListHeader2}>Time</Text>
          </View>
          <ScrollView>
          {
            users && users.map((user, idx) =>{
              // let placeHolderNames = ['Gabi', 'Charles', 'Alyssa', 'Codi']
              let nameStyle = idx % 2 === 0 ? styles.scrollListItemOppNameEven : styles.scrollListItemOppNameOdd
              let userRuntime = user.routetimes[0].runtime
              let rowStyle = idx % 2 !== 0 ? styles.scrollListRowEven : styles.scrollListRowOdd
              return (
                <View key={user.id} style={rowStyle}>
                  <View style={nameStyle}>
                    <Text style={styles.scrollListItemOppName} ref={idx} onPress={() => this.goToRace(idx)}>{user.username}</Text>
                  </View>
                  <Text style={styles.scrollListItem2}>{TimeFormatter(userRuntime)}</Text>

                </View>
              )
            })
          }
        </ScrollView>
        </View>
      </View>
    )
  }
}



const mapDispatchToProps = {sendSelectedRacer}

function mapStateToProps(state){
  return {
    selectedRoute: state.selectedRoute,
  }
}


var ChooseYourOpponent = connect(mapStateToProps, mapDispatchToProps)(OpponentsView)


export default ChooseYourOpponent
