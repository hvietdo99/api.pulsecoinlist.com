import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { ADDRESS_ZERO } from 'src/shares/constants';
import { scaleDown } from 'src/shares/helpers';
// import { IPagination } from 'src/shares/pagination';
import * as ERC20 from '../blockchain/abi/ERC20.abi';
import { BlockchainsService } from '../blockchain/blockchain.service';
import { CoinsService } from '../coins/coins.service';
// import { PiteasTokensService } from '../piteas-tokens/piteas-tokens.service';
import { InvalidEthereumAddress } from './airdrops.exception';

const COINS_PER_BATCH_LIMIT = 20;

@Injectable()
export class AirdropsService {
  constructor(
    private readonly blockchainService: BlockchainsService,
    private readonly coinsService: CoinsService, // private readonly piteasTokensService: PiteasTokensService,
  ) {}

  async listAirdrops(address: string) {
    if (!ethers.utils.isAddress(address)) {
      throw new InvalidEthereumAddress();
    }

    // const piteasTokens = await this.piteasTokensService.listTokens();

    const coins = await this.coinsService.listCoins(
      {
        address: { $ne: ADDRESS_ZERO },
        volume7d: { $gte: 5000 },
      },
      {
        page: 1,
        limit: 200,
      },
    );

    if (!coins || !coins.docs || !coins.docs.length) {
      return [];
    }

    const totalBatches = Math.ceil(coins.docs.length / COINS_PER_BATCH_LIMIT);
    const batches = Array.from(Array(totalBatches).keys());

    const ethBalance = await this.blockchainService.getEthBalance(address);
    const nativeStats = await this.coinsService.detailCoinByAddress(
      ADDRESS_ZERO,
    );

    let tokensBalance = [];
    for (const batch of batches) {
      const calls = coins.docs
        .slice(
          batch * COINS_PER_BATCH_LIMIT,
          (batch + 1) * COINS_PER_BATCH_LIMIT,
        )
        .map((coin) => {
          return {
            address: coin.address,
            abi: ERC20.abi,
            method: 'balanceOf',
            params: [address],
          };
        });

      const result = await this.blockchainService.executeMulticall(calls);
      tokensBalance = tokensBalance.concat(result);
    }

    const airdrops = coins.docs.map((coin, idx) => {
      const coinObj = {
        address: coin.address,
        name: coin.name,
        symbol: coin.symbol,
        decimals: coin.decimals,
        logo: coin.logo,
        priceInPLS: coin.price?.toString() || '0',
        percent24h: coin.percent24h,
        // priceInETH: coin.priceInETH?.toString() || '0',
        // percentDiff: coin.percentDiff,
        recommendEx: coin.recommendEx,
      };

      const balance = scaleDown(
        new BigNumber(tokensBalance[idx]?.[0]?.toString() || 0),
        coin.decimals,
      );

      return {
        ...coinObj,
        balance: balance,
        balanceInUSD: balance.multipliedBy(coin.price?.toString()),
      };
    });

    airdrops.unshift({
      address: ADDRESS_ZERO,
      name: 'Pulse Chain',
      symbol: 'PLS',
      decimals: 18,
      logo: '',
      priceInPLS: nativeStats.price?.toString() || '0',
      percent24h: nativeStats.percent24h,
      // priceInETH: '0',
      // percentDiff: 0,
      balance: scaleDown(ethBalance, 18),
      balanceInUSD: scaleDown(ethBalance, 18).multipliedBy(
        nativeStats.price?.toString(),
      ),
      recommendEx: nativeStats.recommendEx,
    });

    return {
      ...coins,
      docs: airdrops,
    };
  }
}
