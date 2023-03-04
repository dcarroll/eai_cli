import { createReadStream } from 'fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import * as formData from 'form-data';
import { JsonMap } from '@salesforce/ts-types';
import { Tokens } from '@salesforce/core/lib/messages';
import EAITransport from '../../../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.language.datasets.create', [
  'summary',
  'description',
  'examples',
  'commandsuccess',
  'flags.data.summary',
  'flags.language.summary',
  'flags.name.summary',
  'flags.path.summary',
  'flags.type.summary',
]);

export type EaiLanguageDatasetsCreateResult = {
  message: string;
  data: JsonMap;
};

export default class EaiLanguageDatasetsCreate extends SfCommand<EaiLanguageDatasetsCreateResult> {
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
    language: Flags.string({
      summary: messages.getMessage('flags.language.summary'),
      char: 'l',
      required: false,
    }),
    name: Flags.string({
      summary: messages.getMessage('flags.name.summary'),
      char: 'n',
      required: false,
    }),
    path: Flags.string({
      summary: messages.getMessage('flags.path.summary'),
      char: 'p',
      required: false,
      exclusive: ['data'],
    }),
    type: Flags.string({
      summary: messages.getMessage('flags.type.summary'),
      char: 't',
      required: true,
    }),
  };

  public async run(): Promise<EaiLanguageDatasetsCreateResult> {
    const { flags } = await this.parse(EaiLanguageDatasetsCreate);

    const path = 'v2/language/datasets/upload/sync';

    const fData = new formData();
    if (flags.path) {
      fData.append('path', flags.path);
    } else {
      fData.append('data', createReadStream(flags.data));
    }
    fData.append('type', flags.type);
    if (flags.name) fData.append('name', flags.name);

    const transport = new EAITransport();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const form = fData.getBuffer().toString();
    return transport.makeRequest({ form, path, method: 'POST' }).then((data) => {
      const responseMessage = messages.getMessage('commandsuccess', data['id'] as Tokens);
      ux.log(responseMessage);
      ux.styledObject(data, ['id', 'name', 'totalExamples', 'totalLabels', 'type']);
      return { message: responseMessage, data };
    });
  }
}
