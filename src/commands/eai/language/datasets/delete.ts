import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import { write } from 'clipboardy';
import { JsonMap } from '@salesforce/ts-types';
import EAITransport from '../../../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.language.datasets.delete', [
  'summary',
  'description',
  'commandsuccess',
  'statusCommandPromptClipboard',
  'statusCommandPrompt',
  'examples',
  'flags.datasetid.summary',
  'flags.clipboard.summary',
]);

export type EaiLanguageDatasetsDeleteResult = {
  message: string;
  data: JsonMap;
  nextcommand: string;
};

export default class EaiLanguageDatasetsDelete extends SfCommand<EaiLanguageDatasetsDeleteResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    datasetid: Flags.string({
      summary: messages.getMessage('flags.datasetid.summary'),
      char: 'i',
      required: true,
    }),
    clipboard: Flags.boolean({
      summary: messages.getMessage('flags.clipboard.summary'),
      char: 'c',
      required: false,
    }),
  };

  public async run(): Promise<EaiLanguageDatasetsDeleteResult> {
    const { flags } = await this.parse(EaiLanguageDatasetsDelete);

    const path: string = flags.datasetid ? 'v2/language/datasets/' + flags.datasetid : 'v2/vision/datasets/';

    const transport = new EAITransport();

    return transport.makeRequest({ form: null, path, method: 'DELETE' }).then(async (data) => {
      const responseMessage = messages.getMessage('commandsuccess', [flags.datasetid]);
      ux.log(responseMessage);
      const nextcommand = `sfdx eai language datasets delete status -i ${data['id'] as string}`;
      if (flags.clipboard) {
        ux.log(messages.getMessage('statusCommandPromptClipboard', [nextcommand]));
        await write(nextcommand);
      } else {
        ux.log(messages.getMessage('statusCommandPrompt', [nextcommand]));
      }
      return { message: responseMessage, data, nextcommand };
    });
  }
}
