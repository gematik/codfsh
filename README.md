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

## Simplified Setup with Devcontainer

The best way to install and preconfigure the `codfsh` extension is by using the `.devcontainer` setup. This approach ensures that all necessary tools and configurations are automatically set up, providing a seamless development experience.

### Using the Devcontainer

1. **Copy the `.devcontainer` Folder**: Clone or download the `.devcontainer` folder from this repository and add it to the root of your project.

2. **Open with VSCode in Container Mode**: Open your project in Visual Studio Code and use the command palette (`Ctrl+Shift+P`) to select "Remote-Containers: Reopen in Container". This will set up your development environment in a Docker container with all necessary tools preconfigured.

3. **Start Developing**: Once the container is set up, you can start using the `codfsh` extension without any additional configuration steps.

### Devcontainer Configuration

The `.devcontainer` includes a `Dockerfile` and a `codfsh-config.yaml` file with the following preconfigured settings:

```yaml
sushi:
  min_version: "3.0.0"
hapi:
  min_version: "3.0.0"
  parameters: 
    jurisdiction: DE
    locale: de-DE
    tx: "n/a"
    debug: true
```
This configuration ensures that you have the correct versions of SUSHI and HAPI, along with customized parameters for your development needs.

## Local Installation Without Devcontainer

For users who prefer a local installation without using a devcontainer, we have provided detailed instructions on how to set up the `codfsh` extension and its dependencies manually. This alternative setup is ideal for those who want to configure their development environment on their local machine directly.

Please refer to the [Local Installation Guide](./install_without_devcontainer.md) for step-by-step instructions on setting up the `codfsh` extension without using a devcontainer.


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