import React, {useState} from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Label, Tooltip } from 'recharts';
import {Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import BoundedImage from './BoundedImage'
import useWindowDimensions from './windowDimensions';

export default function Chart(props) {

    function CustomTooltip({ payload, label, active }) {
        if (active && payload) {
          let time = new Date(payload[0].payload.x*1000)
          let period = "PM"
          if(time.getHours()<12){
            period = "AM"
            if(time.getHours()===0){
              time.setHours(12)
            }
          }
          else if(time.getHours()>12){
            time.setHours(time.getHours()-12)
          }
          let timestr = `${time.getHours()}:${time.getMinutes() < 10 ? "0" : ""}${time.getMinutes()}${period}`
          return (
            <div className="custom-tooltip">
              <p className="label">{`${timestr} - ${payload[0].value} Cars`}</p>
              <img src={getImage(label)} alt="Thumbnail" width={150}></img>
            </div>
          );
        }
      
        return null;
      }

      function getImage(timestamp) {
          for(let data of props.data) {
              if(data.x === timestamp) {
                  return data.url;
              }
          }
      }

      const getTicks = function(timestamp) {
        let date = new Date(timestamp.getTime())
        let ticks = []
        for(let i = 0; i<25; i++){
          let tick = date.setHours(i,0,0) / 1000
          ticks.push(tick)
        }
        return ticks
      }

      const [modal, setModal] = useState(false);
      const [selectedDot, setSelectedDot] = useState({x:0, url:""})
      const { height, width } = useWindowDimensions();

      const toggle = (data, index) => {
        setSelectedDot(index.payload)
        setModal(!modal);
      }

    return (
      <div>
        {props.smoothed === true ? 
        //Moving average chart
  
        <LineChart data={props.data} width={width/1.8} height={height/1.7}>
        <Line        
          type="monotone"
          dataKey="uv"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
        />
        <CartesianGrid stroke="#2a406d"/>
        <XAxis
          dataKey='x'
          domain={[getTicks(props.date)[0],getTicks(props.date)[23]]}
          type='number'
          ticks={getTicks(props.date)}
          tickCount={25}
          interval={0}
          fontSize={13}
          tickFormatter={(tick)=>{
            let date = new Date(tick*1000)
            let period = "PM"
            if(date.getHours()<12){
              period = "AM"
              if(date.getHours()===0){
                date.setHours(12)
              }
            }
            else if(date.getHours()>12){
              date.setHours(date.getHours()-12)
            }
            return `${date.getHours()}${period}`
          }}
          height={60}
        >
          <Label value="Time of Day" offset={5} position="insideBottom" fontSize="1.5em" stroke="#2a406d"/>
        </XAxis>
        <YAxis width={80} domain={['auto', 'auto']} type='number' allowDecimals='false'>
          <Label value={"Test"} position="insideLeft" fontSize="1.5em" offset={5} stroke="#2a406d"/>
        </YAxis>
      </LineChart>

        //Regualr chart
        : 
        <LineChart data={props.data} width={width/1.8} height={height/1.7}>
        <Line        
          activeDot={{ onClick: toggle }}
          type="monotone"
          dataKey="uv"
          stroke="#8884d8"
          strokeWidth={2}
        />
        <CartesianGrid stroke="#2a406d"/>
        <XAxis
          dataKey='x'
          domain={[getTicks(props.date)[0],getTicks(props.date)[23]]}
          type='number'
          ticks={getTicks(props.date)}
          tickCount={25}
          interval={0}
          fontSize={13}
          tickFormatter={(tick)=>{
            let date = new Date(tick*1000)
            let period = "PM"
            if(date.getHours()<12){
              period = "AM"
              if(date.getHours()===0){
                date.setHours(12)
              }
            }
            else if(date.getHours()>12){
              date.setHours(date.getHours()-12)
            }
            return `${date.getHours()}${period}`
          }}
          height={60}
        >
          <Label value="Time of Day" offset={5} position="insideBottom" fontSize="1.5em" stroke="#2a406d"/>
        </XAxis>
        <YAxis width={80} domain={['auto', 'dataMax+2']} type='number'>
          <Label value="Cars" position="insideLeft" fontSize="1.5em" offset={5} stroke="#2a406d"/>
        </YAxis>
        <Tooltip content={<CustomTooltip />}/>
      </LineChart>
        }
        <Modal isOpen={modal} toggle={() => {setModal(false)}} size={"lg"} centered> 
                <ModalHeader>
                    {
                      (()=>{
                        let date = new Date(selectedDot.x*1000)
                        let period = "PM"
                        if(date.getHours()<12){
                          period = "AM"
                          if(date.getHours()===0){
                            date.setHours(12)
                          }
                        }
                        else if(date.getHours()>12){
                          date.setHours(date.getHours()-12)
                        }
                        return `${date.getHours()}:${date.getMinutes() < 10 ? "0" : ""}${date.getMinutes()} ${period} - ${selectedDot.uv} cars detected`
                      }
                      )()
                    }
                </ModalHeader>
                <ModalBody>
                    <BoundedImage boxes={selectedDot.boxes} url={selectedDot.url}></BoundedImage>
                    <br></br>
                    <br></br>
                        <Button className="btn-info" onClick={() => {setModal(false)}}>
                            Back
                        </Button>
                </ModalBody>
            </Modal>
      </div>
      )
}