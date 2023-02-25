/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import { write } from 'clipboardy';
import EAITransport from '../../../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.language.datasets.retrain', [
  'summary',
  'description',
  'commandsuccess',
  'examples',
  'statusCommandPromptClipboard',
  'statusCommandPrompt',
  'flags.modelid.summary',
  'flags.epochs.summary',
  'flags.learningrate.summary',
  'flags.trainparams.summary',
  'flags.clipboard.summary',
  'flags.name.summary',
]);

export type EaiLanguageDatasetsRetrainResult = {
  message: string;
  data: JSON;
};

export default class EaiLanguageDatasetsRetrain extends SfCommand<EaiLanguageDatasetsRetrainResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    modelid: Flags.string({
      summary: messages.getMessage('flags.modelid.summary'),
      char: 'i',
      required: true,
    }),
    epochs: Flags.integer({
      summary: messages.getMessage('flags.epochs.summary'),
      char: 'e',
      required: false,
    }),
    learningrate: Flags.integer({
      summary: messages.getMessage('flags.learningrate.summary'),
      char: 'r',
      required: false,
    }),
    trainparams: Flags.string({
      summary: messages.getMessage('flags.trainparams.summary'),
      char: 'p',
      required: false,
    }),
    clipboard: Flags.boolean({
      summary: messages.getMessage('flags.clipboard.summary'),
      char: 'c',
      required: false,
    }),
  };

  public async run(): Promise<EaiLanguageDatasetsRetrainResult> {
    const { flags } = await this.parse(EaiLanguageDatasetsRetrain);
    const formData = require('form-data');

    const path = 'https://api.einstein.ai/v2/language/retrain';

    const form = new formData();
    form.append('modelId', flags.modelid);
    if (flags.epoches) form.append('epochs', flags.epochs);
    if (flags.learningrate) form.append('learningRate', flags.learningrate);
    if (flags.trainparams) form.append('trainParams', flags.trainparams);

    const transport = new EAITransport();

    return transport.makeRequest({ form, path, method: 'POST' }).then(async (data) => {
      const responseMessage = messages.getMessage('commandsuccess', data['modelId']);
      const nextCommand = `sfdx eai:language:datasets:train:status -i ${data['modelId']}`;
      ux.styledObject(data, ['datasetId', 'modelId', 'name', 'status', 'progress', 'createdAt']);
      if (flags.clipboard) {
        ux.log(messages.getMessage('statusCommandPromptClipboard', [nextCommand]));
        await write(nextCommand);
      } else {
        ux.log(messages.getMessage('statusCommandPrompt', [nextCommand]));
      }
      return { message: responseMessage, data, nextCommand };
    });
  }
}
