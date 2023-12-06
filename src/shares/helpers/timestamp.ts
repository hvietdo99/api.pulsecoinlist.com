import * as moment from 'moment';

export function getTimestampsForChanges(): number[] {
  const t1 = moment().subtract('10', 'minutes').startOf('minute').unix();
  const t2 = moment().subtract('1', 'hours').startOf('minute').unix();
  const t3 = moment().subtract('6', 'hours').startOf('minute').unix();
  const t4 = moment().subtract('1', 'days').startOf('minute').unix();
  const t5 = moment().subtract('1', 'weeks').startOf('minute').unix();

  return [t1, t2, t3, t4, t5];
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms || 5000);
  });
}
