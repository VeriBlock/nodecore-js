import {
  Address,
  ATV,
  BtcBlock,
  Coin,
  Output,
  PublicationData, Sha256Hash,
  VbkBlock, VbkMerklePath,
  VbkTx,
  VBlakeHash,
} from '../../src/parser/entities';
import { ReadStream } from '../../src/parser';
import BigNumber from 'bignumber.js';
import {
  PREVIOUS_BLOCK_LENGTH,
  PREVIOUS_KEYSTONE_LENGTH,
} from '../../src/parser/const';

describe('parse', () => {
  it('BtcBlock', () => {
    const blockBuffer = Buffer.from(
      'AAAAIPfeKZWJiACrEJr5Z3m5eaYHFdqb8ru3RbMAAAAAAAAA+FSGAmv06tijekKSUzLsi1U/jjEJdP6h66I4987mFl4iE7dchBoBGi4A8po=',
      'base64'
    );
    const stream = new ReadStream(blockBuffer);
    const block = BtcBlock.read(stream);

    const data = block.serialize();

    expect(data.toString('hex')).toEqual(blockBuffer.toString('hex'));
  });

  it('Address', () => {
    // generated in java
    const bytes = Buffer.from(
      '01166772F51AB208D32771AB1506970EEB664462730B838E',
      'hex'
    );
    const stream = new ReadStream(bytes);
    const address = Address.read(stream);
    expect(address.address).toEqual('V5Ujv72h4jEBcKnALGc4fKqs6CDAPX');
  });

  it('PublicationData', () => {
    // generated in java
    const bytes = Buffer.from(
      '0100010C6865616465722062797465730112636F6E7465787420696E666F20627974657301117061796F757420696E666F206279746573',
      'hex'
    );
    const stream = new ReadStream(bytes);
    const pd = PublicationData.read(stream);
    expect(pd.header).toEqual(Buffer.from('header bytes'));
    expect(pd.contextInfo).toEqual(Buffer.from('context info bytes'));
    expect(pd.payoutInfo).toEqual(Buffer.from('payout info bytes'));
  });

  it('Coin', () => {
    // generated in java
    const bytes = Buffer.from('020539', 'hex');
    const stream = new ReadStream(bytes);
    const c = Coin.read(stream);
    expect(c.atomicUnits).toEqual(new BigNumber(1337));
  });

  it('Output', () => {
    // generated in java
    const bytes = Buffer.from(
      '01166772F51AB208D32771AB1506970EEB664462730B838E020539',
      'hex'
    );
    const stream = new ReadStream(bytes);
    const c = Output.read(stream);
    expect(c.address.address).toEqual('V5Ujv72h4jEBcKnALGc4fKqs6CDAPX');
    expect(c.amount.atomicUnits).toEqual(new BigNumber(1337));
  });

  it('VbkTx', () => {
    // generated in java
    const bytes = Buffer.from(
      '01580101166772F51AB208D32771AB1506970EEB664462730B838E0203E800010701370100010C6865616465722062797465730112636F6E7465787420696E666F20627974657301117061796F757420696E666F2062797465734630440220398B74708DC8F8AEE68FCE0C47B8959E6FCE6354665DA3ED87A83F708E62AA6B02202E6C00C00487763C55E92C7B8E1DD538B7375D8DF2B2117E75ACBB9DB7DEB3C7583056301006072A8648CE3D020106052B8104000A03420004DE4EE8300C3CD99E913536CF53C4ADD179F048F8FE90E5ADF3ED19668DD1DBF6C2D8E692B1D36EAC7187950620A28838DA60A8C9DD60190C14C59B82CB90319E',
      'hex'
    );
    const stream = new ReadStream(bytes);
    const tx = VbkTx.read(stream);
    expect(tx.type).toEqual(0x01);
    expect(tx.sourceAddress.address).toEqual('V5Ujv72h4jEBcKnALGc4fKqs6CDAPX');
    expect(tx.sourceAmount.atomicUnits).toEqual(new BigNumber(1000));
    expect(tx.outputs).toHaveLength(0);
    expect(tx.signatureIndex).toEqual(new BigNumber(7));
    const pd = tx.publicationData;
    expect(pd.header).toEqual(Buffer.from('header bytes'));
    expect(pd.contextInfo).toEqual(Buffer.from('context info bytes'));
    expect(pd.payoutInfo).toEqual(Buffer.from('payout info bytes'));
    expect(tx.signature.toString('hex').toUpperCase()).toEqual(
      '30440220398B74708DC8F8AEE68FCE0C47B8959E6FCE6354665DA3ED87A83F708E62AA6B02202E6C00C00487763C55E92C7B8E1DD538B7375D8DF2B2117E75ACBB9DB7DEB3C7'
    );
    expect(tx.publicKey.toString('hex').toUpperCase()).toEqual(
      '3056301006072A8648CE3D020106052B8104000A03420004DE4EE8300C3CD99E913536CF53C4ADD179F048F8FE90E5ADF3ED19668DD1DBF6C2D8E692B1D36EAC7187950620A28838DA60A8C9DD60190C14C59B82CB90319E'
    );
  });

  it('VbkBlock', () => {
    // generated in java
    const bytes = Buffer.from(
      '40000013880002449C60619294546AD825AF03B0935637860679DDD55EE4FD21082E18686E26BBFDA7D5E4462EF24AE02D67E47D785C9B90F30101000000000001',
      'hex'
    );
    const stream = new ReadStream(bytes);
    const c = VbkBlock.read(stream);
    expect(c.height).toEqual(5000);
    expect(c.version).toEqual(2);
    expect(c.previousBlock).toEqual(
      VBlakeHash.fromHex(
        '000000000000069B7E7B7245449C60619294546AD825AF03'
      ).trim(PREVIOUS_BLOCK_LENGTH)
    );
    expect(c.previousKeystone).toEqual(
      VBlakeHash.fromHex(
        '00000000000023A90C8B0DFE7C55C1B0935637860679DDD5'
      ).trim(PREVIOUS_KEYSTONE_LENGTH)
    );
    expect(c.secondPreviousKeystone).toEqual(
      VBlakeHash.fromHex(
        '00000000000065630808D69AB26B825EE4FD21082E18686E'
      ).trim(PREVIOUS_KEYSTONE_LENGTH)
    );
    expect(c.merkleRoot.data.toString('hex').toUpperCase()).toEqual(
      '26BBFDA7D5E4462EF24AE02D67E47D78'
    );
    expect(c.timestamp).toEqual(1553699059);
    expect(c.difficulty).toEqual(16842752);
    expect(c.nonce).toEqual(1);
  });

  it('VbkMerklePath', () => {
    // generated in java
    const bytes = Buffer.from(
      '04000000010400000000201FEC8AA4983D69395010E4D18CD8B943749D5B4F575E88A375DEBDC5ED22531C0400000002200000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      'hex'
    );
    const stream = new ReadStream(bytes);
    const c = VbkMerklePath.read(stream);
    expect(c.index).toEqual(0);
    expect(c.treeIndex).toEqual(1);
    expect(c.subject).toEqual(Sha256Hash.fromHex("1FEC8AA4983D69395010E4D18CD8B943749D5B4F575E88A375DEBDC5ED22531C"))

    const layers = [
      "0000000000000000000000000000000000000000000000000000000000000000",
      "0000000000000000000000000000000000000000000000000000000000000000"
    ].map(o => Sha256Hash.fromHex(o));

    expect(c.layers).toEqual(layers);
  });

  it('ATV', () => {
    const bytes = Buffer.from(
      '01580101166772F51AB208D32771AB1506970EEB664462730B838E0203E800010701370100010C6865616465722062797465730112636F6E7465787420696E666F20627974657301117061796F757420696E666F2062797465734630440220398B74708DC8F8AEE68FCE0C47B8959E6FCE6354665DA3ED87A83F708E62AA6B02202E6C00C00487763C55E92C7B8E1DD538B7375D8DF2B2117E75ACBB9DB7DEB3C7583056301006072A8648CE3D020106052B8104000A03420004DE4EE8300C3CD99E913536CF53C4ADD179F048F8FE90E5ADF3ED19668DD1DBF6C2D8E692B1D36EAC7187950620A28838DA60A8C9DD60190C14C59B82CB90319E04000000010400000000201FEC8AA4983D69395010E4D18CD8B943749D5B4F575E88A375DEBDC5ED22531C040000000220000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000040000013880002449C60619294546AD825AF03B0935637860679DDD55EE4FD21082E18686E26BBFDA7D5E4462EF24AE02D67E47D785C9B90F301010000000000010100',
      'hex'
    );
    const stream = new ReadStream(bytes);

    expect(() => ATV.read(stream)).not.toThrow();
  });
});
