import { WalletProvider, ProviderError, ProviderFailure } from '@bcc-sdk/core';
import { gql, GraphQLClient } from 'graphql-request';
import { TransactionSubmitResponse } from '@bcc-graphql/client-ts';
import { Buffer } from 'buffer';
import {
  BccGraphqlToCore,
  GraphqlCurrentWalletProtocolParameters,
  BccGraphQlTip,
  TransactionsResponse
} from './BccGraphqlToCore';

/**
 * Connect to a [bcc-graphql (bcc-db-sync) service](https://github.com/The-Blockchain-Company/bcc-graphql)
 * ```typescript
 * const provider = bccGraphqlDbSyncProvider(uri: 'http://localhost:3100');
 * ```
 */

export const bccGraphqlDbSyncProvider = (uri: string): WalletProvider => {
  const client = new GraphQLClient(uri);

  const ledgerTip: WalletProvider['ledgerTip'] = async () => {
    const query = gql`
      query {
        bcc {
          tip {
            hash
            number
            slotNo
          }
        }
      }
    `;

    type Response = {
      bcc: {
        tip: BccGraphQlTip;
      };
    };

    const response = await client.request<Response>(query);

    return BccGraphqlToCore.tip(response.bcc.tip);
  };

  const networkInfo: WalletProvider['networkInfo'] = async () => {
    const query = gql`
      query {
        activeStake_aggregate {
          aggregate {
            sum {
              amount
            }
          }
        }
        bcc {
          supply {
            circulating
            max
            total
          }
        }
        bcc {
          currentEpoch {
            lastBlockTime
            number
            startedAt
          }
        }
      }
    `;

    type Response = {
      activeStake_aggregate: {
        aggregate: {
          sum: {
            amount: string;
          };
        };
      };
      bcc: {
        supply: {
          circulating: string;
          max: string;
          total: string;
        };
      };
      bcc: {
        currentEpoch: {
          lastBlockTime: string;
          number: number;
          startedAt: string;
        };
      };
    };

    const response = await client.request<Response>(query);
    return {
      currentEpoch: {
        end: {
          date: new Date(response.bcc.currentEpoch.lastBlockTime)
        },
        number: response.bcc.currentEpoch.number,
        start: {
          date: new Date(response.bcc.currentEpoch.startedAt)
        }
      },
      entropicSupply: {
        circulating: BigInt(response.bcc.supply.circulating),
        max: BigInt(response.bcc.supply.max),
        total: BigInt(response.bcc.supply.total)
      },
      stake: {
        active: BigInt(response.activeStake_aggregate.aggregate.sum.amount),
        // Todo: This value cannot be provided by this service yet
        live: BigInt(0)
      }
    };
  };

  const stakePoolStats: WalletProvider['stakePoolStats'] = async () => {
    const currentEpochResponse = await client.request<{
      bcc: {
        currentEpoch: {
          number: number;
        };
      };
    }>(gql`
      query {
        bcc {
          currentEpoch {
            number
          }
        }
      }
    `);

    const currentEpochNo = currentEpochResponse.bcc.currentEpoch.number;

    // It's not possible to alias the fields, so multiple requests are needed:
    // See https://github.com/The-Blockchain-Company/bcc-graphql/issues/164

    type Response = {
      stakePool_aggregate: {
        aggregate: {
          count: string;
        };
      };
    };

    const activeResponse = await client.request<Response>(
      gql`
        query ActiveStakePoolsCount {
          active: stakePools_aggregate(where: { _not: { retirements: { announcedIn: {} } } }) {
            aggregate {
              count
            }
          }
        }
      `
    );

    const retiredResponse = await client.request<Response>(
      gql`
        query RetiredStakePoolsCount($currentEpochNo: Int) {
          stakePools_aggregate(where: { retirements: { _and: { inEffectFrom: { _lte: $currentEpochNo } } } }) {
            aggregate {
              count
            }
          }
        }
      `,
      {
        currentEpochNo
      }
    );

    const retiringResponse = await client.request<Response>(
      gql`
        query RetiringStakePoolsCount($currentEpochNo: Int) {
          stakePools_aggregate(
            where: {
              retirements: {
                _and: {
                  announcedIn: { block: { epoch: { number: { _lte: $currentEpochNo } } } }
                  inEffectFrom: { _gt: $currentEpochNo }
                }
              }
            }
          ) {
            aggregate {
              count
            }
          }
        }
      `,
      {
        currentEpochNo
      }
    );
    return {
      qty: {
        active: Number(activeResponse.stakePool_aggregate.aggregate.count),
        retired: Number(retiredResponse.stakePool_aggregate.aggregate.count),
        retiring: Number(retiringResponse.stakePool_aggregate.aggregate.count)
      }
    };
  };

  const submitTx: WalletProvider['submitTx'] = async (signedTransaction) => {
    try {
      const mutation = gql`
        mutation ($transaction: String!) {
          submitTransaction(transaction: $transaction) {
            hash
          }
        }
      `;

      type Response = TransactionSubmitResponse;
      type Variables = { transaction: string };

      const response = await client.request<Response, Variables>(mutation, {
        transaction: Buffer.from(signedTransaction.to_bytes()).toString('hex')
      });

      if (!response.hash) {
        throw new Error('No "hash" in graphql response');
      }
    } catch (error) {
      throw new ProviderError(ProviderFailure.Unknown, error);
    }
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const utxoDelegationAndRewards: WalletProvider['utxoDelegationAndRewards'] = async () => {
    throw new Error('Not implemented yet.');
  };

  const queryTransactionsByAddresses: WalletProvider['queryTransactionsByAddresses'] = async (addresses) => {
    const query = gql`
      query ($addresses: [String]!) {
        transactions(
          where: { _or: [{ inputs: { address: { _in: $addresses } } }, { outputs: { address: { _in: $addresses } } }] }
        ) {
          hash
          inputs {
            address
            txHash
            sourceTxIndex
          }
          outputs {
            address
            value
            tokens {
              asset {
                assetId
              }
              quantity
            }
          }
        }
      }
    `;

    type Variables = { addresses: string[] };

    const response = await client.request<TransactionsResponse, Variables>(query, { addresses });

    return BccGraphqlToCore.graphqlTransactionsToBccTxs(response);
  };

  const queryTransactionsByHashes: WalletProvider['queryTransactionsByHashes'] = async (hashes) => {
    const query = gql`
      query ($hashes: [Hash32Hex]!) {
        transactions(where: { hash: { _in: $hashes } }) {
          hash
          inputs {
            txHash
            sourceTxIndex
          }
          outputs {
            address
            value
            tokens {
              asset {
                assetId
              }
              quantity
            }
          }
        }
      }
    `;

    type Variables = { hashes: string[] };

    const response = await client.request<TransactionsResponse, Variables>(query, { hashes });

    return BccGraphqlToCore.graphqlTransactionsToBccTxs(response);
  };

  const currentWalletProtocolParameters: WalletProvider['currentWalletProtocolParameters'] = async () => {
    const query = gql`
      query {
        bcc {
          currentEpoch {
            protocolParams {
              coinsPerUtxoWord
              maxTxSize
              maxValSize
              keyDeposit
              maxCollateralInputs
              minFeeA
              minFeeB
              minPoolCost
              poolDeposit
              protocolVersion
            }
          }
        }
      }
    `;

    type Response = {
      bcc: {
        currentEpoch: {
          protocolParams: GraphqlCurrentWalletProtocolParameters;
        };
      };
    };

    const response = await client.request<Response>(query);

    return BccGraphqlToCore.currentWalletProtocolParameters(response.bcc.currentEpoch.protocolParams);
  };

  return {
    ledgerTip,
    networkInfo,
    stakePoolStats,
    submitTx,
    utxoDelegationAndRewards,
    queryTransactionsByAddresses,
    queryTransactionsByHashes,
    currentWalletProtocolParameters
  };
};
