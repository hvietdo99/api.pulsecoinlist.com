import { gql } from 'graphql-tag';

export const GET_BLOCKS = (timestamps: number[]) => {
  let queryString = 'query blocks {\n';
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 600
    } }) {
      number
    }\n`;
  });
  queryString += '}';
  return gql(queryString);
};

export const GET_BASE_FEE_PER_GAS_METRIC_IN_RANGE = () => {
  const queryString = `
  query GetBaseFeePerGasMetrics($resolution: Int!, $fromTs: Int!, $toTs: Int!) {
    metrics(
      first: 1000
      where: {
        resolution: $resolution
        timestamp_gte: $fromTs
        timestamp_lte: $toTs
      }
      orderBy: timestamp
      orderDirection: desc
    ) {
      number
      timestamp
      value
    }
  }
  `;
  return gql(queryString);
};

export const GET_TOTAL_PLS_BURNED_IN_RANGE = () => {
  const queryString = `
  query GetTotalPlsBurned($resolution: Int!, $fromTs: Int!, $toTs: Int!) {
    burnts(
      first: 1000
      where: {
        resolution: $resolution
        timestamp_gte: $fromTs
        timestamp_lte: $toTs
      }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      total
    }
  }
  `;
  return gql(queryString);
};

export const GET_LATEST_BLOCKS_PLS_BURNED_IN_RANGE = () => {
  const queryString = `
  query GetLatestBlocksPlsBurned {
    blocks(
      first: 6
      orderBy: number
      orderDirection: desc
    ) {
      number
      timestamp
      baseFeePerGas
      burned
    }
  }
  `;
  return gql(queryString);
};

export const GET_TOP_BLOCKS_PLS_BURNED_IN_RANGE = () => {
  const queryString = `
  query GetTopBlocksPlsBurned($fromTs: Int!, $toTs: Int!) {
    blocks(
      first: 10
      where: {
        timestamp_gte: $fromTs
        timestamp_lte: $toTs
      }
      orderBy: burned
      orderDirection: desc
    ) {
      number
      timestamp
      baseFeePerGas
      burned
    }
  }
  `;
  return gql(queryString);
};

export const FETCH_COINS_LIST = () => {
  const queryString = `
  query CoinsList($limit: Int!, $skip: Int!) {
    tokens(
      first: $limit
      skip: $skip
      subgraphError: allow
      orderBy: tradeVolumeUSD
      orderDirection: desc
    ) {
      id
      name
      symbol
      decimals
    }
  }
  `;

  return gql(queryString);
};

export const FETCH_LIST_TOKENS_STATS = (timestamps: number[]) => {
  const queryString = `
  query tokens($allTokens: [ID!]) {
    now: tokens(
      where: { id_in: $allTokens }
      subgraphError: allow
    ) {
      id
      derivedUSD
      tradeVolumeUSD
      totalLiquidity
    }
    fiveMinutesAgo: tokens(
      block: {number: ${timestamps[0]}}
      where: { id_in: $allTokens }
      subgraphError: allow
    ) {
      id
      derivedUSD
      tradeVolumeUSD
      totalLiquidity
    }
    oneHourAgo: tokens(
      block: {number: ${timestamps[1]}}
      where: { id_in: $allTokens }
      subgraphError: allow
    ) {
      id
      derivedUSD
      tradeVolumeUSD
      totalLiquidity
    }
    sixHoursAgo: tokens(
      block: {number: ${timestamps[2]}}
      where: { id_in: $allTokens }
      subgraphError: allow
    ) {
      id
      derivedUSD
      tradeVolumeUSD
      totalLiquidity
    }
    oneDayAgo: tokens(
      block: {number: ${timestamps[3]}}
      where: { id_in: $allTokens }
      subgraphError: allow
    ) {
      id
      derivedUSD
      tradeVolumeUSD
      totalLiquidity
    }
    oneWeekAgo: tokens(
      block: {number: ${timestamps[4]}}
      where: { id_in: $allTokens }
      subgraphError: allow
    ) {
      id
      derivedUSD
      tradeVolumeUSD
      totalLiquidity
    }
  }
  `;

  return gql(queryString);
};

export const FETCH_SOURCE_LIST_TOKENS_ANALYTIC = () => {
  const queryString = `
  query tokens($allTokens: [ID]!) {
    tokens(
      where: { id_in: $allTokens }
      subgraphError: allow
    ) {
      id
      derivedPLS
      totalLiquidity
    }
    bundles(
      where: { id: "1" }
    ) {
      plsPrice
    }
  }
  `;

  return gql(queryString);
};

export const FETCH_DEST_LIST_TOKENS_ANALYTIC_V2 = () => {
  const queryString = `
  query tokens($allTokens: [ID!]) {
    tokens(
      where: {id_in: $allTokens}
      subgraphError: allow
    ) {
      id
      derivedETH
      totalLiquidity
    }
    bundles(
      where: { id: "1" }
    ) {
      ethPrice
    }
  }
  `;

  return gql(queryString);
};

export const FETCH_DEST_LIST_TOKENS_ANALYTIC_V3 = () => {
  const queryString = `
  query tokens($allTokens: [ID!]) {
    tokens(
      where: {id_in: $allTokens}
      subgraphError: allow
    ) {
      id
      derivedETH
      totalValueLocked
    }
    bundles(
      where: { id: "1" }
    ) {
      ethPriceUSD
    }
  }
  `;

  return gql(queryString);
};
