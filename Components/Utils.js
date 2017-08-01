

import {StackNavigator} from 'react-navigation';

//navigator geolocation promisified so we can .then off it and not have to write all those nasty nested functions
export function promisifiedGetCurrPos() {
  //reminder for how to do promisify async stuff in general:
    // 1 - Create a new Promise
    return new Promise(function (resolve, reject) {
        // 2 - Copy-paste your async code inside this function
        navigator.geolocation.getCurrentPosition(position=>{
            // 3 - in your async function's callback
            // reject for the errors and resolve for the results
            return resolve(position)
        },
        (msg)=>reject('Please enable your GPS position future.'),
        {enableHighAccuracy: true}
        )
    })
}

export function TestRunner(convCoords, timesArr){
  this.elapsedTime=0;
  this.start=0;
  this.timesArrPointer=1
  this.coordsPointer=0
  this.convCoords=convCoords
  this.timesArr=timesArr
  this.intervalID=0
}

TestRunner.prototype.startTimer= function(){
  this.start=Date.now()
  this.intervalID=setInterval(() => {
    this.elapsedTime=Date.now()-this.start
    // console.log(' test runner elapsed time is ', this.elapsedTime)
    if(this.elapsedTime > this.timesArr[this.timesArr.length-1]+1000) clearInterval(this.intervalID)
  },100)
}

TestRunner.prototype.moveOrNot= function (){
  //this will cause the testrunner to advance to the next location (via incrementing this.coordsPointer)
  //AND move the timesArrPointer up by 1, but only IF timer matches the time that this.timesArrPointer is pointing to.

  let origCoordsPointer=this.coordsPointer;

  while (this.elapsedTime >= this.timesArr[this.timesArrPointer]){
    this.coordsPointer+=1
    this.timesArrPointer+=1
  }
  // console.log('testrunenr elapsedtime ', this.elapsedTime)
  // console.log(origCoordsPointer, this.coordsPointer, this.timesArrPointer)

  return origCoordsPointer!==this.coordsPointer ? true : false
}

TestRunner.prototype.getPosition= function (){
  // console.log('testrunner coordinates ', this.convCoords[this.coordsPointer])
  return {coords: this.convCoords[this.coordsPointer]}
}

TestRunner.prototype.moveAndGetPos= function (){
  this.moveOrNot()
  // return Promise.resolve(this.getPosition())
  return this.getPosition()
}

export const testRoute1=
{convCoords:[{latitude: 41.797,longitude: -87.580},{latitude: 41.798,longitude: -87.582},{latitude: 41.799,longitude: -87.581},{latitude: 41.800368, longitude: -87.581021},{latitude: 41.802024, longitude: -87.580957},{latitude: 41.804015, longitude: -87.581611},{latitude: 41.805902, longitude: -87.583853},{latitude: 41.807989, longitude: -87.586192}],
// timesArr:[0,11000,23000,35000,45000,61000]
timesArr:[0,1000,2000,5500,7000,8500,9000,12000]//faster
}

export const testRoute2=
{convCoords:[{latitude: 41.808, longitude: -87.596837} , {latitude: 41.8087, longitude: -87.596837},{latitude: 41.809590, longitude: -87.596837},{latitude: 41.809686, longitude: -87.592427},{latitude: 41.808071, longitude: -87.590689},{latitude: 41.805676, longitude: -87.589218},{latitude: 41.802476, longitude: -87.587889},{latitude: 41.801058, longitude: -87.587528}],
// timesArr:[0,11000,23000,35000,45000,61000]
timesArr:[0,1000,2000,5500,7000,8500,9000,12000]//faster
}


let testRoute3Coords=[
           [
              "41.8091q0",
              "-87.596837"
            ],
            [
              "41.80959",
              "-87.596837"
            ],
            [
              "41.809686",
              "-87.592427"
            ],
            [
              "41.808071",
              "-87.590689"
            ],
            [
              "41.805676",
              "-87.589218"
            ],
            [
              "41.802476",
              "-87.587889"
            ],
            [
              "41.801058",
              "-87.587528"
            ],
            [
              "41.801058",
              "-87.5874"
            ],
            [
              "41.801058",
              "-87.5873"
            ],
            [
              "41.801058",
              "-87.5872"
            ],
            [
              "41.801058",
              "-87.5871"
            ],
            [
              "41.801058",
              "-87.587"
            ],
            [
              "41.801058",
              "-87.5869"
            ],
            [
              "41.801058",
              "-87.5868"
            ],
            [
              "41.801058",
              "-87.5867"
            ],
            [
              "41.801058",
              "-87.5866"
            ],
            [
              "41.801058",
              "-87.5865"
            ],
            [
              "41.801058",
              "-87.5864"
            ],
            [
              "41.801058",
              "-87.5863"
            ],
            [
              "41.801058",
              "-87.5862"
            ],
            [
              "41.801058",
              "-87.5861"
            ],
            [
              "41.801058",
              "-87.5855"
            ]
          ]

let testRoute3ConvCoords=testRoute3Coords.map(coordpair=>{return {latitude: coordpair[0], longitude: coordpair[1]} })

export const testRoute3=
{convCoords: testRoute3ConvCoords,
// timesArr:[0,11000,23000,35000,45000,61000]
timesArr:[0,2000,6150,7000,7200,13000,20000,20000,24000,24500,26000,28000,32000,33000,34000,36000,38000,40000,42000,44000,44100,44200] //faster
}

export const presentationTestRoute=
{convCoords: [
  // {//made it so first coordinate is just identical to 2nd so start at the start point.. but uncomment this later if you want to demonstarte the no start button thing
  //    "latitude":"41.88792515732291",
  //    "longitude":"-87.63479255456687"
  // },
   {
      "latitude":"41.8879397039012",
      "longitude":"-87.63511493649362"
   },
   {
      "latitude":"41.8879397039012",
      "longitude":"-87.63511493649362"
   },
   {
      "latitude":"41.88800697218802",
      "longitude":"-87.63528716758604"
   },
   {
      "latitude":"41.88802407127049",
      "longitude":"-87.63543921530957"
   },
   {
      "latitude":"41.88804607376632",
      "longitude":"-87.63560492553528"
   },
   {
      "latitude":"41.88804070934829",
      "longitude":"-87.63574616060372"
   },
   {
      "latitude":"41.888033752368656",
      "longitude":"-87.63590114199336"
   },
   {
      "latitude":"41.888019586952296",
      "longitude":"-87.63604338289018"
   },
   {
      "latitude":"41.8880098220351",
      "longitude":"-87.636190904386"
   },
   {
      "latitude":"41.88807846982208",
      "longitude":"-87.63628771536763"
   },
   {
      "latitude":"41.888181483412055",
      "longitude":"-87.63631705202873"
   },
   {
      "latitude":"41.88829435481009",
      "longitude":"-87.63639897077104"
   },
   {
      "latitude":"41.88841564690389",
      "longitude":"-87.63643268023269"
   },
   {
      "latitude":"41.88851881471044",
      "longitude":"-87.63651320839114"
   },
   {
      "latitude":"41.888637668492166",
      "longitude":"-87.636542829041"
   },
   {
      "latitude":"41.888606320174304",
      "longitude":"-87.63655618772621"
   },
   {
      "latitude":"41.88871348280635",
      "longitude":"-87.6365881227773"
   },
   {
      "latitude":"41.88875832598832",
      "longitude":"-87.63661041863973"
   },
   {
      "latitude":"41.888888496944574",
      "longitude":"-87.63662676335092"
   },
   {
      "latitude":"41.888994821386305",
      "longitude":"-87.63667512693222"
   },
   {
      "latitude":"41.889117155263094",
      "longitude":"-87.63674092487211"
   },
   {
      "latitude":"41.889204452784625",
      "longitude":"-87.6367728599232"
   },
   {
      "latitude":"41.88932301480499",
      "longitude":"-87.63680689045007"
   },
   {
      "latitude":"41.88944350466308",
      "longitude":"-87.6368352212828"
   },
   {
      "latitude":"41.889558881560234",
      "longitude":"-87.63686992236192"
   },
   {
      "latitude":"41.889677653128174",
      "longitude":"-87.63689976193722"
   },
   {
      "latitude":"41.88977270391014",
      "longitude":"-87.636933541007"
   },
   {
      "latitude":"41.889824336433676",
      "longitude":"-87.63706505306776"
   },
   {
      "latitude":"41.8898214865866",
      "longitude":"-87.63721274220164"
   },
   {
      "latitude":"41.88981800809678",
      "longitude":"-87.63736420319195"
   },
   {
      "latitude":"41.88981880437758",
      "longitude":"-87.63752195060964"
   },
   {
      "latitude":"41.88983053904202",
      "longitude":"-87.63768036857958"
   },
   {
      "latitude":"41.8898645695689",
      "longitude":"-87.63783484705503"
   },
   {
      "latitude":"41.88989528924402",
      "longitude":"-87.6379867271405"
   },
   {
      "latitude":"41.889916914554206",
      "longitude":"-87.63814774350043"
   },
   {
      "latitude":"41.889891936482755",
      "longitude":"-87.63829677373882"
   },
   {
      "latitude":"41.88979948409077",
      "longitude":"-87.6383284573328"
   },
   {
      "latitude":"41.88971059400764",
      "longitude":"-87.63827783063765"
   },
   {
      "latitude":"41.8896124419215",
      "longitude":"-87.63822737158056"
   },
   {
      "latitude":"41.889513535464076",
      "longitude":"-87.63819837019558"
   },
   {
      "latitude":"41.88941890377727",
      "longitude":"-87.63817062609608"
   },
   {
      "latitude":"41.88931660264906",
      "longitude":"-87.63814732440527"
   },
   {
      "latitude":"41.88928349413153",
      "longitude":"-87.63827565134282"
   },
   {
      "latitude":"41.88928282357928",
      "longitude":"-87.6384235919338"
   },
   {
      "latitude":"41.88927096318629",
      "longitude":"-87.63847581119056"
   },
   {
      "latitude":"41.88922679055658",
      "longitude":"-87.63860204265232"
   },
   {
      "latitude":"41.889192508572606",
      "longitude":"-87.63873682365532"
   },
   {
      "latitude":"41.88917670868513",
      "longitude":"-87.63887227521057"
   },
   {
      "latitude":"41.889173104466764",
      "longitude":"-87.63899791993911"
   },
   {
      "latitude":"41.889183204660085",
      "longitude":"-87.63912071482058"
   },
   {
      "latitude":"41.88917578667578",
      "longitude":"-87.63925516054745"
   },
   {
      "latitude":"41.88916384246376",
      "longitude":"-87.63937560849602"
   },
   {
      "latitude":"41.889147791119186",
      "longitude":"-87.63955062263425"
   },
   {
      "latitude":"41.88914389353421",
      "longitude":"-87.63971256100352"
   },
   {
      "latitude":"41.88916224990216",
      "longitude":"-87.6398705598783"
   },
   {
      "latitude":"41.889185844959584",
      "longitude":"-87.64001883574541"
   },
   {
      "latitude":"41.889180983455745",
      "longitude":"-87.64018245049532"
   },
   {
      "latitude":"41.88917570285675",
      "longitude":"-87.64033307329531"
   },
   {
      "latitude":"41.88917343974289",
      "longitude":"-87.64046391480382"
   },
   {
      "latitude":"41.889174697028366",
      "longitude":"-87.64060221620615"
   },
   {
      "latitude":"41.88919024545875",
      "longitude":"-87.64073372826691"
   },
   {
      "latitude":"41.88918752134022",
      "longitude":"-87.64085585259612"
   },
   {
      "latitude":"41.88918814998296",
      "longitude":"-87.64098191641982"
   },
   {
      "latitude":"41.8890960328671",
      "longitude":"-87.6410555933487"
   },
   {
      "latitude":"41.889083040917185",
      "longitude":"-87.6410849300098"
   },
   {
      "latitude":"41.889049848580626",
      "longitude":"-87.64122406960244"
   },
   {
      "latitude":"41.88896766402003",
      "longitude":"-87.6412749477547"
   },
   {
      "latitude":"41.888840426729885",
      "longitude":"-87.64126547620411"
   },
   {
      "latitude":"41.88874860298064",
      "longitude":"-87.6412593574148"
   },
   {
      "latitude":"41.88862379644242",
      "longitude":"-87.64125390917773"
   },
   {
      "latitude":"41.88850875482139",
      "longitude":"-87.64123789974268"
   },
   {
      "latitude":"41.88839786224243",
      "longitude":"-87.64123052366789"
   },
   {
      "latitude":"41.88828223388818",
      "longitude":"-87.64122624889727"
   },
   {
      "latitude":"41.8881757837179",
      "longitude":"-87.64122624889727"
   },
   {
      "latitude":"41.88807285394695",
      "longitude":"-87.64120101936872"
   },
   {
      "latitude":"41.88798010818836",
      "longitude":"-87.64116816230829"
   },
   {
      "latitude":"41.887874831484524",
      "longitude":"-87.6411555056345"
   },
   {
      "latitude":"41.887760083230106",
      "longitude":"-87.6411264204305"
   },
   {
      "latitude":"41.88766561918136",
      "longitude":"-87.64116598301347"
   },
   {
      "latitude":"41.88756113875833",
      "longitude":"-87.6411140152138"
   },
   {
      "latitude":"41.887463028581706",
      "longitude":"-87.64109322809394"
   },
   {
      "latitude":"41.8873554468545",
      "longitude":"-87.64109037824686"
   },
   {
      "latitude":"41.88724807467487",
      "longitude":"-87.641122480936"
   },
   {
      "latitude":"41.8871273752692",
      "longitude":"-87.64114779428358"
   },
   {
      "latitude":"41.88702897172597",
      "longitude":"-87.64116506100412"
   },
   {
      "latitude":"41.88693752516237",
      "longitude":"-87.64117042542215"
   },
   {
      "latitude":"41.886925916226474",
      "longitude":"-87.64104469687457"
   },
   {
      "latitude":"41.88683367338207",
      "longitude":"-87.64099172324653"
   },
   {
      "latitude":"41.886703209059206",
      "longitude":"-87.64093506158109"
   },
   {
      "latitude":"41.88662182077941",
      "longitude":"-87.6409969200265"
   },
   {
      "latitude":"41.8865065696108",
      "longitude":"-87.64103019618209"
   },
   {
      "latitude":"41.8863857863861",
      "longitude":"-87.64103136964853"
   },
   {
      "latitude":"41.886353348420826",
      "longitude":"-87.64101577930863"
   },
   {
      "latitude":"41.88624140810397",
      "longitude":"-87.64099792585488"
   },
   {
      "latitude":"41.88613738868561",
      "longitude":"-87.64098845430429"
   },
   {
      "latitude":"41.88603441700515",
      "longitude":"-87.64105861083384"
   },
   {
      "latitude":"41.885968786703316",
      "longitude":"-87.6411420107704"
   },
   {
      "latitude":"41.8858651444706",
      "longitude":"-87.64120839544351"
   },
   {
      "latitude":"41.88575928103354",
      "longitude":"-87.64122809291597"
   },
   {
      "latitude":"41.885676509739724",
      "longitude":"-87.6411362272572"
   },
   {
      "latitude":"41.88562211118814",
      "longitude":"-87.64103111819144"
   },
   {
      "latitude":"41.885722526388136",
      "longitude":"-87.6406237576973"
   },
   {
      "latitude":"41.88575773038146",
      "longitude":"-87.64046156787093"
   },
   {
      "latitude":"41.885795700402824",
      "longitude":"-87.64031253763254"
   },
   {
      "latitude":"41.8858254980686",
      "longitude":"-87.64018454597111"
   },
   {
      "latitude":"41.885893014298645",
      "longitude":"-87.64002109885926"
   },
   {
      "latitude":"41.8859539507347",
      "longitude":"-87.63997181326862"
   },
   {
      "latitude":"41.88603714112368",
      "longitude":"-87.6399091166329"
   },
   {
      "latitude":"41.88605750914839",
      "longitude":"-87.63986016631837"
   },
   {
      "latitude":"41.88593299597677",
      "longitude":"-87.63987600811537"
   },
   {
      "latitude":"41.885833921881286",
      "longitude":"-87.63984264814074"
   },
   {
      "latitude":"41.88580877617177",
      "longitude":"-87.63968892403658"
   },
   {
      "latitude":"41.885808021800486",
      "longitude":"-87.6395251416486"
   },
   {
      "latitude":"41.88583647836175",
      "longitude":"-87.63936244890805"
   },
   {
      "latitude":"41.88584762629297",
      "longitude":"-87.63922263876314"
   },
   {
      "latitude":"41.88581879254606",
      "longitude":"-87.63909414418752"
   },
   {
      "latitude":"41.88581296712336",
      "longitude":"-87.63895072982426"
   },
   {
      "latitude":"41.88579138372269",
      "longitude":"-87.63879281476851"
   },
   {
      "latitude":"41.88578958161351",
      "longitude":"-87.63865820140357"
   },
   {
      "latitude":"41.88581049446192",
      "longitude":"-87.63850263328071"
   },
   {
      "latitude":"41.88580320220616",
      "longitude":"-87.63837195941026"
   },
   {
      "latitude":"41.88578329518613",
      "longitude":"-87.6382489130717"
   },
   {
      "latitude":"41.885780193881956",
      "longitude":"-87.63810055338557"
   },
   {
      "latitude":"41.88578237317678",
      "longitude":"-87.63793710627372"
   },
   {
      "latitude":"41.8857863964903",
      "longitude":"-87.6378086116981"
   },
   {
      "latitude":"41.88580978200015",
      "longitude":"-87.63767684818025"
   },
   {
      "latitude":"41.88580642923888",
      "longitude":"-87.63752832085605"
   },
   {
      "latitude":"41.885765441732374",
      "longitude":"-87.63741466224904"
   },
   {
      "latitude":"41.885831910224525",
      "longitude":"-87.63732623317058"
   },
   {
      "latitude":"41.88592834994023",
      "longitude":"-87.63722804984226"
   },
   {
      "latitude":"41.88599749472168",
      "longitude":"-87.63717259288545"
   },
   {
      "latitude":"41.88606031708595",
      "longitude":"-87.63711526066776"
   },
   {
      "latitude":"41.8861534819397",
      "longitude":"-87.63701233089681"
   },
   {
      "latitude":"41.88624124046591",
      "longitude":"-87.63690588072653"
   },
   {
      "latitude":"41.88631831206557",
      "longitude":"-87.63679037810083"
   },
   {
      "latitude":"41.88637367453602",
      "longitude":"-87.63667210944708"
   },
   {
      "latitude":"41.8864238402265",
      "longitude":"-87.6365672518384"
   },
   {
      "latitude":"41.88647765204486",
      "longitude":"-87.63646482498164"
   },
   {
      "latitude":"41.88652492597875",
      "longitude":"-87.6363597997349"
   },
   {
      "latitude":"41.88656574584719",
      "longitude":"-87.63625049971755"
   },
   {
      "latitude":"41.88662538308826",
      "longitude":"-87.6361335721683"
   },
   {
      "latitude":"41.886690259018806",
      "longitude":"-87.63602687054093"
   },
   {
      "latitude":"41.88674411274668",
      "longitude":"-87.63592134238"
   },
   {
      "latitude":"41.88680421099242",
      "longitude":"-87.63582981199737"
   },
   {
      "latitude":"41.8868556758779",
      "longitude":"-87.63572872624512"
   },
   {
      "latitude":"41.886911122167376",
      "longitude":"-87.63561942622776"
   },
   {
      "latitude":"41.88698949296203",
      "longitude":"-87.63554306708987"
   },
   {
      "latitude":"41.88709590122279",
      "longitude":"-87.63558883228119"
   },
   {
      "latitude":"41.88716769222346",
      "longitude":"-87.635712549172"
   },
   {
      "latitude":"41.88721831891861",
      "longitude":"-87.63581313201006"
   },
   {
      "latitude":"41.88730385624048",
      "longitude":"-87.63587105096097"
   },
   {
      "latitude":"41.887385244520274",
      "longitude":"-87.63594397351856"
   },
   {
      "latitude":"41.88747308686551",
      "longitude":"-87.6360249427032"
   },
   {
      "latitude":"41.8875531340408",
      "longitude":"-87.63608696878667"
   },
   {
      "latitude":"41.88762953508821",
      "longitude":"-87.63615335345979"
   },
   {
      "latitude":"41.88771691642877",
      "longitude":"-87.6362012141269"
   },
   {
      "latitude":"41.88778007406917",
      "longitude":"-87.63611462906714"
   },
   {
      "latitude":"41.88782902438369",
      "longitude":"-87.63599887498434"
   },
   {
      "latitude":"41.887843064071504",
      "longitude":"-87.63585713700171"
   },
   {
      "latitude":"41.88782894056466",
      "longitude":"-87.63573518031056"
   },
   {
      "latitude":"41.88790738320142",
      "longitude":"-87.63551555292945"
   }
],
  timesArr: [
    0,
    9000,
    13000,
    17000,
    20000,
    23000,
    27000,
    30000,
    33000,
    35000,
    37000,
    40000,
    42000,
    44000,
    46000,
    47000,
    47500,
    48000,
    51000,
    54000,
    56000,
    57000,
    57950,
    60864,
    63914,
    66917,
    69918,
    84952,
    87942,
    90892,
    93890,
    96926,
    99984,
    102955,
    105914,
    109939,
    112888,
    115921,
    118938,
    121915,
    124867,
    127953,
    131948,
    134910,
    135942,
    138910,
    141915,
    144922,
    147933,
    150927,
    153940,
    156916,
    160887,
    163908,
    166967,
    169934,
    172882,
    175928,
    178903,
    181947,
    184954,
    187944,
    191896,
    195870,
    196896,
    200892,
    203887,
    206895,
    208872,
    211903,
    214951,
    217857,
    220890,
    224860,
    231905,
    236902,
    240886,
    244895,
    249885,
    252871,
    255910,
    258893,
    261874,
    264871,
    268891,
    276961,
    309990,
    314983,
    325920,
    344954,
    350020,
    353050,
    353918,
    358920,
    362892,
    366907,
    369912,
    373914,
    376912,
    380898,
    384884,
    387899,
    389926,
    391893,
    393900,
    397910,
    399897,
    402932,
    405058,
    411919,
    414896,
    419075,
    423045,
    426137,
    429060,
    432079,
    436052,
    441892,
    444905,
    448916,
    452911,
    455924,
    458923,
    461919,
    464919,
    469917,
    477938,
    483914,
    490933,
    494967,
    498934,
    500924,
    503911,
    506931,
    509910,
    512918,
    516003,
    518948,
    521934,
    524933,
    527922,
    530922,
    533956,
    536942,
    539934,
    542921,
    545930,
    549961,
    554964,
    558938,
    562903,
    566941,
    570941,
    573915,
    576929,
    580938,
    585079,
    589091,
    593093,
    597103,
    602096
 ],
}


export const numToRGBConverter = (num=0, range, minRGB = 0, maxRGB = 255, convToHex = false) => {
  var diffRGB = maxRGB - minRGB
  var r = 0;
  var g = 0;
  var b = 0;
  var convRange = range/2;
  var convNum = num - range/2;
  if (convNum >= 0){
    if (convNum > convRange/2){
      r = maxRGB
      g = diffRGB * ((convRange - convNum)/ convRange) + minRGB
    } else {
      r = diffRGB * (convNum / convRange) + minRGB
      g = maxRGB
    }
  } else {
    var nRange = (0 - convRange) / 2
    var posNum = 0 - convNum
    if (convNum < nRange){
      b = maxRGB
      g = diffRGB * ((convRange - posNum) /convRange) + minRGB
    } else {
      b = diffRGB * (posNum / convRange) + minRGB
      g = maxRGB
    }
  }
  var output = ''
  if (convToHex){
    output = [r, g, b].map(val => {
      var hexVals = {
        10: 'A',
        11: 'B',
        12: 'C',
        13: 'D',
        14: 'E',
        15: 'F',
      }
      if (val > 9){
        return hexVals[val]
      } else {
        return Math.floor(val).toString()
      }
    })
    return '#'+output.join('')
    } else {
    output = [r,g,b].map(val => {
      return Math.floor(val)
    })
    // console.log("NUM & OUTPUT", num, output)

    return 'rgb(' + output.join(",") + ')'
  }
}

export const flatten = (arr) => {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}


function generateNorthLat(lat, lat2, lng){
  let finalArr = []
  for (let i = lat; i< lat2; i+=0.0005){
    console.log(i)
   let nextVal = i.toFixed(6)
    finalArr.push({latitude: +nextVal, longitude: lng})
  }
  return finalArr
}

function generateSouthLat(lat, lat2, lng){
  let finalArr = []
  for (let i = lat; i> lat2; i-=0.0005){
    console.log(i)
   let nextVal = i.toFixed(6)
    finalArr.push({latitude: +nextVal, longitude: lng})
  }
  return finalArr
}


function generateWestLng(lat, lng, lng2){
  let finalArr = []
  for (let i = lng; i> lng2; i-=0.0005){
   console.log(i)
   let nextVal = i.toFixed(6)
    finalArr.push({latitude: lat, longitude: +nextVal})
  }
  return finalArr
}

function generateEastLng(lat, lng, lng2){
  let finalArr = []
  for (let i = lng; i< lng2; i+=0.0005){
    console.log(i)
   let nextVal = i.toFixed(6)
    finalArr.push({latitude: lat, longitude: +nextVal})
  }
  return finalArr
}
