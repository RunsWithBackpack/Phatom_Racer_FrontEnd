import axios from 'axios'
import geolib from 'geolib'

import {herokuUrl, localHost} from '../../config.js'
import { flatten } from '../Utils.js'


const localHostorHeroku=''
// localHostorHeroku= localHost
localHostorHeroku= herokuUrl

export function IntersectADJLIST(region){
  this.region= region
  this.adjList= {}//remember, this property will NOT get populated until intersect queries have been done... in other words, you can only access this property in this instance in promises
  this.streetLookup= {}
  this.allintersections=[]
  this.distanceHash={}
}

IntersectADJLIST.prototype.intersectQuery= function (coord){//for getting a single intersection near a coordinate
  //this is so stupid...  stupid react native wont let me make http requests so i have to make a request to the server and then have SERVER
  //make http request to the geonames.org site... a;sdfkj;aoifj
  return axios.get(`${localHostorHeroku}/api/geonames/?latitude=${coord.latitude}&longitude=${coord.longitude}&username=CharlesinCharge43&max=8`)
    .then(res=>{
      res.data.latitude=+res.data.lat
      res.data.longitude=+res.data.lng
      let intersection = res.data
      return intersection})
    .catch(err=>err)
}

IntersectADJLIST.prototype.intersectQueryBulk= function (centercoord){//for getting multiple intersections near a coordinate (you can set maxrows if you need.. see the api route for geonames)
  // console.log('centerCoord is ', centercoord)
  return axios.get(`${localHostorHeroku}/api/geonames/bulk/?latitude=${centercoord.latitude}&longitude=${centercoord.longitude}&username=CharlesinCharge43&max=8`)
    .then(res=>{
      if(!Array.isArray(res.data)){
        let intersection= res.data//SHOULD MOST OF THE TIME BE INTERSECTIONSARR.. BUT BECAUSE THESE PPL AT GEONAMES ARENT BEING CONSISTENT WITH THE TYPE OF DATA THEY ARE RETURNING WE NEED TO WRITE THIS EXTRA CODE
        res.data.latitude=+res.data.lat
        res.data.longitude=+res.data.lng
        return intersection
      }
      else {
        let intersectionsArr= res.data
        intersectionsArr= intersectionsArr.map(intersection=>{
          intersection.latitude= +intersection.lat
          intersection.longitude= +intersection.lng
          return intersection
        })
        return intersectionsArr
      }
    })
    .catch(err=>err)
}

IntersectADJLIST.prototype.intersectsPerRegion= function(){
  let lat=this.region.latitude
  let lng=this.region.longitude
  let latDelt=this.region.latitudeDelta//the actual delta from manually zooming seems way too large?
  let lngDelt=this.region.longitudeDelta//the actual delta from manually zooming seems way too large?

  let latDeltMax= .012
  let lngDeltMax= .016

  if(latDelt>latDeltMax || lngDelt>lngDeltMax){
    latDelt=latDeltMax
    lngDelt=lngDeltMax
  }
// {console.log('region too large... need to zoom in more ');return Promise.resolve('error');}

  let rightEdge=lng+lngDelt
  let topEdge=lat+latDelt
  let leftEdge=lng-lngDelt
  let botEdge=lat-latDelt
  let querycoord={latitude: botEdge, longitude: leftEdge} //start at the bottom left corner

  let querycoords=[]
  let queryPromiseArr=[]
  while(querycoord.latitude<topEdge){
    querycoord.longitude= leftEdge
    while(querycoord.longitude<rightEdge){
      querycoords.push(Object.assign({},querycoord))//Remember you don't want to push the original object.. otherwise you'll just end up with multiple references to the same object
      queryBulkProm=
      this.intersectQueryBulk(querycoord)
        .catch(err=>err)
      queryPromiseArr.push(queryBulkProm)
      querycoord.longitude=querycoord.longitude+.0025
    }
    querycoord.latitude=querycoord.latitude+.0020
  }

  return Promise.all(queryPromiseArr)
    .then(arrIntArr=>{
      console.log('unflattened ' ,arrIntArr)
      let arrInt=flatten(arrIntArr)
      this.makeAdjList(arrInt)
      return { querycoords, geonamesRes: arrInt}
      //arrInt represents the original array of consolidated intersections objects returned from geonames
      //the adjacency list is better though.. because it actually contains references to the intersection nodes (where I'll put other relevant data on there, such as connectionsn and stuff)
      //making the geonames res available regardless.. just in case I  need it...  also was initially gonan make it return {intAdjList: this}.. but theres no need to , because the instance does not need to be returned to be accessed (see run.js relevant part)
    })
    .catch(err=>err)
}

IntersectADJLIST.prototype.makeAdjList= function (arrInt){
  for(let intersection of arrInt){
    //must check if exist or not, because geonames does sometimes respond with an intersection more than once
    //especially when an intersection has more than 2 streets associated with it ( i know it's weird.. see this query:
    //http://api.geonames.org/findNearestIntersectionJSON?lat=41.954153&lng=-87.678783&username=CharlesinCharge43&maxRows=2 for a good example)

    if(!this.adjList[intersection.lat+','+intersection.lng]){//if doesn't exist... make a new intersection node
      let intersectNodeInstance= this.createNode(intersection)
      //modify adjacency list
      this.adjList[intersectNodeInstance.id]=intersectNodeInstance
    }
    else {//if it does exist, modify an existing intersection node
      let intersectNodeInstance= this.adjList[intersection.lat+','+intersection.lng]
      this.mergeIntoNode(intersectNodeInstance, intersection)
    }
  }
  console.log('what  ',this.allintersections,' adjlist is ', this.adjList)
  this.allintersections=Object.keys(this.adjList).map(key=>this.adjList[key])
}

IntersectADJLIST.prototype.createNode=function(geonamesIntersect){
  let intersectNodeInstance= new IntersectNode(geonamesIntersect)
  //modify node
  geonamesIntersect.street1 && intersectNodeInstance.streets.push(geonamesIntersect.street1)
  geonamesIntersect.street2 && intersectNodeInstance.streets.push(geonamesIntersect.street2)

  //modify street lookup
  if(geonamesIntersect.street1){
    if(!this.streetLookup[geonamesIntersect.street1]) this.streetLookup[geonamesIntersect.street1]=[intersectNodeInstance]
    else this.streetLookup[geonamesIntersect.street1].push(intersectNodeInstance)
  }
  if(geonamesIntersect.street2){
    if(!this.streetLookup[geonamesIntersect.street2]) this.streetLookup[geonamesIntersect.street2]=[intersectNodeInstance]
    else this.streetLookup[geonamesIntersect.street2].push(intersectNodeInstance)
  }
  return intersectNodeInstance
}

IntersectADJLIST.prototype.mergeIntoNode=function(intersectNodeInstance, geonamesIntersect){
  //merge geonames Intersection streets data (from the geonames request) into an existing intersect Node instance instance (and update StreetLookup accordingly)
  //used in the rare instance when more than one intersection were returned by geonames with the same coordinates (or very similar coordinates... see the makeAdjList method)
  if(geonamesIntersect.street1 && intersectNodeInstance.streets.indexOf(geonamesIntersect.street1)===-1) {
    intersectNodeInstance.streets.push(geonamesIntersect.street1)
    if(!this.streetLookup[geonamesIntersect.street1]) this.streetLookup[geonamesIntersect.street1]=[intersectNodeInstance]
    else this.streetLookup[geonamesIntersect.street1].push(intersectNodeInstance)
  }
  if(geonamesIntersect.street2 && intersectNodeInstance.streets.indexOf(geonamesIntersect.street2)===-1) {
    intersectNodeInstance.streets.push(geonamesIntersect.street2)
    if(!this.streetLookup[geonamesIntersect.street2]) this.streetLookup[geonamesIntersect.street2]=[intersectNodeInstance]
    else this.streetLookup[geonamesIntersect.street2].push(intersectNodeInstance)
  }
  return intersectNodeInstance
}

IntersectADJLIST.prototype.sortStreetLookup= function(){
  for(let streetKey in this.streetLookup){
    let streetVal= this.streetLookup[streetKey]
    this.sortStreet(streetVal, streetKey)
  }
}

IntersectADJLIST.prototype.sortStreet= function(streetVal, streetKey){
  //this will sort intersections on a streetVal (value of street key value pair in this.streetLookup) from either west to east or south to north (depending on what property changes the most -lat or long-
  //from intersection to intersection)

  if(streetVal.length===1) return
  else {
    // OLD CODE!! delete once your new code is found to be satisfactory
    // if(Math.abs(streetVal[1].latitude-streetVal[0].latitude) > Math.abs(streetVal[1].longitude-streetVal[0].longitude)){
    //   streetVal.sort(function(a,b){return a.latitude-b.latitude})
    // }
    // else streetVal.sort(function(a,b){return a.longitude-b.longitude})

    //update.. doesnt work for weird streets that go in one direction but "shifts" at one point (can get weird zigzags because you may get 2 points that have nearly identical primary lat/long, but the wrong one)
    //so gonna do it now by starting from the west most point, or southern most point (depending on if the intersections on a street differ more by lattitude or longitude), and then sorting all intersections by distance of points to that starting point
    let latArr= streetVal.map(intersection=>intersection.latitude)
    let longArr= streetVal.map(intersection=>intersection.longitude)
    let latrange= Math.max(...latArr)-Math.min(...latArr)
    let longrange= Math.max(...longArr)-Math.min(...longArr)
    let streetValCopy= streetVal.slice(0)

    // let initialSort= streetValCopy.sort( latrange >= longrange ? function(a,b){return a.latitude-b.latitude} : streetVal.sort(function(a,b){return a.longitude-b.longitude}) )   //ASK HAL WHY THE HELL DOES HTIS NOT WORK!!>!>!!>!L!:!:!??!?!?!
    let initialSort;
    if(latrange>= longrange){
      initialSort=streetValCopy.sort(function(a,b){return a.latitude-b.latitude})
    }
    else {
      initialSort=streetVal.sort(function(a,b){return a.longitude-b.longitude})
    }

    let startPoint=initialSort[0]
    // console.log('(post initial sort) on street: ', streetKey, 'streetVal: ',initialSort,'startPoint ', startPoint)

    streetVal.sort(function(a,b){
      let aLoc={ latitude: a.latitude, longitude: a.longitude }
      let bLoc={ latitude: b.latitude, longitude: b.longitude }
      let aDist=geolib.getDistance(startPoint,aLoc)//distance between a and the starting point (either west most point, or southern most point)
      let bDist=geolib.getDistance(startPoint,bLoc)//distance between b and the starting point (either west most point, or southern most point)
      // console.log('Street: ', streetKey,'... starting point ', startPoint, ' a loc: ', aLoc,' b loc:', bLoc)
      // console.log('comparing dist between a and start: ',aDist,' with dist between b and start: ', bDist)
      return aDist-bDist
    })
  }
}

IntersectADJLIST.prototype.connectIntersectNodes= function(){
  //remember you MUST first run the sortStreetLookup prototype method BEFORE invoking this one!!
  //This instance method connects the nodes based on associated/shared streets
  //
  //In addition to connecting, this instance method also:
  //-  calculates the distance between 2 nodes and saves the information
  //  in the connection (for future use)
  //- saves the distance information and associated nodes in the this.distance hash (so it can be easier to later update
  //  or verify the distance value with google maps--- the longer distances are usually a sign that it may be some
  // long windy street, or a "fake" connection.. that is.. some streets have segments that are disconnected, but this function unfortunately
  // can't tell the difference)

  for(let streetKey in this.streetLookup){
    if (streetKey==='Alley') continue
    let streetVal= this.streetLookup[streetKey]
    for(let i=0;i<streetVal.length-1;i++){//length - 1 because you cant have a leaf node (in a street, i.e., i of length-1) connect to a nonexisted node of higher i
      let firstNode=streetVal[i]
      let secondNode=streetVal[i+1]
      let distance=geolib.getDistance(firstNode,secondNode)

      if(firstNode.connections.indexOf(secondNode)===-1){//need to make sure not to make multiple connections (can happen)
        let connectionObj={node: secondNode, dist: distance}
        firstNode.connections.push(connectionObj)
      }
      if(secondNode.connections.indexOf(firstNode)===-1){
        let connectionObj={node: firstNode, dist: distance}
        secondNode.connections.push(connectionObj)
        this.distanceHash[distance]= this.distanceHash[distance] ? this.distanceHash[distance].concat([firstNode,secondNode]) : [firstNode,secondNode]
      }
    }
  }
}

IntersectADJLIST.prototype.sortConnections= function(){
  for(let intersectNode of this.allintersections){
    intersectNode.connections.sort(function(a,b){return b.dist-a.dist})
  }
}

export function IntersectNode(intersection){//takes in intersection object (returned by geonames.org)
  this.id=intersection.latitude+','+intersection.longitude
  this.latitude=intersection.latitude
  this.longitude=intersection.longitude
  this.streets=[]
  this.connections=[]
  this.distToEnd=1000000
  this.distToStart=-1000000
}

export function GenerateRoutes(start, end, distance, intersectADJLIST){//takes in start and ending intersection nodes, and distance (in meters)
  this.start=start
  this.end=end
  this.distance=distance
  this.intersectADJLISTCOPY= intersectADJLIST
  // this.intersectADJLISTCOPY=Object.assign({},intersectADJLIST)//react native doesn't allow this?  somehting about enumerable keys?
  this.debugStats={
    toofar:0,
    toofardistExc:0,
    turnback:0,
    returnEarly:0,
    returnTooMuch:0,
    endPointEarlyorLate:0,
    totalIterations:0,
  }
  this.memo={}
  this.potentialRoutes=[]
  this.maxIterations=2000000
}

GenerateRoutes.prototype.getRoutes=function(){
  try{
    this.run(null,null,this.start,[],{})
    this.sortPotentialRoutes
    console.log(this.debugStats)
  }
  catch(e) {
    console.log(e)
    console.log(this.debugStats)
  }
}

GenerateRoutes.prototype.setRouteNodesDist= function(){
  for(let routeNode of this.intersectADJLISTCOPY.allintersections){//route nodes are like the vanilla intersect adjacency list nodes, but with added information specific to route generation (such as distance)
    try {
      routeNode.distToEnd=geolib.getDistance(routeNode,this.end)
      routeNode.distToStart=geolib.getDistance(routeNode,this.start)
    }
    catch(e){
      console.log(e)
      console.log('culprit: ',routeNode)
      console.log('start... ',this.start, 'end ... ',this.end)
    }
  }
}

GenerateRoutes.prototype.sortPotentialRoutes= function(){
  this.potentialRoutes.sort(function(a,b){return a.length-b.length})
}

// GenerateRoutes.prototype.breadthFirst=function(startPoint, endPoint){//badddddd... delete this when you have dikstras working
//   let currentIntersect
//   let nodeDistance=0
//   // let queue=[startPoint]  //need to cut down on as many computations as possible
//   let blah=[[startPoint]]
//   let paths=[[startPoint]]
//   let loopCount=0
//   while(loopCount<500 && loopCount < paths.length){
//     let currentPath=paths[loopCount].slice(0)//the currentPath is the one next in line of the queue
//     currentIntersect=currentPath[currentPath.length-1]
//     console.log('currentIntersect ', currentIntersect)
//     let newPath=currentIntersect.connections.map(connectionObj=>{
//       return [...currentPath,connectionObj.node]
//     })
//     paths=paths.concat(newPath)
//     console.log('paths after push ',paths)
//     // queue=queue.concat(newPaths)
//
//     //copy paths of index 0 (currentIntersect) to number of connections, and add those connected node to each:
//     //[[startPoint]]=>[[startPoint],[startPoint],[startPoint],[startPoint]]=>[[startPoint, connectNode1],[startPoint, connectNode2],[startPoint, connectNode3],[startPoint, connectNode4]]
//
//     loopCount+=1
//   }
//
//   console.log('final loopcount: ',loopCount)
//   console.log('queue is: ',paths)
// }

// GenerateRoutes.prototype.PriorityQueue=function(){//bahhh  https://github.com/mburst/dijkstras-algorithm/blob/master/dijkstras.js
//
// }
//
// GenerateRoutes.prototype.dijkstra=function(startPoint, endPoint){
//
// }
//
// GenerateRoutes.prototype.memoize= function(routeNode, depth){
//   //base case
//
// }

GenerateRoutes.prototype.run= function(prevprevPoint, prevPoint, currentPoint, route, pointsPassed, turnBackCount=0, depth=0, distanceTraveled=0){
try{  this.debugStats.totalIterations+=1
  if(this.debugStats.totalIterations > this.maxIterations) return null
  let prevRoute= route
  let newRoute= prevRoute.slice(0)
  newRoute.push(currentPoint)

  let key= currentPoint.latitude+','+currentPoint.longitude
  let newpointsPassed=Object.assign({},pointsPassed)
  newpointsPassed[key]= newpointsPassed[key] ? newpointsPassed[key]+1 : 1
  // console.log('points passed hash ',newpointsPassed)

  turnBackCount = currentPoint===prevprevPoint ? turnBackCount+1 : turnBackCount
  let remainingAllowedDist= this.distance*1.2- distanceTraveled

  //base case 1: traversal has reached a point where it simply cant get to endpoint anymore (remaining distance allowed is less than the distance to endpoint at a current position)
  if(remainingAllowedDist<currentPoint.distToEnd){
    // console.log('distance is too far, no way to get to endpoint, Remaining allowed (',remainingAllowedDist,') is < ',currentPoint.distToEnd)
    // this.debugStats.toofar+=1
    return null
  }
  //base case 1.2: distance has exceeded specified distance (realistically. this won't happen because base case 1.2 will almost always ensure it.. but just in case)
  else if(remainingAllowedDist<0){
    // console.log('distance exceeded specified distance ',distanceTraveled)
    // this.debugStats.toofardistExc+=1
    return null
  }
  //base case 1.5: at a position that has been previously visited before the halfway point (or at least .8 of the specified distance)
  // else if(newpointsPassed[key]===2 && distanceTraveled< this.distance*0.4){//.4 is causing it to create a lot of super weird shapes (even tho they do work.. its just too weird.. also i think it cause it to do more calculations too)
  else if(newpointsPassed[key]===2 && distanceTraveled< this.distance*0.9){
    // console.log('returning to an old point way too soon, ', distanceTraveled)
    // this.debugStats.turnback+=1
    return null
  }
  //base case 2: at a position that has been previously visited before twice or more
  else if(newpointsPassed[key]>2){
    // console.log('returning to an old point way too many times ', newpointsPassed[key])
    // this.debugStats.returnEarly+=1
    return null
  }
  //base case 3: if traversal turned back immediately more than once
  else if(turnBackCount>=2){
    // console.log('turned backed too many times: ',turnBackCount)
    // this.debugStats.returnTooMuch+=1
    return null
  }
  //base case 4: if traversal has reached the endpoint, but the distance is not within a reasonable range of the distance specified by user
  else if(currentPoint===this.end && depth>0){
    if(distanceTraveled<this.distance*0.9 || distanceTraveled>this.distance*1.2){//consider taking out the > 1.2 distance part.. that's already taken care of
      // console.log('endpoint reached, but distance so far not near specified distance',distanceTraveled)
      // this.debugStats.endPointEarlyorLate+=1
      return null
    }
    else{
  //base case 5 (WINNER): if traversal has reached the endpoint, but the distance is within a reasonable range of the distance specified by user
      // console.log('endpoint reached, returning potential route .. distance is ',distanceTraveled)
      this.potentialRoutes.push(newRoute)
    }
  }
  //recursive case
  else {
    // if(!this.memo[currentPoint.id]) this.memo[currentPoint.id]={}//initialize memo for this node if it doesn't already exist

    let potentialRoutes=[]//should be an array of arrays (array of routes arrays)
    let connections=currentPoint.connections

    for(let connectionObj of connections){

      let potentialMove= connectionObj.node
      let newdistance= distanceTraveled+connectionObj.dist
      this.run(prevPoint, currentPoint, potentialMove, newRoute, newpointsPassed, turnBackCount, depth+1, newdistance)
    }
    // console.log('potential routes is updated to be ', potentialRoutes)
  }}
  catch (e){
    console.log(e,'wtfff... ', this.currentPoint)
  }
  // return this.memo[currentPoint.id]
}

// GenerateRoutes.prototype.run= function(prevprevPoint, prevPoint, currentPoint, route, pointsPassed, turnBackCount=0, depth=0, distanceTraveled=0){
//   //UPDATE DELETE THE COMMENT BELOW IF POINTSPASSED REALLY DOESNT NEED TO BE USED
//   // ***pointsPassed is NOT the same as the route from start point (of each of the many traversals).  Pointspassed is an object (NOT ARRAY)
//   // containing intersection Nodes that have already been encountered as properties (this makes it faster to check if a position
//   // has been traveeld to before, because indexOf can be computationally expensive)
//
//   //turnBackCount will increment when the traversal revisits the prevpoint immediately after moving away from it (the prevprevPoint)
//   //turnBackCount value persists by passing it to all children stacks
//
//   //the ***route array is the array that actually contains the ORDER of points passed for each of the many traversals
//   //it should be a COPY of the route from the parent recursive stack so mutating it won't mutate the earlier route
//
//   // console.log('moved to/now at currentpoint: ',currentPoint, ' from prevpoint: ', prevPoint )
//
//   let prevRoute= route
//   let newRoute= prevRoute.slice(0)
//   newRoute.push(currentPoint)
//
//   let key= currentPoint.latitude+','+currentPoint.longitude
//   let newpointsPassed=Object.assign({},pointsPassed)
//   newpointsPassed[key]= newpointsPassed[key] ? newpointsPassed[key]+1 : 1
//   // console.log('points passed hash ',newpointsPassed)
//
//   turnBackCount = currentPoint===prevprevPoint ? turnBackCount+1 : turnBackCount
//   let remainingAllowedDist= this.distance*1.2- distanceTraveled
//
//   //base case 1: traversal has reached a point where it simply cant get to endpoint anymore (remaining distance allowed is less than the distance to endpoint at a current position)
//   if(remainingAllowedDist<currentPoint.distToEnd){
//     // console.log('distance is too far, no way to get to endpoint, Remaining allowed (',remainingAllowedDist,') is < ',currentPoint.distToEnd)
//     this.debugStats.toofar+=1
//     return null
//   }
//   //base case 1.2: distance has exceeded specified distance (realistically. this won't happen because base case 1.2 will almost always ensure it.. but just in case)
//   else if(remainingAllowedDist<0){
//     // console.log('distance exceeded specified distance ',distanceTraveled)
//     this.debugStats.toofardistExc+=1
//     return null
//   }
//
//   //base case 1.5: at a position that has been previously visited before the halfway point (or at least .8 of the specified distance)
//   // else if(newpointsPassed[key]===2 && distanceTraveled< this.distance*0.4){//.4 is causing it to create a lot of super weird shapes (even tho they do work.. its just too weird.. also i think it cause it to do more calculations too)
//   else if(newpointsPassed[key]===2 && distanceTraveled< this.distance*0.9){
//     // console.log('returning to an old point way too soon, ', distanceTraveled)
//     this.debugStats.turnback+=1
//     return null
//   }
//   //base case 2: at a position that has been previously visited before twice or more
//   else if(newpointsPassed[key]>2){
//     // console.log('returning to an old point way too many times ', newpointsPassed[key])
//     this.debugStats.returnEarly+=1
//     return null
//   }
//   //base case 3: if traversal turned back immediately more than once
//   else if(turnBackCount>=2){
//     // console.log('turned backed too many times: ',turnBackCount)
//     this.debugStats.returnTooMuch+=1
//     return null
//   }
//   //base case 4: if traversal has reached the endpoint, but the distance is not within a reasonable range of the distance specified by user
//   else if(currentPoint===this.end && depth>0){
//     if(distanceTraveled<this.distance*0.9 || distanceTraveled>this.distance*1.2){//consider taking out the > 1.2 distance part.. that's already taken care of
//       // console.log('endpoint reached, but distance so far not near specified distance',distanceTraveled)
//       this.debugStats.endPointEarlyorLate+=1
//       return null
//     }
//     else{
//   //base case 5 (WINNER): if traversal has reached the endpoint, but the distance is within a reasonable range of the distance specified by user
//       // console.log('endpoint reached, returning potential route .. distance is ',distanceTraveled)
//       // console.log('returning route: ', newRoute)
//       return [newRoute]
//     }
//   }
//   //recursive case
//   else {
//     // console.log('recursive case ')
//
//     let potentialRoutes=[]//should be an array of arrays (array of routes arrays)
//     let connections=currentPoint.connections
//     for(let connectionObj of connections){
//       let potentialMove= connectionObj.node
//       let newdistance= distanceTraveled+connectionObj.dist
//       let runResult= this.run(prevPoint, currentPoint, potentialMove, newRoute, newpointsPassed, turnBackCount, depth+1, newdistance)
//       if(runResult) potentialRoutes=potentialRoutes.concat(runResult)
//     }
//     // console.log('potential routes is updated to be ', potentialRoutes)
//     return potentialRoutes
//   }
//
// }
