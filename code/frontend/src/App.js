import './App.css';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Label} from 'recharts';
import {useState, useEffect} from 'react' 
import DatePicker from "react-datepicker";
import AddCamera from './AddCamera';
import Camera from './Camera';

import "react-datepicker/dist/react-datepicker.css";
import { ListGroup } from 'reactstrap';
import Chart from './Chart';

//!!!!!CHANGE BACK TO NORMAL IF I FORGOT!!!!!!!

const BUCKET_URL = "https://carcountr-frontend.s3.amazonaws.com/api_url"

//!!!!!CHANGE BACK TO NORMAL IF I FORGOT!!!!!!!

export default function App() {
  const [apiUrl, setApiUrl] = useState("");
  const [cameras, setCameras] = useState("");
  const [data, setData] = useState([])
  const [cameraName, setCameraName] = useState('camera')
  const [date, setDate] = useState(new Date())
  useEffect(()=>{
    fetch(BUCKET_URL).then((response)=>{return response.text()}).then((text)=>setApiUrl(text))
  },[])

  const getData = function(camera_name, date) {
    let now;
    if(date){
      now = date
    }
    else{
      now = new Date()
    }
    let start = Math.floor(now.setHours(0,0,0) / 1000)
    let end = Math.floor(now.setHours(23,59,59) / 1000)
    fetch(apiUrl+`/frames?camera=${camera_name}&start=${start}&end=${end}`).then((response)=>{return response.json()}).then(
      (data) =>{
        console.log(data)
        let new_data = []
        for(let frame of data){
          let time = new Date(parseInt(frame.timestamp)*1000)
          let datapoint = {
            x: frame.timestamp,
            uv: frame.cars,
            url: frame.s3_url
          }
          new_data.push(datapoint)
        }
        setData(new_data)
      }
    )
  }

  function fetchCameras() {
    fetch(apiUrl+"/cameras", {
      method: 'GET',
      })
      .then(response => response.json())
      .then(data => {
          setCameras(data);
    })
  }

  function changeCamera(name) {
    setCameraName(name);
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

  useEffect(()=>{
    fetchCameras()
  },[apiUrl])

  useEffect(()=>{
    getData(cameraName, date)
  },[apiUrl, date, cameraName])

  return (
    <div className="App">
      <header className="App-header">
        <img src="car.png" alt="CarCountr Logo" width={90} height={70}></img>
          <h1>Car Countr</h1>
      </header>
      <div className="Body-pane">
          <div className="Select-pane">
            <p className="Title">Select a Livestream</p>
            {cameras !== "" && cameras !== undefined && cameras.Count > 0 ?
              <ListGroup>
              {Array.from(cameras.Items).map(camera => {
                return(<Camera callback={changeCamera} url={camera.url} name={camera.camera} key={camera.camera}></Camera>);
              })}
              </ListGroup>
              :
              <p>No cameras set up</p>
            }
            <AddCamera callback={addCamera}/>
          </div>
          <div className="Graph-pane">
            <div className="Title"><p>24 Hour Data for {cameraName} on :</p><DatePicker selected={date} onChange={(date) => setDate(date)} /></div>
            <div className="Graph-box">
              {data.length > 0 ? 
              <Chart data={data} date={date}/> : 
              <div className="Chart">No data found for selected camera on given date</div>
              }
            </div>
          </div>
        </div>
    </div>
  );
}