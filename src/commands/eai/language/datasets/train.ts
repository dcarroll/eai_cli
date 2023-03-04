import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import { write } from 'clipboardy';
import * as FormData from 'form-data';
import { JsonMap } from '@salesforce/ts-types';
import EAITransport from '../../../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.language.datasets.train', [
  'summary',
  'description',
  'commandsuccess',
  'statusCommandPrompt',
  'statusCommandPromptClipboard',
  'examples',
  'flags.datasetid.summary',
  'flags.epochs.summary',
  'flags.learningrate.summary',
  'flags.name.summary',
  'flags.trainparams.summary',
  'flags.clipboard.summary',
]);

export type EaiLanguageDatasetsTrainResult = {
  message: string;
  data: JsonMap;
};

export default class EaiLanguageDatasetsTrain extends SfCommand<EaiLanguageDatasetsTrainResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    datasetid: Flags.string({
      summary: messages.getMessage('flags.datasetid.summary'),
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
    name: Flags.string({
      summary: messages.getMessage('flags.name.summary'),
      char: 'n',
      required: true,
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

  public async run(): Promise<EaiLanguageDatasetsTrainResult> {
    const { flags } = await this.parse(EaiLanguageDatasetsTrain);
    const fData = new FormData();

    const path = 'v2/language/train';

    fData.append('datasetId', flags.datasetid);
    fData.append('name', flags.name);
    if (flags.epoches) fData.append('epochs', flags.epochs);
    if (flags.learningrate) fData.append('learningRate', flags.learningrate);
    if (flags.trainparams) fData.append('trainParams', flags.trainparams);

    const transport = new EAITransport();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const form = fData.getBuffer().toString();

    return transport.makeRequest({ form, path, method: 'POST' }).then(async (data) => {
      const responseMessage = messages.getMessage('commandsuccess', [
        data['datasetId'] as string,
        data['status'] as string,
      ]);
      ux.log(responseMessage);
      const nextCommand = `sfdx eai:language:datasets:train:status -i ${data['modelId'] as string}`;
      if (flags.clipboard) {
        ux.log(messages.getMessage('statusCommandPromptClipboard', [nextCommand]));
        await write(nextCommand);
      } else {
        ux.log(messages.getMessage('statusCommandPrompt', [nextCommand]));
        ux.styledObject(data, ['datasetId', 'name', 'status', 'modelType', 'modelId']);
      }
      return { message: responseMessage, data, nextCommand };
    });
  }
}
