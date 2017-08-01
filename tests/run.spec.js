import React from 'react'

import chai, {expect} from 'chai'
import chaiEnzyme from 'chai-enzyme'

chai.use(chaiEnzyme())

import Run from '../Components/Run'

// describe('Run Component test specs', function (){
//   // console.log("IN TEST FILE")
//   this.timeout(10000)//because some of these axios calls to geonames are notoriously long
//
//   describe('Test should run', () => {
//     var a= 2
//     beforeEach('blah blah blah', () => {
//
//     })
//
//     it('2 + 2 should equal ...', () => {
//       expect(a+a).to.be.equal(4)//it equals 4!!! well no shittt!
//     })
//
//
//
// describe('Number to RGB or Hex converter', function(){
// 	it('takes in a range, a number within that range, and outputs the corresponding color in an RGB gradient', function(){
//     expect(numToRGBConverter(0, 20, 0, 255, false)).to.be.equal('rgb(0,0,255)')
// 	})
//   it('will return hex values if specified to do so', function(){
//     expect(numToRGBConverter(20, 20, 0, 15, true)).to.be.equal('#F00')
//   })
//   it('will return green for values in the middle of a given range', function(){
//     expect(numToRGBConverter(10, 20, 0, 255, false)).to.be.equal('rgb(0,255,0)')
//     expect(numToRGBConverter(10, 20, 0, 15, true)).to.be.equal('#0F0')
//   })
// })
