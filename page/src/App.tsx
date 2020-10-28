import React, { useEffect, useState } from 'react';
import './App.css';
import { Controlled as CodeMirror } from 'react-codemirror2';
import {
  Address,
  ATV,
  BtcBlock,
  BtcTx,
  Coin,
  MerklePath,
  Output,
  PublicationData,
  ReadStream,
  Sha256Hash,
  VbkBlock,
  VbkMerklePath,
  VbkPopTx,
  VbkTx,
  VTB,
} from '@veriblock/nodecore-parser';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Container, Form, Row } from 'react-bootstrap';

require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');
require('codemirror/theme/neat.css');
require('codemirror/mode/xml/xml.js');
require('codemirror/mode/javascript/javascript.js');

const streamWrap = (f: any) => {
  return (str: string) => {
    return f(new ReadStream(str));
  };
};

const entitiesReadParsers = {
  vtb: streamWrap(VTB.read),
  atv: streamWrap(ATV.read),
  address: streamWrap(Address.read),
  btctx: streamWrap(BtcTx.read),
  coin: streamWrap(Coin.read),
  output: streamWrap(Output.read),
  publicationdata: streamWrap(PublicationData.read),
  vbkmerklepath: streamWrap(VbkMerklePath.read),
  vbkblock: streamWrap(VbkBlock.read),
  vbktx: streamWrap(VbkTx.read),
  vbkpoptx: streamWrap(VbkPopTx.read),
};

const extractOrRead = (raw: boolean, data: string, extract: any, read: any) => {
  if (raw) {
    return streamWrap(extract)(data);
  } else {
    return streamWrap(read)(data);
  }
};

const decode = (
  data: string,
  raw: boolean,
  entity: string,
  subject: string
) => {
  if (entity === 'vbkblock') {
    return extractOrRead(raw, data, VbkBlock.extract, VbkBlock.read);
  }

  if (entity === 'btcblock') {
    return extractOrRead(raw, data, BtcBlock.extract, BtcBlock.read);
  }

  if (entity === 'merklepath') {
    const sub = Sha256Hash.fromHex(subject);
    return extractOrRead(
      raw,
      data,
      (s: ReadStream) => MerklePath.extract(s, sub),
      (s: ReadStream) => MerklePath.read(s, sub)
    );
  }

  if (entity in entitiesReadParsers) {
    // @ts-ignore
    return entitiesReadParsers[entity](data);
  }

  throw new Error('undefined entity type');
};

const codeOptions = {
  mode: 'string',
  theme: 'material',
  lineWrapping: true,
  lineNumbers: true,
};

const jsonOptions = {
  mode: {
    name: 'javascript',
    json: true,
  },
  theme: 'material',
  lineNumbers: true,
  lineWrapping: true,
  readOnly: 'nocursor',
};

function App() {
  const [subject, setSubject] = useState(
    '0000000000000000000000000000000000000000000000000000000000000000'
  );
  const [raw, setRaw] = useState(true);
  const [entity, setEntity] = useState('btcblock');
  const [decoded, setDecoded] = useState('');
  const [needSubject, setNeedSubject] = useState(false);
  const [hex, setHex] = useState(
    '000040203f8e3980304439d853c302f6e496285e110e251251531300000000000000000039a72c22268381bd8d9dcfe002f472634a24cf0454de8b50f89e10891e5ffb1de08d9b5c6c1f2c1744290a92'
  );
  useEffect(() => {
    setNeedSubject(entity === 'vbkmerklepath' || entity === 'merklepath');

    try {
      const d = decode(hex, raw, entity, subject);
      setDecoded(JSON.stringify(d, null, 2));
    } catch (e) {
      setDecoded(`${e.stack}`);
    }
  }, [hex, raw, entity, subject]);

  return (
    <Container className="App">
      <Row className="menu">
        <Col xs={6}>
          <Form.Group controlId="formEntity">
            <Form.Label>Entity</Form.Label>
            <select
              value={entity}
              className="form-control"
              onChange={e => setEntity(e.target.value)}
            >
              <option value="atv">ATV</option>
              <option value="vtb">VTB</option>
              <option value="publicationdata">PublicationData</option>
              <option value="btcblock">BtcBlock</option>
              <option value="vbkblock">VbkBlock</option>
              <option value="address">Address</option>
              <option value="coin">Coin</option>
              <option value="merklepath">MerklePath</option>
              <option value="output">Output</option>
              <option value="vbkpoptx">VbkPopTx</option>
              <option value="vbktx">VbkTx</option>
              <option value="btctx">BtcTx</option>
            </select>
          </Form.Group>
        </Col>
        <Col xs={6}>
          <Form.Group controlId="formSubject">
            <Form.Label>Subject</Form.Label>
            <Form.Control
              type="text"
              value={subject}
              disabled={!needSubject}
              onChange={(e: any) => setSubject(e.target.value)}
              placeholder="Sha256 hexstring..."
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Check
            checked={raw}
            onChange={(e: any) => setRaw(e.target.checked)}
            type="checkbox"
            label="Raw"
          />
        </Col>
      </Row>
      <Row className="left">
        <Col>
          <CodeMirror
            value={hex}
            options={codeOptions}
            onBeforeChange={(editor, data, value) => {
              setHex(value);
            }}
            onChange={(editor, value) => {}}
          />
        </Col>
      </Row>
      <Row className="right">
        <Col>
          <CodeMirror
            value={decoded}
            options={jsonOptions}
            onBeforeChange={(editor, data, value) => {}}
            onChange={(editor, value) => {}}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
