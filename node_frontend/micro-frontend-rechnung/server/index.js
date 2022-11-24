import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import * as std from 'std';
import * as http from 'wasi_http';
import * as net from 'wasi_net';
import {makeRequest, parseCookies, checkCookies} from '../src/utils/ApiHelper.js'
import Cache from '../src/utils/cache.js'

// Import React Komponenten
import GetInvoices from '../src/components/GetInvoices.js'
import Error from "../src/components/Error.js";

let cache = new Cache(10000, 2000);

let rechnungsVerwaltungMsHost = "localhost";
let rechnungsVerwaltungMsPort = "8001";

let benutzerVerwaltungMsHost = "localhost";
let benutzerVerwaltungMsPort = "8000";

async function handle_client(cs) {
    let buffer = new http.Buffer();
    let parameter;

    while (true) {
        try {
            let d = await cs.read();
            if (d == undefined || d.byteLength <= 0) {
                return;
            }
            buffer.append(d);
            parameter = new TextDecoder().decode(buffer);
            let req = buffer.parseRequest();
            if (req instanceof http.WasiRequest) {
                handle_req(cs, req, parameter);
                break;
            }
        } catch (e) {
            print(e);
        }
    }
}

function enlargeArray(oldArr, newLength) {
    let newArr = new Uint8Array(newLength);
    oldArr && newArr.set(oldArr, 0);
    return newArr;
}

async function handle_req(s, req, parameter) {

    print('Rechnungsverwaltung Micro-Frontend: Uri ist:', req.uri)
    print('Rechnungsverwaltung Micro-Frontend: Request Method ist:', req.method)

    let contentType = '';

    let resp = new http.WasiResponse();
    let content = std.loadFile('./build/index.html');

    if(req.uri == '/Invoices' && req.method.toUpperCase() === "GET") {
        let app;
        let cookieList = parseCookies(req.headers["cookie"]);
        if(await checkCookies(cookieList, cache, false, benutzerVerwaltungMsHost, benutzerVerwaltungMsPort)) {
            let response = await makeRequest(null, { 'Content-Type': 'application/json', 'login_name': cookieList.login_name, 'auth_token': cookieList.auth_token},
                rechnungsVerwaltungMsHost, rechnungsVerwaltungMsPort, "/getInvoiceByUser", "GET");
            if(response) {
                try {
                    console.log("ALLES GUT");
                    let invoiceList = JSON.parse(response);
                    app = ReactDOMServer.renderToString(<GetInvoices invoicesList={invoiceList} />);
                } catch (e) {
                    console.log("ERRROR: " + e);
                }


            } else {
                app = ReactDOMServer.renderToString(<Error errorMessage={"Entweder ist der Nutzer nicht authorisiert oder die Abfrage an die Benutzerverwaltung schlug fehl"}/>);
                resp.status = 401
            }

            content = content.replace('<div id="root"></div>', `<div id="root">${app}</div>`);
        } else {
            resp.status = 401
            app = ReactDOMServer.renderToString(<Error errorMessage={"Entweder ist der Nutzer nicht authorisiert oder die Abfrage an die Benutzerverwaltung schlug fehl"}/>);
        }
        content = content.replace('<div id="root"></div>', `<div id="root">${app}</div>`);

    }

    else {
        let chunk = 1000; // Chunk size of each reading
        let length = 0; // The whole length of the file
        let byteArray = null; // File content as Uint8Array

        // Read file into byteArray by chunk
        let file = std.open('./build' + req.uri, 'r');
        while (true) {
            byteArray = enlargeArray(byteArray, length + chunk);
            let readLen = file.read(byteArray.buffer, length, chunk);
            length += readLen;
            if (readLen < chunk) {
                break;
            }
        }
        content = byteArray.slice(0, length).buffer;
        file.close();
    }
    if(contentType == '') {
        contentType = 'text/html; charset=utf-8';
    }

    if (req.uri.endsWith('.css')) {
        contentType = 'text/css; charset=utf-8';
    } else if (req.uri.endsWith('.js')) {
        contentType = 'text/javascript; charset=utf-8';
    } else if (req.uri.endsWith('.json')) {
        contentType = 'text/json; charset=utf-8';
    } else if (req.uri.endsWith('.ico')) {
        contentType = 'image/vnd.microsoft.icon';
    } else if (req.uri.endsWith('.png')) {
        contentType = 'image/png';
    }
    resp.headers = {
        'Content-Type': contentType
    };

    let r = resp.encode(content);
    s.write(r);
}

async function server_start() {
    print('listen 8102...');
    try {
        let s = new net.WasiTcpServer(8102);
        for (var i = 0; ; i++) {
            let cs = await s.accept();
            handle_client(cs);
        }
    } catch (e) {
        print(e);
    }
}

server_start();