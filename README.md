# ☸️⚡ Helm chart generator
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Docker Image Version](https://img.shields.io/docker/v/ravaga/helm-chart-generator)](https://hub.docker.com/r/ravaga/helm-chart-generator)
[![NPM Version](https://img.shields.io/npm/v/@ravaga/helm-chart-generator)](https://www.npmjs.com/package/@ravaga/helm-chart-generator)

<!-- markdownlint-disable-next-line -->
[![Helm chart generator technologies](https://skillicons.dev/icons?i=nodejs,docker,kubernetes)](https://github.com/ravaga/helm-chart-generator)

Helm chart generator (🚀 1.0.0-alpha version)

## ✨ Features
The idea to develop this generator came after realizing the problems that were facing developers in our team when they had to create a Helm chart from scratch for a custom containerized application to be deployed on a Kubernetes cluster. According to our experience, the translation of K8s simple manifests to customizable Helm charts is not so easy, and this process usually ends up in a set of packaged manifests that do not allow for as many configurations during installation.

Although there are several charts examples in repositories such as ArtifactHub and even well-defined and fully configurable charts for well-known or widely used applications (see [Bitnami Helm charts](https://github.com/bitnami/charts)), they can be difficult to use or understand for end users.

Therefore, this generator provides a basic but functional chart, which aims to serve as an starting point for developers that want to create a Helm chart for their developed applications from scratch, to avoid the so common "blank page syndrome", or even to create more basic but fully functional charts for that well-known or widely used applications (e.g. Wordpress, Nginx, ...) but with the user's own customizations. 

Finally, the idea is to improve this generator with the help of the community to achieve the creation of a fully functional Helm chart with the minimal human interaction, for instance manual editing of templates and values, after the creation of the chart.


## 📦 Run the Helm chart generator

Currently, it can be run in 2 different ways:

### 🐳 As a Docker container

When running the generator as a Docker container, it's needed to create a simple volume to store the generated charts in the host machine and also run the container in interactive mode.

Using the public Docker image from [Dockerhub](https://hub.docker.com/r/ravaga/helm-chart-generator):

```bash
docker run -it --rm --name helm-chart-generator -v <path_in_host_machine>:/chart-generator/generated-charts ravaga/helm-chart-generator
```

For instance:
```bash
docker run -it --rm --name helm-chart-generator -v ./generated-charts:/chart-generator/generated-charts ravaga/helm-chart-generator
```

Otherwise, you can build and use your own Docker image:

```bash
docker build -t <your-tag> .
```

### 🖥️💾 As an executable binary

In the releases page, there ara available executable binaries for many platforms (Windows x64, Mac OS x64, Linux x64 and Linux ARM64).


```bash
Usage: helm-chart-generator [OPTIONS]...

Options:
  -v, --version                    output the version number
  -o, --charts-output-path <path>  Set the output path of the generated chart
  -h, --help                       display help for command


  Example call:
    $ helm-chart-generator -o ./generated-charts
```


## 📖 Usage
Answer the **general questions** inquired by the generator:

- **Application name**: the application name in lowercase and without symbols or spaces (only hyphens are allowed; capital letters, spaces, underscores, dots and slashes will be automatically removed).
- **Description**: description of the application or the chart.
- **Chart version**: version of the chart in [Semantic Versioning](https://semver.org/) (x.y.z).
- **App version**: version of the application in [Semantic Versioning](https://semver.org/) (x.y.z).
- **Number of components**: number of components (Deployments, StatefulSets and DaemonSets) of the application (without including Jobs and CronJobs). The minimum number of components is 1. A service is created for each component, and if the component type is StatefulSet, a headless Service is additionally created.
- **Number of Jobs**: number of K8s Jobs of the application.
- **Number of CronJobs**: number of K8s CronJobs of the application.
- **Number of dependencies**: number of dependencies (subcharts) of the application.

Answer the specific ***component*'s questions** inquired by the generator (the first group of questions is related to the main component):

- **Component name**: the component name in lowercase and without symbols or spaces (capital letters, spaces, hyphens, underscores, dots and slashes will be automatically removed). Try to not include the application name.
- **Component type**: the K8s controller type of the component (Deployment, StatefulSet or DaemonSet).
- **Component image repository**: the container image repository of the component (e.g. ravaga/assistiot-helm-chart-generator or gitlab.assist-iot.eu:5050/wp6/t6.3/helm-chart-generator).
- **Component image tag**: the container image tag of the component (e.g. 1.5.2, development or latest).
- **Does this component use environment variables?**: yes or no.
- **Has this component a linked service?**: if yes, a K8s service template is created with linked values in the *values.yaml* file. Then, additional questions will be inquired.
- **Number of ports of the component's service**: (only if the answer to the previous question is *yes*) number of ports of the K8s Service of the component. The default and minimum value is 1.

Answer the specific **component *service*'s questions** (if included) inquired by the generator:

- **Port name**: the port name in lowercase and without symbols or spaces (capital letters, spaces, hyphens, underscores, dots and slashes will be automatically removed).
- **Port protocol**: the port protocol (TCP, UDP or SCTP).
- **Port number**: the port number (allowed values range from 0 to 65535).

Answer the specific ***Cron* and *CronJob*** (if included) **questions** inquired by the generator:
- **Job/CronJob name**: the Job/CronJob name in lowercase and without symbols or spaces (capital letters, spaces, hyphens, underscores, dots and slashes will be automatically removed). Try to not include the application name.
- **Job/CronJob image repository**: the container image repository of the Job/CronJob.
- **Job/CronJob image tag**: the container image tag of the Job/CronJob.
- **Does this Job/CronJob use environment variables?**: yes or no.

Answer the specific ***dependencies***' (if included) **questions** inquired by the generator:
- **Dependency name**: the dependency name in lowercase and without symbols or spaces (only hyphens are allowed; capital letters, spaces, underscores, dots and slashes will be automatically removed).
- **Dependency version**: version of the dependency chart in [Semantic Versioning](https://semver.org/) (x.y.z).
- **Dependency repository**: Helm chart repository name (the repository must have been previously added using the [*helm repo add* command](https://helm.sh/docs/helm/helm_repo_add/)) started with an *@* (e.g. @bitnami) or its url (e.g. https://charts.bitnami.com/bitnami).

Finally, the Helm chart will be generated inside the *generated-charts* folder. If the generator has been run using Docker, the chart will be generated inside the specified Docker volume.

## 📁 Generated charts structure

    applicationname/

        Chart.yaml          # A YAML file containing general information about the chart.

        .helmignore         # The .helmignore file is used to specify files to not include in the chart.

        values.yaml         # The default configuration values for this chart. These values are grouped by the component or job that they belong to, inside a diferent object.

        qa-values.yaml      # A copy of the values.yaml file for development purposes.

        charts/             # A directory containing any charts (subcharts) upon which this chart depends. 
                            # The folder is initially empty, so the user must include inside it the needed subcharts, or manage them dynamically using the "helm dependency update" command.

        crds/               # Custom Resource Definitions (empty folder).

        templates/          # A directory of templates that, when combined with values,
                            # will generate valid Kubernetes manifest files.
            
            NOTES.txt       # A plain text file containing short usage notes. A default file is generated.

            _helpers.tpl    # A place to put template helpers that you can re-use throughout the chart.
                            # In this file are defined the application name, chart name, component name and labels, jobs name and labels.

            componentN/     # A directory containing the componentN K8s controller (Deployment, StatefulSet or DaemonSet) manifest and its Services manifests.
                            # Additional manifests can be included (e.g. ConfigMaps) inside this folder.
                            # Note: a directory is created for each component.
            
            jobs/           # A directory containing all the Jobs and CronJobs K8s manifests (only is created if the application has Jobs or CronJobs).

### Component default labels

### Values structure

## ✅ Chart testing

You have to install Helm in your local machine to be able to use the *Helm CLI*. In addition, you must have access to a K8s cluster in order to run the  *helm install* commands.

Examine a generated chart for possible issues:

```bash
helm lint generated-charts/chart-name
```

Render chart templates locally and display the output. None of the server-side testing of chart validity is done.

```bash
helm template generated-charts/chart-name --debug
```

Test the installation of a generated chart without actually installing it (e.g. to inspect that the values of the values.yaml file are included in the K8s manifests, the labels are properly created, ...):

```bash
helm install <release-name> generated-charts/chart-name --debug --dry-run
``` 

For example:

```bash
helm install test generated-charts/chart-name --debug --dry-run
```


## 🙋 Examples folder

A folder of examples will be added to help users to improve their knowledge on the use of this tool. Each example will be divided into two folders:

- **generated**: the generated chart using this tool, without any modifications.
- **production**: the final chart ready for production, which has been created by modifying the generated chart.


## 🖥️ Developer guide
**This software is open-source, so it's open to any modifications and contributions**. The only thing you have to do is to install the project depencencies by running the *npm i* command. Then, you can generate a chart by running *npm run generate-chart*. The Helm chart will be generated inside the *generated-charts* folder, in the same path as the code.

```bash
npm i
```
```bash
npm run generate-chart
```
```bash
ls generated-charts/<chart-name>
```

## ❔ What's next
## 💡⚠️ Known limitations

## ⚠️📰 License

Copyright 2024 Rafael Vaño Garcia (@ravaga)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.