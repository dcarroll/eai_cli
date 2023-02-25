/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
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
const messages = Messages.load('test', 'eai.language.examples.create', [
  'summary',
  'description',
  'commandsuccess',
  'examples',
  'flags.data.summary',
  'flags.path.summary',
  'flags.datasetid.summary',
]);

export type EaiLanguageExamplesCreateResult = {
  message: string;
  data: JSON;
};

export default class EaiLanguageExamplesCreate extends SfCommand<EaiLanguageExamplesCreateResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    data: Flags.string({
      summary: messages.getMessage('flags.data.summary'),
      char: 'd',
      required: false,
      exclusive: ['path'],
    }),
    path: Flags.string({
      summary: messages.getMessage('flags.path.summary'),
      char: 'p',
      required: false,
      exclusive: ['data'],
    }),
    datasetid: Flags.string({
      summary: messages.getMessage('flags.datasetid.summary'),
      char: 'i',
      required: true,
    }),
  };

  private static formatResults(data: JSON) {
    ux.styledObject(data, ['id', 'type', 'statusMsg']);
  }

  public async run(): Promise<EaiLanguageExamplesCreateResult> {
    const { flags } = await this.parse(EaiLanguageExamplesCreate);
    const formData = require('form-data');

    const path = `https://api.einstein.ai/v2/language/datasets/${flags.datasetid}/upload`;

    const form = new formData();
    if (flags.path) {
      form.append('path', flags.path);
    } else {
      form.append('data', createReadStream(flags.data));
    }

    const transport = new EAITransport();

    return transport.makeRequest({ form, path, method: 'PUT' }).then((data) => {
      const responseMessage = messages.getMessage('commandsuccess', [data['id']]);
      ux.log(responseMessage);
      EaiLanguageExamplesCreate.formatResults(data);
      return { message: responseMessage, data };
    });
  }
}
