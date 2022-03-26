import { CSL } from '../CSL';
/**
 * Validate input as a Bcc Address from all Bcc eras and networks
 */
export const isAddress = (input: string): boolean => {
  try {
    CSL.Address.from_bech32(input);
    return true;
  } catch {
    try {
      CSL.ColeAddress.from_base58(input);
      return true;
    } catch {
      return false;
    }
  }
};
