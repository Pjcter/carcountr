import React from 'react';
import {Form, FormGroup, Input, Label} from 'reactstrap';
import './Options.css'

export default function Options(props) {
    function smooth(answer) {
        if(answer === false) {
            props.reset();
        }
        else {
            let mutated = [...props.normal];
            let data = [];
            let max = 0;
            for(let point of mutated) {
                let offset = mutated.indexOf(point)
                let average = 0;
                for(let index = offset-2; index < offset+2; index++) {
                    if(mutated[index] !== undefined) {
                        average += mutated[index].uv;
                    }
                }
                if(average !== 0) {
                    if(average > max) {
                        max = average;
                    }
                    let newpoint = point;
                    newpoint.uv = average/4;
                    data.push(newpoint);
                }
                else {
                    data.push(point);
                }
            }
            props.callback(data);
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