import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import { JsonMap } from '@salesforce/ts-types';
import EAITransport from '../../../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.language.models.metrics', [
  'summary',
  'description',
  'examples',
  'flags.modelid.summary',
]);

export type EaiLanguageModelsMetricsResult = {
  message: string;
  data: JsonMap;
};

export default class EaiLanguageModelsMetrics extends SfCommand<EaiLanguageModelsMetricsResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    modelid: Flags.string({
      summary: messages.getMessage('flags.modelid.summary'),
      char: 'i',
      required: true,
    }),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static formatResults(data: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ux.table(data, {
      id: {
        header: 'Model Id',
      },
      macroF1: {
        get: (row) => row.metricsData['macroF1'] as string,
        header: 'Name',
      },
      testLoss: {
        get: (row) => row.metricsData['testLoss'] as string,
        header: 'Created',
      },
      testAccuracy: {
        get: (row) => row.metricsData['testAccuracy'] as string,
        header: 'Updated',
      },
      trainingLoss: {
        get: (row) => row.metricsData['trainingLoss'] as string,
        header: 'Type',
      },
      trainingAccuracy: {
        get: (row) => row.metricsData['trainingAccuracy'] as string,
        header: 'Examples',
      },
    });
  }

  public async run(): Promise<EaiLanguageModelsMetricsResult> {
    const { flags } = await this.parse(EaiLanguageModelsMetrics);
    const path: string = 'v2/vision/models/' + flags.modelid;

    const transport = new EAITransport();

    return transport.makeRequest({ form: null, path, method: 'GET' }).then((data) => {
      const responseMessage = 'Successfully retrieved language model metrics';
      ux.log(responseMessage);
      EaiLanguageModelsMetrics.formatResults(data);
      return { message: responseMessage, data };
    });
  }
}
