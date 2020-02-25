import React, { useState } from 'react';
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
  VbkBlock,
  VbkMerklePath,
  VbkPopTx,
  VbkTx,
  VTB,
} from '@veriblock/nodecore-parser';
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

const decode = (data: string, raw: boolean, entity: string) => {
  if (entity === 'vbkblock') {
    return extractOrRead(raw, data, VbkBlock.extract, VbkBlock.read);
  }

  if (entity === 'btcblock') {
    return extractOrRead(raw, data, BtcBlock.extract, BtcBlock.read);
  }

  if (entity in entitiesReadParsers) {
    // @ts-ignore
    return entitiesReadParsers[entity](data);
  }

  throw new Error('undefined entity type');
};

const options = {
  mode: 'string',
  theme: 'material',
  lineWrapping: true,
  lineNumbers: true,
};

function App() {
  const [subject, setSubject] = useState('');
  const [raw, setRaw] = useState(false);
  const [entity, setEntity] = useState('btcblock');
  const [hex, setHex] = useState(
    '000040203f8e3980304439d853c302f6e496285e110e251251531300000000000000000039a72c22268381bd8d9dcfe002f472634a24cf0454de8b50f89e10891e5ffb1de08d9b5c6c1f2c1744290a92'
  );
  const [decoded, setDecoded] = useState('');
  const [needSubject, setNeedSubject] = useState(false);

  setNeedSubject(entity === 'merklepath' || entity === 'vbkmerklepath');

  return (
    <div className="App">
      <div className="menu">
        <select id="entity" onChange={e => setEntity(e.target.value)}>
          <option value="btcblock">BtcBlock</option>
          <option value="vbkblock">VbkBlock</option>
        </select>
        <input
          type="checkbox"
          id="raw"
          name="raw"
          value="Raw"
          onChange={e => setRaw(e.target.checked)}
        />
        <label htmlFor="raw">Raw</label>
        {needSubject && (
          <div className="subject">
            <input type="text" id="subject" name="subject" value={subject} />
            <label htmlFor="subject">Subject</label>
          </div>
        )}
      </div>
      <div className="left">
        <CodeMirror
          value={hex}
          options={options}
          onBeforeChange={(editor, data, value) => {
            setHex(value);
            try {
              const d = decode(value, raw, entity);
              setDecoded(d);
            } catch (e) {
              setDecoded(e);
            }
          }}
          onChange={(editor, value) => {}}
        />
      </div>
      {/*<div className="right">*/}
      {/*  <CodeMirror*/}
      {/*    value={decoded}*/}
      {/*    options={{ ...options, readOnly: true }}*/}
      {/*    onBeforeChange={(editor, data, value) => {*/}
      {/*      console.log('onBeforeChange');*/}
      {/*    }}*/}
      {/*    onChange={(editor, value) => {*/}
      {/*      console.log('controlled', { value });*/}
      {/*    }}*/}
      {/*  />*/}
      {/*</div>*/}
    </div>
  );
}

export default App;
