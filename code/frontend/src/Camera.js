import React, {useState} from 'react';
import {Modal, ModalHeader, ModalBody, Button, Tooltip } from 'reactstrap';

export default function Camera(props) {

    const [modal, setModal] = useState(false);

    function clicked() {
        props.callback(props.name);
    }

    const [tooltip,setTooltip] = useState(false);
    const toggleTooltip = () => {
        setTooltip(!tooltip);
    }
    const toggle = () => {
        if(modal) {

        }
        setModal(!modal);
    }
    function handleSubmit(e) {
        e.preventDefault();
        //Validate input here
        props.delete(props.name, props.url)
        toggle();
    }
    return(
        <div onClick={() => {clicked()}}>
            <div className={props.selected === props.name ? "Livestream-selected": "Livestream"}>
                <div className="Livestream-header">
                    <div onClick={()=> {toggle();}} className="Delete">&#x2715;</div>
                    <h2>{props.name}</h2>
                </div>
                <br></br>
                <div style={{overflow:"hidden"}} id={"urlTooltip"+props.name}>{props.url.length > 40 ? props.url.substr(0,40) +"   ..." : props.url} <Tooltip isOpen={tooltip} target={"urlTooltip"+props.name} toggle={toggleTooltip}>{props.url}</Tooltip></div>
            </div>
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader>
                    Delete Livestream
                </ModalHeader>
                <ModalBody>
                    Are you sure you want to remove livestream {props.name}?
                    <br></br>
                    <br></br>
                        <Button className="btn-secondary" onClick={()=>{toggle();}}>
                            Cancel
                        </Button> &nbsp;
                        <Button className="btn-danger" onClick={(e) => {
                            handleSubmit(e)
                        }}>Delete</Button>
                </ModalBody>
            </Modal>
        </div>
    );
}