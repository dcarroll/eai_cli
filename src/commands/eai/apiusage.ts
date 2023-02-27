/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import EAITransport from '../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.apiusage', [
  'summary',
  'description',
  'commandsuccess',
  'examples',
  'flags.name.summary',
]);

export type EaiApiusageResult = {
  message: string;
  data: JSON;
};

export default class EaiApiusage extends SfCommand<EaiApiusageResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    /* name: Flags.string({
      summary: messages.getMessage('flags.name.summary'),
      char: 'n',
      required: true,
    }), */
  };

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
        get: (row) => row.planData[0].plan,
      },
      source: {
        header: 'Source',
        get: (row) => row.planData[0].source,
      },
      amount: {
        header: 'Amount',
        get: (row) => row.planData[0].amount,
      },
    });
  }

  /* private static formatResults(data: any): void {
    const msg = `
    Summary for dataset
      E.ai Org Id: ${data.data.organizationId}
      Id: ${data.data.id}
      Period Start: ${new Date(String(data.data.startsAt)).toLocaleString()}
      Period End: ${new Date(String(data.data.endsAt)).toLocaleString()}
      Predictions Remaining: ${data.data.predictionsRemaining}
      Predictions Used: ${data.data.predictionsUsed}
      Predictions Max: ${data.data.predictionsMax}
      License Id: ${data.data.licenseId}
      Plan data:
        Plan: ${data.data.planData[0].plan}
        Amount: ${data.data.planData[0].amount}
        Source: ${data.data.planData[0].source}`;
    ux.log(msg);
  } */

  public async run(): Promise<EaiApiusageResult> {
    // const { flags } = await this.parse(EaiApiusage);

    const path = 'https://api.einstein.ai/v2/apiusage';
    const transport = new EAITransport();

    // return transport.makeRequest({ form: null, path, method: 'GET'}, username: String(flags.name) })
    return transport.makeRequest({ form: null, path, method: 'GET' }).then((data) => {
      const responseMessage = '\n' + messages.getMessage('commandsuccess');
      ux.log(responseMessage);
      EaiApiusage.formatResult(data);
      return { message: responseMessage, data: data['data'] };
    });
  }
}
