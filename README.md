

# codfsh extension README

This extension wraps SUSHI (FHIR Shorthand) and the HAPI Validator, providing comprehensive warning and error messages. It allows you to "run" your .fsh shorthand files to both generate FHIR .json files and validate them simultaneously.

## Features

Key features are the commands to run SUSHI and/or Hapi validator via `CTRL`+`Shift`+`P`-Prompt

![run Commands Prompt][runCommands]

### Execute Sushi Shorthand

Execute SUSHI Shorthand with `Run Sushi` command to get line-based error or warning messages in the Problems tab of your terminal.

![sushi Errors Example][errorImage]

> Tip: You can bind a key to execute SUSHI Shorthand. We recommend you use 'F5' to run SUSHI.

### Execute Hapi Validator

Execute the HAPI Validator with the Run HAPI Validator command to get line-based error or warning messages in the Problems tab of your terminal.

### Install missing FHIR Packages from your sushi-config.yaml
![Dependency will be checked and installed ][dependencyImage]

If you have Firely Terminal installed and a `sushi-config.yaml` file present in your current project, the necessary dependencies will be checked. If they are not present, they will be installed with a click.

## Requirements

The SUSHI Shorthand and HAPI Validator must be installed on your system. These two FHIR Tools depend on other libraries and tools. Please follow the steps below to set up your `codfsh` environment.

### Install Java JRE

Java JRE is needed to run the Hapi validator. Any newer version will be fine. The Hapi documentation refers to > JDK 17

```
sudo apt install default-jre
```

### Install dotnet SDK

Dotnet SDK >= 6.0 is needed to run firely.terminal

```
sudo apt install dotnet-sdk-6.0
```

### Install npm

npm is needed to run SUSHI.

```
sudo apt install nodejs
```

```
sudo apt install npm
```

### Install Sushi Shorthand

SUSHI is the interpreter for `.fsh` files to create FHIR JSON files as your FHIR Specification.

```
sudo npm install -g fsh-sushi
```

### Install firely.terminal (optional)

The Firely Terminal will be used in the background to manage your `~/.fhir` package library.

```
sudo dotnet tool install --global firely.terminal
```

The path of the HAPI Validator needs to be specified in the settings of the extension.

### Download HAPI FHIR validator
HAPI FHIR Validator is used via its command line interface. To download the HAPI FHIR Validator, please refer to the [official documentation](https://hapifhir.io/hapi-fhir/docs/getting_started/downloading_and_importing.html)

Alternatively, you can download the `.jar` file directly:

```
wget https://github.com/hapifhir/org.hl7.fhir.core/releases/latest/download/validator_cli.jar
```

The path to the downloaded HAPI Validator jar-file needs to be specified in the settings of the extension.

## Extension Settings

To work properly the following settings need to be set:

![Settings][settings]

### Configuring Additional Parameters for HAPI Validator

The extension supports additional parameter configuration for HAPI Validator. These parameters influence the behavior of the validation process. You can set these parameters in two ways:

1. **Via the settings file:** The settings file is specified in your configuration under the `codfsh.HapiValidator.Settings.SettingsFile` key. The parameters should be specified under the `hapi_parameters` section in this YAML file. Each parameter should be a key-value pair. If a parameter doesn't require a value, you can set it as `true`. Here is an example:
```
    hapi_parameters: 
      jurisdiction: DE
      locale: de-DE
      tx: n/a
      debug: true
      proxy: 192.168.110.10:3128
```

2. **Via the configuration field:** You can specify additional parameters directly in your configuration under the `codfsh.HapiValidator.Settings.AdditionalParameter` key. Here you can specify parameters as a string, each starting with a dash `-`. If a parameter doesn't need a value, simply write its name. If it requires a value, provide it after a space. Here's an example:
```
    "-jurisdiction DE -locale de-DE -tx n/a -debug"
```
If a parameter is set in both the settings file and the configuration field, it will only be used once in the validation command.

This gives you flexibility in configuring your validation parameters. For instance, you might want to set common parameters in the settings file and override or add specific ones via the configuration field for a particular workspace.

To see all the available parameters for the HAPI Validator, please refer to the HAPI Validator documentation.


[runCommands]: https://github.com/gematik/codfsh/raw/main/images/runCommands.png
[errorImage]: https://github.com/gematik/codfsh/raw/main/images/sushiErrors.png
[settings]: https://github.com/gematik/codfsh/raw/main/images/settings.png
[dependencyImage]: https://github.com/gematik/codfsh/raw/main/images/install_missing_dependencies.gif