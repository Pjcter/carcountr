import React, { useState } from 'react';
import {Form, FormGroup, Input, Label} from 'reactstrap';
import './Options.css'

export default function Options(props) {
    const [saved] = useState([...props.normal]);

    function smooth(answer) {
        props.callback(props.normal);
        if(answer === false) {
            props.callback(props.normal);
        }
        else {
            let data = [];
            for(let point of saved) {
                let offset = saved.indexOf(point)
                let average = 0;
                for(let index = offset-2; index < offset+2; index++) {
                    if(saved[index] !== undefined) {
                        average += saved[index].uv;
                    }
                }
                if(average !== 0) {
                    let newpoint = point;
                    newpoint.uv = average/4;
                    data.push(newpoint);
                }
                else {
                    data.push(point);
                }
            }
            console.log("setting data to a special COPY of the normal")
            props.callback(saved);
        }
    }

    return(
        <div className='Options'>
            <Form>
                <FormGroup check>
                    <Label check>
                        Smoothed
                    </Label>
                    <Input
                        type="checkbox"
                        checked={props.granularity}
                        onChange={e => {
                            props.setValue(e.target.checked)
                            smooth(e.target.checked)
                        }
                        }
                    />
                </FormGroup>
            </Form>
        </div>
    );
}