import { createReadStream } from 'fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import * as FormData from 'form-data';
import { JsonMap } from '@salesforce/ts-types';
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
  data: JsonMap;
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

  private static formatResults(data: JsonMap): void {
    ux.styledObject(data, ['id', 'type', 'statusMsg']);
  }

  public async run(): Promise<EaiLanguageExamplesCreateResult> {
    const { flags } = await this.parse(EaiLanguageExamplesCreate);
    const fData = new FormData();

    const path = `v2/language/datasets/${flags.datasetid}/upload`;

    if (flags.path) {
      fData.append('path', flags.path);
    } else {
      fData.append('data', createReadStream(flags.data));
    }

    const transport = new EAITransport();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const form = fData.getBuffer().toString();

    return transport.makeRequest({ form, path, method: 'PUT' }).then((data) => {
      const responseMessage = messages.getMessage('commandsuccess', [data['id'] as string]);
      ux.log(responseMessage);
      EaiLanguageExamplesCreate.formatResults(data);
      return { message: responseMessage, data };
    });
  }
}
