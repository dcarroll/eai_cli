/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
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
  data: JSON;
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

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
  private static formatResults(data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    ux.table(data, {
      id: {
        header: 'Model Id',
      },
      macroF1: {
        get: (row) => row.metricsData['macroF1'],
        header: 'Name',
      },
      testLoss: {
        get: (row) => row.metricsData['testLoss'],
        header: 'Created',
      },
      testAccuracy: {
        get: (row) => row.metricsData['testAccuracy'],
        header: 'Updated',
      },
      trainingLoss: {
        get: (row) => row.metricsData['trainingLoss'],
        header: 'Type',
      },
      trainingAccuracy: {
        get: (row) => row.metricsData['trainingAccuracy'],
        header: 'Examples',
      },
    });
  }

  public async run(): Promise<EaiLanguageModelsMetricsResult> {
    const { flags } = await this.parse(EaiLanguageModelsMetrics);
    const path: string = 'https://api.einstein.ai/v2/vision/models/' + flags.modelid;

    const transport = new EAITransport();

    return transport.makeRequest({ form: null, path, method: 'GET' }).then((data) => {
      const responseMessage = 'Successfully retrieved language model metrics';
      ux.log(responseMessage);
      EaiLanguageModelsMetrics.formatResults(data);
      return { message: responseMessage, data };
    });
  }
}
