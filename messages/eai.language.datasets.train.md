# summary

Train a model on the specified dataset

# description

Train a model on the specified dataset

# flags.datasetid.summary

Id of the dataset to be trained

# commandsuccess

Successfully requested dataset '%s' be trained, status is '%s'

# statusCommandPrompt

You can check the status of the training by entering the command below\n%s

# statusCommandPromptClipboard

The command below has been placed in your clipboard\n%s

# flags.epochs.summary

Number of training iterations for the neural network. Optional. Valid values are 1–1,000.

# flags.name.summary

Name of the model. Maximum length is 180 characters

# flags.learningrate.summary

Specifies how much the gradient affects the optimization of the model at each time step. Optional. Use this parameter to tune your model. Valid values are between 0.0001 and 0.01. If not specified, the default is 0.0001. We recommend keeping this value between 0.0001 and 0.001. This parameter isn\"t used when training a detection dataset.

# flags.trainparams.summary

JSON that contains parameters that specify how the model is created.

# flags.clipboard.summary

places the dataset train status command in your clipboard

# examples

- <%= config.bin %> <%= command.id %>
