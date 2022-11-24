import React from 'react';
import {Alert, Col} from 'react-bootstrap';
class Error extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            errorMessage: ""
        }
        if(props.errorMessage) {this.state.errorMessage = props.errorMessage};
    }

    render() {
        return (
            <div>
                <br/>
                <Col md="12">
                    <Alert variant="danger">
                        Backend meldet folgenden Fehler: {this.state.errorMessage}
                    </Alert>
                </Col>
                <br/>
            </div>
        );
    }
}

export default Error;