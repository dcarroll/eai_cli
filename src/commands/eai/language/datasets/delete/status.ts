import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import { JsonMap } from '@salesforce/ts-types';
import EAITransport from '../../../../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.language.datasets.delete.status', [
  'summary',
  'description',
  'commandsuccess',
  'examples',
  'flags.name.summary',
]);

export type EaiLanguageDatasetsDeleteStatusResult = {
  message: string;
  data: JsonMap;
};

export default class EaiLanguageDatasetsDeleteStatus extends SfCommand<EaiLanguageDatasetsDeleteStatusResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    datasetid: Flags.string({
      summary: messages.getMessage('flags.name.summary'),
      char: 'i',
      required: true,
    }),
  };

  private static formatResults(data): void {
    ux.styledObject(data, ['id', 'type', 'status', 'deletedObjectId']);
  }

  public async run(): Promise<EaiLanguageDatasetsDeleteStatusResult> {
    const { flags } = await this.parse(EaiLanguageDatasetsDeleteStatus);
    const path: string = flags.datasetid ? 'v2/language/deletion/' + flags.datasetid : 'v2/vision/datasets/';
    const transport = new EAITransport();

    return transport.makeRequest({ form: null, path, method: 'GET' }).then((data) => {
      const responseMessage = messages.getMessage('commandsuccess');
      ux.log(responseMessage);
      EaiLanguageDatasetsDeleteStatus.formatResults(data);
      return { message: responseMessage, data };
    });
  }
}
