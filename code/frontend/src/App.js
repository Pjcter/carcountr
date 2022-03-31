import './App.css';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Label} from 'recharts';
import {useState, useEffect} from 'react' 
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const getTicks = function(timestamp){
  let date = new Date(timestamp.getTime())
  console.log(date)
  let ticks = []
  for(let i = 0; i<24; i++){
    let tick = date.setHours(i,0,0) / 1000
    ticks.push(tick)
  }
  console.log(ticks)
  return ticks
}

const BUCKET_URL = "https://carcountr-frontend.s3.amazonaws.com/api_url"

function addCamera(){
  alert("Adding cameras is not currently supported. Please select a listed camera.")
}

function App() {

  const [apiUrl, setApiUrl] = useState()
  useEffect(()=>{
    fetch(BUCKET_URL).then((response)=>{return response.text()}).then((text)=>setApiUrl(text))
  },[])

  const [data, setData] = useState([])
  const [cameraName, setCameraName] = useState('camera_1')
  const [date, setDate] = useState(new Date())

  const getData = function(camera_name, date){
    let now;
    if(date){
      now = date
    }
    else{
      now = new Date()
    }
    let start = now.setHours(0,0,0) / 1000
    let end = now.setHours(23,59,59) / 1000
    fetch(apiUrl+`/frames?camera=${camera_name}&start=${start}&end=${end}`).then((response)=>{return response.json()}).then(
      (data) =>{
        let new_data = []
        for(let frame of data){
          let time = new Date(parseInt(frame.timestamp)*1000)
          console.log(frame.timestamp)
          console.log(time)
          let datapoint = {
            x: frame.timestamp,
            uv: frame.cars
          }
          new_data.push(datapoint)
        }
        setData(new_data)
      }
    )
  }
  useEffect(()=>{
    getData(cameraName, date)
  },[apiUrl, date, cameraName])

  return (
    <div className="App">
      <header className="App-header">
        <img src="car.png" alt="CarCountr Logo" width={150}></img>
        <div>
          <h1>Car Countr</h1>
          <h4>Pick a camera to see its historical car data</h4>
        </div>
      </header>
      <body>
        <div className="Body-pane">
          <div className="Select-pane">
            <p className="Title">Select a Camera</p>
            <div className="Select-box">
              <select id="mySelect" size={10}>
                <option>St. Peters Ave Intersection, Miami FL</option>
                <option className="Add-Cam" onClick={addCamera}> + Add a Camera</option>
              </select>
            </div>
          </div>
          <div className="Graph-pane">
            <div className="Title"><p>24 Hour Data for St. Peters Ave Intersection, Miami Fl on :</p><DatePicker selected={date} onChange={(date) => setDate(date)} /></div>
            
            <div className="Graph-box">
              {
                (()=>{
                  if(data.length==0){
                    return <div className="Chart">No data found for selected camera on given date</div>
                  }
                  else{
                    return (
                      <LineChart className="Chart" width={1200} height={550} data={data}>
                      <Line type="monotone" dataKey="uv" stroke="#8884d8" />
                      <CartesianGrid stroke="#2a406d"/>
                      <XAxis
                        dataKey='x'
                        domain={[getTicks(date)[0],getTicks(date)[23]]}
                        type='number'
                        ticks={getTicks(date)}
                        tickCount={24}
                        interval={0}
                        fontSize={14}
                        tickFormatter={(tick)=>{
                          let date = new Date(tick*1000)
                          let period = "PM"
                          if(date.getHours()<12){
                            period = "AM"
                            if(date.getHours()==0){
                              date.setHours(12)
                            }
                          }
                          else if(date.getHours()>12){
                            date.setHours(date.getHours()-12)
                          }
                          return `${date.getHours()} ${period}`
                        }}
                        height={60}
                      >
                        <Label value="Time of Day" offset={5} position="insideBottom" fontSize="1.5em" stroke="#2a406d"/>
                      </XAxis>
                      <YAxis  >
                        <Label value="Cars" position="insideLeft" fontSize="1.5em" angle={-90} stroke="#2a406d"/>
                      </YAxis>
                    </LineChart>
                    )
                  }
                })()
              }
            </div>
          </div>
        </div>
      </body>
    </div>
  );
}

export default App;
