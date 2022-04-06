import React, {useState} from 'react';
import {Form, FormGroup, Input, Label, Modal, ModalHeader, ModalBody, Button} from 'reactstrap';

export default function AddCamera(props) {
    const [modal, setModal] = useState(false);
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");

    const name_format = RegExp(/^((?![_])\w|-)*?$/);

    const toggle = () => {
        if(modal) {
            setName("");
            setUrl("");
        }
        setModal(!modal);
    }
    function clicked() {
        toggle();
    }
    function handleSubmit(e) {
        e.preventDefault();
        //Validate input here
        props.callback(name, url)
        toggle();
    }
    function handleNameChange(e) {
        if(name_format.test(e.target.value)) {
            setName(e.target.value)
        }
    }
    
    function handleUrlChange(e) {
        setUrl(e.target.value)
    }
    return(
        <div onClick={() => {clicked()}}>
            <Button size="lg" className="btn-success">Add Camera</Button>
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader>
                    Add Camera
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={(e) => {handleSubmit(e)}}>
                        <FormGroup>
                            <Label>
                                Camera Name
                            </Label>
                            <Input onChange={(e) => {handleNameChange(e)}}
                                id="name"
                                name="name"
                                value={name}
                            />
                            <Label>
                                Camera URL
                            </Label>
                            <Input onChange={(e) => {handleUrlChange(e)}}
                                id="url"
                                name="url"
                                placeholder="Enter m3u8 URL Here"
                                value={url}
                            />
                        </FormGroup>
                        <Button className="btn-success" onClick={(e) => {
                            handleSubmit(e)
                        }}>Submit</Button>
                    </Form>
                </ModalBody>
            </Modal>
        </div>
    );
}