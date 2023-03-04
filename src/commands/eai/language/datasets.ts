import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import { JsonMap } from '@salesforce/ts-types';
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
  data: JsonMap;
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

  private static formatSingleDatasetResult(datasetData: JsonMap): void {
    const msg = `
    Summary for dataset
      id: ${datasetData['id'] as string}
      name: ${datasetData.name as string}
      createdAt: ${new Date(String(datasetData.createdAt)).toLocaleString()}
      updatedAt: ${new Date(String(datasetData.updatedAt)).toLocaleString()}
      totalExamples: ${datasetData.totalExamples as string}
      totalLabels: ${datasetData.totalLabels as string}
      available: ${datasetData.available as string}
      status: ${datasetData.statusMsg as string}
      type: ${datasetData.type as string}`;
    ux.log(msg);
  }

  public async run(): Promise<EaiLanguageDatasetsResult> {
    const { flags } = await this.parse(EaiLanguageDatasets);
    const path: string = flags.datasetid ? `v2/language/datasets/${flags.datasetid}` : 'v2/language/datasets/';
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
}
