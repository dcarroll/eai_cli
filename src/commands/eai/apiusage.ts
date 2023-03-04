import { SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import { JsonMap } from '@salesforce/ts-types';
import EAITransport from '../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.apiusage', [
  'summary',
  'description',
  'commandsuccess',
  'examples',
  'flags.name.summary',
]);

export type EaiApiUsageResult = {
  message: string;
  data: JsonMap;
};

export default class EaiApiUsage extends SfCommand<EaiApiUsageResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static formatResult(data: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    ux.table(data.data, {
      organizationId: {
        header: 'Org Id',
      },
      id: {
        header: 'Id',
      },
      startsAt: {
        get: (row) => new Date(String(row.startsAt)).toLocaleDateString(),
        header: 'Start',
      },
      endsAt: {
        get: (row) => new Date(String(row.endsAt)).toLocaleDateString(),
        header: 'End',
      },
      predictionsRemaining: {
        header: 'Remaining',
      },
      predictionsUsed: {
        header: 'Used',
      },
      predictionsMax: {
        header: 'Max',
      },
      licenseId: {
        header: 'License',
      },
      plan: {
        header: 'Plan',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        get: (row) => row.planData[0].plan as string,
      },
      source: {
        header: 'Source',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        get: (row) => row.planData[0].source as string,
      },
      amount: {
        header: 'Amount',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        get: (row) => row.planData[0].amount as string,
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public async run(): Promise<EaiApiUsageResult> {
    const path = 'v2/apiusage';
    const transport = new EAITransport();

    // return transport.makeRequest({ form: null, path, method: 'GET'}, username: String(flags.name) })
    return transport.makeRequest({ form: null, path, method: 'GET' }).then((data) => {
      const responseMessage = `\n${messages.getMessage('commandsuccess')}`;
      ux.log(responseMessage);
      EaiApiUsage.formatResult(data);
      return { message: responseMessage, data: data.data as JsonMap };
    });
  }
}
