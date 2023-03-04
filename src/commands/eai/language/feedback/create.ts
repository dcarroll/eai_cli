import { createReadStream } from 'fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import * as FormData from 'form-data';
import { JsonMap } from '@salesforce/ts-types';
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
  data: JsonMap;
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
    const fData = new FormData();

    const path = 'v2/language/feedback';

    fData.append('document', flags.document);
    fData.append('expectedLabel', flags.expectedlabel);
    fData.append('modelId', createReadStream(flags.modelid));

    const transport = new EAITransport();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const form = fData.getBuffer().toString();

    return transport.makeRequest({ form, path, method: 'POST' }).then((data) => {
      const responseMessage = 'Successfully created language feedback';
      ux.log(responseMessage);
      return { message: responseMessage, data };
    });
  }
}
