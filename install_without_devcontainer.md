## Local Installation Guide for codfsh Extension

This guide provides detailed instructions for manually setting up the codfsh extension and its dependencies on your local machine. This setup is ideal for users who prefer not to use a devcontainer and would like to configure their development environment directly on their local system. Follow these steps to ensure that all necessary tools and dependencies are correctly installed for the codfsh extension to function properly.



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