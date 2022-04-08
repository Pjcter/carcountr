import React from 'react';
import {Form, FormGroup, Input, Label} from 'reactstrap';
import {largestTriangleThreeBucket, modeMedian} from 'd3fc-sample'

export default function Slider(props) {
    const sampler = largestTriangleThreeBucket();
    const median = modeMedian();

    function downSample(amount) {
        if(amount < 1) {
            props.callback(props.normal);
        }
        else if(amount == 10) {
            props.callback(median(props.normal))
        }
        else {
            sampler.bucketSize(amount);
            sampler.x((d) => { return d.x; })
                .y((d) => { return d.uv; });

            // Run the sampler
            props.callback(sampler(props.normal));
        }
      }

    return(
        <div>
            <Form>
                <FormGroup>
                    <Label for="exampleRange">
                    Granularity
                    </Label>
                    <Input
                    id="exampleRange"
                    name="range"
                    type="range"
                    min={0}
                    max={10}
                    value={props.granularity}
                    onChange={e => {
                        props.setValue(e.target.value)
                        downSample(e.target.value)
                    }
                    }
                    />
                </FormGroup>
            </Form>
        </div>
    );
}