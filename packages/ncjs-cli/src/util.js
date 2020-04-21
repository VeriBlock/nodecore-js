const parser = require('@veriblock/nodecore-parser');

async function read(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function readPopPublications(stream) {
  const tryOrThrow = (f, msg) => {
    try {
      return f();
    } catch (e) {
      console.error(`${msg}`);
      throw e;
    }
  };

  console.log(`reading stdin for JSON POP TX...`);
  const input = await read(process.stdin);
  let parsed = tryOrThrow(() => JSON.parse(input), 'Can not parse JSON');
  const hex = tryOrThrow(
    () => parsed.vin[0].scriptSig.hex,
    'Unexpected TX structure'
  );
  return tryOrThrow(
    () => parser.parseBtcScriptSig(hex),
    'Can not parse ALT POP TX'
  );
}

module.exports = {
  read,
  readPopPublications
}
