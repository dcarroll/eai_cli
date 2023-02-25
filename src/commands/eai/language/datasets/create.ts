import { createReadStream } from 'fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
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
  data: JSON;
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
    const formData = require('form-data');

    const path = 'https://api.einstein.ai/v2/language/datasets/upload/sync';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const form = new formData();
    if (flags.path) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      form.append('path', flags.path);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      form.append('data', createReadStream(flags.data));
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    form.append('type', flags.type);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (flags.name) form.append('name', flags.name);

    const transport = new EAITransport();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return transport.makeRequest({ form, path, method: 'POST' }).then((data) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const responseMessage = messages.getMessage('commandsuccess', [data['id']]);
      ux.log(responseMessage);
      ux.styledObject(data, ['id', 'name', 'totalExamples', 'totalLabels', 'type']);
      return { message: responseMessage, data };
    });
  }
}
