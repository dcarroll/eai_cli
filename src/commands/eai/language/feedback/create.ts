/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createReadStream } from 'fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import EAITransport from '../../../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.language.feedback.create', [
  'summary',
  'description',
  'examples',
  'flags.document.summary',
  'flags.expectedlabel.summary',
  'flags.modelid.summary',
]);

export type EaiLanguageFeedbackCreateResult = {
  message: string;
  data: JSON;
};

export default class EaiLanguageFeedbackCreate extends SfCommand<EaiLanguageFeedbackCreateResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    document: Flags.string({
      summary: messages.getMessage('flags.document.summary'),
      char: 'd',
      required: true,
    }),
    expectedlabel: Flags.string({
      summary: messages.getMessage('flags.expectedlabel.summary'),
      char: 'l',
      required: true,
    }),
    modelid: Flags.string({
      summary: messages.getMessage('flags.modelid.summary'),
      char: 'i',
      required: true,
    }),
  };

  public async run(): Promise<EaiLanguageFeedbackCreateResult> {
    const { flags } = await this.parse(EaiLanguageFeedbackCreate);
    const formData = require('form-data');

    const path = 'https://api.einstein.ai/v2/language/feedback';

    const form = new formData();
    form.append('document', flags.document);
    form.append('expectedLabel', flags.expectedlabel);
    form.append('modelId', createReadStream(flags.modelid));

    const transport = new EAITransport();

    return transport.makeRequest({ form, path, method: 'POST' }).then((data) => {
      const responseMessage = 'Successfully created language feedback';
      ux.log(responseMessage);
      return { message: responseMessage, data };
    });
  }
}
