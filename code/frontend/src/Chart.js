import React, {useState} from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Label, Tooltip} from 'recharts';

export default function Chart(props) {

    function CustomTooltip({ payload, label, active }) {
        if (active) {
          let time = new Date(payload[0].payload.x*1000)
          let period = "PM"
          if(time.getHours()<12){
            period = "AM"
            if(time.getHours()==0){
              time.setHours(12)
            }
          }
          else if(time.getHours()>12){
            time.setHours(time.getHours()-12)
          }
          let timestr = `${time.getHours()}:${time.getMinutes()}${period}`
          return (
            <div className="custom-tooltip">
              <p className="label">{`${timestr} - ${payload[0].value} Cars`}</p>
              <img src={getImage(label)} width={150}></img>
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

      const getTicks = function(timestamp){
        let date = new Date(timestamp.getTime())
        let ticks = []
        for(let i = 0; i<25; i++){
          let tick = date.setHours(i,0,0) / 1000
          ticks.push(tick)
        }
        return ticks
      }

    return (
        <LineChart className="Chart" width={1100} height={600} data={props.data}>
        <Line type="monotone" dataKey="uv" stroke="#8884d8" />
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
              if(date.getHours()==0){
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
        <YAxis width={80}>
          <Label value="Cars" position="insideLeft" fontSize="1.5em" offset={5} stroke="#2a406d"/>
        </YAxis>
        <Tooltip content={<CustomTooltip />}/>
      </LineChart>
      )
}