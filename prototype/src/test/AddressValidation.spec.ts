import * as base58 from 'bs58'
import * as bech32 from 'bech32'
import { ChainSettings } from '../Bcc/ChainSettings'
import { decodeColeAddress, decodeQuibitousAddress, ColeAddressKind, QuibitousAddressKind } from '../lib/validator/address'
import { expect } from 'chai'

describe('Address Validation', () => {
  describe('Cole', () => {
    it('Mainnet Icarus', () => {
      let addr = 'Ae2tdPwUPEZFRbyhz3cpfC2CumGzNkFBN2L42rcUc2yjQpEkxDbkPodpMAi'
      let bytes = base58.decode(addr)
      expect(decodeColeAddress(bytes)).to.deep.equal({
        kind: ColeAddressKind.spendingAddress,
        chainSettings: ChainSettings.mainnet
      })
    })

    it('TestNet Icarus', () => {
      let addr = '2cWKMJemoBakkUSWX3DZdx8eXGeqjN6mkgVUCND1RNB736qWS5v1CGgQGNNTFUZSXaVLj'
      let bytes = base58.decode(addr)
      expect(decodeColeAddress(bytes)).to.deep.equal({
        kind: ColeAddressKind.spendingAddress,
        chainSettings: ChainSettings.testnet
      })
    })

    it('Mainnet Klarity', () => {
      let addr = 'DdzFFzCqrhsw3prhfMFDNFowbzUku3QmrMwarfjUbWXRisodn97R436SHc1rimp4MhPNmbdYb1aTdqtGSJixMVMi5MkArDQJ6Sc1n3Ez'
      let bytes = base58.decode(addr)
      expect(decodeColeAddress(bytes)).to.deep.equal({
        kind: ColeAddressKind.spendingAddress,
        chainSettings: ChainSettings.mainnet
      })
    })

    it('TestNet Klarity', () => {
      let addr = '37btjrVyb4KEB2STADSsj3MYSAdj52X5FrFWpw2r7Wmj2GDzXjFRsHWuZqrw7zSkwopv8Ci3VWeg6bisU9dgJxW5hb2MZYeduNKbQJrqz3zVBsu9nT'
      let bytes = base58.decode(addr)
      expect(decodeColeAddress(bytes)).to.deep.equal({
        kind: ColeAddressKind.spendingAddress,
        chainSettings: ChainSettings.testnet
      })
    })

    it('Invalid Address', () => {
      let addr = 'EkxDbkPo'
      let bytes = base58.decode(addr)
      expect(decodeColeAddress(bytes)).to.equal(null)
    })

    it('Invalid Network Magic', () => {
      let addr = '3reY92cShRkjtmz7q31547czPNHbrhbRGhVLehTrNDNDNeDaKJwcM8aMmWg2zd7cHVFvhdui4a86nEdsSEE7g7kcZKKvBw7nzixnbX1'
      let bytes = base58.decode(addr)
      expect(decodeColeAddress(bytes)).to.equal(null)
    })
  })

  describe('Quibitous', () => {
    function decodeBech32 (str : string) {
      return Buffer.from(bech32.fromWords(bech32.decode(str, 128).words))
    }

    it('Mainnet Single', () => {
      let addr = 'ca1qdaa2wrvxxkrrwnsw6zk2qx0ymu96354hq83s0r6203l9pqe6677zqx4le2'
      let bytes = decodeBech32(addr)
      expect(decodeQuibitousAddress(bytes)).to.deep.equal({
        kind: QuibitousAddressKind.singleAddress,
        chainSettings: ChainSettings.mainnet
      })
    })

    it('Mainnet Grouped', () => {
      let addr = 'ca1q3aa2wrvxxkrrwnsw6zk2qx0ymu96354hq83s0r6203l9pqe6677rvjwwzcv9nhtynxf728nserccua2w8q949dqzxdmj8wcazwrty4wga8haz'
      let bytes = decodeBech32(addr)
      expect(decodeQuibitousAddress(bytes)).to.deep.equal({
        kind: QuibitousAddressKind.groupedAddress,
        chainSettings: ChainSettings.mainnet
      })
    })

    it('TestNet Single', () => {
      let addr = 'ta1s00e7zr89gafgauz9xu3m25cz5ugs0s4xhtxdhqsuca58r6ycclr7v3je63'
      let bytes = decodeBech32(addr)
      expect(decodeQuibitousAddress(bytes)).to.deep.equal({
        kind: QuibitousAddressKind.singleAddress,
        chainSettings: ChainSettings.testnet
      })
    })

    it('TestNet Single', () => {
      let addr = 'ta1s3aa2wrvxxkrrwnsw6zk2qx0ymu96354hq83s0r6203l9pqe6677rvjwwzcv9nhtynxf728nserccua2w8q949dqzxdmj8wcazwrty4we4spcz'
      let bytes = decodeBech32(addr)
      expect(decodeQuibitousAddress(bytes)).to.deep.equal({
        kind: QuibitousAddressKind.groupedAddress,
        chainSettings: ChainSettings.testnet
      })
    })

    it('Invalid Single Address Public Key', () => {
      let addr = 'ca1qvqsyqcyq5rqwzqfpg9scrgk66qs0'
      let bytes = decodeBech32(addr)
      expect(decodeQuibitousAddress(bytes)).to.equal(null)
    })

    it('Invalid Address Kind', () => {
      let addr = 'ca1dvqsyqcyq5rqwzqfpg9scrgwpugpzysnzs23v9ccrydpk8qarc0jqscdket'
      let bytes = decodeBech32(addr)
      expect(decodeQuibitousAddress(bytes)).to.equal(null)
    })
  })
})
