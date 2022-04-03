import React, {useState} from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Label, Tooltip} from 'recharts';

export default function Chart(props) {

    function CustomTooltip({ payload, label, active }) {
        if (active) {
          return (
            <div className="custom-tooltip">
              <p className="label">{`Cars: ${payload[0].value}`}</p>
              <img src={getImage(label)}></img>
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
        for(let i = 0; i<24; i++){
          let tick = date.setHours(i,0,0) / 1000
          ticks.push(tick)
        }
        return ticks
      }

    return (
        <LineChart className="Chart" width={1000} height={560} data={props.data}>
        <Line type="monotone" dataKey="uv" stroke="#8884d8" />
        <CartesianGrid stroke="#2a406d"/>
        <XAxis
          dataKey='x'
          domain={[getTicks(props.date)[0],getTicks(props.date)[23]]}
          type='number'
          ticks={getTicks(props.date)}
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
          <Label value="Cars" position="insideLeft" fontSize="1.5em" offset={-20} stroke="#2a406d"/>
        </YAxis>
        <Tooltip content={<CustomTooltip />}/>
      </LineChart>
      )
}