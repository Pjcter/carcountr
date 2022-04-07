import React, {useState} from 'react';
import {Modal, ModalHeader, ModalBody, Button } from 'reactstrap';

export default function Camera(props) {

    const [modal, setModal] = useState(false);

    function clicked() {
        props.callback(props.name);
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
                    <div onClick={()=> {toggle();}} className="Delete">x</div>
                    <h2>{props.name}</h2>
                </div>
                <br></br>
                <p style={{overflowWrap:"break-word"}}>{props.url}</p>
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