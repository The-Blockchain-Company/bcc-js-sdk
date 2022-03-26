import * as cbor from 'cbor'
import { ChainSettings } from '../../Bcc/ChainSettings'

export interface AddressIntrospection<T>
  { kind?: T
  , chainSettings?: ChainSettings
  }

/*
  Cole Era
*/

const COLE_TESTNET_MAGIC = 1097911063

export enum ColeAddressKind
  { spendingAddress = 0
  , scriptAddress = 1
  , redeemAddress = 2
  , stakingAddress = 3
  }

export enum ColeAddressAttributes
  { stakeDistribution = 0
  , derivationPath = 1
  , networkMagic = 2
  }

/** @see https://github.com/The-Blockchain-Company/bcc-wallet/wiki/About-Address-Format---Cole */
export function decodeColeAddress (bytes : Buffer) : (AddressIntrospection<ColeAddressKind>|null) {
  try {
    let [payload] = cbor.decode(bytes)
    let [, attributes, kind] = cbor.decode(payload.value)

    // Somehow, 'cbor.decode' returns an empty object '{}' when empty,
    // but a 'Map' otherwise. Following line cope with the inconsistency.
    if (!Object.is(Object.getPrototypeOf(attributes), Map.prototype)) {
      attributes = new Map()
    }

    let protocolMagic = attributes.get(ColeAddressAttributes.networkMagic)
    if (protocolMagic === undefined) {
      return { kind, chainSettings: ChainSettings.mainnet }
    } else if (cbor.decode(protocolMagic) === COLE_TESTNET_MAGIC) {
      return { kind, chainSettings: ChainSettings.testnet }
    }

    return null
  } catch (e) {
    return null
  }
}

/*
  Quibitous Era
*/

const PUBKEY_LENGTH = 32 // in bytes

export enum QuibitousAddressKind
  { singleAddress = 3
  , groupedAddress = 4
  , accountAddress = 5
  , multisigAddress = 6
  }

/** @see https://github.com/The-Blockchain-Company/implementation-decisions/blob/master/text/0001-address.md */
export function decodeQuibitousAddress (bytes : Buffer) : (AddressIntrospection<QuibitousAddressKind>|null) {
  let kind = bytes[0] & 0b01111111
  let chainSettings = (bytes[0] & 0b10000000) ? ChainSettings.testnet : ChainSettings.mainnet

  switch (kind) {
    case QuibitousAddressKind.singleAddress:
      if (bytes.byteLength !== (1 + PUBKEY_LENGTH)) {
        return null
      }
      break

    case QuibitousAddressKind.groupedAddress:
      if (bytes.byteLength !== (1 + 2 * PUBKEY_LENGTH)) {
        return null
      }
      break

    case QuibitousAddressKind.accountAddress:
      if (bytes.byteLength !== (1 + PUBKEY_LENGTH)) {
        return null
      }
      break

    case QuibitousAddressKind.multisigAddress:
      if (bytes.byteLength !== (1 + PUBKEY_LENGTH)) {
        return null
      }
      break

    default:
      return null
  }

  return { kind, chainSettings }
}
