import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import { JsonMap } from '@salesforce/ts-types';
import EAITransport from '../../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.language.models', [
  'summary',
  'description',
  'examples',
  'flags.datasetid.summary',
]);

export type EaiLanguageModelsResult = {
  message: string;
  data: JsonMap;
};

export default class EaiLanguageModels extends SfCommand<EaiLanguageModelsResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    datasetid: Flags.string({
      summary: messages.getMessage('flags.datasetid.summary'),
      char: 'i',
      required: true,
    }),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static formatResults(models: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    ux.table(models['data'], {
      modelId: {
        header: 'Model Id',
      },
      datasetId: {
        header: 'Dataset Id',
      },
      name: {
        header: 'Name',
      },
      createdAt: {
        get: (row) => new Date(String(row.createdAt)).toLocaleString(),
        header: 'Created',
      },
      updatedAt: {
        get: (row) => new Date(String(row.updatedAt)).toLocaleString(),
        header: 'Updated',
      },
      type: {
        header: 'Type',
      },
      algorithm: {
        header: 'Algorithm',
      },
      status: {
        header: 'Status',
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public async run(): Promise<EaiLanguageModelsResult> {
    const { flags } = await this.parse(EaiLanguageModels);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
    const path = `v2/language/datasets/${flags.datasetid}/models`;

    const transport = new EAITransport();

    return transport.makeRequest({ form: null, path, method: 'GET' }).then((data) => {
      const responseMessage = 'Successfully retrieved model(s)';
      EaiLanguageModels.formatResults(data);

      return { message: responseMessage, data };
    });
  }
}
