import React, {useState} from 'react';
import {Card, CardBody, CardTitle } from 'reactstrap';

export default function Camera(props) {

    function clicked() {
        props.callback(props.name);
    }

    return(
        <div onClick={() => {clicked()}}>
            <Card>
                <CardTitle>
                    <h2>{props.name}</h2>
                </CardTitle>
                <CardBody>
                    <a>{props.url}</a>
                </CardBody>
            </Card>
        </div>
    );
}