import { Injectable } from '@nestjs/common';
import { ethers, Contract } from 'ethers';
import BigNumber from 'bignumber.js';
import * as MultiCallV2 from './abi/Multicall2.abi';
import { MULTICALL_ADDRESS, PULSE_RPC_URL } from './blockchain.constant';

@Injectable()
export class BlockchainsService {
  private readonly provider: ethers.providers.JsonRpcProvider;
  private readonly multicall: Contract;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(PULSE_RPC_URL);
    this.multicall = new Contract(
      MULTICALL_ADDRESS,
      MultiCallV2.abi,
      this.provider,
    );
  }

  async getEthBalance(address: string) {
    const result = await this.provider.getBalance(address);
    return new BigNumber(result?.toString() || '0');
  }

  async executeMulticall(
    calls: { address: string; abi: any[]; method: string; params: any[] }[],
  ): Promise<any[]> {
    const callsdata = calls.map((call) => {
      const itf = new ethers.utils.Interface(call.abi);
      return [
        call.address.toLowerCase(),
        itf.encodeFunctionData(call.method, call.params),
      ];
    });

    const results: { returnData: string }[] = await this._readContract(
      'tryAggregate',
      [true, callsdata],
    );

    if (!results) {
      return calls.map((_) => []);
    }

    return calls.map((call, idx) => {
      const itf = new ethers.utils.Interface(call.abi);
      return itf.decodeFunctionResult(call.method, results[idx].returnData);
    });
  }

  private async _readContract(
    method: string,
    params: any[] = [],
  ): Promise<any> {
    try {
      const response = await this.multicall.callStatic[method](...params);
      return response;
    } catch (err) {
      console.log('err', err);
      return null;
    }
  }
}
