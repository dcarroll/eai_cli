/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import EAITransport from '../../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.language.datasets', [
  'summary',
  'description',
  'commandsuccess',
  'examples',
  'flags.datasetid.summary',
]);

export type EaiLanguageDatasetsResult = {
  message: string;
  data: JSON;
};

export type DatasetTable = {
  DatasetId: string;
  Name: string;
  Created: string;
  Updated: string;
  Type: string;
  Examples: string;
  Labels: string;
  Status: string;
};

export default class EaiLanguageDatasets extends SfCommand<EaiLanguageDatasetsResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    datasetid: Flags.string({
      summary: messages.getMessage('flags.datasetid.summary'),
      char: 'i',
      required: false,
    }),
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
  private static formatResults(dataSets: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    ux.table(dataSets.data, {
      id: {
        header: 'Id',
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
      totalExamples: {
        header: 'Examples',
      },
      totalLabels: {
        header: 'Labels',
      },
      statusMsg: {
        header: 'Status',
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static formatSingleDatasetResult(datasetData: any): void {
    const msg = `
    Summary for dataset
      id: ${datasetData.id}
      name: ${datasetData.name}
      createdAt: ${new Date(String(datasetData.createdAt)).toLocaleString()}
      updatedAt: ${new Date(String(datasetData.updatedAt)).toLocaleString()}
      totalExamples: ${datasetData.totalExamples}
      totalLabels: ${datasetData.totalLabels}
      available: ${datasetData.available}
      status: ${datasetData.statusMsg}
      type: ${datasetData.type}`;
    ux.log(msg);
  }

  public async run(): Promise<EaiLanguageDatasetsResult> {
    const { flags } = await this.parse(EaiLanguageDatasets);
    const path: string = flags.datasetid
      ? `https://api.einstein.ai/v2/language/datasets/${flags.datasetid}`
      : 'https://api.einstein.ai/v2/language/datasets/';
    // const log = await Logger.child(this.ctor.name);
    const transport: EAITransport = new EAITransport();

    return transport.makeRequest({ form: null, path, method: 'GET' }).then((data) => {
      const responseMessage = messages.getMessage('commandsuccess');
      ux.log(responseMessage);
      if (!flags.datasetid) {
        EaiLanguageDatasets.formatResults(data);
      } else {
        EaiLanguageDatasets.formatSingleDatasetResult(data);
      }
      return { message: responseMessage, data };
    });
  }

  /* private async runs(): Promise<EaiLanguageDatasetsResult> {
    const { flags } = await this.parse(EaiLanguageDatasets);

    const datasetid = flags.datasetid ?? 'world';
    this.log(`hello ${datasetid} from /Users/dcarroll/Documents/GitHub/dcarroll/test/src/commands/eai/language/datasets.ts`);
    return {
      path: '/Users/dcarroll/Documents/GitHub/dcarroll/test/src/commands/eai/language/datasets.ts',
    };
  } */
}
