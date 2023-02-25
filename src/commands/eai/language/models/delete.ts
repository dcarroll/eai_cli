/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import EAITransport from '../../../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.language.models.delete', [
  'summary',
  'description',
  'examples',
  'flags.modelid.summary',
]);

export type EaiLanguageModelsDeleteResult = {
  message: string;
  data: JSON;
};

export default class EaiLanguageModelsDelete extends SfCommand<EaiLanguageModelsDeleteResult> {
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

  public async run(): Promise<EaiLanguageModelsDeleteResult> {
    const { flags } = await this.parse(EaiLanguageModelsDelete);
    const path = `https://api.einstein.ai/v2/language/models/${flags.modelid}`;

    const transport = new EAITransport();

    return transport.makeRequest({ form: null, path, method: 'DELETE' }).then((data) => {
      const responseMessage = 'Successfully queued language model for deletion';
      ux.log(responseMessage);
      return { message: responseMessage, data };
    });
  }
}
