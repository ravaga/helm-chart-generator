const { componentQuestions, servicePortsQuestions, dependencyQuestions, jobQuestions, cronJobQuestions } = require('./questions')
const inquirer = require("inquirer")

const { appendFile, mkdir, readFile, writeFile } = require("fs/promises")
const Handlebars = require("handlebars")

const createComponents = async(components, CHART_OUTPUT_DIR) => {
  for (let i = 1; i <= components; i++) {
    const isMain = i === 1
    if(isMain) console.log("\nMain component")
    else console.log("\nComponent " + i)
    console.log("--------------------")

    // create component folder in templates folder
    const compAnswers = await inquirer.prompt(componentQuestions)
    let compName = (compAnswers.name != "") ? adaptName(compAnswers.name) : "component" + i
    await mkdir(CHART_OUTPUT_DIR + "/templates/" + compName)

    // create contents of component templates folder: component controller (e.g. deployment.yaml) and services
    await createComponentAndServices(compName, isMain, compAnswers, CHART_OUTPUT_DIR)

    // append component configs to values and helpers files
    let templateData = { component: compName, open: "{{", close: "}}"}
    if(isMain) templateData.isMainInterface = "yes"
    else templateData.isMainInterface = "no"
    templateData.statefulset = (compAnswers.type === "statefulset")
    let compHelperTempl = await readFile(__dirname + "/templates/global/component-helper.tpl")
    await appendFile(CHART_OUTPUT_DIR + "/templates/_helpers.tpl", Handlebars.compile(compHelperTempl.toString())(templateData))
  }
}

const createComponentAndServices = async(compName, isMain, compAnswers, CHART_OUTPUT_DIR) => {
  const hasService = compAnswers.hasService
  let templateData = { component: compName, imageRepo: compAnswers.imageRepo, imageTag: compAnswers.imageTag, hasEnvVars: compAnswers.hasEnvVars, serviceType: compAnswers.serviceType, open: "{{", close: "}}"}
  
  let svcValuesTemplates = []
  let containerPortsTemplates = []
  let svcPortsTemplates = []
  let nonRegularSvcPortsTemplates = []
  let mainPortName = ""

  for (let j = 1; j <= compAnswers.ports; j++) {
    console.log("\nService port " + j)
    console.log("................")
    const portAnswers = await inquirer.prompt(servicePortsQuestions)
    portAnswers.name = (portAnswers.name != "") ? adaptName(portAnswers.name) : "port" + j
    if (j === 1) mainPortName = portAnswers.name

    // create sevice ports configs that will be added to the service file
    let svcPortsTemplate = await readFile(__dirname + "/templates/component/service-port.yaml")
    let svcPortsTempData = { regularSvc: true, name: portAnswers.name, component: compName, open: "{{", close: "}}" }
    svcPortsTemplates.push(Handlebars.compile(svcPortsTemplate.toString())(svcPortsTempData))

    // create sevice ports configs that will be added to the non-regular services files (headless, ...)
    svcPortsTempData.regularSvc = false
    nonRegularSvcPortsTemplates.push(Handlebars.compile(svcPortsTemplate.toString())(svcPortsTempData))

    // create component services configs that will be appended to values.yaml
    let valuesSvcTemp = await readFile(__dirname + "/templates/global/component-values-service.yaml")
    svcValuesTemplates.push(Handlebars.compile(valuesSvcTemp.toString())(portAnswers))

    // create container ports configs that will be added to the component controller file
    let portsTemplate = await readFile(__dirname + "/templates/component/container-ports.yaml")
    containerPortsTemplates.push(Handlebars.compile(portsTemplate.toString())(svcPortsTempData))
  }

  // create service file in component folder
  let svcTempData = {}
  if(hasService){
    svcTempData = { component: compName, isMain: isMain, svcPort: svcPortsTemplates, open: "{{", close: "}}" }
    let svChartTemplate = await readFile(__dirname + "/templates/component/service.yaml")
    let svChartTemplateCompiled = Handlebars.compile(svChartTemplate.toString())(svcTempData)
    writeFile(CHART_OUTPUT_DIR + "/templates/" + templateData.component + "/service.yaml", svChartTemplateCompiled)
  }

  // daemonset
  const isDaemonset = compAnswers.type === "daemonset"
  if (isDaemonset) {
    templateData.dnsPolicy = compAnswers.dnsPolicy
    templateData.hostNetwork = compAnswers.hostNetwork
  }

  // create component controller (e.g. deployment.yaml) file in component folder
  templateData.containerPorts = containerPortsTemplates
  let chartTemplate = await readFile(__dirname + "/templates/component/"+ compAnswers.type + ".yaml")
  writeFile(CHART_OUTPUT_DIR + "/templates/" + templateData.component + "/" + compAnswers.type + ".yaml", Handlebars.compile(chartTemplate.toString())(templateData))

  // create headless service for statefulset
  const isStatefulset = compAnswers.type === "statefulset"
  if (isStatefulset && hasService) {
    let svcHeadlessTempl = await readFile(__dirname + "/templates/component/service-headless.yaml")
    svcTempData.svcPort = nonRegularSvcPortsTemplates
    writeFile(CHART_OUTPUT_DIR + "/templates/" + templateData.component + "/service-headless.yaml", Handlebars.compile(svcHeadlessTempl.toString())(svcTempData))
  }

  if (isMain) {
    // generate NOTES.txt in templates folder
    const notesTemplData = { mainComp: compName, mainPortName: mainPortName, hasService: hasService, open: "{{", close: "}}"}
    let notesTempl = await readFile(__dirname + "/templates/global/NOTES.txt")
    writeFile(CHART_OUTPUT_DIR + "/templates/NOTES.txt", Handlebars.compile(notesTempl.toString())(notesTemplData))
  }

  // add services to the values template and generate values.yaml
  templateData.hasService = hasService
  templateData.svcValues = svcValuesTemplates
  templateData.statefulset = isStatefulset
  templateData.tier = (isMain) ? "external" : "internal"
  let compValuesTempl = await readFile(__dirname + "/templates/global/component-values.yaml")
  await appendFile(CHART_OUTPUT_DIR + "/values.yaml", Handlebars.compile(compValuesTempl.toString())(templateData))
}

// create chart jobs
const createJobs = async(jobs, CHART_OUTPUT_DIR) => {
  for (let i = 1; i <= jobs; i++) {
    console.log("\nJob " + i)
    console.log("--------------------")
    const jobAnswers = await inquirer.prompt(jobQuestions)
    let jobName = (jobAnswers.name != "") ? adaptName(jobAnswers.name) : "job" + i

    // create job.yaml
    let templateData = { job: jobName, imageRepo: jobAnswers.imageRepo, imageTag: jobAnswers.imageTag, hasEnvVars: jobAnswers.hasEnvVars, open: "{{", close: "}}" }
    let chartTemplate = await readFile(__dirname + "/templates/component/job.yaml")
    writeFile(CHART_OUTPUT_DIR + "/templates/jobs/" + jobName + ".yaml", Handlebars.compile(chartTemplate.toString())(templateData))

    // append to values.yaml
    templateData.cronjob = false
    let compValuesTempl = await readFile(__dirname + "/templates/global/job-values.yaml")
    await appendFile(CHART_OUTPUT_DIR + "/values.yaml", Handlebars.compile(compValuesTempl.toString())(templateData))

    // append to helpers.tlp
    templateData.jobType = "job"
    let compHelperTempl = await readFile(__dirname + "/templates/global/job-helper.tpl")
    await appendFile(CHART_OUTPUT_DIR + "/templates/_helpers.tpl", Handlebars.compile(compHelperTempl.toString())(templateData))
  }
}

// create chart cronjobs
const createCronJobs = async(jobs, CHART_OUTPUT_DIR) => {
  for (let i = 1; i <= jobs; i++) {
    console.log("\nCronJob " + i)
    console.log("--------------------")
    const cronJobAnswers = await inquirer.prompt(cronJobQuestions)
    let jobName = (cronJobAnswers.name != "") ? adaptName(cronJobAnswers.name) : "cronjob" + i

    // create job.yaml
    let templateData = { job: jobName, imageRepo: cronJobAnswers.imageRepo, imageTag: cronJobAnswers.imageTag, hasEnvVars: cronJobAnswers.hasEnvVars, schedule: cronJobAnswers.schedule, open: "{{", close: "}}"}
    let chartTemplate = await readFile(__dirname + "/templates/component/cronjob.yaml")
    writeFile(CHART_OUTPUT_DIR + "/templates/jobs/" + jobName + ".yaml", Handlebars.compile(chartTemplate.toString())(templateData))

    // append to values.yaml
    templateData.cronjob = true
    let compValuesTempl = await readFile(__dirname + "/templates/global/job-values.yaml")
    await appendFile(CHART_OUTPUT_DIR + "/values.yaml", Handlebars.compile(compValuesTempl.toString())(templateData))

    // append to helpers.tlp
    templateData.jobType = "cronjob"
    let compHelperTempl = await readFile(__dirname + "/templates/global/job-helper.tpl")
    await appendFile(CHART_OUTPUT_DIR + "/templates/_helpers.tpl", Handlebars.compile(compHelperTempl.toString())(templateData))
  }
}

// create chart dependencies
const createDependencies = async(dependencies, CHART_OUTPUT_DIR) => {
  if (dependencies > 0) {
    console.log("\nChart dependencies")
    console.log("=====================")
  }

  let dependenciesTemplates = []
  for (let i = 1; i <= dependencies; i++) {
    console.log("\nDependency " + i)
    console.log("--------------------")

    // dependency questions
    let depAnswers = await inquirer.prompt(dependencyQuestions)
    depAnswers.open = "{{"
    depAnswers.close = "}}"

    // create dependency that will be added to Chart.yaml
    let dependencyTemplate = await readFile(__dirname + "/templates/global/dependency.yaml")
    dependenciesTemplates.push( Handlebars.compile(dependencyTemplate.toString())(depAnswers))

    // create dependency values that will be added to values.yaml
    let dependencyValuesTemplate = await readFile(__dirname + "/templates/global/dependency-values.yaml")
    await appendFile(CHART_OUTPUT_DIR + "/values.yaml", Handlebars.compile(dependencyValuesTemplate.toString())(depAnswers))
  }

  return dependenciesTemplates
}

// create Chart.yaml file
const createChartYaml = async(generalInfo, CHART_OUTPUT_DIR) => {
  generalInfo.hasDependencies = generalInfo.dependencies > 0
  generalInfo.dependencies = await createDependencies(generalInfo.dependencies, CHART_OUTPUT_DIR)
  let chartTemplate = await readFile(__dirname + "/templates/global/Chart.yaml")
  let chartTemplateCompiled = Handlebars.compile(chartTemplate.toString())(generalInfo)
  writeFile(CHART_OUTPUT_DIR + "/Chart.yaml", chartTemplateCompiled)
}

function adaptName (name) {
  return name.toLowerCase().replace(/\s|-|_|\.|\//g, "")
}

module.exports = {
  createChartYaml,
  createComponents,
  createJobs,
  createCronJobs
}