import './App.css';
import { LineChart, Line, CartesianGrid, XAxis, YAxis , Text, Label} from 'recharts';

const data = [{name: '12:00 AM', uv: 5},{name: '1:00 AM', uv: 15},{name: '2:00 AM', uv: 4}];

function addCamera(){
  alert("Adding cameras is not currently supported. Please select a listed camera.")
}

function App() {
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
            <p className="Title">24 Hour Data for St. Peters Ave Intersection, Miami Fl on 3/30/2022</p>
            <div className="Graph-box">
              <LineChart className="Chart" width={1200} height={550} data={data}>
                <Text>24 hour data for St. Peters Ave Intersection, Miami FL</Text>
                <Line type="monotone" dataKey="uv" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" height={70} >
                  <Label value="Time of Day" offset={5} position="insideBottom" fontSize="1.5em" stroke="#2a406d"/>
                </XAxis>
                <YAxis  >
                  <Label value="Cars" position="insideLeft" fontSize="1.5em" angle={-90} stroke="#2a406d"/>
                </YAxis>
              </LineChart>
            </div>
          </div>
        </div>
      </body>
    </div>
  );
}

export default App;
