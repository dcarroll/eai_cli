import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import EAITransport from '../../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.language.intent', [
  'summary',
  'description',
  'examples',
  'flags.modelid.summary',
  'flags.numresults.summary',
  'flags.document.summary',
  'flags.sampleid.summary',
]);

export type EaiLanguageIntentResult = {
  message: string;
  data: JSON;
};

export default class EaiLanguageIntent extends SfCommand<EaiLanguageIntentResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    modelid: Flags.string({
      summary: messages.getMessage('flags.modelid.summary'),
      char: 'i',
      required: true,
    }),
    document: Flags.string({
      summary: messages.getMessage('flags.document.summary'),
      char: 'd',
      required: true,
    }),
    numresults: Flags.integer({
      summary: messages.getMessage('flags.numresults.summary'),
      char: 'n',
      required: false,
      default: 2,
    }),
    sampleid: Flags.string({
      summary: messages.getMessage('flags.sampleid.summary'),
      char: 's',
      required: false,
    }),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static formatResults(intents: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    ux.table(intents.probabilities, {
      probability: {
        header: 'Probability',
      },
      label: {
        header: 'Label',
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public async run(): Promise<EaiLanguageIntentResult> {
    const { flags } = await this.parse(EaiLanguageIntent);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
    const formData = require('form-data');

    const path = 'https://api.einstein.ai/v2/language/intent/';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const form = new formData();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    form.append('modelId', flags.modelid);
    if (flags.numresults) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      form.append('numResults', flags.numresults);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (flags.sampleid) form.append(flags.sampleid);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    form.append('document', flags.document);

    const transport = new EAITransport();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return transport.makeRequest({ form, path, method: 'POST' }).then((data) => {
      const responseMessage = 'Successfully retrieved predictions';
      ux.log(responseMessage);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      EaiLanguageIntent.formatResults(data);
      return { message: responseMessage, data };
    });
  }
}
