import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { ux } from '@oclif/core';
import { JsonMap } from '@salesforce/ts-types';
import * as FormData from 'form-data';
import EAITransport from '../../../utils/transport';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('test', 'eai.language.sentiment', [
  'summary',
  'description',
  'examples',
  'flags.modelid.summary',
  'flags.numresults.summary',
  'flags.document.summary',
  'flags.sampleid.summary',
]);

export type EaiLanguageSentimentResult = {
  message: string;
  data: JsonMap;
};

export default class EaiLanguageSentiment extends SfCommand<EaiLanguageSentimentResult> {
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

  public async run(): Promise<EaiLanguageSentimentResult> {
    const { flags } = await this.parse(EaiLanguageSentiment);
    const fData = new FormData();

    const path = 'v2/language/sentiment/';

    fData.append('modelId', flags.modelid);
    fData.append('numResults', flags.numresults);
    if (flags.sampleid) fData.append('sampleid', flags.sampleid);
    fData.append('document', flags.document);

    const transport = new EAITransport();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const form = fData.getBuffer().toString();

    return transport.makeRequest({ form, path, method: 'POST' }).then((data) => {
      const responseMessage = 'Successfully retrieved prediction\n';
      ux.log(responseMessage);
      EaiLanguageSentiment.formatResults(data);
      return { message: responseMessage, data };
    });
  }
}
