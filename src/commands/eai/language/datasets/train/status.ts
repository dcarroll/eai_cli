/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import EAITransport from '../../../../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.language.datasets.train.status', [
  'summary',
  'description',
  'examples',
  'flags.modelid.summary',
]);

export type EaiLanguageDatasetsTrainStatusResult = {
  message: string;
  data: JSON;
};

export default class EaiLanguageDatasetsTrainStatus extends SfCommand<EaiLanguageDatasetsTrainStatusResult> {
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

  private static formatResults(data: any) {
    ux.styledObject(data, ['name', 'status', 'modelId', 'modelType', 'updatedAt']);
  }

  public async run(): Promise<EaiLanguageDatasetsTrainStatusResult> {
    const { flags } = await this.parse(EaiLanguageDatasetsTrainStatus);

    const path: string = 'https://api.einstein.ai/v2/language/train/' + flags.modelid;

    const transport = new EAITransport();

    return transport.makeRequest({ form: null, path, method: 'GET' }).then((data) => {
      const responseMessage = 'Successfully retrieved training status';
      ux.log(responseMessage);
      EaiLanguageDatasetsTrainStatus.formatResults(data);
      return { message: responseMessage, data };
    });
  }
}
