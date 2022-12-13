import React from 'react';
import {Alert, Col, Table} from "react-bootstrap";

class GetInvoices extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            error: false,
            invoicesList: []
        };

        if (props.error) {
            this.state.error = props.error
        }
        if (props.invoicesList) {
            this.state.invoicesList = props.invoicesList
            console.log(this.state.invoicesList[0].login_name)
        }
    }

    renderTable() {
        if(this.state.invoicesList.length > 0){
            return this.state.invoicesList.map(function(invoice){
                if (invoice.bezahlt) {invoice.bezahlt = "Ja"} else {invoice.bezahlt = "Nein"};
                if (invoice.storniert) {invoice.storniert = "Ja"} else {invoice.storniert = "Nein"};
                if (invoice.gutschrift) {invoice.gutschrift = "Ja"} else {invoice.gutschrift = "Nein"};
                return(
                    <tr>
                        <td>{invoice.rechnungsNummer}</td>
                        <td>{invoice.buchungsNummer}</td>
                        <td>{invoice.rechnungsDatum}</td>
                        <td>{invoice.vorname}</td>
                        <td>{invoice.nachname}</td>
                        <td>{invoice.fahrzeugTyp}</td>
                        <td>{invoice.fahrzeugModel}</td>
                        <td>{invoice.dauerDerBuchung}</td>
                        <td>{invoice.preisBrutto}</td>
                        <td>{invoice.preisNetto}</td>
                        <td>{invoice.bezahlt}</td>
                        <td>{invoice.storniert}</td>
                        <td>{invoice.gutschrift}</td>
                    </tr>
                )
            })
        } else {
            return []
        }
    }

    render() {
        return (
            <div>
                <br/>
                <h2>Liste Rechnungen </h2>
                <Col md="16">
                    <Alert variant="danger" show={this.state.error} >
                        Abfrage an Invoices ist fehlgeschlagen
                    </Alert>
                </Col>
                <Table hidden={this.state.error} striped bordered hover>
                    <thead>
                    <tr>
                        <th>Rechnungsnummer</th>
                        <th>Reservierung</th>
                        <th>Rechnungsdatum</th>
                        <th>Vorname</th>
                        <th>Nachname</th>
                        <th>Fahrzeug Typ</th>
                        <th>Fahrzeug Modell</th>
                        <td>Dauer der Buchung</td>
                        <th>Preis Netto €</th>
                        <th>Preis Brutto €</th>
                        <th>Bezahlt ?</th>
                        <th>Storniert ?</th>
                        <th>Gutschrift ?</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.renderTable()}
                    </tbody>
                </Table>
            </div>
        );
    }
}

export default GetInvoices
