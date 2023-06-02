

# codfsh extension README

This extensions wrappes SUSHI Shorthand and Hapi Validator to provide propper warning and error messages. It lets you also "run" your `.fsh` shorthand files into both FHIR `.json`-files and additionally validate them in one go.

## Features

Key features are the commands to run SUSHI and/or Hapi validator via `CTRL`+`Shift`+`P`-Prompt

![run Commands Prompt][runCommands]

### Execute Sushi Shorthand

Execute sushi shorthand with `Run Sushi` command to get line based error or warnings messages under the Problems tab in your terminal

![sushi Errors Example][errorImage]

> Tip: You can bind a key to execute sushi shorthand. We recommend you use 'F5' to run Sushi.

### Execute Hapi Validator

Execute Hapi Validator with `Run Hapi Validator` command to get line based error or warnings messages under the Problems tab in your terminal

### Install missing FHIR Packages from your sushi-config.yaml
![Dependency will be checked and installed ][dependencyImage]

If you have Firely Terminal installed and a sushi-config.yaml file present in your current project, the necessary dependencies will be checked. If they are not present, they will be installed with a click.

## Requirements

It is mandatory that sushi Shorthand and Hapi Validator are installed on the system. These two FHIR-Tools depend on other libs and tools. Please follow the steps underneath to set up your _codfsh_-environment.

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

npm is needed to run Sushi

```
sudo apt install nodejs
```

```
sudo apt install npm
```

### Install Sushi Shorthand

Sushi is the interpreter for `.fsh`-files to create FHIR-json files as your FHIR-Specification.

```
sudo npm install -g fsh-sushi
```

### Install firely.terminal (optional)

firely.terminal will be used in the background to manage your `~/.fhir`-package library

```
sudo dotnet tool install --global firely.terminal
```

The path of the Hapi Validator needs to be specified in the Settings of the extension.

### Download Hapi Validator

The HAPI FHIR validator is used via its command line interface. You ned to download the `.jar`-file, e.g. via

```
wget https://github.com/hapifhir/org.hl7.fhir.core/releases/latest/download/validator_cli.jar
```

The path to the downloaded Hapi Validator jar-file needs to be specified in the settings of the extension.

### Install Extension from this Repo
Congrats! You are now done with all the requirements and have set up your codfsh-environment. We know this was a big issue. We currently work on major improvements, to automate as much of the steps as possible.

Now you might want to install the `codfsh`-extension.
* Download latest codfsh-x.y.z.vsix file from https://github.com/gematik/codfsh/tree/main/package
* run following command in a terminal

```
code --install-extension codfsh-x.y.z.vsix
```

## Extension Settings

To work properly the following settings need to be set:

![sushi Settings][sushiSettings]

[runCommands]: https://github.com/gematik/codfsh/raw/main/images/runCommands.png
[errorImage]: https://github.com/gematik/codfsh/raw/main/images/sushiErrors.png
[sushiSettings]: https://github.com/gematik/codfsh/raw/main/images/settings.png
[dependencyImage]: https://github.com/gematik/codfsh/raw/main/images/install_missing_dependencies.gif