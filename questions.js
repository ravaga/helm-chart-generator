module.exports = {
  generalQuestions: [
    {
      type: "input",
      name: "name",
      message: "Application name:",
      validate: async (input) => {
        if (input && input.replace(/\s|-|_|["']|\.|\//g, "").length >= 1) return true
        else return "The name of the application cannot be empty"
      },
      filter: async (input) => input.toLowerCase().replace(/\s|_|["']|\.|\//g, "")
    },
    {
      type: "input",
      name: "description",
      message: "Description:",
      default: "A Helm chart for Kubernetes",
    },
    {
      type: "input",
      name: "keywords",
      message: "Keywords (separated by commas):",
      filter: async (input) => {
        input = input.split(",").map(i=>i.replace(/\s/g, ""))
        if (input.length > 0 && input[0] === "") return []
        return input
      }
    },
    {
      type: "input",
      name: "chartVersion",
      message: "Chart version:",
      default: "0.1.0",
      validate: async (input) => {
        let semVerPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
        if (semVerPattern.test(input)) return true
        else return "The chart version must follow the Semantic Versioning Specification"
      }
    },
    {
      type: "input",
      name: "appVersion",
      message: "App version:",
      default: "0.1.0",
      validate: async (input) => {
        let semVerPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
        if (semVerPattern.test(input)) return true
        else return "The app version of the chart (actually the application version) must follow the Semantic Versioning Specification"
      }
    },
    {
      type: "number",
      name: "components",
      message: "Number of components:",
      default: 1,
      validate: async (input) => {
        if (input >= 1) return true
        else return "The number of components must be greater than zero"
      }
    },
    {
      type: "number",
      name: "jobs",
      message: "Number of Jobs:",
      default: 0,
    },
    {
      type: "number",
      name: "cronjobs",
      message: "Number of CronJobs:",
      default: 0,
    },
    {
      type: "number",
      name: "dependencies",
      message: "Number of dependencies:",
      default: 0,
    }
  ],
  componentQuestions: [
    {
      type: "input",
      name: "name",
      message: "Component name:",
      filter: async (input) => input.toLowerCase().replace(/\s|_|["']|\.|\//g, "")
    },
    {
      type: "list",
      name: "type",
      message: "Component type",
      choices: ["deployment", "statefulset", "daemonset"],
      default: "deployment",
    },
    {
      type: "input",
      name: "imageRepo",
      message: "Component image repository:",
      validate: async (input) => {
        if (input) return true
        else return "The image repository cannot be empty"
      }
    },
    {
      type: "input",
      name: "imageTag",
      message: "Component image tag:",
      filter: async (input) => (input.replace(/\s/g, "") === "\"\"") ? "" : input
    },
    {
      type: "list",
      name: "hasEnvVars",
      message: "Does this component use environment variables?",
      choices: ["yes", "no"],
      default: "yes",
      filter: async (input) => input === "yes"
    },
    // {
    //   type: "confirm",
    //   name: "hasEnvVars",
    //   message: "Does this component use environment variables?",
    //   default: true
    // },
    {
      type: "list",
      name: "hasService",
      message: "Has this component a linked service?",
      choices: ["yes", "no"],
      default: "yes",
      filter: async (input) => input === "yes"
    },
    {
      type: "list",
      name: "serviceType",
      message: "Service type",
      choices: ["NodePort", "ClusterIP", "LoadBalancer"],
      default: "NodePort",
      when: async (answers) => answers.hasService
    },
    {
      type: "number",
      name: "ports",
      message: "Number of ports of the service",
      default: 1,
      validate: async (input) => {
        if (input >= 1) return true
        else return "The number of ports must be greater than zero"
      },
      when: async (answers) => answers.hasService
    },
    {
      type: "list",
      name: "hostNetwork",
      message: "Does this Daemonset use the node's host network",
      choices: ["yes", "no"],
      default: "no",
      filter: async (input) => input === "yes",
      when: async (answers) => !answers.hasService && answers.type === "daemonset"
    },
    {
      type: "list",
      name: "dnsPolicy",
      message: "DNS Policy",
      choices: ["Default", "ClusterFirst", "ClusterFirstWithHostNet", "None"],
      default: "Default",
      when: async (answers) => answers.type === "daemonset"
    },
  ],
  servicePortsQuestions: [
    {
      type: "input",
      name: "name",
      message: "Port name:",
      validate: async (input) => {
        if (input.length >= 15) return "The port name can't have more than 15 characters"
        else return true
      },
      filter: async (input) => input.toLowerCase().replace(/\s|_|["']|\.|\//g, "")
    },
    {
      type: "list",
      name: "protocol",
      message: "Port protocol:",
      choices: ["TCP", "UDP", "SCTP"],
      default: "TCP"
    },
    {
      type: "input",
      name: "port",
      message: "Service port number (this value will be used for the 'port' and 'targetPort' fields of the service template and for the 'containerPort' field of the component template",
      default: 80,
      validate: async (input) => {
        if (!isNaN(input) && input >= 0 && input <= 65535) return true
        else return "The port number must be a valid number (between 0 and 65353)"
      }
    }
  ],
  jobQuestions: [
    {
      type: "input",
      name: "name",
      message: "Job name:",
      filter: async (input) => input.toLowerCase().replace(/\s|_|["']|\.|\//g, "")
    },
    {
      type: "input",
      name: "imageRepo",
      message: "Job image repository:",
      validate: async (input) => {
        if (input) return true
        else return "The image repository cannot be empty"
      }
    },
    {
      type: "input",
      name: "imageTag",
      message: "Job image tag:",
      filter: async (input) => (input.replace(/\s/g, "") === "\"\"") ? "" : input
    },
    {
      type: "list",
      name: "hasEnvVars",
      message: "Does this Job use environment variables?",
      choices: ["yes", "no"],
      default: "yes",
      filter: async (input) => input === "yes"
    }
  ],
  cronJobQuestions: [
    {
      type: "input",
      name: "name",
      message: "CronJob name:",
      filter: async (input) => input.toLowerCase().replace(/\s|_|["']|\.|\//g, "")
    },
    {
      type: "input",
      name: "imageRepo",
      message: "CronJob image repository:",
      validate: async (input) => {
        if (input) return true
        else return "The image repository cannot be empty"
      }
    },
    {
      type: "input",
      name: "imageTag",
      message: "CronJob image tag:",
      filter: async (input) => (input.replace(/\s/g, "") === "\"\"") ? "" : input.replace(/\s/g, "")
    },
    {
      type: "list",
      name: "hasEnvVars",
      message: "Does this CronJob use environment variables?",
      choices: ["yes", "no"],
      default: "yes",
      filter: async (input) => input === "yes"
    },
    {
      type: "input",
      name: "schedule",
      message: "CronJob schedule config:",
      default: "* * * * *",
    }
  ],
  dependencyQuestions: [
    {
      type: "input",
      name: "name",
      message: "Dependency name:",
      validate: async (input) => {
        if (input && input.replace(/\s|-|_|["']|\.|\//g, "").length >= 1) return true
        else return "The name of the dependency cannot be empty"
      },
      filter: async (input) => input.toLowerCase().replace(/\s|_|["']|\.|\//g, "")
    },
    {
      type: "input",
      name: "version",
      message: "Dependency version:",
      validate: async (input) => {
        let semVerPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)|x\.(0|[1-9]\d*)|x(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
        if (input && semVerPattern.test(input)) return true
        else return "The version of the dependency must follow the Semantic Versioning Specification"
      }
    },
    {
      type: "input",
      name: "repository",
      message: "Dependency repository:",
      validate: async (input) => {
        if (input) return true
        else return "The repository of the dependency cannot be empty"
      }
    }
  ]
}
