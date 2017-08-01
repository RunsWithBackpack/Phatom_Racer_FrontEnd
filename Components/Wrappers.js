import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TouchableOpacity,
  Linking
} from 'react-native';
import styles from '../Styles'
import {redish, blueish, beige, yellowish} from './Constants'

// export class Btn extends React.Component {
//   render(){
//     return(
//       <View style={{height: 50, width: 100, backgroundColor: '#5577BB', zIndex: 1, borderRadius:  30}}>
//         <Text style={{fontSize: 25, fontFamily: 'Airstream', color: 'black', textAlign: 'center', marginTop: 5}}>
//           {this.props.children}
//         </Text>
//       </View>
//     )
//   }
// }

export class Btn extends React.Component {
  render(){
    return(
      <View style={{alignItems: 'center', position: 'relative', top: -20, justifyContent: 'space-around'}}>
        <Text style={{fontFamily: 'Magnum', fontSize: 22, textAlign: 'center', color: yellowish, textShadowColor: 'black', textShadowOffset: {width: 3, height: 3}, textShadowRadius: 3, backgroundColor: 'transparent', position: 'relative', top: 26, textAlign: 'right', marginRight: 5 }}>{this.props.children}</Text>
        <View style={{height: 50, width: 160, backgroundColor: blueish, zIndex: -1, borderRadius: 100, borderWidth: 3, borderColor: yellowish}}></View>
      </View>
    )
  }
}

// export class BtnSuperSmall extends React.Component {  //DELETE THIS BLOCK IF BTNSUPERSMALL SEEMS TO BE WORKING JUST FINE
//   render(){
//     return(
//       <View style={{flexDirection: 'column', alignItems: 'flex-start', height: 50, position: 'relative', top: -20, justifyContent: 'flex-start'}}>
//         <Text style={{fontFamily: 'Magnum', fontSize: 22, textAlign: 'center', color: yellowish, textShadowColor: 'black', textShadowOffset: {width: 3, height: 3}, textShadowRadius: 3, backgroundColor: 'transparent', position: 'relative', top: 26, textAlign: 'right', marginRight: 5 }}>{this.props.children}</Text>
//         <View style={{height: 50, width: 70, backgroundColor: blueish, zIndex: -1, borderRadius: 100, borderWidth: 3, borderColor: yellowish, position: 'relative', left: -20 }}></View>
//       </View>
//     )
//   }
// }

export class BtnSuperSmall extends React.Component {
 render(){
   return(
     <View style={{flexDirection: 'column', alignItems: 'flex-start', height: 50, position: 'relative', top: -20, justifyContent: 'flex-start'}}>
       <Text style={{fontFamily: 'Magnum', fontSize: 22, textAlign: 'center', color: yellowish, textShadowColor: 'black', textShadowOffset: {width: 3, height: 3}, textShadowRadius: 3, backgroundColor: 'transparent', position: 'relative', top: 35, textAlign: 'right', marginRight: 5 }}>{this.props.children}</Text>
       <View style={{height: 50, width: 70, backgroundColor: blueish, zIndex: -1, borderRadius: 100, borderWidth: 3, borderColor: yellowish, position: 'relative', left: -20 }}></View>
     </View>
   )
 }
}

export class BtnRun extends React.Component {
  render(){
    return(
      <View style={{height: 60, width: 100, alignItems: 'center', position: 'relative', top: -20, justifyContent: 'space-around', marginLeft: 10}}>
        <Text style={{width: 160, fontFamily: 'Magnum', fontSize: 20, textAlign: 'center', color: yellowish, textShadowColor: 'black', textShadowOffset: {width: 3, height: 3}, textShadowRadius: 3, backgroundColor: 'transparent', position: 'relative', top: 25, textAlign: 'center', paddingTop: 10 }}>{this.props.children}</Text>
        <View style={{height: 50, width: 160, backgroundColor: redish, zIndex: -1, borderRadius: 100, borderWidth: 3, borderColor: yellowish}}></View>
      </View>
    )
  }
}

export class BtnMakeRoute extends React.Component {
  render(){
    return(
      <View style={{alignItems: 'center', position: 'relative', top: -20, justifyContent: 'space-around'}}>
        <Text style={{fontFamily: 'Magnum', fontSize: 25, textAlign: 'center', color: yellowish, textShadowColor: 'black', textShadowOffset: {width: 3, height: 3}, textShadowRadius: 3, backgroundColor: 'transparent', position: 'relative', top: 26, textAlign: 'right', marginRight: 5 }}>{this.props.children}</Text>
        <View style={{height: 50, width: 160, backgroundColor: blueish, zIndex: -1, borderRadius: 100, borderWidth: 3, borderColor: yellowish}}></View>
      </View>
    )
  }
}

export class BtnViewRoute extends React.Component {
  render(){
    return(
      <View style={{height: 60, width: 100, alignItems: 'center', position: 'relative', top: -20, justifyContent: 'space-around', marginLeft: 10}}>
        <Text style={{width: 160, fontFamily: 'Magnum', fontSize: 20, textAlign: 'center', color: yellowish, textShadowColor: 'black', textShadowOffset: {width: 3, height: 3}, textShadowRadius: 3, backgroundColor: 'transparent', position: 'relative', top: 25, textAlign: 'center', paddingTop: 10 }}>{this.props.children}</Text>
        <View style={{height: 50, width: 160, backgroundColor: redish, zIndex: -1, borderRadius: 100, borderWidth: 3, borderColor: yellowish}}></View>
      </View>
    )
  }
}

export class BtnHome extends React.Component {
  render(){
    return(
      <View style={{alignItems: 'center', position: 'relative', top: -20, justifyContent: 'space-around'}}>
        <Text style={{fontFamily: 'Magnum', fontSize: 40, textAlign: 'center', color: yellowish, textShadowColor: 'black', textShadowOffset: {width: 3, height: 3}, textShadowRadius: 3, backgroundColor: 'transparent', position: 'relative', top: 50, textAlign: 'right', marginRight: 5 }}>{this.props.children}</Text>
        <View style={{height: 60, width: 170, backgroundColor: blueish, zIndex: -1, borderRadius: 100, borderWidth: 3, borderColor: yellowish}}></View>
      </View>
    )
  }
}

export class BtnTwo extends React.Component {
  render(){
    return(
      <View style={{alignItems: 'center', position: 'relative', top: -20, justifyContent: 'space-around'}}>
        <Text style={{fontFamily: 'Magnum', fontSize: 25, textAlign: 'center', color: yellowish, textShadowColor: 'black', textShadowOffset: {width: 3, height: 3}, textShadowRadius: 3, backgroundColor: 'transparent', position: 'relative', top: 10, textAlign: 'right', marginRight: 5 }}>{this.props.children}</Text>
        <View style={{height: 50, width: 190, backgroundColor: blueish, zIndex: -1, borderRadius: 100, borderWidth: 3, borderColor: yellowish}}></View>
      </View>
    )
  }
}

export class BtnSm extends React.Component {
  render(){
    return(
      <View style={{alignItems: 'center', position: 'relative', top: -20, justifyContent: 'space-around'}}>
        <Text style={{fontFamily: 'Magnum', fontSize: 20, textAlign: 'center', color: yellowish, textShadowColor: 'black', textShadowOffset: {width: 3, height: 3}, textShadowRadius: 3, backgroundColor: 'transparent', position: 'relative', top: 26, textAlign: 'right', marginRight: 5 }}>{this.props.children}</Text>
        <View style={{height: 50, width: 120, backgroundColor: blueish, zIndex: -1, borderRadius: 100, borderWidth: 3, borderColor: yellowish}}></View>
      </View>
    )
  }
}

export class BigBtn extends React.Component {
  render(){
    return(
      <View style={{alignItems: 'center', position: 'relative', bottom: 10}}>
        <Text style={{fontFamily: 'Airstream', fontSize: 40, textAlign: 'center', color: yellowish, textShadowColor: 'black', textShadowOffset: {width: 3, height: 3}, textShadowRadius: 3, backgroundColor: 'transparent', position: 'relative', bottom: -53, textAlign: 'right', marginRight: 5 }}>{this.props.children}</Text>
        <View style={{height: 50, width: 250, backgroundColor: blueish, zIndex: -1, borderRadius: 100, borderWidth: 3, borderColor: yellowish}}></View>
      </View>
    )
  }
}


export class BtnHolder extends React.Component {
  render(){
    return(
      <View style={styles.btnHolder}>
        {this.props.children}
      </View>
    )
  }
}

export class BtnHolderVert extends React.Component {
  render(){
    return(
      <View style={styles.btnHolderVert}>
        <View style={{flex: 1, flexDirection: 'column'}}>
        {this.props.children}
        </View>
      </View>
    )
  }
}

export class BtnHolderLow extends React.Component {
  render(){
    return(
      <View style={styles.btnHolderLow}>
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
        {this.props.children}
        </View>
      </View>
    )
  }
}

export class Triangle extends React.Component {
  render(){
    return (
      <View style={styles.triangle}>
        <View style={styles.median}></View>
      </View>
    )
  }
}

export class Triangle2 extends React.Component {
  render(){
    return (
      <View style={styles.triangle2}></View>
    )
  }
}

export class Dot extends React.Component {
 render(){
   return (
     <View style={styles.dot}></View>
   )
 }
}

export class DotGrey extends React.Component {
 render(){
   return (
     <View style={styles.dotGrey}></View>
   )
 }
}

export class DotBlack extends React.Component {
 render(){
   return (
     <View style={styles.dotBlack}></View>
   )
 }
}
