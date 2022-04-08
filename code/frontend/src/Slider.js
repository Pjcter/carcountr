import React from 'react';
import {Form, FormGroup, Input, Label} from 'reactstrap';
import {largestTriangleThreeBucket} from 'd3fc-sample'

export default function Slider(props) {
    const [ granularity, setGranularity ] = React.useState(0);
    const normal = props.normal
    const sampler = largestTriangleThreeBucket();

    function downSample(amount) {
        if(amount < 1) {
            props.callback(normal);
        }
        else {
            sampler.x((d) => { return d.x; })
                .y((d) => { return d.uv; });
            sampler.bucketSize(amount*1.3);

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
                    value={granularity}
                    onChange={e => {
                        setGranularity(e.target.value)
                        downSample(e.target.value)
                    }
                    }
                    />
                </FormGroup>
            </Form>
        </div>
    );
}