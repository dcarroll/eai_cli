# summary

Create a new dataset.

# description

Creates a new dataset based on uploaded file. The dataset then can be used to train a model.

# commandsuccess

Dataset was successfully created with id '%s

# flags.data.summary

Location of the .zip file in the local drive. The maximum .zip file size you can upload from a web location is 50 MB.

# flags.language.summary

Dataset language. Optional. Default is N/A. Reserved for future use.

# flags.name.summary

Name of the dataset. Maximum length is 180 characters.

# flags.path.summary

URL of the .zip file on the web. The maximum .zip file size you can upload from a web location is 50 MB.

# flags.type.summary

Type of dataset data. Valid values are text-intent and text-sentiment. Available in Einstein Vision API version 2.0 and later.

# examples

- <%= config.bin %> <%= command.id %>
