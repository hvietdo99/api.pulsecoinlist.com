import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import { fetch } from 'cross-fetch';

export const clientBlocks = new ApolloClient({
  link: createHttpLink({
    uri: process.env.CUSTOM_GRAPH_CLIENT_BLOCKS,
    fetch,
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  },
});

export const clientBlocks2 = new ApolloClient({
  link: createHttpLink({
    uri: process.env.CUSTOM_GRAPH_CLIENT_BLOCKS2,
    fetch,
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  },
});

export const clientEthV2 = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v2-dev',
    fetch,
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  },
});

export const clientEthV3 = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    fetch,
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  },
});

export const clientPulseXV1 = new ApolloClient({
  link: createHttpLink({
    uri: 'https://graph.pulsechain.com/subgraphs/name/pulsechain/pulsex',
    fetch,
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  },
});

export const clientPulseXV2 = new ApolloClient({
  link: createHttpLink({
    uri: 'https://graph.pulsechain.com/subgraphs/name/pulsechain/pulsexv2',
    fetch,
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  },
});
