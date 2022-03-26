import { Schema } from '@bcc-ogmios/client';
import { getLastCommit } from 'git-last-commit';
// eslint-disable-next-line unicorn/prefer-node-protocol
import { promisify } from 'util';

// Todo: Hoist to @bcc-ogmios/client
export const isColeStandardBlock = (block: Schema.Block): block is { cole: Schema.StandardBlock } =>
  (block as { cole: Schema.StandardBlock }).cole?.header.slot !== undefined;

export const isColeEpochBoundaryBlock = (block: Schema.Block): block is { cole: Schema.EpochBoundaryBlock } => {
  const castBlock = block as { cole: Schema.EpochBoundaryBlock };
  return castBlock.cole?.hash !== undefined && castBlock.cole?.header.epoch !== undefined;
};

export const getLastCommitPromise = promisify(getLastCommit);
