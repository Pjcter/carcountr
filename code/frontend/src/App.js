import './App.css';
import {useState, useEffect} from 'react' 
import DatePicker from "react-datepicker";
import AddCamera from './AddCamera';
import Camera from './Camera';

import "react-datepicker/dist/react-datepicker.css";
import { ListGroup } from 'reactstrap';
import Chart from './Chart';
import Slider from './Slider';

//!!!!!CHANGE BACK TO NORMAL IF I FORGOT!!!!!!!
const DEV_DATA = true
const dev_url = "https://media.istockphoto.com/photos/generic-red-suv-on-a-white-background-side-view-picture-id1157655660?k=20&m=1157655660&s=612x612&w=0&h=WOtAthbmJ9iG1zbKo4kNUsAGMe6-xM-E7a8TMxb5xmk="
const dev_cams = {Count:2, Items: [{camera:"test",url:"https://fakeurl.com/test.mp3u8"},{camera:"RIT",url:"https://s53.nysdot.skyvdn.com/rtplive/R4_090/chunklist_w1560132765.m3u8"}]}
const BUCKET_URL = "https://carcountr-frontend-franks.s3.amazonaws.com/api_url"

//!!!!!CHANGE BACK TO NORMAL IF I FORGOT!!!!!!!

export default function App() {
  const [apiUrl, setApiUrl] = useState("");
  const [cameras, setCameras] = useState("");
  const [data, setData] = useState([])
  const [cameraName, setCameraName] = useState("")
  const [date, setDate] = useState(new Date())
  const [normal, setNormal] = useState([])
  const [ granularity, setGranularity ] = useState(0);


  const seedDevData = function() {
    let data = []
    let start = 0;
    let finish = 240;
    let date = (Math.floor(Date.now()/86400000)*86400)-72000
    while(start < finish) {
      let current_timestamp = date+(start*360)
      let current_value = Math.floor(Math.random()*10)
      start++;
      data.push({x:current_timestamp, uv:current_value, url:dev_url})
    }
    setData(data)
    setNormal(data)
  }

  useEffect(()=>{
    fetch(BUCKET_URL).then((response)=>{return response.text()}).then((text)=>setApiUrl(text)).catch((error) => console.log(error.message))
  },[])

  const getData = function(camera_name, date) {
    if(DEV_DATA) {
      seedDevData()
    }
    else {
      let now;
      if(date) {
        now = date
      }
      else {
        now = new Date()
      }
      let start = Math.floor(now.setHours(0,0,0) / 1000)
      let end = Math.floor(now.setHours(23,59,59) / 1000)
      fetch(apiUrl+`/frames?camera=${camera_name}&start=${start}&end=${end}`).then((response)=>{return response.json()}).then(
        (data) =>{
          let new_data = []
          for(let frame of data){
            let datapoint = {
              x: frame.timestamp,
              uv: frame.cars,
              url: frame.s3_url,
              boxes: frame.boxes
            }
            new_data.push(datapoint)
          }
          setData(new_data)
          setNormal(new_data)
        }
      ).catch((error) => console.log(error.message))
    }
  }

  function fetchCameras() {
    if(DEV_DATA) {
      setCameras(dev_cams)
    }
    else {
      fetch(apiUrl+"/cameras", {
        method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            setCameras(data);
      })
    }
  }

  function changeCamera(name) {
    setCameraName(name);
    setGranularity(0);
  }

  function addCamera(camera_name, url) {
    fetch(apiUrl+`/cameras?camera=${camera_name}&url=${url}`, {
      method: 'POST',
      })
      .then(response => response.json())
      .then(data => {
        fetchCameras()
    })
  }

  function deleteCamera(camera_name, url) {
    if(cameraName === camera_name) {
      changeCamera("");
    }
    fetch(apiUrl+`/cameras?camera=${camera_name}&url=${url}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        fetchCameras()
    })
   fetchCameras();
  }

  useEffect(()=>{
    fetchCameras()
  },[apiUrl])

  useEffect(()=>{
    getData(cameraName, date)
  },[apiUrl, date, cameraName])

  return (
    <div className="App">
      <div className="App-header">
        <img src="car.png" alt="CarCountr Logo" width={90} height={70}></img>
          <h1>Car Countr</h1>
      </div>
      <div className="Body-pane">
          {cameras !== "" && cameras !== undefined && cameras.Count > 0 ?
            <div className="Select-pane">
              <p className="Title">Select a Livestream</p>
              <br></br>
              <ListGroup>
              {Array.from(cameras.Items).map(camera => {
                return(<div><Camera delete={deleteCamera} callback={changeCamera} url={camera.url} name={camera.camera} key={camera.camera} selected={cameraName}></Camera><br></br></div>);
              })}
              </ListGroup>
              <AddCamera callback={addCamera}/>
            </div>              
              :
              <div className="Message-pane">
                <h1>No cameras set up!</h1>
                <AddCamera callback={addCamera}/>
              </div>
            }
          { cameraName !== "" && cameras.Count > 0 ? 
          <div className="Graph-pane">
            <div className="Title"><p>24 Hour Data for&nbsp;</p><p style={{color:"rgb(176, 217, 255)"}}>{cameraName}&nbsp;</p><p>on :</p><DatePicker selected={date} onChange={(date) => setDate(date)} /></div>
            <div className="Graph-box">
              {data.length > 0 ?
                <div>
                  <Chart data={data} date={date}/>
                  <Slider granularity={granularity} setValue={setGranularity} callback={setData} normal={normal}/>
                </div>
               : 
              <div className="Chart">No data found for selected camera on given date. Refresh if you think there should be</div>
              }
            </div>      
          </div>:<div></div>
          }
      </div>
    </div>
  );
}